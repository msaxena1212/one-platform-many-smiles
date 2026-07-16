import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/sales/reservations")({
  component: SalesReservations,
});

function SalesReservations() {
  const reservations = [
    { id: 1, customer: "Ahmed Al-Rashid", unit: "AL-RYD-201", downPayment: "₨85,000", status: "pending_payment", expires: "2026-07-05" },
    { id: 2, customer: "Fatima Al-Saud", unit: "OL-RYD-105", downPayment: "₨120,000", status: "payment_received", expires: "2026-08-20" },
    { id: 3, customer: "Mohammed Al-Otaibi", unit: "SH-JED-401", downPayment: "₨210,000", status: "signed", expires: "2026-09-15" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-sm text-muted-foreground mt-1">Track down payments and contract status</p>
        </div>
        <Button>+ New Reservation</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Expired / Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reservations.map((res) => (
              <div key={res.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{res.customer}</p>
                    <p className="text-sm text-muted-foreground">{res.unit} • Down Payment: {res.downPayment}</p>
                    <p className="text-xs text-muted-foreground mt-1">Expires: {res.expires}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      res.status === "pending_payment" ? "secondary" :
                      res.status === "payment_received" ? "default" : "outline"
                    }>
                      {res.status.replace(/_/g, " ")}
                    </Badge>
                    <Button size="sm" variant="outline">View</Button>
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
