import * as XLSX from 'xlsx';
import { ExcelImportEngine, ADAPTER_REGISTRY } from './engine';
import { generateTemplateWorkbook } from './template-generator';
import { ResultExcelGenerator } from './result-generator';
import type { ImportModule, ImportOperation } from './types';

async function runTestSuite() {
  console.log('====================================================');
  console.log('🚀 EXCEL IMPORT ENGINE COMPREHENSIVE TEST SUITE');
  console.log('====================================================');

  const modules: ImportModule[] = ['property', 'unit', 'customer', 'asset', 'lease', 'employee'];
  const operations: ImportOperation[] = ['CREATE', 'UPDATE', 'DELETE'];

  // Test 1: Template generation for all 18 permutations
  console.log('\n--- TEST 1: Template Generator (18 Permutations) ---');
  for (const mod of modules) {
    for (const op of operations) {
      try {
        const buf = await generateTemplateWorkbook(mod, op);
        const wb = XLSX.read(buf, { type: 'array' });
        const hasMainSheet = wb.SheetNames.length >= 2;
        if (!hasMainSheet) throw new Error('Missing instruction or main sheet');
        console.log(`  ✓ Template ${mod.toUpperCase()} (${op}): OK (${buf.length} bytes, sheets: ${wb.SheetNames.join(', ')})`);
      } catch (e: any) {
        console.error(`  ✗ Template ${mod} (${op}) FAILED:`, e.message);
      }
    }
  }

  // Test 2: CREATE parsing & duplicate detection within Excel
  console.log('\n--- TEST 2: CREATE Parsing & In-File Duplicate Detection ---');
  try {
    const testWb = XLSX.utils.book_new();
    const rows = [
      ['Property Code *', 'Property Name *', 'Property Type *', 'Country *', 'City *'],
      ['TEST-PROP-01', 'Test Tower A', 'Residential', 'Qatar', 'Doha'],
      ['TEST-PROP-01', 'Test Tower Duplicate', 'Residential', 'Qatar', 'Doha'],
      ['TEST-PROP-02', 'Test Tower B', 'Residential', 'Qatar', 'Doha'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(testWb, ws, 'Properties');
    const excelBuffer = XLSX.write(testWb, { type: 'array', bookType: 'xlsx' });

    const batch = await ExcelImportEngine.parseAndValidate(
      excelBuffer,
      'test_properties_create.xlsx',
      'property',
      'CREATE',
      { id: 'test-admin', name: 'Test Administrator' }
    );

    console.log(`  Batch ID: ${batch.batchIdentifier}`);
    console.log(`  Total Rows: ${batch.summary.totalRows}, Ready: ${batch.summary.validRows}, Errors: ${batch.summary.errorRows}`);

    const hasDuplicateError = batch.records.some(r => r.errors.some(e => e.code === 'DUP_001'));
    console.log(`  In-file Duplicate Flagged: ${hasDuplicateError ? '✓ PASS' : '✗ FAIL'}`);
  } catch (e: any) {
    console.error('  ✗ Test 2 Failed:', e.message);
  }

  // Test 3: UPDATE old vs new diff calculation & [NULL] clearing
  console.log('\n--- TEST 3: UPDATE Diff Calculation & [NULL] Value Clearing ---');
  try {
    const testWb = XLSX.utils.book_new();
    const rows = [
      ['Customer Identifier (QID / Passport / CR) *', 'Full Name / Company Name *', 'Mobile Number *', 'Email Address'],
      ['28463401923', 'ABC Trading W.L.L. (Updated)', '97455009988', '[NULL]'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(testWb, ws, 'Customers');
    const excelBuffer = XLSX.write(testWb, { type: 'array', bookType: 'xlsx' });

    const batch = await ExcelImportEngine.parseAndValidate(
      excelBuffer,
      'test_customer_update.xlsx',
      'customer',
      'UPDATE',
      { id: 'test-admin', name: 'Test Administrator' }
    );

    console.log(`  Batch ID: ${batch.batchIdentifier}`);
    const firstRec = batch.records[0];
    console.log(`  Parsed Record Key: ${firstRec.recordKey}`);
    console.log(`  Detected Changes: ${firstRec.changes.length}`);
    for (const ch of firstRec.changes) {
      console.log(`    - ${ch.label}: "${ch.oldValue}" -> "${ch.newValue}" (${ch.status})`);
    }
  } catch (e: any) {
    console.error('  ✗ Test 3 Failed:', e.message);
  }

  // Test 4: Result Excel Workbook Generation (6 sheets)
  console.log('\n--- TEST 4: Result Excel Generation (6 Sheets) ---');
  try {
    const mockBatch: any = {
      id: 'batch-test-01',
      batchIdentifier: 'IMP-2026-09-16-000999',
      module: 'property',
      operation: 'UPDATE',
      fileName: 'property_updates.xlsx',
      fileSize: 10240,
      uploadedBy: { id: 'u1', name: 'John Doe', email: 'john@stayhub.qa' },
      uploadedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: 'COMPLETED',
      summary: {
        totalRows: 2,
        validRows: 2,
        errorRows: 0,
        warningRows: 0,
        recordsToCreate: 0,
        recordsToUpdate: 2,
        recordsToDelete: 0,
        noChangeRows: 0,
        blockedRows: 0,
        skippedRows: 0,
        successRows: 2,
        failedRows: 0,
      },
      records: [
        {
          excelRowNumber: 2,
          recordKey: 'AAA',
          recordId: 'p1',
          recordName: 'Old Salata 23',
          rawRowData: { 'Property Code': 'AAA', 'Property Name': 'Old Salata 23 New' },
          normalizedData: { title: 'Old Salata 23 New' },
          status: 'SUCCESS',
          changes: [{ field: 'title', label: 'Property Name', oldValue: 'Old Salata 23', newValue: 'Old Salata 23 New', status: 'CHANGED' }],
          dependencies: [],
          errors: [],
          warnings: [],
          processedResult: 'Updated',
          processedAt: new Date().toISOString(),
        },
      ],
    };

    const resultBytes = ResultExcelGenerator.generateResultWorkbook(mockBatch);
    const resultWb = XLSX.read(resultBytes, { type: 'array' });
    console.log(`  Generated Result Workbook Sheets (${resultWb.SheetNames.length}):`, resultWb.SheetNames.join(', '));
    const expectedSheets = ['Import Summary', 'All Records', 'Successful Records', 'Failed Records', 'Comparison', 'Audit Log'];
    const allSheetsPresent = expectedSheets.every(s => resultWb.SheetNames.includes(s));
    console.log(`  All 6 Required Sheets Present: ${allSheetsPresent ? '✓ PASS' : '✗ FAIL'}`);
  } catch (e: any) {
    console.error('  ✗ Test 4 Failed:', e.message);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL ENGINE TEST PHASES COMPLETE');
  console.log('====================================================\n');
}

runTestSuite().catch(console.error);
