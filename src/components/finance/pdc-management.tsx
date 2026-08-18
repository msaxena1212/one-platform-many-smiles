import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { depositPdc, clearPdc, returnPdc } from "@/lib/finance/pdcService";
import { useAppData } from "@/lib/app-data-context";
import { ReceiptModal, type TenantReceiptDetails } from "@/components/receipt-modal";

const PAGE_SIZE = 20;

export function PdcManagement() {
  const { pdcs: sharedPdcs, setPdcs: setSharedPdcs, leases } = useAppData();
  const [pdcs, setPdcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<TenantReceiptDetails | null>(null);

  useEffect(() => { load(); }, [sharedPdcs, leases]);

  async function load() {
    setLoading(true);
    try {
      let dbData: any[] = [];
      try {
        const { data, error } = await supabase
          .from('fin_pdc_register')
          .select('*')
          .order('cheque_date', { ascending: true });
        if (!error && data) dbData = data;
      } catch (e) { /* fallback */ }

      // Also try pdcs table if fin_pdc_register is empty
      if (dbData.length === 0) {
        try {
          const { data: altData } = await supabase.from('pdcs').select('*').order('created_at', { ascending: false });
          if (altData && altData.length > 0) {
            dbData = altData.map(p => ({
              id: p.id,
              cheque_date: p.maturity_date || p.deposit_date || (p.created_at ? p.created_at.split('T')[0] : '2026-08-01'),
              cheque_number: p.cheque_number,
              amount: Number(p.amount) || 0,
              status: p.status === 'deposited' || p.status_pdc === 'deposited' ? 'Deposited' : p.status === 'cleared' ? 'Cleared' : p.status === 'bounced' ? 'Returned' : 'In Hand',
              bank_name: p.bank,
              property_name: p.property_code || p.property_name || '—',
              unit_ref: p.unit_name || p.unit_ref || '—',
              tenant_name: p.tenant_name || '—',
              lease_start: p.rent_from_date || p.lease_start,
              lease_end: p.rent_to_date || p.lease_end,
              monthly_rent: Number(p.amount) || 0,
            }));
          }
        } catch { /* fallback */ }
      }

      const contextPdcs = (sharedPdcs || []).map((p, idx) => {
        const lease = leases?.find((l) => l.id === p.leaseId);
        return {
          id: p.id || `ctx-pdc-${idx}`,
          leaseId: p.leaseId,
          cheque_date: p.date,
          cheque_number: p.chequeNo,
          amount: Number(p.amount) || 0,
          status: p.status === 'deposited' ? 'Deposited' : p.status === 'cleared' ? 'Cleared' : p.status === 'bounced' ? 'Returned' : 'In Hand',
          bank_name: p.bank,
          property_name: (p as any).propertyName || (p as any).property || lease?.property || 'Old Salata - Residence No:23',
          unit_ref: (p as any).unitRef || (p as any).unit || lease?.unit || 'AAA - Flat16',
          tenant_name: (p as any).tenantName || (p as any).payerName || lease?.tenantName || 'Valued Tenant',
          lease_start: lease?.startDate || p.date,
          lease_end: lease?.endDate || p.date,
          monthly_rent: lease?.monthlyRent || Number(p.amount) || 0,
        };
      });

      const allPdcs = [...dbData];
      for (const cp of contextPdcs) {
        if (!allPdcs.some(d => d.cheque_number === cp.cheque_number)) {
          allPdcs.push(cp);
        }
      }
      setPdcs(allPdcs);
      setPage(1);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeposit(id: string | number) {
    if (!confirm('Deposit this PDC into Bank Account?')) return;
    try {
      setPdcs(prev => prev.map(p => (String(p.id) === String(id) || p.cheque_number === id ? { ...p, status: 'Deposited' } : p)));
      setSharedPdcs(prev => prev.map(p => (String(p.id) === String(id) ? { ...p, status: 'deposited' } : p)));
      await depositPdc(id);
      toast.success('PDC Deposited. Journal Entry Posted to Bank GL.');
    } catch (e: any) {
      toast.error(e.message);
      load();
    }
  }

  async function handleClear(id: string | number) {
    if (!confirm('Mark this PDC as Cleared in Bank?')) return;
    try {
      setPdcs(prev => prev.map(p => (String(p.id) === String(id) || p.cheque_number === id ? { ...p, status: 'Cleared' } : p)));
      setSharedPdcs(prev => prev.map(p => (String(p.id) === String(id) ? { ...p, status: 'cleared' } : p)));
      await clearPdc(id);
      toast.success('PDC Cleared in Bank.');
    } catch (e: any) {
      toast.error(e.message);
      load();
    }
  }

  async function handleReturn(id: string | number) {
    if (!confirm('Mark this PDC as Returned / Bounced?')) return;
    try {
      setPdcs(prev => prev.map(p => (String(p.id) === String(id) || p.cheque_number === id ? { ...p, status: 'Returned' } : p)));
      setSharedPdcs(prev => prev.map(p => (String(p.id) === String(id) ? { ...p, status: 'bounced' } : p)));
      await returnPdc(id);
      toast.success('PDC Returned. Reversal Journal Entry Posted.');
    } catch (e: any) {
      toast.error(e.message);
      load();
    }
  }

  function handleViewReceipt(pdc: any) {
    const details: TenantReceiptDetails = {
      receiptNo: `REC-PDC-${String(pdc.id).slice(-4)}`,
      acknowledgementNo: `PDC-ACK-${pdc.cheque_number}`,
      date: pdc.cheque_date || new Date().toISOString().split("T")[0],
      tenantName: pdc.tenant_name && pdc.tenant_name !== '—' ? pdc.tenant_name : 'Valued Tenant',
      propertyName: pdc.property_name && pdc.property_name !== '—' ? pdc.property_name : 'Property',
      unitRef: pdc.unit_ref && pdc.unit_ref !== '—' ? pdc.unit_ref : 'Unit',
      leaseStartDate: pdc.lease_start || pdc.cheque_date,
      leaseEndDate: pdc.lease_end || pdc.cheque_date,
      monthlyRent: Number(pdc.monthly_rent || pdc.amount) || 0,
      totalContractRent: (Number(pdc.monthly_rent || pdc.amount) * 12) || Number(pdc.amount) || 0,
      depositAmount: 0,
      depositMode: 'PDC',
      pdcCount: 1,
      pdcs: [{
        chequeNo: pdc.cheque_number,
        bank: pdc.bank_name || 'Bank',
        date: pdc.cheque_date,
        amount: Number(pdc.amount) || 0,
        period: 'Rent Instalment',
      }],
      totalCollected: Number(pdc.amount) || 0,
      cashierName: 'Finance Department',
      notes: `Official acknowledgment for PDC ${pdc.cheque_number} status: ${pdc.status}.`,
    };
    setReceiptData(details);
    setReceiptOpen(true);
  }

  const totalPages = Math.max(1, Math.ceil(pdcs.length / PAGE_SIZE));
  const paginated = pdcs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>PDC Register & Management</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">{pdcs.length} cheques • {pdcs.filter(p => p.status === 'In Hand').length} In Hand</p>
        </div>
        <Badge variant="outline">{pdcs.length} Total PDCs</Badge>
      </CardHeader>
      <CardContent>
        {loading ? <p className="text-sm text-muted-foreground py-4">Loading...</p> : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold text-xs">Cheque Date</TableHead>
                    <TableHead className="font-bold text-xs">Cheque No.</TableHead>
                    <TableHead className="font-bold text-xs">Bank</TableHead>
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
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No PDCs found. Add PDCs via the Leasing module.
                      </TableCell>
                    </TableRow>
                  )}
                  {paginated.map(pdc => (
                    <TableRow key={pdc.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs">{pdc.cheque_date}</TableCell>
                      <TableCell className="font-mono font-semibold text-xs text-primary">{pdc.cheque_number}</TableCell>
                      <TableCell className="text-xs">{pdc.bank_name || '—'}</TableCell>
                      <TableCell className="text-xs">{pdc.property_name || '—'}</TableCell>
                      <TableCell className="text-xs font-mono">{pdc.unit_ref || '—'}</TableCell>
                      <TableCell className="text-xs">{pdc.tenant_name || '—'}</TableCell>
                      <TableCell className="text-right font-bold font-mono text-xs">{Number(pdc.amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={pdc.status === 'In Hand' ? 'default' : pdc.status === 'Deposited' ? 'secondary' : pdc.status === 'Cleared' ? 'outline' : 'destructive'} className="text-xs">
                          {pdc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-1">
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-primary gap-1" onClick={() => handleViewReceipt(pdc)}>
                          <Receipt className="h-3 w-3" /> Receipt
                        </Button>
                        {pdc.status === 'In Hand' && <Button size="sm" className="h-7 text-xs" onClick={() => handleDeposit(pdc.id)}>Deposit</Button>}
                        {pdc.status === 'Deposited' && (
                          <>
                            <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-500 text-emerald-600" onClick={() => handleClear(pdc.id)}>Clear</Button>
                            <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleReturn(pdc.id)}>Return</Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pdcs.length > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <span>Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, pdcs.length)} of {pdcs.length}</span>
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
