-- =====================================================================
-- Leads Comments System
-- =====================================================================
CREATE TABLE IF NOT EXISTS koi_lead_comments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads on delete cascade,
  user_id text,
  user_name text,
  comment text not null,
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE koi_lead_comments ENABLE ROW LEVEL SECURITY;

-- Allow all for sandbox
CREATE POLICY "Allow all for sandbox" ON koi_lead_comments FOR ALL USING (true);
