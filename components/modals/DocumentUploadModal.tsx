"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { useStore } from "@/lib/store";

export function DocumentUploadModal({
  open,
  onClose,
  clientId: initialClientId,
  bookingId: initialBookingId,
}: {
  open: boolean;
  onClose: () => void;
  clientId?: string;
  bookingId?: string;
}) {
  const clients = useStore((s) => s.clients);
  const bookings = useStore((s) => s.bookings);
  const addClientDocument = useStore((s) => s.addClientDocument);

  const [clientId, setClientId] = useState(initialClientId || "");
  const [docType, setDocType] = useState("passport");
  const [filename, setFilename] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Derive booking ID if it's tied strictly to a booking
  // For now, we link docs purely to clients, but docType determines if it satisfies booking rules.

  async function handleSimulatedUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !filename) return;

    setIsUploading(true);

    // Simulate upload delay
    await new Promise((r) => setTimeout(r, 1000));

    await addClientDocument({
      clientId,
      filename,
      docType,
      storageUrl: `https://mockstorage.com/${filename.replace(/\s+/g, "_")}`,
    });

    setIsUploading(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Upload Document">
      <form onSubmit={handleSimulatedUpload} className="space-y-4">
        <div>
          <Label>Client</Label>
          <Select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
            <option value="">Select a client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Document Type</Label>
          <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
            <option value="passport">Passport</option>
            <option value="payment_receipt">Payment Receipt</option>
            <option value="contract">Signed Contract</option>
            <option value="flight_ticket">Flight Ticket</option>
            <option value="other">Other</option>
          </Select>
        </div>

        <div>
          <Label>Select File</Label>
          <div className="mt-1 flex justify-center rounded-lg border border-dashed border-ink-700 px-6 py-8 hover:bg-ink-900 transition-colors cursor-pointer relative">
            <div className="text-center">
              <div className="mt-4 flex text-sm leading-6 text-neutral-400 justify-center">
                <label className="relative cursor-pointer rounded-md font-semibold text-accent-500 focus-within:outline-none hover:text-accent-400">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setFilename(e.target.files?.[0]?.name || "")}
                    required
                  />
                </label>
              </div>
              <p className="text-xs leading-5 text-neutral-500">PDF, PNG, JPG up to 10MB</p>
            </div>
            {filename && (
              <div className="absolute inset-0 bg-ink-900 flex items-center justify-center rounded-lg border border-accent-500">
                <p className="text-accent-400 font-medium">Selected: {filename}</p>
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setFilename(e.target.files?.[0]?.name || "")}
                  />
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload Document"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
