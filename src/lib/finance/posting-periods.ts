/**
 * Posting-period lock check. The periods are read from the `fin_posting_periods` table; nothing is kept in browser
 * storage. This module holds the last database read in memory so the synchronous date checks can run, and it is
 * refreshed whenever a finance screen loads or a period changes.
 */
import { FinPostingPeriodsApi } from "@/lib/supabase-finance";

type PeriodLock = { period_name: string; status: string };

let periods: PeriodLock[] = [];
const listeners = new Set<() => void>();

/** Read the periods from the database. Keeps the previous list if the read fails. */
export async function refreshPostingPeriods(): Promise<void> {
  try {
    const rows = await FinPostingPeriodsApi.fetchAll();
    periods = rows.map(r => ({ period_name: String(r.period_name ?? ""), status: String(r.status ?? "") }));
    listeners.forEach(fn => fn());
  } catch {
    // keep the last database read; the next refresh retries
  }
}

export function onPostingPeriodsChanged(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function isPostingPeriodClosed(dateStr?: string): { closed: boolean; periodName?: string } {
  if (!dateStr) return { closed: false };
  const ym = dateStr.split("T")[0].slice(0, 7);
  const found = periods.find(p => p.period_name === ym);
  if (found && found.status.toLowerCase() === "closed") return { closed: true, periodName: ym };
  return { closed: false };
}
if (typeof window !== "undefined") void refreshPostingPeriods();
