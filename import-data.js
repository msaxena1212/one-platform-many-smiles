import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function importData() {
  const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });
  
  try {
    console.log("Connecting to Supabase...");
    await client.connect();

    // Make sure a host profile exists
    const hostId = '00000000-0000-4000-8000-000000000001';
    await client.query(`
      INSERT INTO auth.users (id, instance_id, role, aud, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
      VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'host@example.com', 'dummy', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `, [hostId]);

    await client.query(`
      INSERT INTO public.profiles (id, role, full_name)
      VALUES ($1, 'HOST', 'Kinan Real Estate')
      ON CONFLICT (id) DO NOTHING;
    `, [hostId]);

    console.log("Removing old data...");
    await client.query('DELETE FROM public.properties;');

    const mdPath = path.resolve('E:/Port/Property Management System/Property_Details.-EM.md');
    const markdown = fs.readFileSync(mdPath, 'utf8');

    // Parse units from Unit Master table
    const unitLines = markdown.split('\n').filter(line => line.startsWith('|') && !line.includes('Unit Code / No.') && line.split('|').length > 30);
    
    for (const line of unitLines) {
      const cols = line.split('|').map(c => c.trim());
      if (cols.length < 30 || cols[1] === '') continue;

      const unitCode = cols[1];
      const propertyCode = cols[2];
      const unitName = cols[4];
      const unitType = cols[6]; // Apartment, etc.
      const bedrooms = parseInt(cols[10]) || 1;
      const bathrooms = parseInt(cols[11]) || 1;
      const status = cols[21]; // Available, Occupied
      let baseRent = cols[23]; // e.g. QR5500
      let rentValue = 0;
      if (baseRent) {
        rentValue = parseInt(baseRent.replace(/[^0-9]/g, '')) || 5500;
      }
      const pricePerNight = Math.round(rentValue / 30);
      const isActive = status === 'Available';
      
      const title = unitName || `${propertyCode} - ${unitCode}`;
      
      await client.query(`
        INSERT INTO public.properties (host_id, title, description, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms, base_price_per_night, cleaning_fee, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        hostId,
        title,
        'Unit ' + unitCode + ' in ' + propertyCode,
        unitType || 'Apartment',
        propertyCode || 'Unknown',
        'Doha',
        'Qatar',
        bedrooms * 2, // max guests
        bedrooms,
        bedrooms,
        bathrooms,
        pricePerNight,
        0,
        isActive
      ]);
      console.log(`Inserted \${title}`);
    }

    console.log("Data imported successfully!");
  } catch (error) {
    console.error("Error importing data:", error);
  } finally {
    await client.end();
  }
}

importData();
