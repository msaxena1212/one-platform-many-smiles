import type { ImportBatch, ImportModule, ImportOperation } from './types';

const STORAGE_KEY = 'stayhub_import_batches_history_v1';
const AUDIT_STORAGE_KEY = 'stayhub_import_audit_trail_v1';

export interface AuditLogEntry {
  id?: string;
  batchId: string;
  batchIdentifier: string;
  module: ImportModule;
  operation: ImportOperation;
  recordKey: string;
  recordId: string;
  actor: string;
  timestamp: string;
  changes: any[];
  result: 'SUCCESS' | 'FAILED';
}

// Baseline 38-employee batch for HRMS workforce history
const DEFAULT_EMPLOYEE_BATCH: ImportBatch = {
  id: "BATCH-EMP-20261002-0813",
  batchIdentifier: "BATCH_EMP_20261002_0813",
  module: "employee",
  operation: "CREATE",
  status: "COMPLETED",
  fileName: "HRMS_Workforce_Roster_38.xlsx",
  fileSize: 24576,
  uploadedAt: "2026-10-02T08:13:57.000Z",
  completedAt: "2026-10-02T08:14:05.000Z",
  uploadedBy: {
    id: "admin-user",
    name: "Admin User",
    email: "admin@zyno.qa",
  },
  summary: {
    totalRows: 38,
    validRows: 38,
    errorRows: 0,
    warningRows: 0,
    recordsToCreate: 38,
    recordsToUpdate: 0,
    recordsToDelete: 0,
    noChangeRows: 0,
    blockedRows: 0,
    skippedRows: 0,
    successRows: 38,
    failedRows: 0,
  },
  records: [
    {
      excelRowNumber: 2,
      recordKey: "EMP-00018",
      recordId: "46201286-eeb3-4727-ba08-d79c782fac9e",
      recordName: "Abdul Salam Pandarathil Aliamunny",
      rawRowData: { employee_id_code: "EMP-00018", employee_name: "Abdul Salam Pandarathil Aliamunny", nationality: "India", basic_salary: 1560, total_salary: 2600, bank_name: "Commercial Bank" },
      normalizedData: { employee_id_code: "EMP-00018", first_name: "Abdul", last_name: "Salam Pandarathil Aliamunny", nationality: "India", basic_salary: 1560, total_salary: 2600, bank_name: "Commercial Bank", employee_status: "Active" },
      status: "SUCCESS",
      changes: [],
      dependencies: [],
      errors: [],
      warnings: [],
      processedAt: "2026-10-02T08:14:01.000Z",
    },
    {
      excelRowNumber: 3,
      recordKey: "EMP-00036",
      recordName: "Bakhat Khatri",
      rawRowData: { employee_id_code: "EMP-00036", employee_name: "Bakhat Khatri", nationality: "Nepal", basic_salary: 1100, total_salary: 1100 },
      normalizedData: { employee_id_code: "EMP-00036", first_name: "Bakhat", last_name: "Khatri", nationality: "Nepal", basic_salary: 1100, total_salary: 1100, employee_status: "Active" },
      status: "SUCCESS",
      changes: [],
      dependencies: [],
      errors: [],
      warnings: [],
      processedAt: "2026-10-02T08:14:02.000Z",
    },
    {
      excelRowNumber: 4,
      recordKey: "EMP-00020",
      recordName: "Deuman Tamang",
      rawRowData: { employee_id_code: "EMP-00020", employee_name: "Deuman Tamang", nationality: "Nepal", basic_salary: 1400, total_salary: 1400 },
      normalizedData: { employee_id_code: "EMP-00020", first_name: "Deuman", last_name: "Tamang", nationality: "Nepal", basic_salary: 1400, total_salary: 1400, employee_status: "Active" },
      status: "SUCCESS",
      changes: [],
      dependencies: [],
      errors: [],
      warnings: [],
      processedAt: "2026-10-02T08:14:02.000Z",
    },
    {
      excelRowNumber: 5,
      recordKey: "EMP-00011",
      recordName: "Devaraj Khawas",
      rawRowData: { employee_id_code: "EMP-00011", employee_name: "Devaraj Khawas", nationality: "Nepal", basic_salary: 1790, total_salary: 1790 },
      normalizedData: { employee_id_code: "EMP-00011", first_name: "Devaraj", last_name: "Khawas", nationality: "Nepal", basic_salary: 1790, total_salary: 1790, employee_status: "Active" },
      status: "SUCCESS",
      changes: [],
      dependencies: [],
      errors: [],
      warnings: [],
      processedAt: "2026-10-02T08:14:03.000Z",
    },
    {
      excelRowNumber: 6,
      recordKey: "EMP-00019",
      recordName: "Firosh Puthanpeedikayil Kunhumon",
      rawRowData: { employee_id_code: "EMP-00019", employee_name: "Firosh Puthanpeedikayil Kunhumon", nationality: "India", basic_salary: 2500, total_salary: 2500 },
      normalizedData: { employee_id_code: "EMP-00019", first_name: "Firosh", last_name: "Puthanpeedikayil Kunhumon", nationality: "India", basic_salary: 2500, total_salary: 2500, employee_status: "Active" },
      status: "SUCCESS",
      changes: [],
      dependencies: [],
      errors: [],
      warnings: [],
      processedAt: "2026-10-02T08:14:03.000Z",
    },
  ],
};

/**
 * In-memory / local storage provider for import history and audit logs
 */
export function getImportBatchHistory(): ImportBatch[] {
  try {
    let parsed: ImportBatch[] = [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {}
    }

    if (!Array.isArray(parsed)) parsed = [];

    // If no employee batch exists in storage, seed the 38-employee batch
    const hasEmployeeBatch = parsed.some((b) => b.module === "employee");
    if (!hasEmployeeBatch) {
      parsed.push(DEFAULT_EMPLOYEE_BATCH);
    }

    return parsed.map((batch) => {
      const total = batch.summary?.totalRows ?? (batch as any).totalRecords ?? batch.records?.length ?? 0;
      const success = batch.summary?.successRows ?? (batch as any).successRecords ?? 0;
      let failed = batch.summary?.failedRows ?? (batch as any).failedRecords ?? 0;
      if (batch.status === 'FAILED' && success === 0 && failed === 0 && total > 0) {
        failed = total;
      }
      return {
        ...batch,
        summary: {
          totalRows: total,
          validRows: batch.summary?.validRows ?? success,
          errorRows: batch.summary?.errorRows ?? (total - success),
          warningRows: batch.summary?.warningRows ?? 0,
          recordsToCreate: batch.summary?.recordsToCreate ?? 0,
          recordsToUpdate: batch.summary?.recordsToUpdate ?? 0,
          recordsToDelete: batch.summary?.recordsToDelete ?? 0,
          noChangeRows: batch.summary?.noChangeRows ?? 0,
          blockedRows: batch.summary?.blockedRows ?? 0,
          skippedRows: batch.summary?.skippedRows ?? 0,
          successRows: success,
          failedRows: failed,
        },
      };
    });
  } catch {
    return [DEFAULT_EMPLOYEE_BATCH];
  }
}

export function saveImportBatch(batch: ImportBatch): void {
  try {
    const existing = getImportBatchHistory();
    const idx = existing.findIndex(b => b.id === batch.id);

    // Keep payload lean in storage (omit huge raw snapshots if necessary)
    const leanBatch: ImportBatch = {
      ...batch,
    };

    if (idx >= 0) {
      existing[idx] = leanBatch;
    } else {
      existing.unshift(leanBatch);
    }

    // Keep up to 50 historical batches
    const trimmed = existing.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save import batch:', e);
  }
}

export function getImportBatchById(idOrIdentifier: string): ImportBatch | null {
  const history = getImportBatchHistory();
  return history.find(b => b.id === idOrIdentifier || b.batchIdentifier === idOrIdentifier) || null;
}

export function updateImportBatchRecord(batchId: string, updater: (batch: ImportBatch) => void): ImportBatch | null {
  const history = getImportBatchHistory();
  const batch = history.find(b => b.id === batchId);
  if (!batch) return null;
  updater(batch);
  saveImportBatch(batch);
  return batch;
}

export function recordAuditEvent(entry: Omit<AuditLogEntry, 'id'>): void {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    const logs: AuditLogEntry[] = raw ? JSON.parse(raw) : [];
    logs.unshift({
      id: crypto.randomUUID(),
      ...entry,
    });
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 200)));
  } catch (e) {
    console.error('Failed to record audit event:', e);
  }
}

export function getAuditLogs(batchId?: string): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) return [];
    const logs: AuditLogEntry[] = JSON.parse(raw);
    if (batchId) {
      return logs.filter(l => l.batchId === batchId || l.batchIdentifier === batchId);
    }
    return logs;
  } catch {
    return [];
  }
}

/** Remove all import batch history records from storage (all modules). */
export function clearImportBatchHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear import batch history:', e);
  }
}

/** Remove all audit log entries from storage. */
export function clearAuditLogs(): void {
  try {
    localStorage.removeItem(AUDIT_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear audit logs:', e);
  }
}

/** Clear ALL execution history and audit logs in one call. */
export function clearAllImportHistory(): void {
  clearImportBatchHistory();
  clearAuditLogs();
}
