"use client";

import { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label } from "@/components/ui/Field";
import { useStore } from "@/lib/store";
import { Currency } from "@/lib/types";

export function InvoiceModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const addInvoice = useStore((s) => s.addInvoice);
  const clients = useStore((s) => s.clients);

  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("KES");
  const [description, setDescription] = useState("");
  const [number, setNumber] = useState(`INV-${Math.floor(Math.random() * 10000)}`);

  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleSaveAndGenerate = async () => {
    if (!clientId || !amount) return;
    
    const client = clients.find(c => c.id === clientId);
    
    // Add to DB
    await addInvoice({
      bookingId: undefined, // standalone invoice
      clientId,
      number,
      amountKes: Number(amount),
      currency,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    });

    // Generate PDF
    if (invoiceRef.current) {
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin:       1,
        filename:     `invoice-${client?.name?.replace(/\s+/g, '-') || 'download'}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter' as const, orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(invoiceRef.current).save();
    }

    onClose();
  };

  return (
    <Modal
      size="xl"
      open={open}
      onClose={onClose}
      title="Create Invoice"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSaveAndGenerate}>Save & Download PDF</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Form Side */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="client">Client</Label>
            <Select id="client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="desc">Description</Label>
            <Input
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Deposit for Safari"
            />
          </div>
          <div className="grid grid-cols-[1fr_2fr] gap-3">
            <div>
              <Label htmlFor="curr">Currency</Label>
              <Select id="curr" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
                <option value="KES">KES</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="amt">Amount</Label>
              <Input
                id="amt"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Live Preview Side */}
        <div className="rounded-lg overflow-y-auto max-h-[60vh] border border-ink-700 bg-ink-900/50 p-2">
          <p className="text-xs text-neutral-500 mb-2 font-medium px-2 uppercase tracking-wider">Live PDF Preview</p>
          <div className="bg-white text-black p-6 rounded shadow-sm">
            <div ref={invoiceRef}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>INVOICE {number}</h1>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <div>
                  <p style={{ fontWeight: 'bold' }}>Koi Travel CRM</p>
                  <p>123 Safari Way, Nairobi</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 'bold' }}>Billed To:</p>
                  <p>{clients.find(c => c.id === clientId)?.name || "Select Client"}</p>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Description</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{description || 'Services Rendered'}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{currency} {Number(amount).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '18px' }}>
                Total: {currency} {Number(amount).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
