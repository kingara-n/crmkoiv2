const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkProfiles() {
  const { data, error } = await supabase.from('profiles').select('*');
  console.log('Error:', error);
  console.log('Profiles:', data);
}

checkProfiles();
