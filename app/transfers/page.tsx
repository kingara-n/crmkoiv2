"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Filter, PlaneLanding, PlaneTakeoff, Car } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RowMenu } from "@/components/ui/RowMenu";
import { useStore, useSettings } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { Transfer, TransferStatus } from "@/lib/types";

// Import TransferModal - we will create this next
import { TransferModal } from "@/components/modals/TransferModal";

type SortKey = "flightTime" | "clientName" | "status";
type SortDir = "asc" | "desc";

export default function TransfersPage() {
  const hydrated = useIsHydrated();
  const transfers = useStore((s) => s.transfers);
  const settings = useSettings();
  const updateTransfer = useStore((s) => s.updateTransfer);
  const deleteTransfer = useStore((s) => s.deleteTransfer);

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("flightTime");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let rows = transfers;
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (t) =>
          t.clientName?.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q) ||
          t.driverName?.toLowerCase().includes(q)
      );
    }
    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "flightTime") cmp = new Date(a.flightTime).getTime() - new Date(b.flightTime).getTime();
      else if (sortKey === "clientName") cmp = (a.clientName || "").localeCompare(b.clientName || "");
      else cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [transfers, query, sortKey, sortDir]);

  function handleStatusToggle(t: Transfer) {
    const next: TransferStatus =
      t.status === "pending" ? "on_time" :
      t.status === "on_time" ? "late" :
      t.status === "late" ? "missed" : "pending";
    updateTransfer(t.id, { status: next });
  }

  function handleDelete(t: Transfer) {
    if (confirm(`Delete transfer for ${t.clientName}?`)) {
      deleteTransfer(t.id);
    }
  }

  if (!hydrated) return <div className="text-neutral-500 p-2">Loading…</div>;

  return (
    <div className="space-y-5 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Transfers</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage all airport and local transfers</p>
        </div>
        <button
          onClick={() => {
            setSelectedTransferId(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-accent-500 px-3 py-2 text-sm font-medium text-black hover:bg-accent-400 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Transfer
        </button>
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="search"
            placeholder="Search clients or drivers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-900 pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent-500/60"
          />
        </div>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-xs uppercase text-neutral-500">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Location & Time</th>
                <th className="px-5 py-3 font-medium">Driver & Car</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-neutral-500">
                    No transfers found.
                  </td>
                </tr>
              )}
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-ink-700 last:border-0 hover:bg-ink-850/40 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-medium text-white block">{t.clientName}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-white">
                      <PlaneLanding className="h-4 w-4 text-neutral-400" />
                      <span>{t.location}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">{new Date(t.flightTime).toLocaleString()}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-white flex items-center gap-2">
                      <Car className="h-4 w-4 text-neutral-400" />
                      {t.driverName || "Unassigned"}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {t.carType || "N/A"} {t.regPlate && `• ${t.regPlate}`}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      tone={
                        t.status === "on_time" ? "success" :
                        t.status === "late" ? "warning" :
                        t.status === "missed" ? "danger" : "neutral"
                      }
                    >
                      {t.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <RowMenu
                      items={[
                        { label: "Edit Transfer", onClick: () => { setSelectedTransferId(t.id); setModalOpen(true); } },
                        { label: "Cycle Status", onClick: () => handleStatusToggle(t) },
                        ...(settings.role === "management" || settings.role === "operations" ? [{ label: "Delete", onClick: () => handleDelete(t), destructive: true }] : []),
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <TransferModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        transferId={selectedTransferId}
      />
    </div>
  );
}
