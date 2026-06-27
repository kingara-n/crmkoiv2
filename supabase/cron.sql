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
