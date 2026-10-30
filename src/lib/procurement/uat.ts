import { supabase } from '../supabase';

export type ProcurementUatResult = {
  suite: 'PROCUREMENT_E2E_UAT';
  po_id: string;
  po_number: string;
  passed: boolean;
  test_count: number;
  passed_count: number;
  failed_count: number;
  tests: Array<{ id: string; passed: boolean; detail: string }>;
  reconciliation: Record<string, unknown>;
  release_readiness: Record<string, unknown>;
  lifecycle: Record<string, unknown>;
  generated_at: string;
};

export async function validateProcurementUat(poId: string): Promise<ProcurementUatResult> {
  const { data, error } = await supabase.rpc('proc_uat_validate_po', { p_po_id: poId });
  if (error) throw error;
  return data as ProcurementUatResult;
}

export type ProcurementUatDashboard = {
  suite: 'PROCUREMENT_E2E_UAT_DASHBOARD';
  purchase_orders_checked: number;
  passed_purchase_orders: number;
  failed_purchase_orders: number;
  all_passed: boolean;
  results: Array<{ po_id: string; po_number: string; passed: boolean; passed_count: number; failed_count: number }>;
  generated_at: string;
};

export async function getProcurementUatDashboard(limit = 25): Promise<ProcurementUatDashboard> {
  const { data, error } = await supabase.rpc('proc_uat_dashboard', { p_limit: limit });
  if (error) throw error;
  return data;
}
