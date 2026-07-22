import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/prop-mgr/leases")({
  component: HostLeases,
});

const mockLeases = [
  { ref: "L-L1", tenant: "Khalid Al-Mutairi", unit: "A-1201", start: "2025-01-01", end: "2025-12-31", rent: "$54,000", status: "ACTIVE" },
  { ref: "L-L2", tenant: "Sara Al-Qahtani", unit: "V-07", start: "2025-03-01", end: "2026-02-28", rent: "$38,400", status: "ACTIVE" },
  { ref: "L-L3", tenant: "Omar Industries LLC", unit: "C-2210", start: "2024-07-01", end: "2025-06-30", rent: "$81,600", status: "EXPIRING" },
  { ref: "L-L4", tenant: "Layla Al-Harbi", unit: "B-0804", start: "2026-01-01", end: "2026-12-31", rent: "$35,400", status: "DRAFT" },
  { ref: "L-L5", tenant: "Fahad Real Estate", unit: "A-1305", start: "2024-09-01", end: "2027-08-31", rent: "$93,600", status: "ACTIVE" },
];

const mockPDCs = [
  { tenant: "Khalid Al-Mutairi", details: "SNB — presents 2025-12-05", amount: "$4,500", status: "HELD" },
  { tenant: "Sara Al-Qahtani", details: "Al Rajhi Bank — deposited 2026-01-10", amount: "$3,200", status: "DEPOSITED" },
  { tenant: "Omar Industries LLC", details: "SAB — cleared 2024-10-01", amount: "$6,800", status: "CLEARED" },
  { tenant: "Layla Al-Harbi", details: "Riyadh Bank — bounced 2026-02-15", amount: "$2,950", status: "BOUNCED" },
];

function HostLeases() {
  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expiring {'<'} 90D</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">1</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Annual Rent Roll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$400,000</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <div className="flex items-center justify-between p-6 pb-4">
          <CardTitle className="text-lg">Leases</CardTitle>
          <Button className="bg-primary hover:bg-primary/90">New lease</Button>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y border-border bg-muted/10">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Ref</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Tenant</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Start</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">End</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Annual Rent</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockLeases.map((lease, i) => (
                  <tr key={i} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{lease.ref}</td>
                    <td className="px-6 py-4 font-medium">{lease.tenant}</td>
                    <td className="px-6 py-4 text-muted-foreground">{lease.unit}</td>
                    <td className="px-6 py-4 text-muted-foreground">{lease.start}</td>
                    <td className="px-6 py-4 text-muted-foreground">{lease.end}</td>
                    <td className="px-6 py-4 font-medium">{lease.rent}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                        lease.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        lease.status === 'EXPIRING' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {lease.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Post-dated cheques (PDC)</CardTitle>
          <CardDescription>Upcoming bank presentations - auto-posted to ledger when cleared</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPDCs.map((pdc, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border last:border-0 pb-4 last:pb-0">
                <div>
                  <div className="font-medium">{pdc.tenant}</div>
                  <div className="text-xs text-muted-foreground">{pdc.details}</div>
                </div>
                <div className="font-medium">{pdc.amount}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
