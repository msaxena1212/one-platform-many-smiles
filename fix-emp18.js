import { Client } from 'pg';
const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function run() {
  const pgClient = new Client({ connectionString });
  await pgClient.connect();
  
  const email = 'emp18@zyno.com';
  const password = 'Pass@biri3e';
  const fullName = 'Abdul Salam Pandarathil Aliamunny';
  const role = 'ADMIN';

  try {
    const res = await pgClient.query(`
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, 
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
        created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $1, 
        crypt($2, gen_salt('bf')), 
        now(), '{"provider":"email","providers":["email"]}', $3, 
        now(), now(), '', '', '', ''
      ) RETURNING id
    `, [email, password, JSON.stringify({ full_name: fullName, role })]);
    
    const userId = res.rows[0].id;
    console.log(`Created user in auth.users with ID: ${userId}`);

    // Update profiles
    await pgClient.query(`
      INSERT INTO public.profiles (id, role, full_name) 
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, full_name = EXCLUDED.full_name
    `, [userId, role, fullName]);
    
    console.log(`Updated profiles table.`);
  } catch(e) {
    console.error(e);
  } finally {
    await pgClient.end();
  }
}
run();
