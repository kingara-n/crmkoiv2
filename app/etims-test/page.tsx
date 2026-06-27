"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QrCode, FileText, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { formatMoney } from "@/lib/format";

export default function ETimsTestPage() {
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    receiptNo: string;
    controlCode: string;
    date: string;
  } | null>(null);

  // Mock Invoice Data
  const mockInvoice = {
    number: "INV-2026-089",
    client: "Acme Corp Ltd.",
    pin: "P123456789A",
    subtotal: 50000,
    vat: 8000, // 16%
    total: 58000,
  };

  const handleSync = async () => {
    setLoading(true);
    // Simulate KRA API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setReceiptData({
      receiptNo: "KRA-" + Math.floor(100000 + Math.random() * 900000),
      controlCode: "A1B2-C3D4-E5F6-G7H8",
      date: new Date().toLocaleString(),
    });
    setSynced(true);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-4">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="h-6 w-6 text-accent-500" />
        <div>
          <h1 className="text-2xl font-semibold text-white">eTIMS Sandbox</h1>
          <p className="text-neutral-400 text-sm">Preview the KRA eTIMS invoice synchronization workflow.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Invoice Data */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-ink-700">
            <FileText className="h-5 w-5 text-neutral-400" />
            <h2 className="font-medium text-white">Approved Invoice</h2>
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
                <span className="text-neutral-300">{formatMoney(mockInvoice.subtotal, "KES")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">VAT (16%)</span>
                <span className="text-neutral-300">{formatMoney(mockInvoice.vat, "KES")}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t border-ink-800 text-base">
                <span className="text-white">Total</span>
                <span className="text-white">{formatMoney(mockInvoice.total, "KES")}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Right: KRA Result */}
        <Card className={synced ? "border-accent-500/30 bg-accent-500/5" : "border-dashed border-ink-700 bg-ink-900/50"}>
          <div className="h-full flex flex-col justify-center">
            {!synced && !loading && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-ink-800 flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Ready for eTIMS</h3>
                  <p className="text-neutral-500 text-sm mt-1 px-4">Transmit this invoice to the KRA portal to receive a valid fiscal receipt number.</p>
                </div>
                <button
                  onClick={handleSync}
                  className="bg-accent-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-400 transition-colors"
                >
                  Sync to eTIMS
                </button>
              </div>
            )}

            {loading && (
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-accent-500 mx-auto" />
                <p className="text-neutral-400 text-sm animate-pulse">Transmitting secure payload to KRA API...</p>
              </div>
            )}

            {synced && receiptData && (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2 text-accent-500">
                  <CheckCircle2 className="h-6 w-6" />
                  <h3 className="font-semibold text-lg">Successfully Synced</h3>
                </div>

                <div className="bg-ink-950 rounded-lg p-4 font-mono text-sm space-y-3">
                  <div>
                    <div className="text-neutral-500 text-xs uppercase mb-1">eTIMS Receipt No.</div>
                    <div className="text-white">{receiptData.receiptNo}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-xs uppercase mb-1">Control Code</div>
                    <div className="text-white text-xs break-all">{receiptData.controlCode}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-xs uppercase mb-1">Timestamp</div>
                    <div className="text-white">{receiptData.date}</div>
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
  );
}
