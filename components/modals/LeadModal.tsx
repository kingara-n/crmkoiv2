"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label } from "@/components/ui/Field";
import { useStore } from "@/lib/store";
import { Stage, STAGE_LABELS, STAGE_ORDER, Lead } from "@/lib/types";

export function LeadModal({
  open,
  onClose,
  defaultStage,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  defaultStage?: Stage;
  editing?: Lead | null;
}) {
  const clients = useStore((s) => s.clients);
  const team = useStore((s) => s.team);
  const addLead = useStore((s) => s.addLead);
  const updateLead = useStore((s) => s.updateLead);
  const deleteLead = useStore((s) => s.deleteLead);

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [destination, setDestination] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState<Stage>(defaultStage ?? "new_lead");
  const [ownerId, setOwnerId] = useState("");
  const [probability, setProbability] = useState("50");
  const [source, setSource] = useState("Referral");

  // Sync state when modal opens or the editing lead changes
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setTitle(editing.title);
      setClientId(editing.clientId);
      setDestination(editing.destination);
      setValue(String(editing.value));
      setStage(editing.stage);
      setOwnerId(editing.ownerId);
      setProbability(String(editing.probability));
      setSource(editing.source);
    } else {
      setTitle("");
      setClientId(clients[0]?.id ?? "");
      setDestination("");
      setValue("");
      setStage(defaultStage ?? "new_lead");
      setOwnerId(team[0]?.id ?? "");
      setProbability("50");
      setSource("Referral");
    }
  }, [open, editing, defaultStage, clients, team]);

  function handleSave() {
    if (!title || !clientId || !value || !ownerId) return;
    const owner = team.find((t) => t.id === ownerId);
    const numValue = Number(value);

    if (editing) {
      updateLead(editing.id, {
        title,
        clientId,
        destination,
        value: numValue,
        stage,
        probability: Number(probability),
        ownerId,
        ownerName: owner?.name ?? "",
        source,
      });
    } else {
      addLead({
        clientId,
        title,
        destination,
        value: numValue,
        currency: "KES",
        stage,
        probability: Number(probability),
        ownerId,
        ownerName: owner?.name ?? "",
        source,
      });
    }
    onClose();
  }

  function handleDelete() {
    if (editing && confirm("Delete this deal? This can't be undone.")) {
      deleteLead(editing.id);
      onClose();
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit deal" : "Add deal"}
      footer={
        <>
          {editing && (
            <Button variant="danger" onClick={handleDelete} className="mr-auto">
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{editing ? "Save changes" : "Add deal"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Deal title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wanjiru honeymoon · Zanzibar"
          />
        </div>

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
            <Label htmlFor="value">Value (KES)</Label>
            <Input
              id="value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="580000"
            />
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
            <Label htmlFor="source">Source</Label>
            <Select id="source" value={source} onChange={(e) => setSource(e.target.value)}>
              <option>Referral</option>
              <option>Website</option>
              <option>Corporate tender</option>
              <option>Walk-in</option>
              <option>Other</option>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="prob">Probability ({probability}%)</Label>
          <input
            id="prob"
            type="range"
            min={0}
            max={100}
            value={probability}
            onChange={(e) => setProbability(e.target.value)}
            className="w-full accent-accent-500"
          />
        </div>
      </div>
    </Modal>
  );
}
