"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Lead, Stage, STAGE_LABELS } from "@/lib/types";
import { KanbanCard } from "./KanbanCard";
import { formatMoney } from "@/lib/format";
import { useCurrency } from "@/lib/store";

export function KanbanColumn({
  stage,
  leads,
  onAdd,
  onCardClick,
}: {
  stage: Stage;
  leads: Lead[];
  onAdd: (stage: Stage) => void;
  onCardClick: (lead: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const currency = useCurrency();
  const total = leads.reduce((sum, l) => {
    let converted = l.value;
    if (l.currency !== currency) {
      if (l.currency === 'USD' && currency === 'KES') converted *= 130;
      else if (l.currency === 'KES' && currency === 'USD') converted /= 130;
      else if (l.currency === 'EUR' && currency === 'KES') converted *= 140;
    }
    return sum + converted;
  }, 0);

  return (
    <div className="flex w-72 shrink-0 flex-col">
      {/* Column header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">{STAGE_LABELS[stage]}</h3>
          <span className="rounded-md bg-ink-800 px-1.5 py-0.5 text-xs font-medium text-neutral-300">
            {leads.length}
          </span>
        </div>
        <span className="text-sm font-medium text-neutral-300">
          {formatMoney(total, currency)}
        </span>
      </div>

      {/* Droppable */}
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-3 rounded-card border border-dashed transition-colors ${
          isOver
            ? "border-accent-500/60 bg-accent-500/5"
            : "border-transparent"
        }`}
      >
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} onClick={() => onCardClick(lead)} />
          ))}
        </SortableContext>

        <button
          onClick={() => onAdd(stage)}
          className="flex w-full items-center justify-center gap-2 rounded-card border border-dashed border-ink-700 px-4 py-3 text-sm text-neutral-500 hover:border-ink-600 hover:bg-ink-900 hover:text-neutral-300 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add deal
        </button>
      </div>
    </div>
  );
}
