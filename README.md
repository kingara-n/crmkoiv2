# Koi Travel CRM

Internal operations & sales system for Koi Travel Limited.

Stack: **Next.js 14 (App Router) · React 18 · TypeScript · Tailwind · Zustand · dnd-kit · Recharts**. Optional backend: **Supabase**.

---

## What's inside

8 working pages, every interaction wired up:

- **Overview** — live stat cards (revenue, conversion, active bookings, new leads), 12-month revenue chart, live pipeline distribution computed from the kanban, recent bookings, top performers.
- **Pipeline** — kanban board with 5 stages (New enquiry → Quoted → In discussion → Confirmed → Paid). Real drag-and-drop powered by dnd-kit. Each column's total value updates the instant you drop a card. Add deal, edit deal, delete deal, set probability — all working.
- **Bookings** — searchable, sortable, filterable table (All / Won / Pending / Lost). Per-row menu to cycle status or delete. Pagination.
- **Clients** — card grid with stat row, tier filter (Enterprise / Growth / Starter), full Add Client modal with the PRD's leisure-traveller fields (birthday, passport, meal/seat prefs, medical notes).
- **Suppliers** — directory with status filter. Managers add directly, other roles submit for approval. Approve/reject controls only show for managers. Contract-expiry warnings for the 3-month renewal rule.
- **Trips** — split into "On the ground" (live) and "Upcoming". Mark trips as started or completed. Add trip modal.
- **Reports** — conversion rate line chart, live lead-source donut computed from the actual pipeline, downloadable JSON snapshot reports.
- **Settings** — profile, dark mode toggle (instantly themes the whole app), currency selector (every $ figure across the app re-renders), compact view toggle (applies live), reset demo data.

All state persists to `localStorage` via Zustand, so refreshes don't lose your work and the app is fully functional with **zero backend setup**.

---

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The app boots with seed data — six clients, five suppliers, seven leads spread across the pipeline, six bookings, four trips.

To wipe and start fresh: **Settings → Reset to demo data**.

---

## Ship to production (fastest path)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Koi Travel CRM v1"
git branch -M main
git remote add origin https://github.com/<your-username>/koi-crm.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to <https://vercel.com/new> → import the GitHub repo.
2. Framework is auto-detected (Next.js). No environment variables required for v1.
3. Click **Deploy**. You'll get a `*.vercel.app` URL in ~60 seconds.

Every subsequent `git push` redeploys automatically.

### 3. (Optional, anytime) Connect Supabase

The app runs perfectly without this — but when you want data to sync across users and survive a `localStorage` clear, follow these steps.

1. Create a project at <https://supabase.com>.
2. Open **SQL Editor** and paste in the contents of `supabase/schema.sql`. Run it.
3. In **Project Settings → API**, copy the `Project URL` and `anon` public key.
4. In Vercel, add two environment variables to your project:
   - `NEXT_PUBLIC_SUPABASE_URL` = your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
5. Redeploy. (For local dev, copy `.env.local.example` to `.env.local` and fill in the same values.)

Wiring the store to Supabase is the next phase: replace the seed reads in `lib/store.ts` with `supabase.from('clients').select(...)` etc., and replace the mutations with `insert/update/delete`. The schema is intentionally structured to mirror the store's shape so this is a mostly mechanical swap.

---

## Project layout

```
app/
  layout.tsx            Root layout, loads Inter, wraps in AppShell
  page.tsx              Overview dashboard
  login/page.tsx        Demo login
  pipeline/page.tsx     Kanban (the star feature)
  bookings/page.tsx     Sortable bookings table
  clients/page.tsx      Client card grid
  suppliers/page.tsx    Supplier directory + approval flow
  trips/page.tsx        On-the-ground + upcoming trips
  reports/page.tsx      Conversion chart, lead-source donut, downloads
  settings/page.tsx     Profile, theme, currency, compact, reset

components/
  Sidebar.tsx           Navigation with collapse
  TopBar.tsx            Page title, date range, search, notifications, user menu
  AppShell.tsx          Wires it all together, applies live theme + density
  ui/                   Primitives: Card, Badge, Button, Field, Modal, Avatar, ProgressBar, RowMenu
  charts/               Recharts wrappers
  kanban/               KanbanCard, KanbanColumn
  modals/               ClientModal, LeadModal, SupplierModal, TripModal

lib/
  types.ts              All entity types and enums
  format.ts             Currency conversion + display formatting
  seed.ts               Realistic seed data
  store.ts              Zustand store with persist + every mutation the UI needs
  useIsHydrated.ts      Guards against SSR hydration mismatches

supabase/
  schema.sql            Full Postgres schema + RLS sketch
```

---

## Notes for future development

- **eTIMS / KRA** integration is intentionally deferred per the PRD.
- **Audit log writes** — once Supabase is wired, add a trigger or RPC that writes to `audit_log` on every insert/update/delete from authenticated users.
- **Invoice 3-approval rule** — the `invoice_edit_approvals` table is in place. Build the UI in a follow-up: an "Edit invoice" modal that records a pending edit and notifies three approvers; the edit applies once `count(distinct approver_id) >= 3`.
- **Payment reminders** — 3-day-before for client payments, 7-day-before for suppliers. Wire as a Supabase cron (`pg_cron`) that inserts into `notifications`.

---

Made for Koi Travel Limited · Westlands, Nairobi.
