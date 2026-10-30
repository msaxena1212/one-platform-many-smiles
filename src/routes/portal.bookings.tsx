import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarCheck2, Clock, Users, CheckCircle2, XCircle, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { facilities, myBookings as seedBookings, formatQAR, type FacilityBooking, type MyFacilityBooking } from "@/lib/mock-data";

export const Route = createFileRoute("/portal/bookings")({
  head: () => ({ meta: [{ title: "Facility Bookings — ZYNO Tenant Portal" }] }),
  component: BookingsPage,
});

const facilityIcon: Record<string, string> = {
  Recreational: "🏊", Fitness: "🏋️", Community: "🎪",
  Outdoor: "🔥", Children: "🎨", Sports: "🎾",
};

const slotOptions = ["06:00–07:00", "07:00–08:00", "09:00–10:00", "10:00–11:00", "11:00–12:00",
  "14:00–15:00", "15:00–16:00", "16:00–17:00", "17:00–18:00", "18:00–20:00", "20:00–22:00"];

function BookingsPage() {
  const [myBookingsList, setMyBookingsList] = useState<MyFacilityBooking[]>(seedBookings);
  const [bookingDialog, setBookingDialog] = useState<FacilityBooking | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(slotOptions[0]);

  const confirmBooking = () => {
    if (!bookingDialog) return;
    const ref = `BK-${Date.now()}`;
    const newBooking: MyFacilityBooking = {
      id: ref, facilityId: bookingDialog.id, facilityName: bookingDialog.name,
      date: selectedDate, time: selectedSlot, status: "pending", reference: ref,
    };
    setMyBookingsList([newBooking, ...myBookingsList]);
    toast.success(`Booking request submitted for ${bookingDialog.name} on ${selectedDate} ${selectedSlot}. Reference: ${ref}`);
    setBookingDialog(null); setSelectedDate(""); setSelectedSlot(slotOptions[0]);
  };

  const cancelBooking = (id: string) => {
    setMyBookingsList(myBookingsList.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
    toast("Booking cancelled.");
  };

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Available Facilities" value={facilities.length} icon="🏢" />
        <Kpi label="My Upcoming Bookings" value={myBookingsList.filter(b => b.status === "confirmed" || b.status === "pending").length} icon="📅" />
        <Kpi label="Total Bookings Made" value={myBookingsList.length} icon="✅" />
      </div>

      <Tabs defaultValue="facilities" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-xs">
          <TabsTrigger value="facilities">All Facilities</TabsTrigger>
          <TabsTrigger value="my">My Bookings</TabsTrigger>
        </TabsList>

        {/* Facilities Grid */}
        <TabsContent value="facilities">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map(f => (
              <Card key={f.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  {/* Facility Header */}
                  <div className="flex items-center justify-between bg-muted/40 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{facilityIcon[f.type] || "🏢"}</span>
                      <div>
                        <p className="font-semibold text-sm">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{f.type}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                      f.status === "Available" ? "bg-emerald-100 text-emerald-700" :
                      f.status === "Confirmed" ? "bg-sky-100 text-sky-700" :
                      f.status === "Pending" ? "bg-amber-100 text-amber-700" :
                      "bg-muted text-muted-foreground"
                    }`}>{f.status}</span>
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Hours: {f.hours}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>Capacity: {f.capacity} &middot; {f.availableSlots} slots available</span>
                    </div>
                    {f.bookingFee && f.bookingFee > 0 ? (
                      <p className="text-xs text-muted-foreground">Booking fee: {formatQAR(f.bookingFee)}</p>
                    ) : (
                      <p className="text-xs text-emerald-600 font-medium">Free to use</p>
                    )}
                  </div>

                  <div className="border-t border-border px-4 py-3">
                    <Button size="sm" className="w-full gap-1.5" onClick={() => setBookingDialog(f)}>
                      <Plus className="h-3.5 w-3.5" /> Book a Slot
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Bookings */}
        <TabsContent value="my">
          <Card>
            <CardContent className="p-0">
              <div className="border-b border-border px-5 py-4">
                <h3 className="font-semibold">My Bookings</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Your upcoming and past facility reservations</p>
              </div>
              <div className="divide-y divide-border">
                {myBookingsList.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    <CalendarCheck2 className="mx-auto mb-2 h-10 w-10" />
                    <p>No bookings yet. Book a facility from the All Facilities tab.</p>
                  </div>
                )}
                {myBookingsList.map(b => (
                  <div key={b.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                    <div className="text-2xl">{facilityIcon[facilities.find(f => f.id === b.facilityId)?.type || ""] || "🏢"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{b.facilityName}</p>
                      <p className="text-xs text-muted-foreground">{b.date} &middot; {b.time}</p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">{b.reference}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                      b.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                      b.status === "pending" ? "bg-amber-100 text-amber-700" :
                      "bg-muted text-muted-foreground line-through"
                    }`}>{b.status}</span>
                    {b.status !== "cancelled" && (
                      <Button size="sm" variant="ghost" className="shrink-0 h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => cancelBooking(b.id)}>
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      {bookingDialog && (
        <Dialog open={!!bookingDialog} onOpenChange={() => setBookingDialog(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Book {bookingDialog.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/40 p-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-3.5 w-3.5" /> Operating hours: {bookingDialog.hours}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> Capacity: {bookingDialog.capacity} persons
                </div>
                {bookingDialog.bookingFee && bookingDialog.bookingFee > 0 && (
                  <p className="mt-1 text-muted-foreground">Fee: {formatQAR(bookingDialog.bookingFee)}</p>
                )}
              </div>
              <div>
                <Label htmlFor="bk-date">Select Date</Label>
                <Input id="bk-date" type="date" value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => setSelectedDate(e.target.value)} required />
              </div>
              <div>
                <Label>Select Time Slot</Label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {slotOptions.map(slot => (
                    <button key={slot} onClick={() => setSelectedSlot(slot)}
                      className={`rounded-lg border p-2 text-xs font-medium transition-colors ${
                        selectedSlot === slot ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                      }`}>{slot}</button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBookingDialog(null)}>Cancel</Button>
              <Button onClick={confirmBooking} disabled={!selectedDate}>Confirm Booking</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function Kpi({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
