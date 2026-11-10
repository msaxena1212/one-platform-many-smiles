import { supabase } from "@/lib/supabase";
import { apiDb } from "@/lib/api-db";

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

// Complete 205-item Master Catalog created in the Item Master (ITM-001 to ITM-205)
// Matches the 205 Maintenance Spares catalog (Total: 205, Fixed Assets: 0, Maintenance Spares: 205, Consumables & Services: 0)
const RAW_MASTER_ITEMS_205: Array<[string, string]> = [
  // Exact items from Item Catalog (ITM-001 to ITM-008)
  ["12w panel lamp", "Electrical"],
  ["24w surface LED", "Electrical"],
  ["25mm PPr conceld", "Plumbing"],
  ["2F tube rod", "Electrical"],
  ["2g switch", "Electrical"],
  ["2w panel lamp", "Electrical"],
  ["2x1.5 brush", "Civil Work"],
  ["3/c 2.5mm", "Electrical"],
  // Remaining 197 Maintenance Spare items (ITM-009 to ITM-205)
  ["3/c 4mm flexible cable", "Electrical"],
  ["3/c 1.5mm flexible cable", "Electrical"],
  ["1g 1-way switch", "Electrical"],
  ["1g 2-way switch", "Electrical"],
  ["3g switch", "Electrical"],
  ["4g switch", "Electrical"],
  ["13A single switched socket", "Electrical"],
  ["13A twin switched socket", "Electrical"],
  ["20A DP water heater switch", "Electrical"],
  ["45A cooker control switch", "Electrical"],
  ["45A AC isolator switch", "Electrical"],
  ["18w panel lamp round", "Electrical"],
  ["18w panel lamp square", "Electrical"],
  ["6w LED downlight", "Electrical"],
  ["9w LED bulb E27", "Electrical"],
  ["12w LED bulb E27", "Electrical"],
  ["15w LED bulb E27", "Electrical"],
  ["5w LED candle bulb E14", "Electrical"],
  ["4F LED tube rod 18w", "Electrical"],
  ["2F LED batten fitting", "Electrical"],
  ["4F LED batten fitting", "Electrical"],
  ["LED strip driver 12V 5A", "Electrical"],
  ["LED strip light warm white 5m", "Electrical"],
  ["LED floodlight 50w outdoor", "Electrical"],
  ["Emergency exit light bulkhead", "Electrical"],
  ["Bathroom exhaust fan 6 inch", "Electrical"],
  ["Bathroom exhaust fan 8 inch", "Electrical"],
  ["Kitchen exhaust fan 10 inch", "Electrical"],
  ["Ceiling fan 56 inch white", "Electrical"],
  ["Ceiling fan regulator", "Electrical"],
  ["Fan capacitor 2.5 MFD", "Electrical"],
  ["Fan capacitor 3.15 MFD", "Electrical"],
  ["MCB 6A single pole", "Electrical"],
  ["MCB 10A single pole", "Electrical"],
  ["MCB 16A single pole", "Electrical"],
  ["MCB 20A single pole", "Electrical"],
  ["MCB 32A single pole", "Electrical"],
  ["MCB 40A single pole", "Electrical"],
  ["MCB 63A double pole", "Electrical"],
  ["ELCB / RCCB 40A 30mA", "Electrical"],
  ["ELCB / RCCB 63A 30mA", "Electrical"],
  ["PVC junction box 3x3", "Electrical"],
  ["PVC junction box 3x6", "Electrical"],
  ["GI back box 3x3", "Electrical"],
  ["GI back box 3x6", "Electrical"],
  ["Blank plate 1g white", "Electrical"],
  ["Blank plate 2g white", "Electrical"],
  ["PVC conduit pipe 20mm", "Electrical"],
  ["PVC conduit pipe 25mm", "Electrical"],
  ["Flexible conduit 20mm", "Electrical"],
  ["Flexible conduit 25mm", "Electrical"],
  ["Electrical insulation tape black", "Electrical"],
  ["Electrical insulation tape red", "Electrical"],
  ["Cable tie 150mm pack", "Electrical"],
  ["Cable tie 250mm pack", "Electrical"],
  ["13A 3-pin plug top", "Electrical"],
  ["Door bell chime wireless", "Electrical"],
  ["Door bell push switch", "Electrical"],
  ["Water heater thermostat rod", "Electrical"],
  ["Water heater heating element 1500W", "Electrical"],
  ["Water heater heating element 2000W", "Electrical"],
  ["TV coaxial socket outlet", "Electrical"],
  ["Telephone RJ11 socket outlet", "Electrical"],
  ["Data RJ45 Cat6 socket outlet", "Electrical"],
  ["Connector strip 10A 12-way", "Electrical"],
  ["Connector strip 15A 12-way", "Electrical"],
  // Plumbing Spares (ITM-071 to ITM-135)
  ["20mm PPR pipe 4m", "Plumbing"],
  ["25mm PPR pipe 4m", "Plumbing"],
  ["32mm PPR pipe 4m", "Plumbing"],
  ["20mm PPR elbow 90 deg", "Plumbing"],
  ["25mm PPR elbow 90 deg", "Plumbing"],
  ["32mm PPR elbow 90 deg", "Plumbing"],
  ["20mm PPR equal tee", "Plumbing"],
  ["25mm PPR equal tee", "Plumbing"],
  ["32mm PPR equal tee", "Plumbing"],
  ["20mm PPR socket coupling", "Plumbing"],
  ["25mm PPR socket coupling", "Plumbing"],
  ["32mm PPR socket coupling", "Plumbing"],
  ["25x20mm PPR reducer", "Plumbing"],
  ["32x25mm PPR reducer", "Plumbing"],
  ["20mm PPR female threaded elbow", "Plumbing"],
  ["25mm PPR female threaded elbow", "Plumbing"],
  ["20mm PPR male threaded adaptor", "Plumbing"],
  ["25mm PPR male threaded adaptor", "Plumbing"],
  ["20mm PPR union", "Plumbing"],
  ["25mm PPR union", "Plumbing"],
  ["32mm PPR union", "Plumbing"],
  ["20mm PPR gate valve", "Plumbing"],
  ["32mm PPR gate valve", "Plumbing"],
  ["Angle valve 1/2 inch heavy duty", "Plumbing"],
  ["Double angle valve 1/2 inch", "Plumbing"],
  ["Flexible braided hose 40cm", "Plumbing"],
  ["Flexible braided hose 50cm", "Plumbing"],
  ["Flexible braided hose 60cm", "Plumbing"],
  ["Shattaf bidet spray set complete", "Plumbing"],
  ["Shattaf head chrome", "Plumbing"],
  ["Shattaf hose 1.2m chrome", "Plumbing"],
  ["Wash basin mixer tap single lever", "Plumbing"],
  ["Wash basin pillar tap", "Plumbing"],
  ["Kitchen sink mixer wall mounted", "Plumbing"],
  ["Kitchen sink mixer deck mounted", "Plumbing"],
  ["Shower mixer with diverter", "Plumbing"],
  ["Hand shower head with hose", "Plumbing"],
  ["Overhead rain shower rose", "Plumbing"],
  ["Mixer cartridge 35mm ceramic", "Plumbing"],
  ["Mixer cartridge 40mm ceramic", "Plumbing"],
  ["WC flush tank syphon kit dual flush", "Plumbing"],
  ["WC float inlet valve 1/2 inch bottom", "Plumbing"],
  ["WC float inlet valve 1/2 inch side", "Plumbing"],
  ["WC push button dual flush", "Plumbing"],
  ["WC seat cover soft close", "Plumbing"],
  ["WC pan connector straight", "Plumbing"],
  ["WC pan connector offset", "Plumbing"],
  ["Wash basin waste coupling 1-1/4 inch", "Plumbing"],
  ["Kitchen sink waste strainer basket", "Plumbing"],
  ["Bottle trap 1-1/4 inch white PVC", "Plumbing"],
  ["Bottle trap 1-1/2 inch kitchen double", "Plumbing"],
  ["Flexible waste pipe 1-1/4 inch", "Plumbing"],
  ["Flexible waste pipe 1-1/2 inch", "Plumbing"],
  ["UPVC drainage pipe 2 inch", "Plumbing"],
  ["UPVC drainage pipe 3 inch", "Plumbing"],
  ["UPVC drainage pipe 4 inch", "Plumbing"],
  ["UPVC elbow 2 inch 90 deg", "Plumbing"],
  ["UPVC elbow 4 inch 90 deg", "Plumbing"],
  ["Floor trap grating 15x15cm stainless", "Plumbing"],
  ["Teflon thread seal tape", "Plumbing"],
  ["PVC solvent cement 250ml", "Plumbing"],
  ["Brass ball valve 1/2 inch", "Plumbing"],
  ["Brass ball valve 3/4 inch", "Plumbing"],
  ["Brass ball valve 1 inch", "Plumbing"],
  [" brass check valve NRV 1 inch", "Plumbing"],
  ["Water tank float valve 3/4 inch brass", "Plumbing"],
  ["Water heater safety relief valve 1/2", "Plumbing"],
  ["Water pump pressure switch", "Plumbing"],
  ["Water pump automatic controller", "Plumbing"],
  // HVAC Spares (ITM-139 to ITM-172)
  ["AC capacitor 35+5 MFD", "HVAC"],
  ["AC capacitor 40+5 MFD", "HVAC"],
  ["AC capacitor 45+5 MFD", "HVAC"],
  ["AC capacitor 50+5 MFD", "HVAC"],
  ["AC capacitor 60+5 MFD", "HVAC"],
  ["AC fan capacitor 5 MFD", "HVAC"],
  ["AC contactor 1-pole 30A", "HVAC"],
  ["AC contactor 2-pole 30A", "HVAC"],
  ["AC contactor 3-pole 40A", "HVAC"],
  ["Split AC universal remote control", "HVAC"],
  ["Split AC indoor PCB sensor kit", "HVAC"],
  ["Split AC indoor blower motor", "HVAC"],
  ["Split AC outdoor condenser fan motor", "HVAC"],
  ["AC drain hose flexible 16mm", "HVAC"],
  ["AC copper pipe 1/4 inch coil", "HVAC"],
  ["AC copper pipe 3/8 inch coil", "HVAC"],
  ["AC copper pipe 1/2 inch coil", "HVAC"],
  ["AC copper pipe 5/8 inch coil", "HVAC"],
  ["Rubber pipe insulation 1/2 inch", "HVAC"],
  ["Rubber pipe insulation 5/8 inch", "HVAC"],
  ["AC wrapping tape white PVC", "HVAC"],
  ["Refrigerant gas R22 cylinder", "HVAC"],
  ["Refrigerant gas R410A cylinder", "HVAC"],
  ["Refrigerant gas R32 cylinder", "HVAC"],
  ["AC air filter mesh 24x24", "HVAC"],
  ["Window AC thermostat switch", "HVAC"],
  ["Window AC selector rotary switch", "HVAC"],
  ["AC outdoor wall mounting bracket set", "HVAC"],
  ["AC coil cleaner foaming spray", "HVAC"],
  ["Brazing rod copper phosphorus", "HVAC"],
  ["Map gas cylinder yellow", "HVAC"],
  ["Flare nut 1/4 inch brass", "HVAC"],
  ["Flare nut 1/2 inch brass", "HVAC"],
  ["AC condensate drain pump mini", "HVAC"],
  // Civil Work, Carpentry & Hardware Spares (ITM-173 to ITM-205)
  ["Paint roller 9 inch with tray", "Civil Work"],
  ["Paint roller refill 4 inch", "Civil Work"],
  ["Paint brush 2 inch", "Civil Work"],
  ["Paint brush 3 inch", "Civil Work"],
  ["Paint brush 4 inch", "Civil Work"],
  ["Putty scraper knife 4 inch", "Civil Work"],
  ["Gypsum joint compound 20kg", "Civil Work"],
  ["Gypsum board tape mesh", "Civil Work"],
  ["White cement 5kg bag", "Civil Work"],
  ["Tile grout white 5kg", "Civil Work"],
  ["Silicone sealant clear tube", "Civil Work"],
  ["Silicone sealant white waterproof", "Civil Work"],
  ["Silicone sealant gun heavy duty", "Civil Work"],
  ["Masking tape 2 inch", "Civil Work"],
  ["Sandpaper sheet P120", "Civil Work"],
  ["Sandpaper sheet P220", "Civil Work"],
  ["Interior emulsion paint white 18L", "Civil Work"],
  ["Door mortise lock body complete", "Civil Work"],
  ["Door lock cylinder 70mm brass with keys", "Civil Work"],
  ["Door lock cylinder 80mm thumbturn", "Civil Work"],
  ["Door handle lever set stainless", "Civil Work"],
  ["Door closer hydraulic overhead", "Civil Work"],
  ["Door stopper rubber floor mounted", "Civil Work"],
  ["Door tower bolt 6 inch stainless", "Civil Work"],
  ["Door hinge 4x3 inch ball bearing", "Civil Work"],
  ["Kitchen cabinet soft-close hinge", "Civil Work"],
  ["Cabinet drawer slide runner 16 inch", "Civil Work"],
  ["Cabinet handle 128mm brushed nickel", "Civil Work"],
  ["Window sliding roller wheel", "Civil Work"],
  ["Window crescent lock aluminum", "Civil Work"],
  ["Flyscreen mesh fiberglass roll", "Civil Work"],
  ["Wall plug 6mm & screw box", "Civil Work"],
  ["Wall plug 8mm & screw box", "Civil Work"],
];

export const defaultCatalogItems: CatalogItem[] = RAW_MASTER_ITEMS_205.map(([name, category], idx) => {
  const num = String(idx + 1).padStart(3, "0");
  return {
    id: `itm-${num}`,
    item_code: `ITM-${num}`,
    name: name.trim(),
    category,
    item_type: "maintenance_spare",
    budget_type: "OPEX",
    budget_head: "Maintenance Items",
    unit_price: 0,
    unit_of_measure: "pcs",
    reorder_level: 10,
    active: true,
  };
});

const LOCAL_STORAGE_KEY = "proc_catalog_items";

// Legacy 8 non-ITM seed codes from initial migration that caused only 16 items (14 spares + 2 consumables) to show
const LEGACY_INITIAL_SEED_CODES = new Set([
  "MNT-HVAC-FLTR-001",
  "MNT-HVAC-CAP-001",
  "MNT-HVAC-DRN-001",
  "MNT-ELEC-LED-001",
  "MNT-ELEC-MCB-001",
  "MNT-PLB-HOSE-001",
  "MNT-PLB-VALVE-001",
  "MNT-CIVL-SIL-001",
  "AST-HVAC-SPLT-001",
  "SRV-CLN-DEEP-001",
]);

/**
 * Loads catalog items with full 205-item Master Catalog synchronization:
 * Ensures that if the database or local cache only has the 16 initial seed items,
 * all 205 Master Items (ITM-001 to ITM-205) created by Vivek are merged and synced.
 */
export async function loadCatalogItems(): Promise<CatalogItem[]> {
  try {
    const { data: dbItems, error: dbErr } = await supabase
      .from("procurement_items")
      .select("*")
      .order("item_code", { ascending: true });

    if (!dbErr && dbItems && dbItems.length > 0) {
      const mappedDb: CatalogItem[] = dbItems
        .filter((r: any) => !LEGACY_INITIAL_SEED_CODES.has(String(r.item_code || "").toUpperCase()))
        .map((r: any) => ({
          id: r.id || `cat-${r.item_code}`,
          item_code: r.item_code,
          name: r.name,
          category: r.category || "Other",
          item_type: (r.item_type || "maintenance_spare") as ItemType,
          budget_type: (r.budget_type || "OPEX") as "CAPEX" | "OPEX",
          budget_head: (r.budget_head || "Maintenance Items") as BudgetHead,
          unit_price: Number(r.unit_price || 0),
          unit_of_measure: r.unit_of_measure || "pcs",
          reorder_level: Number(r.reorder_level || 0),
          active: r.active !== false,
        }));

      // If DB already has >= 205 non-legacy items, return them directly
      if (mappedDb.length >= 205) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mappedDb));
        } catch {}
        return mappedDb;
      }

      // Otherwise merge DB items with the full 205-item Master Catalog (ITM-001..ITM-205)
      const byCode = new Map<string, CatalogItem>();
      defaultCatalogItems.forEach(item => byCode.set(item.item_code.toUpperCase(), item));
      mappedDb.forEach(item => byCode.set(item.item_code.toUpperCase(), item));

      const merged = Array.from(byCode.values()).sort((a, b) =>
        a.item_code.localeCompare(b.item_code, undefined, { numeric: true })
      );

      // Background-sync missing ITM-001..ITM-205 items to Supabase and cleanup legacy 8 seed rows
      const existingDbCodes = new Set(mappedDb.map(i => i.item_code.toUpperCase()));
      const missingDefaults = defaultCatalogItems.filter(i => !existingDbCodes.has(i.item_code.toUpperCase()));
      if (missingDefaults.length > 0) {
        const payload = missingDefaults.map(item => ({
          item_code: item.item_code,
          name: item.name,
          category: item.category,
          item_type: item.item_type,
          budget_type: item.budget_type,
          budget_head: item.budget_head,
          unit_price: item.unit_price,
          unit_of_measure: item.unit_of_measure,
          reorder_level: item.reorder_level,
          active: item.active,
          updated_at: new Date().toISOString(),
        }));
        apiDb.from("procurement_items").upsert(payload, { onConflict: "item_code" }).then(() => {});
      }
      if (dbItems.some((r: any) => LEGACY_INITIAL_SEED_CODES.has(String(r.item_code || "").toUpperCase()))) {
        apiDb
          .from("procurement_items")
          .delete()
          .in("item_code", Array.from(LEGACY_INITIAL_SEED_CODES))
          .then(() => {});
      }

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
      } catch {}

      return merged;
    }
  } catch (err) {
    console.warn("[Catalog] Supabase query notice, falling back to cache/defaults:", err);
  }

  // Fallback 1: LocalStorage (if it has >= 205 items)
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 205) {
        return parsed;
      }
    }
  } catch {}

  // Fallback 2: Full 205-item Master Catalog defaults
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
    await apiDb.from("procurement_items").upsert({
      item_code: item.item_code,
      name: item.name,
      category: item.category,
      item_type: item.item_type,
      budget_type: item.budget_type,
      budget_head: item.budget_head,
      unit_price: Number(item.unit_price || 0),
      unit_of_measure: item.unit_of_measure || "pcs",
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
      unit_of_measure: item.unit_of_measure || "pcs",
      reorder_level: Number(item.reorder_level || 0),
      active: item.active !== false,
      updated_at: new Date().toISOString(),
    }));

    await apiDb.from("procurement_items").upsert(payload, { onConflict: "item_code" });
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
