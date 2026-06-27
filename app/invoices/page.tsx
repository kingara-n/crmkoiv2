"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Filter, FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useStore, useSettings } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { InvoiceModal } from "@/components/modals/InvoiceModal";

export default function InvoicesPage() {
  const hydrated = useIsHydrated();
  const invoices = useStore((s) => s.invoices);
  const bookings = useStore((s) => s.bookings);
  const approvals = useStore((s) => s.invoiceEditApprovals);
  const updateInvoice = useStore((s) => s.updateInvoice); // Assuming we have this, or we just handle state
  const settings = useSettings();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let rows = invoices.map(inv => {
      const booking = bookings.find(b => b.id === inv.bookingId);
      const invApprovals = approvals.filter(a => a.invoiceId === inv.id);
      return { ...inv, booking, pendingEdits: invApprovals.filter(a => a.approverId === "pending") };
    });

    if (statusFilter !== "all") {
      rows = rows.filter(inv => (statusFilter === "paid" ? !!inv.paidAt : !inv.paidAt));
    }
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(inv => 
        inv.number.toLowerCase().includes(q) ||
        (inv.booking?.clientName?.toLowerCase() || "").includes(q)
      );
    }
    return rows;
  }, [invoices, bookings, approvals, statusFilter, query]);

  const totalPaid = invoices.filter(i => !!i.paidAt).reduce((sum, i) => sum + (i.amountKes || 0), 0);
  const totalUnpaid = invoices.filter(i => !i.paidAt).reduce((sum, i) => sum + (i.amountKes || 0), 0);
  const pendingApprovalsCount = approvals.filter(a => a.approverId === "pending").length;

  if (!hydrated) return <div className="text-neutral-500 p-2">Loading…</div>;

  return (
    <div className="space-y-5 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Invoices</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage accounts receivable and invoice approvals.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Paid" value={`${settings.currency} ${totalPaid.toLocaleString()}`} icon={<CheckCircle2 className="h-4 w-4 text-success-500" />} />
        <StatCard label="Total Outstanding" value={`${settings.currency} ${totalUnpaid.toLocaleString()}`} icon={<Clock className="h-4 w-4 text-amber-500" />} />
        <StatCard label="Pending Approvals" value={String(pendingApprovalsCount)} icon={<AlertTriangle className="h-4 w-4 text-red-400" />} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="search"
            placeholder="Search invoice number or client..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-900 pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent-500/60"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${statusFilter === "all" ? "bg-accent-500 text-black font-medium" : "border border-ink-700 bg-ink-900 text-neutral-300 hover:bg-ink-850"}`}
          >All</button>
          <button
            onClick={() => setStatusFilter("unpaid")}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${statusFilter === "unpaid" ? "bg-accent-500 text-black font-medium" : "border border-ink-700 bg-ink-900 text-neutral-300 hover:bg-ink-850"}`}
          >Unpaid</button>
          <button
            onClick={() => setStatusFilter("paid")}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${statusFilter === "paid" ? "bg-accent-500 text-black font-medium" : "border border-ink-700 bg-ink-900 text-neutral-300 hover:bg-ink-850"}`}
          >Paid</button>
        </div>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-ink-700 text-xs uppercase text-neutral-500">
                <th className="px-5 py-3 font-medium">Invoice #</th>
                <th className="px-5 py-3 font-medium">Client / Booking</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Due Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-neutral-500">
                    No invoices found.
                  </td>
                </tr>
              )}
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-ink-700 last:border-0 hover:bg-ink-850/40">
                  <td className="px-5 py-4 font-medium text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-neutral-400" />
                    {inv.number}
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-white">{inv.booking?.clientName || "Unknown"}</div>
                    <div className="text-xs text-neutral-500">{inv.booking?.destination || "—"}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-mono text-white">{inv.currency} {inv.amountKes.toLocaleString()}</div>
                  </td>
                  <td className="px-5 py-4 text-neutral-300">
                    {inv.dueDate || "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {inv.paidAt ? (
                        <Badge tone="success">PAID</Badge>
                      ) : (
                        <Badge tone="warning">UNPAID</Badge>
                      )}
                      {inv.pendingEdits.length > 0 && (
                        <Badge tone="danger">EDIT PENDING</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button variant="secondary" className="text-xs py-1" onClick={() => setSelectedBookingId(inv.bookingId)}>
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedBookingId && (
        <InvoiceModal
          open={!!selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          bookingId={selectedBookingId}
        />
      )}
    </div>
  );
}
