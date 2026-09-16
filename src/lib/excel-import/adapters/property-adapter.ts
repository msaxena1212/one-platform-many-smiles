import { supabase, type Property } from '../../supabase';
import type { EntityImportAdapter, ColumnDefinition, ImportErrorDetail, FieldComparison, DependencyCheckItem, ImportOperation } from '../types';
import { getErrorDefinition } from '../error-codes';
import { referenceDropdowns } from '../../reference-data';

export const PROPERTY_COLUMNS: ColumnDefinition[] = [
  { key: 'property_code', label: 'Property Code', type: 'string', required: true, unique: true, immutable: true, sampleValue: 'AAA', description: 'Unique property identification code' },
  { key: 'title', label: 'Property Name', type: 'string', required: true, sampleValue: 'OLD SALATA - BLDG23' },
  { key: 'cost_center_code', label: 'Cost Center Code', type: 'string', required: false, sampleValue: 'CC-DOH-01' },
  { key: 'cost_center_name', label: 'Cost Center Name', type: 'string', required: false, sampleValue: 'Old Salata Operations' },
  { key: 'property_type', label: 'Property Type', type: 'enum', required: true, allowedValues: referenceDropdowns.propertyTypes.map(p => p.value), sampleValue: 'Residential' },
  { key: 'property_category', label: 'Property Category', type: 'enum', required: false, allowedValues: referenceDropdowns.propertyCategories.map(p => p.value), sampleValue: 'Building' },
  { key: 'ownership_type', label: 'Ownership Type', type: 'enum', required: false, allowedValues: referenceDropdowns.ownershipTypes.map(p => p.value), sampleValue: 'Leased' },
  { key: 'country', label: 'Country', type: 'string', required: true, sampleValue: 'Qatar' },
  { key: 'city', label: 'City', type: 'string', required: true, sampleValue: 'Doha' },
  { key: 'area_zone', label: 'Area / Zone', type: 'string', required: false, sampleValue: 'Area 18' },
  { key: 'street_building_name', label: 'Street / Building Name', type: 'string', required: false, sampleValue: 'Street 840' },
  { key: 'plot_building_no', label: 'Plot / Building No.', type: 'string', required: false, sampleValue: 'Bldg 23' },
  { key: 'title_deed_no', label: 'Title Deed / Registration No.', type: 'string', required: false, sampleValue: 'TD-998822' },
  { key: 'municipality_ref_no', label: 'Municipality / Building Ref No.', type: 'string', required: false, sampleValue: 'MUN-44012' },
  { key: 'owner_landlord', label: 'Owner / Landlord', type: 'string', required: false, sampleValue: 'Sheikh Hassan Al-Thani' },
  { key: 'property_manager', label: 'Property Manager', type: 'string', required: false, sampleValue: 'Jithin Abdul Latheef' },
  { key: 'no_of_floors', label: 'No. of Floors', type: 'number', required: false, sampleValue: 8 },
  { key: 'no_of_units', label: 'No. of Units', type: 'number', required: false, sampleValue: 44 },
  { key: 'total_built_up_area_sqm', label: 'Total Built-up Area Sqm', type: 'number', required: false, sampleValue: 4500 },
  { key: 'common_area_sqm', label: 'Common Area Sqm', type: 'number', required: false, sampleValue: 600 },
  { key: 'parking_count', label: 'Parking Count', type: 'number', required: false, sampleValue: 12 },
  { key: 'no_of_elevators', label: 'No of Elevator', type: 'number', required: false, sampleValue: 2 },
  { key: 'amenity_1', label: 'Amenity / Facility 1', type: 'string', required: false, sampleValue: 'Swimming Pool' },
  { key: 'amenity_2', label: 'Amenity / Facility 2', type: 'string', required: false, sampleValue: 'Fitness Center / Gym' },
  { key: 'amenity_3', label: 'Amenity / Facility 3', type: 'string', required: false, sampleValue: '24/7 Security & CCTV' },
  { key: 'amenity_4', label: 'Amenity / Facility 4', type: 'string', required: false, sampleValue: 'Covered Basement Parking' },
  { key: 'amenity_5', label: 'Amenity / Facility 5', type: 'string', required: false, sampleValue: 'Kids Play Area' },
  { key: 'other_amenities', label: 'Other Amenities / Facilities', type: 'string', required: false, sampleValue: 'Sauna, Steam Room' },
  { key: 'completion_date', label: 'Completion Date', type: 'date', required: false, sampleValue: '2022-01-15' },
  { key: 'handover_date', label: 'Handover Date', type: 'date', required: false, sampleValue: '2022-03-01' },
  { key: 'property_status', label: 'Property Status', type: 'enum', required: false, allowedValues: referenceDropdowns.propertyStatuses.map(p => p.value), sampleValue: 'Active' },
  { key: 'documents_received', label: 'Documents Received?', type: 'boolean', required: false, sampleValue: 'Yes', description: 'Yes or No / True or False' },
  { key: 'remarks', label: 'Remarks', type: 'string', required: false, sampleValue: 'Standard residential property' },
];

export const propertyAdapter: EntityImportAdapter = {
  module: 'property',
  label: 'Property',
  primaryKeyLabel: 'Property Code',
  primaryKeyField: 'property_code',
  columns: PROPERTY_COLUMNS,

  getTemplateColumns(operation: ImportOperation): ColumnDefinition[] {
    if (operation === 'DELETE') {
      return [
        PROPERTY_COLUMNS.find(c => c.key === 'property_code')!,
        PROPERTY_COLUMNS.find(c => c.key === 'title')!,
      ];
    }
    return PROPERTY_COLUMNS;
  },

  resolveRecordKey(row: Record<string, any>): string {
    const raw = row['Property Code'] ?? row['property_code'] ?? row['Property code'] ?? '';
    return String(raw).trim();
  },

  async fetchExistingRecords(keys: string[]): Promise<Map<string, Record<string, any>>> {
    const map = new Map<string, Record<string, any>>();
    if (keys.length === 0) return map;

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('property_code', keys);

      if (!error && data) {
        for (const row of data) {
          if (row.property_code) {
            map.set(row.property_code.trim().toUpperCase(), row);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching existing properties:', e);
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

    const propCode = propertyAdapter.resolveRecordKey(row);

    if (!propCode) {
      errors.push({
        row: context.rowNumber,
        field: 'Property Code',
        code: 'VAL_001',
        message: 'Property Code is required.',
        severity: 'ERROR',
        resolution: 'Provide a unique Property Code.',
      });
    }

    // In-file duplicate check
    if (propCode) {
      const upperCode = propCode.toUpperCase();
      if (context.inBatchKeys.has(upperCode)) {
        errors.push({
          row: context.rowNumber,
          field: 'Property Code',
          code: 'DUP_001',
          message: `Duplicate Property Code "${propCode}" within the Excel file.`,
          severity: 'ERROR',
          resolution: 'Ensure each Property Code appears only once in the file.',
        });
      }
    }

    const existingRecord = context.existingRecord;

    if (operation === 'CREATE') {
      if (existingRecord) {
        errors.push({
          row: context.rowNumber,
          field: 'Property Code',
          code: 'DUP_002',
          message: `Property "${propCode}" already exists in the database.`,
          severity: 'ERROR',
          resolution: 'Use a unique Property Code or use UPDATE operation.',
        });
      }
    } else {
      if (!existingRecord) {
        errors.push({
          row: context.rowNumber,
          field: 'Property Code',
          code: operation === 'UPDATE' ? 'UPD_001' : 'DEL_001',
          message: `Property "${propCode}" was not found in the database.`,
          severity: 'ERROR',
          resolution: 'Verify the Property Code matches an active property.',
        });
      }
    }

    // Map input fields to columns
    for (const col of PROPERTY_COLUMNS) {
      const cellValue = row[col.label] ?? row[col.label + ' *'] ?? row[col.key];

      if (operation === 'DELETE') continue;

      // Mandatory check for CREATE
      if (operation === 'CREATE' && col.required && (cellValue === undefined || cellValue === null || String(cellValue).trim() === '')) {
        errors.push({
          row: context.rowNumber,
          field: col.label,
          code: 'VAL_001',
          message: `${col.label} is required.`,
          severity: 'ERROR',
          resolution: `Fill in a valid ${col.label}.`,
        });
      }

      // Normalization & Data type checks
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
        } else if (col.type === 'enum' && col.allowedValues) {
          const matched = col.allowedValues.find(v => v.toLowerCase() === strVal.toLowerCase());
          if (!matched) {
            warnings.push({
              row: context.rowNumber,
              field: col.label,
              code: 'VAL_002',
              message: `Value "${strVal}" for ${col.label} is not in standard options.`,
              severity: 'WARNING',
              resolution: `Allowed: ${col.allowedValues.join(', ')}`,
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

    // For UPDATE: Calculate differences
    if (operation === 'UPDATE' && existingRecord) {
      for (const col of PROPERTY_COLUMNS) {
        if (col.immutable) continue;
        const oldVal = existingRecord[col.key] ?? (col.key === 'title' ? existingRecord.title : null);
        const cellValue = row[col.label] ?? row[col.label + ' *'] ?? row[col.key];

        if (cellValue === undefined || cellValue === null || String(cellValue).trim() === '') {
          // Blank cell = DO NOT CHANGE
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

    // For DELETE: Check dependencies (Units, Leases, Assets)
    if (operation === 'DELETE' && existingRecord) {
      try {
        const propId = existingRecord.id;
        const [unitsRes, assetsRes, leasesRes] = await Promise.allSettled([
          supabase.from('units').select('id, unit_code', { count: 'exact' }).eq('property_id', propId),
          supabase.from('assets').select('id', { count: 'exact' }).eq('assigned_property_id', propId),
          supabase.from('leases').select('id', { count: 'exact' }).eq('property_id', propId).in('lease_status', ['ACTIVE', 'RENEWAL_CONFIRMED', 'KEY_HANDED_OVER']),
        ]);

        const unitCount = unitsRes.status === 'fulfilled' ? (unitsRes.value.count ?? 0) : 0;
        const assetCount = assetsRes.status === 'fulfilled' ? (assetsRes.value.count ?? 0) : 0;
        const leaseCount = leasesRes.status === 'fulfilled' ? (leasesRes.value.count ?? 0) : 0;

        dependencies.push({
          dependency: 'Linked Units',
          count: unitCount,
          result: unitCount > 0 ? 'Blocked' : 'Pass',
          details: unitCount > 0 ? `${unitCount} units exist under this property.` : 'None',
        });

        dependencies.push({
          dependency: 'Active Leases',
          count: leaseCount,
          result: leaseCount > 0 ? 'Blocked' : 'Pass',
          details: leaseCount > 0 ? `${leaseCount} active leases exist.` : 'None',
        });

        dependencies.push({
          dependency: 'Assigned Assets',
          count: assetCount,
          result: assetCount > 0 ? 'Warning' : 'Pass',
          details: assetCount > 0 ? `${assetCount} assets assigned.` : 'None',
        });

        if (unitCount > 0 || leaseCount > 0) {
          errors.push({
            row: context.rowNumber,
            field: 'Property Code',
            code: 'DEL_003',
            message: `Property deletion blocked: ${unitCount} units and ${leaseCount} active leases are attached.`,
            severity: 'ERROR',
            resolution: 'Remove/reassign all linked units and complete or terminate active leases before deleting.',
          });
        }
      } catch (e) {
        console.error('Dependency check failed:', e);
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
      const propCode = record.recordKey;

      if (operation === 'CREATE') {
        const facilityAmenities = [
          data.amenity_1,
          data.amenity_2,
          data.amenity_3,
          data.amenity_4,
          data.amenity_5,
        ].filter(Boolean);

        const payload: Partial<Property> = {
          property_code: propCode,
          title: data.title || `Property ${propCode}`,
          description: data.remarks || null,
          property_type: data.property_type || 'apartment',
          address: data.street_building_name || data.address || `${propCode} Street`,
          city: data.city || 'Doha',
          country: data.country || 'Qatar',
          max_guests: 1,
          bedrooms: 1,
          beds: 1,
          bathrooms: 1,
          base_price_per_night: 0,
          cleaning_fee: 0,
          is_active: data.property_status ? data.property_status.toLowerCase() === 'active' : true,
          property_status: data.property_status || 'Active',
          cost_center_code: data.cost_center_code,
          cost_center_name: data.cost_center_name,
          property_category: data.property_category,
          ownership_type: data.ownership_type,
          area_zone: data.area_zone,
          street_building_name: data.street_building_name,
          plot_building_no: data.plot_building_no,
          title_deed_no: data.title_deed_no,
          municipality_ref_no: data.municipality_ref_no,
          property_manager: data.property_manager,
          no_of_floors: data.no_of_floors,
          no_of_units: data.no_of_units,
          total_units: data.no_of_units,
          total_built_up_area_sqm: data.total_built_up_area_sqm,
          common_area_sqm: data.common_area_sqm,
          parking_count: data.parking_count,
          no_of_elevators: data.no_of_elevators,
          completion_date: data.completion_date,
          handover_date: data.handover_date,
          documents_received: typeof data.documents_received === 'boolean' ? data.documents_received : String(data.documents_received).toLowerCase() === 'yes' || String(data.documents_received).toLowerCase() === 'true',
          remarks: data.remarks,
          amenities: facilityAmenities,
          municipality_details: {
            owner_landlord: data.owner_landlord || undefined,
            facility_amenities: facilityAmenities,
            other_amenities_facilities: data.other_amenities || undefined,
          },
        };

        const { data: created, error } = await supabase.from('properties').insert(payload).select().single();
        if (error) throw error;

        return {
          success: true,
          createdId: created.id,
          resultText: `Property "${propCode}" created successfully.`,
        };
      }

      if (operation === 'UPDATE') {
        const existing = record.originalDbData;
        if (!existing?.id) throw new Error('Target record ID not found');

        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        for (const change of record.changes) {
          updatePayload[change.field] = change.newValue === '[CLEARED]' ? null : change.newValue;
        }

        const { error } = await supabase.from('properties').update(updatePayload).eq('id', existing.id);
        if (error) throw error;

        return {
          success: true,
          resultText: `Property "${propCode}" updated (${record.changes.length} fields).`,
        };
      }

      if (operation === 'DELETE') {
        const existing = record.originalDbData;
        if (!existing?.id) throw new Error('Target record ID not found');

        // Soft delete / is_active flag preferred
        const { error } = await supabase.from('properties').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', existing.id);
        if (error) throw error;

        return {
          success: true,
          resultText: `Property "${propCode}" archived/deactivated.`,
        };
      }

      return { success: false, resultText: 'Unsupported operation' };
    } catch (err: any) {
      return {
        success: false,
        resultText: 'Failed to process record',
        error: err?.message || 'Database error occurred',
      };
    }
  },
};
