"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { supabase } from "@/lib/supabase";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useIsHydrated();
  const darkMode = useStore((s) => s.settings.darkMode);
  const compactView = useStore((s) => s.settings.compactView);
  const fetchInitialData = useStore((s) => s.fetchInitialData);
  const loadUserProfile = useStore((s) => s.loadUserProfile);
  const settings = useStore((s) => s.settings);
  const isLoading = useStore((s) => s.isLoading);
  const fetched = useRef(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Apply theme class to <html> based on persisted setting
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("light", !darkMode);
  }, [darkMode, hydrated]);

  // Auth session listener
  useEffect(() => {
    if (!hydrated) return;
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) handleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) handleSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };

    async function handleSession(session: any) {
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        useStore.setState({
          settings: {
            userId: "",
            firstName: "",
            lastName: "",
            email: "",
            role: "sales",
            timezone: "Africa/Nairobi (EAT)",
            darkMode: true,
            currency: "KES",
            compactView: false,
            status: "awaiting_approval",
            avatarUrl: "",
            revenueTarget: 0,
          }
        });
      }
      if (mounted) setAuthChecking(false);
    }
  }, [hydrated, loadUserProfile]);

  // Auth route guard
  useEffect(() => {
    if (!hydrated || authChecking) return;

    const isAuthPage = ["/login", "/signup", "/reset-password", "/pending"].includes(pathname);
    const userId = settings.userId;
    const status = settings.status;

    if (userId) {
      if (status === "awaiting_approval") {
        if (pathname !== "/pending") {
          router.push("/pending");
        }
      } else if (status === "active") {
        if (isAuthPage) {
          router.push("/");
        }
      } else if (status === "rejected") {
        supabase.auth.signOut().then(() => {
          router.push("/login");
        });
      }
    } else {
      if (!isAuthPage) {
        router.push("/login");
      }
    }
  }, [hydrated, authChecking, pathname, settings.userId, settings.status, router]);

  useEffect(() => {
    const isAuthPage = ["/login", "/signup", "/reset-password", "/pending"].includes(pathname);
    if (!isAuthPage && !fetched.current && settings.userId && settings.status === "active") {
      fetched.current = true;
      fetchInitialData();
    }

    if (!isAuthPage && settings.userId && settings.status === "active") {
      // Subscribe to any change in the public schema to trigger an instant background refresh
      const channel = supabase
        .channel("schema-db-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public" },
          () => {
            // Re-fetch data silently in the background
            fetchInitialData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [pathname, fetchInitialData, settings.userId, settings.status]);

  // Auth pages render without the shell
  const isAuthPage = ["/login", "/signup", "/reset-password", "/pending"].includes(pathname);
  if (authChecking) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="text-white">Verifying credentials...</div>
      </div>
    );
  }
  if (isAuthPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className={`flex-1 ${compactView ? "p-4" : "p-6"} relative`}>
          {isLoading && (
            <div className="absolute inset-0 bg-ink-950/50 flex items-center justify-center z-50">
              <div className="text-white">Loading data from Supabase...</div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
