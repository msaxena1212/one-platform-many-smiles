import { supabase } from '../supabase';

export type ProcurementAnomalyIntelligence = {
  suite: 'PROCUREMENT_ANOMALY_INTELLIGENCE';
  period_days: number;
  from_timestamp: string;
  generated_at: string;
  threshold: number;
  anomaly_score: number;
  anomaly_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  kpis: {
    anomalies: number;
    critical: number;
    high: number;
    medium: number;
    duplicate_po: number;
    price_variance: number;
    split_po: number;
    unusual_amount: number;
    after_hours_approval: number;
    vendor_frequency: number;
  };
  cases: Array<{ reference_id: string; reference_number: string; code: string; severity: string; severity_rank: number; reason: string; vendor_id: string | null; total_amount: number | null; detected_at: string }>;
  recommendations: string[];
  methodology: string[];
};

export async function getProcurementAnomalyIntelligence(days = 90, limit = 50, highValueThreshold = 100000) {
  const { data, error } = await supabase.rpc('procurement_anomaly_intelligence', {
    p_days: days,
    p_limit: limit,
    p_high_value_threshold: highValueThreshold,
  });
  if (error) throw error;
  return data as ProcurementAnomalyIntelligence;
}
