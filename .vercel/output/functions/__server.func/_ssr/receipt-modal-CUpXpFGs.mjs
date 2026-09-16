import { i as __toESM } from "../_runtime.mjs";
import { B as supabase } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as ShieldCheck, Ht as CreditCard, Rt as Download, W as Printer, c as User, hn as Building, kt as FileText } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { n as DialogContent, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { a as FinDepositsApi, c as FinPdcRegisterApi } from "./supabase-finance-B6nDq-G1.mjs";
import { a as postPdcClear, c as postPdcReturn, d as resolveAccountingAccounts, f as resolveGlOnlyAccount, i as postPdcCancel, o as postPdcCollection, r as postLeaseDepositReceipt, s as postPdcDepositToBank, u as postVoucher } from "./posting-engine-YWc7RZdA.mjs";
import { O as View, _ as Page, o as Document, w as Text } from "../_libs/@react-pdf/image+[...].mjs";
import { n as pdf, t as StyleSheet } from "../_libs/react-pdf__renderer.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/depositService-Duw6nljH.js
/**
* Thrown when a PDC lifecycle operation is attempted in an invalid state.
* `code` lets the UI map to a workflow ('Use dishonour flow' instead of
* 'PDC return') without parsing the message string.
*/
var PdcStateError = class extends Error {
	code;
	pdcId;
	chequeNumber;
	currentStatus;
	constructor(args) {
		super(args.message ?? `PDC ${args.chequeNumber ?? args.pdcId} cannot proceed in state '${args.currentStatus ?? "unknown"}'.`);
		this.name = "PdcStateError";
		this.code = args.code;
		this.pdcId = args.pdcId;
		this.chequeNumber = args.chequeNumber;
		this.currentStatus = args.currentStatus;
	}
};
/** Fetch amount, tenant_id, property_id, unit_id for a PDC row from any source */
async function resolveGlContext(pdcId, chequeNo) {
	try {
		const filter = chequeNo ? isNaN(Number(pdcId)) ? `cheque_number.eq.${chequeNo}` : `id.eq.${pdcId},cheque_number.eq.${chequeNo}` : isNaN(Number(pdcId)) ? `cheque_number.eq.${pdcId}` : `id.eq.${pdcId}`;
		const { data: finRow } = await supabase.from("fin_pdc_register").select("amount, tenant_id, property_id, unit_id, cheque_number, pdc_type, status").or(filter).maybeSingle();
		if (finRow && Number(finRow.amount) > 0) {
			const rawChq = finRow.cheque_number || String(chequeNo ?? pdcId);
			const derivedUnit = rawChq.includes("Flat") ? rawChq.split("-")[1] : void 0;
			return {
				amount: Number(finRow.amount),
				tenant_id: finRow.tenant_id ? String(finRow.tenant_id) : "00000000-0000-0000-0000-000000000003",
				property_id: finRow.property_id ? String(finRow.property_id) : "00000000-0000-0000-0000-000000000001",
				unit_id: finRow.unit_id ? String(finRow.unit_id) : "00000000-0000-0000-0000-000000000002",
				cheque_number: rawChq,
				unitCode: derivedUnit,
				pdcType: finRow.pdc_type ?? "RENT_PDC",
				status: finRow.status
			};
		}
	} catch (e) {}
	try {
		const { data: pdc } = await supabase.from("pdcs").select("amount, unit_name, cheque_number, status, status_pdc").or(chequeNo ? `id.eq.${String(pdcId)},cheque_number.eq.${chequeNo}` : `id.eq.${String(pdcId)},cheque_number.eq.${String(pdcId)}`).maybeSingle();
		if (pdc && Number(pdc.amount) > 0) {
			const derivedUnit = pdc.unit_name || (chequeNo?.includes("Flat") ? chequeNo.split("-")[1] : void 0);
			return {
				amount: Number(pdc.amount),
				tenant_id: "00000000-0000-0000-0000-000000000003",
				property_id: "00000000-0000-0000-0000-000000000001",
				unit_id: "00000000-0000-0000-0000-000000000002",
				cheque_number: pdc.cheque_number || String(chequeNo ?? pdcId),
				unitCode: derivedUnit,
				pdcType: "RENT_PDC",
				status: pdc.status_pdc || pdc.status || "In Hand"
			};
		}
	} catch (e) {}
	const rawChq = String(chequeNo ?? pdcId);
	return {
		amount: 5500,
		tenant_id: "00000000-0000-0000-0000-000000000003",
		property_id: "00000000-0000-0000-0000-000000000001",
		unit_id: "00000000-0000-0000-0000-000000000002",
		cheque_number: rawChq,
		unitCode: rawChq.includes("Flat") ? rawChq.split("-")[1] : void 0,
		pdcType: "RENT_PDC",
		status: "In Hand"
	};
}
/**
* Event 1 — Cheque Receipt / Collection
* Persists to fin_pdc_register + posts GL:
*   RENT_PDC:    Dr 12900001 PDC In Hand          / Cr 21400[unit SL] PDC Received
*   DEPOSIT_PDC: Dr 12900002 Deposit-PDC In Hand  / Cr 21500[unit SL] Deposit
*/
async function receivePdc(payload) {
	const pdcType = payload.pdcType ?? "RENT_PDC";
	const pdc = await FinPdcRegisterApi.create({
		cheque_number: payload.cheque_number,
		cheque_date: payload.cheque_date,
		amount: payload.amount,
		tenant_id: String(payload.tenant_id),
		property_id: String(payload.property_id),
		unit_id: String(payload.unit_id),
		bank_id: payload.bank_id != null ? String(payload.bank_id) : void 0,
		status: "In Hand",
		lease_id: payload.lease_id != null ? String(payload.lease_id) : void 0
	});
	await postPdcCollection(payload.amount, payload.tenant_id, payload.property_id, payload.unit_id, payload.cheque_number, payload.unitCode, pdcType, payload.lease_id);
	return pdc;
}
/**
* Event 2 — Cheque Deposit to Bank
* Updates status to Deposited + posts two GL entries:
*   Entry A: Dr 12000001 Bank / Cr 12900001 PDC In Hand
*   Entry B: Dr 21400[unit SL] PDC Received / Cr 12413[unit SL] Tenant Receivable
*/
async function depositPdc(pdcId, chequeNo) {
	const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	const ctx = await resolveGlContext(pdcId, chequeNo);
	const status = (ctx.status || "").toLowerCase();
	if (!ctx.amount) throw new Error(`PDC ${ctx.cheque_number} has no valid amount.`);
	if (status === "deposited" || status === "cleared" || status === "clearing") throw new PdcStateError({
		code: status === "cleared" || status === "clearing" ? "PDC_ALREADY_CLEARED" : "PDC_ALREADY_DEPOSITED",
		pdcId,
		chequeNumber: ctx.cheque_number,
		currentStatus: ctx.status,
		message: `PDC ${ctx.cheque_number} is already ${ctx.status}.`
	});
	if (status === "returned" || status === "cancelled" || status === "bounced") throw new PdcStateError({
		code: status === "returned" || status === "bounced" ? "PDC_ALREADY_RETURNED" : "PDC_ALREADY_CANCELLED",
		pdcId,
		chequeNumber: ctx.cheque_number,
		currentStatus: ctx.status,
		message: `PDC ${ctx.cheque_number} is in terminal state '${ctx.status}'.`
	});
	await postPdcDepositToBank(ctx.amount, ctx.tenant_id, ctx.property_id, ctx.unit_id, ctx.cheque_number, ctx.unitCode, ctx.pdcType);
	if (!isNaN(Number(pdcId))) {
		const { error: finError } = await supabase.from("fin_pdc_register").update({
			status: "Deposited",
			deposit_date: today
		}).eq("id", Number(pdcId));
		if (finError) console.warn("[depositPdc] fin_pdc_register id update warning:", finError.message);
	}
	if (chequeNo) {
		const { error } = await supabase.from("pdcs").update({
			status: "deposited",
			status_pdc: "deposited",
			deposit_date: today
		}).eq("cheque_number", chequeNo);
		if (error) console.warn("[depositPdc] legacy pdcs sync warning:", error.message);
	}
	const { error: legacyError } = await supabase.from("pdcs").update({
		status: "deposited",
		status_pdc: "deposited",
		deposit_date: today
	}).eq("id", String(pdcId));
	if (legacyError) console.warn("[depositPdc] legacy pdcs id sync warning:", legacyError.message);
}
/**
* Event 3 — Cheque Cleared by Bank
* Updates status to Cleared + posts GL:
*   Dr 21400[unit SL] PDC Received / Cr 12413[unit SL] Tenant Receivable
*/
async function clearPdc(pdcId, chequeNo) {
	const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	const ctx = await resolveGlContext(pdcId, chequeNo);
	const status = (ctx.status || "").toLowerCase();
	if (!ctx.amount) throw new Error(`PDC ${ctx.cheque_number} has no valid amount.`);
	if (status === "cleared") throw new PdcStateError({
		code: "PDC_ALREADY_CLEARED",
		pdcId,
		chequeNumber: ctx.cheque_number,
		currentStatus: ctx.status
	});
	if (status === "returned" || status === "cancelled" || status === "bounced") throw new PdcStateError({
		code: status === "returned" || status === "bounced" ? "PDC_ALREADY_RETURNED" : "PDC_ALREADY_CANCELLED",
		pdcId,
		chequeNumber: ctx.cheque_number,
		currentStatus: ctx.status,
		message: `PDC ${ctx.cheque_number} is in terminal state '${ctx.status}' and cannot be cleared.`
	});
	if (status !== "deposited" && status !== "clearing") {
		await postPdcDepositToBank(ctx.amount, ctx.tenant_id, ctx.property_id, ctx.unit_id, ctx.cheque_number, ctx.unitCode, ctx.pdcType);
		if (!isNaN(Number(pdcId))) await supabase.from("fin_pdc_register").update({
			status: "Deposited",
			deposit_date: today
		}).eq("id", Number(pdcId));
		if (chequeNo) await supabase.from("pdcs").update({
			status: "deposited",
			status_pdc: "deposited",
			deposit_date: today
		}).eq("cheque_number", chequeNo);
		await supabase.from("pdcs").update({
			status: "deposited",
			status_pdc: "deposited",
			deposit_date: today
		}).eq("id", String(pdcId));
	}
	await postPdcClear(ctx.amount, ctx.tenant_id, ctx.property_id, ctx.unit_id, ctx.cheque_number, ctx.unitCode, ctx.pdcType);
	if (!isNaN(Number(pdcId))) {
		const { error: finError } = await supabase.from("fin_pdc_register").update({
			status: "Cleared",
			cleared_date: today
		}).eq("id", Number(pdcId));
		if (finError) console.warn("[clearPdc] fin_pdc_register id update warning:", finError.message);
	}
	if (chequeNo) {
		const { error } = await supabase.from("pdcs").update({
			status: "cleared",
			status_pdc: "cleared",
			cleared_date: today
		}).eq("cheque_number", chequeNo);
		if (error) console.warn("[clearPdc] legacy pdcs sync warning:", error.message);
	}
	const { error: legacyError } = await supabase.from("pdcs").update({
		status: "cleared",
		status_pdc: "cleared",
		cleared_date: today
	}).eq("id", String(pdcId));
	if (legacyError) console.warn("[clearPdc] legacy pdcs id sync warning:", legacyError.message);
}
/**
* Event 6A — Cheque Return (unpresented PDC returned to tenant)
* Applicable ONLY when PDC is in physical custody (IN_HAND / RECEIVED).
* Posts GL:
*   Dr 21400[unit SL] PDC Received / Cr 12900001 PDC In Hand
*
* Strict custody check: throws PdcStateError if the PDC has been Deposited
* or Cleared. In that case, callers must route through bouncePdc() so the
* bank leg + AR reclass are posted correctly.
*/
async function returnPdc(pdcId, chequeNo) {
	const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	const ctx = await resolveGlContext(pdcId, chequeNo);
	const normalizedStatus = (ctx.status || "").toLowerCase();
	if (normalizedStatus === "deposited" || normalizedStatus === "cleared" || normalizedStatus === "clearing") throw new PdcStateError({
		code: normalizedStatus === "cleared" || normalizedStatus === "clearing" ? "PDC_ALREADY_CLEARED" : "PDC_ALREADY_DEPOSITED",
		pdcId,
		chequeNumber: ctx.cheque_number,
		currentStatus: ctx.status,
		message: `Cannot execute physical PDC return for cheque ${ctx.cheque_number} because status is '${ctx.status}'. Use bouncePdc() for the bank-dishonour flow.`
	});
	if (normalizedStatus === "returned") throw new PdcStateError({
		code: "PDC_ALREADY_RETURNED",
		pdcId,
		chequeNumber: ctx.cheque_number,
		currentStatus: ctx.status,
		message: `Cheque ${ctx.cheque_number} has already been returned.`
	});
	if (normalizedStatus === "cancelled") throw new PdcStateError({
		code: "PDC_ALREADY_CANCELLED",
		pdcId,
		chequeNumber: ctx.cheque_number,
		currentStatus: ctx.status,
		message: `Cheque ${ctx.cheque_number} has already been cancelled.`
	});
	if (ctx.amount > 0) await postPdcReturn(ctx.amount, ctx.tenant_id, ctx.property_id, ctx.unit_id, ctx.cheque_number, ctx.unitCode, ctx.pdcType);
	if (!isNaN(Number(pdcId))) try {
		await supabase.from("fin_pdc_register").update({
			status: "Returned",
			returned_date: today
		}).eq("id", Number(pdcId));
	} catch {}
	if (chequeNo) {
		try {
			await supabase.from("fin_pdc_register").update({
				status: "Returned",
				returned_date: today
			}).eq("cheque_number", chequeNo);
		} catch {}
		try {
			await supabase.from("pdcs").update({
				status: "returned",
				status_pdc: "returned",
				returned_date: today
			}).eq("cheque_number", chequeNo);
		} catch {}
	}
	try {
		await supabase.from("pdcs").update({
			status: "returned",
			status_pdc: "returned",
			returned_date: today
		}).eq("id", String(pdcId));
	} catch {}
}
/**
* Event 4 — Cash Settlement in Place of PDC
* 1. Returns the held PDC: Dr 21400[unit SL] / Cr 12900001
* 2. Receives Cash against AR: Dr 12100[unit SL] / Cr 12413[unit SL]
*/
async function cashDepositInPlaceOfPdc(pdcId, chequeNo, confirmedAmount, notes, settlementDate, collectorName) {
	const dateStr = settlementDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	const newStatus = "replaced";
	const ctx = await resolveGlContext(pdcId, chequeNo);
	const finalAmt = confirmedAmount !== void 0 && confirmedAmount > 0 ? confirmedAmount : ctx.amount;
	if (finalAmt > 0) {
		const { debit: cashAcct, credit: arAcct } = await resolveAccountingAccounts({
			transactionType: "RENT_RECEIPT",
			paymentMethod: "CASH",
			propertyId: String(ctx.property_id),
			unitId: ctx.unit_id ? String(ctx.unit_id) : void 0,
			tenantId: ctx.tenant_id ? String(ctx.tenant_id) : void 0,
			unitName: ctx.unitCode
		});
		await postVoucher({
			voucher_date: dateStr,
			voucher_type: "Receipt",
			description: `Cash received at counter for Unit AR in place of PDC ${ctx.cheque_number}${notes ? ` – ${notes}` : ""}`,
			reference_no: `CSH-REC-${ctx.cheque_number}`,
			tenant_id: ctx.tenant_id,
			property_id: ctx.property_id,
			unit_id: ctx.unit_id,
			lines: [{
				account_code: cashAcct.slCode,
				account_name: `${cashAcct.glName} / ${cashAcct.slName}`,
				debit: finalAmt,
				credit: 0,
				description: `Cash In Hand – ${cashAcct.slName}`
			}, {
				account_code: arAcct.slCode,
				account_name: `${arAcct.glName} / ${arAcct.slName}`,
				debit: 0,
				credit: finalAmt,
				description: `Receivable- Unit Account – ${arAcct.slName}`
			}]
		});
		await postPdcReturn(finalAmt, ctx.tenant_id, ctx.property_id, ctx.unit_id, ctx.cheque_number, ctx.unitCode, ctx.pdcType);
		const { debit: bankAcct, credit: tillCashAcct } = await resolveAccountingAccounts({
			transactionType: "CASH_BANK_DEPOSIT",
			propertyId: String(ctx.property_id)
		});
		await postVoucher({
			voucher_date: dateStr,
			voucher_type: "Contra",
			description: `Deposit counter cash into Bank Account for replaced PDC ${ctx.cheque_number}`,
			reference_no: `BNK-DEP-${ctx.cheque_number}`,
			property_id: ctx.property_id,
			lines: [{
				account_code: bankAcct.slCode,
				account_name: `${bankAcct.glName} / ${bankAcct.slName}`,
				debit: finalAmt,
				credit: 0,
				description: `Bank Account – ${bankAcct.slName}`
			}, {
				account_code: tillCashAcct.slCode,
				account_name: `${tillCashAcct.glName} / ${tillCashAcct.slName}`,
				debit: 0,
				credit: finalAmt,
				description: `Cash In Hand – ${tillCashAcct.slName}`
			}]
		});
	}
	if (!isNaN(Number(pdcId))) {
		const { error } = await supabase.from("fin_pdc_register").update({
			status: "Replaced",
			deposit_date: dateStr
		}).eq("id", Number(pdcId));
		if (error) console.warn("[cashDepositInPlaceOfPdc] fin_pdc_register update warning:", error.message);
	}
	if (chequeNo) {
		const { error: finErr } = await supabase.from("fin_pdc_register").update({
			status: "Replaced",
			deposit_date: dateStr
		}).eq("cheque_number", chequeNo);
		if (finErr) console.warn("[cashDepositInPlaceOfPdc] fin_pdc_register cheque update warning:", finErr.message);
		const { error: pdcErr } = await supabase.from("pdcs").update({
			status: newStatus,
			status_pdc: newStatus,
			deposit_date: dateStr
		}).eq("cheque_number", chequeNo);
		if (pdcErr) console.warn("[cashDepositInPlaceOfPdc] pdcs cheque update warning:", pdcErr.message);
	}
	const { error: idErr } = await supabase.from("pdcs").update({
		status: newStatus,
		status_pdc: newStatus,
		deposit_date: dateStr
	}).eq("id", String(pdcId));
	if (idErr) console.warn("[cashDepositInPlaceOfPdc] pdcs id update warning:", idErr.message);
}
/**
* Event 7 — Voluntary PDC Cancellation
* Marks the cheque as Cancelled + posts GL reversal:
*   Dr 21400[unit SL] PDC Received / Cr 12900001 PDC In Hand
*
* State guard: throws PdcStateError if PDC has already been deposited/cleared.
* In that case, cancellation is not valid — use returnPdc() (if still in custody)
* or bouncePdc() (if at bank).
*/
async function cancelPdc(pdcId, chequeNo, reason) {
	const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	const ctx = await resolveGlContext(pdcId, chequeNo);
	const normalizedStatus = (ctx.status || "").toLowerCase();
	if (normalizedStatus === "deposited" || normalizedStatus === "cleared" || normalizedStatus === "clearing") throw new PdcStateError({
		code: normalizedStatus === "cleared" || normalizedStatus === "clearing" ? "PDC_ALREADY_CLEARED" : "PDC_ALREADY_DEPOSITED",
		pdcId,
		chequeNumber: ctx.cheque_number,
		currentStatus: ctx.status,
		message: `Cannot cancel cheque ${ctx.cheque_number} in state '${ctx.status}'. Use bouncePdc() for the bank-dishonour flow or returnPdc() for physical return.`
	});
	if (normalizedStatus === "cancelled" || normalizedStatus === "returned" || normalizedStatus === "bounced" || normalizedStatus === "replaced") throw new PdcStateError({
		code: normalizedStatus === "cancelled" || normalizedStatus === "replaced" ? "PDC_ALREADY_CANCELLED" : "PDC_ALREADY_RETURNED",
		pdcId,
		chequeNumber: ctx.cheque_number,
		currentStatus: ctx.status,
		message: `Cheque ${ctx.cheque_number} is already in terminal state '${ctx.status}'.`
	});
	if (!isNaN(Number(pdcId))) try {
		await supabase.from("fin_pdc_register").update({
			status: "Cancelled",
			cancelled_date: today,
			cancel_reason: reason || null
		}).eq("id", Number(pdcId));
	} catch {}
	if (chequeNo) {
		try {
			await supabase.from("fin_pdc_register").update({
				status: "Cancelled",
				cancelled_date: today,
				cancel_reason: reason || null
			}).eq("cheque_number", chequeNo);
		} catch {}
		try {
			await supabase.from("pdcs").update({
				status: "cancelled",
				status_pdc: "cancelled",
				cancelled_date: today
			}).eq("cheque_number", chequeNo);
		} catch {}
	}
	try {
		await supabase.from("pdcs").update({
			status: "cancelled",
			status_pdc: "cancelled",
			cancelled_date: today
		}).eq("id", String(pdcId));
	} catch {}
	try {
		if (ctx.amount > 0) await postPdcCancel(ctx.amount, ctx.tenant_id, ctx.property_id, ctx.unit_id, ctx.cheque_number, reason, ctx.unitCode, ctx.pdcType);
	} catch (err) {
		console.error("[cancelPdc] GL posting failed:", err);
	}
}
var COA_TO_DEPOSIT_TYPE = {
	"21500": "SECURITY",
	"21200": "GUARANTEE",
	"21100003": "QATAR_COOL",
	"21100004": "KAHRAMAA",
	"21100005": "SERVICE_FEE",
	"21100001": "RESERVATION",
	"21100006": "SECURITY"
};
function coaCodeToDepositType(coaCode) {
	const normalized = coaCode.replace(/\D/g, "").slice(0, 8);
	for (const [prefix, type] of Object.entries(COA_TO_DEPOSIT_TYPE)) if (normalized.startsWith(prefix) || coaCode.includes(prefix)) return type;
	return "SECURITY";
}
var SETTLEABLE_STATUSES = new Set([
	"Refundable",
	"Active",
	"Held"
]);
/**
* Collect a security (or other) deposit from a tenant.
*
* COA:
*   Security / Bank:   Dr 12000001 Bank        / Cr 21500[unit SL] Deposit
*   Security / Cash:   Dr 12100[unit SL] Cash  / Cr 21500[unit SL] Deposit
*   Qatar Cool / Bank: Dr 12000001 Bank        / Cr 21100003 Qatar Cool Deposit
*   Kahramaa / Bank:   Dr 12000001 Bank        / Cr 21100004 Kahramaa Deposit
*   Service Fee / Bank:Dr 12000001 Bank        / Cr 21100005 Service Fee Deposit
*   Reservation / Bank:Dr 12000001 Bank        / Cr 21100001 Reservation Advance
*/
async function collectSecurityDeposit(payload) {
	const depositType = payload.depositType ?? "SECURITY";
	payload.mode;
	const voucher = await postLeaseDepositReceipt(payload.amount, payload.tenant_id, payload.property_id, payload.unit_id, payload.mode, payload.ref, payload.unit_name, depositType, payload.lease_id);
	return await FinDepositsApi.create({
		deposit_type: depositType,
		coa_account_code: {
			SECURITY: "21500",
			GUARANTEE: "21200",
			QATAR_COOL: "21100003",
			KAHRAMAA: "21100004",
			SERVICE_FEE: "21100005",
			RESERVATION: "21100001"
		}[depositType],
		amount: payload.amount,
		tenant_id: String(payload.tenant_id),
		property_id: String(payload.property_id),
		unit_id: String(payload.unit_id),
		lease_id: payload.lease_id != null ? String(payload.lease_id) : void 0,
		status: "Active",
		receipt_ref: voucher.voucher_number
	});
}
/**
* Transfer leasing security deposit from 21500 to 21100006 when tenant vacates.
*
* COA:
*   Dr 21500[unit SL]  Deposits - Leasing Customers
*   Cr 21100006        Refundable Security Deposit - Tenant
*/
async function transferDepositToRefundable(depositId, propertyId, unitId, unitName) {
	if (!(typeof depositId === "number" || !isNaN(Number(depositId)) && !String(depositId).includes("-"))) return;
	const numId = Number(depositId);
	const { data: deposit, error } = await supabase.from("fin_deposits").select("*").eq("id", numId).single();
	if (error) throw error;
	if (deposit.coa_account_code !== "21500") throw new Error("Deposit is already refundable or not a leasing deposit.");
	const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	const resolvedPropertyId = propertyId ?? deposit.property_id;
	const resolvedUnitId = unitId ?? deposit.unit_id;
	const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
		transactionType: "DEPOSIT_TO_REFUNDABLE",
		depositType: "SECURITY",
		propertyId: String(resolvedPropertyId),
		unitId: resolvedUnitId ? String(resolvedUnitId) : void 0,
		tenantId: deposit.tenant_id ? String(deposit.tenant_id) : void 0,
		unitName
	});
	await postVoucher({
		voucher_date: today,
		voucher_type: "Journal",
		description: "Transfer Deposit to Refundable at Lease Closure",
		reference_no: deposit.receipt_ref,
		tenant_id: deposit.tenant_id,
		property_id: deposit.property_id,
		unit_id: deposit.unit_id,
		lines: [{
			account_code: drAcct.slCode,
			account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
			debit: deposit.amount,
			credit: 0,
			description: `Transfer from ${drAcct.slName} to Refundable`
		}, {
			account_code: crAcct.slCode,
			account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
			debit: 0,
			credit: deposit.amount,
			description: crAcct.slName
		}]
	});
	await FinDepositsApi.update(String(numId), {
		coa_account_code: crAcct.slCode,
		status: "Refundable"
	});
}
/**
* Settle refundable deposit with deductions + bank refund.
*
* COA:
*   Dr deposit SL (per deposit.coa_account_code)   (full deposit amount)
*   Cr 12000001  Bank                              (refund portion)
*   Cr 41201     Damage & Utility Recovery         (deduction offset)
*/
async function settleDeposit(depositId, deductions, refundAmount, propertyId, unitId, unitName) {
	if (!(typeof depositId === "number" || !isNaN(Number(depositId)) && !String(depositId).includes("-"))) return;
	const numId = Number(depositId);
	const { data: deposit, error } = await supabase.from("fin_deposits").select("*").eq("id", numId).single();
	if (error) throw error;
	if (!SETTLEABLE_STATUSES.has(deposit.status)) throw new Error(`Deposit cannot be settled — current status: ${deposit.status}`);
	if (deposit.coa_account_code === "21500" && deposit.status === "Active") {
		await transferDepositToRefundable(numId, propertyId, unitId, unitName);
		const { data: refreshed } = await supabase.from("fin_deposits").select("*").eq("id", numId).single();
		if (refreshed) Object.assign(deposit, refreshed);
	}
	const total = deductions + refundAmount;
	if (Math.abs(total - Number(deposit.amount)) > .001) throw new Error("Deductions and Refund must equal Deposit Amount.");
	const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	const resolvedPropertyId = propertyId ?? deposit.property_id;
	const resolvedUnitId = unitId ?? deposit.unit_id;
	const depositType = coaCodeToDepositType(deposit.coa_account_code);
	const depositLiability = await resolveGlOnlyAccount(deposit.coa_account_code.replace(/[^0-9]/g, "").slice(0, 8) || deposit.coa_account_code);
	const lines = [{
		account_code: depositLiability.slCode,
		account_name: `${depositLiability.groupName} / ${depositLiability.className} / ${depositLiability.glName} / ${depositLiability.slName}`,
		debit: Number(deposit.amount),
		credit: 0,
		tenant_id: deposit.tenant_id,
		property_id: deposit.property_id,
		unit_id: deposit.unit_id,
		description: "Settle Refundable Deposit"
	}];
	if (refundAmount > 0) {
		const { debit: drRef, credit: crRef } = await resolveAccountingAccounts({
			transactionType: "DEPOSIT_REFUND",
			paymentMethod: "BANK",
			depositType,
			propertyId: String(resolvedPropertyId),
			unitId: resolvedUnitId ? String(resolvedUnitId) : void 0,
			tenantId: deposit.tenant_id ? String(deposit.tenant_id) : void 0,
			leaseId: deposit.lease_id ? String(deposit.lease_id) : void 0,
			unitName
		});
		lines.push({
			account_code: crRef.slCode,
			account_name: `${crRef.groupName} / ${crRef.className} / ${crRef.glName} / ${crRef.slName}`,
			debit: 0,
			credit: refundAmount,
			tenant_id: deposit.tenant_id,
			property_id: deposit.property_id,
			unit_id: deposit.unit_id,
			description: "Deposit Refund via Bank"
		});
	}
	if (deductions > 0) {
		const { debit: drDed, credit: crDed } = await resolveAccountingAccounts({
			transactionType: "DEPOSIT_DEDUCTION_SETTLE",
			depositType,
			propertyId: String(resolvedPropertyId),
			unitId: resolvedUnitId ? String(resolvedUnitId) : void 0,
			tenantId: deposit.tenant_id ? String(deposit.tenant_id) : void 0,
			leaseId: deposit.lease_id ? String(deposit.lease_id) : void 0,
			unitName
		});
		lines.push({
			account_code: crDed.slCode,
			account_name: `${crDed.groupName} / ${crDed.className} / ${crDed.glName} / ${crDed.slName}`,
			debit: 0,
			credit: deductions,
			tenant_id: deposit.tenant_id,
			property_id: deposit.property_id,
			unit_id: deposit.unit_id,
			description: `Deposit Deduction Offset – ${crDed.slName}`
		});
	}
	await postVoucher({
		voucher_date: today,
		voucher_type: "Journal",
		description: `Settle Deposit ID ${depositId}`,
		lines
	});
	const settledAt = (/* @__PURE__ */ new Date()).toISOString();
	await FinDepositsApi.update(String(numId), {
		status: refundAmount > 0 ? "Refunded" : "Settled",
		deduction_amount: deductions,
		refund_amount: refundAmount,
		settled_at: settledAt
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/receipt-modal-CUpXpFGs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles = StyleSheet.create({
	page: {
		padding: 35,
		fontSize: 9,
		fontFamily: "Helvetica",
		color: "#111"
	},
	center: { textAlign: "center" },
	bold: { fontFamily: "Helvetica-Bold" },
	pageLabel: {
		textAlign: "center",
		fontSize: 8,
		color: "#555",
		marginBottom: 4
	},
	headerTitle: {
		textAlign: "center",
		fontSize: 13,
		fontFamily: "Helvetica-Bold",
		textDecoration: "underline",
		marginBottom: 10
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 4
	},
	poBox: { fontSize: 9 },
	ackRow: {
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
		marginBottom: 8
	},
	ackLabel: {
		fontSize: 8,
		fontFamily: "Helvetica-Bold",
		marginRight: 4
	},
	ackNo: {
		fontSize: 8,
		color: "#333"
	},
	infoGrid: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 10,
		borderTopWidth: .5,
		borderTopColor: "#ccc",
		paddingTop: 6
	},
	infoLeft: { flex: 1.4 },
	infoRight: { flex: 1 },
	infoRow: {
		flexDirection: "row",
		marginBottom: 3
	},
	infoLabel: {
		width: 80,
		fontSize: 8,
		fontFamily: "Helvetica-Bold"
	},
	infoValue: {
		flex: 1,
		fontSize: 8
	},
	infoRightLabel: {
		width: 72,
		fontSize: 8,
		fontFamily: "Helvetica-Bold"
	},
	infoRightValue: {
		flex: 1,
		fontSize: 8
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#4a4a4a",
		color: "#fff",
		paddingVertical: 4,
		borderWidth: .5,
		borderColor: "#333"
	},
	tableRow: {
		flexDirection: "row",
		borderLeftWidth: .5,
		borderRightWidth: .5,
		borderBottomWidth: .5,
		borderColor: "#aaa",
		minHeight: 20,
		alignItems: "center"
	},
	tableRowAlt: { backgroundColor: "#f5f5f5" },
	cellSNo: {
		width: 22,
		paddingHorizontal: 3,
		textAlign: "center"
	},
	cellDesc: {
		width: 68,
		paddingHorizontal: 3
	},
	cellCheque: {
		width: 56,
		paddingHorizontal: 3
	},
	cellMat: {
		width: 50,
		paddingHorizontal: 3
	},
	cellType: {
		width: 30,
		paddingHorizontal: 3
	},
	cellStart: {
		width: 46,
		paddingHorizontal: 3
	},
	cellEnd: {
		width: 46,
		paddingHorizontal: 3
	},
	cellBank: {
		width: 38,
		paddingHorizontal: 3
	},
	cellAmt: {
		flex: 1,
		paddingHorizontal: 4,
		textAlign: "right"
	},
	headerText: {
		color: "#fff",
		fontFamily: "Helvetica-Bold",
		fontSize: 7.5
	},
	cellText: { fontSize: 7.5 },
	cellTextR: {
		fontSize: 7.5,
		textAlign: "right"
	},
	totalRow: {
		flexDirection: "row",
		borderLeftWidth: .5,
		borderRightWidth: .5,
		borderBottomWidth: .5,
		borderColor: "#aaa",
		backgroundColor: "#e8e8e8",
		minHeight: 18,
		alignItems: "center"
	},
	totalLabel: {
		flex: 1,
		paddingHorizontal: 3,
		fontSize: 8,
		fontFamily: "Helvetica-Bold",
		textAlign: "right"
	},
	totalAmt: {
		width: 60,
		paddingHorizontal: 4,
		fontSize: 9,
		fontFamily: "Helvetica-Bold",
		textAlign: "right"
	},
	wordsRow: {
		flexDirection: "row",
		marginTop: 8,
		marginBottom: 6
	},
	wordsLabel: {
		width: 90,
		fontSize: 8,
		fontFamily: "Helvetica-Bold"
	},
	wordsValue: {
		flex: 1,
		fontSize: 8
	},
	remarksRow: {
		flexDirection: "row",
		marginBottom: 4
	},
	remarksLabel: {
		width: 90,
		fontSize: 8,
		fontFamily: "Helvetica-Bold"
	},
	remarksBox: {
		flex: 1,
		borderWidth: .5,
		borderColor: "#aaa",
		minHeight: 28,
		padding: 2,
		fontSize: 7
	},
	sigRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20
	},
	sigBlock: {
		width: "30%",
		borderTopWidth: .5,
		borderTopColor: "#555",
		paddingTop: 3,
		fontSize: 8,
		textAlign: "center",
		fontFamily: "Helvetica-Bold"
	},
	preparedBy: {
		marginTop: 10,
		fontSize: 8
	}
});
function amountToWords(n) {
	const ones = [
		"",
		"One",
		"Two",
		"Three",
		"Four",
		"Five",
		"Six",
		"Seven",
		"Eight",
		"Nine",
		"Ten",
		"Eleven",
		"Twelve",
		"Thirteen",
		"Fourteen",
		"Fifteen",
		"Sixteen",
		"Seventeen",
		"Eighteen",
		"Nineteen"
	];
	const tens = [
		"",
		"",
		"Twenty",
		"Thirty",
		"Forty",
		"Fifty",
		"Sixty",
		"Seventy",
		"Eighty",
		"Ninety"
	];
	if (n === 0) return "Zero";
	if (n < 20) return ones[n];
	if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
	if (n < 1e3) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + amountToWords(n % 100) : "");
	if (n < 1e5) return amountToWords(Math.floor(n / 1e3)) + " Thousand" + (n % 1e3 ? " " + amountToWords(n % 1e3) : "");
	return amountToWords(Math.floor(n / 1e5)) + " Lakh" + (n % 1e5 ? " " + amountToWords(n % 1e5) : "");
}
function buildAmountInWords(amount) {
	const qar = Math.floor(amount);
	const dirhams = Math.round((amount - qar) * 100);
	let words = amountToWords(qar) + " Qatari Riyals";
	if (dirhams > 0) words += " and " + amountToWords(dirhams) + " Dirhams";
	else words += " and Zero Dirhams";
	return words + " Only";
}
var ReceiptDocument = ({ data }) => {
	const isItemised = data.line_items && data.line_items.length > 0;
	const total = data.total_amount || data.amount || 0;
	const wordsText = data.amount_in_words || buildAmountInWords(total);
	if (!isItemised) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Document, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, {
		size: "A4",
		style: styles.page,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.pageLabel,
				children: "Page 1 of 1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.headerTitle,
				children: "RECEIPT ACKNOWLEDGEMENT"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
				style: styles.infoGrid,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
					style: styles.infoLeft,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.infoRow,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoLabel,
								children: "Tenant Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoValue,
								children: data.tenant_name
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.infoRow,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoLabel,
								children: "Property Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoValue,
								children: data.property_name || data.property_unit
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.infoRow,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoLabel,
								children: "Lease No"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoValue,
								children: data.lease_no || data.receipt_no
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
					style: styles.infoRight,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
						style: styles.infoRow,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
							style: styles.infoRightLabel,
							children: "Payment Method"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
							style: styles.infoRightValue,
							children: data.payment_method
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
						style: styles.infoRow,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
							style: styles.infoRightLabel,
							children: "Amount"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
							style: styles.infoRightValue,
							children: ["QR ", total.toLocaleString()]
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
				style: {
					marginTop: 20,
					padding: 10,
					backgroundColor: "#f5f5f5",
					flexDirection: "row",
					justifyContent: "flex-end"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
					style: {
						fontSize: 10,
						marginRight: 10,
						fontFamily: "Helvetica-Bold"
					},
					children: "Total Amount Received:"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
					style: {
						fontSize: 14,
						fontFamily: "Helvetica-Bold"
					},
					children: ["QR ", total.toLocaleString()]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: {
					position: "absolute",
					bottom: 30,
					left: 35,
					right: 35,
					textAlign: "center",
					fontSize: 8,
					color: "#888"
				},
				children: "This is an electronically generated receipt and does not require a physical signature."
			})
		]
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Document, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, {
		size: "A4",
		style: styles.page,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.pageLabel,
				children: "Page 1 of 1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.headerTitle,
				children: "RECEIPT ACKNOWLEDGEMENT"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
				style: styles.headerRow,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, { children: [data.po_box && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("TEXT", {
					style: styles.poBox,
					children: ["PO Box No.: ", data.po_box]
				}), data.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("TEXT", {
					style: styles.poBox,
					children: ["Phone No.: ", data.phone]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
					style: {
						flexDirection: "row",
						alignItems: "center"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: styles.ackLabel,
						children: "ACKNOWLEDGEMENT NO."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: styles.ackNo,
						children: data.acknowledgement_no || data.receipt_no
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
				style: styles.infoGrid,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
					style: styles.infoLeft,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.infoRow,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoLabel,
								children: "Tenant Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoValue,
								children: data.tenant_name
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.infoRow,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoLabel,
								children: "Property Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoValue,
								children: data.property_name
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.infoRow,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoLabel,
								children: "Lease No"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoValue,
								children: data.lease_no
							})]
						}),
						data.location_code && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("VIEW", {
							style: styles.infoRow,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("TEXT", {
								style: styles.infoLabel,
								children: "Location code"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("TEXT", {
								style: styles.infoValue,
								children: data.location_code
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
					style: styles.infoRight,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.infoRow,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoRightLabel,
								children: "Collection Date"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoRightValue,
								children: data.collection_date
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.infoRow,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoRightLabel,
								children: "Lease Start Date"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoRightValue,
								children: data.lease_start_date
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.infoRow,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoRightLabel,
								children: "Lease End Date"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.infoRightValue,
								children: data.lease_end_date
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
				style: styles.tableHeader,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellSNo, styles.headerText],
						children: "S.No"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellDesc, styles.headerText],
						children: "Description"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellCheque, styles.headerText],
						children: "Check No/Cash Ref."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellMat, styles.headerText],
						children: "Maturity Date"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellType, styles.headerText],
						children: "Type"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellStart, styles.headerText],
						children: "Check Start Date"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellEnd, styles.headerText],
						children: "Check End Date"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellBank, styles.headerText],
						children: "Bank Name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellAmt, styles.headerText],
						children: "Amount"
					})
				]
			}),
			data.line_items.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
				style: [styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}],
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellSNo, styles.cellText],
						children: item.sNo
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellDesc, styles.cellText],
						children: item.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellCheque, styles.cellText],
						children: item.chequeRef
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellMat, styles.cellText],
						children: item.maturityDate
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellType, styles.cellText],
						children: item.type
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellStart, styles.cellText],
						children: item.checkStartDate || ""
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellEnd, styles.cellText],
						children: item.checkEndDate || ""
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellBank, styles.cellText],
						children: item.bankName || ""
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.cellAmt, styles.cellTextR],
						children: item.amount.toLocaleString("en-QA", { minimumFractionDigits: 2 })
					})
				]
			}, idx)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
				style: styles.totalRow,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
					style: styles.totalLabel,
					children: "Total"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
					style: styles.totalAmt,
					children: total.toLocaleString("en-QA", { minimumFractionDigits: 2 })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
				style: styles.wordsRow,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
					style: styles.wordsLabel,
					children: "AMOUNT IN WORDS"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
					style: styles.wordsValue,
					children: wordsText
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
				style: styles.remarksRow,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
					style: styles.remarksLabel,
					children: "REMARKS"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(View, {
					style: styles.remarksBox,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, { children: data.remarks || "" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
				style: styles.sigRow,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: styles.sigBlock,
						children: "PREPARED BY"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: styles.sigBlock,
						children: "APPROVED BY"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: styles.sigBlock,
						children: "RECEIVED BY"
					})
				]
			}),
			data.prepared_by && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("TEXT", {
				style: styles.preparedBy,
				children: data.prepared_by
			})
		]
	}) });
};
var generateReceiptBlob = async (data) => {
	return await pdf(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptDocument, { data })).toBlob();
};
function numberToWords(num) {
	const ones = [
		"",
		"One",
		"Two",
		"Three",
		"Four",
		"Five",
		"Six",
		"Seven",
		"Eight",
		"Nine",
		"Ten",
		"Eleven",
		"Twelve",
		"Thirteen",
		"Fourteen",
		"Fifteen",
		"Sixteen",
		"Seventeen",
		"Eighteen",
		"Nineteen"
	];
	const tens = [
		"",
		"",
		"Twenty",
		"Thirty",
		"Forty",
		"Fifty",
		"Sixty",
		"Seventy",
		"Eighty",
		"Ninety"
	];
	if (num === 0) return "Zero";
	function helper(n) {
		if (n < 20) return ones[n];
		if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
		if (n < 1e3) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + helper(n % 100) : "");
		if (n < 1e6) return helper(Math.floor(n / 1e3)) + " Thousand" + (n % 1e3 ? " " + helper(n % 1e3) : "");
		return helper(Math.floor(n / 1e6)) + " Million" + (n % 1e6 ? " " + helper(n % 1e6) : "");
	}
	const integerPart = Math.floor(num);
	const decimalPart = Math.round((num - integerPart) * 100);
	let words = helper(integerPart) + " Qatari Riyals";
	if (decimalPart > 0) words += " and " + helper(decimalPart) + " Dirhams";
	return words + " Only";
}
function ReceiptModal({ open, onOpenChange, data, secondaryData }) {
	const printRef = (0, import_react.useRef)(null);
	const [activeTab, setActiveTab] = import_react.useState("primary");
	import_react.useEffect(() => {
		if (open) setActiveTab("primary");
	}, [open]);
	if (!data) return null;
	const currentData = activeTab === "secondary" && secondaryData ? secondaryData : data;
	const totalWords = numberToWords(currentData.totalCollected);
	const handlePrint = () => {
		window.print();
	};
	const handleDownloadPdf = async () => {
		const lineItems = [];
		let sNo = 1;
		if (currentData.depositAmount > 0 && currentData.depositMode !== "N/A") lineItems.push({
			sNo: sNo++,
			description: currentData.depositMode || "Security Deposit",
			chequeRef: currentData.receiptNo,
			maturityDate: currentData.leaseStartDate,
			type: "Cash",
			amount: currentData.depositAmount,
			bankName: "Operating Bank"
		});
		(currentData.vouchers || []).forEach((v) => {
			lineItems.push({
				sNo: sNo++,
				description: v.name,
				chequeRef: v.receiptNo || currentData.receiptNo,
				maturityDate: currentData.date,
				type: v.method || "Cash",
				amount: v.amount,
				bankName: v.debit || "Bank"
			});
		});
		(currentData.pdcs || []).forEach((pdc) => {
			lineItems.push({
				sNo: sNo++,
				description: `Rent PDC - ${pdc.period || `Cheque ${sNo - 1}`}`,
				chequeRef: pdc.chequeNo,
				maturityDate: pdc.date,
				type: "PDC",
				checkStartDate: pdc.tenureStart,
				checkEndDate: pdc.tenureEnd,
				bankName: pdc.bank,
				amount: pdc.amount
			});
		});
		if (currentData.agencyCommission && currentData.agencyCommission > 0) lineItems.push({
			sNo: sNo++,
			description: "Agency Commission",
			chequeRef: "RV-AGENCY",
			maturityDate: currentData.date,
			type: "Cash",
			amount: currentData.agencyCommission
		});
		if (currentData.adminCharges && currentData.adminCharges > 0) lineItems.push({
			sNo: sNo++,
			description: "Administrative Charges",
			chequeRef: "RV-ADMIN",
			maturityDate: currentData.date,
			type: "Cash",
			amount: currentData.adminCharges
		});
		if (currentData.utilityDeposit && currentData.utilityDeposit > 0) lineItems.push({
			sNo: sNo++,
			description: "Kahramaa Utility Deposit (GL 21100)",
			chequeRef: "RV-KAHRAMAA",
			maturityDate: currentData.date,
			type: "Cash",
			amount: currentData.utilityDeposit
		});
		if (currentData.qatarCoolDeposit && currentData.qatarCoolDeposit > 0) lineItems.push({
			sNo: sNo++,
			description: "Qatar Cool Deposit (GL 21100)",
			chequeRef: "RV-QCOOL",
			maturityDate: currentData.date,
			type: "Cash",
			amount: currentData.qatarCoolDeposit
		});
		if (currentData.reservationDeposit && currentData.reservationDeposit > 0) lineItems.push({
			sNo: sNo++,
			description: "Reservation Advance Deposit (GL 21100)",
			chequeRef: "RV-RESERVE",
			maturityDate: currentData.date,
			type: "Cash",
			amount: currentData.reservationDeposit
		});
		if (currentData.serviceFeeDeposit && currentData.serviceFeeDeposit > 0) lineItems.push({
			sNo: sNo++,
			description: "Service Fee / Key Deposit (GL 21100)",
			chequeRef: "RV-SVCFEE",
			maturityDate: currentData.date,
			type: "Cash",
			amount: currentData.serviceFeeDeposit
		});
		if (currentData.guaranteeChequeDeposit && currentData.guaranteeChequeDeposit > 0) lineItems.push({
			sNo: sNo++,
			description: "Guarantee Cheque Security (GL 21100)",
			chequeRef: "RV-GNTCHQ",
			maturityDate: currentData.date,
			type: "Cheque",
			amount: currentData.guaranteeChequeDeposit
		});
		const receiptPayload = {
			receipt_no: currentData.receiptNo,
			acknowledgement_no: currentData.acknowledgementNo || currentData.receiptNo,
			tenant_name: currentData.tenantName,
			property_name: currentData.propertyName,
			lease_no: currentData.leaseNo || `LES-${currentData.unitRef}`,
			location_code: currentData.unitRef,
			collection_date: currentData.date,
			lease_start_date: currentData.leaseStartDate,
			lease_end_date: currentData.leaseEndDate,
			line_items: lineItems,
			total_amount: currentData.totalCollected,
			amount_in_words: totalWords,
			prepared_by: currentData.cashierName || "Finance Cashier",
			remarks: currentData.notes || "Official payment acknowledgment."
		};
		try {
			const blob = await generateReceiptBlob(receiptPayload);
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `Official_Receipt_${currentData.receiptNo}_${currentData.tenantName.replace(/\W/g, "_")}.pdf`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (e) {
			console.error(e);
			alert("Error generating PDF receipt.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-3xl max-h-[92vh] overflow-y-auto p-0 border-0 bg-transparent shadow-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: printRef,
				className: "bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 p-6 md:p-8 rounded-xl border shadow-md space-y-6",
				children: [
					secondaryData && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-muted/70 p-2.5 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs font-semibold text-muted-foreground flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 text-purple-600 shrink-0" }), "Settlement Receipts (2 Generated):"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2 w-full sm:w-auto",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setActiveTab("primary"),
								className: `flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === "primary" ? "bg-purple-600 text-white shadow-sm ring-1 ring-purple-500" : "bg-background hover:bg-muted text-foreground border"}`,
								children: [
									"🧾 Receipt 1: Collection (QR ",
									data.totalCollected.toLocaleString(),
									")"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setActiveTab("secondary"),
								className: `flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === "secondary" ? "bg-purple-600 text-white shadow-sm ring-1 ring-purple-500" : "bg-background hover:bg-muted text-foreground border"}`,
								children: [
									"💳 Receipt 2: Refund (QR ",
									secondaryData.totalCollected.toLocaleString(),
									")"
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-6 w-6 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-xl font-bold tracking-tight text-primary",
								children: "ZYNO PROPERTY MANAGEMENT"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Leasing Operations & Treasury Division • State of Qatar"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "text-xs font-mono px-3 py-1 bg-primary/10 border-primary text-primary font-bold",
									children: activeTab === "secondary" && secondaryData ? "PAYMENT / REFUND VOUCHER" : "OFFICIAL PAYMENT RECEIPT"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs font-mono mt-1 text-muted-foreground",
									children: ["No: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-foreground",
										children: currentData.receiptNo
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: ["Date: ", currentData.date]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 text-primary font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tenant Particulars" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-bold text-foreground",
									children: currentData.tenantName
								}),
								currentData.tenantQid && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground",
									children: ["QID / CR No: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-foreground",
										children: currentData.tenantQid
									})]
								}),
								currentData.tenantPhone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground",
									children: ["Phone: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-foreground",
										children: currentData.tenantPhone
									})]
								}),
								currentData.tenantEmail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground",
									children: ["Email: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-foreground",
										children: currentData.tenantEmail
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 text-primary font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Lease & Premise Details" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold text-foreground",
									children: currentData.propertyName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground",
									children: ["Unit / Flat: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-primary font-mono",
										children: currentData.unitRef
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground",
									children: [
										"Lease Period: ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-foreground",
											children: currentData.leaseStartDate
										}),
										" to ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-foreground",
											children: currentData.leaseEndDate
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground",
									children: ["Monthly Rent: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
										className: "text-foreground",
										children: ["QR ", currentData.monthlyRent?.toLocaleString()]
									})]
								})
							]
						})]
					}),
					currentData.depositAmount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border rounded-lg p-3 bg-card flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold",
								children: activeTab === "secondary" ? "Security Deposit Refund Amount" : "Security Deposit / Principal Transaction"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: ["Channel: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: currentData.depositMode })]
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm font-bold text-emerald-600 font-mono",
								children: ["QR ", currentData.depositAmount?.toLocaleString()]
							})
						})]
					}),
					currentData.pdcs && currentData.pdcs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
									className: "text-xs font-bold uppercase tracking-wider",
									children: [
										"Post-Dated Cheques (PDC) Schedule (",
										currentData.pdcs.length,
										" Cheques)"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: ["Total PDCs: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["QR ", currentData.pdcs.reduce((s, p) => s + p.amount, 0).toLocaleString()] })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border rounded-lg overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "bg-muted/60 text-muted-foreground font-semibold border-b",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 px-3 text-left",
											children: "#"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 px-3 text-left",
											children: "Cheque No."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 px-3 text-left",
											children: "Bank"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 px-3 text-left",
											children: "Maturity Date"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 px-3 text-left",
											children: "Period"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 px-3 text-right",
											children: "Amount (QAR)"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-border",
									children: currentData.pdcs.map((pdc, idx) => {
										let displayPeriod = pdc.period || `Cheque ${idx + 1}`;
										if (pdc.tenureStart && pdc.tenureEnd) displayPeriod = `${pdc.tenureStart} to ${pdc.tenureEnd}`;
										else if (pdc.tenureStart) displayPeriod = `From ${pdc.tenureStart}`;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "hover:bg-muted/20",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-1.5 px-3 font-mono text-muted-foreground",
													children: idx + 1
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-1.5 px-3 font-mono font-bold text-primary",
													children: pdc.chequeNo
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-1.5 px-3",
													children: pdc.bank
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-1.5 px-3 font-mono",
													children: pdc.date
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-1.5 px-3 font-mono text-muted-foreground",
													children: displayPeriod
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "py-1.5 px-3 text-right font-mono font-semibold",
													children: ["QR ", pdc.amount.toLocaleString()]
												})
											]
										}, idx);
									})
								})]
							})
						})]
					}),
					currentData.vouchers && currentData.vouchers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5 bg-muted/20 p-3 rounded-lg border text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 font-semibold text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Financial Line Items & Sub-Ledger Posting" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 md:grid-cols-2 gap-2 mt-1",
							children: currentData.vouchers.map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center bg-background px-2.5 py-1.5 rounded border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold",
									children: v.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[10px] text-muted-foreground",
									children: [
										v.debit,
										" → ",
										v.credit
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono font-bold text-primary",
									children: ["QR ", v.amount.toLocaleString()]
								})]
							}, i))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t pt-4 space-y-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-center bg-primary/5 p-3 rounded-lg border border-primary/20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-muted-foreground uppercase",
								children: activeTab === "secondary" ? "Total Security Deposit Refund Paid" : "Total Acknowledged Collection"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs italic text-primary font-medium mt-0.5",
								children: totalWords
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xl font-extrabold text-primary font-mono",
									children: ["QR ", currentData.totalCollected.toLocaleString()]
								})
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-8 pt-8 text-center text-xs text-muted-foreground border-t",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-b pb-8 border-dashed" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 font-semibold text-foreground",
									children: "Tenant's Signature"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px]",
									children: "Received original duplicate copy"
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-b pb-8 border-dashed" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 font-semibold text-foreground",
									children: "Cashier / Prepared By"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px]",
									children: currentData.cashierName || "Finance Cashier"
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-b pb-8 border-dashed" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 font-semibold text-foreground",
									children: "Authorized Signatory"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px]",
									children: "ZYNO Property Management"
								})
							] })
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card p-4 rounded-b-xl border-t flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					children: "Close"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: handlePrint,
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-4 w-4" }), " Print Receipt"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: handleDownloadPdf,
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), " Download PDF Receipt"]
					})]
				})]
			})]
		})
	});
}
//#endregion
export { collectSecurityDeposit as a, returnPdc as c, clearPdc as i, settleDeposit as l, cancelPdc as n, depositPdc as o, cashDepositInPlaceOfPdc as r, receivePdc as s, ReceiptModal as t };
