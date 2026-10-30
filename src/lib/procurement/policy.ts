import { supabase } from '../supabase';

export type ProcurementApprovalPolicy = {
  allowed: boolean;
  enforcement_mode: 'REPORT_ONLY' | 'ENFORCE';
  policy_id?: string;
  policy_code?: string;
  version_no?: number;
  document_type?: string;
  amount?: number;
  actor_user_id?: string | null;
  actor_role?: string | null;
  required_role?: string | null;
  approval_sequence?: number;
  sla_hours?: number;
  escalation_role?: string | null;
  delegated?: boolean;
  reason: string;
};

export type ProcurementPolicySnapshot = {
  suite: 'PROCUREMENT_POLICY_ADMIN_SNAPSHOT';
  generated_at: string;
  active_policies: Array<Record<string, unknown>>;
  rules: Array<Record<string, unknown>>;
  delegations: Array<Record<string, unknown>>;
};

export async function resolveProcurementApprovalPolicy(amount: number, documentType = 'PO', tenantId?: string | null) {
  const { data, error } = await supabase.rpc('proc_resolve_approval_policy', {
    p_document_type: documentType,
    p_amount: amount,
    p_tenant_id: tenantId ?? null,
  });
  if (error) throw error;
  return data as ProcurementApprovalPolicy;
}

export async function getProcurementPolicySnapshot(tenantId?: string | null) {
  const { data, error } = await supabase.rpc('proc_policy_admin_snapshot', { p_tenant_id: tenantId ?? null });
  if (error) throw error;
  return data as ProcurementPolicySnapshot;
}

export async function activateProcurementPolicyVersion(policyId: string, effectiveTo?: string | null) {
  const { error } = await supabase
    .from('procurement_policy_versions')
    .update({ status: 'ACTIVE', effective_to: effectiveTo ?? null, updated_at: new Date().toISOString() })
    .eq('id', policyId);
  if (error) throw error;
}

export async function createProcurementPolicyVersion(input: {
  policyCode: string;
  versionNo: number;
  enforcementMode: 'REPORT_ONLY' | 'ENFORCE';
  effectiveFrom?: string;
  effectiveTo?: string | null;
  notes?: string;
}) {
  const { data, error } = await supabase.from('procurement_policy_versions').insert({
    policy_code: input.policyCode,
    version_no: input.versionNo,
    status: 'DRAFT',
    enforcement_mode: input.enforcementMode,
    effective_from: input.effectiveFrom ?? new Date().toISOString(),
    effective_to: input.effectiveTo ?? null,
    notes: input.notes ?? null,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function createProcurementPolicyRule(input: {
  policyVersionId: string;
  documentType?: string;
  minAmount: number;
  maxAmount?: number | null;
  requiredRole: string;
  approvalSequence?: number;
  slaHours?: number;
  escalationRole?: string | null;
}) {
  const { data, error } = await supabase.from('procurement_policy_rules').insert({
    policy_version_id: input.policyVersionId,
    document_type: input.documentType ?? 'PO',
    min_amount: input.minAmount,
    max_amount: input.maxAmount ?? null,
    required_role: input.requiredRole,
    approval_sequence: input.approvalSequence ?? 1,
    sla_hours: input.slaHours ?? 48,
    escalation_role: input.escalationRole ?? null,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function createProcurementDelegation(input: {
  policyVersionId?: string | null;
  sourceRole?: string | null;
  delegateRole?: string | null;
  sourceUserId?: string | null;
  delegateUserId?: string | null;
  maxAmount?: number | null;
  effectiveFrom: string;
  effectiveTo: string;
  reason?: string;
}) {
  const { data, error } = await supabase.from('procurement_approval_delegations').insert({
    policy_version_id: input.policyVersionId ?? null,
    source_role: input.sourceRole ?? null,
    delegate_role: input.delegateRole ?? null,
    source_user_id: input.sourceUserId ?? null,
    delegate_user_id: input.delegateUserId ?? null,
    max_amount: input.maxAmount ?? null,
    effective_from: input.effectiveFrom,
    effective_to: input.effectiveTo,
    reason: input.reason ?? null,
    status: 'ACTIVE',
  }).select().single();
  if (error) throw error;
  return data;
}
