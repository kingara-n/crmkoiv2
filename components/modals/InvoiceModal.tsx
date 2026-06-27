"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { useStore, useSettings } from "@/lib/store";
import { Invoice, InvoiceEditApproval, Currency } from "@/lib/types";

export function InvoiceModal({
  open,
  onClose,
  bookingId,
}: {
  open: boolean;
  onClose: () => void;
  bookingId: string;
}) {
  const booking = useStore((s) => s.bookings.find((b) => b.id === bookingId));
  const invoices = useStore((s) => s.invoices.filter((i) => i.bookingId === bookingId));
  const approvals = useStore((s) => s.invoiceEditApprovals);
  
  const addInvoice = useStore((s) => s.addInvoice);
  const proposeInvoiceEdit = useStore((s) => s.proposeInvoiceEdit);
  
  const settings = useSettings();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  if (!booking) return null;

  function handleCreate() {
    setCreating(true);
    setNumber(`INV-${Math.floor(Math.random() * 10000)}`);
    setAmount(booking!.value.toString());
    setDueDate(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  }

  function handleSaveNew() {
    addInvoice({
      bookingId,
      clientId: booking?.clientId,
      number,
      amountKes: Number(amount),
      currency: booking!.currency,
      dueDate,
    });
    setCreating(false);
  }

  function handleProposeEdit() {
    if (!editingId) return;
    // We store the diff. For simplicity in UI, we just propose the new amount/date
    proposeInvoiceEdit({
      invoiceId: editingId,
      requestedBy: "current-user-id", // Note: In real app, get from auth session
      approverId: "pending",
      diffJson: { amountKes: Number(amount), dueDate },
    });
    setEditingId(null);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Invoices for ${booking.clientName}`}
      size="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>Close</Button>
      }
    >
      <div className="space-y-6">
        {invoices.length === 0 && !creating ? (
          <div className="text-center py-6 text-neutral-400">
            No invoices generated yet.
            <div className="mt-4">
              <Button onClick={handleCreate}>Generate Invoice</Button>
            </div>
          </div>
        ) : null}

        {invoices.map((inv) => {
          const invApprovals = approvals.filter(a => a.invoiceId === inv.id);
          const pendingEdits = invApprovals.filter(a => a.approverId === "pending");

          return (
            <div key={inv.id} className="border border-ink-700 rounded-lg p-4 bg-ink-900">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-white">{inv.number}</h4>
                <div className="text-sm font-mono bg-ink-800 px-2 py-1 rounded text-accent-400">
                  {inv.currency} {inv.amountKes.toLocaleString()}
                </div>
              </div>
              <p className="text-xs text-neutral-400">Due: {inv.dueDate || "N/A"}</p>

              {pendingEdits.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-500">
                  <p><strong>Pending Edit Request</strong></p>
                  <p>Requested change: {JSON.stringify(pendingEdits[0].diffJson)}</p>
                  <p className="mt-1">{invApprovals.filter(a => a.approverId !== "pending").length} / 3 Manager Approvals</p>
                  {settings.role === "management" && (
                    <Button size="sm" className="mt-2" onClick={() => alert("Approval logic wired to Supabase trigger.")}>
                      Approve Edit
                    </Button>
                  )}
                </div>
              )}

              {editingId !== inv.id && pendingEdits.length === 0 && (
                <Button size="sm" variant="secondary" className="mt-3" onClick={() => {
                  setEditingId(inv.id);
                  setAmount(inv.amountKes.toString());
                  setDueDate(inv.dueDate || "");
                }}>
                  Propose Edit
                </Button>
              )}

              {editingId === inv.id && (
                <div className="mt-4 space-y-3 p-3 border border-ink-700 rounded bg-ink-950">
                  <h5 className="text-sm font-medium">Propose Change</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Amount</Label>
                      <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" />
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <Input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleProposeEdit}>Submit to Managers</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {creating && (
           <div className="border border-accent-500/30 rounded-lg p-4 bg-accent-500/5 mt-4">
             <h4 className="font-semibold text-white mb-4">New Invoice</h4>
             <div className="grid grid-cols-2 gap-3 mb-4">
               <div>
                 <Label>Invoice Number</Label>
                 <Input value={number} onChange={(e) => setNumber(e.target.value)} />
               </div>
               <div>
                 <Label>Amount</Label>
                 <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" />
               </div>
               <div>
                 <Label>Due Date</Label>
                 <Input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" />
               </div>
             </div>
             <div className="flex gap-2">
               <Button onClick={handleSaveNew}>Save Invoice</Button>
               <Button variant="secondary" onClick={() => setCreating(false)}>Cancel</Button>
             </div>
           </div>
        )}

        {invoices.length > 0 && !creating && (
          <Button variant="secondary" onClick={handleCreate} className="mt-4 w-full">
            Generate Another Invoice
          </Button>
        )}
      </div>
    </Modal>
  );
}
