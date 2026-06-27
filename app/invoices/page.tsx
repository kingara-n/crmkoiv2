"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Filter, FileText, CheckCircle2, Clock, AlertTriangle, DollarSign, AlertCircle, Calendar, ShoppingCart, Building2 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useStore, useSettings } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { InvoiceModal } from "@/components/modals/InvoiceModal";
import { PurchaseOrderModal } from "@/components/modals/PurchaseOrderModal";
import { formatMoneyFull, formatDate } from "@/lib/format";
import { SupplierType } from "@/lib/types";

const TYPE_LABELS: Record<SupplierType, string> = {
  hotel: "Hotel",
  camp: "Camp / Lodge",
  transport: "Transport",
  dmc: "DMC",
  airline: "Airline",
};

export default function FinancialsPage() {
  const hydrated = useIsHydrated();
  const invoices = useStore((s) => s.invoices);
  const bookings = useStore((s) => s.bookings);
  const approvals = useStore((s) => s.invoiceEditApprovals);
  
  const suppliers = useStore((s) => s.suppliers);
  const purchaseOrders = useStore((s) => s.purchaseOrders);
  
  const settings = useSettings();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [poModalOpen, setPoModalOpen] = useState(false);

  const filteredInvoices = useMemo(() => {
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

  const paidByCurrency: Record<string, number> = {};
  const unpaidByCurrency: Record<string, number> = {};
  
  invoices.forEach(inv => {
    const cur = inv.currency || "KES";
    if (inv.paidAt) {
      paidByCurrency[cur] = (paidByCurrency[cur] || 0) + (inv.amountKes || 0);
    } else {
      unpaidByCurrency[cur] = (unpaidByCurrency[cur] || 0) + (inv.amountKes || 0);
    }
  });

  const pendingApprovalsCount = approvals.filter(a => a.approverId === "pending").length;

  // Purchasing logic
  const totalSpendKes = purchaseOrders.reduce((sum, po) => sum + (po.amount * (po.currency === 'KES' ? 1 : po.currency === 'USD' ? 130 : 140)), 0);
  
  const spendByCategory: Record<string, number> = {};
  purchaseOrders.forEach(po => {
    const s = suppliers.find(sup => sup.id === po.supplierId);
    const cat = s ? TYPE_LABELS[s.type] : "Other";
    spendByCategory[cat] = (spendByCategory[cat] || 0) + po.amount;
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
    <div className="space-y-8 pt-4 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Financials</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage accounts receivable, payables, and approvals.</p>
        </div>
        <div className="flex gap-3">
          <Button icon={<ShoppingCart className="h-4 w-4" />} onClick={() => setPoModalOpen(true)}>
            Create PO
          </Button>
        </div>
      </div>

      <div className="pt-2">
        <h2 className="text-lg font-semibold text-white mb-4">Accounts Receivable</h2>
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-success-500" />
              <h3 className="text-sm font-medium text-neutral-400">Total Paid</h3>
            </div>
            <div className="space-y-1">
              {Object.keys(paidByCurrency).length === 0 && <div className="text-xl font-bold text-white">0</div>}
              {Object.entries(paidByCurrency).map(([cur, val]) => (
                <div key={cur} className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">{cur}</span>
                  <span className="font-semibold text-white font-mono">{formatMoneyFull(val, cur as any)}</span>
                </div>
              ))}
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-medium text-neutral-400">Total Outstanding</h3>
            </div>
            <div className="space-y-1">
              {Object.keys(unpaidByCurrency).length === 0 && <div className="text-xl font-bold text-white">0</div>}
              {Object.entries(unpaidByCurrency).map(([cur, val]) => (
                <div key={cur} className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">{cur}</span>
                  <span className="font-semibold text-white font-mono">{formatMoneyFull(val, cur as any)}</span>
                </div>
              ))}
            </div>
          </Card>
          
          <StatCard label="Pending Approvals" value={String(pendingApprovalsCount)} icon={<AlertTriangle className="h-4 w-4 text-red-400" />} />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
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
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-neutral-500">
                      No invoices found.
                    </td>
                  </tr>
                )}
                {filteredInvoices.map((inv) => (
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
                      <div className="font-mono text-white">{formatMoneyFull(inv.amountKes, inv.currency || "KES")}</div>
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
      </div>

      {/* Purchasing Section */}
      <div className="pt-8 border-t border-ink-700">
        <h2 className="text-lg font-semibold text-white mb-4">Accounts Payable & Purchasing</h2>
        
        <div className="grid gap-4 lg:grid-cols-3 mb-4">
          <StatCard label="Total Spend (est. KES)" value={`KSh ${(totalSpendKes / 1000).toFixed(1)}k`} icon={<DollarSign className="h-4 w-4" />} />
          <StatCard label="Active POs" value={String(purchaseOrders.filter(po => po.status !== 'closed').length)} icon={<FileText className="h-4 w-4" />} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3 mb-6">
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

      {selectedBookingId && (
        <InvoiceModal
          open={!!selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          bookingId={selectedBookingId}
        />
      )}
      <PurchaseOrderModal open={poModalOpen} onClose={() => setPoModalOpen(false)} />
    </div>
  );
}
