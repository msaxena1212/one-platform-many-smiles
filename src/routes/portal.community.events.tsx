import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/portal/community/events")({
  component: CommunityEvents,
});

function CommunityEvents() {
  const events = [
    {
      id: 1,
      title: "Summer Fitness Challenge",
      date: "2026-07-01",
      time: "06:00 - 08:00",
      location: "Gym Complex",
      attendees: 45,
      status: "upcoming",
    },
    {
      id: 2,
      title: "Community BBQ Night",
      date: "2026-06-29",
      time: "18:00 - 21:00",
      location: "Central Courtyard",
      attendees: 128,
      status: "upcoming",
    },
    {
      id: 3,
      title: "Kids Pool Party",
      date: "2026-06-25",
      time: "15:00 - 17:00",
      location: "Swimming Pool",
      attendees: 73,
      status: "completed",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Events</h1>
          <p className="text-sm text-muted-foreground mt-1">Join and stay updated on community activities</p>
        </div>
        <Button>+ Create Event</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Attendees (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">246</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">You're Attending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:shadow-md transition">
            <CardContent className="p-0">
              <div className="flex gap-4 p-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white">
                  <Calendar className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString()} {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{event.attendees} attending</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={event.status === "upcoming" ? "default" : "outline"}>
                        {event.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        {event.status === "upcoming" ? "Join" : "View"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
