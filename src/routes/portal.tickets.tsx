import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tickets as seed, type Ticket } from "@/lib/mock-data";

export const Route = createFileRoute("/portal/tickets")({
  head: () => ({ meta: [{ title: "Tickets — Kinan Portal" }] }),
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setList([
      {
        id: `t${Date.now()}`,
        subject: subject || desc.slice(0, 60),
        unit: "A-1201",
        category: "General",
        priority: "Medium",
        status: "new",
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...list,
    ]);
    setSubject(""); setDesc(""); setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">All service requests across your unit.</p>
        <Button onClick={() => setOpen(true)}><Plus /> New ticket</Button>
      </div>

      {open && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold">Report an issue</h3>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <div className="space-y-1.5"><Label htmlFor="s">Subject</Label><Input id="s" value={subject} onChange={e => setSubject(e.target.value)} required /></div>
              <div className="space-y-1.5"><Label htmlFor="d">Description</Label><Textarea id="d" value={desc} onChange={e => setDesc(e.target.value)} required rows={4} /></div>
              <div className="flex gap-2">
                <Button type="submit">Submit ticket</Button>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
