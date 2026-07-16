import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";

export const Route = createFileRoute("/sales/listings")({
  component: SalesListings,
});

function SalesListings() {
  const listings = [
    { id: 1, unit: "AL-RYD-201", property: "Al Nakheel", price: "₨850,000", status: "available", views: 342, inquiries: 12 },
    { id: 2, unit: "AL-RYD-305", property: "Al Nakheel", price: "₨1.2M", status: "reserved", views: 189, inquiries: 5 },
    { id: 3, unit: "SH-JED-401", property: "Al Shati", price: "₨2.1M", status: "available", views: 127, inquiries: 8 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Listings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and monitor property listings</p>
        </div>
        <Button>+ New Listing</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Reserved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">658</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">25</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {listings.map((listing) => (
              <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex-1">
                  <p className="font-semibold">{listing.property} - {listing.unit}</p>
                  <p className="text-sm text-muted-foreground">{listing.price}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">{listing.views} views</p>
                    <p className="font-medium">{listing.inquiries} inquiries</p>
                  </div>
                  <Badge variant={listing.status === "available" ? "default" : "secondary"}>
                    {listing.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="gap-1">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-1">
                      <Edit className="h-4 w-4" />
                    </Button>
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
