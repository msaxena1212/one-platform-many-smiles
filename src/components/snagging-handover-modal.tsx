import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  FileText, 
  DollarSign, 
  PenLine, 
  Download,
  Building,
  KeyRound,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

export type SnagStatus = 'PASS' | 'MINOR_DEFECT' | 'MAJOR_DEFECT' | 'ACTION_REQUIRED';
export type InspectionType = 'MOVE_IN' | 'MOVE_OUT' | 'PERIODIC_AUDIT';

export interface SnagItem {
  id: string;
  room: string;
  item: string; // e.g., 'Walls & Paint', 'AC Cooling & Filter', 'Electrical Sockets', 'Sanitary & Taps'
  status: SnagStatus;
  notes?: string;
  photos: string[];
  repairCostEstimate?: number;
  deductFromDeposit?: boolean;
}

export interface SnaggingInspection {
  id: string;
  inspectionType: InspectionType;
  leaseId?: string;
  leaseNo?: string;
  unitCode: string;
  propertyName: string;
  tenantName: string;
  inspectorName: string;
  inspectionDate: string;
  items: SnagItem[];
  overallRemarks?: string;
  totalDepositDeductions: number;
  tenantSignature?: string;
  inspectorSignature?: string;
  status: 'DRAFT' | 'COMPLETED' | 'APPROVED';
}

const DEFAULT_AREAS = [
  'Living Room & Foyer',
  'Master Bedroom',
  'Bedroom 2',
  'Kitchen & Cabinets',
  'Bathrooms & Plumbing',
  'Balcony / Outdoor Area',
  'HVAC & Thermostats',
  'Keys, Access Cards & Remotes'
];

const DEFAULT_INSPECTION_ITEMS: Record<string, string[]> = {
  'Living Room & Foyer': ['Walls & Ceiling Paint', 'Flooring / Tiles', 'Lighting & Switches', 'Main Door & Smart Lock', 'Window Glazing & Blinds'],
  'Master Bedroom': ['Door & Handles', 'Fitted Wardrobes', 'Power Outlets', 'Windows & Balcony Access'],
  'Kitchen & Cabinets': ['Kitchen Sink & Faucets', 'Upper/Lower Cabinetry', 'Exhaust Hood', 'Countertop Condition', 'Appliance Cleanliness'],
  'Bathrooms & Plumbing': ['Water Pressure & Drainage', 'Toilet & Bidet Sprayer', 'Vanity Mirror & Basin', 'Shower Screen & Sealant'],
  'HVAC & Thermostats': ['AC Cooling Effectiveness', 'Thermostat Calibration', 'Filter Cleanliness & Grilles'],
  'Keys, Access Cards & Remotes': ['Main Keys Handed Over', 'Building Access Fob / RFID', 'Parking Barrier Remote', 'Mailbox Key']
};

export const SnaggingHandoverModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitCode: string;
  propertyName: string;
  tenantName: string;
  leaseNo?: string;
  securityDepositAmount?: number;
  defaultType?: InspectionType;
  onSaveInspection?: (inspection: SnaggingInspection) => void;
}> = ({
  open,
  onOpenChange,
  unitCode,
  propertyName,
  tenantName,
  leaseNo = 'LSE-DEFAULT',
  securityDepositAmount = 5000,
  defaultType = 'MOVE_IN',
  onSaveInspection
}) => {
  const [inspectionType, setInspectionType] = useState<InspectionType>(defaultType);
  const [inspectorName, setInspectorName] = useState('Property Operations Lead');
  const [activeRoom, setActiveRoom] = useState<string>(DEFAULT_AREAS[0]);
  const [remarks, setRemarks] = useState('');
  
  // Build initial items
  const [items, setItems] = useState<SnagItem[]>(() => {
    const list: SnagItem[] = [];
    Object.entries(DEFAULT_INSPECTION_ITEMS).forEach(([room, itemList]) => {
      itemList.forEach((item) => {
        list.push({
          id: `${room}-${item}`.replace(/\s+/g, '-').toLowerCase(),
          room,
          item,
          status: 'PASS',
          photos: [],
          repairCostEstimate: 0,
          deductFromDeposit: false
        });
      });
    });
    return list;
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeItemForPhoto, setActiveItemForPhoto] = useState<string | null>(null);

  const updateItemStatus = (id: string, status: SnagStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const updateItemNotes = (id: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item))
    );
  };

  const updateItemCost = (id: string, cost: number, deduct: boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, repairCostEstimate: cost, deductFromDeposit: deduct } : item))
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeItemForPhoto) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setItems((prev) =>
        prev.map((item) =>
          item.id === activeItemForPhoto
            ? { ...item, photos: [...item.photos, dataUrl] }
            : item
        )
      );
      toast.success('Inspection photo attached');
      setActiveItemForPhoto(null);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (itemId: string, photoIdx: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, photos: item.photos.filter((_, idx) => idx !== photoIdx) }
          : item
      )
    );
  };

  const totalDeductions = items
    .filter((i) => i.deductFromDeposit && i.repairCostEstimate)
    .reduce((sum, i) => sum + (i.repairCostEstimate || 0), 0);

  const roomItems = items.filter((i) => i.room === activeRoom);

  const handleSave = () => {
    const inspection: SnaggingInspection = {
      id: `SNAG-${Date.now()}`,
      inspectionType,
      leaseNo,
      unitCode,
      propertyName,
      tenantName,
      inspectorName,
      inspectionDate: new Date().toISOString().split('T')[0],
      items,
      overallRemarks: remarks,
      totalDepositDeductions: totalDeductions,
      status: 'COMPLETED'
    };

    onSaveInspection?.(inspection);
    toast.success(`${inspectionType === 'MOVE_IN' ? 'Move-in Snagging' : 'Move-out Inspection'} report logged & generated!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" />
              <DialogTitle className="text-xl">
                {inspectionType === 'MOVE_IN' ? 'Move-In Snagging & Inventory Handover' : 'Move-Out Inspection & Deposit Settlement'}
              </DialogTitle>
            </div>
            <Badge variant="outline" className="text-sm font-medium">
              Unit {unitCode} • {propertyName}
            </Badge>
          </div>
          <DialogDescription>
            Tenant: <strong>{tenantName}</strong> • Contract Ref: <strong>{leaseNo}</strong> • Deposit: <strong>QR {securityDepositAmount.toLocaleString()}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Hidden File Input for photos */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        <div className="space-y-4 py-2">
          {/* Header Configuration Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg border">
            <div>
              <Label className="text-xs font-semibold">Inspection Mode</Label>
              <Select value={inspectionType} onValueChange={(val: any) => setInspectionType(val)}>
                <SelectTrigger className="h-8 mt-1 bg-background text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOVE_IN">Move-In Handover (Checklist)</SelectItem>
                  <SelectItem value="MOVE_OUT">Move-Out Audit (Deposit Deductions)</SelectItem>
                  <SelectItem value="PERIODIC_AUDIT">Periodic Routine Snagging</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Assigned Inspector / Lead</Label>
              <Input
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="h-8 mt-1 bg-background text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Deposit Settlement Impact</Label>
              <div className="flex items-center justify-between h-8 mt-1 px-3 bg-background border rounded-md text-xs">
                <span className="text-muted-foreground">Estimated Deductions:</span>
                <span className={`font-bold ${totalDeductions > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  QR {totalDeductions.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Room Selection Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {DEFAULT_AREAS.map((room) => {
              const countIssues = items.filter((i) => i.room === room && i.status !== 'PASS').length;
              return (
                <button
                  key={room}
                  onClick={() => setActiveRoom(room)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    activeRoom === room
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground border-transparent'
                  }`}
                >
                  {room}
                  {countIssues > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {countIssues}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Room Inspection Items */}
          <div className="space-y-3">
            {roomItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border transition-all ${
                  item.status === 'PASS'
                    ? 'bg-card border-border'
                    : item.status === 'MINOR_DEFECT'
                    ? 'bg-amber-50/40 border-amber-300 dark:bg-amber-950/20'
                    : 'bg-rose-50/40 border-rose-300 dark:bg-rose-950/20'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{item.item}</span>
                  </div>

                  {/* Status buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant={item.status === 'PASS' ? 'default' : 'outline'}
                      onClick={() => updateItemStatus(item.id, 'PASS')}
                      className={`h-7 text-xs ${item.status === 'PASS' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Satisfactory
                    </Button>
                    <Button
                      size="sm"
                      variant={item.status === 'MINOR_DEFECT' ? 'default' : 'outline'}
                      onClick={() => updateItemStatus(item.id, 'MINOR_DEFECT')}
                      className={`h-7 text-xs ${item.status === 'MINOR_DEFECT' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Minor Defect
                    </Button>
                    <Button
                      size="sm"
                      variant={item.status === 'MAJOR_DEFECT' ? 'default' : 'outline'}
                      onClick={() => updateItemStatus(item.id, 'MAJOR_DEFECT')}
                      className={`h-7 text-xs ${item.status === 'MAJOR_DEFECT' ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Major / Replace
                    </Button>
                  </div>
                </div>

                {/* Extended Details when not PASS */}
                {item.status !== 'PASS' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-3 pt-3 border-t">
                    <div className="md:col-span-6">
                      <Label className="text-[11px] text-muted-foreground">Defect Notes & Snag Description</Label>
                      <Input
                        placeholder="e.g., Paint peeling on top corner, needs recoat"
                        value={item.notes || ''}
                        onChange={(e) => updateItemNotes(item.id, e.target.value)}
                        className="h-8 mt-1 text-xs"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <Label className="text-[11px] text-muted-foreground">Est. Repair Cost (QR)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={item.repairCostEstimate || ''}
                        onChange={(e) => updateItemCost(item.id, Number(e.target.value), item.deductFromDeposit || false)}
                        className="h-8 mt-1 text-xs"
                      />
                    </div>

                    <div className="md:col-span-3 flex items-center pt-5">
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.deductFromDeposit || false}
                          onChange={(e) => updateItemCost(item.id, item.repairCostEstimate || 0, e.target.checked)}
                          className="rounded border-gray-300 text-rose-600"
                        />
                        Deduct from Deposit
                      </label>
                    </div>

                    {/* Photos list */}
                    <div className="md:col-span-12 flex items-center gap-2 flex-wrap pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveItemForPhoto(item.id);
                          fileInputRef.current?.click();
                        }}
                        className="h-7 text-xs border-dashed"
                      >
                        <Camera className="w-3 h-3 mr-1" /> Add Evidence Photo
                      </Button>

                      {item.photos.map((photo, idx) => (
                        <div key={idx} className="relative group w-12 h-12 rounded border overflow-hidden">
                          <img src={photo} alt="snag proof" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(item.id, idx)}
                            className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Overall Comments */}
          <div>
            <Label className="text-xs font-semibold">General Inspection Remarks & Tenant Acknowledgment</Label>
            <Textarea
              placeholder="e.g., Unit inspected thoroughly with tenant present. Keys, remotes, and access cards tested and handed over."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="mt-1 text-xs h-16"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Complete & Save Inspection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
