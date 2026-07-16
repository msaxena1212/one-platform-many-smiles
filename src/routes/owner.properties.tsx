import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/owner/properties")({
  component: OwnerProperties,
});

function OwnerProperties() {
  const properties = [
    { id: 1, name: "Al Nakheel Residences", city: "Riyadh", units: 184, occupancy: "92%", revenue: "₨125,000" },
    { id: 2, name: "Al Shati Villas", city: "Jeddah", units: 48, occupancy: "85%", revenue: "₨45,000" },
    { id: 3, name: "Olaya Business Park", city: "Riyadh", units: 72, occupancy: "78%", revenue: "₨85,000" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
        <p className="text-sm text-muted-foreground mt-1">Portfolio summary and performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">304</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">85%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₨255K</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {properties.map((prop) => (
              <div key={prop.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{prop.name}</p>
                    <p className="text-sm text-muted-foreground">{prop.city} • {prop.units} units</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      {prop.occupancy}
                    </div>
                    <p className="text-sm font-semibold">{prop.revenue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
