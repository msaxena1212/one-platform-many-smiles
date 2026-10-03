const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=')[1].trim().replace(/"/g, '');
});

const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function check() {
  await client.connect();

  const units = await client.query('SELECT u.id, u.unit_ref, u.unit_name, u.current_tenant, u.status, u.lease_status, p.title as prop_title FROM units u LEFT JOIN properties p ON u.property_id = p.id');
  const leases = await client.query('SELECT l.*, p.title as prop_title FROM leases l LEFT JOIN properties p ON l.property_id = p.id');
  const reservations = await client.query('SELECT * FROM reservations');

  console.log('Units total in DB:', units.rows.length);
  const occupiedUnits = units.rows.filter(u => u.status === 'Occupied' || (u.current_tenant && u.current_tenant.trim() && u.current_tenant.toLowerCase() !== 'vacant'));
  console.log('Occupied units count in DB:', occupiedUnits.length);
  console.log('Leases rows count in DB:', leases.rows.length);
  console.log('Reservations rows count in DB:', reservations.rows.length);

  // Let's check where the 358 vs 360 difference comes from
  // In AppDataContext:
  // existingLeases: mapped from leases table
  // unitContracts: synthesized from occupied units NOT in existingLeases
  const propMap = new Map();
  // Let's emulate AppDataContext mappedLeases
  const existingLeases = leases.rows.map(l => ({
    id: l.lease_number || l.id,
    property: l.prop_title || 'Property',
    unit: l.unit_ref || 'Unit',
    tenantName: l.tenant_name || 'Tenant',
    status: l.lease_status || 'active'
  }));

  const seenLeaseUnits = new Set(existingLeases.map(l => `${l.property}-${l.unit}`.toLowerCase()));
  const unitContracts = [];

  units.rows.forEach(u => {
    const isOccupied =
      u.status?.toLowerCase() === 'occupied' ||
      (u.lease_status?.toLowerCase() === 'leased' && u.status?.toLowerCase() !== 'available') ||
      (u.current_tenant && u.current_tenant.trim().length > 0 && u.current_tenant.toLowerCase() !== 'vacant');

    if (isOccupied) {
      const propTitle = u.prop_title || 'Property';
      const unitIdentifier = u.unit_ref || u.unit_name || 'Unit';
      const unitKey = `${propTitle}-${unitIdentifier}`.toLowerCase();

      if (!seenLeaseUnits.has(unitKey)) {
        seenLeaseUnits.add(unitKey);
        unitContracts.push({
          id: `L-${unitIdentifier}`,
          property: propTitle,
          unit: unitIdentifier,
          tenantName: u.current_tenant || `Tenant (${unitIdentifier})`,
          status: 'active'
        });
      }
    }
  });

  const mappedLeases = [...existingLeases, ...unitContracts];
  console.log('Total mappedLeases:', mappedLeases.length);

  // Now emulate deduplication in reservations:
  const leaseReservations = mappedLeases.map((l, idx) => ({
    id: `res-lease-${l.id || idx}`,
    property: l.property || 'Property',
    unit: l.unit || 'Unit',
    tenantName: l.tenantName || 'Tenant',
  }));

  const seenResKey = new Set();
  const combinedReservations = [];
  const duplicates = [];
  leaseReservations.forEach(res => {
    const key = `${(res.tenantName || '').trim().toLowerCase()}--${(res.unit || '').trim().toLowerCase()}`;
    if (res.tenantName && !seenResKey.has(key)) {
      seenResKey.add(key);
      combinedReservations.push(res);
    } else {
      duplicates.push(res);
    }
  });

  console.log('Combined reservations count:', combinedReservations.length);
  console.log('Duplicate reservations removed during deduplication:', duplicates);

  await client.end();
}

check().catch(console.error);
