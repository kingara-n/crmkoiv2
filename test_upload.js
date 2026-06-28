require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Uploading file...");
  const { data, error } = await supabase.storage.from('client-docs').upload('test-file.txt', 'Hello World', {
    upsert: true
  });
  
  if (error) {
    console.error("Upload error:", error);
  } else {
    console.log("Upload success:", data);
  }
}

run();
