-- Payroll: persist leave salary / employer GRSA, premium overtime, per-cycle manual salary inputs, payment tracking.

ALTER TABLE public.hrms_payroll_payslips
  ADD COLUMN IF NOT EXISTS leave_salary NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS employer_contributions NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overtime_premium_hours NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS manual_override BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS remarks TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

ALTER TABLE public.hrms_attendance_daily
  ADD COLUMN IF NOT EXISTS overtime_premium_minutes INTEGER DEFAULT 0;

ALTER TABLE public.hrms_payroll_cycles
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT;

CREATE TABLE IF NOT EXISTS public.hrms_payroll_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_cycle_id UUID NOT NULL REFERENCES public.hrms_payroll_cycles(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  basic_pay NUMERIC,
  allowances NUMERIC,
  incentives NUMERIC DEFAULT 0,
  other_deductions NUMERIC DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (payroll_cycle_id, employee_id)
);

ALTER TABLE public.hrms_payroll_overrides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hrms_payroll_overrides_all ON public.hrms_payroll_overrides;
CREATE POLICY hrms_payroll_overrides_all ON public.hrms_payroll_overrides
  FOR ALL TO authenticated USING (public.is_staff_user()) WITH CHECK (public.is_staff_user());
