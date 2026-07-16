import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/sales/appointments")({
  component: SalesAppointments,
});

function SalesAppointments() {
  const appointments = [
    { id: 1, type: "sales_center", customer: "Ahmed Al-Rashid", scheduled: "2026-06-25 10:00", status: "scheduled", agent: "Sarah M." },
    { id: 2, type: "show_unit", customer: "Fatima Al-Saud", scheduled: "2026-06-26 14:30", status: "scheduled", agent: "Hassan K." },
    { id: 3, type: "ownership_transfer", customer: "Mohammed Al-Otaibi", scheduled: "2026-06-27 09:00", status: "completed", agent: "Noor J." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1">Schedule and track customer visits</p>
        </div>
        <Button className="gap-2">
          <Calendar className="h-4 w-4" />
          New Appointment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div key={appt.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{appt.customer}</p>
                    <p className="text-sm text-muted-foreground capitalize">{appt.type.replace(/_/g, " ")}</p>
                    <p className="text-sm font-medium mt-2">{appt.scheduled}</p>
                    <p className="text-xs text-muted-foreground">Agent: {appt.agent}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={appt.status === "scheduled" ? "default" : "outline"}>
                      {appt.status}
                    </Badge>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
