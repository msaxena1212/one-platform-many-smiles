import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parses a floor count expression into a number.
 *
 * Accepted formats (case/space-insensitive):
 *   "GF + 7"  → 8  (Ground Floor + 7 upper floors)
 *   "GF+7"    → 8
 *   "GF"      → 1  (Ground Floor only)
 *   "B + GF + 7" → 9  (Basement + GF + 7 upper floors)
 *   "7"       → 7  (plain number)
 *   "8.0"     → 8
 *
 * Returns NaN if the value cannot be parsed.
 */
export function parseFloors(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return NaN;
  const str = String(value).trim();
  if (str === '') return NaN;

  // Plain number fast-path (including decimals, commas)
  const plain = Number(str.replace(/,/g, ''));
  if (!isNaN(plain)) return Math.round(plain);

  // Expression parser: sum up tokens separated by "+"
  // Recognise: GF, B/BF/BASEMENT, or a numeric token
  const tokens = str.split('+').map(t => t.trim().toLowerCase());
  let total = 0;
  let valid = false;

  for (const token of tokens) {
    if (token === 'gf' || token === 'ground' || token === 'ground floor') {
      total += 1;
      valid = true;
    } else if (token === 'b' || token === 'bf' || token === 'basement') {
      total += 1;
      valid = true;
    } else {
      const n = Number(token.replace(/,/g, ''));
      if (!isNaN(n)) {
        total += Math.round(n);
        valid = true;
      } else {
        // Unrecognised token — whole expression is invalid
        return NaN;
      }
    }
  }

  return valid ? total : NaN;
}
