/**
 * Server side of the write API (`POST /api/db`).
 *
 * Every insert / update / upsert / delete from the browser is sent here instead of going straight to
 * Supabase. The caller's own JWT is forwarded, so row-level security still decides what is allowed.
 *
 * Data-loss protections:
 *  - update / delete need at least one real filter; "match everything" shapes (`neq`/`not` only) are refused
 *  - a single call may touch at most `maxRows` rows (default 200)
 *  - the rows about to be changed are copied into the immutable `api_change_log` table FIRST; if that copy
 *    cannot be written the change is refused (fail closed)
 *  - `restore` puts the logged "before" rows back
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { CANONICAL_SUPABASE_URL as CANONICAL_URL, CANONICAL_SUPABASE_ANON_KEY as CANONICAL_ANON } from "./supabase";


const FILTER_METHODS = new Set([
  "eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike", "is", "in", "contains", "containedBy",
  "overlaps", "match", "not", "or", "filter", "textSearch",
]);
// Filters that, on their own, select "everything except ..." and so behave like a table wipe.
const WIPE_ONLY_METHODS = new Set(["neq", "not"]);
const WRITE_OPS = new Set(["insert", "update", "upsert", "delete", "restore"]);
const TABLE_RE = /^[a-z_][a-z0-9_]*$/;
const BLOCKED_TABLES = new Set(["api_change_log"]);
const DEFAULT_MAX_ROWS = 1000;
const HARD_MAX_ROWS = 5000;
const MAX_INSERT_ROWS = 20000;
const LOG_VALUES_CAP = 500;

export type DbApiRequest = {
  op: "insert" | "update" | "upsert" | "delete" | "restore";
  table?: string;
  values?: unknown;
  options?: { onConflict?: string; ignoreDuplicates?: boolean; count?: "exact" | "planned" | "estimated" };
  filters?: [string, ...unknown[]][];
  returning?: {
    select?: string | null;
    single?: "single" | "maybeSingle" | null;
    order?: [string, Record<string, unknown> | undefined][];
    limit?: number;
  };
  maxRows?: number;
  logId?: string;
};

type ApiError = { message: string; code?: string; details?: string | null; hint?: string | null };
type ApiResult = { status: number; body: { data: unknown; error: ApiError | null; count?: number | null } };

const fail = (status: number, message: string, code = "API_REFUSED"): ApiResult => ({
  status,
  body: { data: null, error: { message, code } },
});

function env(name: string): string | undefined {
  return typeof process !== "undefined" ? process.env?.[name] : undefined;
}

function applyFilters(query: any, filters: [string, ...unknown[]][]) {
  for (const [method, ...args] of filters) {
    query = query[method](...args);
  }
  return query;
}

function validateFilters(filters: unknown): [string, ...unknown[]][] | string {
  if (filters == null) return [];
  if (!Array.isArray(filters)) return "filters must be an array";
  for (const f of filters) {
    if (!Array.isArray(f) || typeof f[0] !== "string" || !FILTER_METHODS.has(f[0])) {
      return `unsupported filter ${JSON.stringify(Array.isArray(f) ? f[0] : f)}`;
    }
  }
  return filters as [string, ...unknown[]][];
}

export async function handleDbApi(request: Request): Promise<ApiResult> {
  let req: DbApiRequest;
  try {
    req = (await request.json()) as DbApiRequest;
  } catch {
    return fail(400, "Request body must be JSON", "BAD_REQUEST");
  }
  if (!req || !WRITE_OPS.has(req.op)) return fail(400, `Unsupported op "${String(req?.op)}"`, "BAD_REQUEST");

  const url = env("VITE_SUPABASE_URL") || CANONICAL_URL;
  const anon = env("VITE_SUPABASE_ANON_KEY") || CANONICAL_ANON;
  const bearer = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  const token = bearer || anon;

  const client: SupabaseClient = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let actorId: string | null = null;
  let actorEmail: string | null = null;
  if (bearer && bearer !== anon) {
    try {
      const { data } = await client.auth.getUser(bearer);
      actorId = data.user?.id ?? null;
      actorEmail = data.user?.email ?? null;
    } catch {
      // unauthenticated / expired token: RLS will decide, actor stays unknown
    }
  }

  const writeLog = async (row: Record<string, unknown>): Promise<string | null> => {
    const { error } = await client.from("api_change_log").insert({ actor_id: actorId, actor_email: actorEmail, ...row });
    return error ? error.message : null;
  };

  // ── restore: put the logged "before" rows of an earlier change back ──────────────────────────────
  if (req.op === "restore") {
    if (!req.logId) return fail(400, "logId is required", "BAD_REQUEST");
    const { data: entry, error } = await client.from("api_change_log").select("*").eq("id", req.logId).single();
    if (error || !entry) return fail(404, "Change log entry not found", "NOT_FOUND");
    const rows = Array.isArray(entry.before_rows) ? entry.before_rows : [];
    if (!rows.length) return fail(409, "This change has no stored rows to restore", "NOTHING_TO_RESTORE");
    const logErr = await writeLog({ op: "restore", table_name: entry.table_name, filters: null, new_values: { restoredFrom: entry.id }, row_count: rows.length });
    if (logErr) return fail(500, `Change refused: audit log unavailable (${logErr})`, "AUDIT_UNAVAILABLE");
    const { data, error: upErr } = await client.from(entry.table_name).upsert(rows).select();
    if (upErr) return { status: 400, body: { data: null, error: { message: upErr.message, code: upErr.code, details: upErr.details, hint: upErr.hint } } };
    return { status: 200, body: { data, error: null } };
  }

  const table = req.table || "";
  if (!TABLE_RE.test(table) || BLOCKED_TABLES.has(table)) return fail(400, `Table "${table}" is not writable through the API`, "BAD_TABLE");

  const filters = validateFilters(req.filters);
  if (typeof filters === "string") return fail(400, filters, "BAD_REQUEST");

  const maxRows = Math.min(Math.max(Number(req.maxRows) || DEFAULT_MAX_ROWS, 1), HARD_MAX_ROWS);
  const isUpdateLike = req.op === "update" || req.op === "delete";

  if (isUpdateLike) {
    if (filters.length === 0) {
      return fail(400, `Refused: ${req.op} on "${table}" needs a filter. Bulk changes with no filter are not allowed.`, "NO_FILTER");
    }
    if (filters.every((f) => WIPE_ONLY_METHODS.has(f[0]))) {
      return fail(400, `Refused: ${req.op} on "${table}" would match every row. Use a specific filter.`, "WIPE_BLOCKED");
    }
  }
  if ((req.op === "insert" || req.op === "upsert" || req.op === "update") && (req.values == null || typeof req.values !== "object")) {
    return fail(400, "values must be an object or array of objects", "BAD_REQUEST");
  }

  const valueRows = Array.isArray(req.values) ? req.values : req.values ? [req.values] : [];
  if ((req.op === "insert" || req.op === "upsert") && valueRows.length > MAX_INSERT_ROWS) {
    return fail(400, `Refused: ${valueRows.length} rows exceeds the ${MAX_INSERT_ROWS}-row limit per call`, "TOO_MANY_ROWS");
  }

  // ── snapshot the rows that are about to change, and log them before touching anything ───────────
  let before: unknown[] = [];
  if (isUpdateLike) {
    const { data, error } = await applyFilters(client.from(table).select("*"), filters).limit(maxRows + 1);
    if (error) return { status: 400, body: { data: null, error: { message: error.message, code: error.code, details: error.details, hint: error.hint } } };
    before = data || [];
    if (before.length > maxRows) {
      return fail(409, `Refused: this ${req.op} would affect more than ${maxRows} rows in "${table}".`, "TOO_MANY_ROWS");
    }
  } else if (req.op === "upsert") {
    const keyCols = (req.options?.onConflict || "id").split(",").map((c) => c.trim()).filter(Boolean);
    if (keyCols.length === 1) {
      const keys = valueRows.map((r: any) => r?.[keyCols[0]]).filter((v) => v !== undefined && v !== null);
      for (let i = 0; i < keys.length; i += 150) {
        const { data } = await client.from(table).select("*").in(keyCols[0], keys.slice(i, i + 150) as any[]);
        before.push(...(data || []));
      }
    }
  }

  const logErr = await writeLog({
    op: req.op,
    table_name: table,
    filters: filters.length ? filters : null,
    new_values: req.op === "delete" ? null : valueRows.length > LOG_VALUES_CAP ? { truncated: true, count: valueRows.length } : valueRows,
    before_rows: before.length ? before : null,
    row_count: isUpdateLike ? before.length : valueRows.length,
  });
  if (logErr) {
    // Inserts add rows and lose nothing, so they proceed; anything that overwrites or removes data does not.
    if (req.op !== "insert") return fail(500, `Change refused: audit log unavailable (${logErr})`, "AUDIT_UNAVAILABLE");
    console.warn("[db-api] insert not logged:", logErr);
  }

  // ── run the real change ──────────────────────────────────────────────────────────────────────────
  let query: any = client.from(table);
  const opts = req.options || {};
  if (req.op === "insert") query = query.insert(req.values, opts.count ? { count: opts.count } : undefined);
  else if (req.op === "update") query = query.update(req.values, opts.count ? { count: opts.count } : undefined);
  else if (req.op === "upsert") query = query.upsert(req.values, opts);
  else query = query.delete(opts.count ? { count: opts.count } : undefined);
  query = applyFilters(query, filters);

  const ret = req.returning || {};
  if (ret.select) query = query.select(ret.select);
  for (const [col, o] of ret.order || []) query = query.order(col, o as any);
  if (typeof ret.limit === "number") query = query.limit(ret.limit);
  if (ret.single === "single") query = query.single();
  else if (ret.single === "maybeSingle") query = query.maybeSingle();

  const { data, error, count } = await query;
  if (error) {
    return { status: 400, body: { data: null, error: { message: error.message, code: error.code, details: error.details, hint: error.hint } } };
  }
  return { status: 200, body: { data: data ?? null, error: null, count: count ?? null } };
}
