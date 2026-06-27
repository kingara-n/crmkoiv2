"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { useStore, useSettings } from "@/lib/store";
import { Currency } from "@/lib/types";

export function PurchaseOrderModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const suppliers = useStore((s) => s.suppliers);
  const bookings = useStore((s) => s.bookings);
  const addPurchaseOrder = useStore((s) => s.addPurchaseOrder);
  const settings = useSettings();

  const [supplierId, setSupplierId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>(settings.currency);
  const [linkedBookingId, setLinkedBookingId] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supplierId || !amount) return;

    const supplier = suppliers.find(s => s.id === supplierId);
    
    addPurchaseOrder({
      poNumber: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierId,
      supplierName: supplier?.name || "Unknown Supplier",
      linkedBookingId: linkedBookingId || undefined,
      amount: Number(amount),
      currency,
      status: "draft",
    });

    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Purchase Order"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Supplier</Label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
            required
          >
            <option value="">Select Supplier...</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <Label>Link to Booking (Optional)</Label>
          <select
            value={linkedBookingId}
            onChange={(e) => setLinkedBookingId(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
          >
            <option value="">No booking linked</option>
            {bookings.map(b => (
              <option key={b.id} value={b.id}>{b.clientName} - {b.destination}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <Label>Currency</Label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
            >
              <option value="KES">KES</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-ink-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Create PO
          </Button>
        </div>
      </form>
    </Modal>
  );
}
