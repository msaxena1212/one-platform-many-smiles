import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/owner/distributions")({
  component: OwnerDistributions,
});

function OwnerDistributions() {
  const distributions = [
    { id: 1, period: "June 2026", amount: 65000, status: "paid", paid_date: "2026-06-15" },
    { id: 2, period: "May 2026", amount: 62500, status: "paid", paid_date: "2026-05-15" },
    { id: 3, period: "April 2026", amount: 58750, status: "pending", paid_date: null },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Distributions</h1>
          <p className="text-sm text-muted-foreground mt-1">Monthly owner payouts and payment history</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₨58,750</p>
            <p className="text-xs text-muted-foreground">July 15, 2026</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Paid (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₨127,500</p>
            <p className="text-xs text-muted-foreground">2 distributions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Bank Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-mono">••• 1234</p>
            <p className="text-xs text-muted-foreground">Riyad Bank</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribution History</CardTitle>
          <CardDescription>All owner payouts and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {distributions.map((dist) => (
              <div key={dist.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{dist.period}</p>
                  <p className="text-sm text-muted-foreground">₨{dist.amount.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={dist.status === "paid" ? "default" : "secondary"}>
                    {dist.status === "paid" ? "Paid" : "Pending"}
                  </Badge>
                  {dist.paid_date && (
                    <span className="text-xs text-muted-foreground">{new Date(dist.paid_date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
