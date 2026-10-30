-- Security Hardening Phase 2: Server-Side Rate Limiting & DB Constraints
-- This migration implements server-side protection for critical endpoints
-- and ensures data integrity via database-level check constraints.

BEGIN;

-- 1. SERVER-SIDE RATE LIMITING INFRASTRUCTURE
-- Create a table to track request counts per user/IP for critical operations
CREATE TABLE IF NOT EXISTS public.request_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL, -- User ID or IP Address
    endpoint TEXT NOT NULL,   -- The API endpoint being called
    request_count INTEGER DEFAULT 1,
    last_request_at TIMESTAMPTZ DEFAULT now(),
    window_start TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_endpoint_user UNIQUE (identifier, endpoint)
);

-- Create an index for fast lookups and cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON public.request_rate_limits (window_start);

-- 2. RATE LIMITING FUNCTION (The "Guard")
-- This function should be called by Supabase Edge Functions or via triggers on sensitive tables
CREATE OR REPLACE FUNCTION public.check_api_rate_limit(
    p_identifier TEXT, 
    p_endpoint TEXT, 
    p_limit INTEGER DEFAULT 60, 
    p_window_seconds INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
    v_window_start TIMESTAMPTZ;
BEGIN
    -- Get current window start
    SELECT window_start INTO v_window_start 
    FROM public.request_rate_limits 
    WHERE identifier = p_identifier AND endpoint = p_endpoint;

    -- If no record or window has passed, reset
    IF v_window_start IS NULL OR (now() - v_window_start) > (p_window_seconds || ' seconds')::interval THEN
        INSERT INTO public.request_rate_limits (identifier, endpoint, request_count, window_start, last_request_at)
        VALUES (p_identifier, p_endpoint, 1, now(), now())
        ON CONFLICT (identifier, endpoint) 
        DO UPDATE SET request_count = 1, window_start = now(), last_request_at = now();
        
        RETURN TRUE;
    END IF;

    -- Increment count
    UPDATE public.request_rate_limits 
    SET request_count = request_count + 1, last_request_at = now()
    WHERE identifier = p_identifier AND endpoint = p_endpoint
    RETURNING request_count INTO v_count;

    -- Check if limit exceeded
    IF v_count > p_limit THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. DATABASE-LEVEL CONSTRAINTS (Data Integrity)
-- Ensure financial amounts cannot be negative where inappropriate
-- Note: We assume tables like 'collection_receipts' and 'fin_vouchers' exist based on project context

-- Receipts: Amount must always be positive
ALTER TABLE public.collection_receipts 
ADD CONSTRAINT check_receipt_amount_positive CHECK (amount > 0);

-- Vouchers: Amount must not be zero
ALTER TABLE public.fin_vouchers 
ADD CONSTRAINT check_voucher_amount_nonzero CHECK (amount <> 0);

-- Customer Emails: Basic format validation at DB level
ALTER TABLE public.customers 
ADD CONSTRAINT check_customer_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- User Roles: Only allow defined roles
ALTER TABLE public.profiles 
ADD CONSTRAINT check_valid_role CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'PROP_MGR', 'LEASING', 'FINANCE', 'CASHIER', 'MAINTENANCE', 'TENANT', 'GUEST'));

-- 4. AUTOMATIC CLEANUP FOR RATE LIMITS
-- Create a function to clear old rate limit records (to be called by pg_cron or similar)
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.request_rate_limits 
    WHERE window_start < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
