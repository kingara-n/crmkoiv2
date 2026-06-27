"use client";

import { useState, useMemo } from "react";
import {
  Search, Filter, Plus, MapPin, Mail, Phone, Calendar, ExternalLink, Star,
  TrendingUp, DollarSign, Building2,
} from "lucide-react";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import { ClientModal } from "@/components/modals/ClientModal";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { formatMoney, relativeTime } from "@/lib/format";
import { Client, Tier } from "@/lib/types";

const TIER_FILTERS: { value: Tier | "all"; label: string }[] = [
  { value: "enterprise", label: "Enterprise" },
  { value: "growth", label: "Growth" },
  { value: "starter", label: "Starter" },
];

export default function ClientsPage() {
  const hydrated = useIsHydrated();
  const clients = useStore((s) => s.clients);
  const bookings = useStore((s) => s.bookings);
  const currency = useStore((s) => s.settings.currency);

  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<Tier | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const filtered = useMemo(() => {
    let rows = clients;
    if (tierFilter !== "all") rows = rows.filter((c) => c.tier === tierFilter);
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.industry ?? "").toLowerCase().includes(q) ||
          (c.city ?? "").toLowerCase().includes(q),
      );
    }
    return rows;
  }, [clients, tierFilter, query]);

  const totalRevenue = clients.reduce((sum, c) => sum + c.revenue, 0);
  const avgHealth = clients.length
    ? Math.round(clients.reduce((s, c) => s + c.healthScore, 0) / clients.length)
    : 0;
  const activeDeals = bookings.filter((b) => b.status !== "lost").length;

  function tierBadge(t: Tier) {
    const tone = t === "enterprise" ? "success" : t === "growth" ? "info" : "neutral";
    return <Badge tone={tone}>{t.charAt(0).toUpperCase() + t.slice(1)}</Badge>;
  }

  if (!hydrated) return <div className="text-neutral-500 p-2">Loading…</div>;

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Clients" value={String(clients.length)}
          icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Total Revenue" value={formatMoney(totalRevenue, currency)}
          icon={<DollarSign className="h-4 w-4 text-accent-500" />} />
        <StatCard label="Avg Health Score" value={`${avgHealth}%`}
          icon={<Star className="h-4 w-4 text-amber-400" />} />
        <StatCard label="Active Bookings" value={String(activeDeals)}
          icon={<TrendingUp className="h-4 w-4 text-sky-400" />} />
      </div>

      {/* Search + filters + add */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="search"
            placeholder="Search clients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-900 pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent-500/60"
          />
        </div>
        <button className="rounded-lg border border-ink-700 bg-ink-900 p-2 text-neutral-400 hover:bg-ink-850">
          <Filter className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTierFilter("all")}
          className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
            tierFilter === "all"
              ? "bg-accent-500 text-black font-medium"
              : "border border-ink-700 bg-ink-900 text-neutral-300 hover:bg-ink-850"
          }`}
        >
          All
        </button>
        {TIER_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setTierFilter(f.value as Tier)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              tierFilter === f.value
                ? "border-accent-500 bg-accent-500/10 text-accent-400"
                : "border-ink-700 bg-ink-900 text-neutral-300 hover:bg-ink-850"
            }`}
          >
            {f.label}
          </button>
        ))}
        <Button icon={<Plus className="h-4 w-4" />} className="ml-auto" onClick={() => { setEditing(null); setModalOpen(true); }}>
          Add Client
        </Button>
      </div>

      {/* Client cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.length === 0 && (
          <div className="col-span-2 rounded-card border border-dashed border-ink-700 py-16 text-center text-neutral-500">
            No clients match your filters.
          </div>
        )}
        {filtered.map((c) => (
          <Card key={c.id}>
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar initials={c.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()} />
                <div>
                  <p className="font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-neutral-500">{c.industry ?? (c.type === "leisure" ? "Leisure traveller" : "—")}</p>
                </div>
              </div>
              {tierBadge(c.tier)}
            </div>

            {/* Two-column details */}
            <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="space-y-2 text-neutral-300">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-neutral-500" />
                  {c.city ? `${c.city}, ${c.country}` : c.country}
                </p>
                <p className="flex items-center gap-2 truncate">
                  <Mail className="h-4 w-4 text-neutral-500" />
                  <span className="truncate">{c.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-neutral-500" />
                  {c.phone}
                </p>
              </div>
              <div className="space-y-2 text-right text-neutral-300">
                <p>
                  <span className="text-neutral-500">Revenue</span>{" "}
                  <span className="font-semibold text-white">{formatMoney(c.revenue, currency)}</span>
                </p>
                <p>
                  <span className="text-neutral-500">Active Deals</span>{" "}
                  <span className="font-semibold text-white">{c.activeDeals}</span>
                </p>
                <p>
                  <span className="text-neutral-500">Last Contact</span>{" "}
                  <span className="text-white">{relativeTime(c.lastContact + "T12:00:00Z")}</span>
                </p>
              </div>
            </div>

            {/* Health */}
            <div className="mb-4 border-t border-ink-700 pt-4">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-neutral-400">
                  Health Score <TrendingUp className="h-3 w-3 text-accent-400" />
                </span>
                <span className="font-semibold text-accent-400">{c.healthScore}%</span>
              </div>
              <ProgressBar value={c.healthScore} tone={c.healthScore >= 70 ? "accent" : c.healthScore >= 50 ? "amber" : "red"} />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => alert(`Scheduled a call with ${c.name} — this would open the calendar in v2.`)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-neutral-300 hover:bg-ink-800"
              >
                <Calendar className="h-4 w-4" /> Schedule
              </button>
              <a
                href={`mailto:${c.email}`}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-neutral-300 hover:bg-ink-800"
              >
                <Mail className="h-4 w-4" /> Email
              </a>
              <button
                onClick={() => { setEditing(c); setModalOpen(true); }}
                className="rounded-lg border border-ink-700 bg-ink-850 p-2 text-neutral-300 hover:bg-ink-800"
                aria-label="Open client profile"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <ClientModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />
    </div>
  );
}
