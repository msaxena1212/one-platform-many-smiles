import { useCallback, useEffect, useState } from "react";
import { Building2, Droplets, FileText, Home, Loader2, Plus, Snowflake, Users, X, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createUnit,
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
  type MasterItem,
  type Unit,
} from "@/lib/supabase";

export interface UnitsModuleProps {
  role: "admin" | "prop-mgr" | "owner";
}

type FormState = Partial<Unit> & { property_id: string };

type PropertyOption = {
  id: string;
  title: string;
  property_code?: string;
};

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
  ],
  rentFrequencies: [
    { id: "Monthly", label: "Monthly" },
    { id: "Quarterly", label: "Quarterly" },
    { id: "Yearly", label: "Yearly" },
  ],
  maintenance: [
    { id: "Property Manager", label: "Property Manager" },
    { id: "Owner", label: "Owner" },
    { id: "Tenant", label: "Tenant" },
  ],
  deposits: [
    { id: "Cash", label: "Cash" },
    { id: "PDC", label: "PDC" },
    { id: "Guarantee Cheque", label: "Guarantee Cheque" },
  ],
  views: [
    { id: "Road View", label: "Road View" },
    { id: "City View", label: "City View" },
  ],
};

function toNumberOrUndefined(value: string) {
  if (!value.trim()) return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

export function UnitsModule({ role }: UnitsModuleProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProperty, setFilterProperty] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [furnishingTypes, setFurnishingTypes] = useState<MasterItem[]>([]);
  const [leaseStatuses, setLeaseStatuses] = useState<MasterItem[]>([]);
  const [rentFrequencies, setRentFrequencies] = useState<MasterItem[]>([]);
  const [maintenanceResp, setMaintenanceResp] = useState<MasterItem[]>([]);
  const [depositTypes, setDepositTypes] = useState<MasterItem[]>([]);
  const [viewTypes, setViewTypes] = useState<MasterItem[]>([]);

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

      const loadedProperties =
        role === "admin" ? await fetchAllProperties() : await fetchHostProperties(hostId);

      const loadedUnits = await fetchUnits();
      const propertyIds = (loadedProperties || []).map((property) => property.id);
      const filteredUnits =
        role === "admin"
          ? loadedUnits || []
          : (loadedUnits || []).filter((unit) => propertyIds.includes(unit.property_id));

      setUnits(filteredUnits);
      setProperties((loadedProperties || []).map((property) => ({
        id: property.id,
        title: property.title,
        property_code: property.property_code,
      })));
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
  }, [role]);

  useEffect(() => {
    load();
  }, [load]);

  const setF = (key: keyof FormState, value: FormState[keyof FormState]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const selectedProperty = properties.find((property) => property.id === form.property_id);

  const deriveUnitIdentity = (propertyId: string, unitRef: string) => {
    const property = properties.find((item) => item.id === propertyId);
    const trimmedRef = unitRef.trim();
    const propertyCode = property?.property_code?.trim();

    return {
      unitCode: trimmedRef,
      unitName: propertyCode && trimmedRef ? `${propertyCode} - ${trimmedRef}` : trimmedRef,
      costCenterCode: propertyCode && trimmedRef ? `${propertyCode}-${trimmedRef}` : trimmedRef,
    };
  };

  const handlePropertyChange = (propertyId: string) => {
    setForm((current) => {
      const derived = deriveUnitIdentity(propertyId, current.unit_ref || "");
      return {
        ...current,
        property_id: propertyId,
        unit_code: current.unit_code || derived.unitCode,
        unit_name: current.unit_name || derived.unitName,
        unit_cost_center_code: current.unit_cost_center_code || derived.costCenterCode,
      };
    });
  };

  const handleUnitRefChange = (unitRef: string) => {
    setForm((current) => {
      const previousDerived = deriveUnitIdentity(current.property_id, current.unit_ref || "");
      const nextDerived = deriveUnitIdentity(current.property_id, unitRef);

      return {
        ...current,
        unit_ref: unitRef,
        unit_code:
          !current.unit_code || current.unit_code === current.unit_ref
            ? nextDerived.unitCode
            : current.unit_code,
        unit_name:
          !current.unit_name ||
          current.unit_name === current.unit_ref ||
          current.unit_name === previousDerived.unitName
            ? nextDerived.unitName
            : current.unit_name,
        unit_cost_center_code:
          !current.unit_cost_center_code ||
          current.unit_cost_center_code === previousDerived.costCenterCode
            ? nextDerived.costCenterCode
            : current.unit_cost_center_code,
      };
    });
  };

  async function handleCreate() {
    if (!form.property_id || !form.unit_ref) {
      return alert("Property and Unit Reference are required.");
    }

    setSaving(true);
    try {
      await createUnit({
        ...form,
        balcony_sqm:
          typeof form.balcony_sqm === "number" && Number.isNaN(form.balcony_sqm)
            ? undefined
            : form.balcony_sqm,
        total_area_sqm:
          typeof form.total_area_sqm === "number" && Number.isNaN(form.total_area_sqm)
            ? undefined
            : form.total_area_sqm,
      });
      setOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (error: any) {
      console.error(error);
      alert(`Failed to create unit: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  const filtered = units.filter((unit) => {
    const matchStatus =
      filterStatus === "all" || unit.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchProperty = filterProperty === "all" || unit.property_id === filterProperty;
    const term = search.trim().toLowerCase();
    const matchSearch =
      !term ||
      unit.unit_ref?.toLowerCase().includes(term) ||
      unit.unit_name?.toLowerCase().includes(term) ||
      unit.current_tenant?.toLowerCase().includes(term);

    return matchStatus && matchProperty && matchSearch;
  });

  const total = units.length;
  const occupied = units.filter((unit) => unit.status?.toLowerCase() === "occupied").length;
  const available = units.filter((unit) => unit.status?.toLowerCase() === "available").length;
  const renewalDue = units.filter((unit) => unit.lease_status === "Renewal Due").length;
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  const masterOptions = {
    furnishing: furnishingTypes.length ? furnishingTypes : fallbackOptions.furnishing,
    leaseStatuses: leaseStatuses.length ? leaseStatuses : fallbackOptions.leaseStatuses,
    rentFrequencies: rentFrequencies.length ? rentFrequencies : fallbackOptions.rentFrequencies,
    maintenance: maintenanceResp.length ? maintenanceResp : fallbackOptions.maintenance,
    deposits: depositTypes.length ? depositTypes : fallbackOptions.deposits,
    views: viewTypes.length ? viewTypes : fallbackOptions.views,
  };

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
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Unit
          </Button>
        )}
      </div>

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
                  filtered.map((unit) => {
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
                          {unit.current_tenant || "-"}
                        </td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                          {unit.contract_start_date
                            ? `${unit.contract_start_date.slice(0, 10)} -> ${unit.contract_end_date?.slice(0, 10) || "-"}`
                            : "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {unit.electricity_meter_no || "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {unit.water_meter_no || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedUnit(unit);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedUnit} onOpenChange={(nextOpen) => !nextOpen && setSelectedUnit(null)}>
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
                    <div key={label}>
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
                    ["Area", selectedUnit.area],
                    ["Balcony (sqm)", selectedUnit.balcony_sqm],
                    ["Total Area (sqm)", selectedUnit.total_area_sqm],
                    ["Parking Slot", selectedUnit.parking_slot_no],
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
                    {
                      label: "Electricity",
                      value: selectedUnit.electricity_meter_no,
                      icon: Zap,
                      color: "text-yellow-500",
                    },
                    {
                      label: "Water",
                      value: selectedUnit.water_meter_no,
                      icon: Droplets,
                      color: "text-blue-500",
                    },
                    {
                      label: "Cooling/Chiller",
                      value: selectedUnit.cooling_meter_no,
                      icon: Snowflake,
                      color: "text-cyan-500",
                    },
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
                  {[
                    ["Lease Status", selectedUnit.lease_status],
                    ["Rent Frequency", selectedUnit.rent_frequency],
                    [
                      "Base Rate",
                      selectedUnit.price ? `QR ${selectedUnit.price.toLocaleString()}` : null,
                    ],
                    [
                      "Current Rent",
                      selectedUnit.current_rent
                        ? `QR ${selectedUnit.current_rent.toLocaleString()}`
                        : null,
                    ],
                    ["Security Deposit Type", selectedUnit.security_deposit_type],
                    [
                      "Security Deposit",
                      selectedUnit.security_deposit_amount
                        ? `QR ${selectedUnit.security_deposit_amount.toLocaleString()}`
                        : null,
                    ],
                    ["Maintenance Resp.", selectedUnit.maintenance_responsibility],
                    ["Contract No.", selectedUnit.contract_no],
                    ["Documents Received", selectedUnit.documents_received ? "Yes" : "No"],
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

              {selectedUnit.current_tenant && (
                <section>
                  <h3 className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Current Tenant
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Tenant Name
                      </div>
                      <div className="mt-0.5 text-sm font-medium">{selectedUnit.current_tenant}</div>
                    </div>
                  </div>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Unit</DialogTitle>
            <DialogDescription>Register a new unit with all master data fields</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div>
              <h3 className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Identity
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label>Property *</Label>
                  <Select value={form.property_id} onValueChange={handlePropertyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.property_code ? `${property.property_code} - ` : ""}
                          {property.title}
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
                  <Label>Unit Code</Label>
                  <Input
                    value={form.unit_code || ""}
                    onChange={(e) => setF("unit_code", e.target.value)}
                    placeholder="e.g. Flat11"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Cost Center Code</Label>
                  <Input
                    value={form.unit_cost_center_code || ""}
                    onChange={(e) => setF("unit_cost_center_code", e.target.value)}
                    placeholder="AAA-Flat11"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Unit Name</Label>
                  <Input
                    value={form.unit_name || ""}
                    onChange={(e) => setF("unit_name", e.target.value)}
                    placeholder="AAA - Flat11"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Block / Tower</Label>
                  <Input
                    value={form.block_tower || ""}
                    onChange={(e) => setF("block_tower", e.target.value)}
                    placeholder="1"
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

            <div>
              <h3 className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Configuration
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Unit Type</Label>
                  <Select value={form.room_type} onValueChange={(value) => setF("room_type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Apartment",
                        "Studio",
                        "Villa",
                        "Townhouse",
                        "Office",
                        "Shop",
                        "Showroom",
                        "Warehouse",
                        "Parking",
                        "Other",
                      ].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Usage</Label>
                  <Select value={form.unit_usage} onValueChange={(value) => setF("unit_usage", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Residential",
                        "Commercial",
                        "Retail",
                        "Office",
                        "Storage",
                        "Parking",
                        "Common Area",
                        "Other",
                      ].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Bedrooms</Label>
                  <Input
                    type="number"
                    min={0}
                    max={7}
                    value={form.bedrooms}
                    onChange={(e) => setF("bedrooms", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Bathrooms</Label>
                  <Input
                    type="number"
                    min={0}
                    max={7}
                    value={form.bathrooms}
                    onChange={(e) => setF("bathrooms", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Max Adults</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.max_adults}
                    onChange={(e) => {
                      const adults = Number(e.target.value);
                      setF("max_adults", adults);
                      setF("total_occupancy", adults + (form.max_children || 0));
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Max Children</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.max_children}
                    onChange={(e) => {
                      const children = Number(e.target.value);
                      setF("max_children", children);
                      setF("total_occupancy", (form.max_adults || 0) + children);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Total Occupancy</Label>
                  <Input type="number" value={form.total_occupancy} disabled />
                </div>
                <div className="space-y-1">
                  <Label>Furnishing</Label>
                  <Select value={form.furnishing} onValueChange={(value) => setF("furnishing", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {masterOptions.furnishing.map((option) => (
                        <SelectItem key={option.id} value={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>View Type</Label>
                  <Select value={form.view_type} onValueChange={(value) => setF("view_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterOptions.views.map((option) => (
                        <SelectItem key={option.id} value={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Area (sqm)</Label>
                  <Input
                    value={form.area || ""}
                    onChange={(e) => setF("area", e.target.value)}
                    placeholder="e.g. 95"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Balcony (sqm)</Label>
                  <Input
                    type="number"
                    value={form.balcony_sqm || ""}
                    onChange={(e) => setF("balcony_sqm", toNumberOrUndefined(e.target.value))}
                    placeholder="e.g. 6"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Total Area (sqm)</Label>
                  <Input
                    type="number"
                    value={form.total_area_sqm || ""}
                    onChange={(e) => setF("total_area_sqm", toNumberOrUndefined(e.target.value))}
                    placeholder="e.g. 101"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Parking Slot No.</Label>
                  <Input
                    value={form.parking_slot_no || ""}
                    onChange={(e) => setF("parking_slot_no", e.target.value)}
                    placeholder="P-12"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Utility Meters
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-500" /> Electricity
                  </Label>
                  <Input
                    value={form.electricity_meter_no || ""}
                    onChange={(e) => setF("electricity_meter_no", e.target.value)}
                    placeholder="Meter No."
                  />
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-blue-500" /> Water
                  </Label>
                  <Input
                    value={form.water_meter_no || ""}
                    onChange={(e) => setF("water_meter_no", e.target.value)}
                    placeholder="Meter No."
                  />
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-1">
                    <Snowflake className="h-3 w-3 text-cyan-500" /> Cooling
                  </Label>
                  <Input
                    value={form.cooling_meter_no || ""}
                    onChange={(e) => setF("cooling_meter_no", e.target.value)}
                    placeholder="Meter No."
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lease & Financial
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Unit Status</Label>
                  <Select value={form.status} onValueChange={(value) => setF("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Available", "Occupied", "Reserved", "Maintenance", "Blocked", "Sold", "Inactive"].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Lease Status</Label>
                  <Select value={form.lease_status} onValueChange={(value) => setF("lease_status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {masterOptions.leaseStatuses.map((option) => (
                        <SelectItem key={option.id} value={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Base Rate (QR)</Label>
                  <Input type="number" value={form.price || ""} onChange={(e) => setF("price", Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Weekend Rate (QR)</Label>
                  <Input
                    type="number"
                    value={form.weekend_price || ""}
                    onChange={(e) => setF("weekend_price", toNumberOrUndefined(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Holiday Rate (QR)</Label>
                  <Input
                    type="number"
                    value={form.holiday_price || ""}
                    onChange={(e) => setF("holiday_price", toNumberOrUndefined(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Cleaning Fee (QR)</Label>
                  <Input
                    type="number"
                    value={form.cleaning_fee || ""}
                    onChange={(e) => setF("cleaning_fee", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Rent Frequency</Label>
                  <Select value={form.rent_frequency} onValueChange={(value) => setF("rent_frequency", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {masterOptions.rentFrequencies.map((option) => (
                        <SelectItem key={option.id} value={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Security Deposit Type</Label>
                  <Select
                    value={form.security_deposit_type}
                    onValueChange={(value) => setF("security_deposit_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterOptions.deposits.map((option) => (
                        <SelectItem key={option.id} value={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Security Deposit (QR)</Label>
                  <Input
                    type="number"
                    value={form.security_deposit_amount || ""}
                    onChange={(e) => setF("security_deposit_amount", toNumberOrUndefined(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Maintenance Responsibility</Label>
                  <Select
                    value={form.maintenance_responsibility}
                    onValueChange={(value) => setF("maintenance_responsibility", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {masterOptions.maintenance.map((option) => (
                        <SelectItem key={option.id} value={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Current Rent (QR)</Label>
                  <Input
                    type="number"
                    value={form.current_rent || ""}
                    onChange={(e) => setF("current_rent", toNumberOrUndefined(e.target.value))}
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="docs_received"
                    checked={!!form.documents_received}
                    onChange={(e) => setF("documents_received", e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="docs_received" className="cursor-pointer">
                    Documents Received
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tenant & Contract
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Current Tenant</Label>
                  <Input
                    value={form.current_tenant || ""}
                    onChange={(e) => setF("current_tenant", e.target.value)}
                    placeholder="Tenant name"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Contract No.</Label>
                  <Input
                    value={form.contract_no || ""}
                    onChange={(e) => setF("contract_no", e.target.value)}
                    placeholder="Agreement reference"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Contract Start</Label>
                  <Input
                    type="date"
                    value={form.contract_start_date || ""}
                    onChange={(e) => setF("contract_start_date", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Contract End</Label>
                  <Input
                    type="date"
                    value={form.contract_end_date || ""}
                    onChange={(e) => setF("contract_end_date", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Handover Date</Label>
                  <Input
                    type="date"
                    value={form.handover_date || ""}
                    onChange={(e) => setF("handover_date", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Selected Property</Label>
                  <Input
                    value={
                      selectedProperty
                        ? `${selectedProperty.property_code ? `${selectedProperty.property_code} - ` : ""}${selectedProperty.title}`
                        : ""
                    }
                    disabled
                    className="bg-muted/40"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Remarks</Label>
                  <Input
                    value={form.remarks || ""}
                    onChange={(e) => setF("remarks", e.target.value)}
                    placeholder="Notes for this unit"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
