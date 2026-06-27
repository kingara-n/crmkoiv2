"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { AuditLog } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Activity, ShieldAlert } from "lucide-react";
import { formatDate } from "@/lib/format";

export default function StaffActivityPage() {
  const router = useRouter();
  const settings = useSettings();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (settings.role !== "management") {
      router.push("/");
      return;
    }

    async function fetchLogs() {
      // Fetch audit logs and join with profiles to get the actor's name
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

  if (settings.role !== "management") {
    return (
      <div className="flex h-64 items-center justify-center flex-col text-neutral-500">
        <ShieldAlert className="h-8 w-8 mb-2 text-red-500/50" />
        <p>Restricted access. Management only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5 text-accent-500" />
        <h1 className="text-xl font-semibold text-white">Staff Activity Log</h1>
      </div>

      <Card padding={false}>
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
      </Card>
    </div>
  );
}
