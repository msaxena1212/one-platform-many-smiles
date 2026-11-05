import { supabase } from "@/lib/supabase";

export type ItemType = "asset" | "maintenance_spare" | "consumable" | "service";
export type BudgetHead = "Salary" | "Maintenance Items" | "Property Assets" | "Unit Assets" | "Common Area Assets" | "Other";

export type CatalogItem = {
  id: string;
  item_code: string;
  name: string;
  category: string;
  item_type: ItemType;
  budget_type: "CAPEX" | "OPEX";
  budget_head: BudgetHead;
  unit_price: number;
  unit_of_measure: string;
  reorder_level: number;
  active: boolean;
};

export const defaultCatalogItems: CatalogItem[] = [
  // ── Baseline Master Items from User Catalog (Image 1) ──
  {
    id: "itm-001",
    item_code: "ITM-001",
    name: "12w panel lamp",
    category: "Electrical",
    item_type: "maintenance_spare",
    budget_type: "OPEX",
    budget_head: "Maintenance Items",
    unit_price: 0,
    unit_of_measure: "pcs",
    reorder_level: 10,
    active: true,
  },
  {
    id: "itm-002",
    item_code: "ITM-002",
    name: "24w surface LED",
    category: "Electrical",
    item_type: "maintenance_spare",
    budget_type: "OPEX",
    budget_head: "Maintenance Items",
    unit_price: 0,
    unit_of_measure: "pcs",
    reorder_level: 10,
    active: true,
  },
  {
    id: "itm-003",
    item_code: "ITM-003",
    name: "25mm PPr conceld",
    category: "Plumbing",
    item_type: "maintenance_spare",
    budget_type: "OPEX",
    budget_head: "Maintenance Items",
    unit_price: 0,
    unit_of_measure: "pcs",
    reorder_level: 10,
    active: true,
  },
  {
    id: "itm-004",
    item_code: "ITM-004",
    name: "2F tube rod",
    category: "Electrical",
    item_type: "maintenance_spare",
    budget_type: "OPEX",
    budget_head: "Maintenance Items",
    unit_price: 0,
    unit_of_measure: "pcs",
    reorder_level: 10,
    active: true,
  },
  {
    id: "itm-005",
    item_code: "ITM-005",
    name: "2g switch",
    category: "Electrical",
    item_type: "maintenance_spare",
    budget_type: "OPEX",
    budget_head: "Maintenance Items",
    unit_price: 0,
    unit_of_measure: "pcs",
    reorder_level: 10,
    active: true,
  },
  {
    id: "itm-006",
    item_code: "ITM-006",
    name: "2w panel lamp",
    category: "Electrical",
    item_type: "maintenance_spare",
    budget_type: "OPEX",
    budget_head: "Maintenance Items",
    unit_price: 0,
    unit_of_measure: "pcs",
    reorder_level: 10,
    active: true,
  },
  {
    id: "itm-007",
    item_code: "ITM-007",
    name: "2x1.5 brush",
    category: "Civil Work",
    item_type: "maintenance_spare",
    budget_type: "OPEX",
    budget_head: "Maintenance Items",
    unit_price: 0,
    unit_of_measure: "pcs",
    reorder_level: 10,
    active: true,
  },
  {
    id: "itm-008",
    item_code: "ITM-008",
    name: "3/c 2.5mm",
    category: "Electrical",
    item_type: "maintenance_spare",
    budget_type: "OPEX",
    budget_head: "Maintenance Items",
    unit_price: 0,
    unit_of_measure: "pcs",
    reorder_level: 10,
    active: true,
  },
  // ── Baseline Maintenance Catalog Spares ──
  {
    id: "mnt-hvac-001",
    item_code: "MNT-HVAC-FLTR-001",
    name: "AC Air Filter 24x24",
    category: "HVAC",
    item_type: "maintenance_spare",
    budget_type: "OPEX",
    budget_head: "Maintenance Items",
    unit_price: 45,
    unit_of_measure: "Nos",
    reorder_level: 20,
    active: true,
  },
  {
    id: "mnt-hvac-002",
    item_code: "MNT-HVAC-CAP-001",
    name: "AC Capacitor 45+5 MFD",
    category: "HVAC",
    item_type: "maintenance_spare",
    budget_type: "OPEX",
    budget_head: "Maintenance Items",
    unit_price: 65,
    unit_of_measure: "Nos",
    reorder_level: 5,
    active: true,
  },
  {
    id: "mnt-hvac-003",
    item_code: "MNT-HVAC-DRN-001",
    name: "AC Drain Hose",
    category: "HVAC",
    item_type: "maintenance_spare",
    budget_type: "OPEX",
    budget_head: "Maintenance Items",
    unit_price: 15,
    unit_of_measure: "Meter",
    reorder_level: 20,
    active: true,
  },
  {
    id: "mnt-elec-001",
    item_code: "MNT-ELEC-LED-001",
    name: "LED Bulb 12W",
    category: "Electrical",
    item_type: "consumable",
    budget_type: "OPEX",
    budget_head: "Maintenance Items",
    unit_price: 18,
    unit_of_measure: "Nos",
    reorder_level: 50,
    active: true,
  },
  {
    id: "mnt-elec-002",
    item_code: "MNT-ELEC-MCB-001",
    name: "MCB 20A Single Pole",
    category: "Electrical",
    item_type: "maintenance_spare",
    budget_type: "OPEX",
    budget_head: "Maintenance Items",
    unit_price: 35,
    unit_of_measure: "Nos",
    reorder_level: 10,
    active: true,
  },
  {
    id: "mnt-plb-001",
    item_code: "MNT-PLB-HOSE-001",
    name: "Flexible Water Hose 1/2 Inch",
    category: "Plumbing",
    item_type: "maintenance_spare",
    budget_type: "OPEX",
    budget_head: "Maintenance Items",
    unit_price: 25,
    unit_of_measure: "Nos",
    reorder_level: 10,
    active: true,
  },
  {
    id: "mnt-plb-002",
    item_code: "MNT-PLB-VALVE-001",
    name: "Angle Valve 1/2 Inch Heavy Duty",
    category: "Plumbing",
    item_type: "maintenance_spare",
    budget_type: "OPEX",
    budget_head: "Maintenance Items",
    unit_price: 40,
    unit_of_measure: "Nos",
    reorder_level: 10,
    active: true,
  },
  {
    id: "mnt-civl-001",
    item_code: "MNT-CIVL-SIL-001",
    name: "Silicone Sealant Waterproof",
    category: "Civil Work",
    item_type: "consumable",
    budget_type: "OPEX",
    budget_head: "Maintenance Items",
    unit_price: 22,
    unit_of_measure: "Tube",
    reorder_level: 15,
    active: true,
  },
  {
    id: "ast-hvac-001",
    item_code: "AST-HVAC-SPLT-001",
    name: "Split Air Conditioner 2.0 Ton (Inverter)",
    category: "HVAC",
    item_type: "asset",
    budget_type: "CAPEX",
    budget_head: "Property Assets",
    unit_price: 2400,
    unit_of_measure: "Unit",
    reorder_level: 2,
    active: true,
  },
  {
    id: "srv-clean-001",
    item_code: "SRV-CLN-DEEP-001",
    name: "Comprehensive Deep Cleaning & Sanitization Service",
    category: "Cleaning Supplies",
    item_type: "service",
    budget_type: "OPEX",
    budget_head: "Other",
    unit_price: 350,
    unit_of_measure: "Service",
    reorder_level: 0,
    active: true,
  },
];

const LOCAL_STORAGE_KEY = "proc_catalog_items";

/**
 * Loads catalog items with layered fallback:
 * 1. Supabase public.procurement_items
 * 2. localStorage cache ("proc_catalog_items")
 * 3. Seeded defaultCatalogItems (ensures never 0 on clean device)
 */
export async function loadCatalogItems(): Promise<CatalogItem[]> {
  try {
    const { data: dbItems, error: dbErr } = await supabase
      .from("procurement_items")
      .select("*")
      .order("item_code", { ascending: true });

    if (!dbErr && dbItems && dbItems.length > 0) {
      const mapped: CatalogItem[] = dbItems.map((r: any) => ({
        id: r.id || `cat-${r.item_code}`,
        item_code: r.item_code,
        name: r.name,
        category: r.category || "Other",
        item_type: (r.item_type || "maintenance_spare") as ItemType,
        budget_type: (r.budget_type || "OPEX") as "CAPEX" | "OPEX",
        budget_head: (r.budget_head || "Maintenance Items") as BudgetHead,
        unit_price: Number(r.unit_price || 0),
        unit_of_measure: r.unit_of_measure || "Nos",
        reorder_level: Number(r.reorder_level || 0),
        active: r.active !== false,
      }));

      // Cache locally
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
      } catch {}

      return mapped;
    }
  } catch (err) {
    console.warn("[Catalog] Supabase query notice, falling back to cache/defaults:", err);
  }

  // Fallback 1: LocalStorage
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  // Fallback 2: Built-in defaults
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultCatalogItems));
  } catch {}

  return defaultCatalogItems;
}

/**
 * Saves or updates a single item in Supabase and localStorage.
 */
export async function persistCatalogItem(item: CatalogItem, currentCatalog: CatalogItem[]): Promise<CatalogItem[]> {
  const updatedCatalog = [item, ...currentCatalog.filter(c => c.item_code.toLowerCase() !== item.item_code.toLowerCase())];

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedCatalog));
  } catch {}

  try {
    await supabase.from("procurement_items").upsert({
      item_code: item.item_code,
      name: item.name,
      category: item.category,
      item_type: item.item_type,
      budget_type: item.budget_type,
      budget_head: item.budget_head,
      unit_price: Number(item.unit_price || 0),
      unit_of_measure: item.unit_of_measure || "Nos",
      reorder_level: Number(item.reorder_level || 0),
      active: item.active !== false,
      updated_at: new Date().toISOString(),
    }, { onConflict: "item_code" });
  } catch (e) {
    console.warn("[Catalog] Supabase persist notice:", e);
  }

  return updatedCatalog;
}

/**
 * Batch saves or imports items to Supabase and localStorage.
 */
export async function persistCatalogBatch(newItems: CatalogItem[], currentCatalog: CatalogItem[]): Promise<CatalogItem[]> {
  const map = new Map<string, CatalogItem>();
  // Existing items first
  currentCatalog.forEach(c => map.set(c.item_code.toLowerCase(), c));
  // New items override or add
  newItems.forEach(n => map.set(n.item_code.toLowerCase(), n));
  const merged = Array.from(map.values());

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
  } catch {}

  try {
    const payload = newItems.map(item => ({
      item_code: item.item_code,
      name: item.name,
      category: item.category || "Other",
      item_type: item.item_type || "maintenance_spare",
      budget_type: item.budget_type || "OPEX",
      budget_head: item.budget_head || "Maintenance Items",
      unit_price: Number(item.unit_price || 0),
      unit_of_measure: item.unit_of_measure || "Nos",
      reorder_level: Number(item.reorder_level || 0),
      active: item.active !== false,
      updated_at: new Date().toISOString(),
    }));

    await supabase.from("procurement_items").upsert(payload, { onConflict: "item_code" });
  } catch (e) {
    console.warn("[Catalog] Supabase batch upsert notice:", e);
  }

  return merged;
}

/**
 * Exports catalog items to CSV for backup and download.
 */
export function exportCatalogCSV(catalog: CatalogItem[]) {
  const headers = ["item_code", "name", "category", "item_type", "budget_type", "budget_head", "unit_price", "unit_of_measure", "reorder_level", "active"];
  const rows = catalog.map(c => [
    `"${c.item_code.replace(/"/g, '""')}"`,
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.category.replace(/"/g, '""')}"`,
    c.item_type,
    c.budget_type,
    `"${c.budget_head.replace(/"/g, '""')}"`,
    c.unit_price,
    `"${c.unit_of_measure.replace(/"/g, '""')}"`,
    c.reorder_level,
    c.active ? "true" : "false",
  ].join(","));

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `item_master_catalog_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
