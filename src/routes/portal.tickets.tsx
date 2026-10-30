import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Filter, CheckCircle2, Clock, AlertTriangle, Phone, Wrench, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { tickets as seed, type Ticket } from "@/lib/mock-data";

export const Route = createFileRoute("/portal/tickets")({
  head: () => ({ meta: [{ title: "Maintenance Tickets — ZYNO Tenant Portal" }] }),
  component: TicketsPage,
});

const priorityClass: Record<Ticket["priority"], string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-sky-100 text-sky-700",
  High: "bg-amber-100 text-amber-700",
  Urgent: "bg-rose-100 text-rose-700",
};

const statusClass: Record<Ticket["status"], string> = {
  new: "bg-sky-100 text-sky-700",
  assigned: "bg-purple-100 text-purple-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-muted text-muted-foreground",
};

const statusSteps = ["new", "assigned", "in_progress", "resolved", "closed"] as Ticket["status"][];

function TicketsPage() {
  const [list, setList] = useState<Ticket[]>(seed);
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<Ticket["category"]>("Other");
  const [priority, setPriority] = useState<Ticket["priority"]>("Medium");
  const [complaintArea, setComplaintArea] = useState("Unit / Apartment");

  const filtered = list.filter(t => {
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchSearch = !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    open: list.filter(t => t.status === "new" || t.status === "assigned" || t.status === "in_progress").length,
    resolved: list.filter(t => t.status === "resolved").length,
    closed: list.filter(t => t.status === "closed").length,
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: Ticket = {
      id: `tkt-${Date.now()}`,
      subject,
      description: desc,
      unit: "A-1201",
      property: "Al Nakheel Residences",
      complaintArea,
      category,
      priority,
      status: "new",
      createdAt: new Date().toISOString().slice(0, 10),
      timeline: [{ date: new Date().toISOString().slice(0, 10), event: "Ticket raised by tenant", by: "Khalid Al-Mansouri" }],
    };
    setList([newTicket, ...list]);
    toast.success("Ticket submitted. Our team will review it shortly.");
    setSubject(""); setDesc(""); setCategory("Other"); setPriority("Medium"); setComplaintArea("Unit / Apartment"); setOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Open Tickets" value={counts.open} tone="warn" />
        <Kpi label="Resolved" value={counts.resolved} tone="success" />
        <Kpi label="Closed" value={counts.closed} tone="neutral" />
      </div>

      {/* Filters + Search + New */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tickets..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {["all", "new", "assigned", "in_progress", "resolved", "closed"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>{s.replace("_", " ")}</button>
          ))}
        </div>
        <Button onClick={() => setOpen(true)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> New Ticket
        </Button>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filtered.map(t => (
          <Card key={t.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Ticket Header */}
              <div
                className="flex cursor-pointer items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">#{t.id.slice(-6).toUpperCase()}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusClass[t.status]}`}>
                      {t.status.replace("_", " ")}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityClass[t.priority]}`}>
                      {t.priority}
                    </span>
                  </div>
                  <p className="font-semibold truncate">{t.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.category} &middot; {t.complaintArea} &middot; {t.createdAt}</p>
                </div>
                {t.assignee && (
                  <div className="hidden sm:block text-right text-xs text-muted-foreground shrink-0">
                    <p className="font-medium text-foreground">{t.assignee}</p>
                    {t.estimatedVisit && <p className="mt-0.5">Visit: {t.estimatedVisit}</p>}
                  </div>
                )}
                {expandedId === t.id ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
              </div>

              {/* Expanded Detail */}
              {expandedId === t.id && (
                <div className="border-t border-border bg-muted/20 p-4 space-y-4">
                  {/* Progress Stepper */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Status Progress</p>
                    <div className="flex items-center gap-0">
                      {statusSteps.map((step, i) => {
                        const idx = statusSteps.indexOf(t.status);
                        const done = i <= idx;
                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                              done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}>{i + 1}</div>
                            <div className="mx-1 text-center flex-1">
                              <p className={`text-[9px] font-medium uppercase tracking-wide ${done ? "text-primary" : "text-muted-foreground"}`}>
                                {step.replace("_", " ")}
                              </p>
                            </div>
                            {i < statusSteps.length - 1 && (
                              <div className={`h-0.5 w-4 ${done && i < idx ? "bg-primary" : "bg-muted"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Description */}
                    {t.description && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Description</p>
                        <p className="text-sm text-foreground">{t.description}</p>
                      </div>
                    )}

                    {/* Technician Info */}
                    {t.assignee && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Assigned Technician</p>
                        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {t.assignee.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{t.assignee}</p>
                            {t.assigneePhone && <p className="text-xs text-muted-foreground">{t.assigneePhone}</p>}
                            {t.estimatedVisit && <p className="text-xs text-amber-600 font-medium mt-0.5">Visit: {t.estimatedVisit}</p>}
                          </div>
                          {t.assigneePhone && (
                            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => toast(`Calling ${t.assignee}...`)}>
                              <Phone className="h-3 w-3" /> Call
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  {t.timeline && t.timeline.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Activity Timeline</p>
                      <div className="relative pl-4 space-y-3">
                        <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />
                        {t.timeline.map((ev, i) => (
                          <div key={i} className="relative flex gap-3">
                            <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                            <div className="ml-4">
                              <p className="text-sm font-medium">{ev.event}</p>
                              <p className="text-xs text-muted-foreground">{ev.date}{ev.by ? ` · ${ev.by}` : ""}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {(t.status === "resolved") && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toast("Reopen request submitted.")} className="text-xs gap-1">
                        <AlertTriangle className="h-3 w-3" /> Issue Not Resolved — Reopen
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toast("Ticket confirmed as resolved.")} className="text-xs gap-1 text-emerald-600 border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> Confirm Resolved
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Wrench className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium">No tickets found</p>
              <p className="text-sm text-muted-foreground mt-1">No maintenance tickets match your current filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Ticket Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report a Maintenance Issue</DialogTitle>
            <DialogDescription>
              Your request will be reviewed within 1 business day. For emergencies, call reception: +974 4455 6677.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="subject">Issue Subject</Label>
              <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Leaking tap in bathroom" required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Issue Category</Label>
                <select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={category} onChange={e => setCategory(e.target.value as Ticket["category"])}>
                  {["Plumber", "Electrician", "HVAC & Chillers", "Carpenter", "Painter", "Mason", "Door Issue", "Intercom", "Elevator / Lift", "CCTV", "Fire & Safety", "Housekeeping", "Security", "Civil & Structural", "Other"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <Label>Priority</Label>
                <select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={priority} onChange={e => setPriority(e.target.value as Ticket["priority"])}>
                  <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                </select>
              </div>
              <div>
                <Label>Location in Unit</Label>
                <select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={complaintArea} onChange={e => setComplaintArea(e.target.value)}>
                  {["Unit / Apartment", "Kitchen", "Bathroom", "Bedroom", "Living Area", "Balcony / Exterior", "Common Area", "Parking", "Other"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="desc">Detailed Description</Label>
              <Textarea id="desc" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe what happened, when it started, and any relevant details..." required rows={4} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Submit Ticket</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone: "success" | "warn" | "neutral" }) {
  const colors = { success: "border-l-emerald-500", warn: "border-l-amber-500", neutral: "border-l-sky-500" };
  return (
    <Card className={`border-l-4 ${colors[tone]}`}>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
