import { getExpiringReservations } from './reservationService';

/**
 * Checks for reservations that are expiring soon and triggers notifications.
 * In a real application, this would integrate with a proper notification system.
 * For now, it logs to console and shows browser notifications if permission is granted.
 */
export async function checkExpiringReservationsAndNotify() {
  try {
    // Get reservations expiring in the next 24 hours
    const expiringReservations = await getExpiringReservations(1); // 1 day ahead
    
    expiringReservations.forEach(reservation => {
      // Check if browser supports notifications
      if (typeof window !== 'undefined' && window.Notification && window.Notification.permission === 'granted') {
        const notification = window.Notification;
        notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            notification.notify({
              title: 'Reservation Expiring Soon',
              body: `Reservation for ${reservation.unit} by ${reservation.tenantName} expires within 24 hours.`,
              icon: '/favicon.ico'
            });
          }
        });
      } else {
        // Fallback: log to console or use alert
        console.warn(`Reservation ${reservation.id} (${reservation.tenantName}) is expiring soon.`);
        // alert(`Reservation ${reservation.id} is expiring soon.`);
      }
    });
  } catch (error) {
    console.error('Error checking expiring reservations for notification:', error);
  }
}