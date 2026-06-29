"use client";

import { useState, useMemo } from "react";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanCard } from "@/components/kanban/KanbanCard";
import { LeadModal } from "@/components/modals/LeadModal";
import { LeadDetailPanel } from "@/components/modals/LeadDetailPanel";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { Stage, STAGE_ORDER, Lead } from "@/lib/types";

export default function PipelinePage() {
  const hydrated = useIsHydrated();
  const leads = useStore((s) => s.leads);
  const moveLead = useStore((s) => s.moveLead);
  const documents = useStore((s) => s.clientDocuments);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStage, setModalStage] = useState<Stage | undefined>();
  const [editing, setEditing] = useState<Lead | null>(null);

  // Group leads by stage. Memoised so columns recompute only when leads change.
  const leadsByStage = useMemo(() => {
    const map: Record<Stage, Lead[]> = {
      new_enquiry: [],
      in_discussion: [],
      quoted: [],
      confirmed: [],
      paid: [],
    };
    leads.forEach((l) => {
      // Handle legacy leads that might have old stage names during migration
      if (l.stage === "new_lead" as any) l.stage = "new_enquiry";
      map[l.stage]?.push(l);
    });
    return map;
  }, [leads]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
    document.body.classList.add("is-dragging");
  }

  function handleDragEnd(e: DragEndEvent) {
    document.body.classList.remove("is-dragging");
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const overId = String(over.id);
    const activeLead = leads.find((l) => l.id === active.id);
    if (!activeLead) return;

    // `over` can be a column id (stage) OR a card id. If it's a card id,
    // figure out which stage that card belongs to.
    let targetStage: Stage | null = null;
    if (STAGE_ORDER.includes(overId as Stage)) {
      targetStage = overId as Stage;
    } else {
      const overLead = leads.find((l) => l.id === overId);
      if (overLead) targetStage = overLead.stage;
    }
    if (!targetStage) return;
    if (activeLead.stage === targetStage) return;

    moveLead(activeLead.id, targetStage);
  }

  function openAdd(stage?: Stage) {
    setEditing(null);
    setModalStage(stage);
    setModalOpen(true);
  }

  function openEdit(lead: Lead) {
    setEditing(lead);
    // Don't open the modal for edit, instead the presence of `editing` opens LeadDetailPanel
  }

  if (!hydrated) {
    return <div className="text-neutral-500 p-2">Loading…</div>;
  }

  const activeLead = activeId ? leads.find((l) => l.id === activeId) ?? null : null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-neutral-400">Manage and track your sales pipeline</p>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => openAdd()}>
          Add Deal
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGE_ORDER.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              leads={leadsByStage[stage]}
              onAdd={openAdd}
              onCardClick={openEdit}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead && <KanbanCard lead={activeLead} />}
        </DragOverlay>
      </DndContext>

      {editing && (
        <LeadDetailPanel
          lead={editing}
          onClose={() => setEditing(null)}
        />
      )}

      <LeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultStage={modalStage}
      />
    </div>
  );
}
