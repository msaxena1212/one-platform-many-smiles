import { useEffect, useState, useCallback } from "react";
import { useSearch } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus, Loader2, Trash2, Pencil, Search, Users, Package, Building2, DoorOpen, Settings2, FileSignature
} from "lucide-react";
import {
  DynamicMastersService,
  MASTER_DEFINITIONS,
  MasterEntry,
  MasterGroupDefinition,
} from "@/lib/dynamic-masters-service";
import { toast } from "sonner";

export interface MastersModuleProps {
  role: "admin";
}

const NAV_GROUPS = [
  {
    label: "HR & Employee Masters",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    items: MASTER_DEFINITIONS.filter(m => m.category === "Employee").map(m => ({
      key: m.key,
      label: m.label,
    })),
  },
  {
    label: "Asset Masters",
    icon: Package,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    items: MASTER_DEFINITIONS.filter(m => m.category === "Asset").map(m => ({
      key: m.key,
      label: m.label,
    })),
  },
  {
    label: "Property Masters",
    icon: Building2,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    items: MASTER_DEFINITIONS.filter(m => m.category === "Property").map(m => ({
      key: m.key,
      label: m.label,
    })),
  },
  {
    label: "Unit Masters",
    icon: DoorOpen,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    items: MASTER_DEFINITIONS.filter(m => m.category === "Unit").map(m => ({
      key: m.key,
      label: m.label,
    })),
  },
  {
    label: "Customer & Lease Masters",
    icon: FileSignature,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    items: MASTER_DEFINITIONS.filter(m => m.category === "Lease").map(m => ({
      key: m.key,
      label: m.label,
    })),
  },
];

interface DynamicMasterPanelProps {
  definition: MasterGroupDefinition;
  items: MasterEntry[];
  isMandatory: boolean;
  onToggleMandatory: (val: boolean) => void;
  onAdd: (name: string) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

function DynamicMasterPanel({
  definition,
  items,
  isMandatory,
  onToggleMandatory,
  onAdd,
  onEdit,
  onDelete,
}: DynamicMasterPanelProps) {
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<MasterEntry | null>(null);
  const [value, setValue] = useState("");

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setEditItem(null);
    setValue("");
    setShowDialog(true);
  }

  function openEdit(item: MasterEntry) {
    setEditItem(item);
    setValue(item.name);
    setShowDialog(true);
  }

  function handleSave() {
    if (!value.trim()) return;
    try {
      if (editItem) {
        onEdit(editItem.id, value.trim());
        toast.success(`Updated "${value.trim()}" in ${definition.label}`);
      } else {
        onAdd(value.trim());
        toast.success(`Added "${value.trim()}" to ${definition.label}`);
      }
      setShowDialog(false);
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    }
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}" from ${definition.label}?`)) return;
    try {
      onDelete(id);
      toast.success(`Deleted "${name}"`);
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">{definition.label} Master</h2>
            <Badge variant="outline" className="text-xs">
              {items.length} Options Configured
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Category: <span className="font-semibold text-foreground">{definition.category}</span> — Synchronized with Excel upload & manual dropdowns.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-muted/40 p-2 px-3 rounded-lg border">
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Mandatory Field</span>
            <span className="text-[10px] text-muted-foreground">Require value during creation</span>
          </div>
          <Switch
            checked={isMandatory}
            onCheckedChange={(checked) => {
              onToggleMandatory(checked);
              toast.success(`${definition.label} is now ${checked ? "Mandatory" : "Optional"}`);
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${definition.label}...`}
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button size="sm" className="gap-2 ml-3 bg-teal-600 hover:bg-teal-700 text-white" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add New {definition.label}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {search ? "No matches found." : "No master options configured yet."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filtered.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors group"
            >
              <span className="text-sm font-medium">{item.name}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(item.id, item.name)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? `Edit ${definition.label}` : `Add New ${definition.label}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>{definition.label} Name / Value</Label>
              <Input
                placeholder={`Enter ${definition.label.toLowerCase()} value...`}
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSave()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!value.trim()} className="bg-teal-600 hover:bg-teal-700 text-white">
              {editItem ? "Update" : "Add to Master"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function MastersModule({ role }: MastersModuleProps) {
  const searchParams = useSearch({ strict: false }) as Record<string, any>;
  const activeKey = searchParams.tab || "gender";

  const [items, setItems] = useState<MasterEntry[]>([]);
  const [isMandatory, setIsMandatory] = useState<boolean>(false);

  const activeDef = MASTER_DEFINITIONS.find(d => d.key === activeKey) || MASTER_DEFINITIONS[0];

  const refreshActive = useCallback(() => {
    if (activeDef) {
      setItems(DynamicMastersService.getMasterValues(activeDef.key));
      setIsMandatory(DynamicMastersService.isMasterMandatory(activeDef.key));
    }
  }, [activeDef]);

  useEffect(() => {
    refreshActive();
  }, [activeKey, refreshActive]);

  const activeGroup = NAV_GROUPS.find(g => g.items.some(i => i.key === activeKey));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Masters & Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure dynamic master reference values for Properties, Units, Assets, and Employees with full Excel sync and mandatory controls.
        </p>
      </div>

      <div className="flex gap-6 min-h-[600px]">
        {/* Content Panel */}
        <div className="flex-1 min-w-0">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-3">
                {activeGroup && (
                  <div className={`p-1.5 rounded-md ${activeGroup.bg}`}>
                    <activeGroup.icon className={`h-4 w-4 ${activeGroup.color}`} />
                  </div>
                )}
                <div>
                  <CardTitle className="text-base">{activeDef.label}</CardTitle>
                  {activeGroup && (
                    <p className="text-xs text-muted-foreground">{activeGroup.label}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ScrollArea className="h-[600px] pr-2">
                <DynamicMasterPanel
                  definition={activeDef}
                  items={items}
                  isMandatory={isMandatory}
                  onToggleMandatory={(val) => {
                    DynamicMastersService.setMandatoryFlag(activeDef.key, val);
                    setIsMandatory(val);
                  }}
                  onAdd={(name) => {
                    DynamicMastersService.addMasterValue(activeDef.key, name);
                    refreshActive();
                  }}
                  onEdit={(id, name) => {
                    DynamicMastersService.updateMasterValue(activeDef.key, id, name);
                    refreshActive();
                  }}
                  onDelete={(id) => {
                    DynamicMastersService.deleteMasterValue(activeDef.key, id);
                    refreshActive();
                  }}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
