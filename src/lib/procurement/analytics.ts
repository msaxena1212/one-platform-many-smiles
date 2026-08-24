import { supabase } from '../supabase';

export type ProcurementAnalytics = {
  suite: 'PROCUREMENT_ANALYTICS_DASHBOARD';
  period_days: number;
  from_timestamp: string;
  generated_at: string;
  kpis: {
    total_spend: number;
    po_count: number;
    open_po_count: number;
    overdue_po_count: number;
    grn_count: number;
    invoice_count: number;
    exception_count: number;
    open_exception_count: number;
  };
  cycle_times: { avg_pr_to_po_days: number; avg_po_to_grn_days: number; avg_po_to_ap_days: number };
  sla: { pr_to_po_days: number; po_to_grn_days: number; po_to_ap_days: number; exception_resolution_days: number };
  exception_age: { avg_open_exception_age_days: number };
  spend_by_month: Array<{ month: string; spend: number; po_count: number }>;
  vendor_performance: Array<{ vendor_id: number; spend: number; po_count: number; completed_po_count: number; overdue_po_count: number; planned_delivery_days: number | null }>;
  overdue_purchase_orders: Array<{ po_id: string; po_number: string; vendor_id: number; total_amount: number; expected_delivery_date: string; days_overdue: number }>;
  open_exceptions: Array<{ exception_key: string; source_number: string; control_id: string; severity: string; status: string; age_days: number; resolution_notes: string | null }>;
};

export async function getProcurementAnalytics(days = 90, limit = 20): Promise<ProcurementAnalytics> {
  const { data, error } = await supabase.rpc('proc_analytics_dashboard', { p_days: days, p_limit: limit });
  if (error) throw error;
  return data as ProcurementAnalytics;
}
