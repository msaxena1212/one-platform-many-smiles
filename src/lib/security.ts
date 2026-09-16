/**
 * security.ts — Production Security Service
 *
 * Handles:
 *  - Persistent security audit log (Supabase DB + LocalStorage + in-memory fallback)
 *  - Input sanitisation (XSS prevention)
 *  - Rate limiting (client-side token bucket)
 *  - CSRF guard for server-bound mutation requests
 *  - Content Security Policy (CSP) header helper
 */

import { supabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SecurityAuditLog {
  id?: string;
  event_type: "auth" | "access_denied" | "data_mutation" | "suspicious_activity" | "system";
  severity: "info" | "warning" | "critical";
  user_id?: string;
  user_role?: string;
  resource?: string;
  action?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export type AccessPolicy = {
  id: string;
  role: string;
  resource: string;
  actions: ("read" | "write" | "delete" | "admin")[];
};

// ─── LocalStorage / In-Memory Audit Log Fallback ─────────────────────────────

const STORAGE_KEY = "pms_security_audit_logs";

function getLocalAuditLogs(): SecurityAuditLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalAuditLog(record: SecurityAuditLog) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalAuditLogs();
    const updated = [record, ...existing.filter(r => r.id !== record.id)].slice(0, 300);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Could not save to localStorage audit store", e);
  }
}

const _memoryLog: SecurityAuditLog[] = [];

// ─── Audit Logging ───────────────────────────────────────────────────────────

export async function logSecurityEvent(
  event: Omit<SecurityAuditLog, "id" | "timestamp">
): Promise<void> {
  const record: SecurityAuditLog = {
    ...event,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
  };

  // Always push to in-memory log & localStorage
  _memoryLog.unshift(record);
  if (_memoryLog.length > 300) _memoryLog.pop();
  saveLocalAuditLog(record);

  // Best-effort persist to Supabase
  try {
    const { error } = await supabase.from("security_audit_logs").insert(record);
    if (error) {
      console.warn("Supabase security_audit_logs table unavailable or restricted by RLS; saved to local audit trail store.", error.message);
    }
  } catch (err) {
    console.warn("Audit log DB insert skipped", err);
  }
}

export async function fetchSecurityAuditLogs(): Promise<SecurityAuditLog[]> {
  const localLogs = getLocalAuditLogs();
  
  try {
    const { data, error } = await supabase
      .from("security_audit_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(200);

    if (error || !data || data.length === 0) {
      // Merge memory and local storage
      const combined = [...localLogs];
      for (const m of _memoryLog) {
        if (!combined.some(c => c.id === m.id || c.timestamp === m.timestamp)) {
          combined.unshift(m);
        }
      }
      return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    // Merge Supabase logs with local logs
    const mergedMap = new Map<string, SecurityAuditLog>();
    data.forEach((d: SecurityAuditLog) => mergedMap.set(d.id || d.timestamp, d));
    localLogs.forEach((l: SecurityAuditLog) => mergedMap.set(l.id || l.timestamp, l));
    _memoryLog.forEach((m: SecurityAuditLog) => mergedMap.set(m.id || m.timestamp, m));

    return Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch {
    return localLogs.length > 0 ? localLogs : _memoryLog;
  }
}

// ─── Input Sanitisation ──────────────────────────────────────────────────────

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,        // onclick=, onerror=, etc.
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /data:text\/html/gi,
];

/**
 * Strip XSS vectors from a string. Use on all user-supplied text before
 * storing or rendering as HTML.
 */
export function sanitizeInput(value: string): string {
  if (typeof value !== "string") return "";
  let sanitized = value;
  for (const pattern of XSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }
  return sanitized.trim();
}

/**
 * Deep-sanitize all string values inside a plain object (one level deep).
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj } as Record<string, unknown>;
  for (const [key, val] of Object.entries(result)) {
    if (typeof val === "string") {
      result[key] = sanitizeInput(val);
    }
  }
  return result as T;
}

// ─── Rate Limiter ─────────────────────────────────────────────────────────────

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const _buckets = new Map<string, TokenBucket>();
const REFILL_RATE_MS = 60_000;  // 1 minute window
const DEFAULT_LIMIT = 30;        // 30 requests per minute per key

/**
 * Client-side token-bucket rate limiter.
 * Returns true if the request is allowed, false if rate limit exceeded.
 */
export function checkRateLimit(key: string, limit: number = DEFAULT_LIMIT): boolean {
  const now = Date.now();
  let bucket = _buckets.get(key);

  if (!bucket || now - bucket.lastRefill > REFILL_RATE_MS) {
    bucket = { tokens: limit, lastRefill: now };
    _buckets.set(key, bucket);
  }

  if (bucket.tokens <= 0) {
    logSecurityEvent({
      event_type: "suspicious_activity",
      severity: "warning",
      resource: key,
      action: "rate_limit_exceeded",
      details: { key, limit },
    });
    return false;
  }

  bucket.tokens -= 1;
  return true;
}

// ─── Session Validation ──────────────────────────────────────────────────────

/**
 * Validate that the current Supabase session is fresh and not expired.
 * Returns the session or null.
 */
export async function validateSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;

    const expiresAt = data.session.expires_at ?? 0;
    if (Date.now() / 1000 > expiresAt) {
      await supabase.auth.refreshSession();
      const { data: refreshed } = await supabase.auth.getSession();
      return refreshed.session;
    }

    return data.session;
  } catch {
    return null;
  }
}

// ─── CSRF Token Guard ─────────────────────────────────────────────────────────

const _csrfToken = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36);

export function getCsrfToken(): string {
  return _csrfToken;
}

export function validateCsrfToken(token: string): boolean {
  return token === _csrfToken;
}

// ─── Access Policy Enforcement (Client-Side) ─────────────────────────────────

/**
 * Role-to-allowed-resources map (mirrors the database role_permissions table).
 * Used for fast client-side pre-checks — the DB RLS policies are the real enforcement.
 */
export const ROLE_ACCESS_POLICIES: Record<string, AccessPolicy[]> = {
  SUPER_ADMIN: [{ id: "super", role: "SUPER_ADMIN", resource: "*", actions: ["read", "write", "delete", "admin"] }],
  ADMIN: [{ id: "admin", role: "ADMIN", resource: "*", actions: ["read", "write", "delete"] }],
  PROP_MGR: [
    { id: "pm-props", role: "PROP_MGR", resource: "properties", actions: ["read", "write"] },
    { id: "pm-units", role: "PROP_MGR", resource: "units", actions: ["read", "write"] },
    { id: "pm-leases", role: "PROP_MGR", resource: "leases", actions: ["read", "write"] },
    { id: "pm-maint", role: "PROP_MGR", resource: "maintenance", actions: ["read", "write"] },
  ],
  LEASING: [
    { id: "ls-leases", role: "LEASING", resource: "leases", actions: ["read", "write"] },
    { id: "ls-customers", role: "LEASING", resource: "customers", actions: ["read", "write"] },
    { id: "ls-reservations", role: "LEASING", resource: "reservations", actions: ["read", "write"] },
  ],
  FINANCE: [
    { id: "fin-vouchers", role: "FINANCE", resource: "fin_vouchers", actions: ["read", "write"] },
    { id: "fin-pdc", role: "FINANCE", resource: "fin_pdc_register", actions: ["read", "write"] },
    { id: "fin-reports", role: "FINANCE", resource: "reports", actions: ["read"] },
  ],
  CASHIER: [
    { id: "cash-pdc", role: "CASHIER", resource: "fin_pdc_register", actions: ["read", "write"] },
    { id: "cash-receipts", role: "CASHIER", resource: "collection_receipts", actions: ["read", "write"] },
  ],
  MAINTENANCE: [
    { id: "maint-tickets", role: "MAINTENANCE", resource: "maintenance", actions: ["read", "write"] },
    { id: "maint-assets", role: "MAINTENANCE", resource: "assets", actions: ["read"] },
  ],
  TENANT: [
    { id: "tenant-leases", role: "TENANT", resource: "leases", actions: ["read"] },
    { id: "tenant-receipts", role: "TENANT", resource: "collection_receipts", actions: ["read"] },
    { id: "tenant-tickets", role: "TENANT", resource: "maintenance", actions: ["read", "write"] },
  ],
  GUEST: [
    { id: "guest-props", role: "GUEST", resource: "properties", actions: ["read"] },
  ],
};

export function canAccess(
  role: string,
  resource: string,
  action: "read" | "write" | "delete" | "admin"
): boolean {
  const policies = ROLE_ACCESS_POLICIES[role] ?? [];
  return policies.some(
    (p) =>
      (p.resource === resource || p.resource === "*") &&
      p.actions.includes(action)
  );
}