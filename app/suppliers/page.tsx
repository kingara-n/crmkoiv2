"use client";

import { useState, useMemo } from "react";
import {
  Search, Plus, MapPin, Mail, Phone, Building2, Users, Check, X,
  DollarSign, AlertCircle, Calendar, FileText, ShoppingCart
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { SupplierModal } from "@/components/modals/SupplierModal";
import { PurchaseOrderModal } from "@/components/modals/PurchaseOrderModal";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { formatMoney, formatMoneyFull, formatDate } from "@/lib/format";
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
  const purchaseOrders = useStore((s) => s.purchaseOrders);
  const approveSupplier = useStore((s) => s.approveSupplier);
  const rejectSupplier = useStore((s) => s.rejectSupplier);
  const deleteSupplier = useStore((s) => s.deleteSupplier);
  const settings = useStore((s) => s.settings);
  const currency = settings.currency;

  const isManager = /manager|director/i.test(settings.role);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupplierStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [poModalOpen, setPoModalOpen] = useState(false);

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
  if (!hydrated) return <div className="text-neutral-500 p-2">Loading…</div>;

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Suppliers</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage supplier directory and track partnerships.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Add Supplier
          </Button>
        </div>
      </div>

      <div className="pt-2">
        <h2 className="text-lg font-semibold text-white mb-4">Supplier Directory</h2>
        
        {/* Search + filter + add */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
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

              {s.status === "pending" && isManager && (
                <div className="flex items-center gap-2 border-t border-ink-700 pt-3">
                  <Button variant="secondary" onClick={() => approveSupplier(s.id)}>Approve</Button>
                  <Button variant="danger" onClick={() => rejectSupplier(s.id)}>Reject</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      <SupplierModal open={modalOpen} onClose={() => setModalOpen(false)} submitAsPending={!isManager} />
      <PurchaseOrderModal open={poModalOpen} onClose={() => setPoModalOpen(false)} />
    </div>
  );
}
