import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Building2, Search, MapPin, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { properties } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/properties")({
  head: () => ({ meta: [{ title: "Properties — ZYNO Property Management" }] }),
  component: AdminProperties,
});

function occColor(occ: number) {
  if (occ >= 0.95) return "bg-emerald-500/15 text-emerald-700 border-emerald-300";
  if (occ >= 0.75) return "bg-blue-500/15 text-blue-700 border-blue-300";
  if (occ >= 0.50) return "bg-amber-500/15 text-amber-700 border-amber-300";
  return "bg-red-500/15 text-red-700 border-red-300";
}

function AdminProperties() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const types = ["all", ...Array.from(new Set(properties.map(p => p.type)))];

  const filtered = properties.filter(p => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      (p.district || "").toLowerCase().includes(q) ||
      (p.owner_landlord || "").toLowerCase().includes(q);
    const matchType = filterType === "all" || p.type === filterType;
    return matchSearch && matchType;
  });

  const totalUnits = properties.reduce((a, p) => a + p.units, 0);
  const totalOccupied = properties.reduce((a, p) => a + Math.round(p.occupancy * p.units), 0);
  const avgOcc = totalUnits > 0 ? totalOccupied / totalUnits : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-muted-foreground mt-1">
            {properties.length} properties · Doha, Qatar · Manager: Jithin Abdul Latheef
          </p>
        </div>
        <Button><Plus className="w-4 h-4 mr-1" /> New property</Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Building2, label: "Total Properties", value: properties.length.toString(), sub: "Across Doha" },
          { icon: Users,     label: "Total Units",      value: totalUnits.toString(),           sub: "All buildings" },
          { icon: TrendingUp,label: "Occupied Units",   value: totalOccupied.toString(),        sub: `of ${totalUnits}` },
          { icon: MapPin,    label: "Avg Occupancy",    value: `${Math.round(avgOcc * 100)}%`,  sub: "Portfolio-wide" },
        ].map(({ icon: Icon, label, value, sub }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2 bg-primary/10">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, code, area or owner..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map(t => (
            <Button
              key={t}
              size="sm"
              variant={filterType === t ? "default" : "outline"}
              onClick={() => setFilterType(t)}
              className="capitalize"
            >
              {t === "all" ? "All types" : t}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Owner / Landlord</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium text-center">Floors</th>
                  <th className="px-4 py-3 font-medium text-center">Units</th>
                  <th className="px-4 py-3 font-medium text-center">Parking</th>
                  <th className="px-4 py-3 font-medium text-center">Occupancy</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {p.code}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium leading-tight">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.street_building_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{p.owner_landlord || "—"}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.ownership_type}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {p.district}, {p.city}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {p.property_category || p.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.no_of_floors || "—"}
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      {p.units}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {p.parking_count ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${occColor(p.occupancy)}`}>
                        {Math.round(p.occupancy * 100)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link to="/prop-mgr/manage/$id" params={{ id: p.id }}>Manage</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">
                      No properties match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-right">
        Showing {filtered.length} of {properties.length} properties · Data source: Real Estate - Simerjith.xlsx
      </p>
    </div>
  );
}
