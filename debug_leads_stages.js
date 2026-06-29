const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkLeads() {
  const { data } = await supabase.from('leads').select('title, stage');
  console.log(data);
}

checkLeads();
