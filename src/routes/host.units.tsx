import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/host/units")({
  component: HostUnits,
});

const mockUnits = [
  { unit: "A-1201", property: "Al Nakheel Residences", br: 2, area: "110 sqm", price: "SAR 880,000", status: "AVAILABLE" },
  { unit: "A-1202", property: "Al Nakheel Residences", br: 3, area: "145 sqm", price: "SAR 1,180,000", status: "RESERVED" },
  { unit: "A-1305", property: "Al Nakheel Residences", br: 3, area: "152 sqm", price: "SAR 1,240,000", status: "SOLD" },
  { unit: "V-07", property: "Al Shati Villas", br: 5, area: "420 sqm", price: "SAR 3,400,000", status: "AVAILABLE" },
  { unit: "V-12", property: "Al Shati Villas", br: 4, area: "360 sqm", price: "SAR 2,900,000", status: "LEASED" },
  { unit: "C-2210", property: "Corniche Heights", br: 2, area: "98 sqm", price: "SAR 760,000", status: "AVAILABLE" },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'AVAILABLE': return 'bg-green-100 text-green-700';
    case 'RESERVED': return 'bg-amber-100 text-amber-700';
    case 'SOLD': return 'bg-slate-200 text-slate-700';
    case 'LEASED': return 'bg-blue-100 text-blue-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

function HostUnits() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">All units</h2>
          <p className="text-xs text-muted-foreground">6 units across 6 properties</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">Add unit</Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/10">
                <tr>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Unit</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Property</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">BR</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Area</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockUnits.map((unit, i) => (
                  <tr key={i} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-medium">{unit.unit}</td>
                    <td className="px-6 py-4 text-muted-foreground">{unit.property}</td>
                    <td className="px-6 py-4 text-muted-foreground">{unit.br}</td>
                    <td className="px-6 py-4 text-muted-foreground">{unit.area}</td>
                    <td className="px-6 py-4 font-medium">{unit.price}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${getStatusStyle(unit.status)}`}>
                        {unit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
