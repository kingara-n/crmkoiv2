const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const tables = [
  'invoice_edit_approvals',
  'invoices',
  'transfers',
  'trip_travellers',
  'trips',
  'bookings',
  'koi_purchase_orders',
  'koi_lead_comments',
  'leads',
  'client_documents',
  'clients',
  'rate_sheets',
  'suppliers',
  'koi_task_comments',
  'koi_tasks',
  'koi_notifications',
  'calendar_events',
  'exchange_rates',
  'audit_log'
];

async function clearData() {
  console.log('Starting database clearing of dummy data...');
  for (const table of tables) {
    console.log(`Clearing table ${table}...`);
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Deletes all rows safely
    if (error) {
      console.error(`Error clearing ${table}:`, error);
    } else {
      console.log(`Cleared ${table} successfully.`);
    }
  }

  console.log('Clearing dummy profiles (keeping super admin)...');
  const adminId = '240931a3-063c-4d56-ab8f-d521d1322101';
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .neq('id', adminId);

  if (profileError) {
    console.error('Error clearing profiles:', profileError);
  } else {
    console.log('Dummy profiles cleared successfully (except admin).');
  }

  console.log('Database clear completed.');
}

clearData();
