import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, CreditCard, Banknote } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface PDC {
  id: string;
  lease_id: string;
  cheque_number: string;
  bank: string;
  bank_branch?: string;
  amount: number;
  deposit_date: string;
  maturity_date?: string;
  collection_date?: string;
  status: string;
}

export function PdcManager({ leaseId }: { leaseId: string }) {
  const [pdcs, setPdcs] = useState<PDC[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<PDC>>({
    cheque_number: '',
    bank: '',
    bank_branch: '',
    amount: 0,
    deposit_date: '',
    maturity_date: '',
    status: 'ISSUED'
  });

  const loadPDCs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pdcs')
      .select('*')
      .eq('lease_id', leaseId)
      .order('deposit_date', { ascending: true });
    
    if (data) setPdcs(data);
    setLoading(false);
  };

  useEffect(() => {
    if (leaseId) loadPDCs();
  }, [leaseId]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('pdcs').insert([{
      ...formData,
      lease_id: leaseId
    }]);
    
    setSaving(false);
    if (!error) {
      setOpen(false);
      loadPDCs();
    } else {
      alert("Error adding PDC: " + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2"><CreditCard className="h-5 w-5"/> PDC Management</h3>
        <Button onClick={() => setOpen(true)} size="sm"><Plus className="h-4 w-4 mr-2" /> Add PDC</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/10 text-xs text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Cheque No.</th>
                <th className="px-4 py-3 text-left">Bank</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Deposit Date</th>
                <th className="px-4 py-3 text-left">Maturity Date</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto"/></td></tr>
              ) : pdcs.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No PDCs recorded</td></tr>
              ) : (
                pdcs.map(pdc => (
                  <tr key={pdc.id}>
                    <td className="px-4 py-3 font-mono">{pdc.cheque_number}</td>
                    <td className="px-4 py-3">{pdc.bank} {pdc.bank_branch ? `(${pdc.bank_branch})` : ''}</td>
                    <td className="px-4 py-3 font-medium text-foreground">QR {pdc.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">{pdc.deposit_date}</td>
                    <td className="px-4 py-3">{pdc.maturity_date || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={pdc.status === 'CLEARED' ? 'default' : pdc.status === 'BOUNCED' ? 'destructive' : 'outline'}>
                        {pdc.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Post Dated Cheque</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Cheque Number</Label>
              <Input value={formData.cheque_number} onChange={e => setFormData({...formData, cheque_number: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label>Bank</Label>
              <Input value={formData.bank} onChange={e => setFormData({...formData, bank: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Bank Branch</Label>
              <Input value={formData.bank_branch} onChange={e => setFormData({...formData, bank_branch: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Deposit Date</Label>
              <Input type="date" value={formData.deposit_date} onChange={e => setFormData({...formData, deposit_date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Maturity Date</Label>
              <Input type="date" value={formData.maturity_date} onChange={e => setFormData({...formData, maturity_date: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Save PDC'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
