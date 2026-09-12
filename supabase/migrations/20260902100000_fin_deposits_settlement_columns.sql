-- Add settlement tracking columns to fin_deposits
ALTER TABLE public.fin_deposits
  ADD COLUMN IF NOT EXISTS deduction_amount numeric(18,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refund_amount    numeric(18,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS settled_at       timestamptz;

COMMENT ON COLUMN public.fin_deposits.deduction_amount IS 'Approved deductions applied during deposit settlement';
COMMENT ON COLUMN public.fin_deposits.refund_amount    IS 'Net refund disbursed to tenant during settlement';
COMMENT ON COLUMN public.fin_deposits.settled_at       IS 'Timestamp when deposit was settled/refunded';
