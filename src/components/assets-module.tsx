import { useEffect, useState, useCallback, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Plus, Package, CheckCircle2, AlertTriangle, Trash2, Printer, ArrowRightLeft, FileDown, FileUp, Building2, Eye, Pencil, Sparkles, User, DollarSign, Calendar, ShieldCheck, Tag
} from "lucide-react";
import { fetchAssets, createAsset, updateAsset, fetchProperties, fetchUnits, createProperty, updateProperty, createUnit, updateUnit, type Asset, type Property, type Unit, supabase } from "@/lib/supabase";
import {
  fetchAssetCategories, fetchAssetSubcategories, fetchAssetOwnershipTypes,
  fetchAssetConditions, fetchAssetStatuses, fetchDepartments,
  type AssetCategory, type AssetSubcategory, type Simplemaster
} from "@/lib/supabase-masters";
import { useFinanceStore } from "@/lib/finance/finance-store";
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';

export function AssetManager({ role }: { role: "admin" | "prop-mgr" }) {
  const { addJournalEntry } = useFinanceStore();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [departments, setDepartments] = useState<Simplemaster[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  // Dynamic Masters
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [subcategories, setSubcategories] = useState<AssetSubcategory[]>([]);
  const [ownershipTypes, setOwnershipTypes] = useState<Simplemaster[]>([]);
  const [conditions, setConditions] = useState<Simplemaster[]>([]);
  const [statuses, setStatuses] = useState<Simplemaster[]>([]);

  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [activeFormStep, setActiveFormStep] = useState<"general" | "financial" | "assignment" | "service">("general");

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [printBarcode, setPrintBarcode] = useState<string | null>(null);
  const [transferAsset, setTransferAsset] = useState<Asset | null>(null);
  const [transferForm, setTransferForm] = useState({ assigned_property_id: "", assigned_employee_id: "" });

  const initialFormState = {
    // 1. Core Info
    asset_name: "",
    category: "Furniture",
    subcategory: "",
    brand: "",
    model: "",
    serial_number: "",
    ownership_type: "Owned",
    asset_code: "",
    autoBarcode: true,

    // 2. Financial & Depreciation
    purchase_date: new Date().toISOString().split("T")[0],
    supplier: "",
    purchase_cost: "",
    opening_cost: "",
    addition_during_year: "",
    total_asset_value: "",
    disposal_value: "",
    depreciation_method: "Straight Line (SLM)",
    depreciation_rate: "20",
    opening_accumulated_depreciation: "",
    current_year_depreciation: "",
    closing_accumulated_depreciation: "",
    net_book_value: "",
    life_of_asset: "5",

    // 3. Assignment & Location
    assigned_property_id: "",
    assigned_unit_id: "",
    assigned_employee_id: "",
    assigned_employee_name: "",
    assignment_date: "",
    department: "",

    // 4. Status, Warranty & Service
    asset_condition: "Good",
    asset_status: "Available",
    warranty_expiry_date: "",
    warranty_status: "Valid",
    last_service_date: "",
    next_service_date: "",
    return_date: "",
    disposal_date: "",
    remarks: "",
  };

  const [form, setForm] = useState(initialFormState);

  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [propertyDialogMode, setPropertyDialogMode] = useState<"create" | "edit">("create");
  const [propertyForm, setPropertyForm] = useState({ 
    title: "", 
    address: "", 
    city: "", 
    country: "Qatar", 
    property_type: "apartment", 
    max_guests: "1", 
    bedrooms: "1", 
    beds: "1", 
    bathrooms: "1", 
    base_price_per_night: "0", 
    cleaning_fee: "0", 
    no_of_units: "",
    amenities: [""],
    other_amenities: ""
  });
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [unitDialogMode, setUnitDialogMode] = useState<"create" | "edit">("create");
  const [unitForm, setUnitForm] = useState({ property_id: "", unit_ref: "", room_type: "Flat", status: "Available", price: "0" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [
        data, propertiesData, unitsData,
        catsData, subcatsData, ownerData, condData, statsData, deptsData, empsRes
      ] = await Promise.all([
        fetchAssets(),
        fetchProperties(),
        fetchUnits(),
        fetchAssetCategories().catch(() => []),
        fetchAssetSubcategories().catch(() => []),
        fetchAssetOwnershipTypes().catch(() => []),
        fetchAssetConditions().catch(() => []),
        fetchAssetStatuses().catch(() => []),
        fetchDepartments().catch(() => []),
        supabase.from('employees').select('id, first_name, last_name, employee_code, department_id').order('first_name')
      ]);

      setAssets(data || []);
      setProperties(propertiesData || []);
      setUnits(unitsData || []);
      setCategories(catsData || []);
      setSubcategories(subcatsData || []);
      setOwnershipTypes(ownerData || []);
      setConditions(condData || []);
      setStatuses(statsData || []);
      setDepartments(deptsData || []);
      setEmployees(empsRes.data || []);
    } catch (e: any) { 
      console.error(e.message); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter subcategories by current category selection
  const currentCategoryObj = useMemo(() => {
    return categories.find(c => c.name.toLowerCase() === (form.category || "").toLowerCase());
  }, [categories, form.category]);

  const filteredSubcategories = useMemo(() => {
    if (!currentCategoryObj) return subcategories;
    const matched = subcategories.filter(s => s.category_id === currentCategoryObj.id);
    return matched.length > 0 ? matched : subcategories;
  }, [subcategories, currentCategoryObj]);

  // Recalculate financial fields automatically when relevant values change
  const handleCostChange = (val: string, overrides?: { method?: string; rate?: string; life?: string; openDep?: string }) => {
    const cost = Number(val !== undefined ? val : form.purchase_cost) || 0;
    const addYr = Number(form.addition_during_year) || 0;
    const totalVal = cost + addYr;
    const method = overrides?.method !== undefined ? overrides.method : form.depreciation_method;
    const rate = Number(overrides?.rate !== undefined ? overrides.rate : form.depreciation_rate) || 0;
    const lifeYears = Number(overrides?.life !== undefined ? overrides.life : form.life_of_asset) || 0;
    const openDep = Number(overrides?.openDep !== undefined ? overrides.openDep : form.opening_accumulated_depreciation) || 0;

    let computedCurDep = 0;
    if (method === "Straight Line (SLM)") {
      if (rate > 0) {
        computedCurDep = Math.round((totalVal * (rate / 100)) * 100) / 100;
      } else if (lifeYears > 0) {
        computedCurDep = Math.round((totalVal / lifeYears) * 100) / 100;
      }
    } else if (method === "Written Down Value (WDV)") {
      const openingBookValue = Math.max(0, totalVal - openDep);
      if (rate > 0) {
        computedCurDep = Math.round((openingBookValue * (rate / 100)) * 100) / 100;
      } else if (lifeYears > 0) {
        const impliedRate = Math.min(100, Math.round((100 / lifeYears) * 1.5 * 100) / 100);
        computedCurDep = Math.round((openingBookValue * (impliedRate / 100)) * 100) / 100;
      }
    }

    const closeDep = openDep + computedCurDep;
    const nbv = Math.max(0, totalVal - closeDep);

    setForm(f => ({
      ...f,
      purchase_cost: val !== undefined ? val : f.purchase_cost,
      opening_cost: f.opening_cost ? f.opening_cost : (val !== undefined ? val : f.purchase_cost),
      total_asset_value: String(totalVal),
      current_year_depreciation: computedCurDep > 0 ? String(computedCurDep) : f.current_year_depreciation,
      closing_accumulated_depreciation: String(closeDep),
      net_book_value: String(nbv),
      ...(overrides?.method !== undefined ? { depreciation_method: overrides.method } : {}),
      ...(overrides?.rate !== undefined ? { depreciation_rate: overrides.rate } : {}),
      ...(overrides?.life !== undefined ? { life_of_asset: overrides.life } : {}),
      ...(overrides?.openDep !== undefined ? { opening_accumulated_depreciation: overrides.openDep } : {}),
    }));
  };

  async function handleSaveAsset(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let finalBarcode = form.asset_code;
      if (form.autoBarcode || !finalBarcode) {
        const catPrefix = (form.category || "AST").substring(0, 3).toUpperCase();
        const namePrefix = (form.asset_name || "ITM").substring(0, 3).toUpperCase();
        finalBarcode = `${catPrefix}-${namePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const cost = Number(form.purchase_cost) || 0;
      const selectedProp = properties.find(p => p.id === form.assigned_property_id);
      const selectedUnit = units.find(u => u.id === form.assigned_unit_id);
      const selectedEmp = employees.find(emp => emp.id === form.assigned_employee_id);

      const payload: Partial<Asset> = {
        asset_name: form.asset_name,
        category: form.category,
        subcategory: form.subcategory || undefined,
        brand: form.brand || undefined,
        model: form.model || undefined,
        serial_number: form.serial_number || undefined,
        ownership_type: form.ownership_type || "Owned",
        asset_code: finalBarcode,
        
        purchase_date: form.purchase_date || new Date().toISOString().split("T")[0],
        supplier: form.supplier || undefined,
        purchase_cost: cost,
        opening_cost: Number(form.opening_cost || form.purchase_cost) || 0,
        addition_during_year: Number(form.addition_during_year) || 0,
        total_asset_value: Number(form.total_asset_value || form.purchase_cost) || cost,
        disposal_value: Number(form.disposal_value) || 0,
        depreciation_method: form.depreciation_method || "Straight Line (SLM)",
        depreciation_rate: Number(form.depreciation_rate) || 0,
        opening_accumulated_depreciation: Number(form.opening_accumulated_depreciation) || 0,
        current_year_depreciation: Number(form.current_year_depreciation) || 0,
        closing_accumulated_depreciation: Number(form.closing_accumulated_depreciation) || 0,
        net_book_value: Number(form.net_book_value || form.purchase_cost) || cost,
        life_of_asset: Number(form.life_of_asset) || 5,

        assigned_property_id: form.assigned_property_id || undefined,
        assigned_property_code: selectedProp?.property_code || selectedProp?.title || undefined,
        assigned_unit_id: form.assigned_unit_id || undefined,
        assigned_unit_code: selectedUnit?.unit_code || selectedUnit?.unit_ref || undefined,
        assigned_employee_id: form.assigned_employee_id || undefined,
        assigned_employee_name: selectedEmp ? `${selectedEmp.first_name} ${selectedEmp.last_name}` : (form.assigned_employee_name || undefined),
        assignment_date: form.assignment_date || (form.assigned_property_id || form.assigned_employee_id ? new Date().toISOString().split("T")[0] : undefined),
        department_id: form.department || undefined,

        asset_condition: form.asset_condition || "Good",
        asset_status: form.assigned_property_id || form.assigned_employee_id ? "Assigned" : (form.asset_status || "Available"),
        warranty_expiry_date: form.warranty_expiry_date || undefined,
        warranty_status: form.warranty_status || "Valid",
        last_service_date: form.last_service_date || undefined,
        next_service_date: form.next_service_date || undefined,
        return_date: form.return_date || undefined,
        disposal_date: form.disposal_date || undefined,
        remarks: form.remarks || undefined,
      };

      if (editingAsset) {
        await updateAsset(editingAsset.id, payload);
      } else {
        await createAsset(payload);

        // Auto GL entry for acquisition if cost > 0
        if (cost > 0) {
          addJournalEntry({
            je_no: `JE-AST-CAP-${Date.now().toString().slice(-4)}`,
            posting_date: form.purchase_date || new Date().toISOString().split("T")[0],
            reference: `CAP-${finalBarcode}`,
            narration: `Asset Capitalization: ${form.asset_name} (${form.category} / ${form.subcategory || 'General'}) for ${selectedProp?.title || 'General Master'} ${selectedUnit ? `(Unit: ${selectedUnit.unit_ref})` : ''}`,
            dr_account: "Fixed Assets & Equipment (15000)",
            dr_code: "15000",
            cr_account: "Bank Operating Account (12000)",
            cr_code: "12000",
            amount: cost,
          });
        }
      }

      setShowNew(false);
      setEditingAsset(null);
      setForm(initialFormState);
      await load();
    } catch (e: any) { 
      console.error(e.message);
      alert(`Failed to save asset: ${e.message}`);
    } finally { 
      setSaving(false); 
    }
  }

  const openEditAssetModal = (asset: Asset) => {
    setEditingAsset(asset);
    setForm({
      asset_name: asset.asset_name || "",
      category: asset.category || "Furniture",
      subcategory: asset.subcategory || "",
      brand: asset.brand || "",
      model: asset.model || "",
      serial_number: asset.serial_number || "",
      ownership_type: asset.ownership_type || "Owned",
      asset_code: asset.asset_code || "",
      autoBarcode: false,

      purchase_date: asset.purchase_date || "",
      supplier: asset.supplier || "",
      purchase_cost: asset.purchase_cost != null ? String(asset.purchase_cost) : "",
      opening_cost: asset.opening_cost != null ? String(asset.opening_cost) : "",
      addition_during_year: asset.addition_during_year != null ? String(asset.addition_during_year) : "",
      total_asset_value: asset.total_asset_value != null ? String(asset.total_asset_value) : "",
      disposal_value: asset.disposal_value != null ? String(asset.disposal_value) : "",
      depreciation_method: asset.depreciation_method || "Straight Line (SLM)",
      depreciation_rate: asset.depreciation_rate != null ? String(asset.depreciation_rate) : "20",
      opening_accumulated_depreciation: asset.opening_accumulated_depreciation != null ? String(asset.opening_accumulated_depreciation) : "",
      current_year_depreciation: asset.current_year_depreciation != null ? String(asset.current_year_depreciation) : "",
      closing_accumulated_depreciation: asset.closing_accumulated_depreciation != null ? String(asset.closing_accumulated_depreciation) : "",
      net_book_value: asset.net_book_value != null ? String(asset.net_book_value) : "",
      life_of_asset: asset.life_of_asset != null ? String(asset.life_of_asset) : "5",

      assigned_property_id: asset.assigned_property_id || "",
      assigned_unit_id: asset.assigned_unit_id || "",
      assigned_employee_id: asset.assigned_employee_id || "",
      assigned_employee_name: asset.assigned_employee_name || "",
      assignment_date: asset.assignment_date || "",
      department: asset.department_id || "",

      asset_condition: asset.asset_condition || "Good",
      asset_status: asset.asset_status || "Available",
      warranty_expiry_date: asset.warranty_expiry_date || "",
      warranty_status: asset.warranty_status || "Valid",
      last_service_date: asset.last_service_date || "",
      next_service_date: asset.next_service_date || "",
      return_date: asset.return_date || "",
      disposal_date: asset.disposal_date || "",
      remarks: asset.remarks || "",
    });
    setActiveFormStep("general");
    setShowNew(true);
  };

  async function handleStatusChange(id: string, status: string) {
    await updateAsset(id, { asset_status: status });
    await load();
  }

  const handleExport = () => alert("Export functionality would generate a CSV of assets with all 34 fields.");
  const handleImport = () => alert("Import functionality would open a dialog to upload an Excel file and sync data.");

  const filtered = activeTab === "all" ? assets : assets.filter(a => a.asset_status?.toLowerCase() === activeTab);
  const selectedPropertyUnits = form.assigned_property_id ? units.filter(u => u.property_id === form.assigned_property_id) : [];

  async function saveProperty() {
    if (!propertyForm.title.trim()) return alert("Property title is required.");
    const validAmenities = (propertyForm.amenities || []).map(a => a.trim()).filter(Boolean);
    const otherAmenitiesList = propertyForm.other_amenities ? propertyForm.other_amenities.split(',').map(s => s.trim()).filter(Boolean) : [];
    const totalAmenities = [...validAmenities, ...otherAmenitiesList];

    if (totalAmenities.length === 0) {
      return alert("At least one Amenity / Facility is mandatory for the property.");
    }

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
          amenities: totalAmenities,
          municipality_details: {
            facility_amenities: validAmenities,
            other_amenities_facilities: propertyForm.other_amenities || undefined,
          },
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
          amenities: totalAmenities,
          municipality_details: {
            facility_amenities: validAmenities,
            other_amenities_facilities: propertyForm.other_amenities || undefined,
          },
        } as any);
        setProperties((items) => [saved, ...items]);
      }
      setForm((f) => ({ ...f, assigned_property_id: saved.id, assigned_unit_id: "" }));
      setPropertyDialogOpen(false);
      setPropertyForm({ 
        title: "", 
        address: "", 
        city: "", 
        country: "Qatar", 
        property_type: "apartment", 
        max_guests: "1", 
        bedrooms: "1", 
        beds: "1", 
        bathrooms: "1", 
        base_price_per_night: "0", 
        cleaning_fee: "0", 
        no_of_units: "",
        amenities: [""],
        other_amenities: ""
      });
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

  const searched = searchQuery ? filtered.filter(a => 
    a.asset_code?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.asset_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.subcategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.serial_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.assigned_property_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.assigned_unit_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.assigned_employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.properties?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : filtered;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assets & Inventory</h2>
          <p className="text-muted-foreground mt-1">Manage fixed assets, subcategories, valuations, depreciations, and assignments.</p>
        </div>
        <div className="flex gap-2">
          {role === 'admin' && (
             <>
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <FileDown className="h-4 w-4" /> Export
              </Button>
              <Button variant="outline" onClick={handleImport} className="gap-2">
                <FileUp className="h-4 w-4" /> Import
              </Button>
            </>
          )}
          <Button onClick={() => {
            setEditingAsset(null);
            setForm(initialFormState);
            setActiveFormStep("general");
            setShowNew(true);
          }} className="gap-2">
            <Plus className="h-4 w-4" /> Add Asset
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{assets.length}</div>
            <p className="text-xs text-muted-foreground">Tracked in system</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{assets.filter(a => a.asset_status === 'Available').length}</div>
            <p className="text-xs text-muted-foreground">Ready for assignment</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{assets.filter(a => a.asset_status === 'Assigned' || a.assigned_property_id || a.assigned_employee_id).length}</div>
            <p className="text-xs text-muted-foreground">In active deployment</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Maintenance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{assets.filter(a => a.asset_status === 'Maintenance' || a.asset_status === 'Under Maintenance').length}</div>
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
                placeholder="Search by code, name, category, subcategory, property..."
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
                      <th className="h-12 px-4 font-medium">Asset ID & Name</th>
                      <th className="h-12 px-4 font-medium">Category & Subcategory</th>
                      <th className="h-12 px-4 font-medium">Brand / Model</th>
                      <th className="h-12 px-4 font-medium">Property / Unit / Custodian</th>
                      <th className="h-12 px-4 font-medium">Purchase Value (QAR)</th>
                      <th className="h-12 px-4 font-medium">Status</th>
                      <th className="h-12 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searched.map((asset) => (
                      <tr key={asset.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-foreground hover:underline cursor-pointer" onClick={() => setViewingAsset(asset)}>
                            {asset.asset_name}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1 cursor-pointer hover:text-primary" onClick={() => setPrintBarcode(asset.asset_code || "")}>
                            <Tag className="h-3 w-3" /> {asset.asset_code || "N/A"} <Printer className="h-3 w-3 ml-1" />
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="font-medium bg-primary/5 text-primary border-primary/20">
                            {asset.category || 'General'}
                          </Badge>
                          {asset.subcategory && (
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <span>↳</span> {asset.subcategory}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium">{asset.brand || '—'}</div>
                          {asset.model && <div className="text-xs text-muted-foreground">{asset.model}</div>}
                          {asset.serial_number && <div className="text-[11px] text-muted-foreground font-mono">S/N: {asset.serial_number}</div>}
                        </td>
                        <td className="p-4">
                          {asset.properties?.title || asset.assigned_property_code ? (
                            <div>
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <Building2 className="h-3.5 w-3.5 text-primary"/>
                                {asset.assigned_property_code || asset.properties?.title}
                              </div>
                              {(asset.assigned_unit_code || asset.units?.unit_code) && (
                                <div className="text-xs text-muted-foreground ml-4">
                                  Unit: <span className="font-semibold text-foreground">{asset.assigned_unit_code || asset.units?.unit_code}</span>
                                </div>
                              )}
                            </div>
                          ) : asset.employees?.first_name || asset.assigned_employee_name ? (
                            <div className="text-sm flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              {asset.assigned_employee_name || `${asset.employees?.first_name} ${asset.employees?.last_name}`}
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">Unassigned</span>
                          )}
                        </td>
                        <td className="p-4 font-medium">
                          QAR {asset.purchase_cost != null ? Number(asset.purchase_cost).toLocaleString() : '0'}
                          {asset.net_book_value != null && (
                            <div className="text-[11px] text-muted-foreground">
                              NBV: QAR {Number(asset.net_book_value).toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <Select
                            value={(asset.asset_status || "Available").toLowerCase()}
                            onValueChange={(val) => handleStatusChange(asset.id, val.charAt(0).toUpperCase() + val.slice(1))}
                          >
                            <SelectTrigger className="h-8 w-[130px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="assigned">Assigned</SelectItem>
                              <SelectItem value="in use">In Use</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="under maintenance">Under Maintenance</SelectItem>
                              <SelectItem value="damaged">Damaged</SelectItem>
                              <SelectItem value="disposed">Disposed</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" title="View Asset Details" onClick={() => setViewingAsset(asset)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Transfer Asset" onClick={() => setTransferAsset(asset)}>
                              <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Edit Asset" onClick={() => openEditAssetModal(asset)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* Complete Asset Creation / Edit Dialog supporting all 34 Excel fields */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveAsset}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Package className="h-5 w-5 text-primary" />
                {editingAsset ? `Edit Asset: ${editingAsset.asset_name}` : "Register New Fixed Asset"}
              </DialogTitle>
              <DialogDescription>
                Fill out the comprehensive asset record with categorization, valuation, depreciation, and assignment details.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeFormStep} onValueChange={(v: any) => setActiveFormStep(v)} className="w-full mt-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="general">1. Core & Brand</TabsTrigger>
                <TabsTrigger value="financial">2. Valuation & GL</TabsTrigger>
                <TabsTrigger value="assignment">3. Assignment & Loc</TabsTrigger>
                <TabsTrigger value="service">4. Service & Status</TabsTrigger>
              </TabsList>

              {/* STEP 1: Core & Classification */}
              <TabsContent value="general" className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="asset_name">Asset Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="asset_name"
                      required
                      placeholder="e.g. Split AC 2.0 Ton, Executive Chair, Dell Latitude"
                      value={form.asset_name}
                      onChange={e => setForm(f => ({ ...f, asset_name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="barcode">Asset ID / Barcode <span className="text-destructive">*</span></Label>
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.autoBarcode}
                          onChange={e => setForm(f => ({ ...f, autoBarcode: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        Auto-generate
                      </label>
                    </div>
                    <Input
                      id="barcode"
                      disabled={form.autoBarcode}
                      placeholder={form.autoBarcode ? "Auto-generated upon save" : "e.g. AST-00104"}
                      value={form.asset_code}
                      onChange={e => setForm(f => ({ ...f, asset_code: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Asset Category <span className="text-destructive">*</span></Label>
                    <Select
                      value={form.category}
                      onValueChange={v => {
                        setForm(f => ({ ...f, category: v, subcategory: "" }));
                      }}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length > 0 ? (
                          categories.map(c => (
                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                          ))
                        ) : (
                          ["Furniture", "IT Equipment", "Electrical", "Plumbing", "Appliances", "Vehicles", "HVAC", "Other"].map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Asset Subcategory</Label>
                    {filteredSubcategories.length > 0 ? (
                      <div className="flex gap-2">
                        <Select
                          value={form.subcategory}
                          onValueChange={v => setForm(f => ({ ...f, subcategory: v }))}
                        >
                          <SelectTrigger id="subcategory" className="flex-1">
                            <SelectValue placeholder="Select Subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredSubcategories.map(s => (
                              <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Or type custom"
                          value={form.subcategory}
                          onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                          className="w-1/3"
                        />
                      </div>
                    ) : (
                      <Input
                        id="subcategory"
                        placeholder="e.g. Split AC, Laptop, Sofa Set, Microwave"
                        value={form.subcategory}
                        onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand / Manufacturer</Label>
                    <Input
                      id="brand"
                      placeholder="e.g. Daikin, Dell, Herman Miller, Samsung"
                      value={form.brand}
                      onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model Number / Spec</Label>
                    <Input
                      id="model"
                      placeholder="e.g. FTKF50TV, XPS 15 9520, Series 7"
                      value={form.model}
                      onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serial_number">Serial / IMEI / Tag No.</Label>
                    <Input
                      id="serial_number"
                      placeholder="e.g. SN-9874523-QAT"
                      value={form.serial_number}
                      onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownership_type">Ownership Type</Label>
                    <Select
                      value={form.ownership_type}
                      onValueChange={v => setForm(f => ({ ...f, ownership_type: v }))}
                    >
                      <SelectTrigger id="ownership_type">
                        <SelectValue placeholder="Select Ownership Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ownershipTypes.length > 0 ? (
                          ownershipTypes.map(o => (
                            <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>
                          ))
                        ) : (
                          ["Owned", "Leased", "Customer Provided", "Landlord Provided"].map(o => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* STEP 2: Financial, Valuation & GL */}
              <TabsContent value="financial" className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchase_cost">Purchase Cost (QAR) <span className="text-destructive">*</span></Label>
                    <Input
                      id="purchase_cost"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={form.purchase_cost}
                      onChange={e => handleCostChange(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchase_date">Purchase / Capitalization Date</Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      value={form.purchase_date}
                      onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier / Vendor</Label>
                    <Input
                      id="supplier"
                      placeholder="e.g. Al Mannai Trading, Jarir Bookstore"
                      value={form.supplier}
                      onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="opening_cost">Opening Cost (QAR)</Label>
                    <Input
                      id="opening_cost"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.opening_cost}
                      onChange={e => setForm(f => ({ ...f, opening_cost: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addition_during_year">Addition During Year (QAR)</Label>
                    <Input
                      id="addition_during_year"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.addition_during_year}
                      onChange={e => {
                        const addVal = e.target.value;
                        const total = (Number(form.purchase_cost) || 0) + (Number(addVal) || 0);
                        const closeDep = (Number(form.opening_accumulated_depreciation) || 0) + (Number(form.current_year_depreciation) || 0);
                        setForm(f => ({
                          ...f,
                          addition_during_year: addVal,
                          total_asset_value: String(total),
                          net_book_value: String(Math.max(0, total - closeDep)),
                        }));
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_asset_value">Total Asset Value (QAR)</Label>
                    <Input
                      id="total_asset_value"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.total_asset_value}
                      onChange={e => setForm(f => ({ ...f, total_asset_value: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depreciation_method">Depreciation Method</Label>
                    <Select
                      value={form.depreciation_method}
                      onValueChange={v => handleCostChange(form.purchase_cost, { method: v })}
                    >
                      <SelectTrigger id="depreciation_method">
                        <SelectValue placeholder="Select Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Straight Line (SLM)">Straight Line (SLM)</SelectItem>
                        <SelectItem value="Written Down Value (WDV)">Written Down Value (WDV)</SelectItem>
                        <SelectItem value="None">None / No Depreciation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depreciation_rate">Depreciation Rate (% / Annum)</Label>
                    <Input
                      id="depreciation_rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="e.g. 20"
                      value={form.depreciation_rate}
                      onChange={e => handleCostChange(form.purchase_cost, { rate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="life_of_asset">Life of Asset (Years)</Label>
                    <Input
                      id="life_of_asset"
                      type="number"
                      min="1"
                      placeholder="e.g. 5 or 10"
                      value={form.life_of_asset}
                      onChange={e => handleCostChange(form.purchase_cost, { life: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="opening_accumulated_depreciation">Opening Acc. Depreciation (QAR)</Label>
                    <Input
                      id="opening_accumulated_depreciation"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.opening_accumulated_depreciation}
                      onChange={e => {
                        const val = e.target.value;
                        const close = (Number(val) || 0) + (Number(form.current_year_depreciation) || 0);
                        const totalVal = Number(form.total_asset_value || form.purchase_cost) || 0;
                        setForm(f => ({
                          ...f,
                          opening_accumulated_depreciation: val,
                          closing_accumulated_depreciation: String(close),
                          net_book_value: String(Math.max(0, totalVal - close)),
                        }));
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current_year_depreciation">Current Year Depreciation (QAR)</Label>
                    <Input
                      id="current_year_depreciation"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.current_year_depreciation}
                      onChange={e => {
                        const val = e.target.value;
                        const close = (Number(form.opening_accumulated_depreciation) || 0) + (Number(val) || 0);
                        const totalVal = Number(form.total_asset_value || form.purchase_cost) || 0;
                        setForm(f => ({
                          ...f,
                          current_year_depreciation: val,
                          closing_accumulated_depreciation: String(close),
                          net_book_value: String(Math.max(0, totalVal - close)),
                        }));
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="closing_accumulated_depreciation">Closing Acc. Depreciation (QAR)</Label>
                    <Input
                      id="closing_accumulated_depreciation"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.closing_accumulated_depreciation}
                      onChange={e => setForm(f => ({ ...f, closing_accumulated_depreciation: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="net_book_value">Net Book Value (QAR)</Label>
                    <Input
                      id="net_book_value"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="font-bold text-primary"
                      value={form.net_book_value}
                      onChange={e => setForm(f => ({ ...f, net_book_value: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="disposal_value">Disposal Value (QAR)</Label>
                    <Input
                      id="disposal_value"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.disposal_value}
                      onChange={e => setForm(f => ({ ...f, disposal_value: e.target.value }))}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* STEP 3: Assignment & Location */}
              <TabsContent value="assignment" className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assigned_property">Assigned Property</Label>
                    <Select
                      value={form.assigned_property_id}
                      onValueChange={value => setForm(f => ({ ...f, assigned_property_id: value, assigned_unit_id: "" }))}
                    >
                      <SelectTrigger id="assigned_property">
                        <SelectValue placeholder="Select property (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">— General / Unassigned Pool —</SelectItem>
                        {properties.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        setPropertyDialogMode("create");
                        setPropertyForm({ title: "", address: "", city: "", country: "Qatar", property_type: "apartment", max_guests: "1", bedrooms: "1", beds: "1", bathrooms: "1", base_price_per_night: "0", cleaning_fee: "0", no_of_units: "1" });
                        setPropertyDialogOpen(true);
                      }}>Add Property</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assigned_unit">Assigned Unit</Label>
                    <Select
                      value={form.assigned_unit_id}
                      onValueChange={value => setForm(f => ({ ...f, assigned_unit_id: value }))}
                      disabled={!form.assigned_property_id || form.assigned_property_id === "unassigned"}
                    >
                      <SelectTrigger id="assigned_unit">
                        <SelectValue placeholder={form.assigned_property_id ? "Select unit (optional)" : "Select property first"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">— Entire Property / Building Unit —</SelectItem>
                        {selectedPropertyUnits.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.unit_ref || `Unit ${u.id}`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" disabled={!form.assigned_property_id || form.assigned_property_id === "unassigned"} onClick={() => {
                        setUnitDialogMode("create");
                        setUnitForm({ property_id: form.assigned_property_id, unit_ref: "", room_type: "Flat", status: "Available", price: "0" });
                        setUnitDialogOpen(true);
                      }}>Add Unit</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assigned_employee">Assigned Custodian / Employee</Label>
                    <Select
                      value={form.assigned_employee_id}
                      onValueChange={value => {
                        const emp = employees.find(e => e.id === value);
                        setForm(f => ({
                          ...f,
                          assigned_employee_id: value === "unassigned" ? "" : value,
                          assigned_employee_name: emp ? `${emp.first_name} ${emp.last_name}` : "",
                          department: emp?.department_id || f.department
                        }));
                      }}
                    >
                      <SelectTrigger id="assigned_employee">
                        <SelectValue placeholder="Select Employee Custodian (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">— No Employee Assigned —</SelectItem>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name} {emp.employee_code ? `(${emp.employee_code})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={form.department}
                      onValueChange={value => setForm(f => ({ ...f, department: value }))}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.length > 0 ? (
                          departments.map(d => (
                            <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                          ))
                        ) : (
                          ["Administration", "Finance & Accounts", "Operations & Maintenance", "IT", "HR", "Leasing"].map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignment_date">Assignment Date</Label>
                    <Input
                      id="assignment_date"
                      type="date"
                      value={form.assignment_date}
                      onChange={e => setForm(f => ({ ...f, assignment_date: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="return_date">Expected Return Date</Label>
                    <Input
                      id="return_date"
                      type="date"
                      value={form.return_date}
                      onChange={e => setForm(f => ({ ...f, return_date: e.target.value }))}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* STEP 4: Service, Warranty & Status */}
              <TabsContent value="service" className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="asset_status">Asset Status</Label>
                    <Select
                      value={form.asset_status}
                      onValueChange={v => setForm(f => ({ ...f, asset_status: v }))}
                    >
                      <SelectTrigger id="asset_status">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.length > 0 ? (
                          statuses.map(s => (
                            <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                          ))
                        ) : (
                          ["Available", "In Use", "Assigned", "Under Maintenance", "Damaged", "Disposed"].map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="asset_condition">Asset Condition</Label>
                    <Select
                      value={form.asset_condition}
                      onValueChange={v => setForm(f => ({ ...f, asset_condition: v }))}
                    >
                      <SelectTrigger id="asset_condition">
                        <SelectValue placeholder="Select Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.length > 0 ? (
                          conditions.map(c => (
                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                          ))
                        ) : (
                          ["Brand New", "Good", "Fair", "Needs Repair", "Scrap / Disposed"].map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warranty_status">Warranty Status</Label>
                    <Select
                      value={form.warranty_status}
                      onValueChange={v => setForm(f => ({ ...f, warranty_status: v }))}
                    >
                      <SelectTrigger id="warranty_status">
                        <SelectValue placeholder="Select Warranty Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Valid", "Expired", "Not Applicable", "Extended Warranty"].map(w => (
                          <SelectItem key={w} value={w}>{w}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warranty_expiry_date">Warranty Expiry Date</Label>
                    <Input
                      id="warranty_expiry_date"
                      type="date"
                      value={form.warranty_expiry_date}
                      onChange={e => setForm(f => ({ ...f, warranty_expiry_date: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_service_date">Last Service Date</Label>
                    <Input
                      id="last_service_date"
                      type="date"
                      value={form.last_service_date}
                      onChange={e => setForm(f => ({ ...f, last_service_date: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="next_service_date">Next Service Date</Label>
                    <Input
                      id="next_service_date"
                      type="date"
                      value={form.next_service_date}
                      onChange={e => setForm(f => ({ ...f, next_service_date: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="disposal_date">Disposal Date (if applicable)</Label>
                    <Input
                      id="disposal_date"
                      type="date"
                      value={form.disposal_date}
                      onChange={e => setForm(f => ({ ...f, disposal_date: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="remarks">Remarks / Technical Specifications</Label>
                    <Textarea
                      id="remarks"
                      rows={3}
                      placeholder="Enter warranty notes, serial verification, accessories included, or condition remarks..."
                      value={form.remarks}
                      onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6 flex justify-between sm:justify-between items-center gap-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={activeFormStep === "general"}
                  onClick={() => {
                    const steps: ("general" | "financial" | "assignment" | "service")[] = ["general", "financial", "assignment", "service"];
                    const currIdx = steps.indexOf(activeFormStep);
                    if (currIdx > 0) setActiveFormStep(steps[currIdx - 1]);
                  }}
                >
                  Previous Step
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={activeFormStep === "service"}
                  onClick={() => {
                    const steps: ("general" | "financial" | "assignment" | "service")[] = ["general", "financial", "assignment", "service"];
                    const currIdx = steps.indexOf(activeFormStep);
                    if (currIdx < steps.length - 1) setActiveFormStep(steps[currIdx + 1]);
                  }}
                >
                  Next Step
                </Button>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                  {editingAsset ? "Update Asset" : "Save Asset"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Asset View Details Dialog */}
      <Dialog open={!!viewingAsset} onOpenChange={(open) => !open && setViewingAsset(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {viewingAsset && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                      {viewingAsset.asset_name}
                      <Badge variant="outline" className="text-xs font-normal">
                        {viewingAsset.asset_status || "Available"}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      Code: <span className="font-mono font-medium text-foreground">{viewingAsset.asset_code}</span> | Category: <span className="font-medium text-foreground">{viewingAsset.category}</span>
                      {viewingAsset.subcategory ? ` › ${viewingAsset.subcategory}` : ''}
                    </DialogDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    const target = viewingAsset;
                    setViewingAsset(null);
                    openEditAssetModal(target);
                  }}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit Asset
                  </Button>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg border">
                <div>
                  <span className="text-xs text-muted-foreground block">Purchase Cost</span>
                  <span className="text-lg font-bold text-foreground">QAR {viewingAsset.purchase_cost != null ? Number(viewingAsset.purchase_cost).toLocaleString() : '0'}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Net Book Value</span>
                  <span className="text-lg font-bold text-primary">QAR {viewingAsset.net_book_value != null ? Number(viewingAsset.net_book_value).toLocaleString() : '0'}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Acc. Depreciation</span>
                  <span className="text-lg font-bold text-muted-foreground">QAR {viewingAsset.closing_accumulated_depreciation != null ? Number(viewingAsset.closing_accumulated_depreciation).toLocaleString() : '0'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground border-b pb-1">Specifications & Brand</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{viewingAsset.category || '—'}</span>
                    <span className="text-muted-foreground">Subcategory:</span>
                    <span className="font-medium">{viewingAsset.subcategory || '—'}</span>
                    <span className="text-muted-foreground">Brand:</span>
                    <span className="font-medium">{viewingAsset.brand || '—'}</span>
                    <span className="text-muted-foreground">Model:</span>
                    <span className="font-medium">{viewingAsset.model || '—'}</span>
                    <span className="text-muted-foreground">Serial / IMEI:</span>
                    <span className="font-medium font-mono">{viewingAsset.serial_number || '—'}</span>
                    <span className="text-muted-foreground">Ownership:</span>
                    <span className="font-medium">{viewingAsset.ownership_type || 'Owned'}</span>
                    <span className="text-muted-foreground">Condition:</span>
                    <span className="font-medium">{viewingAsset.asset_condition || 'Good'}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground border-b pb-1">Assignment & Location</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Assigned Property:</span>
                    <span className="font-medium">{viewingAsset.properties?.title || viewingAsset.assigned_property_code || '—'}</span>
                    <span className="text-muted-foreground">Assigned Unit:</span>
                    <span className="font-medium">{viewingAsset.units?.unit_code || viewingAsset.assigned_unit_code || '—'}</span>
                    <span className="text-muted-foreground">Assigned Custodian:</span>
                    <span className="font-medium">{viewingAsset.assigned_employee_name || (viewingAsset.employees ? `${viewingAsset.employees.first_name} ${viewingAsset.employees.last_name}` : '—')}</span>
                    <span className="text-muted-foreground">Assignment Date:</span>
                    <span className="font-medium">{viewingAsset.assignment_date || '—'}</span>
                    <span className="text-muted-foreground">Expected Return:</span>
                    <span className="font-medium">{viewingAsset.return_date || '—'}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground border-b pb-1">Purchasing & Warranty</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Supplier / Vendor:</span>
                    <span className="font-medium">{viewingAsset.supplier || '—'}</span>
                    <span className="text-muted-foreground">Purchase Date:</span>
                    <span className="font-medium">{viewingAsset.purchase_date || '—'}</span>
                    <span className="text-muted-foreground">Depreciation Method:</span>
                    <span className="font-medium">{viewingAsset.depreciation_method || 'Straight Line (SLM)'}</span>
                    <span className="text-muted-foreground">Depreciation Rate:</span>
                    <span className="font-medium">{viewingAsset.depreciation_rate != null ? `${viewingAsset.depreciation_rate}% / yr` : '—'}</span>
                    <span className="text-muted-foreground">Useful Life:</span>
                    <span className="font-medium">{viewingAsset.life_of_asset ? `${viewingAsset.life_of_asset} years` : '—'}</span>
                    <span className="text-muted-foreground">Warranty Status:</span>
                    <span className="font-medium">{viewingAsset.warranty_status || '—'}</span>
                    <span className="text-muted-foreground">Warranty Expiry:</span>
                    <span className="font-medium">{viewingAsset.warranty_expiry_date || '—'}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground border-b pb-1">Service & Lifecycle</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Last Service Date:</span>
                    <span className="font-medium">{viewingAsset.last_service_date || '—'}</span>
                    <span className="text-muted-foreground">Next Service Date:</span>
                    <span className="font-medium">{viewingAsset.next_service_date || '—'}</span>
                    <span className="text-muted-foreground">Disposal Date:</span>
                    <span className="font-medium">{viewingAsset.disposal_date || '—'}</span>
                    <span className="text-muted-foreground">Disposal Value:</span>
                    <span className="font-medium">QAR {viewingAsset.disposal_value ? Number(viewingAsset.disposal_value).toLocaleString() : '0'}</span>
                  </div>
                </div>
              </div>

              {viewingAsset.remarks && (
                <div className="p-3 bg-muted/20 border rounded-md text-sm">
                  <span className="font-semibold block mb-1">Remarks & Notes:</span>
                  <p className="text-muted-foreground">{viewingAsset.remarks}</p>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingAsset(null)}>Close</Button>
                <Button onClick={() => setPrintBarcode(viewingAsset.asset_code || "")}>
                  <Printer className="h-4 w-4 mr-2" /> Print Asset Tag
                </Button>
              </DialogFooter>
            </div>
          )}
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
            <div className="col-span-4 border-t pt-3 mt-1 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold">Amenities & Facilities</span>
                <span className="text-[11px] text-destructive font-medium">* At least 1 required</span>
              </div>
              <div className="space-y-2">
                {(propertyForm.amenities || []).map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input 
                      placeholder={idx === 0 ? "Amenity 1 (e.g. Swimming Pool) *" : idx === 1 ? "Amenity 2 (e.g. Gym)" : `Amenity ${idx + 1}`} 
                      value={amenity} 
                      onChange={e => {
                        const newAmenities = [...propertyForm.amenities];
                        newAmenities[idx] = e.target.value;
                        setPropertyForm(f => ({ ...f, amenities: newAmenities }));
                      }} 
                      className="text-xs flex-1"
                    />
                    {propertyForm.amenities.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => {
                          const newAmenities = propertyForm.amenities.filter((_, i) => i !== idx);
                          setPropertyForm(f => ({ ...f, amenities: newAmenities.length > 0 ? newAmenities : [""] }));
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}

                {propertyForm.amenities.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      setPropertyForm(f => ({ ...f, amenities: [...f.amenities, ""] }));
                    }}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add Amenity ({propertyForm.amenities.length}/5)
                  </Button>
                )}

                <div className="pt-1">
                  <Input 
                    placeholder="Other Amenities (comma separated)" 
                    value={propertyForm.other_amenities} 
                    onChange={e => setPropertyForm(f => ({ ...f, other_amenities: e.target.value }))} 
                    className="text-xs"
                  />
                </div>
              </div>
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
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Transfer / Reassign Asset</DialogTitle>
            <DialogDescription>
              Transfer <strong>{transferAsset?.asset_name}</strong> ({transferAsset?.asset_code}) to a different Property and Unit.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Target Property</Label>
              <Select
                value={transferForm.assigned_property_id}
                onValueChange={(val) => setTransferForm(f => ({ ...f, assigned_property_id: val, assigned_unit_id: "" } as any))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">— Unassign / General Pool —</SelectItem>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Unit</Label>
              <Select
                value={(transferForm as any).assigned_unit_id || "unassigned"}
                onValueChange={(val) => setTransferForm(f => ({ ...f, assigned_unit_id: val === "unassigned" ? "" : val } as any))}
                disabled={!transferForm.assigned_property_id || transferForm.assigned_property_id === "unassigned"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">— Entire Property / Unassigned Unit —</SelectItem>
                  {units
                    .filter((u) => u.property_id === transferForm.assigned_property_id)
                    .map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.unit_ref || `Unit ${u.id}`}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTransferAsset(null)}>Cancel</Button>
            <Button onClick={async () => {
              if (transferAsset) {
                const targetPropId = transferForm.assigned_property_id === "unassigned" ? null : transferForm.assigned_property_id;
                const targetUnitId = (transferForm as any).assigned_unit_id || null;
                const targetProp = properties.find(p => p.id === targetPropId);
                const targetUnit = units.find(u => u.id === targetUnitId);

                await updateAsset(transferAsset.id, {
                  assigned_property_id: targetPropId || undefined,
                  assigned_unit_id: targetUnitId || undefined,
                  asset_status: targetPropId ? "Assigned" : "Available",
                  remarks: targetProp ? `Transferred to ${targetProp.title} ${targetUnit ? `(Unit: ${targetUnit.unit_ref})` : ''}` : "Transferred to General Pool"
                });

                // Update General Ledger note
                const cost = Number(transferAsset.purchase_cost) || 0;
                if (cost > 0) {
                  addJournalEntry({
                    je_no: `JE-AST-TRF-${Date.now().toString().slice(-4)}`,
                    posting_date: new Date().toISOString().split("T")[0],
                    reference: `TRF-${transferAsset.asset_code}`,
                    narration: `Asset Transfer: ${transferAsset.asset_name} transferred to ${targetProp?.title || 'General Pool'} (Unit: ${targetUnit?.unit_ref || 'N/A'})`,
                    dr_account: "Fixed Assets & Equipment (15000)",
                    dr_code: "15000",
                    cr_account: "Fixed Assets & Equipment (15000)",
                    cr_code: "15000",
                    amount: cost,
                  });
                }

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
