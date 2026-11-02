import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Download, Printer, Building2, Search } from "lucide-react";
import { useFinanceStore } from "@/lib/finance/finance-store";
import { FinVendorsApi } from "@/lib/supabase-finance";
import { toast } from "sonner";

interface VendorLedgerRow {
  id: string;
  date: string;
  refNo: string;
  docType: "AP Invoice" | "GRN Accrual" | "Payment Voucher" | "Debit Note" | "Journal Entry";
  property: string;
  vendorName: string;
  description: string;
  debit: number; // Reduces payable (Payments / Debit Notes)
  credit: number; // Increases payable (AP Invoices / GRNs)
  runningBalance: number; // Positive = Net Payable owed to Vendor
}

function norm(s?: string): string {
  return (s || "").trim().toLowerCase();
}

export function VendorStatementSubModule() {
  const { payableInvoices, grnMappings, vouchers, allLedgerTransactions } = useFinanceStore();
  const [dbVendors, setDbVendors] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("ALL");
  const [propertyFilter, setPropertyFilter] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("2026-01-01");
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    FinVendorsApi.fetchAll()
      .then((list) => {
        const names = (list || []).map((v: any) => (v.name || v.vendor_name || "").trim()).filter(Boolean);
        setDbVendors(names);
      })
      .catch(() => {});
  }, []);

  const vendorsList = useMemo(() => {
    const set = new Set<string>(dbVendors);
    payableInvoices.forEach((inv) => {
      if (inv.vendor) set.add(inv.vendor.trim());
    });
    grnMappings.forEach((g) => {
      if (g.vendor) set.add(g.vendor.trim());
    });
    vouchers.forEach((v) => {
      if (v.voucher_type === "Payment Voucher" && v.tenant_name) set.add(v.tenant_name.trim());
    });
    return Array.from(set).filter(Boolean).sort();
  }, [dbVendors, payableInvoices, grnMappings, vouchers]);

  const propertiesList = useMemo(() => {
    const set = new Set<string>();
    payableInvoices.forEach((inv) => {
      if (inv.property && inv.property !== "Multiple Properties") set.add(inv.property.trim());
      inv.lines?.forEach((l) => {
        if (l.property) set.add(l.property.trim());
      });
    });
    grnMappings.forEach((g) => {
      if (g.property) set.add(g.property.trim());
    });
    vouchers.forEach((v) => {
      if (v.property_name) set.add(v.property_name.trim());
    });
    return Array.from(set).filter(Boolean).sort();
  }, [payableInvoices, grnMappings, vouchers]);

  // Build chronological vendor ledger lines with strict vendor & property isolation (zero data leakage)
  const { openingBalance, ledgerRows, totalInvoiced, totalPaid, closingBalance } = useMemo(() => {
    const rawEvents: Omit<VendorLedgerRow, "runningBalance">[] = [];

    // 1. Payable Invoices (Credit to Vendor account = increases liability)
    payableInvoices.forEach((inv) => {
      const vName = (inv.vendor || "Unassigned Supplier").trim();
      if (selectedVendor !== "ALL" && norm(vName) !== norm(selectedVendor)) return;

      if (inv.lines && inv.lines.length > 0) {
        inv.lines.forEach((ln, idx) => {
          const prop = (ln.property || inv.property || "All / Corporate").trim();
          if (propertyFilter !== "ALL" && norm(prop) !== norm(propertyFilter)) return;
          const lineAmt = Number(ln.amount || 0);
          if (lineAmt <= 0) return;

          rawEvents.push({
            id: `${inv.id}-ln-${idx}`,
            date: inv.date,
            refNo: inv.invoice_no,
            docType: "AP Invoice",
            property: prop,
            vendorName: vName,
            description: `${vName} — ${ln.account}${ln.description ? `: ${ln.description}` : ""}`,
            debit: 0,
            credit: lineAmt,
          });
        });
      } else {
        const prop = (inv.property || "All / Corporate").trim();
        if (propertyFilter !== "ALL" && norm(prop) !== norm(propertyFilter)) return;
        rawEvents.push({
          id: inv.id,
          date: inv.date,
          refNo: inv.invoice_no,
          docType: "AP Invoice",
          property: prop,
          vendorName: vName,
          description: `${vName} — ${inv.account || "Vendor Bill"}`,
          debit: 0,
          credit: Number(inv.amount || 0),
        });
      }
    });

    // 2. GRN Cost Mappings posted directly to AP (if not already converted to a PayableInvoice)
    const apInvoiceRefs = new Set(payableInvoices.map((i) => norm(i.invoice_no)));
    grnMappings.forEach((grn) => {
      if (apInvoiceRefs.has(norm(`AP-${grn.grn_no}`)) || apInvoiceRefs.has(norm(grn.grn_no))) return;
      const vName = (grn.vendor || "Unassigned Supplier").trim();
      if (selectedVendor !== "ALL" && norm(vName) !== norm(selectedVendor)) return;
      const prop = (grn.property || "All / Corporate").trim();
      if (propertyFilter !== "ALL" && norm(prop) !== norm(propertyFilter)) return;

      rawEvents.push({
        id: `grn-${grn.id}`,
        date: (grn as any).date || startDate,
        refNo: grn.grn_no,
        docType: "GRN Accrual",
        property: prop,
        vendorName: vName,
        description: `${vName} — ${grn.mapped_gl}: ${grn.description} (PO: ${grn.po_ref})`,
        debit: 0,
        credit: Number(grn.amount || 0),
      });
    });

    // 3. Payment Vouchers settling Vendor Trade Payables (22100xxx / AP settlement)
    vouchers
      .filter((v) => v.voucher_type === "Payment Voucher")
      .forEach((v) => {
        // Resolve exact vendor either from v.tenant_name or from referenced AP invoice
        const matchedInv = payableInvoices.find(
          (inv) => inv.invoice_no && v.name?.toLowerCase().includes(inv.invoice_no.toLowerCase())
        );
        const vName = (v.tenant_name || matchedInv?.vendor || "").trim();
        if (!vName && selectedVendor !== "ALL") return;
        if (selectedVendor !== "ALL" && norm(vName) !== norm(selectedVendor)) return;

        // If linked to a multi-line AP invoice and filtered by property, allocate payment proportionally to that property's share
        if (matchedInv && matchedInv.lines && matchedInv.lines.length > 0 && propertyFilter !== "ALL") {
          const propShare = matchedInv.lines
            .filter((ln) => norm(ln.property || matchedInv.property) === norm(propertyFilter))
            .reduce((s, ln) => s + Number(ln.amount || 0), 0);
          if (propShare <= 0) return;
          const totalInv = Number(matchedInv.amount || 0) || propShare;
          const allocatedPay = Math.round(Number(v.amount || 0) * (propShare / totalInv) * 100) / 100;

          rawEvents.push({
            id: `${v.id}-${propertyFilter}`,
            date: v.date,
            refNo: v.voucher_no,
            docType: "Payment Voucher",
            property: propertyFilter,
            vendorName: vName || "Vendor",
            description: `${v.name} (Property Share: ${propertyFilter})`,
            debit: allocatedPay,
            credit: 0,
          });
          return;
        }

        const prop = (v.property_name || matchedInv?.property || "All / Corporate").trim();
        if (propertyFilter !== "ALL" && norm(prop) !== norm(propertyFilter)) return;

        rawEvents.push({
          id: v.id,
          date: v.date,
          refNo: v.voucher_no,
          docType: "Payment Voucher",
          property: prop,
          vendorName: vName || "Vendor",
          description: v.name || `Vendor Settlement (${v.method || "Bank Transfer"})`,
          debit: Number(v.amount || 0),
          credit: 0,
        });
      });

    // 4. Vendor Debit Notes / Journal adjustments on Trade Payables (22100xxx)
    allLedgerTransactions.forEach((tx) => {
      if (tx.source === "Payable Invoice" || tx.source === "GRN Cost Mapping" || tx.source === "Payment Voucher") return;
      if (!tx.account_code.startsWith("221")) return;
      const vName = (tx.tenant_name || "").trim();
      if (selectedVendor !== "ALL" && norm(vName) !== norm(selectedVendor)) return;
      const prop = (tx.property_name || "All / Corporate").trim();
      if (propertyFilter !== "ALL" && norm(prop) !== norm(propertyFilter)) return;

      rawEvents.push({
        id: `tx-ap-adj-${tx.id}`,
        date: tx.date,
        refNo: tx.reference,
        docType: tx.source === "Debit Note" ? "Debit Note" : "Journal Entry",
        property: prop,
        vendorName: vName || "Vendor",
        description: tx.description,
        debit: Number(tx.debit || 0),
        credit: Number(tx.credit || 0),
      });
    });

    // Sort chronologically
    rawEvents.sort((a, b) => a.date.localeCompare(b.date) || a.refNo.localeCompare(b.refNo));

    let openBal = 0;
    let periodInvoiced = 0;
    let periodPaid = 0;
    const rows: VendorLedgerRow[] = [];

    rawEvents.forEach((ev) => {
      if (ev.date < startDate) {
        openBal += ev.credit - ev.debit;
        return;
      }
      if (ev.date > endDate) return;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (
          !ev.refNo.toLowerCase().includes(q) &&
          !ev.description.toLowerCase().includes(q) &&
          !ev.property.toLowerCase().includes(q) &&
          !ev.vendorName.toLowerCase().includes(q)
        ) {
          return;
        }
      }

      periodInvoiced += ev.credit;
      periodPaid += ev.debit;
      const prevBal = rows.length > 0 ? rows[rows.length - 1].runningBalance : openBal;
      const nextBal = Math.round((prevBal + ev.credit - ev.debit) * 100) / 100;
      rows.push({
        ...ev,
        runningBalance: nextBal,
      });
    });

    const closeBal = rows.length > 0 ? rows[rows.length - 1].runningBalance : openBal;

    return {
      openingBalance: Math.round(openBal * 100) / 100,
      ledgerRows: rows,
      totalInvoiced: Math.round(periodInvoiced * 100) / 100,
      totalPaid: Math.round(periodPaid * 100) / 100,
      closingBalance: Math.round(closeBal * 100) / 100,
    };
  }, [payableInvoices, grnMappings, vouchers, allLedgerTransactions, selectedVendor, propertyFilter, startDate, endDate, searchQuery]);

  const handleExportCsv = () => {
    const headers = [
      "Date",
      "Document Ref #",
      "Document Type",
      "Vendor",
      "Property",
      "Description",
      "Paid / Debit (QAR)",
      "Billed / Credit (QAR)",
      "Running Payable Balance (QAR)",
    ];
    const rows = ledgerRows.map((r) => [
      r.date,
      r.refNo,
      r.docType,
      `"${r.vendorName.replace(/"/g, '""')}"`,
      `"${r.property.replace(/"/g, '""')}"`,
      `"${r.description.replace(/"/g, '""')}"`,
      r.debit.toFixed(2),
      r.credit.toFixed(2),
      r.runningBalance.toFixed(2),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Vendor_Statement_${selectedVendor.replace(/\s+/g, "_")}_${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Vendor Statement of Account CSV exported!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-xl p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 border border-violet-500/20">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Vendor Statement of Account (Supplier Ledger)</h2>
            <p className="text-xs text-muted-foreground">
              Property-isolated supplier AP bills, GRN accruals, debit notes, payment vouchers, and running payable balance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export Statement CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" /> Print SOA
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <Label className="text-[11px] text-muted-foreground">Select Supplier / Vendor</Label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger className="h-8 text-xs mt-0.5">
                  <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Vendors (Consolidated AP)</SelectItem>
                  {vendorsList.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[11px] text-muted-foreground">Property Allocation</Label>
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="h-8 text-xs mt-0.5">
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Properties</SelectItem>
                  <SelectItem value="All / Corporate">All / Corporate Office</SelectItem>
                  {propertiesList.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[11px] text-muted-foreground">From Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs mt-0.5"
              />
            </div>

            <div>
              <Label className="text-[11px] text-muted-foreground">To Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs mt-0.5"
              />
            </div>

            <div>
              <Label className="text-[11px] text-muted-foreground">Search Ref / Description</Label>
              <div className="relative mt-0.5">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Bill #, voucher #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <span className="text-[11px] uppercase font-semibold text-muted-foreground block">Opening Payable</span>
          <span className="text-lg font-bold font-mono mt-1 block">
            QR {openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </Card>
        <Card className="p-4 border-l-4 border-l-rose-500">
          <span className="text-[11px] uppercase font-semibold text-muted-foreground block">Total Billed (Credit)</span>
          <span className="text-lg font-bold font-mono text-rose-600 mt-1 block">
            +QR {totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-[11px] uppercase font-semibold text-muted-foreground block">Total Paid (Debit)</span>
          <span className="text-lg font-bold font-mono text-emerald-600 mt-1 block">
            -QR {totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </Card>
        <Card className="p-4 border-l-4 border-l-violet-600 bg-violet-500/5">
          <span className="text-[11px] uppercase font-semibold text-violet-700 dark:text-violet-300 block">
            Closing Net Payable
          </span>
          <span className="text-lg font-bold font-mono text-foreground mt-1 block">
            QR {closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </Card>
      </div>

      {/* Ledger Table */}
      <Card>
        <div className="rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs font-bold">Date</TableHead>
                <TableHead className="text-xs font-bold">Ref #</TableHead>
                <TableHead className="text-xs font-bold">Type</TableHead>
                <TableHead className="text-xs font-bold">Vendor</TableHead>
                <TableHead className="text-xs font-bold">Property</TableHead>
                <TableHead className="text-xs font-bold">Particulars / Expense Allocation</TableHead>
                <TableHead className="text-xs font-bold text-right text-emerald-600">Paid / Dr (QAR)</TableHead>
                <TableHead className="text-xs font-bold text-right text-rose-600">Billed / Cr (QAR)</TableHead>
                <TableHead className="text-xs font-bold text-right">Running Payable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-muted/20 font-medium">
                <TableCell className="text-xs font-mono">{startDate}</TableCell>
                <TableCell className="text-xs font-mono">OPEN-BAL</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    Opening
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {selectedVendor === "ALL" ? "All Vendors" : selectedVendor}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {propertyFilter === "ALL" ? "All Properties" : propertyFilter}
                </TableCell>
                <TableCell className="text-xs italic text-muted-foreground">
                  Opening Balance Brought Forward prior to {startDate}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">—</TableCell>
                <TableCell className="text-right font-mono text-xs">—</TableCell>
                <TableCell className="text-right font-mono text-xs font-bold">
                  QR {openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>

              {ledgerRows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-mono">{row.date}</TableCell>
                  <TableCell className="text-xs font-mono font-semibold text-primary">{row.refNo}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        row.docType === "AP Invoice" || row.docType === "GRN Accrual"
                          ? "border-rose-500/30 text-rose-600 bg-rose-500/5 text-[10px]"
                          : "border-emerald-500/30 text-emerald-600 bg-emerald-500/5 text-[10px]"
                      }
                    >
                      {row.docType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{row.vendorName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {row.property}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs max-w-[300px] truncate" title={row.description}>
                    {row.description}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-emerald-600 font-medium">
                    {row.debit > 0 ? `QR ${row.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-rose-600 font-medium">
                    {row.credit > 0 ? `QR ${row.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold">
                    QR {row.runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}

              {ledgerRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground text-xs">
                    No vendor transactions recorded for the selected supplier, property, and date range.
                  </TableCell>
                </TableRow>
              )}

              <TableRow className="bg-muted/60 font-bold border-t-2">
                <TableCell colSpan={6} className="text-xs">
                  CLOSING PAYABLE BALANCE ({selectedVendor === "ALL" ? "All Vendors" : selectedVendor})
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-emerald-700">
                  QR {totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-rose-700">
                  QR {totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right font-mono text-xs font-extrabold">
                  QR {closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
