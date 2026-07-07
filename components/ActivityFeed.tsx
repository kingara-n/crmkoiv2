"use client";

import { useState } from "react";
import { relativeTime } from "@/lib/format";
import { Phone, Mail, FileText, Calendar, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Activity {
  id: string;
  type: 'note' | 'call' | 'email' | 'meeting' | 'system';
  content: string;
  user_name: string;
  created_at: string;
}

export function ActivityFeed({ entityType, entityId }: { entityType: string; entityId: string }) {
  const [activities, setActivities] = useState<Activity[]>([
    { id: "1", type: "system", content: `${entityType} created`, user_name: "System", created_at: new Date(Date.now() - 86400000).toISOString() }
  ]);
  const [newNote, setNewNote] = useState("");
  const [type, setType] = useState<'note' | 'call' | 'email'>('note');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const activity: Activity = {
      id: Math.random().toString(),
      type,
      content: newNote,
      user_name: "Current User",
      created_at: new Date().toISOString()
    };
    
    setActivities([activity, ...activities]);
    setNewNote("");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4 text-emerald-500" />;
      case 'email': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'meeting': return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'note': return <FileText className="h-4 w-4 text-amber-500" />;
      default: return <MessageSquare className="h-4 w-4 text-neutral-400" />;
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <h3 className="text-sm font-semibold text-white mb-4">Activity & Notes</h3>
      
      <form onSubmit={handleAdd} className="mb-6 flex flex-col gap-2">
        <div className="flex gap-2">
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value as any)}
            className="bg-ink-800 border border-ink-700 text-sm rounded-md px-2 py-1 text-white"
          >
            <option value="note">Note</option>
            <option value="call">Log Call</option>
            <option value="email">Log Email</option>
          </select>
          <input 
            type="text" 
            placeholder="Type a note..." 
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1 bg-ink-800 border border-ink-700 text-sm rounded-md px-3 py-1 text-white"
          />
          <Button type="submit" size="sm">Add</Button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {activities.map((act) => (
          <div key={act.id} className="flex gap-3">
            <div className="mt-1 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-ink-800 flex items-center justify-center border border-ink-700">
                {getIcon(act.type)}
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-neutral-200">{act.user_name}</span>
                <span className="text-xs text-neutral-500">
                  {relativeTime(act.created_at)}
                </span>
              </div>
              <p className="text-sm text-neutral-400 mt-0.5">{act.content}</p>
            </div>
          </div>
        ))}
        {activities.length === 0 && <p className="text-xs text-neutral-500">No activity logged yet.</p>}
      </div>
    </Card>
  );
}
