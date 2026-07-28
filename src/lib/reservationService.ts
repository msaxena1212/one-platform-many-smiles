import { supabase, type Reservation } from "./supabase";

/**
 * Create or update a reservation in the database.
 * Uses the correct table name: lease_reservations
 */
export async function createReservation(reservation: Reservation): Promise<Reservation> {
  const { data, error } = await supabase
    .from("lease_reservations")
    .upsert(reservation, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("Supabase error creating reservation:", error);
    throw error;
  }

  return data as Reservation;
}

/**
 * Schedule expiry notification for a reservation.
 * Returns a notification ID string.
 */
export function scheduleReservationExpiryNotification(
  reservationId: string,
  daysUntilExpiry: number,
  callback: () => void
): string {
  const notificationId = `notif-${reservationId}`;
  setTimeout(() => {
    callback();
  }, daysUntilExpiry * 24 * 60 * 60 * 1000);
  return notificationId;
}

/**
 * Get reservations expiring soon (within daysAhead days).
 * Uses the correct table name (lease_reservations) and filter field (valid_until).
 */
export async function getExpiringReservations(daysAhead: number = 7) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() + 1);

  const toDate = new Date();
  toDate.setDate(toDate.getDate() + daysAhead);

  const { data, error } = await supabase
    .from("lease_reservations")
    .select("*")
    .gte("valid_until", fromDate.toISOString().split("T")[0])
    .lte("valid_until", toDate.toISOString().split("T")[0])
    .neq("status", "converted")
    .neq("status", "expired")
    .neq("status", "released");

  if (error) {
    console.error("Error fetching expiring reservations:", error);
    return [];
  }

  return data as Reservation[];
}

/**
 * Update reservation status in the database.
 */
export async function updateReservationStatus(
  reservationId: string,
  status: "reserved" | "converted" | "expired" | "released"
): Promise<void> {
  const { error } = await supabase
    .from("lease_reservations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", reservationId);

  if (error) {
    console.error("Error updating reservation status:", error);
    throw error;
  }
}
