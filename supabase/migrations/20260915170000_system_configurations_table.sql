-- =============================================================================
-- Migration: 20260915170000_system_configurations_table.sql
-- Description: Persistent platform configuration table with granular JSONB schemas.
-- Covers platform identity, localization (Qatar defaults), automated engine schedules,
-- notifications (including In-App notifications), security policies, and integrations.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.system_configurations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key    TEXT UNIQUE NOT NULL,
  config_value  JSONB NOT NULL DEFAULT '{}'::jsonb,
  category      TEXT NOT NULL DEFAULT 'general',
  description   TEXT,
  is_encrypted  BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for rapid lookup by config key
CREATE INDEX IF NOT EXISTS idx_system_configurations_key ON public.system_configurations (config_key);
CREATE INDEX IF NOT EXISTS idx_system_configurations_cat ON public.system_configurations (category);

-- Enable RLS
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy: All authenticated staff can read system configuration
DROP POLICY IF EXISTS "Staff can read system configuration" ON public.system_configurations;
CREATE POLICY "Staff can read system configuration"
ON public.system_configurations FOR SELECT
TO authenticated
USING (public.is_staff_user());

-- 2. Mutation Policy: ONLY SUPER_ADMIN role can update or insert system configuration
DROP POLICY IF EXISTS "Super Admins can manage system configuration" ON public.system_configurations;
CREATE POLICY "Super Admins can manage system configuration"
ON public.system_configurations FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'SUPER_ADMIN')
WITH CHECK (public.get_current_user_role() = 'SUPER_ADMIN');

-- ── In-App System Notifications Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'critical', 'announcement')) DEFAULT 'info',
  target_role TEXT DEFAULT 'ALL',
  target_user UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  action_url  TEXT,
  metadata    JSONB DEFAULT '{}'::jsonb,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sys_notif_target ON public.system_notifications (target_role, target_user, is_read);
CREATE INDEX IF NOT EXISTS idx_sys_notif_created ON public.system_notifications (created_at DESC);

ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- Staff / Users can view notifications targeted at their role or their user ID
DROP POLICY IF EXISTS "Users can read own notifications" ON public.system_notifications;
CREATE POLICY "Users can read own notifications"
ON public.system_notifications FOR SELECT
TO authenticated
USING (
  target_user = auth.uid()
  OR target_role = 'ALL'
  OR target_role = public.get_current_user_role()
);

-- Users can update (mark as read) their own notifications
DROP POLICY IF EXISTS "Users can mark own notifications as read" ON public.system_notifications;
CREATE POLICY "Users can mark own notifications as read"
ON public.system_notifications FOR UPDATE
TO authenticated
USING (
  target_user = auth.uid()
  OR target_role = 'ALL'
  OR target_role = public.get_current_user_role()
)
WITH CHECK (
  target_user = auth.uid()
  OR target_role = 'ALL'
  OR target_role = public.get_current_user_role()
);

-- Super Admin can insert/manage notifications
DROP POLICY IF EXISTS "Super Admin manage notifications" ON public.system_notifications;
CREATE POLICY "Super Admin manage notifications"
ON public.system_notifications FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'SUPER_ADMIN')
WITH CHECK (public.get_current_user_role() = 'SUPER_ADMIN');

-- ── Seed Qatar Defaults ───────────────────────────────────────────────────────

INSERT INTO public.system_configurations (config_key, category, description, config_value)
VALUES
(
  'platform_identity',
  'branding',
  'Platform name, contact info, branding logo and corporate credentials',
  '{
    "platformName": "ZYNO Real Estate Management OS",
    "companyName": "ZYNO Holdings W.L.L.",
    "supportEmail": "support@zyno.qa",
    "supportPhone": "+974 4400 1234",
    "commercialRegistrationNo": "CR-9876543-QA",
    "taxRegistrationNo": "TIN-1004589201",
    "portalUrl": "https://pms.zyno.qa",
    "logoUrl": "",
    "faviconUrl": "",
    "tagline": "Enterprise Real Estate Management & Financial Governance"
  }'::jsonb
),
(
  'localization',
  'regional',
  'Timezone, currency, and date format standards (Qatar / GCC Default)',
  '{
    "defaultTimezone": "Asia/Qatar",
    "defaultCurrency": "QAR",
    "currencySymbol": "QR",
    "dateFormat": "DD/MM/YYYY",
    "timeFormat": "24h",
    "fiscalYearStartMonth": 1,
    "numberFormat": "en-QA",
    "primaryLanguage": "en",
    "supportedLanguages": ["en", "ar"]
  }'::jsonb
),
(
  'engine_automations',
  'engines',
  'Automated cron timing and grace period rules (Qatar AST Time)',
  '{
    "pdcClearingSchedule": "5 21 * * *",
    "pdcClearingTimeQatar": "00:05 AST",
    "recurringBillingSchedule": "15 21 * * *",
    "recurringBillingTimeQatar": "00:15 AST (1st of month)",
    "assetDepreciationSchedule": "30 21 * * *",
    "assetDepreciationTimeQatar": "00:30 AST (1st of month)",
    "gracePeriodDays": 5,
    "latePenaltyPercentage": 2.5,
    "leaseExpiryNoticeDays": 60,
    "autoRenewEligible": false
  }'::jsonb
),
(
  'notifications',
  'communication',
  'Email, SMS, and In-App notification rules across user lifecycle',
  '{
    "inAppAlertsEnabled": true,
    "inAppSoundEnabled": true,
    "emailWelcomeEnabled": true,
    "emailNewTenantSignup": true,
    "emailMonthlyInvoice": true,
    "emailLeaseRenewalReminder": true,
    "emailMaintenanceUpdate": true,
    "emailPdcClearingAlert": true,
    "smsAlertsEnabled": false,
    "smsGatewayProvider": "Twilio",
    "broadcastBannerActive": false,
    "broadcastBannerMessage": "Welcome to ZYNO Real Estate Management OS"
  }'::jsonb
),
(
  'security_policies',
  'security',
  'Zero-Trust authentication rules, session timeout, 2FA, and rate limiting',
  '{
    "enforce2FASuperAdmin": true,
    "enforce2FAStaff": false,
    "enforce2FATenant": false,
    "maxFailedLoginAttempts": 5,
    "lockoutDurationMinutes": 30,
    "sessionTimeoutMinutes": 480,
    "apiRateLimitPerMinute": 60,
    "strictXSSSanitization": true,
    "logAllMutationsToAudit": true,
    "ipAllowlistEnabled": false,
    "allowedIpRanges": []
  }'::jsonb
),
(
  'integrations',
  'third_party',
  'Payment gateways, SMS, Email and Cloud storage integration credentials',
  '{
    "qpayEnabled": true,
    "qpayMerchantId": "QPAY-MCH-98214",
    "stripeEnabled": false,
    "stripePublicKey": "",
    "sendgridConfigured": true,
    "sendgridSenderEmail": "noreply@zyno.qa",
    "twilioSmsConfigured": false,
    "twilioFromNumber": "",
    "supabaseStorageBucket": "property-images"
  }'::jsonb
)
ON CONFLICT (config_key) DO UPDATE
SET config_value = EXCLUDED.config_value,
    updated_at = NOW();
