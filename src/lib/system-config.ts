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

import { supabase } from "@/lib/supabase";
import { logSecurityEvent } from "@/lib/security";

// ─── Configuration Interfaces ────────────────────────────────────────────────

export interface PlatformIdentityConfig {
  platformName: string;
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  commercialRegistrationNo: string;
  taxRegistrationNo: string;
  portalUrl: string;
  logoUrl: string;
  faviconUrl: string;
  tagline: string;
}

export interface LocalizationConfig {
  defaultTimezone: string;
  defaultCurrency: string;
  currencySymbol: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  fiscalYearStartMonth: number;
  numberFormat: string;
  primaryLanguage: string;
  supportedLanguages: string[];
}

export interface CustomAutomationItem {
  id: string;
  name: string;
  description: string;
  executionTimeQatar: string;
  frequency: "daily" | "monthly" | "weekly" | "custom";
  enabled: boolean;
  targetModule: string;
}

export interface EngineAutomationConfig {
  pdcClearingEnabled?: boolean;
  pdcClearingSchedule: string;
  pdcClearingTimeQatar: string;
  recurringBillingEnabled?: boolean;
  recurringBillingSchedule: string;
  recurringBillingTimeQatar: string;
  assetDepreciationEnabled?: boolean;
  assetDepreciationSchedule: string;
  assetDepreciationTimeQatar: string;
  gracePeriodDays: number;
  latePenaltyPercentage: number;
  leaseExpiryNoticeDays: number;
  autoRenewEligible: boolean;
  customAutomations?: CustomAutomationItem[];
}

export interface NotificationConfig {
  inAppAlertsEnabled: boolean;
  inAppSoundEnabled: boolean;
  emailWelcomeEnabled: boolean;
  emailNewTenantSignup: boolean;
  emailMonthlyInvoice: boolean;
  emailLeaseRenewalReminder: boolean;
  emailMaintenanceUpdate: boolean;
  emailPdcClearingAlert: boolean;
  smsAlertsEnabled: boolean;
  smsGatewayProvider: string;
  broadcastBannerActive: boolean;
  broadcastBannerMessage: string;
}

export interface SecurityPolicyConfig {
  enforce2FASuperAdmin: boolean;
  enforce2FAStaff: boolean;
  enforce2FATenant: boolean;
  maxFailedLoginAttempts: number;
  lockoutDurationMinutes: number;
  sessionTimeoutMinutes: number;
  apiRateLimitPerMinute: number;
  strictXSSSanitization: boolean;
  logAllMutationsToAudit: boolean;
  ipAllowlistEnabled: boolean;
  allowedIpRanges: string[];
}

export interface IntegrationConfig {
  qpayEnabled: boolean;
  qpayMerchantId: string;
  stripeEnabled: boolean;
  stripePublicKey: string;
  sendgridConfigured: boolean;
  sendgridSenderEmail: string;
  twilioSmsConfigured: boolean;
  twilioFromNumber: string;
  supabaseStorageBucket: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "critical" | "announcement";
  target_role: string;
  target_user?: string | null;
  is_read: boolean;
  action_url?: string | null;
  metadata?: Record<string, any>;
  expires_at?: string | null;
  created_at: string;
  schedule_type?: "instant" | "future" | "recurring";
  scheduled_for?: string | null;
  recurring_cron?: string | null;
  engagement_count?: number;
  click_count?: number;
  status?: "draft" | "scheduled" | "sent" | "archived";
}

// ─── Verified Qatar Standard Defaults ────────────────────────────────────────

export const DEFAULT_CONFIGS = {
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
    tagline: "Enterprise Real Estate Management & Financial Governance",
  } as PlatformIdentityConfig,

  localization: {
    defaultTimezone: "Asia/Qatar",
    defaultCurrency: "QAR",
    currencySymbol: "QR",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    fiscalYearStartMonth: 1,
    numberFormat: "en-QA",
    primaryLanguage: "en",
    supportedLanguages: ["en", "ar"],
  } as LocalizationConfig,

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
    autoRenewEligible: false,
  } as EngineAutomationConfig,

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
    broadcastBannerMessage: "Welcome to ZYNO Real Estate Management OS",
  } as NotificationConfig,

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
    allowedIpRanges: [],
  } as SecurityPolicyConfig,

  integrations: {
    qpayEnabled: true,
    qpayMerchantId: "QPAY-MCH-98214",
    stripeEnabled: false,
    stripePublicKey: "",
    sendgridConfigured: true,
    sendgridSenderEmail: "noreply@zyno.qa",
    twilioSmsConfigured: false,
    twilioFromNumber: "",
    supabaseStorageBucket: "property-images",
  } as IntegrationConfig,
};

export type ConfigKey = keyof typeof DEFAULT_CONFIGS;

// ─── Read & Write Service ─────────────────────────────────────────────────────

/**
 * Fetch a specific system configuration domain with fallback to defaults.
 */
export async function fetchSystemConfig<T = any>(key: ConfigKey): Promise<T> {
  try {
    const { data, error } = await supabase
      .from("system_configurations")
      .select("config_value")
      .eq("config_key", key)
      .maybeSingle();

    if (error || !data?.config_value) {
      return DEFAULT_CONFIGS[key] as T;
    }

    return { ...DEFAULT_CONFIGS[key], ...data.config_value } as T;
  } catch {
    return DEFAULT_CONFIGS[key] as T;
  }
}

/**
 * Fetch all system configurations simultaneously.
 */
export async function fetchAllSystemConfigs() {
  try {
    const { data, error } = await supabase
      .from("system_configurations")
      .select("config_key, config_value, updated_at");

    const result = { ...DEFAULT_CONFIGS };

    if (!error && data) {
      data.forEach((row) => {
        const k = row.config_key as ConfigKey;
        if (result[k]) {
          result[k] = { ...result[k], ...row.config_value } as any;
        }
      });
    }

    return result;
  } catch {
    return DEFAULT_CONFIGS;
  }
}

/**
 * Save configuration to PostgreSQL and trigger an audit trail entry.
 */
export async function saveSystemConfig<T extends Record<string, any>>(
  key: ConfigKey,
  configValue: T,
  userEmail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Validations
    if (key === "platform_identity") {
      const email = configValue.supportEmail;
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, error: "Please provide a valid support email address." };
      }
    }

    if (key === "engine_automations") {
      if (Number(configValue.gracePeriodDays) < 0 || Number(configValue.latePenaltyPercentage) < 0) {
        return { success: false, error: "Grace period and penalty percentage must be non-negative." };
      }
    }

    // 2. Persist to database
    const { error: dbError } = await supabase
      .from("system_configurations")
      .upsert({
        config_key: key,
        config_value: configValue,
        updated_at: new Date().toISOString(),
      }, { onConflict: "config_key" });

    if (dbError) {
      logSecurityEvent({
        event_type: "access_denied",
        severity: "critical",
        resource: `system_configurations/${key}`,
        action: "UPDATE_FAILED",
        details: { error: dbError.message },
      });
      return { success: false, error: dbError.message };
    }

    // 3. Security Audit Log
    await logSecurityEvent({
      event_type: "data_mutation",
      severity: "warning",
      resource: `system_configurations/${key}`,
      action: "CONFIG_UPDATED",
      details: {
        updatedBy: userEmail || "Super Admin",
        configKey: key,
        timestamp: new Date().toISOString(),
      },
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred while saving." };
  }
}

// ─── In-App Notifications API ─────────────────────────────────────────────────

/**
 * Fetch in-app notifications for the active user / role.
 */
export async function fetchInAppNotifications(): Promise<SystemNotification[]> {
  try {
    const { data, error } = await supabase
      .from("system_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) return [];
    return data as SystemNotification[];
  } catch {
    return [];
  }
}

/**
 * Mark a notification as read and increment engagement.
 */
export async function markNotificationAsRead(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("system_notifications")
      .update({ 
        is_read: true,
        engagement_count: supabase.rpc ? undefined : 1
      })
      .eq("id", id);

    await supabase.rpc("track_notification_engagement", { notif_id: id, is_click: false });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Super Admin Broadcast: Create a scheduled or instant platform-wide In-App notification with audit trail.
 */
export async function createBroadcastNotification(notification: {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "critical" | "announcement";
  target_role?: string;
  action_url?: string;
  schedule_type?: "instant" | "future" | "recurring";
  scheduled_for?: string | null;
  recurring_cron?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const scheduleType = notification.schedule_type || "instant";
    const status = scheduleType === "instant" ? "sent" : "scheduled";

    const { error } = await supabase
      .from("system_notifications")
      .insert({
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
        status: status,
        created_at: new Date().toISOString(),
      });

    if (error) return { success: false, error: error.message };

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
        timestamp: new Date().toISOString(),
      },
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to create broadcast notification." };
  }
}
