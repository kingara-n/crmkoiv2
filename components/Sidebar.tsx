"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, GitBranch, Handshake, Users, Building2,
  Plane, BarChart3, Settings as SettingsIcon, ChevronLeft, DollarSign,
  FileText, Car, Receipt, FolderOpen, CheckCircle2
} from "lucide-react";
import { useStore, useSettings } from "@/lib/store";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckCircle2 },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/bookings", label: "Bookings", icon: Handshake },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/trips", label: "Trips", icon: Plane },
  { href: "/transfers", label: "Transfers", icon: Car },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/documents", label: "Documents", icon: FolderOpen },
  { href: "/suppliers", label: "Purchasing", icon: Building2 },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useStore((s) => s.sidebarCollapsed);
  const toggle = useStore((s) => s.toggleSidebar);
  const settings = useSettings();

  const activeNav = [...NAV];
  activeNav.push({ href: "/staff-activity", label: "Performance", icon: Users });
  activeNav.push({ href: "/etims-test", label: "eTIMS Sandbox", icon: FileText });

  return (
    <aside
      className={`relative shrink-0 border-r border-ink-700/70 bg-ink-950 transition-[width] duration-200 ${
        collapsed ? "w-[72px]" : "w-60"
      } flex flex-col`}
    >
      {/* Brand */}
      <div className="px-4 py-5 flex items-center gap-3">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-white flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-black" />
        </div>
        {!collapsed && (
          <span className="text-white font-semibold">Koi Travel</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {activeNav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-ink-900 text-white"
                  : "text-neutral-400 hover:bg-ink-900 hover:text-white"
              }`}
              title={collapsed ? label : undefined}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-accent-500" />
              )}
              <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-accent-500" : ""}`} />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="m-3 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-400 hover:bg-ink-900 hover:text-white transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}
