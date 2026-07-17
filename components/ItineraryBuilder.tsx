"use client";

import { useState } from "react";
import { Link as LinkIcon, ExternalLink, Trash2, Plane } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useStore } from "@/lib/store";

export function ItineraryBuilder({ 
  leadId, 
}: { 
  leadId: string;
}) {
  const lead = useStore((s) => s.leads.find(l => l.id === leadId));
  const updateLead = useStore((s) => s.updateLead);
  
  // Use a local state for the input field before saving
  const [inputValue, setInputValue] = useState("");

  if (!lead) return null;

  // The actual saved URL from the database/store
  const savedUrl = (lead as any).travefyUrl || "";

  const handleSave = () => {
    if (!inputValue.trim()) return;
    updateLead(leadId, { travefyUrl: inputValue.trim() } as any);
    setInputValue("");
  };

  const handleDelete = () => {
    updateLead(leadId, { travefyUrl: undefined } as any);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">e-Itinerary Link</h3>
            <p className="text-xs text-neutral-400 mt-1">Link your e-Itinerary URL to this lead.</p>
          </div>
          <Plane className="h-6 w-6 text-accent-500 opacity-50" />
        </div>
        
        {savedUrl ? (
          <div className="flex items-center justify-between bg-ink-900 border border-ink-700 rounded-lg p-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-ink-800 p-2 rounded">
                <LinkIcon className="h-4 w-4 text-accent-500" />
              </div>
              <a href={savedUrl} target="_blank" rel="noreferrer" className="text-sm text-neutral-200 hover:text-accent-400 truncate hover:underline">
                {savedUrl}
              </a>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <Button variant="secondary" onClick={() => window.open(savedUrl, '_blank')} icon={<ExternalLink className="h-4 w-4" />}>
                Open
              </Button>
              <button onClick={handleDelete} className="p-2 text-neutral-500 hover:text-red-400 hover:bg-ink-800 rounded transition" title="Remove Link">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input 
                type="url"
                placeholder="https://example.com/itinerary/..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-ink-900 border border-ink-700 text-sm rounded-lg pl-9 pr-4 py-2 text-white focus:border-accent-500 outline-none"
              />
            </div>
            <Button variant="primary" onClick={handleSave} disabled={!inputValue.trim()}>
              Save Link
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
