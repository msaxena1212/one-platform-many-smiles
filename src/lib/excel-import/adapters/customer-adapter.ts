import { supabase, type Customer } from '../../supabase';
import type { EntityImportAdapter, ColumnDefinition, ImportErrorDetail, FieldComparison, DependencyCheckItem, ImportOperation } from '../types';

export const CUSTOMER_COLUMNS: ColumnDefinition[] = [
  { key: 'customer_identifier', label: 'Customer Identifier (QID / Passport / CR)', type: 'string', required: true, unique: true, immutable: true, sampleValue: '28463401923', description: 'Qatar ID, Passport No, or Commercial Registration' },
  { key: 'full_name', label: 'Full Name / Company Name', type: 'string', required: true, sampleValue: 'ABC Trading & Contracting W.L.L.' },
  { key: 'customer_type', label: 'Customer Type', type: 'enum', required: true, allowedValues: ['Individual', 'Company'], sampleValue: 'Company' },
  { key: 'mobile_number', label: 'Mobile Number', type: 'string', required: true, sampleValue: '97455123456' },
  { key: 'email_address', label: 'Email Address', type: 'string', required: false, sampleValue: 'contact@abctrading.qa' },
  { key: 'qatar_id', label: 'Qatar ID', type: 'string', required: false, sampleValue: '28463401923' },
  { key: 'passport_number', label: 'Passport Number', type: 'string', required: false, sampleValue: 'N8829104' },
  { key: 'commercial_registration', label: 'Commercial Registration (CR)', type: 'string', required: false, sampleValue: 'CR-109283' },
  { key: 'nationality', label: 'Nationality', type: 'string', required: false, sampleValue: 'Qatari' },
  { key: 'permanent_address', label: 'Permanent Address', type: 'string', required: false, sampleValue: 'PO Box 1234, Doha, Qatar' },
  { key: 'local_address', label: 'Local Address', type: 'string', required: false, sampleValue: 'Al Sadd, Street 902' },
  { key: 'employer_name', label: 'Employer Name / Sponsor', type: 'string', required: false, sampleValue: 'Qatar Airways' },
  { key: 'designation', label: 'Designation / Occupation', type: 'string', required: false, sampleValue: 'Senior Manager' },
  { key: 'monthly_income', label: 'Monthly Income (QAR)', type: 'number', required: false, sampleValue: 28000 },
  { key: 'authorized_signatory_name', label: 'Authorized Signatory Name', type: 'string', required: false, sampleValue: 'Hamad Al-Kuwari' },
  { key: 'authorized_signatory_id', label: 'Authorized Signatory QID', type: 'string', required: false, sampleValue: '28012345678' },
  { key: 'emergency_contact_name', label: 'Emergency Contact Name', type: 'string', required: false, sampleValue: 'Ali Al-Kuwari' },
  { key: 'emergency_contact_phone', label: 'Emergency Contact Phone', type: 'string', required: false, sampleValue: '97455001122' },
  { key: 'verification_status', label: 'Verification Status', type: 'enum', required: false, allowedValues: ['Pending', 'Verified', 'Rejected', 'Additional Info Required'], sampleValue: 'Verified' },
];

export const customerAdapter: EntityImportAdapter = {
  module: 'customer',
  label: 'Customer',
  primaryKeyLabel: 'Customer Identifier (QID/Passport/CR)',
  primaryKeyField: 'customer_identifier',
  columns: CUSTOMER_COLUMNS,

  getTemplateColumns(operation: ImportOperation): ColumnDefinition[] {
    if (operation === 'DELETE') {
      return [
        CUSTOMER_COLUMNS.find(c => c.key === 'customer_identifier')!,
        CUSTOMER_COLUMNS.find(c => c.key === 'full_name')!,
      ];
    }
    return CUSTOMER_COLUMNS;
  },

  resolveRecordKey(row: Record<string, any>): string {
    const raw = row['Customer Identifier (QID / Passport / CR)'] ?? 
                row['Customer Identifier'] ?? 
                row['Qatar ID'] ?? 
                row['qatar_id'] ?? 
                row['Commercial Registration (CR)'] ?? 
                row['commercial_registration'] ?? 
                row['Passport Number'] ?? 
                row['passport_number'] ?? 
                row['customer_identifier'] ?? 
                row['ID'] ?? 
                '';
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
        field: 'Customer Identifier',
        code: 'VAL_001',
        message: 'Customer Identifier (QID, Passport, or CR) is required.',
        severity: 'ERROR',
      });
    }

    if (rawKey) {
      const upperKey = rawKey.toUpperCase();
      if (context.inBatchKeys.has(upperKey)) {
        errors.push({
          row: context.rowNumber,
          field: 'Customer Identifier',
          code: 'DUP_001',
          message: `Duplicate Customer Identifier "${rawKey}" in Excel file.`,
          severity: 'ERROR',
        });
      }
    }

    const existingRecord = context.existingRecord;

    if (operation === 'CREATE') {
      if (existingRecord) {
        errors.push({
          row: context.rowNumber,
          field: 'Customer Identifier',
          code: 'DUP_002',
          message: `Customer with identifier "${rawKey}" already exists in database.`,
          severity: 'ERROR',
          resolution: 'Use a unique identifier or UPDATE operation.',
        });
      }
    } else {
      if (!existingRecord) {
        errors.push({
          row: context.rowNumber,
          field: 'Customer Identifier',
          code: operation === 'UPDATE' ? 'UPD_001' : 'DEL_001',
          message: `Customer with identifier "${rawKey}" not found in database.`,
          severity: 'ERROR',
        });
      }
    }

    for (const col of CUSTOMER_COLUMNS) {
      if (operation === 'DELETE') continue;

      const cellValue = row[col.label] ?? row[col.label + ' *'] ?? row[col.key];

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
        } else if (col.key === 'email_address' && strVal !== '[NULL]') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(strVal)) {
            errors.push({
              row: context.rowNumber,
              field: 'Email Address',
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

    // Assign identifier correctly if individual vs company
    if (rawKey && !normalized.qatar_id && !normalized.commercial_registration && !normalized.passport_number) {
      if (normalized.customer_type === 'Company') {
        normalized.commercial_registration = rawKey;
      } else if (/^\d{11}$/.test(rawKey)) {
        normalized.qatar_id = rawKey;
      } else {
        normalized.passport_number = rawKey;
      }
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
        if (col.immutable || col.key === 'customer_identifier') continue;
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
      const key = record.recordKey;

      if (operation === 'CREATE') {
        const payload: Partial<Customer> = {
          full_name: data.full_name,
          customer_type: data.customer_type || 'Individual',
          mobile_number: data.mobile_number,
          email_address: data.email_address || null,
          qatar_id: data.qatar_id || null,
          passport_number: data.passport_number || null,
          commercial_registration: data.commercial_registration || null,
          nationality: data.nationality || null,
          permanent_address: data.permanent_address || null,
          local_address: data.local_address || null,
          employer_name: data.employer_name || null,
          designation: data.designation || null,
          monthly_income: data.monthly_income || null,
          authorized_signatory_name: data.authorized_signatory_name || null,
          authorized_signatory_id: data.authorized_signatory_id || null,
          emergency_contact_name: data.emergency_contact_name || null,
          emergency_contact_phone: data.emergency_contact_phone || null,
          verification_status: data.verification_status || 'Pending',
        };

        const { data: created, error } = await supabase.from('customers').insert(payload).select().single();
        if (error) throw error;

        return {
          success: true,
          createdId: created.id,
          resultText: `Customer "${data.full_name}" created successfully.`,
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
