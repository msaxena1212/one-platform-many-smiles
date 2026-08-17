import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { depositPdc, clearPdc, returnPdc } from "@/lib/finance/pdcService";

export function PdcManagement() {
  const [pdcs, setPdcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('fin_pdc_register').select('*').order('cheque_date', { ascending: true });
      if (error) throw error;
      setPdcs(data || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeposit(id: number) {
    if (!confirm('Deposit this PDC?')) return;
    try {
      await depositPdc(id);
      toast.success('PDC Deposited. Journal Entry Posted (Dr Bank, Cr PDC In Hand, Dr Customer PDC, Cr Tenant Receivable).');
      load();
    } catch (e: any) { toast.error(e.message); }
  }

  async function handleClear(id: number) {
    if (!confirm('Mark this PDC as Cleared?')) return;
    try {
      await clearPdc(id);
      toast.success('PDC Cleared in Bank.');
      load();
    } catch (e: any) { toast.error(e.message); }
  }

  async function handleReturn(id: number) {
    if (!confirm('Mark this PDC as Returned/Bounced?')) return;
    try {
      await returnPdc(id);
      toast.success('PDC Returned. Reversal Journal Entry Posted.');
      load();
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>PDC Register & Management</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading...</p> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cheque Date</TableHead>
                <TableHead>Cheque No</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pdcs.map(pdc => (
                <TableRow key={pdc.id}>
                  <TableCell>{pdc.cheque_date}</TableCell>
                  <TableCell className="font-mono">{pdc.cheque_number}</TableCell>
                  <TableCell className="font-semibold">{pdc.amount.toLocaleString()} QAR</TableCell>
                  <TableCell>
                    <Badge variant={pdc.status === 'In Hand' ? 'default' : pdc.status === 'Deposited' ? 'secondary' : pdc.status === 'Cleared' ? 'outline' : 'destructive'}>
                      {pdc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    {pdc.status === 'In Hand' && <Button size="sm" onClick={() => handleDeposit(pdc.id)}>Deposit</Button>}
                    {pdc.status === 'Deposited' && (
                      <>
                        <Button size="sm" variant="outline" className="border-emerald-500 text-emerald-600" onClick={() => handleClear(pdc.id)}>Clear</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReturn(pdc.id)}>Return</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {pdcs.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No PDCs found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
