"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useStore } from "@/lib/store";
import { Transfer, TransferStatus } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  transferId: string | null;
}

export function TransferModal({ open, onClose, transferId }: Props) {
  const transfers = useStore((s) => s.transfers);
  const addTransfer = useStore((s) => s.addTransfer);
  const updateTransfer = useStore((s) => s.updateTransfer);
  
  // For dropdowns
  const clients = useStore((s) => s.clients);
  const suppliers = useStore((s) => s.suppliers).filter((s) => s.type === "transport");

  const isEditing = !!transferId;

  const [clientId, setClientId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [flightTime, setFlightTime] = useState("");
  const [location, setLocation] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [carType, setCarType] = useState("");
  const [regPlate, setRegPlate] = useState("");
  const [status, setStatus] = useState<TransferStatus>("pending");

  useEffect(() => {
    if (open) {
      if (isEditing) {
        const t = transfers.find((x) => x.id === transferId);
        if (t) {
          setClientId(t.clientId || "");
          setSupplierId(t.supplierId || "");
          // Format for datetime-local input
          setFlightTime(t.flightTime ? new Date(t.flightTime).toISOString().slice(0, 16) : "");
          setLocation(t.location);
          setDriverName(t.driverName || "");
          setDriverPhone(t.driverPhone || "");
          setCarType(t.carType || "");
          setRegPlate(t.regPlate || "");
          setStatus(t.status);
        }
      } else {
        setClientId("");
        setSupplierId("");
        setFlightTime("");
        setLocation("");
        setDriverName("");
        setDriverPhone("");
        setCarType("");
        setRegPlate("");
        setStatus("pending");
      }
    }
  }, [open, isEditing, transferId, transfers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !flightTime || !location) return;

    const clientName = clients.find(c => c.id === clientId)?.name || "Unknown";

    const payload = {
      clientId,
      clientName,
      supplierId: supplierId || undefined,
      flightTime: new Date(flightTime).toISOString(),
      location,
      driverName,
      driverPhone,
      carType,
      regPlate,
      status,
    };

    if (isEditing && transferId) {
      await updateTransfer(transferId, payload);
    } else {
      await addTransfer(payload);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Transfer" : "Schedule Transfer"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">Client *</label>
          <select
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
          >
            <option value="">Select client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Flight/Pickup Time *</label>
            <input
              required
              type="datetime-local"
              value={flightTime}
              onChange={(e) => setFlightTime(e.target.value)}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Location *</label>
            <input
              required
              type="text"
              placeholder="e.g. JKIA Terminal 1A"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="border-t border-ink-800 pt-4 mt-2">
          <h3 className="text-sm font-medium text-white mb-3">Transport Provider Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Transport Company</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
              >
                <option value="">Select supplier (optional)...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Driver Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Driver Phone</label>
                <input
                  type="text"
                  placeholder="e.g. +254 700 000000"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TransferStatus)}
                  className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="on_time">On Time</option>
                  <option value="late">Late</option>
                  <option value="missed">Missed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Car Type</label>
                <input
                  type="text"
                  placeholder="e.g. Toyota Landcruiser"
                  value={carType}
                  onChange={(e) => setCarType(e.target.value)}
                  className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Registration Plate</label>
                <input
                  type="text"
                  placeholder="e.g. KCA 123A"
                  value={regPlate}
                  onChange={(e) => setRegPlate(e.target.value)}
                  className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-ink-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-400 hover:bg-ink-800 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-black hover:bg-accent-400"
          >
            {isEditing ? "Save Changes" : "Schedule Transfer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
