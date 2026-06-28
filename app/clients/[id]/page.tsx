"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate, formatMoney } from "@/lib/format";
import { ChevronLeft, Mail, Phone, MapPin, Calendar, File, Briefcase, Plane, Banknote } from "lucide-react";

export default function ClientProfilePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const hydrated = useIsHydrated();
  
  const clients = useStore((s) => s.clients);
  const bookings = useStore((s) => s.bookings);
  const leads = useStore((s) => s.leads);
  const documents = useStore((s) => s.clientDocuments);
  const currency = useStore((s) => s.settings.currency);

  const client = useMemo(() => clients.find((c) => c.id === id), [clients, id]);
  
  const clientBookings = useMemo(() => bookings.filter((b) => b.clientId === id), [bookings, id]);
  const clientLeads = useMemo(() => leads.filter((l) => l.clientId === id), [leads, id]);
  const clientDocs = useMemo(() => documents.filter((d) => d.clientId === id), [documents, id]);

  if (!hydrated) return <div className="text-neutral-500 p-4">Loading…</div>;
  if (!client) return <div className="text-neutral-500 p-4">Client not found.</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-ink-700/50 pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 border border-ink-700 bg-ink-900 rounded-lg hover:bg-ink-800 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              {client.name}
              <Badge tone={client.tripType === "Travel" ? "success" : client.tripType === "Business" ? "info" : client.tripType === "Incentive" ? "accent" : "neutral"}>
                {client.tripType.toUpperCase()}
              </Badge>
            </h1>
            <p className="text-sm text-neutral-400 mt-1">Client Profile & History</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Client Details */}
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col items-center text-center pb-6 border-b border-ink-700/50 mb-6">
              <div className="h-20 w-20 mb-4 text-xl">
                <Avatar initials={client.name.substring(0, 2).toUpperCase()} />
              </div>
              <h2 className="text-xl font-bold text-white">{client.name}</h2>
              <p className="text-sm text-neutral-400 capitalize">{client.type} Client</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-neutral-300">
                <Mail className="h-4 w-4 text-neutral-500" />
                <a href={`mailto:${client.email}`} className="hover:text-accent-400 hover:underline">{client.email}</a>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-300">
                <Phone className="h-4 w-4 text-neutral-500" />
                <span>{client.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-300">
                <MapPin className="h-4 w-4 text-neutral-500" />
                <span>{client.city ? `${client.city}, ` : ""}{client.country || "—"}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-white mb-4">Travel Preferences</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Passport Number</p>
                <p className="text-sm text-neutral-300 font-medium">{client.passport || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Dietary Requirements</p>
                <p className="text-sm text-neutral-300 font-medium">{client.mealPreference || "None"}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Medical Notes</p>
                <p className="text-sm text-neutral-300 font-medium">{client.medicalNotes || "None"}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Seating Preference</p>
                <p className="text-sm text-neutral-300 font-medium">{client.seatPreference || "No preference"}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Activity & History */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-3 gap-4">
            <Card padding={false} className="p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-neutral-500 mb-2">
                <Banknote className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Lifetime Value</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatMoney(client.revenue, currency)}</p>
            </Card>
            <Card padding={false} className="p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-neutral-500 mb-2">
                <Briefcase className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Open Deals</span>
              </div>
              <p className="text-2xl font-bold text-white">{clientLeads.filter(l => l.stage !== 'paid').length}</p>
            </Card>
            <Card padding={false} className="p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-neutral-500 mb-2">
                <Plane className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
              </div>
              <p className="text-2xl font-bold text-white">{clientBookings.length}</p>
            </Card>
          </div>

          <Card padding={false}>
            <div className="p-5 border-b border-ink-700/50 flex items-center justify-between">
              <h3 className="font-semibold text-white">Booking History</h3>
              <Button variant="secondary">New Booking</Button>
            </div>
            {clientBookings.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-sm">No bookings yet.</div>
            ) : (
              <div className="divide-y divide-ink-700/50">
                {clientBookings.map((b) => (
                  <div key={b.id} className="p-5 flex items-center justify-between hover:bg-ink-900/50 transition">
                    <div>
                      <p className="font-medium text-white">{b.destination}</p>
                      <p className="text-xs text-neutral-400 mt-1">Booked on {formatDate(b.closeDate || "")} • Handled by {b.ownerName}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge tone={b.status === "confirmed" ? "success" : b.status === "lost" ? "danger" : "neutral"}>
                        {b.status.toUpperCase()}
                      </Badge>
                      <span className="font-medium text-white">{formatMoney(b.value, currency)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card padding={false}>
            <div className="p-5 border-b border-ink-700/50 flex items-center justify-between">
              <h3 className="font-semibold text-white">Document Vault</h3>
              <Button variant="secondary" onClick={() => router.push('/documents')}>View All</Button>
            </div>
            {clientDocs.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-sm">No documents uploaded.</div>
            ) : (
              <div className="divide-y divide-ink-700/50">
                {clientDocs.map((doc) => (
                  <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-ink-900/50 transition">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-ink-800 flex items-center justify-center">
                        <File className="h-4 w-4 text-accent-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{doc.filename}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Uploaded {formatDate(doc.uploadedAt)}</p>
                      </div>
                    </div>
                    <Badge tone={doc.docType === "passport" ? "success" : doc.docType === "payment_receipt" ? "accent" : "neutral"}>
                      {(doc.docType || "Unknown").replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
