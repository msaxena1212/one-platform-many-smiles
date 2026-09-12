import { supabase } from '../supabase';

export type ProcurementApprovalIntelligence = {
  suite: 'PROCUREMENT_APPROVAL_INTELLIGENCE';
  period_days: number;
  from_timestamp: string;
  generated_at: string;
  threshold: number;
  health_score: number;
  kpis: {
    completed_requests: number;
    approved_requests: number;
    rejected_requests: number;
    pending_requests: number;
    overdue_stages: number;
    due_24h_stages: number;
    total_stages: number;
    approved_stages: number;
  };
  performance: {
    avg_stage_completion_hours: number;
    avg_request_cycle_days: number;
    sla_compliance_percent: number;
    rejection_rate_percent: number;
    escalation_rate_percent: number;
    delegation_utilization_percent: number;
  };
  aging: Array<{ bucket: string; count: number }>;
  workload_by_role: Array<{ role: string; pending_count: number; overdue_count: number; completed_stage_count: number; avg_completion_hours: number | null }>;
  bottlenecks: Array<{ role: string; approved_stage_count: number; avg_cycle_hours: number | null; avg_variance_hours: number | null; sla_breach_count: number }>;
  high_value_requests: Array<{ request_id: string; document_id: string; document_type: string; status: string; submitted_at: string; completed_at: string | null; total_amount: number; stage_count: number; approved_stage_count: number; escalated_stage_count: number }>;
  monthly_trends: Array<{ period: string; request_count: number; approved_count: number; rejected_count: number; avg_cycle_days: number }>;
};

export async function getProcurementApprovalIntelligence(
  days = 90,
  limit = 20,
  highValueThreshold = 100000,
): Promise<ProcurementApprovalIntelligence> {
  const { data, error } = await supabase.rpc('proc_approval_intelligence_dashboard', {
    p_days: days,
    p_limit: limit,
    p_high_value_threshold: highValueThreshold,
  });
  if (error) throw error;
  return data as ProcurementApprovalIntelligence;
}
