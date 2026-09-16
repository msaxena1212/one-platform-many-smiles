import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, type Reservation } from "@/lib/supabase";

export interface CreateReservationInput {
  unit_id?: string;
  prospect_name: string;
  prospect_contact: string;
  prospect_id_type?: string;
  prospect_id_number?: string;
  proposed_lease_period?: number;
  expected_start_date?: string;
  proposed_rental_amount?: number;
  reservation_validity?: string;
  special_conditions?: string;
  status?: "Active" | "Extended" | "Cancelled" | "Expired" | "Converted" | "Reserved";
}

export function useReservations() {
  return useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          units:unit_id(unit_number, floor, rent_amount, property_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as (Reservation & { units?: any })[];
    },
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateReservationInput) => {
      const { data, error } = await supabase
        .from("reservations")
        .insert({
          ...payload,
          status: payload.status || "Active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update unit status to Reserved
      if (payload.unit_id) {
        await supabase
          .from("units")
          .update({ status: "Reserved", updated_at: new Date().toISOString() })
          .eq("id", payload.unit_id);
      }

      return data as Reservation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "Active" | "Extended" | "Cancelled" | "Expired" | "Converted" | "Reserved";
    }) => {
      const { data, error } = await supabase
        .from("reservations")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Reservation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });
}
