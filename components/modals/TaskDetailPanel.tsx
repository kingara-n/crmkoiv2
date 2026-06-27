"use client";

import { useState } from "react";
import { X, Calendar, MoreHorizontal, User, Tag } from "lucide-react";
import { Task, TaskStatus } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

export function TaskDetailPanel({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  const [newComment, setNewComment] = useState("");
  const updateTask = useStore((s) => s.updateTask);
  const addTaskComment = useStore((s) => s.addTaskComment);
  const comments = useStore((s) => s.taskComments).filter((c) => c.taskId === task.id);
  const settings = useStore((s) => s.settings);

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    await addTaskComment({
      taskId: task.id,
      userId: "local-user", // Since we don't have true auth here, hardcode ID
      userName: `${settings.firstName} ${settings.lastName}`.trim() || "Local Admin",
      comment: newComment.trim(),
    });
    setNewComment("");
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    updateTask(task.id, { status: e.target.value as TaskStatus });
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[500px] bg-white text-ink-950 shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Task Details</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <MoreHorizontal className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <h1 className="text-2xl font-bold mb-6">{task.title}</h1>

          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-[120px_1fr] items-center text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <User className="h-4 w-4" />
                <span>Assign to</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Avatar src="" initials={task.assignedName?.substring(0, 2) || "??"} size="sm" />
                <span>{task.assignedName || "Unassigned"}</span>
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Tag className="h-4 w-4" />
                <span>Opportunities</span>
              </div>
              <div className="font-medium">
                {task.relatedOpportunity || "—"} 
                <span className="text-blue-500 ml-2 cursor-pointer hover:underline text-xs">View Details</span>
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Due date</span>
              </div>
              <div className="font-medium">
                {task.dueDate ? formatDate(task.dueDate) : "No due date"}
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center text-sm">
              <div className="text-gray-500">Status</div>
              <div>
                <select 
                  value={task.status} 
                  onChange={handleStatusChange}
                  className="bg-gray-100 border-none text-sm font-medium rounded-lg px-3 py-1 outline-none"
                >
                  <option value="to-do">To-do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-8">
            <h3 className="font-semibold mb-3">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {task.description || "No description provided."}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold mb-4">Comments</h3>
            
            <form onSubmit={handleAddComment} className="mb-6">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </form>

            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar src="" initials={comment.userName?.substring(0, 2).toUpperCase() || "??"} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between mb-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm">{comment.userName}</span>
                        <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{comment.comment}</p>
                    <button className="text-blue-500 text-xs font-medium mt-1 hover:underline">Reply</button>
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
