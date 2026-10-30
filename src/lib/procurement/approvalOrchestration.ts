import { supabase } from '../supabase';

export type ApprovalQueue = {
  generated_at: string;
  requests: Array<Record<string, unknown>>;
  stages: Array<Record<string, unknown>>;
  history: Array<Record<string, unknown>>;
};

export async function submitProcurementApprovalRequest(documentType: 'PO', documentId: string) {
  const { data, error } = await supabase.rpc('proc_submit_approval_request', { p_document_type: documentType, p_document_id: documentId });
  if (error) throw error;
  return data as Record<string, unknown>;
}

export async function decideProcurementApprovalStage(stageId: string, decision: 'APPROVED' | 'REJECTED', remarks?: string) {
  const { data, error } = await supabase.rpc('proc_approve_stage', { p_stage_id: stageId, p_decision: decision, p_remarks: remarks ?? null });
  if (error) throw error;
  return data as Record<string, unknown>;
}

export async function escalateDueProcurementApprovals(limit = 100) {
  const { data, error } = await supabase.rpc('proc_escalate_due_approvals', { p_limit: limit });
  if (error) throw error;
  return data as Record<string, unknown>;
}

export async function getProcurementApprovalQueue(limit = 100) {
  const { data, error } = await supabase.rpc('proc_approval_queue', { p_limit: limit });
  if (error) throw error;
  return data as ApprovalQueue;
}

export async function getProcurementApprovalRequestDetail(requestId: string) {
  const { data, error } = await supabase.rpc('proc_approval_request_detail', { p_request_id: requestId });
  if (error) throw error;
  return data as { request: Record<string, unknown> | null; stages: Array<Record<string, unknown>>; history: Array<Record<string, unknown>> };
}
