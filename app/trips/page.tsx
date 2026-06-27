"use client";

import { useState, useMemo } from "react";
import { Plus, MapPin, Users, Calendar, User, Plane, CheckCircle2 } from "lucide-react";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TripModal } from "@/components/modals/TripModal";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { formatDate } from "@/lib/format";
import { Trip, TripStatus } from "@/lib/types";

function tripDays(t: Trip): number {
  return Math.max(1,
    Math.round((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86_400_000) + 1,
  );
}

function daysFromNow(iso: string): number {
  return Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export default function TripsPage() {
  const hydrated = useIsHydrated();
  const trips = useStore((s) => s.trips);
  const updateTrip = useStore((s) => s.updateTrip);
  const deleteTrip = useStore((s) => s.deleteTrip);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);

  const sorted = useMemo(() => [...trips].sort((a, b) => a.startDate.localeCompare(b.startDate)), [trips]);
  const onGround = sorted.filter((t) => t.status === "on_ground");
  const upcoming = sorted.filter((t) => t.status === "upcoming");
  const completed = sorted.filter((t) => t.status === "completed");

  const totalTravellers = trips
    .filter((t) => t.status !== "completed")
    .reduce((sum, t) => sum + (t.travellerCount || t.travelerCount || 0), 0);

  function startNow(t: Trip) {
    updateTrip(t.id, { status: "on_ground" });
  }
  function markComplete(t: Trip) {
    updateTrip(t.id, { status: "completed" });
  }
  function openEdit(t: Trip) {
    setEditing(t);
    setModalOpen(true);
  }
  function handleDelete(t: Trip) {
    if (confirm(`Delete trip "${t.name}"?`)) deleteTrip(t.id);
  }

  if (!hydrated) return <div className="text-neutral-500 p-2">Loading…</div>;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Trips on the ground" value={String(onGround.length)}
          icon={<Plane className="h-4 w-4 text-accent-500" />} />
        <StatCard label="Upcoming trips" value={String(upcoming.length)}
          icon={<Calendar className="h-4 w-4 text-sky-400" />} />
        <StatCard label="Travellers (active)" value={String(totalTravellers)}
          icon={<Users className="h-4 w-4" />} />
        <StatCard label="Completed (year)" value={String(completed.length)}
          icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">Track every active and upcoming trip in one place</p>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setModalOpen(true); }}>
          Add Trip
        </Button>
      </div>

      {/* On the ground */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <span className="h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
          On the ground
          <span className="rounded bg-ink-800 px-2 py-0.5 text-xs text-neutral-300">{onGround.length}</span>
        </h2>
        {onGround.length === 0 && (
          <Card><p className="text-sm text-neutral-500">No trips currently in progress.</p></Card>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {onGround.map((t) => (
            <TripCard key={t.id} trip={t} onEdit={() => openEdit(t)} onComplete={() => markComplete(t)} onDelete={() => handleDelete(t)} />
          ))}
        </div>
      </section>

      {/* Upcoming */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          Upcoming
          <span className="rounded bg-ink-800 px-2 py-0.5 text-xs text-neutral-300">{upcoming.length}</span>
        </h2>
        {upcoming.length === 0 && (
          <Card><p className="text-sm text-neutral-500">No upcoming trips on the books.</p></Card>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((t) => (
            <TripCard
              key={t.id}
              trip={t}
              showStart
              onStart={() => startNow(t)}
              onEdit={() => openEdit(t)}
              onDelete={() => handleDelete(t)}
            />
          ))}
        </div>
      </section>

      {completed.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-500">Recently completed</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completed.slice(-3).map((t) => (
              <TripCard key={t.id} trip={t} onEdit={() => openEdit(t)} onDelete={() => handleDelete(t)} />
            ))}
          </div>
        </section>
      )}

      <TripModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />
    </div>
  );
}

function TripCard({
  trip, showStart, onStart, onEdit, onComplete, onDelete,
}: {
  trip: Trip;
  showStart?: boolean;
  onStart?: () => void;
  onEdit: () => void;
  onComplete?: () => void;
  onDelete: () => void;
}) {
  const days = tripDays(trip);
  const dfn = daysFromNow(trip.startDate);
  return (
    <Card>
      <div className="mb-3 flex items-start justify-between">
        <div className="min-w-0">
          <p className="font-medium text-white truncate">{trip.name}</p>
          <p className="text-xs text-neutral-500">{trip.clientName}</p>
        </div>
        {trip.status === "on_ground" && <Badge tone="accent" dot>Live</Badge>}
        {trip.status === "upcoming" && dfn <= 7 && <Badge tone="warning">in {dfn}d</Badge>}
        {trip.status === "completed" && <Badge tone="neutral">Completed</Badge>}
      </div>

      <div className="mb-4 space-y-2 text-sm text-neutral-300">
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-neutral-500" />{trip.destination}
        </p>
        <p className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-neutral-500" />
          {formatDate(trip.startDate)} → {formatDate(trip.endDate)} <span className="text-neutral-500">({days}d)</span>
        </p>
        <p className="flex items-center gap-2">
          <Users className="h-4 w-4 text-neutral-500" />{trip.travellerCount || trip.travelerCount || 0} traveller{(trip.travellerCount || trip.travelerCount || 0) !== 1 ? "s" : ""}
        </p>
        <p className="flex items-center gap-2">
          <User className="h-4 w-4 text-neutral-500" />{trip.ownerName}
        </p>
      </div>

      <div className="flex gap-2 border-t border-ink-700 pt-3">
        {showStart && onStart && (
          <Button variant="primary" onClick={onStart} className="flex-1">Mark started</Button>
        )}
        {trip.status === "on_ground" && onComplete && (
          <Button variant="primary" onClick={onComplete} className="flex-1">Mark complete</Button>
        )}
        <Button variant="secondary" onClick={onEdit} className="flex-1">Edit</Button>
        <button
          onClick={onDelete}
          className="rounded-lg border border-ink-700 px-3 py-2 text-xs text-neutral-500 hover:text-red-400"
        >
          Delete
        </button>
      </div>
    </Card>
  );
}
