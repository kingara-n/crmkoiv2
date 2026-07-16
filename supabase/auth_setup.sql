-- 1. Alter profiles table to add status column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status text DEFAULT 'awaiting_approval' CHECK (status IN ('active', 'awaiting_approval', 'rejected'));

-- 2. Create Row Level Security (RLS) policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read profiles" ON public.profiles;
CREATE POLICY "Allow authenticated read profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Allow users to update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
CREATE POLICY "Allow users to insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- 3. Create the trigger function to automatically create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, status)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.raw_user_meta_data->>'full_name', ' ', 1), 'User'),
    coalesce(new.raw_user_meta_data->>'last_name', split_part(new.raw_user_meta_data->>'full_name', ' ', 2), ''),
    'sales',
    'awaiting_approval'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Set up the super admin account profile in profiles
-- (Note: Ensure the auth user with ID '240931a3-063c-4d56-ab8f-d521d1322101' is created via signUp first)
INSERT INTO public.profiles (id, email, first_name, last_name, role, status)
VALUES ('240931a3-063c-4d56-ab8f-d521d1322101', 'admin@koitravel.co.ke', 'Super', 'Admin', 'management', 'active')
ON CONFLICT (id) DO UPDATE
SET role = 'management', status = 'active', first_name = 'Super', last_name = 'Admin';
