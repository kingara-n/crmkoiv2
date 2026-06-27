"use client";

import { useState, useMemo } from "react";
import { Search, Filter, ChevronUp, ChevronDown, ArrowUpDown, CheckCircle2, Clock, XCircle, Edit2, Trash2, FileText, Plane, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RowMenu } from "@/components/ui/RowMenu";
import { InvoiceModal } from "@/components/modals/InvoiceModal";
import { ItineraryModal } from "@/components/modals/ItineraryModal";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { formatMoney, formatDate } from "@/lib/format";
import { BookingStatus, Booking } from "@/lib/types";

type Filter = "all" | "confirmed" | "pending" | "lost";
type SortKey = "clientName" | "value" | "closeDate";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 8;

const FILTER_LABELS: Record<Filter, string> = {
  all: "All",
  confirmed: "Won",
  pending: "Pending",
  lost: "Lost",
};

export default function BookingsPage() {
  const hydrated = useIsHydrated();
  const bookings = useStore((s) => s.bookings);
  const updateBooking = useStore((s) => s.updateBooking);
  const deleteBooking = useStore((s) => s.deleteBooking);
  const currency = useStore((s) => s.settings.currency);
  const documents = useStore((s) => s.clientDocuments);

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("closeDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [itineraryModalOpen, setItineraryModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let rows = bookings;
    if (filter !== "all") rows = rows.filter((b) => b.status === (filter as BookingStatus));
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (b) =>
          b.clientName.toLowerCase().includes(q) ||
          b.contactName.toLowerCase().includes(q) ||
          b.contactEmail.toLowerCase().includes(q) ||
          b.destination.toLowerCase().includes(q),
      );
    }
    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "value") cmp = a.value - b.value;
      else if (sortKey === "closeDate") cmp = (a.closeDate || '').localeCompare(b.closeDate || '');
      else cmp = a.clientName.localeCompare(b.clientName);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [bookings, filter, query, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function sortIcon(key: SortKey) {
    if (sortKey !== key) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  }

  function handleStatusToggle(b: Booking) {
    const next: BookingStatus =
      b.status === "pending" ? "confirmed" :
      b.status === "confirmed" ? "lost" : "pending";

    // GATEKEEPER LOGIC
    if (next === "confirmed") {
      const clientDocs = documents.filter((d) => d.clientId === b.clientId);
      const hasPassport = clientDocs.some((d) => d.docType === "passport");
      const hasReceipt = clientDocs.some((d) => d.docType === "payment_receipt");

      if (!hasPassport || !hasReceipt) {
        alert("Gatekeeper Blocked: Cannot confirm this booking. Missing a Passport and Payment Receipt for this client. Please upload them in the Document Vault.");
        return;
      }
    }

    updateBooking(b.id, { status: next });
  }

  function handleDelete(b: Booking) {
    if (confirm(`Delete booking for ${b.clientName}? This can't be undone.`)) {
      deleteBooking(b.id);
    }
  }

  if (!hydrated) return <div className="text-neutral-500 p-2">Loading…</div>;

  return (
    <div className="space-y-5">
      <p className="text-sm text-neutral-400">View and manage all your bookings in one place</p>

      {/* Filters + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="search"
            placeholder="Search bookings..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-ink-700 bg-ink-900 pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent-500/60"
          />
        </div>

        <div className="flex gap-2">
          {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-accent-500 text-black"
                  : "bg-ink-900 border border-ink-700 text-neutral-300 hover:bg-ink-850"
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        <button className="ml-auto flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-900 px-3 py-1.5 text-sm text-neutral-300 hover:bg-ink-850">
          <Filter className="h-4 w-4" />
          More filters
        </button>
      </div>

      {/* Table */}
      <Card padding={false}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-700 text-left text-xs uppercase text-neutral-500">
              <th className="px-5 py-3">
                <button onClick={() => toggleSort("clientName")} className="inline-flex items-center gap-1 hover:text-white">
                  Client {sortIcon("clientName")}
                </button>
              </th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">
                <button onClick={() => toggleSort("value")} className="inline-flex items-center gap-1 hover:text-white">
                  Value {sortIcon("value")}
                </button>
              </th>
              <th className="px-5 py-3">Destination</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Rep</th>
              <th className="px-5 py-3">
                <button onClick={() => toggleSort("closeDate")} className="inline-flex items-center gap-1 hover:text-white">
                  Close date {sortIcon("closeDate")}
                </button>
              </th>
              <th className="px-5 py-3">Margin</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-sm text-neutral-500">
                  No bookings match these filters.
                </td>
              </tr>
            )}
            {pageRows.map((b) => (
              <tr key={b.id} className="border-b border-ink-700 last:border-0 hover:bg-ink-850/40">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-800 text-xs font-semibold text-neutral-300">
                      {b.clientName[0]}
                    </div>
                    <span className="font-medium text-white">{b.clientName}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="text-white">{b.contactName}</p>
                  <p className="text-xs text-neutral-500">{b.contactEmail}</p>
                </td>
                <td className="px-5 py-4 font-semibold text-white">{formatMoney(b.value, currency)}</td>
                <td className="px-5 py-4 text-neutral-300">{b.destination}</td>
                <td className="px-5 py-4">
                  <Badge
                    tone={b.status === "confirmed" ? "success" : b.status === "lost" ? "danger" : "warning"}
                    icon={
                      b.status === "confirmed" ? <CheckCircle2 className="h-3 w-3" /> :
                      b.status === "lost" ? <XCircle className="h-3 w-3" /> :
                      <Clock className="h-3 w-3" />
                    }
                  >
                    {b.status === "confirmed" ? "Won" : b.status === "lost" ? "Lost" : "Pending"}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-neutral-300">{b.ownerName}</td>
                <td className="px-5 py-4 text-neutral-300">{b.closeDate ? formatDate(b.closeDate) : "—"}</td>
                <td className="px-5 py-4">
                  {b.costs && b.costs.length > 0 ? (
                    <Badge tone="success">
                      {Math.round(((b.value - b.costs.reduce((sum, c) => sum + c.amount, 0)) / b.value) * 100)}%
                    </Badge>
                  ) : (
                    <span className="text-neutral-500 text-xs">—</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <RowMenu
                    items={[
                      { 
                        label: b.travefyUrl ? "View Travefy Itinerary" : "Link Travefy", 
                        onClick: () => {
                          if (b.travefyUrl) {
                            window.open(b.travefyUrl, '_blank');
                          } else {
                            const url = prompt("Enter Travefy Share URL for this booking:");
                            if (url) updateBooking(b.id, { travefyUrl: url });
                          }
                        }, 
                        icon: <Plane className="h-3.5 w-3.5 text-blue-400" /> 
                      },
                      { 
                        label: "Manage Supplier Costs", 
                        onClick: () => {
                          const amountStr = prompt(`Enter supplier cost for ${b.clientName} (in KES):`);
                          if (amountStr && !isNaN(Number(amountStr))) {
                            const newCost = { id: Date.now().toString(), description: 'Supplier Bill', amount: Number(amountStr) };
                            updateBooking(b.id, { costs: [...(b.costs || []), newCost] });
                          }
                        }, 
                        icon: <DollarSign className="h-3.5 w-3.5 text-green-400" /> 
                      },
                      { label: "Generate Itinerary", onClick: () => { setSelectedBookingId(b.id); setItineraryModalOpen(true); }, icon: <FileText className="h-3.5 w-3.5" /> },
                      { label: "Manage Invoices", onClick: () => { setSelectedBookingId(b.id); setInvoiceModalOpen(true); }, icon: <FileText className="h-3.5 w-3.5" /> },
                      { label: b.status === "pending" ? "Mark Confirmed" : "Revert to Pending", onClick: () => handleStatusToggle(b), icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
                      { label: "Delete", onClick: () => handleDelete(b), destructive: true, icon: <Trash2 className="h-3.5 w-3.5" /> },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-ink-700 px-5 py-3 text-sm">
          <p className="text-neutral-500">
            Showing {pageRows.length} of {filtered.length} bookings
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded px-3 py-1 text-neutral-300 disabled:opacity-40 hover:bg-ink-800"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded px-3 py-1 ${
                  p === page ? "bg-accent-500 text-black" : "text-neutral-300 hover:bg-ink-800"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="rounded px-3 py-1 text-neutral-300 disabled:opacity-40 hover:bg-ink-800"
            >
              Next
            </button>
          </div>
        </div>
      </Card>
      {selectedBookingId && (
        <InvoiceModal
          open={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          bookingId={selectedBookingId}
        />
      )}
      {selectedBookingId && (
        <ItineraryModal
          open={itineraryModalOpen}
          onClose={() => setItineraryModalOpen(false)}
          bookingId={selectedBookingId}
        />
      )}
    </div>
  );
}
