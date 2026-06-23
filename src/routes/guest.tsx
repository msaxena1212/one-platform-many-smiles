import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar as CalendarIcon, CheckCircle2, Loader2, Clock, CheckCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchGuestBookings, type Booking } from "@/lib/supabase";

export const Route = createFileRoute("/guest")({
  component: GuestDashboard,
});

// Using the seeded guest ID
const MOCK_GUEST_ID = "00000000-0000-4000-8000-000000000002";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=400";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  CONFIRMED: { label: "Confirmed", color: "bg-green-100 text-green-700", icon: CheckCheck },
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
  COMPLETED: { label: "Completed", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
};

function BookingCard({ booking }: { booking: Booking }) {
  const prop = booking.properties;
  const image = (prop as any)?.property_images?.[0]?.image_url || FALLBACK_IMAGE;
  const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="flex flex-col sm:flex-row gap-4 border border-border rounded-xl p-4 bg-muted/20 hover:bg-muted/40 transition-colors">
      <div className="w-full sm:w-32 h-24 sm:h-auto rounded-lg overflow-hidden bg-muted flex-shrink-0">
        <img src={image} alt={prop?.title || "Property"} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-foreground">{prop?.title || "Property"}</h3>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold flex-shrink-0 ${status.color}`}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-3.5 w-3.5" /> {prop?.city}, {prop?.country}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <CalendarIcon className="h-3.5 w-3.5" />
            {new Date(booking.check_in).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} —
            {new Date(booking.check_out).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Total: ${booking.total_price}</span>
          <div className="flex gap-2">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link to="/properties/$id" params={{ id: booking.property_id }}>View property</Link>
            </Button>
            {booking.status === "CONFIRMED" && (
              <Button size="sm" variant="outline">Message Host</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GuestDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuestBookings(MOCK_GUEST_ID)
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter(b => b.status === "CONFIRMED" || b.status === "PENDING");
  const past = bookings.filter(b => b.status === "COMPLETED" || b.status === "CANCELLED");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, Alice 👋</h1>
            <p className="mt-2 text-muted-foreground">Manage your upcoming trips and past stays.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            
            <div className="md:col-span-2 space-y-6">

              {/* Upcoming */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Upcoming Trips</h2>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : upcoming.length === 0 ? (
                  <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
                    <CalendarIcon className="mx-auto h-8 w-8 mb-3 opacity-30" />
                    <p>No upcoming trips. Time to plan your next adventure!</p>
                    <Button asChild className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Link to="/">Browse Properties</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcoming.map(b => <BookingCard key={b.id} booking={b} />)}
                  </div>
                )}
              </div>

              {/* Past */}
              {!loading && past.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Past Stays</h2>
                  <div className="space-y-4">
                    {past.map(b => <BookingCard key={b.id} booking={b} />)}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div>
              <Card className="border-border shadow-md sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start border border-border hover:bg-muted/50">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" /> Profile Settings
                  </Button>
                  <Button variant="ghost" className="w-full justify-start border border-border hover:bg-muted/50">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" /> Payment Methods
                  </Button>
                  <Button variant="ghost" className="w-full justify-start border border-border hover:bg-muted/50">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" /> Wishlists
                  </Button>
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2">
                    <Link to="/">Find new stay</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
