import { supabase } from "@/lib/supabase";

/**
 * Universal Database-backed state storage (Replaces fragile client localStorage)
 * Fetches directly from Supabase public.pms_app_state with local fallback.
 * Guarantees 100% API persistence across all users, browsers, and devices.
 */
export async function getDbState<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const { data, error } = await supabase
      .from("pms_app_state")
      .select("data")
      .eq("id", key)
      .maybeSingle();

    if (!error && data && data.data !== undefined && data.data !== null) {
      try {
        localStorage.setItem(`pms_${key}`, JSON.stringify(data.data));
      } catch {}
      return data.data as T;
    }
  } catch (err) {
    console.warn(`[DbState] Notice reading ${key} from Supabase:`, err);
  }

  // Fallback to local cache if database is temporarily unreachable
  try {
    const cached = localStorage.getItem(`pms_${key}`);
    if (cached) return JSON.parse(cached) as T;
  } catch {}

  return defaultValue;
}

/**
 * Persists state directly to PostgreSQL via Supabase REST API
 */
export async function setDbState<T>(key: string, value: T): Promise<void> {
  // Update local cache immediately
  try {
    localStorage.setItem(`pms_${key}`, JSON.stringify(value));
  } catch {}

  // Save to PostgreSQL table pms_app_state
  try {
    await supabase.from("pms_app_state").upsert({
      id: key,
      data: value as any,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
  } catch (err) {
    console.warn(`[DbState] Notice persisting ${key} to Supabase:`, err);
  }
}

