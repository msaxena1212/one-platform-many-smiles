import { Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Building2 } from "lucide-react";
import { fetchHostProperties, fetchAllProperties, fetchUnits, fetchLeases, createProperty, type Property, supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PropertiesModuleProps {
  role: "admin" | "prop-mgr" | "owner";
}

const MOCK_HOST_ID = "00000000-0000-4000-8000-000000000001";

export function PropertiesModule({ role }: PropertiesModuleProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [occupancyData, setOccupancyData] = useState<Record<string, { units: number; occupancy: string }>>({});
  const [form, setForm] = useState({
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
  });

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      let data: Property[] = [];
      if (role === 'admin') {
        data = await fetchAllProperties();
      } else {
        // For prop-mgr or owner, fetch their specific properties
        // Fallback to MOCK_HOST_ID if no session for testing
        const hostId = session?.user?.id || MOCK_HOST_ID;
        data = await fetchHostProperties(hostId);
      }
      setProperties(data || []);
    } catch (e: any) {
      console.error("Failed to load properties:", e.message);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  useEffect(() => {
    if (properties.length === 0) return;

    (async () => {
      const entries = await Promise.all(properties.map(async (property) => {
        try {
          const units = await fetchUnits({ property_id: property.id });
          const leases = await fetchLeases({ property_id: property.id });
          const activeLeases = (leases || []).filter((lease: any) => lease.lease_status === 'ACTIVE').length;
          return {
            id: property.id,
            units: units?.length ?? 0,
            occupancy: units?.length ? `${Math.round((activeLeases / units.length) * 100)}%` : "0%",
          };
        } catch (error) {
          console.error("Failed to load occupancy metrics for property", property.id, error);
          return {
            id: property.id,
            units: 0,
            occupancy: "N/A",
          };
        }
      }));
      setOccupancyData(Object.fromEntries(entries.map((entry) => [entry.id, entry])));
    })();
  }, [properties]);

  const basePath = role === 'admin' ? '/admin' : role === 'owner' ? '/owner' : '/prop-mgr';

  async function handleCreateProperty() {
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const hostId = session?.user?.id || MOCK_HOST_ID;
      await createProperty({
        host_id: hostId,
        title: form.title,
        description: form.description || null,
        property_type: form.property_type,
        address: form.address,
        city: form.city,
        state: form.state || undefined,
        zip_code: form.zip_code || undefined,
        country: form.country,
        max_guests: Number(form.max_guests) || 1,
        bedrooms: Number(form.bedrooms) || 1,
        beds: Number(form.beds) || 1,
        bathrooms: Number(form.bathrooms) || 1,
        base_price_per_night: Number(form.base_price_per_night) || 0,
        cleaning_fee: Number(form.cleaning_fee) || 0,
        is_active: true,
        room_details: {},
        amenities: [],
      } as Omit<Property, "id" | "created_at" | "property_images">);
      setCreateOpen(false);
      setForm({
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
      });
      await loadProperties();
    } catch (e: any) {
      alert(`Failed to create property: ${e.message}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Properties</h2>
           <p className="text-sm text-muted-foreground mt-1">
             Manage your portfolio and track occupancy.
           </p>
        </div>
        <div className="flex gap-2">
          {role !== 'owner' && (
             <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setCreateOpen(true)}>
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
              {role !== 'owner' && (
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  + Create your first listing
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/10">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Property</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Units</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Occupancy</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right font-medium text-muted-foreground uppercase text-xs tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {properties.map((prop) => {
                    const propertyUnits = occupancyData[prop.id]?.units ?? "—";
                    const propertyOccupancy = occupancyData[prop.id]?.occupancy ?? "—";
                    return (
                      <tr key={prop.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground">
                          {prop.title}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground capitalize">
                          {prop.property_type.replace(/_/g, " ")}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {prop.city}, {prop.country}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {propertyUnits}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {propertyOccupancy}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            prop.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {prop.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => alert("Manage property coming soon!")}>
                            View →
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Property</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-2">
              <Label>Property Name</Label>
              <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Residence / Building name" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Short property description" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Input value={form.property_type} onChange={(e) => setForm((prev) => ({ ...prev, property_type: e.target.value }))} placeholder="apartment / villa / office" />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Zip Code</Label>
              <Input value={form.zip_code} onChange={(e) => setForm((prev) => ({ ...prev, zip_code: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={form.country} onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Bedrooms</Label>
              <Input type="number" value={form.bedrooms} onChange={(e) => setForm((prev) => ({ ...prev, bedrooms: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Beds</Label>
              <Input type="number" value={form.beds} onChange={(e) => setForm((prev) => ({ ...prev, beds: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Bathrooms</Label>
              <Input type="number" value={form.bathrooms} onChange={(e) => setForm((prev) => ({ ...prev, bathrooms: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProperty} disabled={creating || !form.title || !form.address || !form.city}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
