"use client";

import Link from "next/link";
import {
  DollarSign, TrendingUp, Target, Users, Trophy, CheckCircle2, Clock, XCircle,
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

// Twelve months of demo revenue (KES). Calibrated to roughly match
// the screenshot's curve (slow climb, slight dip in spring, sharp rise H2).
const REVENUE_TREND = [
  { month: "Jan", revenue: 1_800_000, target: 1_800_000 },
  { month: "Feb", revenue: 1_900_000, target: 1_950_000 },
  { month: "Mar", revenue: 2_400_000, target: 2_100_000 },
  { month: "Apr", revenue: 2_200_000, target: 2_250_000 },
  { month: "May", revenue: 2_300_000, target: 2_400_000 },
  { month: "Jun", revenue: 2_900_000, target: 2_550_000 },
  { month: "Jul", revenue: 3_300_000, target: 2_700_000 },
  { month: "Aug", revenue: 3_700_000, target: 2_850_000 },
  { month: "Sep", revenue: 4_000_000, target: 3_000_000 },
  { month: "Oct", revenue: 4_300_000, target: 3_150_000 },
  { month: "Nov", revenue: 4_600_000, target: 3_300_000 },
  { month: "Dec", revenue: 4_900_000, target: 3_450_000 },
];

export default function OverviewPage() {
  const hydrated = useIsHydrated();
  const leads = useStore((s) => s.leads);
  const bookings = useStore((s) => s.bookings);
  const team = useStore((s) => s.team);
  const currency = useStore((s) => s.settings.currency);

  // Live pipeline totals — recompute from current leads
  const pipelineByStage: Record<Stage, { count: number; value: number }> = {
    new_enquiry: { count: 0, value: 0 },
    quoted: { count: 0, value: 0 },
    in_discussion: { count: 0, value: 0 },
    confirmed: { count: 0, value: 0 },
    paid: { count: 0, value: 0 },
  };
  leads.forEach((l) => {
    pipelineByStage[l.stage].count++;
    pipelineByStage[l.stage].value += l.value;
  });

  const totalPipelineValue = leads.reduce((sum, l) => sum + l.value, 0);
  const totalLeads = leads.length;
  const wonRevenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.value, 0);
  const activeBookings = bookings.filter((b) => b.status !== "lost").length;
  const conversionRate = leads.length > 0
    ? Math.round((pipelineByStage.paid.count / leads.length) * 100 * 10) / 10
    : 0;

  const recentBookings = [...bookings]
    .sort((a, b) => b.closeDate.localeCompare(a.closeDate))
    .slice(0, 4);

  const topPerformers = [...team]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);

  if (!hydrated) {
    return <div className="text-neutral-500 p-2">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stat cards row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatMoney(wonRevenue, currency)}
          delta={{ value: "+12.5%", positive: true }}
          icon={<DollarSign className="h-4 w-4" />}
        />
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
          <RevenueTrendChart data={REVENUE_TREND} />
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

      {/* Recent bookings + top performers */}
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
                <div className="text-sm font-semibold text-white">{formatMoney(b.value, currency)}</div>
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

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Top Performers</h2>
              <p className="text-xs text-neutral-500">This month's leaders</p>
            </div>
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <div className="space-y-3">
            {topPerformers.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3">
                <Avatar initials={m.initials} size="md" crown rank={i + 1} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{m.name}</p>
                  <p className="text-xs text-neutral-500">{m.dealsClosed} deals closed</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{formatMoney(m.revenue, currency)}</p>
                  <p className={`text-xs ${m.trend >= 0 ? "text-accent-400" : "text-chart-red"}`}>
                    {m.trend >= 0 ? "↗" : "↘"} {m.trend >= 0 ? "+" : ""}{m.trend}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
