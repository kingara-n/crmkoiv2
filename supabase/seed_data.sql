-- Mock Data for Koi Travel CRM
-- Run this in your Supabase SQL Editor to populate the CRM with demo entries!

-- 1. Create a dummy profile (since we need an owner for records)
-- (We use gen_random_uuid() for simplicity, or we can just use auth.users if we had one.
-- But since profiles references auth.users, inserting directly might fail if the auth user doesn't exist.
-- To bypass this constraint safely for dummy data, we'll temporarily disable the constraint, insert, and re-enable, OR just skip profiles and use NULL for owner_id where possible to avoid foreign key errors on a blank project.)

-- We will use NULL for user_id/owner_id to ensure it doesn't break foreign key constraints on an empty auth schema.

-- 2. Clients
INSERT INTO clients (id, name, type, industry, tier, city, country, email, phone, revenue_kes, active_deals, health_score) VALUES
  (gen_random_uuid(), 'Safari Explorers Ltd', 'corporate', 'Tech', 'enterprise', 'Nairobi', 'Kenya', 'info@safariexplorers.com', '+254700111222', 1500000, 2, 95),
  (gen_random_uuid(), 'Jane Wanjiru', 'leisure', NULL, 'growth', 'Mombasa', 'Kenya', 'jane.w@email.com', '+254711222333', 350000, 1, 80),
  (gen_random_uuid(), 'John Smith', 'leisure', NULL, 'starter', 'London', 'UK', 'john.smith@email.com', '+447911123456', 0, 1, 60);

-- 3. Suppliers
INSERT INTO suppliers (id, name, type, category, city, country, accounts_email, resident_rate_kes, status) VALUES
  (gen_random_uuid(), 'Mara Serena Safari Lodge', 'hotel', 'Luxury Lodge', 'Masai Mara', 'Kenya', 'accounts@serena.com', 45000, 'approved'),
  (gen_random_uuid(), 'Safarilink Aviation', 'airline', 'Domestic Flight', 'Nairobi', 'Kenya', 'billing@flysafarilink.com', 15000, 'approved'),
  (gen_random_uuid(), 'Cruiser Safaris Transport', 'transport', '4x4 Vehicles', 'Nairobi', 'Kenya', 'finance@cruisersafaris.com', 20000, 'approved');

-- 4. Leads
INSERT INTO leads (id, client_id, title, destination, value_kes, stage, probability) 
SELECT gen_random_uuid(), id, name || ' - Mara Gateway', 'Masai Mara', 250000, 'in_discussion', 60 FROM clients LIMIT 1;

INSERT INTO leads (id, client_id, title, destination, value_kes, stage, probability) 
SELECT gen_random_uuid(), id, name || ' - Diani Retreat', 'Diani Beach', 120000, 'new_enquiry', 30 FROM clients OFFSET 1 LIMIT 1;

INSERT INTO leads (id, client_id, title, destination, value_kes, stage, probability) 
SELECT gen_random_uuid(), id, name || ' - Amboseli Weekend', 'Amboseli', 80000, 'quoted', 75 FROM clients OFFSET 2 LIMIT 1;

-- 5. Bookings
INSERT INTO bookings (id, client_id, client_name, contact_email, destination, value_kes, status, stage)
SELECT gen_random_uuid(), id, name, email, 'Zanzibar Honeymoon', 450000, 'confirmed', 'paid' FROM clients LIMIT 1;

INSERT INTO bookings (id, client_id, client_name, contact_email, destination, value_kes, status, stage)
SELECT gen_random_uuid(), id, name, email, 'Serengeti Migration', 800000, 'pending', 'confirmed' FROM clients OFFSET 1 LIMIT 1;

INSERT INTO bookings (id, client_id, client_name, contact_email, destination, value_kes, status, stage)
SELECT gen_random_uuid(), id, name, email, 'Tsavo East Safari', 150000, 'confirmed', 'paid' FROM clients OFFSET 2 LIMIT 1;

-- 6. Trips
INSERT INTO trips (id, name, destination, start_date, end_date, status, traveller_count, client_name)
VALUES
  (gen_random_uuid(), 'Zanzibar Honeymoon', 'Zanzibar', CURRENT_DATE + interval '5 days', CURRENT_DATE + interval '12 days', 'upcoming', 2, 'Jane Wanjiru'),
  (gen_random_uuid(), 'Corporate Retreat', 'Naivasha', CURRENT_DATE - interval '2 days', CURRENT_DATE + interval '1 day', 'on_ground', 15, 'Safari Explorers Ltd'),
  (gen_random_uuid(), 'Tsavo East Safari', 'Tsavo', CURRENT_DATE - interval '30 days', CURRENT_DATE - interval '25 days', 'completed', 4, 'John Smith');

-- 7. Transfers
INSERT INTO transfers (id, client_name, flight_time, location, driver_name, car_type, reg_plate, status)
VALUES
  (gen_random_uuid(), 'Jane Wanjiru', CURRENT_DATE + interval '5 days', 'JKIA Terminal 1A', 'David Kamau', 'Toyota Landcruiser', 'KCA 123A', 'pending'),
  (gen_random_uuid(), 'Safari Explorers Ltd', CURRENT_DATE - interval '2 days', 'Wilson Airport', 'Samuel Ochieng', 'Mercedes Sprinter', 'KDD 456B', 'on_time'),
  (gen_random_uuid(), 'John Smith', CURRENT_DATE - interval '30 days', 'Moi International Airport', 'Peter Njoroge', 'Toyota Alphard', 'KBB 789C', 'missed');

-- 8. Invoices
INSERT INTO invoices (id, number, amount_kes, currency, due_date, paid_at, notes, booking_id)
SELECT gen_random_uuid(), 'INV-00101', 450000, 'KES', CURRENT_DATE + interval '10 days', NULL, '50% deposit required', id FROM bookings LIMIT 1;

INSERT INTO invoices (id, number, amount_kes, currency, due_date, paid_at, notes, booking_id)
SELECT gen_random_uuid(), 'INV-00102', 800000, 'KES', CURRENT_DATE - interval '5 days', CURRENT_TIMESTAMP, 'Fully paid via wire', id FROM bookings OFFSET 1 LIMIT 1;

INSERT INTO invoices (id, number, amount_kes, currency, due_date, paid_at, notes, booking_id)
SELECT gen_random_uuid(), 'INV-00103', 150000, 'KES', CURRENT_DATE + interval '2 days', NULL, 'Pending final balance', id FROM bookings OFFSET 2 LIMIT 1;

-- 9. Audit Log (Staff Activity)
INSERT INTO audit_log (id, action, entity_type, diff, created_at) VALUES
  (gen_random_uuid(), 'created', 'lead', '{"new": {"title": "Zanzibar Honeymoon", "value": 450000}}', CURRENT_TIMESTAMP - interval '2 hours'),
  (gen_random_uuid(), 'updated', 'invoice', '{"old": {"amount": 400000}, "new": {"amount": 450000}}', CURRENT_TIMESTAMP - interval '5 hours'),
  (gen_random_uuid(), 'deleted', 'client', '{"old": {"name": "Spam Lead"}}', CURRENT_TIMESTAMP - interval '1 day');
