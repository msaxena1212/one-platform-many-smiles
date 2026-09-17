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
