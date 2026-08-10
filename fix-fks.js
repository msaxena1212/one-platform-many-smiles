import { Client } from 'pg';
const client = new Client({ connectionString: 'postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });
client.connect().then(() => client.query("ALTER TABLE public.assets ADD CONSTRAINT assets_assigned_unit_id_fkey FOREIGN KEY (assigned_unit_id) REFERENCES public.units(id) ON DELETE SET NULL;")).then(() => console.log('Added FK')).catch(console.error).finally(() => client.end());
