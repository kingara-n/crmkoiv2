-- Koi Travel CRM · Supabase schema
-- Run in Supabase SQL Editor (or via supabase db push) after creating a project.

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS stage CASCADE;
DROP TYPE IF EXISTS currency CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS tier CASCADE;
DROP TYPE IF EXISTS supplier_type CASCADE;
DROP TYPE IF EXISTS supplier_status CASCADE;
DROP TYPE IF EXISTS trip_status CASCADE;

-- =====================================================================
-- Enums
-- =====================================================================

do $$ begin
  create type user_role as enum ('management', 'sales', 'accounts', 'operations');
exception when duplicate_object then null; end $$;

do $$ begin
  create type stage as enum ('new_enquiry', 'quoted', 'in_discussion', 'confirmed', 'paid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type currency as enum ('KES', 'USD', 'EUR', 'GBP');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('confirmed', 'pending', 'lost');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tier as enum ('enterprise', 'growth', 'starter');
exception when duplicate_object then null; end $$;

do $$ begin
  create type supplier_type as enum ('hotel', 'camp', 'transport', 'dmc', 'airline');
exception when duplicate_object then null; end $$;

do $$ begin
  create type supplier_status as enum ('approved', 'pending', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type trip_status as enum ('upcoming', 'on_ground', 'completed');
exception when duplicate_object then null; end $$;


-- =====================================================================
-- Profiles (1:1 with auth.users)
-- =====================================================================
create table if not exists profiles (
  id           uuid primary key references auth.users on delete cascade,
  email        text unique not null,
  first_name   text,
  last_name    text,
  role         user_role default 'sales',
  timezone     text default 'Africa/Nairobi (EAT)',
  dark_mode    boolean default true,
  currency     currency default 'KES',
  compact_view boolean default false,
  created_at   timestamptz default now()
);

-- =====================================================================
-- Clients
-- =====================================================================
create table if not exists clients (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  type            text not null check (type in ('leisure', 'corporate')),
  industry        text,
  tier            tier default 'growth',
  city            text,
  country         text default 'Kenya',
  email           text,
  phone           text,
  birthday        date,
  passport        text,
  meal_preference text,
  seat_preference text,
  medical_notes   text,
  revenue_kes     bigint default 0,
  active_deals    int default 0,
  last_contact    date default current_date,
  health_score    int default 75,
  created_at      timestamptz default now()
);

create index if not exists clients_name_idx on clients (name);
create index if not exists clients_tier_idx on clients (tier);

-- Client documents (any file type, stored in Supabase Storage bucket 'client-docs')
create table if not exists client_documents (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references clients on delete cascade,
  filename    text not null,
  storage_url text not null,
  doc_type    text,                       -- e.g. 'contract', 'passport-scan'
  expires_at  date,                       -- contracts trigger 3-month reminder
  uploaded_by uuid references profiles,
  uploaded_at timestamptz default now()
);

-- =====================================================================
-- Suppliers
-- =====================================================================
create table if not exists suppliers (
  id                       uuid primary key default gen_random_uuid(),
  name                     text not null,
  type                     supplier_type not null,
  category                 text,
  city                     text,
  country                  text default 'Kenya',
  accounts_email           text,
  bookings_email           text,
  phone                    text,
  child_policy             text,
  cancellation_policy      text,
  payment_terms            text,
  resident_rate_kes        bigint default 0,
  non_resident_rate_usd    int default 0,
  capacity                 int default 0,
  amenities                text[] default '{}',
  status                   supplier_status default 'pending',
  contract_expires         date,
  created_by               uuid references profiles,
  created_at               timestamptz default now()
);

create index if not exists suppliers_status_idx on suppliers (status);

-- =====================================================================
-- Leads (pipeline cards)
-- =====================================================================
create table if not exists leads (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid references clients on delete set null,
  title         text not null,
  destination   text,
  value_kes     bigint not null default 0,
  currency      currency default 'KES',
  stage         stage default 'new_enquiry',
  probability   int default 50,
  owner_id      uuid references profiles,
  owner_name    text,
  source        text,
  created_at    timestamptz default now()
);

create index if not exists leads_stage_idx on leads (stage);
create index if not exists leads_owner_idx on leads (owner_id);

-- =====================================================================
-- Bookings (confirmed leads, table view)
-- =====================================================================
create table if not exists bookings (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid references clients on delete set null,
  lead_id       uuid references leads on delete set null,
  client_name   text,
  contact_name  text,
  contact_email text,
  destination   text,
  value_kes     bigint default 0,
  currency      currency default 'KES',
  status        booking_status default 'pending',
  stage         stage,
  owner_name    text,
  close_date    date,
  created_at    timestamptz default now()
);

-- =====================================================================
-- Trips
-- =====================================================================
create table if not exists trips (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  destination     text,
  start_date      date not null,
  end_date        date not null,
  status          trip_status default 'upcoming',
  traveller_count int default 1,
  client_id       uuid references clients on delete set null,
  client_name     text,
  owner_id        uuid references profiles,
  owner_name      text,
  created_at      timestamptz default now()
);

-- Travellers on a group trip (for the "one rep OR all travellers" requirement)
create table if not exists trip_travellers (
  id                uuid primary key default gen_random_uuid(),
  trip_id           uuid references trips on delete cascade,
  full_name         text not null,
  email             text,
  is_primary_contact boolean default false,
  send_info_to_self boolean default false
);

-- =====================================================================
-- Invoices (with 3-approval edit rule)
-- =====================================================================
create table if not exists invoices (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid references bookings on delete cascade,
  client_id     uuid references clients on delete set null,
  number        text unique not null,
  amount_kes    bigint not null,
  currency      currency default 'KES',
  due_date      date,
  paid_at       timestamptz,
  notes         text,
  created_at    timestamptz default now()
);

create table if not exists invoice_edit_approvals (
  id              uuid primary key default gen_random_uuid(),
  invoice_id      uuid references invoices on delete cascade,
  requested_by    uuid references profiles,
  approver_id     uuid references profiles,
  approved_at     timestamptz default now(),
  diff_json       jsonb            -- snapshot of what was edited
);

-- =====================================================================
-- Exchange rates (set monthly by Accounts)
-- =====================================================================
create table if not exists exchange_rates (
  id        uuid primary key default gen_random_uuid(),
  from_ccy  currency not null,
  to_ccy    currency not null,
  rate      numeric(12,4) not null,
  set_at    timestamptz default now(),
  set_by    uuid references profiles,
  unique (from_ccy, to_ccy, set_at)
);

-- =====================================================================
-- Notifications & audit log
-- =====================================================================
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles on delete cascade,
  message    text not null,
  type       text default 'info',
  read       boolean default false,
  created_at timestamptz default now()
);

create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references profiles,
  action      text not null,             -- 'created', 'updated', 'deleted'
  entity_type text not null,             -- 'client', 'lead', 'booking', ...
  entity_id   uuid,
  diff        jsonb,
  created_at  timestamptz default now()
);

create index if not exists audit_actor_idx on audit_log (actor_id);
create index if not exists audit_entity_idx on audit_log (entity_type, entity_id);

-- =====================================================================
-- Row Level Security — sketch
-- =====================================================================
-- Enable everywhere
alter table profiles            enable row level security;
alter table clients             enable row level security;
alter table client_documents    enable row level security;
alter table suppliers           enable row level security;
alter table leads               enable row level security;
alter table bookings            enable row level security;
alter table trips               enable row level security;
alter table trip_travellers     enable row level security;
alter table invoices            enable row level security;
alter table invoice_edit_approvals enable row level security;
alter table exchange_rates      enable row level security;
alter table notifications       enable row level security;
alter table audit_log           enable row level security;

-- Helper: get current user's role
create or replace function current_user_role() returns user_role
language sql stable as $$
  select role from profiles where id = auth.uid()
$$;

-- Everyone authenticated can read clients/suppliers/leads/bookings/trips
-- (Refine these per the PRD before going to production — e.g. accounts only
-- sees individual AR/AP totals, not aggregate office numbers.)
drop policy if exists "auth read clients" on clients;
create policy "auth read clients" on clients for select to authenticated using (true);
drop policy if exists "auth read suppliers" on suppliers;
create policy "auth read suppliers" on suppliers for select to authenticated using (true);
drop policy if exists "auth read leads" on leads;
create policy "auth read leads" on leads for select to authenticated using (true);
drop policy if exists "auth read bookings" on bookings;
create policy "auth read bookings" on bookings for select to authenticated using (true);
drop policy if exists "auth read trips" on trips;
create policy "auth read trips" on trips for select to authenticated using (true);

-- Authenticated users can insert and update most records
drop policy if exists "auth insert clients" on clients;
create policy "auth insert clients" on clients for insert to authenticated with check (true);
drop policy if exists "auth update clients" on clients;
create policy "auth update clients" on clients for update to authenticated using (true);

drop policy if exists "auth insert leads" on leads;
create policy "auth insert leads" on leads for insert to authenticated with check (true);
drop policy if exists "auth update leads" on leads;
create policy "auth update leads" on leads for update to authenticated using (true);

drop policy if exists "auth insert bookings" on bookings;
create policy "auth insert bookings" on bookings for insert to authenticated with check (true);
drop policy if exists "auth update bookings" on bookings;
create policy "auth update bookings" on bookings for update to authenticated using (true);

drop policy if exists "auth insert trips" on trips;
create policy "auth insert trips" on trips for insert to authenticated with check (true);
drop policy if exists "auth update trips" on trips;
create policy "auth update trips" on trips for update to authenticated using (true);

-- Suppliers: anyone authenticated can submit (status='pending'), only managers approve.
drop policy if exists "auth submit supplier" on suppliers;
create policy "auth submit supplier" on suppliers for insert to authenticated with check (true);

drop policy if exists "manager update supplier" on suppliers;
create policy "manager update supplier" on suppliers for update to authenticated
  using (current_user_role() = 'management');

-- Deletes: only management
drop policy if exists "mgmt delete clients" on clients;
create policy "mgmt delete clients" on clients for delete to authenticated using (current_user_role() = 'management');
drop policy if exists "mgmt delete suppliers" on suppliers;
create policy "mgmt delete suppliers" on suppliers for delete to authenticated using (current_user_role() = 'management');
drop policy if exists "mgmt delete leads" on leads;
create policy "mgmt delete leads" on leads for delete to authenticated using (current_user_role() = 'management');
drop policy if exists "mgmt delete bookings" on bookings;
create policy "mgmt delete bookings" on bookings for delete to authenticated using (current_user_role() = 'management');
drop policy if exists "mgmt delete trips" on trips;
create policy "mgmt delete trips" on trips for delete to authenticated using (current_user_role() = 'management');

-- Audit log: management can read; everyone can insert their own actions via trigger
drop policy if exists "mgmt read audit" on audit_log;
create policy "mgmt read audit" on audit_log for select to authenticated using (current_user_role() = 'management');

-- Notifications: users only see their own
drop policy if exists "self read notifications" on notifications;
create policy "self read notifications" on notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "self update notifications" on notifications;
create policy "self update notifications" on notifications for update to authenticated using (user_id = auth.uid());
