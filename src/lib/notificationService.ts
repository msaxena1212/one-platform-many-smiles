import { getExpiringReservations } from "./reservationService";

/**
 * Checks for reservations expiring within 24 hours and triggers browser notifications.
 * Falls back to a console warning when browser notifications are unavailable or denied.
 */
export async function checkExpiringReservationsAndNotify() {
  try {
    const expiringReservations = await getExpiringReservations(1);

    for (const reservation of expiringReservations) {
      const unitRef: string = (reservation as Record<string, unknown>)["unit_ref"] as string
        ?? (reservation as Record<string, unknown>)["unit"] as string
        ?? "unknown unit";
      const tenantName: string = (reservation as Record<string, unknown>)["prospect_name"] as string
        ?? (reservation as Record<string, unknown>)["tenantName"] as string
        ?? "unknown tenant";

      if (typeof window === "undefined") {
        console.warn(`Reservation ${reservation.id} (${tenantName}) is expiring soon.`);
        continue;
      }

      if (!("Notification" in window)) {
        console.warn(`Reservation ${reservation.id} expiring soon – browser notifications not supported.`);
        continue;
      }

      const showNotification = () => {
        new Notification("Reservation Expiring Soon", {
          body: `Reservation for unit ${unitRef} by ${tenantName} expires within 24 hours.`,
          icon: "/favicon.ico",
        });
      };

      if (Notification.permission === "granted") {
        showNotification();
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") showNotification();
        });
      } else {
        console.warn(`Reservation ${reservation.id} (${tenantName} – ${unitRef}) is expiring soon.`);
      }
    }
  } catch (error) {
    console.error("Error checking expiring reservations for notification:", error);
  }
}

/**
 * Sends a lease renewal due notification for a lease approaching expiry.
 */
export function notifyRenewalDue(tenantName: string, unit: string, daysUntilExpiry: number) {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  const show = () => {
    new Notification("Lease Renewal Due", {
      body: `Lease for ${tenantName} (${unit}) expires in ${daysUntilExpiry} day(s). Please initiate renewal process.`,
      icon: "/favicon.ico",
    });
  };

  if (Notification.permission === "granted") {
    show();
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((p) => { if (p === "granted") show(); });
  }
}
