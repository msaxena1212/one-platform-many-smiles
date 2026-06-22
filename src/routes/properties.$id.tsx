import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Building, Calendar, CheckCircle2 } from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { properties, units as allUnits, formatSAR, type Unit, type Property } from "@/lib/mock-data";

export const Route = createFileRoute("/properties/$id")({
  head: ({ params }) => {
    const p = properties.find((x) => x.id === params.id);
    return {
      meta: [
        { title: `${p?.name ?? "Property"} — Kinan` },
        { name: "description", content: p ? `${p.name} in ${p.district}, ${p.city} — ${p.units} units.` : "Kinan property" },
      ],
    };
  },
  loader: ({ params }): { property: Property; units: Unit[] } => {
    const property = properties.find((p) => p.id === params.id);
    if (!property) throw notFound();
    const propUnits = allUnits.filter((u) => u.propertyId === params.id);
    return { property, units: propUnits };
  },
  component: PropertyDetail,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold">Property not found</h1>
        <Button asChild className="mt-6"><Link to="/properties">Back to properties</Link></Button>
      </div>
      <PublicFooter />
    </div>
  ),
});

function PropertyDetail() {
  const { property, units }: { property: Property; units: Unit[] } = Route.useLoaderData();
  const statusStyles: Record<string, string> = {
    available: "bg-[oklch(0.55_0.13_155)]/10 text-[oklch(0.4_0.13_155)] border-[oklch(0.55_0.13_155)]/30",
    reserved: "bg-gold/15 text-gold-foreground border-gold/40",
    sold: "bg-muted text-muted-foreground border-border",
    leased: "bg-primary/10 text-primary border-primary/30",
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <div className="relative h-[42vh] min-h-[320px] w-full overflow-hidden">
        <img src={property.image} alt={property.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
          <Link to="/properties" className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-card/90 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur hover:bg-card">
            <ArrowLeft className="h-3.5 w-3.5" /> All properties
          </Link>
          <p className="text-xs uppercase tracking-widest text-gold">{property.code} · {property.type}</p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{property.name}</h1>
          <p className="mt-2 inline-flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" /> {property.district}, {property.city}
          </p>
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold">About this development</h2>
          <p className="mt-3 text-muted-foreground">
            {property.name} is a {property.type.toLowerCase()} located in the heart of {property.district}, {property.city}.
            With {property.units} total units and {Math.round(property.occupancy * 100)}% current occupancy,
            it offers a curated mix of amenities, dedicated facilities management and 24/7 community services.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Fact icon={<Building className="h-4 w-4" />} k="Units" v={String(property.units)} />
            <Fact icon={<CheckCircle2 className="h-4 w-4" />} k="Occupancy" v={`${Math.round(property.occupancy * 100)}%`} />
            <Fact icon={<Calendar className="h-4 w-4" />} k="Handover" v="Ready now" />
          </div>

          <h2 className="mt-12 text-xl font-semibold">Available units</h2>
          {units.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No published units on this property yet.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Unit</th>
                    <th className="px-4 py-3 font-medium">BR</th>
                    <th className="px-4 py-3 font-medium">Area</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {units.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 font-medium">{u.number}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.bedrooms}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.area} sqm</td>
                      <td className="px-4 py-3 font-medium">{formatSAR(u.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusStyles[u.status]}`}>
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Starting from</p>
              <p className="mt-1 text-3xl font-semibold">{formatSAR(Math.min(...(units.length ? units.map(u => u.price) : [0])) || 0)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Indicative — final pricing on visit</p>
              <div className="mt-5 space-y-2">
                <Button asChild className="w-full"><Link to="/book-visit">Book a visit</Link></Button>
                <Button asChild variant="outline" className="w-full"><Link to="/contact">Talk to sales</Link></Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-semibold">Amenities</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Covered parking</li>
                <li>• 24/7 security & concierge</li>
                <li>• Swimming pool & gym</li>
                <li>• Smart home controls</li>
                <li>• Family majlis & event hall</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </section>

      <PublicFooter />
    </div>
  );
}

function Fact({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon} {k}</div>
      <p className="mt-1 text-lg font-semibold">{v}</p>
    </div>
  );
}
