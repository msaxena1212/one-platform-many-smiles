import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus, Loader2, Trash2, Pencil, Search, ChevronRight,
  Users, Package, Settings2
} from "lucide-react";
import {
  // Legacy masters
  fetchTicketCategories, createTicketCategory, updateTicketCategory, deleteTicketCategory, TicketCategory,
  fetchFacilityMasters, createFacilityMaster, updateFacilityMaster, deleteFacilityMaster, FacilityMaster,
  fetchPaymentModes, createPaymentMode, updatePaymentMode, deletePaymentMode, PaymentMode,
  // HR Masters
  Simplemaster,
  fetchGenders, createGender, updateGender, deleteGender,
  fetchDepartments, createDepartment, updateDepartment, deleteDepartment,
  fetchDesignations, createDesignation, updateDesignation, deleteDesignation,
  fetchEmploymentTypes, createEmploymentType, updateEmploymentType, deleteEmploymentType,
  fetchWorkLocations, createWorkLocation, updateWorkLocation, deleteWorkLocation,
  fetchEmployeeStatuses, createEmployeeStatus, updateEmployeeStatus, deleteEmployeeStatus,
  // Asset Masters
  AssetSubcategory,
  fetchAssetCategories, createAssetCategory, updateAssetCategory, deleteAssetCategory,
  fetchAssetSubcategories, createAssetSubcategory, updateAssetSubcategory, deleteAssetSubcategory,
  fetchAssetOwnershipTypes, createAssetOwnershipType, updateAssetOwnershipType, deleteAssetOwnershipType,
  fetchAssetConditions, createAssetCondition, updateAssetCondition, deleteAssetCondition,
  fetchAssetStatuses, createAssetStatus, updateAssetStatus, deleteAssetStatus,
} from "@/lib/supabase-masters";
import { toast } from "sonner";

export interface MastersModuleProps {
  role: "admin";
}

// ── Sidebar nav definition ────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: "HR Masters",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    items: [
      { key: "gender",          label: "Gender" },
      { key: "department",      label: "Department" },
      { key: "designation",     label: "Designation" },
      { key: "employment_type", label: "Employment Type" },
      { key: "work_location",   label: "Work Location" },
      { key: "employee_status", label: "Employee Status" },
    ],
  },
  {
    label: "Asset Masters",
    icon: Package,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    items: [
      { key: "asset_category",        label: "Asset Category" },
      { key: "asset_subcategory",     label: "Asset Subcategory" },
      { key: "asset_ownership_type",  label: "Ownership Type" },
      { key: "asset_condition",       label: "Asset Condition" },
      { key: "asset_status",          label: "Asset Status" },
    ],
  },
  {
    label: "System Masters",
    icon: Settings2,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    items: [
      { key: "ticket_categories", label: "Ticket Categories" },
      { key: "facilities",        label: "Facilities" },
      { key: "payment_modes",     label: "Payment Modes" },
    ],
  },
];

// ── Reusable simple master panel ──────────────────────────────────────────────

interface SimpleMasterPanelProps {
  title: string;
  items: Simplemaster[];
  loading: boolean;
  fieldLabel?: string;
  onAdd: (name: string) => Promise<void>;
  onEdit: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function SimpleMasterPanel({
  title, items, loading, fieldLabel = "Name",
  onAdd, onEdit, onDelete,
}: SimpleMasterPanelProps) {
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<Simplemaster | null>(null);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  function openAdd() { setEditItem(null); setValue(""); setShowDialog(true); }
  function openEdit(item: Simplemaster) { setEditItem(item); setValue(item.name); setShowDialog(true); }

  async function handleSave() {
    if (!value.trim()) return;
    setSaving(true);
    try {
      if (editItem) {
        await onEdit(editItem.id, value.trim());
        toast.success("Updated successfully");
      } else {
        await onAdd(value.trim());
        toast.success("Added successfully");
      }
      setShowDialog(false);
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this item?")) return;
    try {
      await onDelete(id);
      toast.success("Deleted");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${title}...`}
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button size="sm" className="gap-2 ml-3" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {search ? "No results found." : "No items configured yet."}
        </p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors group"
            >
              <span className="text-sm font-medium">{item.name}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost" size="icon" className="h-7 w-7"
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? `Edit ${title}` : `Add ${title}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>{fieldLabel}</Label>
              <Input
                placeholder={`Enter ${fieldLabel.toLowerCase()}...`}
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSave()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !value.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editItem ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Ticket Category Master Panel ──────────────────────────────────────────────

function TicketCategoryPanel({
  items, loading, onAdd, onEdit, onDelete
}: {
  items: TicketCategory[];
  loading: boolean;
  onAdd: (data: { name: string; sla_hours: number; priority: string }) => Promise<void>;
  onEdit: (id: number, data: { name: string; sla_hours: number; priority: string }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<TicketCategory | null>(null);
  const [form, setForm] = useState({ name: "", sla_hours: "24", priority: "medium" });
  const [saving, setSaving] = useState(false);

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  function openAdd() { setEditItem(null); setForm({ name: "", sla_hours: "24", priority: "medium" }); setShowDialog(true); }
  function openEdit(item: TicketCategory) { setEditItem(item); setForm({ name: item.name, sla_hours: String(item.sla_hours), priority: item.priority }); setShowDialog(true); }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), sla_hours: parseInt(form.sla_hours) || 24, priority: form.priority };
      if (editItem) {
        await onEdit(editItem.id, payload);
        toast.success("Updated successfully");
      } else {
        await onAdd(payload);
        toast.success("Added successfully");
      }
      setShowDialog(false);
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ticket categories..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button size="sm" className="gap-2 ml-3" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No ticket categories found.</p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(item => (
            <div key={item.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors group">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">SLA: {item.sla_hours} hours</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={item.priority === "high" || item.priority === "urgent" ? "destructive" : "secondary"}>
                  {item.priority}
                </Badge>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editItem ? "Edit Ticket Category" : "Add Ticket Category"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Category Name</Label>
              <Input placeholder="e.g. Plumbing" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>SLA (Hours)</Label>
              <Input type="number" placeholder="24" value={form.sla_hours} onChange={e => setForm({ ...form, sla_hours: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>{editItem ? "Update" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Facility Master Panel ────────────────────────────────────────────────────

function FacilityPanel({
  items, loading, onAdd, onEdit, onDelete
}: {
  items: FacilityMaster[];
  loading: boolean;
  onAdd: (data: { name: string; capacity: number; paid: boolean }) => Promise<void>;
  onEdit: (id: number, data: { name: string; capacity: number; paid: boolean }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<FacilityMaster | null>(null);
  const [form, setForm] = useState({ name: "", capacity: "1", paid: "false" });
  const [saving, setSaving] = useState(false);

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  function openAdd() { setEditItem(null); setForm({ name: "", capacity: "1", paid: "false" }); setShowDialog(true); }
  function openEdit(item: FacilityMaster) { setEditItem(item); setForm({ name: item.name, capacity: String(item.capacity), paid: item.paid ? "true" : "false" }); setShowDialog(true); }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), capacity: parseInt(form.capacity) || 1, paid: form.paid === "true" };
      if (editItem) {
        await onEdit(editItem.id, payload);
        toast.success("Updated successfully");
      } else {
        await onAdd(payload);
        toast.success("Added successfully");
      }
      setShowDialog(false);
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search facilities..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button size="sm" className="gap-2 ml-3" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Facility
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No facilities found.</p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(item => (
            <div key={item.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors group">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">Capacity: {item.capacity}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={item.paid ? "default" : "outline"}>
                  {item.paid ? "Paid Service" : "Free"}
                </Badge>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editItem ? "Edit Facility" : "Add Facility"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Facility Name</Label>
              <Input placeholder="e.g. Swimming Pool" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Capacity</Label>
              <Input type="number" placeholder="50" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Service Type</Label>
              <Select value={form.paid} onValueChange={v => setForm({ ...form, paid: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Free Service</SelectItem>
                  <SelectItem value="true">Paid Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>{editItem ? "Update" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Payment Mode Panel ───────────────────────────────────────────────────────

function PaymentModePanel({
  items, loading, onAdd, onEdit, onDelete
}: {
  items: PaymentMode[];
  loading: boolean;
  onAdd: (data: { code: string; name: string }) => Promise<void>;
  onEdit: (id: number, data: { code: string; name: string }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<PaymentMode | null>(null);
  const [form, setForm] = useState({ code: "", name: "" });
  const [saving, setSaving] = useState(false);

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase()));

  function openAdd() { setEditItem(null); setForm({ code: "", name: "" }); setShowDialog(true); }
  function openEdit(item: PaymentMode) { setEditItem(item); setForm({ code: item.code, name: item.name }); setShowDialog(true); }

  async function handleSave() {
    if (!form.code.trim() || !form.name.trim()) return;
    setSaving(true);
    try {
      const payload = { code: form.code.trim().toUpperCase(), name: form.name.trim() };
      if (editItem) {
        await onEdit(editItem.id, payload);
        toast.success("Updated successfully");
      } else {
        await onAdd(payload);
        toast.success("Added successfully");
      }
      setShowDialog(false);
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search payment modes..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button size="sm" className="gap-2 ml-3" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Payment Mode
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No payment modes found.</p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(item => (
            <div key={item.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors group">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{item.code}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editItem ? "Edit Payment Mode" : "Add Payment Mode"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Code (Unique)</Label>
              <Input placeholder="e.g. CARD" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="e.g. Credit / Debit Card" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.code.trim() || !form.name.trim()}>{editItem ? "Update" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Asset Subcategory Panel ───────────────────────────────────────────────────

interface SubcategoryPanelProps {
  categories: Simplemaster[];
  subcategories: AssetSubcategory[];
  allSubcategories: AssetSubcategory[];
  loading: boolean;
  onAdd: (name: string, catId: number | null) => Promise<void>;
  onEdit: (id: number, name: string, catId: number | null) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onCategoryFilter: (catId: number | undefined) => void;
}

function SubcategoryPanel({
  categories, subcategories, allSubcategories, loading,
  onAdd, onEdit, onDelete, onCategoryFilter,
}: SubcategoryPanelProps) {
  const [search, setSearch] = useState("");
  const [filterCatId, setFilterCatId] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<AssetSubcategory | null>(null);
  const [name, setName] = useState("");
  const [catId, setCatId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const filtered = subcategories.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  function getCategoryName(id: number | null) {
    if (!id) return "Uncategorized";
    return categories.find(c => c.id === id)?.name ?? "Unknown";
  }

  function openAdd() { setEditItem(null); setName(""); setCatId(""); setShowDialog(true); }
  function openEdit(item: AssetSubcategory) {
    setEditItem(item);
    setName(item.name);
    setCatId(item.category_id?.toString() ?? "");
    setShowDialog(true);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const categoryId = catId ? parseInt(catId) : null;
      if (editItem) {
        await onEdit(editItem.id, name.trim(), categoryId);
        toast.success("Updated successfully");
      } else {
        await onAdd(name.trim(), categoryId);
        toast.success("Added successfully");
      }
      setShowDialog(false);
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this subcategory?")) return;
    try { await onDelete(id); toast.success("Deleted"); }
    catch (err: any) { toast.error(err.message || "Delete failed"); }
  }

  function handleCatFilter(val: string) {
    setFilterCatId(val);
    onCategoryFilter(val === "all" ? undefined : parseInt(val));
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subcategories..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterCatId} onValueChange={handleCatFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="gap-2" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {search ? "No results found." : "No subcategories configured yet."}
        </p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{item.name}</span>
                <Badge variant="outline" className="text-xs font-normal">
                  {getCategoryName(item.category_id)}
                </Badge>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Subcategory Name</Label>
              <Input
                placeholder="Enter subcategory name..."
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Asset Category</Label>
              <Select value={catId} onValueChange={setCatId}>
                <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editItem ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Main MastersModule ────────────────────────────────────────────────────────

export function MastersModule({ role }: MastersModuleProps) {
  const [activeKey, setActiveKey] = useState("gender");

  // HR Masters state
  const [genders, setGenders] = useState<Simplemaster[]>([]);
  const [departments, setDepartments] = useState<Simplemaster[]>([]);
  const [designations, setDesignations] = useState<Simplemaster[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<Simplemaster[]>([]);
  const [workLocations, setWorkLocations] = useState<Simplemaster[]>([]);
  const [employeeStatuses, setEmployeeStatuses] = useState<Simplemaster[]>([]);

  // Asset Masters state
  const [assetCategories, setAssetCategories] = useState<Simplemaster[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<AssetSubcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<AssetSubcategory[]>([]);
  const [assetOwnershipTypes, setAssetOwnershipTypes] = useState<Simplemaster[]>([]);
  const [assetConditions, setAssetConditions] = useState<Simplemaster[]>([]);
  const [assetStatuses, setAssetStatuses] = useState<Simplemaster[]>([]);

  // Legacy state
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);
  const [facilities, setFacilities] = useState<FacilityMaster[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);

  // Loading per-master
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const setLoading = (key: string, val: boolean) =>
    setLoadingMap(prev => ({ ...prev, [key]: val }));

  const isLoading = (key: string) => !!loadingMap[key];

  // ── Loaders ──────────────────────────────────────────────────────────────────

  const loadMaster = useCallback(async (key: string) => {
    setLoading(key, true);
    try {
      switch (key) {
        case "gender":          setGenders(await fetchGenders()); break;
        case "department":      setDepartments(await fetchDepartments()); break;
        case "designation":     setDesignations(await fetchDesignations()); break;
        case "employment_type": setEmploymentTypes(await fetchEmploymentTypes()); break;
        case "work_location":   setWorkLocations(await fetchWorkLocations()); break;
        case "employee_status": setEmployeeStatuses(await fetchEmployeeStatuses()); break;
        case "asset_category":  setAssetCategories(await fetchAssetCategories()); break;
        case "asset_subcategory": {
          const subs = await fetchAssetSubcategories();
          setAllSubcategories(subs);
          setFilteredSubcategories(subs);
          break;
        }
        case "asset_ownership_type": setAssetOwnershipTypes(await fetchAssetOwnershipTypes()); break;
        case "asset_condition":      setAssetConditions(await fetchAssetConditions()); break;
        case "asset_status":         setAssetStatuses(await fetchAssetStatuses()); break;
        case "ticket_categories": setTicketCategories(await fetchTicketCategories()); break;
        case "facilities":        setFacilities(await fetchFacilityMasters()); break;
        case "payment_modes":     setPaymentModes(await fetchPaymentModes()); break;
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to load ${key}`);
    } finally {
      setLoading(key, false);
    }
  }, []);

  // Load on tab switch
  useEffect(() => {
    if (activeKey === "asset_subcategory" && assetCategories.length === 0) {
      loadMaster("asset_category");
    }
    loadMaster(activeKey);
  }, [activeKey]);

  // ── Render panel by key ───────────────────────────────────────────────────────

  function renderPanel(key: string) {
    switch (key) {
      // HR
      case "gender":
        return <SimpleMasterPanel title="Gender" items={genders} loading={isLoading("gender")} onAdd={async n => { await createGender(n); await loadMaster("gender"); }} onEdit={async (id, n) => { await updateGender(id, n); await loadMaster("gender"); }} onDelete={async id => { await deleteGender(id); await loadMaster("gender"); }} />;
      case "department":
        return <SimpleMasterPanel title="Department" items={departments} loading={isLoading("department")} onAdd={async n => { await createDepartment(n); await loadMaster("department"); }} onEdit={async (id, n) => { await updateDepartment(id, n); await loadMaster("department"); }} onDelete={async id => { await deleteDepartment(id); await loadMaster("department"); }} />;
      case "designation":
        return <SimpleMasterPanel title="Designation" items={designations} loading={isLoading("designation")} onAdd={async n => { await createDesignation(n); await loadMaster("designation"); }} onEdit={async (id, n) => { await updateDesignation(id, n); await loadMaster("designation"); }} onDelete={async id => { await deleteDesignation(id); await loadMaster("designation"); }} />;
      case "employment_type":
        return <SimpleMasterPanel title="Employment Type" items={employmentTypes} loading={isLoading("employment_type")} onAdd={async n => { await createEmploymentType(n); await loadMaster("employment_type"); }} onEdit={async (id, n) => { await updateEmploymentType(id, n); await loadMaster("employment_type"); }} onDelete={async id => { await deleteEmploymentType(id); await loadMaster("employment_type"); }} />;
      case "work_location":
        return <SimpleMasterPanel title="Work Location" items={workLocations} loading={isLoading("work_location")} onAdd={async n => { await createWorkLocation(n); await loadMaster("work_location"); }} onEdit={async (id, n) => { await updateWorkLocation(id, n); await loadMaster("work_location"); }} onDelete={async id => { await deleteWorkLocation(id); await loadMaster("work_location"); }} />;
      case "employee_status":
        return <SimpleMasterPanel title="Employee Status" items={employeeStatuses} loading={isLoading("employee_status")} onAdd={async n => { await createEmployeeStatus(n); await loadMaster("employee_status"); }} onEdit={async (id, n) => { await updateEmployeeStatus(id, n); await loadMaster("employee_status"); }} onDelete={async id => { await deleteEmployeeStatus(id); await loadMaster("employee_status"); }} />;

      // Asset
      case "asset_category":
        return <SimpleMasterPanel title="Asset Category" items={assetCategories} loading={isLoading("asset_category")} onAdd={async n => { await createAssetCategory(n); await loadMaster("asset_category"); }} onEdit={async (id, n) => { await updateAssetCategory(id, n); await loadMaster("asset_category"); }} onDelete={async id => { await deleteAssetCategory(id); await loadMaster("asset_category"); }} />;
      case "asset_subcategory":
        return (
          <SubcategoryPanel
            categories={assetCategories}
            subcategories={filteredSubcategories}
            allSubcategories={allSubcategories}
            loading={isLoading("asset_subcategory")}
            onAdd={async (n, cid) => { await createAssetSubcategory(n, cid); await loadMaster("asset_subcategory"); }}
            onEdit={async (id, n, cid) => { await updateAssetSubcategory(id, n, cid); await loadMaster("asset_subcategory"); }}
            onDelete={async id => { await deleteAssetSubcategory(id); await loadMaster("asset_subcategory"); }}
            onCategoryFilter={catId => {
              setFilteredSubcategories(catId ? allSubcategories.filter(s => s.category_id === catId) : allSubcategories);
            }}
          />
        );
      case "asset_ownership_type":
        return <SimpleMasterPanel title="Ownership Type" items={assetOwnershipTypes} loading={isLoading("asset_ownership_type")} onAdd={async n => { await createAssetOwnershipType(n); await loadMaster("asset_ownership_type"); }} onEdit={async (id, n) => { await updateAssetOwnershipType(id, n); await loadMaster("asset_ownership_type"); }} onDelete={async id => { await deleteAssetOwnershipType(id); await loadMaster("asset_ownership_type"); }} />;
      case "asset_condition":
        return <SimpleMasterPanel title="Asset Condition" items={assetConditions} loading={isLoading("asset_condition")} onAdd={async n => { await createAssetCondition(n); await loadMaster("asset_condition"); }} onEdit={async (id, n) => { await updateAssetCondition(id, n); await loadMaster("asset_condition"); }} onDelete={async id => { await deleteAssetCondition(id); await loadMaster("asset_condition"); }} />;
      case "asset_status":
        return <SimpleMasterPanel title="Asset Status" items={assetStatuses} loading={isLoading("asset_status")} onAdd={async n => { await createAssetStatus(n); await loadMaster("asset_status"); }} onEdit={async (id, n) => { await updateAssetStatus(id, n); await loadMaster("asset_status"); }} onDelete={async id => { await deleteAssetStatus(id); await loadMaster("asset_status"); }} />;

      // System / Legacy
      case "ticket_categories":
        return (
          <TicketCategoryPanel
            items={ticketCategories}
            loading={isLoading("ticket_categories")}
            onAdd={async data => { await createTicketCategory(data); await loadMaster("ticket_categories"); }}
            onEdit={async (id, data) => { await updateTicketCategory(id, data); await loadMaster("ticket_categories"); }}
            onDelete={async id => { await deleteTicketCategory(id); await loadMaster("ticket_categories"); }}
          />
        );
      case "facilities":
        return (
          <FacilityPanel
            items={facilities}
            loading={isLoading("facilities")}
            onAdd={async data => { await createFacilityMaster(data); await loadMaster("facilities"); }}
            onEdit={async (id, data) => { await updateFacilityMaster(id, data); await loadMaster("facilities"); }}
            onDelete={async id => { await deleteFacilityMaster(id); await loadMaster("facilities"); }}
          />
        );
      case "payment_modes":
        return (
          <PaymentModePanel
            items={paymentModes}
            loading={isLoading("payment_modes")}
            onAdd={async data => { await createPaymentMode(data); await loadMaster("payment_modes"); }}
            onEdit={async (id, data) => { await updatePaymentMode(id, data); await loadMaster("payment_modes"); }}
            onDelete={async id => { await deletePaymentMode(id); await loadMaster("payment_modes"); }}
          />
        );

      default:
        return <p className="text-sm text-muted-foreground">Panel coming soon.</p>;
    }
  }

  // ── Find active group/label ───────────────────────────────────────────────────

  const activeLabel = NAV_GROUPS.flatMap(g => g.items).find(i => i.key === activeKey)?.label ?? "";
  const activeGroup = NAV_GROUPS.find(g => g.items.some(i => i.key === activeKey));
  const groupItemCount = (key: string) => {
    switch (key) {
      case "gender":          return genders.length;
      case "department":      return departments.length;
      case "designation":     return designations.length;
      case "employment_type": return employmentTypes.length;
      case "work_location":   return workLocations.length;
      case "employee_status": return employeeStatuses.length;
      case "asset_category":  return assetCategories.length;
      case "asset_subcategory": return allSubcategories.length;
      case "asset_ownership_type": return assetOwnershipTypes.length;
      case "asset_condition": return assetConditions.length;
      case "asset_status":    return assetStatuses.length;
      case "ticket_categories": return ticketCategories.length;
      case "facilities":      return facilities.length;
      case "payment_modes":   return paymentModes.length;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Masters & Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage system reference data — HR, Asset, System, and more.
        </p>
      </div>

      <div className="flex gap-6 min-h-[600px]">
        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside className="w-60 shrink-0">
          <ScrollArea className="h-full">
            <div className="space-y-5 pr-1">
              {NAV_GROUPS.map(group => {
                const Icon = group.icon;
                return (
                  <div key={group.label}>
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-md mb-1 ${group.bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${group.color}`} />
                      <span className={`text-xs font-semibold uppercase tracking-wider ${group.color}`}>
                        {group.label}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map(item => {
                        const isActive = item.key === activeKey;
                        const count = groupItemCount(item.key);
                        return (
                          <button
                            key={item.key}
                            onClick={() => setActiveKey(item.key)}
                            className={`
                              w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all
                              ${isActive
                                ? "bg-primary text-primary-foreground font-medium shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                              }
                            `}
                          >
                            <span className="flex items-center gap-2">
                              {isActive && <ChevronRight className="h-3 w-3 shrink-0" />}
                              {item.label}
                            </span>
                            {count > 0 && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        {/* ── Content Panel ──────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-3">
                {activeGroup && (
                  <div className={`p-1.5 rounded-md ${activeGroup.bg}`}>
                    <activeGroup.icon className={`h-4 w-4 ${activeGroup.color}`} />
                  </div>
                )}
                <div>
                  <CardTitle className="text-base">{activeLabel}</CardTitle>
                  {activeGroup && (
                    <p className="text-xs text-muted-foreground">{activeGroup.label}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ScrollArea className="h-[500px] pr-2">
                {renderPanel(activeKey)}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
