-- Calendar Events Migration

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  type text NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_dates ON public.calendar_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user ON public.calendar_events(user_id);

-- Dummy Data (Seed)
INSERT INTO public.calendar_events (id, title, start_date, end_date, type, user_id)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Client Strategy Sync', date_trunc('month', now()) + interval '3 days 10 hours', date_trunc('month', now()) + interval '3 days 11 hours', 'Meeting', null),
  ('c0000000-0000-0000-0000-000000000002', 'Rewarding Marketing', date_trunc('month', now()) + interval '11 days 10 hours', date_trunc('month', now()) + interval '11 days 11 hours', 'Event', null),
  ('c0000000-0000-0000-0000-000000000003', 'Quarterly Review', date_trunc('month', now()) + interval '14 days 10 hours', date_trunc('month', now()) + interval '14 days 11 hours', 'Event', null),
  ('c0000000-0000-0000-0000-000000000004', 'Supplier Follow-up', date_trunc('month', now()) + interval '26 days 10 hours', date_trunc('month', now()) + interval '26 days 11 hours', 'Reminder', null),
  ('c0000000-0000-0000-0000-000000000005', 'Lunch with Team', date_trunc('day', now()) + interval '12 hours 30 minutes', date_trunc('day', now()) + interval '14 hours', 'Meeting', null)
ON CONFLICT (id) DO NOTHING;
