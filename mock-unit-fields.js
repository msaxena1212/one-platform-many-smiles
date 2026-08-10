import { Client } from 'pg';

async function run() {
  const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });
  
  const depositTypes = ["Cash", "Cheque", "Bank Transfer"];

  try {
    await client.connect();
    console.log('Populating mock data for new unit fields...');
    
    const res = await client.query("SELECT id FROM public.units");
    let count = 0;

    for (const row of res.rows) {
      const cooling = "C" + Math.floor(Math.random() * 1000000);
      const depType = depositTypes[Math.floor(Math.random() * depositTypes.length)];
      const depAmount = Math.floor(Math.random() * 5000) + 1000;
      const contract = "CNTR-" + Math.floor(Math.random() * 10000);
      const docRecv = Math.random() > 0.3; // 70% true
      
      // Random date in the last year
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 365));
      const handover = date.toISOString().split('T')[0];

      await client.query(`
        UPDATE public.units 
        SET cooling_meter_no = $1,
            security_deposit_type = $2,
            security_deposit_amount = $3,
            contract_no = $4,
            documents_received = $5,
            handover_date = $6
        WHERE id = $7
      `, [cooling, depType, depAmount, contract, docRecv, handover, row.id]);
      count++;
    }
    
    console.log(`Updated ${count} units with mock data.`);
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
