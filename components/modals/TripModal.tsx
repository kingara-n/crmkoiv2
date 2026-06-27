"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label } from "@/components/ui/Field";
import { useStore } from "@/lib/store";
import { Trip, TripStatus } from "@/lib/types";

export function TripModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing?: Trip | null;
}) {
  const clients = useStore((s) => s.clients);
  const team = useStore((s) => s.team);
  const addTrip = useStore((s) => s.addTrip);
  const updateTrip = useStore((s) => s.updateTrip);

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [clientName, setClientName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<TripStatus>("upcoming");
  const [travellerCount, setTravellerCount] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name || "");
      setDestination(editing.destination);
      setClientName(editing.clientName || "");
      setOwnerName(editing.ownerName || "");
      setStartDate(editing.startDate);
      setEndDate(editing.endDate);
      setStatus(editing.status);
      setTravellerCount(String(editing.travellerCount || editing.travelerCount || 0));
    } else {
      setName(""); setDestination("");
      setClientName(clients[0]?.name ?? "");
      setOwnerName(team[0]?.name ?? "");
      setStartDate(""); setEndDate("");
      setStatus("upcoming"); setTravellerCount("2");
    }
  }, [open, editing, clients, team]);

  function handleSave() {
    if (!name || !startDate || !endDate) return;
    const payload = {
      name,
      destination,
      clientName,
      ownerName,
      startDate,
      endDate,
      status,
      travellerCount: Number(travellerCount) || 1,
    };
    if (editing) updateTrip(editing.id, payload);
    else addTrip(payload);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit trip" : "Add trip"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{editing ? "Save changes" : "Add trip"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="tname">Trip name</Label>
          <Input id="tname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme · Tsavo safari" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="tdest">Destination</Label>
            <Input id="tdest" value={destination} onChange={(e) => setDestination(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tcount">Traveller count</Label>
            <Input id="tcount" type="number" value={travellerCount} onChange={(e) => setTravellerCount(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="tstart">Start date</Label>
            <Input id="tstart" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tend">End date</Label>
            <Input id="tend" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="tclient">Client</Label>
            <Select id="tclient" value={clientName} onChange={(e) => setClientName(e.target.value)}>
              {clients.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="towner">Owner</Label>
            <Select id="towner" value={ownerName} onChange={(e) => setOwnerName(e.target.value)}>
              {team.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="tstatus">Status</Label>
          <Select id="tstatus" value={status} onChange={(e) => setStatus(e.target.value as TripStatus)}>
            <option value="upcoming">Upcoming</option>
            <option value="on_ground">On the ground</option>
            <option value="completed">Completed</option>
          </Select>
        </div>
      </div>
    </Modal>
  );
}
