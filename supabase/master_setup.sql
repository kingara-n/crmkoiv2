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
-- =====================================================================
-- Audit Logging Triggers
-- =====================================================================

-- 1. Create the generic trigger function
-- It captures the operation type (INSERT, UPDATE, DELETE) and records
-- the before/after state as a JSON diff, tagging it with the currently
-- authenticated Supabase user ID.
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS trigger AS $$
DECLARE
  old_data jsonb;
  new_data jsonb;
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
    INSERT INTO audit_log (actor_id, action, entity_type, entity_id, diff)
    VALUES (auth.uid(), 'updated', TG_TABLE_NAME::text, NEW.id, jsonb_build_object('old', old_data, 'new', new_data));
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    old_data = to_jsonb(OLD);
    INSERT INTO audit_log (actor_id, action, entity_type, entity_id, diff)
    VALUES (auth.uid(), 'deleted', TG_TABLE_NAME::text, OLD.id, jsonb_build_object('old', old_data));
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT') THEN
    new_data = to_jsonb(NEW);
    INSERT INTO audit_log (actor_id, action, entity_type, entity_id, diff)
    VALUES (auth.uid(), 'created', TG_TABLE_NAME::text, NEW.id, jsonb_build_object('new', new_data));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to all core operational tables

DROP TRIGGER IF EXISTS audit_clients_trigger ON clients;
CREATE TRIGGER audit_clients_trigger 
AFTER INSERT OR UPDATE OR DELETE ON clients 
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_suppliers_trigger ON suppliers;
CREATE TRIGGER audit_suppliers_trigger 
AFTER INSERT OR UPDATE OR DELETE ON suppliers 
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_leads_trigger ON leads;
CREATE TRIGGER audit_leads_trigger 
AFTER INSERT OR UPDATE OR DELETE ON leads 
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_bookings_trigger ON bookings;
CREATE TRIGGER audit_bookings_trigger 
AFTER INSERT OR UPDATE OR DELETE ON bookings 
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_trips_trigger ON trips;
CREATE TRIGGER audit_trips_trigger 
AFTER INSERT OR UPDATE OR DELETE ON trips 
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_invoices_trigger ON invoices;
CREATE TRIGGER audit_invoices_trigger 
AFTER INSERT OR UPDATE OR DELETE ON invoices 
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
-- Transfers Module Schema

do $$ begin
  create type transfer_status as enum ('pending', 'on_time', 'late', 'missed');
exception when duplicate_object then null; end $$;

create table if not exists transfers (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid references clients on delete set null,
  client_name     text,
  supplier_id     uuid references suppliers on delete set null,
  flight_time     timestamptz not null,
  location        text not null,
  driver_name     text,
  car_type        text,
  reg_plate       text,
  status          transfer_status default 'pending',
  owner_id        uuid references profiles,
  created_at      timestamptz default now()
);

create index if not exists transfers_status_idx on transfers (status);
create index if not exists transfers_flight_time_idx on transfers (flight_time);

alter table transfers enable row level security;

drop policy if exists "auth read transfers" on transfers;
create policy "auth read transfers" on transfers for select to authenticated using (true);

drop policy if exists "auth insert transfers" on transfers;
create policy "auth insert transfers" on transfers for insert to authenticated with check (true);

drop policy if exists "auth update transfers" on transfers;
create policy "auth update transfers" on transfers for update to authenticated using (true);

drop policy if exists "mgmt delete transfers" on transfers;
create policy "mgmt delete transfers" on transfers for delete to authenticated using (current_user_role() = 'management');

-- Audit trigger
DROP TRIGGER IF EXISTS audit_transfers_trigger ON transfers;
CREATE TRIGGER audit_transfers_trigger 
AFTER INSERT OR UPDATE OR DELETE ON transfers 
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
-- Create the client-docs bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-docs', 'client-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload files
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-docs');

-- Policy to allow authenticated users to read files
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'client-docs');

-- Policy to allow authenticated users to delete files
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'client-docs');
-- Supabase pg_cron setup for automated rules
-- This script requires the pg_cron extension to be enabled.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net; -- Required if we want to call edge functions later

-- 1. Client Payment Reminder (3 days before due_date)
CREATE OR REPLACE FUNCTION check_client_payments()
RETURNS void AS $$
BEGIN
  INSERT INTO notifications (id, message, type, created_at, read)
  SELECT 
    gen_random_uuid(),
    'Payment due in 3 days for Invoice ' || i.number || ' (' || i.currency || ' ' || i.amount_kes || ')',
    'warning',
    now(),
    false
  FROM invoices i
  JOIN bookings b ON i.booking_id = b.id
  WHERE i.paid_at IS NULL 
    AND i.due_date = CURRENT_DATE + interval '3 days';
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule('client-payment-reminders', '0 0 * * *', $$ SELECT check_client_payments(); $$);


-- 2. Supplier Payment/Contract Reminder (7 days before contract expires)
CREATE OR REPLACE FUNCTION check_supplier_contracts()
RETURNS void AS $$
BEGIN
  INSERT INTO notifications (id, message, type, created_at, read)
  SELECT 
    gen_random_uuid(),
    'Contract expires in 7 days for Supplier: ' || s.name,
    'warning',
    now(),
    false
  FROM suppliers s
  WHERE s.contract_expires = CURRENT_DATE + interval '7 days';
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule('supplier-contract-reminders', '0 0 * * *', $$ SELECT check_supplier_contracts(); $$);


-- 3. Trip Start Reminder (1 day before start)
CREATE OR REPLACE FUNCTION check_trip_starts()
RETURNS void AS $$
BEGIN
  INSERT INTO notifications (id, message, type, created_at, read)
  SELECT 
    gen_random_uuid(),
    'Trip starts tomorrow for: ' || b.client_name,
    'info',
    now(),
    false
  FROM trips t
  JOIN bookings b ON t.booking_id = b.id
  WHERE t.start_date = CURRENT_DATE + interval '1 day';
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule('trip-start-reminders', '0 0 * * *', $$ SELECT check_trip_starts(); $$);


-- 4. Post-Trip Followup (2 days after end)
CREATE OR REPLACE FUNCTION check_trip_ends()
RETURNS void AS $$
BEGIN
  INSERT INTO notifications (id, message, type, created_at, read)
  SELECT 
    gen_random_uuid(),
    'Trip ended 2 days ago. Reach out for feedback: ' || b.client_name,
    'info',
    now(),
    false
  FROM trips t
  JOIN bookings b ON t.booking_id = b.id
  WHERE t.end_date = CURRENT_DATE - interval '2 days';
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule('trip-end-followup', '0 0 * * *', $$ SELECT check_trip_ends(); $$);


-- 5. Stale Lead Warning (in new_enquiry for > 5 days)
CREATE OR REPLACE FUNCTION check_stale_leads()
RETURNS void AS $$
BEGIN
  INSERT INTO notifications (id, message, type, created_at, read)
  SELECT 
    gen_random_uuid(),
    'Lead has been stagnant for >5 days: ' || l.client_name,
    'danger',
    now(),
    false
  FROM leads l
  WHERE l.stage = 'new_enquiry'
    AND l.created_at < now() - interval '5 days';
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule('stale-leads', '0 0 * * *', $$ SELECT check_stale_leads(); $$);
