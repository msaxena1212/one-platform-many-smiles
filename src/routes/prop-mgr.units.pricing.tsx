import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Calendar, DollarSign, Trash2 } from 'lucide-react';

export const Route = createFileRoute('/prop-mgr/units/pricing')({
  component: PricingEngine,
});

function PricingEngine() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    unit_id: '',
    rule_name: '',
    start_date: '',
    end_date: '',
    price_modifier: 0,
    modifier_type: 'FIXED',
    min_stay_days: 1
  });

  const loadData = async () => {
    setLoading(true);
    const [{ data: rulesData }, { data: unitsData }] = await Promise.all([
      supabase.from('pricing_rules').select('*, units(unit_name, unit_ref)'),
      supabase.from('units').select('id, unit_name, unit_ref')
    ]);
    if (rulesData) setRules(rulesData);
    if (unitsData) setUnits(unitsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddRule = async () => {
    const { error } = await supabase.from('pricing_rules').insert([formData]);
    if (error) alert("Error adding rule: " + error.message);
    else loadData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('pricing_rules').delete().eq('id', id);
    if (!error) loadData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dynamic Pricing Engine</h2>
        <p className="text-muted-foreground text-sm mt-1">Configure seasonal pricing and minimum stay rules for your units.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Add New Rule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={formData.unit_id} onValueChange={v => setFormData({...formData, unit_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select Unit" /></SelectTrigger>
                <SelectContent>
                  {units.map(u => <SelectItem key={u.id} value={u.id}>{u.unit_name || u.unit_ref}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input placeholder="e.g. Summer Peak Season" value={formData.rule_name} onChange={e => setFormData({...formData, rule_name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Modifier Type</Label>
              <Select value={formData.modifier_type} onValueChange={v => setFormData({...formData, modifier_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">Fixed Amount Override</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage Adjustment (+/-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Price Modifier</Label>
              <Input type="number" value={formData.price_modifier} onChange={e => setFormData({...formData, price_modifier: Number(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label>Minimum Stay (Days)</Label>
              <Input type="number" min={1} value={formData.min_stay_days} onChange={e => setFormData({...formData, min_stay_days: Number(e.target.value)})} />
            </div>
            <Button className="w-full" onClick={handleAddRule}>
              <Plus className="mr-2 h-4 w-4" /> Add Pricing Rule
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Active Pricing Rules</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : rules.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">No pricing rules configured.</div>
            ) : (
              <div className="space-y-3">
                {rules.map(rule => (
                  <div key={rule.id} className="flex justify-between items-center p-4 border rounded-lg bg-muted/20">
                    <div>
                      <h4 className="font-semibold text-foreground">{rule.rule_name}</h4>
                      <p className="text-sm text-muted-foreground">{rule.units?.unit_name || rule.units?.unit_ref}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center"><Calendar className="mr-1 h-3 w-3"/> {rule.start_date} to {rule.end_date}</span>
                        <span className="flex items-center"><DollarSign className="mr-1 h-3 w-3"/> {rule.modifier_type === 'PERCENTAGE' ? `${rule.price_modifier}%` : `QR ${rule.price_modifier}`}</span>
                        <span>Min Stay: {rule.min_stay_days} days</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
