import fs from 'fs';
import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function run() {
  const pgClient = new Client({ connectionString });
  await pgClient.connect();

  const fileContent = fs.readFileSync('../user_credentials.md', 'utf-8');
  const lines = fileContent.split('\n');
  
  let updated = 0;
  
  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('Employee Name') || line.includes('---')) continue;
    
    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 5) {
      const email = parts[2];
      const password = parts[3];
      
      if (!email || !email.includes('@')) continue;

      try {
        const res = await pgClient.query(`
          UPDATE auth.users 
          SET 
            encrypted_password = crypt($2, gen_salt('bf')),
            email_confirmed_at = now()
          WHERE email = $1
        `, [email, password]);
        
        if (res.rowCount > 0) {
          updated++;
        }
      } catch (e) {
        console.error("Error updating", email, e.message);
      }
    }
  }

  console.log(`Successfully fixed passwords and email_confirmed_at for ${updated} users!`);
  await pgClient.end();
}
run();
