"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, MoreHorizontal, User, MapPin, Building2 } from "lucide-react";
import { Lead, Stage, STAGE_LABELS } from "@/lib/types";
import { useStore, useCurrency } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate, formatMoney } from "@/lib/format";

export function LeadDetailPanel({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  const currency = useCurrency();
  const [newComment, setNewComment] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const updateLead = useStore((s) => s.updateLead);
  const addLeadComment = useStore((s) => s.addLeadComment);
  const addNotification = useStore((s) => s.addNotification);
  const comments = useStore((s) => s.leadComments).filter((c) => c.leadId === lead.id);
  const team = useStore((s) => s.team);

  // Filter team based on query
  const filteredTeam = team.filter(t => 
    t.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  useEffect(() => {
    // Basic mention detection: if the user types "@" and a word
    const match = newComment.match(/@(\w*)$/);
    if (match) {
      setShowMentions(true);
      setMentionQuery(match[1]);
    } else {
      setShowMentions(false);
    }
  }, [newComment]);

  function insertMention(user: any) {
    const replacement = `@${user.name.replace(/\s+/g, '')} `;
    const updated = newComment.replace(/@\w*$/, replacement);
    setNewComment(updated);
    setShowMentions(false);
    inputRef.current?.focus();
  }

  async function handleAddComment(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!newComment.trim()) return;

    const authorName = "Local Admin";

    await addLeadComment({
      leadId: lead.id,
      userId: "local-user", 
      userName: authorName,
      comment: newComment.trim(),
    });

    // Check for mentions in the submitted comment
    // Simple regex to find @Name
    const mentions = newComment.match(/@([a-zA-Z]+)/g);
    if (mentions) {
      for (const mention of mentions) {
        // e.g. "@JohnDoe" -> "JohnDoe"
        const mentionedName = mention.substring(1).toLowerCase();
        // find team member
        const taggedUser = team.find(t => t.name.replace(/\s+/g, '').toLowerCase() === mentionedName);
        if (taggedUser) {
          // Send notification
          await addNotification({
            userId: taggedUser.id,
            authorName: authorName,
            authorInitials: "LA",
            actionText: `Mentioned you in a lead comment on "${lead.title}"`,
          });
        }
      }
    }

    setNewComment("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !showMentions) {
      e.preventDefault();
      handleAddComment();
    }
  }

  function handleStageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    updateLead(lead.id, { stage: e.target.value as Stage });
  }

  function handleProbabilityChange(e: React.ChangeEvent<HTMLInputElement>) {
    updateLead(lead.id, { probability: parseInt(e.target.value, 10) });
  }

  // Dynamic probability color mapping
  // 0 -> Red, 50 -> Yellow, 100 -> Green
  const getProbabilityColor = (prob: number) => {
    if (prob < 30) return "text-red-400";
    if (prob < 70) return "text-yellow-400";
    return "text-green-400";
  };

  const probColorClass = getProbabilityColor(lead.probability);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[500px] bg-ink-900 border-l border-ink-700 text-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-700 px-6 py-4">
          <h2 className="text-lg font-semibold">Lead Details</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 text-neutral-400 hover:text-white hover:bg-ink-800 rounded-lg transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white hover:bg-ink-800 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <h1 className="text-2xl font-bold mb-6">{lead.title}</h1>

          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-[120px_1fr] items-center text-sm">
              <div className="flex items-center gap-2 text-neutral-400">
                <User className="h-4 w-4" />
                <span>Assign to</span>
              </div>
              <div className="flex items-center gap-3">
                <Avatar initials={lead.ownerName?.substring(0, 2) || "??"} size="sm" />
                <div>
                  <span className="font-medium text-white">{lead.ownerName || "Unassigned"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center text-sm">
              <div className="flex items-center gap-2 text-neutral-400">
                <MapPin className="h-4 w-4" />
                <span>Destination</span>
              </div>
              <div className="font-medium text-white">
                {lead.destination || "—"}
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center text-sm">
              <div className="flex items-center gap-2 text-neutral-400">
                <Building2 className="h-4 w-4" />
                <span>Value</span>
              </div>
              <div className="font-medium text-accent-400">
                {formatMoney(lead.value, currency)}
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center text-sm">
              <div className="text-neutral-400">Stage</div>
              <div>
                <select 
                  value={lead.stage} 
                  onChange={handleStageChange}
                  className="bg-ink-800 border border-ink-700 text-white text-sm font-medium rounded-lg px-3 py-1 outline-none focus:ring-1 focus:ring-accent-500"
                >
                  {Object.entries(STAGE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-neutral-400">Probability</span>
                <span className={`font-semibold ${probColorClass}`}>{lead.probability}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={lead.probability}
                onChange={handleProbabilityChange}
                className="w-full accent-accent-500 h-2 bg-ink-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="border-t border-ink-700 pt-6">
            <h3 className="font-semibold mb-4">Comments</h3>
            
            <form onSubmit={handleAddComment} className="mb-6 relative">
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Add a comment... (Type @ to tag someone)"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-ink-950 rounded-lg border border-ink-700 pl-4 pr-10 py-2.5 text-sm text-white outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="absolute right-2 p-1.5 text-neutral-400 hover:text-white hover:bg-ink-800 rounded transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* Mentions Dropdown */}
              {showMentions && filteredTeam.length > 0 && (
                <div className="absolute bottom-full left-0 mb-1 w-64 bg-ink-800 border border-ink-700 rounded-lg shadow-xl overflow-hidden z-10">
                  {filteredTeam.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => insertMention(user)}
                      className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-ink-700 hover:text-white flex items-center gap-2"
                    >
                      <Avatar initials={user.initials || "??"} size="sm" />
                      {user.name}
                    </button>
                  ))}
                </div>
              )}
            </form>

            <div className="space-y-6 pb-12">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 text-sm">
                  <Avatar initials={comment.userName?.substring(0, 2) || "??"} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between mb-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-white">{comment.userName}</span>
                        <span className="text-xs text-neutral-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <button className="text-neutral-500 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      {/* Highlight mentions in comment */}
                      {comment.comment.split(/(@[a-zA-Z]+)/g).map((part, i) => 
                        part.startsWith('@') ? <span key={i} className="text-accent-400 font-medium">{part}</span> : part
                      )}
                    </p>
                    <button className="text-accent-500 text-xs font-medium mt-1 hover:underline">Reply</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </>
  );
}
