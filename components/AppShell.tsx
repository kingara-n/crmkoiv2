"use client";

import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { supabase } from "@/lib/supabase";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hydrated = useIsHydrated();
  const darkMode = useStore((s) => s.settings.darkMode);
  const compactView = useStore((s) => s.settings.compactView);
  const fetchInitialData = useStore((s) => s.fetchInitialData);
  const isLoading = useStore((s) => s.isLoading);
  const fetched = useRef(false);

  // Apply theme class to <html> based on persisted setting
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("light", !darkMode);
  }, [darkMode, hydrated]);

  useEffect(() => {
    const isAuthPage = ["/login", "/signup", "/reset-password", "/pending"].includes(pathname);
    if (!isAuthPage && !fetched.current) {
      fetched.current = true;
      fetchInitialData();
    }

    if (!isAuthPage) {
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
  }, [pathname, fetchInitialData]);

  // Auth pages render without the shell
  const isAuthPage = ["/login", "/signup", "/reset-password", "/pending"].includes(pathname);
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
