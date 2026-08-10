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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

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
  { id: 3, name: "Cost Center & Categories" },
  { id: 4, name: "Photos" },
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
  const [customPropertyType, setCustomPropertyType] = useState("");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => { setCurrentPage(1); }, [properties]);

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
      const entries = await Promise.all(
        properties.map(async (property) => {
          try {
            const units = await fetchUnits({ property_id: property.id });
            const occupiedUnits = (units || []).filter(
              (u: any) =>
                u.status?.toLowerCase() === "occupied" ||
                u.lease_status?.toLowerCase() === "leased" ||
                u.lease_status?.toLowerCase() === "active"
            ).length;
            return {
              id: property.id,
              units: units?.length ?? 0,
              occupancy: units?.length
                ? Math.round((occupiedUnits / units.length) * 100) + "%"
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

      const generatedPropertyCode = `PROP-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

      const newProperty = await createProperty(
        buildPropertyPayload({
          hostId, // undefined for demo users → host_id omitted (null in DB)
          title: form.title,
          description: form.description || null,
          propertyType: form.property_type === "Other" ? customPropertyType : form.property_type,
          address: form.address,
          city: form.city,
          state: form.state || undefined,
          zipCode: form.zip_code || undefined,
          country: form.country,
          basePricePerNight: 0,
          cleaningFee: 0,
          isActive: true,
          propertyCode: generatedPropertyCode,
          costCenterCode: form.cost_center_code,
          costCenterName: form.cost_center_name,
          propertyCategory: form.property_category,
          ownershipType: form.ownership_type,
          noOfUnits: form.no_of_units || form.total_units,
          totalUnits: form.total_units || form.no_of_units,
        }) as Omit<Property, "id" | "created_at" | "property_images">,
      );

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
      setCustomPropertyType("");
      setImages([]);
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

  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);
  const paginatedProperties = properties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
                  {paginatedProperties.map((prop) => {
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
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={basePath + "/manage/$id"} params={{ id: prop.id }}>
                              View
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link to={basePath + "/manage/$id"} params={{ id: prop.id }}>
                              Edit
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="p-4 border-t border-border">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)) }} 
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1) }} 
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)) }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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

          <div className="py-2">
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
                    onValueChange={(val) => {
                      setForm((prev) => ({ ...prev, property_type: val }));
                      if (val !== "Other") setCustomPropertyType("");
                    }}
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
                      <SelectItem value="Other">Other (Add new)</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.property_type === "Other" && (
                    <div className="mt-1">
                      <Input
                        placeholder="Enter custom type..."
                        value={customPropertyType}
                        onChange={(e) => setCustomPropertyType(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
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

              </div>
            )}

            {/* Step 3: Cost Center & Categories */}
            {step === 3 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cost Center Code</Label>
                  <Select
                    value={form.cost_center_code}
                    onValueChange={(val) => {
                      const cc = costCenterOptions.find((c) => c.code === val);
                      setForm((prev) => ({
                        ...prev,
                        cost_center_code: val,
                        cost_center_name: cc?.name || prev.cost_center_name,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Cost Center" />
                    </SelectTrigger>
                    <SelectContent>
                      {costCenterOptions.map((opt) => (
                        <SelectItem key={opt.code} value={opt.code}>
                          {opt.code} - {opt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cost Center Name (auto-filled)</Label>
                  <Input
                    readOnly
                    value={form.cost_center_name}
                    className="bg-muted"
                    placeholder="Auto-filled when code is selected"
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
              </div>
            )}

            {/* Step 4: Photos */}
            {step === 4 && (
              <div className="space-y-4">
                <Label>Property Images</Label>
                <ImageUploader 
                  images={images} 
                  onChange={setImages} 
                  categories={['Exterior', 'Interior', 'Floor Plan', 'Other']} 
                />
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
