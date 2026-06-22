import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { properties } from "@/lib/mock-data";

export const Route = createFileRoute("/properties")({
  head: () => ({
    meta: [
      { title: "Properties — Kinan" },
      { name: "description", content: "Browse Kinan developments across Riyadh, Jeddah, Dammam and Madinah — residential, villa, mixed-use and commercial." },
    ],
  }),
  component: PropertiesPage,
});

function PropertiesPage() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState<string>("All");
  const cities = ["All", ...Array.from(new Set(properties.map(p => p.city)))];

  const filtered = properties.filter(p =>
    (city === "All" || p.city === city) &&
    (q === "" || `${p.name} ${p.district} ${p.code}`.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-widest text-gold">Inventory</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Properties</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Live inventory across Kinan developments. Filter by city or search by name and code.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search properties…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="max-w-xs bg-background"
            />
            <div className="flex flex-wrap gap-2">
              {cities.map(c => (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    c === city ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No properties match your filters.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(p => (
                <Link
                  key={p.id}
                  to="/properties/$id"
                  params={{ id: p.id }}
                  className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-foreground backdrop-blur">
                      {p.type}
                    </span>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground">{p.code} · {p.district}, {p.city}</p>
                    <h3 className="mt-1 text-lg font-semibold">{p.name}</h3>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{p.units} units</span>
                      <span className="font-medium text-primary">{Math.round(p.occupancy * 100)}% occupied</span>
                    </div>
                  </CardContent>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-12 flex justify-center">
            <Button asChild variant="outline">
              <Link to="/book-visit">Can't decide? Book a visit →</Link>
            </Button>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
