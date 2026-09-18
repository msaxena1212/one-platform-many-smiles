import { B as supabase } from "./supabase-y7n1teoy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/supabase-finance-C-e2o6Ke.js
function createFinanceCrud(tableName, defaultSort = "id") {
	return {
		fetchAll: async () => {
			const { data, error } = await supabase.from(tableName).select("*").order(defaultSort);
			if (error) throw error;
			return data || [];
		},
		create: async (payload) => {
			const { data, error } = await supabase.from(tableName).insert(payload).select().single();
			if (error) throw error;
			return data;
		},
		update: async (id, payload) => {
			const { error } = await supabase.from(tableName).update(payload).eq("id", id);
			if (error) throw error;
		},
		delete: async (id) => {
			const { error } = await supabase.from(tableName).delete().eq("id", id);
			if (error) throw error;
		}
	};
}
var FinFinancialYearsApi = createFinanceCrud("fin_financial_years", "name");
var FinRegionsApi = createFinanceCrud("fin_regions", "code");
var FinVendorsApi = createFinanceCrud("fin_vendors", "code");
var FinCustomersApi = createFinanceCrud("fin_customers", "code");
var FinCostCentersApi = createFinanceCrud("fin_cost_centers", "code");
var FinPostingPeriodsApi = createFinanceCrud("fin_posting_periods", "period_name");
var FinBanksApi = createFinanceCrud("fin_banks", "name");
var FinBankAccountsApi = createFinanceCrud("fin_bank_accounts", "account_number");
var FinPdcRegisterApi = createFinanceCrud("fin_pdc_register", "cheque_date");
var FinDepositsApi = createFinanceCrud("fin_deposits", "id");
var FinPayrollSyncsApi = createFinanceCrud("fin_payroll_syncs", "period");
//#endregion
export { FinDepositsApi as a, FinPdcRegisterApi as c, FinVendorsApi as d, FinCustomersApi as i, FinPostingPeriodsApi as l, FinBanksApi as n, FinFinancialYearsApi as o, FinCostCentersApi as r, FinPayrollSyncsApi as s, FinBankAccountsApi as t, FinRegionsApi as u };
