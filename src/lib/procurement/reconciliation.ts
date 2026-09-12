import { supabase } from '../supabase';

export type ProcurementReconciliation = {
  po_id: string;
  po_number: string;
  po_amount: number;
  grn_amount: number;
  invoice_subtotal: number;
  posted_landed_cost: number;
  allocated_landed_cost: number;
  purchase_amount: number;
  accounting_event_count: number;
  posted_accounting_event_count: number;
  issue_count: number;
  issues: string[];
  reconciled: boolean;
};

export type ProcurementAuditRow = {
  id: string;
  entity_table: string;
  entity_id: string | null;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_row: Record<string, unknown> | null;
  new_row: Record<string, unknown> | null;
  changed_fields: string[];
  actor_user_id: string | null;
  created_at: string;
};

export async function reconcilePurchaseOrder(poId: string): Promise<ProcurementReconciliation> {
  const { data, error } = await supabase.rpc('proc_reconcile_po', { p_po_id: poId });
  if (error) throw error;
  return data as ProcurementReconciliation;
}

export async function getProcurementAuditLog(table: string, entityId: string, limit = 50): Promise<ProcurementAuditRow[]> {
  const { data, error } = await supabase.rpc('proc_get_audit_log', {
    p_entity_table: table,
    p_entity_id: entityId,
    p_limit: limit,
  });
  if (error) throw error;
  return (data ?? []) as ProcurementAuditRow[];
}
