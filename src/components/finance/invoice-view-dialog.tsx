import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, Building2, Calendar, FileText, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import type { ReceivableInvoice } from "@/lib/finance/finance-store";
import { getDocumentBranding } from "@/lib/document-branding";
import { AL_AMEEN_PAGE1_HEADER_BASE64 } from "@/lib/header-banner-base64";

interface InvoiceViewDialogProps {
  invoice: ReceivableInvoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerDetails?: {
    code?: string;
    qid?: string;
    crNumber?: string;
    phone?: string;
    email?: string;
  };
}

function numberToWords(amount: number): string {
  if (!amount || isNaN(amount)) return "Zero Qatari Riyals";
  const num = Math.floor(amount);
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertChunk(n: number): string {
    let s = "";
    if (n >= 100) {
      s += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      s += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      s += ones[n] + " ";
    }
    return s.trim();
  }

  if (num === 0) return "Zero Qatari Riyals Only";

  let result = "";
  const thousands = Math.floor(num / 1000);
  const remainder = num % 1000;

  if (thousands > 0) {
    result += convertChunk(thousands) + " Thousand ";
  }
  if (remainder > 0) {
    result += convertChunk(remainder) + " ";
  }

  return result.trim() + " Qatari Riyals Only";
}

export function InvoiceViewDialog({ invoice, open, onOpenChange, customerDetails }: InvoiceViewDialogProps) {
  if (!invoice) return null;

  const branding = useMemo(() => getDocumentBranding(), []);
  const bannerUrl = branding.headerImageUrl || AL_AMEEN_PAGE1_HEADER_BASE64;

  const isPaid = invoice.status === "Paid";
  const isOverdue = invoice.status === "Overdue";

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const csvContent = [
      ["Invoice Number", invoice.invoice_no],
      ["Date", invoice.date],
      ["Due Date", invoice.due_date],
      ["Customer / Tenant", invoice.tenant],
      ["Property", invoice.property],
      ["Unit", invoice.unit],
      ["Revenue Stream", invoice.stream],
      ["Amount (QAR)", invoice.amount],
      ["Status", invoice.status],
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${invoice.invoice_no}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 border shadow-2xl rounded-xl">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            html, body {
              overflow: visible !important;
              height: auto !important;
              background: #ffffff !important;
            }
            body * { visibility: hidden; }
            #printable-invoice, #printable-invoice * { 
              visibility: visible; 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #printable-invoice { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%; 
              padding: 0; 
              margin: 0;
              border: none !important;
              box-shadow: none !important;
              background: #ffffff !important;
            }
          }
        `}} />

        {/* Action Bar Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-muted/60 border-b">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rental &amp; Receivables Invoice</span>
            <Badge variant={isPaid ? "default" : isOverdue ? "destructive" : "outline"} className="text-[10px]">
              {invoice.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownloadCSV} className="h-8 text-xs gap-1.5">
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button size="sm" onClick={handlePrint} className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground">
              <Printer className="h-3.5 w-3.5" /> Print / PDF
            </Button>
          </div>
        </div>

        {/* Printable Invoice Document */}
        <div id="printable-invoice" className="p-8 space-y-6 text-foreground bg-card">
          {/* Official Letterhead Banner as on Receipts & Lease Contracts */}
          <div className="w-full rounded-lg overflow-hidden border border-border/40 shadow-xs max-h-24 sm:max-h-28 mb-3 bg-white flex items-center justify-center">
            <img
              src={bannerUrl}
              alt={branding.companyName || "Al Ameen Real Estate"}
              className="w-full h-auto max-h-28 object-contain sm:object-cover"
            />
          </div>

          {/* Company & Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
                <Building2 className="h-6 w-6 text-primary" />
                <span>{branding.companyName || "Al Ameen Real Estate"}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-semibold text-foreground">{branding.legalEntityName || "Al Ameen Real Estate W.L.L"}</span> &bull; Real Estate Operations &amp; Asset Management
              </p>
              <p className="text-xs text-muted-foreground">{branding.address || "Grand Hamad Avenue, Building 42, Floor 7, P.O. Box 24901, Doha - State of Qatar"}</p>
              <p className="text-xs text-muted-foreground font-mono">
                CR No: {branding.crNumber || "CR-90821-QA"} &bull; Tax Reg: {branding.taxNumber || "TAX-300912-QA"}
              </p>
              <p className="text-xs text-muted-foreground">
                Tel: {branding.phone || "+974 4492 8800"} &bull; Email: {branding.email || "finance@alameen.qa"}
              </p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-black text-sm uppercase tracking-widest rounded mb-2">
                TAX / RENTAL INVOICE
              </span>
              <p className="text-xl font-mono font-bold text-foreground">{invoice.invoice_no}</p>
              <div className="text-xs space-y-1 mt-2 text-muted-foreground font-medium">
                <p>Issue Date: <span className="font-mono text-foreground font-semibold">{invoice.date}</span></p>
                <p>Due Date: <span className="font-mono text-foreground font-semibold">{invoice.due_date}</span></p>
                <p>Payment Terms: <span className="text-foreground">Due Upon Receipt</span></p>
              </div>
            </div>
          </div>

          {/* Billed To / Property Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground block">
                Billed To (Tenant / Customer)
              </span>
              <p className="font-bold text-sm text-foreground">{invoice.tenant}</p>
              {customerDetails?.code && (
                <p className="text-muted-foreground font-mono">Customer ID: <strong className="text-foreground">{customerDetails.code}</strong></p>
              )}
              {customerDetails?.qid && (
                <p className="text-muted-foreground font-mono">QID / CR: <strong className="text-foreground">{customerDetails.qid}</strong></p>
              )}
              {customerDetails?.phone && (
                <p className="text-muted-foreground">Mobile: <strong className="text-foreground">{customerDetails.phone}</strong></p>
              )}
              {customerDetails?.email && (
                <p className="text-muted-foreground">Email: <strong className="text-foreground">{customerDetails.email}</strong></p>
              )}
            </div>

            <div className="space-y-1.5 sm:border-l sm:pl-4">
              <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground block">
                Property &amp; Leased Unit
              </span>
              <p className="font-semibold text-foreground">{invoice.property}</p>
              <p className="text-muted-foreground">Unit Reference: <strong className="font-mono text-primary">{invoice.unit}</strong></p>
              <p className="text-muted-foreground">Revenue Stream: <span className="font-mono">{invoice.stream}</span></p>
              <p className="text-muted-foreground">GL Account Code: <span className="font-mono font-bold text-foreground">{invoice.account_code || "41100"}</span></p>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted text-muted-foreground font-bold border-b text-[11px]">
                <tr>
                  <th className="px-4 py-2.5 text-left">#</th>
                  <th className="px-4 py-2.5 text-left">Description</th>
                  <th className="px-4 py-2.5 text-left">Account / Stream</th>
                  <th className="px-4 py-2.5 text-center">Period</th>
                  <th className="px-4 py-2.5 text-right">Amount (QAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-muted-foreground">1</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{invoice.stream.replace(/^\d+\s*[-–—]\s*/, "")}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Charges for {invoice.property} &bull; Unit {invoice.unit} &bull; Due: {invoice.due_date}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{invoice.stream}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{invoice.date.slice(0, 7)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                    {invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-muted/40 font-semibold border-t">
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right text-muted-foreground">Subtotal:</td>
                  <td className="px-4 py-2 text-right font-mono">
                    {invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} QAR
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right text-muted-foreground">Tax / VAT (0%):</td>
                  <td className="px-4 py-2 text-right font-mono">0.00 QAR</td>
                </tr>
                <tr className="border-t-2 border-primary/20 text-sm font-bold bg-primary/5">
                  <td colSpan={4} className="px-4 py-3 text-right text-foreground">Total Payable Amount:</td>
                  <td className="px-4 py-3 text-right font-mono text-primary text-base">
                    {invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} QAR
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in words */}
          <div className="p-3 bg-muted/30 border rounded-lg text-xs">
            <span className="font-semibold text-muted-foreground">Amount in Words: </span>
            <span className="font-bold italic text-foreground">{numberToWords(invoice.amount)}</span>
          </div>

          {/* Bank Payment Remittance Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/15 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-[10px] uppercase tracking-wider text-primary flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Official Bank Remittance Details
              </span>
              <p className="text-muted-foreground">Bank Name: <strong className="text-foreground">Commercial Bank of Qatar (CBQ) / Dukhan Bank</strong></p>
              <p className="text-muted-foreground">Account Name: <strong className="text-foreground">{branding.legalEntityName || "Al Ameen Real Estate W.L.L"}</strong></p>
              <p className="text-muted-foreground font-mono">IBAN: <strong className="text-foreground">QA52 CBQA 0000 0000 1289 4012 34</strong></p>
              <p className="text-muted-foreground font-mono">SWIFT Code: <strong className="text-foreground">CBQAQAQA</strong></p>
              <p className="text-[10px] text-muted-foreground mt-1">Please quote invoice number <strong>{invoice.invoice_no}</strong> in payment remarks.</p>
            </div>

            <div className="flex flex-col justify-between sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">For {branding.companyName || "Al Ameen Real Estate"}</p>
                <div className="h-14 flex items-center justify-end">
                  <div className="border border-dashed border-muted-foreground/40 rounded px-4 py-2 text-[10px] font-mono text-muted-foreground">
                    [AUTHORIZED SIGNATURE &amp; STAMP]
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">Accounts &amp; Finance Department</p>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="text-[10px] text-muted-foreground text-center border-t pt-4 space-y-1">
            <p>This is a computer-generated tax and rental invoice valid without physical signature under Qatar e-Commerce Law.</p>
            <p>Payment is due strictly according to the lease agreement terms. Late payments are subject to contract penalties.</p>
          </div>
        </div>

        <DialogFooter className="px-6 py-3 border-t bg-muted/30">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button size="sm" onClick={handlePrint} className="gap-1.5 bg-primary text-primary-foreground">
            <Printer className="h-4 w-4" /> Print Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
