const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkPolicies() {
  const { data, error } = await supabase.rpc('get_policies', {});
  // Wait, RPC get_policies doesn't exist.
  // Instead, let's query pg_policies using an admin query if we have service_role key.
  // We don't have service_role key, so we can't query pg_policies.
  
  // Let's just try inserting a lead assigned to Sarah (b732d84a-93f5-4608-8e65-3e284a7e9301)
  // and see if data is returned!
  
  const { data: leadData, error: leadErr } = await supabase.from('leads').insert({
    title: 'Test Deal for Sarah',
    value_kes: 2000,
    owner_id: 'b732d84a-93f5-4608-8e65-3e284a7e9301',
    owner_name: 'Sarah Kimani'
  }).select('*').single();

  console.log('Lead Insert Result:', leadData);
  console.log('Lead Insert Error:', leadErr);
  
  const { data: taskData, error: taskErr } = await supabase.from('koi_tasks').insert({
    title: 'Test Task for Sarah',
    assigned_to: 'b732d84a-93f5-4608-8e65-3e284a7e9301',
    assigned_name: 'Sarah Kimani'
  }).select('*').single();

  console.log('Task Insert Result:', taskData);
  console.log('Task Insert Error:', taskErr);
}

checkPolicies();
