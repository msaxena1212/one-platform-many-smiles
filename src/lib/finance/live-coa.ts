/**
 * Live chart of accounts.
 *
 *  - `persistCoaAccount` saves a new ledger to BOTH tables the app uses: `fin_coa_accounts` (the posting master that
 *    journals/vouchers validate against) and `erp_chart_of_accounts` (the master the COA screen displays). Before this,
 *    a ledger added from the COA screen lived only in that browser's localStorage, so it never showed in the chart for
 *    anyone else and could never be selected for posting.
 *  - `useMergedCoa` feeds journal/voucher account pickers from the live `fin_coa_accounts` table.
 */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { apiDb } from "@/lib/api-db";

export type CoaOption = { code: string; name: string };

export type NewCoaAccount = {
  code: string;
  name: string;
  /** Assets | Liabilities | Capital | Revenue | Expenditure | Expenses */
  type: string;
  group_name?: string;
  class_name?: string;
};

const TYPE_META: Record<string, { db: string; code: string; label: string; group: string; cls: string }> = {
  assets: { db: "ASSET", code: "1", label: "Assets", group: "Current Assets", cls: "General Assets" },
  liabilities: { db: "LIABILITY", code: "2", label: "Liabilities", group: "Current Liabilities", cls: "General Liabilities" },
  capital: { db: "EQUITY", code: "3", label: "Capital", group: "Equity & Reserves", cls: "Owner Capital" },
  revenue: { db: "REVENUE", code: "4", label: "Revenue", group: "Operating Revenue", cls: "Rental & Service Income" },
  expenditure: { db: "EXPENSE", code: "5", label: "Expenditure", group: "Operating Expenses", cls: "Direct & Admin Expenses" },
  expenses: { db: "EXPENSE", code: "5", label: "Expenditure", group: "Operating Expenses", cls: "Direct & Admin Expenses" },
};

export const COA_UPDATED_EVENT = "fin_coa_updated";

export async function persistCoaAccount(
  acc: NewCoaAccount,
): Promise<{ ok: true; created: boolean } | { ok: false; error: string }> {
  const code = acc.code.trim();
  const name = acc.name.trim();
  if (!/^\d{5,10}$/.test(code)) return { ok: false, error: "Account code must be 5 to 10 digits." };
  if (!name) return { ok: false, error: "Account name is required." };

  const meta = TYPE_META[(acc.type || "").toLowerCase()] || TYPE_META.expenditure;
  const glCode = code.length > 5 ? code.slice(0, 5) : code;
  const isSl = code.length > 5;

  // Already in the posting master? Treat as success (idempotent).
  const { data: existing } = await supabase.from("fin_coa_accounts").select("id, account_name").eq("account_code", code).limit(1);
  if (existing && existing.length > 0) return { ok: true, created: false };

  // Hierarchy: copy from an existing sibling under the same GL when there is one.
  const { data: sibRows } = await supabase.from("erp_chart_of_accounts").select("*").eq("gl_code", glCode).limit(1);
  const sib: any = sibRows?.[0];
  const { data: glRows } = await supabase
    .from("fin_coa_accounts")
    .select("id, group_name, class_name")
    .eq("account_code", glCode)
    .eq("account_level", "GL")
    .limit(1);
  const glRow: any = glRows?.[0];

  const groupName = sib?.group_name || glRow?.group_name || acc.group_name || meta.group;
  const className = sib?.class_name || glRow?.class_name || acc.class_name || meta.cls;

  const finRow: Record<string, unknown> = {
    account_code: code,
    account_name: name,
    account_type: meta.db,
    is_active: true,
    group_name: groupName,
    class_name: className,
    account_level: isSl ? "SL" : "GL",
  };
  if (isSl && glRow?.id) {
    finRow.parent_account_id = glRow.id;
    finRow.parent_id = glRow.id;
  }
  const { error: finErr } = await apiDb.from("fin_coa_accounts").insert(finRow);
  if (finErr) return { ok: false, error: finErr.message };

  // Display master (best effort: the account is already usable for posting once the row above exists).
  const erpRow: Record<string, unknown> = {
    code,
    name,
    type: sib?.type || meta.label,
    type_code: sib?.type_code || meta.code,
    type_name: sib?.type_name || sib?.type || meta.label,
    group_code: sib?.group_code || `${meta.code}${code.slice(1, 2) || "1"}`,
    group_name: groupName,
    class_code: sib?.class_code || code.slice(0, 3),
    class_name: className,
    gl_code: isSl ? glCode : code,
    gl_name: isSl ? sib?.gl_name || glRow?.account_name || name : name,
    sl_code: isSl ? code : null,
    sl_name: isSl ? name : null,
  };
  const { error: erpErr } = await apiDb.from("erp_chart_of_accounts").insert(erpRow);
  if (erpErr) console.warn("[persistCoaAccount] erp_chart_of_accounts insert note:", erpErr.message);

  if (typeof window !== "undefined") window.dispatchEvent(new Event(COA_UPDATED_EVENT));
  return { ok: true, created: true };
}

/** One-time move of ledgers that were saved only in this browser's localStorage into the database. */
export async function migrateLocalCustomCoa(): Promise<number> {
  if (typeof window === "undefined") return 0;
  const KEY = "fin_custom_coa_accounts_v1";
  let list: any[] = [];
  try {
    const raw = localStorage.getItem(KEY);
    list = raw ? JSON.parse(raw) : [];
  } catch {
    return 0;
  }
  if (!Array.isArray(list) || list.length === 0) return 0;

  const remaining: any[] = [];
  let moved = 0;
  for (const a of list) {
    const code = String(a?.code || a?.gl_code || "");
    const name = String(a?.name || a?.gl_name || "");
    if (!code || !name) continue;
    const res = await persistCoaAccount({ code, name, type: String(a?.type || "Expenditure"), group_name: a?.group_name, class_name: a?.class_name });
    if (res.ok) moved += res.created ? 1 : 0;
    else remaining.push(a);
  }
  try {
    if (remaining.length) localStorage.setItem(KEY, JSON.stringify(remaining));
    else localStorage.removeItem(KEY);
  } catch {
    // storage unavailable
  }
  return moved;
}

let liveCache: { at: number; options: CoaOption[] } | null = null;

export async function fetchLiveCoaOptions(force = false): Promise<CoaOption[]> {
  if (!force && liveCache && Date.now() - liveCache.at < 60_000) return liveCache.options;
  const out: CoaOption[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("fin_coa_accounts")
      .select("account_code, account_name")
      .eq("is_active", true)
      .order("account_code")
      .range(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    data.forEach((r: any) => out.push({ code: String(r.account_code), name: `${r.account_code} - ${r.account_name}` }));
    if (data.length < PAGE) break;
  }
  liveCache = { at: Date.now(), options: out };
  return out;
}

/** The fixed list first (keeps its order and indexes), then every other active account from the live chart. */
export function useMergedCoa(base: CoaOption[]): CoaOption[] {
  const [live, setLive] = useState<CoaOption[]>(() => liveCache?.options || []);
  useEffect(() => {
    let alive = true;
    const load = (force: boolean) =>
      void fetchLiveCoaOptions(force).then((o) => {
        if (alive) setLive(o);
      });
    load(false);
    const onUpdate = () => load(true);
    window.addEventListener(COA_UPDATED_EVENT, onUpdate);
    return () => {
      alive = false;
      window.removeEventListener(COA_UPDATED_EVENT, onUpdate);
    };
  }, []);
  return useMemo(() => {
    const seen = new Set(base.map((b) => b.code));
    return [...base, ...live.filter((l) => !seen.has(l.code))];
  }, [base, live]);
}
