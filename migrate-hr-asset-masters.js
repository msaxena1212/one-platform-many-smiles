import { Client } from 'pg';

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function migrate() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('=== Migrating HR, Asset & Property Masters ===\n');

    // ── 1. Create Tables ──────────────────────────────────────────────────────
    await client.query(`
      -- HR Masters
      CREATE TABLE IF NOT EXISTS public.mst_genders (
        id   SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        sort_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS public.mst_departments (
        id   SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS public.mst_designations (
        id   SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS public.mst_employment_types (
        id   SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS public.mst_work_locations (
        id   SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS public.mst_employee_statuses (
        id   SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );

      -- Asset Masters
      CREATE TABLE IF NOT EXISTS public.mst_asset_categories (
        id   SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS public.mst_asset_subcategories (
        id          SERIAL PRIMARY KEY,
        name        TEXT NOT NULL,
        category_id INTEGER REFERENCES public.mst_asset_categories(id) ON DELETE SET NULL,
        UNIQUE(name, category_id)
      );

      CREATE TABLE IF NOT EXISTS public.mst_asset_ownership_types (
        id   SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS public.mst_asset_conditions (
        id   SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS public.mst_asset_statuses (
        id   SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );

      -- Property Masters
      CREATE TABLE IF NOT EXISTS public.mst_property_codes (
        id   SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS public.mst_unit_codes (
        id               SERIAL PRIMARY KEY,
        code             TEXT NOT NULL,
        property_code_id INTEGER REFERENCES public.mst_property_codes(id) ON DELETE SET NULL,
        UNIQUE(code, property_code_id)
      );
    `);
    console.log('✓ Tables created.');

    // ── 2. Enable RLS ──────────────────────────────────────────────────────────
    const tables = [
      'mst_genders','mst_departments','mst_designations','mst_employment_types',
      'mst_work_locations','mst_employee_statuses','mst_asset_categories',
      'mst_asset_subcategories','mst_asset_ownership_types','mst_asset_conditions',
      'mst_asset_statuses','mst_property_codes','mst_unit_codes'
    ];

    for (const t of tables) {
      await client.query(`ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY;`);
      await client.query(`DROP POLICY IF EXISTS "public_all" ON public.${t};`);
      await client.query(`CREATE POLICY "public_all" ON public.${t} FOR ALL USING (true) WITH CHECK (true);`);
    }
    console.log('✓ RLS enabled.');

    // ── 3. Seed HR Masters ─────────────────────────────────────────────────────
    console.log('\nSeeding HR Masters...');

    const genders = ['Male', 'Female', 'Other'];
    for (const g of genders) {
      await client.query(
        `INSERT INTO public.mst_genders (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;`,
        [g]
      );
    }

    const departments = [
      'Management','Finance & Accounts','HR & Administration','Sales & Marketing',
      'Operations','Procurement','Information Technology','Customer Service',
      'Maintenance / Technical','Warehouse','Other'
    ];
    for (const d of departments) {
      await client.query(
        `INSERT INTO public.mst_departments (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;`,
        [d]
      );
    }

    const designations = [
      'Director','General Manager','Manager','Assistant Manager','Accountant',
      'HR Executive','Admin Executive','Sales Executive','Operations Executive',
      'Procurement Executive','IT Support','Customer Service Executive','Supervisor',
      'Technician','Driver','Office Assistant','Other'
    ];
    for (const d of designations) {
      await client.query(
        `INSERT INTO public.mst_designations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;`,
        [d]
      );
    }

    const employmentTypes = ['Permanent','Contract','Temporary','Part-Time','Intern'];
    for (const e of employmentTypes) {
      await client.query(
        `INSERT INTO public.mst_employment_types (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;`,
        [e]
      );
    }

    const workLocations = ['Head Office','Branch 1','Branch 2','Warehouse','Client Site','Remote','Other'];
    for (const w of workLocations) {
      await client.query(
        `INSERT INTO public.mst_work_locations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;`,
        [w]
      );
    }

    const employeeStatuses = ['Active','Probation','On Leave','Resigned','Terminated','Inactive'];
    for (const s of employeeStatuses) {
      await client.query(
        `INSERT INTO public.mst_employee_statuses (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;`,
        [s]
      );
    }

    // ── 4. Seed Asset Masters ──────────────────────────────────────────────────
    console.log('Seeding Asset Masters...');

    const assetCategoryMap = {
      'IT Equipment':                    ['Laptop','Desktop','Monitor','Printer','Scanner','Mobile Phone','Tablet','Router','Server'],
      'Mobile Device':                   ['Mobile Phone','Tablet'],
      'Furniture':                       ['Desk','Chair','Cabinet'],
      'Office Equipment':                ['Printer','Scanner'],
      'Vehicle':                         ['Motor Car'],
      'Tools & Equipment':               [],
      'Appliances':                      ['Cooking Range','Cooler','Dishwasher','Kitchen Appliances','Microwave Oven','Refrigerator','Washing Machine'],
      'Other':                           ['Router'],
      'Access Control':                  ['Gate Barrier'],
      'CCTV Systems':                    ['Cameras'],
      'Commercial Kitchen Equipments':   ['Cooking Range','Cooler','Dishwasher','Pasta Cooker','Griller','Hood'],
      'Furniture & Fixtures':            ['Vehicle','Tool','Bed','Bedroom Set','Bench','Cabinet','Carpet','Chair','Coffee Table','Curtain','Desk','Dining Set','Dresser','Housing Keeping Trolleys','Lamp','Mattress','Miscellaneous Furnitures','Rack and Shelves','Sofa Set','Stands','Stool','Swimming Pool Furniture','Table','Television','Wardrobe'],
      'Investment Properties Building':  [],
      'Investment Properties Land':      [],
      'Machinery (Light)':               ['Gate Barrier'],
      'Sports and Gym Equipment':        ['Abdominal','Abduction Machine','Angled Bar','Bikes','Chest Press','Disc Rack','Dumbbells','Gymnasium Equipment','Machine For leg','Mat','Olympic Bar','Press Machine','Treadmill','Weighing Scale','Weight Plates'],
      'Tools and Equipment':             ['Audio Equipment','Carpet Dryer','Chain Saw','Pressure Cleaner','Safety Equipment','Scrubber Dryer','Trolleys','Vacuum Cleaner'],
      'Vehicles':                        ['Motor Car'],
    };

    // Remove duplicates in map, insert categories first
    const categoryNames = Object.keys(assetCategoryMap);
    const categoryIds = {};

    for (const cat of categoryNames) {
      const res = await client.query(
        `INSERT INTO public.mst_asset_categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id;`,
        [cat]
      );
      categoryIds[cat] = res.rows[0].id;
    }

    // Insert subcategories linked to their parent
    for (const [cat, subs] of Object.entries(assetCategoryMap)) {
      const catId = categoryIds[cat];
      for (const sub of subs) {
        await client.query(
          `INSERT INTO public.mst_asset_subcategories (name, category_id) VALUES ($1, $2) ON CONFLICT (name, category_id) DO NOTHING;`,
          [sub, catId]
        );
      }
    }

    const ownershipTypes = ['Company Owned','Leased','Rented','Client Owned'];
    for (const o of ownershipTypes) {
      await client.query(
        `INSERT INTO public.mst_asset_ownership_types (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;`,
        [o]
      );
    }

    const conditions = ['New','Good','Fair','Damaged','Under Repair','Scrap'];
    for (const c of conditions) {
      await client.query(
        `INSERT INTO public.mst_asset_conditions (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;`,
        [c]
      );
    }

    const assetStatuses = ['Available','Assigned','Under Repair','Lost','Disposed','Inactive'];
    for (const s of assetStatuses) {
      await client.query(
        `INSERT INTO public.mst_asset_statuses (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;`,
        [s]
      );
    }

    // ── 5. Seed Property & Unit Codes ─────────────────────────────────────────
    console.log('Seeding Property & Unit Codes...');

    const propertyUnitMap = {
      'AAA': [
        'AAA-GF1','AAA-GF2','AAA-Flat11','AAA-Flat12','AAA-Flat13','AAA-Flat14','AAA-Flat15',
        'AAA-Flat16','AAA-Flat21','AAA-Flat22','AAA-Flat23','AAA-Flat24','AAA-Flat25','AAA-Flat26',
        'AAA-Flat31','AAA-Flat32','AAA-Flat33','AAA-Flat34','AAA-Flat35','AAA-Flat36',
        'AAA-Flat41','AAA-Flat42','AAA-Flat43','AAA-Flat44','AAA-Flat45','AAA-Flat46',
        'AAA-Flat51','AAA-Flat52','AAA-Flat53','AAA-Flat54','AAA-Flat55','AAA-Flat56',
        'AAA-Flat61','AAA-Flat62','AAA-Flat63','AAA-Flat64','AAA-Flat65','AAA-Flat66',
        'AAA-Flat71','AAA-Flat72','AAA-Flat73','AAA-Flat74','AAA-Flat75','AAA-Flat76',
      ],
      'Old Salata 2': [
        'OldSalata2-Flat01','OldSalata2-Flat02','OldSalata2-Flat03','OldSalata2-Flat04',
        'OldSalata2-Flat05','OldSalata2-Flat06','OldSalata2-Flat07','OldSalata2-Flat08',
        'OldSalata2-Flat09','OldSalata2-Flat10','OldSalata2-Flat11','OldSalata2-Flat12',
        'OldSalata2-Flat13','OldSalata2-Flat14','OldSalata2-Flat15','OldSalata2-Flat16',
        'OldSalata2-Flat17','OldSalata2-Flat18','OldSalata2-Flat19','OldSalata2-Flat20',
        'OldSalata2-Flat21','OldSalata2-Flat22','OldSalata2-Flat23','OldSalata2-Flat24',
        'OldSalata2-Flat25','OldSalata2-Flat26','OldSalata2-Flat27','OldSalata2-Flat28',
      ],
      'Bin Omran 1': [
        'BinOmran1-Flat01','BinOmran1-Flat02','BinOmran1-Flat03','BinOmran1-Flat04',
        'BinOmran1-Flat05','BinOmran1-Flat06','BinOmran1-Flat07','BinOmran1-Flat08',
        'BinOmran1-Flat09','BinOmran1-Flat10','BinOmran1-Flat11','BinOmran1-Flat12',
        'BinOmran1-Flat13','BinOmran1-Flat14','BinOmran1-Flat15',
      ],
      'Bin Omran 2': [
        'BinOmran2-Flat01','BinOmran2-Flat02','BinOmran2-Flat03','BinOmran2-Flat04',
        'BinOmran2-Flat05','BinOmran2-Flat06','BinOmran2-Flat07','BinOmran2-Flat08',
        'BinOmran2-Flat09','BinOmran2-Flat10','BinOmran2-Flat11','BinOmran2-Flat12',
        'BinOmran2-Flat13','BinOmran2-Flat14','BinOmran2-Flat15','BinOmran2-Flat16',
        'BinOmran2-Flat17','BinOmran2-Flat18','BinOmran2-Flat19','BinOmran2-Flat20',
        'BinOmran2-Flat21','BinOmran2-Flat22','BinOmran2-Flat23','BinOmran2-Flat24',
        'BinOmran2-Flat25','BinOmran2-Flat26','BinOmran2-Flat27','BinOmran2-Flat28',
        'BinOmran2-Flat29','BinOmran2-Flat30','BinOmran2-Flat31','BinOmran2-Flat32',
        'BinOmran2-Flat33','BinOmran2-Flat34','BinOmran2-Flat35','BinOmran2-Flat36',
        'BinOmran2-Flat37','BinOmran2-Flat38','BinOmran2-Flat39','BinOmran2-Flat40',
        'BinOmran2-Flat41','BinOmran2-Flat42','BinOmran2-Flat43','BinOmran2-Flat44',
        'BinOmran2-Flat45','BinOmran2-Flat46','BinOmran2-Flat47','BinOmran2-Flat48',
        'BinOmran2-Flat49','BinOmran2-Flat50','BinOmran2-Flat51',
      ],
      'LuLu 1': [
        'LuLu1-Flat01','LuLu1-Flat02','LuLu1-Flat03','LuLu1-Flat04',
        'LuLu1-Flat05','LuLu1-Flat06','LuLu1-Flat07','LuLu1-Flat08',
      ],
      'LuLu 2': [
        'LuLu2-Flat01','LuLu2-Flat02','LuLu2-Flat03',
        'LuLu2-Flat04','LuLu2-Flat05','LuLu2-Flat06',
      ],
      'RDM 1': ['RDM1-Flat01','RDM1-Flat02','RDM1-Flat03','RDM1-Flat04','RDM1-Flat05'],
      'RDM 2': [
        'RDM2-Flat01','RDM2-Flat02','RDM2-Flat03','RDM2-Flat04',
        'RDM2-Flat05','RDM2-Flat06','RDM2-Flat07','RDM2-Flat08',
      ],
      'OA56': [
        'OA56-Flat01','OA56-Flat02','OA56-Flat03','OA56-Flat04','OA56-Flat05',
        'OA56-Flat06','OA56-Flat07','OA56-Flat08','OA56-Flat09','OA56-Flat10',
        'OA56-Flat11','OA56-Flat12','OA56-Flat13',
      ],
      'Thihama 2': [
        'Thihama2-Flat01','Thihama2-Flat02','Thihama2-Flat03','Thihama2-Flat04',
        'Thihama2-Flat05','Thihama2-Flat06','Thihama2-Flat07','Thihama2-Flat08',
        'Thihama2-Flat09','Thihama2-Flat10','Thihama2-Flat11','Thihama2-Flat12','Thihama2-Flat13',
      ],
      'OA - KWT': ['OA-KWT-Villa23'],
      'Al Saad - 53': [
        'AlSaad-53-Flat01','AlSaad-53-Flat02','AlSaad-53-Flat03','AlSaad-53-Flat04',
        'AlSaad-53-Flat05','AlSaad-53-Flat06','AlSaad-53-Flat07','AlSaad-53-Flat08',
        'AlSaad-53-Flat09','AlSaad-53-Flat10','AlSaad-53-Flat11','AlSaad-53-Flat12',
        'AlSaad-53-Flat13','AlSaad-53-Flat14','AlSaad-53-Flat15','AlSaad-53-Flat16',
        'AlSaad-53-Flat17','AlSaad-53-Flat18',
      ],
      'Naser - 03': [
        'Naser-03-Flat01','Naser-03-Flat02','Naser-03-Flat03','Naser-03-Flat04',
        'Naser-03-Flat05','Naser-03-Flat06','Naser-03-Flat07','Naser-03-Flat08',
        'Naser-03-Flat09','Naser-03-Flat10','Naser-03-Flat11','Naser-03-Flat12',
        'Naser-03-Flat13','Naser-03-Flat14','Naser-03-Flat15','Naser-03-Flat16',
        'Naser-03-Flat17','Naser-03-Flat18','Naser-03-Flat19','Naser-03-Flat20',
        'Naser-03-Flat21','Naser-03-Flat22','Naser-03-Flat23','Naser-03-Flat24','Naser-03-Flat25',
      ],
      'Mansoura - JM2': [
        'Mansoura-JM2-Flat01','Mansoura-JM2-Flat02','Mansoura-JM2-Flat03','Mansoura-JM2-Flat04',
        'Mansoura-JM2-Flat05','Mansoura-JM2-Flat06','Mansoura-JM2-Flat07','Mansoura-JM2-Flat08',
        'Mansoura-JM2-Flat09','Mansoura-JM2-Flat10','Mansoura-JM2-Flat11','Mansoura-JM2-Flat12',
        'Mansoura-JM2-Flat13','Mansoura-JM2-Flat14','Mansoura-JM2-Flat15','Mansoura-JM2-Flat16',
        'Mansoura-JM2-Flat17','Mansoura-JM2-Flat18',
      ],
      'Mansoura - JM10': [
        'Mansoura-JM10-Flat101','Mansoura-JM10-Flat102','Mansoura-JM10-Flat103',
        'Mansoura-JM10-Flat201','Mansoura-JM10-Flat202','Mansoura-JM10-Flat203',
        'Mansoura-JM10-Flat301','Mansoura-JM10-Flat302','Mansoura-JM10-Flat303',
        'Mansoura-JM10-Flat401','Mansoura-JM10-Flat402','Mansoura-JM10-Flat403',
        'Mansoura-JM10-Flat501','Mansoura-JM10-Flat502','Mansoura-JM10-Flat503',
        'Mansoura-JM10-Studio',
      ],
      'Mansoura - 40': ['Mansoura-40-Flat05'],
      'Mansoura - 25': ['Mansoura-25-Flat39'],
      'PQ - AP10': [
        'PQ-AP10-Flat101','PQ-AP10-Flat102','PQ-AP10-Flat103','PQ-AP10-Flat104',
        'PQ-AP10-Flat105','PQ-AP10-Flat106','PQ-AP10-Flat107','PQ-AP10-Flat108',
        'PQ-AP10-Flat201','PQ-AP10-Flat202','PQ-AP10-Flat203','PQ-AP10-Flat204',
        'PQ-AP10-Flat205','PQ-AP10-Flat206','PQ-AP10-Flat207','PQ-AP10-Flat208',
        'PQ-AP10-Flat301','PQ-AP10-Flat302','PQ-AP10-Flat303','PQ-AP10-Flat304',
        'PQ-AP10-Flat305','PQ-AP10-Flat306','PQ-AP10-Flat307','PQ-AP10-Flat308',
        'PQ-AP10-Flat401','PQ-AP10-Flat402','PQ-AP10-Flat403','PQ-AP10-Flat404',
        'PQ-AP10-Flat405','PQ-AP10-Flat406','PQ-AP10-Flat407','PQ-AP10-Flat408',
        'PQ-AP10-Flat501','PQ-AP10-Flat502','PQ-AP10-Flat503','PQ-AP10-Flat504',
        'PQ-AP10-Flat505','PQ-AP10-Flat506','PQ-AP10-Flat507','PQ-AP10-Flat508',
        'PQ-AP10-Flat601','PQ-AP10-Flat602','PQ-AP10-Flat603','PQ-AP10-Flat604',
        'PQ-AP10-Flat605','PQ-AP10-Flat606','PQ-AP10-Flat607','PQ-AP10-Flat608',
      ],
      'Musheireb - 05': [
        'Musheireb-05-Flat01','Musheireb-05-Flat02','Musheireb-05-Flat03','Musheireb-05-Flat04',
        'Musheireb-05-Flat05','Musheireb-05-Flat06','Musheireb-05-Flat07','Musheireb-05-Flat08',
        'Musheireb-05-Flat09','Musheireb-05-Flat10','Musheireb-05-Flat11','Musheireb-05-Flat12',
        'Musheireb-05-Flat13','Musheireb-05-Flat14','Musheireb-05-Flat15','Musheireb-05-Flat16',
        'Musheireb-05-Flat17','Musheireb-05-Flat18','Musheireb-05-Flat19','Musheireb-05-Flat20',
        'Musheireb-05-Flat21','Musheireb-05-Flat22','Musheireb-05-Flat23','Musheireb-05-Flat24',
        'Musheireb-05-Flat25','Musheireb-05-Flat26','Musheireb-05-Flat27','Musheireb-05-Flat28',
        'Musheireb-05-Flat29','Musheireb-05-Flat30','Musheireb-05-Flat31','Musheireb-05-Flat32',
      ],
      'Mugalina - 1BHK': [
        'Mugalina-1BHK-Flat01','Mugalina-1BHK-Flat02','Mugalina-1BHK-Flat03','Mugalina-1BHK-Flat04',
        'Mugalina-1BHK-Flat05','Mugalina-1BHK-Flat06','Mugalina-1BHK-Flat07','Mugalina-1BHK-Flat08',
        'Mugalina-1BHK-Flat09','Mugalina-1BHK-Flat10','Mugalina-1BHK-Flat11','Mugalina-1BHK-Flat12',
      ],
      'Mugalina - 2BHK': ['Mugalina-2BHK-Flat03'],
      'Wakra - 01': [
        'Wakra-01-Flat01','Wakra-01-Flat02','Wakra-01-Flat03','Wakra-01-Flat04',
        'Wakra-01-Flat05','Wakra-01-Flat06','Wakra-01-Flat07','Wakra-01-Flat08',
        'Wakra-01-Flat09','Wakra-01-Flat10','Wakra-01-Flat11',
      ],
      'Birkat - 49': [
        'Birkat-49-Flat01','Birkat-49-Flat02','Birkat-49-Flat03','Birkat-49-Flat04',
        'Birkat-49-Flat05','Birkat-49-Flat07','Birkat-49-Flat08','Birkat-49-Flat09',
        'Birkat-49-Flat10','Birkat-49-Flat11','Birkat-49-Flat12','Birkat-49-Flat13',
        'Birkat-49-Flat14','Birkat-49-Flat15','Birkat-49-Flat16','Birkat-49-Flat17',
        'Birkat-49-Flat18','Birkat-49-Flat20','Birkat-49-Flat21','Birkat-49-Flat22',
        'Birkat-49-Flat23',
      ],
    };

    const propIds = {};
    for (const code of Object.keys(propertyUnitMap)) {
      const res = await client.query(
        `INSERT INTO public.mst_property_codes (code) VALUES ($1) ON CONFLICT (code) DO UPDATE SET code=EXCLUDED.code RETURNING id;`,
        [code]
      );
      propIds[code] = res.rows[0].id;
    }

    for (const [propCode, units] of Object.entries(propertyUnitMap)) {
      const propId = propIds[propCode];
      for (const unit of units) {
        await client.query(
          `INSERT INTO public.mst_unit_codes (code, property_code_id) VALUES ($1, $2) ON CONFLICT (code, property_code_id) DO NOTHING;`,
          [unit, propId]
        );
      }
    }

    console.log('\n✅ Migration & seeding complete!');
  } catch (err) {
    console.error('❌ Migration Error:', err);
  } finally {
    await client.end();
  }
}

migrate();
