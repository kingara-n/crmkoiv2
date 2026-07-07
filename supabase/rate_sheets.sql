-- Rate Sheets Migration (Robust Version)

CREATE TABLE IF NOT EXISTS public.rate_sheets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY
);

-- Ensure all columns exist in case the table was created previously without them
ALTER TABLE public.rate_sheets ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id) ON DELETE CASCADE;
ALTER TABLE public.rate_sheets ADD COLUMN IF NOT EXISTS season_name text DEFAULT 'Standard Season';
ALTER TABLE public.rate_sheets ADD COLUMN IF NOT EXISTS start_date date DEFAULT CURRENT_DATE;
ALTER TABLE public.rate_sheets ADD COLUMN IF NOT EXISTS end_date date DEFAULT CURRENT_DATE;
ALTER TABLE public.rate_sheets ADD COLUMN IF NOT EXISTS resident_rate_kes numeric NOT NULL DEFAULT 0;
ALTER TABLE public.rate_sheets ADD COLUMN IF NOT EXISTS non_resident_rate_usd numeric NOT NULL DEFAULT 0;
ALTER TABLE public.rate_sheets ADD COLUMN IF NOT EXISTS currency text DEFAULT 'KES';
ALTER TABLE public.rate_sheets ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.rate_sheets ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.rate_sheets ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_rate_sheets_supplier ON public.rate_sheets(supplier_id);
CREATE INDEX IF NOT EXISTS idx_rate_sheets_dates ON public.rate_sheets(start_date, end_date);
