import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/portal/bookings")({
  head: () => ({ meta: [{ title: "Facility booking — Kinan Portal" }] }),
  component: BookingsPage,
});

const facilities = [
  { id: "pool", name: "Swimming pool", hours: "06:00 – 22:00", slot: "Friday · 18:00–20:00", status: "Confirmed" },
  { id: "gym", name: "Fitness gym", hours: "24/7", slot: "—", status: "Drop-in" },
  { id: "hall", name: "Event hall", hours: "By booking", slot: "—", status: "Available" },
  { id: "majlis", name: "Family majlis", hours: "By booking", slot: "Sat · 19:00–22:00", status: "Pending" },
  { id: "court", name: "Padel court", hours: "06:00 – 23:00", slot: "—", status: "Available" },
];

function BookingsPage() {
  return (
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
            <p className="mt-4 text-sm">Your next slot: <span className="font-medium">{f.slot}</span></p>
            <div className="mt-5 flex gap-2">
              <Button size="sm">Book a slot</Button>
              <Button size="sm" variant="ghost">View calendar</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
