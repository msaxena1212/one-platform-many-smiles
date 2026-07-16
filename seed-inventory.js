import { Client } from 'pg';

async function seedInventory() {
  const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Creating tables if they do not exist...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.inventory_parts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        sku TEXT UNIQUE,
        quantity_on_hand INTEGER NOT NULL DEFAULT 0,
        unit_cost NUMERIC(18,4) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS public.material_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID,
        part_id UUID REFERENCES public.inventory_parts(id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL,
        cost NUMERIC(18,4) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    console.log('Seeding inventory parts...');
    const parts = [
      { sku: 'AC-FIL-01', name: 'AC Filter (Standard)', quantity: 20, unit_cost: 45.00 },
      { sku: 'LB-LED-9W', name: 'LED Light Bulb 9W', quantity: 50, unit_cost: 15.00 },
      { sku: 'PL-TAP-01', name: 'Kitchen Tap (Chrome)', quantity: 5, unit_cost: 120.00 },
      { sku: 'DO-LK-02', name: 'Front Door Lock Cylinder', quantity: 10, unit_cost: 85.00 }
    ];

    for (const part of parts) {
      await client.query(`
        INSERT INTO public.inventory_parts (sku, name, quantity_on_hand, unit_cost)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (sku) DO UPDATE SET quantity_on_hand = EXCLUDED.quantity_on_hand
      `, [part.sku, part.name, part.quantity, part.unit_cost]);
    }
    console.log('Inventory parts seeded successfully.');
  } catch (error) {
    console.error('Error seeding inventory:', error);
  } finally {
    await client.end();
  }
}

seedInventory();
