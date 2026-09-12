import { supabase } from './supabase';

export type ProcApInvoice = {
  id: string;
  invoice_number: string;
  vendor_id: string | number;
  vendor_name?: string;
  po_number?: string;
  grn_number?: string;
  invoice_date: string;
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

const INVOICE_STORAGE_KEY = 'proc_ap_invoices_cache_v2';
const RECEIPT_STORAGE_KEY = 'proc_payment_receipts_v2';

function getLocalInvoices(): ProcApInvoice[] {
  try {
    const raw = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read local AP Invoices:", e);
  }
  return [];
}

function saveLocalInvoices(list: ProcApInvoice[]) {
  try {
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('ap_invoices_updated'));
  } catch (e) {
    console.error("Failed to save local AP Invoices:", e);
  }
}

function getLocalReceipts(): PaymentReceipt[] {
  try {
    const raw = localStorage.getItem(RECEIPT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read local Payment Receipts:", e);
  }
  return [];
}

function saveLocalReceipts(list: PaymentReceipt[]) {
  try {
    localStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('payment_receipts_updated'));
  } catch (e) {
    console.error("Failed to save local Payment Receipts:", e);
  }
}

// Helper to push vouchers into Finance Store & Supabase
async function postFinancePaymentVoucher(invoice: ProcApInvoice, receiptNum: string, pvNum: string) {
  const paidDate = invoice.paid_at || new Date().toISOString().slice(0, 10);

  try {
    // 1. Post to Supabase fin_vouchers (best-effort)
    await supabase.from("fin_vouchers").insert({
      voucher_number: pvNum,
      voucher_date: paidDate,
      voucher_type: "PV",
      reference_no: invoice.invoice_number,
      description: `Vendor Payment: ${invoice.invoice_number} | PO: ${invoice.po_number || 'N/A'} | GRN: ${invoice.grn_number || 'N/A'} | Rcpt: ${receiptNum}`,
      total_amount: invoice.total_amount,
      status: "posted",
      posted_at: new Date().toISOString()
    });
  } catch (e) {
    console.warn("[ApInvoicesApi] fin_vouchers Supabase insert note:", e);
  }

  // 2. Write into Finance Store localStorage — vouchers key
  const FIN_STORE_KEY = "zyno-pms-finance-data-v1-vouchers";
  try {
    const existing: any[] = JSON.parse(localStorage.getItem(FIN_STORE_KEY) || "[]");
    const pvEntry = {
      id: `vch-pv-${Date.now()}`,
      voucher_no: pvNum,
      voucher_type: "Payment Voucher",
      date: paidDate,
      name: `Vendor Settlement — ${invoice.invoice_number} (${receiptNum})`,
      debit: "Trade Payables - Vendors",
      debit_code: "22100001",
      credit: "Bank Operating Account",
      credit_code: "12000001",
      amount: invoice.total_amount,
      method: invoice.payment_method || "Bank Wire",
      status: "Posted",
      property_name: "Procurement",
      unit_ref: invoice.grn_number || invoice.po_number || "N/A",
      tenant_name: String(invoice.vendor_id),
    };
    // Avoid duplicates
    if (!existing.some((v: any) => v.voucher_no === pvNum)) {
      localStorage.setItem(FIN_STORE_KEY, JSON.stringify([pvEntry, ...existing]));
      // Notify Finance module to reload
      window.dispatchEvent(new Event("finance_vouchers_updated"));
    }
  } catch (e) {
    console.error("Failed to sync Payment Voucher to Finance Store:", e);
  }

  // 3. Write into Finance Store localStorage — payableInvoices (AP) key
  const AP_STORE_KEY = "zyno-pms-finance-data-v1-ap";
  try {
    const existingAp: any[] = JSON.parse(localStorage.getItem(AP_STORE_KEY) || "[]");
    const invNo = invoice.invoice_number;
    // Update status to Paid if already exists, else add it
    if (existingAp.some((i: any) => i.invoice_no === invNo)) {
      const updatedAp = existingAp.map((i: any) =>
        i.invoice_no === invNo ? { ...i, status: "Paid" } : i
      );
      localStorage.setItem(AP_STORE_KEY, JSON.stringify(updatedAp));
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
      localStorage.setItem(AP_STORE_KEY, JSON.stringify([apEntry, ...existingAp]));
    }
  } catch (e) {
    console.error("Failed to sync AP Invoice to Finance Store:", e);
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
        const mntInvoicesRaw = localStorage.getItem("pms_vendor_invoices");
        if (mntInvoicesRaw) {
          const mntInvoices: any[] = JSON.parse(mntInvoicesRaw);
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
      const { data } = await supabase.from('proc_ap_invoices').insert({
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
      await supabase.from('proc_ap_invoices').update(payload).eq('id', id);
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

      const paidAmount = Number(payload.amount_paid || existingInv.total_amount);

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
      void postFinancePaymentVoucher({ ...existingInv, total_amount: paidAmount }, rcptNum, pvNum);

      // ── Cross-sync with Maintenance Vendor Invoices (pms_vendor_invoices) ──
      try {
        const mntRaw = localStorage.getItem("pms_vendor_invoices");
        if (mntRaw) {
          const mntList: any[] = JSON.parse(mntRaw);
          let mntChanged = false;
          const updatedMnt = mntList.map((m: any) => {
            if (m.invoiceNo === existingInv.invoice_number || m.id === existingInv.id) {
              mntChanged = true;
              return { ...m, status: payload.status === "PAID" ? "Approved" : m.status };
            }
            return m;
          });
          if (mntChanged) {
            localStorage.setItem("pms_vendor_invoices", JSON.stringify(updatedMnt));
          }
        }
      } catch (e) {
        console.warn("Failed cross-syncing pms_vendor_invoices:", e);
      }

      // ── Cross-sync with Finance Store AP (zyno-pms-finance-data-v1-ap) ──
      try {
        const finApRaw = localStorage.getItem("zyno-pms-finance-data-v1-ap");
        if (finApRaw) {
          const finApList: any[] = JSON.parse(finApRaw);
          let finChanged = false;
          const updatedFin = finApList.map((f: any) => {
            if (f.invoice_no === existingInv.invoice_number || f.id === existingInv.id) {
              finChanged = true;
              return { ...f, status: payload.status === "PAID" ? "Paid" : f.status };
            }
            return f;
          });
          if (finChanged) {
            localStorage.setItem("zyno-pms-finance-data-v1-ap", JSON.stringify(updatedFin));
          }
        }
      } catch (e) {
        console.warn("Failed cross-syncing zyno-pms-finance-data-v1-ap:", e);
      }

      // Dispatch global refresh events
      window.dispatchEvent(new Event("finance_vouchers_updated"));
      window.dispatchEvent(new Event("pms_vendor_invoices_updated"));
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await supabase.from('proc_ap_invoices').delete().eq('id', id);
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
