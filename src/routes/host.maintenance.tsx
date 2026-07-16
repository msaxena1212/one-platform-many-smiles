import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw } from "lucide-react";
import {
  supabase,
  fetchMaintenanceTickets,
  updateMaintenanceTicket,
  type MaintenanceTicket,
} from "@/lib/supabase";
import {
  fetchInventoryParts,
  fetchMaterialUsage,
  logMaterialUsage,
  createApprovalRequest,
  type InventoryPart,
  type MaterialUsage,
} from "@/lib/supabase";

export const Route = createFileRoute("/host/maintenance")({
  component: HostMaintenance,
});

const MOCK_HOST_ID = "00000000-0000-4000-8000-000000000001";

const COLUMNS: { key: MaintenanceTicket["status"]; label: string }[] = [
  { key: "new", label: "New" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "In progress" },
  { key: "resolved", label: "Resolved" },
];

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

// Static fallback tickets in case the table doesn't exist yet
const FALLBACK_TICKETS: MaintenanceTicket[] = [
  { id: "f1", property_id: null, unit_ref: "A-1201", title: "AC not cooling in master bedroom", description: null, category: "hvac", priority: "high", status: "in_progress", assignee: "Faisal T.", host_id: null, reported_by: "Khalid Al-Mutairi", resolved_at: null, created_at: "", updated_at: "" },
  { id: "f2", property_id: null, unit_ref: "V-12", title: "Leaking kitchen tap", description: null, category: "plumbing", priority: "medium", status: "assigned", assignee: "Mahmoud K.", host_id: null, reported_by: "Sara Al-Qahtani", resolved_at: null, created_at: "", updated_at: "" },
  { id: "f3", property_id: null, unit_ref: "Common", title: "Lobby light flickering", description: null, category: "electrical", priority: "low", status: "new", assignee: null, host_id: null, reported_by: "Security Guard", resolved_at: null, created_at: "", updated_at: "" },
  { id: "f4", property_id: null, unit_ref: "C-2210", title: "Deep clean before move-in", description: null, category: "cleaning", priority: "medium", status: "resolved", assignee: "CleanCo", host_id: null, reported_by: "Property Manager", resolved_at: null, created_at: "", updated_at: "" },
  { id: "f5", property_id: null, unit_ref: "V-07", title: "Front door lock replacement", description: null, category: "security", priority: "urgent", status: "new", assignee: null, host_id: null, reported_by: "Yousef Bin Hamad", resolved_at: null, created_at: "", updated_at: "" },
];

function TicketCard({ ticket }: { ticket: MaintenanceTicket }) {
  const ticketNo = ticket.id.startsWith("f") ? `#T${ticket.id.slice(1)}` : `#${ticket.id.slice(0, 6).toUpperCase()}`;
  return (
    <div className="bg-background rounded-lg p-4 shadow-sm border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
      <div className="flex justify-between items-start mb-2 gap-2">
        <h4 className="font-medium text-sm leading-tight text-foreground">{ticket.title}</h4>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide shrink-0 capitalize ${PRIORITY_STYLES[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-1 capitalize">{ticket.category} · {ticket.unit_ref ?? "—"}</p>
      {ticket.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{ticket.description}</p>
      )}
      <div className="flex justify-between items-center text-xs text-muted-foreground mt-3">
        <span className="font-mono">{ticketNo}</span>
        <span>{ticket.assignee ?? "Unassigned"}</span>
      </div>
    </div>
  );
}


function HostMaintenance() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [editStatus, setEditStatus] = useState<MaintenanceTicket['status'] | ''>('');
  const [editAssignee, setEditAssignee] = useState<string | null>('');
  const [editDescription, setEditDescription] = useState<string | null>('');
  const [inventoryParts, setInventoryParts] = useState<InventoryPart[]>([]);
  const [materialUsage, setMaterialUsage] = useState<MaterialUsage[]>([]);
  const [partId, setPartId] = useState<string>("");
  const [partQty, setPartQty] = useState<number>(1);
  const [logging, setLogging] = useState(false);
  const [escalating, setEscalating] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchMaintenanceTickets({ host_id: MOCK_HOST_ID });
      if (data.length > 0) {
        setTickets(data);
        setUsingFallback(false);
      } else {
        setTickets(FALLBACK_TICKETS);
        setUsingFallback(true);
      }
    } catch {
      setTickets(FALLBACK_TICKETS);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    // Real-time subscription
    const channel = supabase
      .channel("maintenance_tickets_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "maintenance_tickets" },
        () => {
          // Re-fetch on any change
          fetchMaintenanceTickets({ host_id: MOCK_HOST_ID })
            .then((data) => {
              if (data.length > 0) {
                setTickets(data);
                setUsingFallback(false);
              }
            })
            .catch(() => { });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  useEffect(() => {
    // load inventory parts for usage logging
    fetchInventoryParts().then(p => setInventoryParts(p)).catch(() => setInventoryParts([]));
  }, []);

  const grouped = COLUMNS.map((col) => ({
    ...col,
    items: tickets.filter((t) => t.status === col.key),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">Export CSV</Button>
          </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {grouped.map((col) => (
            <div key={col.key} className="bg-muted/30 rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">{col.label}</h3>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background text-xs font-medium text-muted-foreground shadow-sm">
                  {col.items.length}
                </span>
              </div>
              <div className="space-y-3">
                {col.items.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">No tickets</div>
                ) : (
                  col.items.map((ticket) => (
                    <div key={ticket.id} onClick={async () => {
                      setSelectedTicket(ticket);
                      setEditStatus(ticket.status);
                      setEditAssignee(ticket.assignee || '');
                      setEditDescription(ticket.description || '');
                      try {
                        const usages = await fetchMaterialUsage(ticket.id);
                        setMaterialUsage(usages || []);
                      } catch { setMaterialUsage([]); }
                    }}>
                      <TicketCard ticket={ticket} />
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Detail / Material Usage Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => { if (!open) { setSelectedTicket(null); setMaterialUsage([]); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.title}</DialogTitle>
            <DialogDescription>{selectedTicket?.category} · {selectedTicket?.unit_ref}</DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="font-medium">Reported by: {selectedTicket.reported_by || '—'}</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedTicket.description || 'No additional details'}</p>
              </div>

              <div>
                <h4 className="font-semibold">Material Usage</h4>
                <div className="mt-2 space-y-3">
                  {materialUsage.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No parts logged yet.</p>
                  ) : (
                    <div className="rounded-lg border border-border bg-background p-3 text-sm">
                      <div className="grid grid-cols-[1fr_auto_auto] gap-4 text-xs uppercase tracking-wide text-muted-foreground">
                        <span>Part</span>
                        <span className="text-center">Qty</span>
                        <span className="text-right">Cost</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {materialUsage.map(mu => (
                          <div key={mu.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 text-sm">
                            <span>{(mu as any).inventory_parts?.name ?? 'Part'}</span>
                            <span className="text-center">{mu.quantity}</span>
                            <span className="text-right font-medium">${Number(mu.cost).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Log Material / Part</h4>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div>
                    <Label>Part</Label>
                    <Select value={partId} onValueChange={v => setPartId(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {inventoryParts.map(p => <SelectItem key={p.id} value={p.id}>{p.name} — ${p.unit_cost}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input type="number" value={partQty} onChange={e => setPartQty(Number(e.target.value))} />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={async () => {
                      if (!selectedTicket) return;
                      if (!partId) return;
                      setLogging(true);
                      try {
                        const part = inventoryParts.find(p => p.id === partId);
                        const cost = (part?.unit_cost || 0) * partQty;
                        await logMaterialUsage({ ticket_id: selectedTicket.id, part_id: partId, quantity: partQty, cost });
                        const usages = await fetchMaterialUsage(selectedTicket.id);
                        setMaterialUsage(usages || []);
                        setPartQty(1);
                      } catch (e) { console.error(e); }
                      finally { setLogging(false); }
                    }} disabled={logging}>
                      {logging ? 'Logging...' : 'Add'}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Available Parts</h4>
                <div className="mt-2 grid gap-2">
                  {inventoryParts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Inventory loading or no parts available.</p>
                  ) : (
                    inventoryParts.map(part => (
                      <div key={part.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm">
                        <div>
                          <p className="font-medium">{part.name}</p>
                          <p className="text-xs text-muted-foreground">Unit cost: ${Number(part.unit_cost).toLocaleString()}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{part.quantity_on_hand} in stock</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="w-1/2">
                  <div className="text-sm text-muted-foreground">Total Parts Cost: <strong>${materialUsage.reduce((s, m) => s + Number((m as any).cost || m.cost || 0), 0).toLocaleString()}</strong></div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setSelectedTicket(null); setMaterialUsage([]); }}>Close</Button>
                  <Button className="bg-primary hover:bg-primary/90" onClick={async () => {
                    if (!selectedTicket) return;
                    try {
                      await updateMaintenanceTicket(selectedTicket.id, { status: editStatus || selectedTicket.status, assignee: editAssignee || null, description: editDescription || null });
                      await load();
                      setSelectedTicket(null);
                      setMaterialUsage([]);
                    } catch (e) { console.error(e); alert('Failed to update ticket'); }
                  }}>
                    Save
                  </Button>
                  <Button className="bg-amber-600 hover:bg-amber-700" onClick={async () => {
                    if (!selectedTicket) return;
                    setEscalating(true);
                    try {
                      const total = materialUsage.reduce((s, m) => s + Number((m as any).cost || m.cost || 0), 0);
                      await createApprovalRequest({
                        target_record_id: selectedTicket.id,
                        target_table: 'maintenance_escalations',
                        requested_by: 'Host Portal',
                        amount: total,
                        status: 'pending',
                        notes: `Escalation for ticket: ${selectedTicket.title}. Parts cost: ${total}`,
                      });
                      setSelectedTicket(null);
                      setMaterialUsage([]);
                    } catch (e) { console.error(e); }
                    finally { setEscalating(false); }
                  }} disabled={escalating}>
                    {escalating ? 'Escalating...' : 'Escalate'}
                  </Button>
                </div>
              </div>
            </div>
          )}
          {selectedTicket && (
            <div className="mt-4 space-y-3">
              <h4 className="font-semibold">Update Ticket</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Status</Label>
                  <Select value={editStatus || ''} onValueChange={v => setEditStatus(v as MaintenanceTicket['status'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COLUMNS.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assignee</Label>
                  <Input value={editAssignee || ''} onChange={e => setEditAssignee(e.target.value)} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={editDescription || ''} onChange={e => setEditDescription(e.target.value)} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter />
        </DialogContent>
      </Dialog>
    </div>
  );
}
