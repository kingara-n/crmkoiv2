const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkData() {
  const tasks = await supabase.from('koi_tasks').select('*');
  console.log('Tasks in DB:', tasks.data?.length);
  const leads = await supabase.from('leads').select('*');
  console.log('Leads in DB:', leads.data?.length);
  const profiles = await supabase.from('profiles').select('*');
  console.log('Profiles in DB:', profiles.data?.length);
}

checkData();
