import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Building2, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { buildPropertyPayload } from "@/lib/property-master";
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
  type Property,
} from "@/lib/supabase";

interface PropertiesModuleProps {
  role: "admin" | "prop-mgr" | "owner";
}

type PropertyFormState = {
  title: string;
  description: string;
  property_type: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  max_guests: string;
  bedrooms: string;
  beds: string;
  bathrooms: string;
  base_price_per_night: string;
  cleaning_fee: string;
  cost_center_code: string;
  cost_center_name: string;
  property_category: string;
  ownership_type: string;
  no_of_units: string;
  total_units: string;
};

const MOCK_HOST_ID = "00000000-0000-4000-8000-000000000001";

const EMPTY_FORM: PropertyFormState = {
  title: "",
  description: "",
  property_type: "apartment",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  country: "Qatar",
  max_guests: "1",
  bedrooms: "1",
  beds: "1",
  bathrooms: "1",
  base_price_per_night: "0",
  cleaning_fee: "0",
  cost_center_code: "",
  cost_center_name: "",
  property_category: "",
  ownership_type: "",
  no_of_units: "",
  total_units: "",
};

const STEPS = [
  { id: 1, name: "Identity & Location" },
  { id: 2, name: "Configuration" },
  { id: 3, name: "Financials & Categories" },
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
      const hostId = session?.user?.id || MOCK_HOST_ID;

      const [data, pc, pt, ow, cc] = await Promise.all([
        role === "admin" ? fetchAllProperties() : fetchHostProperties(hostId),
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
      const entries = await Promise.all(
        properties.map(async (property) => {
          try {
            const units = await fetchUnits({ property_id: property.id });
            const leases = await fetchLeases({ property_id: property.id });
            const activeLeases = (leases || []).filter(
              (lease: any) => lease.lease_status === "ACTIVE",
            ).length;
            return {
              id: property.id,
              units: units?.length ?? 0,
              occupancy: units?.length
                ? Math.round((activeLeases / units.length) * 100) + "%"
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
      const hostId = session?.user?.id || MOCK_HOST_ID;

      await createProperty(
        buildPropertyPayload({
          hostId,
          title: form.title,
          description: form.description || null,
          propertyType: form.property_type,
          address: form.address,
          city: form.city,
          state: form.state || undefined,
          zipCode: form.zip_code || undefined,
          country: form.country,
          maxGuests: form.max_guests,
          bedrooms: form.bedrooms,
          beds: form.beds,
          bathrooms: form.bathrooms,
          basePricePerNight: Number(form.base_price_per_night),
          cleaningFee: Number(form.cleaning_fee),
          isActive: true,
          roomDetails: {},
          amenities: [],
          costCenterCode: form.cost_center_code,
          costCenterName: form.cost_center_name,
          propertyCategory: form.property_category,
          ownershipType: form.ownership_type,
          noOfUnits: form.no_of_units || form.total_units,
          totalUnits: form.total_units || form.no_of_units,
        }) as Omit<Property, "id" | "created_at" | "property_images">,
      );

      setCreateOpen(false);
      setForm(EMPTY_FORM);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Properties</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your portfolio and track occupancy.
          </p>
        </div>
        <div className="flex gap-2">
          {role !== "owner" && (
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
          )}
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
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
                  {properties.map((prop) => {
                    const propertyUnits = occupancyData[prop.id]?.units ?? "-";
                    const propertyOccupancy = occupancyData[prop.id]?.occupancy ?? "-";
                    return (
                      <tr key={prop.id} className="transition-colors hover:bg-muted/10">
                        <td className="px-6 py-4 font-semibold text-foreground">
                          {prop.title}
                        </td>
                        <td className="px-6 py-4 capitalize text-muted-foreground">
                          {prop.property_type.replace(/_/g, " ")}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {prop.city}, {prop.country}
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
                        <td className="px-6 py-4 text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={basePath + "/manage/$id"} params={{ id: prop.id }}>
                              View
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Property</DialogTitle>
          </DialogHeader>

          {/* Stepper Header */}
          <div className="mb-4 mt-2 flex items-center justify-center">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={stepperButtonClass(s)}>
                  {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                </div>
                {i < STEPS.length - 1 && <div className={connectorClass(i)} />}
              </div>
            ))}
          </div>
          <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
            Step {step} of {STEPS.length}: {STEPS[step - 1].name}
          </p>

          <div className="min-h-[40vh] py-2">
            {/* Step 1: Identity & Location */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Property Name *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Residence / Building name"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Short property description"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Address *</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State / Zone</Label>
                  <Input
                    value={form.state}
                    onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zip Code</Label>
                  <Input
                    value={form.zip_code}
                    onChange={(e) => setForm((prev) => ({ ...prev, zip_code: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Configuration */}
            {step === 2 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select
                    value={form.property_type}
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, property_type: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propTypeOptions.length > 0 ? (
                        propTypeOptions.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.label}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="building">Building</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="warehouse">Warehouse</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Total Units</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.total_units || form.no_of_units}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        total_units: e.target.value,
                        no_of_units: e.target.value,
                      }))
                    }
                    placeholder="e.g. 10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bedrooms</Label>
                  <Input
                    type="number"
                    value={form.bedrooms}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, bedrooms: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Beds</Label>
                  <Input
                    type="number"
                    value={form.beds}
                    onChange={(e) => setForm((prev) => ({ ...prev, beds: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bathrooms</Label>
                  <Input
                    type="number"
                    value={form.bathrooms}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, bathrooms: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Guests</Label>
                  <Input
                    type="number"
                    value={form.max_guests}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, max_guests: e.target.value }))
                    }
                  />
                </div>
              </div>
            )}

            {/* Step 3: Financials & Categories */}
            {step === 3 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cost Center Name</Label>
                  <Select
                    value={form.cost_center_name}
                    onValueChange={(val) => {
                      const cc = costCenterOptions.find((c) => c.name === val);
                      setForm((prev) => ({
                        ...prev,
                        cost_center_name: val,
                        cost_center_code: cc?.code || prev.cost_center_code,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Cost Center" />
                    </SelectTrigger>
                    <SelectContent>
                      {costCenterOptions.map((opt) => (
                        <SelectItem key={opt.code} value={opt.name}>
                          {opt.code} - {opt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cost Center Code (auto-filled)</Label>
                  <Input
                    readOnly
                    value={form.cost_center_code}
                    className="bg-muted"
                    placeholder="Auto-filled when name is selected"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Property Category</Label>
                  <Select
                    value={form.property_category}
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, property_category: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {propCategoryOptions.length > 0 ? (
                        propCategoryOptions.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.label}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Residential">Residential</SelectItem>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Mixed Use">Mixed Use</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                          <SelectItem value="Industrial">Industrial</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ownership Type</Label>
                  <Select
                    value={form.ownership_type}
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, ownership_type: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Ownership" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownershipOptions.length > 0 ? (
                        ownershipOptions.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.label}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Freehold">Freehold</SelectItem>
                          <SelectItem value="Leasehold">Leasehold</SelectItem>
                          <SelectItem value="Company Owned">Company Owned</SelectItem>
                          <SelectItem value="Joint Ownership">Joint Ownership</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Base Price / Night (QR)</Label>
                  <Input
                    type="number"
                    value={form.base_price_per_night}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        base_price_per_night: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cleaning Fee (QR)</Label>
                  <Input
                    type="number"
                    value={form.cleaning_fee}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, cleaning_fee: e.target.value }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} disabled={step === 1 || creating}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {step < STEPS.length ? (
                <Button
                  onClick={handleNext}
                  disabled={step === 1 && (!form.title || !form.address || !form.city)}
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreateProperty}
                  disabled={creating || !form.title || !form.address || !form.city}
                >
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Property
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
