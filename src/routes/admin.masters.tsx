import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { referenceDropdowns, propertyMasterSeed, unitMasterSeed, accountMasterSeed, accountTransactionsSeed } from "@/lib/reference-data";

export const Route = createFileRoute("/admin/masters")({
  component: AdminMasters,
});

function AdminMasters() {
  const ticketCategories = [
    { id: 1, name: "Plumbing", sla_hours: 24, priority: "medium" },
    { id: 2, name: "Electrical", sla_hours: 12, priority: "high" },
    { id: 3, name: "HVAC", sla_hours: 48, priority: "medium" },
    { id: 4, name: "General Maintenance", sla_hours: 72, priority: "low" },
  ];

  const facilityTypes = [
    { id: 1, name: "Gym", capacity: 50, paid: false },
    { id: 2, name: "Swimming Pool", capacity: 100, paid: false },
    { id: 3, name: "Event Hall", capacity: 200, paid: true },
    { id: 4, name: "Parking Spot", capacity: 1, paid: true },
  ];

  const paymentModes = [
    { id: 1, code: "CASH", name: "Cash" },
    { id: 2, code: "BANK", name: "Bank Transfer" },
    { id: 3, code: "CARD", name: "Credit/Debit Card" },
    { id: 4, code: "SADAD", name: "SADAD" },
    { id: 5, code: "MADA", name: "Mada" },
    { id: 6, code: "PDC", name: "Cheque / PDC" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Masters & Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage system categories and settings</p>
        </div>
      </div>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tickets">Ticket Categories</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="payments">Payment Modes</TabsTrigger>
          <TabsTrigger value="reference">Reference Data</TabsTrigger>
          <TabsTrigger value="accounts">Accounts & Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ticket Categories</CardTitle>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ticketCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50">
                    <div>
                      <p className="font-semibold">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">SLA: {cat.sla_hours} hours</p>
                    </div>
                    <Badge variant={cat.priority === "high" ? "destructive" : "secondary"}>
                      {cat.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facilities" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Facility Types</CardTitle>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Facility
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {facilityTypes.map((fac) => (
                  <div key={fac.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50">
                    <div>
                      <p className="font-semibold">{fac.name}</p>
                      <p className="text-xs text-muted-foreground">Capacity: {fac.capacity}</p>
                    </div>
                    <Badge variant={fac.paid ? "default" : "outline"}>
                      {fac.paid ? "Paid Service" : "Free"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payment Modes</CardTitle>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Mode
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentModes.map((mode) => (
                  <div key={mode.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50">
                    <div>
                      <p className="font-semibold">{mode.name}</p>
                      <p className="text-xs text-muted-foreground">{mode.code}</p>
                    </div>
                    <Button size="sm" variant="ghost">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reference" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reference Data from Property Workbook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Property Master</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {propertyMasterSeed.map(item => (
                    <div key={item.code} className="rounded border p-3 text-sm">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-muted-foreground">Code: {item.code} · {item.type} · {item.status}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Unit Master</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {unitMasterSeed.map(item => (
                    <div key={item.code} className="rounded border p-3 text-sm">
                      <div className="font-medium">{item.unitName}</div>
                      <div className="text-muted-foreground">Tenant: {item.tenant} · Rent: {item.rent}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Dropdown Lists</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {Object.entries(referenceDropdowns).map(([key, values]) => (
                    <div key={key} className="rounded border p-3 text-sm">
                      <div className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="text-muted-foreground">{values.slice(0, 4).map(v => v.label).join(', ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accounts & Accounting Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Master</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {accountMasterSeed.map(item => (
                    <div key={item.code} className="rounded border p-3 text-sm">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-muted-foreground">Code: {item.code} · Type: {item.type}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Transactions</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {accountTransactionsSeed.map((item, idx) => (
                    <div key={`${item.voucher}-${idx}`} className="rounded border p-3 text-sm">
                      <div className="font-medium">{item.voucher}</div>
                      <div className="text-muted-foreground">{item.account} · {item.drCr} · {item.amount} · {item.period}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
