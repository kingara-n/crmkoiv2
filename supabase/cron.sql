-- Supabase pg_cron setup for automated Payment Reminders
-- This script requires the pg_cron extension to be enabled in your Supabase project.
-- Go to Database -> Extensions and search for "pg_cron" to enable it first.

-- Ensure pg_cron is available
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. Client Payment Reminder (3 days before due_date)
-- We check all invoices that have a due_date exactly 3 days from now,
-- and insert a notification for the booking owner.

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

-- Schedule the client payment check to run every day at midnight (UTC)
SELECT cron.schedule(
  'client-payment-reminders',
  '0 0 * * *',
  $$ SELECT check_client_payments(); $$
);

-- 2. Supplier Payment Reminder (7 days before contract expires)
-- We check all suppliers with a contract_expires exactly 7 days from now.

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

-- Schedule the supplier contract check to run every day at midnight (UTC)
SELECT cron.schedule(
  'supplier-contract-reminders',
  '0 0 * * *',
  $$ SELECT check_supplier_contracts(); $$
);
