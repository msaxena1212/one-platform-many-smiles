import { supabase } from "@/lib/supabase";

export interface AssetAssignment {
  id: string;
  asset_id: string;
  lease_id: string;
  unit_id?: string;
  property_id?: string;
  assigned_date: string;
  return_date?: string | null;
  condition_on_handover: string;
  condition_on_return?: string | null;
  handover_notes?: string;
  return_notes?: string;
  status: "assigned" | "returned" | "damaged" | "lost" | "maintenance";
  created_at?: string;
  asset_name?: string;
  asset_code?: string;
  asset_category?: string;
}

export async function fetchAssignmentsForLease(leaseId: string): Promise<AssetAssignment[]> {
  try {
    const { data, error } = await supabase
      .from("asset_assignments")
      .select(`
        *,
        assets:asset_id (
          id,
          name,
          asset_code,
          category
        )
      `)
      .eq("lease_id", leaseId);

    if (error) {
      console.warn("Failed to fetch asset assignments:", error);
      return [];
    }

    return (data || []).map((row: any) => ({
      ...row,
      asset_name: row.assets?.name || "Asset",
      asset_code: row.assets?.asset_code || "",
      asset_category: row.assets?.category || "General",
    }));
  } catch (err) {
    console.error("Error fetching asset assignments:", err);
    return [];
  }
}

export async function createAssetAssignment(
  assignment: Omit<AssetAssignment, "id" | "created_at" | "asset_name" | "asset_code" | "asset_category">
): Promise<AssetAssignment | null> {
  try {
    const { data, error } = await supabase
      .from("asset_assignments")
      .insert([assignment])
      .select()
      .single();

    if (error) {
      console.error("Error creating asset assignment:", error);
      return null;
    }
    return data as AssetAssignment;
  } catch (err) {
    console.error("Exception creating asset assignment:", err);
    return null;
  }
}

export async function returnAssetAssignment(
  assignmentId: string,
  params: {
    return_date: string;
    condition_on_return: string;
    return_notes?: string;
    status: "returned" | "damaged" | "lost" | "maintenance";
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("asset_assignments")
      .update({
        return_date: params.return_date,
        condition_on_return: params.condition_on_return,
        return_notes: params.return_notes || "",
        status: params.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", assignmentId);

    if (error) {
      console.error("Error returning asset assignment:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception returning asset assignment:", err);
    return false;
  }
}
