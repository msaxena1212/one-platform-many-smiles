import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { units, properties, formatSAR, type Unit } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/units")({
  head: () => ({ meta: [{ title: "Units — ZYNO Property Management Staff" }] }),
  component: AdminUnits,
});

const statusClass: Record<Unit["status"], string> = {
  available: "bg-[oklch(0.55_0.13_155)]/15 text-[oklch(0.4_0.13_155)]",
  reserved: "bg-gold/20 text-gold-foreground",
  sold: "bg-muted text-muted-foreground",
  leased: "bg-primary/10 text-primary",
};

function AdminUnits() {
  const propMap = Object.fromEntries(properties.map(p => [p.id, p.name]));
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-base font-semibold">All units</h3>
            <p className="text-xs text-muted-foreground">{units.length} units across {properties.length} properties</p>
          </div>
          <Button>Add unit</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Unit</th>
                <th className="px-6 py-3 font-medium">Property</th>
                <th className="px-6 py-3 font-medium text-right">BR</th>
                <th className="px-6 py-3 font-medium text-right">Area</th>
                <th className="px-6 py-3 font-medium text-right">Price</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {units.map(u => (
                <tr key={u.id} className="hover:bg-muted/40">
                  <td className="px-6 py-3 font-medium">{u.number}</td>
                  <td className="px-6 py-3 text-muted-foreground">{propMap[u.propertyId]}</td>
                  <td className="px-6 py-3 text-right">{u.bedrooms}</td>
                  <td className="px-6 py-3 text-right">{u.area} sqm</td>
                  <td className="px-6 py-3 text-right font-medium">{formatSAR(u.price)}</td>
                  <td className="px-6 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusClass[u.status]}`}>{u.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
