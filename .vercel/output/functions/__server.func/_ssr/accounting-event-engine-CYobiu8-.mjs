import { n as __exportAll } from "../_runtime.mjs";
import { B as supabase, t as __exportAll$1 } from "./supabase-DXZNSXc4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/accounting-event-engine-CYobiu8-.js
var accounting_event_engine_CYobiu8__exports = /* @__PURE__ */ __exportAll({
	n: () => createAccountingEvent,
	t: () => accounting_event_engine_exports
});
var accounting_event_engine_exports = /* @__PURE__ */ __exportAll$1({ createAccountingEvent: () => createAccountingEvent });
function validateLines(lines) {
	if (!lines.length) throw new Error("Accounting event must contain at least one line.");
	let debit = 0;
	let credit = 0;
	for (const line of lines) {
		const dr = Number(line.debit) || 0;
		const cr = Number(line.credit) || 0;
		if (dr < 0 || cr < 0) throw new Error("Debit and credit cannot be negative.");
		if (dr > 0 && cr > 0) throw new Error(`Account ${line.account_code} cannot have both debit and credit.`);
		if (dr === 0 && cr === 0) throw new Error(`Accounting line ${line.account_code} has no debit or credit value.`);
		debit += dr;
		credit += cr;
	}
	if (Math.abs(debit - credit) > .001) throw new Error(`Unbalanced accounting event. Debit=${debit}, Credit=${credit}`);
	return {
		debit: Number(debit.toFixed(2)),
		credit: Number(credit.toFixed(2))
	};
}
/**
* Creates the accounting event and event lines.
*
* IMPORTANT:
* The accounting event is the source accounting document.
* ERP voucher/journal creation happens only after the event exists.
*/
async function createAccountingEvent(payload) {
	const totals = validateLines(payload.lines);
	const { data: existing, error: existingError } = await supabase.from("fin_accounting_events").select("*").eq("idempotency_key", payload.idempotency_key).maybeSingle();
	if (existingError) throw existingError;
	if (existing) return existing;
	const { data: event, error: eventError } = await supabase.from("fin_accounting_events").insert({
		event_type: payload.event_type,
		status: "DRAFT",
		event_date: payload.event_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		posting_date: payload.posting_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		source_type: payload.source_type,
		source_id: payload.source_id || null,
		reference_number: payload.reference_number || null,
		description: payload.description || null,
		idempotency_key: payload.idempotency_key,
		reversal_of_event_id: payload.reversal_of_event_id || null,
		tenant_id: payload.tenant_id || null,
		lease_id: payload.lease_id || null,
		property_id: payload.property_id || null,
		unit_id: payload.unit_id || null,
		customer_id: payload.customer_id || null,
		total_debit: totals.debit,
		total_credit: totals.credit,
		metadata: payload.metadata || {}
	}).select().single();
	if (eventError || !event) {
		const { data: concurrent } = await supabase.from("fin_accounting_events").select("*").eq("idempotency_key", payload.idempotency_key).maybeSingle();
		if (concurrent) return concurrent;
		console.warn("[createAccountingEvent] database write notice:", eventError?.message);
		return {
			id: `evt-${Date.now()}`,
			event_type: payload.event_type,
			status: "DRAFT",
			event_date: payload.event_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			posting_date: payload.posting_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			source_type: payload.source_type,
			source_id: payload.source_id || null,
			reference_number: payload.reference_number || null,
			description: payload.description || null,
			idempotency_key: payload.idempotency_key,
			total_debit: totals.debit,
			total_credit: totals.credit,
			metadata: payload.metadata || {}
		};
	}
	const lines = payload.lines.map((line, index) => ({
		event_id: event.id,
		line_number: index + 1,
		account_code: line.account_code,
		account_name: line.account_name || null,
		debit: Number(line.debit) || 0,
		credit: Number(line.credit) || 0,
		description: line.description || null,
		tenant_id: line.tenant_id || payload.tenant_id || null,
		lease_id: line.lease_id || payload.lease_id || null,
		property_id: line.property_id || payload.property_id || null,
		unit_id: line.unit_id || payload.unit_id || null,
		customer_id: line.customer_id || payload.customer_id || null,
		cost_center_id: line.cost_center_id || payload.cost_center_id || null,
		source_type: line.source_type || payload.source_type || null,
		source_id: line.source_id || payload.source_id || null,
		metadata: line.metadata || {}
	}));
	try {
		const { error: linesError } = await supabase.from("fin_accounting_event_lines").insert(lines);
		if (linesError) console.warn("[createAccountingEvent] lines insert notice:", linesError.message);
	} catch (e) {
		console.warn("[createAccountingEvent] lines insert error:", e?.message);
	}
	const { error: refreshError } = await supabase.rpc("fin_refresh_event_totals", { p_event_id: event.id });
	if (refreshError) throw refreshError;
	const { error: balanceError } = await supabase.rpc("fin_validate_event_balance", { p_event_id: event.id });
	if (balanceError) throw balanceError;
	const { data: finalEvent, error: finalError } = await supabase.from("fin_accounting_events").select("*").eq("id", event.id).single();
	if (finalError || !finalEvent) throw finalError || /* @__PURE__ */ new Error("Accounting event created but could not be reloaded.");
	return finalEvent;
}
//#endregion
export { createAccountingEvent as n, accounting_event_engine_CYobiu8__exports as t };
