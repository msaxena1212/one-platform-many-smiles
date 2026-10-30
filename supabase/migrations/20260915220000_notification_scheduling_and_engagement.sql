-- Migration: 20260915220000_notification_scheduling_and_engagement.sql
-- Add schedule_type, scheduled_for, recurring_cron, engagement_count, click_count to system_notifications

ALTER TABLE public.system_notifications 
  ADD COLUMN IF NOT EXISTS schedule_type TEXT NOT NULL DEFAULT 'instant' CHECK (schedule_type IN ('instant', 'future', 'recurring')),
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recurring_cron TEXT,
  ADD COLUMN IF NOT EXISTS engagement_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS click_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'scheduled', 'sent', 'archived'));

-- RPC helper function to increment notification engagement / read count safely
CREATE OR REPLACE FUNCTION public.track_notification_engagement(notif_id UUID, is_click BOOLEAN DEFAULT FALSE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF is_click THEN
    UPDATE public.system_notifications
    SET click_count = click_count + 1,
        engagement_count = engagement_count + 1
    WHERE id = notif_id;
  ELSE
    UPDATE public.system_notifications
    SET engagement_count = engagement_count + 1
    WHERE id = notif_id;
  END IF;
END;
$$;
