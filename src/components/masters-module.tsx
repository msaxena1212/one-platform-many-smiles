import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Loader2, Trash2 } from "lucide-react";
import {
  fetchTicketCategories, createTicketCategory, deleteTicketCategory, TicketCategory,
  fetchFacilityMasters, createFacilityMaster, deleteFacilityMaster, FacilityMaster,
  fetchPaymentModes, createPaymentMode, deletePaymentMode, PaymentMode
} from "@/lib/supabase-masters";
import { toast } from "sonner";

export interface MastersModuleProps {
  role: "admin";
}

export function MastersModule({ role }: MastersModuleProps) {
  const [activeTab, setActiveTab] = useState("tickets");
  
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);
  const [facilities, setFacilities] = useState<FacilityMaster[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [showNewTicketCat, setShowNewTicketCat] = useState(false);
  const [showNewFacility, setShowNewFacility] = useState(false);
  const [showNewPaymentMode, setShowNewPaymentMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form States
  const [ticketForm, setTicketForm] = useState({ name: "", sla_hours: "24", priority: "medium" });
  const [facilityForm, setFacilityForm] = useState({ name: "", capacity: "1", paid: "false" });
  const [paymentForm, setPaymentForm] = useState({ code: "", name: "" });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [tickets, facs, payments] = await Promise.all([
        fetchTicketCategories(),
        fetchFacilityMasters(),
        fetchPaymentModes()
      ]);
      setTicketCategories(tickets);
      setFacilities(facs);
      setPaymentModes(payments);
    } catch (error: any) {
      toast.error(error.message || "Failed to load master data");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTicketCategory() {
    if (!ticketForm.name) return;
    setSaving(true);
    try {
      await createTicketCategory({
        name: ticketForm.name,
        sla_hours: parseInt(ticketForm.sla_hours) || 24,
        priority: ticketForm.priority
      });
      setShowNewTicketCat(false);
      setTicketForm({ name: "", sla_hours: "24", priority: "medium" });
      await loadData();
      toast.success("Ticket category added");
    } catch (err: any) {
      toast.error(err.message || "Failed to add category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTicket(id: number) {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteTicketCategory(id);
      await loadData();
    } catch (err: any) {
      toast.error("Failed to delete category");
    }
  }

  async function handleAddFacility() {
    if (!facilityForm.name) return;
    setSaving(true);
    try {
      await createFacilityMaster({
        name: facilityForm.name,
        capacity: parseInt(facilityForm.capacity) || 1,
        paid: facilityForm.paid === "true"
      });
      setShowNewFacility(false);
      setFacilityForm({ name: "", capacity: "1", paid: "false" });
      await loadData();
      toast.success("Facility added");
    } catch (err: any) {
      toast.error(err.message || "Failed to add facility");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFacility(id: number) {
    if (!confirm("Delete this facility?")) return;
    try {
      await deleteFacilityMaster(id);
      await loadData();
    } catch (err: any) {
      toast.error("Failed to delete facility");
    }
  }

  async function handleAddPaymentMode() {
    if (!paymentForm.code || !paymentForm.name) return;
    setSaving(true);
    try {
      await createPaymentMode({
        code: paymentForm.code.toUpperCase(),
        name: paymentForm.name
      });
      setShowNewPaymentMode(false);
      setPaymentForm({ code: "", name: "" });
      await loadData();
      toast.success("Payment mode added");
    } catch (err: any) {
      toast.error(err.message || "Failed to add payment mode");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePaymentMode(id: number) {
    if (!confirm("Delete this payment mode?")) return;
    try {
      await deletePaymentMode(id);
      await loadData();
    } catch (err: any) {
      toast.error("Failed to delete payment mode");
    }
  }

  if (loading && ticketCategories.length === 0) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Masters & Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage system categories and settings dynamically.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="tickets">Ticket Categories</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="payments">Payment Modes</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ticket Categories</CardTitle>
              <Button size="sm" className="gap-2" onClick={() => setShowNewTicketCat(true)}>
                <Plus className="h-4 w-4" /> Add Category
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ticketCategories.length === 0 && <p className="text-muted-foreground text-sm">No categories configured.</p>}
                {ticketCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-semibold">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">SLA: {cat.sla_hours} hours</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={cat.priority === "high" || cat.priority === "urgent" ? "destructive" : "secondary"}>
                        {cat.priority}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTicket(cat.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facilities" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Facility Types</CardTitle>
              <Button size="sm" className="gap-2" onClick={() => setShowNewFacility(true)}>
                <Plus className="h-4 w-4" /> Add Facility
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {facilities.length === 0 && <p className="text-muted-foreground text-sm">No facilities configured.</p>}
                {facilities.map((fac) => (
                  <div key={fac.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-semibold">{fac.name}</p>
                      <p className="text-xs text-muted-foreground">Capacity: {fac.capacity}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={fac.paid ? "default" : "outline"}>
                        {fac.paid ? "Paid Service" : "Free"}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteFacility(fac.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payment Modes</CardTitle>
              <Button size="sm" className="gap-2" onClick={() => setShowNewPaymentMode(true)}>
                <Plus className="h-4 w-4" /> Add Payment Mode
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentModes.length === 0 && <p className="text-muted-foreground text-sm">No payment modes configured.</p>}
                {paymentModes.map((mode) => (
                  <div key={mode.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-semibold">{mode.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{mode.code}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeletePaymentMode(mode.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Dialog */}
      <Dialog open={showNewTicketCat} onOpenChange={setShowNewTicketCat}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Ticket Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input placeholder="e.g. Plumbing" value={ticketForm.name} onChange={e => setTicketForm({...ticketForm, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>SLA (Hours)</Label>
              <Input type="number" placeholder="24" value={ticketForm.sla_hours} onChange={e => setTicketForm({...ticketForm, sla_hours: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={ticketForm.priority} onValueChange={v => setTicketForm({...ticketForm, priority: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTicketCat(false)}>Cancel</Button>
            <Button onClick={handleAddTicketCategory} disabled={saving || !ticketForm.name}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Facility Dialog */}
      <Dialog open={showNewFacility} onOpenChange={setShowNewFacility}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Facility Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Facility Name</Label>
              <Input placeholder="e.g. Gym" value={facilityForm.name} onChange={e => setFacilityForm({...facilityForm, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input type="number" placeholder="50" value={facilityForm.capacity} onChange={e => setFacilityForm({...facilityForm, capacity: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Service Type</Label>
              <Select value={facilityForm.paid} onValueChange={v => setFacilityForm({...facilityForm, paid: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Free Service</SelectItem>
                  <SelectItem value="true">Paid Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFacility(false)}>Cancel</Button>
            <Button onClick={handleAddFacility} disabled={saving || !facilityForm.name}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Mode Dialog */}
      <Dialog open={showNewPaymentMode} onOpenChange={setShowNewPaymentMode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Mode</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Code (Unique)</Label>
              <Input placeholder="e.g. CARD" value={paymentForm.code} onChange={e => setPaymentForm({...paymentForm, code: e.target.value.toUpperCase()})} />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="e.g. Credit/Debit Card" value={paymentForm.name} onChange={e => setPaymentForm({...paymentForm, name: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPaymentMode(false)}>Cancel</Button>
            <Button onClick={handleAddPaymentMode} disabled={saving || !paymentForm.code || !paymentForm.name}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
