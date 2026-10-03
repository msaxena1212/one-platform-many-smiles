import { supabase, type Customer } from '../../supabase';
import { 
  type EntityImportAdapter, 
  type ColumnDefinition, 
  type ImportErrorDetail, 
  type FieldComparison, 
  type DependencyCheckItem, 
  type ImportOperation,
  getCellValue,
  sanitizeDateForPostgres
} from '../types';

export const CUSTOMER_COLUMNS: ColumnDefinition[] = [
  // Core & Common Fields
  { key: 'customer_type', label: 'Customer Type', type: 'enum', required: true, allowedValues: ['Individual', 'Company', 'Corporate', 'individual', 'company', 'corporate'], sampleValue: 'Individual', description: 'Specify whether the customer is an Individual or Company' },
  { key: 'display_name', label: 'Customer / Company Display Name', type: 'string', required: true, sampleValue: 'Ahmed Al-Kuwari', description: 'Display name used across contracts, listings and portals' },
  { key: 'primary_mobile', label: 'Primary Mobile', type: 'string', required: false, sampleValue: '+974 5512 3456', description: 'Primary contact mobile number (required for Individual customers)' },
  { key: 'primary_email', label: 'Primary Email', type: 'string', required: false, sampleValue: 'ahmed.alkuwari@example.qa', description: 'Primary email address' },
  { key: 'current_address', label: 'Current Address', type: 'string', required: false, sampleValue: 'Zone 55, Street 820, Building 14, Doha, Qatar' },
  { key: 'preferred_communication', label: 'Preferred Communication', type: 'enum', required: false, allowedValues: ['WhatsApp', 'Email', 'SMS', 'Phone Call', 'Mobile Call', 'Call', 'Phone'], sampleValue: 'WhatsApp' },
  { key: 'customer_status', label: 'Customer Status', type: 'enum', required: true, allowedValues: ['Active', 'Inactive', 'Blacklisted', 'Prospect', 'active', 'inactive', 'blacklisted', 'prospect'], sampleValue: 'Active' },
  { key: 'approval_status', label: 'Approval Status', type: 'enum', required: false, allowedValues: ['Pending', 'Approved', 'Rejected', 'Under Review', 'pending', 'approved', 'rejected', 'under review'], sampleValue: 'Approved' },
  { key: 'remarks', label: 'Remarks', type: 'string', required: false, sampleValue: 'VIP tenant referred by management' },

  // Individual Fields
  { key: 'first_name', label: 'First Name', type: 'string', required: false, sampleValue: 'Ahmed', description: 'Required for Individual customers' },
  { key: 'middle_name', label: 'Middle Name', type: 'string', required: false, sampleValue: 'Hassan' },
  { key: 'last_name', label: 'Last Name', type: 'string', required: false, sampleValue: 'Al-Kuwari', description: 'Required for Individual customers' },
  { key: 'nationality', label: 'Nationality', type: 'string', required: false, sampleValue: 'Qatari' },
  { key: 'qatar_id', label: 'QID / National ID No.', type: 'string', required: false, sampleValue: '28463401923', description: '11 digits QID for individuals' },
  { key: 'qid_expiry_date', label: 'QID Expiry Date', type: 'date', required: false, sampleValue: '2028-12-31' },
  { key: 'passport_number', label: 'Passport No.', type: 'string', required: false, sampleValue: 'N8829104' },
  { key: 'passport_expiry_date', label: 'Passport Expiry Date', type: 'date', required: false, sampleValue: '2029-06-15' },
  { key: 'date_of_birth', label: 'Date of Birth', type: 'date', required: false, sampleValue: '1988-04-12' },
  { key: 'gender', label: 'Gender', type: 'enum', required: false, allowedValues: ['Male', 'Female', 'Other'], sampleValue: 'Male' },
  { key: 'employer_name', label: 'Employer / Company', type: 'string', required: false, sampleValue: 'Qatar Energy' },
  { key: 'designation', label: 'Occupation / Designation', type: 'string', required: false, sampleValue: 'Senior Petroleum Engineer' },
  { key: 'emergency_contact_name', label: 'Emergency Contact Name', type: 'string', required: false, sampleValue: 'Ali Al-Kuwari' },
  { key: 'emergency_contact_phone', label: 'Emergency Contact No.', type: 'string', required: false, sampleValue: '+974 5500 1122' },

  // Corporate / Company Fields
  { key: 'company_legal_name', label: 'Company Legal Name', type: 'string', required: false, sampleValue: 'Gulf Horizon Trading & Contracting W.L.L.', description: 'Required for Company customers' },
  { key: 'trade_name', label: 'Trade Name', type: 'string', required: false, sampleValue: 'Gulf Horizon' },
  { key: 'commercial_registration', label: 'Commercial Registration No.', type: 'string', required: false, sampleValue: 'CR-109283', description: 'Required for Company customers' },
  { key: 'cr_expiry_date', label: 'CR Expiry Date', type: 'date', required: false, sampleValue: '2027-10-30' },
  { key: 'trade_licence_no', label: 'Trade Licence No.', type: 'string', required: false, sampleValue: 'TL-98214' },
  { key: 'trade_licence_expiry_date', label: 'Trade Licence Expiry Date', type: 'date', required: false, sampleValue: '2027-10-30' },
  { key: 'computer_card_no', label: 'Computer Card No.', type: 'string', required: false, sampleValue: 'CC-448291' },
  { key: 'computer_card_expiry_date', label: 'Computer Card Expiry Date', type: 'date', required: false, sampleValue: '2027-10-30' },
  { key: 'tax_identification_no', label: 'Tax Identification No.', type: 'string', required: false, sampleValue: 'TIN-0092182' },
  { key: 'registered_office_address', label: 'Registered Office Address', type: 'string', required: false, sampleValue: 'West Bay, Tower 3, Floor 14, Doha' },
  { key: 'billing_address', label: 'Billing Address', type: 'string', required: false, sampleValue: 'PO Box 99882, Doha, Qatar' },
  { key: 'company_telephone', label: 'Company Telephone', type: 'string', required: false, sampleValue: '+974 4400 1122' },
  { key: 'website', label: 'Website', type: 'string', required: false, sampleValue: 'https://gulfhorizon.qa' },
  { key: 'industry_activity', label: 'Industry / Business Activity', type: 'string', required: false, sampleValue: 'Commercial Trading & General Contracting' },
  { key: 'authorized_signatory_name', label: 'Authorized Signatory Name', type: 'string', required: false, sampleValue: 'Hamad Al-Kuwari' },
  { key: 'signatory_qid_passport', label: 'Signatory QID / Passport No.', type: 'string', required: false, sampleValue: '28012345678' },
  { key: 'signatory_id_expiry_date', label: 'Signatory ID Expiry Date', type: 'date', required: false, sampleValue: '2028-05-20' },
  { key: 'primary_contact_person', label: 'Primary Contact Person', type: 'string', required: false, sampleValue: 'Nasser Al-Mannai' },
  { key: 'contact_designation', label: 'Contact Designation', type: 'string', required: false, sampleValue: 'Procurement Director' },
  { key: 'contact_mobile', label: 'Contact Mobile', type: 'string', required: false, sampleValue: '+974 3311 2233' },
  { key: 'contact_email', label: 'Contact Email', type: 'string', required: false, sampleValue: 'nasser@gulfhorizon.qa' },
];

export const customerAdapter: EntityImportAdapter = {
  module: 'customer',
  label: 'Customer',
  primaryKeyLabel: 'Customer / Company Display Name',
  primaryKeyField: 'display_name',
  columns: CUSTOMER_COLUMNS,

  getTemplateColumns(operation: ImportOperation): ColumnDefinition[] {
    if (operation === 'DELETE') {
      return [
        CUSTOMER_COLUMNS.find(c => c.key === 'display_name')!,
        CUSTOMER_COLUMNS.find(c => c.key === 'customer_type')!,
        CUSTOMER_COLUMNS.find(c => c.key === 'primary_mobile')!,
      ];
    }
    return CUSTOMER_COLUMNS;
  },

  resolveRecordKey(row: Record<string, any>): string {
    const raw = getCellValue(
      row,
      'Customer / Company Display Name *',
      'Customer / Company Display Name',
      'Customer / Company Name *',
      'Customer / Company Name',
      'display_name',
      'Full Name / Company Name',
      'full_name',
      'Company Legal Name *',
      'Company Legal Name',
      'QID / National ID No.',
      'Commercial Registration No. *',
      'Commercial Registration No.'
    ) ?? '';
    return String(raw).trim();
  },

  async fetchExistingRecords(keys: string[]): Promise<Map<string, Record<string, any>>> {
    const map = new Map<string, Record<string, any>>();
    if (keys.length === 0) return map;

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*');

      if (!error && data) {
        for (const row of data) {
          const idCandidates = [
            row.display_name,
            row.full_name,
            row.company_legal_name,
            row.qatar_id,
            row.passport_number,
            row.commercial_registration,
            row.id,
          ].filter(Boolean);

          for (const cand of idCandidates) {
            map.set(String(cand).trim().toUpperCase(), row);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching customers:', e);
    }
    return map;
  },

  async validateRow(row, operation, context) {
    const errors: ImportErrorDetail[] = [];
    const warnings: ImportErrorDetail[] = [];
    const changes: FieldComparison[] = [];
    const dependencies: DependencyCheckItem[] = [];
    const normalized: Record<string, any> = {};

    const rawKey = customerAdapter.resolveRecordKey(row);

    if (!rawKey) {
      errors.push({
        row: context.rowNumber,
        field: 'Customer / Company Display Name',
        code: 'VAL_001',
        message: 'Customer / Company Display Name is required.',
        severity: 'ERROR',
      });
    }

    // Helper: name-based company detection (same heuristic used across the codebase)
    const guessIsCompany = (name: string): boolean => {
      const l = (name || '').toLowerCase().trim();
      return (
        l.startsWith('m/s') || l.startsWith('m/s.') ||
        l.includes('trading') || l.includes('w.l.l') || l.includes('llc') ||
        l.includes('corp') || l.includes('group') || l.includes(' co.') ||
        l.includes('company') || l.includes('services') || l.includes('international') ||
        l.includes('logistics') || l.includes('contracting') || l.includes('industries') ||
        l.includes('enterprise') || l.includes('real estate') || l.includes('embassy') ||
        l.includes('solutions') || l.includes('limited') || l.includes('sport club') ||
        l.includes('electrical') || l.includes('katara') || l.includes('larsen') ||
        l.includes('kentz') || l.includes('saipem') || l.includes('special numberz') ||
        l.includes('glamour') || l.includes('alfanet') || l.includes('axiom') ||
        l.includes('ministry') || l.includes('authority') || l.includes('agency') ||
        l.includes('foundation') || l.includes('institute') || l.includes('hospital') ||
        l.includes('clinic') || l.includes('school') || l.includes('academy') ||
        l.includes('petroleum') || l.includes('energy') || l.includes('construction') ||
        l.includes('accommodation') || l.includes('staff accommodation') ||
        l.includes('university') || l.includes('college') || l.includes('center') ||
        l.includes('centre') || l.includes('bank') || l.includes('finance') ||
        l.includes('investment') || l.includes('holdings') || l.includes('properties') ||
        l.includes('development') || l.includes('management') || l.includes('consultancy') ||
        l.includes('advisory') || l.includes('law firm') || l.includes('architects') ||
        l.includes('engineering') || l.includes('technologies') || l.includes('media')
      );
    };

    // Resolve customer type early for duplicate logic
    // Use explicit type field first, then company-specific fields, then name heuristic
    const rawType = (getCellValue(row, 'Customer Type', 'customer_type') ?? '').toString().toLowerCase();
    const hasCompanyFields = !!(
      getCellValue(row, 'Company Legal Name', 'company_legal_name') ||
      getCellValue(row, 'Commercial Registration No.', 'commercial_registration')
    );
    const isCompanyRow =
      rawType === 'company' ||
      (rawType !== 'individual' && hasCompanyFields) ||
      (rawType !== 'individual' && guessIsCompany(rawKey));

    if (rawKey) {
      const upperKey = rawKey.toUpperCase();
      if (context.inBatchKeys.has(upperKey)) {
        if (isCompanyRow) {
          // Corporate names can legitimately repeat (e.g. "Staff Accommodation", "Embassy of Pakistan", "Qatar Kentz")
          // This is a WARNING only — companies with multiple staff/units may appear many times
          warnings.push({
            row: context.rowNumber,
            field: 'Customer / Company Display Name',
            code: 'DUP_001',
            message: `Duplicate company name "${rawKey}" in Excel — allowed for corporate customers with multiple entries.`,
            severity: 'WARNING',
          });
        } else {
          // Individual duplicate in the Excel — downgrade to WARNING so the batch still runs.
          // The first occurrence will be committed; this row will be skipped on execute.
          warnings.push({
            row: context.rowNumber,
            field: 'Customer / Company Display Name',
            code: 'DUP_001',
            message: `Duplicate individual "${rawKey}" in Excel file — first occurrence will be created, this row will be skipped.`,
            severity: 'WARNING',
          });
        }
      }
    }

    const existingRecord = context.existingRecord;

    if (operation === 'CREATE') {
      if (existingRecord) {
        if (isCompanyRow) {
          // Corporate customers may share names — only block if CR number also matches (checked later)
          warnings.push({
            row: context.rowNumber,
            field: 'Customer / Company Display Name',
            code: 'DUP_002',
            message: `A corporate customer named "${rawKey}" already exists — will create a new record.`,
            severity: 'WARNING',
          });
        } else {
          errors.push({
            row: context.rowNumber,
            field: 'Customer / Company Display Name',
            code: 'DUP_002',
            message: `Customer "${rawKey}" already exists in database.`,
            severity: 'ERROR',
            resolution: 'Use a unique name or UPDATE operation.',
          });
        }
      }
    } else {
      if (!existingRecord) {
        errors.push({
          row: context.rowNumber,
          field: 'Customer / Company Display Name',
          code: operation === 'UPDATE' ? 'UPD_001' : 'DEL_001',
          message: `Customer "${rawKey}" not found in database.`,
          severity: 'ERROR',
        });
      }
    }


    for (const col of CUSTOMER_COLUMNS) {
      if (operation === 'DELETE') continue;

      const cellValue = getCellValue(row, col.label, col.key, col.dbField);

      if (operation === 'CREATE' && col.required && (cellValue === undefined || cellValue === null || String(cellValue).trim() === '')) {
        errors.push({
          row: context.rowNumber,
          field: col.label,
          code: 'VAL_001',
          message: `${col.label} is required.`,
          severity: 'ERROR',
        });
      }

      if (cellValue !== undefined && cellValue !== null && String(cellValue).trim() !== '') {
        const strVal = String(cellValue).trim();

        if (strVal === '[NULL]') {
          normalized[col.key] = null;
        } else if (col.type === 'date') {
          // ── Excel serial numbers (e.g. 46264) and all other date formats → YYYY-MM-DD
          const sanitized = sanitizeDateForPostgres(cellValue);
          if (sanitized) {
            normalized[col.key] = sanitized;
          } else if (strVal) {
            errors.push({
              row: context.rowNumber,
              field: col.label,
              code: 'VAL_003',
              message: `Invalid date value "${strVal}" for ${col.label}. Expected YYYY-MM-DD, DD/MM/YYYY or an Excel serial date.`,
              severity: 'ERROR',
            });
          }
        } else if (col.type === 'number') {
          const num = Number(strVal.replace(/,/g, ''));
          if (isNaN(num)) {
            errors.push({
              row: context.rowNumber,
              field: col.label,
              code: 'VAL_005',
              message: `${col.label} must be a numeric value.`,
              severity: 'ERROR',
            });
          } else {
            normalized[col.key] = num;
          }
        } else if ((col.key === 'primary_email' || col.key === 'contact_email') && strVal !== '[NULL]') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(strVal)) {
            errors.push({
              row: context.rowNumber,
              field: col.label,
              code: 'VAL_002',
              message: `Invalid email format: "${strVal}"`,
              severity: 'ERROR',
            });
          }
          normalized[col.key] = strVal;
        } else {
          normalized[col.key] = strVal;
        }
      }
    }

    // ── Normalize customer_type to DB-constraint-safe values ─────────────────
    // DB check constraint only allows 'Individual' | 'Company'.
    // Map: corporate / company → 'Company',  everything else → 'Individual'.
    if (normalized.customer_type !== undefined) {
      const rawCt = (normalized.customer_type || '').toLowerCase().trim();
      if (rawCt === 'company' || rawCt === 'corporate') {
        normalized.customer_type = 'Company';
      } else {
        normalized.customer_type = 'Individual';
      }
    }

    // Contextual type checks (Individual vs Company)
    const custType = (normalized.customer_type || '').toLowerCase();
    if (operation === 'CREATE') {
      if (custType === 'individual') {
        if (!normalized.first_name && !normalized.display_name) {
          errors.push({
            row: context.rowNumber,
            field: 'First Name',
            code: 'VAL_001',
            message: 'First Name is required for Individual customers.',
            severity: 'ERROR',
          });
        }
        // Primary mobile is required for individuals
        if (!normalized.primary_mobile) {
          errors.push({
            row: context.rowNumber,
            field: 'Primary Mobile',
            code: 'VAL_001',
            message: 'Primary Mobile is required for Individual customers.',
            severity: 'ERROR',
          });
        }
      } else if (custType === 'company') {
        if (!normalized.company_legal_name && !normalized.display_name) {
          errors.push({
            row: context.rowNumber,
            field: 'Company Legal Name',
            code: 'VAL_001',
            message: 'Company Legal Name is required for Corporate customers.',
            severity: 'ERROR',
          });
        }
        if (!normalized.commercial_registration) {
          warnings.push({
            row: context.rowNumber,
            field: 'Commercial Registration No.',
            code: 'WARN_001',
            message: 'Commercial Registration (CR) No. is recommended for corporate profiles.',
            severity: 'WARNING',
          });
        }
      }
    }

    // Sync legacy/alias fields
    if (!normalized.full_name && normalized.display_name) {
      normalized.full_name = normalized.display_name;
    }
    if (!normalized.mobile_number && normalized.primary_mobile) {
      normalized.mobile_number = normalized.primary_mobile;
    }
    if (!normalized.email_address && normalized.primary_email) {
      normalized.email_address = normalized.primary_email;
    }

    // Customer Delete / Active Leases Check
    if (operation === 'DELETE' && existingRecord) {
      try {
        const { data: linkedLeases } = await supabase
          .from('leases')
          .select('id, lease_number, lease_status')
          .eq('customer_id', existingRecord.id)
          .in('lease_status', ['ACTIVE', 'RENEWAL_CONFIRMED', 'KEY_HANDED_OVER', 'TENANT_SIGNED']);

        const leaseCount = linkedLeases?.length ?? 0;

        dependencies.push({
          dependency: 'Active Leases',
          count: leaseCount,
          result: leaseCount > 0 ? 'Blocked' : 'Pass',
          details: leaseCount > 0 ? `${leaseCount} active leases attached to customer.` : 'No active leases.',
        });

        if (leaseCount > 0) {
          errors.push({
            row: context.rowNumber,
            field: 'Customer Identifier',
            code: 'DEL_003',
            message: `Customer cannot be deleted while having active leases.`,
            severity: 'ERROR',
          });
        }
      } catch (e) {
        console.error('Customer lease check error:', e);
      }
    }

    // Diffs for UPDATE
    if (operation === 'UPDATE' && existingRecord) {
      for (const col of CUSTOMER_COLUMNS) {
        if (col.immutable) continue;
        const oldVal = existingRecord[col.key];
        const cellValue = row[col.label] ?? row[col.label + ' *'] ?? row[col.key];

        if (cellValue === undefined || cellValue === null || String(cellValue).trim() === '') {
          continue;
        }

        const newVal = normalized[col.key];
        const isChanged = String(oldVal ?? '').trim() !== String(newVal ?? '').trim();

        if (isChanged) {
          changes.push({
            field: col.key,
            label: col.label,
            oldValue: oldVal ?? '—',
            newValue: newVal === null ? '[CLEARED]' : newVal,
            status: newVal === null ? 'CLEARED' : 'CHANGED',
          });
        }
      }
    }

    return {
      errors,
      warnings,
      normalized,
      changes,
      dependencies,
    };
  },

  async executeRecord(record, operation, user) {
    try {
      const data = record.normalizedData;

      if (operation === 'CREATE') {
        // Skip rows that are in-batch duplicates (DUP_001 warning) — the first occurrence already ran.
        // This prevents creating duplicate records for the same individual appearing twice in the Excel.
        const hasDup001 = record.warnings?.some((w: any) => w.code === 'DUP_001') ?? false;
        const hasNoErrors = !record.errors?.length;
        if (hasDup001 && hasNoErrors && record.status === 'WARNING') {
          // Check if a record with this name now exists in the DB (first occurrence created it)
          const dupCheckName = data.display_name || data.full_name || '';
          if (dupCheckName) {
            const { data: existing } = await supabase
              .from('customers')
              .select('id')
              .or(`display_name.eq.${dupCheckName},full_name.eq.${dupCheckName}`)
              .limit(1);
            if (existing && existing.length > 0) {
              return {
                success: true,
                resultText: `Duplicate row for "${dupCheckName}" — skipped (first occurrence already created).`,
              };
            }
          }
        }

        const displayName = data.display_name || data.full_name || (data.first_name ? `${data.first_name} ${data.last_name || ''}`.trim() : 'Customer');
        // Build base payload with robust fallback
        // ── Normalize customer_type before DB insert (constraint: Individual | Company only) ──
        const rawCustomerType = (data.customer_type || '').toLowerCase().trim();
        const normalizedCustomerType: string =
          rawCustomerType === 'company' || rawCustomerType === 'corporate' ? 'Company' : 'Individual';

        const payload: Record<string, any> = {
          customer_type: normalizedCustomerType,
          display_name: displayName,
          full_name: displayName,
          primary_mobile: data.primary_mobile || data.mobile_number || '',
          mobile_number: data.primary_mobile || data.mobile_number || '',
          primary_email: data.primary_email || data.email_address || null,
          email_address: data.primary_email || data.email_address || null,
          current_address: data.current_address || data.local_address || null,
          local_address: data.current_address || data.local_address || null,
          preferred_communication: data.preferred_communication || 'WhatsApp',
          customer_status: data.customer_status || 'Active',
          remarks: data.remarks || null,

          // Individual fields
          first_name: data.first_name || null,
          middle_name: data.middle_name || null,
          last_name: data.last_name || null,
          nationality: data.nationality || null,
          qatar_id: data.qatar_id || null,
          // ── All date fields go through sanitizeDateForPostgres at validate time;
          //    here we pass them as-is (already YYYY-MM-DD or null).
          qid_expiry_date: sanitizeDateForPostgres(data.qid_expiry_date) || null,
          passport_number: data.passport_number || null,
          passport_expiry_date: sanitizeDateForPostgres(data.passport_expiry_date) || null,
          date_of_birth: sanitizeDateForPostgres(data.date_of_birth) || null,
          gender: data.gender || null,
          employer_name: data.employer_name || null,
          designation: data.designation || null,
          emergency_contact_name: data.emergency_contact_name || null,
          emergency_contact_phone: data.emergency_contact_phone || null,

          // Company fields
          company_legal_name: data.company_legal_name || null,
          trade_name: data.trade_name || null,
          commercial_registration: data.commercial_registration || null,
          cr_expiry_date: sanitizeDateForPostgres(data.cr_expiry_date) || null,
          trade_licence_no: data.trade_licence_no || null,
          trade_licence_expiry_date: sanitizeDateForPostgres(data.trade_licence_expiry_date) || null,
          computer_card_no: data.computer_card_no || null,
          computer_card_expiry_date: sanitizeDateForPostgres(data.computer_card_expiry_date) || null,
          tax_identification_no: data.tax_identification_no || null,
          registered_office_address: data.registered_office_address || null,
          billing_address: data.billing_address || null,
          company_telephone: data.company_telephone || null,
          website: data.website || null,
          industry_activity: data.industry_activity || null,
          authorized_signatory_name: data.authorized_signatory_name || null,
          signatory_qid_passport: data.signatory_qid_passport || data.authorized_signatory_id || null,
          authorized_signatory_id: data.signatory_qid_passport || data.authorized_signatory_id || null,
          signatory_id_expiry_date: sanitizeDateForPostgres(data.signatory_id_expiry_date) || null,
          primary_contact_person: data.primary_contact_person || null,
          contact_designation: data.contact_designation || null,
          contact_mobile: data.contact_mobile || null,
          contact_email: data.contact_email || null,

          verification_status: data.approval_status === 'Approved' ? 'Verified' : 'Pending',
        };

        if (data.approval_status) {
          payload.approval_status = data.approval_status;
        }

        // Resilient insert helper that automatically strips columns missing from the database schema
        let createdRecord: any = null;
        let lastError: any = null;
        const currentPayload = { ...payload };

        for (let attempt = 0; attempt < 5; attempt++) {
          const { data: created, error } = await supabase.from('customers').insert(currentPayload).select().single();
          if (!error) {
            createdRecord = created;
            lastError = null;
            break;
          }

          lastError = error;
          const msg = error.message || '';
          // Check if error is column missing in schema cache: e.g. "Could not find the 'billing_address' column of 'customers' in the schema cache"
          const missingColMatch = msg.match(/Could not find the '([^']+)' column of 'customers'/i);
          if (missingColMatch && missingColMatch[1]) {
            const missingCol = missingColMatch[1];
            delete currentPayload[missingCol];
            continue;
          } else if (msg.includes('approval_status') && currentPayload.approval_status !== undefined) {
            delete currentPayload.approval_status;
            continue;
          } else {
            break;
          }
        }

        if (lastError) throw lastError;

        return {
          success: true,
          createdId: createdRecord?.id,
          resultText: `Customer "${payload.display_name}" created successfully.`,
        };
      }

      if (operation === 'UPDATE') {
        const existing = record.originalDbData;
        if (!existing?.id) throw new Error('Customer ID not found');

        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        for (const change of record.changes) {
          updatePayload[change.field] = change.newValue === '[CLEARED]' ? null : change.newValue;
        }

        const { error } = await supabase.from('customers').update(updatePayload).eq('id', existing.id);
        if (error) throw error;

        return {
          success: true,
          resultText: `Customer "${existing.full_name}" updated (${record.changes.length} fields).`,
        };
      }

      if (operation === 'DELETE') {
        const existing = record.originalDbData;
        if (!existing?.id) throw new Error('Customer ID not found');

        const { error } = await supabase.from('customers').delete().eq('id', existing.id);
        if (error) throw error;

        return {
          success: true,
          resultText: `Customer "${existing.full_name}" deleted.`,
        };
      }

      return { success: false, resultText: 'Unsupported operation' };
    } catch (err: any) {
      return {
        success: false,
        resultText: 'Failed to process customer record',
        error: err?.message || 'Database error occurred',
      };
    }
  },
};
