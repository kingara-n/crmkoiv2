"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label } from "@/components/ui/Field";
import { useStore } from "@/lib/store";
import { Stage, STAGE_LABELS, STAGE_ORDER, BookingStatus, Currency } from "@/lib/types";

export function BookingModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const clients = useStore((s) => s.clients);
  const team = useStore((s) => s.team);
  const addBooking = useStore((s) => s.addBooking);

  const [clientId, setClientId] = useState("");
  const [destination, setDestination] = useState("");
  const [value, setValue] = useState("");
  const [currency, setCurrency] = useState<Currency>("KES");
  const [stage, setStage] = useState<Stage>("confirmed");
  const [status, setStatus] = useState<BookingStatus>("confirmed");
  const [ownerId, setOwnerId] = useState("");

  // Sync state when modal opens
  useEffect(() => {
    if (!open) return;
    setClientId(clients[0]?.id ?? "");
    setDestination("");
    setValue("");
    setCurrency("KES");
    setStage("confirmed");
    setStatus("confirmed");
    setOwnerId(team[0]?.id ?? "");
  }, [open, clients, team]);

  function handleSave() {
    if (!clientId || !value || !ownerId) return;
    const client = clients.find((c) => c.id === clientId);
    const owner = team.find((t) => t.id === ownerId);
    const numValue = Number(value);

    addBooking({
      clientId,
      clientName: client?.name ?? "",
      contactName: client?.name ?? "",
      contactEmail: client?.email ?? "",
      destination,
      value: numValue,
      currency,
      status,
      stage,
      ownerName: owner?.name ?? "",
    });
    
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Booking"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Add Booking</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="client">Client</Label>
            <Select id="client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="dest">Destination</Label>
            <Input
              id="dest"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Zanzibar"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="value">Value</Label>
            <div className="flex gap-2">
              <Select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="w-24">
                <option value="KES">KES</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </Select>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="580000"
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)}>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="lost">Lost</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="owner">Owner</Label>
            <Select id="owner" value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
              {team.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="stage">Stage</Label>
            <Select id="stage" value={stage} onChange={(e) => setStage(e.target.value as Stage)}>
              {STAGE_ORDER.map((s) => (
                <option key={s} value={s}>{STAGE_LABELS[s]}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
