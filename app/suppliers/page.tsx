"use client";

import { useState, useMemo } from "react";
import {
  Search, Plus, MapPin, Mail, Phone, Building2, Users, Check, X,
  DollarSign, AlertCircle, Calendar,
} from "lucide-react";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SupplierModal } from "@/components/modals/SupplierModal";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { formatMoney, formatDate } from "@/lib/format";
import { Supplier, SupplierStatus, SupplierType } from "@/lib/types";

const TYPE_LABELS: Record<SupplierType, string> = {
  hotel: "Hotel",
  camp: "Camp / Lodge",
  transport: "Transport",
  dmc: "DMC",
  airline: "Airline",
};

export default function SuppliersPage() {
  const hydrated = useIsHydrated();
  const suppliers = useStore((s) => s.suppliers);
  const approveSupplier = useStore((s) => s.approveSupplier);
  const rejectSupplier = useStore((s) => s.rejectSupplier);
  const deleteSupplier = useStore((s) => s.deleteSupplier);
  const settings = useStore((s) => s.settings);
  const currency = settings.currency;

  // Role-based gate: Managers can add directly. Others submit for approval.
  // The PRD says only Marketing / Management can add; we treat "Sales Manager",
  // "Manager", "Director" as the manager class.
  const isManager = /manager|director/i.test(settings.role);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupplierStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    let rows = suppliers;
    if (statusFilter !== "all") rows = rows.filter((s) => s.status === statusFilter);
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [suppliers, statusFilter, query]);

  const pendingCount = suppliers.filter((s) => s.status === "pending").length;
  const approvedCount = suppliers.filter((s) => s.status === "approved").length;
  const totalCapacity = suppliers
    .filter((s) => s.status === "approved")
    .reduce((sum, s) => sum + s.capacity, 0);

  function expiringSoon(supplier: Supplier): boolean {
    if (!supplier.contractExpires) return false;
    const days = (new Date(supplier.contractExpires).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days < 90 && days > 0;
  }

  if (!hydrated) return <div className="text-neutral-500 p-2">Loading…</div>;

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Suppliers" value={String(suppliers.length)}
          icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Approved" value={String(approvedCount)}
          icon={<Check className="h-4 w-4 text-accent-500" />} />
        <StatCard label="Pending Approval" value={String(pendingCount)}
          icon={<AlertCircle className="h-4 w-4 text-amber-400" />} />
        <StatCard label="Combined Capacity" value={`${totalCapacity}`}
          icon={<Users className="h-4 w-4 text-sky-400" />} />
      </div>

      {/* Pending approval banner */}
      {pendingCount > 0 && isManager && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-200">
                {pendingCount} supplier{pendingCount > 1 ? "s" : ""} awaiting your approval
              </p>
              <p className="text-xs text-amber-200/70">
                Click "Pending" below to review and approve or reject.
              </p>
            </div>
            <button
              onClick={() => setStatusFilter("pending")}
              className="text-sm font-medium text-amber-300 hover:text-amber-100"
            >
              Review →
            </button>
          </div>
        </Card>
      )}

      {/* Search + filter + add */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="search"
            placeholder="Search suppliers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-900 pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent-500/60"
          />
        </div>

        <div className="flex gap-2">
          {([
            { v: "all" as const, label: "All" },
            { v: "approved" as const, label: "Approved" },
            { v: "pending" as const, label: "Pending" },
            { v: "rejected" as const, label: "Rejected" },
          ]).map((f) => (
            <button
              key={f.v}
              onClick={() => setStatusFilter(f.v)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === f.v
                  ? "bg-accent-500 text-black"
                  : "bg-ink-900 border border-ink-700 text-neutral-300 hover:bg-ink-850"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <Button icon={<Plus className="h-4 w-4" />} className="ml-auto" onClick={() => setModalOpen(true)}>
          {isManager ? "Add Supplier" : "Request supplier"}
        </Button>
      </div>

      {/* Supplier cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.length === 0 && (
          <div className="col-span-2 rounded-card border border-dashed border-ink-700 py-16 text-center text-neutral-500">
            No suppliers match your filters.
          </div>
        )}
        {filtered.map((s) => (
          <Card key={s.id}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-white">{s.name}</p>
                  <Badge tone="neutral">{TYPE_LABELS[s.type]}</Badge>
                </div>
                <p className="text-xs text-neutral-500">{s.category}</p>
              </div>
              {s.status === "approved" && <Badge tone="success" dot>Approved</Badge>}
              {s.status === "pending" && <Badge tone="warning" dot>Pending</Badge>}
              {s.status === "rejected" && <Badge tone="danger" dot>Rejected</Badge>}
            </div>

            <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-neutral-300">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-neutral-500" />{s.city}, {s.country}
              </p>
              <p className="flex items-center gap-2">
                <Users className="h-4 w-4 text-neutral-500" />Capacity {s.capacity}
              </p>
              <p className="flex items-center gap-2 truncate">
                <Mail className="h-4 w-4 text-neutral-500" />
                <span className="truncate" title={s.bookingsEmail}>{s.bookingsEmail}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-neutral-500" />{s.phone}
              </p>
            </div>

            {/* Rates */}
            <div className="mb-4 rounded-lg border border-ink-700 bg-ink-850/40 p-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-neutral-500">Resident rate</p>
                  <p className="font-semibold text-white">{formatMoney(s.residentRate, currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Non-resident</p>
                  <p className="font-semibold text-white">$ {s.nonResidentRateUsd}</p>
                </div>
              </div>
            </div>

            {/* Policies (compact) */}
            <div className="mb-4 space-y-1.5 text-xs">
              <p className="text-neutral-400">
                <span className="text-neutral-500">Cancellation:</span> {s.cancellationPolicy}
              </p>
              <p className="text-neutral-400">
                <span className="text-neutral-500">Payment:</span> {s.paymentTerms}
              </p>
              {s.contractExpires && (
                <p className={`flex items-center gap-1.5 ${expiringSoon(s) ? "text-amber-400" : "text-neutral-500"}`}>
                  <Calendar className="h-3 w-3" />
                  Contract expires {formatDate(s.contractExpires)}
                  {expiringSoon(s) && " — renew soon"}
                </p>
              )}
            </div>

            {/* Actions */}
            {s.status === "pending" && isManager && (
              <div className="flex gap-2 border-t border-ink-700 pt-3">
                <Button
                  fullWidth
                  variant="primary"
                  icon={<Check className="h-4 w-4" />}
                  onClick={() => approveSupplier(s.id)}
                >
                  Approve
                </Button>
                <Button
                  fullWidth
                  variant="danger"
                  icon={<X className="h-4 w-4" />}
                  onClick={() => rejectSupplier(s.id)}
                >
                  Reject
                </Button>
              </div>
            )}
            {s.status !== "pending" && isManager && (
              <button
                onClick={() => {
                  if (confirm(`Remove ${s.name} from the supplier directory?`)) deleteSupplier(s.id);
                }}
                className="text-xs text-neutral-500 hover:text-red-400"
              >
                Remove from directory
              </button>
            )}
          </Card>
        ))}
      </div>

      <SupplierModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        submitAsPending={!isManager}
      />
    </div>
  );
}
