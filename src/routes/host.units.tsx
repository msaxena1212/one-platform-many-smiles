import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  fetchUnits, createUnit, fetchProperties,
  fetchFurnishingTypes, fetchLeaseStatuses, fetchRentFrequencies,
  fetchMaintenanceResponsibilities, fetchSecurityDepositTypes, fetchViewTypes,
  type Unit, type MasterItem
} from '@/lib/supabase';
import { Loader2, Plus, Home, Building2, Users, FileText, Zap, Droplets, Snowflake, X } from 'lucide-react';

export const Route = createFileRoute("/host/units")({
  component: HostUnits,
});

const leaseStatusColors: Record<string, string> = {
  Leased: 'bg-blue-100 text-blue-700',
  Vacant: 'bg-green-100 text-green-700',
  'Renewal Due': 'bg-amber-100 text-amber-700',
  'Notice Given': 'bg-orange-100 text-orange-700',
  Expired: 'bg-red-100 text-red-700',
  'Legal Case': 'bg-red-200 text-red-800',
};

const unitStatusColors: Record<string, string> = {
  Occupied: 'bg-blue-50 text-blue-600',
  Available: 'bg-emerald-50 text-emerald-700',
  Maintenance: 'bg-amber-50 text-amber-700',
  Reserved: 'bg-purple-50 text-purple-700',
};

type FormState = Partial<Unit> & { property_id: string };

const EMPTY_FORM: FormState = {
  property_id: '',
  unit_ref: '',
  unit_code: '',
  unit_cost_center_code: '',
  unit_name: '',
  room_type: 'Apartment',
  unit_usage: 'Residential',
  block_tower: '',
  floor: '',
  bedrooms: 1,
  bathrooms: 1,
  area: '',
  balcony_sqm: undefined,
  total_area_sqm: undefined,
  view_type: '',
  furnishing: 'Fully Furnished',
  parking_slot_no: '',
  electricity_meter_no: '',
  water_meter_no: '',
  cooling_meter_no: '',
  price: 0,
  status: 'Available',
  lease_status: 'Vacant',
  rent_frequency: 'Monthly',
  current_tenant: '',
  contract_no: '',
  contract_start_date: '',
  contract_end_date: '',
  current_rent: undefined,
  security_deposit_type: '',
  security_deposit_amount: undefined,
  maintenance_responsibility: 'Property Manager',
  handover_date: '',
  documents_received: false,
  remarks: '',
};

function HostUnits() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [properties, setProperties] = useState<{ id: string; title: string; property_code?: string }[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // Masters
  const [furnishingTypes, setFurnishingTypes] = useState<MasterItem[]>([]);
  const [leaseStatuses, setLeaseStatuses] = useState<MasterItem[]>([]);
  const [rentFrequencies, setRentFrequencies] = useState<MasterItem[]>([]);
  const [maintenanceResp, setMaintenanceResp] = useState<MasterItem[]>([]);
  const [depositTypes, setDepositTypes] = useState<MasterItem[]>([]);
  const [viewTypes, setViewTypes] = useState<MasterItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, p, fur, ls, rf, mr, dt, vt] = await Promise.all([
        fetchUnits(),
        fetchProperties(),
        fetchFurnishingTypes(),
        fetchLeaseStatuses(),
        fetchRentFrequencies(),
        fetchMaintenanceResponsibilities(),
        fetchSecurityDepositTypes(),
        fetchViewTypes(),
      ]);
      setUnits(u || []);
      setProperties(p || []);
      setFurnishingTypes(fur);
      setLeaseStatuses(ls);
      setRentFrequencies(rf);
      setMaintenanceResp(mr);
      setDepositTypes(dt);
      setViewTypes(vt);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setF = (key: keyof FormState, value: any) => setForm(f => ({ ...f, [key]: value }));

  async function handleCreate() {
    if (!form.property_id || !form.unit_ref) return alert('Property and Unit Reference are required.');
    setSaving(true);
    try {
      await createUnit({ ...form });
      setOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err: any) {
      console.error(err);
      alert('Failed to create unit: ' + err.message);
    } finally { setSaving(false); }
  }

  // Filter
  const filtered = units.filter(u => {
    const matchStatus = filterStatus === 'all' || u.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchProp = filterProperty === 'all' || u.property_id === filterProperty;
    const matchSearch = !search ||
      u.unit_ref?.toLowerCase().includes(search.toLowerCase()) ||
      u.unit_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.current_tenant?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchProp && matchSearch;
  });

  // KPIs
  const total = units.length;
  const occupied = units.filter(u => u.status?.toLowerCase() === 'occupied').length;
  const available = units.filter(u => u.status?.toLowerCase() === 'available').length;
  const renewalDue = units.filter(u => u.lease_status === 'Renewal Due').length;
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Unit Master</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage all units across your properties</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Add Unit
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Units', value: total, icon: Building2, color: 'text-primary' },
          { label: 'Occupied', value: `${occupied} (${occupancyRate}%)`, icon: Users, color: 'text-blue-600' },
          { label: 'Available', value: available, icon: Home, color: 'text-emerald-600' },
          { label: 'Renewal Due', value: renewalDue, icon: FileText, color: 'text-amber-600' },
        ].map(k => (
          <Card key={k.label}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{k.label}</CardTitle>
              <k.icon className={`h-4 w-4 ${k.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search unit, tenant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs h-9"
        />
        <Tabs value={filterStatus} onValueChange={setFilterStatus}>
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">All ({total})</TabsTrigger>
            <TabsTrigger value="occupied" className="text-xs">Occupied ({occupied})</TabsTrigger>
            <TabsTrigger value="available" className="text-xs">Available ({available})</TabsTrigger>
            <TabsTrigger value="maintenance" className="text-xs">Maintenance</TabsTrigger>
          </TabsList>
        </Tabs>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          value={filterProperty}
          onChange={e => setFilterProperty(e.target.value)}
        >
          <option value="all">All Properties</option>
          {properties.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/10">
                <tr>
                  {['Unit Code', 'Unit Name', 'Property', 'Floor', 'BR/BA', 'Furnishing', 'Base Rate', 'Lease Status', 'Tenant', 'Contract Period', 'E-Meter', 'W-Meter', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={13} className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={13} className="py-12 text-center text-muted-foreground">No units found</td></tr>
                ) : filtered.map(unit => {
                  const prop = properties.find(p => p.id === unit.property_id);
                  return (
                    <tr
                      key={unit.id}
                      className="hover:bg-muted/10 transition-colors cursor-pointer"
                      onClick={() => setSelectedUnit(unit)}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-medium">{unit.unit_code || unit.unit_ref}</td>
                      <td className="px-4 py-3 font-medium max-w-[160px] truncate">{unit.unit_name || unit.unit_ref}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[140px] truncate">{prop?.title || '—'}</td>
                      <td className="px-4 py-3 text-xs">{unit.floor || '—'}</td>
                      <td className="px-4 py-3 text-xs">{unit.bedrooms}BR / {unit.bathrooms}BA</td>
                      <td className="px-4 py-3 text-xs">{unit.furnishing || '—'}</td>
                      <td className="px-4 py-3 text-xs font-medium">QR {unit.price?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${leaseStatusColors[unit.lease_status || ''] || 'bg-slate-100 text-slate-600'}`}>
                          {unit.lease_status || unit.status || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs max-w-[150px] truncate">{unit.current_tenant || '—'}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {unit.contract_start_date ? (
                          <span>{unit.contract_start_date?.slice(0, 10)} → {unit.contract_end_date?.slice(0, 10)}</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{unit.electricity_meter_no || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{unit.water_meter_no || '—'}</td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={e => { e.stopPropagation(); setSelectedUnit(unit); }}>View</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Unit Detail Dialog */}
      <Dialog open={!!selectedUnit} onOpenChange={o => !o && setSelectedUnit(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {selectedUnit?.unit_name || selectedUnit?.unit_ref}
            </DialogTitle>
            <DialogDescription>{selectedUnit?.unit_cost_center_code}</DialogDescription>
          </DialogHeader>
          {selectedUnit && (
            <div className="space-y-5 pt-2">
              {/* Identity */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-1 border-b">Unit Identity</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                  {[
                    ['Unit Code', selectedUnit.unit_code],
                    ['Unit Name', selectedUnit.unit_name],
                    ['Cost Center', selectedUnit.unit_cost_center_code],
                    ['Block/Tower', selectedUnit.block_tower],
                    ['Floor', selectedUnit.floor],
                    ['Type', selectedUnit.room_type],
                    ['Usage', selectedUnit.unit_usage],
                    ['Furnishing', selectedUnit.furnishing],
                    ['View Type', selectedUnit.view_type],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{l}</div>
                      <div className="font-medium text-sm mt-0.5">{v || '—'}</div>
                    </div>
                  ))}
                </div>
              </section>
              {/* Size */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-1 border-b">Size & Configuration</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
                  {[
                    ['Bedrooms', selectedUnit.bedrooms],
                    ['Bathrooms', selectedUnit.bathrooms],
                    ['Area', selectedUnit.area],
                    ['Balcony (sqm)', selectedUnit.balcony_sqm],
                    ['Total Area (sqm)', selectedUnit.total_area_sqm],
                    ['Parking Slot', selectedUnit.parking_slot_no],
                  ].map(([l, v]) => (
                    <div key={l as string}>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{l}</div>
                      <div className="font-medium text-sm mt-0.5">{v ?? '—'}</div>
                    </div>
                  ))}
                </div>
              </section>
              {/* Meters */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-1 border-b">Utility Meters</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Electricity', value: selectedUnit.electricity_meter_no, icon: Zap, color: 'text-yellow-500' },
                    { label: 'Water', value: selectedUnit.water_meter_no, icon: Droplets, color: 'text-blue-500' },
                    { label: 'Cooling/Chiller', value: selectedUnit.cooling_meter_no, icon: Snowflake, color: 'text-cyan-500' },
                  ].map(m => (
                    <div key={m.label} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                      <m.icon className={`h-4 w-4 ${m.color}`} />
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</div>
                        <div className="font-mono text-sm font-medium">{m.value || 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              {/* Lease */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-1 border-b">Lease & Financial Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                  {[
                    ['Lease Status', selectedUnit.lease_status],
                    ['Rent Frequency', selectedUnit.rent_frequency],
                    ['Base Rate', selectedUnit.price ? `QR ${selectedUnit.price?.toLocaleString()}` : null],
                    ['Current Rent', selectedUnit.current_rent ? `QR ${selectedUnit.current_rent?.toLocaleString()}` : null],
                    ['Security Deposit Type', selectedUnit.security_deposit_type],
                    ['Security Deposit', selectedUnit.security_deposit_amount ? `QR ${selectedUnit.security_deposit_amount?.toLocaleString()}` : null],
                    ['Maintenance Resp.', selectedUnit.maintenance_responsibility],
                    ['Contract No.', selectedUnit.contract_no],
                    ['Documents Received', selectedUnit.documents_received ? 'Yes' : 'No'],
                  ].map(([l, v]) => (
                    <div key={l as string}>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{l}</div>
                      <div className="font-medium text-sm mt-0.5">{v || '—'}</div>
                    </div>
                  ))}
                </div>
              </section>
              {/* Tenant */}
              {selectedUnit.current_tenant && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-1 border-b">Current Tenant</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                    {[
                      ['Tenant Name', selectedUnit.current_tenant],
                      ['Contract Start', selectedUnit.contract_start_date?.slice(0,10)],
                      ['Contract End', selectedUnit.contract_end_date?.slice(0,10)],
                      ['Handover Date', selectedUnit.handover_date?.slice(0,10)],
                    ].map(([l, v]) => (
                      <div key={l as string}>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{l}</div>
                        <div className="font-medium text-sm mt-0.5">{v || '—'}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUnit(null)}><X className="h-4 w-4 mr-1" /> Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Unit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Unit</DialogTitle>
            <DialogDescription>Register a new unit with all master data fields</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-2">

            {/* Section: Identity */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-1 border-b">Identity</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <Label>Property *</Label>
                  <Select value={form.property_id} onValueChange={v => {
                    setF('property_id', v);
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                    <SelectContent>
                      {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Unit Reference *</Label>
                  <Input value={form.unit_ref || ''} onChange={e => setF('unit_ref', e.target.value)} placeholder="e.g. Flat11" />
                </div>
                <div className="space-y-1">
                  <Label>Unit Code</Label>
                  <Input value={form.unit_code || ''} onChange={e => setF('unit_code', e.target.value)} placeholder="e.g. Flat11" />
                </div>
                <div className="space-y-1">
                  <Label>Cost Center Code</Label>
                  <Input value={form.unit_cost_center_code || ''} onChange={e => setF('unit_cost_center_code', e.target.value)} placeholder="AAA-Flat11" />
                </div>
                <div className="space-y-1">
                  <Label>Unit Name</Label>
                  <Input value={form.unit_name || ''} onChange={e => setF('unit_name', e.target.value)} placeholder="AAA - Flat11" />
                </div>
                <div className="space-y-1">
                  <Label>Block / Tower</Label>
                  <Input value={form.block_tower || ''} onChange={e => setF('block_tower', e.target.value)} placeholder="1" />
                </div>
                <div className="space-y-1">
                  <Label>Floor</Label>
                  <Input value={form.floor || ''} onChange={e => setF('floor', e.target.value)} placeholder="e.g. Ground, 1st..." />
                </div>
              </div>
            </div>

            {/* Section: Config */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-1 border-b">Configuration</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Unit Type</Label>
                  <Select value={form.room_type} onValueChange={v => setF('room_type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Apartment', 'Studio', 'Villa', 'Townhouse', 'Office', 'Shop', 'Showroom', 'Warehouse', 'Parking', 'Other'].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Usage</Label>
                  <Select value={form.unit_usage} onValueChange={v => setF('unit_usage', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Residential', 'Commercial', 'Retail', 'Office', 'Storage', 'Parking', 'Common Area', 'Other'].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Bedrooms</Label>
                  <Input type="number" min={0} max={7} value={form.bedrooms} onChange={e => setF('bedrooms', Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Bathrooms</Label>
                  <Input type="number" min={0} max={7} value={form.bathrooms} onChange={e => setF('bathrooms', Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Furnishing</Label>
                  <Select value={form.furnishing} onValueChange={v => setF('furnishing', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(furnishingTypes.length ? furnishingTypes : [{id:'Fully Furnished',label:'Fully Furnished'},{id:'Semi Furnished',label:'Semi Furnished'},{id:'Unfurnished',label:'Unfurnished'}]).map(t => (
                        <SelectItem key={t.id} value={t.label}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>View Type</Label>
                  <Select value={form.view_type} onValueChange={v => setF('view_type', v)}>
                    <SelectTrigger><SelectValue placeholder="Select view" /></SelectTrigger>
                    <SelectContent>
                      {(viewTypes.length ? viewTypes : [{id:'Road View',label:'Road View'},{id:'City View',label:'City View'}]).map(t => (
                        <SelectItem key={t.id} value={t.label}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Area (sqm)</Label>
                  <Input value={form.area || ''} onChange={e => setF('area', e.target.value)} placeholder="e.g. 95" />
                </div>
                <div className="space-y-1">
                  <Label>Parking Slot No.</Label>
                  <Input value={form.parking_slot_no || ''} onChange={e => setF('parking_slot_no', e.target.value)} placeholder="P-12" />
                </div>
              </div>
            </div>

            {/* Section: Meters */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-1 border-b">Utility Meters</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-500" /> Electricity</Label>
                  <Input value={form.electricity_meter_no || ''} onChange={e => setF('electricity_meter_no', e.target.value)} placeholder="Meter No." />
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-1"><Droplets className="h-3 w-3 text-blue-500" /> Water</Label>
                  <Input value={form.water_meter_no || ''} onChange={e => setF('water_meter_no', e.target.value)} placeholder="Meter No." />
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-1"><Snowflake className="h-3 w-3 text-cyan-500" /> Cooling</Label>
                  <Input value={form.cooling_meter_no || ''} onChange={e => setF('cooling_meter_no', e.target.value)} placeholder="Meter No." />
                </div>
              </div>
            </div>

            {/* Section: Lease & Finance */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-1 border-b">Lease & Financial</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Unit Status</Label>
                  <Select value={form.status} onValueChange={v => setF('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Available', 'Occupied', 'Reserved', 'Maintenance', 'Blocked', 'Sold', 'Inactive'].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Lease Status</Label>
                  <Select value={form.lease_status} onValueChange={v => setF('lease_status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(leaseStatuses.length ? leaseStatuses : [{id:'Vacant',label:'Vacant'},{id:'Leased',label:'Leased'},{id:'Renewal Due',label:'Renewal Due'}]).map(s => (
                        <SelectItem key={s.id} value={s.label}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Base Rate (QR)</Label>
                  <Input type="number" value={form.price || ''} onChange={e => setF('price', Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Rent Frequency</Label>
                  <Select value={form.rent_frequency} onValueChange={v => setF('rent_frequency', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(rentFrequencies.length ? rentFrequencies : [{id:'Monthly',label:'Monthly'},{id:'Quarterly',label:'Quarterly'},{id:'Yearly',label:'Yearly'}]).map(f => (
                        <SelectItem key={f.id} value={f.label}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Security Deposit Type</Label>
                  <Select value={form.security_deposit_type} onValueChange={v => setF('security_deposit_type', v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {(depositTypes.length ? depositTypes : [{id:'Cash',label:'Cash'},{id:'PDC',label:'PDC'},{id:'Guarantee Cheque',label:'Guarantee Cheque'}]).map(d => (
                        <SelectItem key={d.id} value={d.label}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Security Deposit (QR)</Label>
                  <Input type="number" value={form.security_deposit_amount || ''} onChange={e => setF('security_deposit_amount', Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Maintenance Responsibility</Label>
                  <Select value={form.maintenance_responsibility} onValueChange={v => setF('maintenance_responsibility', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(maintenanceResp.length ? maintenanceResp : [{id:'Property Manager',label:'Property Manager'},{id:'Owner',label:'Owner'},{id:'Tenant',label:'Tenant'}]).map(m => (
                        <SelectItem key={m.id} value={m.label}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Current Tenant</Label>
                  <Input value={form.current_tenant || ''} onChange={e => setF('current_tenant', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Contract Start</Label>
                  <Input type="date" value={form.contract_start_date || ''} onChange={e => setF('contract_start_date', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Contract End</Label>
                  <Input type="date" value={form.contract_end_date || ''} onChange={e => setF('contract_end_date', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Current Rent (QR)</Label>
                  <Input type="number" value={form.current_rent || ''} onChange={e => setF('current_rent', Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Handover Date</Label>
                  <Input type="date" value={form.handover_date || ''} onChange={e => setF('handover_date', e.target.value)} />
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <input type="checkbox" id="docs_received" checked={!!form.documents_received} onChange={e => setF('documents_received', e.target.checked)} className="h-4 w-4" />
                  <Label htmlFor="docs_received" className="cursor-pointer">Documents Received</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
