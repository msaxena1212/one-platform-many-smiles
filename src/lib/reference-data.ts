export type ReferenceDropdown = {
  label: string;
  value: string;
};

export const propertyMasterSeed = [
  {
    code: 'AAA',
    name: 'Old Salata - Residence No:23',
    type: 'Residential',
    category: 'Building',
    ownershipType: 'Leased',
    country: 'Qatar',
    city: 'Doha',
    owner: 'Sheikh Hassan Al-Thani',
    manager: 'Jithin Abdul Latheef',
    units: 44,
    status: 'Active',
  },
  {
    code: 'Old Salata 2',
    name: 'Old Salata - Residence No:13',
    type: 'Residential',
    category: 'Building',
    ownershipType: 'Leased',
    country: 'Qatar',
    city: 'Doha',
    owner: 'Mohamed Eisa Al-Mohannadi',
    manager: 'Jithin Abdul Latheef',
    units: 28,
    status: 'Active',
  },
];

export const unitMasterSeed = [
  {
    code: 'GF1',
    propertyCode: 'AAA',
    unitName: 'AAA - GF1',
    type: 'Apartment',
    status: 'Occupied',
    tenant: 'M/S. Al Ameen Real Estate',
    rent: 5500,
    deposit: 5500,
    frequency: 'Monthly',
  },
  {
    code: 'GF2',
    propertyCode: 'AAA',
    unitName: 'AAA - GF2',
    type: 'Apartment',
    status: 'Available',
    tenant: 'Vacant',
    rent: 5500,
    deposit: 5500,
    frequency: 'Monthly',
  },
  {
    code: 'Flat16',
    propertyCode: 'AAA',
    unitName: 'AAA - Flat16',
    type: 'Apartment',
    status: 'Occupied',
    tenant: 'Mr. Hafeez Shaik',
    rent: 5100,
    deposit: 5100,
    frequency: 'Monthly',
  },
  {
    code: 'Flat21',
    propertyCode: 'AAA',
    unitName: 'AAA - Flat21',
    type: 'Apartment',
    status: 'Occupied',
    tenant: 'Mr. Mashreq Mohammad Zain',
    rent: 6400,
    deposit: 6000,
    frequency: 'Monthly',
  },
  {
    code: 'Flat12',
    propertyCode: 'AAA',
    unitName: 'AAA - Flat12',
    type: 'Apartment',
    status: 'Occupied',
    tenant: 'Mr. Dawood Sulaiman S Al Rahbi',
    rent: 5400,
    deposit: 4750,
    frequency: 'Monthly',
  },
];

export const referenceDropdowns = {
  propertyTypes: [
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Mixed Use', value: 'Mixed Use' },
    { label: 'Retail', value: 'Retail' },
  ],
  propertyCategories: [
    { label: 'Building', value: 'Building' },
    { label: 'Villa Compound', value: 'Villa Compound' },
    { label: 'Tower', value: 'Tower' },
    { label: 'Mall', value: 'Mall' },
  ],
  ownershipTypes: [
    { label: 'Owned', value: 'Owned' },
    { label: 'Leased', value: 'Leased' },
    { label: 'Managed for Owner', value: 'Managed for Owner' },
    { label: 'Joint Venture', value: 'Joint Venture' },
  ],
  propertyStatuses: [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
    { label: 'Under Development', value: 'Under Development' },
    { label: 'Under Renovation', value: 'Under Renovation' },
  ],
  unitStatuses: [
    { label: 'Available', value: 'Available' },
    { label: 'Occupied', value: 'Occupied' },
    { label: 'Reserved', value: 'Reserved' },
    { label: 'Under Maintenance', value: 'Under Maintenance' },
  ],
  rentFrequencies: [
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Quarterly', value: 'Quarterly' },
    { label: 'Half Yearly', value: 'Half Yearly' },
    { label: 'Yearly', value: 'Yearly' },
  ],
  paymentModes: [
    { label: 'Cash', value: 'cash' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Cheque / PDC', value: 'cheque' },
    { label: 'SADAD', value: 'sadad' },
    { label: 'Mada', value: 'mada' },
  ],
  customerTypes: [
    { label: 'Individual', value: 'individual' },
    { label: 'Corporate', value: 'corporate' },
  ],
  pendingUploadFields: [
    { label: 'National ID / Passport Copy', value: 'national_id' },
    { label: 'Contract / Lease Copy', value: 'contract_copy' },
    { label: 'PDC Schedule', value: 'pdc_schedule' },
    { label: 'Security Deposit Receipt', value: 'deposit_receipt' },
    { label: 'Utility Transfer Form', value: 'utility_transfer' },
  ],
  accountTypes: [
    { label: 'Asset', value: 'asset' },
    { label: 'Liability', value: 'liability' },
    { label: 'Income', value: 'income' },
    { label: 'Expense', value: 'expense' },
  ],
};

export const accountMasterSeed = [
  { code: '1000', name: 'PDC In Hand', type: 'asset' },
  { code: '1100', name: 'Customer(PDC)-AAA Flat16', type: 'asset' },
  { code: '1200', name: 'Receivable-AAA Flat16', type: 'asset' },
  { code: '4000', name: 'Rental Income', type: 'income' },
  { code: '5000', name: 'Security Deposit Liability', type: 'liability' },
  { code: '6000', name: 'Maintenance Expense', type: 'expense' },
];

export const accountTransactionsSeed = [
  {
    voucher: 'Receipts Voucher - Rent',
    account: 'PDC In Hand',
    drCr: 'Dr',
    amount: 67200,
    period: '2025-10',
  },
  {
    voucher: 'Deposit Voucher - PDC',
    account: 'Customer(PDC)-AAA Flat16',
    drCr: 'Dr',
    amount: 5600,
    period: '2025-11',
  },
  {
    voucher: 'Revenue Generation (Single or Batch)',
    account: 'Receivable-AAA Flat16',
    drCr: 'Dr',
    amount: 5600,
    period: '2025-12',
  },
];

export const reservationStatusMasters = [
  { label: 'Reserved', value: 'reserved', description: 'Unit is locked for a prospect until validity expiry.' },
  { label: 'Converted', value: 'converted', description: 'Reservation was converted into a lease record.' },
  { label: 'Expired', value: 'expired', description: 'Validity ended and the unit can be released.' },
  { label: 'Released', value: 'released', description: 'Reservation cancelled and unit returned to available stock.' },
];

export const customerIdentityMasters = [
  { label: 'Qatar ID', value: 'qatar_id', description: 'Primary duplicate check for individual tenants.' },
  { label: 'Passport Number', value: 'passport', description: 'Fallback duplicate check for non-resident individuals.' },
  { label: 'Commercial Registration', value: 'commercial_registration', description: 'Primary duplicate check for companies.' },
  { label: 'Mobile Number', value: 'mobile', description: 'Contact-level duplicate prevention.' },
  { label: 'Email Address', value: 'email', description: 'Contact-level duplicate prevention.' },
];

export const documentVerificationMasters = [
  { label: 'Pending', value: 'pending', description: 'Document is expected but has not yet been accepted.' },
  { label: 'Verified', value: 'verified', description: 'Document was reviewed and lease generation is allowed.' },
  { label: 'Rejected', value: 'rejected', description: 'Document cannot be used for lease preparation.' },
  { label: 'Additional Information Required', value: 'info_required', description: 'Tenant must resubmit or clarify the document.' },
];

export const leaseStatusMasters = [
  { label: 'Draft', value: 'draft', description: 'Lease created but not ready for signature.' },
  { label: 'Documents Pending', value: 'documents_pending', description: 'Mandatory document checklist is incomplete.' },
  { label: 'Documents Verified', value: 'documents_verified', description: 'Lease may be sent to the tenant for signature.' },
  { label: 'Tenant Signed – Pending Collection & Landlord Signature', value: 'tenant_signed_pending_collection', description: 'Tenant signature captured; cashier collection and landlord signature are pending.' },
  { label: 'Collection Completed', value: 'collection_completed', description: 'Rent, PDC, deposit and other receipts were generated.' },
  { label: 'Pending Landlord Signature', value: 'pending_landlord_signature', description: 'Lease package submitted to landlord or authorized signatory for signature.' },
  { label: 'Fully Signed', value: 'fully_signed', description: 'Tenant and landlord signatures are complete; lease shared with tenant.' },
  { label: 'Active', value: 'active', description: 'Keys issued, check-in completed and unit is occupied.' },
  { label: 'Renewal Due', value: 'renewal_due', description: 'Lease is within the 60-day renewal notification window.' },
  { label: 'Renewed', value: 'renewed', description: 'Lease successfully renewed; new lease period activated.' },
  { label: 'Non-Renewal', value: 'non_renewal', description: 'Tenant confirmed non-renewal; checkout process initiated.' },
  { label: 'Expiring', value: 'expiring', description: 'Lease approaching expiry; awaiting renewal or checkout decision.' },
  { label: 'Checkout', value: 'checkout', description: 'Non-renewal move-out workflow is active.' },
  { label: 'Terminated', value: 'terminated', description: 'Lease terminated early before natural expiry.' },
  { label: 'Closed', value: 'closed', description: 'Final settlement, refund and unit release are complete.' },
];

export const keyHandoverMasters = [
  { label: 'Apartment Keys', value: 'apartment_keys', description: 'Physical keys issued to the tenant.' },
  { label: 'Access Cards', value: 'access_cards', description: 'Building, lift or amenity access credentials.' },
  { label: 'Parking Remote', value: 'parking_remote', description: 'Remote/card issued for parking access.' },
  { label: 'Meter Readings', value: 'meter_readings', description: 'Electricity, water and chiller readings at handover.' },
  { label: 'Tenant Acknowledgement', value: 'tenant_acknowledgement', description: 'Tenant confirms receipt and condition.' },
];

export const securitySettlementMasters = [
  { label: 'Outstanding Rent', value: 'outstanding_rent', description: 'Rent dues deducted before refund.' },
  { label: 'Damage Charges', value: 'damage_charges', description: 'Tenant-caused repair costs from checkout inspection.' },
  { label: 'Utility Charges', value: 'utility_charges', description: 'Pending electricity, water or chiller balances.' },
  { label: 'Unreturned Keys', value: 'unreturned_keys', description: 'Replacement charges for missing access items.' },
  { label: 'Refundable Balance', value: 'refundable_balance', description: 'Security deposit balance payable to tenant.' },
];

export const voucherDocumentMasters = [
  { label: 'Receipts Voucher - Rent', value: 'receipt_rent', description: 'Dr PDC/Cash/Bank, Cr Customer or rent receivable.' },
  { label: 'Receipts Voucher - Deposit', value: 'receipt_deposit', description: 'Dr Cash/Bank, Cr Security Deposit Liability.' },
  { label: 'Deposit Voucher - PDC', value: 'deposit_pdc', description: 'Dr Bank, Cr PDC In Hand; update customer PDC receivable.' },
  { label: 'Cheque Returned Voucher', value: 'cheque_returned', description: 'Reverse bank deposit and reopen receivable/PDC.' },
  { label: 'Rental Income Doc', value: 'rental_income_doc', description: 'Recognize rental income by period, single or batch.' },
  { label: 'Payment Voucher', value: 'payment_voucher', description: 'Vendor, owner distribution or tenant refund payment.' },
  { label: 'Tenant Settlement Voucher', value: 'tenant_settlement', description: 'Apply deductions and compute refundable balance.' },
];

export const leaseLifecycleSteps = [
  { code: 'reservation',        label: 'Reserve Unit',         owner: 'Marketing Agent' },
  { code: 'customer',           label: 'Customer Master',      owner: 'Leasing Dept' },
  { code: 'documents',          label: 'Verify Documents',     owner: 'Leasing Dept' },
  { code: 'agreement',          label: 'Lease Agreement',      owner: 'Leasing Dept' },
  { code: 'tenant_signature',   label: 'Tenant Signature',     owner: 'Tenant' },
  { code: 'collection',         label: 'Collect Rent / PDC',   owner: 'Finance / Cashier' },
  { code: 'receipts',           label: 'Receipt Generation',   owner: 'Finance / Cashier' },
  { code: 'landlord_signature', label: 'Landlord Signature',   owner: 'Landlord / Owner' },
  { code: 'key_notice',         label: 'Key Issue Notice',     owner: 'Leasing Dept' },
  { code: 'key_handover',       label: 'Key Handover',         owner: 'Property Manager' },
  { code: 'checkin',            label: 'Check-In',             owner: 'Property Manager' },
  { code: 'renewal',            label: 'Renewal Notice',       owner: 'Leasing Dept' },
  { code: 'renewal_process',    label: 'Renewal Process',      owner: 'Leasing Dept' },
  { code: 'checkout',           label: 'Non-Renewal / Checkout', owner: 'Finance / PM' },
  { code: 'settlement',         label: 'Deposit Settlement',   owner: 'Finance Dept' },
];

// PDC cheque status master
export const pdcStatusMasters = [
  { label: 'Received',   value: 'received',   description: 'Cheque received from tenant and logged in the system.' },
  { label: 'Deposited',  value: 'deposited',  description: 'Cheque deposited into the bank for clearing.' },
  { label: 'Cleared',    value: 'cleared',    description: 'Cheque cleared successfully; funds received.' },
  { label: 'Returned',   value: 'returned',   description: 'Cheque returned / bounced by the bank.' },
  { label: 'Replaced',   value: 'replaced',   description: 'Returned cheque replaced with a new cheque.' },
  { label: 'Cancelled',  value: 'cancelled',  description: 'Cheque cancelled before deposit.' },
];

// Collection type master – maps to lease_collections.collection_type
export const collectionTypeMasters = [
  { label: 'Advance Rent',          value: 'advance_rent',       description: 'Advance rent payment collected at lease start.' },
  { label: 'Post-Dated Cheques',    value: 'pdc',                description: 'Post-dated cheques for periodic rent payments.' },
  { label: 'Security Deposit',      value: 'security_deposit',   description: 'Refundable security deposit held for the lease term.' },
  { label: 'Agency Commission',     value: 'agency_commission',  description: 'One-time commission charged by the marketing / leasing agent.' },
  { label: 'Admin / Registration',  value: 'admin_charge',       description: 'Administrative, registration or processing charges.' },
  { label: 'Utility Deposit',       value: 'utility_deposit',    description: 'Refundable deposit held against utility consumption.' },
  { label: 'Other',                 value: 'other',              description: 'Any other approved collection not covered above.' },
];

// Unit disposition options after lease closure
export const unitDispositionMasters = [
  { label: 'Vacant – Available',          value: 'Vacant - Available',          description: 'Unit cleaned and ready for new tenants.' },
  { label: 'Vacant – Under Maintenance',  value: 'Vacant - Under Maintenance',  description: 'Unit requires repair or maintenance before re-letting.' },
  { label: 'Vacant – Reserved',           value: 'Vacant - Reserved',           description: 'Unit already reserved for the next incoming tenant.' },
];
