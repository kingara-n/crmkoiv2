"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Filter,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Banknote,
  AlertCircle,
  Calendar,
  ShoppingCart,
  Building2,
  ShieldCheck,
  ArrowRight,
  Loader2,
  QrCode,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useStore, useSettings } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { InvoiceModal } from "@/components/modals/InvoiceModal";
import { PurchaseOrderModal } from "@/components/modals/PurchaseOrderModal";
import { BookingInvoiceModal } from "@/components/modals/BookingInvoiceModal";
import { formatMoneyFull, formatDate } from "@/lib/format";
import { SupplierType } from "@/lib/types";

const TYPE_LABELS: Record<SupplierType, string> = {
  hotel: "Hotel",
  camp: "Camp / Lodge",
  transport: "Transport",
  dmc: "DMC",
  airline: "Airline",
  cruise_line: "Cruise Line",
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
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">(
    "all",
  );
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  // eTims State
  const [etimsLoading, setEtimsLoading] = useState(false);
  const [etimsSynced, setEtimsSynced] = useState(false);
  const [etimsReceiptData, setEtimsReceiptData] = useState<{
    receiptNo: string;
    controlCode: string;
    date: string;
  } | null>(null);

  const mockInvoice = {
    number: "INV-2026-089",
    client: "Acme Corp Ltd.",
    pin: "P123456789A",
    subtotal: 50000,
    vat: 8000,
    total: 58000,
  };

  const handleSyncETims = async () => {
    setEtimsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setEtimsReceiptData({
      receiptNo: "KRA-" + Math.floor(100000 + Math.random() * 900000),
      controlCode: "A1B2-C3D4-E5F6-G7H8",
      date: new Date().toLocaleString(),
    });
    setEtimsSynced(true);
    setEtimsLoading(false);
  };

  const filteredInvoices = useMemo(() => {
    let rows = invoices.map((inv) => {
      const booking = bookings.find((b) => b.id === inv.bookingId);
      const invApprovals = approvals.filter((a) => a.invoiceId === inv.id);
      return {
        ...inv,
        booking,
        pendingEdits: invApprovals.filter((a) => a.approverId === "pending"),
      };
    });

    if (statusFilter !== "all") {
      rows = rows.filter((inv) =>
        statusFilter === "paid" ? !!inv.paidAt : !inv.paidAt,
      );
    }
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (inv) =>
          inv.number.toLowerCase().includes(q) ||
          (inv.booking?.clientName?.toLowerCase() || "").includes(q),
      );
    }
    return rows;
  }, [invoices, bookings, approvals, statusFilter, query]);

  const paidByCurrency: Record<string, number> = {};
  const unpaidByCurrency: Record<string, number> = {};

  invoices.forEach((inv) => {
    const cur = inv.currency || "KES";
    if (inv.paidAt) {
      paidByCurrency[cur] = (paidByCurrency[cur] || 0) + (inv.amountKes || 0);
    } else {
      unpaidByCurrency[cur] =
        (unpaidByCurrency[cur] || 0) + (inv.amountKes || 0);
    }
  });

  const pendingApprovalsCount = approvals.filter(
    (a) => a.approverId === "pending",
  ).length;

  // Purchasing logic
  const totalSpendKes = purchaseOrders.reduce(
    (sum, po) =>
      sum +
      po.amount *
        (po.currency === "KES" ? 1 : po.currency === "USD" ? 130 : 140),
    0,
  );

  const spendByCategory: Record<string, number> = {};
  purchaseOrders.forEach((po) => {
    const s = suppliers.find((sup) => sup.id === po.supplierId);
    const cat = s ? TYPE_LABELS[s.type] : "Other";
    spendByCategory[cat] = (spendByCategory[cat] || 0) + po.amount;
  });

  const payablesByCurrency: Record<string, number> = {};
  purchaseOrders
    .filter((po) => po.status !== "closed")
    .forEach((po) => {
      payablesByCurrency[po.currency] =
        (payablesByCurrency[po.currency] || 0) + po.amount;
    });

  const topSuppliers = [...suppliers]
    .map((s) => {
      const spend = purchaseOrders
        .filter((po) => po.supplierId === s.id)
        .reduce((sum, po) => sum + po.amount, 0);
      return { ...s, spend };
    })
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5);

  if (!hydrated) return <div className="text-neutral-500 p-2">Loading…</div>;

  return (
    <div className="space-y-8 pt-4 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Accounts</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage accounts receivable, payables, refunds, and eTIMS.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={<FileText className="h-4 w-4" />}
            onClick={() => setInvoiceModalOpen(true)}
          >
            New Invoice
          </Button>
          <Button
            icon={<ShoppingCart className="h-4 w-4" />}
            onClick={() => setPoModalOpen(true)}
          >
            Create PO
          </Button>
        </div>
      </div>

      <div className="pt-2">
        <h2 className="text-lg font-semibold text-white mb-4">
          Accounts Receivable
        </h2>
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-success-500" />
              <h3 className="text-sm font-medium text-neutral-400">
                Total Paid
              </h3>
            </div>
            <div className="space-y-1">
              {Object.keys(paidByCurrency).length === 0 && (
                <div className="text-3xl font-semibold tracking-tight text-white">0</div>
              )}
              {Object.entries(paidByCurrency).map(([cur, val]) => (
                <div
                  key={cur}
                  className="flex justify-between items-end"
                >
                  <span className="text-sm font-medium text-neutral-500 mb-1">{cur}</span>
                  <span className="text-3xl font-semibold tracking-tight text-white">
                    {formatMoneyFull(val, cur as any)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-medium text-neutral-400">
                Total Outstanding
              </h3>
            </div>
            <div className="space-y-1">
              {Object.keys(unpaidByCurrency).length === 0 && (
                <div className="text-3xl font-semibold tracking-tight text-white">0</div>
              )}
              {Object.entries(unpaidByCurrency).map(([cur, val]) => (
                <div
                  key={cur}
                  className="flex justify-between items-end"
                >
                  <span className="text-sm font-medium text-neutral-500 mb-1">{cur}</span>
                  <span className="text-3xl font-semibold tracking-tight text-white">
                    {formatMoneyFull(val, cur as any)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <StatCard
            label="Pending Approvals"
            value={String(pendingApprovalsCount)}
            icon={<AlertTriangle className="h-4 w-4 text-red-400" />}
          />
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
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("unpaid")}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${statusFilter === "unpaid" ? "bg-accent-500 text-black font-medium" : "border border-ink-700 bg-ink-900 text-neutral-300 hover:bg-ink-850"}`}
            >
              Unpaid
            </button>
            <button
              onClick={() => setStatusFilter("paid")}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${statusFilter === "paid" ? "bg-accent-500 text-black font-medium" : "border border-ink-700 bg-ink-900 text-neutral-300 hover:bg-ink-850"}`}
            >
              Paid
            </button>
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
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-sm text-neutral-500"
                    >
                      No invoices found.
                    </td>
                  </tr>
                )}
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-ink-700 last:border-0 hover:bg-ink-850/40"
                  >
                    <td className="px-5 py-4 font-medium text-white flex items-center gap-2">
                      <FileText className="h-4 w-4 text-neutral-400" />
                      {inv.number}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-white">
                        {inv.booking?.clientName || "Unknown"}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {inv.booking?.destination || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-white">
                        {formatMoneyFull(inv.amountKes, inv.currency || "KES")}
                      </div>
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
                      <Button
                        variant="secondary"
                        className="text-xs py-1"
                        onClick={() => setSelectedBookingId(inv.bookingId)}
                      >
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

      {/* Refunds Section */}
      <div className="pt-8 border-t border-ink-700">
        <h2 className="text-lg font-semibold text-white mb-4">Refunds</h2>
        <div className="grid gap-4 lg:grid-cols-3 mb-6">
          <StatCard
            label="Total Refunds Issued"
            value="KES 0"
            icon={<Banknote className="h-4 w-4 text-red-400" />}
          />
        </div>
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-ink-700 text-xs uppercase text-neutral-500">
                  <th className="px-5 py-3 font-medium">Refund ID</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-neutral-500">
                    No active refunds.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Purchasing Section */}
      <div className="pt-8 border-t border-ink-700">
        <h2 className="text-lg font-semibold text-white mb-4">
          Accounts Payable & Purchasing
        </h2>

        <div className="grid gap-4 lg:grid-cols-3 mb-4">
          <StatCard
            label="Total Spend (est. KES)"
            value={`KSh ${(totalSpendKes / 1000).toFixed(1)}k`}
            icon={<Banknote className="h-4 w-4" />}
          />
          <StatCard
            label="Active Purchase Orders"
            value={String(
              purchaseOrders.filter((po) => po.status !== "closed").length,
            )}
            icon={<FileText className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2 mb-6">
          {/* Spend by Category */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">
                Spend by Category
              </h3>
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
                      data={Object.entries(spendByCategory).map(
                        ([name, value]) => ({ name, value }),
                      )}
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {Object.keys(spendByCategory).map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              "#38bdf8",
                              "#818cf8",
                              "#34d399",
                              "#fbbf24",
                              "#f87171",
                            ][index % 5]
                          }
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#1e1e24",
                        border: "1px solid #2d2d35",
                        borderRadius: "0.5rem",
                      }}
                      itemStyle={{ color: "#fff", fontSize: "0.875rem" }}
                      formatter={(value: number) => value.toLocaleString()}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-2 mt-4">
              {Object.entries(spendByCategory).map(([cat, val], i) => (
                <div
                  key={cat}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: [
                          "#38bdf8",
                          "#818cf8",
                          "#34d399",
                          "#fbbf24",
                          "#f87171",
                        ][i % 5],
                      }}
                    />
                    <span className="text-neutral-400">{cat}</span>
                  </div>
                  <span className="text-white">
                    {val.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Payables by Currency */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white">
                Payables by Currency
              </h3>
              <Banknote className="h-4 w-4 text-neutral-500" />
            </div>
            <div className="space-y-3">
              {Object.entries(payablesByCurrency).map(([cur, val]) => (
                <div
                  key={cur}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-neutral-400">{cur}</span>
                  <span className="text-white">
                    {formatMoneyFull(val, cur as any)}
                  </span>
                </div>
              ))}
              {Object.keys(payablesByCurrency).length === 0 && (
                <span className="text-sm text-neutral-500">
                  No active payables.
                </span>
              )}
            </div>
          </Card>
        </div>

        <Card padding={false} className="mb-6">
          <div className="p-4 border-b border-ink-700">
            <h3 className="font-semibold text-white">Active Purchase Orders</h3>
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
                    <td colSpan={5} className="px-5 py-10 text-center text-neutral-500">
                      No POs generated yet.
                    </td>
                  </tr>
                )}
                {purchaseOrders.slice(0, 5).map((po) => (
                  <tr key={po.id} className="border-b border-ink-700 last:border-0 hover:bg-ink-850/40">
                    <td className="px-5 py-4 font-medium text-white">{po.poNumber}</td>
                    <td className="px-5 py-4 text-neutral-300">{po.supplierName}</td>
                    <td className="px-5 py-4 text-white">
                      {po.currency} {po.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        tone={
                          po.status === "closed"
                            ? "success"
                            : po.status === "draft"
                              ? "neutral"
                              : "warning"
                        }
                      >
                        {po.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right text-neutral-500">
                      {formatDate(po.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Suppliers Table Format */}
        <Card padding={false} className="mb-6">
          <div className="p-4 border-b border-ink-700">
            <h3 className="font-semibold text-white">Top Suppliers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-ink-700 text-xs uppercase text-neutral-500">
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">City/Country</th>
                  <th className="px-5 py-3 font-medium text-right">Total Spend (KES)</th>
                </tr>
              </thead>
              <tbody>
                {topSuppliers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-neutral-500">
                      No suppliers with spend recorded.
                    </td>
                  </tr>
                )}
                {topSuppliers.map((s) => (
                  <tr key={s.id} className="border-b border-ink-700 last:border-0 hover:bg-ink-850/40">
                    <td className="px-5 py-4 font-medium text-white">{s.name}</td>
                    <td className="px-5 py-4 text-neutral-300">{TYPE_LABELS[s.type]}</td>
                    <td className="px-5 py-4 text-neutral-300">{s.city}, {s.country}</td>
                    <td className="px-5 py-4 text-right text-white">
                      {s.spend > 0 ? s.spend.toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Commissions Tracker */}
        <div className="pt-8 border-t border-ink-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            Commissions Tracker
          </h2>
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-ink-700 text-xs uppercase text-neutral-500">
                    <th className="px-5 py-3 font-medium">Booking Ref</th>
                    <th className="px-5 py-3 font-medium">Supplier</th>
                    <th className="px-5 py-3 font-medium">Total Value</th>
                    <th className="px-5 py-3 font-medium">Comm. %</th>
                    <th className="px-5 py-3 font-medium">Expected</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-neutral-500">
                      No commission data available yet. Configure booking costs to track expected commissions.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>

      {/* eTIMS Sandbox Section */}
      <div className="pt-8 border-t border-ink-700">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="h-6 w-6 text-accent-500" />
          <div>
            <h2 className="text-lg font-semibold text-white">eTIMS Sandbox</h2>
            <p className="text-neutral-400 text-sm">Preview the KRA eTIMS invoice synchronization workflow.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Invoice Data */}
          <Card>
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-ink-700">
              <FileText className="h-5 w-5 text-neutral-400" />
              <h3 className="font-medium text-white">Approved Invoice</h3>
              <div className="ml-auto">
                <Badge tone="success">Active</Badge>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Invoice No</span>
                <span className="text-white font-medium">{mockInvoice.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Client</span>
                <span className="text-white">{mockInvoice.client}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Client PIN</span>
                <span className="text-white font-mono">{mockInvoice.pin}</span>
              </div>
              
              <div className="pt-4 mt-4 border-t border-ink-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="text-neutral-300">KES {mockInvoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">VAT (16%)</span>
                  <span className="text-neutral-300">KES {mockInvoice.vat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t border-ink-800 text-base">
                  <span className="text-white">Total</span>
                  <span className="text-white">KES {mockInvoice.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Right: KRA Result */}
          <Card className={etimsSynced ? "border-accent-500/30 bg-accent-500/5" : "border-dashed border-ink-700 bg-ink-900/50"}>
            <div className="h-full flex flex-col justify-center">
              {!etimsSynced && !etimsLoading && (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-ink-800 flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-neutral-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Ready for eTIMS</h4>
                    <p className="text-neutral-500 text-sm mt-1 px-4">Transmit this invoice to the KRA portal to receive a valid fiscal receipt number.</p>
                  </div>
                  <button
                    onClick={handleSyncETims}
                    className="bg-accent-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-400 transition-colors"
                  >
                    Sync to eTIMS
                  </button>
                </div>
              )}

              {etimsLoading && (
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-accent-500 mx-auto" />
                  <p className="text-neutral-400 text-sm animate-pulse">Transmitting secure payload to KRA API...</p>
                </div>
              )}

              {etimsSynced && etimsReceiptData && (
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-2 text-accent-500">
                    <CheckCircle2 className="h-6 w-6" />
                    <h4 className="font-semibold text-lg">Successfully Synced</h4>
                  </div>

                  <div className="bg-ink-950 rounded-lg p-4 font-mono text-sm space-y-3">
                    <div>
                      <div className="text-neutral-500 text-xs uppercase mb-1">eTIMS Receipt No.</div>
                      <div className="text-white">{etimsReceiptData.receiptNo}</div>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-xs uppercase mb-1">Control Code</div>
                      <div className="text-white text-xs break-all">{etimsReceiptData.controlCode}</div>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-xs uppercase mb-1">Timestamp</div>
                      <div className="text-white">{etimsReceiptData.date}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 text-neutral-400">
                    <QrCode className="h-16 w-16 opacity-50" />
                    <div className="text-xs">
                      <p>A QR Code is generated for the PDF.</p>
                      <p>This invoice is now legally compliant.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {selectedBookingId && (
        <BookingInvoiceModal
          open={!!selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          bookingId={selectedBookingId}
        />
      )}
      <PurchaseOrderModal
        open={poModalOpen}
        onClose={() => setPoModalOpen(false)}
      />
      <InvoiceModal
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
      />
    </div>
  );
}
