import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

export const Route = createFileRoute("/sales/contracts")({
  component: SalesContracts,
});

function SalesContracts() {
  const contracts = [
    { id: 1, customer: "Ahmed Al-Rashid", unit: "AL-RYD-201", contractNo: "CNT-001-2026", amount: "₨850,000", status: "signed", signedDate: "2026-06-20" },
    { id: 2, customer: "Fatima Al-Saud", unit: "OL-RYD-105", contractNo: "CNT-002-2026", amount: "₨1.2M", status: "pending", signedDate: null },
    { id: 3, customer: "Mohammed Al-Otaibi", unit: "SH-JED-401", contractNo: "CNT-003-2026", amount: "₨2.1M", status: "completed", signedDate: "2026-06-15" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage sales contracts and e-signatures</p>
        </div>
        <Button className="gap-2">
          <FileText className="h-4 w-4" />
          New Contract
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Signature</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Signed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₨4.15M</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div key={contract.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{contract.customer}</p>
                    <p className="text-sm text-muted-foreground">{contract.unit} • {contract.contractNo}</p>
                    <p className="text-sm font-medium mt-2">{contract.amount}</p>
                    {contract.signedDate && (
                      <p className="text-xs text-muted-foreground">Signed: {contract.signedDate}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      contract.status === "pending" ? "secondary" :
                      contract.status === "signed" ? "default" : "outline"
                    }>
                      {contract.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
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
