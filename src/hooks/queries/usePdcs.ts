import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface PdcRecord {
  id: string;
  lease_id?: string;
  cheque_number: string;
  bank_name: string;
  cheque_date: string;
  amount: number;
  status: "In Hand" | "Deposited" | "Cleared" | "Returned" | "Replaced" | "Cancelled" | "Partial Cash";
  tenant_name?: string;
  drawer_name?: string;
  remarks?: string;
  created_at?: string;
}

export function usePdcs(filters?: { status?: string; leaseId?: string }) {
  return useQuery({
    queryKey: ["pdcs", filters],
    queryFn: async () => {
      let query = supabase
        .from("fin_pdc_register")
        .select("*")
        .order("cheque_date", { ascending: true });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.leaseId) {
        query = query.eq("lease_id", filters.leaseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PdcRecord[];
    },
  });
}

export function useCreatePdc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<PdcRecord, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("fin_pdc_register")
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as PdcRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdcs"] });
    },
  });
}

export function useUpdatePdcStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      clearingDate,
      remarks,
    }: {
      id: string;
      status: PdcRecord["status"];
      clearingDate?: string;
      remarks?: string;
    }) => {
      const updates: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (clearingDate) updates.clearing_date = clearingDate;
      if (remarks) updates.remarks = remarks;

      const { data, error } = await supabase
        .from("fin_pdc_register")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as PdcRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdcs"] });
      queryClient.invalidateQueries({ queryKey: ["finance-vouchers"] });
    },
  });
}
