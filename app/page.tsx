"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote, TrendingUp, Target, Users, Trophy, CheckCircle2, Clock, XCircle, Calendar,
  ArrowRight, PlaneTakeoff, AlertCircle, Briefcase, Activity, CheckSquare, PieChart
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

  const [chartPeriod, setChartPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");

  const revenueTrend = useMemo(() => {
    const trend = [];
    const now = new Date();
    
    if (chartPeriod === "monthly") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleString("default", { month: "short" });
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        const target = settings.revenueTarget || 0;
        const revenue = invoices
          .filter((inv) => !!inv.paidAt)
          .filter((inv) => {
            const date = new Date(inv.paidAt!);
            return date >= d && date < nextMonth;
          })
          .reduce((sum, inv) => sum + (inv.amountKes || 0), 0);

        trend.push({ month: monthName, revenue, target });
      }
    } else if (chartPeriod === "weekly") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        d.setHours(0,0,0,0);
        d.setDate(d.getDate() - d.getDay());
        const weekName = `W${Math.ceil((d.getDate())/7)} ${d.toLocaleString("default", { month: "short" })}`;
        const nextWeek = new Date(d.getTime() + 7 * 24 * 60 * 60 * 1000);

        const target = (settings.revenueTarget || 0) / 4;
        const revenue = invoices
          .filter((inv) => !!inv.paidAt)
          .filter((inv) => {
            const date = new Date(inv.paidAt!);
            return date >= d && date < nextWeek;
          })
          .reduce((sum, inv) => sum + (inv.amountKes || 0), 0);

        trend.push({ month: weekName, revenue, target });
      }
    } else {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        d.setHours(0,0,0,0);
        const dayName = `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
        const nextDay = new Date(d.getTime() + 24 * 60 * 60 * 1000);

        const target = (settings.revenueTarget || 0) / 30;
        const revenue = invoices
          .filter((inv) => !!inv.paidAt)
          .filter((inv) => {
            const date = new Date(inv.paidAt!);
            return date >= d && date < nextDay;
          })
          .reduce((sum, inv) => sum + (inv.amountKes || 0), 0);

        trend.push({ month: dayName, revenue, target });
      }
    }
    return trend;
  }, [invoices, chartPeriod, settings.revenueTarget]);

  // Today Panel Math
  const today = new Date();
  today.setHours(0,0,0,0);
  const todayStr = today.toISOString().split("T")[0];
  
  const in3Days = new Date(today);
  in3Days.setDate(today.getDate() + 3);
  const in3DaysStr = in3Days.toISOString().split("T")[0];

  const in14Days = new Date(today);
  in14Days.setDate(today.getDate() + 14);
  const in14DaysStr = in14Days.toISOString().split("T")[0];

  const tripsToday = useStore.getState().trips.filter(t => (t.startDate && t.startDate.startsWith(todayStr)) || (t.endDate && t.endDate.startsWith(todayStr)));
  const posDueSoon = useStore.getState().purchaseOrders?.filter(po => po.dueDate && po.dueDate >= todayStr && po.dueDate <= in3DaysStr && po.status !== "closed") || [];
  const invoicesDueSoon = invoices.filter(inv => inv.dueDate && inv.dueDate >= todayStr && inv.dueDate <= in3DaysStr && !inv.paidAt);
  const contractsExpiringSoon = useStore.getState().suppliers?.filter(s => s.contractExpires && s.contractExpires >= todayStr && s.contractExpires <= in14DaysStr) || [];
  
  const todayItems: any[] = [];
  tripsToday.forEach(t => todayItems.push({ id: t.id, icon: <PlaneTakeoff className="h-4 w-4 text-accent-400" />, title: `Trip: ${t.clientName}`, subtitle: `Departing/Returning today` }));
  if (settings.role !== "operations") {
    invoicesDueSoon.forEach(inv => todayItems.push({ id: inv.id, icon: <AlertCircle className="h-4 w-4 text-amber-500" />, title: `Invoice Due: ${inv.number}`, subtitle: `Due by ${inv.dueDate}` }));
    posDueSoon.forEach(po => todayItems.push({ id: po.id, icon: <AlertCircle className="h-4 w-4 text-amber-500" />, title: `PO Due: ${po.supplierName}`, subtitle: `Due by ${po.dueDate}` }));
  }
  contractsExpiringSoon.forEach(s => todayItems.push({ id: s.id, icon: <Briefcase className="h-4 w-4 text-neutral-400" />, title: `Contract Expiring: ${s.name}`, subtitle: `Expires ${s.contractExpires}` }));
  const displayTodayItems = todayItems.slice(0, 4);

  // Gauge Math
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const revenueThisMonth = invoices.filter(inv => inv.paidAt && new Date(inv.paidAt) >= currentMonth).reduce((s, inv) => s + (inv.amountKes || 0), 0);
  const revTarget = settings.revenueTarget || 0;
  const targetPct = revTarget > 0 ? Math.min(Math.round((revenueThisMonth / revTarget) * 100), 100) : 0;

  // Department Row Math
  const opsDeparturesToday = tripsToday.length;
  const opsTripsInProgress = useStore.getState().trips.filter(t => t.status === "on_ground").length;
  const mktContractsExpiring = contractsExpiringSoon.length;
  
  const accOverdueAR = invoices.filter(inv => inv.dueDate && inv.dueDate < todayStr && !inv.paidAt).reduce((sum, inv) => sum + (inv.amountKes || 0), 0);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
  const eowStr = endOfWeek.toISOString().split("T")[0];
  const accPosDueThisWeek = useStore.getState().purchaseOrders?.filter(po => po.dueDate && po.dueDate >= todayStr && po.dueDate <= eowStr && po.status !== "closed").length || 0;

  const mgtNetMargin = revenueThisMonth - (useStore.getState().purchaseOrders?.filter(po => po.status === "closed" && po.dueDate && new Date(po.dueDate) >= currentMonth).reduce((s, po) => s + (po.amount || 0), 0) || 0);
  const mgtPendingApprovals = useStore.getState().invoiceEditApprovals?.filter(a => a.status === "pending").length || 0;

  // Live pipeline totals — recompute from current leads
  const pipelineByStage: Record<Stage, { count: number; value: number }> = {
    new_enquiry: { count: 0, value: 0 },
    quoted: { count: 0, value: 0 },
    in_discussion: { count: 0, value: 0 },
    confirmed: { count: 0, value: 0 },
    paid: { count: 0, value: 0 },
  };
  leads.forEach((l) => {
    // legacy migration
    const stage = l.stage === "new_lead" as any ? "new_enquiry" : l.stage;
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

      {/* NEW: Today panel + Monthly revenue goal gauge */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Today Panel */}
        <Card className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-white">Today</h2>
            <p className="text-xs text-neutral-500">Urgent items</p>
          </div>
          {displayTodayItems.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-neutral-500">
              Nothing urgent today
            </div>
          ) : (
            <div className="space-y-3">
              {displayTodayItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-ink-850 p-2 border border-ink-700">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-neutral-500">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Monthly Revenue Goal Gauge */}
        <Card>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-white">Monthly Target</h2>
            <p className="text-xs text-neutral-500">Revenue against goal</p>
          </div>
          {revTarget === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2">
              <p className="text-sm text-neutral-500">No monthly target set</p>
              <Link href="/settings" className="text-xs font-medium text-accent-400 hover:text-accent-300">
                Set a target ↗
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-[12px] border-ink-800">
                <svg className="absolute inset-0 h-full w-full -rotate-90">
                  <circle cx="50%" cy="50%" r="44%" fill="transparent" strokeWidth="12" className="stroke-accent-500" strokeDasharray={`${targetPct * 2.76} 276`} />
                </svg>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{targetPct}%</span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-lg font-semibold text-white">{formatMoney(revenueThisMonth, currency)}</p>
                <p className="text-xs text-neutral-500">of {formatMoney(revTarget, currency)}</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Revenue trend + pipeline stages */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Revenue Trend</h2>
              <p className="text-xs text-neutral-500">Performance vs target</p>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-ink-700 bg-ink-900 p-1">
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    chartPeriod === p
                      ? "bg-ink-700 text-white font-medium"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
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

      {/* NEW: By Department row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Operations */}
        <Card>
          <div className="flex items-center gap-2 mb-3 text-neutral-400">
            <PlaneTakeoff className="h-4 w-4" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">Operations</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Departing Today</span>
              <span className="text-base font-semibold text-white">{opsDeparturesToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Trips in Progress</span>
              <span className="text-base font-semibold text-white">{opsTripsInProgress}</span>
            </div>
          </div>
        </Card>

        {/* Marketing & Sales */}
        <Card>
          <div className="flex items-center gap-2 mb-3 text-neutral-400">
            <Target className="h-4 w-4" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">Sales</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Pipeline Value</span>
              <span className="text-base font-semibold text-white">{formatMoney(totalPipelineValue, currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Contracts Expiring</span>
              <span className="text-base font-semibold text-white">{mktContractsExpiring}</span>
            </div>
          </div>
        </Card>

        {/* Accounts */}
        {(settings.role === "management" || settings.role === "Sales Manager" || settings.role === "Director") ? (
          <Card>
            <div className="flex items-center gap-2 mb-3 text-neutral-400">
              <Banknote className="h-4 w-4" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">Accounts</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Overdue AR</span>
                <span className="text-base font-semibold text-amber-500">{formatMoney(accOverdueAR, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">POs Due This Week</span>
                <span className="text-base font-semibold text-white">{accPosDueThisWeek}</span>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center opacity-50">
            <Banknote className="h-4 w-4 mb-2 text-neutral-600" />
            <p className="text-xs text-neutral-500">Accounts detail hidden</p>
          </Card>
        )}

        {/* Management */}
        {(settings.role === "management" || settings.role === "Director") ? (
          <Card>
            <div className="flex items-center gap-2 mb-3 text-neutral-400">
              <PieChart className="h-4 w-4" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">Management</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Net Margin (Mtd)</span>
                <span className="text-base font-semibold text-white">{formatMoney(mgtNetMargin, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Pending Approvals</span>
                <span className="text-base font-semibold text-white">{mgtPendingApprovals}</span>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center opacity-50">
            <PieChart className="h-4 w-4 mb-2 text-neutral-600" />
            <p className="text-xs text-neutral-500">Management detail hidden</p>
          </Card>
        )}
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
