/**
 * Finance Account Resolver
 *
 * Single source of truth for GL + SL resolution in the PMS finance engine.
 *
 * Resolution chain:
 *
 *   Business Event
 *       ↓
 *   AccountResolutionContext
 *       ↓
 *   fin_transaction_account_rules  (transaction type + payment method + deposit/PDC type)
 *       ↓
 *   fin_coa_accounts               (GL: group_name, class_name, account_name)
 *       ↓
 *   fin_unit_sl_accounts           (SL: auto-created per unit+GL if not yet mapped)
 *       ↓
 *   ResolvedAccountPair            (full Group→Class→GL→SL for both debit and credit)
 *
 * IMPORTANT:
 *   No operational module should hard-code GL or SL codes.
 *   All account resolution must flow through resolveAccountingAccounts().
 *
 * Hardening (Phase 2 — 2026-08-27):
 *   - tenantId/leaseId are now part of every ResolvedAccount so event lines
 *     can always carry the lease/tenant context.
 *   - requireUnitContext(glCode) throws if a unit-SL GL is called without
 *     a unitId. Prevents the GL-fallback silent path.
 *   - Rule-table cache is invalidated by TTL so admin edits propagate
 *     without requiring a full page reload.
 */

import { supabase } from '../supabase';

export function normalizeUuid(
  value: string | number | null | undefined,
): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  const valueString = String(value).trim();
  if (!valueString) {
    return undefined;
  }
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(valueString)) {
    return valueString.toLowerCase();
  }
  return undefined;
}

// ── Transaction Types ─────────────────────────────────────────────────────────

export type TransactionType =
  | 'RENT_INVOICE'
  | 'RENT_RECEIPT'
  | 'RENT_INVOICE_REVERSAL'
  | 'PDC_COLLECTION'
  | 'PDC_DEPOSIT_BANK'
  | 'PDC_DEPOSIT_AR'
  | 'PDC_RETURN'
  | 'PDC_CANCEL'
  | 'SECURITY_DEPOSIT_RECEIPT'
  | 'DEPOSIT_TO_REFUNDABLE'
  | 'DEPOSIT_DEDUCTION_SETTLE'
  | 'DEPOSIT_REFUND'
  | 'DEPOSIT_TO_UNCLAIMED'
  | 'UNCLAIMED_REFUND'
  | 'DAMAGE_CHARGE'
  | 'PENALTY_CHARGE'
  | 'UTILITY_CHARGE'
  | 'RESERVATION_APPLY_RENT'
  | 'RESERVATION_FORFEIT'
  | 'GUARANTEE_CHEQUE'
  | 'GUARANTEE_CHEQUE_RETURN'
  | 'VENDOR_INVOICE'
  | 'VENDOR_PAYMENT'
  | 'VENDOR_ADVANCE'
  | 'VENDOR_ADVANCE_APPLY'
  | 'VENDOR_CREDIT_NOTE'
  | 'VENDOR_RETENTION'
  | 'PARKING_CHARGE'
  | 'SERVICE_CHARGE'
  | 'LATE_FEE_CHARGE'
  | 'LEASE_TRANSFER_FEE'
  | 'RENT_DISCOUNT_WAIVER'
  | 'TENANT_CREDIT_NOTE'
  | 'PM_FEE_RECOGNITION'
  | 'OWNER_REMITTANCE'
  | 'OWNER_FUNDS_EXPENSE'
  | 'OWNER_ADVANCE_REPAYMENT'
  | 'INTER_PROPERTY_TRANSFER'
  | 'ASSET_PURCHASE'
  | 'CWIP_PROJECT_INVOICE'
  | 'CWIP_CAPITALIZATION'
  | 'ASSET_DEPRECIATION'
  | 'ASSET_DISPOSAL'
  | 'ASSET_DISPOSAL_GAIN'
  | 'ASSET_DISPOSAL_LOSS'
  | 'DISHONOUR_CHARGE_COMPANY'
  | 'DISHONOUR_CHARGE_TENANT'
  | 'CASH_BANK_DEPOSIT'
  | 'CHEQUE_RETURN_BANK_REVERSAL'
  | 'CHEQUE_RETURN_AR_RECLASS'
  | 'VAT_OUTPUT_INVOICE'
  | 'VAT_INPUT_VENDOR'
  | 'UTILITY_ACCRUAL'
  | 'UTILITY_ACCRUAL_REVERSE'
  | 'UTILITY_RECOVERY_TENANT'
  | 'LEGAL_ESCALATION'
  | 'LEGAL_RECOVERY';

export type PaymentMethod =
  | 'CASH'
  | 'BANK'
  | 'PDC'
  | 'CHEQUE';

export type DepositType =
  | 'SECURITY'     // Unit security deposit (21500)
  | 'GUARANTEE'    // Guarantee cheque (21200)
  | 'QATAR_COOL'   // Qatar Cool utility deposit (21100003)
  | 'KAHRAMAA'     // Kahramaa utility deposit (21100004)
  | 'SERVICE_FEE'  // Service fee deposit (21100005)
  | 'RESERVATION'; // Reservation advance (21100001)

export type PdcType =
  | 'RENT_PDC'     // PDC for rent — uses 12900001 / 21400
  | 'DEPOSIT_PDC'; // PDC for deposit — uses 12900002 / 21500

// ── Input / Output Types ──────────────────────────────────────────────────────

export type AccountResolutionContext = {
  transactionType: TransactionType;
  /** Property UUID — always required */
  propertyId: string;
  /** Unit UUID — required for unit-specific SLs (12413, 21400, 21500, 12100) */
  unitId?: string;
  /** Tenant UUID — propagated to accounting event */
  tenantId?: string;
  /** Lease UUID — propagated to accounting event */
  leaseId?: string;
  /** Cash / Bank / PDC — used to select the correct rule */
  paymentMethod?: PaymentMethod;
  /** Type of deposit being collected or transferred */
  depositType?: DepositType;
  /** RENT_PDC vs DEPOSIT_PDC — selects 12900001 vs 12900002 */
  pdcType?: PdcType;
  /**
   * Human-readable unit name (e.g. "Flat 15") included in auto-generated SL names.
   * Cosmetic only — does not affect code generation.
   */
  unitName?: string;
};

export type ResolvedAccount = {
  /** COA Group (e.g. "Assets") */
  groupName: string;
  /** COA Class (e.g. "Current Assets") */
  className: string;
  /** GL code (e.g. "12000") */
  glCode: string;
  /** GL name (e.g. "Bank") */
  glName: string;
  /** SL code (e.g. "12000001" or "21400007") */
  slCode: string;
  /** SL name (e.g. "Bank" or "PDC Received – Flat 15") */
  slName: string;
  /** UUID of the SL row in fin_coa_accounts — use this as account_id in event lines */
  accountId: string;
  /** Tenant UUID — sourced from the resolution context, propagated to event lines */
  tenantId?: string;
  /** Lease UUID — sourced from the resolution context, propagated to event lines */
  leaseId?: string;
};

export type ResolvedAccountPair = {
  debit: ResolvedAccount;
  credit: ResolvedAccount;
};

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * GLs that MUST have a per-unit SL. The resolver will throw if a context
 * does not provide a unitId when one of these GLs is on either side of the
 * transaction.
 */
export const UNIT_SCOPE_REQUIRED_GLS = new Set<string>([
  '12100', // Cash
  '12413', // Tenant Receivables
  '21400', // PDC Received - Leasing Customers
  '21500', // // Deposits - Leasing Customers
]);

/**
 * TTL for the in-memory rule-table cache. 30s is short enough to pick up
 * admin edits during a working session without hammering Supabase.
 */
const RULE_CACHE_TTL_MS = 30_000;

// ── Internal Helpers ──────────────────────────────────────────────────────────

type UnitSlCacheEntry = {
  sl_code: string;
  sl_name: string;
  coa_account_id: string;
  /** epoch ms — used for the in-memory rule cache TTL */
  cachedAt: number;
};

/**
 * Module-scoped session cache.
 * Keyed by `${unitId}|${glCode}` — avoids repeated RPC calls within a request.
 */
const _unitSlCache = new Map<string, UnitSlCacheEntry>();

type RuleCacheEntry = {
  rules: any[];
  cachedAt: number;
};
const _ruleCache = new Map<TransactionType, RuleCacheEntry>();

/**
 * Canonical hierarchy shape returned by the DB function
 * `public.fin_resolve_gl_sl(uuid)`. The application uses this to verify
 * that the GL/SL the caller passed matches the live hierarchy before
 * persisting any accounting line.
 */
export type CanonicalHierarchy = {
  coaAccountId: string;
  groupName:    string;
  className:    string;
  glCode:       string;
  glName:       string;
  slCode:       string;
  slName:       string;
  accountLevel: 'GROUP' | 'CLASS' | 'GL' | 'SL';
};

type HierarchyCacheEntry = {
  h:        CanonicalHierarchy;
  cachedAt: number;
};
const _hierarchyCache = new Map<string, HierarchyCacheEntry>();

/**
 * Resolve (or auto-create) the unit-specific SL for a given GL code.
 * Delegates to `fin_resolve_unit_sl()` Postgres function which handles
 * sequential SL code generation and concurrent-insert safety.
 */
async function resolveUnitSl(
  unitId: string,
  propertyId: string,
  glCode: string,
  unitName?: string,
): Promise<UnitSlCacheEntry> {
  const cacheKey = `${unitId}|${glCode}`;
  const cached = _unitSlCache.get(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase.rpc('fin_resolve_unit_sl', {
    p_unit_id:     unitId,
    p_property_id: propertyId,
    p_gl_code:     glCode,
    p_unit_name:   unitName ?? null,
  });

  if (error) {
    throw new Error(
      `fin_resolve_unit_sl failed for GL ${glCode} / unit ${unitId}: ${error.message}`,
    );
  }

  const rows = data as Array<{
    sl_code: string;
    sl_name: string;
    coa_account_id: string;
  }>;

  if (!rows || rows.length === 0) {
    throw new Error(
      `fin_resolve_unit_sl returned no rows for GL ${glCode} / unit ${unitId}`,
    );
  }

  const result: UnitSlCacheEntry = {
    sl_code:        rows[0].sl_code,
    sl_name:        rows[0].sl_name,
    coa_account_id: rows[0].coa_account_id,
    cachedAt:       Date.now(),
  };

  _unitSlCache.set(cacheKey, result);
  return result;
}

/**
 * Load all active rules for a transaction type. Cached per-type with a TTL
 * so admin edits propagate without a full reload. Pass `force = true` to
 * bypass the cache.
 */
async function loadRules(
  transactionType: TransactionType,
  force = false,
): Promise<any[]> {
  const cached = _ruleCache.get(transactionType);
  const now = Date.now();
  if (!force && cached && now - cached.cachedAt < RULE_CACHE_TTL_MS) {
    return cached.rules;
  }

  const { data: rules, error } = await supabase
    .from('fin_transaction_account_rules')
    .select('*')
    .eq('transaction_type', transactionType)
    .eq('is_active', true);

  if (error) {
    throw new Error(
      `Failed to load account rules for ${transactionType}: ${error.message}`,
    );
  }

  _ruleCache.set(transactionType, { rules: rules ?? [], cachedAt: now });
  return rules ?? [];
}

/**
 * Throw if a unit-SL GL is present on either side and the context lacks
 * a unitId. This guards against the GL-fallback silent path.
 */
function requireUnitContext(
  glCode: string,
  ctx: AccountResolutionContext,
  side: 'debit' | 'credit',
): void {
  if (!UNIT_SCOPE_REQUIRED_GLS.has(glCode)) return;
  if (ctx.unitId) return;
  throw new Error(
    `Account resolver: ${side} GL ${glCode} requires a unit-scoped SL, ` +
    `but AccountResolutionContext.unitId was not provided. ` +
    `Add unitId to the calling site (e.g. lease.unit_id).`,
  );
}

/**
 * Fetch the canonical hierarchy (group → class → GL → SL) for a COA
 * account id by calling the DB function `fin_resolve_gl_sl()`. The
 * hierarchy is the single source of truth for the Finance Master
 * requirement that every accounting line carries all six tiers.
 *
 * The result is cached per-accountId for the request so repeated
 * resolutions within the same voucher don't hit the DB.
 *
 * Throws if the function returns an empty result (the DB function
 * itself already raises on inactive / missing rows).
 */
export async function validateAccountHierarchy(
  accountId: string,
): Promise<CanonicalHierarchy> {
  const cached = _hierarchyCache.get(accountId);
  const now = Date.now();
  if (cached && now - cached.cachedAt < RULE_CACHE_TTL_MS) {
    return cached.h;
  }

  const { data, error } = await supabase.rpc('fin_resolve_gl_sl', {
    p_account_id: accountId,
  });

  if (error) {
    throw new Error(
      `fin_resolve_gl_sl failed for account ${accountId}: ${error.message}`,
    );
  }

  const rows = data as Array<{
    coa_account_id: string;
    group_name:     string;
    class_name:     string;
    gl_code:        string;
    gl_name:        string;
    sl_code:        string;
    sl_name:        string;
    account_level:  'GROUP' | 'CLASS' | 'GL' | 'SL';
  }>;

  if (!rows || rows.length === 0) {
    throw new Error(
      `fin_resolve_gl_sl returned no rows for account ${accountId}`,
    );
  }

  const h: CanonicalHierarchy = {
    coaAccountId: rows[0].coa_account_id,
    groupName:    rows[0].group_name,
    className:    rows[0].class_name,
    glCode:       rows[0].gl_code,
    glName:       rows[0].gl_name,
    slCode:       rows[0].sl_code,
    slName:       rows[0].sl_name,
    accountLevel: rows[0].account_level,
  };

  // Master requirement: every tier must be present.
  if (!h.groupName || !h.className || !h.glCode || !h.glName || !h.slCode || !h.slName) {
    throw new Error(
      `Account ${accountId} (${h.slCode}) has an incomplete hierarchy: ` +
      `group=${h.groupName || '<missing>'}, class=${h.className || '<missing>'}, ` +
      `gl=${h.glCode || '<missing>'} (${h.glName || '<missing>'}), ` +
      `sl=${h.slCode || '<missing>'} (${h.slName || '<missing>'}).`,
    );
  }

  _hierarchyCache.set(accountId, { h, cachedAt: now });
  return h;
}

/**
 * Strict SL→GL validator. Verifies that the SL the caller resolved via
 * `fin_resolve_unit_sl()` actually belongs to the GL the rule named, by
 * walking the DB-side hierarchy. Catches a whole class of silent bugs
 * where the application maps a unit SL to the wrong parent GL.
 */
export async function assertSlBelongsToGl(
  accountId: string,
  expectedGlCode: string,
  side: 'debit' | 'credit',
): Promise<CanonicalHierarchy> {
  const h = await validateAccountHierarchy(accountId);
  if (h.glCode !== expectedGlCode) {
    throw new Error(
      `Account resolver: ${side} SL ${h.slCode} (${h.slName}) belongs to GL ` +
      `${h.glCode} (${h.glName}), but the rule expected GL ${expectedGlCode}. ` +
      `Re-derive the SL via fin_resolve_unit_sl(${expectedGlCode}, …).`,
    );
  }
  return h;
}

/**
 * Build a ResolvedAccount by fetching the GL account (for group/class context)
 * and the SL account (for the actual posting code and UUID).
 *
 * Phase 2b: the SL is additionally verified against the canonical DB
 * hierarchy via fin_resolve_gl_sl() to guarantee the SL really belongs
 * to the named GL. The DB is the authority — the application can no
 * longer "trust" whatever hierarchy fields the SL row happens to carry.
 */
async function buildResolvedAccount(
  glCode: string,
  slCode: string,
  ctx: AccountResolutionContext,
  side: 'debit' | 'credit' = 'debit',
): Promise<ResolvedAccount> {
  const { data: rows, error } = await supabase
    .from('fin_coa_accounts')
    .select('id, account_code, account_name, group_name, class_name, parent_account_id')
    .in('account_code', [glCode, slCode])
    .eq('is_active', true);

  if (error) {
    throw new Error(`COA lookup failed for GL=${glCode} SL=${slCode}: ${error.message}`);
  }

  const map = new Map((rows ?? []).map((r) => [r.account_code, r]));

  const glRow = map.get(glCode);
  const slRow = map.get(slCode);

  if (!glRow) {
    throw new Error(`GL account ${glCode} not found or inactive in fin_coa_accounts`);
  }
  if (!slRow) {
    throw new Error(`SL account ${slCode} not found or inactive in fin_coa_accounts`);
  }

  // If the SL is a unit SL (different code from the GL), enforce the
  // SL→GL relationship via the DB hierarchy. For fixed SLs the codes
  // will be different too, so the same check applies.
  if (slCode !== glCode) {
    await assertSlBelongsToGl(slRow.id, glCode, side);
  }

  // Pull the canonical hierarchy from the DB so the resolved account
  // always reflects the live group/class labels, not whatever happens
  // to be denormalised on the SL row.
  const hierarchy = await validateAccountHierarchy(slRow.id);

  return {
    groupName: hierarchy.groupName,
    className: hierarchy.className,
    glCode:    hierarchy.glCode,
    glName:    hierarchy.glName,
    slCode:    hierarchy.slCode,
    slName:    hierarchy.slName,
    accountId: hierarchy.coaAccountId,
    tenantId:  ctx.tenantId,
    leaseId:   ctx.leaseId,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Resolve the full accounting hierarchy (Group → Class → GL → SL) for both
 * the debit and credit sides of a business transaction.
 *
 * Usage:
 * ```ts
 * const { debit, credit } = await resolveAccountingAccounts({
 *   transactionType: 'PDC_COLLECTION',
 *   pdcType:         'RENT_PDC',
 *   propertyId:      lease.property_id,
 *   unitId:          lease.unit_id,
 *   tenantId:        lease.tenant_id,
 *   leaseId:         lease.id,
 *   unitName:        'Flat 15',
 * });
 *
 * // debit.slCode  → '12900001' (PDC In Hand)
 * // credit.slCode → '21400007' (PDC Received – Flat 15)
 * // debit.tenantId, debit.leaseId propagated automatically.
 * ```
 *
 * Set `forceRuleRefresh = true` to bypass the in-memory rule cache.
 */
export async function resolveAccountingAccounts(
  ctx: AccountResolutionContext,
  forceRuleRefresh = false,
): Promise<ResolvedAccountPair> {

  // 1. Load all active rules for this transaction type
  const rules = await loadRules(ctx.transactionType, forceRuleRefresh);

  if (rules.length === 0) {
    throw new Error(
      `No account rules configured for transaction_type=${ctx.transactionType}`,
    );
  }

  // 2. Find the best-matching rule
  //    Specificity: a non-null column value must match the context exactly.
  //    A null column value in the rule acts as a wildcard.
  const rule = rules.find((r) => {
    const pmOk = r.payment_method == null || r.payment_method === ctx.paymentMethod;
    const dtOk = r.deposit_type   == null || r.deposit_type   === ctx.depositType;
    const ptOk = r.pdc_type       == null || r.pdc_type       === ctx.pdcType;
    return pmOk && dtOk && ptOk;
  });

  if (!rule) {
    throw new Error(
      `No account rule matched: type=${ctx.transactionType}, ` +
      `payment=${ctx.paymentMethod ?? 'any'}, ` +
      `deposit=${ctx.depositType ?? 'any'}, ` +
      `pdc=${ctx.pdcType ?? 'any'}`,
    );
  }

  // 3. Guard — unit-SL GLs must have a unitId in the context.
  requireUnitContext(rule.debit_gl_code,  ctx, 'debit');
  requireUnitContext(rule.credit_gl_code, ctx, 'credit');

  // 4. Resolve debit SL
  let debitSlCode: string = rule.debit_sl_code ?? '';
  if (!debitSlCode) {
    if (ctx.unitId) {
      const sl = await resolveUnitSl(
        ctx.unitId, ctx.propertyId, rule.debit_gl_code, ctx.unitName,
      );
      debitSlCode = sl.sl_code;
    } else {
      // No unit context — fall back to GL code itself as the account code
      // (only reachable if requireUnitContext passed, i.e. GL does not
      // require a unit SL).
      debitSlCode = rule.debit_gl_code;
    }
  }

  // 5. Resolve credit SL
  let creditSlCode: string = rule.credit_sl_code ?? '';
  if (!creditSlCode) {
    if (ctx.unitId) {
      const sl = await resolveUnitSl(
        ctx.unitId, ctx.propertyId, rule.credit_gl_code, ctx.unitName,
      );
      creditSlCode = sl.sl_code;
    } else {
      creditSlCode = rule.credit_gl_code;
    }
  }

  // 6. Fetch full GL+SL account details (and thread tenant/lease through)
  //    Phase 2b: the `side` argument lets the SL→GL guard name the
  //    failing side in its error message.
  const [debit, credit] = await Promise.all([
    buildResolvedAccount(rule.debit_gl_code,  debitSlCode,  ctx, 'debit'),
    buildResolvedAccount(rule.credit_gl_code, creditSlCode, ctx, 'credit'),
  ]);

  return { debit, credit };
}

/**
 * Utility — clears the session SL cache AND the rule cache.
 * Useful in tests, after admin edits, or when unit names change.
 */
export function clearAccountResolverCache(): void {
  _unitSlCache.clear();
  _ruleCache.clear();
  _hierarchyCache.clear();
}

/**
 * Utility — force the next resolveAccountingAccounts() to bypass the rule
 * cache for the given transaction type. Convenience wrapper used by
 * admin-style flows that want to confirm a fresh rule read.
 */
export function invalidateRules(transactionType: TransactionType): void {
  _ruleCache.delete(transactionType);
}

// ── Public API — GL-only lookups (used by Tax / Asset / Utility engines) ─────

/**
 * Resolve a single account by GL code without requiring a unit context.
 * Returns a ResolvedAccount whose slCode === glCode (no SL drill-down).
 *
 * Use cases:
 *  - GL-level postings that don't need a unit SL (e.g. 22100001 Trade Payables,
 *    21600001 Output VAT, 12600001 Input VAT, 42200001 Gain on Disposal).
 *  - Caller does not want to fan-out to a unit-specific SL.
 */
export async function resolveGlOnlyAccount(
  glCode: string,
  ctx?: Pick<AccountResolutionContext, 'tenantId' | 'leaseId'>,
): Promise<ResolvedAccount> {
  const { data: rows, error } = await supabase
    .from('fin_coa_accounts')
    .select('id, account_code, account_name, group_name, class_name')
    .eq('account_code', glCode)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error(`COA lookup failed for GL=${glCode}: ${error.message}`);
  }
  if (!rows) {
    throw new Error(`GL account ${glCode} not found or inactive in fin_coa_accounts`);
  }

  // Cross-check the live hierarchy. This catches a denormalised
  // group_name on the GL row that disagrees with the parent chain.
  const hierarchy = await validateAccountHierarchy(rows.id);
  if (hierarchy.glCode !== glCode) {
    throw new Error(
      `Account resolver: resolveGlOnlyAccount(${glCode}) — DB hierarchy ` +
      `returned gl=${hierarchy.glCode} (${hierarchy.glName}); refusing to use ` +
      `a row whose canonical GL disagrees with the requested code.`,
    );
  }

  return {
    groupName: hierarchy.groupName,
    className: hierarchy.className,
    glCode:    hierarchy.glCode,
    glName:    hierarchy.glName,
    slCode:    hierarchy.slCode,
    slName:    hierarchy.slName,
    accountId: hierarchy.coaAccountId,
    tenantId:  ctx?.tenantId,
    leaseId:   ctx?.leaseId,
  };
}

/**
 * Resolve two accounts at once for voucher lines that don't need unit SLs
 * (e.g. fixed-asset purchase, VAT output line, depreciation entry).
 */
export async function resolveGlOnlyPair(
  debitGl: string,
  creditGl: string,
  ctx?: Pick<AccountResolutionContext, 'tenantId' | 'leaseId'>,
): Promise<ResolvedAccountPair> {
  const [debit, credit] = await Promise.all([
    resolveGlOnlyAccount(debitGl, ctx),
    resolveGlOnlyAccount(creditGl, ctx),
  ]);
  return { debit, credit };
}
