import { B as supabase } from "./supabase-y7n1teoy.mjs";
import { n as logSecurityEvent } from "./security-BK-Kx7Zx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system-config-CPYcxFsS.js
/**
* system-config.ts — Production System Configuration & In-App Notification Service
*
* Provides:
*  - Typed schemas for all configuration domains (Branding, Localization, Engines, Notifications, Security, Integrations)
*  - Safe Supabase database queries with fallback to validated Qatar defaults
*  - Super Admin mutations with automatic Security Audit logging
*  - In-App Notifications API (fetch, mark-as-read, create broadcast notifications)
*  - Strict field validations & error formatting
*/
var DEFAULT_CONFIGS = {
	platform_identity: {
		platformName: "ZYNO Real Estate Management OS",
		companyName: "ZYNO Holdings W.L.L.",
		supportEmail: "support@zyno.qa",
		supportPhone: "+974 4400 1234",
		commercialRegistrationNo: "CR-9876543-QA",
		taxRegistrationNo: "TIN-1004589201",
		portalUrl: "https://pms.zyno.qa",
		logoUrl: "",
		faviconUrl: "",
		tagline: "Enterprise Real Estate Management & Financial Governance"
	},
	localization: {
		defaultTimezone: "Asia/Qatar",
		defaultCurrency: "QAR",
		currencySymbol: "QR",
		dateFormat: "DD/MM/YYYY",
		timeFormat: "24h",
		fiscalYearStartMonth: 1,
		numberFormat: "en-QA",
		primaryLanguage: "en",
		supportedLanguages: ["en", "ar"]
	},
	engine_automations: {
		pdcClearingSchedule: "5 21 * * *",
		pdcClearingTimeQatar: "00:05 AST",
		recurringBillingSchedule: "15 21 * * *",
		recurringBillingTimeQatar: "00:15 AST (1st of month)",
		assetDepreciationSchedule: "30 21 * * *",
		assetDepreciationTimeQatar: "00:30 AST (1st of month)",
		gracePeriodDays: 5,
		latePenaltyPercentage: 2.5,
		leaseExpiryNoticeDays: 60,
		autoRenewEligible: false
	},
	notifications: {
		inAppAlertsEnabled: true,
		inAppSoundEnabled: true,
		emailWelcomeEnabled: true,
		emailNewTenantSignup: true,
		emailMonthlyInvoice: true,
		emailLeaseRenewalReminder: true,
		emailMaintenanceUpdate: true,
		emailPdcClearingAlert: true,
		smsAlertsEnabled: false,
		smsGatewayProvider: "Twilio",
		broadcastBannerActive: false,
		broadcastBannerMessage: "Welcome to ZYNO Real Estate Management OS"
	},
	security_policies: {
		enforce2FASuperAdmin: true,
		enforce2FAStaff: false,
		enforce2FATenant: false,
		maxFailedLoginAttempts: 5,
		lockoutDurationMinutes: 30,
		sessionTimeoutMinutes: 480,
		apiRateLimitPerMinute: 60,
		strictXSSSanitization: true,
		logAllMutationsToAudit: true,
		ipAllowlistEnabled: false,
		allowedIpRanges: []
	},
	integrations: {
		qpayEnabled: true,
		qpayMerchantId: "QPAY-MCH-98214",
		stripeEnabled: false,
		stripePublicKey: "",
		sendgridConfigured: true,
		sendgridSenderEmail: "noreply@zyno.qa",
		twilioSmsConfigured: false,
		twilioFromNumber: "",
		supabaseStorageBucket: "property-images"
	}
};
/**
* Fetch all system configurations simultaneously.
*/
async function fetchAllSystemConfigs() {
	try {
		const { data, error } = await supabase.from("system_configurations").select("config_key, config_value, updated_at");
		const result = { ...DEFAULT_CONFIGS };
		if (!error && data) data.forEach((row) => {
			const k = row.config_key;
			if (result[k]) result[k] = {
				...result[k],
				...row.config_value
			};
		});
		return result;
	} catch {
		return DEFAULT_CONFIGS;
	}
}
/**
* Save configuration to PostgreSQL and trigger an audit trail entry.
*/
async function saveSystemConfig(key, configValue, userEmail) {
	try {
		if (key === "platform_identity") {
			const email = configValue.supportEmail;
			if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return {
				success: false,
				error: "Please provide a valid support email address."
			};
		}
		if (key === "engine_automations") {
			if (Number(configValue.gracePeriodDays) < 0 || Number(configValue.latePenaltyPercentage) < 0) return {
				success: false,
				error: "Grace period and penalty percentage must be non-negative."
			};
		}
		const { error: dbError } = await supabase.from("system_configurations").upsert({
			config_key: key,
			config_value: configValue,
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}, { onConflict: "config_key" });
		if (dbError) {
			logSecurityEvent({
				event_type: "access_denied",
				severity: "critical",
				resource: `system_configurations/${key}`,
				action: "UPDATE_FAILED",
				details: { error: dbError.message }
			});
			return {
				success: false,
				error: dbError.message
			};
		}
		await logSecurityEvent({
			event_type: "data_mutation",
			severity: "warning",
			resource: `system_configurations/${key}`,
			action: "CONFIG_UPDATED",
			details: {
				updatedBy: userEmail || "Super Admin",
				configKey: key,
				timestamp: (/* @__PURE__ */ new Date()).toISOString()
			}
		});
		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: err.message || "An unexpected error occurred while saving."
		};
	}
}
/**
* Fetch in-app notifications for the active user / role.
*/
async function fetchInAppNotifications() {
	try {
		const { data, error } = await supabase.from("system_notifications").select("*").order("created_at", { ascending: false }).limit(50);
		if (error || !data) return [];
		return data;
	} catch {
		return [];
	}
}
/**
* Mark a notification as read and increment engagement.
*/
async function markNotificationAsRead(id) {
	try {
		const { error } = await supabase.from("system_notifications").update({
			is_read: true,
			engagement_count: supabase.rpc ? void 0 : 1
		}).eq("id", id);
		await supabase.rpc("track_notification_engagement", {
			notif_id: id,
			is_click: false
		});
		return !error;
	} catch {
		return false;
	}
}
/**
* Super Admin Broadcast: Create a scheduled or instant platform-wide In-App notification with audit trail.
*/
async function createBroadcastNotification(notification) {
	try {
		const scheduleType = notification.schedule_type || "instant";
		const status = scheduleType === "instant" ? "sent" : "scheduled";
		const { error } = await supabase.from("system_notifications").insert({
			title: notification.title,
			message: notification.message,
			type: notification.type,
			target_role: notification.target_role || "ALL",
			action_url: notification.action_url,
			is_read: false,
			schedule_type: scheduleType,
			scheduled_for: notification.scheduled_for || null,
			recurring_cron: notification.recurring_cron || null,
			engagement_count: 0,
			click_count: 0,
			status,
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		});
		if (error) return {
			success: false,
			error: error.message
		};
		await logSecurityEvent({
			event_type: "system",
			severity: "info",
			resource: "system_notifications",
			action: scheduleType === "instant" ? "BROADCAST_CREATED" : "NOTIFICATION_SCHEDULED",
			details: {
				title: notification.title,
				target: notification.target_role || "ALL",
				schedule_type: scheduleType,
				scheduled_for: notification.scheduled_for,
				recurring_cron: notification.recurring_cron,
				timestamp: (/* @__PURE__ */ new Date()).toISOString()
			}
		});
		return { success: true };
	} catch (e) {
		return {
			success: false,
			error: e.message || "Failed to create broadcast notification."
		};
	}
}
//#endregion
export { saveSystemConfig as a, markNotificationAsRead as i, fetchAllSystemConfigs as n, fetchInAppNotifications as r, createBroadcastNotification as t };
