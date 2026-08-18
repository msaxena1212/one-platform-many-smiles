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
import { ReceiptModal, type TenantReceiptDetails } from "@/components/receipt-modal";

const PAGE_SIZE = 20;

export function DepositsGuarantees() {
  const { vouchers: sharedVouchers, setVouchers: setSharedVouchers, leases } = useAppData();
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

      const depositVouchers = (sharedVouchers || []).filter(v =>
        v.name.toLowerCase().includes("deposit") || (v.credit || "").toLowerCase().includes("deposit") || (v.period || "").toLowerCase().includes("deposit")
      );

      const contextDeposits = depositVouchers.map((v, idx) => {
        const lease = leases?.find((l) => l.id === v.leaseId);
        return {
          id: v.id || `ctx-dep-${idx}`,
          leaseId: v.leaseId,
          receipt_no: v.receiptNo || `RV-DEP-${v.id || idx}`,
          deposit_type: v.method === "Cash" ? "Cash Security Deposit" : "PDC Security Deposit",
          coa_account_code: (v as any).status === "refundable" ? "21100 - Refundable Deposit Liability" : (v.credit || "21500 - Security Deposit Liability"),
          amount: Number(v.amount) || 0,
          status: (v as any).status === "refundable" ? "Refundable" : (v as any).status === "settled" ? "Settled" : "Active",
          property_name: (v as any).property || lease?.property || 'Old Salata - Residence No:23',
          unit_ref: (v as any).unit || lease?.unit || 'AAA - Flat16',
          tenant_name: (v as any).tenantName || lease?.tenantName || 'Mr. Hafeez Shaik',
          lease_start_date: lease?.startDate || '2025-10-01',
          lease_end_date: lease?.endDate || '2026-09-30',
          monthly_rent: lease?.monthlyRent || 5600,
          total_contract_rent: lease ? (lease.monthlyRent * 12) : 67200,
        };
      });

      const allDeposits = [...dbData];
      for (const cd of contextDeposits) {
        if (!allDeposits.some(d => d.id === cd.id || (d.amount === cd.amount && d.coa_account_code === cd.coa_account_code))) {
          allDeposits.push(cd);
        }
      }
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
      const isStringId = typeof id === 'string' && (id.startsWith('v') || id.startsWith('ctx-') || isNaN(Number(id)));
      if (isStringId) {
        setSharedVouchers(prev => prev.map(v => v.id === id ? { ...v, status: 'refundable' as any } : v));
        setDeposits(prev => prev.map(d => d.id === id ? { ...d, status: 'Refundable', coa_account_code: '21100 - Refundable Deposit Liability' } : d));
      } else {
        await transferDepositToRefundable(Number(id));
      }
      toast.success('Deposit is now Refundable.');
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
      const isStringId = typeof id === 'string' && (id.startsWith('v') || id.startsWith('ctx-') || isNaN(Number(id)));
      if (isStringId) {
        setSharedVouchers(prev => prev.map(v => v.id === id ? { ...v, status: 'settled' as any } : v));
        setDeposits(prev => prev.map(d => d.id === id ? { ...d, status: 'Settled' } : d));
      } else {
        await settleDeposit(Number(id), deductions, refund);
      }
      toast.success('Deposit Settled. Journal Entry Posted.');
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
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No Deposits found. Security Deposits are auto-created from Leasing vouchers.</TableCell></TableRow>
                  )}
                  {paginated.map(d => (
                    <TableRow key={d.id} className="hover:bg-muted/30">
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
