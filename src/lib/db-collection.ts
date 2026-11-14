/**
 * Database-backed collections for screens that used to keep their records only in the browser.
 *
 * `useDbCollection(store, value, setValue, idOf)` keeps a React state array in step with the `app_documents` table:
 *  - On mount it loads the database rows for `store`. Records that exist only in this browser are uploaded.
 *  - Every change to the array is written to the database straight away: changed records are upserted,
 *    removed records are soft-deleted. A failed write is reported and retried on the next change.
 *  - Changes made in other sessions arrive through Supabase Realtime and replace the local copy.
 *
 * The database is the record. The browser copy only makes the first paint fast.
 */
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { apiDb } from "@/lib/api-db";

type Row = { id: string; data: unknown };

const CHUNK = 200;

export async function loadCollectionRows(store: string): Promise<Row[] | null> {
  const out: Row[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("app_documents")
      .select("id, data")
      .eq("store", store)
      .eq("deleted", false)
      .order("id")
      .range(from, from + PAGE - 1);
    if (error || !data) return null;
    out.push(...(data as Row[]));
    if (data.length < PAGE) break;
  }
  return out;
}

/** Write records to a store now. Returns the error text, or null when every record was saved. */
export async function upsertCollectionRecords(store: string, records: { id: string; data: unknown }[]): Promise<string | null> {
  return upsertRows(store, records);
}

async function upsertRows(store: string, records: { id: string; data: unknown }[]): Promise<string | null> {
  for (let i = 0; i < records.length; i += CHUNK) {
    const chunk = records.slice(i, i + CHUNK).map(r => ({
      store,
      id: r.id,
      data: r.data,
      deleted: false,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await apiDb.from("app_documents").upsert(chunk, { onConflict: "store,id" });
    if (error) return error.message;
  }
  return null;
}

async function softDeleteRows(store: string, ids: string[]): Promise<string | null> {
  for (const id of ids) {
    const { error } = await apiDb
      .from("app_documents")
      .update({ deleted: true, updated_at: new Date().toISOString() } as any)
      .eq("store", store)
      .eq("id", id);
    if (error) return error.message;
  }
  return null;
}

const stableJson = (v: unknown) => JSON.stringify(v);

export function useDbCollection<T>(
  store: string,
  value: T[],
  setValue: (next: T[]) => void,
  idOf: (item: T) => string,
  label: string,
) {
  const loadedRef = useRef(false);
  // What the database holds for this store, as last known: id -> JSON.
  const snapshotRef = useRef<Map<string, string>>(new Map());
  const valueRef = useRef(value);
  valueRef.current = value;
  const setRef = useRef(setValue);
  setRef.current = setValue;
  const idRef = useRef(idOf);
  idRef.current = idOf;
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Initial load: database rows win; browser-only records are uploaded and kept.
  useEffect(() => {
    let alive = true;
    (async () => {
      const rows = await loadCollectionRows(store);
      if (!alive) return;
      if (rows === null) {
        toast.error(`${label}: could not load from the database. Showing this browser's copy until it reconnects.`);
        loadedRef.current = true;
        return;
      }
      const dbItems = rows.map(r => r.data as T);
      const dbIds = new Set(rows.map(r => r.id));
      const localOnly = valueRef.current.filter(item => !dbIds.has(idRef.current(item)));
      snapshotRef.current = new Map(rows.map(r => [r.id, stableJson(r.data)]));
      loadedRef.current = true;
      const merged = [...dbItems, ...localOnly];
      if (localOnly.length > 0) toast.info(`${localOnly.length} ${label} record(s) from this browser are being saved to the database.`);
      setRef.current(merged);
    })();
    return () => { alive = false; };
  }, [store, label]);

  // 2. Every change is written to the database now.
  useEffect(() => {
    if (!loadedRef.current) return;
    const snapshot = snapshotRef.current;
    const changed: { id: string; data: unknown }[] = [];
    const seen = new Set<string>();
    for (const item of value) {
      const id = idRef.current(item);
      seen.add(id);
      const json = stableJson(item);
      if (snapshot.get(id) !== json) changed.push({ id, data: item });
    }
    const removed = [...snapshot.keys()].filter(id => !seen.has(id));
    if (changed.length === 0 && removed.length === 0) return;

    (async () => {
      if (changed.length) {
        const err = await upsertRows(store, changed);
        if (err) toast.error(`${label} was NOT saved to the database: ${err}`);
        else changed.forEach(r => snapshot.set(r.id, stableJson(r.data)));
      }
      if (removed.length) {
        const err = await softDeleteRows(store, removed);
        if (err) toast.error(`${label}: removal was NOT saved to the database: ${err}`);
        else removed.forEach(id => snapshot.delete(id));
      }
    })();
  }, [value, store, label]);

  // 3. Changes made in other sessions.
  useEffect(() => {
    const reload = () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      reloadTimer.current = setTimeout(async () => {
        const rows = await loadCollectionRows(store);
        if (!rows) return;
        snapshotRef.current = new Map(rows.map(r => [r.id, stableJson(r.data)]));
        setRef.current(rows.map(r => r.data as T));
      }, 300);
    };
    const channel = supabase
      .channel(`app-documents:${store}`)
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "app_documents", filter: `store=eq.${store}` }, reload)
      .subscribe();
    return () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      supabase.removeChannel(channel);
    };
  }, [store]);
}
