"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label, Textarea } from "@/components/ui/Field";
import { useStore } from "@/lib/store";
import { Client, Tier } from "@/lib/types";
import { ClientDocuments } from "@/components/ui/ClientDocuments";

export function ClientModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing?: Client | null;
}) {
  const addClient = useStore((s) => s.addClient);
  const updateClient = useStore((s) => s.updateClient);

  const [type, setType] = useState<"leisure" | "corporate">("leisure");
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [tier, setTier] = useState<Tier>("growth");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Kenya");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [passport, setPassport] = useState("");
  const [meal, setMeal] = useState("");
  const [seat, setSeat] = useState("");
  const [medical, setMedical] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setType(editing.type);
      setName(editing.name);
      setIndustry(editing.industry ?? "");
      setTier(editing.tier);
      setCity(editing.city ?? "");
      setCountry(editing.country);
      setEmail(editing.email);
      setPhone(editing.phone);
      setBirthday(editing.birthday ?? "");
      setPassport(editing.passport ?? "");
      setMeal(editing.mealPreference ?? "");
      setSeat(editing.seatPreference ?? "");
      setMedical(editing.medicalNotes ?? "");
    } else {
      setType("leisure");
      setName(""); setIndustry(""); setTier("growth"); setCity(""); setCountry("Kenya");
      setEmail(""); setPhone(""); setBirthday(""); setPassport("");
      setMeal(""); setSeat(""); setMedical("");
    }
  }, [open, editing]);

  function handleSave() {
    if (!name || !email) return;
    const payload = {
      name,
      type,
      industry: type === "corporate" ? industry : undefined,
      tier,
      city,
      country,
      email,
      phone,
      birthday: type === "leisure" ? birthday : undefined,
      passport: type === "leisure" ? passport : undefined,
      mealPreference: type === "leisure" ? meal : undefined,
      seatPreference: type === "leisure" ? seat : undefined,
      medicalNotes: type === "leisure" ? medical : undefined,
    };
    if (editing) {
      updateClient(editing.id, payload);
    } else {
      addClient(payload);
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit client" : "Add client"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{editing ? "Save changes" : "Add client"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Client type</Label>
          <div className="flex gap-2">
            {(["leisure", "corporate"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm capitalize transition-colors ${
                  type === t
                    ? "border-accent-500 bg-accent-500/10 text-accent-400"
                    : "border-ink-700 bg-ink-800 text-neutral-300 hover:border-ink-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="name">{type === "corporate" ? "Company name" : "Full name"}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tier">Tier</Label>
            <Select id="tier" value={tier} onChange={(e) => setTier(e.target.value as Tier)}>
              <option value="enterprise">Enterprise</option>
              <option value="growth">Growth</option>
              <option value="starter">Starter</option>
            </Select>
          </div>
        </div>

        {type === "corporate" && (
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        {type === "leisure" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="bday">Birthday</Label>
                <Input id="bday" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="passport">Passport number</Label>
                <Input id="passport" value={passport} onChange={(e) => setPassport(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="meal">Meal preference</Label>
                <Input id="meal" value={meal} onChange={(e) => setMeal(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="seat">Seat preference</Label>
                <Input id="seat" value={seat} onChange={(e) => setSeat(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="med">Medical notes</Label>
              <Textarea id="med" value={medical} onChange={(e) => setMedical(e.target.value)} />
            </div>
          </>
        )}
        
        {editing && <ClientDocuments clientId={editing.id} />}
      </div>
    </Modal>
  );
}
