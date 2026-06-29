const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInvalidUUID() {
  const { data, error } = await supabase.from('leads').insert({
    client_id: '',
    title: 'Test Deal',
    value_kes: 1000,
    owner_id: 'b732d84a-93f5-4608-8e65-3e284a7e9301', 
    owner_name: 'Sarah Kimani'
  }).select('*').single();

  console.log('Error:', error);
}

testInvalidUUID();
