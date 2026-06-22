import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { properties } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/properties")({
  head: () => ({ meta: [{ title: "Properties — Kinan Staff" }] }),
  component: AdminProperties,
});

function AdminProperties() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">All Kinan-owned and managed assets across the Kingdom.</p>
        <Button><Plus /> New property</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Code</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">City</th>
                  <th className="px-6 py-3 font-medium text-right">Units</th>
                  <th className="px-6 py-3 font-medium text-right">Occupancy</th>
                  <th className="px-6 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {properties.map(p => (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="px-6 py-3 font-mono text-xs">{p.code}</td>
                    <td className="px-6 py-3 font-medium">{p.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{p.type}</td>
                    <td className="px-6 py-3 text-muted-foreground">{p.district}, {p.city}</td>
                    <td className="px-6 py-3 text-right">{p.units}</td>
                    <td className="px-6 py-3 text-right font-medium">{Math.round(p.occupancy * 100)}%</td>
                    <td className="px-6 py-3 text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/properties/$id" params={{ id: p.id }}>View →</Link>
                      </Button>
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
