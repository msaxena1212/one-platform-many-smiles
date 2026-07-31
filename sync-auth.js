import fs from 'fs';
import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function run() {
  const pgClient = new Client({ connectionString });
  await pgClient.connect();

  const fileContent = fs.readFileSync('../user_credentials.md', 'utf-8');
  const lines = fileContent.split('\n');
  
  let inserted = 0;
  
  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('Employee Name') || line.includes('---')) continue;
    
    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 5) {
      const name = parts[1];
      const email = parts[2];
      const password = parts[3];
      const role = parts[4];
      
      if (!email || !email.includes('@')) continue;

      try {
        const existing = await pgClient.query('SELECT id FROM auth.users WHERE email = $1', [email]);
        let userId = existing.rows.length > 0 ? existing.rows[0].id : null;

        if (!userId) {
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
          `, [email, password, JSON.stringify({ full_name: name, role })]);
          userId = res.rows[0]?.id;
        }

        if (userId) {
          await pgClient.query(`
            INSERT INTO public.profiles (id, role, full_name) 
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, full_name = EXCLUDED.full_name
          `, [userId, role, name]);

          await pgClient.query(`
            UPDATE public.employees SET user_id = $1 WHERE email = $2
          `, [userId, email]);
          inserted++;
        }
      } catch (e) {
        console.error("Error inserting", email, e.message);
      }
    }
  }

  console.log(`Successfully synced ${inserted} users into auth.users!`);
  await pgClient.end();
}
run();
