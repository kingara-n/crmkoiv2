const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data, error } = await supabase.from('clients').insert({
    name: 'Test Client',
    type: 'leisure',
    tier: 'growth',
    country: 'Kenya',
    email: 'test@test.com',
    phone: '123',
    active_deals: 0,
    revenue_kes: 0,
    health_score: 75
  }).select().single();
  
  console.log("Error:", error);
  console.log("Data:", data);
}

testInsert();
