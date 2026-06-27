"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal } from "lucide-react";
import { Lead } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useCurrency } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";

export function KanbanCard({ lead, onClick }: { lead: Lead; onClick?: () => void }) {
  const currency = useCurrency();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lead.id, data: { lead } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  // Dynamic probability color mapping
  // 0 -> Red, 50 -> Yellow, 100 -> Green
  const getProbabilityColor = (prob: number) => {
    if (prob < 30) return "bg-red-500/20 text-red-400";
    if (prob < 70) return "bg-yellow-500/20 text-yellow-400";
    return "bg-green-500/20 text-green-400";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-ink-900 border border-ink-700 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-ink-600 hover:shadow-lg transition-all group mb-3"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-white group-hover:text-accent-400 transition-colors">
          {lead.title}
        </h3>
        <MoreHorizontal className="h-4 w-4 text-neutral-500 flex-shrink-0" />
      </div>

      <div className="mb-4 space-y-1">
        <p className="text-xs text-neutral-500">Destination</p>
        <p className="text-sm text-neutral-300">{lead.destination || "—"}</p>
      </div>

      <div className="mb-4 space-y-1">
        <p className="text-xs text-neutral-500">Value</p>
        <p className="text-sm font-medium text-white">{formatMoney(lead.value, currency)}</p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className={`text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider ${getProbabilityColor(lead.probability)}`}>
          {lead.probability}% Prob
        </span>
        <Avatar initials={lead.ownerName?.substring(0, 2) || "??"} size="sm" />
      </div>
    </div>
  );
}
