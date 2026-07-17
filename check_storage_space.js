const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkStorage() {
  // Sign in as admin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@koitravel.co.ke',
    password: 'admin@123'
  });

  if (authError) {
    console.error('Sign in failed:', authError.message);
    return;
  }

  // List buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error('Error listing buckets:', bucketsError);
    return;
  }

  console.log('Available Buckets:', buckets.map(b => b.name));
}

checkStorage();
