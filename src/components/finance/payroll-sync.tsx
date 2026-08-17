import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { syncPayrollRun, PayrollSyncPayload } from "@/lib/finance/payrollIntegrationService";

export function PayrollSync() {
  const [syncs, setSyncs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('fin_payroll_syncs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setSyncs(data || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulateSync() {
    const period = '2026-08';
    const runId = `PR-RUN-${Math.floor(Math.random() * 10000)}`;

    const payload: PayrollSyncPayload = {
      payroll_run_id: runId,
      period,
      lines: [
        { employee_id: 'EMP-001', department: 'Maintenance', account_code: '5010', debit: 8000, credit: 0, property_id: 1, unit_id: 1 },
        { employee_id: 'EMP-002', department: 'Admin', account_code: '5010', debit: 12000, credit: 0, cost_center_id: 2 },
        { employee_id: 'BANK', department: 'Treasury', account_code: '12000', debit: 0, credit: 20000 } // Total payout
      ]
    };

    try {
      await syncPayrollRun(payload);
      toast.success(`Payroll Run ${runId} synced and Journals Posted.`);
      load();
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payroll Sync Engine</CardTitle>
        <Button size="sm" onClick={handleSimulateSync}>+ Trigger API Sync</Button>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading...</p> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run ID</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {syncs.map(sync => (
                <TableRow key={sync.id}>
                  <TableCell className="font-mono">{sync.payroll_run_id}</TableCell>
                  <TableCell>{sync.period}</TableCell>
                  <TableCell className="font-semibold">{sync.total_amount.toLocaleString()} QAR</TableCell>
                  <TableCell>
                    <Badge variant={sync.status === 'Posted' ? 'default' : sync.status === 'Failed' ? 'destructive' : 'secondary'}>
                      {sync.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{sync.error_details || 'Successfully mapped & posted'}</TableCell>
                </TableRow>
              ))}
              {syncs.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No Payroll Syncs found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
