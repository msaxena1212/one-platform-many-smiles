import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { tickets, type Ticket } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — ZYNO Property Management Staff" }] }),
  component: AdminMaintenance,
});

const cols: { id: Ticket["status"]; label: string }[] = [
  { id: "new", label: "New" },
  { id: "assigned", label: "Assigned" },
  { id: "in_progress", label: "In progress" },
  { id: "resolved", label: "Resolved" },
];

const priorityClass: Record<Ticket["priority"], string> = {
  Low: "bg-secondary text-secondary-foreground",
  Medium: "bg-[oklch(0.92_0.04_220)] text-[oklch(0.35_0.08_220)]",
  High: "bg-gold/20 text-gold-foreground",
  Urgent: "bg-destructive/15 text-destructive",
};

function AdminMaintenance() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Drag-and-drop pipeline — coming soon. Click a card to open the ticket.</p>
        <Button variant="outline">Export CSV</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cols.map(col => {
          const items = tickets.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="rounded-xl border border-border bg-muted/40 p-3">
              <div className="flex items-center justify-between px-2 py-1">
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{items.length}</span>
              </div>
              <div className="mt-2 space-y-2">
                {items.map(t => (
                  <Card key={t.id} className="cursor-pointer transition-shadow hover:shadow-md">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{t.subject}</p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityClass[t.priority]}`}>{t.priority}</span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{t.category} · {t.unit}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>#{t.id.slice(-4).toUpperCase()}</span>
                        <span>{t.assignee ?? "Unassigned"}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {items.length === 0 && (
                  <p className="px-2 py-6 text-center text-xs text-muted-foreground">Nothing here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
