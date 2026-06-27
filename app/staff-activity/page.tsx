"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore, useSettings } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { AuditLog } from "@/lib/types";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Activity, ShieldAlert, Trophy, Target, TrendingUp, Users } from "lucide-react";
import { formatMoney } from "@/lib/format";

export default function StaffActivityPage() {
  const router = useRouter();
  const settings = useSettings();
  const team = useStore((s) => s.team);
  const currency = settings.currency;
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (settings.role !== "management" && !/manager|director/i.test(settings.role)) {
      router.push("/");
      return;
    }

    async function fetchLogs() {
      const { data, error } = await supabase
        .from("audit_log")
        .select(`
          id, action, entity_type, entity_id, diff, created_at,
          actor_id,
          profiles!actor_id (
            name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (data) {
        const formattedLogs = data.map((log: any) => ({
          id: log.id,
          actorId: log.actor_id,
          action: log.action,
          entityType: log.entity_type,
          entityId: log.entity_id,
          diff: log.diff,
          createdAt: log.created_at,
          actorName: log.profiles?.name || "Unknown Staff",
        }));
        setLogs(formattedLogs);
      }
      setLoading(false);
    }

    fetchLogs();
  }, [settings.role, router]);

  if (settings.role !== "management" && !/manager|director/i.test(settings.role)) {
    return (
      <div className="flex h-64 items-center justify-center flex-col text-neutral-500">
        <ShieldAlert className="h-8 w-8 mb-2 text-red-500/50" />
        <p>Restricted access. Management only.</p>
      </div>
    );
  }

  const averageQuotaAttainment = team.length ? Math.round(team.reduce((sum, m) => sum + (m.quotaAttainment || 0), 0) / team.length) : 0;
  const totalDealsClosed = team.reduce((sum, m) => sum + (m.dealsClosed || 0), 0);
  const teamRevenue = team.reduce((sum, m) => sum + (m.revenue || 0), 0);

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Staff Performance</h1>
          <p className="text-sm text-neutral-400 mt-1">Monitor team performance, quotas, and recent system activities.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Team Revenue" value={formatMoney(teamRevenue, currency)} icon={<Trophy className="h-4 w-4" />} />
        <StatCard label="Average Quota" value={`${averageQuotaAttainment}%`} icon={<Target className="h-4 w-4" />} />
        <StatCard label="Deals Closed" value={String(totalDealsClosed)} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Active Members" value={String(team.length)} icon={<Users className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Team Grid */}
        <Card className="lg:col-span-3">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-white">Team Quotas</h2>
            <p className="text-xs text-neutral-500">Individual progress towards targets</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {team.map((m) => (
              <div key={m.id} className="p-3 rounded-lg border border-ink-700 bg-ink-850/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar initials={m.initials} size="sm" />
                    <span className="text-sm font-medium text-white">{m.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{m.quotaAttainment || 0}%</span>
                </div>
                <ProgressBar value={m.quotaAttainment || 0} tone={(m.quotaAttainment || 0) >= 100 ? "accent" : (m.quotaAttainment || 0) > 75 ? "blue" : "amber"} />
                <div className="mt-2 flex justify-between text-xs text-neutral-500">
                  <span>{formatMoney(m.revenue || 0, currency)}</span>
                  <span>{m.dealsClosed || 0} deals</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2 mt-8 mb-4 border-t border-ink-700 pt-6">
        <Activity className="h-5 w-5 text-neutral-400" />
        <h2 className="text-xl font-semibold text-white">System Audit Log</h2>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-xs uppercase text-neutral-500">
                <th className="px-5 py-3">Date & Time</th>
                <th className="px-5 py-3">Staff Member</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Record Type</th>
                <th className="px-5 py-3 w-1/3">Changes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-neutral-500">
                    Loading activity logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-neutral-500">
                    No staff activity recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-ink-700 last:border-0 hover:bg-ink-850/40">
                    <td className="px-5 py-4 text-neutral-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-medium text-white">
                      {log.actorName}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        tone={
                          log.action === "created" ? "success" : 
                          log.action === "deleted" ? "danger" : "warning"
                        }
                      >
                        {log.action.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-neutral-300 capitalize">
                      {log.entityType}
                    </td>
                    <td className="px-5 py-4">
                      <pre className="text-[10px] text-neutral-400 bg-ink-950 p-2 rounded max-h-24 overflow-y-auto w-full">
                        {JSON.stringify(log.diff, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
