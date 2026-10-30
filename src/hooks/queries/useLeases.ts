import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, type Lease } from "@/lib/supabase";

export interface CreateLeaseInput {
  property_id: string;
  unit_id?: string;
  customer_id: string;
  lease_number: string;
  lease_status?: string;
  commencement_date: string;
  expiry_date: string;
  lease_period_months: number;
  rental_amount: number;
  payment_frequency: "Monthly" | "Quarterly" | "Semi-Annually" | "Annually";
  security_deposit?: number;
  number_of_pdc?: number;
  grace_period_days?: number;
  special_conditions?: string;
  tenant_name?: string;
  unit_ref?: string;
}

export function useLeases() {
  return useQuery({
    queryKey: ["leases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select(`
          *,
          properties:property_id(title, address, city, country),
          customers:customer_id(full_name, mobile_number, email_address, qatar_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Lease[];
    },
  });
}

export function useLease(id: string | undefined) {
  return useQuery({
    queryKey: ["leases", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("leases")
        .select(`
          *,
          properties:property_id(title, address, city, country),
          customers:customer_id(full_name, mobile_number, email_address, qatar_id)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as unknown as Lease;
    },
    enabled: Boolean(id),
  });
}

export function useCreateLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLeaseInput) => {
      const { data, error } = await supabase
        .from("leases")
        .insert({
          ...payload,
          lease_status: payload.lease_status || "draft",
          security_deposit_status: "Pending",
          late_penalty_percentage: 0,
          late_penalty_fixed: 0,
          notice_period_days: 30,
          maintenance_responsibility: "Landlord",
          utility_responsibility: "Tenant",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update unit status to Reserved or Occupied if unit_id is provided
      if (payload.unit_id) {
        await supabase
          .from("units")
          .update({ status: "Occupied", updated_at: new Date().toISOString() })
          .eq("id", payload.unit_id);
      }

      return data as Lease;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leases"] });
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useUpdateLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Lease> }) => {
      const { data, error } = await supabase
        .from("leases")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Lease;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leases"] });
      queryClient.invalidateQueries({ queryKey: ["leases", variables.id] });
    },
  });
}
