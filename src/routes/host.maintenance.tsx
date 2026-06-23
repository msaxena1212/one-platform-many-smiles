import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/host/maintenance")({
  component: HostMaintenance,
});

type Ticket = {
  id: string;
  title: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  assignee: string;
};

const mockTickets: Record<string, { count: number; items: Ticket[] }> = {
  "New": {
    count: 2,
    items: [
      { id: "#T3", title: "Lobby light flickering", category: "Electrical · Common", priority: "Low", assignee: "Unassigned" },
      { id: "#T5", title: "Front door lock replacement", category: "General · V-07", priority: "Urgent", assignee: "Unassigned" },
    ]
  },
  "Assigned": {
    count: 1,
    items: [
      { id: "#T2", title: "Leaking kitchen tap", category: "Plumbing · V-12", priority: "Medium", assignee: "Mahmoud K." },
    ]
  },
  "In progress": {
    count: 1,
    items: [
      { id: "#T1", title: "AC not cooling in master bedroom", category: "HVAC · A-1201", priority: "High", assignee: "Faisal T." },
    ]
  },
  "Resolved": {
    count: 1,
    items: [
      { id: "#T4", title: "Deep clean before move-in", category: "Cleaning · C-2210", priority: "Medium", assignee: "CleanCo" },
    ]
  }
};

const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case "Low": return "bg-slate-100 text-slate-700";
    case "Medium": return "bg-blue-100 text-blue-700";
    case "High": return "bg-orange-100 text-orange-700";
    case "Urgent": return "bg-red-100 text-red-700";
    default: return "bg-slate-100 text-slate-700";
  }
};

function HostMaintenance() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Drag-and-drop pipeline — coming soon. Click a card to open the ticket.
        </p>
        <Button variant="outline" size="sm">Export CSV</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {Object.entries(mockTickets).map(([status, column]) => (
          <div key={status} className="bg-muted/30 rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">{status}</h3>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background text-xs font-medium text-muted-foreground shadow-sm">
                {column.count}
              </span>
            </div>

            <div className="space-y-3">
              {column.items.map((ticket) => (
                <div key={ticket.id} className="bg-background rounded-lg p-4 shadow-sm border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h4 className="font-medium text-sm leading-tight">{ticket.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide shrink-0 ${getPriorityStyle(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{ticket.category}</p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="font-mono">{ticket.id}</span>
                    <span>{ticket.assignee}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
