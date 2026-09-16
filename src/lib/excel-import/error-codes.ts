export const ERROR_CODES = {
  // File level errors
  FILE_001: { code: 'FILE_001', message: 'Invalid file format. Only .xlsx files are supported.', resolution: 'Please upload a valid Excel workbook with .xlsx extension.' },
  FILE_002: { code: 'FILE_002', message: 'File size exceeded limit.', resolution: 'Please upload an Excel file under 15MB.' },
  FILE_003: { code: 'FILE_003', message: 'Workbook is empty or contains no readable sheets.', resolution: 'Ensure the Excel workbook contains at least one sheet with header and data rows.' },
  FILE_004: { code: 'FILE_004', message: 'Corrupted workbook or password protected.', resolution: 'Ensure the file is not encrypted, password protected, or corrupted.' },
  
  // Column structure errors
  COLUMN_001: { code: 'COLUMN_001', message: 'Mandatory column is missing from template.', resolution: 'Download the official template and ensure all required headers are present.' },
  COLUMN_002: { code: 'COLUMN_002', message: 'Duplicate column header detected.', resolution: 'Remove duplicate column headers from the workbook.' },
  COLUMN_003: { code: 'COLUMN_003', message: 'Unsupported or unmapped column present in workbook.', resolution: 'Verify that header names match the template specification exactly.' },

  // Row validation errors
  VAL_001: { code: 'VAL_001', message: 'Mandatory field missing.', resolution: 'Provide a non-empty value for this mandatory column.' },
  VAL_002: { code: 'VAL_002', message: 'Invalid value not found in allowed master options.', resolution: 'Select a valid master value from the allowed options list or template instructions.' },
  VAL_003: { code: 'VAL_003', message: 'Invalid data type.', resolution: 'Provide the correct data type as specified in the column format.' },
  VAL_004: { code: 'VAL_004', message: 'Invalid date format.', resolution: 'Provide a valid date in YYYY-MM-DD or DD/MM/YYYY format.' },
  VAL_005: { code: 'VAL_005', message: 'Invalid numeric or currency amount.', resolution: 'Enter a valid non-negative number without extra symbols.' },

  // Duplicate checks
  DUP_001: { code: 'DUP_001', message: 'Duplicate business key within the same Excel workbook.', resolution: 'Ensure each record key is unique across all rows in the upload file.' },
  DUP_002: { code: 'DUP_002', message: 'Record already exists in the database for CREATE operation.', resolution: 'Cannot create an existing record. Use UPDATE operation or choose a unique key.' },
  DUP_003: { code: 'DUP_003', message: 'Identifier (QID/Passport/CR/Email/Mobile) already registered to another record.', resolution: 'Ensure contact and identity numbers are distinct to prevent duplicate profile creation.' },

  // Reference checks
  REF_001: { code: 'REF_001', message: 'Referenced foreign record does not exist.', resolution: 'Ensure referenced code (Property, Unit, Customer, Department, Manager) exists in the master database.' },
  REF_002: { code: 'REF_002', message: 'Referenced record is inactive or archived.', resolution: 'Reference an active entity or activate the target master record before importing.' },

  // Update checks
  UPD_001: { code: 'UPD_001', message: 'Target record not found for UPDATE operation.', resolution: 'Ensure the record key matches an existing record in the database.' },
  UPD_002: { code: 'UPD_002', message: 'Field is immutable or calculated by the system and cannot be updated directly.', resolution: 'Remove changes to calculated or system-governed fields.' },
  UPD_003: { code: 'UPD_003', message: 'No data change detected across all fields.', resolution: 'The Excel row has values identical to current database records.' },

  // Delete checks
  DEL_001: { code: 'DEL_001', message: 'Record not found for DELETE operation.', resolution: 'Ensure the record key exists in the database.' },
  DEL_002: { code: 'DEL_002', message: 'Record cannot be physically deleted due to audit/historical constraints.', resolution: 'Use archive or deactivation status instead.' },
  DEL_003: { code: 'DEL_003', message: 'Active dependencies exist. Deletion blocked.', resolution: 'Resolve all active dependencies (leases, finance items, assigned assets, occupied units) before deleting.' },

  // Concurrency & Security
  CONC_001: { code: 'CONC_001', message: 'Concurrent modification detected. Record was modified by another user after preview.', resolution: 'Re-import the file to review the latest state of the data.' },
  SEC_001: { code: 'SEC_001', message: 'Permission denied for this module or operation.', resolution: 'Contact your system administrator to grant import permissions for this module.' },
  SYS_001: { code: 'SYS_001', message: 'Unexpected database or processing error occurred.', resolution: 'Review error message details or contact IT support.' },
} as const;

export function getErrorDefinition(code: string, customMessage?: string, customResolution?: string) {
  const def = (ERROR_CODES as Record<string, { code: string; message: string; resolution: string }>)[code];
  if (def) {
    return {
      code: def.code,
      message: customMessage || def.message,
      resolution: customResolution || def.resolution,
    };
  }
  return {
    code,
    message: customMessage || 'Validation rule violation',
    resolution: customResolution || 'Please inspect row data.',
  };
}
