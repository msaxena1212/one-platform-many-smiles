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

/**
 * In-memory / local storage provider for import history and audit logs
 */
export function getImportBatchHistory(): ImportBatch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
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
