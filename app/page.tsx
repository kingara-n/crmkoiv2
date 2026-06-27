"use client";

import { useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote, TrendingUp, Target, Users, Trophy, CheckCircle2, Clock, XCircle, Calendar,
  ArrowRight
} from "lucide-react";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import { RevenueTrendChart } from "@/components/charts/RevenueTrendChart";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { formatMoney, relativeTime } from "@/lib/format";
import { STAGE_LABELS, Stage } from "@/lib/types";

// Dynamic calculation happens inside the component based on store data.

export default function OverviewPage() {
  const router = useRouter();
  const hydrated = useIsHydrated();
  const leads = useStore((s) => s.leads);
  const bookings = useStore((s) => s.bookings);
  const team = useStore((s) => s.team);
  const clients = useStore((s) => s.clients);
  const invoices = useStore((s) => s.invoices);
  const currency = useStore((s) => s.settings.currency);
  const settings = useStore((s) => s.settings);

  useEffect(() => {
    if (hydrated) {
      const role = settings.role;
      if (role !== "Sales Manager" && role !== "Director" && role !== "management") {
        router.push("/tasks");
      }
    }
  }, [hydrated, settings.role, router]);

  const revenueTrend = useMemo(() => {
    const trend = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString("default", { month: "short" });
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      // Bookings confirmed within this month (using createdAt as a proxy for closeDate if missing)
      const target = settings.revenueTarget || bookings
        .filter((b) => b.status === "confirmed")
        .filter((b) => {
          const date = new Date(b.closeDate || "2000-01-01");
          return date >= d && date < nextMonth;
        })
        .reduce((sum, b) => sum + ((b as any).valueKes || b.value || 0), 0);

      // Invoices paid within this month
      const revenue = invoices
        .filter((inv) => !!inv.paidAt)
        .filter((inv) => {
          const date = new Date(inv.paidAt!);
          return date >= d && date < nextMonth;
        })
        .reduce((sum, inv) => sum + (inv.amountKes || 0), 0);

      trend.push({ month: monthName, revenue, target });
    }
    return trend;
  }, [bookings, invoices]);

  // Live pipeline totals — recompute from current leads
  const pipelineByStage: Record<Stage, { count: number; value: number }> = {
    new_lead: { count: 0, value: 0 },
    quoted: { count: 0, value: 0 },
    in_discussion: { count: 0, value: 0 },
    confirmed: { count: 0, value: 0 },
    paid: { count: 0, value: 0 },
  };
  leads.forEach((l) => {
    // legacy migration
    const stage = l.stage === "new_enquiry" as any ? "new_lead" : l.stage;
    if (pipelineByStage[stage]) {
      pipelineByStage[stage].count++;
      pipelineByStage[stage].value += (l as any).valueKes || l.value || 0;
    }
  });
  const totalRevenue = clients.reduce((sum, c) => sum + ((c as any).revenueKes || c.revenue || 0), 0);
  const totalPipelineValue = leads.reduce((sum, l) => sum + ((l as any).valueKes || l.value || 0), 0);
  const totalLeads = leads.length;

  // Multi-currency revenue calculation based on won bookings
  const revenueByCurrency: Record<string, number> = { KES: 0, USD: 0, EUR: 0, CAD: 0, GBP: 0 };
  bookings.filter(b => b.status === "confirmed").forEach(b => {
    const cur = b.currency || "KES";
    const amt = (b as any).valueKes || b.value || 0; // We use the nominal value since the DB value column may be in native currency in our updated schema
    // Wait, the DB has amount in native currency, but we named it valueKes in the past. If the value is native, we sum it into the currency bucket.
    // If we assume `b.value` is the native amount:
    if (revenueByCurrency[cur] !== undefined) {
      revenueByCurrency[cur] += b.value || 0;
    } else {
      revenueByCurrency[cur] = b.value || 0;
    }
  });

  const wonRevenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + ((b as any).valueKes || b.value || 0), 0);
  const activeBookings = bookings.filter((b) => b.status !== "lost").length;
  const conversionRate = leads.length > 0
    ? Math.round((pipelineByStage.paid.count / leads.length) * 100 * 10) / 10
    : 0;

  const recentBookings = [...bookings]
    .sort((a, b) => (b.closeDate || '').localeCompare(a.closeDate || ''))
    .slice(0, 4);

  const topPerformers = [...team]
    .sort((a, b) => ((b as any).revenueKes || b.revenue || 0) - ((a as any).revenueKes || a.revenue || 0))
    .slice(0, 3);

  if (!hydrated) {
    return <div className="text-neutral-500 p-2">Loading…</div>;
  }

  return (
    <div className="space-y-4">
      {/* Overview header & Date Picker just under the top line */}
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-xl font-semibold text-white">Overview</h2>
        <button className="flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-900 px-3 py-1.5 text-sm text-neutral-300 hover:bg-ink-850">
          <Calendar className="h-4 w-4" />
          Last 30 days
        </button>
      </div>

      {/* Stat cards row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Total Revenue</h3>
            <Banknote className="h-4 w-4 text-neutral-500" />
          </div>
          <div className="space-y-2 mt-3">
            {Object.entries(revenueByCurrency).filter(([_, v]) => v > 0).map(([cur, val]) => (
              <div key={cur} className="flex justify-between items-end">
                <span className="text-sm font-medium text-neutral-500 mb-1">{cur}</span>
                <span className="text-3xl font-semibold tracking-tight text-white">{formatMoney(val, cur as any)}</span>
              </div>
            ))}
            {Object.values(revenueByCurrency).every(v => v === 0) && (
              <div className="text-3xl font-semibold tracking-tight text-white">0</div>
            )}
          </div>
        </Card>
        <StatCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          delta={{ value: "+3.2%", positive: true }}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Active Bookings"
          value={String(activeBookings)}
          delta={{ value: "-5", positive: false }}
          icon={<Target className="h-4 w-4" />}
        />
        <StatCard
          label="New Leads"
          value={String(totalLeads)}
          delta={{ value: "+18.3%", positive: true }}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Revenue trend + pipeline stages */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Revenue Trend</h2>
              <p className="text-xs text-neutral-500">Monthly performance vs target</p>
            </div>
          </div>
          <RevenueTrendChart data={revenueTrend} />
        </Card>

        <Card>
          <div className="mb-5">
            <h2 className="text-base font-semibold text-white">Pipeline Stages</h2>
            <p className="text-xs text-neutral-500">Distribution by stage</p>
          </div>
          <div className="space-y-4">
            {(Object.keys(pipelineByStage) as Stage[]).map((stage, i) => {
              const { count, value } = pipelineByStage[stage];
              const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              const tone =
                i === 0 ? "blue"
                : i === 1 ? "accent"
                : i === 2 ? "amber"
                : i === 3 ? "accent"
                : "accent";
              return (
                <div key={stage}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-neutral-300">{STAGE_LABELS[stage]}</span>
                    <span className="text-neutral-400">
                      {count}{" "}
                      <span className="ml-1 font-semibold text-white">{pct}%</span>
                    </span>
                  </div>
                  <ProgressBar value={pct} tone={tone as any} />
                </div>
              );
            })}
            <div className="mt-2 flex items-center justify-between border-t border-ink-700 pt-4 text-sm">
              <span className="text-neutral-400">Total Pipeline Value</span>
              <span className="text-base font-semibold text-white">
                {formatMoney(totalPipelineValue, currency)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent bookings */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Recent Bookings</h2>
              <p className="text-xs text-neutral-500">Latest activity</p>
            </div>
            <Link href="/bookings" className="text-sm text-accent-400 hover:text-accent-300">
              View all ↗
            </Link>
          </div>
          <div className="space-y-2">
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-850/40 px-3 py-2.5">
                <Avatar initials={b.clientName.slice(0, 1).toUpperCase()} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">{b.clientName}</p>
                  <p className="text-xs text-neutral-500">{b.ownerName} · {relativeTime(b.closeDate + "T12:00:00Z")}</p>
                </div>
                <div className="font-semibold text-white">{formatMoney((b as any).valueKes || b.value || 0, (b as any).currency || currency)}</div>
                <Badge
                  tone={b.status === "confirmed" ? "success" : b.status === "lost" ? "danger" : "warning"}
                  icon={
                    b.status === "confirmed" ? <CheckCircle2 className="h-3 w-3" />
                      : b.status === "lost" ? <XCircle className="h-3 w-3" />
                      : <Clock className="h-3 w-3" />
                  }
                >
                  {b.status === "confirmed" ? "Won" : b.status === "lost" ? "Lost" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
