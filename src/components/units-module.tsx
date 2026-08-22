import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Bath,
  BedDouble,
  Building2,
  ChevronLeft,
  ChevronRight,
  Check,
  Droplets,
  FileText,
  Home,
  Loader2,
  Plus,
  PlusCircle,
  Snowflake,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createUnit,
  createUnitRooms,
  fetchAllProperties,
  fetchFurnishingTypes,
  fetchHostProperties,
  fetchLeaseStatuses,
  fetchMaintenanceResponsibilities,
  fetchRentFrequencies,
  fetchSecurityDepositTypes,
  fetchUnits,
  fetchViewTypes,
  supabase,
  updateUnit,
  type MasterItem,
  type Unit,
} from "@/lib/supabase";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useAppData } from "@/lib/app-data-context";

export interface UnitsModuleProps {
  role: "admin" | "prop-mgr" | "owner";
}

type FormState = Partial<Unit> & { property_id: string };

type PropertyOption = {
  id: string;
  title: string;
  property_code?: string;
  cost_center_code?: string;
  cost_center_name?: string;
};

type RoomEntry = {
  id: string;
  room_type: string;
  name: string;
  count: number;
  length: string;
  width: string;
  uom: "sqm" | "sqft";
  area: string;
  capacity: string;
  details: string;
};

const ROOM_TYPES = [
  "Bedroom",
  "Drawing Room",
  "Dining Room",
  "Bathroom",
  "Kitchen",
  "Balcony",
  "Lobby",
  "Living Room",
  "Study Room",
  "Storage Room",
  "Laundry",
  "Other",
];

const makeRoomEntry = (type = "Bedroom"): RoomEntry => ({
  id: Math.random().toString(36).slice(2),
  room_type: type,
  name: "",
  count: 1,
  length: "",
  width: "",
  uom: "sqm",
  area: "",
  capacity: "",
  details: "",
});

const EMPTY_FORM: FormState = {
  property_id: "",
  unit_ref: "",
  unit_code: "",
  unit_cost_center_code: "",
  unit_name: "",
  room_type: "Apartment",
  unit_usage: "Residential",
  block_tower: "",
  floor: "",
  bedrooms: 1,
  bathrooms: 1,
  area: "",
  balcony_sqm: undefined,
  total_area_sqm: undefined,
  view_type: "",
  furnishing: "Fully Furnished",
  parking_slot_no: "",
  electricity_meter_no: "",
  water_meter_no: "",
  cooling_meter_no: "",
  max_adults: 2,
  max_children: 0,
  total_occupancy: 2,
  price: 0,
  weekend_price: undefined,
  holiday_price: undefined,
  cleaning_fee: 0,
  status: "Available",
  lease_status: "Vacant",
  rent_frequency: "Monthly",
  current_tenant: "",
  contract_no: "",
  contract_start_date: "",
  contract_end_date: "",
  current_rent: undefined,
  security_deposit_type: "",
  security_deposit_amount: undefined,
  maintenance_responsibility: "Property Manager",
  handover_date: "",
  documents_received: false,
  remarks: "",
};

const leaseStatusColors: Record<string, string> = {
  Leased: "bg-blue-100 text-blue-700",
  Vacant: "bg-green-100 text-green-700",
  "Renewal Due": "bg-amber-100 text-amber-700",
  "Notice Given": "bg-orange-100 text-orange-700",
  Expired: "bg-red-100 text-red-700",
  "Legal Case": "bg-red-200 text-red-800",
};

const fallbackOptions = {
  furnishing: [
    { id: "Fully Furnished", label: "Fully Furnished" },
    { id: "Semi Furnished", label: "Semi Furnished" },
    { id: "Unfurnished", label: "Unfurnished" },
  ],
  leaseStatuses: [
    { id: "Vacant", label: "Vacant" },
    { id: "Leased", label: "Leased" },
    { id: "Renewal Due", label: "Renewal Due" },
    { id: "Notice Given", label: "Notice Given" },
    { id: "Expired", label: "Expired" },
    { id: "Legal Case", label: "Legal Case" },
  ],
  rentFrequencies: [
    { id: "Monthly", label: "Monthly" },
    { id: "Quarterly", label: "Quarterly" },
    { id: "Semi-Annual", label: "Semi-Annual" },
    { id: "Yearly", label: "Yearly" },
  ],
  maintenance: [
    { id: "Property Manager", label: "Property Manager" },
    { id: "Owner", label: "Owner" },
    { id: "Tenant", label: "Tenant" },
    { id: "Shared", label: "Shared" },
  ],
  deposits: [
    { id: "Cash", label: "Cash" },
    { id: "PDC", label: "PDC" },
    { id: "Guarantee Cheque", label: "Guarantee Cheque" },
    { id: "Bank Guarantee", label: "Bank Guarantee" },
  ],
  views: [
    { id: "Road View", label: "Road View" },
    { id: "City View", label: "City View" },
    { id: "Garden View", label: "Garden View" },
    { id: "Sea View", label: "Sea View" },
    { id: "Pool View", label: "Pool View" },
  ],
};

function toNumberOrUndefined(value: string) {
  if (!value.trim()) return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

const STEPS = [
  { id: 1, name: "Identity & Property" },
  { id: 2, name: "Configuration" },
  { id: 3, name: "Lease & Financials" },
  { id: 4, name: "Room Dimensions" },
];

export function UnitsModule({ role }: UnitsModuleProps) {
  const { leases: contextLeases } = useAppData();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [rooms, setRooms] = useState<RoomEntry[]>([makeRoomEntry("Bedroom")]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProperty, setFilterProperty] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("property_id") || "all";
    }
    return "all";
  });
  const [currentTab, setCurrentTab] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("property_id") ? "unit" : "property";
    }
    return "property";
  });
  const [search, setSearch] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [furnishingTypes, setFurnishingTypes] = useState<MasterItem[]>([]);
  const [leaseStatuses, setLeaseStatuses] = useState<MasterItem[]>([]);
  const [rentFrequencies, setRentFrequencies] = useState<MasterItem[]>([]);
  const [maintenanceResp, setMaintenanceResp] = useState<MasterItem[]>([]);
  const [depositTypes, setDepositTypes] = useState<MasterItem[]>([]);
  const [viewTypes, setViewTypes] = useState<MasterItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const hostId = session?.user?.id || "00000000-0000-4000-8000-000000000001";

      const [fur, ls, rf, mr, dt, vt] = await Promise.all([
        fetchFurnishingTypes(),
        fetchLeaseStatuses(),
        fetchRentFrequencies(),
        fetchMaintenanceResponsibilities(),
        fetchSecurityDepositTypes(),
        fetchViewTypes(),
      ]);

      // Internal PMS: fetch all properties for all roles (host_id is null on seeded data)
      const loadedProperties = await fetchAllProperties();

      // Fetch all units, then filter to only those belonging to the loaded properties
      const propertyIds = (loadedProperties || []).map((p) => p.id);
      const loadedUnits = await fetchUnits();
      const propMap = new Map((loadedProperties || []).map((p) => [p.id, p.title]));
      
      // Merge with context leases
      const enrichedUnits = (loadedUnits || [])
        .filter((unit) => propertyIds.includes(unit.property_id))
        .map((unit) => {
          const propTitle = propMap.get(unit.property_id) || "";
          const activeLease = (contextLeases || []).find((l) =>
            (l.property?.toLowerCase() === propTitle.toLowerCase() ||
             l.property?.toLowerCase().includes(propTitle.toLowerCase()) ||
             propTitle.toLowerCase().includes(l.property?.toLowerCase())) &&
            (l.unit?.toLowerCase() === unit.unit_ref?.toLowerCase() ||
             l.unit?.toLowerCase() === unit.unit_name?.toLowerCase() ||
             l.unit?.toLowerCase() === unit.unit_code?.toLowerCase()) &&
            (l.status === "active" || l.status === "fully_signed" || l.status === "collection_completed")
          );

          if (activeLease) {
            return {
              ...unit,
              lease_status: "Occupied",
              status: "Occupied",
              current_tenant: activeLease.tenantName || unit.current_tenant,
              contract_start_date: activeLease.startDate || unit.contract_start_date,
              contract_end_date: activeLease.endDate || unit.contract_end_date,
              current_rent: activeLease.monthlyRent || unit.current_rent || unit.price,
            };
          }
          return unit;
        });

      setUnits(enrichedUnits);
      setProperties(
        (loadedProperties || []).map((p) => ({
          id: p.id,
          title: p.title,
          property_code: p.property_code,
          cost_center_code: p.cost_center_code,
          cost_center_name: p.cost_center_name,
        })),
      );
      setFurnishingTypes(fur);
      setLeaseStatuses(ls);
      setRentFrequencies(rf);
      setMaintenanceResp(mr);
      setDepositTypes(dt);
      setViewTypes(vt);
    } catch (error) {
      console.error("Failed to load unit master data:", error);
    } finally {
      setLoading(false);
    }
  }, [role, contextLeases]);

  useEffect(() => {
    load();
  }, [load]);

  const setF = (key: keyof FormState, value: FormState[keyof FormState]) =>
    setForm((current) => ({ ...current, [key]: value }));




  const handlePropertyChange = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    const propCode = property?.property_code?.trim() || "";
    const unitRef = form.unit_ref || "";
    setForm((current) => ({
      ...current,
      property_id: propertyId,
      unit_code: propCode && unitRef ? `${propCode}-${unitRef}` : unitRef,
    }));
  };

  const handleUnitRefChange = (unitRef: string) => {
    const property = properties.find((p) => p.id === form.property_id);
    const propCode = property?.property_code?.trim() || "";
    setForm((current) => ({
      ...current,
      unit_ref: unitRef,
      unit_code: propCode && unitRef ? `${propCode}-${unitRef}` : unitRef,
    }));
  };

  // --- Room helpers ---
  const addRoom = (type?: string) => {
    setRooms((prev) => [...prev, makeRoomEntry(type)]);
  };
  const removeRoom = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };
  const updateRoom = (id: string, field: keyof RoomEntry, value: string | number) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "length" || field === "width") {
          const l = parseFloat(String(updated.length));
          const w = parseFloat(String(updated.width));
          if (!isNaN(l) && !isNaN(w) && l > 0 && w > 0) {
            updated.area = (l * w).toFixed(2);
          }
        }
        return updated;
      }),
    );
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnitId(unit.id || null);
    setForm({
      ...EMPTY_FORM,
      ...unit,
    });
    setStep(1);
    setOpen(true);
  };

  async function handleCreate() {
    if (!form.property_id || !form.unit_ref) {
      return alert("Property and Unit Reference are required.");
    }
    setSaving(true);
    try {
      const autoArea = rooms.reduce((sum, r) => {
        const a = parseFloat(r.area);
        return sum + (isNaN(a) ? 0 : a * r.count);
      }, 0);
      
      // Date fields — Postgres rejects empty strings for type date; must be null
      const DATE_FIELDS = ['contract_start_date', 'contract_end_date', 'handover_date'] as const;
      const sanitizedPayload: Record<string, unknown> = {
        ...form,
        area: autoArea > 0 ? String(autoArea.toFixed(2)) : (form.area || null),
        balcony_sqm: typeof form.balcony_sqm === "number" && Number.isNaN(form.balcony_sqm) ? null : (form.balcony_sqm ?? null),
        total_area_sqm: typeof form.total_area_sqm === "number" && Number.isNaN(form.total_area_sqm) ? null : (form.total_area_sqm ?? null),
      };
      DATE_FIELDS.forEach(f => {
        if (!sanitizedPayload[f]) sanitizedPayload[f] = null;
      });
      // Also strip other string fields that should be null when empty
      const NULLABLE_STRINGS = [
        'current_tenant', 'contract_no', 'security_deposit_type',
        'block_tower', 'floor', 'view_type', 'parking_slot_no',
        'electricity_meter_no', 'water_meter_no', 'cooling_meter_no', 'remarks',
      ] as const;
      NULLABLE_STRINGS.forEach(f => {
        if (sanitizedPayload[f] === '') sanitizedPayload[f] = null;
      });

      if (editingUnitId) {
        await updateUnit(editingUnitId, sanitizedPayload as Partial<typeof form>);
      } else {
        const created = await createUnit(sanitizedPayload as Partial<typeof form>);
        
        if (created?.id) {
          try {
            const unitLabel = form.unit_name || form.unit_ref || created.id.slice(0, 6);
            const unitCcCode = `CC-UNIT-${created.id.slice(0, 8).toUpperCase()}`;
            const unitCcName = `Unit ${unitLabel} Cost Center`;
            await supabase.from('fin_cost_centers').upsert({
              code: unitCcCode,
              name: unitCcName,
              manager: '',
            }, { onConflict: 'code' });
            await updateUnit(created.id, {
              unit_cost_center_code: unitCcCode,
            } as any);
          } catch (ccErr) {
            console.warn("Auto-create unit cost center skipped/failed:", ccErr);
          }
        }

        // Save room dimensions only on create for now
        const validRooms = rooms.filter((r) => r.room_type && r.count > 0);
        if (validRooms.length > 0 && created?.id) {
          const roomPayloads = validRooms.flatMap((r) =>
            Array.from({ length: r.count }).map((_, i) => ({
              unit_id: created.id,
              room_type: r.room_type,
              name: r.name || `${r.room_type}${r.count > 1 ? ` ${i + 1}` : ""}`,
              length: r.length ? parseFloat(r.length) : null,
              width: r.width ? parseFloat(r.width) : null,
              area: r.area ? parseFloat(r.area) : r.length && r.width ? parseFloat(r.length) * parseFloat(r.width) : null,
              capacity: r.capacity ? parseInt(r.capacity) : null,
              details: r.details ? { notes: r.details } : null,
            })),
          );
          await createUnitRooms(roomPayloads);
        }
      }

      setOpen(false);
      setForm(EMPTY_FORM);
      setEditingUnitId(null);
      setRooms([makeRoomEntry("Bedroom")]);
      setStep(1);
      await load();
    } catch (error: any) {
      console.error(error);
      alert(`Failed to create unit: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in60Days = new Date(today);
  in60Days.setDate(in60Days.getDate() + 60);

  // Occupancy: match on property_id (fixed mapping)
  const filtered = units.filter((unit) => {
    let matchStatus: boolean;
    const isVacant = unit.status?.toLowerCase() === "available" || unit.lease_status?.toLowerCase() === "vacant";
    
    if (filterStatus === "all") {
      matchStatus = true;
    } else if (filterStatus === "renewal_due") {
      if (isVacant || !unit.contract_end_date) {
        matchStatus = false;
      } else {
        const end = new Date(unit.contract_end_date);
        end.setHours(0, 0, 0, 0);
        matchStatus = end <= in60Days;
      }
    } else {
      matchStatus = unit.status?.toLowerCase() === filterStatus.toLowerCase();
    }
    const matchProperty = filterProperty === "all" || unit.property_id === filterProperty;
    const term = search.trim().toLowerCase();
    const matchSearch =
      !term ||
      unit.unit_ref?.toLowerCase().includes(term) ||
      unit.unit_name?.toLowerCase().includes(term) ||
      unit.current_tenant?.toLowerCase().includes(term);
    return matchStatus && matchProperty && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedUnits = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 whenever filters change
  useEffect(() => { setCurrentPage(1); }, [filterStatus, filterProperty, search]);

  const total = units.length;
  const occupied = units.filter(
    (u) => u.status?.toLowerCase() === "occupied" || u.lease_status?.toLowerCase() === "leased" || u.lease_status?.toLowerCase() === "active",
  ).length;
  const available = units.filter(
    (u) => u.status?.toLowerCase() === "available" || u.lease_status === "Vacant",
  ).length;
  const renewalDue = units.filter((u) => {
    const isVacant = u.status?.toLowerCase() === "available" || u.lease_status?.toLowerCase() === "vacant";
    if (isVacant || !u.contract_end_date) return false;
    const end = new Date(u.contract_end_date);
    end.setHours(0, 0, 0, 0);
    return end <= in60Days; // includes already expired + expiring within 60 days
  }).length;
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  // Total unit area derived from room dimensions entered in Step 4
  const computedUnitArea = rooms.reduce((sum, r) => {
    const a = parseFloat(r.area);
    return sum + (isNaN(a) ? 0 : a * r.count);
  }, 0);

  const masterOptions = {
    furnishing: furnishingTypes.length ? furnishingTypes : fallbackOptions.furnishing,
    leaseStatuses: leaseStatuses.length ? leaseStatuses : fallbackOptions.leaseStatuses,
    rentFrequencies: rentFrequencies.length ? rentFrequencies : fallbackOptions.rentFrequencies,
    maintenance: maintenanceResp.length ? maintenanceResp : fallbackOptions.maintenance,
    deposits: depositTypes.length ? depositTypes : fallbackOptions.deposits,
    views: viewTypes.length ? viewTypes : fallbackOptions.views,
  };

  // --- Property occupancy breakdown for the list ---
  const unitsByProperty = properties.map((prop) => {
    const propUnits = units.filter((u) => u.property_id === prop.id);
    const propOccupied = propUnits.filter(
      (u) => u.status?.toLowerCase() === "occupied" || u.lease_status?.toLowerCase() === "leased" || u.lease_status?.toLowerCase() === "active",
    ).length;
    return { ...prop, total: propUnits.length, occupied: propOccupied };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Units Directory</h2>
          <p className="mt-1 text-muted-foreground">
            Manage all rental and sale units across your portfolio.
          </p>
        </div>
        {role !== "owner" && (
          <Button
            onClick={() => {
              setForm(EMPTY_FORM);
              setRooms([makeRoomEntry("Bedroom")]);
              setStep(1);
              setOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Add Unit
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total Units", value: total, icon: Building2, color: "text-primary" },
          {
            label: "Occupied",
            value: `${occupied} (${occupancyRate}%)`,
            icon: Users,
            color: "text-blue-600",
          },
          { label: "Available", value: available, icon: Home, color: "text-emerald-600" },
          { label: "Renewal Due", value: renewalDue, icon: FileText, color: "text-amber-600" },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {item.label}
              </CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full space-y-4">
        <TabsList>
          <TabsTrigger value="property">Property-wise Occupancy</TabsTrigger>
          <TabsTrigger value="unit">Unit-wise Occupancy</TabsTrigger>
        </TabsList>

        <TabsContent value="property" className="m-0">
          {/* Property Occupancy Summary */}
          {unitsByProperty.some((p) => p.total > 0) && (
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Property-wise Occupancy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {unitsByProperty
                    .filter((p) => p.total > 0)
                    .map((p) => {
                      const rate = p.total > 0 ? Math.round((p.occupied / p.total) * 100) : 0;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setFilterProperty(p.id);
                            setFilterStatus("all");
                            setCurrentTab("unit");
                          }}
                          className="rounded-lg border border-border bg-muted/10 p-3 text-sm cursor-pointer hover:bg-muted/30 transition-colors"
                        >
                          <div className="truncate font-medium" title={p.title}>
                            {p.property_code || p.title}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {p.occupied}/{p.total} occupied
                          </div>
                          <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
                            <div
                              className="h-1.5 rounded-full bg-blue-500 transition-all"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <div className="mt-0.5 text-right text-xs font-semibold text-blue-600">
                            {rate}%
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unit" className="space-y-4 m-0">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search unit, tenant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 max-w-xs"
            />
            <Tabs value={filterStatus} onValueChange={setFilterStatus}>
              <TabsList className="h-9">
                <TabsTrigger value="all" className="text-xs">
                  All ({total})
                </TabsTrigger>
                <TabsTrigger value="occupied" className="text-xs">
                  Occupied ({occupied})
                </TabsTrigger>
                <TabsTrigger value="available" className="text-xs">
                  Available ({available})
                </TabsTrigger>
                <TabsTrigger value="maintenance" className="text-xs">
                  Maintenance
                </TabsTrigger>
                <TabsTrigger value="renewal_due" className="text-xs text-amber-600">
                  Renewal Due ({renewalDue})
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={filterProperty}
              onChange={(e) => setFilterProperty(e.target.value)}
            >
              <option value="all">All Properties</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.property_code ? `${property.property_code} - ` : ""}
                  {property.title}
                </option>
              ))}
            </select>
          </div>

          {renewalDue > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
              <div>
                <strong>{renewalDue} unit{renewalDue !== 1 ? "s" : ""}</strong>{" "}
                {renewalDue !== 1 ? "have contracts" : "has a contract"} that{" "}
                {renewalDue !== 1 ? "are" : "is"} expired or expiring within the next 60 days.
                Units with expired contracts should be updated to{" "}<strong>Vacant</strong> once the tenant vacates.{" "}
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() => setFilterStatus("renewal_due")}
                >
                  View affected units →
                </button>
              </div>
            </div>
          )}

      {/* Units Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/10">
                <tr>
                  {[
                    "Unit Code",
                    "Unit Name",
                    "Property",
                    "Floor",
                    "BR/BA",
                    "Furnishing",
                    "Base Rate",
                    "Lease Status",
                    "Tenant",
                    "Contract Period",
                    "E-Meter",
                    "W-Meter",
                    "Cooling/Chiller",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={13} className="py-12 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-12 text-center text-muted-foreground">
                      No units found
                    </td>
                  </tr>
                ) : (
                  paginatedUnits.map((unit) => {
                    const property = properties.find((item) => item.id === unit.property_id);
                    const propertyLabel = property
                      ? `${property.property_code ? `${property.property_code} - ` : ""}${property.title}`
                      : "-";
                    return (
                      <tr
                        key={unit.id}
                        className="cursor-pointer transition-colors hover:bg-muted/10"
                        onClick={() => setSelectedUnit(unit)}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-medium">
                          {unit.unit_code || unit.unit_ref}
                        </td>
                        <td className="max-w-[160px] truncate px-4 py-3 font-medium">
                          {unit.unit_name || unit.unit_ref}
                        </td>
                        <td className="max-w-[140px] truncate px-4 py-3 text-xs text-muted-foreground">
                          {propertyLabel}
                        </td>
                        <td className="px-4 py-3 text-xs">{unit.floor || "-"}</td>
                        <td className="px-4 py-3 text-xs">
                          {unit.bedrooms}BR / {unit.bathrooms}BA
                        </td>
                        <td className="px-4 py-3 text-xs">{unit.furnishing || "-"}</td>
                        <td className="px-4 py-3 text-xs font-medium">
                          QR {unit.price?.toLocaleString() || 0}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${
                              leaseStatusColors[unit.lease_status || ""] ||
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {unit.lease_status || unit.status || "-"}
                          </span>
                        </td>
                        <td className="max-w-[150px] truncate px-4 py-3 text-xs">
                          {unit.lease_status === "Vacant" || unit.status === "Available" ? "-" : (unit.current_tenant || "-")}
                        </td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                          {unit.lease_status === "Vacant" || unit.status === "Available" ? "-" : (unit.contract_start_date
                            ? `${unit.contract_start_date.slice(0, 10)} → ${unit.contract_end_date?.slice(0, 10) || "-"}`
                            : "-")}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {unit.electricity_meter_no || "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {unit.water_meter_no || "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {unit.cooling_meter_no || "-"}
                        </td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUnit(unit);
                            }}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditUnit(unit);
                            }}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t border-border">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      </TabsContent>
    </Tabs>

      {/* ---- Unit Detail Dialog ---- */}
      <Dialog open={!!selectedUnit} onOpenChange={(next) => !next && setSelectedUnit(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {selectedUnit?.unit_name || selectedUnit?.unit_ref}
            </DialogTitle>
            <DialogDescription>{selectedUnit?.unit_cost_center_code}</DialogDescription>
          </DialogHeader>
          {selectedUnit && (
            <div className="space-y-5 pt-2">
              <section>
                <h3 className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Unit Identity
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-3">
                  {[
                    ["Unit Code", selectedUnit.unit_code],
                    ["Unit Name", selectedUnit.unit_name],
                    ["Cost Center", selectedUnit.unit_cost_center_code],
                    ["Block/Tower", selectedUnit.block_tower],
                    ["Floor", selectedUnit.floor],
                    ["Type", selectedUnit.room_type],
                    ["Usage", selectedUnit.unit_usage],
                    ["Furnishing", selectedUnit.furnishing],
                    ["View Type", selectedUnit.view_type],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {label}
                      </div>
                      <div className="mt-0.5 text-sm font-medium">{value || "-"}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Size & Configuration
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
                  {[
                    ["Bedrooms", selectedUnit.bedrooms],
                    ["Bathrooms", selectedUnit.bathrooms],
                    ["Area (sqm)", selectedUnit.area],
                    ["Balcony (sqm)", selectedUnit.balcony_sqm],
                    ["Total Area (sqm)", selectedUnit.total_area_sqm],
                    ["Parking Slot", selectedUnit.parking_slot_no],
                    ["Max Adults", selectedUnit.max_adults],
                    ["Max Children", selectedUnit.max_children],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {label}
                      </div>
                      <div className="mt-0.5 text-sm font-medium">{value ?? "-"}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Utility Meters
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Electricity", value: selectedUnit.electricity_meter_no, icon: Zap, color: "text-yellow-500" },
                    { label: "Water", value: selectedUnit.water_meter_no, icon: Droplets, color: "text-blue-500" },
                    { label: "Cooling/Chiller", value: selectedUnit.cooling_meter_no, icon: Snowflake, color: "text-cyan-500" },
                  ].map((meter) => (
                    <div
                      key={meter.label}
                      className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <meter.icon className={`h-4 w-4 ${meter.color}`} />
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {meter.label}
                        </div>
                        <div className="font-mono text-sm font-medium">{meter.value || "N/A"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Lease & Financial Details
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-3">
                  {(() => {
                    const isVacant = selectedUnit.lease_status === "Vacant" || selectedUnit.status === "Available";
                    const leaseDetails = [
                      ["Lease Status", selectedUnit.lease_status],
                      ["Unit Status", selectedUnit.status],
                      ["Rent Frequency", selectedUnit.rent_frequency],
                      ["Base Rate", selectedUnit.price ? `QR ${selectedUnit.price.toLocaleString()}` : null],
                      ["Current Rent", selectedUnit.current_rent ? `QR ${selectedUnit.current_rent.toLocaleString()}` : null],
                      ["Security Deposit Type", selectedUnit.security_deposit_type],
                      ["Security Deposit", selectedUnit.security_deposit_amount ? `QR ${selectedUnit.security_deposit_amount.toLocaleString()}` : null],
                      ["Maintenance Resp.", selectedUnit.maintenance_responsibility],
                    ];
                    if (!isVacant) {
                      leaseDetails.push(["Contract No.", selectedUnit.contract_no]);
                    }
                    leaseDetails.push(["Documents Received", selectedUnit.documents_received ? "Yes" : "No"]);
                    if (!isVacant) {
                      leaseDetails.push(["Handover Date", selectedUnit.handover_date]);
                    }
                    return leaseDetails.map(([label, value]) => (
                      <div key={label as string}>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {label}
                        </div>
                        <div className="mt-0.5 text-sm font-medium">{value || "-"}</div>
                      </div>
                    ));
                  })()}
                </div>
              </section>

              {selectedUnit.current_tenant && (() => {
                const isVacant = selectedUnit.lease_status === "Vacant" || selectedUnit.status === "Available";
                return (
                  <section>
                    <h3 className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {isVacant ? "Past Tenant & Contract" : "Current Tenant"}
                    </h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {isVacant ? "Past Tenant Name" : "Tenant Name"}
                        </div>
                        <div className="mt-0.5 text-sm font-medium">{selectedUnit.current_tenant}</div>
                      </div>
                      {isVacant && selectedUnit.contract_no && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Past Contract No.
                          </div>
                          <div className="mt-0.5 text-sm font-medium">{selectedUnit.contract_no}</div>
                        </div>
                      )}
                      {selectedUnit.contract_start_date && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {isVacant ? "Past Contract Period" : "Contract Period"}
                          </div>
                          <div className="mt-0.5 text-sm font-medium">
                            {selectedUnit.contract_start_date.slice(0, 10)} →{" "}
                            {selectedUnit.contract_end_date?.slice(0, 10) || "-"}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                );
              })()}

              {selectedUnit.remarks && (
                <section>
                  <h3 className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Remarks
                  </h3>
                  <p className="text-sm text-muted-foreground">{selectedUnit.remarks}</p>
                </section>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUnit(null)}>
              <X className="mr-1 h-4 w-4" /> Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Add / Edit Unit Dialog (Stepper) ---- */}
      <Dialog open={open} onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setEditingUnitId(null);
          setForm(EMPTY_FORM);
          setRooms([makeRoomEntry("Bedroom")]);
        }
      }}>
        <DialogContent
          className="max-h-[95vh] max-w-3xl overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{editingUnitId ? "Edit Unit" : "Add New Unit"}</DialogTitle>
            <DialogDescription>{editingUnitId ? "Update unit information" : "Register a new unit"} — Step {step} of {STEPS.length}: {STEPS[step - 1].name}</DialogDescription>
          </DialogHeader>

          {/* Stepper Header */}
          <div className="mb-4 flex items-center justify-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    step === s.id
                      ? "bg-primary text-primary-foreground"
                      : step > s.id
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-1 w-12 rounded ${step > s.id ? "bg-primary/30" : "bg-muted"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Identity & Property */}
          {step === 1 && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label>Property *</Label>
                  <Select value={form.property_id} onValueChange={handlePropertyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.property_code ? `${p.property_code} - ` : ""}
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Unit Reference *</Label>
                  <Input
                    value={form.unit_ref || ""}
                    onChange={(e) => handleUnitRefChange(e.target.value)}
                    placeholder="e.g. Flat11"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-1">
                    Unit Code
                    <span className="text-[10px] font-normal text-muted-foreground">(auto-generated)</span>
                  </Label>
                  <Input
                    value={form.unit_code || ""}
                    readOnly
                    className="bg-muted/40 cursor-not-allowed font-mono"
                    placeholder="Select property & enter unit ref"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Unit Name</Label>
                  <Input
                    value={form.unit_name || ""}
                    onChange={(e) => setF("unit_name", e.target.value)}
                    placeholder="Enter unit name manually"
                  />
                </div>
{/* Cost center selection removed as per new logic */}
                <div className="space-y-1">
                  <Label>Block / Tower</Label>
                  <Input
                    value={form.block_tower || ""}
                    onChange={(e) => setF("block_tower", e.target.value)}
                    placeholder="Block A"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Floor</Label>
                  <Input
                    value={form.floor || ""}
                    onChange={(e) => setF("floor", e.target.value)}
                    placeholder="e.g. Ground, 1st..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configuration */}
          {step === 2 && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Unit Type</Label>
                  <Select value={form.room_type} onValueChange={(v) => setF("room_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Apartment","Studio","Villa","Townhouse","Office","Shop","Showroom","Warehouse","Parking","Other"].map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Usage</Label>
                  <Select value={form.unit_usage} onValueChange={(v) => setF("unit_usage", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Residential","Commercial","Retail","Office","Storage","Parking","Common Area","Other"].map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> Bedrooms</Label>
                  <Input type="number" min={0} max={10} value={form.bedrooms} onChange={(e) => setF("bedrooms", Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-1"><Bath className="h-3 w-3" /> Bathrooms</Label>
                  <Input type="number" min={0} max={10} value={form.bathrooms} onChange={(e) => setF("bathrooms", Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Max Adults</Label>
                  <Input type="number" min={1} value={form.max_adults} onChange={(e) => { const a = Number(e.target.value); setF("max_adults", a); setF("total_occupancy", a + (form.max_children || 0)); }} />
                </div>
                <div className="space-y-1">
                  <Label>Max Children</Label>
                  <Input type="number" min={0} value={form.max_children} onChange={(e) => { const c = Number(e.target.value); setF("max_children", c); setF("total_occupancy", (form.max_adults || 0) + c); }} />
                </div>
                <div className="space-y-1">
                  <Label>Total Occupancy</Label>
                  <Input type="number" value={form.total_occupancy} disabled className="bg-muted/40" />
                </div>
                <div className="space-y-1">
                  <Label>Furnishing</Label>
                  <Select value={form.furnishing} onValueChange={(v) => setF("furnishing", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {masterOptions.furnishing.map((o) => (
                        <SelectItem key={o.id} value={o.label}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>View Type</Label>
                  <Select value={form.view_type} onValueChange={(v) => setF("view_type", v)}>
                    <SelectTrigger><SelectValue placeholder="Select view" /></SelectTrigger>
                    <SelectContent>
                      {masterOptions.views.map((o) => (
                        <SelectItem key={o.id} value={o.label}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-1">
                    Area (sqm)
                    <span className="text-[10px] font-normal text-muted-foreground">(auto-calculated from room dimensions in Step 4)</span>
                  </Label>
                  <Input
                    value={computedUnitArea > 0 ? computedUnitArea.toFixed(2) : (form.area || "")}
                    readOnly
                    className="bg-muted/40 cursor-not-allowed"
                    placeholder="Calculated from room dimensions (Step 4)"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Balcony (sqm)</Label>
                  <Input type="number" value={form.balcony_sqm || ""} onChange={(e) => setF("balcony_sqm", toNumberOrUndefined(e.target.value))} placeholder="e.g. 6" />
                </div>
                <div className="space-y-1">
                  <Label>Total Area (sqm)</Label>
                  <Input type="number" value={form.total_area_sqm || ""} onChange={(e) => setF("total_area_sqm", toNumberOrUndefined(e.target.value))} placeholder="e.g. 101" />
                </div>
                <div className="space-y-1">
                  <Label>Parking Slot No.</Label>
                  <Input value={form.parking_slot_no || ""} onChange={(e) => setF("parking_slot_no", e.target.value)} placeholder="P-12" />
                </div>
                {/* Utility Meters */}
                <div className="col-span-2 mt-2 border-t pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Utility Meters</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-500" /> Electricity</Label>
                      <Input value={form.electricity_meter_no || ""} onChange={(e) => setF("electricity_meter_no", e.target.value)} placeholder="Meter No." />
                    </div>
                    <div className="space-y-1">
                      <Label className="flex items-center gap-1"><Droplets className="h-3 w-3 text-blue-500" /> Water</Label>
                      <Input value={form.water_meter_no || ""} onChange={(e) => setF("water_meter_no", e.target.value)} placeholder="Meter No." />
                    </div>
                    <div className="space-y-1">
                      <Label className="flex items-center gap-1"><Snowflake className="h-3 w-3 text-cyan-500" /> Cooling</Label>
                      <Input value={form.cooling_meter_no || ""} onChange={(e) => setF("cooling_meter_no", e.target.value)} placeholder="Meter No." />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Lease & Financials */}
          {step === 3 && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Unit Status</Label>
                  <Select value={form.status} onValueChange={(v) => setF("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Available","Occupied","Reserved","Maintenance","Blocked","Sold","Inactive"].map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Lease Status</Label>
                  <Select value={form.lease_status} onValueChange={(v) => setF("lease_status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {masterOptions.leaseStatuses.map((o) => (
                        <SelectItem key={o.id} value={o.label}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Base Rate (QR)</Label>
                  <Input type="number" value={form.price || ""} onChange={(e) => setF("price", Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Current Rent (QR)</Label>
                  <Input type="number" value={form.current_rent || ""} onChange={(e) => setF("current_rent", toNumberOrUndefined(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Weekend Rate (QR)</Label>
                  <Input type="number" value={form.weekend_price || ""} onChange={(e) => setF("weekend_price", toNumberOrUndefined(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Holiday Rate (QR)</Label>
                  <Input type="number" value={form.holiday_price || ""} onChange={(e) => setF("holiday_price", toNumberOrUndefined(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Cleaning Fee (QR)</Label>
                  <Input type="number" value={form.cleaning_fee || ""} onChange={(e) => setF("cleaning_fee", Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Rent Frequency</Label>
                  <Select value={form.rent_frequency} onValueChange={(v) => setF("rent_frequency", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {masterOptions.rentFrequencies.map((o) => (
                        <SelectItem key={o.id} value={o.label}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Security Deposit Type</Label>
                  <Select value={form.security_deposit_type} onValueChange={(v) => setF("security_deposit_type", v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {masterOptions.deposits.map((o) => (
                        <SelectItem key={o.id} value={o.label}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Security Deposit (QR)</Label>
                  <Input type="number" value={form.security_deposit_amount || ""} onChange={(e) => setF("security_deposit_amount", toNumberOrUndefined(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Maintenance Responsibility</Label>
                  <Select value={form.maintenance_responsibility} onValueChange={(v) => setF("maintenance_responsibility", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {masterOptions.maintenance.map((o) => (
                        <SelectItem key={o.id} value={o.label}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}


          {/* Step 4: Room Dimensions */}
          {step === 4 && (
            <div className="py-2">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Area auto-calculates from length × width. Bedroom &amp; Bathroom entries are capped by counts set in Step 2.
                </p>
                {computedUnitArea > 0 && (
                  <div className="shrink-0 rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Total: {computedUnitArea.toFixed(2)} sqm
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {rooms.map((room, idx) => (
                  <div
                    key={room.id}
                    className="rounded-lg border border-border bg-muted/5 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Room {idx + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-destructive hover:text-destructive"
                        onClick={() => removeRoom(room.id)}
                        disabled={rooms.length === 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Room Type</Label>
                        <Select value={room.room_type} onValueChange={(v) => updateRoom(room.id, "room_type", v)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROOM_TYPES.map((rt) => (
                              <SelectItem key={rt} value={rt}>{rt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Name / Label</Label>
                        <Input
                          className="h-8 text-xs"
                          value={room.name}
                          onChange={(e) => updateRoom(room.id, "name", e.target.value)}
                          placeholder="e.g. Master Bedroom"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">
                          Count
                          {(room.room_type === "Bedroom" || room.room_type === "Bathroom") && (
                            <span className="ml-1 text-[10px] text-muted-foreground">
                              (max: {room.room_type === "Bedroom" ? (form.bedrooms ?? 20) : (form.bathrooms ?? 20)})
                            </span>
                          )}
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          max={room.room_type === "Bedroom" ? (form.bedrooms ?? 20) : room.room_type === "Bathroom" ? (form.bathrooms ?? 20) : 20}
                          className="h-8 text-xs"
                          value={room.count}
                          onChange={(e) => {
                            const maxVal = room.room_type === "Bedroom" ? (form.bedrooms ?? 20) : room.room_type === "Bathroom" ? (form.bathrooms ?? 20) : 20;
                            updateRoom(room.id, "count", Math.min(parseInt(e.target.value) || 1, maxVal));
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Unit of Measure</Label>
                        <Select value={room.uom} onValueChange={(v) => updateRoom(room.id, "uom", v)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sqm">sqm</SelectItem>
                            <SelectItem value="sqft">sqft</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Length</Label>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-8 text-xs"
                          value={room.length}
                          onChange={(e) => updateRoom(room.id, "length", e.target.value)}
                          placeholder="e.g. 4.5"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Width</Label>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-8 text-xs"
                          value={room.width}
                          onChange={(e) => updateRoom(room.id, "width", e.target.value)}
                          placeholder="e.g. 3.5"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Area ({room.uom}) <span className="text-[10px] text-muted-foreground">(auto)</span></Label>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-8 text-xs bg-muted/40 cursor-not-allowed"
                          value={room.area}
                          readOnly
                          placeholder="Auto-calculated"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Capacity (persons)</Label>
                        <Input
                          type="number"
                          min={0}
                          className="h-8 text-xs"
                          value={room.capacity}
                          onChange={(e) => updateRoom(room.id, "capacity", e.target.value)}
                          placeholder="optional"
                        />
                      </div>
                      <div className="col-span-2 space-y-1 sm:col-span-4">
                        <Label className="text-xs">Details / Notes</Label>
                        <Input
                          className="h-8 text-xs"
                          value={room.details}
                          onChange={(e) => updateRoom(room.id, "details", e.target.value)}
                          placeholder="e.g. En-suite, wardrobe, etc."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {ROOM_TYPES.slice(0, 7).map((rt) => {
                  const maxCount =
                    rt === "Bedroom" ? (form.bedrooms ?? 20) :
                    rt === "Bathroom" ? (form.bathrooms ?? 20) : 20;
                  const currentTypeCount = rooms
                    .filter((r) => r.room_type === rt)
                    .reduce((s, r) => s + r.count, 0);
                  const atMax = (rt === "Bedroom" || rt === "Bathroom") && currentTypeCount >= maxCount;
                  return (
                    <Button
                      key={rt}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => !atMax && addRoom(rt)}
                      disabled={atMax}
                      title={atMax ? `Max ${maxCount} ${rt}(s) based on Step 2 configuration` : ""}
                    >
                      <PlusCircle className="mr-1 h-3 w-3" /> {rt}
                      {(rt === "Bedroom" || rt === "Bathroom") && (
                        <span className="ml-1 text-[10px] opacity-60">
                          ({currentTypeCount}/{maxCount})
                        </span>
                      )}
                    </Button>
                  );
                })}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => addRoom()}
                >
                  <Plus className="mr-1 h-3 w-3" /> Other Room
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 flex items-center justify-between gap-2 sm:justify-between">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1 || saving}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {step < STEPS.length ? (
                <Button
                  onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
                  disabled={step === 1 && (!form.property_id || !form.unit_ref)}
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingUnitId ? "Update Unit" : "Create Unit"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
