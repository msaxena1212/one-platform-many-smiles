import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, MapPin, Calendar, Users, Search, Star, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { fetchProperties, type Property } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StayHub — Find your next stay" },
      { name: "description", content: "Book unique homes and experiences all over the world." },
    ],
  }),
  component: Landing,
});

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800";

function PropertyCard({ property }: { property: Property }) {
  const image = property.property_images?.find(i => i.is_primary)?.image_url
    || property.property_images?.[0]?.image_url
    || FALLBACK_IMAGE;

  return (
    <Link
      to="/properties/$id"
      params={{ id: property.id }}
      className="group flex flex-col gap-3"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        <img src={image} alt={property.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white hover:bg-black/20 hover:text-white rounded-full bg-black/10 backdrop-blur-sm">
          <Star className="h-4 w-4" />
        </Button>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground line-clamp-1">{property.city}, {property.country}</h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-3.5 w-3.5 fill-[oklch(0.72_0.13_80)] text-[oklch(0.72_0.13_80)]" />
            <span>4.9</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">{property.title}</p>
        <p className="mt-1 text-sm">
          <span className="font-semibold text-foreground">${property.base_price_per_night}</span>{" "}
          <span className="text-muted-foreground">night</span>
        </p>
      </div>
    </Link>
  );
}

function Landing() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties()
      .then(setProperties)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/properties",
      search: {
        location: location || undefined,
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        guests: guests ? parseInt(guests) : undefined,
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      {/* Hero & Search */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/10 to-background pt-10 pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Find your next <span className="text-primary">perfect stay</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover and book the best properties around the world.
          </p>

          {/* Search Bar */}
          <div className="mt-10 mx-auto max-w-4xl bg-card rounded-full shadow-xl border border-border p-2">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-border">
              <div className="flex-1 w-full px-4 py-2 flex flex-col items-start">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground">Where</label>
                <div className="flex items-center w-full">
                  <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                  <input
                    type="text"
                    placeholder="Search destinations"
                    className="w-full bg-transparent border-none text-sm outline-none placeholder:text-muted-foreground"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 w-full px-4 py-2 flex flex-col items-start">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground">Check in</label>
                <div className="flex items-center w-full">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                  <input
                    type="date"
                    className="w-full bg-transparent border-none text-sm outline-none"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 w-full px-4 py-2 flex flex-col items-start">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground">Check out</label>
                <div className="flex items-center w-full">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                  <input
                    type="date"
                    className="w-full bg-transparent border-none text-sm outline-none"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 w-full px-4 py-2 flex flex-col items-start">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground">Who</label>
                <div className="flex items-center w-full">
                  <Users className="h-4 w-4 text-muted-foreground mr-2" />
                  <input
                    type="number"
                    min="1"
                    placeholder="Add guests"
                    className="w-full bg-transparent border-none text-sm outline-none"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  />
                </div>
              </div>
              <div className="pl-2 pr-2 py-2 w-full md:w-auto flex justify-end">
                <Button type="submit" size="icon" className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured properties */}
      <section className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Featured stays</h2>
              <p className="mt-2 text-muted-foreground">Handpicked properties for your next adventure</p>
            </div>
            <Button asChild variant="ghost">
              <Link to="/properties">View all <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          {loading ? (
            <div className="mt-10 flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <div className="mt-10 text-center text-muted-foreground py-12">
              <p>No properties available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {properties.slice(0, 8).map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
