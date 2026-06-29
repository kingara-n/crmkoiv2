"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminPage() {
  const router = useRouter();
  const hydrated = useIsHydrated();
  const settings = useStore((s) => s.settings);
  const team = useStore((s) => s.team);
  const updateTeamMember = useStore((s) => s.updateTeamMember);
  
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editDept, setEditDept] = useState("");

  useEffect(() => {
    if (hydrated && settings.role !== "management") {
      router.push("/tasks");
    }
  }, [hydrated, settings.role, router]);

  if (!hydrated || settings.role !== "management") return null;

  const handleEdit = (id: string, currentRole: string, currentDept: string) => {
    setEditingRow(id);
    setEditRole(currentRole || "sales");
    setEditDept(currentDept || "");
  };

  const handleSave = async (id: string) => {
    await updateTeamMember(id, { role: editRole, department: editDept });
    setEditingRow(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ink-700/50 mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-accent-500/20 flex items-center justify-center text-accent-500">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin / Access Management</h1>
            <p className="text-sm text-neutral-400">Manage user roles and departments.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <Card padding={false}>
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-ink-900/50 text-neutral-400 border-b border-ink-700/50">
              <tr>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700/50">
              {team.map((user) => (
                <tr key={user.id} className="hover:bg-ink-900/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={user.initials || "??"} size="sm" />
                      <span className="font-medium text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-neutral-300">{user.email}</td>
                  <td className="px-5 py-4">
                    {editingRow === user.id ? (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="bg-ink-900 border border-ink-700 rounded px-2 py-1 text-white text-xs"
                      >
                        <option value="management">Management</option>
                        <option value="sales">Sales</option>
                        <option value="accounts">Accounts</option>
                        <option value="operations">Operations</option>
                      </select>
                    ) : (
                      <Badge tone={user.role === "management" ? "accent" : "neutral"}>
                        {(user.role || "unknown").toUpperCase()}
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {editingRow === user.id ? (
                      <select
                        value={editDept}
                        onChange={(e) => setEditDept(e.target.value)}
                        className="bg-ink-900 border border-ink-700 rounded px-2 py-1 text-white text-xs"
                      >
                        <option value="">-- No Department --</option>
                        <option value="Accounts">Accounts</option>
                        <option value="Operations">Operations</option>
                        <option value="Tickets">Tickets</option>
                        <option value="Tours">Tours</option>
                        <option value="Management">Management</option>
                        <option value="Business Development">Business Development</option>
                      </select>
                    ) : (
                      <span className="text-neutral-300">
                        {user.department || "—"}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {editingRow === user.id ? (
                      <Button variant="primary" className="h-7 text-xs px-2" onClick={() => handleSave(user.id)}>
                        <Save className="h-3 w-3 mr-1" /> Save
                      </Button>
                    ) : (
                      <Button variant="secondary" className="h-7 text-xs px-2" onClick={() => handleEdit(user.id, user.role, user.department || "")}>
                        Edit Access
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
