import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/owner/approvals")({
  component: OwnerApprovals,
});

function OwnerApprovals() {
  const approvals = [
    { id: 1, type: "Lease below declared", property: "Al Nakheel", amount: "₨1,800", status: "pending", created: "2026-06-20" },
    { id: 2, type: "Renewal discount (12%)", property: "Al Shati Villas", amount: "-5%", status: "pending", created: "2026-06-18" },
    { id: 3, type: "Maintenance cost approval", property: "Olaya Park", amount: "₨8,500", status: "approved", created: "2026-06-15" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">Lease and operational approval requests</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Approval Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {approvals.map((req) => (
              <div key={req.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{req.type}</p>
                    <p className="text-sm text-muted-foreground">{req.property}</p>
                    <p className="text-sm font-medium mt-2">{req.amount}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      req.status === "approved" ? "default" : 
                      req.status === "pending" ? "secondary" : "destructive"
                    }>
                      {req.status}
                    </Badge>
                    {req.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Approve</Button>
                        <Button size="sm" variant="outline">Reject</Button>
                      </div>
                    )}
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
