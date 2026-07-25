import { supabase } from '.';
import { Reservation } from '@/types/supabase';
import { Customer } from '@/types/supabase';
import { createCustomer } from './customerService';

/**
 * Create or update a reservation in the database
 */
export async function createReservation(reservation: Reservation): Promise<Reservation> {
  // Persist reservation
  const { data, error } = await supabase
    .from('Reservations')
    .upsert(reservation, { onConflict: 'reservation_id' })
    .select()
    .single();
  
  if (error) {
    console.error('Supabase error creating reservation:', error);
    throw error;
  }
  
  return data as Reservation;
}

/**
 * Check for duplicate customer based on identifiers
 * Returns true if duplicate found
 */
export async function checkDuplicateCustomer(customerData: Partial<Customer>): Promise<boolean> {
  const { data, error } = await supabase
    .from('Customers')
    .select('id')
    .or(
      Object.entries(customerData)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => ({
          [key]: value
        }))
    );
  
  // For simplicity, check if any rows returned
  return data && data.length > 0;
}

/**
 * Schedule expiry notification for a reservation
 * In a real app, this would integrate with notification system
 */
export function scheduleReservationExpiryNotification(
  reservationId: string,
  daysUntilExpiry: number,
  callback: () => void
): string {
  const notificationId = `notif-${reservationId}`;
  // For demo purposes, we'll simulate with timeout
  const timeoutId = setTimeout(() => {
    callback();
    clearTimeout(timeoutId);
  }, daysUntilExpiry * 24 * 60 * 60 * 1000);
  
  return notificationId;
}

/**
 * Get reservations expiring soon (for notification system)
 */
export async function getExpiringReservations(daysAhead: number = 7) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() + 1);
  
  const toDate = new Date();
  toDate.setDate(toDate.getDate() + daysAhead);
  
  const { data, error } = await supabase
    .from('Reservations')
    .select('*')
    .gte('reservation_expiry', fromDate.toISOString())
    .lte('reservation_expiry', toDate.toISOString())
    .neq('status', 'Converted')
    .neq('status', 'Expired')
    .neq('status', 'Cancelled');
  
  if (error) {
    console.error('Error fetching expiring reservations:', error);
    return [];
  }
  
  return data as Reservation[];
}