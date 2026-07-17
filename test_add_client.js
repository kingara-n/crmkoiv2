const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAddClient() {
  console.log('Testing inserting type: individual...');
  const res1 = await supabase.from('clients').insert({
    name: 'Test Individual',
    type: 'individual',
    email: 'individual@example.com'
  }).select();

  if (res1.error) {
    console.error('Error inserting individual:', res1.error.message);
  } else {
    console.log('Success inserting individual:', res1.data);
  }

  console.log('\nTesting inserting type: leisure...');
  const res2 = await supabase.from('clients').insert({
    name: 'Test Leisure',
    type: 'leisure',
    email: 'leisure@example.com'
  }).select();

  if (res2.error) {
    console.error('Error inserting leisure:', res2.error.message);
  } else {
    console.log('Success inserting leisure:', res2.data);
  }
}

testAddClient();
