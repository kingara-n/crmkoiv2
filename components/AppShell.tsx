"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hydrated = useIsHydrated();
  const darkMode = useStore((s) => s.settings.darkMode);
  const compactView = useStore((s) => s.settings.compactView);

  // Apply theme class to <html> based on persisted setting
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("light", !darkMode);
  }, [darkMode, hydrated]);

  // Login page renders without the shell
  if (pathname === "/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className={`flex-1 ${compactView ? "p-4" : "p-6"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
