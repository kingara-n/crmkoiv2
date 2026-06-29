
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testLead() {
  const { data, error } = await supabase.from('leads').insert({
    title: 'Test Deal',
    value_kes: 1000,
    owner_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', // Seed team member
    owner_name: 'Amara Osei'
  }).select('*').single();

  console.log('Result:', data);
  console.log('Error:', error);
}

testLead();
