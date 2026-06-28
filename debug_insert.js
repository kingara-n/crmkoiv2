// removed dotenv
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const newClient = {
    name: "Joe",
    type: "individual",
    trip_type: "Travel", // store.ts mapToSnake maps tripType to trip_type
    email: "joe@example.com",
    phone: "123456",
    country: "Kenya"
  };

  console.log("Attempting to insert:", newClient);
  const { data, error } = await supabase.from("clients").insert(newClient).select();
  
  if (error) {
    console.error("\n❌ SUPABASE ERROR:", error);
  } else {
    console.log("\n✅ SUCCESS! Inserted data:", data);
  }
}

testInsert();
