import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Home, Inbox, BarChart, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchHostProperties, type Property } from "@/lib/supabase";

export const Route = createFileRoute("/host/")({
  component: HostDashboard,
});

// The seeded host ID from our seed script
const MOCK_HOST_ID = "00000000-0000-4000-8000-000000000001";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=100";

function HostDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostProperties(MOCK_HOST_ID)
      .then(setProperties)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeCount = properties.filter(p => p.is_active).length;
  const monthlyEarnings = properties.reduce((sum, p) => sum + p.base_price_per_night * 15, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Portfolio Overview</h2>
          <p className="text-sm text-muted-foreground">Manage your properties and reservations.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/host/properties"><Plus className="mr-2 h-4 w-4" /> New property</Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Earnings</CardTitle>
                <BarChart className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${monthlyEarnings.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Estimated (15 nights/property)</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
                <Home className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{activeCount}</div>
                <p className="text-xs text-muted-foreground">Properties live</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unread Messages</CardTitle>
                <Inbox className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">2</div>
                <p className="text-xs text-muted-foreground">Requires attention</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Check-ins</CardTitle>
                <CalendarIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">5</div>
                <p className="text-xs text-muted-foreground">Within next 7 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Properties Table */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Your Properties</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading properties...</span>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Home className="mx-auto h-12 w-12 mb-4 opacity-30" />
                  <p className="font-medium">No properties yet</p>
                  <p className="text-sm mt-1">Get started by creating your first listing.</p>
                  <Button asChild className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link to="/host/create"><Plus className="mr-2 h-4 w-4" /> Create listing</Link>
                  </Button>
                </div>
              ) : (
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Property</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Price/Night</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Location</th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((property) => {
                        const thumb = property.property_images?.find(i => i.is_primary)?.image_url
                          || property.property_images?.[0]?.image_url
                          || FALLBACK_IMAGE;
                        return (
                          <tr key={property.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="p-4 align-middle font-medium">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0">
                                  <img src={thumb} className="object-cover h-full w-full" alt={property.title} />
                                </div>
                                <span className="line-clamp-1">{property.title}</span>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                property.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {property.is_active ? "Active" : "Unlisted"}
                              </span>
                            </td>
                            <td className="p-4 align-middle">${property.base_price_per_night}</td>
                            <td className="p-4 align-middle text-muted-foreground">{property.city}, {property.country}</td>
                            <td className="p-4 align-middle text-right">
                              <Button asChild variant="outline" size="sm">
                                <Link to="/host/manage/$id" params={{ id: property.id }}>Manage</Link>
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
