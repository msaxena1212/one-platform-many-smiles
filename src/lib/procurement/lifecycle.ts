import { supabase } from '../supabase';

export type ThreeWayMatchResult = {
  status: 'PASSED' | 'FAILED' | 'OVERRIDE';
  passed: boolean;
  details: Record<string, unknown>;
};

export type LifecycleValidation = {
  po: { id: string; doc_number: string; status: string };
  pr_approved: boolean;
  quote_selected: boolean;
  po_approved: boolean;
  grn_posted: boolean;
  invoice_present: boolean;
  three_way_match_passed: boolean;
  ready_for_capitalization: boolean;
};

export async function runThreeWayMatch(invoiceId: string, toleranceAmount = 0.01): Promise<ThreeWayMatchResult> {
  const { data, error } = await supabase.rpc('proc_run_three_way_match', {
    p_invoice_id: invoiceId,
    p_tolerance_amount: toleranceAmount,
  });
  if (error) throw error;
  return data as ThreeWayMatchResult;
}

export async function allocateLandedCost(landedCostId: string) {
  const { data, error } = await supabase.rpc('proc_allocate_landed_cost', {
    p_landed_cost_id: landedCostId,
  });
  if (error) throw error;
  return data as { purchase_id: string; landed_cost_id: string; allocated_amount: number; basis: string };
}

export async function validateProcurementLifecycle(purchaseOrderId: string): Promise<LifecycleValidation> {
  const { data, error } = await supabase.rpc('proc_validate_lifecycle', { p_po_id: purchaseOrderId });
  if (error) throw error;
  return data as LifecycleValidation;
}

export async function finalizePurchase(purchaseId: string) {
  const { data, error } = await supabase.rpc('proc_finalize_purchase', { p_purchase_id: purchaseId });
  if (error) throw error;
  return data as { purchase_id: string; status: string; ready_for_capitalization: boolean };
}

export async function getThreeWayMatch(invoiceId: string) {
  const { data, error } = await supabase
    .from('proc_three_way_matches')
    .select('*')
    .eq('payable_invoice_id', invoiceId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
