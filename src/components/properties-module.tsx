import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ExcelImportEmbedded } from "@/components/excel-import-embedded";
import { Building2, Check, ChevronLeft, ChevronRight, Loader2, FileUp, Download, FileSpreadsheet, PlusCircle, Sparkles, Plus, Trash2, Search, X, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { buildPropertyPayload } from "@/lib/property-master";
import { getDemoSession } from "@/lib/demo-auth";
import {
  createProperty,
  fetchAllProperties,
  fetchHostProperties,
  fetchLeases,
  fetchUnits,
  supabase,
  fetchPropertyTypes,
  fetchOwnershipTypes,
  fetchPropertyCategories,
  fetchCostCenters,
  updatePropertyImages,
  type Property,
} from "@/lib/supabase";
import { ImageUploader, type ImageFile } from "@/components/image-uploader";
import { PropertyDocumentsManager, type PropertyDocument } from "@/components/property-documents-manager";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface PropertiesModuleProps {
  role: "admin" | "prop-mgr" | "owner";
}

type PropertyFormState = {
  property_code: string;
  title: string;
  description: string;
  property_type: string;
  property_category: string;
  ownership_type: string;
  country: string;
  city: string;
  area_zone: string;
  street_building_name: string;
  plot_building_no: string;
  title_deed_no: string;
  municipality_ref_no: string;
  owner_landlord: string;
  property_manager: string;
  no_of_floors: string;
  no_of_units: string;
  total_units: string;
  total_built_up_area_sqm: string;
  common_area_sqm: string;
  parking_count: string;
  no_of_elevators: string;
  completion_date: string;
  handover_date: string;
  property_status: string;
  documents_received: boolean;
  remarks: string;
  cost_center_code: string;
  cost_center_name: string;
  address: string;
  state: string;
  zip_code: string;
};

const MOCK_HOST_ID = "00000000-0000-4000-8000-000000000001";

const EMPTY_FORM: PropertyFormState = {
  property_code: "",
  title: "",
  description: "",
  property_type: "Residential",
  property_category: "Building",
  ownership_type: "Leased",
  country: "Qatar",
  city: "Doha",
  area_zone: "",
  street_building_name: "",
  plot_building_no: "",
  title_deed_no: "",
  municipality_ref_no: "",
  owner_landlord: "",
  property_manager: "",
  no_of_floors: "1",
  no_of_units: "1",
  total_units: "1",
  total_built_up_area_sqm: "",
  common_area_sqm: "",
  parking_count: "0",
  no_of_elevators: "0",
  completion_date: "",
  handover_date: "",
  property_status: "Active",
  documents_received: false,
  remarks: "",
  cost_center_code: "",
  cost_center_name: "",
  address: "",
  state: "",
  zip_code: "",
};

const STEPS = [
  { id: 1, name: "Identity & Location" },
  { id: 2, name: "Specifications & Structure" },
  { id: 3, name: "Amenities & Facilities" },
  { id: 4, name: "Photos" },
  { id: 5, name: "Documents" },
];

export function PropertiesModule({ role }: PropertiesModuleProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [occupancyData, setOccupancyData] = useState<
    Record<string, { units: number; occupancy: string }>
  >({});
  const [form, setForm] = useState<PropertyFormState>(EMPTY_FORM);
  const [amenitiesList, setAmenitiesList] = useState<string[]>([""]);
  const [otherAmenities, setOtherAmenities] = useState<string>("");
  const [customPropertyType, setCustomPropertyType] = useState("");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [propertyDocuments, setPropertyDocuments] = useState<PropertyDocument[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => { setCurrentPage(1); }, [properties, itemsPerPage]);

  // Master Data State
  const [propCategoryOptions, setPropCategoryOptions] = useState<{ id: string; label: string }[]>([]);
  const [propTypeOptions, setPropTypeOptions] = useState<{ id: string; label: string }[]>([]);
  const [ownershipOptions, setOwnershipOptions] = useState<{ id: string; label: string }[]>([]);
  const [costCenterOptions, setCostCenterOptions] = useState<any[]>([]);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const demoSession = getDemoSession();
      const hostId = session?.user?.id || demoSession?.id || MOCK_HOST_ID;

      const [data, pc, pt, ow, cc] = await Promise.all([
        // Internal PMS: all staff roles can see all properties (host_id is null on seeded data)
        fetchAllProperties(),
        fetchPropertyCategories(),
        fetchPropertyTypes(),
        fetchOwnershipTypes(),
        fetchCostCenters(),
      ]);

      setProperties(data || []);
      setPropCategoryOptions(pc);
      setPropTypeOptions(pt);
      setOwnershipOptions(ow);
      setCostCenterOptions(cc);
    } catch (error: any) {
      console.error("Failed to load properties:", error?.message || error);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  useEffect(() => {
    if (properties.length === 0) {
      setOccupancyData({});
      return;
    }

    void (async () => {
      // Get context leases to check active occupancies
      let contextLeases: any[] = [];
      try {
        const raw = window.localStorage.getItem("zyno-pms-app-data");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.leases) contextLeases = parsed.leases;
        }
      } catch (e) {}

      const entries = await Promise.all(
        properties.map(async (property) => {
          try {
            const units = await fetchUnits({ property_id: property.id });
            const totalUnits = units?.length ?? 0;
            
            // Check occupied units in db or active leases in context matching property title
            const occupiedDbCount = (units || []).filter(
              (u: any) =>
                u.status?.toLowerCase() === "occupied" ||
                u.lease_status?.toLowerCase() === "leased" ||
                u.lease_status?.toLowerCase() === "active"
            ).length;

            const activeContextLeaseCount = contextLeases.filter(
              (l: any) =>
                (l.property?.toLowerCase() === property.title?.toLowerCase() ||
                 l.property?.toLowerCase().includes(property.title?.toLowerCase()) ||
                 property.title?.toLowerCase().includes(l.property?.toLowerCase())) &&
                (l.status === "active" || l.status === "fully_signed" || l.status === "collection_completed")
            ).length;

            const occupiedUnits = Math.max(occupiedDbCount, Math.min(totalUnits, activeContextLeaseCount));
            const calculatedTotal = totalUnits > 0 ? totalUnits : (property.total_units || property.no_of_units || (activeContextLeaseCount > 0 ? activeContextLeaseCount : 1));

            return {
              id: property.id,
              units: calculatedTotal,
              occupancy: calculatedTotal > 0
                ? (occupiedUnits > 0 ? Math.round((occupiedUnits / calculatedTotal) * 100) + "%" : (occupiedDbCount > 0 ? Math.round((occupiedDbCount / calculatedTotal) * 100) + "%" : "0%"))
                : "0%",
            };
          } catch {
            return { id: property.id, units: 0, occupancy: "N/A" };
          }
        }),
      );
      setOccupancyData(
        Object.fromEntries(entries.map((entry) => [entry.id, entry])),
      );
    })();
  }, [properties]);

  const basePath =
    role === "admin" ? "/admin" : role === "owner" ? "/owner" : "/prop-mgr";

  async function handleCreateProperty() {
    setCreating(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const demoSession = getDemoSession();

      // Only use a real Supabase user ID as host_id (FK to profiles table).
      // Demo users don't exist in profiles, so we leave host_id null (matches all seeded data).
      const hostId = session?.user?.id ?? undefined;

      if (!session?.user?.id && !demoSession) {
        throw new Error("You must be logged in to create a property.");
      }

      const finalPropertyCode = form.property_code.trim() || `PROP-${Math.floor(100000 + Math.random() * 900000)}`;
      const propCostCenterCode = form.cost_center_code.trim() || `CC-${finalPropertyCode.replace(/[^A-Za-z0-9]/g, '')}`;
      const propCostCenterName = form.cost_center_name.trim() || `${form.title.trim()} Cost Center`;

      const cleanAmenities = amenitiesList.map((a) => a.trim()).filter(Boolean);
      if (cleanAmenities.length === 0) {
        toast.error("At least one Amenity / Facility is mandatory.");
        setCreating(false);
        return;
      }

      const streetAddress = form.street_building_name || form.address || `${finalPropertyCode} Street`;

      const newProperty = await createProperty(
        buildPropertyPayload({
          hostId, // undefined for demo users → host_id omitted (null in DB)
          title: form.title.trim(),
          description: form.description || null,
          propertyType: form.property_type === "Other" ? customPropertyType : form.property_type,
          address: streetAddress,
          city: form.city.trim(),
          state: form.state || form.area_zone || undefined,
          zipCode: form.zip_code || undefined,
          country: form.country.trim(),
          basePricePerNight: 0,
          cleaningFee: 0,
          isActive: form.property_status.toLowerCase() === "active",
          propertyCode: finalPropertyCode,
          costCenterCode: propCostCenterCode,
          costCenterName: propCostCenterName,
          propertyCategory: form.property_category,
          ownershipType: form.ownership_type,
          areaZone: form.area_zone.trim(),
          streetBuildingName: form.street_building_name.trim(),
          plotBuildingNo: form.plot_building_no.trim() || undefined,
          titleDeedNo: form.title_deed_no.trim() || undefined,
          municipalityRefNo: form.municipality_ref_no.trim() || undefined,
          ownerLandlord: form.owner_landlord.trim(),
          propertyManager: form.property_manager.trim(),
          noOfFloors: Number(form.no_of_floors) || 1,
          noOfUnits: Number(form.no_of_units) || 1,
          totalUnits: Number(form.total_units || form.no_of_units) || 1,
          totalBuiltUpAreaSqm: form.total_built_up_area_sqm ? Number(form.total_built_up_area_sqm) : undefined,
          commonAreaSqm: form.common_area_sqm ? Number(form.common_area_sqm) : undefined,
          parkingCount: Number(form.parking_count) || 0,
          noOfElevators: Number(form.no_of_elevators) || 0,
          completionDate: form.completion_date || undefined,
          handoverDate: form.handover_date || undefined,
          propertyStatus: form.property_status,
          documentsReceived: Boolean(form.documents_received),
          remarks: form.remarks || undefined,
          amenityFields: cleanAmenities,
          otherAmenitiesFacilities: otherAmenities.trim() || undefined,
          documents: propertyDocuments,
        }) as Omit<Property, "id" | "created_at" | "property_images">,
      );

      if (newProperty) {
        try {
          await supabase.from('fin_cost_centers').upsert({
            code: propCostCenterCode,
            name: propCostCenterName,
            manager: form.property_manager || 'Property Manager',
          }, { onConflict: 'code' });
        } catch (ccErr) {
          console.warn("Auto-create property cost center skipped/failed:", ccErr);
        }
      }

      if (images.length > 0 && newProperty) {
        await updatePropertyImages(
          newProperty.id,
          images.map((img, idx) => ({
            image_url: img.url,
            is_primary: img.isCover,
            display_order: idx,
          }))
        );
      }

      setCreateOpen(false);
      setForm(EMPTY_FORM);
      setAmenitiesList([""]);
      setOtherAmenities("");
      setCustomPropertyType("");
      setImages([]);
      setPropertyDocuments([]);
      setStep(1);
      await loadProperties();
    } catch (error: any) {
      alert("Failed to create property: " + (error?.message || "Unknown error"));
    } finally {
      setCreating(false);
    }
  }

  const handleNext = () => setStep((s) => Math.min(STEPS.length, s + 1));
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const stepperButtonClass = (s: { id: number }) => {
    if (step === s.id) return "bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold";
    if (step > s.id) return "bg-primary/20 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold";
    return "bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold";
  };

  const connectorClass = (idx: number) => {
    return "h-1 w-16 mx-2 rounded " + (step > idx + 1 ? "bg-primary/20" : "bg-muted");
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterOwnership, setFilterOwnership] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filteredProperties = properties.filter((prop) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchesCode = (prop.property_code || "").toLowerCase().includes(q);
      const matchesName = (prop.title || "").toLowerCase().includes(q);
      if (!matchesCode && !matchesName) return false;
    }
    if (filterType && (prop.property_type || "").toLowerCase() !== filterType.toLowerCase()) return false;
    if (filterCategory && (prop.property_category || "").toLowerCase() !== filterCategory.toLowerCase()) return false;
    if (filterOwnership && (prop.ownership_type || "").toLowerCase() !== filterOwnership.toLowerCase()) return false;
    if (filterStatus) {
      if (filterStatus === "active" && !prop.is_active) return false;
      if (filterStatus === "inactive" && prop.is_active) return false;
    }
    return true;
  });

  const hasActiveFilters = searchQuery || filterType || filterCategory || filterOwnership || filterStatus;

  const resetFilters = () => {
    setSearchQuery("");
    setFilterType("");
    setFilterCategory("");
    setFilterOwnership("");
    setFilterStatus("");
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [bulkPropOpen, setBulkPropOpen] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);

  const downloadPropertyCsvTemplate = () => {
    const headers = "PropertyTitle,PropertyType,Address,City,Country,TotalUnits,CostCenterCode,CostCenterName,PropertyCategory,OwnershipType";
    const sample = "Al Sadd Commercial Tower,Commercial Office,Al Sadd Main Road,Doha,Qatar,48,CC-PROP-1001,Al Sadd Tower Center,Commercial,Company Owned\nLusail Marina Residences,Residential Tower,Lusail Marina Promenade,Lusail,Qatar,120,CC-PROP-1002,Lusail Marina Center,Residential,Third Party Managed";
    const blob = new Blob([headers + "\n" + sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "bulk_properties_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Property CSV Template downloaded!");
  };

  const handleBulkPropertyImport = async () => {
    if (!bulkCsvText.trim()) {
      toast.error("Please paste CSV data or upload a file.");
      return;
    }
    setBulkImporting(true);
    try {
      const lines = bulkCsvText.trim().split("\n");
      if (lines.length <= 1) {
        toast.error("CSV must contain at least 1 property row.");
        return;
      }
      const dataRows = lines.slice(1);
      let count = 0;
      for (const row of dataRows) {
        const cols = row.split(",").map(c => c.trim().replace(/^"|"$/g, ''));
        if (!cols[0]) continue;
        const [title, ptype, addr, city, country, unitsCount, ccCode, ccName, pcat, ownType] = cols;
        const genCode = `PROP-${Math.floor(100000 + Math.random() * 900000)}`;
        await createProperty(
          buildPropertyPayload({
            title,
            propertyType: ptype || "Apartment",
            address: addr || "Doha, Qatar",
            city: city || "Doha",
            country: country || "Qatar",
            basePricePerNight: 0,
            cleaningFee: 0,
            isActive: true,
            propertyCode: genCode,
            costCenterCode: ccCode || `CC-${genCode}`,
            costCenterName: ccName || `${title} Cost Center`,
            propertyCategory: pcat || "Residential",
            ownershipType: ownType || "Owned",
            noOfUnits: unitsCount || "10",
            totalUnits: unitsCount || "10",
          })
        );
        count++;
      }
      toast.success(`Successfully imported ${count} properties!`);
      setBulkPropOpen(false);
      setBulkCsvText("");
      await loadProperties();
    } catch (err: any) {
      toast.error("Bulk Property Import failed: " + err.message);
    } finally {
      setBulkImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Properties</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your portfolio and track occupancy.
          </p>
        </div>
        <div className="flex gap-2">
          {role !== "owner" && (
            <>
              <Button
                variant="outline"
                onClick={() => setBulkPropOpen(true)}
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4 text-primary" /> Excel Bulk Import / Manage
              </Button>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setStep(1);
                  setCreateOpen(true);
                }}
              >
                + New property
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Bulk Property Import Modal */}
      <Dialog open={bulkPropOpen} onOpenChange={setBulkPropOpen}>
        <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto bg-card p-6">
          <ExcelImportEmbedded
            module="property"
            title="Property Master: Excel Bulk Import & Management"
            description="Production-grade Excel CREATE, UPDATE, and DELETE engine for master properties, buildings, and cost centers."
            onCompleted={() => {
              loadProperties();
            }}
          />
        </DialogContent>
      </Dialog>

      <Card className="border-border">
        <CardContent className="p-0">
          {/* Search & Filter Bar */}
          {!loading && properties.length > 0 && (
            <div className="p-4 border-b border-border space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by Property Code or Property Name..."
                    className="w-full pl-9 pr-4 h-9 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {/* Filter: Property Type */}
                <select
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[140px]"
                >
                  <option value="">All Types</option>
                  {propTypeOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                {/* Filter: Property Category */}
                <select
                  value={filterCategory}
                  onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[150px]"
                >
                  <option value="">All Categories</option>
                  {propCategoryOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                {/* Filter: Ownership */}
                <select
                  value={filterOwnership}
                  onChange={(e) => { setFilterOwnership(e.target.value); setCurrentPage(1); }}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[150px]"
                >
                  <option value="">All Ownership</option>
                  {ownershipOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                {/* Filter: Status */}
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[120px]"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 gap-1.5 text-muted-foreground hover:text-foreground shrink-0">
                    <X className="h-3.5 w-3.5" /> Reset
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <SlidersHorizontal className="h-3 w-3" />
                <span>
                  {hasActiveFilters
                    ? <>{filteredProperties.length} result{filteredProperties.length !== 1 ? 's' : ''} of {properties.length} properties</>
                    : <>{properties.length} propert{properties.length !== 1 ? 'ies' : 'y'} total</>}
                </span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : properties.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-3 text-muted-foreground">
              <Building2 className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium">No properties yet.</p>
              {role !== "owner" && (
                <Button
                  size="sm"
                  onClick={() => {
                    setForm(EMPTY_FORM);
                    setStep(1);
                    setCreateOpen(true);
                  }}
                >
                  + Create your first listing
                </Button>
              )}
            </div>
          ) : filteredProperties.length === 0 && hasActiveFilters ? (
            <div className="flex h-40 flex-col items-center justify-center gap-3 text-muted-foreground">
              <Search className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium">No properties match your search or filters.</p>
              <Button size="sm" variant="outline" onClick={resetFilters}>Clear filters</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Property
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Units
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Occupancy
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedProperties.map((prop) => {
                    const propertyUnits = occupancyData[prop.id]?.units ?? "-";
                    const propertyOccupancy = occupancyData[prop.id]?.occupancy ?? "-";
                    return (
                      <tr key={prop.id} className="transition-colors hover:bg-muted/10">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">{prop.title}</div>
                          {prop.property_code && (
                            <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{prop.property_code}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 capitalize text-muted-foreground">
                          <div>{prop.property_type.replace(/_/g, " ")}</div>
                          {prop.property_category && (
                            <div className="text-[11px] text-muted-foreground/70">{prop.property_category}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <div>{prop.city}, {prop.country}</div>
                          {prop.area_zone && (
                            <div className="text-[11px] text-muted-foreground/70">{prop.area_zone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {propertyUnits}
                        </td>
                        <td className="px-6 py-4 font-medium">{propertyOccupancy}</td>
                        <td className="px-6 py-4">
                          <span
                            className={
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                              (prop.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-muted text-muted-foreground")
                            }
                          >
                            {prop.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={basePath + "/manage/$id"} params={{ id: prop.id }} search={{ mode: 'view' } as any}>
                              View
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link to={basePath + "/manage/$id"} params={{ id: prop.id }} search={{ mode: 'edit' } as any}>
                              Edit
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    Showing{" "}
                    <strong>
                      {filteredProperties.length === 0
                        ? 0
                        : (currentPage - 1) * itemsPerPage + 1}
                      -
                      {Math.min(currentPage * itemsPerPage, filteredProperties.length)}
                    </strong>{" "}
                    of <strong>{filteredProperties.length}</strong> properties
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>Rows per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="h-7 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                {totalPages > 1 && (
                  <Pagination className="mx-0 w-auto">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)) }} 
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => {
                        // Show first, last, and near current pages
                        if (
                          totalPages <= 7 ||
                          i === 0 ||
                          i === totalPages - 1 ||
                          (i >= currentPage - 2 && i <= currentPage)
                        ) {
                          return (
                            <PaginationItem key={i}>
                              <PaginationLink 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1) }} 
                                isActive={currentPage === i + 1}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          i === currentPage - 3 ||
                          i === currentPage + 1
                        ) {
                          return (
                            <PaginationItem key={i}>
                              <span className="px-2 text-xs text-muted-foreground">...</span>
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)) }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          {/* Header with gradient and icon */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Register New Property</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set up building identity, location, configuration units, and media assets.
              </DialogDescription>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="px-6 pt-3 pb-2 bg-muted/20 border-b">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => {
                const isActive = step === s.id;
                const isPassed = step > s.id;
                return (
                  <div key={s.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex items-center gap-2">
                      <div
                        className={
                          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all " +
                          (isActive
                            ? "bg-primary text-primary-foreground shadow-sm ring-4 ring-primary/15"
                            : isPassed
                            ? "bg-primary/20 text-primary font-semibold"
                            : "bg-muted text-muted-foreground")
                        }
                      >
                        {isPassed ? <Check className="h-3.5 w-3.5" /> : s.id}
                      </div>
                      <span
                        className={
                          "text-xs hidden sm:inline-block " +
                          (isActive ? "font-bold text-foreground" : isPassed ? "font-medium text-foreground/80" : "text-muted-foreground")
                        }
                      >
                        {s.name}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={
                          "h-0.5 flex-1 mx-3 rounded-full transition-all " +
                          (step > i + 1 ? "bg-primary" : "bg-border")
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content Body */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Step 1: Identity & Location */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-muted/20 p-4 space-y-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" /> Property Identity &amp; Classification
                  </span>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Property Code *</Label>
                        <Input
                          value={form.property_code}
                          onChange={(e) => setForm((prev) => ({ ...prev, property_code: e.target.value }))}
                          placeholder="e.g. PROP-001 (Auto if blank)"
                          className="bg-background font-mono"
                        />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <Label className="text-xs font-semibold">Property / Building Name *</Label>
                        <Input
                          value={form.title}
                          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g. Al Sadd Commercial Tower / Lusail Marina Residences"
                          className="bg-background font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Property Type *</Label>
                        <SearchableSelect
                          options={[
                            ...propTypeOptions.map((opt) => ({ label: opt.label, value: opt.id })),
                            { label: 'Other (Add new)', value: 'Other' },
                          ]}
                          value={form.property_type}
                          onValueChange={(val) => {
                            setForm((prev) => ({ ...prev, property_type: val }));
                            if (val !== "Other") setCustomPropertyType("");
                          }}
                          placeholder="Search property type..."
                        />
                        {form.property_type === "Other" && (
                          <div className="mt-1">
                            <Input
                              value={customPropertyType}
                              onChange={(e) => setCustomPropertyType(e.target.value)}
                              placeholder="Enter custom type..."
                              className="bg-background text-xs h-8"
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Property Category</Label>
                        <SearchableSelect
                          options={propCategoryOptions.length > 0
                            ? propCategoryOptions.map((opt) => ({ label: opt.label, value: opt.id }))
                            : [
                                { label: 'Building', value: 'Building' },
                                { label: 'Residential', value: 'Residential' },
                                { label: 'Commercial', value: 'Commercial' },
                                { label: 'Mixed Use', value: 'Mixed Use' },
                                { label: 'Retail', value: 'Retail' },
                                { label: 'Industrial', value: 'Industrial' },
                              ]
                          }
                          value={form.property_category}
                          onValueChange={(val) => setForm((prev) => ({ ...prev, property_category: val }))}
                          placeholder="Search category..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Ownership Type</Label>
                        <SearchableSelect
                          options={ownershipOptions.length > 0
                            ? ownershipOptions.map((opt) => ({ label: opt.label, value: opt.id }))
                            : [
                                { label: 'Freehold', value: 'Freehold' },
                                { label: 'Leasehold', value: 'Leasehold' },
                                { label: 'Leased', value: 'Leased' },
                                { label: 'Company Owned', value: 'Company Owned' },
                                { label: 'Joint Ownership', value: 'Joint Ownership' },
                              ]
                          }
                          value={form.ownership_type}
                          onValueChange={(val) => setForm((prev) => ({ ...prev, ownership_type: val }))}
                          placeholder="Search ownership type..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Owner / Landlord Name</Label>
                        <Input
                          value={form.owner_landlord}
                          onChange={(e) => setForm((prev) => ({ ...prev, owner_landlord: e.target.value }))}
                          placeholder="e.g. Sheikh Hassan Al-Thani"
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Property Manager *</Label>
                        <Input
                          value={form.property_manager}
                          onChange={(e) => setForm((prev) => ({ ...prev, property_manager: e.target.value }))}
                          placeholder="e.g. Jithin Abdul Latheef"
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Description</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Brief overview of the property, surrounding area, and building amenities..."
                        className="bg-background text-xs resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-muted/20 p-4 space-y-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> Location &amp; Qatar Address
                  </span>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Country *</Label>
                        <Input
                          value={form.country}
                          onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">City / Municipality *</Label>
                        <Input
                          value={form.city}
                          onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                          placeholder="e.g. Doha / Lusail / Al Wakrah"
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Area / Zone *</Label>
                        <Input
                          value={form.area_zone}
                          onChange={(e) => setForm((prev) => ({ ...prev, area_zone: e.target.value }))}
                          placeholder="e.g. Zone 18 / Old Salata / West Bay"
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Street / Building Name *</Label>
                        <Input
                          value={form.street_building_name}
                          onChange={(e) => setForm((prev) => ({ ...prev, street_building_name: e.target.value, address: e.target.value }))}
                          placeholder="e.g. Street 840 / Al Sadd Tower"
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Plot / Building No.</Label>
                        <Input
                          value={form.plot_building_no}
                          onChange={(e) => setForm((prev) => ({ ...prev, plot_building_no: e.target.value }))}
                          placeholder="e.g. Bldg 23 / Plot 45"
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Title Deed / Reg. No.</Label>
                        <Input
                          value={form.title_deed_no}
                          onChange={(e) => setForm((prev) => ({ ...prev, title_deed_no: e.target.value }))}
                          placeholder="e.g. TD-998822"
                          className="bg-background font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Municipality / Bldg Ref No.</Label>
                        <Input
                          value={form.municipality_ref_no}
                          onChange={(e) => setForm((prev) => ({ ...prev, municipality_ref_no: e.target.value }))}
                          placeholder="e.g. MUN-44012"
                          className="bg-background font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Specifications & Structure */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-muted/20 p-4 space-y-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" /> Structure &amp; Capacity
                  </span>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">No. of Floors *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={form.no_of_floors}
                        onChange={(e) => setForm((prev) => ({ ...prev, no_of_floors: e.target.value }))}
                        placeholder="e.g. 8"
                        className="bg-background font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">No. of Units *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={form.no_of_units}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            no_of_units: e.target.value,
                            total_units: e.target.value,
                          }))
                        }
                        placeholder="e.g. 44"
                        className="bg-background font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Parking Count</Label>
                      <Input
                        type="number"
                        min="0"
                        value={form.parking_count}
                        onChange={(e) => setForm((prev) => ({ ...prev, parking_count: e.target.value }))}
                        placeholder="e.g. 12"
                        className="bg-background font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">No of Elevator</Label>
                      <Input
                        type="number"
                        min="0"
                        value={form.no_of_elevators}
                        onChange={(e) => setForm((prev) => ({ ...prev, no_of_elevators: e.target.value }))}
                        placeholder="e.g. 2"
                        className="bg-background font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Total Built-up Area (Sqm)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={form.total_built_up_area_sqm}
                        onChange={(e) => setForm((prev) => ({ ...prev, total_built_up_area_sqm: e.target.value }))}
                        placeholder="e.g. 4500"
                        className="bg-background font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Common Area (Sqm)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={form.common_area_sqm}
                        onChange={(e) => setForm((prev) => ({ ...prev, common_area_sqm: e.target.value }))}
                        placeholder="e.g. 600"
                        className="bg-background font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-muted/20 p-4 space-y-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> Key Dates, Compliance &amp; Status
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Completion Date</Label>
                      <Input
                        type="date"
                        value={form.completion_date}
                        onChange={(e) => setForm((prev) => ({ ...prev, completion_date: e.target.value }))}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Handover Date</Label>
                      <Input
                        type="date"
                        value={form.handover_date}
                        onChange={(e) => setForm((prev) => ({ ...prev, handover_date: e.target.value }))}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Property Status</Label>
                      <Select
                        value={form.property_status}
                        onValueChange={(val) => setForm((prev) => ({ ...prev, property_status: val }))}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Under Construction">Under Construction</SelectItem>
                          <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Remarks</Label>
                    <Input
                      value={form.remarks}
                      onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
                      placeholder="e.g. Standard residential building under prime management"
                      className="bg-background text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Amenities & Facilities */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-muted/20 p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> Amenities &amp; Facilities
                    </span>
                    {amenitiesList.length < 5 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-primary/40 text-primary hover:bg-primary/10"
                        onClick={() => {
                          if (amenitiesList.length < 5) {
                            setAmenitiesList([...amenitiesList, ""]);
                          }
                        }}
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Add Amenity ({amenitiesList.length}/5)
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {amenitiesList.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex-1 space-y-1">
                          <Label className="text-[11px] font-medium text-muted-foreground">
                            Amenity / Facility {idx + 1} {idx === 0 && <span className="text-destructive font-bold">*</span>}
                          </Label>
                          <Input
                            value={amenity}
                            onChange={(e) => {
                              const updated = [...amenitiesList];
                              updated[idx] = e.target.value;
                              setAmenitiesList(updated);
                            }}
                            placeholder={
                              idx === 0
                                ? "e.g. Swimming Pool / Fitness Gym (Required)"
                                : idx === 1
                                ? "e.g. 24/7 Security & Concierge"
                                : idx === 2
                                ? "e.g. Underground Parking"
                                : idx === 3
                                ? "e.g. High-Speed Elevators"
                                : "e.g. Rooftop Garden"
                            }
                            className="bg-background text-xs h-9"
                          />
                        </div>
                        {amenitiesList.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 mt-5 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              const updated = amenitiesList.filter((_, i) => i !== idx);
                              setAmenitiesList(updated.length > 0 ? updated : [""]);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}

                    <div className="space-y-1 pt-1 border-t border-border/40">
                      <Label className="text-[11px] font-medium text-muted-foreground">
                        Other Amenities / Facilities
                      </Label>
                      <Input
                        value={otherAmenities}
                        onChange={(e) => setOtherAmenities(e.target.value)}
                        placeholder="e.g. Sauna, Jacuzzi, Squash Court, EV Charging Stations..."
                        className="bg-background text-xs h-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Photos */}
            {step === 4 && (
              <div className="rounded-xl border bg-muted/20 p-4 space-y-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <PlusCircle className="h-3.5 w-3.5 text-primary" /> Property Gallery &amp; Floor Plans
                </span>
                <ImageUploader 
                  images={images} 
                  onChange={setImages} 
                  categories={['Exterior', 'Interior', 'Floor Plan', 'Other']} 
                />
              </div>
            )}

            {/* Step 5: Documents */}
            {step === 5 && (
              <div className="space-y-4">
                {/* Documents Received? Banner */}
                <div className={`flex items-center justify-between p-3.5 rounded-xl border ${
                  form.documents_received
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-amber-500/10 border-amber-500/30"
                }`}>
                  <div className="space-y-0.5">
                    <p className={`text-xs font-bold ${
                      form.documents_received ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"
                    }`}>
                      {form.documents_received ? "✓ Original Documents Received & Verified" : "Documents Received?"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Confirm that all physical originals have been received, stamped, and filed.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="docs_received_step5"
                    checked={form.documents_received}
                    onChange={(e) => setForm((prev) => ({ ...prev, documents_received: e.target.checked }))}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shrink-0"
                  />
                </div>

                <PropertyDocumentsManager
                  documents={propertyDocuments}
                  onChange={setPropertyDocuments}
                />
              </div>
            )}
          </div>

          {/* Dialog Footer */}
          <div className="px-6 py-3.5 bg-muted/40 border-t flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleBack} disabled={step === 1 || creating}>
                <ChevronLeft className="mr-1.5 h-4 w-4" /> Back
              </Button>
              {step < STEPS.length ? (
                <Button
                  size="sm"
                  onClick={handleNext}
                  disabled={
                    (step === 1 && (
                      !form.title.trim() ||
                      !form.property_code.trim() ||
                      !form.property_type.trim() ||
                      !form.country.trim() ||
                      !form.city.trim() ||
                      !form.area_zone.trim() ||
                      !form.street_building_name.trim() ||
                      !form.property_manager.trim()
                    )) ||
                    (step === 2 && (
                      !form.no_of_floors.trim() ||
                      !form.no_of_units.trim()
                    )) ||
                    (step === 3 && !amenitiesList.some((a) => a.trim().length > 0))
                  }
                >
                  Next <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleCreateProperty}
                  disabled={
                    creating ||
                    !form.title.trim() ||
                    !form.property_code.trim() ||
                    !form.property_type.trim() ||
                    !form.country.trim() ||
                    !form.city.trim() ||
                    !form.area_zone.trim() ||
                    !form.street_building_name.trim() ||
                    !form.property_manager.trim() ||
                    !form.no_of_floors.trim() ||
                    !form.no_of_units.trim() ||
                    !amenitiesList.some((a) => a.trim().length > 0)
                  }
                  className="shadow-sm"
                >
                  {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Building2 className="mr-2 h-4 w-4" />}
                  Save Property
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
