import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { FinancialReceipt } from '@/lib/finance/financial-receipt-service';

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: 'Helvetica', color: '#111' },
  title: { textAlign: 'center', fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 16 },
  subtitle: { textAlign: 'center', fontSize: 8, color: '#555', marginBottom: 14 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  column: { width: '48%' },
  row: { flexDirection: 'row', marginBottom: 5 },
  label: { width: 105, fontFamily: 'Helvetica-Bold' },
  value: { flex: 1 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#333', color: '#fff', padding: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#ccc', paddingVertical: 5 },
  c1: { width: 30 },
  c2: { width: 90 },
  c3: { flex: 1 },
  c4: { width: 70, textAlign: 'right' },
  c5: { width: 70, textAlign: 'right' },
  total: { marginTop: 12, padding: 8, backgroundColor: '#f2f2f2', flexDirection: 'row', justifyContent: 'flex-end' },
  totalLabel: { fontFamily: 'Helvetica-Bold', marginRight: 20 },
  totalValue: { fontFamily: 'Helvetica-Bold', fontSize: 12 },
  footer: { position: 'absolute', bottom: 30, left: 36, right: 36, textAlign: 'center', fontSize: 8, color: '#777' },
});

function formatAmount(amount: number, currency: string) {
  return `${currency} ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function amountInWords(amount: number, currency: string) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const whole = Math.floor(Math.abs(amount));
  const helper = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ` ${ones[n % 10]}` : '');
    if (n < 1000) return `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${helper(n % 100)}` : ''}`;
    if (n < 1000000) return `${helper(Math.floor(n / 1000))} Thousand${n % 1000 ? ` ${helper(n % 1000)}` : ''}`;
    return `${helper(Math.floor(n / 1000000))} Million${n % 1000000 ? ` ${helper(n % 1000000)}` : ''}`;
  };
  return `${helper(whole) || 'Zero'} ${currency} Only`;
}

export function buildFinancialReceiptData(receipt: FinancialReceipt) {
  const payload = receipt.receipt_payload || {};
  const lines = Array.isArray(payload.lines) ? payload.lines : [];
  return { receipt, payload, lines };
}

function FinancialReceiptDocument({ receipt }: { receipt: FinancialReceipt }) {
  const { payload, lines } = buildFinancialReceiptData(receipt);
  const voucherNumber = String(payload.voucher_number || receipt.voucher_id || '-');
  const eventType = String(payload.event_type || receipt.receipt_category || '-');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>FINANCIAL TRANSACTION RECEIPT</Text>
        <Text style={styles.subtitle}>Official electronically generated financial transaction acknowledgement</Text>

        <View style={styles.grid}>
          <View style={styles.column}>
            <View style={styles.row}><Text style={styles.label}>Receipt No.</Text><Text style={styles.value}>{receipt.receipt_no}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Transaction Type</Text><Text style={styles.value}>{eventType}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Category</Text><Text style={styles.value}>{receipt.receipt_category}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Direction</Text><Text style={styles.value}>{receipt.direction}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Reference</Text><Text style={styles.value}>{receipt.reference_no || receipt.instrument_reference || '-'}</Text></View>
          </View>
          <View style={styles.column}>
            <View style={styles.row}><Text style={styles.label}>Receipt Date</Text><Text style={styles.value}>{receipt.receipt_date}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Voucher No.</Text><Text style={styles.value}>{voucherNumber}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Payment Method</Text><Text style={styles.value}>{receipt.payment_method || '-'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Source</Text><Text style={styles.value}>{receipt.source_type || '-'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Status</Text><Text style={styles.value}>{receipt.status}</Text></View>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.c1, { fontFamily: 'Helvetica-Bold' }]}>#</Text>
          <Text style={[styles.c2, { fontFamily: 'Helvetica-Bold' }]}>Account</Text>
          <Text style={[styles.c3, { fontFamily: 'Helvetica-Bold' }]}>Description</Text>
          <Text style={[styles.c4, { fontFamily: 'Helvetica-Bold' }]}>Debit</Text>
          <Text style={[styles.c5, { fontFamily: 'Helvetica-Bold' }]}>Credit</Text>
        </View>

        {lines.map((line: any, index: number) => (
          <View key={`${line.line_number}-${index}`} style={styles.tableRow}>
            <Text style={styles.c1}>{line.line_number || index + 1}</Text>
            <Text style={styles.c2}>{line.account_code || '-'}{line.account_name ? ` - ${line.account_name}` : ''}</Text>
            <Text style={styles.c3}>{line.description || receipt.description || '-'}</Text>
            <Text style={styles.c4}>{Number(line.debit || 0) ? formatAmount(Number(line.debit), receipt.currency_code) : '-'}</Text>
            <Text style={styles.c5}>{Number(line.credit || 0) ? formatAmount(Number(line.credit), receipt.currency_code) : '-'}</Text>
          </View>
        ))}

        <View style={styles.total}>
          <Text style={styles.totalLabel}>Transaction Amount</Text>
          <Text style={styles.totalValue}>{formatAmount(receipt.amount, receipt.currency_code)}</Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Amount in Words</Text>
          <Text>{amountInWords(receipt.amount, receipt.currency_code)}</Text>
        </View>

        {receipt.description && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Description</Text>
            <Text>{receipt.description}</Text>
          </View>
        )}

        <Text style={styles.footer}>This receipt is generated from the posted accounting transaction and is retained as financial evidence. It does not create a separate accounting entry.</Text>
      </Page>
    </Document>
  );
}

export async function generateFinancialReceiptBlob(receipt: FinancialReceipt): Promise<Blob> {
  return pdf(<FinancialReceiptDocument receipt={receipt} />).toBlob();
}
