import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';
import { getDocumentBranding, type DocumentBranding } from '@/lib/document-branding';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 8.5, fontFamily: 'Helvetica', color: '#111' },
  center: { textAlign: 'center' },
  bold: { fontFamily: 'Helvetica-Bold' },
  pageLabel: { textAlign: 'right', fontSize: 7, color: '#777', marginBottom: 3 },

  /* ── Banner & Header ── */
  bannerContainer: { width: '100%', marginBottom: 10, alignItems: 'center' },
  bannerImage: { width: '100%', height: 75, objectFit: 'cover', borderRadius: 2 },
  
  orgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#0f766e', paddingBottom: 6, marginBottom: 8 },
  orgName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#0f766e' },
  orgSubtitle: { fontSize: 7.5, color: '#555', marginTop: 1 },
  orgRight: { alignItems: 'flex-end' },
  orgContact: { fontSize: 7, color: '#666' },

  headerTitleContainer: { alignItems: 'center', marginVertical: 6 },
  headerTitle: { textAlign: 'center', fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#111', textDecoration: 'underline', letterSpacing: 0.5 },
  headerSubtitle: { textAlign: 'center', fontSize: 7.5, color: '#555', marginTop: 2 },

  metaBar: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 5, borderRadius: 3, borderWidth: 0.5, borderColor: '#e2e8f0', marginBottom: 8 },
  metaItem: { flexDirection: 'row' },
  metaLabel: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#475569', marginRight: 4 },
  metaValue: { fontSize: 7.5, color: '#0f172a' },

  /* ── Info block ── */
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderWidth: 0.5, borderColor: '#cbd5e1', borderRadius: 3, padding: 6, backgroundColor: '#ffffff' },
  infoLeft: { flex: 1.3, paddingRight: 8 },
  infoRight: { flex: 1, paddingLeft: 8, borderLeftWidth: 0.5, borderLeftColor: '#e2e8f0' },
  infoRow: { flexDirection: 'row', marginBottom: 3.5, alignItems: 'flex-start' },
  infoLabel: { width: 85, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#334155' },
  infoValue: { flex: 1, fontSize: 7.5, color: '#0f172a' },
  infoRightLabel: { width: 85, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#334155' },
  infoRightValue: { flex: 1, fontSize: 7.5, color: '#0f172a' },

  /* ── Table (PDC / Itemized Collection Only - No General Ledgers) ── */
  tableHeader: { flexDirection: 'row', backgroundColor: '#0f766e', paddingVertical: 4.5, borderWidth: 0.5, borderColor: '#0f766e', borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  tableRow: { flexDirection: 'row', borderLeftWidth: 0.5, borderRightWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#cbd5e1', minHeight: 18, alignItems: 'center' },
  tableRowAlt: { backgroundColor: '#f8fafc' },

  cellSNo:    { width: 22,  paddingHorizontal: 2, textAlign: 'center' },
  cellDesc:   { width: 95,  paddingHorizontal: 3 },
  cellCheque: { width: 75,  paddingHorizontal: 3 },
  cellMat:    { width: 62,  paddingHorizontal: 3 },
  cellType:   { width: 42,  paddingHorizontal: 3, textAlign: 'center' },
  cellPeriod: { width: 110, paddingHorizontal: 3 },
  cellBank:   { width: 48,  paddingHorizontal: 3 },
  cellAmt:    { flex: 1,    paddingHorizontal: 4, textAlign: 'right' },

  headerText: { color: '#ffffff', fontFamily: 'Helvetica-Bold', fontSize: 7 },
  cellText:   { fontSize: 7, color: '#1e293b' },
  cellTextR:  { fontSize: 7, fontFamily: 'Helvetica-Bold', textAlign: 'right', color: '#0f172a' },

  /* ── Total row ── */
  totalRow: { flexDirection: 'row', borderLeftWidth: 0.5, borderRightWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#cbd5e1', backgroundColor: '#f1f5f9', minHeight: 19, alignItems: 'center' },
  totalLabel: { flex: 1, paddingHorizontal: 4, fontSize: 7.5, fontFamily: 'Helvetica-Bold', textAlign: 'right', color: '#334155' },
  totalAmt:   { width: 75, paddingHorizontal: 4, fontSize: 8.5, fontFamily: 'Helvetica-Bold', textAlign: 'right', color: '#0f766e' },

  /* ── Footer / Summary ── */
  wordsRow: { flexDirection: 'row', marginTop: 8, marginBottom: 5, padding: 5, backgroundColor: '#f8fafc', borderWidth: 0.5, borderColor: '#e2e8f0', borderRadius: 2 },
  wordsLabel: { width: 95, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#334155' },
  wordsValue: { flex: 1, fontSize: 7.5, color: '#0f766e', fontStyle: 'italic', fontFamily: 'Helvetica-Bold' },

  remarksRow: { flexDirection: 'row', marginBottom: 5 },
  remarksLabel: { width: 95, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#334155' },
  remarksBox: { flex: 1, borderWidth: 0.5, borderColor: '#cbd5e1', borderRadius: 2, minHeight: 22, padding: 3, fontSize: 7, color: '#334155' },

  termsText: { fontSize: 6.5, color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: 6, marginBottom: 4 },

  sigRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, paddingTop: 6 },
  sigBlock: { width: '28%', borderTopWidth: 0.8, borderTopColor: '#94a3b8', paddingTop: 4, alignItems: 'center' },
  sigTitle: { fontSize: 7.5, textAlign: 'center', fontFamily: 'Helvetica-Bold', color: '#334155' },
  sigSub: { fontSize: 6.5, textAlign: 'center', color: '#64748b', marginTop: 1 },
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
  /* Items (PDCs, Security Deposit, Direct Payments ONLY - No Accounting Ledger codes) */
  line_items: ReceiptLineItem[];
  /* Total */
  total_amount: number;
  amount_in_words: string;
  /* Remarks */
  remarks?: string;
  prepared_by?: string;
  /* Legacy simple fields */
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
  const branding: DocumentBranding = getDocumentBranding();
  const ackSub = branding.submodules?.acknowledgementReceipt;
  const bannerUrl = ackSub?.bannerImageUrl || branding.headerImageUrl;
  const showBanner = ackSub?.showBanner !== false && Boolean(bannerUrl);

  const total = data.total_amount || data.amount || 0;
  const wordsText = data.amount_in_words || buildAmountInWords(total);

  // Filter out any internal accounting journal / ledger entries from display
  const displayItems = (data.line_items || []).filter(item => {
    const desc = (item.description || '').toLowerCase();
    const isLedgerCode = desc.includes('gl ') || desc.includes('dr ') || desc.includes('cr ') || desc.includes('liability') || desc.includes('sub-ledger');
    return !isLedgerCode;
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageLabel}>Page 1 of 1</Text>

        {/* ── Optional Branding Banner Image ── */}
        {showBanner && bannerUrl && (
          <View style={styles.bannerContainer}>
            {/* @ts-ignore */}
            <Image src={bannerUrl} style={styles.bannerImage} />
          </View>
        )}

        {/* ── Organization Header as per branding ── */}
        <View style={styles.orgHeader}>
          <View>
            <Text style={styles.orgName}>{branding.companyName || 'Al Ameen Real Estate'}</Text>
            <Text style={styles.orgSubtitle}>{branding.legalEntityName || 'Al Ameen Real Estate W.L.L'} • CR: {branding.crNumber || 'CR-90821-QA'}</Text>
            <Text style={styles.orgSubtitle}>{branding.address || 'Grand Hamad Avenue, Building 42, Floor 7, Doha, State of Qatar'}</Text>
          </View>
          <View style={styles.orgRight}>
            <Text style={styles.orgContact}>Tel: {branding.phone || '+974 4499 1234'}</Text>
            <Text style={styles.orgContact}>Email: {branding.email || 'contact@alameen.qa'}</Text>
            <Text style={styles.orgContact}>Web: {branding.website || 'www.alameen.qa'}</Text>
          </View>
        </View>

        {/* ── Header Title & Subtitle ── */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{ackSub?.documentTitle || 'RECEIPT ACKNOWLEDGEMENT'}</Text>
          <Text style={styles.headerSubtitle}>{ackSub?.documentSubtitle || 'Official Transaction & Security Booking Acknowledgment'}</Text>
        </View>

        {/* ── Meta Bar ── */}
        <View style={styles.metaBar}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>ACKNOWLEDGEMENT NO:</Text>
            <Text style={styles.metaValue}>{data.acknowledgement_no || data.receipt_no}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>COLLECTION DATE:</Text>
            <Text style={styles.metaValue}>{data.collection_date}</Text>
          </View>
        </View>

        {/* ── Info Grid ── */}
        <View style={styles.infoGrid}>
          <View style={styles.infoLeft}>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Tenant Name:</Text><Text style={styles.infoValue}>{data.tenant_name}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Property Name:</Text><Text style={styles.infoValue}>{data.property_name}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Unit / Flat:</Text><Text style={styles.infoValue}>{data.location_code || '—'}</Text></View>
          </View>
          <View style={styles.infoRight}>
            <View style={styles.infoRow}><Text style={styles.infoRightLabel}>Lease Ref #:</Text><Text style={styles.infoRightValue}>{data.lease_no}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoRightLabel}>Lease Start Date:</Text><Text style={styles.infoRightValue}>{data.lease_start_date}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoRightLabel}>Lease End Date:</Text><Text style={styles.infoRightValue}>{data.lease_end_date}</Text></View>
          </View>
        </View>

        {/* ── Table Header ── */}
        <View style={styles.tableHeader}>
          <Text style={[styles.cellSNo, styles.headerText]}>#</Text>
          <Text style={[styles.cellDesc, styles.headerText]}>Description</Text>
          <Text style={[styles.cellCheque, styles.headerText]}>Cheque / Ref No.</Text>
          <Text style={[styles.cellMat, styles.headerText]}>Maturity Date</Text>
          <Text style={[styles.cellType, styles.headerText]}>Type</Text>
          <Text style={[styles.cellPeriod, styles.headerText]}>Period Covered</Text>
          <Text style={[styles.cellBank, styles.headerText]}>Bank</Text>
          <Text style={[styles.cellAmt, styles.headerText]}>Amount (QAR)</Text>
        </View>

        {/* ── Table Rows ── */}
        {displayItems.length === 0 ? (
          <View style={[styles.tableRow, { justifyContent: 'center' }]}>
            <Text style={[styles.cellText, { textAlign: 'center', padding: 4 }]}>Total payment received and acknowledged.</Text>
          </View>
        ) : (
          displayItems.map((item, idx) => {
            const periodStr = item.checkStartDate && item.checkEndDate
              ? `${item.checkStartDate} to ${item.checkEndDate}`
              : item.checkStartDate || item.checkEndDate || '—';
            return (
              <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
                <Text style={[styles.cellSNo, styles.cellText]}>{item.sNo || idx + 1}</Text>
                <Text style={[styles.cellDesc, styles.cellText]}>{item.description}</Text>
                <Text style={[styles.cellCheque, styles.cellText]}>{item.chequeRef}</Text>
                <Text style={[styles.cellMat, styles.cellText]}>{item.maturityDate}</Text>
                <Text style={[styles.cellType, styles.cellText]}>{item.type}</Text>
                <Text style={[styles.cellPeriod, styles.cellText]}>{periodStr}</Text>
                <Text style={[styles.cellBank, styles.cellText]}>{item.bankName || '—'}</Text>
                <Text style={[styles.cellAmt, styles.cellTextR]}>{item.amount.toLocaleString('en-QA', { minimumFractionDigits: 2 })}</Text>
              </View>
            );
          })
        )}

        {/* ── Total Row ── */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Acknowledged Collection (QAR):</Text>
          <Text style={styles.totalAmt}>{total.toLocaleString('en-QA', { minimumFractionDigits: 2 })}</Text>
        </View>

        {/* ── Amount in Words ── */}
        <View style={styles.wordsRow}>
          <Text style={styles.wordsLabel}>AMOUNT IN WORDS:</Text>
          <Text style={styles.wordsValue}>{wordsText}</Text>
        </View>

        {/* ── Remarks ── */}
        {data.remarks && (
          <View style={styles.remarksRow}>
            <Text style={styles.remarksLabel}>REMARKS / NOTES:</Text>
            <View style={styles.remarksBox}><Text>{data.remarks}</Text></View>
          </View>
        )}

        {/* ── Terms / Disclaimer ── */}
        <Text style={styles.termsText}>
          {ackSub?.termsAndConditions || 'This receipt is electronically generated and acknowledged. Valid subject to realization of cheque / payment.'}
        </Text>

        {/* ── Signatures ── */}
        <View style={styles.sigRow}>
          <View style={styles.sigBlock}>
            <Text style={styles.sigTitle}>PREPARED BY</Text>
            <Text style={styles.sigSub}>{data.prepared_by || 'Finance Cashier'}</Text>
          </View>
          <View style={styles.sigBlock}>
            <Text style={styles.sigTitle}>AUTHORIZED SIGNATORY</Text>
            <Text style={styles.sigSub}>{branding.authorizedSignatoryName || 'Jithin Abdul Latheef'} ({branding.authorizedSignatoryTitle || 'General Manager'})</Text>
          </View>
          <View style={styles.sigBlock}>
            <Text style={styles.sigTitle}>TENANT ACKNOWLEDGEMENT</Text>
            <Text style={styles.sigSub}>Received duplicate copy</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export const generateReceiptBlob = async (data: ReceiptData): Promise<Blob> => {
  const blob = await pdf(<ReceiptDocument data={data} />).toBlob();
  return blob;
};
