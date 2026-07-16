const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createAdmin() {
  const email = 'admin@koitravel.co.ke';
  const password = 'admin@123';

  console.log(`Attempting to sign up ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: 'Super',
        last_name: 'Admin',
      }
    }
  });

  if (authError) {
    console.error('Auth signUp error:', authError);
    if (authError.message.includes('already registered')) {
      console.log('User already registered. Attempting to sign in to check...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInError) {
        console.error('Auth signIn error:', signInError);
        return;
      }
      console.log('Successfully signed in. User ID:', signInData.user.id);
      await setupProfile(signInData.user.id);
    }
    return;
  }

  if (authData.user) {
    console.log('User signed up successfully. User ID:', authData.user.id);
    await setupProfile(authData.user.id);
  }
}

async function setupProfile(userId) {
  console.log('Checking profiles table...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  console.log('Current profile in DB:', profile);
  console.log('Profile select error:', profileError);

  const profileData = {
    id: userId,
    email: 'admin@koitravel.co.ke',
    first_name: 'Super',
    last_name: 'Admin',
    role: 'management',
    status: 'active' // We will try inserting this status. If it fails due to missing column, we'll know!
  };

  if (!profile) {
    console.log('No profile found. Inserting profile...');
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select();
    console.log('Insert result:', insertData);
    console.error('Insert error:', insertError);
  } else {
    console.log('Profile exists. Updating profile...');
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'management',
        status: 'active',
        first_name: 'Super',
        last_name: 'Admin'
      })
      .eq('id', userId)
      .select();
    console.log('Update result:', updateData);
    console.error('Update error:', updateError);
  }
}

createAdmin();
