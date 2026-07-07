import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { CalendarEvent } from "@/lib/types";

interface CalendarEventModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<CalendarEvent>;
}

export function CalendarEventModal({ open, onClose, initialData }: CalendarEventModalProps) {
  const addCalendarEvent = useStore((s) => s.addCalendarEvent);
  const currentUser = useStore((s) => s.settings.userId) || "00000000-0000-0000-0000-000000000000";

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    startDate: initialData?.startDate?.split("T")[0] || new Date().toISOString().split("T")[0],
    endDate: initialData?.endDate?.split("T")[0] || new Date().toISOString().split("T")[0],
    type: initialData?.type || "Meeting",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.endDate) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await addCalendarEvent({
        title: formData.title,
        // For simplicity, treat the date as an ISO datetime
        startDate: `${formData.startDate}T00:00:00Z`,
        endDate: `${formData.endDate}T23:59:59Z`,
        type: formData.type,
        userId: currentUser,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-md rounded-xl bg-ink-900 border border-ink-700 shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-ink-700/50">
            <Dialog.Title className="text-lg font-semibold text-white">
              Create Event
            </Dialog.Title>
            <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Event Title</label>
              <input
                required
                type="text"
                className="w-full bg-ink-950 border border-ink-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Sales Sync"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Start Date</label>
                <input
                  required
                  type="date"
                  className="w-full bg-ink-950 border border-ink-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">End Date</label>
                <input
                  required
                  type="date"
                  className="w-full bg-ink-950 border border-ink-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Type</label>
              <select
                className="w-full bg-ink-950 border border-ink-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Meeting">Meeting</option>
                <option value="Event">Event</option>
                <option value="Reminder">Reminder</option>
                <option value="Task">Task</option>
              </select>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-ink-700/50">
              <Button variant="secondary" onClick={onClose} type="button" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Create Event"}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
