import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { transferDepositToRefundable, settleDeposit } from "@/lib/finance/depositService";
import { useAppData } from "@/lib/app-data-context";
import { useFinanceStore } from "@/lib/finance/finance-store";
import { ReceiptModal, type TenantReceiptDetails } from "@/components/receipt-modal";

const PAGE_SIZE = 20;

export function DepositsGuarantees() {
  const { vouchers: sharedVouchers, setVouchers: setSharedVouchers, leases } = useAppData();
  const { addJournalEntry, addVoucher, addCashBookEntry } = useFinanceStore();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<TenantReceiptDetails | null>(null);

  useEffect(() => { load(); }, [sharedVouchers, leases]);

  async function load() {
    setLoading(true);
    try {
      let dbData: any[] = [];
      try {
        const { data, error } = await supabase.from('fin_deposits').select('*').order('created_at', { ascending: false });
        if (!error && data) dbData = data;
      } catch (e) { /* fallback */ }

      const contextDeposits = (sharedVouchers || [])
        .filter(v => v.name.toLowerCase().includes('deposit') || v.credit.toLowerCase().includes('deposit'))
        .map((v, idx) => {
          const lease = leases?.find((l) => l.id === v.leaseId);
          return {
            id: v.id || `ctx-dep-${idx}`,
            leaseId: v.leaseId,
            deposit_type: v.method ? `${v.method} Security Deposit` : 'Security Deposit',
            coa_account_code: v.credit || '21500 - Security Deposit Liability',
            amount: Number(v.amount) || 0,
            status: v.status === 'shared' ? 'Active' : v.status === 'posted' ? 'Active' : (v.status as any) === 'refundable' ? 'Refundable' : (v.status as any) === 'settled' ? 'Settled' : 'Active',
            property_name: lease?.property || 'Old Salata - Residence No:23',
            unit_ref: lease?.unit || 'AAA - Flat16',
            tenant_name: lease?.tenantName || 'Mr. Hafeez Shaik',
            lease_start_date: lease?.startDate || '2025-10-01',
            lease_end_date: lease?.endDate || '2026-09-30',
            monthly_rent: lease?.monthlyRent || 5600,
            total_contract_rent: (lease?.monthlyRent ? lease.monthlyRent * 12 : 67200),
            created_at: lease?.startDate || '2026-08-01',
          };
        });

      const allDeposits = [...dbData];
      for (const cd of contextDeposits) {
        if (!allDeposits.some(d => d.id === cd.id || (d.amount === cd.amount && d.coa_account_code === cd.coa_account_code))) {
          allDeposits.push(cd);
        }
      }
      allDeposits.sort((a, b) => new Date(b.lease_start_date || b.created_at || "").getTime() - new Date(a.lease_start_date || a.created_at || "").getTime());
      setDeposits(allDeposits);
      setPage(1);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVacate(id: string | number) {
    if (!confirm('Transfer to Refundable (21100)?')) return;
    try {
      const targetDep = deposits.find(d => String(d.id) === String(id));
      const amt = targetDep ? Number(targetDep.amount) : 5000;
      const todayStr = new Date().toISOString().split('T')[0];

      const isStringId = typeof id === 'string' && (id.startsWith('v') || id.startsWith('ctx-') || isNaN(Number(id)));
      if (isStringId) {
        setSharedVouchers(prev => prev.map(v => v.id === id ? { ...v, status: 'refundable' as any } : v));
        setDeposits(prev => prev.map(d => d.id === id ? { ...d, status: 'Refundable', coa_account_code: '21100 - Refundable Deposit Liability' } : d));
      } else {
        await transferDepositToRefundable(Number(id));
      }

      // General Ledger Journal Entry: DR 21500 Security Deposit Liability / CR 21100 Refundable Deposit Liability
      addJournalEntry({
        je_no: `JE-VAC-${String(id).replace(/\W/g, '')}-${Date.now().toString().slice(-4)}`,
        posting_date: todayStr,
        reference: `VAC-DEP-${id}`,
        narration: `Security Deposit reclassified as Refundable — ${targetDep?.tenant_name || 'Tenant'} (${targetDep?.unit_ref || 'Unit'})`,
        dr_account: "Security Deposit Liability",
        dr_code: "21500",
        cr_account: "Refundable Deposit Liability",
        cr_code: "21100",
        amount: amt,
      });

      toast.success('Deposit is now Refundable. General Ledger updated.');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleSettle(id: string | number, amount: number) {
    const deductionsStr = prompt('Enter deduction amount (QAR) for damages/dues:', '0');
    if (deductionsStr === null) return;
    const deductions = parseFloat(deductionsStr) || 0;
    const refund = amount - deductions;
    if (!confirm(`Settle Deposit?\nDeductions: ${deductions}\nRefund to Tenant: ${refund}`)) return;
    try {
      const targetDep = deposits.find(d => String(d.id) === String(id));
      const todayStr = new Date().toISOString().split('T')[0];

      const isStringId = typeof id === 'string' && (id.startsWith('v') || id.startsWith('ctx-') || isNaN(Number(id)));
      if (isStringId) {
        setSharedVouchers(prev => prev.map(v => v.id === id ? { ...v, status: 'settled' as any } : v));
        setDeposits(prev => prev.map(d => d.id === id ? { ...d, status: 'Settled' } : d));
      } else {
        await settleDeposit(Number(id), deductions, refund);
      }

      // 1. General Ledger Entry for Refund: DR 21100 Refundable Deposit / CR 12000 Bank Operating
      if (refund > 0) {
        addJournalEntry({
          je_no: `JE-REF-${String(id).replace(/\W/g, '')}-${Date.now().toString().slice(-4)}`,
          posting_date: todayStr,
          reference: `REF-DEP-${id}`,
          narration: `Security Deposit Refund to Tenant — ${targetDep?.tenant_name || 'Tenant'} (${targetDep?.unit_ref || 'Unit'})`,
          dr_account: "Refundable Deposit Liability",
          dr_code: "21100",
          cr_account: "Bank Operating Account",
          cr_code: "12000",
          amount: refund,
        });
        addVoucher({
          voucher_no: `VCH-PAY-REF-${Date.now().toString().slice(-4)}`,
          voucher_type: "Payment Voucher",
          date: todayStr,
          name: `Deposit Refund — ${targetDep?.tenant_name || 'Tenant'}`,
          debit: "Refundable Deposit Liability",
          debit_code: "21100",
          credit: "Bank Operating Account",
          credit_code: "12000",
          amount: refund,
          method: "Bank Transfer",
        });
      }

      // 2. If deductions (maintenance/damages): DR 21100 / CR 50200 Repairs Income/Recovery
      if (deductions > 0) {
        addJournalEntry({
          je_no: `JE-DED-${String(id).replace(/\W/g, '')}-${Date.now().toString().slice(-4)}`,
          posting_date: todayStr,
          reference: `DED-DEP-${id}`,
          narration: `Damage/Utility Deduction from Security Deposit — ${targetDep?.tenant_name || 'Tenant'}`,
          dr_account: "Refundable Deposit Liability",
          dr_code: "21100",
          cr_account: "Repairs & Maintenance Recovery",
          cr_code: "41400",
          amount: deductions,
        });
      }

      // 3. Generate official Refund Settlement Receipt Modal
      const refReceipt: TenantReceiptDetails = {
        receiptNo: `REC-REF-${String(id).slice(-4)}`,
        acknowledgementNo: `ACK-REF-${id}`,
        date: todayStr,
        tenantName: targetDep?.tenant_name || "Valued Tenant",
        propertyName: targetDep?.property_name || "Property",
        unitRef: targetDep?.unit_ref || "Unit",
        leaseStartDate: targetDep?.lease_start_date || todayStr,
        leaseEndDate: targetDep?.lease_end_date || todayStr,
        monthlyRent: targetDep?.monthly_rent || 0,
        totalContractRent: targetDep?.total_contract_rent || 0,
        depositAmount: targetDep?.amount || 0,
        depositMode: "Bank Transfer",
        pdcCount: 0,
        pdcs: [],
        vouchers: [{
          receiptNo: `PV-REF-${Date.now().toString().slice(-4)}`,
          name: `Security Deposit Settlement Refund (Gross: ${amount}, Deductions: ${deductions}, Net: ${refund})`,
          amount: refund,
          method: "Bank Transfer",
          debit: "21100 - Refundable Deposit Liability",
          credit: "12000 - Bank Operating Account",
        }],
        totalCollected: refund,
        cashierName: "Finance Department",
        notes: `OFFICIAL SETTLEMENT REFUND RECEIPT: Gross Deposit: QR ${amount.toLocaleString()} | Deductions: QR ${deductions.toLocaleString()} | Net Refund Paid to Tenant: QR ${refund.toLocaleString()}. GL Vouchers & Entries posted.`,
      };
      setReceiptData(refReceipt);
      setReceiptOpen(true);

      toast.success('Deposit Settled & Refunded. Official Refund Receipt generated.');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  function handleViewReceipt(dep: any) {
    const details: TenantReceiptDetails = {
      receiptNo: dep.receipt_no || `REC-DEP-${String(dep.id).slice(-4)}`,
      acknowledgementNo: `DEP-ACK-${dep.id}`,
      date: new Date().toISOString().split("T")[0],
      tenantName: dep.tenant_name && dep.tenant_name !== '—' ? dep.tenant_name : 'Mr. Hafeez Shaik',
      propertyName: dep.property_name && dep.property_name !== '—' ? dep.property_name : 'Old Salata - Residence No:23',
      unitRef: dep.unit_ref && dep.unit_ref !== '—' ? dep.unit_ref : 'AAA - Flat16',
      leaseStartDate: dep.lease_start_date || '2025-10-01',
      leaseEndDate: dep.lease_end_date || '2026-09-30',
      monthlyRent: dep.monthly_rent || 5600,
      totalContractRent: dep.total_contract_rent || (dep.monthly_rent ? dep.monthly_rent * 12 : 67200),
      depositAmount: Number(dep.amount) || 0,
      depositMode: dep.deposit_type || 'Cash Security Deposit',
      pdcCount: 0,
      pdcs: [],
      vouchers: [{
        receiptNo: dep.receipt_no || `RV-DEP-${dep.id}`,
        name: 'Security Deposit Voucher',
        amount: Number(dep.amount) || 0,
        debit: 'Cash In Hand',
        credit: dep.coa_account_code || 'Security Deposit Liability',
      }],
      totalCollected: Number(dep.amount) || 0,
      cashierName: 'Finance Department',
      notes: `Official acknowledgment for Security Deposit in account ${dep.coa_account_code}. Status: ${dep.status}.`,
    };
    setReceiptData(details);
    setReceiptOpen(true);
  }

  const totalPages = Math.max(1, Math.ceil(deposits.length / PAGE_SIZE));
  const paginated = deposits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Deposits & Guarantees</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">{deposits.length} deposit records</p>
        </div>
        <Badge variant="outline">{deposits.length} Total</Badge>
      </CardHeader>
      <CardContent>
        {loading ? <p className="text-sm text-muted-foreground py-4">Loading...</p> : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold text-xs">Entry Date</TableHead>
                    <TableHead className="font-bold text-xs">Type</TableHead>
                    <TableHead className="font-bold text-xs">GL Account</TableHead>
                    <TableHead className="font-bold text-xs">Property</TableHead>
                    <TableHead className="font-bold text-xs">Unit</TableHead>
                    <TableHead className="font-bold text-xs">Tenant</TableHead>
                    <TableHead className="text-right font-bold text-xs">Amount (QAR)</TableHead>
                    <TableHead className="font-bold text-xs">Status</TableHead>
                    <TableHead className="font-bold text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 && (
                    <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No Deposits found. Security Deposits are auto-created from Leasing vouchers.</TableCell></TableRow>
                  )}
                  {paginated.map(d => (
                    <TableRow key={d.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs text-muted-foreground">{d.lease_start_date || d.created_at || '2026-08-01'}</TableCell>
                      <TableCell className="text-xs">{d.deposit_type}</TableCell>
                      <TableCell className="font-mono text-xs">{d.coa_account_code}</TableCell>
                      <TableCell className="text-xs">{d.property_name || '—'}</TableCell>
                      <TableCell className="font-mono text-xs">{d.unit_ref || '—'}</TableCell>
                      <TableCell className="text-xs">{d.tenant_name || '—'}</TableCell>
                      <TableCell className="text-right font-bold font-mono text-xs">{Number(d.amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={d.status === 'Active' ? 'default' : d.status === 'Refundable' ? 'secondary' : 'outline'} className="text-xs">
                          {d.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-1">
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-primary gap-1" onClick={() => handleViewReceipt(d)}>
                          <Receipt className="h-3 w-3" /> Receipt
                        </Button>
                        {d.status === 'Active' && <Button size="sm" className="h-7 text-xs" onClick={() => handleVacate(d.id)}>Mark Refundable</Button>}
                        {d.status === 'Refundable' && <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-500 text-emerald-600" onClick={() => handleSettle(d.id, d.amount)}>Settle & Refund</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {deposits.length > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <span>Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, deposits.length)} of {deposits.length}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-7" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2).map(p => (
                    <Button key={p} size="sm" variant={p === page ? "default" : "outline"} className="h-7 w-7 p-0" onClick={() => setPage(p)}>{p}</Button>
                  ))}
                  <Button size="sm" variant="outline" className="h-7" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      <ReceiptModal open={receiptOpen} onOpenChange={setReceiptOpen} data={receiptData} />
    </Card>
  );
}
