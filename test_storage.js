const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testStorage() {
  console.log('Testing Supabase Storage for "client-docs" bucket...');
  
  // We need to sign in as the admin user first so we are authenticated!
  console.log('Signing in as admin...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@koitravel.co.ke',
    password: 'admin@123'
  });

  if (authError) {
    console.error('Sign in failed:', authError);
    return;
  }

  console.log('Signed in successfully. User ID:', authData.user.id);

  const bucketName = 'client-docs';
  
  console.log(`Checking bucket "${bucketName}"...`);
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error('List buckets failed:', bucketsError);
    return;
  }

  console.log('Available buckets:', buckets.map(b => b.name));

  const bucketExists = buckets.some(b => b.name === bucketName);
  if (!bucketExists) {
    console.error(`Bucket "${bucketName}" does not exist in Supabase!`);
    return;
  }

  console.log(`Attempting to upload a dummy file to "${bucketName}"...`);
  const fileName = `test_${Date.now()}.txt`;
  const fileContent = 'This is a test file to verify storage integration.';
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(fileName, Buffer.from(fileContent), {
      contentType: 'text/plain',
      upsert: true
    });

  if (uploadError) {
    console.error('Upload failed:', uploadError);
  } else {
    console.log('Upload successful! Path:', uploadData.path);
    
    // Now let's try to delete the test file
    console.log('Attempting to delete the test file...');
    const { data: deleteData, error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (deleteError) {
      console.error('Delete failed:', deleteError);
    } else {
      console.log('Delete successful:', deleteData);
      console.log('Supabase Storage is 100% working!');
    }
  }
}

testStorage();
