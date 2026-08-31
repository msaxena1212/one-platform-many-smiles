import React, { useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, Building, User, CreditCard, FileText, ShieldCheck } from 'lucide-react';
import { generateReceiptBlob, type ReceiptData, type ReceiptLineItem } from './receipt-template';

export interface TenantReceiptDetails {
  receiptNo: string;
  acknowledgementNo?: string;
  date: string;
  tenantName: string;
  tenantPhone?: string;
  tenantEmail?: string;
  tenantQid?: string;
  propertyName: string;
  unitRef: string;
  leaseNo?: string;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: number;
  totalContractRent: number;
  depositAmount: number;
  depositMode: string;
  pdcCount: number;
  pdcs: Array<{
    chequeNo: string;
    bank: string;
    date: string;
    amount: number;
    period?: string;
    tenureStart?: string;
    tenureEnd?: string;
  }>;
  vouchers?: Array<{
    receiptNo?: string;
    name: string;
    amount: number;
    method?: string;
    debit?: string;
    credit?: string;
  }>;
  agencyCommission?: number;
  adminCharges?: number;
  utilityDeposit?: number; // Kahramaa Deposit (21100003)
  qatarCoolDeposit?: number; // Qatar Cool Deposit (21100004)
  reservationDeposit?: number; // Reservation Advance (21100001)
  serviceFeeDeposit?: number; // Service Fee Deposit (21100005)
  guaranteeChequeDeposit?: number; // Guarantee Cheque Deposit (21100006)
  totalCollected: number;
  cashierName?: string;
  notes?: string;
}

interface ReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TenantReceiptDetails | null;
  secondaryData?: TenantReceiptDetails | null;
}

function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (num === 0) return 'Zero';
  function helper(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + helper(n % 100) : '');
    if (n < 1000000) return helper(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + helper(n % 1000) : '');
    return helper(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 ? ' ' + helper(n % 1000000) : '');
  }
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  let words = helper(integerPart) + ' Qatari Riyals';
  if (decimalPart > 0) {
    words += ' and ' + helper(decimalPart) + ' Dirhams';
  }
  return words + ' Only';
}

export function ReceiptModal({ open, onOpenChange, data, secondaryData }: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = React.useState<'primary' | 'secondary'>('primary');

  React.useEffect(() => {
    if (open) {
      setActiveTab('primary');
    }
  }, [open]);

  if (!data) return null;

  const currentData = (activeTab === 'secondary' && secondaryData) ? secondaryData : data;
  const totalWords = numberToWords(currentData.totalCollected);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const lineItems: ReceiptLineItem[] = [];
    let sNo = 1;

    // Add deposit
    if (currentData.depositAmount > 0 && currentData.depositMode !== 'N/A') {
      lineItems.push({
        sNo: sNo++,
        description: currentData.depositMode || 'Security Deposit',
        chequeRef: currentData.receiptNo,
        maturityDate: currentData.leaseStartDate,
        type: 'Cash',
        amount: currentData.depositAmount,
        bankName: 'Operating Bank',
      });
    }

    // Add vouchers if present
    (currentData.vouchers || []).forEach((v) => {
      lineItems.push({
        sNo: sNo++,
        description: v.name,
        chequeRef: v.receiptNo || currentData.receiptNo,
        maturityDate: currentData.date,
        type: (v.method as any) || 'Cash',
        amount: v.amount,
        bankName: v.debit || 'Bank',
      });
    });

    // Add PDCs
    (currentData.pdcs || []).forEach((pdc) => {
      lineItems.push({
        sNo: sNo++,
        description: `Rent PDC - ${pdc.period || `Cheque ${sNo - 1}`}`,
        chequeRef: pdc.chequeNo,
        maturityDate: pdc.date,
        type: 'PDC',
        checkStartDate: pdc.tenureStart,
        checkEndDate: pdc.tenureEnd,
        bankName: pdc.bank,
        amount: pdc.amount,
      });
    });

    // Add extra fees
    if (currentData.agencyCommission && currentData.agencyCommission > 0) {
      lineItems.push({
        sNo: sNo++,
        description: 'Agency Commission',
        chequeRef: 'RV-AGENCY',
        maturityDate: currentData.date,
        type: 'Cash',
        amount: currentData.agencyCommission,
      });
    }
    if (currentData.adminCharges && currentData.adminCharges > 0) {
      lineItems.push({
        sNo: sNo++,
        description: 'Administrative Charges',
        chequeRef: 'RV-ADMIN',
        maturityDate: currentData.date,
        type: 'Cash',
        amount: currentData.adminCharges,
      });
    }
    if (currentData.utilityDeposit && currentData.utilityDeposit > 0) {
      lineItems.push({
        sNo: sNo++,
        description: 'Kahramaa Utility Deposit (GL 21100)',
        chequeRef: 'RV-KAHRAMAA',
        maturityDate: currentData.date,
        type: 'Cash',
        amount: currentData.utilityDeposit,
      });
    }
    if (currentData.qatarCoolDeposit && currentData.qatarCoolDeposit > 0) {
      lineItems.push({
        sNo: sNo++,
        description: 'Qatar Cool Deposit (GL 21100)',
        chequeRef: 'RV-QCOOL',
        maturityDate: currentData.date,
        type: 'Cash',
        amount: currentData.qatarCoolDeposit,
      });
    }
    if (currentData.reservationDeposit && currentData.reservationDeposit > 0) {
      lineItems.push({
        sNo: sNo++,
        description: 'Reservation Advance Deposit (GL 21100)',
        chequeRef: 'RV-RESERVE',
        maturityDate: currentData.date,
        type: 'Cash',
        amount: currentData.reservationDeposit,
      });
    }
    if (currentData.serviceFeeDeposit && currentData.serviceFeeDeposit > 0) {
      lineItems.push({
        sNo: sNo++,
        description: 'Service Fee / Key Deposit (GL 21100)',
        chequeRef: 'RV-SVCFEE',
        maturityDate: currentData.date,
        type: 'Cash',
        amount: currentData.serviceFeeDeposit,
      });
    }
    if (currentData.guaranteeChequeDeposit && currentData.guaranteeChequeDeposit > 0) {
      lineItems.push({
        sNo: sNo++,
        description: 'Guarantee Cheque Security (GL 21100)',
        chequeRef: 'RV-GNTCHQ',
        maturityDate: currentData.date,
        type: 'Cheque',
        amount: currentData.guaranteeChequeDeposit,
      });
    }

    const receiptPayload: ReceiptData = {
      receipt_no: currentData.receiptNo,
      acknowledgement_no: currentData.acknowledgementNo || currentData.receiptNo,
      tenant_name: currentData.tenantName,
      property_name: currentData.propertyName,
      lease_no: currentData.leaseNo || `LES-${currentData.unitRef}`,
      location_code: currentData.unitRef,
      collection_date: currentData.date,
      lease_start_date: currentData.leaseStartDate,
      lease_end_date: currentData.leaseEndDate,
      line_items: lineItems,
      total_amount: currentData.totalCollected,
      amount_in_words: totalWords,
      prepared_by: currentData.cashierName || 'Finance Cashier',
      remarks: currentData.notes || 'Official payment acknowledgment.',
    };

    try {
      const blob = await generateReceiptBlob(receiptPayload);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Official_Receipt_${currentData.receiptNo}_${currentData.tenantName.replace(/\W/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error generating PDF receipt.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 border-0 bg-transparent shadow-2xl">
        <div ref={printRef} className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 p-6 md:p-8 rounded-xl border shadow-md space-y-6">
          {secondaryData && (
            <div className="bg-muted/70 p-2.5 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-purple-600 shrink-0" />
                Settlement Receipts (2 Generated):
              </span>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('primary')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeTab === 'primary'
                      ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-500'
                      : 'bg-background hover:bg-muted text-foreground border'
                  }`}
                >
                  🧾 Receipt 1: Collection (QR {data.totalCollected.toLocaleString()})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('secondary')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeTab === 'secondary'
                      ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-500'
                      : 'bg-background hover:bg-muted text-foreground border'
                  }`}
                >
                  💳 Receipt 2: Refund (QR {secondaryData.totalCollected.toLocaleString()})
                </button>
              </div>
            </div>
          )}

          <div className="border-b pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold tracking-tight text-primary">ZYNO PROPERTY MANAGEMENT</h2>
              </div>
              <p className="text-xs text-muted-foreground">Leasing Operations & Treasury Division • State of Qatar</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-xs font-mono px-3 py-1 bg-primary/10 border-primary text-primary font-bold">
                {activeTab === 'secondary' && secondaryData ? 'PAYMENT / REFUND VOUCHER' : 'OFFICIAL PAYMENT RECEIPT'}
              </Badge>
              <p className="text-xs font-mono mt-1 text-muted-foreground">No: <strong className="text-foreground">{currentData.receiptNo}</strong></p>
              <p className="text-xs text-muted-foreground">Date: {currentData.date}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-primary font-semibold">
                <User className="h-3.5 w-3.5" />
                <span>Tenant Particulars</span>
              </div>
              <p className="text-sm font-bold text-foreground">{currentData.tenantName}</p>
              {currentData.tenantQid && <p className="text-muted-foreground">QID / CR No: <span className="font-mono text-foreground">{currentData.tenantQid}</span></p>}
              {currentData.tenantPhone && <p className="text-muted-foreground">Phone: <span className="text-foreground">{currentData.tenantPhone}</span></p>}
              {currentData.tenantEmail && <p className="text-muted-foreground">Email: <span className="text-foreground">{currentData.tenantEmail}</span></p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-primary font-semibold">
                <Building className="h-3.5 w-3.5" />
                <span>Lease &amp; Premise Details</span>
              </div>
              <p className="font-semibold text-foreground">{currentData.propertyName}</p>
              <p className="text-muted-foreground">Unit / Flat: <strong className="text-primary font-mono">{currentData.unitRef}</strong></p>
              <p className="text-muted-foreground">Lease Period: <span className="font-medium text-foreground">{currentData.leaseStartDate}</span> to <span className="font-medium text-foreground">{currentData.leaseEndDate}</span></p>
              <p className="text-muted-foreground">Monthly Rent: <strong className="text-foreground">QR {currentData.monthlyRent?.toLocaleString()}</strong></p>
            </div>
          </div>

          {/* Security Deposit / Main Transaction Summary */}
          {currentData.depositAmount > 0 && (
            <div className="border rounded-lg p-3 bg-card flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-semibold">
                    {activeTab === 'secondary' ? 'Security Deposit Refund Amount' : 'Security Deposit / Principal Transaction'}
                  </p>
                  <p className="text-xs text-muted-foreground">Channel: <strong>{currentData.depositMode}</strong></p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-600 font-mono">QR {currentData.depositAmount?.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* PDC Breakdown Schedule Table */}
          {currentData.pdcs && currentData.pdcs.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Post-Dated Cheques (PDC) Schedule ({currentData.pdcs.length} Cheques)</h4>
                </div>
                <span className="text-xs text-muted-foreground">Total PDCs: <strong>QR {currentData.pdcs.reduce((s, p) => s + p.amount, 0).toLocaleString()}</strong></span>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/60 text-muted-foreground font-semibold border-b">
                    <tr>
                      <th className="py-2 px-3 text-left">#</th>
                      <th className="py-2 px-3 text-left">Cheque No.</th>
                      <th className="py-2 px-3 text-left">Bank</th>
                      <th className="py-2 px-3 text-left">Maturity Date</th>
                      <th className="py-2 px-3 text-left">Period</th>
                      <th className="py-2 px-3 text-right">Amount (QAR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {currentData.pdcs.map((pdc, idx) => {
                      let displayPeriod = pdc.period || `Cheque ${idx + 1}`;
                      if (pdc.tenureStart && pdc.tenureEnd) {
                        displayPeriod = `${pdc.tenureStart} to ${pdc.tenureEnd}`;
                      } else if (pdc.tenureStart) {
                        displayPeriod = `From ${pdc.tenureStart}`;
                      }
                      return (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="py-1.5 px-3 font-mono text-muted-foreground">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-mono font-bold text-primary">{pdc.chequeNo}</td>
                          <td className="py-1.5 px-3">{pdc.bank}</td>
                          <td className="py-1.5 px-3 font-mono">{pdc.date}</td>
                          <td className="py-1.5 px-3 font-mono text-muted-foreground">{displayPeriod}</td>
                          <td className="py-1.5 px-3 text-right font-mono font-semibold">QR {pdc.amount.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vouchers Posted Summary */}
          {currentData.vouchers && currentData.vouchers.length > 0 && (
            <div className="space-y-1.5 bg-muted/20 p-3 rounded-lg border text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                <span>Financial Line Items &amp; Sub-Ledger Posting</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                {currentData.vouchers.map((v, i) => (
                  <div key={i} className="flex justify-between items-center bg-background px-2.5 py-1.5 rounded border">
                    <div>
                      <p className="font-semibold">{v.name}</p>
                      <p className="text-[10px] text-muted-foreground">{v.debit} → {v.credit}</p>
                    </div>
                    <span className="font-mono font-bold text-primary">QR {v.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total & Words */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between items-center bg-primary/5 p-3 rounded-lg border border-primary/20">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  {activeTab === 'secondary' ? 'Total Security Deposit Refund Paid' : 'Total Acknowledged Collection'}
                </p>
                <p className="text-xs italic text-primary font-medium mt-0.5">{totalWords}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-primary font-mono">
                  QR {currentData.totalCollected.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-8 pt-8 text-center text-xs text-muted-foreground border-t">
            <div>
              <div className="border-b pb-8 border-dashed"></div>
              <p className="mt-2 font-semibold text-foreground">Tenant's Signature</p>
              <p className="text-[10px]">Received original duplicate copy</p>
            </div>
            <div>
              <div className="border-b pb-8 border-dashed"></div>
              <p className="mt-2 font-semibold text-foreground">Cashier / Prepared By</p>
              <p className="text-[10px]">{currentData.cashierName || 'Finance Cashier'}</p>
            </div>
            <div>
              <div className="border-b pb-8 border-dashed"></div>
              <p className="mt-2 font-semibold text-foreground">Authorized Signatory</p>
              <p className="text-[10px]">ZYNO Property Management</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="bg-card p-4 rounded-b-xl border-t flex items-center justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" /> Print Receipt
            </Button>
            <Button onClick={handleDownloadPdf} className="gap-2">
              <Download className="h-4 w-4" /> Download PDF Receipt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
