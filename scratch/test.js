const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

console.log("URL:", supabaseUrl);
console.log("Key:", supabaseKey ? "Exists" : "Missing");

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    // 1. Fetch one record to see structure
    const { data: fetchResult, error: fetchError } = await supabase
      .from('companions')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error("Fetch Error:", fetchError);
    } else {
      console.log("Fetched structure:", fetchResult);
    }

    // 2. Try inserting a companion with a test author ID
    const testCompanion = {
      name: "Test Companion",
      subject: "maths",
      topic: "Algebra",
      voice: "male",
      style: "formal",
      duration: 15,
      author: "user_test123"
    };

    console.log("Attempting insert of:", testCompanion);
    const { data: insertResult, error: insertError } = await supabase
      .from('companions')
      .insert(testCompanion)
      .select();

    if (insertError) {
      console.error("Insert Error:", insertError);
    } else {
      console.log("Insert Success:", insertResult);
    }
  } catch (err) {
    console.error("Script Exception:", err);
  }
}

run();
