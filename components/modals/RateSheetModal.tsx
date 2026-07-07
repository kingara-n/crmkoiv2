"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { RateSheet } from "@/lib/types";

export function RateSheetModal({
  open,
  onClose,
  initialData,
  supplierId,
}: {
  open: boolean;
  onClose: () => void;
  initialData?: RateSheet;
  supplierId?: string;
}) {
  const addRateSheet = useStore((s) => s.addRateSheet);
  const updateRateSheet = useStore((s) => s.updateRateSheet);
  const suppliers = useStore((s) => s.suppliers.filter(sup => sup.status === "approved"));

  const [formData, setFormData] = useState<Partial<RateSheet>>(
    initialData || {
      supplierId: supplierId || (suppliers[0]?.id || ""),
      seasonName: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      residentRate: 0,
      nonResidentRateUsd: 0,
      currency: "KES",
      notes: "",
    }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.supplierId || !formData.seasonName || !formData.startDate || !formData.endDate) return;

    if (initialData) {
      await updateRateSheet(initialData.id, formData);
    } else {
      await addRateSheet(formData as any);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={initialData ? "Edit Rate Sheet" : "New Rate Sheet"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Supplier</label>
          <select
            value={formData.supplierId}
            onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
            className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
            required
            disabled={!!initialData || !!supplierId}
          >
            <option value="">Select Supplier...</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Season Name</label>
          <input
            type="text"
            placeholder="e.g. High Season 2026"
            value={formData.seasonName}
            onChange={(e) => setFormData({ ...formData, seasonName: e.target.value })}
            className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Resident Rate (KES)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.residentRate}
              onChange={(e) => setFormData({ ...formData, residentRate: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Non-Resident Rate (USD)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.nonResidentRateUsd}
              onChange={(e) => setFormData({ ...formData, nonResidentRateUsd: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Notes (Optional)</label>
          <textarea
            value={formData.notes || ""}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-accent-500 h-24 resize-none"
            placeholder="Contract terms, inclusions, etc."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-ink-700">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {initialData ? "Save Changes" : "Create Rate Sheet"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
