import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, Plus, Package, TrendingDown, CheckCircle2, AlertTriangle, RefreshCw, Wrench, Trash2, Printer, ArrowRightLeft
} from "lucide-react";
import {
  fetchFixedAssets, createFixedAsset, updateFixedAsset, transferFixedAsset, fetchUnits,
  type FixedAsset, type Unit
} from "@/lib/supabase";
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';

export const Route = createFileRoute("/host/assets")({
  component: AssetsPage,
});

const CATEGORIES = ["Furniture", "HVAC", "Electrical", "Plumbing", "Appliances", "IT Equipment", "Vehicles", "Other"];

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  maintenance: "bg-amber-100 text-amber-700",
  disposed: "bg-gray-100 text-gray-500",
};

const SEED_ASSETS: Omit<FixedAsset, "id" | "created_at" | "updated_at">[] = [
  { property_id: "", unit_ref: "A-1201", name: "Split AC Unit (Samsung 2T)", category: "HVAC", purchase_date: "2022-01-15", purchase_value: 1800, current_value: 1080, depreciation_rate: 20, status: "active" },
  { property_id: "", unit_ref: "A-1201", name: "Refrigerator (LG 650L)", category: "Appliances", purchase_date: "2022-01-15", purchase_value: 1400, current_value: 700, depreciation_rate: 20, status: "active" },
  { property_id: "", unit_ref: "V-07", name: "Dining Table Set (6-seater)", category: "Furniture", purchase_date: "2021-08-01", purchase_value: 950, current_value: 475, depreciation_rate: 20, status: "active" },
  { property_id: "", unit_ref: "Common", name: "CCTV System (16 cameras)", category: "IT Equipment", purchase_date: "2020-06-01", purchase_value: 5000, current_value: 1000, depreciation_rate: 25, status: "active" },
  { property_id: "", unit_ref: "Common", name: "Fire Suppression System", category: "Electrical", purchase_date: "2019-04-15", purchase_value: 12000, current_value: 4800, depreciation_rate: 10, status: "active" },
  { property_id: "", unit_ref: "C-2210", name: "Commercial AC Unit (York 5T)", category: "HVAC", purchase_date: "2023-03-01", purchase_value: 4500, current_value: 3600, depreciation_rate: 20, status: "maintenance" },
  { property_id: "", unit_ref: "B-0804", name: "Washing Machine (Bosch 8kg)", category: "Appliances", purchase_date: "2022-12-01", purchase_value: 700, current_value: 490, depreciation_rate: 20, status: "active" },
  { property_id: "", unit_ref: "Common", name: "Elevator (OTIS)", category: "Other", purchase_date: "2018-01-01", purchase_value: 85000, current_value: 42500, depreciation_rate: 5, status: "active" },
  { property_id: "", unit_ref: "V-07", name: "Wall-mounted TVs x4", category: "Appliances", purchase_date: "2023-01-01", purchase_value: 3200, current_value: 2240, depreciation_rate: 25, status: "active" },
  { property_id: "", unit_ref: "A-1305", name: "Electric Water Heater (200L)", category: "Plumbing", purchase_date: "2021-05-15", purchase_value: 550, current_value: 110, depreciation_rate: 20, status: "disposed" },
];

function AssetsPage() {
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [unitsList, setUnitsList] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchBarcode, setSearchBarcode] = useState("");
  const [printBarcode, setPrintBarcode] = useState<string | null>(null);
  const [transferAsset, setTransferAsset] = useState<FixedAsset | null>(null);
  const [transferForm, setTransferForm] = useState({ property_id: "", unit_ref: "" });

  const [form, setForm] = useState({
    name: "", category: "Furniture", unit_ref: "", purchase_date: "", barcode: "", autoBarcode: true,
    purchase_value: "", current_value: "", depreciation_rate: "20", status: "active" as FixedAsset["status"],
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, unitsData] = await Promise.all([fetchFixedAssets(), fetchUnits()]);
      setAssets(data);
      setUnitsList(unitsData);
    } catch (e: any) { console.error(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-seed assets when empty (developer convenience)
  useEffect(() => {
    if (!loading && assets.length === 0) {
      seedAssets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function seedAssets() {
    setSeeding(true);
    try {
      for (const a of SEED_ASSETS) {
        await createFixedAsset(a);
      }
      await load();
    } catch (e: any) { console.error(e.message); }
    finally { setSeeding(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let finalBarcode = form.barcode;
      if (form.autoBarcode || !finalBarcode) {
        finalBarcode = `${form.category.substring(0,3).toUpperCase()}-${form.name.substring(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      await createFixedAsset({
        property_id: '',
        name: form.name,
        category: form.category,
        unit_ref: form.unit_ref,
        barcode: finalBarcode,
        purchase_date: form.purchase_date || new Date().toISOString().split("T")[0],
        purchase_value: Number(form.purchase_value) || 0,
        current_value: Number(form.current_value || form.purchase_value) || 0,
        depreciation_rate: Number(form.depreciation_rate) || 20,
        status: form.status,
      });
      setShowNew(false);
      setForm({ name: "", category: "Furniture", unit_ref: "", purchase_date: "", barcode: "", autoBarcode: true, purchase_value: "", current_value: "", depreciation_rate: "20", status: "active" });
      await load();
    } catch (e: any) { 
      console.error(e.message);
      alert(`Failed to add asset: ${e.message}`);
    }
    finally { setSaving(false); }
  }

  async function handleStatusChange(id: string, status: FixedAsset["status"]) {
    await updateFixedAsset(id, { status });
    await load();
  }

  const filtered = activeTab === "all" ? assets : assets.filter(a => a.status === activeTab);
  const searched = searchBarcode ? filtered.filter(a => a.barcode?.toLowerCase().includes(searchBarcode.toLowerCase())) : filtered;
  const totalValue = assets.filter(a => a.status !== "disposed").reduce((s, a) => s + Number(a.current_value || 0), 0);
  const totalPurchase = assets.filter(a => a.status !== "disposed").reduce((s, a) => s + Number(a.purchase_value || 0), 0);
  const depreciation = totalPurchase - totalValue;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fixed Assets & Inventory</h2>
          <p className="text-muted-foreground">Track furniture, appliances, equipment and their depreciation</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Asset
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Assets</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{assets.filter(a => a.status !== "disposed").length}</div><div className="text-xs text-muted-foreground">Active &amp; in maintenance</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Book Value</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</div><div className="text-xs text-muted-foreground">Current net book value</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Accumulated Depreciation</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-600">${depreciation.toLocaleString()}</div><div className="text-xs text-muted-foreground">vs. purchase price</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">In Maintenance</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{assets.filter(a => a.status === "maintenance").length}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center px-6">
              <TabsList>
                <TabsTrigger value="all">All Assets ({assets.length})</TabsTrigger>
                <TabsTrigger value="active">Active ({assets.filter(a => a.status === "active").length})</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance ({assets.filter(a => a.status === "maintenance").length})</TabsTrigger>
                <TabsTrigger value="disposed">Disposed ({assets.filter(a => a.status === "disposed").length})</TabsTrigger>
              </TabsList>
              <div className="w-64">
                <Input placeholder="Scan or search barcode..." value={searchBarcode} onChange={e => setSearchBarcode(e.target.value)} className="h-8 text-sm" />
              </div>
            </div>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y border-border bg-muted/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Barcode</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Purchase Value</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Net Book Value</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Depr. Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={9} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
                ) : searched.length === 0 ? (
                  <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No assets found. Use the "Seed 10 Assets" button to populate sample data.</td></tr>
                ) : searched.map((asset) => (
                  <tr key={asset.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-medium">{asset.name}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">{asset.category}</td>
                    <td className="px-6 py-4 font-mono text-xs">{asset.unit_ref || "—"}</td>
                    <td className="px-6 py-4 font-mono text-xs">{asset.barcode || "—"}</td>
                    <td className="px-6 py-4 text-right">${Number(asset.purchase_value || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-medium text-green-600">${Number(asset.current_value || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">{asset.depreciation_rate}%</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[asset.status]}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {asset.barcode && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Print Barcode" onClick={() => setPrintBarcode(asset.barcode!)}>
                            <Printer className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Transfer Asset" onClick={() => { setTransferAsset(asset); setTransferForm({ property_id: asset.property_id || "", unit_ref: asset.unit_ref || "" }); }}>
                          <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                        {asset.status === "active" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleStatusChange(asset.id, "maintenance")}>
                            <Wrench className="h-3 w-3 mr-1" /> Maintenance
                          </Button>
                        )}
                        {asset.status === "maintenance" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs text-green-600" onClick={() => handleStatusChange(asset.id, "active")}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Restore
                          </Button>
                        )}
                        {asset.status !== "disposed" && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500" onClick={() => handleStatusChange(asset.id, "disposed")}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {filtered.length > 0 && (
                <tfoot className="border-t-2 border-border font-semibold">
                  <tr>
                    <td className="px-6 py-4" colSpan={3}>Totals</td>
                    <td className="px-6 py-4 text-right">${filtered.reduce((s, a) => s + Number(a.purchase_value || 0), 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-green-600">${filtered.reduce((s, a) => s + Number(a.current_value || 0), 0).toLocaleString()}</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Asset Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Fixed Asset</DialogTitle>
            <DialogDescription>Register a new asset for tracking, depreciation and condition monitoring</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <Label>Asset Name *</Label>
              <Input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Samsung Split AC 2T" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Unit / Location</Label>
                <Select value={form.unit_ref} onValueChange={v => setForm(p => ({ ...p, unit_ref: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select Unit or Common Area" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Common">Common Area</SelectItem>
                    {unitsList.map(u => <SelectItem key={u.id} value={u.unit_ref}>{u.unit_ref}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label>Barcode</Label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    <input 
                      type="checkbox" 
                      checked={form.autoBarcode} 
                      onChange={e => setForm(p => ({ ...p, autoBarcode: e.target.checked, barcode: e.target.checked ? "" : p.barcode }))} 
                      className="rounded border-gray-300 w-3 h-3 text-primary focus:ring-primary"
                    />
                    Auto-generate
                  </label>
                </div>
                {form.autoBarcode ? (
                  <Input 
                    value="Will be auto-generated on save" 
                    disabled 
                    className="bg-muted text-muted-foreground italic"
                  />
                ) : (
                  <Input 
                    value={form.barcode} 
                    onChange={e => setForm(p => ({ ...p, barcode: e.target.value }))} 
                    placeholder="Scan or type existing barcode" 
                    autoFocus
                  />
                )}
              </div>
              <div className="space-y-1">
                <Label>Purchase Date</Label>
                <Input type="date" value={form.purchase_date} onChange={e => setForm(p => ({ ...p, purchase_date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Purchase Value ($)</Label>
                <Input type="number" value={form.purchase_value} onChange={e => setForm(p => ({ ...p, purchase_value: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Current Value ($)</Label>
                <Input type="number" value={form.current_value} onChange={e => setForm(p => ({ ...p, current_value: e.target.value }))} placeholder="Leave blank = purchase value" />
              </div>
              <div className="space-y-1">
                <Label>Depreciation Rate (%/yr)</Label>
                <Input type="number" value={form.depreciation_rate} onChange={e => setForm(p => ({ ...p, depreciation_rate: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Add Asset
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transfer Asset Dialog */}
      <Dialog open={!!transferAsset} onOpenChange={(open) => !open && setTransferAsset(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Asset</DialogTitle>
            <DialogDescription>Move {transferAsset?.name} to a different property or unit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Property ID</Label>
              <Input value={transferForm.property_id} onChange={e => setTransferForm(f => ({ ...f, property_id: e.target.value }))} placeholder="Property ID" />
            </div>
            <div className="space-y-1">
              <Label>Unit Reference</Label>
              <Input value={transferForm.unit_ref} onChange={e => setTransferForm(f => ({ ...f, unit_ref: e.target.value }))} placeholder="e.g. B-0501" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferAsset(null)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={async () => {
              if (transferAsset) {
                try {
                  await transferFixedAsset(transferAsset.id, transferForm.property_id, transferForm.unit_ref);
                  await load();
                  setTransferAsset(null);
                } catch (e: any) { alert("Transfer failed"); console.error(e); }
              }
            }}>Confirm Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Barcode Dialog */}
      <Dialog open={!!printBarcode} onOpenChange={(open) => !open && setPrintBarcode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Print Barcode</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-md mt-4 print-section text-black gap-6" id="barcode-print-area">
            {printBarcode && (
              <>
                <div className="text-center font-bold text-lg mb-2">Asset ID: {printBarcode}</div>
                <QRCodeSVG value={printBarcode} size={150} level={"H"} includeMargin={true} />
                <div className="w-full border-t border-dashed border-gray-300 my-4"></div>
                <Barcode value={printBarcode} width={2} height={60} displayValue={true} />
              </>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setPrintBarcode(null)}>Close</Button>
            <Button onClick={() => {
              const printContent = document.getElementById("barcode-print-area");
              const win = window.open("", "_blank");
              if (win && printContent) {
                win.document.write("<html><head><title>Print Barcode</title></head><body style='display:flex;justify-content:center;align-items:center;height:100vh;'>");
                win.document.write(printContent.innerHTML);
                win.document.write("</body></html>");
                win.document.close();
                win.focus();
                win.print();
                win.close();
              }
            }}>Print</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
