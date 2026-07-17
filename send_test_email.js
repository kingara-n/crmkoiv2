const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function sendTestEmail() {
  const targetEmail = 'kingara@koitravel.co.ke';
  const subject = 'Test Auto-Responder Email';
  const message = 'This is a test email sent from the Koi Travel CRM Lead Auto-Responder system to verify email integrations are 100% active and working.';

  console.log(`Triggering Supabase Edge Function to send test email to ${targetEmail}...`);

  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        email: targetEmail,
        subject: subject,
        message: message
      }
    });

    if (error) {
      console.error('Edge Function returned an error:', error);
    } else {
      console.log('Edge Function response data:', data);
    }
  } catch (err) {
    console.error('Failed to call Edge Function:', err);
  }
}

sendTestEmail();
