"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Calendar, Search, LogOut, Settings as SettingsIcon, Sun, Moon } from "lucide-react";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { Avatar } from "./ui/Avatar";
import { relativeTime } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";

const TITLES: Record<string, string> = {
  "/": "Overview",
  "/pipeline": "Pipeline",
  "/bookings": "Bookings",
  "/clients": "Clients",
  "/suppliers": "Suppliers",
  "/staff-activity": "Performance",
  "/invoices": "Financials",
  "/trips": "Trips",
  "/reports": "Reports",
  "/documents": "Document Vault",
  "/settings": "Settings",
};

const DATE_RANGES = ["Last 7 days", "Last 30 days", "Last 90 days", "Year to date"];

const playChime = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
};

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const title = TITLES[pathname] ?? "Koi Travel";

  const hydrated = useIsHydrated();
  const settings = useStore((s) => s.settings);
  const notifications = useStore((s) => s.notifications);
  const markRead = useStore((s) => s.markNotificationRead);
  const markAllRead = useStore((s) => s.markAllNotificationsRead);
  const updateSettings = useStore((s) => s.updateSettings);
  const clients = useStore((s) => s.clients);
  const leads = useStore((s) => s.leads);
  const bookings = useStore((s) => s.bookings);
  const tasks = useStore((s) => s.tasks);

  const [dateRange, setDateRange] = useState("Last 30 days");
  const [dateOpen, setDateOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<"all" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const dateRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { type: string; id: string; label: string; link: string }[] = [];
    
    clients.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, 3).forEach(c => results.push({ type: 'Client', id: c.id, label: c.name, link: `/clients/${c.id}` }));
    leads.filter(l => l.title.toLowerCase().includes(q)).slice(0, 3).forEach(l => results.push({ type: 'Lead', id: l.id, label: l.title, link: '/pipeline' }));
    bookings.filter(b => b.destination.toLowerCase().includes(q) || b.clientName.toLowerCase().includes(q)).slice(0, 3).forEach(b => results.push({ type: 'Booking', id: b.id, label: `${b.clientName} - ${b.destination}`, link: '/bookings' }));
    tasks.filter(t => t.title.toLowerCase().includes(q)).slice(0, 3).forEach(t => results.push({ type: 'Task', id: t.id, label: t.title, link: '/tasks' }));

    return results;
  }, [searchQuery, clients, leads, bookings, tasks]);

  const displayedNotifs = notifTab === "unread" ? notifications.filter(n => !n.read) : notifications;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setDateOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
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
        <div className="flex items-center gap-2 px-2">
          <Sun className="h-4 w-4 text-neutral-400" />
          <button
            role="switch"
            aria-checked={settings?.darkMode !== false}
            onClick={() => updateSettings({ darkMode: !settings?.darkMode })}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              settings?.darkMode !== false ? 'bg-accent-500' : 'bg-ink-700'
            }`}
            aria-label="Toggle Dark Mode"
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                settings?.darkMode !== false ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
          <Moon className="h-4 w-4 text-neutral-400" />
        </div>
        <div ref={searchRef} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="search"
            placeholder="Search clients, leads, bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            className="w-64 rounded-lg border border-ink-700 bg-ink-900 pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent-500/60"
          />
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full rounded-lg border border-ink-700 bg-ink-900 shadow-xl overflow-hidden z-50">
              <div className="max-h-64 overflow-y-auto">
                {searchResults.map((res) => (
                  <button
                    key={`${res.type}-${res.id}`}
                    className="w-full text-left px-4 py-2 hover:bg-ink-800 transition-colors border-b border-ink-700/50 last:border-b-0 flex flex-col"
                    onClick={() => {
                      router.push(res.link);
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <span className="text-sm font-medium text-white truncate">{res.label}</span>
                    <span className="text-xs text-neutral-400">{res.type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => { if (!v) playChime(); return !v; })}
            className="relative rounded-lg border border-ink-700 bg-ink-900 p-2 text-neutral-300 hover:bg-ink-850 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent-500" />
            )}
          </button>
          <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-96 rounded-card border border-ink-700 bg-ink-900 shadow-xl z-50 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <p className="text-base font-semibold text-white">Notifications</p>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-accent-500 hover:text-accent-400 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              {/* Tabs */}
              <div className="flex items-center justify-between border-b border-ink-700 px-4 mt-2">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setNotifTab("all")}
                    className={`pb-2 text-sm font-medium border-b-2 transition-colors ${notifTab === "all" ? "border-accent-500 text-white" : "border-transparent text-neutral-400 hover:text-neutral-300"}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setNotifTab("unread")}
                    className={`pb-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1 ${notifTab === "unread" ? "border-accent-500 text-white" : "border-transparent text-neutral-400 hover:text-neutral-300"}`}
                  >
                    Unread <span className="text-xs text-neutral-500">({unreadCount})</span>
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {displayedNotifs.length === 0 && (
                  <div className="px-4 py-8 flex flex-col items-center justify-center">
                    <p className="text-sm text-neutral-500">All caught up.</p>
                  </div>
                )}
                {displayedNotifs.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className="w-full text-left px-4 py-3 hover:bg-ink-800 transition-colors border-b border-ink-700/50 last:border-0 relative group"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar initials={n.authorInitials || "??"} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-300 leading-snug">
                          <span className="font-semibold text-white mr-1">{n.authorName || "System"}</span>
                          {n.actionText}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {!n.read && <span className="h-2 w-2 rounded-full bg-accent-500" />}
                        <p className="text-[11px] text-neutral-500 whitespace-nowrap">{relativeTime(n.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
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
