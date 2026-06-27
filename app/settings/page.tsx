"use client";

import { useState, useEffect } from "react";
import {
  Palette, Globe, Database, Save, RefreshCw, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label, Toggle } from "@/components/ui/Field";
import { Avatar } from "@/components/ui/Avatar";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { UserSettings, Currency } from "@/lib/types";

const TIMEZONES = [
  "Africa/Nairobi (EAT)",
  "Africa/Lagos (WAT)",
  "Africa/Cairo (EET)",
  "Europe/London (BST)",
  "America/New_York (ET)",
];

const ROLES = [
  "Sales Manager",
  "Director",
  "Senior Travel Consultant",
  "Travel Consultant",
  "Accounts",
  "Operations",
];

export default function SettingsPage() {
  const hydrated = useIsHydrated();
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const resetDemo = useStore((s) => s.resetDemoData);

  // Local draft so the user can edit and explicitly save.
  // But: toggles (dark mode, currency, compact view) apply *live* — this is what
  // the user asked for explicitly, otherwise the toggle feels broken.
  const [draft, setDraft] = useState<UserSettings>(settings);
  const [saved, setSaved] = useState(false);

  // Sync draft when settings change externally (e.g. demo reset)
  useEffect(() => {
    if (hydrated) setDraft(settings);
  }, [hydrated, settings]);

  function applyToggle<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    // Update both draft + persisted store so toggles feel instant
    setDraft((d) => ({ ...d, [key]: value }));
    updateSettings({ [key]: value } as Partial<UserSettings>);
  }

  function handleSave() {
    updateSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  function handleReset() {
    if (confirm("Reset everything to seed demo data? Any added clients, leads, suppliers, etc. will be lost.")) {
      resetDemo();
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    }
  }

  if (!hydrated) return <div className="text-neutral-500 p-2">Loading…</div>;

  const initials = `${draft.firstName[0] ?? ""}${draft.lastName[0] ?? ""}`.toUpperCase() || "JD";

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Profile section */}
      <Card>
        <h2 className="mb-4 text-base font-semibold text-white">Profile</h2>
        <div className="mb-6 flex items-center gap-4">
          <Avatar initials={initials} size="lg" />
          <div>
            <button
              onClick={() => alert("Avatar upload will be wired up once Supabase Storage is connected — see README.")}
              className="rounded-lg border border-ink-700 bg-ink-800 px-3 py-1.5 text-sm text-neutral-200 hover:bg-ink-700"
            >
              Change Avatar
            </button>
            <p className="mt-1 text-xs text-neutral-500">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="fn">First Name</Label>
            <Input id="fn" value={draft.firstName} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="ln">Last Name</Label>
            <Input id="ln" value={draft.lastName} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="em">Email</Label>
            <Input id="em" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select id="role" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="tz">Timezone</Label>
            <Select id="tz" value={draft.timezone} onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}>
              {TIMEZONES.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </div>
        </div>
      </Card>

      {/* Display preferences — apply live */}
      <Card>
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">Display Preferences</h2>
          <p className="text-xs text-neutral-500">Customize how data is displayed. These apply instantly.</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-ink-700 bg-ink-850/30 px-4 py-3">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="text-sm font-medium text-white">Dark Mode</p>
                <p className="text-xs text-neutral-500">Use dark theme for the interface</p>
              </div>
            </div>
            <Toggle checked={draft.darkMode} onChange={(v) => applyToggle("darkMode", v)} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-ink-700 bg-ink-850/30 px-4 py-3">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="text-sm font-medium text-white">Currency Format</p>
                <p className="text-xs text-neutral-500">All amounts across the app re-render in this currency</p>
              </div>
            </div>
            <div className="w-36">
              <Select
                value={draft.currency}
                onChange={(e) => applyToggle("currency", e.target.value as Currency)}
              >
                <option value="KES">KSh (KES)</option>
                <option value="USD">$ (USD)</option>
                <option value="EUR">€ (EUR)</option>
                <option value="GBP">£ (GBP)</option>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-ink-700 bg-ink-850/30 px-4 py-3">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="text-sm font-medium text-white">Compact View</p>
                <p className="text-xs text-neutral-500">Reduce padding to fit more on screen</p>
              </div>
            </div>
            <Toggle checked={draft.compactView} onChange={(v) => applyToggle("compactView", v)} />
          </div>
        </div>
      </Card>

      {/* Danger zone / demo reset */}
      <Card className="border-ink-700">
        <h2 className="mb-2 text-base font-semibold text-white">Demo data</h2>
        <p className="mb-4 text-xs text-neutral-500">
          The app is running in localStorage demo mode. Use this to wipe your changes and start fresh from seed data.
        </p>
        <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={handleReset}>
          Reset to demo data
        </Button>
      </Card>

      {/* Save bar */}
      <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-card border border-ink-700 bg-ink-900/95 backdrop-blur-md p-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-accent-400">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
        <Button icon={<Save className="h-4 w-4" />} onClick={handleSave}>Save Changes</Button>
      </div>

      {/* Helpful note */}
      <div className="flex items-start gap-3 rounded-lg border border-sky-500/20 bg-sky-500/5 px-4 py-3 text-xs text-sky-200/90">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-sky-400" />
        <p>
          Every setting on this page is wired to the live app state and persisted in your browser. Try toggling Dark Mode or
          switching Currency to KSh — the rest of the app updates immediately. To make settings sync across devices, connect Supabase (see README).
        </p>
      </div>
    </div>
  );
}
