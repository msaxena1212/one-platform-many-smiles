const fs = require('fs');

const filePath = String.raw`E:\Port\Property Management System\one-platform-many-smiles\src\lib\supabase.ts`;
const content = fs.readFileSync(filePath, 'utf8');

// Split into lines (by \n, keeping \r if present)
const lines = content.split('\n');

// Find line 1114 (0-indexed: 1113) which ends with "return data as UnitCOA[];\r"
// Lines 1115+ (index 1114+) contain the duplicate garbage
// We want to keep lines 0..1113 (inclusive) and then add clean new content

const keepLines = lines.slice(0, 1114); // lines 1 to 1114 (0-indexed 0 to 1113)

// The kept lines end with "  return data as UnitCOA[];\r"
// We need to close the fetchUnitCOAs function and add our new functions
const newContent = keepLines.join('\n') + 
`\r\n}\r\n\r\nexport async function createInventoryPart(payload: Omit<InventoryPart, 'id'>) {\r\n  const { data, error } = await supabase.from('inventory_parts').insert([payload]).select().single();\r\n  if (error) throw error;\r\n  return data as InventoryPart;\r\n}\r\n\r\nexport async function fetchCostCenters(): Promise<{ id: number; code: string; name: string }[]> {\r\n  const { data, error } = await supabase.from('fin_cost_centers').select('id, code, name').order('name', { ascending: true });\r\n  if (error) return [];\r\n  return (data ?? []) as { id: number; code: string; name: string }[];\r\n}\r\n\r\nexport async function createUnitRooms(rooms: Record<string, unknown>[]): Promise<unknown[]> {\r\n  if (!rooms || rooms.length === 0) return [];\r\n  const { data, error } = await supabase.from('unit_rooms').insert(rooms).select();\r\n  if (error) throw error;\r\n  return data ?? [];\r\n}\r\n`;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Done. Total lines in fixed file:', newContent.split('\n').length);
