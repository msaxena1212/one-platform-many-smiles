/**
 * Client for the write API. `apiDb.from(table).insert|update|upsert|delete(...)` has the same chaining
 * and `{ data, error }` result shape as the Supabase client, but the change is sent to `POST /api/db`,
 * where it is validated, size-limited and logged (with the previous row contents) before it is applied.
 *
 * Reads keep using `supabase` directly. Never throws: failures come back as `{ data: null, error }`.
 */
import { supabase } from "./supabase";

export type ApiDbError = { message: string; code?: string; details?: string | null; hint?: string | null };
export type ApiDbResult<T = any> = { data: T | null; error: ApiDbError | null; count?: number | null; status?: number };

const FILTER_METHODS = [
  "eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike", "is", "in", "contains", "containedBy",
  "overlaps", "match", "not", "or", "filter", "textSearch",
] as const;

type Op = "insert" | "update" | "upsert" | "delete";

class ApiQuery implements PromiseLike<ApiDbResult> {
  private filters: [string, ...unknown[]][] = [];
  private returning: {
    select?: string | null;
    single?: "single" | "maybeSingle" | null;
    order?: [string, Record<string, unknown> | undefined][];
    limit?: number;
  } = {};
  private maxRows?: number;
  private promise?: Promise<ApiDbResult>;

  constructor(
    private table: string,
    private op: Op,
    private values?: unknown,
    private options?: Record<string, unknown>,
  ) {}

  select(columns = "*") {
    this.returning.select = columns;
    return this;
  }
  single() {
    this.returning.single = "single";
    return this;
  }
  maybeSingle() {
    this.returning.single = "maybeSingle";
    return this;
  }
  order(column: string, opts?: Record<string, unknown>) {
    (this.returning.order ||= []).push([column, opts]);
    return this;
  }
  limit(n: number) {
    this.returning.limit = n;
    return this;
  }
  /** Raise the per-call row cap (server enforces a hard maximum). */
  allowRows(n: number) {
    this.maxRows = n;
    return this;
  }

  private exec(): Promise<ApiDbResult> {
    if (!this.promise) this.promise = this.run();
    return this.promise;
  }

  private async run(): Promise<ApiDbResult> {
    if (typeof window === "undefined") {
      return { data: null, error: { message: "Write API is only available in the browser", code: "NO_BROWSER" } };
    }
    try {
      let token = "";
      try {
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token || "";
      } catch {
        // no session: the server falls back to the anon role and RLS decides
      }
      const res = await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          op: this.op,
          table: this.table,
          values: this.values,
          options: this.options,
          filters: this.filters,
          returning: this.returning,
          maxRows: this.maxRows,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!body) return { data: null, error: { message: `Write API returned HTTP ${res.status}`, code: "BAD_RESPONSE" }, status: res.status };
      return { data: body.data ?? null, error: body.error ?? null, count: body.count ?? null, status: res.status };
    } catch (err: any) {
      return { data: null, error: { message: err?.message || "Write API request failed", code: "NETWORK" } };
    }
  }

  then<R1 = ApiDbResult, R2 = never>(
    onfulfilled?: ((value: ApiDbResult) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: any) => R2 | PromiseLike<R2>) | null,
  ): Promise<R1 | R2> {
    return this.exec().then(onfulfilled, onrejected);
  }
  catch<R = never>(onrejected?: ((reason: any) => R | PromiseLike<R>) | null) {
    return this.exec().catch(onrejected);
  }
  finally(onfinally?: (() => void) | null) {
    return this.exec().finally(onfinally);
  }
}

// Filter methods (eq, in, or, ...) are added generically; their exact arguments are the Supabase ones.
for (const m of FILTER_METHODS) {
  (ApiQuery.prototype as any)[m] = function (this: any, ...args: unknown[]) {
    this.filters.push([m, ...args]);
    return this;
  };
}

type FilterMethods = { [K in (typeof FILTER_METHODS)[number]]: (...args: any[]) => ApiBuilder };
export type ApiBuilder = ApiQuery & FilterMethods;

export const apiDb = {
  from(table: string) {
    return {
      insert: (values: unknown, options?: { count?: "exact" | "planned" | "estimated" }) =>
        new ApiQuery(table, "insert", values, options) as ApiBuilder,
      update: (values: unknown, options?: { count?: "exact" | "planned" | "estimated" }) =>
        new ApiQuery(table, "update", values, options) as ApiBuilder,
      upsert: (
        values: unknown,
        options?: { onConflict?: string; ignoreDuplicates?: boolean; count?: "exact" | "planned" | "estimated" },
      ) => new ApiQuery(table, "upsert", values, options) as ApiBuilder,
      delete: (options?: { count?: "exact" | "planned" | "estimated" }) =>
        new ApiQuery(table, "delete", undefined, options) as ApiBuilder,
    };
  },
  /** Restore the rows stored in a change-log entry (undo of an update / delete). */
  async restore(logId: string): Promise<ApiDbResult> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token || "";
    const res = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ op: "restore", logId }),
    });
    const body = await res.json().catch(() => null);
    return body ? { data: body.data ?? null, error: body.error ?? null, status: res.status } : { data: null, error: { message: `HTTP ${res.status}` } };
  },
};
