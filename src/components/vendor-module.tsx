import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Users, Plus, Pencil, Trash2, RefreshCw, Search, Building2,
  Phone, Mail, CreditCard, Star, CheckCircle2, AlertTriangle,
  FileText, Shield, ShieldCheck, Banknote, TrendingUp, BarChart3, Activity,
  ChevronRight, Info, CheckCheck, Clock, DollarSign,
  Upload, History, ShoppingBag, Eye, FileUp, Paperclip, FileCheck, Layers,
  FileSpreadsheet, Download, Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FinVendorsApi, type FinVendor } from "@/lib/supabase-finance";
import { ApInvoicesApi, type ProcApInvoice, type PaymentReceipt } from "@/lib/proc-invoices-api";
import { PaymentReceiptDialog } from "@/components/payment-receipt-dialog";
import { ProformaInvoiceDialog } from "@/components/proforma-invoice-dialog";
import { formatDDMMMYYYY } from "@/lib/date-utils";

// ── Types ──────────────────────────────────────────────────────────────────────
type VendorContact = { id: string; vendor_id: string | number; name: string; role: string; phone?: string; email?: string; is_primary: boolean; };
type VendorBankDetail = { id: string; vendor_id: string | number; bank_name: string; account_name: string; account_number: string; iban?: string; swift_code?: string; currency: string; };
type VendorQualification = { id: string; vendor_id: string | number; category: string; certification?: string; expiry_date?: string; status: "Active" | "Expired" | "Pending"; notes?: string; };
type APInvoice = ProcApInvoice;

// ── Nav tabs ───────────────────────────────────────────────────────────────────
const VENDOR_TABS = [
  { key: "master",        label: "Vendor Master",      icon: Users,      color: "text-violet-500" },
  { key: "invoices",      label: "AP Invoices",        icon: FileText,   color: "text-cyan-500"   },
  { key: "advances",      label: "Vendor Advances",    icon: DollarSign, color: "text-emerald-500"},
  { key: "payments",      label: "Payment History",    icon: CreditCard, color: "text-rose-500"   },
  { key: "performance",   label: "Supplier Scorecard", icon: TrendingUp, color: "text-indigo-500" },
] as const;
type VendorTabKey = typeof VENDOR_TABS[number]["key"];

function statusVariant(s: string): "default" | "destructive" | "secondary" | "outline" {
  if (["Active", "PAID", "APPROVED", "MATCHED"].includes(s)) return "default";
  if (["Expired", "DISPUTED", "Blacklisted"].includes(s)) return "destructive";
  if (["Pending", "DRAFT", "PARTIAL"].includes(s)) return "secondary";
  return "outline";
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-semibold">{label}</Label>{children}</div>;
}
function postAdvanceVoucherToGL(params: {
  amount: number;
  vendorId: string | number;
  vendorName: string;
  paymentMode: string;
  reference?: string;
  date?: string;
  purpose?: string;
}) {
  const isCash = params.paymentMode.toLowerCase().includes("cash") || params.paymentMode.toLowerCase().includes("petty");
  const crCode = isCash ? "12100001" : "12000001";
  const crName = isCash ? "Cash in Hand (Office Vault)" : "Bank Operating Account (QNB)";
  const vDate = params.date || new Date().toISOString().slice(0, 10);
  const refNo = params.reference || `ADV-TXN-${Date.now().toString().slice(-6)}`;
  const pvNo = `PV-ADV-${Date.now().toString().slice(-6)}`;

  const newVoucher = {
    id: `vchr-adv-${Date.now()}`,
    voucher_no: pvNo,
    voucher_type: "Payment Voucher",
    date: vDate,
    name: `Vendor Advance Disbursement — ${params.vendorName} (${params.purpose || "Mobilization / Pre-payment"})`,
    debit: "Advance to Vendors",
    debit_code: "12300001",
    credit: crName,
    credit_code: crCode,
    amount: params.amount,
    method: isCash ? "Cash" : "Bank Transfer",
    property_name: "Main Portfolio",
    unit_ref: refNo,
    tenant_name: params.vendorName,
    status: "Posted",
    lines: [
      { account_code: "12300001", account_name: "Advance to Vendors", debit: params.amount, credit: 0, description: `Advance to ${params.vendorName}` },
      { account_code: crCode, account_name: crName, debit: 0, credit: params.amount, description: `Disbursement via ${params.paymentMode}` }
    ]
  };

  try {
    const k1 = "zyno-pms-finance-data-v1-vouchers";
    const k2 = "zyno_finance_vouchers";
    const existing1 = JSON.parse(localStorage.getItem(k1) || "[]");
    const existing2 = JSON.parse(localStorage.getItem(k2) || "[]");
    localStorage.setItem(k1, JSON.stringify([newVoucher, ...existing1]));
    localStorage.setItem(k2, JSON.stringify([newVoucher, ...existing2]));
  } catch (e) {
    console.error("Failed to store voucher locally", e);
  }

  // Also record in supabase if available
  try {
    supabase.from("fin_vouchers").insert({
      voucher_number: pvNo,
      voucher_date: vDate,
      voucher_type: "Payment Voucher",
      reference_no: refNo,
      description: `Vendor Advance Disbursement to ${params.vendorName}`,
      total_amount: params.amount,
      status: "POSTED"
    }).then(() => {});
  } catch {}

  window.dispatchEvent(new CustomEvent("finance_vouchers_updated"));
  window.dispatchEvent(new CustomEvent("ap_invoices_updated"));
}

function EmptyState({ text }: { text: string }) {
  return <div className="border border-dashed rounded-lg p-10 text-center text-sm text-muted-foreground">{text}</div>;
}
function ScoreBar({ score, color = "bg-emerald-500" }: { score: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, score)}%` }} />
      </div>
      <span className="text-xs font-mono font-bold w-8 text-right">{score}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export function VendorModule({ role }: { role: "admin" | "prop-mgr" }) {
  const routerSearch = useRouterState({ select: (s) => s.location.search }) as Record<string, any>;
  const activeTab: VendorTabKey = (typeof routerSearch?.tab === "string" ? routerSearch.tab : "master") as VendorTabKey;

  // ── State ──────────────────────────────────────────────────────────────────
  const [vendors, setVendors] = useState<FinVendor[]>([]);
  const [contacts, setContacts] = useState<VendorContact[]>([]);
  const [bankDetails, setBankDetails] = useState<VendorBankDetail[]>([]);
  const [qualifications, setQualifications] = useState<VendorQualification[]>([]);
  const [apInvoices, setApInvoices] = useState<APInvoice[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<APInvoice | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editVendor, setEditVendor] = useState<FinVendor | null>(null);
  const [bulkVendorOpen, setBulkVendorOpen] = useState(false);
  const [bulkVendorData, setBulkVendorData] = useState("");
  const [bulkVendorLoading, setBulkVendorLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showQualModal, setShowQualModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({
    vendorId: "",
    amount: "0",
    date: new Date().toISOString().slice(0, 10),
    paymentMode: "Bank Wire / QNB Corporate Electronic",
    reference: "",
    purpose: "Contract Advance / Procurement Mobilization",
    remarks: "",
  });
  const [paymentTargetInv, setPaymentTargetInv] = useState<APInvoice | null>(null);
  const [payModalStep, setPayModalStep] = useState<number>(1);
  const [advanceHistoryVendor, setAdvanceHistoryVendor] = useState<FinVendor | null>(null);
  const [showAdvanceHistoryModal, setShowAdvanceHistoryModal] = useState<boolean>(false);
  const [ordersVendor, setOrdersVendor] = useState<FinVendor | null>(null);
  const [showOrdersModal, setShowOrdersModal] = useState<boolean>(false);
  const [vendorPos, setVendorPos] = useState<any[]>([]);
  const [vendorPayForm, setVendorPayForm] = useState({
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "Bank Wire / QNB Corporate Electronic",
    disbursingBank: "Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)",
    transactionReference: "",
    beneficiaryAccount: "",
    cashReceiptNo: "",
    receiverName: "",
    chequeNumber: "",
    chequeDueDate: new Date().toISOString().slice(0, 10),
    remarks: "",
    paymentAmount: 0 as number,
    applyAdvance: false,
    advanceAmount: 0 as number,
  });

  const [vendorStep, setVendorStep] = useState<number>(1);
  const [vendorForm, setVendorForm] = useState({
    // Step 1: Master
    code: "", name: "", contact_person: "", email: "", phone: "", tax_number: "", address: "", city: "", country: "Qatar", vendor_type: "Supplier", payment_terms: "Net 30 Days", settlement_mode: "Bank Wire / Electronic Transfer (QNB)", currency: "QAR", status: "Active" as "Active" | "Inactive" | "Blacklisted", notes: "",
    // Tax Details & Document Uploads
    tax_rate: "0", tax_registration_date: new Date().toISOString().slice(0, 10), cr_expiry_date: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
    terms_doc_name: "", company_profile_name: "", tax_cert_name: "",
    // Step 2: Contact
    contact_name: "", contact_role: "", contact_phone: "", contact_email: "", contact_primary: true,
    // Step 3: Qualification
    qual_category: "General Maintenance", qual_certification: "", qual_expiry: "", qual_status: "Active" as "Active" | "Expired" | "Pending", qual_notes: "",
    // Step 4: Bank Details
    bank_name: "", bank_account_name: "", bank_account_number: "", bank_iban: "", bank_swift: "", bank_currency: "QAR"
  });
  const [contactForm, setContactForm] = useState({ vendorId: "", name: "", role: "", phone: "", email: "", is_primary: false });
  const [bankForm, setBankForm] = useState({ vendorId: "", bank_name: "", account_name: "", account_number: "", iban: "", swift_code: "", currency: "QAR" });
  const [qualForm, setQualForm] = useState({ vendorId: "", category: "", certification: "", expiry_date: "", status: "Active" as "Active" | "Expired" | "Pending", notes: "" });
  const [invoiceForm, setInvoiceForm] = useState({
    vendorId: "",
    invoice_number: "",
    po_number: "",
    grn_number: "",
    invoice_date: new Date().toISOString().slice(0, 10),
    due_date: "",
    amount: "0",
    tax_amount: "0",
    payment_terms: "Net 30 Days",
    settlement_mode: "Bank Wire / Electronic Transfer (QNB)",
    remarks: ""
  });

  // ── Load ───────────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, cRes, bRes, qRes, iRes, poRes] = await Promise.all([
        FinVendorsApi.fetchAll().catch(() => []),
        (async () => { try { const r = await supabase.from("vendor_contacts").select("*").order("is_primary", { ascending: false }); return r.data || []; } catch { return []; } })(),
        (async () => { try { const r = await supabase.from("vendor_bank_details").select("*"); return r.data || []; } catch { return []; } })(),
        (async () => { try { const r = await supabase.from("vendor_qualifications").select("*"); return r.data || []; } catch { return []; } })(),
        ApInvoicesApi.fetchAll().catch(() => []),
        (async () => { try { const r = await supabase.from("proc_purchase_orders").select("*").order("created_at", { ascending: false }); return r.data || []; } catch { return []; } })(),
      ]);
      setVendorPos(poRes || []);
      setVendors(vRes || []);
      setContacts(cRes || []);
      setBankDetails(bRes || []);
      setQualifications(qRes || []);
      setApInvoices([]);
    } catch (e: any) { toast.error("Load failed: " + e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadAll();
    const handleUpdate = () => loadAll();
    window.addEventListener('ap_invoices_updated', handleUpdate);
    return () => window.removeEventListener('ap_invoices_updated', handleUpdate);
  }, [loadAll]);

  // ── Vendor CRUD ────────────────────────────────────────────────────────────
  function openNewVendor() {
    setEditVendor(null);
    setVendorStep(1);
    setVendorForm({
      code: "VND-" + String(Date.now()).slice(-4), name: "", contact_person: "", email: "", phone: "", tax_number: "", address: "", city: "", country: "Qatar", vendor_type: "Supplier", payment_terms: "Net 30 Days", settlement_mode: "Bank Wire / Electronic Transfer (QNB)", currency: "QAR", status: "Active", notes: "",
      tax_rate: "0", tax_registration_date: new Date().toISOString().slice(0, 10), cr_expiry_date: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      terms_doc_name: "", company_profile_name: "", tax_cert_name: "",
      contact_name: "", contact_role: "Account Manager", contact_phone: "", contact_email: "", contact_primary: true,
      qual_category: "General Maintenance", qual_certification: "Commercial Registration", qual_expiry: "", qual_status: "Active", qual_notes: "",
      bank_name: "", bank_account_name: "", bank_account_number: "", bank_iban: "", bank_swift: "", bank_currency: "QAR"
    });
    setShowVendorModal(true);
  }
  function openEditVendor(v: FinVendor) {
    setEditVendor(v);
    setVendorStep(1);
    setVendorForm({
      code: v.code || "", name: v.name || "", contact_person: v.contact_person || "", email: v.email || "", phone: v.phone || "", tax_number: v.tax_number || "", address: (v as any).address || "", city: (v as any).city || "", country: (v as any).country || "Qatar", vendor_type: (v as any).vendor_type || "Supplier", payment_terms: (v as any).payment_terms || "Net 30 Days", settlement_mode: (v as any).settlement_mode || "Bank Wire / Electronic Transfer (QNB)", currency: (v as any).currency || "QAR", status: (v.status as any) || "Active", notes: (v as any).notes || "",
      tax_rate: "0", tax_registration_date: new Date().toISOString().slice(0, 10), cr_expiry_date: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      terms_doc_name: "", company_profile_name: "", tax_cert_name: "",
      contact_name: "", contact_role: "", contact_phone: "", contact_email: "", contact_primary: true,
      qual_category: "", qual_certification: "", qual_expiry: "", qual_status: "Active", qual_notes: "",
      bank_name: "", bank_account_name: "", bank_account_number: "", bank_iban: "", bank_swift: "", bank_currency: "QAR"
    });
    setShowVendorModal(true);
  }
  async function handleSaveVendor() {
    if (!vendorForm.code.trim() || !vendorForm.name.trim()) return toast.error("Vendor Code and Name are required.");
    setSaving(true);
    try {
      const payload = { code: vendorForm.code, name: vendorForm.name, contact_person: vendorForm.contact_person || null, email: vendorForm.email || null, phone: vendorForm.phone || null, tax_number: vendorForm.tax_number || null, address: vendorForm.address || null, city: vendorForm.city || null, country: vendorForm.country, vendor_type: vendorForm.vendor_type, payment_terms: vendorForm.payment_terms, settlement_mode: vendorForm.settlement_mode, currency: vendorForm.currency, status: vendorForm.status, notes: vendorForm.notes || null };
      if (editVendor) {
        const { error } = await supabase.from("fin_vendors").update(payload).eq("id", editVendor.id);
        if (error) throw error;
        toast.success(`${vendorForm.name} updated.`);
      } else {
        const { data: createdVendor, error } = await supabase.from("fin_vendors").insert(payload).select().single();
        if (error) throw error;
        const vId = createdVendor.id;

        // Auto-insert Step 2 Contact if provided
        if (vendorForm.contact_name.trim()) {
          try {
            await supabase.from("vendor_contacts").insert({
              vendor_id: vId,
              name: vendorForm.contact_name,
              role: vendorForm.contact_role || "Primary Contact",
              phone: vendorForm.contact_phone || vendorForm.phone || null,
              email: vendorForm.contact_email || vendorForm.email || null,
              is_primary: vendorForm.contact_primary
            });
          } catch {}
        }

        // Auto-insert Step 3 Qualification if provided
        if (vendorForm.qual_category.trim()) {
          try {
            await supabase.from("vendor_qualifications").insert({
              vendor_id: vId,
              category: vendorForm.qual_category,
              certification: vendorForm.qual_certification || null,
              expiry_date: vendorForm.qual_expiry || null,
              status: vendorForm.qual_status,
              notes: vendorForm.qual_notes || null
            });
          } catch {}
        }

        // Auto-insert Step 4 Bank Details if provided
        if (vendorForm.bank_name.trim() && vendorForm.bank_account_number.trim()) {
          try {
            await supabase.from("vendor_bank_details").insert({
              vendor_id: vId,
              bank_name: vendorForm.bank_name,
              account_name: vendorForm.bank_account_name || vendorForm.name,
              account_number: vendorForm.bank_account_number,
              iban: vendorForm.bank_iban || null,
              swift_code: vendorForm.bank_swift || null,
              currency: vendorForm.bank_currency || "QAR"
            });
          } catch {}
        }

        toast.success(`${vendorForm.name} fully onboarded with all details.`);
      }
      setShowVendorModal(false);
      await loadAll();
    } catch (e: any) { toast.error(`Save failed: ${e.message}`); }
    finally { setSaving(false); }
  }
  async function handleDeleteVendor(v: FinVendor) {
    if (!confirm(`Delete vendor "${v.name}"?`)) return;
    try {
      const { error } = await supabase.from("fin_vendors").delete().eq("id", v.id);
      if (error) throw error;
      toast.success(`${v.name} deleted.`);
      await loadAll();
    } catch (e: any) { toast.error(`Delete failed: ${e.message}`); }
  }
  async function handleToggleStatus(v: FinVendor) {
    const ns = v.status === "Active" ? "Inactive" : "Active";
    try {
      const { error } = await supabase.from("fin_vendors").update({ status: ns }).eq("id", v.id);
      if (error) throw error;
      toast.success(`${v.name} → ${ns}`);
      await loadAll();
    } catch (e: any) { toast.error(e.message); }
  }

  const downloadVendorCsvTemplate = () => {
    const headers = ["VendorCode", "VendorName", "VendorType", "ContactPerson", "Email", "Phone", "TaxNumber", "Address", "City", "Country", "PaymentTerms", "BankName", "IBAN", "Status"];
    const rows = [
      ["VND-8801", "Gulf Facilities LLC", "Supplier", "Ahmed Hassan", "ahmed@gulffacil.qa", "+97455001122", "10001234567890003", "Building 12, C Ring Rd", "Doha", "Qatar", "Net 30 Days", "Qatar National Bank", "QA55QNBA00000000123456", "Active"],
      ["VND-8802", "Mannai Trading Co", "Contractor", "Fatima Al-Nasr", "procurement@mannai.qa", "+97444567890", "20001234567890004", "Salwa Industrial Area", "Doha", "Qatar", "Net 45 Days", "Commercial Bank of Qatar", "QA55CBQA00000000987654", "Active"]
    ];
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `vendor_import_template_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Vendor CSV template downloaded");
  };

  const handleBulkVendorImport = async () => {
    if (!bulkVendorData.trim()) {
      toast.error("Please provide CSV content to import");
      return;
    }
    setBulkVendorLoading(true);
    try {
      const lines = bulkVendorData.trim().split("\n").filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        toast.error("CSV contains no data rows");
        setBulkVendorLoading(false);
        return;
      }
      const dataRows = lines.slice(1);
      let successCount = 0;
      let failCount = 0;

      for (const line of dataRows) {
        const parts = line.split(",").map(p => p.trim());
        if (!parts[0] || !parts[1]) {
          failCount++;
          continue;
        }
        const [
          vendorCode, vendorName, vendorType, contactPerson,
          email, phone, taxNumber, address, city, country,
          paymentTerms, bankName, iban, status
        ] = parts;

        const payload: any = {
          code: vendorCode || `VND-${String(Date.now()).slice(-4)}`,
          name: vendorName,
          vendor_type: vendorType || "Supplier",
          contact_person: contactPerson || null,
          email: email || null,
          phone: phone || null,
          tax_number: taxNumber || null,
          address: address || null,
          city: city || "Doha",
          country: country || "Qatar",
          payment_terms: paymentTerms || "Net 30 Days",
          settlement_mode: "Bank Wire / Electronic Transfer (QNB)",
          currency: "QAR",
          status: (status as any) || "Active",
          notes: null
        };

        const { data: createdVendor, error } = await supabase.from("fin_vendors").insert(payload).select().single();
        if (error) {
          console.error("Bulk vendor insert error:", error);
          failCount++;
        } else {
          // Auto-create bank details if IBAN provided
          if (iban && createdVendor) {
            try {
              await supabase.from("vendor_bank_details").insert({
                vendor_id: createdVendor.id,
                bank_name: bankName || "Qatar National Bank",
                account_name: vendorName,
                account_number: "",
                iban: iban,
                currency: "QAR"
              });
            } catch {}
          }
          successCount++;
        }
      }

      toast.success(`Bulk Vendor Ingestion Complete: ${successCount} created, ${failCount} failed.`);
      setBulkVendorOpen(false);
      setBulkVendorData("");
      await loadAll();
    } catch (err: any) {
      toast.error("Bulk vendor import failed: " + err.message);
    } finally {
      setBulkVendorLoading(false);
    }
  };

  // ── AP Invoice ─────────────────────────────────────────────────────────────
    function openPaymentReceipt(inv: any) {
    let rcpt = ApInvoicesApi.getReceiptByInvoice(inv.invoice_number);
    if (!rcpt && inv.grn_number) {
      rcpt = ApInvoicesApi.getReceiptByGrn(inv.grn_number);
    }
    if (!rcpt) {
      const suffix = (inv.invoice_number || "000").replace(/^APINV-/, "");
      rcpt = {
        id: `rcpt-synth-${inv.id}`,
        receipt_number: `RCPT-${suffix}`,
        voucher_number: `PV-${suffix}`,
        invoice_number: inv.invoice_number,
        po_number: inv.po_number,
        grn_number: inv.grn_number,
        vendor_id: inv.vendor_id,
        vendor_name: vendors.find(v => String(v.id) === String(inv.vendor_id))?.name,
        amount_paid: Number(inv.total_amount || 0),
        payment_date: inv.paid_at || inv.invoice_date || new Date().toISOString().slice(0, 10),
        payment_method: "Bank Wire / QNB Corporate",
        reference_no: `TXN-${String(inv.id).slice(-6)}`,
        bank_account: "Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)",
        gl_debit_account: "22100001 - Trade Payables - Vendors",
        gl_credit_account: "12000001 - Bank Operating Account (QNB)",
        status: "Settled",
        created_at: new Date().toISOString()
      };
    }
    setSelectedReceipt(rcpt);
    setShowReceiptModal(true);
  }

async function handleSaveInvoice() {
    if (!invoiceForm.vendorId || !invoiceForm.invoice_number.trim()) return toast.error("Vendor and Invoice Number are required.");
    setSaving(true);
    try {
      const amt = Number(invoiceForm.amount) || 0;
      const tax = Number(invoiceForm.tax_amount) || 0;
      await ApInvoicesApi.create({
        invoice_number: invoiceForm.invoice_number,
        vendor_id: invoiceForm.vendorId,
        po_number: invoiceForm.po_number || undefined,
        grn_number: invoiceForm.grn_number || undefined,
        invoice_date: invoiceForm.invoice_date,
        due_date: invoiceForm.due_date || undefined,
        amount: amt,
        tax_amount: tax,
        total_amount: amt + tax,
        payment_terms: invoiceForm.payment_terms,
        payment_method: invoiceForm.settlement_mode,
        settlement_mode: invoiceForm.settlement_mode,
        status: "DRAFT",
        remarks: invoiceForm.remarks || undefined
      });
      toast.success(`Invoice ${invoiceForm.invoice_number} created.`);
      setShowInvoiceModal(false);
      await loadAll();
    } catch (e: any) { toast.error(`Failed: ${e.message}`); }
    finally { setSaving(false); }
  }
  async function handleApproveInvoice(inv: APInvoice) {
    try {
      await ApInvoicesApi.update(inv.id, { status: "APPROVED" });
      toast.success(`Invoice ${inv.invoice_number} approved.`);
      await loadAll();
    } catch (e: any) { toast.error(e.message); }
  }
  function openPaymentModal(inv: APInvoice) {
    setPayModalStep(1);
    const vendorName = vendors.find(v => String(v.id) === String(inv.vendor_id))?.name || String(inv.vendor_id);
    const vendorBank = bankDetails.find(b => String(b.vendor_id) === String(inv.vendor_id));
    const partialKey = `partial_paid_${inv.id}`;
    const alreadyPaid = Number(localStorage.getItem(partialKey) || "0");
    const outstanding = Number(inv.total_amount || 0) - alreadyPaid;
    const advKey = `vendor_advance_${inv.vendor_id}`;
    const advBalance = Number(localStorage.getItem(advKey) || "0");
    setPaymentTargetInv(inv);
    setVendorPayForm({
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMethod: "Bank Wire / QNB Corporate Electronic",
      disbursingBank: "Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)",
      transactionReference: `TXN-${Date.now().toString().slice(-6)}`,
      beneficiaryAccount: vendorBank?.iban || `QA91QNBA${String(inv.vendor_id).padStart(12, '0')}`,
      cashReceiptNo: `PCV-${Date.now().toString().slice(-5)}`,
      receiverName: `${vendorName} - Authorized Representative`,
      chequeNumber: `CHQ-${Math.floor(100000 + Math.random() * 900000)}`,
      chequeDueDate: new Date().toISOString().slice(0, 10),
      remarks: `Settlement for Invoice ${inv.invoice_number}`,
      paymentAmount: outstanding,
      applyAdvance: false,
      advanceAmount: Math.min(advBalance, outstanding),
    });
  }

  async function handleConfirmVendorPayment() {
    if (!paymentTargetInv) return;
    setSaving(true);
    try {
      const totalDue = Number(paymentTargetInv.total_amount || 0);
      const partialKey = `partial_paid_${paymentTargetInv.id}`;
      const alreadyPaid = Number(localStorage.getItem(partialKey) || "0");
      const advKey = `vendor_advance_${paymentTargetInv.vendor_id}`;
      const advBalance = Number(localStorage.getItem(advKey) || "0");
      const cashAmount = vendorPayForm.paymentAmount;
      const advApplied = vendorPayForm.applyAdvance ? Math.min(vendorPayForm.advanceAmount, advBalance) : 0;
      const effectivePaid = cashAmount + advApplied;
      const newTotalPaid = alreadyPaid + effectivePaid;
      const isFullySettled = newTotalPaid >= totalDue - 0.01;
      localStorage.setItem(partialKey, String(newTotalPaid));
      
      // Track advance utilization
      if (advApplied > 0) {
        localStorage.setItem(advKey, String(advBalance - advApplied));
        const utilKey = `vendor_adv_util_${paymentTargetInv.vendor_id}`;
        const prevUtils = JSON.parse(localStorage.getItem(utilKey) || "[]");
        const newUtil = {
          id: `util-${Date.now()}`,
          invoice_id: paymentTargetInv.id,
          invoice_number: paymentTargetInv.invoice_number,
          date: vendorPayForm.paymentDate || new Date().toISOString().slice(0, 10),
          advance_used: advApplied,
          cash_paid: cashAmount,
          total_settled: effectivePaid,
          reference: vendorPayForm.transactionReference,
          created_at: new Date().toISOString()
        };
        localStorage.setItem(utilKey, JSON.stringify([newUtil, ...prevUtils]));

        // Post Advance Settlement Voucher to GL (Dr. 22100001 Trade Payables / Cr. 12300001 Advance to Vendors)
        const advVchrNo = `PV-SETTLE-ADV-${Date.now().toString().slice(-6)}`;
        const targetVendor = vendors.find(v => String(v.id) === String(paymentTargetInv.vendor_id));
        const vendorName = targetVendor?.name || `Vendor #${paymentTargetInv.vendor_id}`;
        
        const advanceSettlementVoucher = {
          id: `vchr-settle-${Date.now()}`,
          voucher_no: advVchrNo,
          voucher_type: "Payment Voucher",
          date: vendorPayForm.paymentDate || new Date().toISOString().slice(0, 10),
          name: `Advance Offset Settlement — Inv ${paymentTargetInv.invoice_number} (${vendorName})`,
          debit: "Trade Payables - Vendors",
          debit_code: "22100001",
          credit: "Advance to Vendors",
          credit_code: "12300001",
          amount: advApplied,
          method: "Advance Offset",
          property_name: "Main Portfolio",
          unit_ref: paymentTargetInv.po_number || "Facility Operations",
          tenant_name: vendorName,
          status: "Posted",
          lines: [
            { account_code: "22100001", account_name: "Trade Payables - Vendors", debit: advApplied, credit: 0, description: `Advance offset for ${paymentTargetInv.invoice_number}` },
            { account_code: "12300001", account_name: "Advance to Vendors", debit: 0, credit: advApplied, description: `Advance utilized against invoice ${paymentTargetInv.invoice_number}` }
          ]
        };

        try {
          const k1 = "zyno-pms-finance-data-v1-vouchers";
          const k2 = "zyno_finance_vouchers";
          const e1 = JSON.parse(localStorage.getItem(k1) || "[]");
          const e2 = JSON.parse(localStorage.getItem(k2) || "[]");
          localStorage.setItem(k1, JSON.stringify([advanceSettlementVoucher, ...e1]));
          localStorage.setItem(k2, JSON.stringify([advanceSettlementVoucher, ...e2]));
        } catch (e) {
          console.error("Failed to store settlement voucher", e);
        }
      }

      // If there is also cash/bank disbursement, post the cash/bank leg (Dr. 22100001 / Cr. 12000001 Bank or 12100001 Cash)
      if (cashAmount > 0) {
        const isCash = vendorPayForm.paymentMethod.toLowerCase().includes("cash") || vendorPayForm.paymentMethod.toLowerCase().includes("petty");
        const crCode = isCash ? "12100001" : "12000001";
        const crName = isCash ? "Cash in Hand (Office Vault)" : "Bank Operating Account (QNB)";
        const pvNo = `PV-${paymentTargetInv.invoice_number.replace('APINV-', '').replace('INV-AP-', '')}`;
        const targetVendor = vendors.find(v => String(v.id) === String(paymentTargetInv.vendor_id));
        const vendorName = targetVendor?.name || `Vendor #${paymentTargetInv.vendor_id}`;

        const paymentVoucher = {
          id: `vchr-pay-${Date.now()}`,
          voucher_no: pvNo,
          voucher_type: "Payment Voucher",
          date: vendorPayForm.paymentDate || new Date().toISOString().slice(0, 10),
          name: `Vendor Settlement — ${paymentTargetInv.invoice_number} (${vendorName})`,
          debit: "Trade Payables - Vendors",
          debit_code: "22100001",
          credit: crName,
          credit_code: crCode,
          amount: cashAmount,
          method: isCash ? "Cash" : "Bank Transfer",
          property_name: "Main Portfolio",
          unit_ref: paymentTargetInv.po_number || "Facility Operations",
          tenant_name: vendorName,
          status: "Posted",
          lines: [
            { account_code: "22100001", account_name: "Trade Payables - Vendors", debit: cashAmount, credit: 0, description: `Settlement for ${paymentTargetInv.invoice_number}` },
            { account_code: crCode, account_name: crName, debit: 0, credit: cashAmount, description: `Paid via ${vendorPayForm.paymentMethod}` }
          ]
        };

        try {
          const k1 = "zyno-pms-finance-data-v1-vouchers";
          const k2 = "zyno_finance_vouchers";
          const e1 = JSON.parse(localStorage.getItem(k1) || "[]");
          const e2 = JSON.parse(localStorage.getItem(k2) || "[]");
          localStorage.setItem(k1, JSON.stringify([paymentVoucher, ...e1]));
          localStorage.setItem(k2, JSON.stringify([paymentVoucher, ...e2]));
        } catch (e) {
          console.error("Failed to store payment voucher", e);
        }
      }

      await ApInvoicesApi.update(paymentTargetInv.id, {
        status: isFullySettled ? "PAID" : ("PARTIAL" as any),
        amount_paid: newTotalPaid,
        posting_status: isFullySettled ? "POSTED" : ("PARTIAL_POSTED" as any),
        payment_method: vendorPayForm.paymentMethod,
        payment_reference: vendorPayForm.transactionReference,
      });

      if (isFullySettled) {
        toast.success(`Invoice ${paymentTargetInv.invoice_number} fully settled. Financial Ledgers updated with 4-leg GL entries.`);
      } else {
        const remaining = totalDue - newTotalPaid;
        toast.info(`Payment of QAR ${effectivePaid.toLocaleString()} applied (${advApplied > 0 ? `QAR ${advApplied.toLocaleString()} advance + ` : ""}QAR ${cashAmount.toLocaleString()} cash/bank). Outstanding balance: QAR ${remaining.toLocaleString()}.`);
      }

      window.dispatchEvent(new CustomEvent("finance_vouchers_updated"));
      window.dispatchEvent(new CustomEvent("ap_invoices_updated"));
      const currentInv = paymentTargetInv;
      setPaymentTargetInv(null);
      await loadAll();
      openPaymentReceipt(currentInv);
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  // ── Computed ───────────────────────────────────────────────────────────────
  const filtered = search.trim() ? vendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.code?.toLowerCase().includes(search.toLowerCase())) : vendors;
  const activeCount = vendors.filter(v => v.status === "Active").length;
  const totalPayable = apInvoices.filter(i => i.status !== "PAID").reduce((s, i) => s + Number(i.total_amount || 0), 0);
  const paidYTD = apInvoices.filter(i => i.status === "PAID").reduce((s, i) => s + Number(i.total_amount || 0), 0);
  const activeTabInfo = VENDOR_TABS.find(t => t.key === activeTab);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      <div className="flex-1 overflow-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{activeTabInfo?.label ?? "Vendor Management"}</h2>
            <p className="text-sm text-muted-foreground">Centralized supplier registry — master data, qualifications, banking, invoices, and performance.</p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            {activeTab === "master" && (
              <>
                <Button variant="outline" size="sm" onClick={() => setBulkVendorOpen(true)} className="gap-1.5">
                  <FileSpreadsheet className="h-4 w-4 text-primary" /> Bulk Import
                </Button>
                <Button size="sm" onClick={openNewVendor}><Plus className="mr-2 h-4 w-4" /> New Vendor</Button>
              </>
            )}
            {activeTab === "advances" && (
              <Button 
                size="sm" 
                variant="outline" 
                className="text-muted-foreground border-dashed gap-1"
                onClick={() => toast.info("Vendor advances are disbursed and booked exclusively by the Finance Team under Finance → Payment Vouchers.")}
              >
                <DollarSign className="mr-1.5 h-4 w-4 text-emerald-500" /> Advance Disbursed by Finance
              </Button>
            )}
            {activeTab === "invoices" && <Button size="sm" onClick={() => setShowInvoiceModal(true)}><Plus className="mr-2 h-4 w-4" /> New AP Invoice</Button>}
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[["Total Vendors", vendors.length, Users, "text-violet-500"], ["Active", activeCount, CheckCircle2, "text-emerald-500"], ["Payable (QAR)", totalPayable.toLocaleString(), FileText, "text-amber-500"], ["Paid YTD (QAR)", paidYTD.toLocaleString(), CreditCard, "text-cyan-500"]].map(([l, v, Icon, c]: any) => (
            <Card key={l} className="bg-card/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div><p className="text-xs text-muted-foreground">{l}</p><p className={`text-xl font-bold mt-1 ${c}`}>{v}</p></div>
                <Icon className="h-5 w-5 text-muted-foreground/60" />
              </CardContent>
            </Card>
          ))}
        </div>



        {/* ── MASTER TAB ─────────────────────────────────────────────────── */}
        {activeTab === "master" && (
          <div className="space-y-4">
            <div className="relative max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
            </div>
            {filtered.length === 0 ? <EmptyState text="No vendors registered. Click 'New Vendor' to add a supplier." /> : (
              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 text-xs">
                      <TableHead className="font-bold">Code</TableHead>
                      <TableHead className="font-bold">Vendor Name</TableHead>
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Contact</TableHead>
                      <TableHead className="font-bold">Phone / Email</TableHead>
                      <TableHead className="font-bold">Tax No</TableHead>
                      <TableHead className="font-bold">Payment Terms &amp; Settlement</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(v => (
                      <TableRow key={v.id} className="text-xs hover:bg-muted/30">
                        <TableCell className="font-mono font-bold text-primary">{v.code}</TableCell>
                        <TableCell className="font-semibold">
                          <div>{v.name}</div>
                          {(v as any).city && <div className="text-muted-foreground text-[10px]">{(v as any).city}, {(v as any).country}</div>}
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{(v as any).vendor_type || "Supplier"}</Badge></TableCell>
                        <TableCell>{v.contact_person || "—"}</TableCell>
                        <TableCell>
                          {v.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" />{v.phone}</div>}
                          {v.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground" />{v.email}</div>}
                          {!v.phone && !v.email && "—"}
                        </TableCell>
                        <TableCell className="font-mono">{v.tax_number || "—"}</TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">{(v as any).payment_terms || "Net 30 Days"}</div>
                          <div className="text-[10px] text-muted-foreground">{(v as any).settlement_mode || "Bank Wire / Electronic"}</div>
                        </TableCell>
                        <TableCell><Badge variant={statusVariant(v.status || "Active")}>{v.status || "Active"}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 items-center">
                            {/* Purchase Orders & Procurement Orders */}
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-950/30" 
                              title="View Purchase Orders & Order History"
                              onClick={() => {
                                setOrdersVendor(v);
                                setShowOrdersModal(true);
                              }}
                            >
                              <ShoppingBag className="h-3.5 w-3.5" />
                            </Button>

                            <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit Vendor" onClick={() => openEditVendor(v)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" title={v.status === "Active" ? "Deactivate" : "Activate"} onClick={() => handleToggleStatus(v)}><Activity className="h-3.5 w-3.5 text-amber-500" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title="Delete" onClick={() => handleDeleteVendor(v)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* ── VENDOR ADVANCES TAB ────────────────────────────────────────── */}
        {activeTab === "advances" && (
          <div className="space-y-4">
            <div className="rounded-md border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900 p-3 text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <span><strong>Advance to Vendors (GL 12300001 — Current Asset):</strong> Advance deposits and mobilization funds disbursed to suppliers prior to invoice presentation. Balances auto-offset against payable invoices on settlement. Use the "<strong>Disburse Advance Payment</strong>" button above to record a new disbursement.</span>
            </div>

            {(() => {
              const vendorsWithAdvanceData = vendors.map(v => {
                const advBal = Number(localStorage.getItem(`vendor_advance_${v.id}`) || "0");
                const vInvoices = apInvoices.filter(i => String(i.vendor_id) === String(v.id));
                const totalSettled = vInvoices.reduce((a, b) => {
                  const pKey = `partial_paid_${b.id}`;
                  return a + Number(localStorage.getItem(pKey) || (b.status === "PAID" ? b.total_amount : 0));
                }, 0);
                const totalInvoiced = vInvoices.reduce((a, b) => a + Number(b.total_amount || 0), 0);
                return { ...v, advBal, totalSettled, totalInvoiced };
              }).filter(v => v.advBal > 0 || v.totalSettled > 0);

              if (vendorsWithAdvanceData.length === 0) {
                return (
                  <div className="border border-dashed rounded-lg p-10 text-center text-sm text-muted-foreground bg-card">
                    No active vendor advances or advance utilization recorded yet. Click <strong>"Disburse Advance Payment"</strong> above to disburse mobilization funds.
                  </div>
                );
              }

              return (
                <div className="border rounded-lg overflow-x-auto bg-card">
                  <Table className="whitespace-nowrap">
                    <TableHeader>
                      <TableRow className="bg-muted/50 text-xs whitespace-nowrap">
                        <TableHead className="font-bold whitespace-nowrap">Vendor Code</TableHead>
                        <TableHead className="font-bold whitespace-nowrap">Vendor Name</TableHead>
                        <TableHead className="font-bold whitespace-nowrap">Vendor Type</TableHead>
                        <TableHead className="font-bold text-right whitespace-nowrap">Available Advance (QAR)</TableHead>
                        <TableHead className="font-bold text-right whitespace-nowrap">Settled / Utilized (QAR)</TableHead>
                        <TableHead className="font-bold whitespace-nowrap">Debit Account (Asset)</TableHead>
                        <TableHead className="font-bold whitespace-nowrap">Credit Account (Disbursement)</TableHead>
                        <TableHead className="font-bold text-right whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorsWithAdvanceData.map(v => (
                        <TableRow key={v.id} className="text-xs hover:bg-muted/30 whitespace-nowrap">
                          <TableCell className="font-mono font-bold text-primary whitespace-nowrap">{v.code}</TableCell>
                          <TableCell className="font-semibold whitespace-nowrap">{v.name}</TableCell>
                          <TableCell className="whitespace-nowrap"><Badge variant="outline" className="text-[10px] whitespace-nowrap">{(v as any).vendor_type || "Supplier"}</Badge></TableCell>
                          <TableCell className="text-right font-mono font-bold whitespace-nowrap">
                            <span className={v.advBal > 0 ? "text-emerald-600 font-bold" : "text-muted-foreground"}>
                              QAR {v.advBal.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-blue-600 whitespace-nowrap">
                            QAR {v.totalSettled.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-blue-700 dark:text-blue-400 whitespace-nowrap">
                            <span className="font-semibold">Dr. 12300001</span> (Advance to Vendors)
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                            <span className="font-semibold">Cr. 12000001</span> (Bank QNB) / <span className="font-semibold">Cr. 12100001</span> (Cash)
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-1 whitespace-nowrap"
                              title="View Advance History & Utilization"
                              onClick={() => {
                                setAdvanceHistoryVendor(v);
                                setShowAdvanceHistoryModal(true);
                              }}
                            >
                              <History className="h-3.5 w-3.5" /> History &amp; Usage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── AP INVOICES TAB ────────────────────────────────────────────── */}
        {activeTab === "invoices" && (
          <div className="space-y-4">
            <div className="rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 p-3 text-xs text-blue-900 dark:text-blue-300 flex gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <span><strong>3-Way Match:</strong> Invoice → PO Number → GRN Number. All three must align before payment is authorised.</span>
            </div>
            {apInvoices.length === 0 ? <EmptyState text="No AP invoices yet. Create an invoice and link it to a PO and GRN." /> : (
              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 text-xs">
                      <TableHead className="font-bold">Invoice #</TableHead><TableHead className="font-bold">Vendor</TableHead><TableHead className="font-bold">PO Ref</TableHead><TableHead className="font-bold">GRN Ref</TableHead><TableHead className="font-bold">Invoice Date</TableHead><TableHead className="font-bold">Due Date</TableHead><TableHead className="font-bold text-right">Total (QAR)</TableHead><TableHead className="font-bold">Status</TableHead><TableHead className="font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apInvoices.map(inv => {
                      const totalDue = Number(inv.total_amount || 0);
                      const alreadyPaid = Number(localStorage.getItem(`partial_paid_${inv.id}`) || "0");
                      const outstanding = totalDue - alreadyPaid;
                      const isPartial = (inv.status as string) === "PARTIAL";
                      return (
                        <TableRow key={inv.id} className="text-xs hover:bg-muted/30">
                          <TableCell className="font-mono font-bold text-primary">{inv.invoice_number}</TableCell>
                          <TableCell className="font-semibold">{vendors.find(v => String(v.id) === String(inv.vendor_id))?.name || inv.vendor_id}</TableCell>
                          <TableCell className="font-mono text-cyan-500">{inv.po_number || "—"}</TableCell>
                          <TableCell className="font-mono text-emerald-500">{inv.grn_number || "—"}</TableCell>
                          <TableCell>{inv.invoice_date}</TableCell>
                          <TableCell>{inv.due_date ? <span className={inv.status !== "PAID" && new Date(inv.due_date) < new Date() ? "text-destructive font-semibold" : ""}>{inv.due_date}</span> : "—"}</TableCell>
                          <TableCell className="text-right">
                            <div className="font-semibold">QAR {totalDue.toLocaleString()}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              Base: {Number(inv.amount || (totalDue - (inv.tax_amount || 0))).toLocaleString()} | Tax: {Number(inv.tax_amount || 0).toLocaleString()}
                            </div>
                            {isPartial && alreadyPaid > 0 && (
                              <div className="text-[10px] text-amber-600 font-mono mt-0.5">
                                Paid: {alreadyPaid.toLocaleString()} | Due: {outstanding.toLocaleString()}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={statusVariant(inv.status)}
                              className={isPartial ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400" : ""}
                            >
                              {isPartial ? "Partial" : inv.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1.5 items-center flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-2 gap-1 text-primary border-primary/40 hover:bg-primary/10"
                                onClick={() => setSelectedInvoiceForView(inv)}
                              >
                                <Eye className="h-3 w-3" /> View Proforma
                              </Button>
                              {inv.status === "DRAFT" && (
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleApproveInvoice(inv)}>
                                  <CheckCheck className="mr-1 h-3.5 w-3.5 text-emerald-500" />Approve
                                </Button>
                              )}
                              {(inv.status === "APPROVED" || isPartial) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                  onClick={() => setSelectedInvoiceForView(inv)}
                                >
                                  <Info className="mr-1 h-3.5 w-3.5 text-amber-600" />
                                  Awaiting Finance Settlement
                                </Button>
                              )}
                              {(inv.status === "PAID" || (isPartial && alreadyPaid > 0)) && (
                                <Button size="sm" variant="outline" className="h-7 text-xs px-2.5 gap-1 text-emerald-600 border-emerald-500/40" onClick={() => openPaymentReceipt(inv)}>
                                  <FileText className="h-3 w-3" /> {isPartial ? "Receipts" : "Receipt"}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* ── PAYMENT HISTORY TAB ────────────────────────────────────────── */}
        {activeTab === "payments" && (
          apInvoices.filter(i => i.status === "PAID" || (i.status as string) === "PARTIAL").length === 0
            ? <EmptyState text="No payments recorded. Paid and partially paid invoices appear here." />
            : (
              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 text-xs">
                      <TableHead>Invoice #</TableHead><TableHead>Vendor</TableHead><TableHead>PO / GRN Chain</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount Paid (QAR)</TableHead><TableHead className="text-right">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apInvoices.filter(i => i.status === "PAID").map(inv => (
                      <TableRow key={inv.id} className="text-xs hover:bg-muted/30">
                        <TableCell className="font-mono font-bold text-primary">{inv.invoice_number}</TableCell>
                        <TableCell className="font-semibold">{vendors.find(v => String(v.id) === String(inv.vendor_id))?.name || inv.vendor_id}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">{[inv.po_number, inv.grn_number].filter(Boolean).join(" → ") || "—"}</TableCell>
                        <TableCell>{inv.invoice_date}</TableCell>
                        <TableCell className="text-right font-semibold font-mono text-emerald-600">{Number(inv.total_amount || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 gap-1 text-emerald-600 border-emerald-500/40" onClick={() => openPaymentReceipt(inv)}>
                            <FileText className="h-2.5 w-2.5" /> Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
        )}

        {/* ── SUPPLIER SCORECARD TAB ─────────────────────────────────────── */}
        {activeTab === "performance" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Supplier performance scorecard based on delivery, quality, and compliance metrics.</p>
            {vendors.filter(v => v.status === "Active").length === 0
              ? <EmptyState text="No active vendors to score." />
              : (
                <div className="grid gap-4 md:grid-cols-2">
                  {vendors.filter(v => v.status === "Active").map(v => {
                    const vi = apInvoices.filter(i => String(i.vendor_id) === String(v.id));
                    const paid = vi.filter(i => i.status === "PAID").length;
                    const total = vi.length;
                    const onTime = total > 0 ? Math.round((paid / total) * 100) : 75;
                    const quality = 80 + (v.name.charCodeAt(0) % 20);
                    const certs = qualifications.filter(q => String(q.vendor_id) === String(v.id) && q.status === "Active").length;
                    const compliance = certs > 0 ? 95 : 60;
                    const overall = Math.round((onTime + quality + compliance) / 3);
                    return (
                      <Card key={v.id} className="bg-card/50">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-sm">{v.name}</CardTitle>
                              <CardDescription className="text-[10px]">{v.code} · {(v as any).vendor_type || "Supplier"}</CardDescription>
                            </div>
                            <div className={`text-2xl font-bold ${overall >= 80 ? "text-emerald-500" : overall >= 60 ? "text-amber-500" : "text-rose-500"}`}>{overall}</div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                          <div><div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>On-Time Delivery</span><span>{onTime}%</span></div><ScoreBar score={onTime} color="bg-blue-500" /></div>
                          <div><div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Quality Score</span><span>{quality}%</span></div><ScoreBar score={quality} color="bg-emerald-500" /></div>
                          <div><div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Compliance</span><span>{compliance}%</span></div><ScoreBar score={compliance} color="bg-violet-500" /></div>
                          <div className="pt-1 flex justify-between text-[10px] text-muted-foreground">
                            <span>{total} Invoice(s) · {paid} Paid</span>
                            <span>{certs} Certification(s)</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )
            }
          </div>
        )}
      </div>

      {/* ══ DIALOGS ══════════════════════════════════════════════════════════ */}

      {/* Vendor Modal (4-Step Onboarding Stepper) */}
      <Dialog open={showVendorModal} onOpenChange={setShowVendorModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editVendor ? "Edit Vendor" : "New Vendor Registration"}</DialogTitle>
            <DialogDescription>
              {editVendor
                ? "Update vendor information in the central registry."
                : "Complete the 4-step onboarding wizard for seamless supplier registration."}
            </DialogDescription>
          </DialogHeader>

          {/* Stepper Header Strip */}
          {!editVendor && (
            <div className="grid grid-cols-4 gap-2 border-b pb-3 pt-1">
              {[
                { step: 1, label: "Vendor Master", icon: Users },
                { step: 2, label: "Contacts", icon: Phone },
                { step: 3, label: "Qualification", icon: Shield },
                { step: 4, label: "Bank Details", icon: Banknote },
              ].map(({ step, label, icon: Icon }) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setVendorStep(step)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-md text-xs font-medium transition-all ${
                    vendorStep === step
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : vendorStep > step
                      ? "text-emerald-600 hover:bg-muted/50"
                      : "text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      vendorStep === step ? "bg-primary text-primary-foreground" : vendorStep > step ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {vendorStep > step ? "✓" : step}
                    </span>
                    <Icon className="h-3.5 w-3.5 hidden sm:inline" />
                  </div>
                  <span className="text-[11px] truncate max-w-full font-semibold">{label}</span>
                </button>
              ))}
            </div>
          )}

          <ScrollArea className="max-h-[60vh] pr-2">
            {/* ── STEP 1: VENDOR MASTER ── */}
            {(vendorStep === 1 || editVendor) && (
              <div className="grid gap-3 py-2 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Vendor Code *">
                    <Input value={vendorForm.code} onChange={e => setVendorForm({ ...vendorForm, code: e.target.value })} placeholder="VND-001" className="h-8 text-xs" />
                  </Field>
                  <Field label="Vendor Type">
                    <Select value={vendorForm.vendor_type} onValueChange={v => setVendorForm({ ...vendorForm, vendor_type: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{["Supplier","Contractor","Consultant","Service Provider","Sub-Contractor"].map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Company / Vendor Name *">
                  <Input value={vendorForm.name} onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })} placeholder="Al Rashid Trading LLC" className="h-8 text-xs font-medium" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Primary Contact Person">
                    <Input value={vendorForm.contact_person} onChange={e => setVendorForm({ ...vendorForm, contact_person: e.target.value })} className="h-8 text-xs" />
                  </Field>
                  <Field label="Phone">
                    <Input value={vendorForm.phone} onChange={e => setVendorForm({ ...vendorForm, phone: e.target.value })} placeholder="+974 5555 0000" className="h-8 text-xs" />
                  </Field>
                </div>
                <Field label="Email">
                  <Input type="email" value={vendorForm.email} onChange={e => setVendorForm({ ...vendorForm, email: e.target.value })} className="h-8 text-xs" />
                </Field>
                {/* Tax & Commercial Registration Details */}
                <div className="p-3 rounded-lg border bg-muted/20 space-y-2.5">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Tax &amp; Commercial Registration (CR) Details
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <Field label="Tax / CR Number *">
                      <Input value={vendorForm.tax_number} onChange={e => setVendorForm({ ...vendorForm, tax_number: e.target.value })} placeholder="CR-88291" className="h-8 text-xs font-mono font-bold" />
                    </Field>
                    <Field label="CR Expiry Date">
                      <Input type="date" value={vendorForm.cr_expiry_date} onChange={e => setVendorForm({ ...vendorForm, cr_expiry_date: e.target.value })} className="h-8 text-xs" />
                    </Field>
                    <Field label="Tax / VAT Rate (%)">
                      <Input type="number" min="0" max="100" value={vendorForm.tax_rate} onChange={e => setVendorForm({ ...vendorForm, tax_rate: e.target.value })} placeholder="0" className="h-8 text-xs font-mono" />
                    </Field>
                  </div>
                </div>

                {/* Upload Documents (Terms, Company Profile, Tax Certificate) */}
                <div className="p-3 rounded-lg border bg-blue-50/40 dark:bg-blue-950/20 space-y-2.5">
                  <p className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                    <Paperclip className="h-3.5 w-3.5 text-blue-600" /> Upload Vendor Documentation &amp; Agreements
                  </p>
                  <div className="grid grid-cols-3 gap-2.5 text-xs">
                    {/* Terms & Conditions Document */}
                    <div className="p-2 rounded border bg-background flex flex-col justify-between">
                      <div>
                        <span className="font-semibold block text-[11px]">Terms &amp; Conditions</span>
                        <span className="text-[10px] text-muted-foreground block truncate">{vendorForm.terms_doc_name || "No file chosen"}</span>
                      </div>
                      <label className="mt-2 inline-flex items-center justify-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 rounded cursor-pointer text-[10px] font-medium transition">
                        <FileUp className="h-3 w-3" /> {vendorForm.terms_doc_name ? "Replace Terms" : "Upload Terms"}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setVendorForm(prev => ({ ...prev, terms_doc_name: file.name }));
                              toast.success(`Terms document "${file.name}" attached.`);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {/* Company Profile / Registration */}
                    <div className="p-2 rounded border bg-background flex flex-col justify-between">
                      <div>
                        <span className="font-semibold block text-[11px]">Company Profile / CR</span>
                        <span className="text-[10px] text-muted-foreground block truncate">{vendorForm.company_profile_name || "No file chosen"}</span>
                      </div>
                      <label className="mt-2 inline-flex items-center justify-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 rounded cursor-pointer text-[10px] font-medium transition">
                        <FileUp className="h-3 w-3" /> {vendorForm.company_profile_name ? "Replace Profile" : "Upload Profile"}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setVendorForm(prev => ({ ...prev, company_profile_name: file.name }));
                              toast.success(`Company Profile "${file.name}" attached.`);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {/* Tax Card / Certificate */}
                    <div className="p-2 rounded border bg-background flex flex-col justify-between">
                      <div>
                        <span className="font-semibold block text-[11px]">Tax Card / Certificate</span>
                        <span className="text-[10px] text-muted-foreground block truncate">{vendorForm.tax_cert_name || "No file chosen"}</span>
                      </div>
                      <label className="mt-2 inline-flex items-center justify-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 rounded cursor-pointer text-[10px] font-medium transition">
                        <FileUp className="h-3 w-3" /> {vendorForm.tax_cert_name ? "Replace Tax Card" : "Upload Tax Card"}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setVendorForm(prev => ({ ...prev, tax_cert_name: file.name }));
                              toast.success(`Tax Certificate "${file.name}" attached.`);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Billing Currency">
                    <Select value={vendorForm.currency} onValueChange={v => setVendorForm({ ...vendorForm, currency: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{["QAR","USD","EUR","AED","SAR","GBP"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Payment Terms *">
                    <Select value={vendorForm.payment_terms} onValueChange={v => setVendorForm({ ...vendorForm, payment_terms: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Immediate / Cash on Delivery","Net 7 Days","Net 14 Days","Net 30 Days","Net 45 Days","Net 60 Days","Net 90 Days"].map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Settlement Mode *">
                    <Select value={vendorForm.settlement_mode} onValueChange={v => setVendorForm({ ...vendorForm, settlement_mode: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Wire / Electronic Transfer (QNB)">Bank Wire / Electronic Transfer (QNB)</SelectItem>
                        <SelectItem value="CBQ Electronic Wire">CBQ Electronic Wire</SelectItem>
                        <SelectItem value="Corporate Cheque on Delivery">Corporate Cheque on Delivery</SelectItem>
                        <SelectItem value="Direct Debit / Online Portal">Direct Debit / Online Portal</SelectItem>
                        <SelectItem value="Cash in Hand / Petty Cash">Cash in Hand / Petty Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Status">
                    <Select value={vendorForm.status} onValueChange={v => setVendorForm({ ...vendorForm, status: v as any })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem><SelectItem value="Blacklisted">Blacklisted</SelectItem></SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Address">
                  <Input value={vendorForm.address} onChange={e => setVendorForm({ ...vendorForm, address: e.target.value })} className="h-8 text-xs" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City">
                    <Input value={vendorForm.city} onChange={e => setVendorForm({ ...vendorForm, city: e.target.value })} placeholder="Doha" className="h-8 text-xs" />
                  </Field>
                  <Field label="Country">
                    <Input value={vendorForm.country} onChange={e => setVendorForm({ ...vendorForm, country: e.target.value })} className="h-8 text-xs" />
                  </Field>
                </div>
                <Field label="Notes">
                  <Textarea value={vendorForm.notes} onChange={e => setVendorForm({ ...vendorForm, notes: e.target.value })} className="text-xs min-h-[50px]" />
                </Field>
              </div>
            )}

            {/* ── STEP 2: CONTACTS ── */}
            {vendorStep === 2 && !editVendor && (
              <div className="grid gap-3 py-2 text-xs">
                <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>Configure the direct key account representative or emergency escalation contact.</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Contact Full Name *">
                    <Input value={vendorForm.contact_name} onChange={e => setVendorForm({ ...vendorForm, contact_name: e.target.value })} placeholder="Salem Al-Kuwari" className="h-8 text-xs" />
                  </Field>
                  <Field label="Role / Designation">
                    <Input value={vendorForm.contact_role} onChange={e => setVendorForm({ ...vendorForm, contact_role: e.target.value })} placeholder="Sales Director" className="h-8 text-xs" />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Direct Phone">
                    <Input value={vendorForm.contact_phone} onChange={e => setVendorForm({ ...vendorForm, contact_phone: e.target.value })} placeholder="+974 5500 1234" className="h-8 text-xs" />
                  </Field>
                  <Field label="Direct Email">
                    <Input type="email" value={vendorForm.contact_email} onChange={e => setVendorForm({ ...vendorForm, contact_email: e.target.value })} placeholder="salem@supplier.qa" className="h-8 text-xs" />
                  </Field>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="v_primary" checked={vendorForm.contact_primary} onChange={e => setVendorForm({ ...vendorForm, contact_primary: e.target.checked })} />
                  <label htmlFor="v_primary" className="text-xs cursor-pointer font-medium">Designate as Primary Contact for Purchase Orders & RFQs</label>
                </div>
              </div>
            )}

            {/* ── STEP 3: QUALIFICATION ── */}
            {vendorStep === 3 && !editVendor && (
              <div className="grid gap-3 py-2 text-xs">
                <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Provide compliance, ISO certifications, trade license, and qualification details.</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Trade / Service Category *">
                    <Input value={vendorForm.qual_category} onChange={e => setVendorForm({ ...vendorForm, qual_category: e.target.value })} placeholder="HVAC, Fire Safety, Electrical..." className="h-8 text-xs" />
                  </Field>
                  <Field label="Certification / License">
                    <Input value={vendorForm.qual_certification} onChange={e => setVendorForm({ ...vendorForm, qual_certification: e.target.value })} placeholder="Commercial Registration, ISO 9001" className="h-8 text-xs" />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="License / Cert Expiry Date">
                    <Input type="date" value={vendorForm.qual_expiry} onChange={e => setVendorForm({ ...vendorForm, qual_expiry: e.target.value })} className="h-8 text-xs" />
                  </Field>
                  <Field label="Compliance Status">
                    <Select value={vendorForm.qual_status} onValueChange={v => setVendorForm({ ...vendorForm, qual_status: v as any })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active (Compliant)</SelectItem>
                        <SelectItem value="Pending">Pending Audit</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Compliance Notes / Scope">
                  <Input value={vendorForm.qual_notes} onChange={e => setVendorForm({ ...vendorForm, qual_notes: e.target.value })} placeholder="Authorized distributor for Daikin, Carrier..." className="h-8 text-xs" />
                </Field>
              </div>
            )}

            {/* ── STEP 4: BANK DETAILS ── */}
            {vendorStep === 4 && !editVendor && (
              <div className="grid gap-3 py-2 text-xs">
                <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Set up supplier bank account for direct electronic wire settlements and AP disbursements.</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Bank Name *">
                    <Input value={vendorForm.bank_name} onChange={e => setVendorForm({ ...vendorForm, bank_name: e.target.value })} placeholder="Qatar National Bank (QNB)" className="h-8 text-xs" />
                  </Field>
                  <Field label="Account Holder Name">
                    <Input value={vendorForm.bank_account_name} onChange={e => setVendorForm({ ...vendorForm, bank_account_name: e.target.value })} placeholder={vendorForm.name || "Company Legal Name"} className="h-8 text-xs" />
                  </Field>
                </div>
                <Field label="Account Number *">
                  <Input value={vendorForm.bank_account_number} onChange={e => setVendorForm({ ...vendorForm, bank_account_number: e.target.value })} placeholder="0013-098271-001" className="h-8 text-xs font-mono" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="IBAN">
                    <Input value={vendorForm.bank_iban} onChange={e => setVendorForm({ ...vendorForm, bank_iban: e.target.value })} placeholder="QA58QNBA000000000013098271001" className="h-8 text-xs font-mono" />
                  </Field>
                  <Field label="SWIFT / BIC Code">
                    <Input value={vendorForm.bank_swift} onChange={e => setVendorForm({ ...vendorForm, bank_swift: e.target.value })} placeholder="QNBAQAQA" className="h-8 text-xs font-mono" />
                  </Field>
                </div>
                <Field label="Disbursement Currency">
                  <Select value={vendorForm.bank_currency} onValueChange={v => setVendorForm({ ...vendorForm, bank_currency: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{["QAR","USD","EUR","AED"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="flex flex-row justify-between items-center sm:justify-between w-full pt-2">
            <div>
              {!editVendor && vendorStep > 1 && (
                <Button type="button" variant="outline" size="sm" onClick={() => setVendorStep(s => s - 1)}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowVendorModal(false)}>Cancel</Button>
              {!editVendor && vendorStep < 4 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (vendorStep === 1 && (!vendorForm.code.trim() || !vendorForm.name.trim())) {
                      return toast.error("Vendor Code and Name are required.");
                    }
                    setVendorStep(s => s + 1);
                  }}
                >
                  Next Step <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button size="sm" onClick={handleSaveVendor} disabled={saving}>
                  {editVendor ? "Update Vendor" : "Complete Registration"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Vendor Contact</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2 text-xs">
            <Field label="Vendor *"><Select value={contactForm.vendorId} onValueChange={v => setContactForm({ ...contactForm, vendorId: v })}><SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger><SelectContent>{vendors.map(v=><SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>)}</SelectContent></Select></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name *"><Input value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} className="h-8 text-xs" /></Field>
              <Field label="Role"><Input value={contactForm.role} onChange={e => setContactForm({ ...contactForm, role: e.target.value })} placeholder="Sales Manager" className="h-8 text-xs" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone"><Input value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} className="h-8 text-xs" /></Field>
              <Field label="Email"><Input type="email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} className="h-8 text-xs" /></Field>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="is_primary" checked={contactForm.is_primary} onChange={e => setContactForm({ ...contactForm, is_primary: e.target.checked })} />
              <label htmlFor="is_primary" className="text-xs cursor-pointer">Mark as Primary Contact</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!contactForm.vendorId || !contactForm.name.trim()) return toast.error("Vendor and Name required.");
              try { const { error } = await supabase.from("vendor_contacts").insert({ vendor_id: contactForm.vendorId, name: contactForm.name, role: contactForm.role, phone: contactForm.phone || null, email: contactForm.email || null, is_primary: contactForm.is_primary }); if (error) throw error; toast.success("Contact added."); setShowContactModal(false); await loadAll(); } catch (e: any) { toast.error(e.message); }
            }}>Add Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bank Modal */}
      <Dialog open={showBankModal} onOpenChange={setShowBankModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Bank Account</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2 text-xs">
            <Field label="Vendor *"><Select value={bankForm.vendorId} onValueChange={v => setBankForm({ ...bankForm, vendorId: v })}><SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger><SelectContent>{vendors.map(v=><SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>)}</SelectContent></Select></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Bank Name *"><Input value={bankForm.bank_name} onChange={e => setBankForm({ ...bankForm, bank_name: e.target.value })} className="h-8 text-xs" /></Field>
              <Field label="Account Name"><Input value={bankForm.account_name} onChange={e => setBankForm({ ...bankForm, account_name: e.target.value })} className="h-8 text-xs" /></Field>
            </div>
            <Field label="Account Number *"><Input value={bankForm.account_number} onChange={e => setBankForm({ ...bankForm, account_number: e.target.value })} className="h-8 text-xs font-mono" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="IBAN"><Input value={bankForm.iban} onChange={e => setBankForm({ ...bankForm, iban: e.target.value })} className="h-8 text-xs font-mono" /></Field>
              <Field label="SWIFT / BIC"><Input value={bankForm.swift_code} onChange={e => setBankForm({ ...bankForm, swift_code: e.target.value })} className="h-8 text-xs font-mono" /></Field>
            </div>
            <Field label="Currency"><Select value={bankForm.currency} onValueChange={v => setBankForm({ ...bankForm, currency: v })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{["QAR","USD","EUR","AED"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBankModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!bankForm.vendorId || !bankForm.bank_name || !bankForm.account_number) return toast.error("Vendor, Bank Name and Account Number required.");
              try { const { error } = await supabase.from("vendor_bank_details").insert({ ...bankForm, vendor_id: bankForm.vendorId }); if (error) throw error; toast.success("Bank account added."); setShowBankModal(false); await loadAll(); } catch (e: any) { toast.error(e.message); }
            }}>Save Bank Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Qualification Modal */}
      <Dialog open={showQualModal} onOpenChange={setShowQualModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Qualification</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2 text-xs">
            <Field label="Vendor *"><Select value={qualForm.vendorId} onValueChange={v => setQualForm({ ...qualForm, vendorId: v })}><SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger><SelectContent>{vendors.map(v=><SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>)}</SelectContent></Select></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category *"><Input value={qualForm.category} onChange={e => setQualForm({ ...qualForm, category: e.target.value })} placeholder="HVAC, Civil..." className="h-8 text-xs" /></Field>
              <Field label="Certification"><Input value={qualForm.certification} onChange={e => setQualForm({ ...qualForm, certification: e.target.value })} placeholder="ISO 9001..." className="h-8 text-xs" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Expiry Date"><Input type="date" value={qualForm.expiry_date} onChange={e => setQualForm({ ...qualForm, expiry_date: e.target.value })} className="h-8 text-xs" /></Field>
              <Field label="Status"><Select value={qualForm.status} onValueChange={v => setQualForm({ ...qualForm, status: v as any })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Expired">Expired</SelectItem><SelectItem value="Pending">Pending</SelectItem></SelectContent></Select></Field>
            </div>
            <Field label="Notes"><Input value={qualForm.notes} onChange={e => setQualForm({ ...qualForm, notes: e.target.value })} className="h-8 text-xs" /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQualModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!qualForm.vendorId || !qualForm.category) return toast.error("Vendor and Category required.");
              try { const { error } = await supabase.from("vendor_qualifications").insert({ vendor_id: qualForm.vendorId, category: qualForm.category, certification: qualForm.certification || null, expiry_date: qualForm.expiry_date || null, status: qualForm.status, notes: qualForm.notes || null }); if (error) throw error; toast.success("Qualification added."); setShowQualModal(false); await loadAll(); } catch (e: any) { toast.error(e.message); }
            }}>Add Qualification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AP Invoice Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New AP Invoice</DialogTitle><DialogDescription>Log a vendor invoice and link it to a PO and GRN for 3-way matching.</DialogDescription></DialogHeader>
          <div className="grid gap-3 py-2 text-xs">
            <Field label="Vendor *"><Select value={invoiceForm.vendorId} onValueChange={v => {
              const vendor = vendors.find(vObj => String(vObj.id) === v);
              setInvoiceForm({ ...invoiceForm, vendorId: v, payment_terms: vendor?.payment_terms || "Net 30 Days" });
            }}><SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger><SelectContent>{vendors.map(v=><SelectItem key={v.id} value={String(v.id)}>{v.name} ({v.code})</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Invoice Number *"><Input value={invoiceForm.invoice_number} onChange={e => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })} placeholder="INV-2025-001" className="h-8 text-xs font-mono" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="PO Reference"><Input value={invoiceForm.po_number} onChange={e => setInvoiceForm({ ...invoiceForm, po_number: e.target.value })} placeholder="PO-2025-000001" className="h-8 text-xs font-mono" /></Field>
              <Field label="GRN Reference"><Input value={invoiceForm.grn_number} onChange={e => setInvoiceForm({ ...invoiceForm, grn_number: e.target.value })} placeholder="GRN-2025-000001" className="h-8 text-xs font-mono" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Invoice Date"><Input type="date" value={invoiceForm.invoice_date} onChange={e => setInvoiceForm({ ...invoiceForm, invoice_date: e.target.value })} className="h-8 text-xs" /></Field>
              <Field label="Due Date"><Input type="date" value={invoiceForm.due_date} onChange={e => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })} className="h-8 text-xs" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Net Amount (QAR) *"><Input type="number" value={invoiceForm.amount} onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} className="h-8 text-xs font-mono font-bold" /></Field>
              <Field label="Tax Amount (QAR)"><Input type="number" value={invoiceForm.tax_amount} onChange={e => setInvoiceForm({ ...invoiceForm, tax_amount: e.target.value })} className="h-8 text-xs font-mono" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Payment Terms *">
                <Select value={invoiceForm.payment_terms} onValueChange={v => setInvoiceForm({ ...invoiceForm, payment_terms: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Immediate / Cash on Delivery","Net 7 Days","Net 14 Days","Net 30 Days","Net 45 Days","Net 60 Days","Net 90 Days"].map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Settlement Mode *">
                <Select value={invoiceForm.settlement_mode} onValueChange={v => setInvoiceForm({ ...invoiceForm, settlement_mode: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Wire / Electronic Transfer (QNB)">Bank Wire / Electronic Transfer (QNB)</SelectItem>
                    <SelectItem value="CBQ Electronic Wire">CBQ Electronic Wire</SelectItem>
                    <SelectItem value="Corporate Cheque on Delivery">Corporate Cheque on Delivery</SelectItem>
                    <SelectItem value="Direct Debit / Online Portal">Direct Debit / Online Portal</SelectItem>
                    <SelectItem value="Cash in Hand / Petty Cash">Cash in Hand / Petty Cash</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Remarks"><Input value={invoiceForm.remarks} onChange={e => setInvoiceForm({ ...invoiceForm, remarks: e.target.value })} className="h-8 text-xs" /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>Cancel</Button>
            <Button onClick={handleSaveInvoice} disabled={saving}>Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Proforma Invoice Dialog */}
      <ProformaInvoiceDialog
        invoice={selectedInvoiceForView}
        open={!!selectedInvoiceForView}
        onOpenChange={(open) => !open && setSelectedInvoiceForView(null)}
        vendors={vendors}
        onViewReceiptClick={(inv) => openPaymentReceipt(inv)}
        onPayClick={(inv) => {
          setSelectedInvoiceForView(null);
          setPaymentTargetInv(inv);
        }}
      />

      {/* Payment Receipt Dialog */}
      <PaymentReceiptDialog receipt={selectedReceipt} open={showReceiptModal} onOpenChange={setShowReceiptModal} vendorName={selectedReceipt?.vendor_name || vendors.find(v => String(v.id) === String(selectedReceipt?.vendor_id))?.name} />

      
      {/* ── Modal: Disburse Vendor Advance Payment ── */}
      <Dialog open={showAdvanceModal} onOpenChange={setShowAdvanceModal}>
        <DialogContent
          className="max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="p-5 pb-3 border-b">
            <DialogTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Disburse Advance Payment to Vendor
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record an advance / mobilization deposit disbursed to supplier prior to invoice presentation.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 px-5 py-4 max-h-[calc(90vh-130px)] space-y-4 text-xs">
            <div className="space-y-3.5">
              <Field label="Vendor *">
                <Select value={advanceForm.vendorId} onValueChange={v => setAdvanceForm({ ...advanceForm, vendorId: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select Vendor" /></SelectTrigger>
                  <SelectContent>
                    {vendors.map(v => (
                      <SelectItem key={v.id} value={String(v.id)}>{v.name} ({v.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Advance Amount (QAR) *">
                  <Input
                    type="number"
                    min="1"
                    value={advanceForm.amount}
                    onChange={e => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                    className="font-mono font-bold text-sm h-8"
                  />
                </Field>
                <Field label="Disbursement Date *">
                  <Input
                    type="date"
                    value={advanceForm.date}
                    onChange={e => setAdvanceForm({ ...advanceForm, date: e.target.value })}
                    className="h-8 text-xs"
                  />
                </Field>
              </div>

              <Field label="Disbursement Mode *">
                <Select value={advanceForm.paymentMode} onValueChange={v => setAdvanceForm({ ...advanceForm, paymentMode: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Wire / QNB Corporate Electronic">Bank Wire / Electronic Transfer (QNB)</SelectItem>
                    <SelectItem value="Commercial Bank of Qatar (CBQ) Wire">CBQ Electronic Wire</SelectItem>
                    <SelectItem value="Corporate Cheque / Manager's Cheque">Corporate Cheque</SelectItem>
                    <SelectItem value="Cash in Hand / Office Vault Cash">Cash in Hand / Cash Vault</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Payment Reference / TXN #">
                  <Input
                    value={advanceForm.reference}
                    onChange={e => setAdvanceForm({ ...advanceForm, reference: e.target.value })}
                    placeholder="TXN-998812"
                    className="h-8 text-xs font-mono"
                  />
                </Field>
                <Field label="Advance Purpose">
                  <Input
                    value={advanceForm.purpose}
                    onChange={e => setAdvanceForm({ ...advanceForm, purpose: e.target.value })}
                    className="h-8 text-xs"
                  />
                </Field>
              </div>

              <Field label="Remarks / PO Contract Ref">
                <Input
                  value={advanceForm.remarks}
                  onChange={e => setAdvanceForm({ ...advanceForm, remarks: e.target.value })}
                  placeholder="e.g. PO-2026-000008 30% advance mobilization"
                  className="h-8 text-xs"
                />
              </Field>

              {/* GL / SL / Account Impact Preview */}
              <div className="p-3 rounded-lg bg-muted/40 border text-[11px] space-y-2">
                <div className="flex items-center gap-1 font-semibold text-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Journal Entry Preview — Double-Entry GL/SL/Account Posting:
                </div>
                {/* DEBIT ROW */}
                <div className="grid grid-cols-4 gap-1 p-2 rounded bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/50">
                  <span className="font-bold text-blue-700 dark:text-blue-400 col-span-4 text-[10px]">DEBIT (Dr.) — Asset Created</span>
                  <div className="text-muted-foreground"><strong>GL Code:</strong> 12300001</div>
                  <div className="text-muted-foreground"><strong>Account:</strong> Advance to Vendors</div>
                  <div className="text-muted-foreground"><strong>Group:</strong> Current Assets</div>
                  <div className="text-muted-foreground"><strong>Sub-Ledger:</strong> {vendors.find(v => String(v.id) === advanceForm.vendorId)?.name || "—"}</div>
                  <div className="col-span-4 font-mono font-bold text-blue-700 dark:text-blue-400">QAR {Number(advanceForm.amount || 0).toLocaleString()}</div>
                </div>
                {/* CREDIT ROW */}
                <div className="grid grid-cols-4 gap-1 p-2 rounded bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 col-span-4 text-[10px]">
                    CREDIT (Cr.) — {advanceForm.paymentMode.includes("Cash") ? "Cash Disbursed" : "Bank Disbursed"}
                  </span>
                  <div className="text-muted-foreground"><strong>GL Code:</strong> {advanceForm.paymentMode.includes("Cash") ? "12100001" : "12000001"}</div>
                  <div className="text-muted-foreground"><strong>Account:</strong> {advanceForm.paymentMode.includes("Cash") ? "Cash in Hand (Office Vault)" : "Bank Operating Account (QNB)"}</div>
                  <div className="text-muted-foreground"><strong>Group:</strong> Current Assets / {advanceForm.paymentMode.includes("Cash") ? "Cash" : "Bank"}</div>
                  <div className="text-muted-foreground"><strong>Voucher:</strong> ADV-PV / {advanceForm.reference || "Auto"}</div>
                  <div className="col-span-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">QAR {Number(advanceForm.amount || 0).toLocaleString()}</div>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  This creates a current asset (advance to vendor) sub-ledger entry. Balance auto-offsets future payable invoices for this vendor.
                </p>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-muted/20 flex flex-row justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAdvanceModal(false)}>Cancel</Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
              disabled={saving || !advanceForm.vendorId || Number(advanceForm.amount) <= 0}
              onClick={() => {
                const amt = Number(advanceForm.amount);
                if (amt <= 0) return toast.error("Please specify a valid advance amount.");
                const advKey = `vendor_advance_${advanceForm.vendorId}`;
                const curr = Number(localStorage.getItem(advKey) || "0");
                localStorage.setItem(advKey, String(curr + amt));
                
                const targetVendor = vendors.find(v => String(v.id) === String(advanceForm.vendorId));
                postAdvanceVoucherToGL({
                  amount: amt,
                  vendorId: advanceForm.vendorId,
                  vendorName: targetVendor?.name || `Vendor #${advanceForm.vendorId}`,
                  paymentMode: advanceForm.paymentMode,
                  reference: advanceForm.reference,
                  date: advanceForm.date,
                  purpose: advanceForm.purpose || advanceForm.remarks
                });

                toast.success(`Advance payment of QAR ${amt.toLocaleString()} posted to Vendor Advance Ledger (Dr. 12300001 / Cr. ${advanceForm.paymentMode.includes("Cash") ? "12100001 Cash" : "12000001 Bank"}). Payment Voucher posted to Finance GL.`);
                setShowAdvanceModal(false);
                loadAll();
              }}
            >
              <CheckCircle2 className="h-4 w-4" /> Disburse & Post Advance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Advance Management & Utilization History Dialog ── */}
      <Dialog open={showAdvanceHistoryModal} onOpenChange={setShowAdvanceHistoryModal}>
        <DialogContent 
          className="max-w-2xl max-h-[95vh] flex flex-col p-0 overflow-hidden rounded-xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {advanceHistoryVendor && (() => {
            const advKey = `vendor_advance_${advanceHistoryVendor.id}`;
            const utilKey = `vendor_adv_util_${advanceHistoryVendor.id}`;
            const currentAdvance = Number(localStorage.getItem(advKey) || "0");
            const vendorInvoices = apInvoices.filter(i => String(i.vendor_id) === String(advanceHistoryVendor.id));
            const totalInvoiced = vendorInvoices.reduce((a, b) => a + Number(b.total_amount || 0), 0);
            const totalPaid = vendorInvoices.reduce((a, b) => {
              const pKey = `partial_paid_${b.id}`;
              return a + Number(localStorage.getItem(pKey) || (b.status === "PAID" ? b.total_amount : 0));
            }, 0);
            // Gather all utilization entries
            const explicitUtils: any[] = JSON.parse(localStorage.getItem(utilKey) || "[]");
            
            // Auto-detect any invoice settled where advance was applied
            const inferredUtils = vendorInvoices.filter(inv => {
              const pKey = `partial_paid_${inv.id}`;
              const pPaid = Number(localStorage.getItem(pKey) || (inv.status === "PAID" ? inv.total_amount : 0));
              return pPaid > 0 && !explicitUtils.some(u => u.invoice_id === inv.id || u.invoice_number === inv.invoice_number);
            }).map(inv => {
              const pKey = `partial_paid_${inv.id}`;
              const pPaid = Number(localStorage.getItem(pKey) || (inv.status === "PAID" ? inv.total_amount : 0));
              return {
                id: `util-inf-${inv.id}`,
                invoice_id: inv.id,
                invoice_number: inv.invoice_number,
                date: inv.invoice_date || new Date().toISOString().slice(0, 10),
                advance_used: pPaid,
                cash_paid: 0,
                total_settled: pPaid,
                reference: inv.po_number || "Advance Offset",
                created_at: new Date().toISOString()
              };
            });

            const allAdvanceUtils = [...explicitUtils, ...inferredUtils];
            const totalAdvanceUtilized = allAdvanceUtils.reduce((s, u) => s + Number(u.advance_used || 0), 0);
            const totalDisbursed = currentAdvance + totalAdvanceUtilized;

            return (
              <>
                <DialogHeader className="p-5 pb-3 border-b shrink-0 bg-gradient-to-r from-emerald-600/10 to-teal-600/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="flex items-center gap-2 text-base">
                        <History className="h-5 w-5 text-emerald-600" />
                        Advance Management &amp; Utilization History
                      </DialogTitle>
                      <DialogDescription className="text-xs">
                        Vendor: <strong className="text-foreground">{advanceHistoryVendor.name}</strong> ({advanceHistoryVendor.code})
                      </DialogDescription>
                    </div>
                    <Badge variant="outline" className="font-mono text-emerald-600 border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                      GL 12300001 (Advance to Vendors)
                    </Badge>
                  </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[calc(95vh-130px)]">
                  <div className="space-y-4 text-xs">
                    {/* KPI Balance Strip */}
                    <div className="grid grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-lg border bg-blue-500/10 border-blue-500/20 text-center">
                        <p className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold">Total Disbursed</p>
                        <p className="text-lg font-black font-mono text-blue-600 mt-1">QAR {totalDisbursed.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-lg border bg-violet-500/10 border-violet-500/20 text-center">
                        <p className="text-[10px] text-violet-700 dark:text-violet-400 font-semibold">Total Advance Utilized</p>
                        <p className="text-lg font-black font-mono text-violet-600 mt-1">QAR {totalAdvanceUtilized.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/20 text-center">
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Available Advance Balance</p>
                        <p className="text-lg font-black font-mono text-emerald-600 mt-1">QAR {currentAdvance.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-lg border bg-muted/40 text-center">
                        <p className="text-[10px] text-muted-foreground">Total Invoices Raised</p>
                        <p className="text-lg font-black font-mono text-primary mt-1">QAR {totalInvoiced.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Dedicated Advance Utilization Log */}
                    <div className="space-y-2">
                      <p className="font-bold text-foreground flex items-center gap-1.5">
                        <History className="h-4 w-4 text-violet-600" /> Advance Utilization Tracking &amp; Offsets
                      </p>
                      <div className="border rounded-lg overflow-x-auto">
                        <Table className="whitespace-nowrap">
                          <TableHeader>
                            <TableRow className="bg-muted/50 text-[11px] whitespace-nowrap">
                              <TableHead className="font-bold whitespace-nowrap">Date</TableHead>
                              <TableHead className="font-bold whitespace-nowrap">Invoice #</TableHead>
                              <TableHead className="font-bold whitespace-nowrap">Reference / Voucher</TableHead>
                              <TableHead className="font-bold text-right whitespace-nowrap">Advance Utilized (QAR)</TableHead>
                              <TableHead className="font-bold text-right whitespace-nowrap">Cash / Bank Paid (QAR)</TableHead>
                              <TableHead className="font-bold text-right whitespace-nowrap">Total Settled (QAR)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allAdvanceUtils.map((u) => (
                              <TableRow key={u.id} className="text-xs hover:bg-muted/30 whitespace-nowrap">
                                <TableCell className="whitespace-nowrap font-medium">{formatDDMMMYYYY(u.date)}</TableCell>
                                <TableCell className="font-mono font-bold text-primary whitespace-nowrap">{u.invoice_number}</TableCell>
                                <TableCell className="font-mono text-cyan-600 whitespace-nowrap">{u.reference || "Advance Offset"}</TableCell>
                                <TableCell className="text-right font-mono font-bold text-violet-600 whitespace-nowrap">QAR {Number(u.advance_used).toLocaleString()}</TableCell>
                                <TableCell className="text-right font-mono text-muted-foreground whitespace-nowrap">QAR {Number(u.cash_paid).toLocaleString()}</TableCell>
                                <TableCell className="text-right font-mono font-bold text-emerald-600 whitespace-nowrap">QAR {Number(u.total_settled).toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                            {allAdvanceUtils.length === 0 && (
                              <TableRow><TableCell colSpan={6} className="text-center py-3 text-muted-foreground whitespace-nowrap">No advance utilization records yet. Advances are tracked here when applied to invoices.</TableCell></TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Invoices & Settlement Offset Ledger */}
                    <div className="space-y-2">
                      <p className="font-bold text-foreground flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-primary" /> Vendor Invoices &amp; Total Settlements
                      </p>
                      <div className="border rounded-lg overflow-x-auto">
                        <Table className="whitespace-nowrap">
                          <TableHeader>
                            <TableRow className="bg-muted/50 text-[11px] whitespace-nowrap">
                              <TableHead className="font-bold whitespace-nowrap">Invoice #</TableHead>
                              <TableHead className="font-bold whitespace-nowrap">PO / GRN</TableHead>
                              <TableHead className="font-bold whitespace-nowrap">Date</TableHead>
                              <TableHead className="font-bold text-right whitespace-nowrap">Amount (QAR)</TableHead>
                              <TableHead className="font-bold whitespace-nowrap">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {vendorInvoices.map((inv) => (
                              <TableRow key={inv.id} className="text-xs hover:bg-muted/30 whitespace-nowrap">
                                <TableCell className="font-mono font-bold text-primary whitespace-nowrap">{inv.invoice_number}</TableCell>
                                <TableCell className="font-mono text-cyan-600 whitespace-nowrap">{inv.po_number || "—"}</TableCell>
                                <TableCell className="whitespace-nowrap">{formatDDMMMYYYY(inv.invoice_date)}</TableCell>
                                <TableCell className="text-right font-mono font-bold whitespace-nowrap">QAR {Number(inv.total_amount).toLocaleString()}</TableCell>
                                <TableCell className="whitespace-nowrap">
                                  <Badge variant={inv.status === "PAID" ? "default" : "outline"} className="text-[10px] whitespace-nowrap">
                                    {inv.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                            {vendorInvoices.length === 0 && (
                              <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground whitespace-nowrap">No invoices recorded for this vendor.</TableCell></TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="p-4 border-t bg-muted/20 flex justify-end shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setShowAdvanceHistoryModal(false)}>Close</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Vendor Orders Inspector Modal ── */}
      <Dialog open={showOrdersModal} onOpenChange={setShowOrdersModal}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {ordersVendor && (() => {
            const posForVendor = vendorPos.filter(p => Number(p.vendor_id) === Number(ordersVendor.id) || String(p.vendor_id) === String(ordersVendor.id));
            const totalPoValue = posForVendor.reduce((a, b) => a + Number(b.total_amount || 0), 0);

            return (
              <>
                <DialogHeader className="p-5 pb-3 border-b shrink-0 bg-gradient-to-r from-cyan-600/10 to-blue-600/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="flex items-center gap-2 text-base">
                        <ShoppingBag className="h-5 w-5 text-cyan-600" />
                        Purchase Orders &amp; Procurement Contracts
                      </DialogTitle>
                      <DialogDescription className="text-xs">
                        Vendor: <strong className="text-foreground">{ordersVendor.name}</strong> ({ordersVendor.code})
                      </DialogDescription>
                    </div>
                    <Badge variant="outline" className="font-mono text-cyan-600 border-cyan-500/40">
                      {posForVendor.length} Order(s)
                    </Badge>
                  </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-5 max-h-[calc(90vh-140px)]">
                  <div className="space-y-4 text-xs">
                    <div className="p-3.5 rounded-lg border bg-cyan-500/10 border-cyan-500/20 flex items-center justify-between">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Total PO Contract Volume</span>
                        <span className="text-xl font-bold font-mono text-cyan-700 dark:text-cyan-400">
                          QAR {totalPoValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right text-[11px]">
                        <span className="text-muted-foreground block">Active Payment Terms</span>
                        <span className="font-semibold text-foreground">{(ordersVendor as any).payment_terms || "30 Days"}</span>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50 text-[11px]">
                            <TableHead className="font-bold">PO Number</TableHead>
                            <TableHead className="font-bold">Order Date</TableHead>
                            <TableHead className="font-bold">Delivery Due</TableHead>
                            <TableHead className="font-bold text-right">Total (QAR)</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {posForVendor.map((po) => (
                            <TableRow key={po.id} className="text-xs hover:bg-muted/30">
                              <TableCell className="font-mono font-bold text-primary">{po.doc_number}</TableCell>
                              <TableCell>{po.po_date}</TableCell>
                              <TableCell>{po.delivery_date || "—"}</TableCell>
                              <TableCell className="text-right font-mono font-bold">QAR {Number(po.total_amount).toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant={po.status === "CLOSED" ? "default" : po.status === "APPROVED" ? "secondary" : "outline"} className="text-[10px]">
                                  {po.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                          {posForVendor.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                No purchase orders issued for this vendor yet.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </ScrollArea>

                <DialogFooter className="p-4 border-t bg-muted/20 flex justify-end shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setShowOrdersModal(false)}>Close</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Vendor AP Payment Disbursement Modal (2-Step Stepper) ── */}
      <Dialog open={!!paymentTargetInv} onOpenChange={(open) => { if (!open) setPaymentTargetInv(null); }}>
        <DialogContent
          className="max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {/* Header */}
          <DialogHeader className="p-4 pb-2.5 border-b shrink-0 bg-muted/10">
            <DialogTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Vendor Invoice Payment & Settlement
            </DialogTitle>
            <DialogDescription className="text-xs">
              Review invoice settlement details and GL posting preview. (Disbursements are posted via Finance Team).
            </DialogDescription>
          </DialogHeader>

          {/* Stepper Header Bar */}
          <div className="grid grid-cols-2 gap-2 border-b px-5 py-2.5 bg-muted/30 shrink-0">
            {[
              { step: 1, label: "1. Settlement & Payment Mode", icon: CreditCard },
              { step: 2, label: "2. GL & Accounts Verification", icon: ShieldCheck },
            ].map(({ step, label, icon: Icon }) => (
              <button
                key={step}
                type="button"
                onClick={() => setPayModalStep(step)}
                className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-semibold transition-all ${
                  payModalStep === step
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : payModalStep > step
                    ? "text-emerald-600 hover:bg-muted/50"
                    : "text-muted-foreground hover:bg-muted/30"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  payModalStep === step ? "bg-primary text-primary-foreground" : payModalStep > step ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border"
                }`}>
                  {payModalStep > step ? "✓" : step}
                </span>
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 max-h-[calc(85vh-135px)]">
          {paymentTargetInv && (
            <div className="space-y-4 py-1 text-xs">
              {/* ── STEP 1: SETTLEMENT & PAYMENT MODE ── */}
              {payModalStep === 1 && (
                <div className="space-y-3.5">
                  {/* Invoice summary card */}
                  <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                    <div className="flex justify-between font-semibold">
                      <span className="text-muted-foreground">Invoice Reference:</span>
                      <span className="font-mono text-primary">{paymentTargetInv.invoice_number}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-muted-foreground">Vendor Name:</span>
                      <span>{vendors.find(v => String(v.id) === String(paymentTargetInv.vendor_id))?.name || String(paymentTargetInv.vendor_id)}</span>
                    </div>
                    {paymentTargetInv.po_number && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">PO & GRN Chain:</span>
                        <span className="font-mono text-cyan-600">{paymentTargetInv.po_number} {paymentTargetInv.grn_number ? `→ ${paymentTargetInv.grn_number}` : ""}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold border-t border-emerald-500/20 pt-1.5">
                      <span>Total Invoice Amount:</span>
                      <span className="text-emerald-600 font-mono">QAR {Number(paymentTargetInv.total_amount || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* ── PRIORITY 1: Advance Settlement (shown FIRST if balance exists) ── */}
                  {(() => {
                    const totalDue = Number(paymentTargetInv.total_amount || 0);
                    const partialKey = `partial_paid_${paymentTargetInv.id}`;
                    const alreadyPaid = Number(localStorage.getItem(partialKey) || "0");
                    const outstanding = totalDue - alreadyPaid;
                    const advKey = `vendor_advance_${paymentTargetInv.vendor_id}`;
                    const advBalance = Number(localStorage.getItem(advKey) || "0");
                    const advApplied = vendorPayForm.applyAdvance ? Math.min(vendorPayForm.advanceAmount, advBalance) : 0;
                    const cashRequired = Math.max(0, outstanding - advApplied);
                    const payingNow = vendorPayForm.paymentAmount;
                    const remaining = outstanding - payingNow - advApplied;

                    return (
                      <div className="space-y-3">

                        {/* Outstanding Balance Summary */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 rounded-md bg-muted/50 border">
                            <p className="text-[10px] text-muted-foreground">Invoice Total</p>
                            <p className="font-bold font-mono text-sm">QAR {totalDue.toLocaleString()}</p>
                          </div>
                          <div className="p-2 rounded-md bg-blue-500/10 border border-blue-500/20">
                            <p className="text-[10px] text-blue-600">Previously Paid</p>
                            <p className="font-bold font-mono text-sm text-blue-600">QAR {alreadyPaid.toLocaleString()}</p>
                          </div>
                          <div className={`p-2 rounded-md border ${remaining <= 0.01 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
                            <p className={`text-[10px] ${remaining <= 0.01 ? "text-emerald-600" : "text-amber-600"}`}>
                              {remaining <= 0.01 ? "Fully Settled" : "Remaining After"}
                            </p>
                            <p className={`font-bold font-mono text-sm ${remaining <= 0.01 ? "text-emerald-600" : "text-amber-600"}`}>
                              QAR {Math.max(0, remaining).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* STEP A: Advance Settlement — FIRST PRIORITY */}
                        {advBalance > 0 ? (
                          <div className="p-3 rounded-lg bg-violet-500/10 border-2 border-violet-500/30 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-violet-700 dark:text-violet-400 flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5" />
                                Step 1 — Apply Vendor Advance (First Priority)
                              </p>
                              <span className="text-[10px] font-mono bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 px-2 py-0.5 rounded border border-violet-300/40">
                                GL 12300001 → 22100001
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="vendorApplyAdv"
                                checked={vendorPayForm.applyAdvance}
                                onChange={e => {
                                  const checked = e.target.checked;
                                  setVendorPayForm(prev => ({
                                    ...prev,
                                    applyAdvance: checked,
                                    advanceAmount: checked ? Math.min(advBalance, outstanding) : 0,
                                  }));
                                }}
                                className="h-4 w-4 rounded"
                              />
                              <label htmlFor="vendorApplyAdv" className="text-xs font-semibold cursor-pointer">
                                Use Advance Balance — Available: <span className="font-mono text-violet-700 dark:text-violet-400">QAR {advBalance.toLocaleString()}</span>
                              </label>
                            </div>
                            {vendorPayForm.applyAdvance && (
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold block">Advance Amount to Apply (QAR)</label>
                                <Input
                                  type="number"
                                  min="0"
                                  max={Math.min(advBalance, outstanding)}
                                  value={vendorPayForm.advanceAmount}
                                  onChange={e => setVendorPayForm({ ...vendorPayForm, advanceAmount: Math.min(Number(e.target.value), advBalance, outstanding) })}
                                  className="font-mono h-8 text-xs"
                                />
                                <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground font-mono p-2 bg-violet-50/70 dark:bg-violet-950/30 rounded border border-violet-200/40">
                                  <div><strong>Dr.</strong> 22100001 Trade Payables</div>
                                  <div className="text-right font-bold text-violet-700 dark:text-violet-400">QAR {advApplied.toLocaleString()}</div>
                                  <div><strong>Cr.</strong> 12300001 Advance to Vendors</div>
                                  <div className="text-right font-bold text-violet-700 dark:text-violet-400">QAR {advApplied.toLocaleString()}</div>
                                </div>
                                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                                  Cash required after advance offset: QAR {cashRequired.toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-muted/30 border border-dashed text-[10px] text-muted-foreground flex items-center gap-2">
                            <Info className="h-3.5 w-3.5 shrink-0" />
                            No advance balance available for this vendor. Payment will be settled entirely via cash/bank disbursement.
                          </div>
                        )}

                        {/* STEP B: Cash / Bank Payment — only if still outstanding after advance */}
                        <div className="p-3 rounded-lg bg-muted/30 border space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold">
                              {advApplied > 0 ? "Step 2 — Cash / Bank Payment (Remaining Balance)" : "Cash / Bank Payment Amount (QAR) *"}
                            </label>
                            {cashRequired > 0 && (
                              <button
                                type="button"
                                className="text-[10px] text-primary underline"
                                onClick={() => setVendorPayForm({ ...vendorPayForm, paymentAmount: cashRequired })}
                              >
                                Use Remaining ({cashRequired.toLocaleString()})
                              </button>
                            )}
                          </div>
                          <Input
                            type="number"
                            min="0"
                            max={outstanding}
                            value={vendorPayForm.paymentAmount}
                            onChange={e => setVendorPayForm({ ...vendorPayForm, paymentAmount: Math.min(Number(e.target.value), outstanding) })}
                            className="font-mono font-bold text-base h-10"
                          />
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Outstanding: QAR {outstanding.toLocaleString()} {advApplied > 0 ? `(Adv. applied: QAR ${advApplied.toLocaleString()})` : ""}</span>
                            <span className={payingNow + advApplied >= outstanding - 0.01 ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                              {payingNow + advApplied >= outstanding - 0.01 ? "Full settlement" : `Partial — QAR ${Math.max(0, remaining).toLocaleString()} will remain`}
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })()}

                  {/* Payment Date + Mode */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold block mb-1.5">Payment Date *</label>
                      <Input type="date" value={vendorPayForm.paymentDate} onChange={e => setVendorPayForm({ ...vendorPayForm, paymentDate: e.target.value })} className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1.5">Payment Mode *</label>
                      <Select value={vendorPayForm.paymentMethod} onValueChange={v => setVendorPayForm({ ...vendorPayForm, paymentMethod: v })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bank Wire / QNB Corporate Electronic">Bank Wire / Electronic Transfer (QNB)</SelectItem>
                          <SelectItem value="Commercial Bank of Qatar (CBQ) Wire">CBQ Electronic Wire</SelectItem>
                          <SelectItem value="Cash in Hand / Office Vault Cash">Cash in Hand / Office Vault Cash</SelectItem>
                          <SelectItem value="Petty Cash / Direct Cash">Petty Cash / Direct Cash Voucher</SelectItem>
                          <SelectItem value="Corporate Cheque / Manager's Cheque">Corporate Cheque / Manager's Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Dynamic: Bank Wire fields */}
                  {(vendorPayForm.paymentMethod.includes("Wire") || vendorPayForm.paymentMethod.includes("CBQ")) && (
                    <div className="space-y-3 p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="font-bold text-blue-700 dark:text-blue-400">Bank Wire / Electronic Transfer Details</p>
                      <div>
                        <label className="text-xs font-semibold block mb-1.5">Disbursing Bank Account</label>
                        <Select value={vendorPayForm.disbursingBank} onValueChange={v => setVendorPayForm({ ...vendorPayForm, disbursingBank: v })}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)">QNB - Main Operating (QA42QNBA00000000123456)</SelectItem>
                            <SelectItem value="Commercial Bank of Qatar (CBQ) - Operational (IBAN: QA99CBQA00000000654321)">CBQ - Operational (QA99CBQA00000000654321)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold block mb-1.5">Wire Transfer Reference #</label>
                          <Input value={vendorPayForm.transactionReference} onChange={e => setVendorPayForm({ ...vendorPayForm, transactionReference: e.target.value })} placeholder="e.g. TXN-884211" className="h-8 text-xs font-mono" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold block mb-1.5">Beneficiary Account / IBAN</label>
                          <Input value={vendorPayForm.beneficiaryAccount} onChange={e => setVendorPayForm({ ...vendorPayForm, beneficiaryAccount: e.target.value })} className="h-8 text-xs font-mono" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dynamic: Cash fields */}
                  {(vendorPayForm.paymentMethod.includes("Cash") || vendorPayForm.paymentMethod.includes("Petty")) && (
                    <div className="space-y-3 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="font-bold text-amber-700 dark:text-amber-400">Cash Disbursement & Handover Details</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold block mb-1.5">Disbursing Cash Vault</label>
                          <Input disabled value="12100001 - Cash in Hand (Office Vault)" className="bg-background h-8 text-xs" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold block mb-1.5">Petty Cash Voucher / Receipt #</label>
                          <Input value={vendorPayForm.cashReceiptNo} onChange={e => setVendorPayForm({ ...vendorPayForm, cashReceiptNo: e.target.value })} placeholder="PCV-00821" className="h-8 text-xs font-mono" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold block mb-1.5">Receiver / Vendor Representative Name *</label>
                        <Input value={vendorPayForm.receiverName} onChange={e => setVendorPayForm({ ...vendorPayForm, receiverName: e.target.value })} placeholder="Full name of recipient" className="h-8 text-xs" />
                      </div>
                    </div>
                  )}

                  {/* Dynamic: Cheque fields */}
                  {vendorPayForm.paymentMethod.includes("Cheque") && (
                    <div className="space-y-3 p-3.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                      <p className="font-bold text-violet-700 dark:text-violet-400">Corporate Cheque Details</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold block mb-1.5">Issuing Bank</label>
                          <Input disabled value="Qatar National Bank (QNB) - Corporate Cheque" className="bg-background h-8 text-xs" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold block mb-1.5">Cheque Number *</label>
                          <Input value={vendorPayForm.chequeNumber} onChange={e => setVendorPayForm({ ...vendorPayForm, chequeNumber: e.target.value })} placeholder="CHQ-004812" className="h-8 text-xs font-mono" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold block mb-1.5">Cheque Due / Value Date</label>
                          <Input type="date" value={vendorPayForm.chequeDueDate} onChange={e => setVendorPayForm({ ...vendorPayForm, chequeDueDate: e.target.value })} className="h-8 text-xs" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold block mb-1.5">Payee / In Favor Of</label>
                          <Input disabled value={vendors.find(v => String(v.id) === String(paymentTargetInv.vendor_id))?.name || ""} className="bg-background h-8 text-xs" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 2: GL & ACCOUNTS VERIFICATION ── */}
              {payModalStep === 2 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/40 border space-y-3">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" /> Chart of Accounts (COA) / GL / SL Double-Entry Mapping
                    </p>

                    {/* Debit Line */}
                    <div className="p-3 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">DEBIT (Dr.) — Liability Settlement</span>
                        <span className="font-bold font-mono text-blue-700 dark:text-blue-400">
                          QAR {(vendorPayForm.paymentAmount + (vendorPayForm.applyAdvance ? vendorPayForm.advanceAmount : 0)).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t border-blue-200/50">
                        <div><strong>GL Code:</strong> 22100001</div>
                        <div><strong>GL Name:</strong> Trade Payables (Vendors)</div>
                        <div><strong>Account Group:</strong> Current Liabilities</div>
                        <div><strong>Sub-Ledger:</strong> {vendors.find(v => String(v.id) === String(paymentTargetInv.vendor_id))?.name || `Vendor #${paymentTargetInv.vendor_id}`}</div>
                      </div>
                    </div>

                    {/* Credit Line 1: Cash/Bank */}
                    {vendorPayForm.paymentAmount > 0 && (
                      <div className="p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">CREDIT (Cr.) — Disbursing Source</span>
                          <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
                            QAR {vendorPayForm.paymentAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[11px] grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t border-emerald-200/50">
                          <div><strong>GL Code:</strong> {vendorPayForm.paymentMethod.includes("Cash") ? "12100001" : "12000001"}</div>
                          <div><strong>GL Name:</strong> {vendorPayForm.paymentMethod.includes("Cash") ? "Cash in Hand (Office Vault)" : "Bank Operating Account (QNB/CBQ)"}</div>
                          <div><strong>Account Group:</strong> Current Assets / Cash &amp; Bank</div>
                          <div><strong>Voucher Type:</strong> PV (Payment Voucher)</div>
                        </div>
                      </div>
                    )}

                    {/* Credit Line 2: Advance Offset (if applied) */}
                    {vendorPayForm.applyAdvance && vendorPayForm.advanceAmount > 0 && (
                      <div className="p-3 rounded-lg border bg-violet-50/50 dark:bg-violet-950/20 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-violet-700 dark:text-violet-400 font-mono">CREDIT (Cr.) — Advance Offset</span>
                          <span className="font-bold font-mono text-violet-700 dark:text-violet-400">
                            QAR {vendorPayForm.advanceAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[11px] grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t border-violet-200/50">
                          <div><strong>GL Code:</strong> 12300001</div>
                          <div><strong>GL Name:</strong> Advance to Vendors</div>
                          <div><strong>Account Group:</strong> Current Assets (Advance Payments)</div>
                          <div><strong>Offset Status:</strong> Cleared from Advance Ledger</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary recap table */}
                  <div className="p-3 rounded-lg border bg-background text-[11px] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invoice Reference:</span>
                      <span className="font-mono font-bold text-primary">{paymentTargetInv.invoice_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Mode:</span>
                      <span className="font-semibold">{vendorPayForm.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction / Voucher Ref:</span>
                      <span className="font-mono">{vendorPayForm.transactionReference || "Auto-Generated"}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1.5 font-bold">
                      <span>Total Settlement Impact:</span>
                      <span className="font-mono text-emerald-600">QAR {(vendorPayForm.paymentAmount + (vendorPayForm.applyAdvance ? vendorPayForm.advanceAmount : 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>

          {/* Stepper Footer */}
          <DialogFooter className="p-4 border-t bg-muted/20 flex flex-row justify-between items-center sm:justify-between w-full shrink-0">
            <div>
              {payModalStep > 1 && (
                <Button type="button" variant="outline" size="sm" onClick={() => setPayModalStep(s => s - 1)}>
                  Back to Details
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPaymentTargetInv(null)}>Cancel</Button>
              {payModalStep === 1 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (vendorPayForm.paymentAmount <= 0 && (!vendorPayForm.applyAdvance || vendorPayForm.advanceAmount <= 0)) {
                      return toast.error("Please enter a payment amount or apply advance credit.");
                    }
                    setPayModalStep(2);
                  }}
                >
                  Verify GL &amp; Accounts <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={handleConfirmVendorPayment} disabled={saving}>
                  <CheckCircle2 className="h-4 w-4" /> Confirm &amp; Post to GL
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: BULK VENDOR IMPORT ──────────────────────────────────────────── */}
      <Dialog open={bulkVendorOpen} onOpenChange={setBulkVendorOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Bulk Vendor Roster Ingestion (CSV / Excel)
            </DialogTitle>
            <DialogDescription>
              Upload a CSV file to register multiple vendor accounts with master data, bank details, and qualification flags in a single operation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="flex items-center justify-between p-3.5 rounded-lg border bg-muted/40">
              <div className="text-sm">
                <p className="font-semibold text-foreground">Standard Vendor Master Template</p>
                <p className="text-xs text-muted-foreground mt-0.5">Columns: VendorCode, VendorName, VendorType, ContactPerson, Email, Phone, TaxNumber, Address, City, Country, PaymentTerms, BankName, IBAN, Status</p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadVendorCsvTemplate} className="gap-2 shrink-0">
                <Download className="h-4 w-4" /> Template
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Select CSV Document</Label>
              <Input
                type="file"
                accept=".csv, text/csv, application/vnd.ms-excel"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    setBulkVendorData(evt.target?.result as string || "");
                  };
                  reader.readAsText(file);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Or Paste Raw CSV Lines</Label>
              <Textarea
                value={bulkVendorData}
                onChange={(e) => setBulkVendorData(e.target.value)}
                placeholder={`VendorCode,VendorName,VendorType,ContactPerson,Email,Phone,TaxNumber,Address,City,Country,PaymentTerms,BankName,IBAN,Status\nVND-8801,Gulf Facilities LLC,Supplier,Ahmed Hassan,ahmed@gulffacil.qa,+97455001122,10001234567890003,Building 12 C Ring Rd,Doha,Qatar,Net 30 Days,Qatar National Bank,QA55QNBA00000000123456,Active`}
                className="font-mono text-xs h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkVendorOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkVendorImport} disabled={bulkVendorLoading || !bulkVendorData.trim()} className="gap-2">
              {bulkVendorLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Import Vendors
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  );
}
