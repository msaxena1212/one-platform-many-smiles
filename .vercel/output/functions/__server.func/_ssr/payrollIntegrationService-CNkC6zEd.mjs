import { B as supabase } from "./supabase-y7n1teoy.mjs";
import { s as FinPayrollSyncsApi } from "./supabase-finance-C-e2o6Ke.mjs";
import { f as resolveGlOnlyAccount, u as postVoucher } from "./posting-engine-Gd7ZPbDa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payrollIntegrationService-CNkC6zEd.js
var SALARY_EXPENSE_GLS = new Set(["50100", "50100001"]);
var PAYROLL_PAYABLE_GLS = new Set(["21900", "21900001"]);
var BANK_GLS = new Set(["12000", "12000001"]);
/**
* Handle API ingestion of External Payroll Runs
*/
async function syncPayrollRun(payload) {
	const { data: existing } = await supabase.from("fin_payroll_syncs").select("id").eq("payroll_run_id", payload.payroll_run_id).single();
	if (existing) throw new Error(`Payroll Run ${payload.payroll_run_id} has already been synced.`);
	let externalSalaryDebit = 0;
	let externalDeductionCredit = 0;
	let externalBankCredit = 0;
	for (const line of payload.lines) {
		const ac = String(line.account_code || "").trim();
		if (SALARY_EXPENSE_GLS.has(ac)) externalSalaryDebit += Number(line.debit || 0);
		else if (PAYROLL_PAYABLE_GLS.has(ac)) externalDeductionCredit += Number(line.credit || 0);
		else if (BANK_GLS.has(ac)) externalBankCredit += Number(line.credit || 0);
		else throw new Error(`Payroll line references an unsupported account_code "${ac}". Expected one of 50100, 21900, 12000.`);
	}
	const [salaryExp, payrollPayable, bank] = await Promise.all([
		resolveGlOnlyAccount("50100"),
		resolveGlOnlyAccount("21900"),
		resolveGlOnlyAccount("12000")
	]);
	const voucherLines = [{
		account_code: salaryExp.slCode,
		account_name: `${salaryExp.groupName} / ${salaryExp.className} / ${salaryExp.glName} / ${salaryExp.slName}`,
		debit: externalSalaryDebit,
		credit: 0,
		property_id: payload.lines[0]?.property_id,
		unit_id: payload.lines[0]?.unit_id,
		cost_center_id: payload.lines[0]?.cost_center_id,
		description: `Payroll ${payload.period} – Salary Expense`
	}];
	if (externalDeductionCredit > 0) voucherLines.push({
		account_code: payrollPayable.slCode,
		account_name: `${payrollPayable.groupName} / ${payrollPayable.className} / ${payrollPayable.glName} / ${payrollPayable.slName}`,
		debit: 0,
		credit: externalDeductionCredit,
		property_id: payload.lines[0]?.property_id,
		unit_id: payload.lines[0]?.unit_id,
		cost_center_id: payload.lines[0]?.cost_center_id,
		description: `Payroll ${payload.period} – Net Pay Payable`
	});
	voucherLines.push({
		account_code: bank.slCode,
		account_name: `${bank.groupName} / ${bank.className} / ${bank.glName} / ${bank.slName}`,
		debit: 0,
		credit: externalBankCredit,
		property_id: payload.lines[0]?.property_id,
		unit_id: payload.lines[0]?.unit_id,
		cost_center_id: payload.lines[0]?.cost_center_id,
		description: `Payroll ${payload.period} – Bank Disbursement`
	});
	const totalDebit = voucherLines.reduce((s, l) => s + l.debit, 0);
	const syncRecord = await FinPayrollSyncsApi.create({
		payroll_run_id: payload.payroll_run_id,
		period: payload.period,
		status: "Pending",
		total_amount: totalDebit
	});
	try {
		const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		await postVoucher({
			voucher_date: today,
			voucher_type: "Journal",
			description: `External Payroll Sync Run: ${payload.payroll_run_id}`,
			reference_no: payload.payroll_run_id,
			lines: voucherLines
		});
		await FinPayrollSyncsApi.update(syncRecord.id, { status: "Posted" });
		return {
			success: true,
			syncId: syncRecord.id
		};
	} catch (error) {
		await FinPayrollSyncsApi.update(syncRecord.id, {
			status: "Failed",
			error_details: error.message || "Unknown error during payroll journal posting"
		});
		throw error;
	}
}
//#endregion
export { syncPayrollRun as t };
