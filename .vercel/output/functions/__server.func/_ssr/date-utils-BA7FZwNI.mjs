//#region node_modules/.nitro/vite/services/ssr/assets/date-utils-BA7FZwNI.js
/**
* Date utility helper functions for formatting and retrieving current date in IST (Indian Standard Time, UTC+5:30).
*/
/**
* Returns today's date formatted as YYYY-MM-DD in IST timezone (for HTML <input type="date" /> values).
*/
function getTodayIST() {
	const now = /* @__PURE__ */ new Date();
	const istDate = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1e3 + 5.5 * 60 * 60 * 1e3);
	return `${istDate.getFullYear()}-${String(istDate.getMonth() + 1).padStart(2, "0")}-${String(istDate.getDate()).padStart(2, "0")}`;
}
/**
* Returns a new Date object representing now in IST.
*/
function getCurrentISTDate() {
	const now = /* @__PURE__ */ new Date();
	return new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1e3 + 5.5 * 60 * 60 * 1e3);
}
var MONTH_NAMES = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
/**
* Formats any date string or Date object into 'dd/mmm/yyyy' format (e.g. '03/Sep/2026').
* If invalid or empty, returns '-' or fallback.
*/
function formatDDMMMYYYY(dateInput) {
	if (!dateInput) return "-";
	try {
		const raw = String(dateInput).trim();
		if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
			const parts = raw.split("T")[0].split("-");
			const y = parseInt(parts[0], 10);
			const m = parseInt(parts[1], 10) - 1;
			const d = parseInt(parts[2], 10);
			return `${String(d).padStart(2, "0")}/${MONTH_NAMES[m] || parts[1]}/${y}`;
		}
		const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
		if (isNaN(d.getTime())) return String(dateInput);
		return `${String(d.getDate()).padStart(2, "0")}/${MONTH_NAMES[d.getMonth()] || String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
	} catch {
		return String(dateInput || "-");
	}
}
//#endregion
export { getCurrentISTDate as n, getTodayIST as r, formatDDMMMYYYY as t };
