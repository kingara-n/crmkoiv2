"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Calendar, Search, LogOut, Settings as SettingsIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { Avatar } from "./ui/Avatar";
import { relativeTime } from "@/lib/format";

const TITLES: Record<string, string> = {
  "/": "Overview",
  "/pipeline": "Pipeline",
  "/bookings": "Bookings",
  "/clients": "Clients",
  "/suppliers": "Suppliers",
  "/trips": "Trips",
  "/reports": "Reports",
  "/settings": "Settings",
};

const DATE_RANGES = ["Last 7 days", "Last 30 days", "Last 90 days", "Year to date"];

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const title = TITLES[pathname] ?? "Koi Travel";

  const hydrated = useIsHydrated();
  const settings = useStore((s) => s.settings);
  const notifications = useStore((s) => s.notifications);
  const markRead = useStore((s) => s.markNotificationRead);
  const markAllRead = useStore((s) => s.markAllNotificationsRead);

  const [dateRange, setDateRange] = useState("Last 30 days");
  const [dateOpen, setDateOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const dateRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setDateOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unreadCount = hydrated ? notifications.filter((n) => !n.read).length : 0;
  const initials =
    hydrated && settings
      ? `${settings.firstName[0] ?? ""}${settings.lastName[0] ?? ""}`.toUpperCase() || "JD"
      : "JD";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-700/70 bg-ink-950/80 backdrop-blur-md px-6 py-4">
      {/* Left: page title */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-white">
          {pathname === "/" ? `Welcome back, ${settings.firstName || "Admin"}` : title}
        </h1>
      </div>

      {/* Right: search + notifications + avatar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="search"
            placeholder="Search..."
            className="w-64 rounded-lg border border-ink-700 bg-ink-900 pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent-500/60"
          />
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative rounded-lg border border-ink-700 bg-ink-900 p-2 text-neutral-300 hover:bg-ink-850"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent-500" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-card border border-ink-700 bg-ink-900 shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-ink-700 px-4 py-3">
                <p className="text-sm font-semibold text-white">Notifications</p>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-accent-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="px-4 py-6 text-sm text-neutral-500 text-center">All caught up.</p>
                )}
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-ink-800 transition-colors border-b border-ink-700 last:border-0 ${
                      !n.read ? "bg-ink-850/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />}
                      <div className="flex-1">
                        <p className="text-sm text-neutral-200">{n.message}</p>
                        <p className="mt-1 text-xs text-neutral-500">{relativeTime(n.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg ring-1 ring-ink-700 hover:ring-ink-600 transition-all"
            aria-label="User menu"
          >
            <Avatar initials={initials} size="md" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-card border border-ink-700 bg-ink-900 shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-ink-700">
                <p className="text-sm font-medium text-white">
                  {hydrated ? `${settings.firstName} ${settings.lastName}` : "John Doe"}
                </p>
                <p className="text-xs text-neutral-500">
                  {hydrated ? settings.email : "—"}
                </p>
              </div>
              <button
                onClick={() => { setMenuOpen(false); router.push("/settings"); }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-neutral-300 hover:bg-ink-800"
              >
                <SettingsIcon className="h-4 w-4" />
                Settings
              </button>
              <button
                onClick={() => { setMenuOpen(false); router.push("/login"); }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-neutral-300 hover:bg-ink-800"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
