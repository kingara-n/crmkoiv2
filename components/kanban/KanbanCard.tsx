"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Building2, User, Clock } from "lucide-react";
import { Lead } from "@/lib/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatMoney } from "@/lib/format";
import { useCurrency } from "@/lib/store";

export function KanbanCard({ lead, onClick }: { lead: Lead; onClick?: () => void }) {
  const currency = useCurrency();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lead.id, data: { lead } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="group cursor-grab active:cursor-grabbing rounded-card border border-ink-700 bg-ink-850 p-4 hover:border-ink-600 hover:bg-ink-800 transition-colors"
    >
      <div className="mb-3 flex items-start gap-2">
        <Building2 className="h-4 w-4 mt-0.5 shrink-0 text-neutral-500" />
        <p className="text-sm font-medium text-white truncate" title={lead.title}>
          {lead.title}
        </p>
      </div>

      <div className="mb-3 flex items-center gap-1.5 text-accent-400">
        <span className="text-xs">$</span>
        <p className="text-base font-semibold">{formatMoney(lead.value, currency)}</p>
      </div>

      <div className="mb-3 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3" />
          <span>{(lead.ownerName || "Unassigned").split(" ").map((n, i) => i === 0 ? n : n[0] + ".").join(" ")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span>{lead.daysInStage}d</span>
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-neutral-500">Probability</span>
          <span className="font-medium text-white">{lead.probability}%</span>
        </div>
        <ProgressBar value={lead.probability} tone="accent" />
      </div>
    </div>
  );
}
