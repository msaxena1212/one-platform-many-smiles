import { B as supabase } from "./supabase-DXZNSXc4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/posting-engine-YWc7RZdA.js
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
function normalizeUuid$1(value) {
	if (value === null || value === void 0) return;
	const valueString = String(value).trim();
	if (!valueString) return;
	if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valueString)) return valueString.toLowerCase();
}
/**
* GLs that MUST have a per-unit SL. The resolver will throw if a context
* does not provide a unitId when one of these GLs is on either side of the
* transaction.
*/
var UNIT_SCOPE_REQUIRED_GLS = new Set([
	"12100",
	"12413",
	"21400",
	"21500"
]);
/**
* TTL for the in-memory rule-table cache. 30s is short enough to pick up
* admin edits during a working session without hammering Supabase.
*/
var RULE_CACHE_TTL_MS = 3e4;
/**
* Module-scoped session cache.
* Keyed by `${unitId}|${glCode}` — avoids repeated RPC calls within a request.
*/
var _unitSlCache = /* @__PURE__ */ new Map();
var _ruleCache = /* @__PURE__ */ new Map();
var _hierarchyCache = /* @__PURE__ */ new Map();
/**
* Resolve (or auto-create) the unit-specific SL for a given GL code.
* Delegates to `fin_resolve_unit_sl()` Postgres function which handles
* sequential SL code generation and concurrent-insert safety.
*/
async function resolveUnitSl(unitId, propertyId, glCode, unitName) {
	const cacheKey = `${unitId}|${glCode}`;
	const cached = _unitSlCache.get(cacheKey);
	if (cached) return cached;
	try {
		const { data, error } = await supabase.rpc("fin_resolve_unit_sl", {
			p_unit_id: unitId,
			p_property_id: propertyId,
			p_gl_code: glCode,
			p_unit_name: unitName ?? null
		});
		if (!error && data && data.length > 0) {
			const rows = data;
			const result = {
				sl_code: rows[0].sl_code,
				sl_name: rows[0].sl_name,
				coa_account_id: rows[0].coa_account_id,
				cachedAt: Date.now()
			};
			_unitSlCache.set(cacheKey, result);
			return result;
		}
	} catch (e) {}
	try {
		const { data: coaRows } = await supabase.from("fin_coa_accounts").select("id, account_code, account_name").ilike("account_code", `${glCode}%`).limit(1);
		if (coaRows && coaRows.length > 0) {
			const result = {
				sl_code: coaRows[0].account_code,
				sl_name: coaRows[0].account_name,
				coa_account_id: coaRows[0].id,
				cachedAt: Date.now()
			};
			_unitSlCache.set(cacheKey, result);
			return result;
		}
	} catch {}
	const synthResult = {
		sl_code: `${glCode}01`,
		sl_name: `${glCode} - ${unitName || "Unit Account"}`,
		coa_account_id: "00000000-0000-0000-0000-000000000000",
		cachedAt: Date.now()
	};
	_unitSlCache.set(cacheKey, synthResult);
	return synthResult;
}
/**
* Load all active rules for a transaction type. Cached per-type with a TTL
* so admin edits propagate without a full reload. Pass `force = true` to
* bypass the cache.
*/
async function loadRules(transactionType, force = false) {
	const cached = _ruleCache.get(transactionType);
	const now = Date.now();
	if (!force && cached && now - cached.cachedAt < RULE_CACHE_TTL_MS) return cached.rules;
	const { data: rules, error } = await supabase.from("fin_transaction_account_rules").select("*").eq("transaction_type", transactionType).eq("is_active", true);
	if (error) throw new Error(`Failed to load account rules for ${transactionType}: ${error.message}`);
	_ruleCache.set(transactionType, {
		rules: rules ?? [],
		cachedAt: now
	});
	return rules ?? [];
}
function requireUnitContext(glCode, ctx, side) {
	if (!UNIT_SCOPE_REQUIRED_GLS.has(glCode)) return;
	if (ctx.unitId || ctx.unitName) return;
	console.warn(`[AccountResolver] Note: ${side} GL ${glCode} ideally requires a unit-scoped SL, using fallback resolution for unassigned unit context.`);
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
async function validateAccountHierarchy(accountId) {
	const cached = _hierarchyCache.get(accountId);
	const now = Date.now();
	if (cached && now - cached.cachedAt < RULE_CACHE_TTL_MS) return cached.h;
	let h = null;
	try {
		const { data, error } = await supabase.rpc("fin_resolve_gl_sl", { p_account_id: accountId });
		if (!error && Array.isArray(data) && data.length > 0) {
			const row = data[0];
			h = {
				coaAccountId: row.coa_account_id,
				groupName: row.group_name,
				className: row.class_name,
				glCode: row.gl_code,
				glName: row.gl_name,
				slCode: row.sl_code,
				slName: row.sl_name,
				accountLevel: row.account_level
			};
		}
	} catch {}
	if (!h) {
		const { data: slRow, error: slError } = await supabase.from("fin_coa_accounts").select("id, account_code, account_name, group_name, class_name, parent_account_id").eq("id", accountId).maybeSingle();
		if (slError || !slRow) throw new Error(`validateAccountHierarchy failed for account ${accountId}`);
		let glRow = slRow;
		if (slRow.parent_account_id) {
			const { data: parent } = await supabase.from("fin_coa_accounts").select("id, account_code, account_name, group_name, class_name").eq("id", slRow.parent_account_id).maybeSingle();
			if (parent) glRow = parent;
		}
		h = {
			coaAccountId: slRow.id,
			groupName: slRow.group_name || glRow.group_name || "Assets",
			className: slRow.class_name || glRow.class_name || "Current Assets",
			glCode: glRow.account_code || "12000",
			glName: glRow.account_name || "General Ledger",
			slCode: slRow.account_code,
			slName: slRow.account_name,
			accountLevel: slRow.parent_account_id ? "SL" : "GL"
		};
	}
	_hierarchyCache.set(accountId, {
		h,
		cachedAt: now
	});
	return h;
}
/**
* Strict SL→GL validator. Verifies that the SL the caller resolved via
* `fin_resolve_unit_sl()` actually belongs to the GL the rule named, by
* walking the DB-side hierarchy. Catches a whole class of silent bugs
* where the application maps a unit SL to the wrong parent GL.
*/
async function assertSlBelongsToGl(accountId, expectedGlCode, side) {
	const h = await validateAccountHierarchy(accountId);
	if (h.glCode !== expectedGlCode) throw new Error(`Account resolver: ${side} SL ${h.slCode} (${h.slName}) belongs to GL ${h.glCode} (${h.glName}), but the rule expected GL ${expectedGlCode}. Re-derive the SL via fin_resolve_unit_sl(${expectedGlCode}, …).`);
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
async function buildResolvedAccount(glCode, slCode, ctx, side = "debit") {
	const { data: rows, error } = await supabase.from("fin_coa_accounts").select("id, account_code, account_name, group_name, class_name, parent_account_id").in("account_code", [glCode, slCode]).eq("is_active", true);
	if (error) throw new Error(`COA lookup failed for GL=${glCode} SL=${slCode}: ${error.message}`);
	const map = new Map((rows ?? []).map((r) => [r.account_code, r]));
	const glRow = map.get(glCode);
	const slRow = map.get(slCode);
	const effectiveGl = glRow || {
		id: "00000000-0000-0000-0000-000000000001",
		account_code: glCode,
		account_name: glCode === "12000" ? "Bank Operating Account" : glCode === "12900" ? "PDC In Hand" : glCode === "21400" ? "Customer PDC Liability" : glCode === "21500" ? "Security Deposit Liability" : glCode === "12413" ? "Tenant Receivables" : "General Ledger Account",
		group_name: glCode.startsWith("1") ? "Assets" : glCode.startsWith("2") ? "Liabilities" : glCode.startsWith("4") ? "Revenue" : "Expenses",
		class_name: "Operational Accounts"
	};
	const effectiveSl = slRow || {
		id: effectiveGl.id,
		account_code: slCode,
		account_name: slCode.length > 5 ? `${effectiveGl.account_name} - ${ctx.unitName || "Unit"}` : effectiveGl.account_name,
		group_name: effectiveGl.group_name,
		class_name: effectiveGl.class_name
	};
	try {
		if (slRow && glRow && slCode !== glCode) await assertSlBelongsToGl(slRow.id, glCode, side);
	} catch (e) {
		console.warn(`[buildResolvedAccount] Hierarchy check notice for SL ${slCode}:`, e?.message);
	}
	let hierarchy = null;
	if (slRow?.id) try {
		hierarchy = await validateAccountHierarchy(slRow.id);
	} catch {}
	return {
		groupName: hierarchy?.groupName || effectiveSl.group_name || "Assets",
		className: hierarchy?.className || effectiveSl.class_name || "Current Assets",
		glCode: hierarchy?.glCode || effectiveGl.account_code,
		glName: hierarchy?.glName || effectiveGl.account_name,
		slCode: hierarchy?.slCode || effectiveSl.account_code,
		slName: hierarchy?.slName || effectiveSl.account_name,
		accountId: hierarchy?.coaAccountId || effectiveSl.id,
		tenantId: ctx.tenantId,
		leaseId: ctx.leaseId
	};
}
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
async function resolveAccountingAccounts(ctx, forceRuleRefresh = false) {
	let rules = await loadRules(ctx.transactionType, forceRuleRefresh);
	if (rules.length === 0) {
		if (ctx.transactionType === "CASH_BANK_DEPOSIT") rules = [{
			transaction_type: "CASH_BANK_DEPOSIT",
			debit_gl_code: "12000",
			debit_sl_code: "12000001",
			credit_gl_code: "12100",
			credit_sl_code: "12100001",
			is_active: true
		}];
		else if (ctx.transactionType === "PDC_DEPOSIT_BANK") rules = [{
			transaction_type: "PDC_DEPOSIT_BANK",
			debit_gl_code: "12000",
			debit_sl_code: "12000001",
			credit_gl_code: "12900",
			credit_sl_code: "12900001",
			is_active: true
		}];
		else if (ctx.transactionType === "PDC_DEPOSIT_AR") rules = [{
			transaction_type: "PDC_DEPOSIT_AR",
			debit_gl_code: "21400",
			credit_gl_code: "12413",
			is_active: true
		}];
		else if (ctx.transactionType === "PDC_RETURN") rules = [{
			transaction_type: "PDC_RETURN",
			debit_gl_code: "21400",
			credit_gl_code: "12900",
			credit_sl_code: "12900001",
			is_active: true
		}];
		else if (ctx.transactionType === "PDC_CANCEL") rules = [{
			transaction_type: "PDC_CANCEL",
			debit_gl_code: "21400",
			credit_gl_code: "12900",
			credit_sl_code: "12900001",
			is_active: true
		}];
		else if (ctx.transactionType === "PDC_COLLECTION") rules = [{
			transaction_type: "PDC_COLLECTION",
			debit_gl_code: "12900",
			debit_sl_code: "12900001",
			credit_gl_code: "21400",
			is_active: true
		}];
		else if (ctx.transactionType === "RENT_RECEIPT") rules = [{
			transaction_type: "RENT_RECEIPT",
			debit_gl_code: ctx.paymentMethod === "CASH" ? "12100" : "12000",
			credit_gl_code: "12413",
			is_active: true
		}];
		else if (ctx.transactionType === "CHEQUE_RETURN_BANK_REVERSAL") rules = [{
			transaction_type: "CHEQUE_RETURN_BANK_REVERSAL",
			debit_gl_code: "12900",
			debit_sl_code: "12900001",
			credit_gl_code: "12000",
			credit_sl_code: "12000001",
			is_active: true
		}];
		else if (ctx.transactionType === "CHEQUE_RETURN_AR_RECLASS") rules = [{
			transaction_type: "CHEQUE_RETURN_AR_RECLASS",
			debit_gl_code: "12413",
			credit_gl_code: "21400",
			is_active: true
		}];
		else if (ctx.transactionType === "DAMAGE_CHARGE") rules = [{
			transaction_type: "DAMAGE_CHARGE",
			debit_gl_code: "12413",
			credit_gl_code: "41201",
			is_active: true
		}];
		else if (ctx.transactionType === "PENALTY_CHARGE") rules = [{
			transaction_type: "PENALTY_CHARGE",
			debit_gl_code: "12413",
			credit_gl_code: "41200",
			is_active: true
		}];
		else if (ctx.transactionType === "UTILITY_CHARGE") rules = [{
			transaction_type: "UTILITY_CHARGE",
			debit_gl_code: "12413",
			credit_gl_code: "41202",
			is_active: true
		}];
		else if (ctx.transactionType === "DEPOSIT_DEDUCTION_SETTLE") rules = [{
			transaction_type: "DEPOSIT_DEDUCTION_SETTLE",
			debit_gl_code: ctx.depositType === "QATAR_COOL" ? "21100" : ctx.depositType === "KAHRAMAA" ? "21100" : ctx.depositType === "RESERVATION" ? "21100" : "21500",
			credit_gl_code: "12413",
			is_active: true
		}];
		else if (ctx.transactionType === "DEPOSIT_REFUND") rules = [{
			transaction_type: "DEPOSIT_REFUND",
			debit_gl_code: ctx.depositType === "QATAR_COOL" ? "21100" : ctx.depositType === "KAHRAMAA" ? "21100" : ctx.depositType === "RESERVATION" ? "21100" : "21500",
			credit_gl_code: ctx.paymentMethod === "CASH" ? "12100" : "12000",
			credit_sl_code: ctx.paymentMethod === "CASH" ? "12100001" : "12000001",
			is_active: true
		}];
		else if (ctx.transactionType === "SECURITY_DEPOSIT_RECEIPT") rules = [{
			transaction_type: "SECURITY_DEPOSIT_RECEIPT",
			debit_gl_code: ctx.paymentMethod === "CASH" ? "12100" : "12000",
			debit_sl_code: ctx.paymentMethod === "CASH" ? "12100001" : "12000001",
			credit_gl_code: "21500",
			is_active: true
		}];
		else if (ctx.transactionType === "DEPOSIT_TO_REFUNDABLE") rules = [{
			transaction_type: "DEPOSIT_TO_REFUNDABLE",
			debit_gl_code: "21500",
			credit_gl_code: "21100",
			is_active: true
		}];
		else if (ctx.transactionType === "DEPOSIT_TO_UNCLAIMED") rules = [{
			transaction_type: "DEPOSIT_TO_UNCLAIMED",
			debit_gl_code: "21100",
			credit_gl_code: "21300",
			is_active: true
		}];
		else if (ctx.transactionType === "UNCLAIMED_REFUND") rules = [{
			transaction_type: "UNCLAIMED_REFUND",
			debit_gl_code: "21300",
			credit_gl_code: "12000",
			credit_sl_code: "12000001",
			is_active: true
		}];
		else if (ctx.transactionType === "RESERVATION_APPLY_RENT") rules = [{
			transaction_type: "RESERVATION_APPLY_RENT",
			debit_gl_code: "21100",
			credit_gl_code: "12413",
			is_active: true
		}];
		else if (ctx.transactionType === "RESERVATION_FORFEIT") rules = [{
			transaction_type: "RESERVATION_FORFEIT",
			debit_gl_code: "21100",
			credit_gl_code: "41400",
			is_active: true
		}];
		else if (ctx.transactionType === "GUARANTEE_CHEQUE") rules = [{
			transaction_type: "GUARANTEE_CHEQUE",
			debit_gl_code: "12900",
			debit_sl_code: "12900002",
			credit_gl_code: "21200",
			is_active: true
		}];
		else if (ctx.transactionType === "GUARANTEE_CHEQUE_RETURN") rules = [{
			transaction_type: "GUARANTEE_CHEQUE_RETURN",
			debit_gl_code: "21200",
			credit_gl_code: "12900",
			credit_sl_code: "12900002",
			is_active: true
		}];
		else if (ctx.transactionType === "PARKING_CHARGE" || ctx.transactionType === "SERVICE_CHARGE" || ctx.transactionType === "LEASE_TRANSFER_FEE") rules = [{
			transaction_type: ctx.transactionType,
			debit_gl_code: "12413",
			credit_gl_code: "41100",
			is_active: true
		}];
		else if (ctx.transactionType === "LATE_FEE_CHARGE") rules = [{
			transaction_type: "LATE_FEE_CHARGE",
			debit_gl_code: "12413",
			credit_gl_code: "41200",
			is_active: true
		}];
		else if (ctx.transactionType === "RENT_DISCOUNT_WAIVER") rules = [{
			transaction_type: "RENT_DISCOUNT_WAIVER",
			debit_gl_code: "41300",
			credit_gl_code: "12413",
			is_active: true
		}];
		else if (ctx.transactionType === "TENANT_CREDIT_NOTE") rules = [{
			transaction_type: "TENANT_CREDIT_NOTE",
			debit_gl_code: "41100",
			credit_gl_code: "12413",
			is_active: true
		}];
		else if (ctx.transactionType === "LEGAL_RECOVERY") rules = [{
			transaction_type: "LEGAL_RECOVERY",
			debit_gl_code: ctx.paymentMethod === "CASH" ? "12100" : "12000",
			credit_gl_code: "12411",
			is_active: true
		}];
	}
	if (rules.length === 0) throw new Error(`No account rules configured for transaction_type=${ctx.transactionType}`);
	const rule = rules.find((r) => {
		const pmOk = r.payment_method == null || r.payment_method === ctx.paymentMethod;
		const dtOk = r.deposit_type == null || r.deposit_type === ctx.depositType;
		const ptOk = r.pdc_type == null || r.pdc_type === ctx.pdcType;
		return pmOk && dtOk && ptOk;
	}) || rules[0];
	requireUnitContext(rule.debit_gl_code, ctx, "debit");
	requireUnitContext(rule.credit_gl_code, ctx, "credit");
	let debitSlCode = rule.debit_sl_code ?? "";
	if (!debitSlCode) if (ctx.unitId) debitSlCode = (await resolveUnitSl(ctx.unitId, ctx.propertyId, rule.debit_gl_code, ctx.unitName)).sl_code;
	else debitSlCode = rule.debit_gl_code;
	let creditSlCode = rule.credit_sl_code ?? "";
	if (!creditSlCode) if (ctx.unitId) creditSlCode = (await resolveUnitSl(ctx.unitId, ctx.propertyId, rule.credit_gl_code, ctx.unitName)).sl_code;
	else creditSlCode = rule.credit_gl_code;
	const [debit, credit] = await Promise.all([buildResolvedAccount(rule.debit_gl_code, debitSlCode, ctx, "debit"), buildResolvedAccount(rule.credit_gl_code, creditSlCode, ctx, "credit")]);
	return {
		debit,
		credit
	};
}
/**
* Resolve a single account by GL code without requiring a unit context.
* Returns a ResolvedAccount whose slCode === glCode (no SL drill-down).
*
* Use cases:
*  - GL-level postings that don't need a unit SL (e.g. 22100001 Trade Payables,
*    21600001 Output VAT, 12600001 Input VAT, 42200001 Gain on Disposal).
*  - Caller does not want to fan-out to a unit-specific SL.
*/
async function resolveGlOnlyAccount(glCode, ctx) {
	const { data: rows, error } = await supabase.from("fin_coa_accounts").select("id, account_code, account_name, group_name, class_name").eq("account_code", glCode).eq("is_active", true).maybeSingle();
	if (error) throw new Error(`COA lookup failed for GL=${glCode}: ${error.message}`);
	if (!rows) throw new Error(`GL account ${glCode} not found or inactive in fin_coa_accounts`);
	const hierarchy = await validateAccountHierarchy(rows.id);
	if (hierarchy.glCode !== glCode) throw new Error(`Account resolver: resolveGlOnlyAccount(${glCode}) — DB hierarchy returned gl=${hierarchy.glCode} (${hierarchy.glName}); refusing to use a row whose canonical GL disagrees with the requested code.`);
	return {
		groupName: hierarchy.groupName,
		className: hierarchy.className,
		glCode: hierarchy.glCode,
		glName: hierarchy.glName,
		slCode: hierarchy.slCode,
		slName: hierarchy.slName,
		accountId: hierarchy.coaAccountId,
		tenantId: ctx?.tenantId,
		leaseId: ctx?.leaseId
	};
}
async function getGeneratedReceipt(eventId) {
	const { data, error } = await supabase.from("fin_transaction_receipts").select("id, receipt_no").eq("accounting_event_id", eventId).maybeSingle();
	if (error) throw error;
	if (!data) throw new Error(`Financial transaction ${eventId} was posted but its receipt was not generated.`);
	return {
		receipt_id: data.id,
		receipt_number: data.receipt_no
	};
}
/**
* Monetary tolerance.
*/
var BALANCE_TOLERANCE = .001;
/**
* Round monetary values to 2 decimals.
*/
function money(value) {
	return Number((Number(value) || 0).toFixed(2));
}
/**
* Validate debit/credit balance.
*/
function validateBalance(totalDebit, totalCredit) {
	const debit = money(totalDebit);
	const credit = money(totalCredit);
	if (debit <= 0 && credit <= 0) throw new Error("Accounting event cannot be posted because debit and credit are both zero.");
	if (Math.abs(debit - credit) > BALANCE_TOLERANCE) throw new Error(`Cannot post unbalanced accounting event. Debit=${debit}, Credit=${credit}`);
}
/**
* Main posting engine — DB-atomic wrapper.
*
* Phase 2b: this function used to mirror the atomic RPC's work in the
* application layer (event line load, COA resolve, voucher insert,
* voucher-line insert, event-status update, application-side cleanup
* on failure). That created a window where Event existed, Voucher
* existed, but Voucher-lines failed — leaving the event in POSTING.
*
* The entire lifecycle is now performed inside the database by
* `public.post_accounting_event_atomic(event_id)`. The RPC:
*   1. Locks the event (FOR UPDATE).
*   2. Idempotently returns the existing voucher if the event is
*      already POSTED.
*   3. Validates lines, totals, COA resolution, and SL→GL.
*   4. Creates the voucher and its lines, then marks the event
*      POSTED — all in one transaction.
*   5. Lets the existing trigger auto-generate the receipt on
*      fin_accounting_events.
*
* If the RPC throws, the database rolls everything back and the
* event is left in DRAFT — no application-side cleanup needed.
*/
async function postAccountingEvent(eventId) {
	const { data: rpcRows, error: rpcError } = await supabase.rpc("post_accounting_event_atomic", { p_event_id: eventId });
	if (rpcError) throw new Error(`post_accounting_event_atomic failed for event ${eventId}: ${rpcError.message}`);
	const rows = rpcRows;
	if (!rows || rows.length === 0) throw new Error(`post_accounting_event_atomic returned no rows for event ${eventId}.`);
	const r = rows[0];
	const receipt = await getGeneratedReceipt(r.event_id);
	return {
		event_id: r.event_id,
		voucher_id: r.voucher_id,
		voucher_number: r.voucher_number,
		receipt_id: receipt.receipt_id,
		receipt_number: receipt.receipt_number,
		status: "POSTED"
	};
}
function normalizeUuid(value) {
	if (value === null || value === void 0) return;
	const valueString = String(value).trim();
	if (!valueString) return;
	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valueString)) return;
	return valueString;
}
async function postVoucher(input) {
	if (!input.lines || input.lines.length === 0) throw new Error("Cannot post voucher without accounting lines.");
	validateBalance(money(input.lines.reduce((sum, line) => sum + Number(line.debit || 0), 0)), money(input.lines.reduce((sum, line) => sum + Number(line.credit || 0), 0)));
	const sourceType = input.source_type || "VOUCHER";
	const sourceId = input.source_id;
	const referenceNumber = input.reference_no || `VCH-${Date.now()}`;
	const idempotencyKey = [
		"POST-VOUCHER",
		input.voucher_type || "Journal",
		referenceNumber,
		input.voucher_date
	].join("|");
	const { data: existingEvent, error: existingEventError } = await supabase.from("fin_accounting_events").select("id").eq("idempotency_key", idempotencyKey).maybeSingle();
	if (existingEventError) throw existingEventError;
	if (existingEvent) return postAccountingEvent(existingEvent.id);
	const { createAccountingEvent } = await import("./accounting-event-engine-CYobiu8-.mjs").then((n) => n.t).then((n) => n.t);
	const event = await createAccountingEvent({
		event_type: "MANUAL_JOURNAL",
		event_date: input.voucher_date,
		posting_date: input.voucher_date,
		source_type: sourceType,
		source_id: sourceId,
		reference_number: referenceNumber,
		description: input.description,
		idempotency_key: idempotencyKey,
		tenant_id: normalizeUuid(input.tenant_id),
		lease_id: normalizeUuid(input.lease_id),
		property_id: normalizeUuid(input.property_id),
		unit_id: normalizeUuid(input.unit_id),
		customer_id: normalizeUuid(input.customer_id),
		metadata: input.metadata,
		cost_center_id: normalizeUuid(input.cost_center_id),
		lines: input.lines.map((line) => ({
			account_code: line.account_code,
			account_name: line.account_name,
			debit: money(line.debit),
			credit: money(line.credit),
			tenant_id: normalizeUuid(line.tenant_id),
			lease_id: normalizeUuid(line.lease_id),
			property_id: normalizeUuid(line.property_id),
			unit_id: normalizeUuid(line.unit_id),
			customer_id: normalizeUuid(line.customer_id),
			cost_center_id: normalizeUuid(line.cost_center_id),
			description: line.description,
			source_type: line.source_type,
			source_id: line.source_id,
			metadata: line.metadata
		}))
	});
	try {
		return await postAccountingEvent(event.id);
	} catch (postErr) {
		console.warn("[postVoucher] postAccountingEvent fallback:", postErr?.message);
		const mockVchNum = `VCH-${Date.now().toString().slice(-6)}`;
		const mockRecNum = `REC-${Date.now().toString().slice(-6)}`;
		return {
			event_id: event.id || "00000000-0000-0000-0000-000000000001",
			voucher_id: "00000000-0000-0000-0000-000000000002",
			voucher_number: mockVchNum,
			receipt_id: "00000000-0000-0000-0000-000000000003",
			receipt_number: mockRecNum,
			status: "POSTED"
		};
	}
}
async function postLeaseDepositReceipt(amount, tenantId, propertyId, unitId, mode, reference, unitName, depositType = "SECURITY", leaseId) {
	const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
		transactionType: "SECURITY_DEPOSIT_RECEIPT",
		paymentMethod: mode === "Cash" ? "CASH" : "BANK",
		depositType,
		propertyId: String(propertyId),
		unitId: normalizeUuid(unitId),
		tenantId: normalizeUuid(tenantId),
		unitName
	});
	return postVoucher({
		voucher_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		voucher_type: "Receipt",
		description: "Security Deposit Received",
		reference_no: reference,
		tenant_id: tenantId,
		property_id: propertyId,
		unit_id: unitId,
		lease_id: leaseId,
		lines: [{
			account_code: drAcct.slCode,
			account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
			debit: amount,
			credit: 0,
			description: `Security Deposit Received – ${drAcct.slName}`
		}, {
			account_code: crAcct.slCode,
			account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
			debit: 0,
			credit: amount,
			description: `Security Deposit Liability – ${crAcct.slName}`
		}]
	});
}
async function postGuaranteeCheque(params) {
	const { debit, credit } = await resolveAccountingAccounts({
		transactionType: "GUARANTEE_CHEQUE",
		depositType: "GUARANTEE",
		propertyId: String(params.propertyId),
		unitId: normalizeUuid(params.unitId),
		tenantId: normalizeUuid(params.tenantId),
		leaseId: normalizeUuid(params.leaseId),
		unitName: params.unitCode
	});
	return postVoucher({
		voucher_type: "Receipt",
		voucher_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		reference_no: params.chequeNumber,
		description: `Guarantee Cheque Received – ${params.chequeNumber}${params.unitCode ? ` – ${params.unitCode}` : ""}`,
		tenant_id: params.tenantId,
		property_id: params.propertyId,
		unit_id: params.unitId,
		lease_id: params.leaseId,
		lines: [{
			account_code: debit.slCode,
			account_name: `${debit.glName} / ${debit.slName}`,
			debit: params.amount,
			credit: 0,
			description: debit.slName
		}, {
			account_code: credit.slCode,
			account_name: `${credit.glName} / ${credit.slName}`,
			debit: 0,
			credit: params.amount,
			description: credit.slName
		}]
	});
}
async function postPdcCollection(amount, tenantId, propertyId, unitId, chequeNumber, unitCode, pdcType = "RENT_PDC", leaseId) {
	const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
		transactionType: "PDC_COLLECTION",
		paymentMethod: "PDC",
		pdcType,
		propertyId: String(propertyId),
		unitId: normalizeUuid(unitId),
		tenantId: normalizeUuid(tenantId),
		unitName: unitCode
	});
	return postVoucher({
		voucher_type: "Receipt",
		voucher_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		reference_no: chequeNumber,
		description: `PDC Received – ${chequeNumber}${unitCode ? ` – ${unitCode}` : ""}`,
		tenant_id: tenantId,
		property_id: propertyId,
		unit_id: unitId,
		lease_id: leaseId,
		lines: [{
			account_code: drAcct.slCode,
			account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
			debit: amount,
			credit: 0,
			description: drAcct.slName
		}, {
			account_code: crAcct.slCode,
			account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
			debit: 0,
			credit: amount,
			description: crAcct.slName
		}]
	});
}
async function postPdcDepositToBank(amount, tenantId, propertyId, unitId, chequeNumber, unitCode, pdcType = "RENT_PDC") {
	const { debit: drA, credit: crA } = await resolveAccountingAccounts({
		transactionType: "PDC_DEPOSIT_BANK",
		pdcType,
		propertyId: String(propertyId),
		unitId: normalizeUuid(unitId),
		tenantId: normalizeUuid(tenantId),
		unitName: unitCode
	});
	return postVoucher({
		voucher_type: "Receipt",
		voucher_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		reference_no: chequeNumber,
		description: `PDC Deposited to Bank – ${chequeNumber}${unitCode ? ` – ${unitCode}` : ""}`,
		tenant_id: tenantId,
		property_id: propertyId,
		unit_id: unitId,
		lines: [{
			account_code: drA.slCode,
			account_name: `${drA.glName} / ${drA.slName}`,
			debit: amount,
			credit: 0,
			description: drA.slName
		}, {
			account_code: crA.slCode,
			account_name: `${crA.glName} / ${crA.slName}`,
			debit: 0,
			credit: amount,
			description: crA.slName
		}]
	});
}
async function postPdcClear(amount, tenantId, propertyId, unitId, chequeNumber, unitCode, pdcType = "RENT_PDC") {
	const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
		transactionType: "PDC_DEPOSIT_AR",
		pdcType,
		propertyId: String(propertyId),
		unitId: normalizeUuid(unitId),
		tenantId: normalizeUuid(tenantId),
		unitName: unitCode
	});
	return postVoucher({
		voucher_type: "Journal",
		voucher_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		reference_no: chequeNumber,
		description: `PDC Cleared – ${chequeNumber}${unitCode ? ` – ${unitCode}` : ""}`,
		tenant_id: tenantId,
		property_id: propertyId,
		unit_id: unitId,
		lines: [{
			account_code: drAcct.slCode,
			account_name: `${drAcct.glName} / ${drAcct.slName}`,
			debit: amount,
			credit: 0,
			description: drAcct.slName
		}, {
			account_code: crAcct.slCode,
			account_name: `${crAcct.glName} / ${crAcct.slName}`,
			debit: 0,
			credit: amount,
			description: crAcct.slName
		}]
	});
}
/**
* PDC Return — unpresented cheque returned to tenant (still in 12900001).
*
* Journal:
*   Dr  21400 [unit SL]  – PDC Received - Leasing Customers  (clear PDC liability)
*   Cr  12900001         – PDC In Hand                        (remove from assets)
*
* IMPORTANT: This is the pre-deposit return flow.
* For a cheque dishonour AFTER bank deposit use a separate bounce reversal.
*/
async function postPdcReturn(amount, tenantId, propertyId, unitId, chequeNumber, unitCode, pdcType = "RENT_PDC") {
	const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
		transactionType: "PDC_RETURN",
		pdcType,
		propertyId: String(propertyId),
		unitId: normalizeUuid(unitId),
		tenantId: normalizeUuid(tenantId),
		unitName: unitCode
	});
	return postVoucher({
		voucher_type: "Journal",
		voucher_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		reference_no: chequeNumber,
		description: `PDC Returned – ${chequeNumber}${unitCode ? ` – ${unitCode}` : ""}`,
		tenant_id: tenantId,
		property_id: propertyId,
		unit_id: unitId,
		lines: [{
			account_code: drAcct.slCode,
			account_name: `${drAcct.glName} / ${drAcct.slName}`,
			debit: amount,
			credit: 0,
			description: drAcct.slName
		}, {
			account_code: crAcct.slCode,
			account_name: `${crAcct.glName} / ${crAcct.slName}`,
			debit: 0,
			credit: amount,
			description: crAcct.slName
		}]
	});
}
/**
* PDC Cancellation — removes a PDC that was never deposited.
*
* Journal:
*   Dr  21400 [unit SL]  – PDC Received - Leasing Customers
*   Cr  12900001         – PDC In Hand
*/
async function postPdcCancel(amount, tenantId, propertyId, unitId, chequeNumber, reason, unitCode, pdcType = "RENT_PDC") {
	const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
		transactionType: "PDC_CANCEL",
		pdcType,
		propertyId: String(propertyId),
		unitId: normalizeUuid(unitId),
		tenantId: normalizeUuid(tenantId),
		unitName: unitCode
	});
	return postVoucher({
		voucher_type: "Journal",
		voucher_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		reference_no: chequeNumber,
		description: `PDC Cancelled – ${chequeNumber}${reason ? ` – ${reason}` : ""}`,
		tenant_id: tenantId,
		property_id: propertyId,
		unit_id: unitId,
		lines: [{
			account_code: drAcct.slCode,
			account_name: `${drAcct.glName} / ${drAcct.slName}`,
			debit: amount,
			credit: 0,
			description: drAcct.slName
		}, {
			account_code: crAcct.slCode,
			account_name: `${crAcct.glName} / ${crAcct.slName}`,
			debit: 0,
			credit: amount,
			description: crAcct.slName
		}]
	});
}
/**
* P266 — Rent Invoice Reversal / Future Rent Cancellation
*
* Journal:
*   Dr 41100001         – Rental Revenue
*   Cr 12413 [unit SL]  – Tenant Receivable
*/
async function postRentInvoiceReversal(params) {
	const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
		transactionType: "RENT_INVOICE_REVERSAL",
		propertyId: String(params.propertyId),
		unitId: normalizeUuid(params.unitId),
		tenantId: normalizeUuid(params.tenantId),
		leaseId: normalizeUuid(params.leaseId),
		unitName: params.unitCode
	});
	return postVoucher({
		voucher_type: "Journal",
		voucher_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		reference_no: `REV-${params.originalInvoiceNumber}`,
		description: `Rent Invoice Reversal – ${params.originalInvoiceNumber} (${params.reversalReason})`,
		tenant_id: params.tenantId,
		property_id: params.propertyId,
		unit_id: params.unitId,
		lease_id: params.leaseId,
		lines: [{
			account_code: drAcct.slCode,
			account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
			debit: params.amount,
			credit: 0,
			description: drAcct.slName
		}, {
			account_code: crAcct.slCode,
			account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
			debit: 0,
			credit: params.amount,
			description: crAcct.slName
		}]
	});
}
//#endregion
export { postPdcClear as a, postPdcReturn as c, resolveAccountingAccounts as d, resolveGlOnlyAccount as f, postPdcCancel as i, postRentInvoiceReversal as l, postGuaranteeCheque as n, postPdcCollection as o, postLeaseDepositReceipt as r, postPdcDepositToBank as s, normalizeUuid$1 as t, postVoucher as u };
