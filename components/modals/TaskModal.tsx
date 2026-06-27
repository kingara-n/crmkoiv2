"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";

export function TaskModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const addTask = useStore((s) => s.addTask);
  const team = useStore((s) => s.team);
  const settings = useStore((s) => s.settings);
  const addNotification = useStore((s) => s.addNotification);

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;
    const dueDate = formData.get("dueDate") as string;
    const assignedTo = formData.get("assignedTo") as string;
    const status = formData.get("status") as any;

    let assignedName = undefined;
    if (assignedTo) {
      const user = team.find((t) => t.id === assignedTo);
      if (user) assignedName = user.name;
    }

    try {
      await addTask({
        title,
        description,
        priority,
        dueDate,
        assignedTo,
        assignedName,
        status,
      });

      // Send notification if assigned to someone else
      if (assignedTo && assignedTo !== "local-user") {
        await addNotification({
          userId: assignedTo,
          authorName: `${settings.firstName} ${settings.lastName}`,
          authorInitials: `${settings.firstName.charAt(0)}${settings.lastName.charAt(0)}`,
          actionText: `assigned a task "${title}" to you.`,
        });
      }

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Title</label>
          <input
            name="title"
            required
            className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
            placeholder="E.g. Follow up on Safari Quote"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
          <textarea
            name="description"
            className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
            rows={3}
            placeholder="Task details..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Status</label>
            <select
              name="status"
              className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="to-do">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Priority</label>
            <select
              name="priority"
              className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="General">General</option>
              <option value="Sales-Oriented">Sales-Oriented</option>
              <option value="Operations">Operations</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Assignee</label>
            <select
              name="assignedTo"
              className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="">Unassigned</option>
              {team.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
