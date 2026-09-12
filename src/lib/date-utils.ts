/**
 * Date utility helper functions for formatting and retrieving current date in IST (Indian Standard Time, UTC+5:30).
 */

/**
 * Returns today's date formatted as YYYY-MM-DD in IST timezone (for HTML <input type="date" /> values).
 */
export function getTodayIST(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffset);
  
  const yyyy = istDate.getFullYear();
  const mm = String(istDate.getMonth() + 1).padStart(2, '0');
  const dd = String(istDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns a new Date object representing now in IST.
 */
export function getCurrentISTDate(): Date {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffset);
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Formats any date string or Date object into 'dd/mmm/yyyy' format (e.g. '03/Sep/2026').
 * If invalid or empty, returns '-' or fallback.
 */
export function formatDDMMMYYYY(dateInput?: string | Date | null): string {
  if (!dateInput) return '-';
  try {
    const raw = String(dateInput).trim();
    // Support YYYY-MM-DD string parsing without timezone shift
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      const parts = raw.split('T')[0].split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dayStr = String(d).padStart(2, '0');
      const monStr = MONTH_NAMES[m] || parts[1];
      return `${dayStr}/${monStr}/${y}`;
    }
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) {
      return String(dateInput);
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = MONTH_NAMES[d.getMonth()] || String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput || '-');
  }
}

/**
 * Alias for backward compatibility that outputs canonical 'dd/mmm/yyyy' (e.g. 03/Sep/2026).
 */
export function formatDateDDMMYYYY(dateInput?: string | Date | null): string {
  return formatDDMMMYYYY(dateInput);
}
