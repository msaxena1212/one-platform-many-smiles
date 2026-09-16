//#region node_modules/.nitro/vite/services/ssr/assets/tenant-context-xAvPY413.js
function readMetadata(user, key) {
	if (!user || !key) return void 0;
	const value = user.user_metadata?.[key];
	return typeof value === "string" && value.length > 0 ? value : void 0;
}
function resolveTenantContextId(profile, user) {
	const explicit = profile?.tenant_id || profile?.tenant_key || readMetadata(user, "tenant_id") || readMetadata(user, "tenant_key");
	if (explicit) return explicit;
	const role = profile?.role;
	if (role === "ADMIN" || role === "HOST") return profile?.id ?? null;
	return null;
}
//#endregion
export { resolveTenantContextId as t };
