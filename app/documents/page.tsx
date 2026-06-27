"use client";

import { useState, useMemo } from "react";
import { Search, Plus, FileText, Download, Trash2, Calendar, File } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DocumentUploadModal } from "@/components/modals/DocumentUploadModal";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { formatDate } from "@/lib/format";

export default function DocumentsPage() {
  const hydrated = useIsHydrated();
  const documents = useStore((s) => s.clientDocuments);
  const clients = useStore((s) => s.clients);

  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const filtered = useMemo(() => {
    let rows = documents;
    if (filterType !== "all") {
      rows = rows.filter((d) => d.docType === filterType);
    }
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (d) =>
          d.filename.toLowerCase().includes(q) ||
          clients.find((c) => c.id === d.clientId)?.name.toLowerCase().includes(q)
      );
    }
    return rows.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }, [documents, clients, filterType, query]);

  if (!hydrated) return <div className="text-neutral-500 p-2">Loading…</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-ink-700/50">
        <div>
          <h1 className="text-2xl font-semibold text-white">Document Vault</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage all client passports, receipts, and contracts securely.</p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)} icon={<Plus className="h-4 w-4" />}>
          Upload Document
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="search"
            placeholder="Search filenames or clients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-900 pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent-500/60"
          />
        </div>
        <div className="flex gap-2">
          {["all", "passport", "payment_receipt", "contract", "flight_ticket", "other"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`rounded-lg px-3 py-1.5 text-sm capitalize transition-colors ${
                filterType === f
                  ? "bg-accent-500 text-black font-medium"
                  : "border border-ink-700 bg-ink-900 text-neutral-300 hover:bg-ink-850"
              }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-ink-700 text-xs uppercase text-neutral-500">
                <th className="px-5 py-3 font-medium">Document</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Uploaded Date</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500">
                    No documents found.
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => {
                  const client = clients.find((c) => c.id === doc.clientId);
                  return (
                    <tr key={doc.id} className="hover:bg-ink-900/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-ink-800 flex items-center justify-center">
                            <File className="h-4 w-4 text-accent-400" />
                          </div>
                          <span className="font-medium text-white">{doc.filename}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={doc.docType === "passport" ? "success" : doc.docType === "payment_receipt" ? "accent" : "neutral"}>
                          {(doc.docType || "Unknown").replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-neutral-300">{client?.name || "Unknown"}</td>
                      <td className="px-5 py-4 text-neutral-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                          {formatDate(doc.uploadedAt)}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button 
                          variant="secondary" 
                          className="h-8 text-xs px-2"
                          onClick={() => alert("Simulation: Document would download from " + doc.storageUrl)}
                        >
                          <Download className="h-3.5 w-3.5 mr-1" /> Download
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {uploadModalOpen && (
        <DocumentUploadModal
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
        />
      )}
    </div>
  );
}
