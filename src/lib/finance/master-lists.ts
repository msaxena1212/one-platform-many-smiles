/**
 * Master lists for finance filters (properties, units, customers, GL accounts).
 *
 * Filters must offer what exists in the master data, not only what already has a posting. Ledger rows name a
 * property either by code (MG91) or by title (Al Ameen Residence 91), so filters match on the property code.
 */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchLiveCoaOptions } from "@/lib/finance/live-coa";

export type MasterProperty = { code: string; title: string };
export type MasterUnit = { unit: string; propCode: string };
export type MasterAccount = { code: string; name: string };

export function useFinanceMasterLists() {
  const [properties, setProperties] = useState<MasterProperty[]>([]);
  const [units, setUnits] = useState<MasterUnit[]>([]);
  const [customers, setCustomers] = useState<string[]>([]);
  const [glAccounts, setGlAccounts] = useState<MasterAccount[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [pRes, uRes, cRes] = await Promise.all([
        supabase.from("properties").select("title, property_code").limit(1000),
        supabase.from("units").select("unit_ref, properties(property_code)").limit(5000),
        supabase.from("customers").select("full_name").is("deleted_at", null).order("full_name").limit(5000),
      ]);
      if (!alive) return;
      if (!pRes.error && pRes.data) {
        setProperties(pRes.data.filter((p: any) => p.property_code).map((p: any) => ({
          code: String(p.property_code).trim().toUpperCase(),
          title: String(p.title || "").trim(),
        })));
      }
      if (!uRes.error && uRes.data) {
        setUnits(uRes.data.filter((u: any) => u.unit_ref).map((u: any) => ({
          unit: String(u.unit_ref).trim(),
          propCode: String(u.properties?.property_code || "").trim().toUpperCase(),
        })));
      }
      if (!cRes.error && cRes.data) {
        setCustomers(Array.from(new Set(cRes.data.map((c: any) => String(c.full_name || "").trim()).filter(Boolean))));
      }
    })();
    void fetchLiveCoaOptions(true).then(opts => {
      if (alive) setGlAccounts(opts.map(o => ({ code: o.code, name: o.name })));
    });
    return () => { alive = false; };
  }, []);

  const propCodeByTitle = useMemo(
    () => new Map(properties.filter(p => p.title).map(p => [p.title.toLowerCase(), p.code])),
    [properties],
  );
  const propCodes = useMemo(() => new Set(properties.map(p => p.code)), [properties]);

  /** Canonical property key: the code for any name that is a known code or title; otherwise the name as given. */
  const propKey = useMemo(() => (name?: string): string => {
    const n = (name || "").trim();
    if (!n) return "";
    const upper = n.toUpperCase();
    if (propCodes.has(upper)) return upper;
    return propCodeByTitle.get(n.toLowerCase()) || n;
  }, [propCodes, propCodeByTitle]);

  const propertyOptions = useMemo(
    () => Array.from(propCodes).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
    [propCodes],
  );

  /** Units of one property (by any name for it), or all units when no property is chosen. */
  const unitOptionsFor = (propertyName?: string): string[] => {
    const key = propertyName && propertyName !== "all" ? propKey(propertyName) : "";
    return Array.from(new Set(units.filter(u => !key || u.propCode === key).map(u => u.unit)))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  };

  const accountOptions = useMemo(
    () => [...glAccounts]
      .map(a => ({ code: a.code, name: a.name.replace(/^\d+\s*-\s*/, "") }))
      .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true })),
    [glAccounts],
  );

  return { propertyOptions, unitOptionsFor, customerOptions: customers, accountOptions, propKey };
}
