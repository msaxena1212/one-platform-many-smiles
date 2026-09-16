import { B as supabase } from "./supabase-DXZNSXc4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/security-BeRj2szr.js
/**
* security.ts — Production Security Service
*
* Handles:
*  - Persistent security audit log (Supabase DB + LocalStorage + in-memory fallback)
*  - Input sanitisation (XSS prevention)
*  - Rate limiting (client-side token bucket)
*  - CSRF guard for server-bound mutation requests
*  - Content Security Policy (CSP) header helper
*/
var STORAGE_KEY = "pms_security_audit_logs";
function getLocalAuditLogs() {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		return JSON.parse(raw);
	} catch {
		return [];
	}
}
function saveLocalAuditLog(record) {
	if (typeof window === "undefined") return;
	try {
		const updated = [record, ...getLocalAuditLogs().filter((r) => r.id !== record.id)].slice(0, 300);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
	} catch (e) {
		console.warn("Could not save to localStorage audit store", e);
	}
}
var _memoryLog = [];
async function logSecurityEvent(event) {
	const record = {
		...event,
		id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
		timestamp: (/* @__PURE__ */ new Date()).toISOString(),
		user_agent: typeof navigator !== "undefined" ? navigator.userAgent : void 0
	};
	_memoryLog.unshift(record);
	if (_memoryLog.length > 300) _memoryLog.pop();
	saveLocalAuditLog(record);
	try {
		const { error } = await supabase.from("security_audit_logs").insert(record);
		if (error) console.warn("Supabase security_audit_logs table unavailable or restricted by RLS; saved to local audit trail store.", error.message);
	} catch (err) {
		console.warn("Audit log DB insert skipped", err);
	}
}
async function fetchSecurityAuditLogs() {
	const localLogs = getLocalAuditLogs();
	try {
		const { data, error } = await supabase.from("security_audit_logs").select("*").order("timestamp", { ascending: false }).limit(200);
		if (error || !data || data.length === 0) {
			const combined = [...localLogs];
			for (const m of _memoryLog) if (!combined.some((c) => c.id === m.id || c.timestamp === m.timestamp)) combined.unshift(m);
			return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
		}
		const mergedMap = /* @__PURE__ */ new Map();
		data.forEach((d) => mergedMap.set(d.id || d.timestamp, d));
		localLogs.forEach((l) => mergedMap.set(l.id || l.timestamp, l));
		_memoryLog.forEach((m) => mergedMap.set(m.id || m.timestamp, m));
		return Array.from(mergedMap.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
	} catch {
		return localLogs.length > 0 ? localLogs : _memoryLog;
	}
}
typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36);
//#endregion
export { logSecurityEvent as n, fetchSecurityAuditLogs as t };
