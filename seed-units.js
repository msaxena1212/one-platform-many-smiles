import { Client } from 'pg';

async function seedUnits() {
  const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Seeding units...');
    
    // First, let's make sure we have at least one property
    const res = await client.query('SELECT id FROM public.properties LIMIT 1');
    let propertyId = null;
    if (res.rows.length > 0) {
      propertyId = res.rows[0].id;
    } else {
      // Insert a mock property to attach units to if none exist
      const propRes = await client.query(`
        INSERT INTO public.properties (title, property_type, address, city, country, base_price_per_night)
        VALUES ('Sunset Towers', 'Apartment', '123 Main St', 'Dubai', 'UAE', 100)
        RETURNING id
      `);
      propertyId = propRes.rows[0].id;
    }

    const units = [
      { unit_ref: 'A-101', room_type: '1 BHK', bedrooms: 1, bathrooms: 1, area: '750 sqft', price: 1200, status: 'AVAILABLE' },
      { unit_ref: 'A-102', room_type: '2 BHK', bedrooms: 2, bathrooms: 2, area: '1200 sqft', price: 2000, status: 'OCCUPIED' },
      { unit_ref: 'B-201', room_type: 'Studio', bedrooms: 0, bathrooms: 1, area: '500 sqft', price: 800, status: 'MAINTENANCE' },
      { unit_ref: 'B-205', room_type: '3 BHK', bedrooms: 3, bathrooms: 3, area: '1800 sqft', price: 3500, status: 'AVAILABLE' }
    ];

    for (const u of units) {
      await client.query(`
        INSERT INTO public.units (property_id, unit_ref, room_type, bedrooms, bathrooms, area, price, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [propertyId, u.unit_ref, u.room_type, u.bedrooms, u.bathrooms, u.area, u.price, u.status]);
    }
    
    console.log('Units seeded successfully.');
  } catch (error) {
    console.error('Error seeding units:', error);
  } finally {
    await client.end();
  }
}

seedUnits();
