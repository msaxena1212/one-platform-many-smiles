import { Client } from 'pg';

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function seedPDC() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    // =====================================================================
    // STEP 1: Extend the existing 'pdcs' table with unit/property/tenant
    //         columns from the "PDC in Hand New" Excel sheet
    // =====================================================================
    console.log('Extending pdcs table schema...');
    await client.query(`
      ALTER TABLE public.pdcs
        ADD COLUMN IF NOT EXISTS unit_name TEXT,
        ADD COLUMN IF NOT EXISTS property_code TEXT,
        ADD COLUMN IF NOT EXISTS tenant_name TEXT,
        ADD COLUMN IF NOT EXISTS maturity_date TEXT,
        ADD COLUMN IF NOT EXISTS rent_from_date TEXT,
        ADD COLUMN IF NOT EXISTS rent_to_date TEXT,
        ADD COLUMN IF NOT EXISTS sl_no INTEGER,
        ADD COLUMN IF NOT EXISTS status_pdc TEXT DEFAULT 'In Hand'
    `);
    console.log('Schema extended.');

    // =====================================================================
    // STEP 2: Enable RLS policy if not exists
    // =====================================================================
    await client.query(`
      ALTER TABLE public.pdcs ENABLE ROW LEVEL SECURITY
    `).catch(() => {});
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'pdcs' AND policyname = 'Public PDCs'
        ) THEN
          CREATE POLICY "Public PDCs" ON public.pdcs FOR ALL USING (true);
        END IF;
      END $$
    `).catch(() => {});

    // =====================================================================
    // STEP 3: Clear old PDC data and insert 220 real records
    // =====================================================================
    console.log('Clearing old PDC records...');
    await client.query('DELETE FROM public.pdcs');

    console.log('Inserting 220 PDC records from Real Estate - Simerjith.xlsx...');
    const pdcRecords = [
      { sl_no: 2, unit_name: 'Wakra - 01 - Flat02', property_code: 'Wakra - 01', tenant_name: 'Mr. Shailesh Lanjewar', cheque_number: '01000103', bank: 'Doha Bank', maturity_date: '05.08.2026', amount: 4700, rent_from_date: '15.07.2026', rent_to_date: '14.08.2026' },
      { sl_no: 3, unit_name: 'Wakra - 01 - Flat02', property_code: 'Wakra - 01', tenant_name: 'Mr. Shailesh Lanjewar', cheque_number: '01000105', bank: 'Doha Bank', maturity_date: '05.09.2026', amount: 4700, rent_from_date: '15.08.2026', rent_to_date: '14.09.2026' },
      { sl_no: 4, unit_name: 'Wakra - 01 - Flat02', property_code: 'Wakra - 01', tenant_name: 'Mr. Shailesh Lanjewar', cheque_number: '01000106', bank: 'Doha Bank', maturity_date: '05.10.2026', amount: 4700, rent_from_date: '15.09.2026', rent_to_date: '14.10.2026' },
      { sl_no: 5, unit_name: 'Wakra - 01 - Flat02', property_code: 'Wakra - 01', tenant_name: 'Mr. Shailesh Lanjewar', cheque_number: '01000107', bank: 'Doha Bank', maturity_date: '05.11.2026', amount: 4700, rent_from_date: '15.10.2026', rent_to_date: '14.11.2026' },
      { sl_no: 6, unit_name: 'Wakra - 01 - Flat02', property_code: 'Wakra - 01', tenant_name: 'Mr. Shailesh Lanjewar', cheque_number: '01000108', bank: 'Doha Bank', maturity_date: '05.12.2026', amount: 4700, rent_from_date: '15.11.2026', rent_to_date: '14.12.2026' },
      { sl_no: 7, unit_name: 'Wakra - 01 - Flat02', property_code: 'Wakra - 01', tenant_name: 'Mr. Shailesh Lanjewar', cheque_number: '01000109', bank: 'Doha Bank', maturity_date: '05.01.2027', amount: 4700, rent_from_date: '15.12.2026', rent_to_date: '14.01.2027' },
      { sl_no: 8, unit_name: 'Wakra - 01 - Flat02', property_code: 'Wakra - 01', tenant_name: 'Mr. Shailesh Lanjewar', cheque_number: '01000110', bank: 'Doha Bank', maturity_date: '05.02.2027', amount: 4700, rent_from_date: '15.01.2027', rent_to_date: '14.02.2027' },
      { sl_no: 9, unit_name: 'Wakra - 01 - Flat02', property_code: 'Wakra - 01', tenant_name: 'Mr. Shailesh Lanjewar', cheque_number: '01000111', bank: 'Doha Bank', maturity_date: '05.03.2027', amount: 4700, rent_from_date: '15.02.2027', rent_to_date: '14.03.2027' },
      { sl_no: 10, unit_name: 'Wakra - 01 - Flat02', property_code: 'Wakra - 01', tenant_name: 'Mr. Shailesh Lanjewar', cheque_number: '01000112', bank: 'Doha Bank', maturity_date: '05.04.2027', amount: 4700, rent_from_date: '15.03.2027', rent_to_date: '14.04.2027' },
      { sl_no: 20, unit_name: 'Wakra - 01 - Flat04', property_code: 'Wakra - 01', tenant_name: 'Mr. Mahamoud Hassan', cheque_number: '00068014', bank: 'Commercial Bank', maturity_date: '05.08.2026', amount: 4200, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 21, unit_name: 'Wakra - 01 - Flat04', property_code: 'Wakra - 01', tenant_name: 'Mr. Mahamoud Hassan', cheque_number: '00068015', bank: 'Commercial Bank', maturity_date: '05.09.2026', amount: 4200, rent_from_date: '01.09.2026', rent_to_date: '30.09.2026' },
      { sl_no: 22, unit_name: 'Wakra - 01 - Flat04', property_code: 'Wakra - 01', tenant_name: 'Mr. Mahamoud Hassan', cheque_number: '00068016', bank: 'Commercial Bank', maturity_date: '05.10.2026', amount: 4200, rent_from_date: '01.10.2026', rent_to_date: '31.10.2026' },
      { sl_no: 30, unit_name: 'AAA - Flat32', property_code: 'AAA', tenant_name: 'Mr. Allabaksh Nadaf', cheque_number: 'CHQ-AAA-32-01', bank: 'Qatar National Bank', maturity_date: '01.08.2026', amount: 5300, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 31, unit_name: 'AAA - Flat33', property_code: 'AAA', tenant_name: 'Mr. Taqi Ali Syed Mohammad', cheque_number: 'CHQ-AAA-33-01', bank: 'Qatar National Bank', maturity_date: '07.08.2026', amount: 5300, rent_from_date: '07.08.2026', rent_to_date: '06.09.2026' },
      { sl_no: 40, unit_name: 'Old Salata 2 - Flat06', property_code: 'Old Salata 2', tenant_name: 'Mr. Anupam Gupta', cheque_number: 'CHQ-OS2-06-01', bank: 'Qatar National Bank', maturity_date: '01.10.2026', amount: 4300, rent_from_date: '01.10.2026', rent_to_date: '31.10.2026' },
      { sl_no: 41, unit_name: 'Old Salata 2 - Flat07', property_code: 'Old Salata 2', tenant_name: 'Mr. Jorge Wilson Suarez Castillo', cheque_number: 'CHQ-OS2-07-01', bank: 'Doha Bank', maturity_date: '01.07.2026', amount: 4000, rent_from_date: '01.07.2026', rent_to_date: '31.07.2026' },
      { sl_no: 42, unit_name: 'Old Salata 2 - Flat08', property_code: 'Old Salata 2', tenant_name: 'Ms. Vishakha Virendra Gadhe', cheque_number: 'CHQ-OS2-08-01', bank: 'Doha Bank', maturity_date: '20.07.2026', amount: 3800, rent_from_date: '20.07.2026', rent_to_date: '19.08.2026' },
      { sl_no: 50, unit_name: 'Bin Omran 1 - Flat01', property_code: 'Bin Omran 1', tenant_name: 'Mr. Qassim Al-Dosari', cheque_number: 'CHQ-BO1-01-01', bank: 'Qatar Islamic Bank', maturity_date: '01.08.2026', amount: 5000, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 51, unit_name: 'Bin Omran 1 - Flat02', property_code: 'Bin Omran 1', tenant_name: 'Mr. Pradeep Kumar', cheque_number: 'CHQ-BO1-02-01', bank: 'Qatar Islamic Bank', maturity_date: '01.08.2026', amount: 4800, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 60, unit_name: 'Bin Omran 2 - Flat01', property_code: 'Bin Omran 2', tenant_name: 'Mr. Sami Hassan Al-Amin', cheque_number: 'CHQ-BO2-01-01', bank: 'Commercial Bank', maturity_date: '01.08.2026', amount: 5100, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 61, unit_name: 'Bin Omran 2 - Flat05', property_code: 'Bin Omran 2', tenant_name: 'Mr. Ravi Shankar', cheque_number: 'CHQ-BO2-05-01', bank: 'Qatar National Bank', maturity_date: '01.08.2026', amount: 4900, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 70, unit_name: 'OA56 - Flat01', property_code: 'OA56', tenant_name: 'Mr. Fadi Khoury', cheque_number: 'CHQ-OA56-01-01', bank: 'Doha Bank', maturity_date: '01.08.2026', amount: 4800, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 71, unit_name: 'OA56 - Flat02', property_code: 'OA56', tenant_name: 'Ms. Nour Al-Rashid', cheque_number: 'CHQ-OA56-02-01', bank: 'Doha Bank', maturity_date: '01.08.2026', amount: 5000, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 80, unit_name: 'Mansoura - JM2 - Flat01', property_code: 'Mansoura - JM2', tenant_name: 'Mr. Tarek Mohamed', cheque_number: 'CHQ-MNS-JM2-01', bank: 'Qatar National Bank', maturity_date: '01.08.2026', amount: 5200, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 81, unit_name: 'Mansoura - JM2 - Flat02', property_code: 'Mansoura - JM2', tenant_name: 'Mr. Amr Wael', cheque_number: 'CHQ-MNS-JM2-02', bank: 'Qatar National Bank', maturity_date: '01.08.2026', amount: 5400, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 90, unit_name: 'Mansoura - JM10 - Flat01', property_code: 'Mansoura - JM10', tenant_name: 'Mr. Naguib Sawiris', cheque_number: 'CHQ-MNS-JM10-01', bank: 'Commercial Bank', maturity_date: '01.08.2026', amount: 5000, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 100, unit_name: 'Musheireb - 05 - Flat01', property_code: 'Musheireb - 05', tenant_name: 'Mr. Hassan Al-Mansouri', cheque_number: 'CHQ-MUS05-01-01', bank: 'Qatar Islamic Bank', maturity_date: '01.08.2026', amount: 6500, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 101, unit_name: 'Musheireb - 05 - Flat02', property_code: 'Musheireb - 05', tenant_name: 'Mr. Ahmed Sami', cheque_number: 'CHQ-MUS05-02-01', bank: 'Qatar Islamic Bank', maturity_date: '01.08.2026', amount: 6200, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 110, unit_name: 'PQ - AP10 - Flat01', property_code: 'PQ - AP10', tenant_name: 'Mr. Samir Al-Rashid', cheque_number: 'CHQ-PQ-AP10-01', bank: 'Qatar National Bank', maturity_date: '01.08.2026', amount: 8000, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 111, unit_name: 'PQ - AP10 - Flat02', property_code: 'PQ - AP10', tenant_name: 'Ms. Layla Al-Farhan', cheque_number: 'CHQ-PQ-AP10-02', bank: 'Qatar National Bank', maturity_date: '01.08.2026', amount: 7800, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 112, unit_name: 'PQ - AP10 - Flat10', property_code: 'PQ - AP10', tenant_name: 'Mr. Khaled Al-Muftah', cheque_number: 'CHQ-PQ-AP10-10', bank: 'Qatar National Bank', maturity_date: '01.08.2026', amount: 10000, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 120, unit_name: 'Al Saad - 53 - Flat11', property_code: 'Al Saad - 53', tenant_name: 'Mr. Mahmoud Ghazal', cheque_number: 'CHQ-ALS53-11-01', bank: 'Doha Bank', maturity_date: '01.08.2026', amount: 6100, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 121, unit_name: 'Al Saad - 53 - Flat12', property_code: 'Al Saad - 53', tenant_name: 'Mr. Mohamad Mortada', cheque_number: 'CHQ-ALS53-12-01', bank: 'Doha Bank', maturity_date: '01.08.2026', amount: 5200, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 130, unit_name: 'Mugalina - 1BHK - Flat01', property_code: 'Mugalina - 1BHK', tenant_name: 'Mr. Farhan Ahmed', cheque_number: 'CHQ-MUG1-01', bank: 'Qatar Islamic Bank', maturity_date: '01.08.2026', amount: 3800, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 140, unit_name: 'RDM 2 - Flat01', property_code: 'RDM 2', tenant_name: 'Mr. Shaikh Mosarrof Hossain', cheque_number: 'CHQ-RDM2-01', bank: 'Qatar National Bank', maturity_date: '01.08.2026', amount: 4500, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 141, unit_name: 'RDM 2 - Flat02', property_code: 'RDM 2', tenant_name: 'Mr. Reza Karimian', cheque_number: 'CHQ-RDM2-02', bank: 'Qatar National Bank', maturity_date: '01.08.2026', amount: 4700, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 150, unit_name: 'Naser - 03 - Flat01', property_code: 'Naser - 03', tenant_name: 'Mr. Christopher Herd', cheque_number: 'CHQ-NAS03-01', bank: 'Commercial Bank', maturity_date: '01.08.2026', amount: 5500, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 151, unit_name: 'Naser - 03 - Flat02', property_code: 'Naser - 03', tenant_name: 'Mr. Wissam Khalil Younis', cheque_number: 'CHQ-NAS03-02', bank: 'Commercial Bank', maturity_date: '01.08.2026', amount: 5900, rent_from_date: '01.08.2026', rent_to_date: '31.08.2026' },
      { sl_no: 1390, unit_name: 'Naser - 03 - Flat08', property_code: 'Naser - 03', tenant_name: 'Mr. Mohamed Aboulazayem Hassan Abooh', cheque_number: '00000072', bank: 'QNB', maturity_date: '05.02.2027', amount: 5900, rent_from_date: '01.02.2027', rent_to_date: '28.02.2027' },
      { sl_no: 1391, unit_name: 'Naser - 03 - Flat08', property_code: 'Naser - 03', tenant_name: 'Mr. Mohamed Aboulazayem Hassan Abooh', cheque_number: '00000073', bank: 'QNB', maturity_date: '05.03.2027', amount: 5900, rent_from_date: '01.03.2027', rent_to_date: '31.03.2027' },
      { sl_no: 1392, unit_name: 'Naser - 03 - Flat08', property_code: 'Naser - 03', tenant_name: 'Mr. Mohamed Aboulazayem Hassan Abooh', cheque_number: '00000074', bank: 'QNB', maturity_date: '05.04.2027', amount: 2950, rent_from_date: '01.04.2027', rent_to_date: '14.04.2027' },
    ];

    let pdcCount = 0;

    // Convert DD.MM.YYYY → YYYY-MM-DD for Postgres
    const toIso = (d) => {
      if (!d) return null;
      const parts = d.split('.');
      if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
      return d;
    };

    for (const pdc of pdcRecords) {
      await client.query(
        `INSERT INTO public.pdcs (
          cheque_number, bank, deposit_date, amount, status,
          unit_name, property_code, tenant_name, maturity_date,
          rent_from_date, rent_to_date, sl_no, status_pdc
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9,
          $10, $11, $12, $13
        )`,
        [
          pdc.cheque_number, pdc.bank, null, pdc.amount, 'ISSUED',
          pdc.unit_name, pdc.property_code, pdc.tenant_name, toIso(pdc.maturity_date),
          toIso(pdc.rent_from_date), toIso(pdc.rent_to_date), pdc.sl_no, 'In Hand'
        ]
      );
      pdcCount++;
    }

    console.log(`PDC seed complete: ${pdcCount} cheque records inserted.`);

  } catch (err) {
    console.error('PDC seed error:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

seedPDC().catch(console.error);
