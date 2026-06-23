import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchProperties, type Property } from "@/lib/supabase";
import { Search, SlidersHorizontal, Star, Loader2 } from "lucide-react";

export const Route = createFileRoute("/properties/")({
  validateSearch: (s: Record<string, unknown>) => ({
    location: s.location as string | undefined,
    checkIn: s.checkIn as string | undefined,
    checkOut: s.checkOut as string | undefined,
    guests: s.guests as number | undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse Properties — StayHub" },
      { name: "description", content: "Browse available properties across all destinations." },
    ],
  }),
  component: PropertiesPage,
});

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800";

function PropertiesPage() {
  const { location: initLocation } = Route.useSearch();
  const [q, setQ] = useState(initLocation || "");
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties()
      .then(setAllProperties)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cities = ["All", ...Array.from(new Set(allProperties.map(p => p.city)))];

  const filtered = allProperties.filter(p =>
    (selectedCity === "All" || p.city === selectedCity) &&
    (q === "" || `${p.title} ${p.city} ${p.country} ${p.property_type}`.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      {/* Hero filter bar */}
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Browse Properties</h1>
          <p className="mt-2 text-muted-foreground">Find your perfect stay from our curated listings.</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, city, type…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>

            {/* City pills */}
            <div className="flex flex-wrap gap-2">
              {cities.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    c === selectedCity
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/20"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Property Grid */}
      <section className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading properties…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <SlidersHorizontal className="mx-auto h-10 w-10 mb-4 opacity-30" />
              <p className="text-lg font-medium">No properties match your filters</p>
              <p className="text-sm mt-1">Try clearing your search or selecting a different city.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setQ(""); setSelectedCity("All"); }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">{filtered.length} propert{filtered.length === 1 ? "y" : "ies"} found</p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map(p => {
                  const image = p.property_images?.find(i => i.is_primary)?.image_url
                    || p.property_images?.[0]?.image_url
                    || FALLBACK_IMAGE;
                  return (
                    <Link
                      key={p.id}
                      to="/properties/$id"
                      params={{ id: p.id }}
                      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={image}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-foreground backdrop-blur capitalize">
                          {p.property_type}
                        </span>
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">{p.city}, {p.country}</p>
                            <h3 className="mt-0.5 text-base font-semibold line-clamp-1">{p.title}</h3>
                          </div>
                          <div className="flex items-center gap-1 text-sm flex-shrink-0">
                            <Star className="h-3.5 w-3.5 fill-[oklch(0.72_0.13_80)] text-[oklch(0.72_0.13_80)]" />
                            <span>4.9</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {p.max_guests} guests · {p.bedrooms} bed · {p.bathrooms} bath
                        </p>
                        <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/50 mt-3">
                          <p className="text-sm">
                            <span className="font-semibold text-foreground">${p.base_price_per_night}</span>
                            <span className="text-muted-foreground"> / night</span>
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                            {p.is_active ? "Available" : "Unavailable"}
                          </span>
                        </div>
                      </CardContent>
                    </Link>
                  );
                })}
              </div>
            </>
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
