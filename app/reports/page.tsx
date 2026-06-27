"use client";

import { useState } from "react";
import { FileText, Download, Clock, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConversionLineChart, LeadSourceDonut } from "@/components/charts/ReportCharts";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";

interface Report {
  id: string;
  name: string;
  category: string;
  date: string;
  generating?: boolean;
}

const SEED_REPORTS: Report[] = [
  { id: "r1", name: "Monthly Sales Summary", category: "Sales", date: "20 Jun 2026" },
  { id: "r2", name: "Q2 Performance Analysis", category: "Performance", date: "18 Jun 2026" },
  { id: "r3", name: "Pipeline Forecast", category: "Forecast", date: "15 Jun 2026" },
  { id: "r4", name: "Team Productivity Report", category: "Team", date: "12 Jun 2026", generating: true },
  { id: "r5", name: "Lead Source Analysis", category: "Marketing", date: "10 Jun 2026" },
];

// Demo conversion rate trajectory
const CONVERSION_DATA = [
  { month: "Jan", rate: 18 },
  { month: "Feb", rate: 20 },
  { month: "Mar", rate: 22 },
  { month: "Apr", rate: 21 },
  { month: "May", rate: 25 },
  { month: "Jun", rate: 28 },
  { month: "Jul", rate: 27 },
  { month: "Aug", rate: 30 },
  { month: "Sep", rate: 32 },
  { month: "Oct", rate: 35 },
  { month: "Nov", rate: 37 },
  { month: "Dec", rate: 38 },
];

export default function ReportsPage() {
  const hydrated = useIsHydrated();
  const leads = useStore((s) => s.leads);
  const bookings = useStore((s) => s.bookings);
  const clients = useStore((s) => s.clients);
  const team = useStore((s) => s.team);

  const [reports, setReports] = useState<Report[]>(SEED_REPORTS);

  // Compute live lead-source breakdown from the actual leads in the store
  const sourceMap = new Map<string, number>();
  leads.forEach((l) => sourceMap.set(l.source, (sourceMap.get(l.source) ?? 0) + 1));
  const totalSources = leads.length || 1;
  const sourceData = Array.from(sourceMap.entries())
    .map(([name, count]) => ({ name, value: Math.round((count / totalSources) * 100) }))
    .sort((a, b) => b.value - a.value);

  function downloadReport(report: Report) {
    // Real, functional download: writes a JSON snapshot of the relevant
    // store data based on the report category, and triggers a browser download.
    let payload: any = { report: report.name, generated: new Date().toISOString() };
    if (report.category === "Sales") payload.bookings = bookings;
    else if (report.category === "Performance") payload.team = team;
    else if (report.category === "Forecast") payload.pipeline = leads;
    else if (report.category === "Team") payload.team = team;
    else if (report.category === "Marketing") payload.leadSources = sourceData;
    else payload.snapshot = { clients, bookings, leads };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, "_")}_${report.date.replace(/\s/g, "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function generateNew() {
    const id = "r_" + Math.random().toString(36).slice(2, 8);
    const newReport: Report = {
      id,
      name: "Custom Snapshot",
      category: "Sales",
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      generating: true,
    };
    setReports((rs) => [newReport, ...rs]);
    // Simulate generation
    setTimeout(() => {
      setReports((rs) =>
        rs.map((r) => (r.id === id ? { ...r, generating: false } : r)),
      );
    }, 1800);
  }

  if (!hydrated) return <div className="text-neutral-500 p-2">Loading…</div>;

  return (
    <div className="space-y-5">
      <p className="text-sm text-neutral-400">Generate and download performance reports</p>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3">
            <h2 className="text-base font-semibold text-white">Conversion Rate</h2>
            <p className="text-xs text-neutral-500">Lead → confirmed booking, last 12 months</p>
          </div>
          <ConversionLineChart data={CONVERSION_DATA} />
        </Card>

        <Card>
          <div className="mb-3">
            <h2 className="text-base font-semibold text-white">Lead Sources</h2>
            <p className="text-xs text-neutral-500">Live from your pipeline</p>
          </div>
          {sourceData.length > 0 ? (
            <LeadSourceDonut data={sourceData} />
          ) : (
            <p className="text-sm text-neutral-500 py-6 text-center">No leads to analyse yet.</p>
          )}
        </Card>
      </div>

      {/* Recent reports */}
      <Card padding={false}>
        <div className="flex items-center justify-between border-b border-ink-700 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">Recent Reports</h2>
            <p className="text-xs text-neutral-500">Your generated reports</p>
          </div>
          <Button variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={generateNew}>
            Generate New
          </Button>
        </div>

        <div>
          {reports.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between border-b border-ink-700 px-5 py-4 last:border-0 hover:bg-ink-850/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-800">
                  <FileText className="h-4 w-4 text-neutral-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{r.name}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <Badge tone="neutral">{r.category}</Badge>
                    <span className="text-neutral-500">·</span>
                    <span className="text-neutral-500">{r.date}</span>
                  </div>
                </div>
              </div>
              {r.generating ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-amber-400">
                  <Clock className="h-4 w-4 animate-pulse" />
                  Generating…
                </span>
              ) : (
                <button
                  onClick={() => downloadReport(r)}
                  className="inline-flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3 py-1.5 text-sm text-neutral-300 hover:bg-ink-800"
                >
                  <Download className="h-4 w-4" /> Download
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
