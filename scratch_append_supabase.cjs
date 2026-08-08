const fs = require('fs');
const path = require('path');

const supabasePath = path.join('E:', 'Port', 'Property Management System', 'one-platform-many-smiles', 'src', 'lib', 'supabase.ts');

const newCode = `

// --- Additional Master Data Fetchers ---
export async function fetchPropertyTypes() {
  const { data, error } = await supabase.from('mst_property_types').select('*').order('name', { ascending: true });
  if (error) {
    console.error('fetchPropertyTypes error:', error);
    return [];
  }
  return data.map(item => ({ id: item.name, label: item.name }));
}

export async function fetchOwnershipTypes() {
  const { data, error } = await supabase.from('mst_ownership_types').select('*').order('name', { ascending: true });
  if (error) return [];
  return data.map(item => ({ id: item.name, label: item.name }));
}

export async function fetchPropertyCategories() {
  const { data, error } = await supabase.from('mst_property_categories').select('*').order('name', { ascending: true });
  if (error) return [];
  return data.map(item => ({ id: item.name, label: item.name }));
}

export async function fetchCostCenters() {
  const { data, error } = await supabase.from('fin_cost_centers').select('id, code, name').order('name', { ascending: true });
  if (error) return [];
  return data;
}

export async function createUnitRooms(rooms: any[]) {
  if (!rooms || rooms.length === 0) return [];
  const { data, error } = await supabase.from('unit_rooms').insert(rooms).select();
  if (error) throw error;
  return data;
}
`;

fs.appendFileSync(supabasePath, newCode);
console.log('Appended fetchers to supabase.ts');
