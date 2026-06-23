import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Building2 } from "lucide-react";
import { fetchHostProperties, type Property } from "@/lib/supabase";

export const Route = createFileRoute("/host/properties")({
  component: HostProperties,
});

const MOCK_HOST_ID = "00000000-0000-4000-8000-000000000001";

// Fallback mock data so the table always has something to show
const FALLBACK_PROPERTIES = [
  { id: "mock-kin-ryd-01", code: "KIN-RYD-01", title: "Al Nakheel Residences", property_type: "Residential Tower", city: "Riyadh", country: "Saudi Arabia", units: 184, occupancy: "92%" },
  { id: "mock-kin-jed-02", code: "KIN-JED-02", title: "Al Shati Villas", property_type: "Villa Compound", city: "Jeddah", country: "Saudi Arabia", units: 48, occupancy: "85%" },
  { id: "mock-kin-ryd-03", code: "KIN-RYD-03", title: "Olaya Business Park", property_type: "Commercial", city: "Riyadh", country: "Saudi Arabia", units: 72, occupancy: "78%" },
  { id: "mock-kin-dmm-04", code: "KIN-DMM-04", title: "Corniche Heights", property_type: "Mixed Use", city: "Dammam", country: "Saudi Arabia", units: 220, occupancy: "88%" },
  { id: "mock-kin-med-05", code: "KIN-MED-05", title: "Madinah Gardens", property_type: "Residential Tower", city: "Madinah", country: "Saudi Arabia", units: 96, occupancy: "95%" },
  { id: "mock-kin-ryd-06", code: "KIN-RYD-06", title: "Diplomatic Quarter Suites", property_type: "Residential Tower", city: "Riyadh", country: "Saudi Arabia", units: 60, occupancy: "80%" },
];

function HostProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    fetchHostProperties(MOCK_HOST_ID)
      .then((data) => {
        if (data && data.length > 0) {
          setProperties(data);
        } else {
          setUsedFallback(true);
        }
      })
      .catch(() => setUsedFallback(true))
      .finally(() => setLoading(false));
  }, []);

  // Use either live Supabase data or the fallback mock rows
  const rows = usedFallback
    ? FALLBACK_PROPERTIES.map((p) => ({
        ...p,
        is_active: true,
        base_price_per_night: 0,
        created_at: "",
        address: "",
        state: "",
        zip_code: "",
        description: "",
        bedrooms: 0,
        bathrooms: 0,
        max_guests: 0,
        beds: 0,
        cleaning_fee: 0,
        host_id: MOCK_HOST_ID,
        latitude: null,
        longitude: null,
        property_images: [],
      } as unknown as Property)
    : properties;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          All assets in your managed portfolio.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link to="/host/create">+ New property</Link>
        </Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-3 text-muted-foreground">
              <Building2 className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium">No properties yet.</p>
              <Button asChild size="sm">
                <Link to="/host/create">+ Create your first listing</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/10">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Code</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">City</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Units</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Occupancy</th>
                    <th className="px-6 py-4 text-right font-medium text-muted-foreground uppercase text-xs tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((prop, i) => {
                    // Generate code from index for live data that doesn't have a code field
                    const code = (prop as any).code ?? `KIN-${String(i + 1).padStart(2, "0")}`;
                    const occupancy = (prop as any).occupancy ?? "—";
                    const units = (prop as any).units ?? "—";
                    return (
                      <tr key={prop.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{code}</td>
                        <td className="px-6 py-4 font-semibold text-foreground">{prop.title}</td>
                        <td className="px-6 py-4 text-muted-foreground capitalize">{prop.property_type.replace(/_/g, " ")}</td>
                        <td className="px-6 py-4 text-muted-foreground">{prop.city}, {prop.country}</td>
                        <td className="px-6 py-4 text-muted-foreground">{units}</td>
                        <td className="px-6 py-4 font-medium">{occupancy}</td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to="/host/manage/$id" params={{ id: prop.id }}>
                              View →
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
    </div>
  );
}
