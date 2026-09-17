import * as XLSX from 'xlsx';
import type { ImportModule, ImportOperation, ColumnDefinition } from './types';
import { getMasterOptions } from './master-options';
import { propertyAdapter } from './adapters/property-adapter';
import { unitAdapter } from './adapters/unit-adapter';
import { customerAdapter } from './adapters/customer-adapter';
import { assetAdapter } from './adapters/asset-adapter';
import { leaseAdapter } from './adapters/lease-adapter';
import { employeeAdapter } from './adapters/employee-adapter';

const adapters: Record<ImportModule, any> = {
  property: propertyAdapter,
  unit: unitAdapter,
  customer: customerAdapter,
  asset: assetAdapter,
  lease: leaseAdapter,
  employee: employeeAdapter,
};

export async function generateTemplateWorkbook(module: ImportModule, operation: ImportOperation): Promise<Uint8Array> {
  const adapter = adapters[module];
  if (!adapter) throw new Error(`Unknown module: ${module}`);

  const columns: ColumnDefinition[] = adapter.getTemplateColumns(operation);
  const masterOptions = await getMasterOptions();

  const wb = XLSX.utils.book_new();

  // 1. Main Data Sheet
  const headerRow = columns.map(c => c.label + (c.required ? ' *' : ''));
  const sampleRow1 = columns.map(c => {
    if (operation === 'DELETE') {
      return c.sampleValue ?? (c.key === adapter.primaryKeyField ? 'SAMPLE-001' : '');
    }
    return c.sampleValue ?? '';
  });

  const sampleRow2 = columns.map(c => {
    if (operation === 'DELETE') return '';
    if (operation === 'UPDATE' && !c.required && !c.immutable) {
      return '[NULL]'; // Demonstrate clearing a value
    }
    if (Array.isArray(c.allowedValues) && c.allowedValues.length > 1) {
      return c.allowedValues[1];
    }
    return '';
  });

  const wsData = [headerRow, sampleRow1];
  if (operation !== 'DELETE') {
    wsData.push(sampleRow2);
  }

  const wsMain = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  wsMain['!cols'] = columns.map(c => ({
    wch: Math.max(c.label.length + 5, 20),
  }));

  XLSX.utils.book_append_sheet(wb, wsMain, `${module.toUpperCase()}_${operation}`);

  // 2. Instructions & Field Guide Sheet
  const instructionRows: any[][] = [
    ['INSTRUCTIONS & FIELD DEFINITIONS FOR EXCEL IMPORT'],
    ['Module:', module.toUpperCase()],
    ['Operation:', operation],
    ['Generated At:', new Date().toISOString()],
    [],
    ['IMPORTANT GUIDELINES:'],
    ['1. Primary Key:', `The column "${adapter.primaryKeyLabel}" is mandatory and uniquely identifies records.`],
    ['2. Required Fields:', 'Headers marked with asterisk (*) are mandatory.'],
    ['3. For CREATE:', 'Duplicate keys in Excel or existing in the database will be rejected with error.'],
    ['4. For UPDATE:', 'Leave cell BLANK to keep existing DB value. Type [NULL] to explicitly clear/empty a value.'],
    ['5. For DELETE:', 'Only the identification key is required. System will verify dependencies before deleting.'],
    ['6. Data Integrity:', 'Leading zeroes in codes, mobile numbers, and QIDs will be preserved.'],
    [],
    ['COLUMN SPECIFICATION TABLE:'],
    ['Column Name', 'Field Key', 'Data Type', 'Required?', 'Sample Value', 'Allowed Values / Description'],
  ];

  for (const col of columns) {
    let allowedDesc = '';
    if (Array.isArray(col.allowedValues) && col.allowedValues.length > 0) {
      allowedDesc = col.allowedValues.join(', ');
    } else if (col.description) {
      allowedDesc = col.description;
    }

    instructionRows.push([
      col.label + (col.required ? ' *' : ''),
      col.key,
      col.type.toUpperCase(),
      col.required ? 'YES' : 'NO',
      col.sampleValue !== undefined ? String(col.sampleValue) : '',
      allowedDesc,
    ]);
  }

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionRows);
  wsInstructions['!cols'] = [
    { wch: 30 },
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 25 },
    { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

  // 3. Master Dropdowns Sheet (if any allowed values exist)
  const masterSheetData: any[][] = [['Master Category', 'Allowed Value']];
  for (const col of columns) {
    if (Array.isArray(col.allowedValues) && col.allowedValues.length > 0) {
      for (const val of col.allowedValues) {
        masterSheetData.push([col.label, val]);
      }
    }
  }

  if (masterSheetData.length > 1) {
    const wsMasters = XLSX.utils.aoa_to_sheet(masterSheetData);
    wsMasters['!cols'] = [{ wch: 30 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsMasters, 'Master_Values');
  }

  const output = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Uint8Array(output);
}

export function downloadTemplateFile(module: ImportModule, operation: ImportOperation, fileData: Uint8Array) {
  const fileName = `${module.charAt(0).toUpperCase() + module.slice(1)}_${operation}_Template.xlsx`;
  const blob = new Blob([fileData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
