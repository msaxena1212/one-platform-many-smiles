import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fetchInventoryParts, createInventoryPart, InventoryPart } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/maintenance/inventory")({
  component: MaintenanceInventory,
});

function MaintenanceInventory() {
  const [parts, setParts] = useState<InventoryPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ part_name: '', part_number: '', category: '', quantity_on_hand: 0, unit_cost: 0 });

  useEffect(() => {
    loadParts();
  }, []);

  async function loadParts() {
    setLoading(true);
    fetchInventoryParts().then(res => setParts(res || [])).finally(() => setLoading(false));
  }

  async function handleAddPart(e: React.FormEvent) {
    e.preventDefault();
    await createInventoryPart(formData);
    setIsAddOpen(false);
    setFormData({ part_name: '', part_number: '', category: '', quantity_on_hand: 0, unit_cost: 0 });
    loadParts();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Part</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Inventory Part</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPart} className="space-y-4">
              <div className="space-y-2">
                <Label>Part Name</Label>
                <Input required value={formData.part_name} onChange={e => setFormData({...formData, part_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Part Number</Label>
                  <Input required value={formData.part_number} onChange={e => setFormData({...formData, part_number: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" required value={formData.quantity_on_hand} onChange={e => setFormData({...formData, quantity_on_hand: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Unit Cost (QAR)</Label>
                  <Input type="number" required value={formData.unit_cost} onChange={e => setFormData({...formData, unit_cost: parseFloat(e.target.value)})} />
                </div>
              </div>
              <Button type="submit" className="w-full">Save Part</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Spare Parts & Materials</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              {parts.map(part => (
                <div key={part.id} className="flex justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
                      <Box className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-semibold">{part.part_name} <span className="text-xs text-muted-foreground ml-1">({part.part_number})</span></p>
                      <p className="text-sm text-muted-foreground">{part.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{part.quantity_on_hand} <span className="font-normal text-sm text-muted-foreground">in stock</span></p>
                    <p className="text-sm">Unit Cost: QAR {part.unit_cost}</p>
                  </div>
                </div>
              ))}
              {parts.length === 0 && <div className="text-muted-foreground text-sm">No inventory parts found.</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
