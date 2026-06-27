"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import {
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { TaskStatus } from "@/lib/types";
import { TaskDetailPanel } from "@/components/modals/TaskDetailPanel";
import { TaskModal } from "@/components/modals/TaskModal";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "to-do", label: "To-do", color: "bg-blue-100 text-blue-800" },
  {
    id: "in-progress",
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-800",
  },
  { id: "done", label: "Done", color: "bg-green-100 text-green-800" },
];

export default function TasksPage() {
  const hydrated = useIsHydrated();
  const settings = useStore((s) => s.settings);
  const tasks = useStore((s) => s.tasks);
  const updateTask = useStore((s) => s.updateTask);

  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  if (!hydrated) return <div className="text-neutral-500 p-2">Loading…</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-4">
      <h1 className="text-2xl font-bold text-white mb-2">
        Welcome back, {settings?.firstName || "User"}
      </h1>
      {/* Header matching the image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ink-700/50 mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">Tasks</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setTaskModalOpen(true)}>
            New Task
          </Button>
        </div>
      </div>


      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 min-w-max h-full pb-6">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="w-[320px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${col.color}`}
                    >
                      {col.label}
                    </span>
                    <span className="text-xs text-neutral-500 bg-ink-800 px-2 py-0.5 rounded-full font-medium">
                      {columnTasks.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1 text-neutral-500 hover:bg-ink-800 rounded">
                      <Plus className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-neutral-500 hover:bg-ink-800 rounded">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setActiveTask(task.id)}
                      className="bg-ink-900 border border-ink-700 rounded-xl p-4 cursor-pointer hover:border-ink-600 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-white group-hover:text-accent-400 transition-colors">
                          {task.title}
                        </h3>
                        <MoreHorizontal className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                      </div>

                      <div className="mb-4 space-y-1">
                        <p className="text-xs text-neutral-500">
                          Project
                        </p>
                        <p className="text-sm text-neutral-300">
                          {task.relatedOpportunity || "—"}
                        </p>
                      </div>

                      <div className="mb-4 space-y-1">
                        <p className="text-xs text-neutral-500">Due Date</p>
                        <p className="text-sm font-medium text-white">
                          {task.dueDate ? formatDate(task.dueDate) : "—"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {task.priority ? (
                          <span
                            className={`text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider ${
                              task.priority === "Marketing"
                                ? "bg-purple-500/20 text-purple-400"
                                : task.priority === "Sales-Oriented"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {task.priority}
                          </span>
                        ) : (
                          <div />
                        )}
                        <Avatar
                          initials={task.assignedName?.substring(0, 2) || "??"}
                          size="sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeTask && (
        <TaskDetailPanel
          task={tasks.find((t) => t.id === activeTask)!}
          onClose={() => setActiveTask(null)}
        />
      )}
      {/* Task Modal */}
      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
    </div>
  );
}
