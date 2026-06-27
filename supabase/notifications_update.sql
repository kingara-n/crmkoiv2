-- =====================================================================
-- Notifications System
-- =====================================================================
CREATE TABLE IF NOT EXISTS koi_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  author_name text,
  author_initials text,
  action_text text not null,
  entity_title text,
  read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE koi_notifications ENABLE ROW LEVEL SECURITY;

-- Allow all for sandbox
CREATE POLICY "Allow all for sandbox" ON koi_notifications FOR ALL USING (true);
