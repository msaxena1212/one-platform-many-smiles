/**
 * Date utility helper functions for formatting and retrieving current date in IST (Indian Standard Time, UTC+5:30).
 *
 * NOTE: Always strips any timestamp/time part and parses the raw calendar Date portion
 * directly as written, avoiding any timezone shifts.
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
 * Safely extracts { day, month0, year } from any date input without timezone shifts:
 *  - Strips any time/timestamp component (e.g. "T...", " 00:00:00", etc.)
 *  - Matches YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, or DD-MMM-YYYY directly
 */
function extractLocalParts(dateInput: string | Date | null | undefined): { day: number; month0: number; year: number } | null {
  if (!dateInput) return null;

  try {
    if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) return null;
      return { day: dateInput.getDate(), month0: dateInput.getMonth(), year: dateInput.getFullYear() };
    }

    let raw = String(dateInput).trim();
    if (!raw || raw === '-') return null;

    // Remove any timestamp portion (e.g., "2026-04-10T18:30:00.000Z" -> "2026-04-10")
    if (raw.includes('T')) {
      raw = raw.split('T')[0].trim();
    } else if (raw.includes(' ')) {
      // e.g. "2026-04-10 00:00:00"
      const parts = raw.split(' ');
      if (parts[0] && (parts[0].includes('-') || parts[0].includes('/'))) {
        raw = parts[0].trim();
      }
    }

    // Pattern 1: YYYY-MM-DD
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(raw)) {
      const parts = raw.split('-');
      const year = parseInt(parts[0], 10);
      const month0 = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month0) && !isNaN(day)) {
        return { day, month0, year };
      }
    }

    // Pattern 2: DD/MM/YYYY or DD-MM-YYYY
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(raw)) {
      const parts = raw.split(/[\/\-]/);
      const day = parseInt(parts[0], 10);
      const month0 = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month0) && !isNaN(day)) {
        return { day, month0, year };
      }
    }

    // Pattern 3: DD-MMM-YYYY or DD-MMM-YY (e.g., "10-Apr-2026" or "10-Apr-26")
    const dMonYMatch = raw.match(/^(\d{1,2})[\/\-\s]+([A-Za-z]{3,9})[\/\-\s]+(\d{2,4})$/);
    if (dMonYMatch) {
      const day = parseInt(dMonYMatch[1], 10);
      const monStr = dMonYMatch[2].toLowerCase().slice(0, 3);
      const mIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monStr);
      let year = parseInt(dMonYMatch[3], 10);
      if (year < 100) year += 2000;
      if (!isNaN(day) && mIdx !== -1 && !isNaN(year)) {
        return { day, month0: mIdx, year };
      }
    }

    // Fallback: JS Date parsing without UTC shift
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      return { day: d.getDate(), month0: d.getMonth(), year: d.getFullYear() };
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Formats any date string or Date object into 'dd/mmm/yyyy' format (e.g. '10/Apr/2026').
 * If invalid or empty, returns '-'.
 */
export function formatDDMMMYYYY(dateInput?: string | Date | null): string {
  const parts = extractLocalParts(dateInput ?? null);
  if (!parts) return '-';
  const dayStr = String(parts.day).padStart(2, '0');
  const monStr = MONTH_NAMES[parts.month0] || String(parts.month0 + 1).padStart(2, '0');
  return `${dayStr}/${monStr}/${parts.year}`;
}

/**
 * Formats any date into strict 'dd/mm/yyyy' numeric format (e.g. '10/04/2026').
 */
export function formatDateNumericDDMMYYYY(dateInput?: string | Date | null): string {
  const parts = extractLocalParts(dateInput ?? null);
  if (!parts) return '-';
  const d = String(parts.day).padStart(2, '0');
  const m = String(parts.month0 + 1).padStart(2, '0');
  return `${d}/${m}/${parts.year}`;
}

/**
 * Alias for backward compatibility that outputs canonical 'dd/mmm/yyyy' (e.g. 10/Apr/2026).
 */
export function formatDateDDMMYYYY(dateInput?: string | Date | null): string {
  return formatDDMMMYYYY(dateInput);
}
