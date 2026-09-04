const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log("Missing URL or Key in .env.local");
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Try to login to get a token
  console.log("Logging in...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'kurtdylanviray@gmail.com', // guess based on previous interactions or I can just use a fake token to see error
    password: process.env.DEV_ADMIN_PASSWORD || '12345678'
  });
  
  if (error) {
    console.error("Login failed:", error.message);
    // Let's just try with a fake token to see if it returns Auth session missing
    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.fake";
    const res = await fetch("http://localhost:3000/api/admin/theme", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${fakeToken}`
      },
      body: JSON.stringify({ theme: "cafe" })
    });
    const text = await res.text();
    console.log("Fake token response:", text);
    return;
  }
  
  const token = data.session.access_token;
  console.log("Got token. Calling API...");
  
  const res = await fetch("http://localhost:3000/api/admin/theme", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ theme: "cafe" })
  });
  
  const text = await res.text();
  console.log("Response:", res.status, text);
}

run();
