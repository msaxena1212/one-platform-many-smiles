import { Client } from 'pg';

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function seed() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log('Clearing old data...');
    await client.query('DELETE FROM public.units');
    await client.query("DELETE FROM public.properties WHERE property_code IS NOT NULL");

    const propIds = {};

    // =====================================================================
    // INSERT ALL 23 PROPERTIES (from Real Estate - Simerjith.xlsx)
    // =====================================================================
    console.log('Inserting: AAA');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["OLD SALATA - BLDG23", "Residential", "Street 840, Area 18", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "AAA", "CC-OLD SALATA - BLDG23", "Building", "Leased", "18", "Street 840", "Jithin Abdul Latheef", 7, 44, 9, 2]
      );
      propIds["AAA"] = r.rows[0].id;
    }

    console.log('Inserting: OLD SALATA 2');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["OLD SALATA - BLDG13", "Residential", "Street 841, Area 18", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "OLD SALATA 2", "CC-OLD SALATA - BLDG13", "Building", "Leased", "18", "Street 841", "Jithin Abdul Latheef", 7, 28, 8, 1]
      );
      propIds["OLD SALATA 2"] = r.rows[0].id;
    }

    console.log('Inserting: BIN OMRAN 1');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["BIN OMRAN - BLDG90", "Residential", "Street 856, Area 37", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "BIN OMRAN 1", "CC-BIN OMRAN - BLDG90", "Building", "Leased", "37", "Street 856", "Jithin Abdul Latheef", 3, 15, 15, 1]
      );
      propIds["BIN OMRAN 1"] = r.rows[0].id;
    }

    console.log('Inserting: BIN OMRAN 2');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["BIN OMRAN - BLDG07", "Residential", "Street 877, Area 37", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "BIN OMRAN 2", "CC-BIN OMRAN - BLDG07", "Building", "Leased", "37", "Street 877", "Jithin Abdul Latheef", 3, 51, 52, 2]
      );
      propIds["BIN OMRAN 2"] = r.rows[0].id;
    }

    console.log('Inserting: LULU 1');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["OLD AIPORT - BLDG124", "Residential", "Street 805, Area 45", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "LULU 1", "CC-OLD AIPORT - BLDG124", "Building", "Leased", "45", "Street 805", "Jithin Abdul Latheef", 3, 8, 8, 0]
      );
      propIds["LULU 1"] = r.rows[0].id;
    }

    console.log('Inserting: LULU 2');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["OLD AIPORT - BLDG17", "Residential", "Street 977, Area 45", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "LULU 2", "CC-OLD AIPORT - BLDG17", "Building", "Leased", "45", "Street 977", "Jithin Abdul Latheef", 3, 6, 6, 0]
      );
      propIds["LULU 2"] = r.rows[0].id;
    }

    console.log('Inserting: RDM 1');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["OLD AIRPORT - BLDG29", "Residential", "Street 940, Area 45", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "RDM 1", "CC-OLD AIRPORT - BLDG29", "Building", "Leased", "45", "Street 940", "Jithin Abdul Latheef", 3, 5, 5, 0]
      );
      propIds["RDM 1"] = r.rows[0].id;
    }

    console.log('Inserting: RDM 2');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["OLD AIRPORT - BLDG33", "Residential", "Street 929, Area 45", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "RDM 2", "CC-OLD AIRPORT - BLDG33", "Building", "Leased", "45", "Street 929", "Jithin Abdul Latheef", 3, 8, 8, 0]
      );
      propIds["RDM 2"] = r.rows[0].id;
    }

    console.log('Inserting: OA56');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["OLD AIRPORT - BLDG56", "Residential", "Street 990, Area 45", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "OA56", "CC-OLD AIRPORT - BLDG56", "Building", "Leased", "45", "Street 990", "Jithin Abdul Latheef", 3, 13, 13, 1]
      );
      propIds["OA56"] = r.rows[0].id;
    }

    console.log('Inserting: THIHAMA 2');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["OLD AIRPORT - BLDG01", "Residential", "Street 834, Area 45", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "THIHAMA 2", "CC-OLD AIRPORT - BLDG01", "Building", "Leased", "45", "Street 834", "Jithin Abdul Latheef", 3, 13, 13, 1]
      );
      propIds["THIHAMA 2"] = r.rows[0].id;
    }

    console.log('Inserting: OA - KWT');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["OLD AIRPORT - KUWAIT VILLA", "Residential", "Street 656, Area 45", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "OA - KWT", "CC-OLD AIRPORT - KUWAIT VILLA", "Villa Compound", "Leased", "45", "Street 656", "Jithin Abdul Latheef", 1, 1, 1, 0]
      );
      propIds["OA - KWT"] = r.rows[0].id;
    }

    console.log('Inserting: NASER - 03');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["AL NASER - BLDG03", "Residential", "Street 837, Area 39", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "NASER - 03", "CC-AL NASER - BLDG03", "Building", "Leased", "39", "Street 837", "Jithin Abdul Latheef", 4, 25, 25, 2]
      );
      propIds["NASER - 03"] = r.rows[0].id;
    }

    console.log('Inserting: AL SAAD - 53');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["AL SAAD - BLDG53", "Residential", "Street 850, Area 38", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "AL SAAD - 53", "CC-AL SAAD - BLDG53", "Building", "Leased", "38", "Street 850", "Jithin Abdul Latheef", 6, 18, 13, 2]
      );
      propIds["AL SAAD - 53"] = r.rows[0].id;
    }

    console.log('Inserting: MANSOURA - JM2');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["MANSOURA - BLDG06", "Residential", "Street 828, Area 25", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "MANSOURA - JM2", "CC-MANSOURA - BLDG06", "Building", "Leased", "25", "Street 828", "Jithin Abdul Latheef", 6, 18, 18, 2]
      );
      propIds["MANSOURA - JM2"] = r.rows[0].id;
    }

    console.log('Inserting: MANSOURA - JM10');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["MANSOURA - BLDG16", "Residential", "Street 816, Area 25", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "MANSOURA - JM10", "CC-MANSOURA - BLDG16", "Building", "Leased", "25", "Street 816", "Jithin Abdul Latheef", 6, 16, 15, 1]
      );
      propIds["MANSOURA - JM10"] = r.rows[0].id;
    }

    console.log('Inserting: MANSOURA - 40');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["MANSOURA - BLDG40", "Residential", "Street 970, Area 25", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "MANSOURA - 40", "CC-MANSOURA - BLDG40", "Building", "Leased", "25", "Street 970", "Jithin Abdul Latheef", 1, 1, 1, 1]
      );
      propIds["MANSOURA - 40"] = r.rows[0].id;
    }

    console.log('Inserting: MANSOURA - 25');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["MANSOURA - BLDG03", "Residential", "Street 851, Area 26", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "MANSOURA - 25", "CC-Mansoura - Bldg05", "Building", "Leased", "26", "Street 851", "Jithin Abdul Latheef", 1, 1, 1, 1]
      );
      propIds["MANSOURA - 25"] = r.rows[0].id;
    }

    console.log('Inserting: PQ - AP10');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["PEARL QATAR - BLDG19", "Residential", "Street 183, Area 66", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "PQ - AP10", "CC-PEARL QATAR - BLDG19", "Building", "Leased", "66", "Street 183", "Jithin Abdul Latheef", 6, 48, 55, 2]
      );
      propIds["PQ - AP10"] = r.rows[0].id;
    }

    console.log('Inserting: MUSHEIREB - 05');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["MUSHEIREB - BLDG05", "Residential", "Street 850, Area 13", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "MUSHEIREB - 05", "CC-MUSHEIREB - BLDG05", "Building", "Leased", "13", "Street 850", "Jithin Abdul Latheef", 4, 32, 8, 2]
      );
      propIds["MUSHEIREB - 05"] = r.rows[0].id;
    }

    console.log('Inserting: MUGALINA - 1BHK');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["MUGALINA - BLDG88", "Residential", "Street 830, Area 27", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "MUGALINA - 1BHK", "CC-MUGALINA - BLDG88", "Building", "Leased", "27", "Street 830", "Jithin Abdul Latheef", 4, 12, 7, 1]
      );
      propIds["MUGALINA - 1BHK"] = r.rows[0].id;
    }

    console.log('Inserting: MUGALINA - 2BHK');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["MUGALINA - BLDG16", "Residential", "Street 935, Area 27", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "MUGALINA - 2BHK", "CC-MUGALINA - BLDG16", "Building", "Leased", "27", "Street 935", "Jithin Abdul Latheef", 1, 1, 1, 1]
      );
      propIds["MUGALINA - 2BHK"] = r.rows[0].id;
    }

    console.log('Inserting: WAKRA - 01');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["AL WAKRA - BLDG01", "Residential", "Street 993, Area 90", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "WAKRA - 01", "CC-AL WAKRA - BLDG01", "Building", "Leased", "90", "Street 993", "Jithin Abdul Latheef", 3, 11, 11, 1]
      );
      propIds["WAKRA - 01"] = r.rows[0].id;
    }

    console.log('Inserting: BIRKAT - 49');
    {
      const r = await client.query(
        `INSERT INTO public.properties (
          title, property_type, address, city, country, max_guests, bedrooms, beds, bathrooms,
          base_price_per_night, cleaning_fee, is_active,
          property_code, cost_center_name, property_category, ownership_type, area_zone,
          street_building_name, property_manager, no_of_floors, no_of_units,
          parking_count, no_of_elevators
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        ) RETURNING id`,
        ["BIRKAT AL AWAMER - BLDG49", "Residential", "Street 3086, Area 91", "Doha", "Qatar", 6, 2, 2, 1, 5000, 0, true, "BIRKAT - 49", "CC-BIRKAT AL AWAMER - BLDG49", "Building", "Leased", "91", "Street 3086", "Jithin Abdul Latheef", 3, 21, 0, 0]
      );
      propIds["BIRKAT - 49"] = r.rows[0].id;
    }

    console.log('All 23 properties inserted. Now inserting units...');

    // =====================================================================
    // INSERT ALL 396 UNITS
    // Code normalization: Unit Master mixed-case -> Property Master UPPER
    // =====================================================================
    const codeMap = {
      "Old Salata 2": "OLD SALATA 2",
      "Bin Omran 1": "BIN OMRAN 1",
      "Bin Omran 2": "BIN OMRAN 2",
      "LuLu 1": "LULU 1",
      "LuLu 2": "LULU 2",
      "Thihama 2": "THIHAMA 2",
      "Naser - 03": "NASER - 03",
      "Al Saad - 53": "AL SAAD - 53",
      "Mansoura - JM2": "MANSOURA - JM2",
      "Mansoura - JM10": "MANSOURA - JM10",
      "Mansoura - 40": "MANSOURA - 40",
      "Mansoura - 25": "MANSOURA - 25",
      "Mugalina - 1BHK": "MUGALINA - 1BHK",
      "Mugalina - 2BHK": "MUGALINA - 2BHK",
      "Musheireb - 05": "MUSHEIREB - 05",
      "Wakra - 01": "WAKRA - 01",
      "Birkat - 49": "BIRKAT - 49",
    };

    let unitCount = 0, skipped = 0;

    const allUnits = [
    {
        "prop_code": "AAA",
        "unit_code": "GF1",
        "unit_cost_center_code": "CC-AAA-GF1",
        "unit_name": "AAA-GF1",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "AAA",
        "unit_code": "GF2",
        "unit_cost_center_code": "CC-AAA-GF2",
        "unit_name": "AAA-GF2",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat11",
        "unit_cost_center_code": "CC-AAA-Flat11",
        "unit_name": "AAA-Flat11",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat12",
        "unit_cost_center_code": "CC-AAA-Flat12",
        "unit_name": "AAA-Flat12",
        "current_tenant": "Mr. Dawood Sulaiman S Al Rahbi",
        "contract_start": "2026-04-10",
        "contract_end": "2027-04-09",
        "current_rent": 5400,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat13",
        "unit_cost_center_code": "CC-AAA-Flat13",
        "unit_name": "AAA-Flat13",
        "current_tenant": "Mr. Basiron Yusop",
        "contract_start": "2025-09-10",
        "contract_end": "2026-09-09",
        "current_rent": 5400,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat14",
        "unit_cost_center_code": "CC-AAA-Flat14",
        "unit_name": "AAA-Flat14",
        "current_tenant": "M/s.Embassy of Pakistan",
        "contract_start": "2026-07-01",
        "contract_end": "2027-06-30",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat15",
        "unit_cost_center_code": "CC-AAA-Flat15",
        "unit_name": "AAA-Flat15",
        "current_tenant": "Mr. Hatem Sulaiman S Alrahbi",
        "contract_start": "2026-01-15",
        "contract_end": "2027-01-14",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat16",
        "unit_cost_center_code": "CC-AAA-Flat16",
        "unit_name": "AAA-Flat16",
        "current_tenant": "Mr. Hafeez Shaik",
        "contract_start": "2025-10-01",
        "contract_end": "2026-09-30",
        "current_rent": 5600,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat21",
        "unit_cost_center_code": "CC-AAA-Flat21",
        "unit_name": "AAA-Flat21",
        "current_tenant": "Mr. Mashreq Mohammad Zain",
        "contract_start": "2026-03-01",
        "contract_end": "2027-02-28",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat22",
        "unit_cost_center_code": "CC-AAA-Flat22",
        "unit_name": "AAA-Flat22",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat23",
        "unit_cost_center_code": "CC-AAA-Flat23",
        "unit_name": "AAA-Flat23",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat24",
        "unit_cost_center_code": "CC-AAA-Flat24",
        "unit_name": "AAA-Flat24",
        "current_tenant": "Ms. Monica Sharma",
        "contract_start": "2026-05-20",
        "contract_end": "2026-06-19",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat25",
        "unit_cost_center_code": "CC-AAA-Flat25",
        "unit_name": "AAA-Flat25",
        "current_tenant": "Mr. Sijith Pangil Chandran",
        "contract_start": "2026-08-01",
        "contract_end": "2027-08-31",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat26",
        "unit_cost_center_code": "CC-AAA-Flat26",
        "unit_name": "AAA-Flat26",
        "current_tenant": "Ms. Elseba Aluoch Onyango",
        "contract_start": "2025-10-15",
        "contract_end": "2026-10-14",
        "current_rent": 5500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat31",
        "unit_cost_center_code": "CC-AAA-Flat31",
        "unit_name": "AAA-Flat31",
        "current_tenant": "M/s Al Badi Trading Contracting",
        "contract_start": "2026-03-01",
        "contract_end": "2026-08-31",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat32",
        "unit_cost_center_code": "CC-AAA-Flat32",
        "unit_name": "AAA-Flat32",
        "current_tenant": "Mr. Allabaksh Nadaf Razaksab Navi Nadaf",
        "contract_start": "2025-08-01",
        "contract_end": "2026-07-31",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat33",
        "unit_cost_center_code": "CC-AAA-Flat33",
        "unit_name": "AAA-Flat33",
        "current_tenant": "Mr. Taqi Ali Syed Mohammad",
        "contract_start": "2025-06-07",
        "contract_end": "2026-06-06",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat34",
        "unit_cost_center_code": "CC-AAA-Flat34",
        "unit_name": "AAA-Flat34",
        "current_tenant": "Mr. Ahsen Samal Rajanth Don",
        "contract_start": "2026-04-15",
        "contract_end": "2027-04-14",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat35",
        "unit_cost_center_code": "CC-AAA-Flat35",
        "unit_name": "AAA-Flat35",
        "current_tenant": "Ms. Saranya Asokan",
        "contract_start": "2025-11-01",
        "contract_end": "2026-10-31",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat36",
        "unit_cost_center_code": "CC-AAA-Flat36",
        "unit_name": "AAA-Flat36",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat41",
        "unit_cost_center_code": "CC-AAA-Flat41",
        "unit_name": "AAA-Flat41",
        "current_tenant": "Mr. Imtiyaz Ahmed",
        "contract_start": "2025-07-01",
        "contract_end": "2026-06-30",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat42",
        "unit_cost_center_code": "CC-AAA-Flat42",
        "unit_name": "AAA-Flat42",
        "current_tenant": "Mr. Jaiganesh Jayaraman Varathan",
        "contract_start": "2026-06-20",
        "contract_end": "2027-04-19",
        "current_rent": 5500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat43",
        "unit_cost_center_code": "CC-AAA-Flat43",
        "unit_name": "AAA-Flat43",
        "current_tenant": "Mr. Prashant Pandey",
        "contract_start": "2025-09-30",
        "contract_end": "2026-08-01",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat44",
        "unit_cost_center_code": "CC-AAA-Flat44",
        "unit_name": "AAA-Flat44",
        "current_tenant": "Mr. Nasir Zaidi Shaikh",
        "contract_start": "2026-01-01",
        "contract_end": "2026-12-31",
        "current_rent": 4900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat45",
        "unit_cost_center_code": "CC-AAA-Flat45",
        "unit_name": "AAA-Flat45",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat46",
        "unit_cost_center_code": "CC-AAA-Flat46",
        "unit_name": "AAA-Flat46",
        "current_tenant": "Mr. Chandrasekaran Thanasekarapandian",
        "contract_start": "2025-09-01",
        "contract_end": "2026-08-31",
        "current_rent": 5500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat51",
        "unit_cost_center_code": "CC-AAA-Flat51",
        "unit_name": "AAA-Flat51",
        "current_tenant": "Mr. Mohammad Suhail Ahmad Mohammad",
        "contract_start": "2026-05-01",
        "contract_end": "2027-04-30",
        "current_rent": 6300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat52",
        "unit_cost_center_code": "CC-AAA-Flat52",
        "unit_name": "AAA-Flat52",
        "current_tenant": "Mr. Kudzaishe Duncan Chanakira",
        "contract_start": "2026-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 5500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat53",
        "unit_cost_center_code": "CC-AAA-Flat53",
        "unit_name": "AAA-Flat53",
        "current_tenant": "Mr. Abdul Haseeb Anwar Mohammad Anwar",
        "contract_start": "2026-01-01",
        "contract_end": "2026-12-31",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat54",
        "unit_cost_center_code": "CC-AAA-Flat54",
        "unit_name": "AAA-Flat54",
        "current_tenant": "M/s.Embassy of Pakistan",
        "contract_start": "2026-07-01",
        "contract_end": "2027-06-30",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat55",
        "unit_cost_center_code": "CC-AAA-Flat55",
        "unit_name": "AAA-Flat55",
        "current_tenant": "Mr. Rajneesh Singh",
        "contract_start": "2025-08-01",
        "contract_end": "2026-07-31",
        "current_rent": 5100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat56",
        "unit_cost_center_code": "CC-AAA-Flat56",
        "unit_name": "AAA-Flat56",
        "current_tenant": "Mr. Floyd Alukkal J.J. Alukkal",
        "contract_start": "2025-08-01",
        "contract_end": "2026-07-31",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat61",
        "unit_cost_center_code": "CC-AAA-Flat61",
        "unit_name": "AAA-Flat61",
        "current_tenant": "Mr. Ahmed Elzoara",
        "contract_start": "2026-07-01",
        "contract_end": "2027-06-30",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat62",
        "unit_cost_center_code": "CC-AAA-Flat62",
        "unit_name": "AAA-Flat62",
        "current_tenant": "Mr. Joel John Jacob",
        "contract_start": "2026-06-10",
        "contract_end": "2027-06-09",
        "current_rent": 5500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat63",
        "unit_cost_center_code": "CC-AAA-Flat63",
        "unit_name": "AAA-Flat63",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat64",
        "unit_cost_center_code": "CC-AAA-Flat64",
        "unit_name": "AAA-Flat64",
        "current_tenant": "Mr. Rijo Joseph",
        "contract_start": "2025-09-05",
        "contract_end": "2026-09-04",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat65",
        "unit_cost_center_code": "CC-AAA-Flat65",
        "unit_name": "AAA-Flat65",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat66",
        "unit_cost_center_code": "CC-AAA-Flat66",
        "unit_name": "AAA-Flat66",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat71",
        "unit_cost_center_code": "CC-AAA-Flat71",
        "unit_name": "AAA-Flat71",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat72",
        "unit_cost_center_code": "CC-AAA-Flat72",
        "unit_name": "AAA-Flat72",
        "current_tenant": "Mr. Denzil Daya Lewis",
        "contract_start": "2025-09-01",
        "contract_end": "2026-08-31",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat73",
        "unit_cost_center_code": "CC-AAA-Flat73",
        "unit_name": "AAA-Flat73",
        "current_tenant": "Ms. Remya Gibin Maveli Pappu Peter",
        "contract_start": "2026-03-01",
        "contract_end": "2027-02-28",
        "current_rent": 4900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat74",
        "unit_cost_center_code": "CC-AAA-Flat74",
        "unit_name": "AAA-Flat74",
        "current_tenant": "Mr. Idowu Temiyope Adeleye",
        "contract_start": "2025-11-01",
        "contract_end": "2026-10-31",
        "current_rent": 4800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat75",
        "unit_cost_center_code": "CC-AAA-Flat75",
        "unit_name": "AAA-Flat75",
        "current_tenant": "Mr. Srinivasa Rajakumar Alluru",
        "contract_start": "2025-09-05",
        "contract_end": "2026-09-04",
        "current_rent": 5100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "AAA",
        "unit_code": "Flat76",
        "unit_cost_center_code": "CC-AAA-Flat76",
        "unit_name": "AAA-Flat76",
        "current_tenant": "Mr. Javad Kaitha Valappil",
        "contract_start": "2026-06-01",
        "contract_end": "2027-02-28",
        "current_rent": 5700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat01",
        "unit_cost_center_code": "CC-Old Salata 2-Flat01",
        "unit_name": "OldSalata2-Flat01",
        "current_tenant": "Mr. Shankar Manjapara Sankaran",
        "contract_start": "2026-03-15",
        "contract_end": "2027-03-14",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat02",
        "unit_cost_center_code": "CC-Old Salata 2-Flat02",
        "unit_name": "OldSalata2-Flat02",
        "current_tenant": "Mr. Sherwin Raman",
        "contract_start": "2026-01-01",
        "contract_end": "2026-12-31",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat03",
        "unit_cost_center_code": "CC-Old Salata 2-Flat03",
        "unit_name": "OldSalata2-Flat03",
        "current_tenant": "Mr. Binu Gopinathan Parameswaran",
        "contract_start": "2026-05-01",
        "contract_end": "2027-04-30",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat04",
        "unit_cost_center_code": "CC-Old Salata 2-Flat04",
        "unit_name": "OldSalata2-Flat04",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat05",
        "unit_cost_center_code": "CC-Old Salata 2-Flat05",
        "unit_name": "OldSalata2-Flat05",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat06",
        "unit_cost_center_code": "CC-Old Salata 2-Flat06",
        "unit_name": "OldSalata2-Flat06",
        "current_tenant": "Mr. Anupam Gupta Ashok K Gupta",
        "contract_start": "2025-10-01",
        "contract_end": "2026-09-30",
        "current_rent": 4300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat07",
        "unit_cost_center_code": "CC-Old Salata 2-Flat07",
        "unit_name": "OldSalata2-Flat07",
        "current_tenant": "Mr. Jorge Wilson Suarez Castillo",
        "contract_start": "2026-06-01",
        "contract_end": "2027-05-31",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat08",
        "unit_cost_center_code": "CC-Old Salata 2-Flat08",
        "unit_name": "OldSalata2-Flat08",
        "current_tenant": "Ms. Vishakha Virendra Gadhe",
        "contract_start": "2026-06-20",
        "contract_end": "2027-06-19",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat09",
        "unit_cost_center_code": "CC-Old Salata 2-Flat09",
        "unit_name": "OldSalata2-Flat09",
        "current_tenant": "Ms. Ramya Aradi Vissapragada Rao",
        "contract_start": "2025-09-10",
        "contract_end": "2026-09-09",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat10",
        "unit_cost_center_code": "CC-Old Salata 2-Flat10",
        "unit_name": "OldSalata2-Flat10",
        "current_tenant": "Mr. Hassan Shaito",
        "contract_start": "2025-11-01",
        "contract_end": "2026-10-31",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat11",
        "unit_cost_center_code": "CC-Old Salata 2-Flat11",
        "unit_name": "OldSalata2-Flat11",
        "current_tenant": "Mr. Muzammil Farid Mukadam",
        "contract_start": "2026-04-15",
        "contract_end": "2027-04-14",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat12",
        "unit_cost_center_code": "CC-Old Salata 2-Flat12",
        "unit_name": "OldSalata2-Flat12",
        "current_tenant": "Mr. Marouane Bissal",
        "contract_start": "2026-08-01",
        "contract_end": "2027-07-31",
        "current_rent": 3750,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat13",
        "unit_cost_center_code": "CC-Old Salata 2-Flat13",
        "unit_name": "OldSalata2-Flat13",
        "current_tenant": "Ms. Shamaila Shamsur Rahman",
        "contract_start": "2025-11-01",
        "contract_end": "2026-11-30",
        "current_rent": 3970,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat14",
        "unit_cost_center_code": "CC-Old Salata 2-Flat14",
        "unit_name": "OldSalata2-Flat14",
        "current_tenant": "Mr. Ahmed Mohamed Fekry Shaaban",
        "contract_start": "2025-10-01",
        "contract_end": "2026-09-30",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat15",
        "unit_cost_center_code": "CC-Old Salata 2-Flat15",
        "unit_name": "OldSalata2-Flat15",
        "current_tenant": "Ms. Malgorzata Dorota Karas",
        "contract_start": "2026-01-15",
        "contract_end": "2027-01-31",
        "current_rent": 4600,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat16",
        "unit_cost_center_code": "CC-Old Salata 2-Flat16",
        "unit_name": "OldSalata2-Flat16",
        "current_tenant": "Mr. Muhammad Irfan Wali Muhammad",
        "contract_start": "2025-11-11",
        "contract_end": "2026-11-10",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat17",
        "unit_cost_center_code": "CC-Old Salata 2-Flat17",
        "unit_name": "OldSalata2-Flat17",
        "current_tenant": "Mr. Naveen N Nidadavolu",
        "contract_start": "2026-04-11",
        "contract_end": "2027-04-10",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat18",
        "unit_cost_center_code": "CC-Old Salata 2-Flat18",
        "unit_name": "OldSalata2-Flat18",
        "current_tenant": "Mr. Siddharth Chetan Dave",
        "contract_start": "2026-03-15",
        "contract_end": "2026-07-14",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat19",
        "unit_cost_center_code": "CC-Old Salata 2-Flat19",
        "unit_name": "OldSalata2-Flat19",
        "current_tenant": "Mr. Bassel Maghames",
        "contract_start": "2025-10-03",
        "contract_end": "2026-10-02",
        "current_rent": 4600,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat20",
        "unit_cost_center_code": "CC-Old Salata 2-Flat20",
        "unit_name": "OldSalata2-Flat20",
        "current_tenant": "Ms. Souad Bougherara",
        "contract_start": "2025-10-25",
        "contract_end": "2026-10-24",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat21",
        "unit_cost_center_code": "CC-Old Salata 2-Flat21",
        "unit_name": "OldSalata2-Flat21",
        "current_tenant": "Mr. Faraz Ahmed Khan",
        "contract_start": "2026-06-02",
        "contract_end": "2027-06-01",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat22",
        "unit_cost_center_code": "CC-Old Salata 2-Flat22",
        "unit_name": "OldSalata2-Flat22",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat23",
        "unit_cost_center_code": "CC-Old Salata 2-Flat23",
        "unit_name": "OldSalata2-Flat23",
        "current_tenant": "Mr. Abhayawansha Rathnasekara",
        "contract_start": "2026-06-15",
        "contract_end": "2027-06-14",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat24",
        "unit_cost_center_code": "CC-Old Salata 2-Flat24",
        "unit_name": "OldSalata2-Flat24",
        "current_tenant": "Mr. Albert Farai Sharaunga",
        "contract_start": "2026-05-01",
        "contract_end": "2027-05-31",
        "current_rent": 3692,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat25",
        "unit_cost_center_code": "CC-Old Salata 2-Flat25",
        "unit_name": "OldSalata2-Flat25",
        "current_tenant": "Mr. Venkata Manojkumar Nallabotula",
        "contract_start": "2026-05-01",
        "contract_end": "2027-04-30",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat26",
        "unit_cost_center_code": "CC-Old Salata 2-Flat26",
        "unit_name": "OldSalata2-Flat26",
        "current_tenant": "Ms. Cristina Michaela Mitrache",
        "contract_start": "2026-04-20",
        "contract_end": "2027-04-19",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat27",
        "unit_cost_center_code": "CC-Old Salata 2-Flat27",
        "unit_name": "OldSalata2-Flat27",
        "current_tenant": "Mr. Prasanth Muthusamy",
        "contract_start": "2025-12-01",
        "contract_end": "2026-11-30",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Old Salata 2",
        "unit_code": "Flat28",
        "unit_cost_center_code": "CC-Old Salata 2-Flat28",
        "unit_name": "OldSalata2-Flat28",
        "current_tenant": "Mr. Abdelmalek Triki",
        "contract_start": "2026-07-20",
        "contract_end": "2027-07-19",
        "current_rent": 4300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat01",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat01",
        "unit_name": "Mansoura-JM2-Flat01",
        "current_tenant": "Mr. Augusto Galang Lobaton Jr.",
        "contract_start": "2025-10-01",
        "contract_end": "2026-09-30",
        "current_rent": 4600,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat02",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat02",
        "unit_name": "Mansoura-JM2-Flat02",
        "current_tenant": "Mr. Kannan Sankaran Subramani",
        "contract_start": "2025-08-01",
        "contract_end": "2026-07-31",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat03",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat03",
        "unit_name": "Mansoura-JM2-Flat03",
        "current_tenant": "Mr. Mohamed Shadir Mohamed Naufel",
        "contract_start": "2025-05-25",
        "contract_end": "2026-05-24",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat04",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat04",
        "unit_name": "Mansoura-JM2-Flat04",
        "current_tenant": "Mr. Imtiaz Syed",
        "contract_start": "2025-10-01",
        "contract_end": "2026-09-30",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat05",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat05",
        "unit_name": "Mansoura-JM2-Flat05",
        "current_tenant": "Ms.Vanessa Ingrid Pereira",
        "contract_start": "2026-02-01",
        "contract_end": "2027-01-31",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat06",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat06",
        "unit_name": "Mansoura-JM2-Flat06",
        "current_tenant": "M/s Embassy of Pakistan",
        "contract_start": "2026-06-25",
        "contract_end": "2027-06-24",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat07",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat07",
        "unit_name": "Mansoura-JM2-Flat07",
        "current_tenant": "Mr. Raneil P. Dela Cruz",
        "contract_start": "2026-07-15",
        "contract_end": "2027-07-14",
        "current_rent": 4800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat08",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat08",
        "unit_name": "Mansoura-JM2-Flat08",
        "current_tenant": "Mr. Warnewatte Waduge Suneth Sunera",
        "contract_start": "2025-06-10",
        "contract_end": "2027-06-09",
        "current_rent": 5900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat09",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat09",
        "unit_name": "Mansoura-JM2-Flat09",
        "current_tenant": "M/s Embassy of Pakistan",
        "contract_start": "2026-05-17",
        "contract_end": "2027-05-16",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat10",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat10",
        "unit_name": "Mansoura-JM2-Flat10",
        "current_tenant": "M/s Embassy of Pakistan",
        "contract_start": "2026-05-17",
        "contract_end": "2027-05-16",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat11",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat11",
        "unit_name": "Mansoura-JM2-Flat11",
        "current_tenant": "Ms. Maria Abigail Concepcion Almeron",
        "contract_start": "2026-08-01",
        "contract_end": "2027-07-31",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat12",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat12",
        "unit_name": "Mansoura-JM2-Flat12",
        "current_tenant": "Mr. Mohamed Meerashagani Dulkarunai",
        "contract_start": "2026-08-01",
        "contract_end": "2027-06-30",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat13",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat13",
        "unit_name": "Mansoura-JM2-Flat13",
        "current_tenant": "Mr. Ahmed Mohammed Abdellatif Elkhabaz",
        "contract_start": "2025-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 4600,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat14",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat14",
        "unit_name": "Mansoura-JM2-Flat14",
        "current_tenant": "Mr. Abdulmajid Abdulqawi Farhan Alhamidi",
        "contract_start": "2025-11-25",
        "contract_end": "2026-11-24",
        "current_rent": 5900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat15",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat15",
        "unit_name": "Mansoura-JM2-Flat15",
        "current_tenant": "Mr. Halden Noronha",
        "contract_start": "2026-05-01",
        "contract_end": "2027-05-31",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat16",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat16",
        "unit_name": "Mansoura-JM2-Flat16",
        "current_tenant": "Mr. Benjamin Mathew Kuriakose",
        "contract_start": "2026-06-01",
        "contract_end": "2026-05-31",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat17",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat17",
        "unit_name": "Mansoura-JM2-Flat17",
        "current_tenant": "Mr. Sooraj Gooradoo",
        "contract_start": "2026-02-15",
        "contract_end": "2027-02-14",
        "current_rent": 6250,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM2",
        "unit_code": "Flat18",
        "unit_cost_center_code": "CC-Mansoura - JM2-Flat18",
        "unit_name": "Mansoura-JM2-Flat18",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "Mansoura - JM10",
        "unit_code": "Flat101",
        "unit_cost_center_code": "CC-Mansoura - JM10-Flat101",
        "unit_name": "Mansoura-JM10-Flat101",
        "current_tenant": "M/S Special Numberz Trading",
        "contract_start": "2026-01-01",
        "contract_end": "2026-12-31",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM10",
        "unit_code": "Flat102",
        "unit_cost_center_code": "CC-Mansoura - JM10-Flat102",
        "unit_name": "Mansoura-JM10-Flat102",
        "current_tenant": "Mr. Sandeep Kumar Narayanan Panuvelil",
        "contract_start": "2026-01-01",
        "contract_end": "2026-12-31",
        "current_rent": 4500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM10",
        "unit_code": "Flat103",
        "unit_cost_center_code": "CC-Mansoura - JM10-Flat103",
        "unit_name": "Mansoura-JM10-Flat103",
        "current_tenant": "M/S Al Saad Sport Club",
        "contract_start": "2026-01-01",
        "contract_end": "2026-12-31",
        "current_rent": 5800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM10",
        "unit_code": "Flat201",
        "unit_cost_center_code": "CC-Mansoura - JM10-Flat201",
        "unit_name": "Mansoura-JM10-Flat201",
        "current_tenant": "Mr. Rama Krishna Sriramoju",
        "contract_start": "2025-12-15",
        "contract_end": "2026-12-14",
        "current_rent": 5900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM10",
        "unit_code": "Flat202",
        "unit_cost_center_code": "CC-Mansoura - JM10-Flat202",
        "unit_name": "Mansoura-JM10-Flat202",
        "current_tenant": "Mr. Tawiwut Charuwat",
        "contract_start": "2025-12-01",
        "contract_end": "2026-11-30",
        "current_rent": 4750,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM10",
        "unit_code": "Flat203",
        "unit_cost_center_code": "CC-Mansoura - JM10-Flat203",
        "unit_name": "Mansoura-JM10-Flat203",
        "current_tenant": "Ms. Abilasha Soni",
        "contract_start": "2026-01-01",
        "contract_end": "2026-12-31",
        "current_rent": 5700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM10",
        "unit_code": "Flat301",
        "unit_cost_center_code": "CC-Mansoura - JM10-Flat301",
        "unit_name": "Mansoura-JM10-Flat301",
        "current_tenant": "Mr. Manel Fatten",
        "contract_start": "2025-12-15",
        "contract_end": "2026-12-14",
        "current_rent": 5800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM10",
        "unit_code": "Flat302",
        "unit_cost_center_code": "CC-Mansoura - JM10-Flat302",
        "unit_name": "Mansoura-JM10-Flat302",
        "current_tenant": "Mr. Mohammed Ajmal Kothikal",
        "contract_start": "2025-12-01",
        "contract_end": "2026-11-30",
        "current_rent": 4500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM10",
        "unit_code": "Flat303",
        "unit_cost_center_code": "CC-Mansoura - JM10-Flat303",
        "unit_name": "Mansoura-JM10-Flat303",
        "current_tenant": "Ms. Yogalekshmi Selvanathan",
        "contract_start": "2026-01-01",
        "contract_end": "2026-12-31",
        "current_rent": 5800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM10",
        "unit_code": "Flat401",
        "unit_cost_center_code": "CC-Mansoura - JM10-Flat401",
        "unit_name": "Mansoura-JM10-Flat401",
        "current_tenant": "Mr. Jasmeet Singh Bal",
        "contract_start": "2025-12-01",
        "contract_end": "2026-11-30",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM10",
        "unit_code": "Flat402",
        "unit_cost_center_code": "CC-Mansoura - JM10-Flat402",
        "unit_name": "Mansoura-JM10-Flat402",
        "current_tenant": "Mr. Sunil Thapa",
        "contract_start": "2025-12-01",
        "contract_end": "2026-11-30",
        "current_rent": 4500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM10",
        "unit_code": "Flat403",
        "unit_cost_center_code": "CC-Mansoura - JM10-Flat403",
        "unit_name": "Mansoura-JM10-Flat403",
        "current_tenant": "Mr. Amir Hesham Mohamed Osman Rezk",
        "contract_start": "2025-12-15",
        "contract_end": "2026-12-14",
        "current_rent": 5800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM10",
        "unit_code": "Flat501",
        "unit_cost_center_code": "CC-Mansoura - JM10-Flat501",
        "unit_name": "Mansoura-JM10-Flat501",
        "current_tenant": "Mr. Bulchandani Ramesh Narsing Dasji",
        "contract_start": "2025-12-01",
        "contract_end": "2026-11-30",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM10",
        "unit_code": "Flat502",
        "unit_cost_center_code": "CC-Mansoura - JM10-Flat502",
        "unit_name": "Mansoura-JM10-Flat502",
        "current_tenant": "Mr. Rameel Sher Khan",
        "contract_start": "2025-12-15",
        "contract_end": "2026-12-14",
        "current_rent": 4500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM10",
        "unit_code": "Flat503",
        "unit_cost_center_code": "CC-Mansoura - JM10-Flat503",
        "unit_name": "Mansoura-JM10-Flat503",
        "current_tenant": "Mr. Mazen Jaber",
        "contract_start": "2026-01-01",
        "contract_end": "2026-12-31",
        "current_rent": 5700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - JM10",
        "unit_code": "Studio",
        "unit_cost_center_code": "CC-Mansoura - JM10-Studio",
        "unit_name": "Mansoura-JM10-Studio",
        "current_tenant": "Mr. Mohamed Soliman",
        "contract_start": "2025-11-10",
        "contract_end": "2026-11-09",
        "current_rent": 3000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - 40",
        "unit_code": "Flat05",
        "unit_cost_center_code": "CC-Mansoura - 40-Flat05",
        "unit_name": "Mansoura-40-Flat05",
        "current_tenant": "Mr. Akram Hassan",
        "contract_start": "2025-08-15",
        "contract_end": "2026-08-14",
        "current_rent": 4900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mansoura - 25",
        "unit_code": "Flat39",
        "unit_cost_center_code": "CC-Mansoura - 25-Flat39",
        "unit_name": "Mansoura-25-Flat39",
        "current_tenant": "Mr. Selvamuthukumaran Ramalingam",
        "contract_start": "2026-03-01",
        "contract_end": "2027-02-28",
        "current_rent": 4900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat01",
        "unit_cost_center_code": "CC-Naser - 03-Flat01",
        "unit_name": "Naser-03-Flat01",
        "current_tenant": "Mr. Nader A A Qudeimat",
        "contract_start": "2026-03-15",
        "contract_end": "2027-03-31",
        "current_rent": 5800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat02",
        "unit_cost_center_code": "CC-Naser - 03-Flat02",
        "unit_name": "Naser-03-Flat02",
        "current_tenant": "M/S Crompton International Trading",
        "contract_start": "2026-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat03",
        "unit_cost_center_code": "CC-Naser - 03-Flat03",
        "unit_name": "Naser-03-Flat03",
        "current_tenant": "Ms. Sandra Anne Francis Xavier",
        "contract_start": "2026-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 5900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat04",
        "unit_cost_center_code": "CC-Naser - 03-Flat04",
        "unit_name": "Naser-03-Flat04",
        "current_tenant": "Mr. Mohamedalmogtba Abbas",
        "contract_start": "2026-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 5700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat05",
        "unit_cost_center_code": "CC-Naser - 03-Flat05",
        "unit_name": "Naser-03-Flat05",
        "current_tenant": "Mr. Ahmad Hasan Bader Ibrahim Aqel",
        "contract_start": "2026-05-01",
        "contract_end": "2027-04-30",
        "current_rent": 6700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat06",
        "unit_cost_center_code": "CC-Naser - 03-Flat06",
        "unit_name": "Naser-03-Flat06",
        "current_tenant": "Mr. Yousef Mohammad Nassar",
        "contract_start": "2026-03-10",
        "contract_end": "2027-03-09",
        "current_rent": 5800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat07",
        "unit_cost_center_code": "CC-Naser - 03-Flat07",
        "unit_name": "Naser-03-Flat07",
        "current_tenant": "Ms. Hanan Ghazi H Mubarak",
        "contract_start": "2026-03-01",
        "contract_end": "2027-02-28",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat08",
        "unit_cost_center_code": "CC-Naser - 03-Flat08",
        "unit_name": "Naser-03-Flat08",
        "current_tenant": "Mr. Mohamed Aboulazayem Hassan Abooh",
        "contract_start": "2026-04-15",
        "contract_end": "2027-04-14",
        "current_rent": 5900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat09",
        "unit_cost_center_code": "CC-Naser - 03-Flat09",
        "unit_name": "Naser-03-Flat09",
        "current_tenant": "Ms. Ghada Kristou",
        "contract_start": "2026-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 5600,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat10",
        "unit_cost_center_code": "CC-Naser - 03-Flat10",
        "unit_name": "Naser-03-Flat10",
        "current_tenant": "Mr. Mousa Mohammad Mousa Abu Ahhoud",
        "contract_start": "2026-02-15",
        "contract_end": "2027-02-14",
        "current_rent": 6200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat11",
        "unit_cost_center_code": "CC-Naser - 03-Flat11",
        "unit_name": "Naser-03-Flat11",
        "current_tenant": "Mr. Afroz Ahmed",
        "contract_start": "2026-05-01",
        "contract_end": "2027-04-30",
        "current_rent": 6700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat12",
        "unit_cost_center_code": "CC-Naser - 03-Flat12",
        "unit_name": "Naser-03-Flat12",
        "current_tenant": "Ms. Katerina Antevska",
        "contract_start": "2026-04-20",
        "contract_end": "2027-04-19",
        "current_rent": 6400,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat13",
        "unit_cost_center_code": "CC-Naser - 03-Flat13",
        "unit_name": "Naser-03-Flat13",
        "current_tenant": "Mr. Yusuf Raoof",
        "contract_start": "2026-03-25",
        "contract_end": "2027-03-24",
        "current_rent": 6700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat14",
        "unit_cost_center_code": "CC-Naser - 03-Flat14",
        "unit_name": "Naser-03-Flat14",
        "current_tenant": "Ms. Hamda Ahmed Abdi",
        "contract_start": "2026-05-01",
        "contract_end": "2027-05-31",
        "current_rent": 6500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat15",
        "unit_cost_center_code": "CC-Naser - 03-Flat15",
        "unit_name": "Naser-03-Flat15",
        "current_tenant": "Mr. Satish Saini Ramesh",
        "contract_start": "2026-06-01",
        "contract_end": "2027-05-31",
        "current_rent": 6200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat16",
        "unit_cost_center_code": "CC-Naser - 03-Flat16",
        "unit_name": "Naser-03-Flat16",
        "current_tenant": "Mr. Bilal Inayat Inayatullah",
        "contract_start": "2026-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 6800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat17",
        "unit_cost_center_code": "CC-Naser - 03-Flat17",
        "unit_name": "Naser-03-Flat17",
        "current_tenant": "Mr. Karim Bakar",
        "contract_start": "2026-04-20",
        "contract_end": "2027-04-19",
        "current_rent": 6600,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat18",
        "unit_cost_center_code": "CC-Naser - 03-Flat18",
        "unit_name": "Naser-03-Flat18",
        "current_tenant": "M/S Mace Qatar Contracting & Eng'g",
        "contract_start": "2026-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 6500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat19",
        "unit_cost_center_code": "CC-Naser - 03-Flat19",
        "unit_name": "Naser-03-Flat19",
        "current_tenant": "Mr. Samer Hisham Aljogol",
        "contract_start": "2026-05-01",
        "contract_end": "2027-04-30",
        "current_rent": 6700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat20",
        "unit_cost_center_code": "CC-Naser - 03-Flat20",
        "unit_name": "Naser-03-Flat20",
        "current_tenant": "Mr. Nareshkumar Chandrasekaran",
        "contract_start": "2026-04-05",
        "contract_end": "2027-04-04",
        "current_rent": 6500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat21",
        "unit_cost_center_code": "CC-Naser - 03-Flat21",
        "unit_name": "Naser-03-Flat21",
        "current_tenant": "Mr. Faisal Ahmad Ballan",
        "contract_start": "2026-05-01",
        "contract_end": "2027-04-30",
        "current_rent": 6200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat22",
        "unit_cost_center_code": "CC-Naser - 03-Flat22",
        "unit_name": "Naser-03-Flat22",
        "current_tenant": "Mr. George Chacko Chacko Varghese",
        "contract_start": "2026-03-20",
        "contract_end": "2027-03-19",
        "current_rent": 6800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat23",
        "unit_cost_center_code": "CC-Naser - 03-Flat23",
        "unit_name": "Naser-03-Flat23",
        "current_tenant": "Mr. Yahia Zakaria Kamaleldin Albahy",
        "contract_start": "2026-05-01",
        "contract_end": "2027-04-30",
        "current_rent": 6800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat24",
        "unit_cost_center_code": "CC-Naser - 03-Flat24",
        "unit_name": "Naser-03-Flat24",
        "current_tenant": "Mr. Ramakrishnan Sundaram Sundaram",
        "contract_start": "2026-05-01",
        "contract_end": "2027-04-30",
        "current_rent": 6400,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Naser - 03",
        "unit_code": "Flat25",
        "unit_cost_center_code": "CC-Naser - 03-Flat25",
        "unit_name": "Naser-03-Flat25",
        "current_tenant": "Mr. Ali Sufian Muhammad Ashraf",
        "contract_start": "2026-04-15",
        "contract_end": "2027-04-14",
        "current_rent": 6300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat101",
        "unit_cost_center_code": "CC-PQ - AP10-Flat101",
        "unit_name": "PQ-AP10-Flat101",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat102",
        "unit_cost_center_code": "CC-PQ - AP10-Flat102",
        "unit_name": "PQ-AP10-Flat102",
        "current_tenant": "Mr. Amir Hamze Rani Bazzi",
        "contract_start": "2026-02-01",
        "contract_end": "2027-02-28",
        "current_rent": 7400,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat103",
        "unit_cost_center_code": "CC-PQ - AP10-Flat103",
        "unit_name": "PQ-AP10-Flat103",
        "current_tenant": "Mr. Abdallah Nidal Esam Alboukhari",
        "contract_start": "2026-07-01",
        "contract_end": "2027-07-31",
        "current_rent": 7100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat104",
        "unit_cost_center_code": "CC-PQ - AP10-Flat104",
        "unit_name": "PQ-AP10-Flat104",
        "current_tenant": "Mr. Feysal Awil Hassan",
        "contract_start": "2025-11-15",
        "contract_end": "2026-11-14",
        "current_rent": 7400,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat105",
        "unit_cost_center_code": "CC-PQ - AP10-Flat105",
        "unit_name": "PQ-AP10-Flat105",
        "current_tenant": "Ms. Mays Jamal Ghaith",
        "contract_start": "2025-11-15",
        "contract_end": "2026-11-14",
        "current_rent": 7300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat106",
        "unit_cost_center_code": "CC-PQ - AP10-Flat106",
        "unit_name": "PQ-AP10-Flat106",
        "current_tenant": "Ms. Sabrine Ferjani",
        "contract_start": "2025-12-01",
        "contract_end": "2026-11-30",
        "current_rent": 7000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat107",
        "unit_cost_center_code": "CC-PQ - AP10-Flat107",
        "unit_name": "PQ-AP10-Flat107",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat108",
        "unit_cost_center_code": "CC-PQ - AP10-Flat108",
        "unit_name": "PQ-AP10-Flat108",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat201",
        "unit_cost_center_code": "CC-PQ - AP10-Flat201",
        "unit_name": "PQ-AP10-Flat201",
        "current_tenant": "Ms. Samantha Khadine Anushka Mohammed",
        "contract_start": "2025-10-20",
        "contract_end": "2026-11-19",
        "current_rent": 7700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat202",
        "unit_cost_center_code": "CC-PQ - AP10-Flat202",
        "unit_name": "PQ-AP10-Flat202",
        "current_tenant": "M/S KATARA RCHD",
        "contract_start": "2025-02-20",
        "contract_end": "2026-02-19",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat203",
        "unit_cost_center_code": "CC-PQ - AP10-Flat203",
        "unit_name": "PQ-AP10-Flat203",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat204",
        "unit_cost_center_code": "CC-PQ - AP10-Flat204",
        "unit_name": "PQ-AP10-Flat204",
        "current_tenant": "Mr.Alan Deans Walters Palmer",
        "contract_start": "2025-01-05",
        "contract_end": "2026-01-04",
        "current_rent": 7700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat205",
        "unit_cost_center_code": "CC-PQ - AP10-Flat205",
        "unit_name": "PQ-AP10-Flat205",
        "current_tenant": "Mr. Eyad K A Elkhorebi",
        "contract_start": "2025-11-01",
        "contract_end": "2026-10-31",
        "current_rent": 7800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat206",
        "unit_cost_center_code": "CC-PQ - AP10-Flat206",
        "unit_name": "PQ-AP10-Flat206",
        "current_tenant": "Ms. Heba Mohamed Magdy Mahmoud Gheith",
        "contract_start": "2025-01-01",
        "contract_end": "2027-01-31",
        "current_rent": 7400,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat207",
        "unit_cost_center_code": "CC-PQ - AP10-Flat207",
        "unit_name": "PQ-AP10-Flat207",
        "current_tenant": "Mr. Stefan Sudimac",
        "contract_start": "2026-07-01",
        "contract_end": "2027-01-31",
        "current_rent": 7200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat208",
        "unit_cost_center_code": "CC-PQ - AP10-Flat208",
        "unit_name": "PQ-AP10-Flat208",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat301",
        "unit_cost_center_code": "CC-PQ - AP10-Flat301",
        "unit_name": "PQ-AP10-Flat301",
        "current_tenant": "Mr. Rony Jean Ramady",
        "contract_start": "2026-05-26",
        "contract_end": "2027-06-25",
        "current_rent": 7600,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat302",
        "unit_cost_center_code": "CC-PQ - AP10-Flat302",
        "unit_name": "PQ-AP10-Flat302",
        "current_tenant": "Mr. Ahmad Bilal",
        "contract_start": "2026-06-01",
        "contract_end": "2027-06-30",
        "current_rent": 7400,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat303",
        "unit_cost_center_code": "CC-PQ - AP10-Flat303",
        "unit_name": "PQ-AP10-Flat303",
        "current_tenant": "M/S KATARA RCHD",
        "contract_start": "2025-11-01",
        "contract_end": "2026-10-31",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat304",
        "unit_cost_center_code": "CC-PQ - AP10-Flat304",
        "unit_name": "PQ-AP10-Flat304",
        "current_tenant": "Mr. Lalit Taneja",
        "contract_start": "2026-01-01",
        "contract_end": "2026-12-31",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat305",
        "unit_cost_center_code": "CC-PQ - AP10-Flat305",
        "unit_name": "PQ-AP10-Flat305",
        "current_tenant": "Ms. Thalia Katiuska Ortiz del Valle",
        "contract_start": "2025-11-01",
        "contract_end": "2026-11-30",
        "current_rent": 7700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat306",
        "unit_cost_center_code": "CC-PQ - AP10-Flat306",
        "unit_name": "PQ-AP10-Flat306",
        "current_tenant": "Mr. Albert Biosca Caro",
        "contract_start": "2025-12-01",
        "contract_end": "2026-11-30",
        "current_rent": 7300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat307",
        "unit_cost_center_code": "CC-PQ - AP10-Flat307",
        "unit_name": "PQ-AP10-Flat307",
        "current_tenant": "Mr. Ihar Selivonchyk",
        "contract_start": "2025-12-01",
        "contract_end": "2026-12-31",
        "current_rent": 7400,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat308",
        "unit_cost_center_code": "CC-PQ - AP10-Flat308",
        "unit_name": "PQ-AP10-Flat308",
        "current_tenant": "Ms. Adina Hardi Bidin",
        "contract_start": "2026-01-01",
        "contract_end": "2027-01-31",
        "current_rent": 7293,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat401",
        "unit_cost_center_code": "CC-PQ - AP10-Flat401",
        "unit_name": "PQ-AP10-Flat401",
        "current_tenant": "Mr. Hamad Anwar H A Albuaijan",
        "contract_start": "2026-03-01",
        "contract_end": "2026-12-31",
        "current_rent": 7300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat402",
        "unit_cost_center_code": "CC-PQ - AP10-Flat402",
        "unit_name": "PQ-AP10-Flat402",
        "current_tenant": "Mr. Mohammad Firsham Bin Abdullah",
        "contract_start": "2026-05-25",
        "contract_end": "2027-05-24",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat403",
        "unit_cost_center_code": "CC-PQ - AP10-Flat403",
        "unit_name": "PQ-AP10-Flat403",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat404",
        "unit_cost_center_code": "CC-PQ - AP10-Flat404",
        "unit_name": "PQ-AP10-Flat404",
        "current_tenant": "Mr. Seif Issam Samaan Aibefe",
        "contract_start": "2026-05-10",
        "contract_end": "2027-07-09",
        "current_rent": 7600,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat405",
        "unit_cost_center_code": "CC-PQ - AP10-Flat405",
        "unit_name": "PQ-AP10-Flat405",
        "current_tenant": "Mr. Abdouhak Madaoui",
        "contract_start": "2025-11-01",
        "contract_end": "2026-11-01",
        "current_rent": 7900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat406",
        "unit_cost_center_code": "CC-PQ - AP10-Flat406",
        "unit_name": "PQ-AP10-Flat406",
        "current_tenant": "Ms. Rania Mneimneh",
        "contract_start": "2026-04-01",
        "contract_end": "2027-04-30",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat407",
        "unit_cost_center_code": "CC-PQ - AP10-Flat407",
        "unit_name": "PQ-AP10-Flat407",
        "current_tenant": "Ms. Shalaka Bharade",
        "contract_start": "2026-05-22",
        "contract_end": "2027-06-21",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat408",
        "unit_cost_center_code": "CC-PQ - AP10-Flat408",
        "unit_name": "PQ-AP10-Flat408",
        "current_tenant": "Mr. Bojan Sestan",
        "contract_start": "2025-08-01",
        "contract_end": "2026-07-31",
        "current_rent": 7700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat501",
        "unit_cost_center_code": "CC-PQ - AP10-Flat501",
        "unit_name": "PQ-AP10-Flat501",
        "current_tenant": "Ms. Ei Ei Htun",
        "contract_start": "2025-08-01",
        "contract_end": "2026-08-31",
        "current_rent": 7900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat502",
        "unit_cost_center_code": "CC-PQ - AP10-Flat502",
        "unit_name": "PQ-AP10-Flat502",
        "current_tenant": "Mr. Charly Joseph Wehbe",
        "contract_start": "2025-12-25",
        "contract_end": "2027-01-24",
        "current_rent": 7700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat503",
        "unit_cost_center_code": "CC-PQ - AP10-Flat503",
        "unit_name": "PQ-AP10-Flat503",
        "current_tenant": "Ms. Claire Marie Dela Cruz Drilon",
        "contract_start": "2025-09-01",
        "contract_end": "2026-09-30",
        "current_rent": 7700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat504",
        "unit_cost_center_code": "CC-PQ - AP10-Flat504",
        "unit_name": "PQ-AP10-Flat504",
        "current_tenant": "Mr. Thanh Thinh Tran",
        "contract_start": "2025-12-10",
        "contract_end": "2025-12-09",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat505",
        "unit_cost_center_code": "CC-PQ - AP10-Flat505",
        "unit_name": "PQ-AP10-Flat505",
        "current_tenant": "Ms. Tassadit Gharbi",
        "contract_start": "2025-11-01",
        "contract_end": "2026-10-31",
        "current_rent": 7600,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat506",
        "unit_cost_center_code": "CC-PQ - AP10-Flat506",
        "unit_name": "PQ-AP10-Flat506",
        "current_tenant": "Me. Michelle Jane Asafu Adjaye",
        "contract_start": "2026-07-01",
        "contract_end": "2027-07-31",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat507",
        "unit_cost_center_code": "CC-PQ - AP10-Flat507",
        "unit_name": "PQ-AP10-Flat507",
        "current_tenant": "Mr. Haytem Khouild",
        "contract_start": "2026-05-01",
        "contract_end": "2027-05-31",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat508",
        "unit_cost_center_code": "CC-PQ - AP10-Flat508",
        "unit_name": "PQ-AP10-Flat508",
        "current_tenant": "Mr. Jose Alberto Montenegro Carvallo",
        "contract_start": "2026-02-01",
        "contract_end": "2027-02-28",
        "current_rent": 7800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat601",
        "unit_cost_center_code": "CC-PQ - AP10-Flat601",
        "unit_name": "PQ-AP10-Flat601",
        "current_tenant": "Mr. Yousef Mohammed Abubaker",
        "contract_start": "2026-03-01",
        "contract_end": "2027-03-31",
        "current_rent": 7000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat602",
        "unit_cost_center_code": "CC-PQ - AP10-Flat602",
        "unit_name": "PQ-AP10-Flat602",
        "current_tenant": "Ms. Jamilya Parkina",
        "contract_start": "2026-02-01",
        "contract_end": "2027-02-28",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat603",
        "unit_cost_center_code": "CC-PQ - AP10-Flat603",
        "unit_name": "PQ-AP10-Flat603",
        "current_tenant": "Ms. Leia Bassam Bassam",
        "contract_start": "2026-04-20",
        "contract_end": "2027-04-19",
        "current_rent": 7700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat604",
        "unit_cost_center_code": "CC-PQ - AP10-Flat604",
        "unit_name": "PQ-AP10-Flat604",
        "current_tenant": "Mr. Hassan Youssef",
        "contract_start": "2026-02-01",
        "contract_end": "2027-02-28",
        "current_rent": 7600,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat605",
        "unit_cost_center_code": "CC-PQ - AP10-Flat605",
        "unit_name": "PQ-AP10-Flat605",
        "current_tenant": "Ms. Yasmine Sabra",
        "contract_start": "2025-12-01",
        "contract_end": "2026-12-31",
        "current_rent": 7600,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat606",
        "unit_cost_center_code": "CC-PQ - AP10-Flat606",
        "unit_name": "PQ-AP10-Flat606",
        "current_tenant": "Mr. Bongane Edmond Shangwe",
        "contract_start": "2026-05-01",
        "contract_end": "2027-05-31",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat607",
        "unit_cost_center_code": "CC-PQ - AP10-Flat607",
        "unit_name": "PQ-AP10-Flat607",
        "current_tenant": "Mr. Barakat Zeyad Barakat Aladwan",
        "contract_start": "2026-02-15",
        "contract_end": "2027-03-14",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "PQ - AP10",
        "unit_code": "Flat608",
        "unit_cost_center_code": "CC-PQ - AP10-Flat608",
        "unit_name": "PQ-AP10-Flat608",
        "current_tenant": "Ms. Mariam Hasan Mohammad Ibrahim",
        "contract_start": "2026-06-01",
        "contract_end": "2027-06-30",
        "current_rent": 7800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 1",
        "unit_code": "Flat01",
        "unit_cost_center_code": "CC-Bin Omran 1-Flat01",
        "unit_name": "BinOmran1-Flat01",
        "current_tenant": "Mr. Fernan Binay- An Carpio",
        "contract_start": "2026-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 4800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 1",
        "unit_code": "Flat02",
        "unit_cost_center_code": "CC-Bin Omran 1-Flat02",
        "unit_name": "BinOmran1-Flat02",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "Bin Omran 1",
        "unit_code": "Flat03",
        "unit_cost_center_code": "CC-Bin Omran 1-Flat03",
        "unit_name": "BinOmran1-Flat03",
        "current_tenant": "M/S Ishaq Electrical",
        "contract_start": "2025-11-01",
        "contract_end": "2026-10-31",
        "current_rent": 4900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 1",
        "unit_code": "Flat04",
        "unit_cost_center_code": "CC-Bin Omran 1-Flat04",
        "unit_name": "BinOmran1-Flat04",
        "current_tenant": "Mr. Zaid Jasser Suliman Alnweiran",
        "contract_start": "2026-02-15",
        "contract_end": "2027-02-14",
        "current_rent": 4800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 1",
        "unit_code": "Flat05",
        "unit_cost_center_code": "CC-Bin Omran 1-Flat05",
        "unit_name": "BinOmran1-Flat05",
        "current_tenant": "Mr. Mannil Mahesh Menon",
        "contract_start": "2025-06-28",
        "contract_end": "2026-07-27",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 1",
        "unit_code": "Flat06",
        "unit_cost_center_code": "CC-Bin Omran 1-Flat06",
        "unit_name": "BinOmran1-Flat06",
        "current_tenant": "Mr. Ahamed Satham Samsudeen",
        "contract_start": "2026-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 4800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 1",
        "unit_code": "Flat07",
        "unit_cost_center_code": "CC-Bin Omran 1-Flat07",
        "unit_name": "BinOmran1-Flat07",
        "current_tenant": "Mr. Assem Ali Elsayed Battikh",
        "contract_start": "2026-07-01",
        "contract_end": "2027-06-30",
        "current_rent": 4800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 1",
        "unit_code": "Flat08",
        "unit_cost_center_code": "CC-Bin Omran 1-Flat08",
        "unit_name": "BinOmran1-Flat08",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "Bin Omran 1",
        "unit_code": "Flat09",
        "unit_cost_center_code": "CC-Bin Omran 1-Flat09",
        "unit_name": "BinOmran1-Flat09",
        "current_tenant": "Mr. Jyothi Prasanth C Sekar",
        "contract_start": "2026-06-10",
        "contract_end": "2027-06-09",
        "current_rent": 4800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 1",
        "unit_code": "Flat10",
        "unit_cost_center_code": "CC-Bin Omran 1-Flat10",
        "unit_name": "BinOmran1-Flat10",
        "current_tenant": "Mr. Mohiuddin Shaikh",
        "contract_start": "2025-08-25",
        "contract_end": "2026-08-24",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 1",
        "unit_code": "Flat11",
        "unit_cost_center_code": "CC-Bin Omran 1-Flat11",
        "unit_name": "BinOmran1-Flat11",
        "current_tenant": "Pakistan Embassy, Ms. Ghazala Akhtar",
        "contract_start": "2026-08-28",
        "contract_end": "2027-06-27",
        "current_rent": 7500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 1",
        "unit_code": "Flat12",
        "unit_cost_center_code": "CC-Bin Omran 1-Flat12",
        "unit_name": "BinOmran1-Flat12",
        "current_tenant": "Mr. Mohammed Kamran Tanoli",
        "contract_start": "2026-05-15",
        "contract_end": "2027-05-14",
        "current_rent": 4800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 1",
        "unit_code": "Flat13",
        "unit_cost_center_code": "CC-Bin Omran 1-Flat13",
        "unit_name": "BinOmran1-Flat13",
        "current_tenant": "Mr. Balaji Talaseela",
        "contract_start": "2026-05-30",
        "contract_end": "2027-06-30",
        "current_rent": 4900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 1",
        "unit_code": "Flat14",
        "unit_cost_center_code": "CC-Bin Omran 1-Flat14",
        "unit_name": "BinOmran1-Flat14",
        "current_tenant": "Mr. Majdi Fadel Kassem",
        "contract_start": "2025-09-01",
        "contract_end": "2026-08-31",
        "current_rent": 4800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 1",
        "unit_code": "Flat15",
        "unit_cost_center_code": "CC-Bin Omran 1-Flat15",
        "unit_name": "BinOmran1-Flat15",
        "current_tenant": "Mr. Mohamed Zafnas Mohamed Zarook",
        "contract_start": "2025-01-15",
        "contract_end": "2027-01-14",
        "current_rent": 4800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat01",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat01",
        "unit_name": "BinOmran2-Flat01",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat02",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat02",
        "unit_name": "BinOmran2-Flat02",
        "current_tenant": "Ms. Elinor Radam Laja",
        "contract_start": "2026-05-01",
        "contract_end": "2027-04-30",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat03",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat03",
        "unit_name": "BinOmran2-Flat03",
        "current_tenant": "Mr. Hussein Younes Jaber",
        "contract_start": "2025-08-10",
        "contract_end": "2026-08-09",
        "current_rent": 5100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat04",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat04",
        "unit_name": "BinOmran2-Flat04",
        "current_tenant": "Mr. Farhan Siraj",
        "contract_start": "2025-12-15",
        "contract_end": "2026-12-31",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat05",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat05",
        "unit_name": "BinOmran2-Flat05",
        "current_tenant": "Mr. Basel Ahmad Sudqi Hamdan",
        "contract_start": "2025-09-15",
        "contract_end": "2026-09-14",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat06",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat06",
        "unit_name": "BinOmran2-Flat06",
        "current_tenant": "Mr. Anwar Mahmoud Shibli",
        "contract_start": "2026-12-01",
        "contract_end": "2027-05-31",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat07",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat07",
        "unit_name": "BinOmran2-Flat07",
        "current_tenant": "Mr. Abdelrahman Mahmoud Soliman",
        "contract_start": "2025-02-01",
        "contract_end": "2027-01-31",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat08",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat08",
        "unit_name": "BinOmran2-Flat08",
        "current_tenant": "Ms. Ria Mary",
        "contract_start": "2025-03-20",
        "contract_end": "2027-03-19",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat09",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat09",
        "unit_name": "BinOmran2-Flat09",
        "current_tenant": "Mr. Ajith Kumar Chandroth Manikoth",
        "contract_start": "2025-09-05",
        "contract_end": "2026-09-04",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat10",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat10",
        "unit_name": "BinOmran2-Flat10",
        "current_tenant": "Mr. Umairullah Khan Pathan",
        "contract_start": "2025-08-01",
        "contract_end": "2026-07-31",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat11",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat11",
        "unit_name": "BinOmran2-Flat11",
        "current_tenant": "Ms. Mekhna Ann George",
        "contract_start": "2026-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat12",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat12",
        "unit_name": "BinOmran2-Flat12",
        "current_tenant": "Mr. Omar S Bouassi",
        "contract_start": "2025-09-01",
        "contract_end": "2026-08-31",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat13",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat13",
        "unit_name": "BinOmran2-Flat13",
        "current_tenant": "Mr. Bassel Ali Hammoud",
        "contract_start": "2025-11-15",
        "contract_end": "2026-11-14",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat14",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat14",
        "unit_name": "BinOmran2-Flat14",
        "current_tenant": "Mr. Shadi Nino",
        "contract_start": "2026-12-01",
        "contract_end": "2027-01-31",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat15",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat15",
        "unit_name": "BinOmran2-Flat15",
        "current_tenant": "Ms. Honeylaine Gleezell  Paras",
        "contract_start": "2026-02-01",
        "contract_end": "2027-01-31",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat16",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat16",
        "unit_name": "BinOmran2-Flat16",
        "current_tenant": "Mr. Nikhil Neelakanta Puthran",
        "contract_start": "2026-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat17",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat17",
        "unit_name": "BinOmran2-Flat17",
        "current_tenant": "Mr. Mohamed Swedan",
        "contract_start": "2025-11-01",
        "contract_end": "2026-10-31",
        "current_rent": 5100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat18",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat18",
        "unit_name": "BinOmran2-Flat18",
        "current_tenant": "Ms. Khaoula Arfaoui",
        "contract_start": "2026-06-01",
        "contract_end": "2027-05-31",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat19",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat19",
        "unit_name": "BinOmran2-Flat19",
        "current_tenant": "Mr. Farhan Ahmad Mirza",
        "contract_start": "2026-03-01",
        "contract_end": "2027-02-28",
        "current_rent": 5100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat20",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat20",
        "unit_name": "BinOmran2-Flat20",
        "current_tenant": "Ms. Krethlyne Del Rosario Paraiso",
        "contract_start": "2026-02-15",
        "contract_end": "2027-02-14",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat21",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat21",
        "unit_name": "BinOmran2-Flat21",
        "current_tenant": "Mr. Muralidharan Thenozhy Vadassery",
        "contract_start": "2025-08-15",
        "contract_end": "2026-08-14",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat22",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat22",
        "unit_name": "BinOmran2-Flat22",
        "current_tenant": "Mr. Rajesh Thenguvila Krishnan",
        "contract_start": "2026-04-15",
        "contract_end": "2027-04-14",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat23",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat23",
        "unit_name": "BinOmran2-Flat23",
        "current_tenant": "Mr. Siraj Ahamed Abul Kasim",
        "contract_start": "2026-01-16",
        "contract_end": "2027-01-15",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat24",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat24",
        "unit_name": "BinOmran2-Flat24",
        "current_tenant": "Mr. Muhammad Asif M Ilyas",
        "contract_start": "2025-10-01",
        "contract_end": "2026-09-30",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat25",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat25",
        "unit_name": "BinOmran2-Flat25",
        "current_tenant": "Mr. Mustafa Mohamed Gany",
        "contract_start": "2026-02-01",
        "contract_end": "2027-01-31",
        "current_rent": 4800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat26",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat26",
        "unit_name": "BinOmran2-Flat26",
        "current_tenant": "Mr. Azeem Farooque Kotwal",
        "contract_start": "2026-06-15",
        "contract_end": "2027-06-14",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat27",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat27",
        "unit_name": "BinOmran2-Flat27",
        "current_tenant": "Mr. Hani Mohd Hashem Ahmed S",
        "contract_start": "2026-02-01",
        "contract_end": "2027-01-01",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat28",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat28",
        "unit_name": "BinOmran2-Flat28",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat29",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat29",
        "unit_name": "BinOmran2-Flat29",
        "current_tenant": "Mr. Moath Mohammad Suleiman Banimelhem",
        "contract_start": "2025-09-06",
        "contract_end": "2026-09-05",
        "current_rent": 5100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat30",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat30",
        "unit_name": "BinOmran2-Flat30",
        "current_tenant": "Mr. Mohamed Fazil Silingi Nizamuddin",
        "contract_start": "2026-07-15",
        "contract_end": "2027-07-14",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat31",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat31",
        "unit_name": "BinOmran2-Flat31",
        "current_tenant": "Mr. Hassan Sherif Mahmoud Elsherief",
        "contract_start": "2025-12-01",
        "contract_end": "2026-11-30",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat32",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat32",
        "unit_name": "BinOmran2-Flat32",
        "current_tenant": "Mr. MHD Khir Oughli",
        "contract_start": "2026-06-01",
        "contract_end": "2027-06-30",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat33",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat33",
        "unit_name": "BinOmran2-Flat33",
        "current_tenant": "Mr. Leon Manil Pius W. Fernndo",
        "contract_start": "2026-07-15",
        "contract_end": "2027-07-14",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat34",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat34",
        "unit_name": "BinOmran2-Flat34",
        "current_tenant": "Mr. PadmaPrabah Mavila Veetil",
        "contract_start": "2026-03-10",
        "contract_end": "2027-03-09",
        "current_rent": 5400,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat35",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat35",
        "unit_name": "BinOmran2-Flat35",
        "current_tenant": "Mr. Marco Maher Noose Bushra",
        "contract_start": "2026-03-15",
        "contract_end": "2027-03-31",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat36",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat36",
        "unit_name": "BinOmran2-Flat36",
        "current_tenant": "Mr. Arjun Narahari Rao",
        "contract_start": "2026-04-25",
        "contract_end": "2027-04-30",
        "current_rent": 5400,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat37",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat37",
        "unit_name": "BinOmran2-Flat37",
        "current_tenant": "Mr. Akram Ghassan Alkhoury",
        "contract_start": "2026-05-01",
        "contract_end": "2027-04-30",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat38",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat38",
        "unit_name": "BinOmran2-Flat38",
        "current_tenant": "Mr. Nithin Ismail Nadeera Beevi",
        "contract_start": "2025-10-07",
        "contract_end": "2026-10-06",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat39",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat39",
        "unit_name": "BinOmran2-Flat39",
        "current_tenant": "Mr. Nazim Mohammad Shabir Momin",
        "contract_start": "2025-08-01",
        "contract_end": "2026-07-31",
        "current_rent": 5100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat40",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat40",
        "unit_name": "BinOmran2-Flat40",
        "current_tenant": "Mr. Zaid Majed E Alsajjan",
        "contract_start": "2026-01-25",
        "contract_end": "2027-01-24",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat41",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat41",
        "unit_name": "BinOmran2-Flat41",
        "current_tenant": "Mr. Moetez Zribi",
        "contract_start": "2025-12-01",
        "contract_end": "2026-11-30",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat42",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat42",
        "unit_name": "BinOmran2-Flat42",
        "current_tenant": "Mr. Naser Shams Aldeen Mousa Husein",
        "contract_start": "2025-09-01",
        "contract_end": "2026-09-30",
        "current_rent": 5100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat43",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat43",
        "unit_name": "BinOmran2-Flat43",
        "current_tenant": "Mr. Ronaldo Gilles Villafranca",
        "contract_start": "2026-01-25",
        "contract_end": "2027-01-31",
        "current_rent": 5100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat44",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat44",
        "unit_name": "BinOmran2-Flat44",
        "current_tenant": "Ms. Aisha Gul Nawaz",
        "contract_start": "2025-08-01",
        "contract_end": "2026-07-31",
        "current_rent": 5100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat45",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat45",
        "unit_name": "BinOmran2-Flat45",
        "current_tenant": "Ms. Safa Barhoumi",
        "contract_start": "2025-08-25",
        "contract_end": "2026-08-24",
        "current_rent": 5100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat46",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat46",
        "unit_name": "BinOmran2-Flat46",
        "current_tenant": "Ms. Ajinimol Siju",
        "contract_start": "2025-08-01",
        "contract_end": "2026-07-31",
        "current_rent": 5400,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat47",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat47",
        "unit_name": "BinOmran2-Flat47",
        "current_tenant": "Mr. Akram Inad Karme",
        "contract_start": "2025-10-01",
        "contract_end": "2026-09-30",
        "current_rent": 5500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat48",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat48",
        "unit_name": "BinOmran2-Flat48",
        "current_tenant": "Mr. Adham Ahmed",
        "contract_start": "2026-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 5100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat49",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat49",
        "unit_name": "BinOmran2-Flat49",
        "current_tenant": "Ms. Luanne Marie Torres de Gracia",
        "contract_start": "2025-08-01",
        "contract_end": "2026-07-31",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat50",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat50",
        "unit_name": "BinOmran2-Flat50",
        "current_tenant": "Mr. Mohammed Ammaruddin Zahiruddin",
        "contract_start": "2026-06-01",
        "contract_end": "2027-05-31",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Bin Omran 2",
        "unit_code": "Flat51",
        "unit_cost_center_code": "CC-Bin Omran 2-Flat51",
        "unit_name": "BinOmran2-Flat51",
        "current_tenant": "Mr. Muhammad Azam",
        "contract_start": "2025-08-01",
        "contract_end": "2026-07-31",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "OA56",
        "unit_code": "Flat01",
        "unit_cost_center_code": "CC-OA56-Flat01",
        "unit_name": "OA56-Flat01",
        "current_tenant": "Mr. Roy Harfouche",
        "contract_start": "2026-05-20",
        "contract_end": "2027-05-19",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "OA56",
        "unit_code": "Flat02",
        "unit_cost_center_code": "CC-OA56-Flat02",
        "unit_name": "OA56-Flat02",
        "current_tenant": "Mr. Swaminathan Sundararajan",
        "contract_start": "2025-11-01",
        "contract_end": "2026-10-31",
        "current_rent": 4900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "OA56",
        "unit_code": "Flat03",
        "unit_cost_center_code": "CC-OA56-Flat03",
        "unit_name": "OA56-Flat03",
        "current_tenant": "Qatar Kentz",
        "contract_start": "2025-10-01",
        "contract_end": "2026-03-31",
        "current_rent": 6750,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "OA56",
        "unit_code": "Flat04",
        "unit_cost_center_code": "CC-OA56-Flat04",
        "unit_name": "OA56-Flat04",
        "current_tenant": "Ms. Marissa Pigao Espano",
        "contract_start": "2026-01-20",
        "contract_end": "2027-01-19",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "OA56",
        "unit_code": "Flat05",
        "unit_cost_center_code": "CC-OA56-Flat05",
        "unit_name": "OA56-Flat05",
        "current_tenant": "Mr. Sunil Koragappa Amin",
        "contract_start": "2025-07-05",
        "contract_end": "2026-07-04",
        "current_rent": 4700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "OA56",
        "unit_code": "Flat06",
        "unit_cost_center_code": "CC-OA56-Flat06",
        "unit_name": "OA56-Flat06",
        "current_tenant": "Mr. Dinesh Kumar Natheshan",
        "contract_start": "2026-06-15",
        "contract_end": "2027-06-14",
        "current_rent": 4800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "OA56",
        "unit_code": "Flat07",
        "unit_cost_center_code": "CC-OA56-Flat07",
        "unit_name": "OA56-Flat07",
        "current_tenant": "Larsen and Toubro Limited",
        "contract_start": "2025-12-01",
        "contract_end": "2026-11-30",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "OA56",
        "unit_code": "Flat08",
        "unit_cost_center_code": "CC-OA56-Flat08",
        "unit_name": "OA56-Flat08",
        "current_tenant": "Mr. Ritesh Saini",
        "contract_start": "2025-11-15",
        "contract_end": "2026-11-14",
        "current_rent": 4800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "OA56",
        "unit_code": "Flat09",
        "unit_cost_center_code": "CC-OA56-Flat09",
        "unit_name": "OA56-Flat09",
        "current_tenant": "Qatar Kentz",
        "contract_start": "2026-11-08",
        "contract_end": "2027-02-07",
        "current_rent": 5150,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "OA56",
        "unit_code": "Flat10",
        "unit_cost_center_code": "CC-OA56-Flat10",
        "unit_name": "OA56-Flat10",
        "current_tenant": "Mr. Devadas Pappu",
        "contract_start": "2026-04-07",
        "contract_end": "2027-04-06",
        "current_rent": 4900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "OA56",
        "unit_code": "Flat11",
        "unit_cost_center_code": "CC-OA56-Flat11",
        "unit_name": "OA56-Flat11",
        "current_tenant": "Qatar Kentz",
        "contract_start": "2025-05-16",
        "contract_end": "2026-11-15",
        "current_rent": 6750,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "OA56",
        "unit_code": "Flat12",
        "unit_cost_center_code": "CC-OA56-Flat12",
        "unit_name": "OA56-Flat12",
        "current_tenant": "Mr. Edwin Bright Varuvel Chellappan",
        "contract_start": "2026-03-15",
        "contract_end": "2027-03-14",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "OA56",
        "unit_code": "Flat13",
        "unit_cost_center_code": "CC-OA56-Flat13",
        "unit_name": "OA56-Flat13",
        "current_tenant": "Mr. Omar Abou Rehab H Mahmoud",
        "contract_start": "2026-01-01",
        "contract_end": "2026-12-31",
        "current_rent": 4700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Thihama 2",
        "unit_code": "Flat01",
        "unit_cost_center_code": "CC-Thihama 2-Flat01",
        "unit_name": "Thihama2-Flat01",
        "current_tenant": "M/s.Embassy of Pakistan",
        "contract_start": "2025-09-15",
        "contract_end": "2026-09-14",
        "current_rent": 5500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Thihama 2",
        "unit_code": "Flat02",
        "unit_cost_center_code": "CC-Thihama 2-Flat02",
        "unit_name": "Thihama2-Flat02",
        "current_tenant": "Mr. Gopala Krishnan Ramalingam",
        "contract_start": "2026-07-05",
        "contract_end": "2027-07-04",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Thihama 2",
        "unit_code": "Flat03",
        "unit_cost_center_code": "CC-Thihama 2-Flat03",
        "unit_name": "Thihama2-Flat03",
        "current_tenant": "Mr. Ujwal Thayyil Keezhana",
        "contract_start": "2026-01-08",
        "contract_end": "2027-01-07",
        "current_rent": 5100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Thihama 2",
        "unit_code": "Flat04",
        "unit_cost_center_code": "CC-Thihama 2-Flat04",
        "unit_name": "Thihama2-Flat04",
        "current_tenant": "Qatar Kentz PB 3865 Tel.44659447",
        "contract_start": "2026-09-10",
        "contract_end": "2026-12-09",
        "current_rent": 10000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Thihama 2",
        "unit_code": "Flat05",
        "unit_cost_center_code": "CC-Thihama 2-Flat05",
        "unit_name": "Thihama2-Flat05",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "Thihama 2",
        "unit_code": "Flat06",
        "unit_cost_center_code": "CC-Thihama 2-Flat06",
        "unit_name": "Thihama2-Flat06",
        "current_tenant": "Mr. Shabbir Iqbal Mamsa",
        "contract_start": "2025-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Thihama 2",
        "unit_code": "Flat07",
        "unit_cost_center_code": "CC-Thihama 2-Flat07",
        "unit_name": "Thihama2-Flat07",
        "current_tenant": "Qatar Kentz PB 3865 Tel.44659447",
        "contract_start": "2026-02-01",
        "contract_end": "2026-07-31",
        "current_rent": 6750,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Thihama 2",
        "unit_code": "Flat08",
        "unit_cost_center_code": "CC-Thihama 2-Flat08",
        "unit_name": "Thihama2-Flat08",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "Thihama 2",
        "unit_code": "Flat09",
        "unit_cost_center_code": "CC-Thihama 2-Flat09",
        "unit_name": "Thihama2-Flat09",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "Thihama 2",
        "unit_code": "Flat10",
        "unit_cost_center_code": "CC-Thihama 2-Flat10",
        "unit_name": "Thihama2-Flat10",
        "current_tenant": "Mr. Satish M Nair",
        "contract_start": "2026-08-01",
        "contract_end": "2028-07-31",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Thihama 2",
        "unit_code": "Flat11",
        "unit_cost_center_code": "CC-Thihama 2-Flat11",
        "unit_name": "Thihama2-Flat11",
        "current_tenant": "Ms. Shraddha Sanjeev Patil",
        "contract_start": "2026-07-01",
        "contract_end": "2026-12-31",
        "current_rent": 5100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Thihama 2",
        "unit_code": "Flat12",
        "unit_cost_center_code": "CC-Thihama 2-Flat12",
        "unit_name": "Thihama2-Flat12",
        "current_tenant": "Qatar Kentz PB 3865",
        "contract_start": "2026-03-16",
        "contract_end": "2026-09-15",
        "current_rent": 6750,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Thihama 2",
        "unit_code": "Flat13",
        "unit_cost_center_code": "CC-Thihama 2-Flat13",
        "unit_name": "Thihama2-Flat13",
        "current_tenant": "Qatar Kentz PB 3865",
        "contract_start": "2026-06-01",
        "contract_end": "2026-11-30",
        "current_rent": 6750,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Wakra - 01",
        "unit_code": "Flat01",
        "unit_cost_center_code": "CC-Wakra - 01-Flat01",
        "unit_name": "Wakra-01-Flat01",
        "current_tenant": "Mr. Syed Hazim Wasit",
        "contract_start": "2025-08-01",
        "contract_end": "2026-08-31",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Wakra - 01",
        "unit_code": "Flat02",
        "unit_cost_center_code": "CC-Wakra - 01-Flat02",
        "unit_name": "Wakra-01-Flat02",
        "current_tenant": "Mr. Shailesh Lanjewar",
        "contract_start": "2026-04-15",
        "contract_end": "2027-04-14",
        "current_rent": 4700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Wakra - 01",
        "unit_code": "Flat03",
        "unit_cost_center_code": "CC-Wakra - 01-Flat03",
        "unit_name": "Wakra-01-Flat03",
        "current_tenant": "Mr. Abdul Buhari Abdul Kadar",
        "contract_start": "2026-01-20",
        "contract_end": "2027-02-19",
        "current_rent": 5800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Wakra - 01",
        "unit_code": "Flat04",
        "unit_cost_center_code": "CC-Wakra - 01-Flat04",
        "unit_name": "Wakra-01-Flat04",
        "current_tenant": "Mr. Sajjad Ali Mohammed",
        "contract_start": "2025-09-01",
        "contract_end": "2026-08-31",
        "current_rent": 5800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Wakra - 01",
        "unit_code": "Flat05",
        "unit_cost_center_code": "CC-Wakra - 01-Flat05",
        "unit_name": "Wakra-01-Flat05",
        "current_tenant": "Mr. Ashraf Ali Hassan Mohamed Abdulkader",
        "contract_start": "2026-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 4800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Wakra - 01",
        "unit_code": "Flat06",
        "unit_cost_center_code": "CC-Wakra - 01-Flat06",
        "unit_name": "Wakra-01-Flat06",
        "current_tenant": "Mr. Salman Sajjad",
        "contract_start": "2026-03-25",
        "contract_end": "2027-03-24",
        "current_rent": 5700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Wakra - 01",
        "unit_code": "Flat07",
        "unit_cost_center_code": "CC-Wakra - 01-Flat07",
        "unit_name": "Wakra-01-Flat07",
        "current_tenant": "Mr. Rajendran Karunakaran",
        "contract_start": "2026-03-25",
        "contract_end": "2027-03-24",
        "current_rent": 5700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Wakra - 01",
        "unit_code": "Flat08",
        "unit_cost_center_code": "CC-Wakra - 01-Flat08",
        "unit_name": "Wakra-01-Flat08",
        "current_tenant": "Mr. Gabriel Anthony Dmello",
        "contract_start": "2025-11-01",
        "contract_end": "2026-10-31",
        "current_rent": 4700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Wakra - 01",
        "unit_code": "Flat09",
        "unit_cost_center_code": "CC-Wakra - 01-Flat09",
        "unit_name": "Wakra-01-Flat09",
        "current_tenant": "Mr. Mohamed Ahmed A Mohamed",
        "contract_start": "2026-02-20",
        "contract_end": "2027-02-19",
        "current_rent": 5800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Wakra - 01",
        "unit_code": "Flat10",
        "unit_cost_center_code": "CC-Wakra - 01-Flat10",
        "unit_name": "Wakra-01-Flat10",
        "current_tenant": "Ms. Yashna MoodleY",
        "contract_start": "2026-08-01",
        "contract_end": "2027-07-31",
        "current_rent": 4750,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Wakra - 01",
        "unit_code": "Flat11",
        "unit_cost_center_code": "CC-Wakra - 01-Flat11",
        "unit_name": "Wakra-01-Flat11",
        "current_tenant": "Mr. Anwar Pothuvil Shamsudin",
        "contract_start": "2026-04-01",
        "contract_end": "2027-04-30",
        "current_rent": 2500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mugalina - 1BHK",
        "unit_code": "Flat01",
        "unit_cost_center_code": "CC-Mugalina - 1BHK-Flat01",
        "unit_name": "Mugalina-1BHK-Flat01",
        "current_tenant": "Qatar Kentz",
        "contract_start": "2026-01-15",
        "contract_end": "2026-07-14",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mugalina - 1BHK",
        "unit_code": "Flat02",
        "unit_cost_center_code": "CC-Mugalina - 1BHK-Flat02",
        "unit_name": "Mugalina-1BHK-Flat02",
        "current_tenant": "Mr. Sumith Buddhika A Mudalige",
        "contract_start": "2025-07-20",
        "contract_end": "2026-07-19",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mugalina - 1BHK",
        "unit_code": "Flat03",
        "unit_cost_center_code": "CC-Mugalina - 1BHK-Flat03",
        "unit_name": "Mugalina-1BHK-Flat03",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "Mugalina - 1BHK",
        "unit_code": "Flat04",
        "unit_cost_center_code": "CC-Mugalina - 1BHK-Flat04",
        "unit_name": "Mugalina-1BHK-Flat04",
        "current_tenant": "Mr. Augustus Kormla Agbemavi",
        "contract_start": "2026-05-01",
        "contract_end": "2027-04-30",
        "current_rent": 3700,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mugalina - 1BHK",
        "unit_code": "Flat05",
        "unit_cost_center_code": "CC-Mugalina - 1BHK-Flat05",
        "unit_name": "Mugalina-1BHK-Flat05",
        "current_tenant": "Mr. Rakesh Pandit Aseshwar Pandit",
        "contract_start": "2026-05-01",
        "contract_end": "2027-05-31",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mugalina - 1BHK",
        "unit_code": "Flat06",
        "unit_cost_center_code": "CC-Mugalina - 1BHK-Flat06",
        "unit_name": "Mugalina-1BHK-Flat06",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "Mugalina - 1BHK",
        "unit_code": "Flat07",
        "unit_cost_center_code": "CC-Mugalina - 1BHK-Flat07",
        "unit_name": "Mugalina-1BHK-Flat07",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "Mugalina - 1BHK",
        "unit_code": "Flat08",
        "unit_cost_center_code": "CC-Mugalina - 1BHK-Flat08",
        "unit_name": "Mugalina-1BHK-Flat08",
        "current_tenant": "Ms. Souha Zairi",
        "contract_start": "2026-05-01",
        "contract_end": "2027-04-30",
        "current_rent": 3600,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mugalina - 1BHK",
        "unit_code": "Flat09",
        "unit_cost_center_code": "CC-Mugalina - 1BHK-Flat09",
        "unit_name": "Mugalina-1BHK-Flat09",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "Mugalina - 1BHK",
        "unit_code": "Flat10",
        "unit_cost_center_code": "CC-Mugalina - 1BHK-Flat10",
        "unit_name": "Mugalina-1BHK-Flat10",
        "current_tenant": "Mr. Bashir Ahmed A S Dawood",
        "contract_start": "2026-05-01",
        "contract_end": "2027-04-30",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mugalina - 1BHK",
        "unit_code": "Flat11",
        "unit_cost_center_code": "CC-Mugalina - 1BHK-Flat11",
        "unit_name": "Mugalina-1BHK-Flat11",
        "current_tenant": "Mr. Rahul Nediyedath Rathnakaran",
        "contract_start": "2025-11-01",
        "contract_end": "2026-10-31",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mugalina - 1BHK",
        "unit_code": "Flat12",
        "unit_cost_center_code": "CC-Mugalina - 1BHK-Flat12",
        "unit_name": "Mugalina-1BHK-Flat12",
        "current_tenant": "Mr. Shown Munjanattu Cherian",
        "contract_start": "2026-05-25",
        "contract_end": "2027-05-24",
        "current_rent": 3600,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Mugalina - 2BHK",
        "unit_code": "Flat03",
        "unit_cost_center_code": "CC-Mugalina - 2BHK-Flat03",
        "unit_name": "Mugalina-2BHK-Flat03",
        "current_tenant": "Mr. Masrooh Ahammed",
        "contract_start": "2026-12-20",
        "contract_end": "2027-04-19",
        "current_rent": 3500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat01",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat01",
        "unit_name": "Musheireb-05-Flat01",
        "current_tenant": "Mr. Jaison Jose Chakkalakkal Devassy",
        "contract_start": "2026-07-15",
        "contract_end": "2026-07-14",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat02",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat02",
        "unit_name": "Musheireb-05-Flat02",
        "current_tenant": "Mr. Taha Zebdi",
        "contract_start": "2026-01-10",
        "contract_end": "2027-01-09",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat03",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat03",
        "unit_name": "Musheireb-05-Flat03",
        "current_tenant": "Mr. Harish Kurupathi Parambil",
        "contract_start": "2026-02-01",
        "contract_end": "2027-01-31",
        "current_rent": 3900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat04",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat04",
        "unit_name": "Musheireb-05-Flat04",
        "current_tenant": "Mr. Samer Imad Aboushakra",
        "contract_start": "2025-09-01",
        "contract_end": "2026-08-31",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat05",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat05",
        "unit_name": "Musheireb-05-Flat05",
        "current_tenant": "Mr. Rajan Suresh Kumar",
        "contract_start": "2026-07-10",
        "contract_end": "2027-07-09",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat06",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat06",
        "unit_name": "Musheireb-05-Flat06",
        "current_tenant": "Mr. Syed Shaz Areeb",
        "contract_start": "2026-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat07",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat07",
        "unit_name": "Musheireb-05-Flat07",
        "current_tenant": "Mr. Venkaiah Gara Jalaiah Gara",
        "contract_start": "2025-09-01",
        "contract_end": "2026-08-31",
        "current_rent": 3900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat08",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat08",
        "unit_name": "Musheireb-05-Flat08",
        "current_tenant": "Mr. Manesh Satheesh Chandran Sreenadesan",
        "contract_start": "2025-11-05",
        "contract_end": "2026-11-04",
        "current_rent": 3900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat09",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat09",
        "unit_name": "Musheireb-05-Flat09",
        "current_tenant": "Mr. Fuad Zaneen Ovinakath",
        "contract_start": "2026-07-01",
        "contract_end": "2027-06-30",
        "current_rent": 4100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat10",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat10",
        "unit_name": "Musheireb-05-Flat10",
        "current_tenant": "Mr. John Britto Fernandez",
        "contract_start": "2026-03-12",
        "contract_end": "2027-03-11",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat11",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat11",
        "unit_name": "Musheireb-05-Flat11",
        "current_tenant": "Mr. Varun Chanrakantbai",
        "contract_start": "2026-02-20",
        "contract_end": "2027-02-19",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat12",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat12",
        "unit_name": "Musheireb-05-Flat12",
        "current_tenant": "Mr. Manoj Kumar Jain",
        "contract_start": "2026-06-01",
        "contract_end": "2027-05-31",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat13",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat13",
        "unit_name": "Musheireb-05-Flat13",
        "current_tenant": "Mr. Gouse Pasha Shaik Chand Miya",
        "contract_start": "2026-05-01",
        "contract_end": "2027-04-30",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat14",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat14",
        "unit_name": "Musheireb-05-Flat14",
        "current_tenant": "Mr. Dranreb A. Marcellana",
        "contract_start": "2026-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat15",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat15",
        "unit_name": "Musheireb-05-Flat15",
        "current_tenant": "Mr. Milind Sukchandra Nagrale",
        "contract_start": "2026-01-01",
        "contract_end": "2026-12-31",
        "current_rent": 3900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat16",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat16",
        "unit_name": "Musheireb-05-Flat16",
        "current_tenant": "Ms. Pavani T Thottimpudi",
        "contract_start": "2025-08-01",
        "contract_end": "2026-07-31",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat17",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat17",
        "unit_name": "Musheireb-05-Flat17",
        "current_tenant": "Mr. Anup Prabhakaran Nair",
        "contract_start": "2026-02-01",
        "contract_end": "2027-01-31",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat18",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat18",
        "unit_name": "Musheireb-05-Flat18",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat19",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat19",
        "unit_name": "Musheireb-05-Flat19",
        "current_tenant": "Mr. Ganeshamani Neela Pakkia Mani",
        "contract_start": "2026-05-25",
        "contract_end": "2027-05-24",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat20",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat20",
        "unit_name": "Musheireb-05-Flat20",
        "current_tenant": "Mr. Abdul Rafay Anwar Siddiqui",
        "contract_start": "2025-10-05",
        "contract_end": "2026-10-04",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat21",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat21",
        "unit_name": "Musheireb-05-Flat21",
        "current_tenant": "Ms. Girija Ramamurth",
        "contract_start": "2015-12-01",
        "contract_end": "2026-11-30",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat22",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat22",
        "unit_name": "Musheireb-05-Flat22",
        "current_tenant": "Mr. Arsalan Ahmed Nafees Ahmed",
        "contract_start": "2025-10-01",
        "contract_end": "2026-09-30",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat23",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat23",
        "unit_name": "Musheireb-05-Flat23",
        "current_tenant": "Ms. Kasiefah Manan",
        "contract_start": "2025-09-01",
        "contract_end": "2026-08-31",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat24",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat24",
        "unit_name": "Musheireb-05-Flat24",
        "current_tenant": "Mr. Chirag Krishnakant Trivedi",
        "contract_start": "2025-09-01",
        "contract_end": "2026-07-31",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat25",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat25",
        "unit_name": "Musheireb-05-Flat25",
        "current_tenant": "Mr. Ayyappan Azhakesan Prasanna",
        "contract_start": "2026-04-10",
        "contract_end": "2027-04-09",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat26",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat26",
        "unit_name": "Musheireb-05-Flat26",
        "current_tenant": "Mr. Muhammed Sherif Channanath",
        "contract_start": "2025-10-05",
        "contract_end": "2026-10-04",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat27",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat27",
        "unit_name": "Musheireb-05-Flat27",
        "current_tenant": "Ms. Aniline C. Bellas",
        "contract_start": "2026-07-01",
        "contract_end": "2026-09-30",
        "current_rent": 4200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat28",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat28",
        "unit_name": "Musheireb-05-Flat28",
        "current_tenant": "Mr. Azhdar Hasanov",
        "contract_start": "2026-03-15",
        "contract_end": "2027-03-14",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat29",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat29",
        "unit_name": "Musheireb-05-Flat29",
        "current_tenant": "Mr. Shyam Rajagopal Erikapatil M Rajagopal",
        "contract_start": "2026-05-25",
        "contract_end": "2027-05-24",
        "current_rent": 3800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat30",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat30",
        "unit_name": "Musheireb-05-Flat30",
        "current_tenant": "Mr. Haswar Kamaruddin",
        "contract_start": "2025-10-20",
        "contract_end": "2026-10-19",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat31",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat31",
        "unit_name": "Musheireb-05-Flat31",
        "current_tenant": "Mr. Rupender Juyal",
        "contract_start": "2025-01-05",
        "contract_end": "2027-01-04",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Musheireb - 05",
        "unit_code": "Flat32",
        "unit_cost_center_code": "CC-Musheireb - 05-Flat32",
        "unit_name": "Musheireb-05-Flat32",
        "current_tenant": "Mr. Suneel Mammudhoddi",
        "contract_start": "2026-06-01",
        "contract_end": "2027-05-31",
        "current_rent": 3900,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat01",
        "unit_cost_center_code": "CC-Birkat - 49-Flat01",
        "unit_name": "Birkat-49-Flat01",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-05-01",
        "contract_end": "2026-10-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat02",
        "unit_cost_center_code": "CC-Birkat - 49-Flat02",
        "unit_name": "Birkat-49-Flat02",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-05-01",
        "contract_end": "2026-10-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat03",
        "unit_cost_center_code": "CC-Birkat - 49-Flat03",
        "unit_name": "Birkat-49-Flat03",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-05-01",
        "contract_end": "2026-10-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat04",
        "unit_cost_center_code": "CC-Birkat - 49-Flat04",
        "unit_name": "Birkat-49-Flat04",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-05-01",
        "contract_end": "2026-10-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat05",
        "unit_cost_center_code": "CC-Birkat - 49-Flat05",
        "unit_name": "Birkat-49-Flat05",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-05-01",
        "contract_end": "2026-10-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat07",
        "unit_cost_center_code": "CC-Birkat - 49-Flat07",
        "unit_name": "Birkat-49-Flat07",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-05-01",
        "contract_end": "2026-10-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat08",
        "unit_cost_center_code": "CC-Birkat - 49-Flat08",
        "unit_name": "Birkat-49-Flat08",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-05-01",
        "contract_end": "2026-10-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat09",
        "unit_cost_center_code": "CC-Birkat - 49-Flat09",
        "unit_name": "Birkat-49-Flat09",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-05-01",
        "contract_end": "2026-10-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat10",
        "unit_cost_center_code": "CC-Birkat - 49-Flat10",
        "unit_name": "Birkat-49-Flat10",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-05-01",
        "contract_end": "2026-10-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat11",
        "unit_cost_center_code": "CC-Birkat - 49-Flat11",
        "unit_name": "Birkat-49-Flat11",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-05-01",
        "contract_end": "2026-10-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat12",
        "unit_cost_center_code": "CC-Birkat - 49-Flat12",
        "unit_name": "Birkat-49-Flat12",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-05-01",
        "contract_end": "2026-10-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat13",
        "unit_cost_center_code": "CC-Birkat - 49-Flat13",
        "unit_name": "Birkat-49-Flat13",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-05-01",
        "contract_end": "2026-10-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat14",
        "unit_cost_center_code": "CC-Birkat - 49-Flat14",
        "unit_name": "Birkat-49-Flat14",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-05-01",
        "contract_end": "2026-10-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat15",
        "unit_cost_center_code": "CC-Birkat - 49-Flat15",
        "unit_name": "Birkat-49-Flat15",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-05-01",
        "contract_end": "2026-10-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat16",
        "unit_cost_center_code": "CC-Birkat - 49-Flat16",
        "unit_name": "Birkat-49-Flat16",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-07-01",
        "contract_end": "2026-12-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat17",
        "unit_cost_center_code": "CC-Birkat - 49-Flat17",
        "unit_name": "Birkat-49-Flat17",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-07-01",
        "contract_end": "2026-12-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat18",
        "unit_cost_center_code": "CC-Birkat - 49-Flat18",
        "unit_name": "Birkat-49-Flat18",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-07-01",
        "contract_end": "2026-12-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat20",
        "unit_cost_center_code": "CC-Birkat - 49-Flat20",
        "unit_name": "Birkat-49-Flat20",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-07-01",
        "contract_end": "2026-12-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat21",
        "unit_cost_center_code": "CC-Birkat - 49-Flat21",
        "unit_name": "Birkat-49-Flat21",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-07-01",
        "contract_end": "2026-12-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat22",
        "unit_cost_center_code": "CC-Birkat - 49-Flat22",
        "unit_name": "Birkat-49-Flat22",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-07-01",
        "contract_end": "2026-12-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Birkat - 49",
        "unit_code": "Flat23",
        "unit_cost_center_code": "CC-Birkat - 49-Flat23",
        "unit_name": "Birkat-49-Flat23",
        "current_tenant": "M/s. Saipem S P A",
        "contract_start": "2026-07-01",
        "contract_end": "2026-12-31",
        "current_rent": 4325,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "RDM 1",
        "unit_code": "Flat01",
        "unit_cost_center_code": "CC-RDM 1-Flat01",
        "unit_name": "RDM1-Flat01",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "RDM 1",
        "unit_code": "Flat02",
        "unit_cost_center_code": "CC-RDM 1-Flat02",
        "unit_name": "RDM1-Flat02",
        "current_tenant": "Mr. Shamnad Shamsudeen",
        "contract_start": "2025-09-01",
        "contract_end": "2026-08-31",
        "current_rent": 5800,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "RDM 1",
        "unit_code": "Flat03",
        "unit_cost_center_code": "CC-RDM 1-Flat03",
        "unit_name": "RDM1-Flat03",
        "current_tenant": "Qatar Kentz",
        "contract_start": "2026-06-04",
        "contract_end": "2026-09-03",
        "current_rent": 6500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "RDM 1",
        "unit_code": "Flat04",
        "unit_cost_center_code": "CC-RDM 1-Flat04",
        "unit_name": "RDM1-Flat04",
        "current_tenant": "Qatar Kentz",
        "contract_start": "2026-06-01",
        "contract_end": "2026-09-30",
        "current_rent": 6500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "RDM 1",
        "unit_code": "Flat05",
        "unit_cost_center_code": "CC-RDM 1-Flat05",
        "unit_name": "RDM1-Flat05",
        "current_tenant": "Tenis Shop",
        "contract_start": "2025-08-01",
        "contract_end": "2026-07-31",
        "current_rent": 3500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "RDM 2",
        "unit_code": "Flat01",
        "unit_cost_center_code": "CC-RDM 2-Flat01",
        "unit_name": "RDM2-Flat01",
        "current_tenant": "Qatar Kentz",
        "contract_start": "2026-06-22",
        "contract_end": "2026-07-21",
        "current_rent": 6500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "RDM 2",
        "unit_code": "Flat02",
        "unit_cost_center_code": "CC-RDM 2-Flat02",
        "unit_name": "RDM2-Flat02",
        "current_tenant": "Mr. Vikesh Pala Satchithanamtham",
        "contract_start": "2025-11-15",
        "contract_end": "2026-11-14",
        "current_rent": 4500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "RDM 2",
        "unit_code": "Flat03",
        "unit_cost_center_code": "CC-RDM 2-Flat03",
        "unit_name": "RDM2-Flat03",
        "current_tenant": "Mr. Abdul Majeed Nalakath P Hamza",
        "contract_start": "2026-02-15",
        "contract_end": "2027-02-14",
        "current_rent": 5400,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "RDM 2",
        "unit_code": "Flat04",
        "unit_cost_center_code": "CC-RDM 2-Flat04",
        "unit_name": "RDM2-Flat04",
        "current_tenant": "Mr. Mudappala Krishnakumar",
        "contract_start": "2026-01-01",
        "contract_end": "2026-12-31",
        "current_rent": 5300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "RDM 2",
        "unit_code": "Flat05",
        "unit_cost_center_code": "CC-RDM 2-Flat05",
        "unit_name": "RDM2-Flat05",
        "current_tenant": "Mr. Mohammed Shahbaz Khan",
        "contract_start": "2026-03-01",
        "contract_end": "2027-02-28",
        "current_rent": 4100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "RDM 2",
        "unit_code": "Flat06",
        "unit_cost_center_code": "CC-RDM 2-Flat06",
        "unit_name": "RDM2-Flat06",
        "current_tenant": "Ms. Zinel Arroz Umadhay",
        "contract_start": "2026-03-15",
        "contract_end": "2027-03-14",
        "current_rent": 5500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "RDM 2",
        "unit_code": "Flat07",
        "unit_cost_center_code": "CC-RDM 2-Flat07",
        "unit_name": "RDM2-Flat07",
        "current_tenant": "Mr. Nael Abdelsamad",
        "contract_start": "2026-01-01",
        "contract_end": "2026-12-31",
        "current_rent": 4000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "RDM 2",
        "unit_code": "Flat08",
        "unit_cost_center_code": "CC-RDM 2-Flat08",
        "unit_name": "RDM2-Flat08",
        "current_tenant": "Mr. Lijo Joy",
        "contract_start": "2025-11-01",
        "contract_end": "2026-10-31",
        "current_rent": 4500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "LuLu 1",
        "unit_code": "Flat01",
        "unit_cost_center_code": "CC-LuLu 1-Flat01",
        "unit_name": "LuLu1-Flat01",
        "current_tenant": "Mr. Donnie Ray L. Calacal",
        "contract_start": "2026-06-01",
        "contract_end": "2027-05-31",
        "current_rent": 5500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "LuLu 1",
        "unit_code": "Flat02",
        "unit_cost_center_code": "CC-LuLu 1-Flat02",
        "unit_name": "LuLu1-Flat02",
        "current_tenant": "Mr. Hazem Mahmoud",
        "contract_start": "2025-08-01",
        "contract_end": "2026-07-31",
        "current_rent": 4400,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "LuLu 1",
        "unit_code": "Flat03",
        "unit_cost_center_code": "CC-LuLu 1-Flat03",
        "unit_name": "LuLu1-Flat03",
        "current_tenant": "Mr. Sunil Lawrence D Souza",
        "contract_start": "2026-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 5500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "LuLu 1",
        "unit_code": "Flat04",
        "unit_cost_center_code": "CC-LuLu 1-Flat04",
        "unit_name": "LuLu1-Flat04",
        "current_tenant": "Mr.Edward Allan Andaluz Dee",
        "contract_start": "2025-08-01",
        "contract_end": "2026-07-31",
        "current_rent": 5500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "LuLu 1",
        "unit_code": "Flat05",
        "unit_cost_center_code": "CC-LuLu 1-Flat05",
        "unit_name": "LuLu1-Flat05",
        "current_tenant": "M/s. Axiom International W.L.L",
        "contract_start": "2025-11-15",
        "contract_end": "2026-11-14",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "LuLu 1",
        "unit_code": "Flat06",
        "unit_cost_center_code": "CC-LuLu 1-Flat06",
        "unit_name": "LuLu1-Flat06",
        "current_tenant": "Mr. Binoth Lonen Victal",
        "contract_start": "2026-02-01",
        "contract_end": "2027-01-31",
        "current_rent": 5500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "LuLu 1",
        "unit_code": "Flat07",
        "unit_cost_center_code": "CC-LuLu 1-Flat07",
        "unit_name": "LuLu1-Flat07",
        "current_tenant": "Mr. Sreekumar Sreedharan Pillai",
        "contract_start": "2026-02-01",
        "contract_end": "2027-01-31",
        "current_rent": 5500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "LuLu 1",
        "unit_code": "Flat08",
        "unit_cost_center_code": "CC-LuLu 1-Flat08",
        "unit_name": "LuLu1-Flat08",
        "current_tenant": "M/s. Qatar Qentz",
        "contract_start": "2026-01-02",
        "contract_end": "2027-03-01",
        "current_rent": 6300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "LuLu 2",
        "unit_code": "Flat01",
        "unit_cost_center_code": "CC-LuLu 2-Flat01",
        "unit_name": "LuLu2-Flat01",
        "current_tenant": "Alfanet Solutions",
        "contract_start": "2025-06-01",
        "contract_end": "2026-05-31",
        "current_rent": 5500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "LuLu 2",
        "unit_code": "Flat02",
        "unit_cost_center_code": "CC-LuLu 2-Flat02",
        "unit_name": "LuLu2-Flat02",
        "current_tenant": "Qatar Kentz PB 3865",
        "contract_start": "2025-12-25",
        "contract_end": "2026-12-24",
        "current_rent": 7750,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "LuLu 2",
        "unit_code": "Flat03",
        "unit_cost_center_code": "CC-LuLu 2-Flat03",
        "unit_name": "LuLu2-Flat03",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "LuLu 2",
        "unit_code": "Flat04",
        "unit_cost_center_code": "CC-LuLu 2-Flat04",
        "unit_name": "LuLu2-Flat04",
        "current_tenant": null,
        "contract_start": null,
        "contract_end": null,
        "current_rent": 0,
        "lease_status": "Vacant",
        "status": "Available"
    },
    {
        "prop_code": "LuLu 2",
        "unit_code": "Flat05",
        "unit_cost_center_code": "CC-LuLu 2-Flat05",
        "unit_name": "LuLu2-Flat05",
        "current_tenant": "Mr. Deepak Raj",
        "contract_start": "2026-02-01",
        "contract_end": "2027-01-31",
        "current_rent": 3400,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "LuLu 2",
        "unit_code": "Flat06",
        "unit_cost_center_code": "CC-LuLu 2-Flat06",
        "unit_name": "LuLu2-Flat06",
        "current_tenant": "Mr. Ramakrishnan Selvaraj",
        "contract_start": "2025-08-15",
        "contract_end": "2026-08-14",
        "current_rent": 3500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "OA - KWT",
        "unit_code": "Villa 23",
        "unit_cost_center_code": "CC-OA - KWT-Villa 23",
        "unit_name": "OA-KWT-Villa23",
        "current_tenant": "Qatar Kentz PB 3865",
        "contract_start": "2025-08-10",
        "contract_end": "2026-08-09",
        "current_rent": 15000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat01",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat01",
        "unit_name": "AlSaad-53-Flat01",
        "current_tenant": "Mr. Hassan Ahmed Nawab Ahmed",
        "contract_start": "2026-03-10",
        "contract_end": "2027-03-09",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat02",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat02",
        "unit_name": "AlSaad-53-Flat02",
        "current_tenant": "Mr. Mohamed Saeed Mohamed Aboelgreed",
        "contract_start": "2026-08-01",
        "contract_end": "2027-07-31",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat03",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat03",
        "unit_name": "AlSaad-53-Flat03",
        "current_tenant": "Ms. Rhoda Villamor Uy",
        "contract_start": "2026-02-01",
        "contract_end": "2027-01-31",
        "current_rent": 6100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat04",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat04",
        "unit_name": "AlSaad-53-Flat04",
        "current_tenant": "Mr. Sobhi Ibrahim",
        "contract_start": "2025-09-01",
        "contract_end": "2026-08-31",
        "current_rent": 6200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat05",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat05",
        "unit_name": "AlSaad-53-Flat05",
        "current_tenant": "Mr. Jethro Tull Mendoza Dela Cruz",
        "contract_start": "2026-02-15",
        "contract_end": "2027-02-14",
        "current_rent": 5000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat06",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat06",
        "unit_name": "AlSaad-53-Flat06",
        "current_tenant": "Ms. Zahra Mohamed Sharif",
        "contract_start": "2026-05-10",
        "contract_end": "2027-05-09",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat07",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat07",
        "unit_name": "AlSaad-53-Flat07",
        "current_tenant": "Mr. Abdul Salam Sameer K Mulangatt",
        "contract_start": "2025-08-15",
        "contract_end": "2026-08-14",
        "current_rent": 6200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat08",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat08",
        "unit_name": "AlSaad-53-Flat08",
        "current_tenant": "Ms. Razel Ojeda Nueva",
        "contract_start": "2026-04-01",
        "contract_end": "2027-03-31",
        "current_rent": 5100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat09",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat09",
        "unit_name": "AlSaad-53-Flat09",
        "current_tenant": "Mr. Yamin Amin Mahmoud Zakarneh",
        "contract_start": "2025-10-01",
        "contract_end": "2026-09-30",
        "current_rent": 6000,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat10",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat10",
        "unit_name": "AlSaad-53-Flat10",
        "current_tenant": "Mr. Mohammed Khder S Akkila",
        "contract_start": "2025-09-25",
        "contract_end": "2026-09-24",
        "current_rent": 6200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat11",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat11",
        "unit_name": "AlSaad-53-Flat11",
        "current_tenant": "Mr. Mohammed Maged Said Zaina",
        "contract_start": "2025-09-25",
        "contract_end": "2026-09-24",
        "current_rent": 5100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat12",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat12",
        "unit_name": "AlSaad-53-Flat12",
        "current_tenant": "Ms. Fatima N J Sh Hussein",
        "contract_start": "2025-10-01",
        "contract_end": "2026-09-30",
        "current_rent": 6100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat13",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat13",
        "unit_name": "AlSaad-53-Flat13",
        "current_tenant": "Mr. Renin John Mathew",
        "contract_start": "2026-01-01",
        "contract_end": "2027-01-31",
        "current_rent": 6100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat14",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat14",
        "unit_name": "AlSaad-53-Flat14",
        "current_tenant": "Mr. Ashraf Abdelrazek Elsayed",
        "contract_start": "2026-12-01",
        "contract_end": "2026-12-31",
        "current_rent": 5500,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat15",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat15",
        "unit_name": "AlSaad-53-Flat15",
        "current_tenant": "Glamour Company",
        "contract_start": "2025-08-15",
        "contract_end": "2026-08-14",
        "current_rent": 6300,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat16",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat16",
        "unit_name": "AlSaad-53-Flat16",
        "current_tenant": "Mr. Mahmoud Ghazal",
        "contract_start": "2025-08-01",
        "contract_end": "2026-08-31",
        "current_rent": 6100,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat17",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat17",
        "unit_name": "AlSaad-53-Flat17",
        "current_tenant": "Mr. Mohamed Mortada Ali Eliw",
        "contract_start": "2025-09-01",
        "contract_end": "2026-08-31",
        "current_rent": 5200,
        "lease_status": "Leased",
        "status": "Occupied"
    },
    {
        "prop_code": "Al Saad - 53",
        "unit_code": "Flat18",
        "unit_cost_center_code": "CC-Al Saad - 53-Flat18",
        "unit_name": "AlSaad-53-Flat18",
        "current_tenant": "Mr. Ali Bacharouche",
        "contract_start": "2025-01-01",
        "contract_end": "2026-12-31",
        "current_rent": 6300,
        "lease_status": "Leased",
        "status": "Occupied"
    }
];

    for (const u of allUnits) {
      const normalizedCode = codeMap[u.prop_code] ?? u.prop_code;
      const propId = propIds[normalizedCode];
      if (!propId) {
        console.warn(`  SKIP: no property for '${normalizedCode}' (raw: '${u.prop_code}')`);
        skipped++;
        continue;
      }
      await client.query(
        `INSERT INTO public.units (
          property_id, unit_ref, unit_code, unit_cost_center_code, unit_name,
          room_type, unit_usage, status, lease_status,
          current_tenant, contract_start_date, contract_end_date, current_rent,
          bedrooms, bathrooms, price, rent_frequency, maintenance_responsibility
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14, $15, $16, $17, $18
        )`,
        [
          propId, u.unit_code, u.unit_code, u.unit_cost_center_code, u.unit_name,
          'Apartment', 'Residential', u.status, u.lease_status,
          u.current_tenant, u.contract_start, u.contract_end, u.current_rent,
          2, 1, u.current_rent || 5000, 'Monthly', 'Property Manager'
        ]
      );
      unitCount++;
    }

    console.log(`\n✅ Done! ${unitCount} units inserted, ${skipped} skipped.`);
    console.log(`   Properties in DB: ${Object.keys(propIds).length}`);

  } catch (err) {
    console.error('Seed error:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

seed().catch(console.error);
