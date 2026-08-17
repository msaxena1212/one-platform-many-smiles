import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { transferDepositToRefundable, settleDeposit } from "@/lib/finance/depositService";

export function DepositsGuarantees() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('fin_deposits').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setDeposits(data || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVacate(id: number) {
    if (!confirm('Transfer to Refundable (21100)?')) return;
    try {
      await transferDepositToRefundable(id);
      toast.success('Deposit is now Refundable. Journal Entry Posted.');
      load();
    } catch (e: any) { toast.error(e.message); }
  }

  async function handleSettle(id: number, amount: number) {
    const deductionsStr = prompt('Enter deduction amount (QAR) for damages/dues:', '0');
    if (deductionsStr === null) return;
    const deductions = parseFloat(deductionsStr) || 0;
    const refund = amount - deductions;

    if (!confirm(`Settle Deposit?\nDeductions: ${deductions}\nRefund to Tenant: ${refund}`)) return;
    
    try {
      await settleDeposit(id, deductions, refund);
      toast.success('Deposit Settled. Journal Entry Posted.');
      load();
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposits & Guarantees</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading...</p> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>GL Account</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits.map(d => (
                <TableRow key={d.id}>
                  <TableCell>{d.deposit_type}</TableCell>
                  <TableCell className="font-mono">{d.coa_account_code}</TableCell>
                  <TableCell className="font-semibold">{d.amount.toLocaleString()} QAR</TableCell>
                  <TableCell>
                    <Badge variant={d.status === 'Active' ? 'default' : d.status === 'Refundable' ? 'secondary' : 'outline'}>
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    {d.status === 'Active' && <Button size="sm" onClick={() => handleVacate(d.id)}>Mark Refundable</Button>}
                    {d.status === 'Refundable' && <Button size="sm" variant="outline" className="border-emerald-500 text-emerald-600" onClick={() => handleSettle(d.id, d.amount)}>Settle & Refund</Button>}
                  </TableCell>
                </TableRow>
              ))}
              {deposits.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No Deposits found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
