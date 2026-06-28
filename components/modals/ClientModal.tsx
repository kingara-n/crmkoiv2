"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label, Textarea } from "@/components/ui/Field";
import { useStore } from "@/lib/store";
import { Client, TripType } from "@/lib/types";
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

  const [type, setType] = useState<"individual" | "corporate">("individual");
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [tripType, setTripType] = useState<TripType>("Travel");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Kenya");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [passport, setPassport] = useState("");
  const [meal, setMeal] = useState("");
  const [seat, setSeat] = useState("");
  const [medical, setMedical] = useState("");
  const [isGroup, setIsGroup] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setType(editing.type);
      setName(editing.name);
      setIndustry(editing.industry ?? "");
      setTripType(editing.tripType);
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
      setType("individual");
      setName(""); setIndustry(""); setTripType("Travel"); setCity(""); setCountry("Kenya");
      setEmail(""); setPhone(""); setBirthday(""); setPassport("");
      setMeal(""); setSeat(""); setMedical("");
      setIsGroup(false);
    }
  }, [open, editing]);

  function handleSave() {
    if (!name || !email) return;
    const payload = {
      name,
      type,
      industry: type === "corporate" ? industry : undefined,
      tripType,
      city,
      country,
      email,
      phone,
      birthday: type === "individual" ? (birthday || undefined) : undefined,
      passport: type === "individual" ? passport : undefined,
      mealPreference: type === "individual" ? meal : undefined,
      seatPreference: type === "individual" ? seat : undefined,
      medicalNotes: type === "individual" ? medical : undefined,
    };
    if (editing) {
      updateClient(editing.id, payload);
    } else {
      addClient(payload);
    }
    onClose();
  }

  // Handle switching type so tripType doesn't end up invalid
  useEffect(() => {
    if (type === "individual") {
      if (!["Travel", "Business"].includes(tripType)) setTripType("Travel");
    } else {
      if (!["Business", "Incentive", "Meeting", "Conference", "Exhibitions"].includes(tripType)) setTripType("Business");
    }
  }, [type, tripType]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit Client" : "Add Client"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{editing ? "Save Changes" : "Add Client"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Client Type</Label>
          <div className="flex gap-2">
            {(["individual", "corporate"] as const).map((t) => (
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

        {type === "individual" && (
          <div className="flex items-center gap-2 mt-2 mb-2">
            <input
              type="checkbox"
              id="isGroup"
              checked={isGroup}
              onChange={(e) => setIsGroup(e.target.checked)}
              className="rounded border-ink-600 bg-ink-900 text-accent-500 focus:ring-accent-500/50"
            />
            <label htmlFor="isGroup" className="!mb-0 cursor-pointer text-sm font-medium text-neutral-400">Is this a Group Booking?</label>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="name">{type === "corporate" ? "Company Name" : (isGroup ? "Group Name / Contact Person" : "Full Name")}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tripType">Trip Type</Label>
            <Select id="tripType" value={tripType} onChange={(e) => setTripType(e.target.value as TripType)}>
              {type === "individual" ? (
                <>
                  <option value="Travel">Travel</option>
                  <option value="Business">Business</option>
                </>
              ) : (
                <>
                  <option value="Business">Business</option>
                  <option value="Incentive">Incentive</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Conference">Conference</option>
                  <option value="Exhibitions">Exhibitions</option>
                </>
              )}
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

        {type === "individual" && !isGroup && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="bday">Birthday</Label>
                <Input id="bday" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="passport">Passport Number</Label>
                <Input id="passport" value={passport} onChange={(e) => setPassport(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="meal">Dietary Preferences</Label>
                <Input id="meal" value={meal} onChange={(e) => setMeal(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="seat">Seat Preference</Label>
                <Input id="seat" value={seat} onChange={(e) => setSeat(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="med">Medical Notes</Label>
              <Textarea id="med" value={medical} onChange={(e) => setMedical(e.target.value)} />
            </div>
          </>
        )}
        
        {/* Inline Document Upload for New Clients (Optional) - Or existing ClientDocuments */}
        {editing ? (
          <ClientDocuments clientId={editing.id} />
        ) : (
          <div className="pt-2 border-t border-ink-800">
            <h3 className="text-sm font-semibold text-white mb-2">Upload Documents (Optional)</h3>
            <p className="text-xs text-neutral-500 mb-3">You can upload Passports, Visas, etc. after the client is created, from the Document Vault.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
