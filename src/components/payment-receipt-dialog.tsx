import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, CheckCircle2, Building2, FileText, ArrowRight, ShieldCheck, Download, Layers } from "lucide-react";
import { type PaymentReceipt, ApInvoicesApi } from "@/lib/proc-invoices-api";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PaymentReceiptDialogProps {
  receipt: PaymentReceipt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorName?: string;
  allReceipts?: PaymentReceipt[];
}

export function PaymentReceiptDialog({ receipt, open, onOpenChange, vendorName, allReceipts: propReceipts }: PaymentReceiptDialogProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(receipt);

  useEffect(() => {
    setSelectedReceipt(receipt);
  }, [receipt]);

  if (!receipt && !selectedReceipt) return null;

  const currentReceipt = selectedReceipt || receipt;
  if (!currentReceipt) return null;

  // Retrieve all receipts for this invoice
  const receiptsList = propReceipts && propReceipts.length > 0 
    ? propReceipts 
    : ApInvoicesApi.getAllReceiptsForInvoice(currentReceipt.invoice_number);

  const displayList = receiptsList.length > 0 ? receiptsList : [currentReceipt];

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl bg-card border shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col rounded-xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-5 w-5 text-emerald-200" />
              <span className="text-xs font-semibold tracking-wider uppercase text-emerald-100">Official Payment Settlement Receipt</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{currentReceipt.receipt_number}</h2>
            <p className="text-xs text-emerald-100/90 mt-0.5">Finance Voucher Ref: <strong className="font-mono">{currentReceipt.voucher_number}</strong></p>
          </div>
          <div className="text-right">
            <Badge className="bg-white/20 hover:bg-white/20 text-white border-0 text-xs px-3 py-1 font-semibold backdrop-blur-sm">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-200" /> {currentReceipt.status === "Partial" ? "Partial Disbursement" : "Settled & Posted"}
            </Badge>
            <p className="text-[11px] text-emerald-100 mt-2">{currentReceipt.payment_date}</p>
          </div>
        </div>

        {/* Multiple Receipts Selector / Installment Tabs if more than 1 receipt */}
        {displayList.length > 1 && (
          <div className="bg-muted/60 border-b px-5 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5 shrink-0">
              <Layers className="h-3.5 w-3.5 text-primary" /> Payment Installments ({displayList.length}):
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {displayList.map((r, idx) => (
                <button
                  key={r.id || idx}
                  type="button"
                  onClick={() => setSelectedReceipt(r)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                    currentReceipt.id === r.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background text-muted-foreground hover:bg-muted border"
                  }`}
                >
                  #{idx + 1}: QAR {Number(r.amount_paid).toLocaleString()} ({r.receipt_number})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Receipt Body */}
        <ScrollArea className="flex-1 p-5 max-h-[calc(90vh-180px)]">
          <div className="space-y-4 text-xs">
            {/* Amount Showcase */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border">
              <div>
                <span className="text-muted-foreground block text-[11px]">
                  {currentReceipt.status === "Partial" ? "Disbursed Installment Amount" : "Total Settled Amount"}
                </span>
                <span className="text-2xl font-black font-mono text-primary">QAR {Number(currentReceipt.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-right text-[11px]">
                <span className="text-muted-foreground block">Payment Method</span>
                <span className="font-semibold text-foreground">{currentReceipt.payment_method}</span>
                <span className="text-muted-foreground block font-mono text-[10px] mt-0.5">{currentReceipt.reference_no}</span>
              </div>
            </div>

            {/* 3-Way Match Chain */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">3-Way Procurement Match Chain</span>
              <div className="grid grid-cols-3 gap-2 p-3 rounded-lg border bg-background text-[11px]">
                <div className="border-r pr-2">
                  <span className="text-muted-foreground block text-[10px]">Purchase Order</span>
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{currentReceipt.po_number || "—"}</span>
                </div>
                <div className="border-r px-2">
                  <span className="text-muted-foreground block text-[10px]">Goods Receipt Note</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{currentReceipt.grn_number || "—"}</span>
                </div>
                <div className="pl-2">
                  <span className="text-muted-foreground block text-[10px]">Payable Invoice</span>
                  <span className="font-mono font-bold text-violet-600 dark:text-violet-400">{currentReceipt.invoice_number}</span>
                </div>
              </div>
            </div>

            {/* Beneficiary / Vendor Info */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border bg-muted/20 text-[11px]">
              <div>
                <span className="text-muted-foreground block text-[10px]">Vendor / Beneficiary</span>
                <span className="font-bold text-foreground text-xs">{vendorName || currentReceipt.vendor_name || `Vendor #${currentReceipt.vendor_id}`}</span>
                <span className="text-muted-foreground text-[10px] block mt-0.5">Commercial Supplier Registry</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Disbursing Account & Mode</span>
                <span className="font-semibold text-foreground">{currentReceipt.bank_account}</span>
              </div>
            </div>

            {/* GL Accounting Impact */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">General Ledger (GL) Posting Impact</span>
              <div className="border rounded-lg overflow-hidden text-[11px]">
                <div className="flex justify-between p-2.5 bg-muted/50 border-b font-mono">
                  <span className="font-semibold text-rose-600 dark:text-rose-400">Dr. {currentReceipt.gl_debit_account}</span>
                  <span className="font-bold">QAR {Number(currentReceipt.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-muted/20 font-mono">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Cr. {currentReceipt.gl_credit_account}</span>
                  <span className="font-bold">QAR {Number(currentReceipt.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Audit Verification Stamp */}
            <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-[10px] text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
              <span>Audit Trail Verified &bull; System Generated Financial Voucher &bull; Real-time GL Sync</span>
              <span className="font-mono font-semibold">{currentReceipt.status.toUpperCase()}</span>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <DialogFooter className="p-4 bg-muted/30 border-t flex sm:justify-between items-center shrink-0">
          <span className="text-[10px] text-muted-foreground hidden sm:inline">Official Payment Voucher Receipt</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
            <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5" /> Print Receipt
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
