import { supabase } from './supabase';
import { apiDb } from "@/lib/api-db";
import { toast } from "sonner";
import { upsertCollectionRecords, loadCollectionRows } from "@/lib/db-collection";
import { persistVoucher } from "@/lib/finance/finance-persistence";

/** Procurement AP invoices and payment receipts live in the database. Screens read an in-memory copy of it. */
const dbSave = (store: string, rows: { id: string; data: unknown }[], what: string) => {
  if (rows.length === 0) return;
  void upsertCollectionRecords(store, rows).then(err => {
    if (err) toast.error(`${what} was NOT saved to the database: ${err}`);
  });
};

async function softDeleteIds(store: string, ids: string[]) {
  for (const id of ids) {
    const { error } = await apiDb.from("app_documents").update({ deleted: true, updated_at: new Date().toISOString() } as any).eq("store", store).eq("id", id);
    if (error) toast.error(`Removal in ${store} was NOT saved to the database: ${error.message}`);
  }
}

// In-memory copy of the database rows. Nothing is kept in browser storage.
let apInvoicesMem: ProcApInvoice[] = [];
let receiptsMem: PaymentReceipt[] = [];

// Browser copies written by earlier versions of this screen. They are uploaded once and then removed.
const LEGACY_INVOICE_KEY = "proc_ap_invoices_cache_v2";
const LEGACY_RECEIPT_KEY = "proc_payment_receipts_v2";

function readLegacy(key: string): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Load the procurement records from the database. Browser-only leftovers are uploaded first. */
export async function syncProcFromDatabase(): Promise<void> {
  const [inv, rec] = await Promise.all([loadCollectionRows("proc.ap_invoices"), loadCollectionRows("proc.payment_receipts")]);

  if (inv) {
    const known = new Set(inv.map(r => r.id));
    const legacy = readLegacy(LEGACY_INVOICE_KEY);
    const localOnly = legacy.filter(x => !known.has(String(x.id ?? x.invoice_number)));
    if (localOnly.length) {
      const err = await upsertCollectionRecords("proc.ap_invoices", localOnly.map(x => ({ id: String(x.id ?? x.invoice_number), data: x })));
      if (err) toast.error(`AP invoices from this browser were NOT saved to the database: ${err}`);
      else localStorage.removeItem(LEGACY_INVOICE_KEY);
    } else if (legacy.length) {
      localStorage.removeItem(LEGACY_INVOICE_KEY);
    }
    apInvoicesMem = [...inv.map(r => r.data as ProcApInvoice), ...localOnly as ProcApInvoice[]];
    window.dispatchEvent(new Event("ap_invoices_updated"));
  }

  if (rec) {
    const known = new Set(rec.map(r => r.id));
    const legacy = readLegacy(LEGACY_RECEIPT_KEY);
    const localOnly = legacy.filter(x => !known.has(String(x.id ?? x.receipt_number)));
    if (localOnly.length) {
      const err = await upsertCollectionRecords("proc.payment_receipts", localOnly.map(x => ({ id: String(x.id ?? x.receipt_number), data: x })));
      if (err) toast.error(`Payment receipts from this browser were NOT saved to the database: ${err}`);
      else localStorage.removeItem(LEGACY_RECEIPT_KEY);
    } else if (legacy.length) {
      localStorage.removeItem(LEGACY_RECEIPT_KEY);
    }
    receiptsMem = [...rec.map(r => r.data as PaymentReceipt), ...localOnly as PaymentReceipt[]];
    window.dispatchEvent(new Event("payment_receipts_updated"));
  }
}

async function reloadStore(store: "proc.ap_invoices" | "proc.payment_receipts") {
  const rows = await loadCollectionRows(store);
  if (!rows) return;
  if (store === "proc.ap_invoices") {
    apInvoicesMem = rows.map(r => r.data as ProcApInvoice);
    window.dispatchEvent(new Event("ap_invoices_updated"));
  } else {
    receiptsMem = rows.map(r => r.data as PaymentReceipt);
    window.dispatchEvent(new Event("payment_receipts_updated"));
  }
}

// Changes made in other sessions arrive through Supabase Realtime.
if (typeof window !== "undefined") {
  for (const store of ["proc.ap_invoices", "proc.payment_receipts"] as const) {
    supabase
      .channel(`app-documents:${store}`)
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "app_documents", filter: `store=eq.${store}` }, () => { void reloadStore(store); })
      .subscribe();
  }
  void syncProcFromDatabase().catch(() => { /* the screens show what is already loaded */ });
}

export type ProcApInvoice = {
  id: string;
  invoice_number: string;
  vendor_id: string | number;
  vendor_name?: string;
  po_number?: string;
  grn_number?: string;
  invoice_date: string;
  voucher_date?: string;
  due_date?: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  amount_paid?: number;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "PAID" | "DISPUTED" | "PARTIAL";
  posting_status?: string;
  remarks?: string;
  payment_method?: string;
  payment_terms?: string;
  settlement_mode?: string;
  payment_reference?: string;
  paid_at?: string;
  created_at?: string;
  receipt_attachment?: string;
  source_type?: "PROCUREMENT" | "MAINTENANCE" | "DIRECT";
  property?: string;
  unit_ref?: string;
  expense_gl_account?: string;
  expense_gl_code?: string;
  /** Expense split of a direct AP invoice: one entry per ledger, each with an optional property and unit. */
  allocations?: Array<{ gl_code: string; gl_name: string; amount: number; property: string; unit: string; note?: string }>;
};

export type PaymentReceipt = {
  id: string;
  receipt_number: string;
  voucher_number: string;
  invoice_number: string;
  po_number?: string;
  grn_number?: string;
  vendor_id: string | number;
  vendor_name?: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  reference_no: string;
  bank_account: string;
  gl_debit_account: string;
  gl_credit_account: string;
  remarks?: string;
  status: "Settled" | "Processing" | "Partial";
  created_at: string;
};

/** Screens read the in-memory copy; every change is written to the database in the same call. */
function getLocalInvoices(): ProcApInvoice[] {
  return apInvoicesMem;
}

function saveLocalInvoices(list: ProcApInvoice[]) {
  const nextIds = new Set(list.map(i => String((i as any).id ?? i.invoice_number)));
  const removed = apInvoicesMem.map(i => String((i as any).id ?? i.invoice_number)).filter(id => !nextIds.has(id));
  apInvoicesMem = list;
  dbSave("proc.ap_invoices", list.map(i => ({ id: String((i as any).id ?? i.invoice_number), data: i })), "AP invoice");
  if (removed.length) void softDeleteIds("proc.ap_invoices", removed);
  window.dispatchEvent(new Event("ap_invoices_updated"));
}

function getLocalReceipts(): PaymentReceipt[] {
  return receiptsMem;
}

function saveLocalReceipts(list: PaymentReceipt[]) {
  const nextIds = new Set(list.map(r => String((r as any).id ?? (r as any).receipt_number)));
  const removed = receiptsMem.map(r => String((r as any).id ?? (r as any).receipt_number)).filter(id => !nextIds.has(id));
  receiptsMem = list;
  dbSave("proc.payment_receipts", list.map(r => ({ id: String((r as any).id ?? (r as any).receipt_number), data: r })), "Payment receipt");
  if (removed.length) void softDeleteIds("proc.payment_receipts", removed);
  window.dispatchEvent(new Event("payment_receipts_updated"));
}

// Helper to push vouchers into Finance Store & Supabase
async function postFinancePaymentVoucher(invoice: ProcApInvoice, receiptNum: string, pvNum: string) {
  const paidDate = invoice.paid_at || new Date().toISOString().slice(0, 10);

  // 1. Post the payment voucher with its account lines to the database. If it is refused, say so.
  try {
    const pv = await persistVoucher({
      id: pvNum,
      voucher_no: pvNum,
      voucher_type: "Payment Voucher",
      date: paidDate,
      name: `Vendor Payment: ${invoice.invoice_number} | PO: ${invoice.po_number || 'N/A'} | GRN: ${invoice.grn_number || 'N/A'} | Rcpt: ${receiptNum} | Method: ${invoice.payment_method || 'Bank'}`,
      debit: "Trade Payables - Vendors",
      debit_code: "22100001",
      credit: "Bank Operating Account",
      credit_code: "12000001",
      amount: Number(invoice.total_amount) || 0,
    });
    if (!pv.ok) toast.error(`Payment voucher ${pvNum} was NOT saved to the database: ${pv.error}`);
  } catch (e: any) {
    toast.error(`Payment voucher ${pvNum} was NOT saved to the database: ${e?.message || e}`);
  }

  // 2. Payable invoice in the database (store fin.ap): mark it Paid, or add it if the finance side does not have it yet.
  try {
    window.dispatchEvent(new Event("finance_vouchers_updated"));
    const rows = await loadCollectionRows("fin.ap");
    if (rows === null) {
      toast.error(`Payable invoice ${invoice.invoice_number} was NOT updated: the database could not be read.`);
      return;
    }
    const invNo = invoice.invoice_number;
    const match = rows.find(r => (r.data as any)?.invoice_no === invNo);
    if (match) {
      dbSave("fin.ap", [{ id: match.id, data: { ...(match.data as any), status: "Paid" } }], "Payable invoice status");
    } else {
      const apEntry = {
        id: `ap-proc-${Date.now()}`,
        invoice_no: invNo,
        vendor: String(invoice.vendor_id),
        date: invoice.invoice_date,
        due_date: invoice.due_date || paidDate,
        account: "51004001 - Repair and Maintenance Cost",
        account_code: "51004001",
        amount: invoice.total_amount,
        status: "Paid",
      };
      dbSave("fin.ap", [{ id: apEntry.id, data: apEntry }], "Payable invoice");
    }
  } catch (e) {
    console.error("Failed to sync AP Invoice to Finance:", e);
  }
}

export const ApInvoicesApi = {
  fetchAll: async (): Promise<ProcApInvoice[]> => {
    let invoices: ProcApInvoice[] = [];

    // 1. Try fetching from Supabase
    try {
      const { data, error } = await supabase.from('proc_ap_invoices').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        invoices = data;
      }
    } catch {
      // ignore
    }

    // 2. LocalStorage Procurement Invoices
    if (invoices.length === 0) {
      invoices = getLocalInvoices();
    }

    const existingInvNumbers = new Set(invoices.map(i => i.invoice_number).filter(Boolean));

    // 3. Auto-sync / synthesize from proc_goods_receipts (GRNs)
    try {
      const [grnRes, poRes] = await Promise.all([
        supabase.from('proc_goods_receipts').select('*').order('created_at', { ascending: false }),
        supabase.from('proc_purchase_orders').select('*')
      ]);

      const grns = grnRes.data || [];
      const pos = poRes.data || [];
      const poMap = new Map(pos.map(p => [p.id, p]));

      const existingGrnNumbers = new Set(invoices.map(i => i.grn_number).filter(Boolean));
      let hasNew = false;

      for (const grn of grns) {
        if (!existingGrnNumbers.has(grn.grn_number)) {
          const po = poMap.get(grn.purchase_order_id);
          const grnSuffix = grn.grn_number ? grn.grn_number.replace(/^GRN-/, '') : String(Date.now()).slice(-6);
          const invNumber = `APINV-${grnSuffix}`;
          
          const newInv: ProcApInvoice = {
            id: `inv-auto-${grn.id || grnSuffix}`,
            invoice_number: invNumber,
            vendor_id: grn.vendor_id || po?.vendor_id || "1",
            po_number: po?.doc_number || "—",
            grn_number: grn.grn_number,
            invoice_date: grn.grn_date || new Date().toISOString().slice(0, 10),
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            amount: Number(grn.total_amount || 0),
            tax_amount: 0,
            total_amount: Number(grn.total_amount || 0),
            amount_paid: 0,
            status: "DRAFT",
            posting_status: "UNPOSTED",
            source_type: "PROCUREMENT",
            remarks: `Auto-generated from GRN ${grn.grn_number} against PO ${po?.doc_number || 'N/A'}`,
            created_at: grn.created_at || new Date().toISOString()
          };

          invoices.push(newInv);
          existingGrnNumbers.add(grn.grn_number);
          existingInvNumbers.add(invNumber);
          hasNew = true;
        }
      }

      // 4. Merge Maintenance Vendor Invoices (pms_vendor_invoices)
      try {
        const mntRows = await loadCollectionRows("pms_vendor_invoices");
        if (mntRows) {
          const mntInvoices: any[] = mntRows.map(r => r.data);
          for (const m of mntInvoices) {
            if (m.invoiceNo && !existingInvNumbers.has(m.invoiceNo)) {
              invoices.push({
                id: m.id || `mnt-inv-${m.invoiceNo}`,
                invoice_number: m.invoiceNo,
                vendor_id: m.vendorName || "Carrier Middle East Qatar",
                vendor_name: m.vendorName,
                po_number: m.workOrderId || m.ticketId || "—",
                grn_number: m.ticketId || "—",
                invoice_date: m.invoiceDate || new Date().toISOString().slice(0, 10),
                due_date: m.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
                amount: Number(m.baseAmount !== undefined ? m.baseAmount : (Number(m.amount || 0) - Number(m.taxAmount || 0))),
                tax_amount: Number(m.taxAmount || 0),
                total_amount: Number(m.amount || 0),
                amount_paid: m.status === "Approved" || m.status === "PAID" || m.status === "Paid" ? Number(m.amount || 0) : 0,
                status: (m.status === "Approved" || m.status === "PAID" || m.status === "Paid") ? "PAID" : "SUBMITTED",
                posting_status: (m.status === "Approved" || m.status === "PAID" || m.status === "Paid") ? "POSTED" : "UNPOSTED",
                remarks: m.partsDescription || m.labourDescription || "Maintenance Contractor Invoice",
                receipt_attachment: m.receiptAttachment || m.receiptFileName,
                source_type: "MAINTENANCE",
                property: m.property,
                unit_ref: m.unitRef,
                expense_gl_account: m.glAccount,
                created_at: m.invoiceDate || new Date().toISOString()
              });
              existingInvNumbers.add(m.invoiceNo);
              hasNew = true;
            }
          }
        }
      } catch (e) {
        console.warn("Failed merging pms_vendor_invoices in ApInvoicesApi:", e);
      }

      if (hasNew) {
        saveLocalInvoices(invoices);
      }
    } catch (e) {
      console.error("Error auto-synthesizing AP Invoices from GRNs / Maintenance:", e);
    }

    return invoices;
  },

  create: async (payload: Omit<ProcApInvoice, 'id'>): Promise<ProcApInvoice> => {
    const id = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newRecord: ProcApInvoice = {
      ...payload,
      id,
      created_at: new Date().toISOString()
    };

    // Try Supabase insert
    try {
      const { data } = await apiDb.from('proc_ap_invoices').insert({
        invoice_number: payload.invoice_number,
        vendor_id: payload.vendor_id,
        po_number: payload.po_number || null,
        grn_number: payload.grn_number || null,
        invoice_date: payload.invoice_date,
        due_date: payload.due_date || null,
        amount: payload.amount,
        tax_amount: payload.tax_amount || 0,
        total_amount: payload.total_amount,
        status: payload.status || "DRAFT",
        remarks: payload.remarks || null
      }).select().single();

      if (data) {
        newRecord.id = data.id || id;
      }
    } catch {
      // continue to local storage
    }

    const current = getLocalInvoices();
    const updated = [newRecord, ...current.filter(i => i.invoice_number !== newRecord.invoice_number)];
    saveLocalInvoices(updated);

    return newRecord;
  },

  update: async (id: string, payload: Partial<ProcApInvoice>): Promise<void> => {
    try {
      await apiDb.from('proc_ap_invoices').update(payload).eq('id', id);
    } catch {
      // ignore
    }

    const current = getLocalInvoices();
    const existingInv = current.find(i => i.id === id || i.invoice_number === payload.invoice_number);

    const updated = current.map(i => {
      if (i.id === id || i.invoice_number === payload.invoice_number) {
        const merged: ProcApInvoice = {
          ...i,
          ...payload,
          paid_at: payload.status === "PAID" ? (i.paid_at || new Date().toISOString().slice(0, 10)) : i.paid_at
        };
        return merged;
      }
      return i;
    });
    saveLocalInvoices(updated);

    // When a payment (Full or Partial) is disbursed, create/append an installment Payment Receipt
    if ((payload.status === "PAID" || (payload.status as any) === "PARTIAL") && existingInv) {
      const suffix = existingInv.invoice_number.replace(/^APINV-/, '');
      const existingReceipts = getLocalReceipts();
      const invoiceReceipts = existingReceipts.filter(r => r.invoice_number === existingInv.invoice_number);
      const installmentIndex = invoiceReceipts.length + 1;
      
      const rcptNum = invoiceReceipts.length === 0 && payload.status === "PAID" 
        ? `RCPT-${suffix}` 
        : `RCPT-${suffix}-P${installmentIndex}`;
      const pvNum = invoiceReceipts.length === 0 && payload.status === "PAID"
        ? `PV-${suffix}`
        : `PV-${suffix}-P${installmentIndex}`;

      // amount_paid is the running total paid on the invoice, so this receipt is what was added since the last payment.
      const previouslyPaid = Number(existingInv.amount_paid || 0);
      const runningPaid = Number(payload.amount_paid || existingInv.total_amount);
      const paidAmount = runningPaid > previouslyPaid ? Math.round((runningPaid - previouslyPaid) * 100) / 100 : runningPaid;

      const receipt: PaymentReceipt = {
        id: `rcpt-${Date.now()}-${installmentIndex}`,
        receipt_number: rcptNum,
        voucher_number: pvNum,
        invoice_number: existingInv.invoice_number,
        po_number: existingInv.po_number,
        grn_number: existingInv.grn_number,
        vendor_id: existingInv.vendor_id,
        amount_paid: paidAmount,
        payment_date: new Date().toISOString().slice(0, 10),
        payment_method: payload.payment_method || "Bank Wire / QNB Corporate",
        reference_no: payload.payment_reference || `TXN-${Date.now().toString().slice(-6)}`,
        bank_account: payload.payment_method?.includes("CBQ") 
          ? "Commercial Bank of Qatar (CBQ) - Operational (IBAN: QA99CBQA00000000654321)"
          : payload.payment_method?.includes("Cash") 
          ? "12100001 - Cash in Hand (Office Cashier Vault)"
          : "Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)",
        gl_debit_account: "22100001 - Trade Payables - Vendors",
        gl_credit_account: payload.payment_method?.includes("Cash") 
          ? "12100001 - Cash in Hand / Operating Cash" 
          : "12000001 - Bank Operating Account (QNB)",
        remarks: `${payload.status === "PAID" ? "Final Settlement" : `Installment #${installmentIndex}`} for Invoice ${existingInv.invoice_number}`,
        status: payload.status === "PAID" ? "Settled" : "Partial",
        created_at: new Date().toISOString()
      };

      // Append new receipt into receipt store
      const updatedReceipts = [receipt, ...existingReceipts.filter(r => r.id !== receipt.id)];
      saveLocalReceipts(updatedReceipts);

      // Post to Finance module vouchers & reports
      void postFinancePaymentVoucher({ ...existingInv, total_amount: paidAmount, payment_method: payload.payment_method || existingInv.payment_method }, rcptNum, pvNum);

      // ── Cross-sync with Maintenance Vendor Invoices (database store pms_vendor_invoices) ──
      try {
        const mntRows = await loadCollectionRows("pms_vendor_invoices");
        if (mntRows) {
          const changed = mntRows
            .filter(r => (r.data as any)?.invoiceNo === existingInv.invoice_number || (r.data as any)?.id === existingInv.id)
            .map(r => ({ id: r.id, data: { ...(r.data as any), status: payload.status === "PAID" ? "Approved" : (r.data as any).status } }));
          if (changed.length) dbSave("pms_vendor_invoices", changed, "Maintenance vendor invoice");
        }
      } catch (e) {
        console.warn("Failed cross-syncing pms_vendor_invoices:", e);
      }

      // Dispatch global refresh events
      window.dispatchEvent(new Event("finance_vouchers_updated"));
      window.dispatchEvent(new Event("pms_vendor_invoices_updated"));
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiDb.from('proc_ap_invoices').delete().eq('id', id);
    } catch {
      // ignore
    }

    const current = getLocalInvoices();
    const updated = current.filter(i => i.id !== id);
    saveLocalInvoices(updated);
  },

  // Receipts API
  getAllReceipts: (): PaymentReceipt[] => {
    return getLocalReceipts();
  },

  getReceiptByInvoice: (invoiceNumber: string): PaymentReceipt | undefined => {
    const receipts = getLocalReceipts();
    return receipts.find(r => r.invoice_number === invoiceNumber);
  },

  getAllReceiptsForInvoice: (invoiceNumber: string): PaymentReceipt[] => {
    const receipts = getLocalReceipts();
    return receipts.filter(r => r.invoice_number === invoiceNumber);
  },

  getReceiptByGrn: (grnNumber: string): PaymentReceipt | undefined => {
    const receipts = getLocalReceipts();
    return receipts.find(r => r.grn_number === grnNumber);
  }
};
