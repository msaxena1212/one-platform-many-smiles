import * as XLSX from 'xlsx';
import type { ImportBatch } from './types';

export class ResultExcelGenerator {
  /**
   * Generates a 6-sheet comprehensive result workbook
   */
  static generateResultWorkbook(batch: ImportBatch): Uint8Array {
    const wb = XLSX.utils.book_new();

    // ─────────────────────────────────────────────────────────────────────────────
    // Sheet 1: Import Summary
    // ─────────────────────────────────────────────────────────────────────────────
    const durationSeconds = batch.startedAt && batch.completedAt
      ? ((new Date(batch.completedAt).getTime() - new Date(batch.startedAt).getTime()) / 1000).toFixed(2)
      : 'N/A';

    const summaryData = [
      ['PROPERTY MANAGEMENT SYSTEM - EXCEL IMPORT RESULT REPORT'],
      [],
      ['Metric / Property', 'Value'],
      ['Batch ID', batch.batchIdentifier],
      ['Module', batch.module.toUpperCase()],
      ['Operation', batch.operation],
      ['Original File Name', batch.fileName],
      ['Uploaded By', `${batch.uploadedBy.name} (${batch.uploadedBy.email || batch.uploadedBy.id})`],
      ['Uploaded At', batch.uploadedAt],
      ['Started At', batch.startedAt || 'N/A'],
      ['Completed At', batch.completedAt || 'N/A'],
      ['Processing Duration', `${durationSeconds} seconds`],
      ['Final Batch Status', batch.status],
      [],
      ['RECORD COUNTS BREAKDOWN:'],
      ['Total Excel Rows', batch.summary.totalRows],
      ['Ready / Valid Rows', batch.summary.validRows],
      ['Successful Records', batch.summary.successRows],
      ['Failed Records', batch.summary.failedRows],
      ['No Change Detected', batch.summary.noChangeRows],
      ['Blocked (Dependencies)', batch.summary.blockedRows],
      ['Warning Rows', batch.summary.warningRows],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 30 }, { wch: 45 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Import Summary');

    // ─────────────────────────────────────────────────────────────────────────────
    // Sheet 2: All Records
    // ─────────────────────────────────────────────────────────────────────────────
    const allRecordsHeaders = [
      'Excel Row',
      'Record ID',
      'Record Key',
      'Record Name',
      'Operation',
      'Validation Status',
      'Processing Result',
      'Processed At',
      'Error / Warning Message',
    ];

    const allRecordsRows: any[][] = [allRecordsHeaders];
    for (const rec of batch.records) {
      const errMsg = rec.errors.map(e => e.message).join(' | ') || rec.warnings.map(w => w.message).join(' | ') || '—';
      allRecordsRows.push([
        rec.excelRowNumber,
        rec.recordId || '—',
        rec.recordKey,
        rec.recordName || '—',
        batch.operation,
        rec.status,
        rec.processedResult || rec.status,
        rec.processedAt || '—',
        errMsg,
      ]);
    }

    const wsAll = XLSX.utils.aoa_to_sheet(allRecordsRows);
    wsAll['!cols'] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 22 },
      { wch: 30 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
      { wch: 22 },
      { wch: 45 },
    ];
    XLSX.utils.book_append_sheet(wb, wsAll, 'All Records');

    // ─────────────────────────────────────────────────────────────────────────────
    // Sheet 3: Successful Records
    // ─────────────────────────────────────────────────────────────────────────────
    const successHeaders = ['Excel Row', 'Record ID', 'Record Key', 'Operation', 'Result', 'Processed At'];
    const successRows: any[][] = [successHeaders];

    for (const rec of batch.records) {
      if (rec.status === 'SUCCESS' || rec.processedResult === 'Created' || rec.processedResult === 'Updated' || rec.processedResult === 'Deleted') {
        successRows.push([
          rec.excelRowNumber,
          rec.recordId || '—',
          rec.recordKey,
          batch.operation,
          rec.processedResult || 'Success',
          rec.processedAt || '—',
        ]);
      }
    }

    const wsSuccess = XLSX.utils.aoa_to_sheet(successRows);
    wsSuccess['!cols'] = [{ wch: 10 }, { wch: 25 }, { wch: 22 }, { wch: 14 }, { wch: 18 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, wsSuccess, 'Successful Records');

    // ─────────────────────────────────────────────────────────────────────────────
    // Sheet 4: Failed Records
    // ─────────────────────────────────────────────────────────────────────────────
    const failedHeaders = [
      'Excel Row',
      'Record Key',
      'Error Code',
      'Severity',
      'Error Message',
      'Suggested Resolution',
      'Original Data Snapshot',
    ];
    const failedRows: any[][] = [failedHeaders];

    for (const rec of batch.records) {
      if (rec.status === 'ERROR' || rec.status === 'BLOCKED' || rec.status === 'FAILED' || rec.errors.length > 0) {
        for (const err of rec.errors) {
          failedRows.push([
            rec.excelRowNumber,
            rec.recordKey,
            err.code,
            err.severity,
            err.message,
            err.resolution || 'Inspect row and correct according to template rules.',
            JSON.stringify(rec.rawRowData),
          ]);
        }
        if (rec.errors.length === 0 && rec.status === 'BLOCKED') {
          failedRows.push([
            rec.excelRowNumber,
            rec.recordKey,
            'DEL_003',
            'ERROR',
            'Deletion blocked due to active dependencies.',
            'Clear active leases/transactions before deleting.',
            JSON.stringify(rec.rawRowData),
          ]);
        }
      }
    }

    const wsFailed = XLSX.utils.aoa_to_sheet(failedRows);
    wsFailed['!cols'] = [
      { wch: 10 },
      { wch: 22 },
      { wch: 14 },
      { wch: 12 },
      { wch: 45 },
      { wch: 45 },
      { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(wb, wsFailed, 'Failed Records');

    // ─────────────────────────────────────────────────────────────────────────────
    // Sheet 5: Update Comparison
    // ─────────────────────────────────────────────────────────────────────────────
    const diffHeaders = [
      'Excel Row',
      'Record ID',
      'Record Key',
      'Field Key',
      'Field Label',
      'Existing Value (DB)',
      'Proposed Value (Excel)',
      'Change Type',
    ];
    const diffRows: any[][] = [diffHeaders];

    for (const rec of batch.records) {
      if (rec.changes && rec.changes.length > 0) {
        for (const ch of rec.changes) {
          diffRows.push([
            rec.excelRowNumber,
            rec.recordId || '—',
            rec.recordKey,
            ch.field,
            ch.label,
            ch.oldValue !== null && ch.oldValue !== undefined ? String(ch.oldValue) : '—',
            ch.newValue !== null && ch.newValue !== undefined ? String(ch.newValue) : '—',
            ch.status,
          ]);
        }
      }
    }

    const wsDiff = XLSX.utils.aoa_to_sheet(diffRows);
    wsDiff['!cols'] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 22 },
      { wch: 22 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, wsDiff, 'Comparison');

    // ─────────────────────────────────────────────────────────────────────────────
    // Sheet 6: Audit Log
    // ─────────────────────────────────────────────────────────────────────────────
    const auditHeaders = ['Timestamp', 'Batch ID', 'Module', 'Operation', 'Record Key', 'Actor', 'Changed Fields Summary', 'Status'];
    const auditRows: any[][] = [auditHeaders];

    for (const rec of batch.records) {
      if (rec.processedResult && rec.processedResult !== 'Skipped') {
        const changesSummary = rec.changes.map(c => `${c.label}: "${c.oldValue}" -> "${c.newValue}"`).join('; ');
        auditRows.push([
          rec.processedAt || batch.completedAt || '—',
          batch.batchIdentifier,
          batch.module.toUpperCase(),
          batch.operation,
          rec.recordKey,
          batch.uploadedBy.name,
          changesSummary || 'N/A',
          rec.processedResult,
        ]);
      }
    }

    const wsAudit = XLSX.utils.aoa_to_sheet(auditRows);
    wsAudit['!cols'] = [
      { wch: 22 },
      { wch: 24 },
      { wch: 12 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 45 },
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, wsAudit, 'Audit Log');

    const output = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    return new Uint8Array(output);
  }

  /**
   * Generates a focused Failed Records workbook for fast re-upload
   */
  static generateFailedRecordsWorkbook(batch: ImportBatch): Uint8Array {
    const wb = XLSX.utils.book_new();
    const adapter = ADAPTER_REGISTRY[batch.module];
    const columns = adapter ? adapter.getTemplateColumns(batch.operation) : [];

    const headers = columns.map(c => c.label + (c.required ? ' *' : ''));
    headers.push('Failure Reason', 'Suggested Resolution');

    const rows: any[][] = [headers];

    for (const rec of batch.records) {
      if (rec.status === 'ERROR' || rec.status === 'BLOCKED' || rec.status === 'FAILED') {
        const rowVals = columns.map(c => rec.rawRowData[c.label] ?? rec.rawRowData[c.label + ' *'] ?? rec.rawRowData[c.key] ?? '');
        const errDesc = rec.errors.map(e => e.message).join('; ') || 'Dependency blocked';
        const resolution = rec.errors.map(e => e.resolution).filter(Boolean).join('; ') || 'Fix data according to instructions.';
        rowVals.push(errDesc, resolution);
        rows.push(rowVals);
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Failed_Records');

    const output = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    return new Uint8Array(output);
  }

  /**
   * Helper to trigger direct browser download
   */
  static triggerDownload(data: Uint8Array, fileName: string) {
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
