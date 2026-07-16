import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { facilities as facilityData, type FacilityBooking } from "@/lib/mock-data";

export const Route = createFileRoute("/portal/bookings")({
  head: () => ({ meta: [{ title: "Facility booking — ZYNO Property Management Portal" }] }),
  component: BookingsPage,
});

const facilities: FacilityBooking[] = facilityData;

function BookingsPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {selected && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Viewing calendar for</p>
            <p className="mt-2 text-lg font-semibold">{selected}</p>
            <p className="mt-1 text-sm">Check availability and book a new slot from here.</p>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {facilities.map(f => (
          <Card key={f.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <h3 className="text-base font-semibold">{f.name}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                  f.status === "Confirmed" ? "bg-[oklch(0.55_0.13_155)]/15 text-[oklch(0.4_0.13_155)]" :
                  f.status === "Pending" ? "bg-gold/20 text-gold-foreground" :
                  "bg-secondary text-secondary-foreground"
                }`}>{f.status}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Open hours: {f.hours}</p>
              <p className="mt-4 text-sm">Your next slot: <span className="font-medium">{f.nextSlot}</span></p>
              <p className="mt-2 text-sm text-muted-foreground">Available slots: {f.availableSlots}</p>
              <div className="mt-5 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    toast.success(`Booking request sent for ${f.name}`);
                  }}
                >
                  Book a slot
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelected(f.name);
                    toast(`Opened calendar for ${f.name}`);
                  }}
                >
                  View calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
