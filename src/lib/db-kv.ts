/**
 * Named values kept in the database. Replaces browser storage for screens whose data is a single JSON value
 * (for example the HRMS leave and payroll fallbacks).
 *
 * Each value is one row in `app_documents`: store = the key name, id = "value". Nothing is written to the browser:
 *  - Reads come from an in-memory copy that is loaded from the database by `loadDbValues` at start-up.
 *  - Writes go to the database straight away; the in-memory copy is updated at the same time.
 *  - Any browser copy left by an earlier version is merged in once, uploaded, and then removed from the browser.
 */
import { supabase } from "@/lib/supabase";
import { apiDb } from "@/lib/api-db";
import { toast } from "sonner";

const VALUE_ID = "value";
const memory = new Map<string, unknown>();

function readLegacy(key: string): { found: boolean; value: unknown } {
  if (typeof window === "undefined") return { found: false, value: undefined };
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return { found: false, value: undefined };
    return { found: true, value: JSON.parse(raw) };
  } catch {
    return { found: false, value: undefined };
  }
}

function removeLegacy(key: string) {
  try { window.localStorage.removeItem(key); } catch { /* storage unavailable */ }
}

/** Combine the database value with a browser leftover. Database entries win; leftover entries are added. */
function merge(dbValue: unknown, legacy: unknown): unknown {
  if (legacy === undefined || legacy === null) return dbValue;
  if (dbValue === undefined || dbValue === null) return legacy;
  if (Array.isArray(dbValue) && Array.isArray(legacy)) {
    const ids = new Set(dbValue.map((x: any) => String(x?.id ?? JSON.stringify(x))));
    const extra = legacy.filter((x: any) => !ids.has(String(x?.id ?? JSON.stringify(x))));
    return [...dbValue, ...extra];
  }
  if (typeof dbValue === "object" && typeof legacy === "object" && !Array.isArray(dbValue) && !Array.isArray(legacy)) {
    return { ...(legacy as object), ...(dbValue as object) };
  }
  return dbValue;
}

async function writeValue(key: string, value: unknown): Promise<string | null> {
  if (value === undefined || value === null) {
    const { error } = await apiDb
      .from("app_documents")
      .update({ deleted: true, updated_at: new Date().toISOString() } as any)
      .eq("store", key)
      .eq("id", VALUE_ID);
    return error ? error.message : null;
  }
  const { error } = await apiDb.from("app_documents").upsert(
    [{ store: key, id: VALUE_ID, data: value as any, deleted: false, updated_at: new Date().toISOString() }],
    { onConflict: "store,id" },
  );
  return error ? error.message : null;
}

/** Start-up: load the database value of each key into memory, and upload any browser leftover once. */
export async function loadDbValues(keys: string[]): Promise<void> {
  if (typeof window === "undefined" || keys.length === 0) return;
  const { data, error } = await supabase
    .from("app_documents")
    .select("store, data")
    .in("store", keys)
    .eq("id", VALUE_ID)
    .eq("deleted", false);
  if (error || !data) return; // nothing is loaded; the next start-up retries

  const dbByKey = new Map<string, unknown>((data as { store: string; data: unknown }[]).map(r => [r.store, r.data]));
  for (const key of keys) {
    const legacy = readLegacy(key);
    const value = legacy.found ? merge(dbByKey.get(key), legacy.value) : dbByKey.get(key);
    if (legacy.found) {
      const err = await writeValue(key, value);
      if (err) toast.error(`${key}: browser records were NOT saved to the database: ${err}`);
      else removeLegacy(key);
    }
    memory.set(key, value);
  }
  window.dispatchEvent(new Event("db_values_loaded"));
}

/** Read a value from the database copy held in memory. Returns the fallback until the start-up load has run. */
export function dbValueGet<T>(key: string, fallback: T): T {
  return memory.has(key) && memory.get(key) !== undefined && memory.get(key) !== null ? (memory.get(key) as T) : fallback;
}

/** Store a value in the database now, and update the in-memory copy. */
export function dbValueSet<T>(key: string, value: T): void {
  memory.set(key, value);
  void writeValue(key, value).then(err => {
    if (err) toast.error(`${key} was NOT saved to the database: ${err}`);
  });
  if (typeof window !== "undefined") window.dispatchEvent(new Event(`db_value:${key}`));
}
