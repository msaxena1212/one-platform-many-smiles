import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface FinVoucher {
  id: string;
  voucher_no: string;
  voucher_type: "receipt" | "payment" | "journal" | "invoice";
  voucher_date: string;
  party_type?: string;
  party_id?: string;
  total_amount: number;
  status: "draft" | "posted" | "shared" | "settled" | "reversed";
  narration?: string;
  created_at?: string;
}

export function useFinanceVouchers(filters?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: ["finance-vouchers", filters],
    queryFn: async () => {
      let query = supabase
        .from("fin_vouchers")
        .select("*")
        .order("voucher_date", { ascending: false });

      if (filters?.type && filters.type !== "all") {
        query = query.eq("voucher_type", filters.type);
      }
      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as FinVoucher[];
    },
  });
}

export function useCreateFinanceVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<FinVoucher, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("fin_vouchers")
        .insert({
          ...payload,
          status: payload.status || "posted",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as FinVoucher;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["pdcs"] });
    },
  });
}
