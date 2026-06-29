"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

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
  const settings = useStore((s) => s.settings);

  const [clientId, setClientId] = useState(initialClientId || "");
  const [docType, setDocType] = useState("passport");
  const [filename, setFilename] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleRealUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !file) return;

    setIsUploading(true);

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `client-${clientId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // 3. Save to database
      await addClientDocument({
        clientId,
        filename: file.name,
        docType,
        storageUrl: publicUrlData.publicUrl,
        uploadedBy: `${settings.firstName} ${settings.lastName}`.trim() || 'Unknown User',
      });

      setIsUploading(false);
      onClose();
    } catch (error: any) {
      console.error("Upload failed", error);
      alert(`Upload/Save failed: ${error?.message || "Make sure the 'documents' storage bucket exists and is public."}`);
      setIsUploading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Upload Document">
      <form onSubmit={handleRealUpload} className="space-y-4">
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
            <optgroup label="Travel & Identification">
              <option value="passport">Passports</option>
              <option value="visa">Visas</option>
              <option value="national_id">National IDs</option>
              <option value="health_certificate">Health Certificates</option>
            </optgroup>
            <optgroup label="Booking & Confirmation">
              <option value="e_ticket">E-Tickets</option>
              <option value="accommodation_voucher">Accommodation Vouchers</option>
              <option value="tour_voucher">Tour Vouchers</option>
              <option value="car_rental">Car Rental Agreements</option>
            </optgroup>
            <optgroup label="Financial & Administrative">
              <option value="itinerary">Itineraries</option>
              <option value="invoice_receipt">Invoices & Receipts</option>
              <option value="insurance">Travel Insurance Policies</option>
            </optgroup>
            <optgroup label="Custom Forms">
              <option value="invitation_letter">Letters of Invitation</option>
              <option value="visa_form">Visa Application Forms</option>
              <option value="agency_letter">Travel Agency Letters</option>
            </optgroup>
            <optgroup label="Operations">
              <option value="terms">Terms and Conditions</option>
              <option value="vendor_contract">Vendor Contracts</option>
            </optgroup>
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
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFile(e.target.files[0]);
                        setFilename(e.target.files[0].name);
                      }
                    }}
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
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFile(e.target.files[0]);
                        setFilename(e.target.files[0].name);
                      }
                    }}
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
