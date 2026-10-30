import React, { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2, Users, Calendar, DollarSign, CheckCircle2,
  AlertCircle, Download, Printer, Plus, Trash2, ArrowRight,
  Layers, FileText, Sparkles, Filter, CheckSquare, Square,
  Building, UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "@/lib/app-data-context";
import { useFinanceStore, type ReceivableInvoice } from "@/lib/finance/finance-store";
import { getDocumentBranding } from "@/lib/document-branding";
import { AL_AMEEN_PAGE1_HEADER_BASE64 } from "@/lib/header-banner-base64";

interface BulkInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "property" | "customer";
  initialProperty?: string;
  initialCustomerId?: string;
  onSuccess?: (generatedCount: number, totalAmount: number) => void;
}

interface BatchItem {
  id: string;
  selected: boolean;
  unit: string;
  tenant: string;
  customerId?: string;
  property: string;
  leaseNumber?: string;
  baseRent: number;
  amount: number;
  stream: string;
  accountCode: string;
  invoiceNo: string;
  status: "ready" | "generated";
  isRentFree?: boolean;
  concessionNote?: string;
}

function getConcessionBillingStatus(
  l: any,
  issueDateStr: string
): { isFree: boolean; note?: string; overrideAmt?: number } {
  let override: any = null;
  try {
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("pms_custom_lease_overrides") || "{}");
      const uKey = (l?.unit || "").toString().toUpperCase().trim();
      override = stored[l?.id] || (l?.contractNumber ? stored[l?.contractNumber] : null) || (uKey ? stored[uKey] : null);
    }
  } catch (e) {}

  const hasRentFree = Boolean(
    override?.has_rent_free ??
    l?.hasRentFree ??
    l?.has_rent_free ??
    l?.rent_free_period_days ??
    l?.rentFreeDays
  );

  if (!hasRentFree) return { isFree: false };

  const rfPosition = override?.rent_free_position ?? l?.rentFreePosition ?? l?.rent_free_position ?? "FIRST_MONTH";
  const startStr = override?.commencement_date || l?.startDate || l?.commencement_date;
  const endStr = override?.expiry_date || l?.endDate || l?.expiry_date;

  if (!startStr) {
    return { isFree: true, note: "Rent-Free Concession (QR 0.00)", overrideAmt: 0 };
  }

  const sDate = new Date(startStr);
  const bDate = new Date(issueDateStr || new Date().toISOString());

  // Month 1 Concession check: same year and month as lease start
  if (rfPosition === "FIRST_MONTH") {
    const isFirstMonth = sDate.getFullYear() === bDate.getFullYear() && sDate.getMonth() === bDate.getMonth();
    if (isFirstMonth) {
      return {
        isFree: true,
        note: "Rent-Free Concession: Month 1 of 13 (Move-in Incentive)",
        overrideAmt: 0,
      };
    }
  } else if (rfPosition === "LAST_MONTH" && endStr) {
    // Month 13 Concession check: same year and month as lease expiry
    const eDate = new Date(endStr);
    const isLastMonth = eDate.getFullYear() === bDate.getFullYear() && eDate.getMonth() === bDate.getMonth();
    if (isLastMonth) {
      return {
        isFree: true,
        note: "Rent-Free Concession: Month 13 of 13 (Completion Concession)",
        overrideAmt: 0,
      };
    }
  }

  return { isFree: false };
}

const REVENUE_STREAMS = [
  { code: "41100", label: "41100 - Rental Revenue (Residential/Commercial)" },
  { code: "41400", label: "41400 - Common Area Maintenance (CAM)" },
  { code: "41300", label: "41300 - Utility & Electricity Recovery" },
  { code: "41200", label: "41200 - Parking Space / Slot Fee" },
  { code: "41500", label: "41500 - Management & Admin Fee" },
  { code: "41600", label: "41600 - Late Fee & Penalties" },
];

export function BulkInvoiceDialog({
  open,
  onOpenChange,
  defaultMode = "property",
  initialProperty = "",
  initialCustomerId = "",
  onSuccess,
}: BulkInvoiceDialogProps) {
  const { leases, units, customers } = useAppData();
  const { addReceivableInvoice, addBulkReceivableInvoices } = useFinanceStore();
  const branding = useMemo(() => getDocumentBranding(), []);
  const bannerUrl = branding.headerImageUrl || AL_AMEEN_PAGE1_HEADER_BASE64;

  const [activeTab, setActiveTab] = useState<"property" | "customer">(defaultMode);

  // Common date settings
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const defaultDueDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  }, []);

  const [issueDate, setIssueDate] = useState<string>(todayStr);
  const [dueDate, setDueDate] = useState<string>(defaultDueDate);
  const [billingPeriod, setBillingPeriod] = useState<string>(() => {
    const d = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PROPERTY-WISE STATE
  // ──────────────────────────────────────────────────────────────────────────
  const propertiesList = useMemo(() => {
    const set = new Set<string>();
    units.forEach(u => { if (u.property) set.add(u.property); });
    leases.forEach(l => { if (l.property) set.add(l.property); });
    if (set.size === 0) {
      set.add("Old Salata - Residence No:23");
      set.add("MANSOURA - BLDG06");
      set.add("Neeman's New Building");
    }
    return Array.from(set).sort();
  }, [units, leases]);

  const [selectedProperty, setSelectedProperty] = useState<string>(initialProperty || propertiesList[0] || "");
  const [propertyStream, setPropertyStream] = useState<string>("41100 - Rental Revenue (Residential/Commercial)");
  const [propertyPricingMode, setPropertyPricingMode] = useState<"lease" | "fixed">("lease");
  const [propertyFixedAmount, setPropertyFixedAmount] = useState<string>("350");

  // Property units items
  const [propertyBatchItems, setPropertyBatchItems] = useState<BatchItem[]>([]);

  // ──────────────────────────────────────────────────────────────────────────
  // CUSTOMER-WISE STATE
  // ──────────────────────────────────────────────────────────────────────────
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialCustomerId || "");
  const [customerSearchTerm, setCustomerSearchTerm] = useState<string>("");
  const [customerStream, setCustomerStream] = useState<string>("41100 - Rental Revenue (Residential/Commercial)");
  const [customerPricingMode, setCustomerPricingMode] = useState<"lease" | "fixed">("lease");
  const [customerFixedAmount, setCustomerFixedAmount] = useState<string>("500");
  const [customerBatchItems, setCustomerBatchItems] = useState<BatchItem[]>([]);

  // Batch Result modal
  const [batchResult, setBatchResult] = useState<{
    count: number;
    totalAmount: number;
    invoices: ReceivableInvoice[];
  } | null>(null);

  // Sync initial props
  useEffect(() => {
    if (initialProperty) setSelectedProperty(initialProperty);
    if (initialCustomerId) setSelectedCustomerId(initialCustomerId);
    if (defaultMode) setActiveTab(defaultMode);
  }, [initialProperty, initialCustomerId, defaultMode]);

  // ──────────────────────────────────────────────────────────────────────────
  // BUILD PROPERTY ITEMS
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedProperty) return;

    // Find all units and leases for this property
    const propUnits = units.filter(u => u.property === selectedProperty);
    const propLeases = leases.filter(l => l.property === selectedProperty);

    const items: BatchItem[] = [];
    const usedUnits = new Set<string>();

    // First use leases (has tenant, rent, lease #)
    propLeases.forEach((l, idx) => {
      usedUnits.add(l.unit);
      const baseRent = Number(l.monthlyRent) || 0;
      const concession = getConcessionBillingStatus(l, issueDate);
      const isConcession = concession.isFree && propertyPricingMode === "lease";
      const amt = isConcession ? 0 : (propertyPricingMode === "lease" ? baseRent : (parseFloat(propertyFixedAmount) || baseRent));
      const stream = isConcession ? "41100 - Rental Revenue (Rent-Free Concession Period)" : propertyStream;
      const unitClean = l.unit.replace(/[^\w]/g, "").slice(-4);
      const propCode = selectedProperty.slice(0, 4).toUpperCase().replace(/\s/g, "");
      const invNo = `INV-${new Date().getFullYear()}-${propCode}-${unitClean || idx + 101}`;

      items.push({
        id: `prop-batch-${l.id || idx}`,
        selected: true,
        unit: l.unit,
        tenant: l.tenantName || "Occupied Tenant",
        customerId: l.customerId,
        property: selectedProperty,
        leaseNumber: l.contractNumber || `LS-${l.id.slice(-4)}`,
        baseRent,
        amount: amt,
        stream: stream,
        accountCode: stream.split(/\s+/)[0] || "41100",
        invoiceNo: invNo,
        status: "ready",
        isRentFree: isConcession,
        concessionNote: concession.note,
      });
    });

    // Also include occupied units without explicit lease record
    propUnits.forEach((u, idx) => {
      if (!usedUnits.has(u.unit) && (u.status === "Occupied" || (u as any).currentTenant)) {
        const baseRent = Number(u.rent) || 5000;
        const amt = propertyPricingMode === "lease" ? baseRent : (parseFloat(propertyFixedAmount) || baseRent);
        const unitClean = u.unit.replace(/[^\w]/g, "").slice(-4);
        const propCode = selectedProperty.slice(0, 4).toUpperCase().replace(/\s/g, "");
        const invNo = `INV-${new Date().getFullYear()}-${propCode}-${unitClean || idx + 201}`;

        items.push({
          id: `prop-unit-batch-${u.id || idx}`,
          selected: true,
          unit: u.unit,
          tenant: (u as any).currentTenant || "Resident Tenant",
          property: selectedProperty,
          baseRent,
          amount: amt,
          stream: propertyStream,
          accountCode: propertyStream.split(/\s+/)[0] || "41100",
          invoiceNo: invNo,
          status: "ready",
        });
      }
    });

    // Fallback demo items if property has 0 loaded units
    if (items.length === 0) {
      for (let i = 1; i <= 5; i++) {
        const unitName = `Unit ${100 + i}`;
        const baseRent = 4500 + i * 500;
        const amt = propertyPricingMode === "lease" ? baseRent : (parseFloat(propertyFixedAmount) || baseRent);
        const propCode = selectedProperty.slice(0, 4).toUpperCase().replace(/\s/g, "");
        items.push({
          id: `prop-demo-batch-${i}`,
          selected: true,
          unit: unitName,
          tenant: `Tenant ${unitName}`,
          property: selectedProperty,
          baseRent,
          amount: amt,
          stream: propertyStream,
          accountCode: propertyStream.split(/\s+/)[0] || "41100",
          invoiceNo: `INV-${new Date().getFullYear()}-${propCode}-${100 + i}`,
          status: "ready",
        });
      }
    }

    setPropertyBatchItems(items);
  }, [selectedProperty, units, leases, propertyStream, propertyPricingMode, propertyFixedAmount]);

  // ──────────────────────────────────────────────────────────────────────────
  // BUILD CUSTOMER ITEMS
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // If a specific customer is chosen, find all their units/leases
    if (selectedCustomerId) {
      const cust = customers.find(c => String(c.id) === selectedCustomerId || c.name === selectedCustomerId || c.customerId === selectedCustomerId);
      const custName = cust?.name || selectedCustomerId;

      const custLeases = leases.filter(l => l.customerId === selectedCustomerId || l.tenantName === custName);

      const items: BatchItem[] = [];
      if (custLeases.length > 0) {
        custLeases.forEach((l, idx) => {
          const baseRent = Number(l.monthlyRent) || 0;
          const concession = getConcessionBillingStatus(l, issueDate);
          const isConcession = concession.isFree && customerPricingMode === "lease";
          const amt = isConcession ? 0 : (customerPricingMode === "lease" ? baseRent : (parseFloat(customerFixedAmount) || baseRent));
          const stream = isConcession ? "41100 - Rental Revenue (Rent-Free Concession Period)" : customerStream;
          const custCode = (cust?.customerId || cust?.id || idx).toString().slice(-4).toUpperCase();
          const invNo = `INV-CUST-${custCode}-${idx + 101}`;

          items.push({
            id: `cust-lease-${l.id || idx}`,
            selected: true,
            unit: l.unit,
            tenant: custName,
            customerId: cust?.customerId || cust?.id,
            property: l.property,
            leaseNumber: l.contractNumber || `LS-${l.id.slice(-4)}`,
            baseRent,
            amount: amt,
            stream: stream,
            accountCode: stream.split(/\s+/)[0] || "41100",
            invoiceNo: invNo,
            status: "ready",
            isRentFree: isConcession,
            concessionNote: concession.note,
          });
        });
      } else {
        // Fallback for customer without explicit lease record
        const baseRent = 6500;
        const amt = customerPricingMode === "lease" ? baseRent : (parseFloat(customerFixedAmount) || baseRent);
        items.push({
          id: `cust-default-${Date.now()}`,
          selected: true,
          unit: "Flat 16",
          tenant: custName,
          customerId: cust?.customerId || cust?.id,
          property: "Old Salata - Residence No:23",
          baseRent,
          amount: amt,
          stream: customerStream,
          accountCode: customerStream.split(/\s+/)[0] || "41100",
          invoiceNo: `INV-CUST-${Math.floor(1000 + Math.random() * 9000)}`,
          status: "ready",
        });
      }
      setCustomerBatchItems(items);
    } else {
      // All customers batch (multi-customer billing)
      const activeCustomers = customers.slice(0, 15);
      const items: BatchItem[] = activeCustomers.map((c, idx) => {
        const lease = leases.find(l => l.customerId === c.id || l.tenantName === c.name);
        const baseRent = lease ? Number(lease.monthlyRent) : 5500;
        const amt = customerPricingMode === "lease" ? baseRent : (parseFloat(customerFixedAmount) || baseRent);
        const custCode = (c.customerId || c.id || idx).toString().slice(-4).toUpperCase();
        return {
          id: `cust-multi-${c.id || idx}`,
          selected: true,
          unit: lease?.unit || "Unit A",
          tenant: c.name,
          customerId: c.customerId || c.id,
          property: lease?.property || "MANSOURA - BLDG06",
          leaseNumber: lease?.contractNumber || `LS-${idx + 101}`,
          baseRent,
          amount: amt,
          stream: customerStream,
          accountCode: customerStream.split(/\s+/)[0] || "41100",
          invoiceNo: `INV-CUST-${custCode}-${idx + 101}`,
          status: "ready",
        };
      });
      setCustomerBatchItems(items);
    }
  }, [selectedCustomerId, customers, leases, customerStream, customerPricingMode, customerFixedAmount]);

  // ──────────────────────────────────────────────────────────────────────────
  // TOGGLES & AMOUNTS
  // ──────────────────────────────────────────────────────────────────────────
  const toggleSelectAllProperty = (checked: boolean) => {
    setPropertyBatchItems(prev => prev.map(item => ({ ...item, selected: checked })));
  };

  const toggleSelectPropertyItem = (id: string) => {
    setPropertyBatchItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const updatePropertyItemAmount = (id: string, newAmt: number) => {
    setPropertyBatchItems(prev => prev.map(item => item.id === id ? { ...item, amount: newAmt } : item));
  };

  const toggleSelectAllCustomer = (checked: boolean) => {
    setCustomerBatchItems(prev => prev.map(item => ({ ...item, selected: checked })));
  };

  const toggleSelectCustomerItem = (id: string) => {
    setCustomerBatchItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const updateCustomerItemAmount = (id: string, newAmt: number) => {
    setCustomerBatchItems(prev => prev.map(item => item.id === id ? { ...item, amount: newAmt } : item));
  };

  // ──────────────────────────────────────────────────────────────────────────
  // METRICS
  // ──────────────────────────────────────────────────────────────────────────
  const currentItems = activeTab === "property" ? propertyBatchItems : customerBatchItems;
  const selectedItems = useMemo(() => currentItems.filter(i => i.selected), [currentItems]);
  const totalAmountSelected = useMemo(() => selectedItems.reduce((acc, i) => acc + (Number(i.amount) || 0), 0), [selectedItems]);

  // ──────────────────────────────────────────────────────────────────────────
  // GENERATE BULK INVOICES
  // ──────────────────────────────────────────────────────────────────────────
  const handleGenerateBulk = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one unit/customer to generate invoices.");
      return;
    }

    const newInvoices: Omit<ReceivableInvoice, "id" | "status">[] = selectedItems.map(item => ({
      invoice_no: item.invoiceNo,
      tenant: item.tenant,
      property: item.property,
      unit: item.unit,
      date: issueDate,
      due_date: dueDate,
      stream: item.isRentFree ? `Monthly Rental - Concession Period (${item.concessionNote || 'Rent-Free Concession'})` : item.stream,
      account_code: item.accountCode,
      amount: item.amount,
      customerId: item.customerId,
      billingPeriod,
    }));

    // Post to FinanceStore
    if (addBulkReceivableInvoices) {
      addBulkReceivableInvoices(newInvoices);
    } else {
      newInvoices.forEach(inv => addReceivableInvoice(inv));
    }

    const createdList: ReceivableInvoice[] = newInvoices.map((inv, idx) => ({
      ...inv,
      id: `ar-bulk-${Date.now()}-${idx}`,
      status: (inv.amount === 0 ? "Paid" : "Pending") as any,
    }));

    setBatchResult({
      count: selectedItems.length,
      totalAmount: totalAmountSelected,
      invoices: createdList,
    });

    toast.success(`Successfully generated ${selectedItems.length} invoices amounting to QAR ${totalAmountSelected.toLocaleString()}!`);

    if (onSuccess) {
      onSuccess(selectedItems.length, totalAmountSelected);
    }
  };

  // Print Batch Summary
  const handlePrintBatch = () => {
    window.print();
  };

  // Export Batch CSV
  const handleExportBatchCSV = () => {
    const rows = [
      [`BULK INVOICE BATCH REGISTER - ${branding.companyName || "Al Ameen Real Estate"}`],
      [`Billing Entity: ${branding.legalEntityName || "Al Ameen Real Estate W.L.L"} | Cycle: ${billingPeriod} | Generated: ${new Date().toISOString().split("T")[0]}`],
      [],
      ["Invoice Number", "Issue Date", "Due Date", "Period", "Customer / Tenant", "Property", "Unit", "Stream", "GL Account", "Amount (QAR)", "Status"],
      ...selectedItems.map(item => [
        item.invoiceNo,
        issueDate,
        dueDate,
        billingPeriod,
        `"${item.tenant}"`,
        `"${item.property}"`,
        item.unit,
        `"${item.stream}"`,
        item.accountCode,
        item.amount,
        "Pending",
      ]),
    ];

    const csvContent = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bulk-invoices-${activeTab}-${issueDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully.");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 rounded-xl border shadow-2xl flex flex-col">
          {/* Header */}
          <DialogHeader className="p-6 border-b bg-gradient-to-r from-primary/10 via-background to-muted/40 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>Bulk Invoice Generation Engine</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Generate periodic accounts receivable invoices in bulk for <strong className="text-foreground">{branding.companyName || "Al Ameen Real Estate"}</strong>.
                </DialogDescription>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-semibold text-xs px-2.5 py-1 bg-background/80 text-primary border-primary/30">
                  <Building2 className="h-3 w-3 mr-1" /> {branding.companyName || "Al Ameen Real Estate"}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs px-2.5 py-1 bg-background/80">
                  Cycle: {billingPeriod}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          {/* Mode Selector Tabs */}
          <div className="p-6 pb-2 space-y-4">
            <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid grid-cols-2 w-full max-w-md h-10 p-1 bg-muted/80">
                <TabsTrigger value="property" className="text-xs font-semibold gap-2">
                  <Building2 className="h-4 w-4" /> Property-Wise Bulk
                </TabsTrigger>
                <TabsTrigger value="customer" className="text-xs font-semibold gap-2">
                  <Users className="h-4 w-4" /> Customer-Wise Bulk
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Global Configuration Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg border bg-muted/20 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-primary" /> Billing Period / Month
                </Label>
                <Input
                  className="h-8 text-xs font-medium bg-background"
                  value={billingPeriod}
                  placeholder="e.g. November 2026"
                  onChange={e => setBillingPeriod(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">Invoice Issue Date</Label>
                <Input
                  type="date"
                  className="h-8 text-xs bg-background font-mono"
                  value={issueDate}
                  onChange={e => setIssueDate(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">Payment Due Date</Label>
                <Input
                  type="date"
                  className="h-8 text-xs bg-background font-mono"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* ── TAB 1: PROPERTY-WISE ── */}
            {activeTab === "property" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Property Selector */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-primary" /> Select Property *
                    </Label>
                    <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                      <SelectTrigger className="h-8 text-xs bg-background font-medium">
                        <SelectValue placeholder="Select target property" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertiesList.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Revenue Stream */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Revenue Stream GL</Label>
                    <Select value={propertyStream} onValueChange={setPropertyStream}>
                      <SelectTrigger className="h-8 text-xs bg-background font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REVENUE_STREAMS.map(s => (
                          <SelectItem key={s.code} value={s.label}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pricing Rule */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Pricing Calculation</Label>
                    <div className="flex gap-2">
                      <Select value={propertyPricingMode} onValueChange={v => setPropertyPricingMode(v as any)}>
                        <SelectTrigger className="h-8 text-xs bg-background flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lease">Lease Contract Rent</SelectItem>
                          <SelectItem value="fixed">Uniform Fixed Fee</SelectItem>
                        </SelectContent>
                      </Select>
                      {propertyPricingMode === "fixed" && (
                        <Input
                          type="number"
                          className="h-8 w-24 text-xs font-mono bg-background"
                          value={propertyFixedAmount}
                          placeholder="QAR"
                          onChange={e => setPropertyFixedAmount(e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Property Stats Banner */}
                <div className="flex items-center justify-between p-3 rounded-lg border bg-primary/5 text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="font-bold text-foreground">{selectedProperty}</span>
                    </div>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-muted-foreground">Units in property: <strong className="text-foreground">{propertyBatchItems.length}</strong></span>
                    <span className="text-muted-foreground">Selected for billing: <strong className="text-primary font-bold">{selectedItems.length}</strong></span>
                  </div>

                  <div className="font-mono text-xs">
                    Total Amount: <strong className="text-sm font-bold text-primary">QAR {totalAmountSelected.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: CUSTOMER-WISE ── */}
            {activeTab === "customer" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Customer Selector */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-primary" /> Select Customer / Scope
                    </Label>
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger className="h-8 text-xs bg-background font-medium">
                        <SelectValue placeholder="All Customers (Batch Mode)" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="">All Customers (Batch Mode - 15)</SelectItem>
                        {customers.map(c => (
                          <SelectItem key={c.id || c.customerId || c.name} value={String(c.id || c.customerId || c.name)}>
                            {c.name} {c.customerId ? `(${c.customerId})` : ""} &bull; {c.type === "company" ? "Corp" : "Ind"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Revenue Stream */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Revenue Stream GL</Label>
                    <Select value={customerStream} onValueChange={setCustomerStream}>
                      <SelectTrigger className="h-8 text-xs bg-background font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REVENUE_STREAMS.map(s => (
                          <SelectItem key={s.code} value={s.label}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pricing Rule */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Pricing Calculation</Label>
                    <div className="flex gap-2">
                      <Select value={customerPricingMode} onValueChange={v => setCustomerPricingMode(v as any)}>
                        <SelectTrigger className="h-8 text-xs bg-background flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lease">Lease Contract Rent</SelectItem>
                          <SelectItem value="fixed">Uniform Fixed Fee</SelectItem>
                        </SelectContent>
                      </Select>
                      {customerPricingMode === "fixed" && (
                        <Input
                          type="number"
                          className="h-8 w-24 text-xs font-mono bg-background"
                          value={customerFixedAmount}
                          placeholder="QAR"
                          onChange={e => setCustomerFixedAmount(e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer Scope Banner */}
                <div className="flex items-center justify-between p-3 rounded-lg border bg-primary/5 text-xs">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">
                      {selectedCustomerId
                        ? `Customer: ${customers.find(c => String(c.id) === selectedCustomerId || c.name === selectedCustomerId || c.customerId === selectedCustomerId)?.name || selectedCustomerId}`
                        : "Scope: Multi-Customer Portfolio Invoicing"}
                    </span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-muted-foreground">Accounts to bill: <strong className="text-foreground">{customerBatchItems.length}</strong></span>
                    <span className="text-muted-foreground">Selected: <strong className="text-primary font-bold">{selectedItems.length}</strong></span>
                  </div>

                  <div className="font-mono text-xs">
                    Total Amount: <strong className="text-sm font-bold text-primary">QAR {totalAmountSelected.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Batch Table Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => activeTab === "property" ? toggleSelectAllProperty(true) : toggleSelectAllCustomer(true)}
                  className="h-7 text-xs gap-1"
                >
                  <CheckSquare className="h-3 w-3" /> Select All ({currentItems.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => activeTab === "property" ? toggleSelectAllProperty(false) : toggleSelectAllCustomer(false)}
                  className="h-7 text-xs gap-1"
                >
                  <Square className="h-3 w-3" /> Deselect All
                </Button>
              </div>

              <div className="text-xs text-muted-foreground font-medium">
                Amounts in the grid can be edited directly prior to batch generation.
              </div>
            </div>

            {/* Invoices Preview Table */}
            <div className="border rounded-lg overflow-hidden max-h-72 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/60 text-xs">
                    <TableHead className="w-10 text-center font-bold">#</TableHead>
                    <TableHead className="w-10 text-center"></TableHead>
                    <TableHead className="font-bold">Unit</TableHead>
                    <TableHead className="font-bold">Tenant / Customer</TableHead>
                    <TableHead className="font-bold">Property</TableHead>
                    <TableHead className="font-bold">Lease / Ref</TableHead>
                    <TableHead className="font-bold">Invoice #</TableHead>
                    <TableHead className="text-right font-bold">Base Rent</TableHead>
                    <TableHead className="text-right font-bold">Billed Amount (QAR)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-xs text-muted-foreground">
                        No units or accounts found for this selection.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((item, idx) => (
                      <TableRow
                        key={item.id}
                        className={`text-xs hover:bg-muted/30 transition-colors ${item.selected ? "bg-background" : "opacity-50 bg-muted/10"}`}
                      >
                        <TableCell className="text-center font-mono text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={item.selected}
                            onCheckedChange={() => activeTab === "property" ? toggleSelectPropertyItem(item.id) : toggleSelectCustomerItem(item.id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono font-bold text-foreground">
                          <div className="flex items-center gap-1.5">
                            <span>{item.unit}</span>
                            {item.isRentFree && (
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 whitespace-nowrap"
                                title={item.concessionNote || "Rent-Free Concession Period"}
                              >
                                🎁 Free (QAR 0)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-foreground max-w-[180px] truncate" title={item.tenant}>
                          {item.tenant}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[160px] truncate" title={item.property}>
                          {item.property}
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-muted-foreground">{item.leaseNumber || "—"}</TableCell>
                        <TableCell className="font-mono text-xs text-primary font-bold">{item.invoiceNo}</TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {item.baseRent.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            className="h-7 w-28 text-right font-mono font-bold text-xs bg-background inline-block"
                            value={item.amount}
                            onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              if (activeTab === "property") {
                                updatePropertyItemAmount(item.id, val);
                              } else {
                                updateCustomerItemAmount(item.id, val);
                              }
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Dialog Footer Actions */}
          <DialogFooter className="p-4 px-6 border-t bg-muted/40 flex items-center justify-between sm:justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Ready to generate:</span>
              <Badge variant="outline" className="font-bold text-primary font-mono text-xs">
                {selectedItems.length} Invoices &bull; QAR {totalAmountSelected.toLocaleString()}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleGenerateBulk}
                disabled={selectedItems.length === 0}
                className="gap-2 bg-primary text-primary-foreground font-semibold shadow-md"
              >
                <Sparkles className="h-4 w-4" />
                Generate {selectedItems.length} Invoices
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation & Batch Action Summary Modal */}
      {batchResult && (
        <Dialog open={Boolean(batchResult)} onOpenChange={() => setBatchResult(null)}>
          <DialogContent className="max-w-xl p-6 border shadow-2xl rounded-xl">
            <div className="text-center space-y-3 py-2">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Bulk Invoices Generated &amp; Posted!</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Successfully created and registered <strong>{batchResult.count} accounts receivable invoices</strong> totaling{" "}
                <strong className="text-foreground font-mono">QAR {batchResult.totalAmount.toLocaleString()}</strong> to the tenant sub-ledgers.
              </p>

              <div className="p-3 rounded-lg border bg-muted/30 text-xs font-mono grid grid-cols-2 gap-2 text-left my-4">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Biller / Landlord:</span>
                  <span className="font-bold text-foreground">{branding.companyName || "Al Ameen Real Estate"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Batch Period:</span>
                  <span className="font-bold text-foreground">{billingPeriod}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Posting Status:</span>
                  <span className="text-emerald-600 font-bold">Posted to AR (12413)</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Invoices Count:</span>
                  <span className="font-bold text-foreground">{batchResult.count}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Total Billed:</span>
                  <span className="font-bold text-primary font-mono text-sm">QAR {batchResult.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Printable Bulk Invoice Batch Register for Print / PDF */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  @page {
                    size: A4 landscape;
                    margin: 8mm;
                  }
                  html, body {
                    overflow: visible !important;
                    height: auto !important;
                    background: #ffffff !important;
                  }
                  body * { visibility: hidden; }
                  #printable-bulk-invoices, #printable-bulk-invoices * { 
                    visibility: visible; 
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  #printable-bulk-invoices { 
                    display: block !important;
                    position: absolute; 
                    left: 0; 
                    top: 0; 
                    width: 100%; 
                    padding: 0; 
                    margin: 0;
                    background: #ffffff !important;
                  }
                }
              `}} />
              <div id="printable-bulk-invoices" className="hidden text-left text-foreground bg-white p-6 space-y-4">
                <div className="w-full rounded-lg overflow-hidden border border-border/40 shadow-xs max-h-24 mb-3 bg-white flex items-center justify-center">
                  <img
                    src={bannerUrl}
                    alt={branding.companyName || "Al Ameen Real Estate"}
                    className="w-full h-auto max-h-24 object-contain"
                  />
                </div>
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-primary">{branding.companyName || "Al Ameen Real Estate"}</h2>
                    <p className="text-xs text-muted-foreground">{branding.legalEntityName || "Al Ameen Real Estate W.L.L"} &bull; Accounts Receivable Department</p>
                    <p className="text-[11px] text-muted-foreground">CR: {branding.crNumber || "CR-90821-QA"} &bull; Tel: {branding.phone || "+974 4492 8800"}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-xs uppercase px-2.5 py-1 bg-primary/10 text-primary rounded">
                      BULK INVOICE BATCH
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">Period: {billingPeriod}</p>
                    <p className="text-xs text-muted-foreground">Date: {issueDate}</p>
                  </div>
                </div>

                <table className="w-full text-xs border">
                  <thead>
                    <tr className="bg-muted text-muted-foreground border-b text-[11px]">
                      <th className="p-2 text-left">Invoice No</th>
                      <th className="p-2 text-left">Tenant / Customer</th>
                      <th className="p-2 text-left">Property &amp; Unit</th>
                      <th className="p-2 text-left">Revenue Stream</th>
                      <th className="p-2 text-right">Amount (QAR)</th>
                      <th className="p-2 text-left">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchResult.invoices.map((inv, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2 font-mono font-bold text-primary">{inv.invoice_no}</td>
                        <td className="p-2 font-medium">{inv.tenant}</td>
                        <td className="p-2 text-muted-foreground">{inv.property} - {inv.unit}</td>
                        <td className="p-2 text-muted-foreground">{inv.stream}</td>
                        <td className="p-2 text-right font-mono font-bold">{inv.amount?.toLocaleString()}</td>
                        <td className="p-2 font-mono text-muted-foreground">{inv.due_date}</td>
                      </tr>
                    ))}
                    <tr className="bg-muted/40 font-bold border-t">
                      <td colSpan={4} className="p-2 text-right">Total Invoiced:</td>
                      <td className="p-2 text-right font-mono text-primary text-sm">
                        QAR {batchResult.totalAmount.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex justify-between items-end pt-4 text-xs border-t">
                  <div>
                    <p className="font-semibold text-muted-foreground">Prepared By: Finance Cashier / Billing Officer</p>
                    <p className="text-[10px] text-muted-foreground">Generated via {branding.companyName || "Al Ameen Real Estate"} PMS Billing Engine</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">For {branding.companyName || "Al Ameen Real Estate"}</p>
                    <div className="h-10 border border-dashed rounded px-4 py-1 text-[10px] font-mono text-muted-foreground flex items-center justify-center mt-1">
                      [AUTHORIZED FINANCE STAMP]
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={handleExportBatchCSV} className="gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" /> Export Batch CSV
                </Button>
                <Button size="sm" variant="outline" onClick={handlePrintBatch} className="gap-1.5 text-xs">
                  <Printer className="h-3.5 w-3.5" /> Print Invoices
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setBatchResult(null);
                    onOpenChange(false);
                  }}
                  className="bg-primary text-primary-foreground text-xs"
                >
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
