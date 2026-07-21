import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  companyInfo: {
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    color: '#666',
    width: 150,
  },
  value: {
    fontWeight: 'bold',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  amountBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 2,
    borderTopColor: '#333',
  },
  amountLabel: {
    fontSize: 14,
    marginRight: 20,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#999',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  }
});

interface ReceiptData {
  receipt_no: string;
  receipt_date: string;
  tenant_name: string;
  property_unit: string;
  payment_type: string;
  payment_method: string;
  transaction_reference?: string;
  amount: number;
  collection_period?: string;
}

const ReceiptDocument = ({ data }: { data: ReceiptData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Official Receipt</Text>
          <Text style={{ marginTop: 5, color: '#666' }}>Receipt No: {data.receipt_no}</Text>
        </View>
        <View style={styles.companyInfo}>
          <Text style={{ fontWeight: 'bold' }}>One Platform</Text>
          <Text>123 Property Ave, Riyadh</Text>
          <Text>Saudi Arabia</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{new Date(data.receipt_date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Received From:</Text>
        <Text style={styles.value}>{data.tenant_name}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>For Property / Unit:</Text>
        <Text style={styles.value}>{data.property_unit}</Text>
      </View>

      <Text style={styles.sectionTitle}>Payment Details</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Payment Type:</Text>
        <Text style={styles.value}>{data.payment_type}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Payment Method:</Text>
        <Text style={styles.value}>{data.payment_method}</Text>
      </View>
      {data.transaction_reference && (
        <View style={styles.row}>
          <Text style={styles.label}>Transaction Ref:</Text>
          <Text style={styles.value}>{data.transaction_reference}</Text>
        </View>
      )}
      {data.collection_period && (
        <View style={styles.row}>
          <Text style={styles.label}>Period:</Text>
          <Text style={styles.value}>{data.collection_period}</Text>
        </View>
      )}

      <View style={styles.amountBox}>
        <Text style={styles.amountLabel}>Total Amount Received:</Text>
        <Text style={styles.amountValue}>QR {data.amount.toLocaleString()}</Text>
      </View>

      <Text style={styles.footer}>
        This is an electronically generated receipt and does not require a physical signature.
      </Text>
    </Page>
  </Document>
);

export const generateReceiptBlob = async (data: ReceiptData): Promise<Blob> => {
  const blob = await pdf(<ReceiptDocument data={data} />).toBlob();
  return blob;
};
