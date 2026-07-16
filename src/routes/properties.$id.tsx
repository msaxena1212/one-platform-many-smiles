import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, MapPin, Share, Heart, Users, Bed, Bath, Wifi, Car, Tv, CheckCircle, ChevronLeft, Loader2, AlertCircle, Coffee, Wind, Briefcase, Check } from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { fetchPropertyById, supabase, type Property } from "@/lib/supabase";
import { toast } from "sonner";

const AMENITIES = [
  // General
  { id: "wifi", label: "Fast WiFi", types: ["all"] },
  { id: "ac", label: "Air Conditioning", types: ["all"] },
  { id: "tv", label: "Smart TV", types: ["all"] },
  { id: "workspace", label: "Dedicated Workspace", types: ["all"] },
  { id: "parking", label: "Free Parking", types: ["all"] },
  { id: "washer", label: "Washer/Dryer", types: ["all"] },
  // Kitchen
  { id: "kitchen", label: "Fully Equipped Kitchen", types: ["apartment", "villa", "house", "penthouse", "townhouse"] },
  { id: "kitchenette", label: "Kitchenette", types: ["studio"] },
  // Luxury / Villa / Penthouse
  { id: "private_pool", label: "Private Pool", types: ["villa", "house", "penthouse"] },
  { id: "servant_quarters", label: "Servant Quarters", types: ["villa", "house"] },
  { id: "rooftop_terrace", label: "Rooftop Terrace", types: ["penthouse", "villa"] },
  { id: "elevator", label: "Private Elevator", types: ["penthouse"] },
  { id: "garden", label: "Private Garden", types: ["villa", "house", "townhouse", "penthouse"] },
  // Shared / Apartment
  { id: "shared_gym", label: "Shared Gym", types: ["apartment", "studio"] },
  { id: "community_pool", label: "Community Pool", types: ["apartment", "studio", "townhouse"] },
  { id: "garage", label: "Garage Parking", types: ["villa", "house", "townhouse"] },
];

export const Route = createFileRoute("/properties/$id")({
  component: PropertyDetail,
});

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1600607687931-cecebd802404?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800",
];

const MOCK_GUEST_ID = "00000000-0000-4000-8000-000000000002";

function PropertyDetail() {
  const { id } = Route.useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState({ checkIn: "", checkOut: "", guests: "1" });
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    fetchPropertyById(id)
      .then(setProperty)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const nights = booking.checkIn && booking.checkOut
    ? Math.max(0, Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const serviceFee = property ? Math.round(property.base_price_per_night * nights * 0.12) : 0;
  const total = property ? (property.base_price_per_night * nights) + (property.cleaning_fee || 0) + serviceFee : 0;

  const handleReserve = async () => {
    if (!property || !booking.checkIn || !booking.checkOut) {
      toast.error("Please select check-in and check-out dates.");
      return;
    }
    setReserving(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        property_id: property.id,
        guest_id: MOCK_GUEST_ID,
        check_in: booking.checkIn,
        check_out: booking.checkOut,
        guests_count: parseInt(booking.guests),
        total_price: total,
        status: "PENDING",
      });
      if (error) throw error;
      toast.success("🎉 Reservation submitted! Check your Guest Dashboard.");
    } catch (err: any) {
      toast.error("Failed to reserve: " + err.message);
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold">Property not found</h2>
            <Button asChild className="mt-4">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const images = property.property_images?.map(i => i.image_url) || FALLBACK_IMAGES;
  const primaryImage = images[0] || FALLBACK_IMAGES[0];
  const galleryImages = [...images.slice(1), ...FALLBACK_IMAGES].slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          
          <div className="mb-6 flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="rounded-full">
              <Link to="/"><ChevronLeft className="h-5 w-5" /></Link>
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{property.title}</h1>
          </div>

          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 font-medium">
                <Star className="h-4 w-4 fill-[oklch(0.72_0.13_80)] text-[oklch(0.72_0.13_80)]" />
                <span>4.92</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{property.city}, {property.country}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2"><Share className="h-4 w-4" /> Share</Button>
              <Button variant="ghost" size="sm" className="gap-2"><Heart className="h-4 w-4" /> Save</Button>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden mb-12">
            <div className="relative aspect-video md:aspect-auto">
              <img src={primaryImage} alt={property.title} className="w-full h-full object-cover" />
            </div>
            <div className="hidden md:grid grid-cols-2 gap-2">
              {galleryImages.map((img, i) => (
                <img key={i} src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Property details */}
            <div className="lg:col-span-2 space-y-10">
              <div className="flex justify-between items-center border-b border-border pb-6">
                <div>
                  <h2 className="text-xl font-semibold capitalize">Entire {property.property_type} hosted by ZYNO Property Management</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1"><Users className="h-4 w-4"/> {property.max_guests} guests</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Bed className="h-4 w-4"/> {property.bedrooms} bedrooms</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Bath className="h-4 w-4"/> {property.bathrooms} baths</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl flex-shrink-0">
                  K
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">About this space</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description || `Experience luxury living in this stunning ${property.property_type} located in the heart of ${property.city}. Featuring modern amenities, spacious rooms, and breathtaking views — the perfect getaway.`}
                </p>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div className="space-y-4 border-t border-border pt-10">
                  <h3 className="text-xl font-semibold">What this place offers</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {property.amenities.map(amenityId => {
                      const amenityInfo = AMENITIES.find(a => a.id === amenityId);
                      if (!amenityInfo) return null;
                      return (
                        <div key={amenityId} className="flex items-center gap-3 text-muted-foreground">
                          {/* Use an icon based on ID, fallback to Check */}
                          {amenityId === "wifi" && <Wifi className="h-5 w-5" />}
                          {amenityId === "parking" && <Car className="h-5 w-5" />}
                          {amenityId === "tv" && <Tv className="h-5 w-5" />}
                          {amenityId === "kitchen" && <Coffee className="h-5 w-5" />}
                          {amenityId === "ac" && <Wind className="h-5 w-5" />}
                          {amenityId === "workspace" && <Briefcase className="h-5 w-5" />}
                          {!["wifi", "parking", "tv", "kitchen", "ac", "workspace"].includes(amenityId) && <Check className="h-5 w-5" />}
                          {amenityInfo.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {property.room_details && (Array.isArray(property.room_details) ? property.room_details.length > 0 : Object.keys(property.room_details).length > 0) && (
                <div className="space-y-4 border-t border-border pt-10">
                  <h3 className="text-xl font-semibold">Room Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Array.isArray(property.room_details) ? (
                      property.room_details.map((room) => (
                        <div key={room.id} className="bg-muted/30 p-4 rounded-xl border border-border">
                          <p className="font-semibold mb-1">{room.name}</p>
                          <p className="text-muted-foreground text-sm">{room.length} × {room.width} {room.unit}</p>
                        </div>
                      ))
                    ) : (
                      <>
                        {property.room_details.bedroom && property.room_details.bedroom.length && (
                          <div className="bg-muted/30 p-4 rounded-xl border border-border">
                            <p className="font-semibold mb-1">Bedroom</p>
                            <p className="text-muted-foreground text-sm">{property.room_details.bedroom.length} × {property.room_details.bedroom.width} {property.room_details.bedroom.unit}</p>
                          </div>
                        )}
                        {property.room_details.bathroom && property.room_details.bathroom.length && (
                          <div className="bg-muted/30 p-4 rounded-xl border border-border">
                            <p className="font-semibold mb-1">Bathroom</p>
                            <p className="text-muted-foreground text-sm">{property.room_details.bathroom.length} × {property.room_details.bathroom.width} {property.room_details.bathroom.unit}</p>
                          </div>
                        )}
                        {property.room_details.kitchen?.has && property.room_details.kitchen.length && (
                          <div className="bg-muted/30 p-4 rounded-xl border border-border">
                            <p className="font-semibold mb-1">Kitchen</p>
                            <p className="text-muted-foreground text-sm">{property.room_details.kitchen.length} × {property.room_details.kitchen.width} {property.room_details.kitchen.unit}</p>
                          </div>
                        )}
                        {property.room_details.balcony?.has && property.room_details.balcony.length && (
                          <div className="bg-muted/30 p-4 rounded-xl border border-border">
                            <p className="font-semibold mb-1">Balcony</p>
                            <p className="text-muted-foreground text-sm">{property.room_details.balcony.length} × {property.room_details.balcony.width} {property.room_details.balcony.unit}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4 border-t border-border pt-10">
                <h3 className="text-xl font-semibold">Where you'll be</h3>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {property.city}, {property.country}
                </p>
                <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-border bg-muted">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCN4v-DS9QmFjoiyaiwN8yfrPeZPbSA_xU&q=${encodeURIComponent(`${property.title}, ${property.city}, ${property.country}`)}`}
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Booking Widget */}
            <div className="relative">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-xl">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-2xl font-bold text-foreground">${property.base_price_per_night}</span>
                    <span className="text-muted-foreground"> / night</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Star className="h-4 w-4 fill-[oklch(0.72_0.13_80)] text-[oklch(0.72_0.13_80)]" />
                    <span>4.92</span>
                  </div>
                </div>

                <div className="rounded-xl border border-border overflow-hidden mb-4">
                  <div className="grid grid-cols-2 border-b border-border">
                    <div className="p-3 border-r border-border">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-foreground">Check in</label>
                      <input
                        type="date"
                        className="w-full bg-transparent border-none text-sm outline-none mt-1"
                        value={booking.checkIn}
                        onChange={e => setBooking(b => ({ ...b, checkIn: e.target.value }))}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="p-3">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-foreground">Check out</label>
                      <input
                        type="date"
                        className="w-full bg-transparent border-none text-sm outline-none mt-1"
                        value={booking.checkOut}
                        onChange={e => setBooking(b => ({ ...b, checkOut: e.target.value }))}
                        min={booking.checkIn || new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                  <div className="p-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-foreground">Guests</label>
                    <select
                      className="w-full bg-transparent border-none text-sm outline-none mt-1 appearance-none cursor-pointer"
                      value={booking.guests}
                      onChange={e => setBooking(b => ({ ...b, guests: e.target.value }))}
                    >
                      {Array.from({ length: property.max_guests }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} guest{i > 0 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  className="w-full py-6 text-lg font-semibold mb-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleReserve}
                  disabled={reserving}
                >
                  {reserving ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Reserving...</> : "Reserve"}
                </Button>
                
                <p className="text-center text-sm text-muted-foreground mb-6">You won't be charged yet</p>

                {nights > 0 ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="underline">${property.base_price_per_night} × {nights} night{nights > 1 ? "s" : ""}</span>
                      <span>${property.base_price_per_night * nights}</span>
                    </div>
                    {property.cleaning_fee > 0 && (
                      <div className="flex justify-between">
                        <span className="underline">Cleaning fee</span>
                        <span>${property.cleaning_fee}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="underline">Service fee</span>
                      <span>${serviceFee}</span>
                    </div>
                    <div className="border-t border-border mt-4 pt-4 flex justify-between font-semibold text-lg text-foreground">
                      <span>Total before taxes</span>
                      <span>${total}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">Select dates to see total price</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
