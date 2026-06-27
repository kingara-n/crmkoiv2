"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { FileText, Upload, Trash2, Download } from "lucide-react";

export function ClientDocuments({ clientId }: { clientId: string }) {
  const documents = useStore((s) => s.clientDocuments.filter(d => d.clientId === clientId));
  const addClientDocument = useStore((s) => s.addClientDocument);
  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${clientId}-${Math.random()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('client-docs').upload(fileName, file);

    if (error) {
      console.error("Error uploading file:", error);
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('client-docs').getPublicUrl(fileName);

    // Save record in database
    await addClientDocument({
      clientId,
      filename: file.name,
      storageUrl: urlData.publicUrl,
    });

    setUploading(false);
  }

  return (
    <div className="mt-6 pt-6 border-t border-ink-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-white">Documents</h3>
        <label className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-ink-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-700 transition-colors">
          <Upload className="h-3 w-3" />
          {uploading ? "Uploading..." : "Upload file"}
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
        </label>
      </div>

      {documents.length === 0 ? (
        <p className="text-xs text-neutral-500 italic">No documents uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between p-2 rounded border border-ink-700 bg-ink-900">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="h-4 w-4 text-neutral-400 shrink-0" />
                <span className="text-xs text-neutral-300 truncate">{doc.filename}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a href={doc.storageUrl} target="_blank" rel="noreferrer" className="p-1 hover:bg-ink-700 rounded text-neutral-400">
                  <Download className="h-3 w-3" />
                </a>
                <button className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
