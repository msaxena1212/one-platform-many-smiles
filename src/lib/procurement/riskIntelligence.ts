import { supabase } from '../supabase';

export type ProcurementRiskIntelligence = {
  suite: 'PROCUREMENT_RISK_INTELLIGENCE';
  period_days: number;
  from_timestamp: string;
  generated_at: string;
  threshold: number;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  kpis: {
    approval_requests: number;
    high_value_requests: number;
    sod_events: number;
    bypass_events: number;
    repeated_rejection_documents: number;
    sla_breaches: number;
    delegated_approvals: number;
  };
  signals: Array<{ code: string; severity: string; count: number; title: string; description: string }>;
  recommendations: string[];
  role_hotspots: Array<{ role: string; open_stages: number; escalated_stages: number; sla_breaches: number; sod_events: number; risk_points: number }>;
  vendor_concentration: Array<{ vendor_id: number; approved_po_count: number; total_amount: number; value_share_percent: number }>;
};

export async function getProcurementRiskIntelligence(days = 90, limit = 25, highValueThreshold = 100000) {
  const { data, error } = await supabase.rpc('proc_approval_risk_intelligence', {
    p_days: days,
    p_limit: limit,
    p_high_value_threshold: highValueThreshold,
  });
  if (error) throw error;
  return data as ProcurementRiskIntelligence;
}
