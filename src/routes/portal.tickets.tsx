import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { tickets as seed, type Ticket } from "@/lib/mock-data";

export const Route = createFileRoute("/portal/tickets")({
  head: () => ({ meta: [{ title: "Tickets — ZYNO Property Management Portal" }] }),
  component: TicketsPage,
});

const priorityClass: Record<Ticket["priority"], string> = {
  Low: "bg-secondary text-secondary-foreground",
  Medium: "bg-[oklch(0.92_0.04_220)] text-[oklch(0.35_0.08_220)]",
  High: "bg-gold/20 text-gold-foreground",
  Urgent: "bg-destructive/15 text-destructive",
};

const statusClass: Record<Ticket["status"], string> = {
  new: "bg-secondary text-secondary-foreground",
  assigned: "bg-[oklch(0.92_0.04_220)] text-[oklch(0.35_0.08_220)]",
  in_progress: "bg-gold/20 text-gold-foreground",
  resolved: "bg-[oklch(0.55_0.13_155)]/15 text-[oklch(0.4_0.13_155)]",
  closed: "bg-muted text-muted-foreground",
};

function TicketsPage() {
  const [list, setList] = useState<Ticket[]>(seed);
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<Ticket["category"]>("Other");
  const [priority, setPriority] = useState<Ticket["priority"]>("Medium");
  const [property, setProperty] = useState("");
  const [unit, setUnit] = useState("");
  const [complaintArea, setComplaintArea] = useState("Unit / Apartment");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setList([
      {
        id: `t${Date.now()}`,
        subject: subject || desc.slice(0, 60),
        description: desc,
        unit: unit || "Not specified",
        property: property || "Not specified",
        complaintArea,
        category,
        priority,
        status: "new",
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...list,
    ]);
    setSubject(""); setDesc(""); setCategory("Other"); setPriority("Medium");
    setProperty(""); setUnit(""); setComplaintArea("Unit / Apartment"); setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">All service requests across your unit.</p>
        <Button onClick={() => setOpen(true)}><Plus /> New ticket</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report a Maintenance Issue</DialogTitle>
            <DialogDescription>Create a service ticket with property visibility, category, complaint area, priority, and detailed symptoms.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5"><Label htmlFor="s">Subject</Label><Input id="s" value={subject} onChange={e => setSubject(e.target.value)} required /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5"><Label htmlFor="category">Issue category</Label><select id="category" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={category} onChange={e => setCategory(e.target.value as Ticket["category"])}>{["Carpenter", "CCTV", "Civil & Structural", "Door Issue", "Electrician", "Elevator / Lift", "Fire & Safety", "Groutin", "Housekeeping", "HVAC & Chillers", "Intercom", "Mason", "Painter", "Plumber", "Security", "Other"].map(option => <option key={option}>{option}</option>)}</select></div>
                <div className="space-y-1.5"><Label htmlFor="priority">Priority</Label><select id="priority" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={priority} onChange={e => setPriority(e.target.value as Ticket["priority"])}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></div>
                <div className="space-y-1.5"><Label htmlFor="property">Property / building</Label><Input id="property" value={property} onChange={e => setProperty(e.target.value)} required /></div>
                <div className="space-y-1.5"><Label htmlFor="unit">Unit / room</Label><Input id="unit" value={unit} onChange={e => setUnit(e.target.value)} required /></div>
              </div>
              <div className="space-y-1.5"><Label htmlFor="area">Complaint area</Label><select id="area" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={complaintArea} onChange={e => setComplaintArea(e.target.value)}><option>Unit / Apartment</option><option>Kitchen</option><option>Bathroom</option><option>Bedroom</option><option>Living Area</option><option>Balcony / Exterior</option><option>Common Area</option><option>Parking</option><option>Other</option></select></div>
              <div className="space-y-1.5"><Label htmlFor="d">Detailed symptoms and requested action</Label><Textarea id="d" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe what happened, when it started, and any access or safety details." required rows={5} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Submit ticket</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Ref</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {list.map(t => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{t.id.slice(-4).toUpperCase()}</td>
                    <td className="px-4 py-3 font-medium">{t.subject}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.category}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityClass[t.priority]}`}>{t.priority}</span></td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusClass[t.status]}`}>{t.status.replace("_", " ")}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{t.createdAt}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.assignee ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
