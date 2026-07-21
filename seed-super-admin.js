import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://rnebpqnzignwjeukgztz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzU4ODIsImV4cCI6MjA5OTc1MTg4Mn0.maLd6Jgr8uggrfu5uZg9sjRmG0z0r7NlaMB4wIdSRTg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function seedSuperAdmin() {
  console.log("Seeding Super Admin user...");
  
  // 1. Create the user in Auth
  const email = "superadmin@zyno.com";
  const password = "password123";
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: "System Administrator",
        role: "SUPER_ADMIN"
      }
    }
  });

  if (authError) {
    console.error("Auth Error:", authError.message);
    if (!authError.message.includes("already registered")) {
      return;
    }
  }

  // 2. Update the role in public.profiles directly via pg
  const pgClient = new Client({ connectionString });
  await pgClient.connect();
  
  try {
    const res = await pgClient.query(`
      UPDATE public.profiles 
      SET role = 'SUPER_ADMIN', full_name = 'System Administrator'
      WHERE id IN (
        SELECT id FROM auth.users WHERE email = $1
      )
    `, [email]);
    
    console.log(`Updated ${res.rowCount} profile(s) to SUPER_ADMIN.`);
    console.log(`Login Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (err) {
    console.error("PG Error:", err);
  } finally {
    await pgClient.end();
  }
}

seedSuperAdmin();
