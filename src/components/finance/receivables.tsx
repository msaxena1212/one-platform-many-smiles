import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { escalateToLegal, recoverLegalFunds } from "@/lib/finance/legalReceivableService";

export function ReceivablesLegal() {
  const [legalRecs, setLegalRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('fin_legal_receivables').select('*').order('escalation_date', { ascending: false });
      if (error) throw error;
      setLegalRecs(data || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEscalate() {
    // In reality, you would select an overdue invoice. For demo, we prompt:
    const amountStr = prompt('Enter Amount to Escalate (QAR):', '5000');
    if (!amountStr) return;
    const reason = prompt('Enter Reason for Legal Escalation:', 'Repeated non-payment');
    if (!reason) return;

    try {
      await escalateToLegal({
        amount: parseFloat(amountStr),
        tenant_id: 1, // mock
        property_id: 1, // mock
        unit_id: 1, // mock
        reason
      });
      toast.success('Escalated to Legal. Journal Posted.');
      load();
    } catch (e: any) { toast.error(e.message); }
  }

  async function handleRecover(id: number, maxAmount: number) {
    const amountStr = prompt(`Enter Recovery Amount (Max ${maxAmount} QAR):`, maxAmount.toString());
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    
    if (amount > maxAmount) {
      return toast.error('Cannot recover more than outstanding balance.');
    }

    try {
      await recoverLegalFunds(id, amount, 'BANK-REC-123');
      toast.success('Funds Recovered. Journal Posted.');
      load();
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Legal Receivables</CardTitle>
        <Button size="sm" onClick={handleEscalate}>+ Escalate Overdue</Button>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading...</p> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Escalation Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Original Amount</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {legalRecs.map(rec => (
                <TableRow key={rec.id}>
                  <TableCell>{rec.escalation_date}</TableCell>
                  <TableCell>{rec.reason}</TableCell>
                  <TableCell className="font-mono">{rec.original_amount.toLocaleString()} QAR</TableCell>
                  <TableCell className="font-bold text-rose-600">{rec.outstanding_balance.toLocaleString()} QAR</TableCell>
                  <TableCell>
                    <Badge variant={rec.status === 'Fully Recovered' ? 'outline' : 'destructive'}>
                      {rec.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {rec.outstanding_balance > 0 && (
                      <Button size="sm" variant="outline" onClick={() => handleRecover(rec.id, rec.outstanding_balance)}>Recover Funds</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {legalRecs.length === 0 && <TableRow><TableCell colSpan={6} className="text-center">No Legal Receivables found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
