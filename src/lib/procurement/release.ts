import { supabase } from '../supabase';

export type ProcurementReleaseReadiness = {
  po_id: string;
  po_number: string;
  ready: boolean;
  issue_count: number;
  issues: string[];
  checks: Record<string, boolean | number>;
};

export type ProcurementSchemaSmokeCheck = {
  ready: boolean;
  missing_tables: string[];
  checked_table_count: number;
};

export async function getProcurementReleaseReadiness(poId: string): Promise<ProcurementReleaseReadiness> {
  const { data, error } = await supabase.rpc('proc_release_readiness', { p_po_id: poId });
  if (error) throw error;
  return data as ProcurementReleaseReadiness;
}

export async function runProcurementSchemaSmokeCheck(): Promise<ProcurementSchemaSmokeCheck> {
  const { data, error } = await supabase.rpc('proc_schema_smoke_check');
  if (error) throw error;
  return data as ProcurementSchemaSmokeCheck;
}
