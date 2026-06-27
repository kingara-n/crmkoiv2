-- =====================================================================
-- Update Bookings Table for Costs & Travefy
-- =====================================================================
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS costs jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS travefy_url text;

-- =====================================================================
-- Tasks Kanban Tables
-- =====================================================================
CREATE TABLE IF NOT EXISTS koi_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text default 'to-do', -- 'to-do', 'in-progress', 'done'
  due_date date,
  assigned_to uuid references profiles,
  assigned_name text, -- cache the name for easy display
  related_opportunity text, -- e.g., "Email Campaign Setup" or "Booking #123"
  priority text default 'General', -- e.g., "Marketing", "Sales-Oriented", "General"
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS koi_task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references koi_tasks on delete cascade,
  user_id uuid references profiles,
  user_name text,
  comment text not null,
  created_at timestamptz default now()
);

-- =====================================================================
-- Dummy Data for Tasks
-- =====================================================================
INSERT INTO koi_tasks (title, description, status, due_date, assigned_name, related_opportunity, priority)
VALUES 
  ('Follow up on Safari Quote', 'Call Adelina to check if she got the Maasai Mara quote.', 'to-do', CURRENT_DATE + interval '2 days', 'Wade Waren', 'Adelina Smith Safari', 'Sales-Oriented'),
  ('Send Payment Reminder', 'Final balance for Zanzibar trip is due tomorrow.', 'in-progress', CURRENT_DATE + interval '1 day', 'Esther Howard', 'Zanzibar Honeymoon', 'General'),
  ('Book internal flights', 'Need to secure SafariLink flights before they sell out.', 'to-do', CURRENT_DATE, 'Wade Waren', 'Smith Family Trip', 'Operations');
