-- STEP 1: Delete any existing admin user to start fresh
DELETE FROM auth.users WHERE email = 'admin@koitravel.co.ke';
DELETE FROM public.profiles WHERE email = 'admin@koitravel.co.ke';

-- STEP 2: Now, go to the signup page on your website (e.g. /signup) and register:
-- Email: admin@koitravel.co.ke
-- Password: admin@123
-- Full Name: Super Admin

-- STEP 3: After signing up, run the following query to confirm the email and activate the admin role:
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'admin@koitravel.co.ke';

UPDATE public.profiles
SET status = 'active',
    role = 'management',
    first_name = 'Super',
    last_name = 'Admin'
WHERE email = 'admin@koitravel.co.ke';
