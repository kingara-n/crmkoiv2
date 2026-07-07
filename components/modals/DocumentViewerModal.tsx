"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function DocumentViewerModal({
  open,
  onClose,
  storageUrl,
  filename,
}: {
  open: boolean;
  onClose: () => void;
  storageUrl: string | null;
  filename: string;
}) {
  if (!storageUrl) return null;

  return (
    <Modal open={open} onClose={onClose} title={filename}>
      <div className="flex flex-col h-[70vh] w-full mt-4">
        <iframe
          src={storageUrl}
          className="flex-1 w-full bg-white rounded-lg"
          title={filename}
        />
        <div className="flex justify-end mt-4">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
