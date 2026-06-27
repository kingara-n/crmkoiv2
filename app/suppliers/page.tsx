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
  const approvedCount = suppliers.filter((s) => s.status === "approved").length;
  
  // Dashboard Metrics
  const totalSpendKes = purchaseOrders.reduce((sum, po) => sum + (po.amount * (po.currency === 'KES' ? 1 : po.currency === 'USD' ? 130 : 140)), 0);
  
  const spendByCategory: Record<string, number> = {};
  purchaseOrders.forEach(po => {
    const s = suppliers.find(sup => sup.id === po.supplierId);
    const cat = s ? TYPE_LABELS[s.type] : "Other";
    spendByCategory[cat] = (spendByCategory[cat] || 0) + po.amount; // Rough approximation for demo
  });

  const payablesByCurrency: Record<string, number> = {};
  purchaseOrders.filter(po => po.status !== 'closed').forEach(po => {
    payablesByCurrency[po.currency] = (payablesByCurrency[po.currency] || 0) + po.amount;
  });

  const topSuppliers = [...suppliers]
    .map(s => {
      const spend = purchaseOrders.filter(po => po.supplierId === s.id).reduce((sum, po) => sum + po.amount, 0);
      return { ...s, spend };
    })
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5);

  if (!hydrated) return <div className="text-neutral-500 p-2">Loading…</div>;

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Purchasing & Suppliers</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage suppliers, purchase orders, and track payables.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Add Supplier
          </Button>
          <Button icon={<ShoppingCart className="h-4 w-4" />} onClick={() => setPoModalOpen(true)}>
            Create PO
          </Button>
        </div>
      </div>

      {/* Purchasing Dashboard */}
      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Total Spend (est. KES)" value={`KSh ${(totalSpendKes / 1000).toFixed(1)}k`} icon={<DollarSign className="h-4 w-4" />} />
        <StatCard label="Active POs" value={String(purchaseOrders.filter(po => po.status !== 'closed').length)} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Approved Suppliers" value={String(approvedCount)} icon={<Check className="h-4 w-4 text-success-500" />} />
        <StatCard label="Pending Suppliers" value={String(pendingCount)} icon={<AlertCircle className="h-4 w-4 text-amber-500" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Spend by Category */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white">Spend by Category</h3>
          </div>
          <div className="h-48 w-full mt-2 relative">
            {Object.keys(spendByCategory).length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-neutral-500">
                No spend recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(spendByCategory).map(([name, value]) => ({ name, value }))}
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {Object.keys(spendByCategory).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={["#38bdf8", "#818cf8", "#34d399", "#fbbf24", "#f87171"][index % 5]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: "#1e1e24", border: "1px solid #2d2d35", borderRadius: "0.5rem" }}
                    itemStyle={{ color: "#fff", fontSize: "0.875rem" }}
                    formatter={(value: number) => value.toLocaleString()}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="space-y-2 mt-4">
            {Object.entries(spendByCategory).map(([cat, val], i) => (
              <div key={cat} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ["#38bdf8", "#818cf8", "#34d399", "#fbbf24", "#f87171"][i % 5] }} />
                  <span className="text-neutral-400">{cat}</span>
                </div>
                <span className="text-white font-mono">{val.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Payables by Currency */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Payables by Currency</h3>
            <DollarSign className="h-4 w-4 text-neutral-500" />
          </div>
          <div className="space-y-3">
            {Object.entries(payablesByCurrency).map(([cur, val]) => (
              <div key={cur} className="flex justify-between items-center text-sm">
                <span className="text-neutral-400">{cur}</span>
                <span className="text-white font-mono">{formatMoneyFull(val, cur as any)}</span>
              </div>
            ))}
            {Object.keys(payablesByCurrency).length === 0 && <span className="text-sm text-neutral-500">No active payables.</span>}
          </div>
        </Card>

        {/* Top Suppliers */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Top Suppliers</h3>
            <Building2 className="h-4 w-4 text-neutral-500" />
          </div>
          <div className="space-y-4">
            {topSuppliers.map(s => (
              <div key={s.id} className="flex items-center gap-3">
                <Avatar initials={s.name.substring(0, 2).toUpperCase()} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">{s.name}</p>
                  <p className="text-xs text-neutral-500">{TYPE_LABELS[s.type]}</p>
                </div>
                <div className="text-right">
                  <span className="text-white font-mono text-sm">{s.spend > 0 ? s.spend.toLocaleString() : '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-1">
        <Card padding={false}>
          <div className="p-4 border-b border-ink-700">
            <h3 className="font-semibold text-white">Recent Purchase Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-ink-700 text-xs uppercase text-neutral-500">
                  <th className="px-5 py-3 font-medium">PO Number</th>
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-neutral-500">No POs generated yet.</td>
                  </tr>
                )}
                {purchaseOrders.slice(0, 5).map(po => (
                  <tr key={po.id} className="border-b border-ink-700 last:border-0 hover:bg-ink-850/40">
                    <td className="px-5 py-4 font-medium text-white">{po.poNumber}</td>
                    <td className="px-5 py-4 text-neutral-300">{po.supplierName}</td>
                    <td className="px-5 py-4 text-white font-mono">{po.currency} {po.amount.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <Badge tone={po.status === 'closed' ? 'success' : po.status === 'draft' ? 'neutral' : 'warning'}>
                        {po.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right text-neutral-500">{formatDate(po.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="pt-8 border-t border-ink-700">
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
