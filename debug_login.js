const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugLogin() {
  const email = 'admin@koitravel.co.ke';
  const password = 'admin@123';
  
  console.log(`Testing auth sign-in for ${email}...`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('Login failed:', error.message, error.status);
  } else {
    console.log('Login successful! User ID:', data.user.id);
    console.log('Email confirmed at:', data.user.email_confirmed_at);
  }
}

debugLogin();
