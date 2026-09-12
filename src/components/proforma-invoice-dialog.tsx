import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Printer, 
  Building2, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  DollarSign,
  User,
  ArrowRight
} from "lucide-react";
import { type ProcApInvoice, type PaymentReceipt, ApInvoicesApi } from "@/lib/proc-invoices-api";

export interface ProformaInvoiceData {
  id?: string | number;
  invoice_number: string;
  vendor_id?: string | number;
  vendor_name?: string;
  vendor_code?: string;
  vendor_tax_number?: string;
  vendor_phone?: string;
  vendor_email?: string;
  po_number?: string;
  grn_number?: string;
  invoice_date: string;
  due_date?: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  amount_paid?: number;
  status: string;
  posting_status?: string;
  remarks?: string;
  payment_terms?: string;
  settlement_mode?: string;
  payment_method?: string;
  payment_reference?: string;
  paid_at?: string;
  property_name?: string;
  unit_ref?: string;
  expense_gl_code?: string;
  expense_gl_account?: string;
  line_items?: Array<{
    description: string;
    quantity: number;
    unit_rate: number;
    line_total: number;
    property?: string;
    unit?: string;
  }>;
}

interface ProformaInvoiceDialogProps {
  invoice: ProformaInvoiceData | ProcApInvoice | any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayClick?: (invoice: any) => void;
  onViewReceiptClick?: (invoice: any) => void;
  vendors?: any[];
}

export function ProformaInvoiceDialog({
  invoice,
  open,
  onOpenChange,
  onPayClick,
  onViewReceiptClick,
  vendors = [],
}: ProformaInvoiceDialogProps) {
  if (!invoice) return null;

  const totalAmount = Number(invoice.total_amount || invoice.amount || 0);
  const taxAmount = Number(invoice.tax_amount || 0);
  const baseAmount = totalAmount - taxAmount > 0 ? totalAmount - taxAmount : totalAmount;
  
  // Calculate paid & outstanding
  const localPaid = Number(localStorage.getItem(`partial_paid_${invoice.id}`) || "0");
  const alreadyPaid = Number(invoice.amount_paid ?? (invoice.status === "PAID" || invoice.status === "Paid" ? totalAmount : localPaid));
  const outstanding = Math.max(0, totalAmount - alreadyPaid);
  const isPaid = (invoice.status === "PAID" || invoice.status === "Paid" || outstanding <= 0.01) && totalAmount > 0;
  const isPartial = (invoice.status === "PARTIAL" || invoice.status === "Partial" || (alreadyPaid > 0 && outstanding > 0.01));

  // Matched vendor details
  const vendorObj = vendors.find(
    v => String(v.id) === String(invoice.vendor_id) || v.name === invoice.vendor || v.name === invoice.vendor_name
  );
  const vendorDisplayName = invoice.vendor_name || invoice.vendor || vendorObj?.name || (invoice.vendor_id ? `Vendor #${invoice.vendor_id}` : "Vendor / Supplier");
  const vendorCode = vendorObj?.code || invoice.vendor_code || "VND-SUPP";
  const vendorTax = vendorObj?.tax_number || invoice.vendor_tax_number || "CR-QAT-98421";
  const vendorPhone = vendorObj?.phone || invoice.vendor_phone || "+974 4400 0000";
  const vendorEmail = vendorObj?.email || invoice.vendor_email || "accounts@supplier.qa";
  const paymentTerms = invoice.payment_terms || vendorObj?.payment_terms || "Net 30 Days";
  const settlementMode = invoice.settlement_mode || invoice.payment_method || vendorObj?.settlement_mode || "Bank Wire / Electronic Transfer (QNB)";

  // Line items (fallback to default breakdown if none specified)
  const lineItems = invoice.line_items && invoice.line_items.length > 0 ? invoice.line_items : [
    {
      description: invoice.remarks || (invoice.po_number ? `Procurement Deliverables under ${invoice.po_number}` : `Standard Commercial Vendor Services`),
      quantity: 1,
      unit_rate: baseAmount,
      line_total: baseAmount,
      property: invoice.property || invoice.property_name || "General Facility",
      unit: invoice.unit_ref || "Common Area",
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl bg-card border shadow-2xl p-0 overflow-hidden max-h-[92vh] flex flex-col rounded-xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white flex justify-between items-start shrink-0 border-b border-indigo-500/20">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                Official Commercial Document
              </span>
              <span className="text-xs text-indigo-200/80 font-medium">Proforma / Accounts Payable Invoice</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight font-mono text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-indigo-400" />
              {invoice.invoice_number || invoice.invoice_no || "PROFORMA-INV"}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Issue Date: <strong className="text-white">{invoice.invoice_date || invoice.date || new Date().toISOString().slice(0, 10)}</strong>
              {invoice.due_date && <> &bull; Due Date: <strong className="text-indigo-200">{invoice.due_date}</strong></>}
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-1.5">
            <Badge 
              variant={isPaid ? "default" : isPartial ? "secondary" : "outline"}
              className={`text-xs px-3 py-1 font-semibold border ${
                isPaid 
                  ? "bg-emerald-600 text-white border-emerald-400" 
                  : isPartial 
                  ? "bg-amber-500/20 text-amber-200 border-amber-400/40" 
                  : "bg-slate-800 text-slate-200 border-slate-600"
              }`}
            >
              {isPaid ? (
                <><CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-300 inline" /> Paid &amp; Settled</>
              ) : isPartial ? (
                <><Clock className="h-3.5 w-3.5 mr-1 text-amber-300 inline" /> Partial Payment ({alreadyPaid.toLocaleString()} Paid)</>
              ) : (
                <><AlertCircle className="h-3.5 w-3.5 mr-1 text-slate-300 inline" /> Awaiting Finance Settlement</>
              )}
            </Badge>
            <span className="text-[10px] text-slate-400 font-mono">
              Status: {invoice.status || "APPROVED"} &bull; {invoice.posting_status || "POSTED"}
            </span>
          </div>
        </div>

        {/* Scrollable Proforma Invoice Body */}
        <ScrollArea className="flex-1 p-6 max-h-[calc(92vh-140px)]">
          <div className="space-y-5 text-xs">
            
            {/* Parties Info Strip (Company & Vendor) */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border">
              {/* Buyer Information */}
              <div className="space-y-1 pr-3 border-r">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Billed To (Buyer / Client)</span>
                <p className="text-sm font-bold text-foreground">ZYNO Property Management Services LLC</p>
                <p className="text-muted-foreground text-[11px]">Financial Operations &amp; Accounts Payable Division</p>
                <p className="text-muted-foreground text-[11px]">Doha, State of Qatar &bull; CR: 109283-QA</p>
                <p className="text-muted-foreground text-[11px]">Tax / VAT ID: QA-VAT-884029</p>
              </div>

              {/* Vendor / Supplier Information */}
              <div className="space-y-1 pl-2">
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider block">Vendor / Payee Details</span>
                <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                  {vendorDisplayName}
                </p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground mt-1">
                  <span>Vendor Code: <strong className="text-foreground font-mono">{vendorCode}</strong></span>
                  <span>CR / Tax No: <strong className="text-foreground font-mono">{vendorTax}</strong></span>
                  <span>Phone: <span className="text-foreground">{vendorPhone}</span></span>
                  <span>Email: <span className="text-foreground">{vendorEmail}</span></span>
                </div>
              </div>
            </div>

            {/* 3-Way Traceability Linkage Cards */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                3-Way Procurement Match &amp; Audit Traceability
              </span>
              <div className="grid grid-cols-4 gap-2.5 p-3 rounded-xl border bg-card">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <span className="text-[9px] uppercase font-bold text-blue-700 dark:text-blue-400 block">Purchase Order</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-300 text-xs">
                    {invoice.po_number || "PO-DIRECT-REQ"}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[9px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Goods Receipt (GRN)</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-300 text-xs">
                    {invoice.grn_number || "GRN-VERIFIED"}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <span className="text-[9px] uppercase font-bold text-violet-700 dark:text-violet-400 block">Payment Terms</span>
                  <span className="font-semibold text-violet-700 dark:text-violet-300 text-xs truncate block">
                    {paymentTerms}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[9px] uppercase font-bold text-amber-700 dark:text-amber-400 block">Settlement Mode</span>
                  <span className="font-semibold text-amber-700 dark:text-amber-300 text-[11px] truncate block">
                    {settlementMode}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Line Items Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" /> Itemized Commercial Line Items &amp; Allocation
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {lineItems.length} line item{lineItems.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="border rounded-xl overflow-hidden bg-background">
                <table className="w-full text-xs">
                  <thead className="bg-muted/60 font-bold border-b text-muted-foreground text-[11px]">
                    <tr>
                      <th className="p-3 text-left">#</th>
                      <th className="p-3 text-left">Description / Deliverable</th>
                      <th className="p-3 text-left">Property / Unit Allocation</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Rate (QAR)</th>
                      <th className="p-3 text-right">Line Total (QAR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {lineItems.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="p-3 font-mono text-muted-foreground">{idx + 1}</td>
                        <td className="p-3">
                          <p className="font-semibold text-foreground">{item.description}</p>
                          <p className="text-[10px] text-muted-foreground">Certified against PO specifications &amp; warehouse intake</p>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="font-medium text-foreground">{item.property || "Main Facility"}</span>
                            {item.unit && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono text-cyan-700 bg-cyan-50 border border-cyan-200">
                                {item.unit}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center font-mono font-medium">{item.quantity || 1} Nos</td>
                        <td className="p-3 text-right font-mono text-muted-foreground">
                          {Number(item.unit_rate || item.line_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-foreground">
                          {Number(item.line_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary & GL Accounting Preview */}
            <div className="grid grid-cols-2 gap-4 items-start">
              {/* Left: General Ledger Posting Preview */}
              <div className="space-y-2 p-3.5 rounded-xl border bg-muted/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Double-Entry GL Posting Map
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between p-2 rounded bg-background border">
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">
                      Dr. {invoice.expense_gl_code || "51004001"} — {invoice.expense_gl_account || "Repair & Maintenance Cost / CMEP"}
                    </span>
                    <span className="font-bold">QAR {baseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {taxAmount > 0 && (
                    <div className="flex justify-between p-2 rounded bg-background border">
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        Dr. 12800001 — Input VAT / Recoverable Tax
                      </span>
                      <span className="font-bold">QAR {taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between p-2 rounded bg-background border">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Cr. 22100001 — Trade Payables - Vendors ({vendorDisplayName})
                    </span>
                    <span className="font-bold">QAR {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Right: Totals Calculation Card */}
              <div className="p-4 rounded-xl border bg-card space-y-2.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal / Net Amount:</span>
                  <span className="font-mono font-medium text-foreground">QAR {baseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT / Tax Amount (0% / Exempt):</span>
                  <span className="font-mono font-medium text-foreground">QAR {taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm font-bold">
                  <span className="text-foreground">Total Payable Invoice:</span>
                  <span className="font-mono text-base text-primary">QAR {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Paid & Balance Breakdown */}
                <div className="p-2.5 rounded-lg bg-muted/40 border space-y-1 text-[11px]">
                  <div className="flex justify-between font-semibold">
                    <span className="text-emerald-700 dark:text-emerald-400">Amount Paid &amp; Settled:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">QAR {alreadyPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className={outstanding <= 0.01 ? "text-muted-foreground" : "text-amber-700 dark:text-amber-400"}>
                      Outstanding Balance Due:
                    </span>
                    <span className={`font-mono ${outstanding <= 0.01 ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400"}`}>
                      QAR {outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks / Special Instructions */}
            {invoice.remarks && (
              <div className="p-3 rounded-lg border bg-muted/10 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Remarks &amp; Settlement Notes</span>
                <p className="text-foreground text-xs">{invoice.remarks}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <DialogFooter className="p-4 bg-muted/30 border-t flex sm:justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">
              Ref: {invoice.invoice_number || invoice.invoice_no} &bull; Official PMS Proforma View
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5" /> Print Proforma
            </Button>
            {isPaid && onViewReceiptClick && (
              <Button 
                size="sm" 
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  onOpenChange(false);
                  onViewReceiptClick(invoice);
                }}
              >
                <FileText className="h-3.5 w-3.5" /> View Payment Receipt
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
