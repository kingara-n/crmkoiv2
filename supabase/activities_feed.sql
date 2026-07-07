-- =====================================================================
-- Activities Feed (Communications & Logging)
-- =====================================================================
CREATE TABLE IF NOT EXISTS activities (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('client', 'lead', 'booking')),
  entity_id uuid not null,
  user_id uuid references profiles on delete set null,
  user_name text,
  type text not null check (type in ('note', 'call', 'email', 'meeting', 'system')),
  content text not null,
  created_at timestamptz default now()
);

-- Index for fast lookups on a specific client/lead page
CREATE INDEX IF NOT EXISTS activities_entity_idx on activities (entity_type, entity_id);

-- RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read activities" on activities for select to authenticated using (true);
CREATE POLICY "auth insert activities" on activities for insert to authenticated with check (true);
