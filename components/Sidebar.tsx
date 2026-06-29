"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, GitBranch, Handshake, Users, Building2,
  Plane, BarChart3, Settings as SettingsIcon, ChevronLeft,
  FileText, Car, Receipt, FolderOpen, CheckCircle2
} from "lucide-react";
import { useStore, useSettings } from "@/lib/store";

const NAV_SECTIONS = [
  {
    title: "Workspace",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/tasks", label: "Tasks", icon: CheckCircle2 },
    ]
  },
  {
    title: "Business Development",
    items: [
      { href: "/pipeline", label: "Pipeline", icon: GitBranch },
      { href: "/clients", label: "Clients", icon: Users },
    ]
  },
  {
    title: "Reservations",
    items: [
      { href: "/bookings", label: "Bookings", icon: Handshake },
    ]
  },
  {
    title: "Operations",
    items: [
      { href: "/trips", label: "Trips", icon: Plane },
      { href: "/transfers", label: "Transfers", icon: Car },
      { href: "/suppliers", label: "Suppliers", icon: Building2 },
      { href: "/documents", label: "Document Vault", icon: FolderOpen },
    ]
  },
  {
    title: "Accounts",
    items: [
      { href: "/invoices", label: "Accounts", icon: Receipt },
    ]
  },
  {
    title: "Management",
    items: [
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/staff-activity", label: "Performance", icon: Users },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useStore((s) => s.sidebarCollapsed);
  const toggle = useStore((s) => s.toggleSidebar);
  const settings = useSettings();

  return (
    <aside
      className={`relative shrink-0 border-r border-ink-700/70 bg-ink-950 transition-[width] duration-200 ${
        collapsed ? "w-[72px]" : "w-60"
      } flex flex-col`}
    >
      {/* Brand */}
      <div className="px-2 py-4 flex items-center justify-center border-b border-ink-700/50">
        <div className="shrink-0 flex items-center justify-center" style={{ width: collapsed ? 44 : 160, height: collapsed ? 44 : 64 }}>
          <Image
            src="/koi-logo.png"
            alt="Koi CRM"
            width={collapsed ? 44 : 160}
            height={collapsed ? 44 : 64}
            className={`object-contain transition-all duration-200 ${collapsed ? "w-11 h-11" : "w-40 h-16"}`}
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-6 pt-2 space-y-6">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest px-3 mb-2">
                {section.title}
              </h3>
            )}
            {collapsed && idx > 0 && <div className="h-px bg-ink-700/50 mx-3 my-2" />}
            {section.items.map(({ href, label, icon: Icon, requireAdmin }) => {
              // Hide admin-only links from non-admins
              if (requireAdmin && settings?.role !== "management") return null;

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
          </div>
        ))}
      </nav>

      {/* Settings (Independent) */}
      <div className="px-3 pb-3 mt-auto">
        <Link
          href="/settings"
          className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
            pathname.startsWith("/settings")
              ? "bg-ink-900 text-white"
              : "text-neutral-400 hover:bg-ink-900 hover:text-white"
          }`}
          title={collapsed ? "Settings" : undefined}
        >
          {pathname.startsWith("/settings") && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-accent-500" />
          )}
          <SettingsIcon className={`h-[18px] w-[18px] shrink-0 ${pathname.startsWith("/settings") ? "text-accent-500" : ""}`} />
          {!collapsed && <span className="truncate">Settings</span>}
        </Link>
      </div>

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
