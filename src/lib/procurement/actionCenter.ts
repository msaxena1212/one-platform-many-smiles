import { supabase } from '../supabase';

export type ProcurementActionItem = {
  id: string;
  signal_key: string;
  source_type: string;
  source_id: string | null;
  source_reference: string | null;
  action_code: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED';
  owner_user_id: string | null;
  due_at: string | null;
  evidence_reference: string | null;
  resolution_notes: string | null;
  acknowledged_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProcurementActionCenter = {
  suite: 'PROCUREMENT_ACTION_CENTER';
  generated_at: string;
  kpis: { open_count: number; acknowledged_count: number; in_progress_count: number; overdue_count: number; critical_count: number; unassigned_count: number };
  items: ProcurementActionItem[];
  methodology: string[];
};

export async function refreshProcurementActionCenter(days = 30, dueHours = 24, limit = 100) {
  const { data, error } = await supabase.rpc('proc_refresh_action_center', { p_days: days, p_due_hours: dueHours, p_limit: limit });
  if (error) throw error;
  await supabase.rpc('proc_refresh_exception_actions', { p_limit: limit });
  return data;
}

export async function getProcurementActionCenter(limit = 100): Promise<ProcurementActionCenter> {
  const { data, error } = await supabase.rpc('proc_action_center', { p_limit: limit });
  if (error) throw error;
  return data as ProcurementActionCenter;
}

export async function updateProcurementActionItem(input: {
  actionId: string;
  status: ProcurementActionItem['status'];
  ownerUserId?: string | null;
  dueAt?: string | null;
  resolutionNotes?: string | null;
  evidenceReference?: string | null;
}) {
  const { data, error } = await supabase.rpc('proc_update_action_item', {
    p_action_id: input.actionId,
    p_status: input.status,
    p_owner_user_id: input.ownerUserId || null,
    p_due_at: input.dueAt || null,
    p_resolution_notes: input.resolutionNotes || null,
    p_evidence_reference: input.evidenceReference || null,
  });
  if (error) throw error;
  return data;
}
