"use client";

import { useState, useMemo } from "react";
import { Plus, Search, CalendarDays, AlertTriangle, FileText, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { formatMoneyFull, formatDate } from "@/lib/format";
import { Supplier, RateSheet } from "@/lib/types";
import { RateSheetModal } from "@/components/modals/RateSheetModal";

export default function RatesManagementPage() {
  const hydrated = useIsHydrated();
  const suppliers = useStore((s) => s.suppliers);
  const rateSheets = useStore((s) => s.rateSheets);
  const currency = useStore((s) => s.settings.currency);

  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState<RateSheet | undefined>();
  const [activeSupplierId, setActiveSupplierId] = useState<string | undefined>();

  const activeSuppliers = useMemo(() => {
    let list = suppliers; // Show all suppliers (including pending) so they can have rate sheets added
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }
    return list;
  }, [suppliers, query]);

  // Group rate sheets by supplier ID
  const ratesBySupplier = useMemo(() => {
    const map = new Map<string, RateSheet[]>();
    rateSheets.forEach(r => {
      if (!map.has(r.supplierId)) map.set(r.supplierId, []);
      map.get(r.supplierId)!.push(r);
    });
    return map;
  }, [rateSheets]);

  if (!hydrated) return <div className="text-neutral-500 p-2">Loading…</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Rates & Contracts</h1>
          <p className="text-sm text-neutral-400">Manage seasonal rate sheets and supplier contracts</p>
        </div>
        <Button 
          icon={<Plus className="h-4 w-4" />} 
          variant="primary"
          onClick={() => {
            setEditingSheet(undefined);
            setActiveSupplierId(undefined);
            setModalOpen(true);
          }}
        >
          New Rate Sheet
        </Button>
      </div>

      {/* Contract Alerts */}
      <Card padding={false} className="border-warning-500/30 overflow-hidden">
        <div className="bg-warning-500/10 px-5 py-4 border-b border-warning-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning-500" />
            <h2 className="text-sm font-semibold text-warning-400">Expiring Contracts</h2>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm text-neutral-300">
            No contracts are expiring in the next 30 days. You're all caught up!
          </p>
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="search"
            placeholder="Search suppliers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-900 pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent-500/60"
          />
        </div>
      </div>

      <div className="space-y-4">
        {activeSuppliers.length === 0 ? (
          <Card>
            <p className="text-sm text-neutral-500 text-center py-4">No suppliers found.</p>
          </Card>
        ) : (
          activeSuppliers.map((supplier) => (
            <SupplierRateBlock 
              key={supplier.id} 
              supplier={supplier} 
              rateSheets={ratesBySupplier.get(supplier.id) || []} 
              currency={currency}
              onAddRate={() => {
                setEditingSheet(undefined);
                setActiveSupplierId(supplier.id);
                setModalOpen(true);
              }}
              onEditRate={(rs) => {
                setEditingSheet(rs);
                setActiveSupplierId(supplier.id);
                setModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {modalOpen && (
        <RateSheetModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingSheet(undefined);
            setActiveSupplierId(undefined);
          }}
          initialData={editingSheet}
          supplierId={activeSupplierId}
        />
      )}
    </div>
  );
}

function SupplierRateBlock({ supplier, rateSheets, currency, onAddRate, onEditRate }: { supplier: Supplier, rateSheets: RateSheet[], currency: string, onAddRate: () => void, onEditRate: (rs: RateSheet) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card padding={false} className="overflow-hidden">
      <div 
        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-ink-850/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <button className="text-neutral-500 hover:text-white transition-colors">
            <ChevronDown className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          <div>
            <h3 className="font-semibold text-white">{supplier.name}</h3>
            <p className="text-xs text-neutral-400 capitalize">{supplier.type} • {supplier.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-neutral-500 mb-0.5">Active Rates</p>
            <Badge tone={rateSheets.length > 0 ? "success" : "neutral"}>
              {rateSheets.length} Sheet{rateSheets.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="text-right w-32">
            <p className="text-xs text-neutral-500 mb-0.5">Contract Expires</p>
            <p className="text-sm text-white">{supplier.contractExpires ? formatDate(supplier.contractExpires) : "N/A"}</p>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-ink-700 bg-ink-900/50 p-5">
          {rateSheets.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="h-8 w-8 text-neutral-600 mx-auto mb-3" />
              <p className="text-sm text-neutral-400 mb-4">No seasonal rate sheets found for {supplier.name}.</p>
              <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={onAddRate}>Add First Rate Sheet</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {rateSheets.map((rs) => (
                <div key={rs.id} className="flex items-center justify-between p-3 rounded-lg border border-ink-700 bg-ink-900">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-accent-500 opacity-70" />
                    <div>
                      <p className="text-sm font-semibold text-white">{rs.seasonName}</p>
                      <p className="text-xs text-neutral-400">{formatDate(rs.startDate)} — {formatDate(rs.endDate)}</p>
                    </div>
                  </div>
                  <div className="flex gap-8 items-center">
                    <div>
                      <p className="text-[10px] uppercase text-neutral-500 font-bold mb-1">Resident</p>
                      <p className="text-sm text-white">{formatMoneyFull(rs.residentRate, "KES")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-neutral-500 font-bold mb-1">Non-Resident</p>
                      <p className="text-sm text-white">{formatMoneyFull(rs.nonResidentRateUsd, "USD")}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => onEditRate(rs)}>Edit</Button>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={onAddRate}>Add Season</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
