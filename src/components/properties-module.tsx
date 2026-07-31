import { Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Building2 } from "lucide-react";
import { fetchHostProperties, fetchAllProperties, fetchUnits, fetchLeases, type Property, supabase } from "@/lib/supabase";

interface PropertiesModuleProps {
  role: "admin" | "prop-mgr" | "owner";
}

const MOCK_HOST_ID = "00000000-0000-4000-8000-000000000001";

export function PropertiesModule({ role }: PropertiesModuleProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [occupancyData, setOccupancyData] = useState<Record<string, { units: number; occupancy: string }>>({});

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
             <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => alert("Create property coming soon!")}>
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
                <Button size="sm" onClick={() => alert("Create property coming soon!")}>
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
    </div>
  );
}
