import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, Plus, Package, CheckCircle2, AlertTriangle, Trash2, Printer, ArrowRightLeft, FileDown, FileUp, Building2
} from "lucide-react";
import { fetchAssets, createAsset, updateAsset, fetchProperties, fetchUnits, createProperty, updateProperty, createUnit, updateUnit, type Asset, type Property, type Unit } from "@/lib/supabase";
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';

export function AssetManager({ role }: { role: "admin" | "prop-mgr" }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [printBarcode, setPrintBarcode] = useState<string | null>(null);
  const [transferAsset, setTransferAsset] = useState<Asset | null>(null);
  const [transferForm, setTransferForm] = useState({ assigned_property_id: "", assigned_employee_id: "" });

  const [form, setForm] = useState({
    asset_name: "",
    category: "Furniture",
    assigned_property_id: "",
    assigned_unit_id: "",
    purchase_date: "",
    asset_code: "",
    autoBarcode: true,
    purchase_cost: "",
    opening_cost: "",
    life_of_asset: "20",
    asset_status: "Available"
  });
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [propertyDialogMode, setPropertyDialogMode] = useState<"create" | "edit">("create");
  const [propertyForm, setPropertyForm] = useState({ title: "", address: "", city: "", country: "Qatar", property_type: "apartment", max_guests: "1", bedrooms: "1", beds: "1", bathrooms: "1", base_price_per_night: "0", cleaning_fee: "0", no_of_units: "" });
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [unitDialogMode, setUnitDialogMode] = useState<"create" | "edit">("create");
  const [unitForm, setUnitForm] = useState({ property_id: "", unit_ref: "", room_type: "Flat", status: "Available", price: "0" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, propertiesData, unitsData] = await Promise.all([fetchAssets(), fetchProperties(), fetchUnits()]);
      setAssets(data || []);
      setProperties(propertiesData || []);
      setUnits(unitsData || []);
    } catch (e: any) { console.error(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let finalBarcode = form.asset_code;
      if (form.autoBarcode || !finalBarcode) {
        finalBarcode = `${form.category.substring(0,3).toUpperCase()}-${form.asset_name.substring(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      await createAsset({
        asset_name: form.asset_name,
        category: form.category,
        asset_code: finalBarcode,
        assigned_property_id: form.assigned_property_id || undefined,
        assigned_unit_id: form.assigned_unit_id || undefined,
        purchase_date: form.purchase_date || new Date().toISOString().split("T")[0],
        purchase_cost: Number(form.purchase_cost) || 0,
        opening_cost: Number(form.opening_cost || form.purchase_cost) || 0,
        life_of_asset: Number(form.life_of_asset) || 20,
        asset_status: form.asset_status,
      });
      setShowNew(false);
      setForm({
        asset_name: "",
        category: "Furniture",
        assigned_property_id: "",
        assigned_unit_id: "",
        purchase_date: "",
        asset_code: "",
        autoBarcode: true,
        purchase_cost: "",
        opening_cost: "",
        life_of_asset: "20",
        asset_status: "Available"
      });
      await load();
    } catch (e: any) { 
      console.error(e.message);
      alert(`Failed to add asset: ${e.message}`);
    }
    finally { setSaving(false); }
  }

  async function handleStatusChange(id: string, status: string) {
    await updateAsset(id, { asset_status: status });
    await load();
  }

  const handleExport = () => alert("Export functionality would generate a CSV of assets.");
  const handleImport = () => alert("Import functionality would open a dialog to upload an Excel file and sync data.");

  const filtered = activeTab === "all" ? assets : assets.filter(a => a.asset_status?.toLowerCase() === activeTab);
  const selectedPropertyUnits = form.assigned_property_id ? units.filter(u => u.property_id === form.assigned_property_id) : [];

  async function saveProperty() {
    if (!propertyForm.title.trim()) return alert("Property title is required.");
    try {
      let saved: Property;
      if (propertyDialogMode === "edit" && form.assigned_property_id) {
        saved = await updateProperty(form.assigned_property_id, {
          ...propertyForm,
          max_guests: Number(propertyForm.max_guests) || 1,
          bedrooms: Number(propertyForm.bedrooms) || 1,
          beds: Number(propertyForm.beds) || 1,
          bathrooms: Number(propertyForm.bathrooms) || 1,
          base_price_per_night: Number(propertyForm.base_price_per_night) || 0,
          cleaning_fee: Number(propertyForm.cleaning_fee) || 0,
          no_of_units: propertyForm.no_of_units ? Number(propertyForm.no_of_units) : undefined,
          total_units: propertyForm.no_of_units ? Number(propertyForm.no_of_units) : undefined,
        });
        setProperties((items) => items.map((item) => (item.id === saved.id ? saved : item)));
      } else {
        saved = await createProperty({
          title: propertyForm.title,
          description: propertyForm.address || null,
          property_type: propertyForm.property_type,
          address: propertyForm.address,
          city: propertyForm.city,
          state: "",
          zip_code: "",
          country: propertyForm.country,
          max_guests: Number(propertyForm.max_guests) || 1,
          bedrooms: Number(propertyForm.bedrooms) || 1,
          beds: Number(propertyForm.beds) || 1,
          bathrooms: Number(propertyForm.bathrooms) || 1,
          base_price_per_night: Number(propertyForm.base_price_per_night) || 0,
          cleaning_fee: Number(propertyForm.cleaning_fee) || 0,
          no_of_units: propertyForm.no_of_units ? Number(propertyForm.no_of_units) : undefined,
          total_units: propertyForm.no_of_units ? Number(propertyForm.no_of_units) : undefined,
          is_active: true,
          room_details: {},
          amenities: [],
        } as any);
        setProperties((items) => [saved, ...items]);
      }
      setForm((f) => ({ ...f, assigned_property_id: saved.id, assigned_unit_id: "" }));
      setPropertyDialogOpen(false);
      setPropertyForm({ title: "", address: "", city: "", country: "Qatar", property_type: "apartment", max_guests: "1", bedrooms: "1", beds: "1", bathrooms: "1", base_price_per_night: "0", cleaning_fee: "0", no_of_units: "" });
      await load();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save property: ${err.message}`);
    }
  }

  async function saveUnit() {
    if (!unitForm.property_id) return alert("Please select a property for the unit.");
    if (!unitForm.unit_ref.trim()) return alert("Unit reference is required.");
    try {
      let saved: Unit;
      if (unitDialogMode === "edit" && form.assigned_unit_id) {
        saved = await updateUnit(form.assigned_unit_id, {
          ...unitForm,
          price: Number(unitForm.price) || 0,
        });
        setUnits((items) => items.map((item) => (item.id === saved.id ? saved : item)));
      } else {
        saved = await createUnit({
          property_id: unitForm.property_id,
          unit_ref: unitForm.unit_ref,
          room_type: unitForm.room_type,
          status: unitForm.status,
          price: Number(unitForm.price) || 0,
        });
        setUnits((items) => [saved, ...items]);
      }
      setForm((f) => ({ ...f, assigned_unit_id: saved.id, assigned_property_id: saved.property_id }));
      setUnitDialogOpen(false);
      setUnitForm({ property_id: form.assigned_property_id || "", unit_ref: "", room_type: "Flat", status: "Available", price: "0" });
      await load();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save unit: ${err.message}`);
    }
  }
  const searched = searchQuery ? filtered.filter(a => a.asset_code?.toLowerCase().includes(searchQuery.toLowerCase()) || a.asset_name.toLowerCase().includes(searchQuery.toLowerCase())) : filtered;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assets & Inventory</h2>
          <p className="text-muted-foreground mt-1">Manage company properties, furniture, and equipments.</p>
        </div>
        <div className="flex gap-2">
          {role === 'admin' && (
             <>
               <Button variant="outline" onClick={handleExport} className="gap-2"><FileDown className="h-4 w-4" /> Export</Button>
               <Button variant="outline" onClick={handleImport} className="gap-2"><FileUp className="h-4 w-4" /> Sync / Import</Button>
             </>
          )}
          <Button onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Asset
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{assets.length}</div>
            <p className="text-xs text-muted-foreground">Registered in system</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{assets.filter(a => a.asset_status === 'Available').length}</div>
            <p className="text-xs text-muted-foreground">Ready for assignment</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Maintenance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{assets.filter(a => a.asset_status === 'Maintenance').length}</div>
            <p className="text-xs text-muted-foreground">Currently unavailable</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border overflow-hidden">
        <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <TabsList>
                <TabsTrigger value="all">All Assets</TabsTrigger>
                <TabsTrigger value="available">Available</TabsTrigger>
                <TabsTrigger value="assigned">Assigned</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>
              <Input
                placeholder="Search by barcode or name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading assets...</span>
              </div>
            ) : searched.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-4 opacity-30" />
                <p className="font-medium">No assets found</p>
                <p className="text-sm mt-1">Try adjusting your filters or add a new asset.</p>
              </div>
            ) : (
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm text-left">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="h-12 px-4 font-medium">Asset Name & Code</th>
                      <th className="h-12 px-4 font-medium">Category</th>
                      <th className="h-12 px-4 font-medium">Assignment</th>
                      <th className="h-12 px-4 font-medium">Purchase Value</th>
                      <th className="h-12 px-4 font-medium">Status</th>
                      <th className="h-12 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searched.map((asset) => (
                      <tr key={asset.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-foreground">{asset.asset_name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1 cursor-pointer hover:text-primary" onClick={() => setPrintBarcode(asset.asset_code || "")}>
                            {asset.asset_code} <Printer className="h-3 w-3" />
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                            {asset.category}
                          </span>
                        </td>
                        <td className="p-4">
                          {asset.properties?.title ? (
                            <div className="flex items-center gap-1 text-sm"><Building2 className="h-3 w-3"/> {asset.properties.title}</div>
                          ) : asset.employees?.first_name ? (
                            <div className="text-sm">{asset.employees.first_name} {asset.employees.last_name}</div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">${asset.purchase_cost?.toLocaleString()}</td>
                        <td className="p-4">
                          <Select
                            value={asset.asset_status?.toLowerCase()}
                            onValueChange={(val) => handleStatusChange(asset.id, val.charAt(0).toUpperCase() + val.slice(1))}
                          >
                            <SelectTrigger className="h-8 w-[130px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="assigned">Assigned</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="disposed">Disposed</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="icon" title="Transfer Asset" onClick={() => setTransferAsset(asset)}>
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Edit">
                            <Plus className="h-4 w-4" /> {/* Would open edit form */}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Tabs>
      </Card>

      {/* New Asset Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Add New Asset</DialogTitle>
              <DialogDescription>Enter the details of the new property or equipment.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" required className="col-span-3" value={form.asset_name} onChange={e => setForm({...form, asset_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Furniture", "IT Equipment", "Electrical", "Plumbing", "Appliances", "Vehicles", "Other"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="property" className="text-right">Assigned Property</Label>
                <div className="col-span-3 space-y-2">
                  <Select value={form.assigned_property_id} onValueChange={(value) => setForm(f => ({ ...f, assigned_property_id: value, assigned_unit_id: "" }))}>
                    <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>{property.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => {
                      setPropertyDialogMode("create");
                      setPropertyForm({ title: "", address: "", city: "", country: "Qatar", property_type: "apartment", max_guests: "1", bedrooms: "1", beds: "1", bathrooms: "1", base_price_per_night: "0", cleaning_fee: "0" });
                      setPropertyDialogOpen(true);
                    }}>Add Property</Button>
                    <Button type="button" variant="outline" size="sm" disabled={!form.assigned_property_id} onClick={() => {
                      const selected = properties.find((property) => property.id === form.assigned_property_id);
                      if (!selected) return;
                      setPropertyDialogMode("edit");
                      setPropertyForm({
                        title: selected.title,
                        address: selected.address || "",
                        city: selected.city || "",
                        country: selected.country || "Qatar",
                        property_type: selected.property_type || "apartment",
                        max_guests: String(selected.max_guests || 1),
                        bedrooms: String(selected.bedrooms || 1),
                        beds: String(selected.beds || 1),
                        bathrooms: String(selected.bathrooms || 1),
                        base_price_per_night: String(selected.base_price_per_night || 0),
                        cleaning_fee: String(selected.cleaning_fee || 0),
                      });
                      setPropertyDialogOpen(true);
                    }}>Edit Property</Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right">Assigned Unit</Label>
                <div className="col-span-3 space-y-2">
                  <Select value={form.assigned_unit_id} onValueChange={(value) => setForm(f => ({ ...f, assigned_unit_id: value }))} disabled={!form.assigned_property_id}>
                    <SelectTrigger><SelectValue placeholder={form.assigned_property_id ? "Select unit" : "Select property first"} /></SelectTrigger>
                    <SelectContent>
                      {selectedPropertyUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>{unit.unit_ref || `Unit ${unit.id}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={!form.assigned_property_id} onClick={() => {
                      setUnitDialogMode("create");
                      setUnitForm({ property_id: form.assigned_property_id, unit_ref: "", room_type: "Flat", status: "Available", price: "0" });
                      setUnitDialogOpen(true);
                    }}>Add Unit</Button>
                    <Button type="button" variant="outline" size="sm" disabled={!form.assigned_unit_id} onClick={() => {
                      const selected = units.find((unit) => unit.id === form.assigned_unit_id);
                      if (!selected) return;
                      setUnitDialogMode("edit");
                      setUnitForm({ property_id: selected.property_id, unit_ref: selected.unit_ref || "", room_type: selected.room_type || "Flat", status: selected.status || "Available", price: String(selected.price || 0) });
                      setUnitDialogOpen(true);
                    }}>Edit Unit</Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="barcode" className="text-right">Barcode/Code</Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input id="barcode" disabled={form.autoBarcode} placeholder="Auto-generated" value={form.asset_code} onChange={e => setForm({...form, asset_code: e.target.value})} />
                  <label className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer">
                    <input type="checkbox" checked={form.autoBarcode} onChange={e => setForm({...form, autoBarcode: e.target.checked})} />
                    Auto
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">Purchase Cost</Label>
                <Input id="value" type="number" min="0" required className="col-span-3" value={form.purchase_cost} onChange={e => setForm({...form, purchase_cost: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="life" className="text-right">Life (Months)</Label>
                <Input id="life" type="number" min="1" max="100" className="col-span-3" value={form.life_of_asset} onChange={e => setForm({...form, life_of_asset: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null} Add Asset</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Property Dialog */}
      <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{propertyDialogMode === "edit" ? "Edit Property" : "Add Property"}</DialogTitle>
            <DialogDescription>{propertyDialogMode === "edit" ? "Update the selected property details." : "Add a property to assign this asset to."}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="propTitle" className="text-right">Title</Label>
              <Input id="propTitle" className="col-span-3" value={propertyForm.title} onChange={e => setPropertyForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="propCity" className="text-right">City</Label>
              <Input id="propCity" className="col-span-3" value={propertyForm.city} onChange={e => setPropertyForm(f => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="propAddress" className="text-right">Address</Label>
              <Textarea id="propAddress" className="col-span-3" value={propertyForm.address} onChange={e => setPropertyForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="propType" className="text-right">Type</Label>
              <Select value={propertyForm.property_type} onValueChange={v => setPropertyForm(f => ({ ...f, property_type: v }))}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['apartment', 'villa', 'commercial', 'townhouse'].map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="propUnits" className="text-right">Units Count</Label>
              <Input id="propUnits" type="number" min="0" className="col-span-3" placeholder="e.g. 10" value={propertyForm.no_of_units} onChange={e => setPropertyForm(f => ({ ...f, no_of_units: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPropertyDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveProperty}>{propertyDialogMode === "edit" ? "Update Property" : "Save Property"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unit Dialog */}
      <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{unitDialogMode === "edit" ? "Edit Unit" : "Add Unit"}</DialogTitle>
            <DialogDescription>{unitDialogMode === "edit" ? "Update the selected unit details." : "Add a unit to assign this asset to."}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unitProperty" className="text-right">Property</Label>
              <Select value={unitForm.property_id} onValueChange={v => setUnitForm(f => ({ ...f, property_id: v }))}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>{property.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unitRef" className="text-right">Unit Reference</Label>
              <Input id="unitRef" className="col-span-3" value={unitForm.unit_ref} onChange={e => setUnitForm(f => ({ ...f, unit_ref: e.target.value }))} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roomType" className="text-right">Room Type</Label>
              <Input id="roomType" className="col-span-3" value={unitForm.room_type} onChange={e => setUnitForm(f => ({ ...f, room_type: e.target.value }))} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unitPrice" className="text-right">Price</Label>
              <Input id="unitPrice" type="number" min="0" className="col-span-3" value={unitForm.price} onChange={e => setUnitForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unitStatus" className="text-right">Status</Label>
              <Select value={unitForm.status} onValueChange={v => setUnitForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Available', 'Occupied', 'Maintenance'].map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnitDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveUnit}>{unitDialogMode === "edit" ? "Update Unit" : "Save Unit"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barcode Print Dialog */}
      <Dialog open={!!printBarcode} onOpenChange={(open) => !open && setPrintBarcode(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Asset Tag</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 gap-6 bg-white rounded-md border border-dashed">
            {printBarcode && <QRCodeSVG value={printBarcode} size={150} />}
            {printBarcode && <Barcode value={printBarcode} height={40} fontSize={14} background="transparent" />}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintBarcode(null)}>Close</Button>
            <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4"/> Print Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Transfer Asset Dialog */}
      <Dialog open={!!transferAsset} onOpenChange={(open) => !open && setTransferAsset(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Transfer Asset</DialogTitle>
            <DialogDescription>
              Assign <strong>{transferAsset?.asset_name}</strong> to a different unit, property or employee.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
               <Label>Assigned Property ID</Label>
               <Input placeholder="Leave blank to unassign" value={transferForm.assigned_property_id} onChange={e => setTransferForm({...transferForm, assigned_property_id: e.target.value})} />
            </div>
            <div>
               <Label>Assigned Employee ID</Label>
               <Input placeholder="Leave blank to unassign" value={transferForm.assigned_employee_id} onChange={e => setTransferForm({...transferForm, assigned_employee_id: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTransferAsset(null)}>Cancel</Button>
            <Button onClick={async () => {
              if (transferAsset) {
                 await updateAsset(transferAsset.id, { assigned_property_id: transferForm.assigned_property_id || undefined, assigned_employee_id: transferForm.assigned_employee_id || undefined });
                 setTransferAsset(null);
                 load();
              }
            }}>Complete Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
