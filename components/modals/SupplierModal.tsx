"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label, Textarea } from "@/components/ui/Field";
import { useStore } from "@/lib/store";
import { Supplier, SupplierType } from "@/lib/types";

export function SupplierModal({
  open,
  onClose,
  editing,
  submitAsPending = false,
}: {
  open: boolean;
  onClose: () => void;
  editing?: Supplier | null;
  // Non-managers submit as 'pending' for approval. Managers add directly.
  submitAsPending?: boolean;
}) {
  const addSupplier = useStore((s) => s.addSupplier);
  // No updateSupplier in the store — keeping suppliers immutable after approval
  // mirrors the PRD better. Editing would route through a "request change" flow
  // in a future version.

  const [name, setName] = useState("");
  const [type, setType] = useState<SupplierType>("hotel");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Kenya");
  const [accountsEmail, setAccountsEmail] = useState("");
  const [bookingsEmail, setBookingsEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [childPolicy, setChildPolicy] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [residentRate, setResidentRate] = useState("");
  const [nonResidentRateUsd, setNonResidentRateUsd] = useState("");
  const [capacity, setCapacity] = useState("");
  const [amenities, setAmenities] = useState("");
  const [contractExpires, setContractExpires] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setType(editing.type);
      setCategory(editing.category);
      setCity(editing.city);
      setCountry(editing.country);
      setAccountsEmail(editing.accountsEmail);
      setBookingsEmail(editing.bookingsEmail);
      setPhone(editing.phone);
      setChildPolicy(editing.childPolicy ?? "");
      setCancellationPolicy(editing.cancellationPolicy);
      setPaymentTerms(editing.paymentTerms);
      setResidentRate(String(editing.residentRate));
      setNonResidentRateUsd(String(editing.nonResidentRateUsd));
      setCapacity(String(editing.capacity));
      setAmenities(editing.amenities.join(", "));
      setContractExpires(editing.contractExpires ?? "");
    } else {
      setName(""); setType("hotel"); setCategory(""); setCity(""); setCountry("Kenya");
      setAccountsEmail(""); setBookingsEmail(""); setPhone("");
      setChildPolicy(""); setCancellationPolicy(""); setPaymentTerms("");
      setResidentRate(""); setNonResidentRateUsd(""); setCapacity("");
      setAmenities(""); setContractExpires("");
    }
  }, [open, editing]);

  function handleSave() {
    if (!name || !accountsEmail || !bookingsEmail) return;
    addSupplier(
      {
        name,
        type,
        category,
        city,
        country,
        accountsEmail,
        bookingsEmail,
        phone,
        childPolicy: childPolicy || undefined,
        cancellationPolicy,
        paymentTerms,
        residentRate: Number(residentRate) || 0,
        nonResidentRateUsd: Number(nonResidentRateUsd) || 0,
        capacity: Number(capacity) || 0,
        amenities: amenities.split(",").map((a) => a.trim()).filter(Boolean),
        contractExpires: contractExpires || undefined,
      },
      submitAsPending,
    );
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={submitAsPending ? "Submit supplier for approval" : "Add supplier"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{submitAsPending ? "Submit" : "Add supplier"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="sname">Supplier name</Label>
            <Input id="sname" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="stype">Type</Label>
            <Select id="stype" value={type} onChange={(e) => setType(e.target.value as SupplierType)}>
              <option value="hotel">Hotel</option>
              <option value="camp">Camp / Lodge</option>
              <option value="transport">Transport</option>
              <option value="dmc">DMC / Operator</option>
              <option value="airline">Airline</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="scat">Category</Label>
            <Input id="scat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Luxury · Beach" />
          </div>
          <div>
            <Label htmlFor="scap">Capacity</Label>
            <Input id="scap" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="scity">City</Label>
            <Input id="scity" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="scountry">Country</Label>
            <Input id="scountry" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="acc">Accounts email</Label>
            <Input id="acc" type="email" value={accountsEmail} onChange={(e) => setAccountsEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="book">Bookings email</Label>
            <Input id="book" type="email" value={bookingsEmail} onChange={(e) => setBookingsEmail(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="sphone">Phone</Label>
            <Input id="sphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="scontract">Contract expires</Label>
            <Input id="scontract" type="date" value={contractExpires} onChange={(e) => setContractExpires(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="srate">Resident rate (KES)</Label>
            <Input id="srate" type="number" value={residentRate} onChange={(e) => setResidentRate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="snrrate">Non-resident rate (USD)</Label>
            <Input id="snrrate" type="number" value={nonResidentRateUsd} onChange={(e) => setNonResidentRateUsd(e.target.value)} />
          </div>
        </div>

        <div>
          <Label htmlFor="scancel">Cancellation policy</Label>
          <Input id="scancel" value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)} placeholder="e.g. 48 hrs free" />
        </div>

        <div>
          <Label htmlFor="spay">Payment terms</Label>
          <Input id="spay" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="e.g. Net 30" />
        </div>

        <div>
          <Label htmlFor="schild">Child policy</Label>
          <Input id="schild" value={childPolicy} onChange={(e) => setChildPolicy(e.target.value)} />
        </div>

        <div>
          <Label htmlFor="samen">Amenities (comma-separated)</Label>
          <Textarea id="samen" value={amenities} onChange={(e) => setAmenities(e.target.value)} placeholder="Pool, Spa, Beach access" />
        </div>

        {submitAsPending && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-300">
            This will be submitted for management approval before it goes live in the supplier directory.
          </p>
        )}
      </div>
    </Modal>
  );
}
