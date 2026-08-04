import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica', color: '#111' },
  header: { textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#444', marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 12, marginBottom: 4 },
  paragraph: { marginBottom: 8, lineHeight: 1.4 },
  bold: { fontFamily: 'Helvetica-Bold' },
  item: { marginLeft: 10, marginBottom: 4 },
  note: { fontSize: 9, color: '#444', marginTop: 12, borderTopWidth: 0.5, borderTopColor: '#ddd', paddingTop: 8 },
  signatureRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  signatureBlock: { width: '45%', borderTopWidth: 0.5, borderTopColor: '#444', paddingTop: 6, fontSize: 10, textAlign: 'center' },
});

export interface LeaseAgreementData {
  tenantName: string;
  landlordName: string;
  propertyAddress: string;
  unit?: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  depositNonRefundable: string;
  leaseNo: string;
}

function formatMoney(amount: number) {
  return `QR ${amount.toLocaleString('en-QA', { minimumFractionDigits: 2 })}`;
}

function LeaseAgreementDocument({ data }: { data: LeaseAgreementData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.title}>RESIDENTIAL LEASE AGREEMENT</Text>
          <Text style={styles.subtitle}>(Single-Family House)</Text>
        </View>

        <Text style={styles.paragraph}>
          This Residential Rental Agreement ("Agreement") is entered into by and between the Landlord ({data.landlordName}) and the Tenant ({data.tenantName}).
          The Parties agree that the lease shall be effective as of the date executed by Landlord, as set forth below.
        </Text>

        <Text style={styles.sectionTitle}>IMPORTANT DISCLAIMER</Text>
        <Text style={styles.paragraph}>
          Vertex42.com is not a law firm and does not provide legal advice or legal representation. The residential rental agreement template, instructions and related information ("Legal Information")
          provided herein may not be appropriate for your specific situation, may not be suitable for use in some jurisdictions, and should be reviewed, and modified if necessary,
          by a licensed attorney prior to being used as a legal contract. Vertex42 makes no representation or warranty whatsoever regarding the Legal Information, and your use of the Legal Information
          is solely at your own risk. By using the Legal Information, you release Vertex42 from all claims, losses or damages arising out of such use, and you agree that Vertex42's liability,
          if any, shall be limited as set forth in the Terms of Use.
        </Text>

        <Text style={styles.sectionTitle}>Section 1: PREMISES</Text>
        <Text style={styles.paragraph}>
          Insert the full street address of the house including city, state and zip code.
          Premises: {data.propertyAddress} {data.unit ? `- Unit ${data.unit}` : ''}
        </Text>

        <Text style={styles.sectionTitle}>Section 2: TERM</Text>
        <Text style={styles.paragraph}>
          This lease agreement template provides for a one year term, which is the most common, however the term can be longer or shorter as agreed upon by the parties.
          In the first blank, insert the date on which the rental term will begin. This is the date on which the tenant can take possession and begin to occupy the premises,
          and the date on which rent will commence. Ideally, the term will begin on the first day of a calendar month (this approach makes the accounting and record keeping easier),
          but it doesn't need to. In the second blank, insert the date on which the rental term will expire. For a one year term, this will be the day before the anniversary of the start date.
        </Text>
        <Text style={styles.item}>Term begins on: {data.startDate}</Text>
        <Text style={styles.item}>Term ends on: {data.endDate}</Text>

        <Text style={styles.sectionTitle}>Section 3: MONTHLY RENT</Text>
        <Text style={styles.paragraph}>
          Insert the amount of the monthly rent to be paid by tenant to landlord. The rent does not include the cost of utilities, which are separately paid for by tenant,
          as set forth in Section 4.
        </Text>
        <Text style={styles.item}>Monthly Rent: {formatMoney(data.monthlyRent)}</Text>

        <Text style={styles.sectionTitle}>Section 5: HOUSE RULES</Text>
        <Text style={styles.paragraph}>
          In addition to the rules set forth in this section, the landlord may wish to provide a more detailed list of house rules and regulations to the tenant.
          If so, the landlord should provide a copy of the rules and regulations to the tenant prior to the parties signing the rental agreement.
        </Text>

        <Text style={styles.sectionTitle}>Section 6: ORDINANCES AND STATUTES; CC&amp;RS; SUBORDINATE; LEAD PAINT</Text>
        <Text style={styles.paragraph}>
          If the house is subject to any Covenants, Conditions and Restrictions (CC&amp;Rs), HOA agreements, or other similar instruments, copies of such documents should be given to tenant prior to the parties signing the rental agreement.
          If the house was built before 1978, the Lead-Based Paint Disclosure and Pamphlet (available at www.epa.gov) should be given to tenant prior to the parties signing the rental agreement.
          If the house was built in 1978 or later, the second paragraph of Section 6 can be deleted from the rental agreement.
        </Text>

        <Text style={styles.sectionTitle}>Section 7: MAINTENANCE AND REPAIRS</Text>
        <Text style={styles.paragraph}>
          If the landlord owns personal property (furniture, appliances, decorations, etc.) that is located at the premises and available for tenant's use,
          the landlord should keep a record of that personal property, so there is no question about it when the term expires. Such items can be listed in the blank provided in this section,
          or can be listed in a separate document that is attached to the rental agreement as Exhibit A. If an exhibit is used, insert the following into the blank:
          "see list of landlord's personal property attached hereto as Exhibit A".
          It might also be a good idea to take pictures and/or video of such personal property prior to delivering possession of the premises to tenant.
        </Text>

        <Text style={styles.sectionTitle}>Section 9: DEPOSIT</Text>
        <Text style={styles.paragraph}>
          In the first blank, insert the amount of the security deposit. Often this amount is equal to one month's rent, however the parties may choose to agree on any amount.
          In the second blank, insert the portion (if any) of the security deposit that will not be refundable at the end of the term. For example, the landlord may have a policy of having the carpets professionally cleaned after each tenant,
          and in that case the landlord may state that {data.depositNonRefundable} of the security deposit will be non-refundable. Of course, the landlord has the right to utilize the entire deposit,
          if necessary, toward unpaid rent or the cost of repairing any damage to the premises caused by tenant, as set forth in more detail in this section of the agreement.
        </Text>
        <Text style={styles.item}>Security Deposit: {formatMoney(data.securityDeposit)}</Text>
        <Text style={styles.item}>Non-refundable portion: {data.depositNonRefundable}</Text>

        <Text style={styles.sectionTitle}>SECTION 10: SIGNATURE BLOCKS</Text>
        <Text style={styles.paragraph}>
          Insert the names of landlord and tenant (if there are two or more tenants, insert the names of each of them) and have each person sign and date the agreement.
        </Text>

        <View style={styles.signatureRow}>
          <Text style={styles.signatureBlock}>Landlord Signature</Text>
          <Text style={styles.signatureBlock}>Tenant Signature</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateLeaseAgreementBlob(data: LeaseAgreementData): Promise<Blob> {
  const blob = await pdf(<LeaseAgreementDocument data={data} />).toBlob();
  return blob;
}
