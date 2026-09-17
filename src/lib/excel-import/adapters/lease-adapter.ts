import { supabase, type Lease } from '../../supabase';
import { 
  type EntityImportAdapter, 
  type ColumnDefinition, 
  type ImportErrorDetail, 
  type FieldComparison, 
  type DependencyCheckItem, 
  type ImportOperation,
  getCellValue
} from '../types';
import { referenceDropdowns } from '../../reference-data';

export const LEASE_COLUMNS: ColumnDefinition[] = [
  { key: 'lease_number', label: 'Lease Number / Ref', type: 'string', required: true, unique: true, immutable: true, sampleValue: 'LS-2026-001', description: 'Unique lease contract identifier' },
  { key: 'customer_identifier', label: 'Customer Identifier (QID/Passport/CR)', type: 'string', required: true, sampleValue: '28463401923', description: 'Must exist in Customer Master' },
  { key: 'property_code', label: 'Property Code', type: 'string', required: true, sampleValue: 'AAA', description: 'Must exist in Property Master' },
  { key: 'unit_code', label: 'Unit Code', type: 'string', required: true, sampleValue: 'Flat12', description: 'Must exist under the referenced Property' },
  { key: 'lease_status', label: 'Lease Status', type: 'enum', required: true, allowedValues: ['DRAFT', 'DOCUMENTS_VERIFIED', 'ACTIVE', 'RENEWAL_CONFIRMED', 'CLOSED', 'TERMINATED'], sampleValue: 'DRAFT' },
  { key: 'commencement_date', label: 'Commencement Date', type: 'date', required: true, sampleValue: '2026-01-01' },
  { key: 'expiry_date', label: 'Expiry Date', type: 'date', required: true, sampleValue: '2026-12-31' },
  { key: 'lease_period_months', label: 'Lease Period (Months)', type: 'number', required: true, sampleValue: 12 },
  { key: 'rental_amount', label: 'Annual Rental Amount (QAR)', type: 'number', required: true, sampleValue: 66000 },
  { key: 'payment_frequency', label: 'Payment Frequency', type: 'enum', required: true, allowedValues: ['Monthly', 'Quarterly', 'Semi-Annually', 'Annually'], sampleValue: 'Monthly' },
  { key: 'security_deposit', label: 'Security Deposit (QAR)', type: 'number', required: false, sampleValue: 5500 },
  { key: 'security_deposit_status', label: 'Deposit Status', type: 'enum', required: false, allowedValues: ['Pending', 'Received', 'Refunded', 'Adjusted'], sampleValue: 'Received' },
  { key: 'grace_period_days', label: 'Grace Period (Days)', type: 'number', required: false, sampleValue: 5 },
  { key: 'maintenance_responsibility', label: 'Maintenance Responsibility', type: 'enum', required: false, allowedValues: ['Landlord', 'Tenant', 'Shared'], sampleValue: 'Landlord' },
  { key: 'utility_responsibility', label: 'Utility Responsibility', type: 'enum', required: false, allowedValues: ['Landlord', 'Tenant', 'Shared'], sampleValue: 'Tenant' },
  { key: 'number_of_pdc', label: 'Number of PDCs', type: 'number', required: false, sampleValue: 12 },
  { key: 'remarks', label: 'Special Conditions / Remarks', type: 'string', required: false, sampleValue: 'Standard 1 year residential lease agreement.' },
];

export const leaseAdapter: EntityImportAdapter = {
  module: 'lease',
  label: 'Lease',
  primaryKeyLabel: 'Lease Number',
  primaryKeyField: 'lease_number',
  columns: LEASE_COLUMNS,

  getTemplateColumns(operation: ImportOperation): ColumnDefinition[] {
    if (operation === 'DELETE') {
      return [
        LEASE_COLUMNS.find(c => c.key === 'lease_number')!,
        LEASE_COLUMNS.find(c => c.key === 'customer_identifier')!,
      ];
    }
    return LEASE_COLUMNS;
  },

  resolveRecordKey(row: Record<string, any>): string {
    const raw = getCellValue(row, 'Lease Number / Ref', 'Lease Number', 'lease_number', 'Contract No.', 'Contract No', 'contract_no', 'Lease No') ?? '';
    return String(raw).trim();
  },

  async fetchExistingRecords(keys: string[]): Promise<Map<string, Record<string, any>>> {
    const map = new Map<string, Record<string, any>>();
    if (keys.length === 0) return map;

    try {
      const { data, error } = await supabase
        .from('leases')
        .select('*, customers(id, full_name, qatar_id, passport_number, commercial_registration), properties(id, property_code, title), units(id, unit_code)')
        .in('lease_number', keys);

      if (!error && data) {
        for (const row of data) {
          if (row.lease_number) {
            map.set(row.lease_number.trim().toUpperCase(), row);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching leases:', e);
    }
    return map;
  },

  async validateRow(row, operation, context) {
    const errors: ImportErrorDetail[] = [];
    const warnings: ImportErrorDetail[] = [];
    const changes: FieldComparison[] = [];
    const dependencies: DependencyCheckItem[] = [];
    const normalized: Record<string, any> = {};

    const leaseNum = leaseAdapter.resolveRecordKey(row);

    if (!leaseNum) {
      errors.push({
        row: context.rowNumber,
        field: 'Lease Number / Ref',
        code: 'VAL_001',
        message: 'Lease Number / Ref is required.',
        severity: 'ERROR',
      });
    }

    if (leaseNum) {
      const upperKey = leaseNum.toUpperCase();
      if (context.inBatchKeys.has(upperKey)) {
        errors.push({
          row: context.rowNumber,
          field: 'Lease Number / Ref',
          code: 'DUP_001',
          message: `Duplicate Lease Number "${leaseNum}" in Excel file.`,
          severity: 'ERROR',
        });
      }
    }

    const existingRecord = context.existingRecord;

    if (operation === 'CREATE') {
      if (existingRecord) {
        errors.push({
          row: context.rowNumber,
          field: 'Lease Number / Ref',
          code: 'DUP_002',
          message: `Lease "${leaseNum}" already exists in database.`,
          severity: 'ERROR',
        });
      }
    } else {
      if (!existingRecord) {
        errors.push({
          row: context.rowNumber,
          field: 'Lease Number / Ref',
          code: operation === 'UPDATE' ? 'UPD_001' : 'DEL_001',
          message: `Lease "${leaseNum}" not found in database.`,
          severity: 'ERROR',
        });
      }
    }

    // Map input fields
    for (const col of LEASE_COLUMNS) {
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
        } else if (col.type === 'number') {
          const num = Number(strVal.replace(/,/g, ''));
          if (isNaN(num)) {
            errors.push({
              row: context.rowNumber,
              field: col.label,
              code: 'VAL_005',
              message: `${col.label} must be a valid number.`,
              severity: 'ERROR',
            });
          } else {
            normalized[col.key] = num;
          }
        } else {
          normalized[col.key] = strVal;
        }
      }
    }

    // Foreign Key checks for CREATE: Customer, Property, Unit
    if (operation === 'CREATE') {
      const custId = normalized['customer_identifier'];
      if (custId) {
        try {
          const { data: custData } = await supabase
            .from('customers')
            .select('id, full_name, verification_status')
            .or(`qatar_id.eq.${custId},passport_number.eq.${custId},commercial_registration.eq.${custId}`)
            .limit(1)
            .single();

          if (custData) {
            normalized.customer_id = custData.id;
            normalized.tenant_name = custData.full_name;

            if (custData.verification_status !== 'Verified') {
              warnings.push({
                row: context.rowNumber,
                field: 'Customer Identifier',
                code: 'VAL_002',
                message: `Customer document verification status is "${custData.verification_status}". Lease agreement should only proceed if approved.`,
                severity: 'WARNING',
              });
            }
          } else {
            errors.push({
              row: context.rowNumber,
              field: 'Customer Identifier',
              code: 'REF_001',
              message: `Customer "${custId}" does not exist in master records.`,
              severity: 'ERROR',
              resolution: 'Create the Customer Master record before generating a Lease.',
            });
          }
        } catch {
          errors.push({
            row: context.rowNumber,
            field: 'Customer Identifier',
            code: 'REF_001',
            message: `Customer "${custId}" does not exist in master records.`,
            severity: 'ERROR',
          });
        }
      }

      // Check Property & Unit
      const propCode = normalized['property_code'];
      const unitCode = normalized['unit_code'];

      if (propCode && unitCode) {
        try {
          const { data: propData } = await supabase
            .from('properties')
            .select('id')
            .ilike('property_code', propCode)
            .limit(1)
            .single();

          if (propData) {
            normalized.property_id = propData.id;

            const { data: unitData } = await supabase
              .from('units')
              .select('id, status, lease_status')
              .eq('property_id', propData.id)
              .or(`unit_code.eq.${unitCode},unit_ref.eq.${unitCode}`)
              .limit(1)
              .single();

            if (unitData) {
              normalized.unit_id = unitData.id;

              // Check if unit is available
              if (unitData.status === 'Occupied' || unitData.lease_status === 'ACTIVE') {
                errors.push({
                  row: context.rowNumber,
                  field: 'Unit Code',
                  code: 'VAL_002',
                  message: `Unit "${unitCode}" is currently Occupied / has an active lease.`,
                  severity: 'ERROR',
                  resolution: 'Select an Available unit for new lease creation.',
                });
              }
            } else {
              errors.push({
                row: context.rowNumber,
                field: 'Unit Code',
                code: 'REF_001',
                message: `Unit "${unitCode}" not found under Property "${propCode}".`,
                severity: 'ERROR',
              });
            }
          } else {
            errors.push({
              row: context.rowNumber,
              field: 'Property Code',
              code: 'REF_001',
              message: `Property "${propCode}" not found.`,
              severity: 'ERROR',
            });
          }
        } catch (e) {
          console.error('Lease prop/unit check error:', e);
        }
      }
    }

    // Delete check: Active finance / PDCs / Status protection
    if (operation === 'DELETE' && existingRecord) {
      try {
        const leaseId = existingRecord.id;
        const [pdcRes, receiptRes] = await Promise.allSettled([
          supabase.from('pdcs').select('id', { count: 'exact' }).eq('lease_id', leaseId),
          supabase.from('receipts').select('id', { count: 'exact' }).eq('lease_id', leaseId),
        ]);

        const pdcCount = pdcRes.status === 'fulfilled' ? (pdcRes.value.count ?? 0) : 0;
        const receiptCount = receiptRes.status === 'fulfilled' ? (receiptRes.value.count ?? 0) : 0;
        const isLeaseActive = existingRecord.lease_status === 'ACTIVE';

        dependencies.push({
          dependency: 'Linked PDCs',
          count: pdcCount,
          result: pdcCount > 0 ? 'Blocked' : 'Pass',
          details: pdcCount > 0 ? `${pdcCount} cheques registered in finance.` : 'None',
        });

        dependencies.push({
          dependency: 'Financial Receipts',
          count: receiptCount,
          result: receiptCount > 0 ? 'Blocked' : 'Pass',
          details: receiptCount > 0 ? `${receiptCount} receipts posted.` : 'None',
        });

        if (pdcCount > 0 || receiptCount > 0 || isLeaseActive) {
          errors.push({
            row: context.rowNumber,
            field: 'Lease Number / Ref',
            code: 'DEL_003',
            message: `Lease deletion blocked: Lease has active financial transactions (${pdcCount} PDCs, ${receiptCount} receipts) or is in ACTIVE state. Use Lease Termination / Checkout workflow.`,
            severity: 'ERROR',
          });
        }
      } catch (e) {
        console.error('Lease delete validation error:', e);
      }
    }

    // Diffs for UPDATE
    if (operation === 'UPDATE' && existingRecord) {
      for (const col of LEASE_COLUMNS) {
        if (col.immutable || col.key === 'lease_number') continue;
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
      const leaseNum = record.recordKey;

      if (operation === 'CREATE') {
        const payload: Partial<Lease> = {
          lease_number: leaseNum,
          customer_id: data.customer_id,
          property_id: data.property_id,
          unit_id: data.unit_id,
          tenant_name: data.tenant_name,
          lease_status: data.lease_status || 'DRAFT',
          commencement_date: data.commencement_date,
          expiry_date: data.expiry_date,
          lease_period_months: data.lease_period_months || 12,
          rental_amount: data.rental_amount,
          payment_frequency: data.payment_frequency || 'Monthly',
          security_deposit: data.security_deposit || 0,
          security_deposit_status: data.security_deposit_status || 'Pending',
          grace_period_days: data.grace_period_days || 5,
          maintenance_responsibility: data.maintenance_responsibility || 'Landlord',
          utility_responsibility: data.utility_responsibility || 'Tenant',
          number_of_pdc: data.number_of_pdc || 0,
          special_conditions: data.remarks,
        };

        const { data: created, error } = await supabase.from('leases').insert(payload).select().single();
        if (error) throw error;

        // Also update unit status to Occupied if lease is ACTIVE
        if (data.unit_id && (data.lease_status === 'ACTIVE' || data.lease_status === 'RENEWAL_CONFIRMED')) {
          await supabase.from('units').update({ status: 'Occupied', lease_status: 'ACTIVE' }).eq('id', data.unit_id);
        }

        return {
          success: true,
          createdId: created.id,
          resultText: `Lease "${leaseNum}" created successfully.`,
        };
      }

      if (operation === 'UPDATE') {
        const existing = record.originalDbData;
        if (!existing?.id) throw new Error('Lease record ID not found');

        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        for (const change of record.changes) {
          updatePayload[change.field] = change.newValue === '[CLEARED]' ? null : change.newValue;
        }

        const { error } = await supabase.from('leases').update(updatePayload).eq('id', existing.id);
        if (error) throw error;

        return {
          success: true,
          resultText: `Lease "${leaseNum}" updated (${record.changes.length} fields).`,
        };
      }

      if (operation === 'DELETE') {
        const existing = record.originalDbData;
        if (!existing?.id) throw new Error('Lease record ID not found');

        const { error } = await supabase.from('leases').update({ lease_status: 'TERMINATED', updated_at: new Date().toISOString() }).eq('id', existing.id);
        if (error) throw error;

        return {
          success: true,
          resultText: `Lease "${leaseNum}" terminated/archived.`,
        };
      }

      return { success: false, resultText: 'Unsupported operation' };
    } catch (err: any) {
      return {
        success: false,
        resultText: 'Failed to process lease record',
        error: err?.message || 'Database error occurred',
      };
    }
  },
};
