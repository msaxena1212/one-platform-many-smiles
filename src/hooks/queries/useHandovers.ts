import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, type KeyHandover, type InspectionReport } from "@/lib/supabase";

export function useKeyHandovers(leaseId?: string) {
  return useQuery({
    queryKey: ["key-handovers", leaseId],
    queryFn: async () => {
      let query = supabase
        .from("key_handovers")
        .select("*")
        .order("created_at", { ascending: false });

      if (leaseId) {
        query = query.eq("lease_id", leaseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as KeyHandover[];
    },
  });
}

export function useCreateKeyHandover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<KeyHandover, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("key_handovers")
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as KeyHandover;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["key-handovers"] });
    },
  });
}

export function useInspectionReports(leaseId?: string) {
  return useQuery({
    queryKey: ["inspection-reports", leaseId],
    queryFn: async () => {
      let query = supabase
        .from("inspection_reports")
        .select("*")
        .order("inspection_date", { ascending: false });

      if (leaseId) {
        query = query.eq("lease_id", leaseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as InspectionReport[];
    },
  });
}

export function useCreateInspectionReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<InspectionReport, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("inspection_reports")
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as InspectionReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspection-reports"] });
    },
  });
}
