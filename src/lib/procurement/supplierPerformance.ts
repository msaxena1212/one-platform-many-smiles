import { supabase } from '../supabase';

export type ProcurementSupplierPerformance = {
  suite: 'PROCUREMENT_SUPPLIER_PERFORMANCE';
  period_days: number;
  from_date: string;
  generated_at: string;
  concentration_threshold: number;
  kpis: {
    total_spend: number;
    approved_pos: number;
    supplier_count: number;
    quote_count: number;
    selected_quotes: number;
    quote_award_rate: number;
    award_rate: number;
    grn_count: number;
    otif_rate: number;
    quality_acceptance_rate: number;
    outstanding_payables: number;
  };
  suppliers: Array<{
    vendor_id: number;
    vendor_code: string | null;
    vendor_name: string | null;
    po_count: number;
    spend: number;
    avg_po: number;
    quote_count: number;
    selected_quotes: number;
    award_rate: number;
    grn_count: number;
    otif_rate: number;
    acceptance_rate: number;
    outstanding: number;
    spend_share: number;
    concentration_flag: boolean;
    performance_score: number;
  }>;
  concentration: Array<{ vendor_id: number; vendor_name: string | null; spend: number; spend_share: number; concentration_flag: boolean }>;
  methodology: string[];
};

export async function getProcurementSupplierPerformance(days = 365, limit = 25, concentrationThreshold = 30) {
  const { data, error } = await supabase.rpc('procurement_supplier_performance', {
    p_days: days,
    p_limit: limit,
    p_concentration_threshold: concentrationThreshold,
  });
  if (error) throw error;
  return data as ProcurementSupplierPerformance;
}
