const fs = require('fs');
let ts = fs.readFileSync('src/lib/supabase.ts', 'utf8');

if (!ts.includes('export type InventoryPart =')) {
  ts += `
export type InventoryPart = {
  id: string;
  part_name: string;
  part_number: string;
  category: string;
  quantity_on_hand: number;
  unit_cost: number;
};`;
}

if (!ts.includes('export async function createInventoryPart')) {
  ts += `
export async function createInventoryPart(payload: Omit<InventoryPart, 'id'>) {
  const { data, error } = await supabase.from('inventory_parts').insert([payload]).select().single();
  if (error) throw error;
  return data as InventoryPart;
}`;
}

if (!ts.includes('export async function createReceipt')) {
  ts += `
export async function createReceipt(payload: any) {
  const { data, error } = await supabase.from('receipts').insert([payload]).select().single();
  if (error) throw error;
  return data;
}`;
}

fs.writeFileSync('src/lib/supabase.ts', ts);
console.log('Appended to supabase.ts');
