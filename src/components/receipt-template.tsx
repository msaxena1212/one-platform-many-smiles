import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 35, fontSize: 9, fontFamily: 'Helvetica', color: '#111' },
  center: { textAlign: 'center' },
  bold: { fontFamily: 'Helvetica-Bold' },
  pageLabel: { textAlign: 'center', fontSize: 8, color: '#555', marginBottom: 4 },

  /* ── Header ── */
  headerTitle: { textAlign: 'center', fontSize: 13, fontFamily: 'Helvetica-Bold', textDecoration: 'underline', marginBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  poBox: { fontSize: 9 },
  ackRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 8 },
  ackLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', marginRight: 4 },
  ackNo: { fontSize: 8, color: '#333' },

  /* ── Info block ── */
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderTopWidth: 0.5, borderTopColor: '#ccc', paddingTop: 6 },
  infoLeft: { flex: 1.4 },
  infoRight: { flex: 1 },
  infoRow: { flexDirection: 'row', marginBottom: 3 },
  infoLabel: { width: 80, fontSize: 8, fontFamily: 'Helvetica-Bold' },
  infoValue: { flex: 1, fontSize: 8 },
  infoRightLabel: { width: 72, fontSize: 8, fontFamily: 'Helvetica-Bold' },
  infoRightValue: { flex: 1, fontSize: 8 },

  /* ── Table ── */
  tableHeader: { flexDirection: 'row', backgroundColor: '#4a4a4a', color: '#fff', paddingVertical: 4, borderWidth: 0.5, borderColor: '#333' },
  tableRow: { flexDirection: 'row', borderLeftWidth: 0.5, borderRightWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#aaa', minHeight: 20, alignItems: 'center' },
  tableRowAlt: { backgroundColor: '#f5f5f5' },

  cellSNo:    { width: 22,  paddingHorizontal: 3, textAlign: 'center' },
  cellDesc:   { width: 68,  paddingHorizontal: 3 },
  cellCheque: { width: 56,  paddingHorizontal: 3 },
  cellMat:    { width: 50,  paddingHorizontal: 3 },
  cellType:   { width: 30,  paddingHorizontal: 3 },
  cellStart:  { width: 46,  paddingHorizontal: 3 },
  cellEnd:    { width: 46,  paddingHorizontal: 3 },
  cellBank:   { width: 38,  paddingHorizontal: 3 },
  cellAmt:    { flex: 1,    paddingHorizontal: 4, textAlign: 'right' },

  headerText: { color: '#fff', fontFamily: 'Helvetica-Bold', fontSize: 7.5 },
  cellText:   { fontSize: 7.5 },
  cellTextR:  { fontSize: 7.5, textAlign: 'right' },

  /* ── Total row ── */
  totalRow: { flexDirection: 'row', borderLeftWidth: 0.5, borderRightWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#aaa', backgroundColor: '#e8e8e8', minHeight: 18, alignItems: 'center' },
  totalLabel: { flex: 1, paddingHorizontal: 3, fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  totalAmt:   { width: 60, paddingHorizontal: 4, fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'right' },

  /* ── Footer ── */
  wordsRow: { flexDirection: 'row', marginTop: 8, marginBottom: 6 },
  wordsLabel: { width: 90, fontSize: 8, fontFamily: 'Helvetica-Bold' },
  wordsValue: { flex: 1, fontSize: 8 },

  remarksRow: { flexDirection: 'row', marginBottom: 4 },
  remarksLabel: { width: 90, fontSize: 8, fontFamily: 'Helvetica-Bold' },
  remarksBox: { flex: 1, borderWidth: 0.5, borderColor: '#aaa', minHeight: 28, padding: 2, fontSize: 7 },

  sigRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  sigBlock: { width: '30%', borderTopWidth: 0.5, borderTopColor: '#555', paddingTop: 3, fontSize: 8, textAlign: 'center', fontFamily: 'Helvetica-Bold' },

  preparedBy: { marginTop: 10, fontSize: 8 },
});

export interface ReceiptLineItem {
  sNo: number;
  description: string;
  chequeRef: string;
  maturityDate: string;
  type: 'Cash' | 'PDC' | 'Cheque' | 'Bank Transfer';
  checkStartDate?: string;
  checkEndDate?: string;
  bankName?: string;
  amount: number;
}

export interface ReceiptData {
  /* Header */
  receipt_no: string;
  acknowledgement_no: string;
  po_box?: string;
  phone?: string;
  /* Tenant */
  tenant_name: string;
  property_name: string;
  lease_no: string;
  location_code?: string;
  /* Dates */
  collection_date: string;
  lease_start_date: string;
  lease_end_date: string;
  /* Items */
  line_items: ReceiptLineItem[];
  /* Total */
  total_amount: number;
  amount_in_words: string;
  /* Remarks */
  remarks?: string;
  prepared_by?: string;
  /* Legacy simple fields (for backward compat) */
  receipt_date?: string;
  payment_type?: string;
  payment_method?: string;
  transaction_reference?: string;
  collection_period?: string;
  amount?: number;
  property_unit?: string;
}

function amountToWords(n: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (n === 0) return 'Zero';
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + amountToWords(n % 100) : '');
  if (n < 100000) return amountToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + amountToWords(n % 1000) : '');
  return amountToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + amountToWords(n % 100000) : '');
}

function buildAmountInWords(amount: number): string {
  const qar = Math.floor(amount);
  const dirhams = Math.round((amount - qar) * 100);
  let words = amountToWords(qar) + ' Qatari Riyals';
  if (dirhams > 0) words += ' and ' + amountToWords(dirhams) + ' Dirhams';
  else words += ' and Zero Dirhams';
  return words + ' Only';
}

const ReceiptDocument = ({ data }: { data: ReceiptData }) => {
  // Support both new itemised format and legacy simple format
  const isItemised = data.line_items && data.line_items.length > 0;
  const total = data.total_amount || data.amount || 0;
  const wordsText = data.amount_in_words || buildAmountInWords(total);

  if (!isItemised) {
    // Legacy simple layout
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.pageLabel}>Page 1 of 1</Text>
          <Text style={styles.headerTitle}>RECEIPT ACKNOWLEDGEMENT</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoLeft}>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Tenant Name</Text><Text style={styles.infoValue}>{data.tenant_name}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Property Name</Text><Text style={styles.infoValue}>{data.property_name || data.property_unit}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Lease No</Text><Text style={styles.infoValue}>{data.lease_no || data.receipt_no}</Text></View>
            </View>
            <View style={styles.infoRight}>
              <View style={styles.infoRow}><Text style={styles.infoRightLabel}>Payment Method</Text><Text style={styles.infoRightValue}>{data.payment_method}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoRightLabel}>Amount</Text><Text style={styles.infoRightValue}>QR {total.toLocaleString()}</Text></View>
            </View>
          </View>
          <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f5f5f5', flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Text style={{ fontSize: 10, marginRight: 10, fontFamily: 'Helvetica-Bold' }}>Total Amount Received:</Text>
            <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold' }}>QR {total.toLocaleString()}</Text>
          </View>
          <Text style={{ position: 'absolute', bottom: 30, left: 35, right: 35, textAlign: 'center', fontSize: 8, color: '#888' }}>
            This is an electronically generated receipt and does not require a physical signature.
          </Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageLabel}>Page 1 of 1</Text>

        {/* ── Title ── */}
        <Text style={styles.headerTitle}>RECEIPT ACKNOWLEDGEMENT</Text>

        {/* ── PO Box / Phone / Ack No ── */}
        <View style={styles.headerRow}>
          <View>
            {data.po_box && <Text style={styles.poBox}>PO Box No.: {data.po_box}</Text>}
            {data.phone && <Text style={styles.poBox}>Phone No.: {data.phone}</Text>}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.ackLabel}>ACKNOWLEDGEMENT NO.</Text>
            <Text style={styles.ackNo}>{data.acknowledgement_no || data.receipt_no}</Text>
          </View>
        </View>

        {/* ── Info Grid ── */}
        <View style={styles.infoGrid}>
          <View style={styles.infoLeft}>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Tenant Name</Text><Text style={styles.infoValue}>{data.tenant_name}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Property Name</Text><Text style={styles.infoValue}>{data.property_name}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Lease No</Text><Text style={styles.infoValue}>{data.lease_no}</Text></View>
            {data.location_code && <View style={styles.infoRow}><Text style={styles.infoLabel}>Location code</Text><Text style={styles.infoValue}>{data.location_code}</Text></View>}
          </View>
          <View style={styles.infoRight}>
            <View style={styles.infoRow}><Text style={styles.infoRightLabel}>Collection Date</Text><Text style={styles.infoRightValue}>{data.collection_date}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoRightLabel}>Lease Start Date</Text><Text style={styles.infoRightValue}>{data.lease_start_date}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoRightLabel}>Lease End Date</Text><Text style={styles.infoRightValue}>{data.lease_end_date}</Text></View>
          </View>
        </View>

        {/* ── Table Header ── */}
        <View style={styles.tableHeader}>
          <Text style={[styles.cellSNo, styles.headerText]}>S.No</Text>
          <Text style={[styles.cellDesc, styles.headerText]}>Description</Text>
          <Text style={[styles.cellCheque, styles.headerText]}>Check No/Cash Ref.</Text>
          <Text style={[styles.cellMat, styles.headerText]}>Maturity Date</Text>
          <Text style={[styles.cellType, styles.headerText]}>Type</Text>
          <Text style={[styles.cellStart, styles.headerText]}>Check Start Date</Text>
          <Text style={[styles.cellEnd, styles.headerText]}>Check End Date</Text>
          <Text style={[styles.cellBank, styles.headerText]}>Bank Name</Text>
          <Text style={[styles.cellAmt, styles.headerText]}>Amount</Text>
        </View>

        {/* ── Table Rows ── */}
        {data.line_items.map((item, idx) => (
          <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={[styles.cellSNo, styles.cellText]}>{item.sNo}</Text>
            <Text style={[styles.cellDesc, styles.cellText]}>{item.description}</Text>
            <Text style={[styles.cellCheque, styles.cellText]}>{item.chequeRef}</Text>
            <Text style={[styles.cellMat, styles.cellText]}>{item.maturityDate}</Text>
            <Text style={[styles.cellType, styles.cellText]}>{item.type}</Text>
            <Text style={[styles.cellStart, styles.cellText]}>{item.checkStartDate || ''}</Text>
            <Text style={[styles.cellEnd, styles.cellText]}>{item.checkEndDate || ''}</Text>
            <Text style={[styles.cellBank, styles.cellText]}>{item.bankName || ''}</Text>
            <Text style={[styles.cellAmt, styles.cellTextR]}>{item.amount.toLocaleString('en-QA', { minimumFractionDigits: 2 })}</Text>
          </View>
        ))}

        {/* ── Total Row ── */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmt}>{total.toLocaleString('en-QA', { minimumFractionDigits: 2 })}</Text>
        </View>

        {/* ── Amount in Words ── */}
        <View style={styles.wordsRow}>
          <Text style={styles.wordsLabel}>AMOUNT IN WORDS</Text>
          <Text style={styles.wordsValue}>{wordsText}</Text>
        </View>

        {/* ── Remarks ── */}
        <View style={styles.remarksRow}>
          <Text style={styles.remarksLabel}>REMARKS</Text>
          <View style={styles.remarksBox}><Text>{data.remarks || ''}</Text></View>
        </View>

        {/* ── Signatures ── */}
        <View style={styles.sigRow}>
          <Text style={styles.sigBlock}>PREPARED BY</Text>
          <Text style={styles.sigBlock}>APPROVED BY</Text>
          <Text style={styles.sigBlock}>RECEIVED BY</Text>
        </View>

        {data.prepared_by && (
          <Text style={styles.preparedBy}>{data.prepared_by}</Text>
        )}
      </Page>
    </Document>
  );
};

export const generateReceiptBlob = async (data: ReceiptData): Promise<Blob> => {
  const blob = await pdf(<ReceiptDocument data={data} />).toBlob();
  return blob;
};

// ── Helper: Build ARE-RT-25-3962-0 receipt for Vivek Viswakumaran Nair ──────
export const VIVEK_RECEIPT_DATA: ReceiptData = {
  receipt_no: 'ARE-RT-25-3962-0',
  acknowledgement_no: 'ARE-RT-25-3962-0',
  po_box: '9012',
  phone: '44485111',
  tenant_name: 'Vivek Viswakumaran Nair',
  property_name: 'Regency Residence Al Sadd 1',
  lease_no: 'ARRS01-LES-25-52-0',
  location_code: 'ARRS01-B00-F00-AG01',
  collection_date: '23-DEC-25',
  lease_start_date: '01-JAN-26',
  lease_end_date: '31-DEC-26',
  total_amount: 52000,
  amount_in_words: 'Fifty Two Thousand Qatari Riyals and Zero Dirhams Only',
  remarks: 'NEW',
  prepared_by: 'Ms. MerricSuibai Murla',
  line_items: [
    { sNo: 1,  description: 'Security Deposit', chequeRef: '25631298',  maturityDate: '23-DEC-25', type: 'Cash',  checkStartDate: '',           checkEndDate: '',           bankName: '',    amount: 1000 },
    { sNo: 2,  description: 'Security Deposit', chequeRef: '01000069',  maturityDate: '05-JAN-26', type: 'PDC',   checkStartDate: '',           checkEndDate: '',           bankName: 'CBQ', amount: 1500 },
    { sNo: 3,  description: 'Security Deposit', chequeRef: '01000070',  maturityDate: '05-FEB-26', type: 'PDC',   checkStartDate: '',           checkEndDate: '',           bankName: 'CBQ', amount: 1500 },
    { sNo: 4,  description: 'Rent',             chequeRef: '01000049',  maturityDate: '05-JAN-26', type: 'PDC',   checkStartDate: '01-JAN-26', checkEndDate: '31-JAN-26', bankName: 'CBQ', amount: 4000 },
    { sNo: 5,  description: 'Rent',             chequeRef: '01000050',  maturityDate: '05-FEB-26', type: 'PDC',   checkStartDate: '01-FEB-26', checkEndDate: '28-FEB-26', bankName: 'CBQ', amount: 4000 },
    { sNo: 6,  description: 'Rent',             chequeRef: '01000059',  maturityDate: '05-MAR-26', type: 'PDC',   checkStartDate: '01-MAR-26', checkEndDate: '31-MAR-26', bankName: 'CBQ', amount: 4000 },
    { sNo: 7,  description: 'Rent',             chequeRef: '01000060',  maturityDate: '05-APR-26', type: 'PDC',   checkStartDate: '01-APR-26', checkEndDate: '30-APR-26', bankName: 'CBQ', amount: 4000 },
    { sNo: 8,  description: 'Rent',             chequeRef: '01000061',  maturityDate: '05-MAY-26', type: 'PDC',   checkStartDate: '01-MAY-26', checkEndDate: '31-MAY-26', bankName: 'CBQ', amount: 4000 },
    { sNo: 9,  description: 'Rent',             chequeRef: '01000062',  maturityDate: '05-JUN-26', type: 'PDC',   checkStartDate: '01-JUN-26', checkEndDate: '30-JUN-26', bankName: 'CBQ', amount: 4000 },
    { sNo: 10, description: 'Rent',             chequeRef: '01000063',  maturityDate: '05-JUL-26', type: 'PDC',   checkStartDate: '01-JUL-26', checkEndDate: '31-JUL-26', bankName: 'CBQ', amount: 4000 },
    { sNo: 11, description: 'Rent',             chequeRef: '01000064',  maturityDate: '05-AUG-26', type: 'PDC',   checkStartDate: '01-AUG-26', checkEndDate: '31-AUG-26', bankName: 'CBQ', amount: 4000 },
    { sNo: 12, description: 'Rent',             chequeRef: '01000065',  maturityDate: '05-SEP-26', type: 'PDC',   checkStartDate: '01-SEP-26', checkEndDate: '30-SEP-26', bankName: 'CBQ', amount: 4000 },
    { sNo: 13, description: 'Rent',             chequeRef: '01000066',  maturityDate: '05-OCT-26', type: 'PDC',   checkStartDate: '01-OCT-26', checkEndDate: '31-OCT-26', bankName: 'CBQ', amount: 4000 },
    { sNo: 14, description: 'Rent',             chequeRef: '01000067',  maturityDate: '05-NOV-26', type: 'PDC',   checkStartDate: '01-NOV-26', checkEndDate: '30-NOV-26', bankName: 'CBQ', amount: 4000 },
    { sNo: 15, description: 'Rent',             chequeRef: '01000068',  maturityDate: '05-DEC-26', type: 'PDC',   checkStartDate: '01-DEC-26', checkEndDate: '31-DEC-26', bankName: 'CBQ', amount: 4000 },
  ],
};
