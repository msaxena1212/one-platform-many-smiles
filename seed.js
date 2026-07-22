import { Client } from 'pg';

async function seedDatabase() {
  const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });
  
  try {
    console.log("Connecting to Supabase...");
    await client.connect();

    // 1. Create a Host Profile
    const hostId = '00000000-0000-4000-8000-000000000001';
    await client.query(`
      INSERT INTO auth.users (id, instance_id, role, aud, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
      VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'host@example.com', 'dummy', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `, [hostId]);

    await client.query(`
      INSERT INTO public.profiles (id, role, full_name)
      VALUES ($1, 'ADMIN', 'Kinan Real Estate')
      ON CONFLICT (id) DO NOTHING;
    `, [hostId]);

    // 2. Insert Properties
    const prop1 = '00000000-0000-4000-8000-000000000011';
    const prop2 = '00000000-0000-4000-8000-000000000012';
    
    await client.query(`
      INSERT INTO public.properties (id, host_id, title, description, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms, base_price_per_night, cleaning_fee, is_active)
      VALUES 
      ($1, $2, 'Luxury Villa with Pool', 'Experience luxury living in this stunning property with a beautiful pool and modern amenities.', 'Villa', '123 Palm Street', 'Bali', 'Indonesia', 6, 3, 4, 3, 250, 80, true),
      ($3, $2, 'Downtown Penthouse', 'Breathtaking city views from this top-floor penthouse located in the heart of the business district.', 'Apartment', '456 Skyline Ave', 'New York', 'USA', 4, 2, 2, 2, 350, 100, true)
      ON CONFLICT (id) DO NOTHING;
    `, [prop1, hostId, prop2]);

    // 3. Insert Property Images
    await client.query(`
      INSERT INTO public.property_images (property_id, image_url, is_primary)
      VALUES 
      ($1, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800', true),
      ($2, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', true)
    `, [prop1, prop2]);

    // 4. Create a Guest Profile
    const guestId = '00000000-0000-4000-8000-000000000002';
    await client.query(`
      INSERT INTO auth.users (id, instance_id, role, aud, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
      VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guest@example.com', 'dummy', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `, [guestId]);

    await client.query(`
      INSERT INTO public.profiles (id, role, full_name)
      VALUES ($1, 'GUEST', 'Alice Smith')
      ON CONFLICT (id) DO NOTHING;
    `, [guestId]);

    // 5. Insert Bookings
    await client.query(`
      INSERT INTO public.bookings (property_id, guest_id, check_in, check_out, guests_count, total_price, status)
      VALUES 
      ($1, $2, CURRENT_DATE + INTERVAL '12 days', CURRENT_DATE + INTERVAL '18 days', 2, 1660, 'CONFIRMED'),
      ($3, $2, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '25 days', 2, 1950, 'COMPLETED')
    `, [prop1, guestId, prop2]);

    console.log("Mock data seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.end();
  }
}

seedDatabase();
