-- Lease lifecycle extension for reservation-to-checkout workflows.
-- Run this in Supabase SQL Editor after the core ERP and finance migrations.

CREATE TABLE IF NOT EXISTS public.lease_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  unit_id UUID,
  unit_ref TEXT NOT NULL,
  prospect_name TEXT NOT NULL,
  marketing_agent TEXT,
  proposed_start_date DATE,
  proposed_rent NUMERIC(18,4) NOT NULL DEFAULT 0,
  valid_until DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved','converted','expired','released')),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customer_masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_type TEXT NOT NULL DEFAULT 'individual'
    CHECK (customer_type IN ('individual','company')),
  name TEXT NOT NULL,
  qatar_id TEXT,
  passport_no TEXT,
  commercial_registration_no TEXT,
  mobile TEXT,
  email TEXT,
  nationality TEXT,
  permanent_address TEXT,
  local_address TEXT,
  authorized_signatory TEXT,
  emergency_contact TEXT,
  employer_info TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft','active','duplicate','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS customer_masters_qatar_id_uidx
  ON public.customer_masters (qatar_id) WHERE qatar_id IS NOT NULL AND qatar_id <> '';
CREATE UNIQUE INDEX IF NOT EXISTS customer_masters_passport_uidx
  ON public.customer_masters (passport_no) WHERE passport_no IS NOT NULL AND passport_no <> '';
CREATE UNIQUE INDEX IF NOT EXISTS customer_masters_cr_uidx
  ON public.customer_masters (commercial_registration_no) WHERE commercial_registration_no IS NOT NULL AND commercial_registration_no <> '';
CREATE UNIQUE INDEX IF NOT EXISTS customer_masters_mobile_uidx
  ON public.customer_masters (mobile) WHERE mobile IS NOT NULL AND mobile <> '';
CREATE UNIQUE INDEX IF NOT EXISTS customer_masters_email_uidx
  ON public.customer_masters (email) WHERE email IS NOT NULL AND email <> '';

CREATE TABLE IF NOT EXISTS public.tenant_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customer_masters(id) ON DELETE CASCADE,
  lease_id UUID REFERENCES public.leases(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  mandatory BOOLEAN NOT NULL DEFAULT true,
  file_url TEXT,
  issue_date DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','verified','rejected','info_required')),
  reviewer_id UUID,
  reviewer_name TEXT,
  remarks TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leases
  ADD COLUMN IF NOT EXISTS reservation_id UUID REFERENCES public.lease_reservations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_frequency TEXT DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS grace_period_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS penalties TEXT,
  ADD COLUMN IF NOT EXISTS maintenance_responsibility TEXT,
  ADD COLUMN IF NOT EXISTS utility_responsibility TEXT,
  ADD COLUMN IF NOT EXISTS parking_details TEXT,
  ADD COLUMN IF NOT EXISTS special_conditions TEXT,
  ADD COLUMN IF NOT EXISTS notice_period_days INTEGER DEFAULT 60,
  ADD COLUMN IF NOT EXISTS tenant_signed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tenant_signed_document_url TEXT,
  ADD COLUMN IF NOT EXISTS signed_document_received_by TEXT,
  ADD COLUMN IF NOT EXISTS landlord_signed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS landlord_package_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS shared_with_tenant_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS collection_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS renewal_of UUID REFERENCES public.leases(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

ALTER TABLE public.leases
  DROP CONSTRAINT IF EXISTS leases_status_check;
ALTER TABLE public.leases
  ADD CONSTRAINT leases_status_check CHECK (
    status IN (
      'draft',
      'documents_pending',
      'documents_verified',
      'tenant_signed_pending_collection',
      'collection_completed',
      'pending_landlord_signature',
      'fully_signed',
      'active',
      'renewal_due',
      'renewed',
      'non_renewal',
      'checkout',
      'closed',
      'expiring',
      'terminated'
    )
  );

CREATE TABLE IF NOT EXISTS public.lease_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES public.leases(id) ON DELETE CASCADE,
  collection_type TEXT NOT NULL
    CHECK (collection_type IN ('advance_rent','pdc','security_deposit','agency_commission','admin_charge','utility_deposit','other')),
  amount NUMERIC(18,4) NOT NULL DEFAULT 0,
  payment_method TEXT,
  reference_no TEXT,
  received_by TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN ('pending','received','posted','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collection_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_collection_id UUID REFERENCES public.lease_collections(id) ON DELETE CASCADE,
  lease_id UUID REFERENCES public.leases(id) ON DELETE CASCADE,
  receipt_no TEXT UNIQUE NOT NULL,
  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tenant_name TEXT NOT NULL,
  property_unit TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_reference TEXT,
  amount NUMERIC(18,4) NOT NULL DEFAULT 0,
  collection_period TEXT,
  cashier_name TEXT,
  print_count INTEGER NOT NULL DEFAULT 0,
  emailed_at TIMESTAMPTZ,
  shared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.landlord_signature_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES public.leases(id) ON DELETE CASCADE,
  tenant_signed_agreement_url TEXT,
  collection_receipt_ids UUID[] NOT NULL DEFAULT '{}',
  pdc_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  security_deposit_receipt_id UUID,
  tenant_document_ids UUID[] NOT NULL DEFAULT '{}',
  approval_document_ids UUID[] NOT NULL DEFAULT '{}',
  submitted_to TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('draft','submitted','signed','returned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.key_issue_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES public.leases(id) ON DELETE CASCADE,
  handover_at TIMESTAMPTZ,
  recipients TEXT[] NOT NULL DEFAULT '{}',
  authorized_collector TEXT,
  key_count INTEGER NOT NULL DEFAULT 0,
  access_card_count INTEGER NOT NULL DEFAULT 0,
  outstanding_requirements TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','blocked','sent','cancelled')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.key_handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES public.leases(id) ON DELETE CASCADE,
  handover_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  keys_issued INTEGER NOT NULL DEFAULT 0,
  access_cards_issued INTEGER NOT NULL DEFAULT 0,
  parking_devices_issued INTEGER NOT NULL DEFAULT 0,
  utility_meter_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  tenant_acknowledged BOOLEAN NOT NULL DEFAULT false,
  issued_by TEXT,
  tenant_signature_url TEXT,
  staff_signature_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lease_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES public.leases(id) ON DELETE CASCADE,
  inspection_type TEXT NOT NULL CHECK (inspection_type IN ('check_in','check_out')),
  inspection_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unit_condition TEXT,
  furniture_condition TEXT,
  fixtures_condition TEXT,
  electricity_meter_reading TEXT,
  water_meter_reading TEXT,
  chiller_meter_reading TEXT,
  keys_count INTEGER NOT NULL DEFAULT 0,
  access_cards_count INTEGER NOT NULL DEFAULT 0,
  damages TEXT,
  pending_maintenance TEXT,
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  tenant_acknowledged BOOLEAN NOT NULL DEFAULT false,
  inspector_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lease_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES public.leases(id) ON DELETE CASCADE,
  notice_date DATE NOT NULL,
  proposed_start_date DATE,
  proposed_end_date DATE,
  proposed_rent NUMERIC(18,4) NOT NULL DEFAULT 0,
  revised_terms TEXT,
  required_notice_period_days INTEGER DEFAULT 60,
  last_confirmation_date DATE,
  outstanding_obligations TEXT,
  recipients TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'awaiting_response'
    CHECK (status IN ('awaiting_response','under_discussion','renewal_confirmed','non_renewal_confirmed')),
  remarks TEXT,
  renewed_lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lease_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES public.leases(id) ON DELETE CASCADE,
  notice_date DATE,
  planned_move_out_date DATE NOT NULL,
  required_inspection_date DATE,
  outstanding_rent_or_charges NUMERIC(18,4) NOT NULL DEFAULT 0,
  utility_clearance_requirements TEXT,
  key_return_requirements TEXT,
  check_in_comparison_summary TEXT,
  normal_wear_and_tear TEXT,
  tenant_caused_damages TEXT,
  missing_items TEXT,
  cleaning_restoration_charges NUMERIC(18,4) NOT NULL DEFAULT 0,
  finance_clearance BOOLEAN NOT NULL DEFAULT false,
  utility_clearance BOOLEAN NOT NULL DEFAULT false,
  keys_returned BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned','inspection_done','ready_for_settlement','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_deposit_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES public.leases(id) ON DELETE CASCADE,
  deposit_received NUMERIC(18,4) NOT NULL DEFAULT 0,
  outstanding_rent NUMERIC(18,4) NOT NULL DEFAULT 0,
  damage_charges NUMERIC(18,4) NOT NULL DEFAULT 0,
  utility_charges NUMERIC(18,4) NOT NULL DEFAULT 0,
  other_deductions NUMERIC(18,4) NOT NULL DEFAULT 0,
  refundable_balance NUMERIC(18,4) GENERATED ALWAYS AS (
    deposit_received - outstanding_rent - damage_charges - utility_charges - other_deductions
  ) STORED,
  approval_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (approval_status IN ('draft','pending_approval','approved','paid','rejected')),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.finance_voucher_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL,
  voucher_no TEXT UNIQUE NOT NULL,
  receipt_no TEXT,
  voucher_type TEXT NOT NULL
    CHECK (voucher_type IN ('receipt_rent','receipt_deposit','deposit_pdc','cheque_returned','rental_income','payment','tenant_settlement')),
  debit_account TEXT NOT NULL,
  credit_account TEXT NOT NULL,
  payment_method TEXT,
  collection_period TEXT,
  amount NUMERIC(18,4) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','posted','shared','reversed','cancelled')),
  posted_at TIMESTAMPTZ,
  shared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lease_lifecycle_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL,
  stage TEXT NOT NULL,
  responsible_department TEXT NOT NULL,
  input_summary TEXT NOT NULL,
  approval_summary TEXT,
  system_status TEXT NOT NULL,
  output_summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lease_lifecycle_masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_type TEXT NOT NULL,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (master_type, code)
);

INSERT INTO public.lease_lifecycle_masters (master_type, code, label, description, sort_order)
VALUES
  ('reservation_status','reserved','Reserved','Unit locked for reservation validity period.',10),
  ('reservation_status','converted','Converted','Reservation converted into lease.',20),
  ('document_status','pending','Pending','Document awaiting upload or review.',10),
  ('document_status','verified','Verified','Document accepted by leasing department.',20),
  ('document_status','rejected','Rejected','Document rejected by reviewer.',30),
  ('document_status','info_required','Additional Information Required','Tenant must resubmit or clarify.',40),
  ('voucher_type','receipt_rent','Receipts Voucher - Rent','Rent/PDC receipt document.',10),
  ('voucher_type','receipt_deposit','Receipts Voucher - Deposit','Security deposit receipt document.',20),
  ('voucher_type','deposit_pdc','Deposit Voucher - PDC','PDC deposit accounting document.',30),
  ('voucher_type','cheque_returned','Cheque Returned Voucher','Cheque return reversal document.',40),
  ('voucher_type','rental_income','Rental Income Doc','Periodic rental income recognition.',50),
  ('voucher_type','payment','Payment Voucher','Refund, vendor or owner payment.',60),
  ('voucher_type','tenant_settlement','Tenant Settlement Voucher','Final deposit settlement.',70)
ON CONFLICT (master_type, code) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;
