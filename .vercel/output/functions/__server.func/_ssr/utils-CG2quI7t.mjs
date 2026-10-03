import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-CG2quI7t.js
function cn(...inputs) {
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
function parseFloors(value) {
	if (value === null || value === void 0) return NaN;
	const str = String(value).trim();
	if (str === "") return NaN;
	const plain = Number(str.replace(/,/g, ""));
	if (!isNaN(plain)) return Math.round(plain);
	const tokens = str.split("+").map((t) => t.trim().toLowerCase());
	let total = 0;
	let valid = false;
	for (const token of tokens) if (token === "gf" || token === "ground" || token === "ground floor") {
		total += 1;
		valid = true;
	} else if (token === "b" || token === "bf" || token === "basement") {
		total += 1;
		valid = true;
	} else {
		const n = Number(token.replace(/,/g, ""));
		if (!isNaN(n)) {
			total += Math.round(n);
			valid = true;
		} else return NaN;
	}
	return valid ? total : NaN;
}
//#endregion
export { parseFloors as n, cn as t };
