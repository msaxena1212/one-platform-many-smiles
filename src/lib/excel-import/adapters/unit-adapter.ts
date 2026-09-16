import { supabase, type Unit } from '../../supabase';
import type { EntityImportAdapter, ColumnDefinition, ImportErrorDetail, FieldComparison, DependencyCheckItem, ImportOperation } from '../types';
import { referenceDropdowns } from '../../reference-data';

export const UNIT_COLUMNS: ColumnDefinition[] = [
  { key: 'unit_code', label: 'Unit Code / No.', type: 'string', required: true, sampleValue: 'GF1', description: 'Unit identifier unique under Property' },
  { key: 'property_code', label: 'Property Code', type: 'string', required: true, sampleValue: 'AAA', description: 'Must match an existing Property Code' },
  { key: 'unit_cost_center_code', label: 'Unit Cost Center Code', type: 'string', required: false, sampleValue: 'AAA-GF1' },
  { key: 'unit_name', label: 'Unit Name', type: 'string', required: false, sampleValue: 'AAA - GF1' },
  { key: 'parent_cost_center_code', label: 'Parent Cost Center Code', type: 'string', required: false, sampleValue: '0' },
  { key: 'unit_type', label: 'Unit Type', type: 'string', required: false, sampleValue: 'Apartment' },
  { key: 'unit_usage', label: 'Unit Usage', type: 'enum', required: false, allowedValues: ['Residential', 'Commercial', 'Staff Accommodation', 'Storage', 'Retail'], sampleValue: 'Residential' },
  { key: 'block_tower', label: 'Block / Tower', type: 'string', required: false, sampleValue: '1' },
  { key: 'floor', label: 'Floor', type: 'string', required: false, sampleValue: 'Ground' },
  { key: 'bedrooms', label: 'Bedrooms (1-7)', type: 'number', required: false, sampleValue: 2 },
  { key: 'bathrooms', label: 'Bathrooms (1-7)', type: 'number', required: false, sampleValue: 2 },
  { key: 'area_sqm', label: 'Area Sqm', type: 'number', required: false, sampleValue: 110 },
  { key: 'balcony_sqm', label: 'Balcony Sqm', type: 'number', required: false, sampleValue: 10 },
  { key: 'total_area_sqm', label: 'Total Area Sqm', type: 'number', required: false, sampleValue: 120 },
  { key: 'view_type', label: 'View Type', type: 'enum', required: false, allowedValues: ['City View', 'Sea View', 'Garden View', 'Street View', 'Open View'], sampleValue: 'City View' },
  { key: 'furnishing', label: 'Furnishing', type: 'enum', required: false, allowedValues: ['Unfurnished', 'Semi-Furnished', 'Fully Furnished', 'Semi Furnished'], sampleValue: 'Fully Furnished' },
  { key: 'parking_slot_no', label: 'Parking Slot No.', type: 'string', required: false, sampleValue: 'P-101' },
  { key: 'electricity_meter_no', label: 'Electricity Meter No.', type: 'string', required: false, sampleValue: '182164' },
  { key: 'water_meter_no', label: 'Water Meter No.', type: 'string', required: false, sampleValue: '149086' },
  { key: 'cooling_meter_no', label: 'Cooling / Chiller Meter No.', type: 'string', required: false, sampleValue: 'CHL-001' },
  { key: 'status', label: 'Unit Status', type: 'enum', required: false, allowedValues: referenceDropdowns.unitStatuses.map(u => u.value).concat(['Occupied', 'Available', 'Under Maintenance', 'Reserved']), sampleValue: 'Occupied' },
  { key: 'lease_status', label: 'Lease Status', type: 'enum', required: false, allowedValues: ['Leased', 'Vacant', 'DRAFT', 'ACTIVE', 'EXPIRED'], sampleValue: 'Leased' },
  { key: 'base_rate', label: 'Default Rent Amount/ Base Rate', type: 'number', required: false, sampleValue: 5500 },
  { key: 'rent_frequency', label: 'Rent Frequency', type: 'enum', required: false, allowedValues: referenceDropdowns.rentFrequencies.map(f => f.value).concat(['Monthly', 'Quarterly', 'Semi-Annually', 'Annually', 'monthly', 'quarterly']), sampleValue: 'Monthly' },
  { key: 'current_tenant', label: 'Current Tenant', type: 'string', required: false, sampleValue: 'M/S. Al Ameen Real Estate' },
  { key: 'contract_no', label: 'Contract No.', type: 'string', required: false, sampleValue: 'CNT-2026-001' },
  { key: 'contract_start_date', label: 'Contract Start Date', type: 'date', required: false, sampleValue: '2026-01-01' },
  { key: 'contract_end_date', label: 'Contract End Date', type: 'date', required: false, sampleValue: '2026-12-31' },
  { key: 'current_rent', label: 'Current Rent', type: 'number', required: false, sampleValue: 5500 },
  { key: 'security_deposit_type', label: 'Security Deposit', type: 'string', required: false, sampleValue: 'Cash' },
  { key: 'security_deposit_amount', label: 'Sequirity Deposit Amount', type: 'number', required: false, sampleValue: 5500 },
  { key: 'service_charge', label: 'Service Charge', type: 'number', required: false, sampleValue: 0 },
  { key: 'maintenance_responsibility', label: 'Maintenance Responsibility', type: 'string', required: false, sampleValue: 'Property Manager' },
  { key: 'handover_date', label: 'Handover Date', type: 'date', required: false, sampleValue: '2024-04-10' },
  { key: 'documents_received', label: 'Documents Received', type: 'boolean', required: false, sampleValue: 'Yes' },
  { key: 'remarks', label: 'Remarks', type: 'string', required: false, sampleValue: 'Standard residential apartment' },
];

export const unitAdapter: EntityImportAdapter = {
  module: 'unit',
  label: 'Unit',
  primaryKeyLabel: 'Unit Code + Property Code',
  primaryKeyField: 'unit_code',
  columns: UNIT_COLUMNS,

  getTemplateColumns(operation: ImportOperation): ColumnDefinition[] {
    if (operation === 'DELETE') {
      return [
        UNIT_COLUMNS.find(c => c.key === 'unit_code')!,
        UNIT_COLUMNS.find(c => c.key === 'property_code')!,
      ];
    }
    return UNIT_COLUMNS;
  },

  resolveRecordKey(row: Record<string, any>): string {
    const unitCode = String(row['Unit Code / No.'] ?? row['Unit Code'] ?? row['unit_code'] ?? row['Unit code'] ?? '').trim();
    const propCode = String(row['Property Code'] ?? row['property_code'] ?? '').trim();
    if (!unitCode && !propCode) return '';
    return propCode ? `${propCode}::${unitCode}` : unitCode;
  },

  async fetchExistingRecords(keys: string[]): Promise<Map<string, Record<string, any>>> {
    const map = new Map<string, Record<string, any>>();
    if (keys.length === 0) return map;

    try {
      // Fetch units with joined property_code
      const { data, error } = await supabase
        .from('units')
        .select('*, properties(id, property_code, title)');

      if (!error && data) {
        for (const row of data) {
          const uCode = (row.unit_code || row.unit_ref || '').trim();
          const pCode = ((row.properties as any)?.property_code || '').trim();
          if (uCode && pCode) {
            map.set(`${pCode.toUpperCase()}::${uCode.toUpperCase()}`, row);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching existing units:', e);
    }
    return map;
  },

  async validateRow(
    row: Record<string, any>,
    operation: ImportOperation,
    context
  ) {
    const errors: ImportErrorDetail[] = [];
    const warnings: ImportErrorDetail[] = [];
    const changes: FieldComparison[] = [];
    const dependencies: DependencyCheckItem[] = [];
    const normalized: Record<string, any> = {};

    const rawUnitCode = String(row['Unit Code / No.'] ?? row['Unit Code'] ?? row['unit_code'] ?? '').trim();
    const rawPropCode = String(row['Property Code'] ?? row['property_code'] ?? '').trim();

    if (!rawUnitCode) {
      errors.push({
        row: context.rowNumber,
        field: 'Unit Code / No.',
        code: 'VAL_001',
        message: 'Unit Code / No. is required.',
        severity: 'ERROR',
      });
    }

    if (!rawPropCode) {
      errors.push({
        row: context.rowNumber,
        field: 'Property Code',
        code: 'VAL_001',
        message: 'Property Code is required.',
        severity: 'ERROR',
      });
    }

    // Verify Property Code exists in database
    let matchedProperty: any = null;
    if (rawPropCode) {
      try {
        const { data: propData } = await supabase
          .from('properties')
          .select('id, property_code, title')
          .ilike('property_code', rawPropCode)
          .limit(1)
          .single();

        if (!propData) {
          errors.push({
            row: context.rowNumber,
            field: 'Property Code',
            code: 'REF_001',
            message: `Property Code "${rawPropCode}" does not exist in master records.`,
            severity: 'ERROR',
            resolution: 'Provide a valid and existing Property Code.',
          });
        } else {
          matchedProperty = propData;
          normalized.property_id = propData.id;
        }
      } catch {
        errors.push({
          row: context.rowNumber,
          field: 'Property Code',
          code: 'REF_001',
          message: `Property Code "${rawPropCode}" does not exist in master records.`,
          severity: 'ERROR',
        });
      }
    }

    const recordKey = unitAdapter.resolveRecordKey(row);
    const upperKey = recordKey.toUpperCase();

    // Duplicate in batch
    if (recordKey && context.inBatchKeys.has(upperKey)) {
      errors.push({
        row: context.rowNumber,
        field: 'Unit Code / No.',
        code: 'DUP_001',
        message: `Duplicate Unit "${rawUnitCode}" under property "${rawPropCode}" in Excel file.`,
        severity: 'ERROR',
      });
    }

    const existingRecord = context.existingRecord;

    if (operation === 'CREATE') {
      if (existingRecord) {
        errors.push({
          row: context.rowNumber,
          field: 'Unit Code / No.',
          code: 'DUP_002',
          message: `Unit "${rawUnitCode}" already exists under Property "${rawPropCode}".`,
          severity: 'ERROR',
          resolution: 'Choose a different Unit Code or use UPDATE operation.',
        });
      }
    } else {
      if (!existingRecord) {
        errors.push({
          row: context.rowNumber,
          field: 'Unit Code / No.',
          code: operation === 'UPDATE' ? 'UPD_001' : 'DEL_001',
          message: `Unit "${rawUnitCode}" under Property "${rawPropCode}" not found in database.`,
          severity: 'ERROR',
        });
      }
    }

    // Map input fields
    for (const col of UNIT_COLUMNS) {
      if (operation === 'DELETE') continue;

      const cellValue = row[col.label] ?? row[col.label + ' *'] ?? row[col.key];

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
              message: `${col.label} must be a number.`,
              severity: 'ERROR',
            });
          } else {
            normalized[col.key] = num;
          }
        } else if (col.type === 'enum' && col.allowedValues) {
          const matched = col.allowedValues.find(v => v.toLowerCase() === strVal.toLowerCase());
          if (!matched) {
            warnings.push({
              row: context.rowNumber,
              field: col.label,
              code: 'VAL_002',
              message: `Value "${strVal}" for ${col.label} is outside standard options.`,
              severity: 'WARNING',
            });
            normalized[col.key] = strVal;
          } else {
            normalized[col.key] = matched;
          }
        } else {
          normalized[col.key] = strVal;
        }
      }
    }

    // Protection rule: If active lease exists, protect occupied status
    if (existingRecord) {
      try {
        const { data: activeLeases } = await supabase
          .from('leases')
          .select('id, lease_number, lease_status')
          .eq('unit_id', existingRecord.id)
          .in('lease_status', ['ACTIVE', 'RENEWAL_CONFIRMED', 'KEY_HANDED_OVER', 'TENANT_SIGNED']);

        const hasActiveLease = Boolean(activeLeases && activeLeases.length > 0);

        if (operation === 'UPDATE') {
          const requestedStatus = normalized['status'];
          if (hasActiveLease && requestedStatus === 'Available') {
            errors.push({
              row: context.rowNumber,
              field: 'Unit Status',
              code: 'VAL_002',
              message: `Unit Status cannot be set to "Available" while an active lease (${activeLeases![0].lease_number}) is in effect.`,
              severity: 'ERROR',
              resolution: 'Execute formal Checkout and Closure workflow to free unit.',
            });
          }
        }

        if (operation === 'DELETE') {
          dependencies.push({
            dependency: 'Active Leases',
            count: activeLeases?.length ?? 0,
            result: hasActiveLease ? 'Blocked' : 'Pass',
            details: hasActiveLease ? `Active lease #${activeLeases![0].lease_number} attached.` : 'None',
          });

          if (hasActiveLease) {
            errors.push({
              row: context.rowNumber,
              field: 'Unit Code / No.',
              code: 'DEL_003',
              message: 'Unit deletion blocked because an active lease is registered.',
              severity: 'ERROR',
            });
          }
        }
      } catch (e) {
        console.error('Unit lease dependency check error:', e);
      }
    }

    // UPDATE Diffs
    if (operation === 'UPDATE' && existingRecord) {
      for (const col of UNIT_COLUMNS) {
        if (col.immutable || col.key === 'property_code') continue;
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
      const unitCode = String(data.unit_code || record.rawRowData['Unit Code / No.'] || '').trim();

      if (operation === 'CREATE') {
        const payload: Partial<Unit> = {
          property_id: data.property_id,
          unit_code: unitCode,
          unit_ref: unitCode,
          unit_name: data.unit_name || `${data.property_code || ''} - ${unitCode}`,
          unit_cost_center_code: data.unit_cost_center_code,
          parent_cost_center_code: data.parent_cost_center_code,
          room_type: data.unit_type || 'Apartment',
          unit_usage: data.unit_usage || 'Residential',
          block_tower: data.block_tower,
          floor: data.floor,
          bedrooms: data.bedrooms ?? 1,
          bathrooms: data.bathrooms ?? 1,
          area: data.area_sqm ? String(data.area_sqm) : undefined,
          total_area_sqm: data.total_area_sqm,
          balcony_sqm: data.balcony_sqm,
          view_type: data.view_type,
          furnishing: data.furnishing,
          parking_slot_no: data.parking_slot_no,
          electricity_meter_no: data.electricity_meter_no,
          water_meter_no: data.water_meter_no,
          cooling_meter_no: data.cooling_meter_no,
          status: data.status || 'Available',
          lease_status: data.lease_status || 'Vacant',
          price: data.base_rate ?? data.current_rent ?? 0,
          rent_frequency: data.rent_frequency || 'Monthly',
          current_tenant: data.current_tenant,
          contract_no: data.contract_no,
          contract_start_date: data.contract_start_date,
          contract_end_date: data.contract_end_date,
          current_rent: data.current_rent,
          security_deposit_type: data.security_deposit_type,
          security_deposit_amount: data.security_deposit_amount,
          service_charge: data.service_charge,
          maintenance_responsibility: data.maintenance_responsibility || 'Property Manager',
          handover_date: data.handover_date,
          documents_received: typeof data.documents_received === 'boolean' ? data.documents_received : String(data.documents_received).toLowerCase() === 'yes' || String(data.documents_received).toLowerCase() === 'true',
          remarks: data.remarks,
        };

        const { data: created, error } = await supabase.from('units').insert(payload).select().single();
        if (error) throw error;

        return {
          success: true,
          createdId: created.id,
          resultText: `Unit "${unitCode}" created under property.`,
        };
      }

      if (operation === 'UPDATE') {
        const existing = record.originalDbData;
        if (!existing?.id) throw new Error('Target unit record ID not found');

        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        for (const change of record.changes) {
          updatePayload[change.field] = change.newValue === '[CLEARED]' ? null : change.newValue;
        }

        const { error } = await supabase.from('units').update(updatePayload).eq('id', existing.id);
        if (error) throw error;

        return {
          success: true,
          resultText: `Unit "${unitCode}" updated (${record.changes.length} fields).`,
        };
      }

      if (operation === 'DELETE') {
        const existing = re