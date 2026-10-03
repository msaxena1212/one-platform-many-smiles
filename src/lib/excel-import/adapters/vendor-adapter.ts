import { supabase } from '../../supabase';
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

export const VENDOR_COLUMNS: ColumnDefinition[] = [
  { key: 'code', label: 'Vendor Code', type: 'string', required: true, unique: true, immutable: true, sampleValue: 'VND-1001', description: 'Unique vendor identifier' },
  { key: 'name', label: 'Vendor / Supplier Name', type: 'string', required: true, sampleValue: 'Gulf Facilities & Maintenance LLC', description: 'Legal / trade entity name' },
  { key: 'vendor_type', label: 'Vendor Type', type: 'enum', required: false, allowedValues: ['Supplier', 'Contractor', 'Service Provider', 'Maintenance', 'Consultant', 'Utility', 'Government'], sampleValue: 'Contractor', description: 'Industry classification' },
  { key: 'contact_person', label: 'Contact Person', type: 'string', required: false, sampleValue: 'Ahmed Hassan', description: 'Primary focal point' },
  { key: 'email', label: 'Email', type: 'string', required: false, sampleValue: 'contact@gulffacilities.qa', description: 'Official email address' },
  { key: 'phone', label: 'Phone / Mobile', type: 'string', required: false, sampleValue: '+974 5500 1122', description: 'Contact phone number' },
  { key: 'tax_number', label: 'Tax Identification / TIN', type: 'string', required: false, sampleValue: 'TIN-9088214', description: 'Tax number / TIN' },
  { key: 'cr_number', label: 'CR Number', type: 'string', required: false, sampleValue: 'CR-104928', description: 'Commercial Registration No.' },
  { key: 'cr_expiry_date', label: 'CR Expiry Date', type: 'date', required: false, sampleValue: '2028-12-31', description: 'CR expiration date' },
  { key: 'address', label: 'Address / Street', type: 'string', required: false, sampleValue: 'Building 12, C-Ring Road', description: 'Physical office address' },
  { key: 'city', label: 'City', type: 'string', required: false, sampleValue: 'Doha', description: 'Operating city' },
  { key: 'country', label: 'Country', type: 'string', required: false, sampleValue: 'Qatar', description: 'Country of registration' },
  { key: 'payment_terms', label: 'Payment Terms', type: 'enum', required: false, allowedValues: ['Immediate / Cash on Delivery', 'Net 7 Days', 'Net 14 Days', 'Net 30 Days', 'Net 45 Days', 'Net 60 Days', 'Net 90 Days'], sampleValue: 'Net 30 Days', description: 'Commercial payment terms' },
  { key: 'settlement_mode', label: 'Settlement Mode', type: 'enum', required: false, allowedValues: ['Bank Wire / Electronic Transfer (QNB)', 'CBQ Electronic Wire', 'Corporate Cheque on Delivery', 'Direct Debit / Online Portal', 'Cash in Hand / Petty Cash'], sampleValue: 'Bank Wire / Electronic Transfer (QNB)', description: 'Primary payment channel' },
  { key: 'currency', label: 'Currency', type: 'string', required: false, sampleValue: 'QAR', description: 'Default billing currency' },
  { key: 'bank_name', label: 'Bank Name', type: 'string', required: false, sampleValue: 'Qatar National Bank (QNB)', description: 'Bank institution name' },
  { key: 'account_number', label: 'Account Number', type: 'string', required: false, sampleValue: '0013-098271-001', description: 'Corporate bank account number' },
  { key: 'iban', label: 'IBAN', type: 'string', required: false, sampleValue: 'QA58QNBA000000000013098271001', description: 'Qatar IBAN number' },
  { key: 'swift_code', label: 'SWIFT / BIC Code', type: 'string', required: false, sampleValue: 'QNBAQAQA', description: 'Bank SWIFT code' },
  { key: 'status', label: 'Status', type: 'enum', required: true, allowedValues: ['Active', 'Inactive', 'Blacklisted'], sampleValue: 'Active', description: 'Vendor status' },
  { key: 'notes', label: 'Notes / Remarks', type: 'string', required: false, sampleValue: 'Approved MEP maintenance contractor', description: 'Internal remarks' },
];

export const vendorAdapter: EntityImportAdapter = {
  module: 'vendor' as any,
  label: 'Vendor',
  primaryKeyLabel: 'Vendor Code',
  primaryKeyField: 'code',
  columns: VENDOR_COLUMNS,

  getTemplateColumns(operation: ImportOperation): ColumnDefinition[] {
    if (operation === 'DELETE') {
      return [
        VENDOR_COLUMNS.find(c => c.key === 'code')!,
        VENDOR_COLUMNS.find(c => c.key === 'name')!,
      ];
    }
    return VENDOR_COLUMNS;
  },

  resolveRecordKey(row: Record<string, any>): string {
    const raw = getCellValue(
      row,
      'Vendor Code *',
      'Vendor Code',
      'code',
      'VendorCode',
      'Supplier Code',
      'vendor_code',
      'Vendor / Supplier Name *',
      'Vendor / Supplier Name',
      'name',
      'VendorName'
    ) ?? '';
    return String(raw).trim();
  },

  async fetchExistingRecords(keys: string[]): Promise<Map<string, Record<string, any>>> {
    const map = new Map<string, Record<string, any>>();
    if (keys.length === 0) return map;

    try {
      const { data, error } = await supabase
        .from('fin_vendors')
        .select('*')
        .in('code', keys);

      if (!error && data) {
        for (const row of data) {
          if (row.code) {
            map.set(row.code.trim().toUpperCase(), row);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching existing vendors:', e);
    }
    return map;
  },

  async validateRow(row, operation, context) {
    const errors: ImportErrorDetail[] = [];
    const warnings: ImportErrorDetail[] = [];
    const changes: FieldComparison[] = [];
    const dependencies: DependencyCheckItem[] = [];
    const normalized: Record<string, any> = {};

    const rawKey = this.resolveRecordKey(row);
    const upperKey = rawKey.toUpperCase();

    // 1. Validate Primary Key Presence
    if (!rawKey) {
      errors.push({
        row: context.rowNumber,
        field: 'Vendor Code',
        code: 'VAL_001',
        message: 'Vendor Code is required and cannot be empty.',
        severity: 'ERROR',
      });
      return { errors, warnings, normalized, changes, dependencies };
    }

    normalized['code'] = rawKey;

    const existingRecord = context.existingRecord || (context.allExistingKeys.has(upperKey) ? { code: rawKey } : undefined);

    // 2. Validate Operation & Existence
    if (operation === 'CREATE') {
      if (existingRecord?.id) {
        errors.push({
          row: context.rowNumber,
          field: 'Vendor Code',
          code: 'DUP_001',
          message: `Vendor with code "${rawKey}" already exists in the system. Use UPDATE operation to modify.`,
          severity: 'ERROR',
        });
      }
      if (context.inBatchKeys.has(upperKey)) {
        errors.push({
          row: context.rowNumber,
          field: 'Vendor Code',
          code: 'DUP_002',
          message: `Duplicate Vendor Code "${rawKey}" detected multiple times within this Excel file.`,
          severity: 'ERROR',
        });
      }
    }

    if (operation === 'UPDATE' || operation === 'DELETE') {
      if (!existingRecord?.id) {
        errors.push({
          row: context.rowNumber,
          field: 'Vendor Code',
          code: 'NOT_FOUND_001',
          message: `Vendor with code "${rawKey}" was not found in the database.`,
          severity: 'ERROR',
        });
      }
    }

    // 3. Map & Validate Columns
    for (const col of VENDOR_COLUMNS) {
      if (operation === 'DELETE') continue;

      const cellValue = getCellValue(row, col.label, col.label + ' *', col.key, col.dbField);

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
          const sanitized = sanitizeDateForPostgres(strVal);
          if (sanitized) {
            normalized[col.key] = sanitized;
          } else {
            errors.push({
              row: context.rowNumber,
              field: col.label,
              code: 'VAL_003',
              message: `Invalid date format for "${col.label}". Use YYYY-MM-DD or DD/MM/YYYY.`,
              severity: 'ERROR',
            });
          }
        } else if (col.type === 'enum' && Array.isArray(col.allowedValues)) {
          const matchedEnum = col.allowedValues.find(v => v.toLowerCase() === strVal.toLowerCase());
          if (matchedEnum) {
            normalized[col.key] = matchedEnum;
          } else {
            warnings.push({
              row: context.rowNumber,
              field: col.label,
              code: 'VAL_004',
              message: `Value "${strVal}" is not in standard list (${col.allowedValues.join(', ')}). System will default or normalize.`,
              severity: 'WARNING',
            });
            normalized[col.key] = strVal;
          }
        } else {
          normalized[col.key] = strVal;
        }
      } else if (operation === 'CREATE') {
        // Apply sensible defaults
        if (col.key === 'country' && !normalized.country) normalized.country = 'Qatar';
        if (col.key === 'city' && !normalized.city) normalized.city = 'Doha';
        if (col.key === 'currency' && !normalized.currency) normalized.currency = 'QAR';
        if (col.key === 'vendor_type' && !normalized.vendor_type) normalized.vendor_type = 'Supplier';
        if (col.key === 'payment_terms' && !normalized.payment_terms) normalized.payment_terms = 'Net 30 Days';
        if (col.key === 'settlement_mode' && !normalized.settlement_mode) normalized.settlement_mode = 'Bank Wire / Electronic Transfer (QNB)';
        if (col.key === 'status' && !normalized.status) normalized.status = 'Active';
      }
    }

    // 4. Email validation
    if (normalized.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
      warnings.push({
        row: context.rowNumber,
        field: 'Email',
        code: 'VAL_006',
        message: `Email "${normalized.email}" does not appear to follow standard email syntax.`,
        severity: 'WARNING',
      });
    }

    // 5. Check Diffs for UPDATE
    if (operation === 'UPDATE' && existingRecord) {
      for (const col of VENDOR_COLUMNS) {
        if (col.immutable || col.key === 'code') continue;
        const oldVal = existingRecord[col.key];
        const cellValue = row[col.label] ?? row[col.label + ' *'] ?? row[col.key];

        if (cellValue === undefined || cellValue === null || String(cellValue).trim() === '') {
          continue; // Leave blank to preserve existing DB value
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

    // 6. Check Dependencies for DELETE
    if (operation === 'DELETE' && existingRecord?.id) {
      try {
        const { count: invoiceCount } = await supabase
          .from('proc_purchase_orders')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', existingRecord.id);

        dependencies.push({
          dependency: 'Linked Purchase Orders',
          count: invoiceCount || 0,
          result: (invoiceCount || 0) > 0 ? 'Blocked' : 'Pass',
          details: (invoiceCount || 0) > 0 ? `Vendor is associated with ${invoiceCount} Purchase Orders.` : 'No active purchase order dependencies.',
        });

        if ((invoiceCount || 0) > 0) {
          errors.push({
            row: context.rowNumber,
            field: 'Vendor Code',
            code: 'DEL_001',
            message: `Deletion blocked: Vendor "${rawKey}" has ${invoiceCount} linked purchase orders or invoices. Set status to Inactive instead.`,
            severity: 'ERROR',
          });
        }
      } catch {
        // Pass if table is missing
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
      const vendorCode = record.recordKey;

      if (operation === 'CREATE') {
        const payload: Record<string, any> = {
          code: vendorCode,
          name: data.name,
          vendor_type: data.vendor_type || 'Supplier',
          contact_person: data.contact_person || null,
          email: data.email || null,
          phone: data.phone || null,
          tax_number: data.tax_number || null,
          cr_number: data.cr_number || null,
          cr_expiry_date: data.cr_expiry_date || null,
          address: data.address || null,
          city: data.city || 'Doha',
          country: data.country || 'Qatar',
          payment_terms: data.payment_terms || 'Net 30 Days',
          settlement_mode: data.settlement_mode || 'Bank Wire / Electronic Transfer (QNB)',
          currency: data.currency || 'QAR',
          bank_name: data.bank_name || null,
          account_number: data.account_number || null,
          iban: data.iban || null,
          swift_code: data.swift_code || null,
          status: data.status || 'Active',
          notes: data.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: created, error } = await supabase.from('fin_vendors').insert(payload).select().single();
        if (error) throw error;

        return {
          success: true,
          createdId: created.id,
          resultText: `Vendor "${vendorCode} - ${data.name}" created.`,
        };
      }

      if (operation === 'UPDATE') {
        const existing = record.originalDbData;
        if (!existing?.id) throw new Error('Vendor record ID not found');

        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        for (const change of record.changes) {
          updatePayload[change.field] = change.newValue === '[CLEARED]' ? null : change.newValue;
        }

        const { error } = await supabase.from('fin_vendors').update(updatePayload).eq('id', existing.id);
        if (error) throw error;

        return {
          success: true,
          resultText: `Vendor "${vendorCode}" updated (${record.changes.length} fields modified).`,
        };
      }

      if (operation === 'DELETE') {
        const existing = record.originalDbData;
        if (!existing?.id) throw new Error('Vendor record ID not found');

        const { error } = await supabase.from('fin_vendors').delete().eq('id', existing.id);
        if (error) throw error;

        return {
          success: true,
          resultText: `Vendor "${vendorCode}" deleted from registry.`,
        };
      }

      return { success: false, resultText: 'Unsupported operation' };
    } catch (err: any) {
      return {
        success: false,
        resultText: 'Failed to process vendor record',
        error: err?.message || 'Database error occurred',
      };
    }
  },
};
