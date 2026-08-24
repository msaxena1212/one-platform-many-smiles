import { supabase } from '../supabase';

export type ProcurementGovernance = {
  suite: 'PROCUREMENT_GOVERNANCE_DASHBOARD';
  period_days: number;
  from_timestamp: string;
  generated_at: string;
  policy_parameters: { po_approval_threshold: number; vendor_concentration_pct: number };
  governance_kpis: {
    audit_events: number; actorless_audit_events: number; delete_actions: number;
    high_value_po_count: number; high_value_unapproved_count: number;
    status_change_events: number; sod_same_actor_flags: number;
    open_critical_exceptions: number; policy_violation_count: number;
  };
  policy_violations: Array<{ policy_id: string; severity: string; count: number; detail: string }>;
  audit_activity: Array<{ event_date: string; event_count: number; actorless_count: number; delete_count: number }>;
  high_value_purchase_orders: Array<{ po_id: string; po_number: string; vendor_id: number; total_amount: number; status: string; created_at: string; approval_state_ok: boolean }>;
  vendor_concentration: Array<{ vendor_id: number; spend: number; spend_pct: number; po_count: number; concentration_flag: boolean }>;
};

export async function getProcurementGovernance(days = 90, poApprovalThreshold = 100000, vendorConcentrationPct = 50, limit = 25): Promise<ProcurementGovernance> {
  const { data, error } = await supabase.rpc('proc_governance_dashboard', {
    p_days: days,
    p_po_approval_threshold: poApprovalThreshold,
    p_vendor_concentration_pct: vendorConcentrationPct,
    p_limit: limit,
  });
  if (error) throw error;
  return data as ProcurementGovernance;
}
