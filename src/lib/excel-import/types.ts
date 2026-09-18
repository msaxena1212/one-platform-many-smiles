export type ImportModule = 'property' | 'unit' | 'customer' | 'asset' | 'lease' | 'employee';

export type ImportOperation = 'CREATE' | 'UPDATE' | 'DELETE';

export type ImportSeverity = 'ERROR' | 'WARNING' | 'INFO';

export type ImportRowStatus = 'READY' | 'ERROR' | 'WARNING' | 'NO_CHANGE' | 'BLOCKED' | 'SUCCESS' | 'FAILED' | 'SKIPPED';

export type ImportBatchStatus = 
  | 'UPLOADED'
  | 'PARSING'
  | 'VALIDATING'
  | 'PREVIEW_READY'
  | 'AWAITING_CONFIRMATION'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'PARTIAL_SUCCESS'
  | 'FAILED'
  | 'CANCELLED';

export interface ImportErrorDetail {
  row: number;
  field?: string;
  code: string;
  message: string;
  severity: ImportSeverity;
  resolution?: string;
  currentValue?: any;
}

export interface FieldComparison {
  field: string;
  label: string;
  oldValue: any;
  newValue: any;
  status: 'CHANGED' | 'NO_CHANGE' | 'CLEARED' | 'INVALID' | 'NOT_SUPPLIED';
}

export interface DependencyCheckItem {
  dependency: string;
  count: number;
  result: 'Pass' | 'Blocked' | 'Warning' | 'Allowed';
  details?: string;
}

export interface ImportParsedRecord {
  excelRowNumber: number;
  recordKey: string;
  recordId?: string;
  recordName?: string;
  rawRowData: Record<string, any>;
  normalizedData: Record<string, any>;
  originalDbData?: Record<string, any>;
  status: ImportRowStatus;
  changes: FieldComparison[];
  dependencies: DependencyCheckItem[];
  errors: ImportErrorDetail[];
  warnings: ImportErrorDetail[];
  dbVersion?: string | number;
  processedAt?: string;
  processedResult?: 'Created' | 'Updated' | 'Deleted' | 'Archived' | 'Failed' | 'Skipped' | 'Blocked';
}

export interface ImportValidationSummary {
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  recordsToCreate: number;
  recordsToUpdate: number;
  recordsToDelete: number;
  noChangeRows: number;
  blockedRows: number;
  skippedRows: number;
  successRows: number;
  failedRows: number;
}

export interface ImportBatch {
  id: string;
  batchIdentifier: string;
  module: ImportModule;
  operation: ImportOperation;
  fileName: string;
  fileSize: number;
  uploadedBy: {
    id: string;
    name: string;
    email?: string;
  };
  uploadedAt: string;
  startedAt?: string;
  completedAt?: string;
  status: ImportBatchStatus;
  summary: ImportValidationSummary;
  records: ImportParsedRecord[];
  originalFileBase64?: string;
  errorMessage?: string;
}

export interface ColumnDefinition {
  key: string;
  label: string;
  description?: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum' | 'currency';
  required: boolean;
  unique?: boolean;
  immutable?: boolean;
  calculated?: boolean;
  allowedValues?: string[] | (() => Promise<string[]>);
  sampleValue?: any;
  exampleValues?: string[];
  dbField?: string;
  foreignKey?: {
    entity: ImportModule | string;
    keyField: string;
    displayField?: string;
  };
}

export interface EntityImportAdapter {
  module: ImportModule;
  label: string;
  primaryKeyLabel: string;
  primaryKeyField: string;
  columns: ColumnDefinition[];
  getTemplateColumns(operation: ImportOperation): ColumnDefinition[];
  resolveRecordKey(row: Record<string, any>): string;
  fetchExistingRecords(keys: string[]): Promise<Map<string, Record<string, any>>>;
  validateRow(
    row: Record<string, any>,
    operation: ImportOperation,
    context: {
      rowNumber: number;
      existingRecord?: Record<string, any>;
      inBatchKeys: Set<string>;
      allExistingKeys: Set<string>;
      dropdownMasters: Record<string, string[]>;
      referencedRecords?: Record<string, any>;
    }
  ): Promise<{
    errors: ImportErrorDetail[];
    warnings: ImportErrorDetail[];
    normalized: Record<string, any>;
    changes: FieldComparison[];
    dependencies: DependencyCheckItem[];
  }>;
  executeRecord(
    record: ImportParsedRecord,
    operation: ImportOperation,
    user: { id: string; name: string }
  ): Promise<{
    success: boolean;
    createdId?: string;
    resultText: string;
    error?: string;
  }>;
}

/**
 * Normalizes a key or column header for comparison by removing whitespace, asterisks, punctuation, and converting to lowercase.
 */
export function normalizeColumnKey(str: string | undefined | null): string {
  if (!str) return '';
  return String(str).toLowerCase().replace(/[\s*_/:().-]+/g, '');
}

/**
 * Robustly retrieves a value from a row object regardless of whether the header
 * contains trailing asterisks (*), extra spaces, uppercase/lowercase, or slight label vs key differences.
 */
export function getCellValue(row: Record<string, any>, ...possibleKeys: (string | undefined)[]): any {
  if (!row || typeof row !== 'object') return undefined;

  // 1. Direct exact lookup
  for (const k of possibleKeys) {
    if (!k) continue;
    if (k in row && row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return row[k];
    }
    // Also try with asterisk suffix or without asterisk suffix
    const withAsterisk = `${k} *`;
    if (withAsterisk in row && row[withAsterisk] !== undefined && row[withAsterisk] !== null && String(row[withAsterisk]).trim() !== '') {
      return row[withAsterisk];
    }
    const withAsteriskNoSpace = `${k}*`;
    if (withAsteriskNoSpace in row && row[withAsteriskNoSpace] !== undefined && row[withAsteriskNoSpace] !== null && String(row[withAsteriskNoSpace]).trim() !== '') {
      return row[withAsteriskNoSpace];
    }
  }

  // 2. Normalized fuzzy lookup over all row keys
  const normalizedTargets = possibleKeys
    .filter((k): k is string => Boolean(k))
    .map(k => normalizeColumnKey(k));

  for (const actualKey of Object.keys(row)) {
    const normActual = normalizeColumnKey(actualKey);
    if (normalizedTargets.includes(normActual)) {
      const val = row[actualKey];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return val;
      }
    }
  }

  return undefined;
}

/**
 * Normalizes Excel dates, JavaScript dates, ISO strings, serial numbers, and custom formatted strings
 * into a standard clean 'YYYY-MM-DD' format that PostgreSQL DATE columns accept without timezone errors.
 */
export function sanitizeDateForPostgres(value: any): string | null {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  if (!str || str === '[NULL]' || str.toLowerCase() === 'null' || str === '—' || str === '-') return null;

  // 1. If it's already a JS Date object
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 2. Direct YYYY-MM-DD match
  const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = ymdMatch[2].padStart(2, '0');
    const d = ymdMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 3. DD-MM-YYYY or DD/MM/YYYY match
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  // 4. Excel Serial Number (e.g. 45678)
  const num = Number(str);
  if (!isNaN(num) && num > 20000 && num < 80000) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const targetDate = new Date(excelEpoch.getTime() + num * 86400000);
    if (!isNaN(targetDate.getTime())) {
      const y = targetDate.getUTCFullYear();
      const m = String(targetDate.getUTCMonth() + 1).padStart(2, '0');
      const d = String(targetDate.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  // 5. Attempt general Date parse, strip out timezone labels
  try {
    const cleaned = str.replace(/\b(gmt[+-]\d+|utc[+-]\d+|[a-z]{3,4}\b)/gi, '').trim();
    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  } catch {}

  return null;
}
