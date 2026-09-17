import { supabase } from '../../supabase';
import { 
  type EntityImportAdapter, 
  type ColumnDefinition, 
  type ImportErrorDetail, 
  type FieldComparison, 
  type DependencyCheckItem, 
  type ImportOperation,
  getCellValue
} from '../types';

export const EMPLOYEE_COLUMNS: ColumnDefinition[] = [
  { key: 'employee_id_code', label: 'Employee ID', type: 'string', required: false, sampleValue: 'EMP-001', description: 'Unique employee identification' },
  { key: 'employee_name', label: 'Employee Name', type: 'string', required: true, sampleValue: 'Jithin Abdul Latheef' },
  { key: 'gender', label: 'Gender', type: 'enum', required: false, allowedValues: ['Male', 'Female', 'Other'], sampleValue: 'Male' },
  { key: 'nationality', label: 'Nationality', type: 'string', required: false, sampleValue: 'India' },
  { key: 'date_of_birth', label: 'Date of Birth', type: 'date', required: false, sampleValue: '1988-09-06' },
  { key: 'mobile_number', label: 'Mobile Number', type: 'string', required: false, sampleValue: '74053716' },
  { key: 'email', label: 'Email', type: 'string', required: false, sampleValue: 'jithin@company.qa' },
  { key: 'department', label: 'Department', type: 'string', required: false, sampleValue: 'Finance and Operations' },
  { key: 'designation', label: 'Designation', type: 'string', required: false, sampleValue: 'General Manager' },
  { key: 'reporting_manager', label: 'Reporting Manager', type: 'string', required: false, sampleValue: 'Board of Directors' },
  { key: 'date_of_joining', label: 'Date of Joining', type: 'date', required: false, sampleValue: '2016-03-16' },
  { key: 'employment_type', label: 'Employment Type', type: 'string', required: false, sampleValue: 'Full-Time' },
  { key: 'qid_passport_no', label: 'QID / Passport No.', type: 'string', required: false, sampleValue: '28835629905' },
  { key: 'id_expiry_date', label: 'ID Expiry Date', type: 'date', required: false, sampleValue: '2027-02-24' },
  { key: 'basic_salary', label: 'Basic Salary', type: 'number', required: false, sampleValue: 11400 },
  { key: 'hra', label: 'HRA', type: 'number', required: false, sampleValue: 0 },
  { key: 'tra', label: 'TRA', type: 'number', required: false, sampleValue: 4000 },
  { key: 'other_allowances', label: 'Other Allowances', type: 'number', required: false, sampleValue: 2100 },
  { key: 'total_salary', label: 'Total Salary', type: 'number', required: false, sampleValue: 17500 },
  { key: 'benefit_telephone', label: 'Other Benefit (Telephone/ Allowance)', type: 'string', required: false, sampleValue: 'Provided By Company' },
  { key: 'benefit_accommodation', label: 'Other Benefit (Accomodation)', type: 'string', required: false, sampleValue: 'Provided By Company' },
  { key: 'benefit_vehicle', label: 'Other Benefit (Vehicle)', type: 'string', required: false, sampleValue: 'Provided By Company' },
  { key: 'bank_name', label: 'Bank Name', type: 'string', required: false, sampleValue: 'Commercial Bank' },
  { key: 'iban', label: 'IBAN', type: 'string', required: false, sampleValue: 'QA45CBQA000000004700659515101' },
  { key: 'air_ticket', label: 'Air Ticket', type: 'string', required: false, sampleValue: 'Yearly' },
  { key: 'air_ticket_fare_cap', label: 'Air Ticket Fare CAP', type: 'number', required: false, sampleValue: 2500 },
  { key: 'employee_status', label: 'Employee Status', type: 'enum', required: false, allowedValues: ['Active', 'On Leave', 'Probation', 'Terminated', 'Resigned'], sampleValue: 'Active' },
  { key: 'emergency_contact_name', label: 'Emergency Contact Name', type: 'string', required: false, sampleValue: '' },
  { key: 'relation_with_employee', label: 'Relation with Employee', type: 'string', required: false, sampleValue: '' },
  { key: 'emergency_contact_no', label: 'Emergency Contact No.', type: 'string', required: false, sampleValue: '' },
  { key: 'remarks', label: 'Remarks', type: 'string', required: false, sampleValue: '' },
];

export const employeeAdapter: EntityImportAdapter = {
  module: 'employee',
  label: 'Employee',
  primaryKeyLabel: 'Employee ID / Code',
  primaryKeyField: 'employee_id_code',
  columns: EMPLOYEE_COLUMNS,

  getTemplateColumns(operation: ImportOperation): ColumnDefinition[] {
    if (operation === 'DELETE') {
      return [
        EMPLOYEE_COLUMNS.find(c => c.key === 'employee_id_code')!,
        EMPLOYEE_COLUMNS.find(c => c.key === 'employee_name')!,
      ];
    }
    return EMPLOYEE_COLUMNS;
  },

  resolveRecordKey(row: Record<string, any>): string {
    const raw = getCellValue(row, 'Employee ID', 'Employee ID / Code', 'employee_id_code', 'Employee code', 'employee_id', 'Employee Name', 'employee_name') ?? '';
    return String(raw).trim();
  },

  async fetchExistingRecords(keys: string[]): Promise<Map<string, Record<string, any>>> {
    const map = new Map<string, Record<string, any>>();
    if (keys.length === 0) return map;

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*, departments(id, name), designations(id, title)')
        .in('employee_id_code', keys);

      if (!error && data) {
        for (const row of data) {
          if (row.employee_id_code) {
            map.set(row.employee_id_code.trim().toUpperCase(), row);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching employees:', e);
    }
    return map;
  },

  async validateRow(row, operation, context) {
    const errors: ImportErrorDetail[] = [];
    const warnings: ImportErrorDetail[] = [];
    const changes: FieldComparison[] = [];
    const dependencies: DependencyCheckItem[] = [];
    const normalized: Record<string, any> = {};

    const empCode = employeeAdapter.resolveRecordKey(row);

    if (!empCode) {
      errors.push({
        row: context.rowNumber,
        field: 'Employee ID / Code',
        code: 'VAL_001',
        message: 'Employee ID / Code is required.',
        severity: 'ERROR',
      });
    }

    if (empCode) {
      const upperKey = empCode.toUpperCase();
      if (context.inBatchKeys.has(upperKey)) {
        errors.push({
          row: context.rowNumber,
          field: 'Employee ID / Code',
          code: 'DUP_001',
          message: `Duplicate Employee ID "${empCode}" in Excel file.`,
          severity: 'ERROR',
        });
      }
    }

    const existingRecord = context.existingRecord;

    if (operation === 'CREATE') {
      if (existingRecord) {
        errors.push({
          row: context.rowNumber,
          field: 'Employee ID / Code',
          code: 'DUP_002',
          message: `Employee "${empCode}" already exists in database.`,
          severity: 'ERROR',
          resolution: 'Use a unique Employee ID or use UPDATE operation.',
        });
      }
    } else {
      if (!existingRecord) {
        errors.push({
          row: context.rowNumber,
          field: 'Employee ID / Code',
          code: operation === 'UPDATE' ? 'UPD_001' : 'DEL_001',
          message: `Employee "${empCode}" was not found in database.`,
          severity: 'ERROR',
        });
      }
    }

    // Map input fields
    for (const col of EMPLOYEE_COLUMNS) {
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
              message: `${col.label} must be a number.`,
              severity: 'ERROR',
            });
          } else {
            normalized[col.key] = num;
          }
        } else if (col.key === 'email' && strVal !== '[NULL]') {
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

    // Department & Designation foreign resolution
    const deptName = normalized['department'];
    if (deptName && deptName !== '[NULL]') {
      try {
        const { data: dept } = await supabase
          .from('departments')
          .select('id, name')
          .ilike('name', deptName)
          .limit(1)
          .single();

        if (dept) {
          normalized.department_id = dept.id;
        }
      } catch {
        // silent
      }
    }

    const desigTitle = normalized['designation'];
    if (desigTitle && desigTitle !== '[NULL]') {
      try {
        const { data: desig } = await supabase
          .from('designations')
          .select('id, title')
          .ilike('title', desigTitle)
          .limit(1)
          .single();

        if (desig) {
          normalized.designation_id = desig.id;
        }
      } catch {
        // silent
      }
    }

    // Deletion check: assigned assets or management dependencies
    if (operation === 'DELETE' && existingRecord) {
      try {
        const empId = existingRecord.id;
        const { data: assignedAssets } = await supabase
          .from('assets')
          .select('id, asset_code')
          .eq('assigned_employee_id', empId);

        const assetCount = assignedAssets?.length ?? 0;
        dependencies.push({
          dependency: 'Assigned Assets',
          count: assetCount,
          result: assetCount > 0 ? 'Blocked' : 'Pass',
          details: assetCount > 0 ? `${assetCount} assets currently assigned to employee.` : 'No assets assigned.',
        });

        if (assetCount > 0) {
          errors.push({
            row: context.rowNumber,
            field: 'Employee ID / Code',
            code: 'DEL_003',
            message: `Employee deletion blocked: ${assetCount} assets assigned. Reassign or return assets first.`,
            severity: 'ERROR',
          });
        }
      } catch (e) {
        console.error('Employee delete check error:', e);
      }
    }

    // Diffs for UPDATE
    if (operation === 'UPDATE' && existingRecord) {
      for (const col of EMPLOYEE_COLUMNS) {
        if (col.immutable || col.key === 'employee_id_code') continue;
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
      const empCode = record.recordKey;

      // Handle splitting of full name for backwards-compatibility with first_name/last_name columns
      let firstName = data.employee_name || '';
      let lastName = '';
      if (data.employee_name) {
        const parts = String(data.employee_name).trim().split(' ');
        if (parts.length > 1) {
          firstName = parts[0];
          lastName = parts.slice(1).join(' ');
        } else {
          firstName = parts[0];
          lastName = '';
        }
      }

      if (operation === 'CREATE') {
        const payload: Record<string, any> = {
          employee_id_code: data.employee_id_code || empCode,
          employee_name: data.employee_name,
          first_name: firstName,
          last_name: lastName,
          gender: data.gender,
          nationality: data.nationality,
          date_of_birth: data.date_of_birth,
          mobile_number: data.mobile_number,
          email: data.email,
          department: data.department,
          department_id: data.department_id,
          designation: data.designation,
          designation_id: data.designation_id,
          reporting_manager: data.reporting_manager,
          date_of_joining: data.date_of_joining,
          employment_type: data.employment_type || 'Full-Time',
          qid_passport_no: data.qid_passport_no,
          id_expiry_date: data.id_expiry_date,
          basic_salary: data.basic_salary || 0,
          hra: data.hra || 0,
          tra: data.tra || 0,
          other_allowances: data.other_allowances || 0,
          total_salary: data.total_salary || (Number(data.basic_salary || 0) + Number(data.hra || 0) + Number(data.tra || 0) + Number(data.other_allowances || 0)),
          benefit_telephone: data.benefit_telephone,
          benefit_accommodation: data.benefit_accommodation,
          benefit_vehicle: data.benefit_vehicle,
          bank_name: data.bank_name,
          iban: data.iban,
          air_ticket: data.air_ticket,
          air_ticket_fare_cap: data.air_ticket_fare_cap,
          employee_status: data.employee_status || 'Active',
          emergency_contact_name: data.emergency_contact_name,
          relation_with_employee: data.relation_with_employee,
          emergency_contact_no: data.emergency_contact_no,
          remarks: data.remarks,
        };

        const { data: created, error } = await supabase.from('employees').insert(payload).select().single();
        if (error) throw error;

        return {
          success: true,
          createdId: created.id,
          resultText: `Employee "${empCode}" created successfully.`,
        };
      }

      if (operation === 'UPDATE') {
        const existing = record.originalDbData;
        if (!existing?.id) throw new Error('Employee ID not found');

        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        for (const change of record.changes) {
          updatePayload[change.field] = change.newValue === '[CLEARED]' ? null : change.newValue;
        }

        const { error } = await supabase.from('employees').update(updatePayload).eq('id', existing.id);
        if (error) throw error;

        return {
          success: true,
          resultText: `Employee "${empCode}" updated (${record.changes.length} fields).`,
        };
      }

      if (operation === 'DELETE') {
        const existing = record.originalDbData;
        if (!existing?.id) throw new Error('Employee ID not found');

        // Prefer state transition to Terminated/Archived
        const { error } = await supabase.from('employees').update({ employee_status: 'Terminated', updated_at: new Date().toISOString() }).eq('id', existing.id);
        if (error) throw error;

        return {
          success: true,
          resultText: `Employee "${empCode}" status set to Terminated.`,
        };
      }

      return { success: false, resultText: 'Unsupported operation' };
    } catch (err: any) {
      return {
        success: false,
        resultText: 'Failed to process employee record',
        error: err?.message || 'Database error occurred',
      };
    }
  },
};
