const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkClients() {
  const { data, error } = await supabase.from('clients').select('*');
  console.log('Clients count:', data?.length);
  console.log('Error:', error);
}

checkClients();
