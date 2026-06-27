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
