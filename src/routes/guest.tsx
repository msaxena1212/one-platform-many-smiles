import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BedDouble,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FilePenLine,
  FileText,
  Grid2X2,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { fetchGuestBookings, type Booking } from "@/lib/supabase";

export const Route = createFileRoute("/guest")({
  head: () => ({
    meta: [
      { title: "Guest portal - Kinan Customer Portal" },
      { name: "description", content: "Guests can view and update stay, payment, document, and support details." },
    ],
  }),
  component: GuestDashboard,
});

const MOCK_GUEST_ID = "00000000-0000-4000-8000-000000000002";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800";

const payments = [
  { receipt: "RCP-10421", date: "May 28, 2026", method: "Visa •••• 4242", amount: "$1,180", status: "Paid" },
  { receipt: "RCP-10422", date: "Jun 28, 2026", method: "Mastercard •••• 8812", amount: "$1,180", status: "Due" },
];

const facilities = [
  { name: "Swimming Pool", hours: "06:00 - 22:00", status: "Confirmed", slot: "Tomorrow, 08:00 AM" },
  { name: "Gym", hours: "24 Hours", status: "Pending", slot: "Waiting List" },
  { name: "BBQ Area", hours: "10:00 - 23:00", status: "Available", slot: "Not Booked" },
];

const guestDocuments = [
  { name: "Lease Agreement", size: "2.4 MB", date: "Jan 15, 2026", action: "Download" },
  { name: "Welcome Pack", size: "1.1 MB", date: "Jan 16, 2026", action: "Download" },
  { name: "Move-in Condition Form", size: "150 KB", date: "Pending", action: "Sign" },
];

const supportItems = [
  { ref: "SR-920", subject: "Air conditioning not cooling", category: "Maintenance", priority: "High", status: "Confirmed", assignee: "Tech Team" },
  { ref: "SR-915", subject: "Extra keycard request", category: "Services", priority: "Medium", status: "In Progress", assignee: "Front Desk" },
  { ref: "SR-884", subject: "Late checkout inquiry", category: "General", priority: "Low", status: "Closed", assignee: "Concierge" },
];

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  CONFIRMED: { label: "Confirmed", className: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle2 },
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  COMPLETED: { label: "Completed", className: "bg-sky-100 text-sky-800 border-sky-200", icon: CheckCircle2 },
};

type GuestDocument = {
  name: string;
  size: string;
  date: string;
  action: "Download" | "Sign";
  status: "Verified" | "Ready" | "Updated" | "Needs review" | "Signed";
};

type GuestPayment = {
  receipt: string;
  date: string;
  method: string;
  amount: string;
  status: "Completed" | "Due" | "Scheduled";
};

type SupportItem = {
  ref: string;
  subject: string;
  category: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "Confirmed" | "Pending" | "Closed";
  assignee: string;
};

type FacilityItem = {
  name: string;
  hours: string;
  slot: string;
  status: "Confirmed" | "Drop-in" | "Available" | "Pending";
};

const initialGuestDocuments: GuestDocument[] = [
  { name: "Passport copy", size: "348 KB", date: "2026-06-22", action: "Download", status: "Verified" },
  { name: "Booking confirmation", size: "112 KB", date: "2026-06-22", action: "Download", status: "Ready" },
  { name: "Arrival instructions", size: "86 KB", date: "2026-06-23", action: "Download", status: "Updated" },
  { name: "House rules acknowledgement - sign required", size: "44 KB", date: "Pending", action: "Sign", status: "Needs review" },
];

const initialPayments: GuestPayment[] = [
  { receipt: "GST-10421", date: "2026-06-18", method: "Visa", amount: "$420", status: "Completed" },
  { receipt: "GST-10422", date: "2026-06-28", method: "Card", amount: "$1,180", status: "Due" },
  { receipt: "GST-10423", date: "Check-in", method: "Hold", amount: "$300", status: "Scheduled" },
];

const initialSupportItems: SupportItem[] = [
  { ref: "#G1", subject: "Airport transfer request", category: "Arrival", priority: "Medium", status: "Open", assignee: "Guest services" },
  { ref: "#G2", subject: "Extra towels before arrival", category: "Housekeeping", priority: "Low", status: "Confirmed", assignee: "Housekeeping" },
  { ref: "#G3", subject: "Late checkout waitlist", category: "Stay", priority: "Low", status: "Pending", assignee: "Host" },
];

const initialFacilities: FacilityItem[] = [
  { name: "Swimming pool", hours: "06:00 - 22:00", slot: "Friday - 18:00-20:00", status: "Confirmed" },
  { name: "Fitness gym", hours: "24/7", slot: "-", status: "Drop-in" },
  { name: "Event hall", hours: "By booking", slot: "-", status: "Available" },
  { name: "Family majlis", hours: "By booking", slot: "Sat - 19:00-22:00", status: "Pending" },
];

type GuestProfile = {
  fullName: string;
  email: string;
  phone: string;
  emergencyContact: string;
  arrivalTime: string;
  travelPurpose: string;
  specialRequests: string;
};

type GuestPreferences = {
  language: string;
  bedSetup: string;
  temperature: string;
  accessibility: string;
  marketing: boolean;
  whatsapp: boolean;
};

function GuestDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<GuestProfile>({
    fullName: "Alice Morgan",
    email: "alice.morgan@example.com",
    phone: "+1 415 555 0198",
    emergencyContact: "Daniel Morgan, +1 415 555 0112",
    arrivalTime: "15:30",
    travelPurpose: "Family vacation",
    specialRequests: "Quiet room if available, baby cot, and airport transfer quote.",
  });
  const [preferences, setPreferences] = useState<GuestPreferences>({
    language: "English",
    bedSetup: "King bed",
    temperature: "22 C",
    accessibility: "No special accessibility needs",
    marketing: false,
    whatsapp: true,
  });
  const [companions, setCompanions] = useState(["Daniel Morgan", "Mia Morgan"]);

  useEffect(() => {
    fetchGuestBookings(MOCK_GUEST_ID)
      .then(setBookings)
      .catch((error) => {
        console.error(error);
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeBooking = useMemo(
    () => bookings.find((booking) => booking.status === "CONFIRMED") ?? bookings[0],
    [bookings],
  );
  const upcoming = bookings.filter((booking) => booking.status === "CONFIRMED" || booking.status === "PENDING");
  const past = bookings.filter((booking) => booking.status === "COMPLETED" || booking.status === "CANCELLED");
  const openRequests = supportItems.filter((item) => item.status !== "Confirmed").length;

  const saveProfile = () => toast.success("Guest details updated");
  const savePreferences = () => toast.success("Stay preferences updated");

  return (
    <Tabs defaultValue="overview" className="min-h-screen bg-[#f8f6ef] text-[#061514]">
      <div className="flex min-h-screen">
        <GuestSidebar openRequests={openRequests} />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-[58px] items-center justify-between border-b border-[#d9ded8] bg-[#fbfaf5] px-5 lg:px-7">
            <h1 className="text-base font-semibold">Guest portal</h1>
            <div className="flex items-center gap-3">
              <Link to="/" className="hidden text-xs text-[#435552] hover:text-[#004d48] sm:inline">
                ← Back to public site
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-[#d7dfdc] bg-white px-3 py-1.5 shadow-sm">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#004d48] text-xs font-bold text-white">
                  AM
                </span>
                <span className="text-xs leading-tight">
                  <span className="block font-semibold">{profile.fullName}</span>
                  <span className="block text-[#5f6d6a]">Guest - Active stay</span>
                </span>
              </div>
            </div>
          </header>

          <main className="px-5 py-6 lg:px-7">
            <TabsContent value="overview" className="m-0 space-y-6">
              <div className="rounded-b-2xl bg-gradient-to-br from-[#004d48] to-[#2e6f69] p-7 text-white shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">
                  Guest - {activeBooking?.properties?.title ?? "Upcoming stay"}
                </p>
                <h2 className="mt-2 text-3xl font-semibold">Hello, {profile.fullName.split(" ")[0]}</h2>
                <p className="mt-3 max-w-2xl text-sm text-white/90">
                  Review your reservation, update arrival details, manage documents, and contact guest services before check-in.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button className="bg-white text-[#004d48] hover:bg-white/90" onClick={saveProfile}>
                    Save details
                  </Button>
                  <Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => toast.success("Message drafted")}>
                    Message host
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Upcoming stays" value={String(upcoming.length)} hint={loading ? "Loading stays" : "Synced from bookings"} icon={<CalendarIcon />} />
                <MetricCard label="Guests" value={String(companions.length + 1)} hint="Primary plus companions" icon={<Users />} />
                <MetricCard label="Documents" value="4" hint="1 requires signature" icon={<FileText />} />
                <MetricCard label="Open requests" value={String(openRequests)} hint="Guest services tracking" icon={<Wrench />} />
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.4fr_0.7fr]">
                <PortalCard title="Stay details" description="Reservation status, dates, and property details.">
                  {loading ? (
                    <LoadingRows />
                  ) : activeBooking ? (
                    <ActiveStay booking={activeBooking} />
                  ) : (
                    <EmptyPanel title="No active stay" action="Find a stay" to="/" />
                  )}
                </PortalCard>

                <PortalCard title="Next payment" description="Balance due before arrival.">
                  <p className="mt-2 text-3xl font-semibold">$1,180</p>
                  <p className="text-xs text-[#53615e]">Due Jun 28, 2026 - Stay balance</p>
                  <div className="mt-5 space-y-3 text-sm">
                    <Row k="Method" v="Card ending 4242" />
                    <Row k="Reference" v="GST-10422" />
                    <Row k="Security hold" v="$300 at check-in" />
                  </div>
                  <Button className="mt-5 w-full bg-[#004d48] hover:bg-[#003f3b]">Pay now</Button>
                </PortalCard>
              </div>
            </TabsContent>

            <TabsContent value="stays" className="m-0 space-y-5">
              <PageTitle title="My stays" description="All active, upcoming, and past guest bookings." />
              <PortalCard>
                <div className="divide-y divide-[#d9ded8]">
                  {loading ? (
                    <LoadingRows />
                  ) : upcoming.length > 0 ? (
                    upcoming.map((booking) => <BookingRow key={booking.id} booking={booking} />)
                  ) : (
                    <EmptyPanel title="No upcoming trips" action="Browse properties" to="/" />
                  )}
                  {!loading && past.map((booking) => <BookingRow key={booking.id} booking={booking} />)}
                </div>
              </PortalCard>
            </TabsContent>

            <TabsContent value="details" className="m-0 space-y-5">
              <PageTitle title="Guest details" description="Update contact, arrival, companions, and stay preferences." />
              <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
                <PortalCard title="Personal and arrival details" description="Host-visible details for this stay.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" value={profile.fullName} onChange={(value) => setProfile({ ...profile, fullName: value })} icon={<UserRound />} />
                    <Field label="Email" value={profile.email} onChange={(value) => setProfile({ ...profile, email: value })} icon={<Mail />} />
                    <Field label="Phone" value={profile.phone} onChange={(value) => setProfile({ ...profile, phone: value })} icon={<Phone />} />
                    <Field label="Arrival time" value={profile.arrivalTime} onChange={(value) => setProfile({ ...profile, arrivalTime: value })} type="time" icon={<Clock />} />
                    <div className="sm:col-span-2">
                      <Label htmlFor="emergency">Emergency contact</Label>
                      <Input id="emergency" value={profile.emergencyContact} onChange={(event) => setProfile({ ...profile, emergencyContact: event.target.value })} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="requests">Special requests</Label>
                      <Textarea id="requests" value={profile.specialRequests} onChange={(event) => setProfile({ ...profile, specialRequests: event.target.value })} rows={4} />
                    </div>
                    <Button onClick={saveProfile} className="bg-[#004d48] hover:bg-[#003f3b]">Save changes</Button>
                  </div>
                </PortalCard>

                <PortalCard title="Companions" description="Keep guest names current before check-in.">
                  <div className="space-y-3">
                    {companions.map((name, index) => (
                      <div key={`${name}-${index}`} className="flex gap-2">
                        <Input
                          aria-label={`Companion ${index + 1}`}
                          value={name}
                          onChange={(event) => setCompanions((current) => current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
                        />
                        <Button variant="outline" onClick={() => setCompanions((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => setCompanions((current) => [...current, "New guest"])} className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      Add companion
                    </Button>
                  </div>
                </PortalCard>
              </div>

              <PortalCard title="Stay preferences" description="These details help the host prepare the property before arrival.">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Field label="Language" value={preferences.language} onChange={(value) => setPreferences({ ...preferences, language: value })} icon={<SlidersHorizontal />} />
                  <Field label="Bed setup" value={preferences.bedSetup} onChange={(value) => setPreferences({ ...preferences, bedSetup: value })} icon={<BedDouble />} />
                  <Field label="Temperature" value={preferences.temperature} onChange={(value) => setPreferences({ ...preferences, temperature: value })} icon={<SlidersHorizontal />} />
                  <Field label="Accessibility" value={preferences.accessibility} onChange={(value) => setPreferences({ ...preferences, accessibility: value })} icon={<ShieldCheck />} />
                  <PreferenceToggle label="WhatsApp updates" checked={preferences.whatsapp} onChange={(checked) => setPreferences({ ...preferences, whatsapp: checked })} />
                  <PreferenceToggle label="Marketing emails" checked={preferences.marketing} onChange={(checked) => setPreferences({ ...preferences, marketing: checked })} />
                  <div className="sm:col-span-2 xl:col-span-4">
                    <Button onClick={savePreferences} className="bg-[#004d48] hover:bg-[#003f3b]">Save preferences</Button>
                  </div>
                </div>
              </PortalCard>
            </TabsContent>

            <TabsContent value="payments" className="m-0 space-y-5">
              <PageTitle title="Payments" />
              <div className="rounded-lg border border-[#e5c478] bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#40524f]">Next balance</p>
                    <p className="mt-1 text-3xl font-semibold">$1,180</p>
                    <p className="text-sm text-[#53615e]">Due Jun 28, 2026 - Reference GST-10422</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button className="bg-[#004d48] hover:bg-[#003f3b]">Pay with card</Button>
                    <Button variant="outline">Pay with bank</Button>
                    <Button variant="ghost">Set up auto-pay</Button>
                  </div>
                </div>
              </div>
              <PortalCard title="Payment history" description="All receipts on your guest account">
                <DataTable
                  columns={["Receipt", "Date", "Method", "Amount", "Status"]}
                  rows={payments.map((payment) => [
                    payment.receipt,
                    payment.date,
                    <SoftBadge key="method" label={payment.method} />,
                    <span key="amount" className="font-semibold">{payment.amount}</span>,
                    <SoftBadge key="status" label={payment.status} tone={payment.status === "Due" ? "warning" : "success"} />,
                  ])}
                />
              </PortalCard>
            </TabsContent>

            <TabsContent value="facilities" className="m-0 space-y-5">
              <PageTitle title="Facility booking" />
              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {facilities.map((facility) => (
                  <Card key={facility.name} className="border-[#d8dfdc] bg-white shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold">{facility.name}</h3>
                          <p className="mt-1 text-xs text-[#40524f]">Open hours: {facility.hours}</p>
                        </div>
                        <SoftBadge label={facility.status} tone={facility.status === "Pending" ? "warning" : "success"} />
                      </div>
                      <p className="mt-5 text-sm">Your next slot: <span className="font-semibold">{facility.slot}</span></p>
                      <div className="mt-5 flex gap-3">
                        <Button size="sm" className="bg-[#004d48] hover:bg-[#003f3b]">Book a slot</Button>
                        <Button size="sm" variant="ghost">View calendar</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="m-0 space-y-5">
              <PageTitle title="Documents" />
              <PortalCard title="My documents" description="Booking confirmations, arrival forms, and guest policies.">
                <div className="divide-y divide-[#d9ded8]">
                  {guestDocuments.map((document) => (
                    <div key={document.name} className="flex items-center justify-between gap-4 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#e8f1ef] text-[#004d48]">
                          <FileText className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{document.name}</p>
                          <p className="text-xs text-[#53615e]">{document.size} - {document.date}</p>
                        </div>
                      </div>
                      <Button size="sm" variant={document.action === "Sign" ? "default" : "outline"} className={document.action === "Sign" ? "bg-[#004d48] hover:bg-[#003f3b]" : ""}>
                        {document.action === "Sign" ? <FilePenLine className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                        {document.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </PortalCard>
            </TabsContent>

            <TabsContent value="support" className="m-0 space-y-5">
              <PageTitle title="Guest support" description="All guest service requests attached to your stay." />
              <div className="flex justify-end">
                <Button className="gap-2 bg-[#004d48] hover:bg-[#003f3b]"><Plus className="h-4 w-4" /> New request</Button>
              </div>
              <PortalCard title="Contact guest services" description="Send a note about arrival, amenities, or documents.">
                <div className="grid gap-4 md:grid-cols-[0.7fr_1fr_auto]">
                  <Input defaultValue="Arrival and check-in" aria-label="Support topic" />
                  <Input defaultValue="Please confirm if early bag drop is possible before 15:00." aria-label="Support message" />
                  <Button onClick={() => toast.success("Message sent to guest services")} className="bg-[#004d48] hover:bg-[#003f3b]">
                    Send
                  </Button>
                </div>
              </PortalCard>
            </TabsContent>
          </main>
        </div>
      </div>
    </Tabs>
  );
}

function GuestSidebar({ openRequests }: { openRequests: number }) {
  const items = [
    { value: "overview", label: "Overview", icon: <Grid2X2 className="h-4 w-4" /> },
    { value: "stays", label: "Stays", icon: <BedDouble className="h-4 w-4" /> },
    { value: "details", label: "Details", icon: <UserRound className="h-4 w-4" /> },
    { value: "payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
    { value: "facilities", label: "Facility booking", icon: <CalendarIcon className="h-4 w-4" /> },
    { value: "documents", label: "Documents", icon: <FileText className="h-4 w-4" /> },
    { value: "support", label: "Support", icon: <MessageSquare className="h-4 w-4" />, badge: openRequests },
  ];

  return (
    <aside className="hidden w-[230px] shrink-0 border-r border-white/10 bg-[#052724] text-white md:block">
      <div className="flex h-[58px] items-center gap-3 border-b border-white/10 px-4">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#e4ad31] font-bold text-[#052724]">K</span>
        <span className="leading-none">
          <span className="block text-sm font-semibold">Kinan</span>
          <span className="block text-[10px] uppercase tracking-[0.22em] text-white/65">Customer Portal</span>
        </span>
      </div>
      <TabsList className="flex h-auto flex-col items-stretch justify-start bg-transparent p-3">
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className="mb-1 flex h-9 w-full justify-start gap-3 rounded-md px-3 text-left text-sm font-medium text-white/90 data-[state=active]:bg-[#123f3c] data-[state=active]:text-white"
          >
            <span className="text-[#e4ad31]">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span className="rounded-full bg-[#e4ad31] px-2 py-0.5 text-[10px] font-bold text-[#052724]">{item.badge}</span>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
    </aside>
  );
}

function ActiveStay({ booking }: { booking: Booking }) {
  const property = booking.properties;
  const image = (property as any)?.property_images?.[0]?.image_url || FALLBACK_IMAGE;
  const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="grid gap-4 md:grid-cols-[13rem_1fr]">
      <div className="h-40 overflow-hidden rounded-md bg-[#e8ece9] md:h-full">
        <img src={image} alt={property?.title ?? "Guest stay"} className="h-full w-full object-cover" />
      </div>
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{property?.title ?? "Upcoming stay"}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[#53615e]">
              <MapPin className="h-3.5 w-3.5" />
              {property?.city}, {property?.country}
            </p>
          </div>
          <Badge variant="outline" className={status.className}>
            <StatusIcon className="mr-1 h-3.5 w-3.5" />
            {status.label}
          </Badge>
        </div>
        <div className="mt-5 grid gap-4 text-sm sm:grid-cols-4">
          <StayFact label="Check-in" value={formatDate(booking.check_in)} />
          <StayFact label="Check-out" value={formatDate(booking.check_out)} />
          <StayFact label="Guests" value={String(booking.guests_count)} />
          <StayFact label="Total" value={`$${booking.total_price}`} />
        </div>
        <Button asChild className="mt-5 bg-[#004d48] hover:bg-[#003f3b]">
          <Link to="/guest">View property</Link>
        </Button>
      </div>
    </div>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.PENDING;
  const property = booking.properties;

  return (
    <div className="grid gap-3 py-4 text-sm lg:grid-cols-[1.2fr_0.8fr_0.6fr_0.6fr_auto] lg:items-center">
      <div>
        <p className="font-semibold">{property?.title ?? "Property booking"}</p>
        <p className="text-xs text-[#53615e]">{property?.city}, {property?.country}</p>
      </div>
      <span>{formatShortDate(booking.check_in)} - {formatShortDate(booking.check_out)}</span>
      <span>{booking.guests_count} guests</span>
      <span className="font-semibold">${booking.total_price}</span>
      <Badge variant="outline" className={status.className}>{status.label}</Badge>
    </div>
  );
}

function PortalCard({ title, description, children }: { title?: string; description?: string; children: ReactNode }) {
  return (
    <Card className="overflow-hidden border-[#d8dfdc] bg-white shadow-sm">
      {(title || description) && (
        <CardHeader className="border-b border-[#d9ded8] px-6 py-5">
          {title && <CardTitle className="text-base">{title}</CardTitle>}
          {description && <CardDescription className="text-xs text-[#40524f]">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}

function MetricCard({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint: string }) {
  return (
    <Card className="border-[#d8dfdc] bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#40524f]">{label}</p>
            <p className="mt-3 text-2xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-[#53615e]">{hint}</p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#e8f1ef] text-[#004d48] [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-[#40524f]">{description}</p>}
    </div>
  );
}

function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="-m-6 overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-[#f4f2ec] text-left text-[11px] uppercase tracking-[0.12em] text-[#40524f]">
          <tr>{columns.map((column) => <th key={column} className="px-6 py-3 font-medium">{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-[#d9ded8]">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="px-6 py-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SoftBadge({ label, tone = "neutral" }: { label: string; tone?: "success" | "warning" | "info" | "neutral" }) {
  const tones = {
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    info: "bg-cyan-100 text-cyan-800",
    neutral: "bg-[#e8f1ef] text-[#004d48]",
  };

  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${tones[tone]}`}>{label}</span>;
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#53615e]">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}

function StayFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#53615e]">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", icon }: { label: string; value: string; onChange: (value: string) => void; type?: string; icon: ReactNode }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#53615e] [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
        <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="pl-9" />
      </div>
    </div>
  );
}

function PreferenceToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-10 items-center justify-between rounded-md border border-[#d8dfdc] px-3 py-2 text-sm">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[#004d48]" />
    </label>
  );
}

function EmptyPanel({ title, action, to }: { title: string; action: string; to: "/" | "/properties" }) {
  return (
    <div className="rounded-lg border border-dashed border-[#d8dfdc] p-8 text-center">
      <CalendarIcon className="mx-auto h-8 w-8 text-[#53615e]" />
      <p className="mt-3 font-medium">{title}</p>
      <Button asChild className="mt-4 bg-[#004d48] hover:bg-[#003f3b]">
        <Link to={to}>{action}</Link>
      </Button>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {[0, 1].map((item) => (
        <div key={item} className="h-24 animate-pulse rounded-lg bg-[#edf0ec]" />
      ))}
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
