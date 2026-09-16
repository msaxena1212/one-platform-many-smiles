import { supabase, type Asset } from '../../supabase';
import type { EntityImportAdapter, ColumnDefinition, ImportErrorDetail, FieldComparison, DependencyCheckItem, ImportOperation } from '../types';

export const ASSET_COLUMNS: ColumnDefinition[] = [
  { key: 'asset_code', label: 'Asset ID', type: 'string', required: true, unique: true, immutable: true, sampleValue: 'AST-001', description: 'Unique asset identifier' },
  { key: 'asset_name', label: 'Asset Name', type: 'string', required: true, sampleValue: 'Sofa Set' },
  { key: 'category', label: 'Asset Category', type: 'enum', required: false, allowedValues: ['Furniture & Fixtures', 'Appliances', 'HVAC', 'Electrical', 'Plumbing', 'IT & Security', 'Vehicles', 'CCTV Systems'], sampleValue: 'Furniture & Fixtures' },
  { key: 'subcategory', label: 'Asset Subcategory', type: 'string', required: false, sampleValue: 'Sofa - 3+2+1' },
  { key: 'brand', label: 'Brand', type: 'string', required: false, sampleValue: 'Hisense' },
  { key: 'model', label: 'Model', type: 'string', required: false, sampleValue: 'Hisense UHD TV 50"' },
  { key: 'serial_number', label: 'Serial / IMEI No.', type: 'string', required: false, sampleValue: 'SN-9988221' },
  { key: 'ownership_type', label: 'Ownership Type', type: 'enum', required: false, allowedValues: ['Company Owned', 'Owned', 'Leased', 'Customer Provided', 'Landlord Provided'], sampleValue: 'Company Owned' },
  { key: 'purchase_date', label: 'Purchase Date', type: 'date', required: false, sampleValue: '2025-01-04' },
  { key: 'supplier', label: 'Supplier', type: 'string', required: false, sampleValue: 'Mohammed Noor Trdg & Cons. & Services W.L.L.' },
  { key: 'purchase_cost', label: 'Purchase Cost (QAR)', type: 'number', required: false, sampleValue: 1200 },
  { key: 'warranty_expiry_date', label: 'Warranty Expiry Date', type: 'date', required: false, sampleValue: '2027-01-04' },
  { key: 'warranty_status', label: 'Warranty Status', type: 'string', required: false, sampleValue: 'Active' },
  { key: 'department', label: 'Department', type: 'string', required: false, sampleValue: 'Operations' },
  { key: 'assigned_property_code', label: 'Assigned Property Code', type: 'string', required: false, sampleValue: 'Bin Omran 1', description: 'Must match an active Property Code' },
  { key: 'assigned_unit_code', label: 'Assigned Unit Code', type: 'string', required: false, sampleValue: 'BinOmran1-Flat09', description: 'Unit code under assigned property' },
  { key: 'assigned_employee_id', label: 'Assigned Employee ID', type: 'string', required: false, sampleValue: 'EMP-001', description: 'Employee ID' },
  { key: 'assigned_employee_name', label: 'Assigned Employee Name', type: 'string', required: false, sampleValue: 'Jithin Abdul Latheef' },
  { key: 'assignment_date', label: 'Assignment Date', type: 'date', required: false, sampleValue: '2025-01-10' },
  { key: 'asset_condition', label: 'Asset Condition', type: 'enum', required: false, allowedValues: ['Fair', 'Good', 'Brand New', 'Needs Repair', 'Scrap / Disposed'], sampleValue: 'Fair' },
  { key: 'asset_status', label: 'Asset Status', type: 'enum', required: false, allowedValues: ['Available', 'In Use', 'Under Maintenance', 'Damaged', 'Disposed'], sampleValue: 'Available' },
  { key: 'life_of_asset', label: 'Life Of Asset', type: 'number', required: false, sampleValue: 5 },
  { key: 'opening_cost', label: 'Opening Cost', type: 'number', required: false, sampleValue: 1200 },
  { key: 'last_service_date', label: 'Last Service Date', type: 'date', required: false, sampleValue: '2025-06-01' },
  { key: 'addition_during_year', label: 'Addition during the year', type: 'number', required: false, sampleValue: 0 },
  { key: 'total_asset_value', label: 'Total Asset Value', type: 'number', required: false, sampleValue: 1200 },
  { key: 'disposal_value', label: 'Disposal Value', type: 'number', required: false, sampleValue: 0 },
  { key: 'opening_accumulated_depreciation', label: 'Opening Accumulated Depreciation', type: 'number', required: false, sampleValue: 0 },
  { key: 'current_year_depreciation', label: 'Current Year Depreciation', type: 'number', required: false, sampleValue: 240 },
  { key: 'closing_accumulated_depreciation', label: 'Closing Accumulated Depreciation', type: 'number', required: false, sampleValue: 240 },
  { key: 'net_book_value', label: 'Net Book Value', type: 'number', required: false, sampleValue: 960 },
  { key: 'next_service_date', label: 'Next Service Date', type: 'date', required: false, sampleValue: '2025-12-01' },
  { key: 'return_date', label: 'Return Date', type: 'date', required: false, sampleValue: '2026-01-01' },
  { key: 'disposal_date', label: 'Disposal Date', type: 'date', required: false, sampleValue: '2030-01-01' },
  { key: 'remarks', label: 'Remarks', type: 'string', required: false, sampleValue: 'Installed at Various Bldgs' },
];

export const assetAdapter: EntityImportAdapter = {
  module: 'asset',
  label: 'Asset',
  primaryKeyLabel: 'Asset ID / Code',
  primaryKeyField: 'asset_code',
  columns: ASSET_COLUMNS,

  getTemplateColumns(operation: ImportOperation): ColumnDefinition[] {
    if (operation === 'DELETE') {
      return [
        ASSET_COLUMNS.find(c => c.key === 'asset_code')!,
        ASSET_COLUMNS.find(c => c.key === 'asset_name')!,
      ];
    }
    return ASSET_COLUMNS;
  },

  resolveRecordKey(row: Record<string, any>): string {
    const raw = row['Asset ID / Code'] ?? row['Asset ID'] ?? row['Asset Code'] ?? row['asset_code'] ?? row['asset_id'] ?? '';
    return String(raw).trim();
  },

  async fetchExistingRecords(keys: string[]): Promise<Map<string, Record<string, any>>> {
    const map = new Map<string, Record<string, any>>();
    if (keys.length === 0) return map;

    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .in('asset_code', keys);

      if (!error && data) {
        for (const row of data) {
          if (row.asset_code) {
            map.set(row.asset_code.trim().toUpperCase(), row);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching assets:', e);
    }
    return map;
  },

  async validateRow(row, operation, context) {
    const errors: ImportErrorDetail[] = [];
    const warnings: ImportErrorDetail[] = [];
    const changes: FieldComparison[] = [];
    const dependencies: DependencyCheckItem[] = [];
    const normalized: Record<string, any> = {};

    const assetKey = assetAdapter.resolveRecordKey(row);

    if (!assetKey) {
      errors.push({
        row: context.rowNumber,
        field: 'Asset ID / Code',
        code: 'VAL_001',
        message: 'Asset ID / Code is required.',
        severity: 'ERROR',
      });
    }

    if (assetKey) {
      const upperKey = assetKey.toUpperCase();
      if (context.inBatchKeys.has(upperKey)) {
        errors.push({
          row: context.rowNumber,
          field: 'Asset ID / Code',
          code: 'DUP_001',
          message: `Duplicate Asset ID "${assetKey}" in Excel file.`,
          severity: 'ERROR',
        });
      }
    }

    const existingRecord = context.existingRecord;

    if (operation === 'CREATE') {
      if (existingRecord) {
        errors.push({
          row: context.rowNumber,
          field: 'Asset ID / Code',
          code: 'DUP_002',
          message: `Asset "${assetKey}" already exists in the database.`,
          severity: 'ERROR',
          resolution: 'Choose a unique Asset Code or use UPDATE operation.',
        });
      }
    } else {
      if (!existingRecord) {
        errors.push({
          row: context.rowNumber,
          field: 'Asset ID / Code',
          code: operation === 'UPDATE' ? 'UPD_001' : 'DEL_001',
          message: `Asset "${assetKey}" was not found in the database.`,
          severity: 'ERROR',
        });
      }
    }

    // Map input fields
    for (const col of ASSET_COLUMNS) {
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
        } else {
          normalized[col.key] = strVal;
        }
      }
    }

    // Foreign reference validation: Assigned Property & Unit
    const assignedPropCode = normalized['assigned_property_code'];
    if (assignedPropCode && assignedPropCode !== '[NULL]') {
      try {
        const { data: propData } = await supabase
          .from('properties')
          .select('id')
          .ilike('property_code', assignedPropCode)
          .limit(1)
          .single();

        if (propData) {
          normalized.assigned_property_id = propData.id;
        } else {
          errors.push({
            row: context.rowNumber,
            field: 'Assigned Property Code',
            code: 'REF_001',
            message: `Assigned Property Code "${assignedPropCode}" does not exist.`,
            severity: 'ERROR',
          });
        }
      } catch {
        errors.push({
          row: context.rowNumber,
          field: 'Assigned Property Code',
          code: 'REF_001',
          message: `Assigned Property Code "${assignedPropCode}" does not exist.`,
          severity: 'ERROR',
        });
      }
    }

    // Check Employee assignment reference
    const assignedEmpId = normalized['assigned_employee_id'];
    if (assignedEmpId && assignedEmpId !== '[NULL]') {
      try {
        const { data: empData } = await supabase
          .from('employees')
          .select('id, first_name, last_name')
          .ilike('employee_id_code', assignedEmpId)
          .limit(1)
          .single();

        if (empData) {
          normalized.assigned_employee_db_id = empData.id;
          normalized.assigned_employee_name = `${empData.first_name} ${empData.last_name}`;
        } else {
          warnings.push({
            row: context.rowNumber,
            field: 'Assigned Employee Code',
            code: 'REF_001',
            message: `Assigned Employee Code "${assignedEmpId}" not found in HRMS master.`,
            severity: 'WARNING',
          });
        }
      } catch {
        // silent warning
      }
    }

    // Asset DELETE check (if in use)
    if (operation === 'DELETE' && existingRecord) {
      const isInUse = existingRecord.asset_status === 'In Use';
      dependencies.push({
        dependency: 'Current Assignment Status',
        count: isInUse ? 1 : 0,
        result: isInUse ? 'Blocked' : 'Pass',
        details: isInUse ? `Asset is currently "In Use". Disposal or return required.` : 'Asset available or stored.',
      });

      if (isInUse) {
        errors.push({
          row: context.rowNumber,
          field: 'Asset ID / Code',
          code: 'DEL_003',
          message: 'Asset deletion blocked: Asset is currently marked as "In Use". Use Disposal workflow instead.',
          severity: 'ERROR',
        });
      }
    }

    // Diffs for UPDATE
    if (operation === 'UPDATE' && existingRecord) {
      for (const col of ASSET_COLUMNS) {
        if (col.immutable || col.key === 'asset_code') continue;
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
      const assetCode = record.recordKey;

      if (operation === 'CREATE') {
        const payload: Partial<Asset> = {
          asset_code: assetCode,
          asset_name: data.asset_name,
          category: data.category,
          subcategory: data.subcategory,
          brand: data.brand,
          model: data.model,
          serial_number: data.serial_number,
          ownership_type: data.ownership_type || 'Owned',
          purchase_date: data.purchase_date,
          supplier: data.supplier,
          purchase_cost: data.purchase_cost || 0,
          warranty_expiry_date: data.warranty_expiry_date,
          assigned_property_id: data.assigned_property_id,
          assigned_property_code: data.assigned_property_code,
          assigned_unit_code: data.assigned_unit_code,
          assigned_employee_id: data.assigned_employee_db_id,
          assigned_employee_name: data.assigned_employee_name,
          assignment_date: data.assignment_date,
          asset_condition: data.asset_condition || 'Good',
          asset_status: data.asset_status || 'Available',
          life_of_asset: data.life_of_asset,
          opening_cost: data.opening_cost,
          last_service_date: data.last_service_date,
          next_service_date: data.next_service_date,
          remarks: data.remarks,
        };

        const { data: created, error } = await supabase.from('assets').insert(payload).select().single();
        if (error) throw error;

        return {
          success: true,
          createdId: created.id,
          resultText: `Asset "$