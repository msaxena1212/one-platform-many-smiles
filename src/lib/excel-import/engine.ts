import * as XLSX from 'xlsx';
import type {
  ImportModule,
  ImportOperation,
  ImportBatch,
  ImportParsedRecord,
  ImportValidationSummary,
  ImportRowStatus,
  EntityImportAdapter,
} from './types';
import { propertyAdapter } from './adapters/property-adapter';
import { unitAdapter } from './adapters/unit-adapter';
import { customerAdapter } from './adapters/customer-adapter';
import { assetAdapter } from './adapters/asset-adapter';
import { leaseAdapter } from './adapters/lease-adapter';
import { employeeAdapter } from './adapters/employee-adapter';
import { getMasterOptions } from './master-options';
import { saveImportBatch, updateImportBatchRecord, recordAuditEvent } from './storage-service';

export const ADAPTER_REGISTRY: Record<ImportModule, EntityImportAdapter> = {
  property: propertyAdapter,
  unit: unitAdapter,
  customer: customerAdapter,
  asset: assetAdapter,
  lease: leaseAdapter,
  employee: employeeAdapter,
};

export class ExcelImportEngine {
  /**
   * Parse uploaded Excel buffer and run pre-validation
   */
  static async parseAndValidate(
    fileBuffer: ArrayBuffer,
    fileName: string,
    module: ImportModule,
    operation: ImportOperation,
    user: { id: string; name: string; email?: string }
  ): Promise<ImportBatch> {
    const adapter = ADAPTER_REGISTRY[module];
    if (!adapter) {
      throw new Error(`Module "${module}" is not supported.`);
    }

    // 1. Parse workbook
    let wb: XLSX.WorkBook;
    try {
      wb = XLSX.read(fileBuffer, { type: 'array', cellDates: true, raw: false });
    } catch (e: any) {
      throw new Error(`FILE_004: Failed to read Excel workbook. File may be corrupted or password protected.`);
    }

    if (!wb.SheetNames || wb.SheetNames.length === 0) {
      throw new Error(`FILE_003: Excel file contains no worksheets.`);
    }

    // Use first non-instruction sheet
    const targetSheetName = wb.SheetNames.find(s => !s.toLowerCase().includes('instruction') && !s.toLowerCase().includes('master')) || wb.SheetNames[0];
    const ws = wb.Sheets[targetSheetName];

    if (!ws) {
      throw new Error(`FILE_003: Could not find valid data sheet in workbook.`);
    }

    // Convert sheet to JSON rows
    const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

    if (rawRows.length === 0) {
      throw new Error(`FILE_003: The selected worksheet "${targetSheetName}" contains no data rows.`);
    }

    // Limit check
    if (rawRows.length > 5000) {
      throw new Error(`FILE_002: Maximum row limit exceeded (5,000 rows max per batch).`);
    }

    // 2. Column Structure Validation
    const templateCols = adapter.getTemplateColumns(operation);
    const firstRowKeys = Object.keys(rawRows[0] || {});
    
    // Normalize header labels
    const cleanHeaderMap = new Map<string, string>();
    for (const k of firstRowKeys) {
      const clean = k.replace(/\s*\*$/, '').trim().toLowerCase();
      cleanHeaderMap.set(clean, k);
    }

    // Check mandatory primary key column
    const pkCol = templateCols.find(c => c.key === adapter.primaryKeyField);
    if (pkCol) {
      const cleanPk = pkCol.label.replace(/\s*\*$/, '').trim().toLowerCase();
      if (!cleanHeaderMap.has(cleanPk)) {
        // Also check if fallback column name exists
        const fallbackExists = firstRowKeys.some(k => k.toLowerCase().includes(adapter.primaryKeyField.toLowerCase()));
        if (!fallbackExists) {
          throw new Error(`COLUMN_001: Required column "${pkCol.label}" is missing from the uploaded file.`);
        }
      }
    }

    // 3. Collect Keys and Fetch DB records in bulk
    const rowKeys: string[] = [];
    for (const row of rawRows) {
      const key = adapter.resolveRecordKey(row);
      if (key) rowKeys.push(key);
    }

    const existingDbMap = await adapter.fetchExistingRecords(rowKeys);
    const dropdownMasters = await getMasterOptions();

    // 4. Validate Each Row
    const inBatchKeys = new Set<string>();
    const parsedRecords: ImportParsedRecord[] = [];

    let readyCount = 0;
    let errorCount = 0;
    let warningCount = 0;
    let noChangeCount = 0;
    let blockedCount = 0;

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowNumber = i + 2; // Excel 1-based index (header is row 1)
      const recordKey = adapter.resolveRecordKey(row);
      const upperKey = recordKey.toUpperCase();

      const existingRecord = existingDbMap.get(upperKey);

      const validationRes = await adapter.validateRow(row, operation, {
        rowNumber,
        existingRecord,
        inBatchKeys,
        allExistingKeys: new Set(existingDbMap.keys()),
        dropdownMasters: dropdownMasters as any,
      });

      if (recordKey) {
        inBatchKeys.add(upperKey);
      }

      let rowStatus: ImportRowStatus = 'READY';

      if (validationRes.errors.length > 0) {
        rowStatus = 'ERROR';
        errorCount++;
      } else if (validationRes.dependencies.some(d => d.result === 'Blocked')) {
        rowStatus = 'BLOCKED';
        blockedCount++;
      } else if (operation === 'UPDATE' && validationRes.changes.length === 0) {
        rowStatus = 'NO_CHANGE';
        noChangeCount++;
      } else if (validationRes.warnings.length > 0) {
        rowStatus = 'WARNING';
        warningCount++;
        readyCount++;
      } else {
        rowStatus = 'READY';
        readyCount++;
      }

      parsedRecords.push({
        excelRowNumber: rowNumber,
        recordKey: recordKey || `ROW-${rowNumber}`,
        recordId: existingRecord?.id,
        recordName: existingRecord?.title || existingRecord?.full_name || existingRecord?.asset_name || existingRecord?.first_name ? `${existingRecord?.first_name} ${existingRecord?.last_name || ''}` : undefined,
        rawRowData: row,
        normalizedData: validationRes.normalized,
        originalDbData: existingRecord,
        status: rowStatus,
        changes: validationRes.changes,
        dependencies: validationRes.dependencies,
        errors: validationRes.errors,
        warnings: validationRes.warnings,
        dbVersion: existingRecord?.updated_at || existingRecord?.created_at,
      });
    }

    // 5. Build Batch Record
    const dateStr = new Date().toISOString().slice(0, 10);
    const randSuffix = Math.floor(100000 + Math.random() * 900000);
    const batchIdentifier = `IMP-${dateStr}-${randSuffix}`;

    const summary: ImportValidationSummary = {
      totalRows: rawRows.length,
      validRows: readyCount,
      errorRows: errorCount,
      warningRows: warningCount,
      recordsToCreate: operation === 'CREATE' ? readyCount : 0,
      recordsToUpdate: operation === 'UPDATE' ? readyCount : 0,
      recordsToDelete: operation === 'DELETE' ? readyCount : 0,
      noChangeRows: noChangeCount,
      blockedRows: blockedCount,
      skippedRows: 0,
      successRows: 0,
      failedRows: 0,
    };

    const batch: ImportBatch = {
      id: crypto.randomUUID(),
      batchIdentifier,
      module,
      operation,
      fileName,
      fileSize: fileBuffer.byteLength,
      uploadedBy: user,
      uploadedAt: new Date().toISOString(),
      status: errorCount > 0 && readyCount === 0 ? 'FAILED' : 'PREVIEW_READY',
      summary,
      records: parsedRecords,
    };

    saveImportBatch(batch);
    return batch;
  }

  /**
   * Re-validate & Commit the Batch
   */
  static async commitBatch(
    batch: ImportBatch,
    user: { id: string; name: string },
    onProgress?: (processed: number, total: number, success: number, failed: number) => void
  ): Promise<ImportBatch> {
    const adapter = ADAPTER_REGISTRY[batch.module];
    if (!adapter) throw new Error(`Module ${batch.module} adapter not found`);

    batch.status = 'PROCESSING';
    batch.startedAt = new Date().toISOString();
    saveImportBatch(batch);

    const validRecords = batch.records.filter(r => r.status === 'READY' || r.status === 'WARNING');
    const keysToProcess = validRecords.map(r => r.recordKey);

    // 1. Second Validation: Fetch fresh DB records for Concurrency / State Protection
    const freshDbMap = await adapter.fetchExistingRecords(keysToProcess);

    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;
    let noChangeCount = batch.summary.noChangeRows;

    for (const record of batch.records) {
      if (record.status === 'NO_CHANGE') {
        record.processedResult = 'Skipped';
        record.processedAt = new Date().toISOString();
        continue;
      }

      if (record.status === 'ERROR' || record.status === 'BLOCKED') {
        record.processedResult = 'Failed';
        record.processedAt = new Date().toISOString();
        failedCount++;
        continue;
      }

      // Concurrency check for UPDATE
      if (batch.operation === 'UPDATE' && record.originalDbData) {
        const fresh = freshDbMap.get(record.recordKey.toUpperCase());
        const freshVersion = fresh?.updated_at || fresh?.created_at;
        
        if (record.dbVersion && freshVersion && String(record.dbVersion) !== String(freshVersion)) {
          record.status = 'ERROR';
          record.errors.push({
            row: record.excelRowNumber,
            code: 'CONC_001',
            message: 'Concurrent modification detected. Record was changed in database after preview.',
            severity: 'ERROR',
            resolution: 'Re-run import to fetch latest record version.',
          });
          record.processedResult = 'Failed';
          record.processedAt = new Date().toISOString();
          failedCount++;
          continue;
        }
      }

      // Execute Single Logical Record Transaction
      try {
        const execRes = await adapter.executeRecord(record, batch.operation, user);

        if (execRes.success) {
          record.status = 'SUCCESS';
          record.processedResult = batch.operation === 'CREATE' ? 'Created' : batch.operation === 'UPDATE' ? 'Updated' : 'Deleted';
          record.processedAt = new Date().toISOString();
          successCount++;

          // Audit log
          recordAuditEvent({
            batchId: batch.id,
            batchIdentifier: batch.batchIdentifier,
            module: batch.module,
            operation: batch.operation,
            recordKey: record.recordKey,
            recordId: execRes.createdId || record.recordId || '',
            actor: user.name,
            timestamp: new Date().toISOString(),
            changes: record.changes,
            result: 'SUCCESS',
          });
        } else {
          record.status = 'FAILED';
          record.processedResult = 'Failed';
          record.errors.push({
            row: record.excelRowNumber,
            code: 'SYS_001',
            message: execRes.error || 'Failed to persist record to database',
            severity: 'ERROR',
          });
          record.processedAt = new Date().toISOString();
          failedCount++;
        }
      } catch (err: any) {
        record.status = 'FAILED';
        record.processedResult = 'Failed';
        record.errors.push({
          row: record.excelRowNumber,
          code: 'SYS_001',
          message: err?.message || 'Unexpected processing failure',
          severity: 'ERROR',
        });
        record.processedAt = new Date().toISOString();
        failedCount++;
      }

      processedCount++;
      if (onProgress) {
        onProgress(processedCount, validRecords.length, successCount, failedCount);
      }
    }

    batch.completedAt = new Date().toISOString();
    batch.summary.successRows = successCount;
    batch.summary.failedRows = failedCount;

    if (successCount === batch.records.length) {
      batch.status = 'COMPLETED';
    } else if (successCount > 0) {
      batch.status = 'PARTIAL_SUCCESS';
    } else {
      batch.status = 'FAILED';
    }

    saveImportBatch(batch);
    return batch;
  }
}
