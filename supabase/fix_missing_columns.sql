-- Master Fix: Missing Columns & Tables
-- Paste this entirely into the Supabase SQL Editor

-- 1. Create missing koi_purchase_orders table
CREATE TABLE IF NOT EXISTS public.koi_purchase_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  po_number text UNIQUE NOT NULL,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE CASCADE,
  supplier_name text,
  linked_booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'KES',
  status text DEFAULT 'draft',
  issue_date date,
  due_date date,
  created_at timestamp with time zone DEFAULT now()
);

-- Ensure RLS is enabled and policies are created for POs
ALTER TABLE public.koi_purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for sandbox" ON public.koi_purchase_orders;
CREATE POLICY "Allow all for sandbox" ON public.koi_purchase_orders FOR ALL USING (true);

-- 2. Add missing columns to leads
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS days_in_stage integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS travefy_url text;

-- 3. Add missing columns to koi_tasks
ALTER TABLE public.koi_tasks 
ADD COLUMN IF NOT EXISTS department text;

-- 4. Add missing columns to trips
ALTER TABLE public.trips 
ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS booking_name text,
ADD COLUMN IF NOT EXISTS traveler_count integer DEFAULT 1; -- Fallback for alternative spelling

-- 5. Add missing columns to transfers
ALTER TABLE public.transfers
ADD COLUMN IF NOT EXISTS driver_phone text;

-- 6. Add missing columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS phone text;

-- 7. Add missing columns to invoice_edit_approvals
ALTER TABLE public.invoice_edit_approvals
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- 8. Add missing created_at to client_documents (they currently only have uploaded_at)
ALTER TABLE public.client_documents
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
