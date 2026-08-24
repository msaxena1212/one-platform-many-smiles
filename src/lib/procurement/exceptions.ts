import { supabase } from '../supabase';

export type ProcurementException = {
  exception_key: string;
  source_type: string;
  source_id: string;
  source_number: string;
  control_id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detail: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REOPENED';
  resolution_id?: string | null;
  resolution_notes?: string | null;
  assigned_to?: string | null;
  resolved_by?: string | null;
  resolved_at?: string | null;
};

export type ProcurementExceptionQueue = {
  suite: 'PROCUREMENT_EXCEPTION_QUEUE';
  exception_count: number;
  exceptions: ProcurementException[];
  generated_at: string;
};

export async function getProcurementExceptionQueue(limit = 50): Promise<ProcurementExceptionQueue> {
  const { data, error } = await supabase.rpc('proc_exception_queue', { p_limit: limit });
  if (error) throw error;
  return data as ProcurementExceptionQueue;
}

export async function resolveProcurementException(input: {
  exceptionKey: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REOPENED';
  resolutionNotes?: string;
  assignedTo?: string | null;
}) {
  const { data, error } = await supabase.rpc('proc_resolve_exception', {
    p_exception_key: input.exceptionKey,
    p_status: input.status,
    p_resolution_notes: input.resolutionNotes || null,
    p_assigned_to: input.assignedTo || null,
  });
  if (error) throw error;
  return data;
}

export async function reopenProcurementException(exceptionKey: string, reason?: string) {
  const { data, error } = await supabase.rpc('proc_reopen_exception', {
    p_exception_key: exceptionKey,
    p_reason: reason || null,
  });
  if (error) throw error;
  return data;
}
