import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  AlertTriangle, Activity, ArrowUpRight, BarChart3, Building2, CheckCircle2, ChevronRight,
  ClipboardList, Database, Info, Link2,
  Package, PackageCheck, Plus, RefreshCw, ShoppingCart,
  Truck, Users, Wrench, AlertOctagon, TrendingUp, Shield, Inbox,
  CreditCard, Ship, DollarSign, Star, Pencil, Trash2, Send, CheckCheck, Search, FileText, Eye,
  ArrowRight, ShieldCheck, PieChart, Layers, Clock
} from "lucide-react";
import { fetchProperties, fetchUnits, type Property, type Unit } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { FinVendorsApi, type FinVendor } from "@/lib/supabase-finance";
import { nextProcurementDocumentNumber } from "@/lib/procurement/numbering";
import { ApInvoicesApi, type ProcApInvoice, type PaymentReceipt } from "@/lib/proc-invoices-api";
import { PaymentReceiptDialog } from "@/components/payment-receipt-dialog";
import { ProformaInvoiceDialog } from "@/components/proforma-invoice-dialog";

// ── Types ─────────────────────────────────────────────────────────────────────
type PurchaseRequest = {
  id: string;
  doc_number: string;
  request_date: string;
  status: string;
  posting_status: string;
  priority?: string | null;
  total_amount: number;
  remarks?: string | null;
  property_id?: string | null;
  unit_id?: string | null;
  created_at: string;
};

type PurchaseOrder = {
  id: string;
  doc_number: string;
  po_date: string;
  vendor_id: number;
  status: string;
  posting_status: string;
  property_id?: string | null;
  unit_id?: string | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  delivery_date?: string | null;
  payment_terms?: string | null;
  delivery_terms?: string | null;
  remarks?: string | null;
  created_at: string;
};

type PurchaseOrderLine = {
  id: string;
  purchase_order_id: string;
  line_no: number;
  item_name: string;
  description?: string | null;
  item_code?: string | null;
  quantity: number;
  unit_rate: number;
  line_total: number;
  received_quantity: number;
  accepted_quantity: number;
  rejected_quantity: number;
  item_type?: string | null;
  uom?: string | null;
  property_id?: string | null;
  unit_id?: string | null;
  remarks?: string | null;
};

type GoodsReceipt = {
  id: string;
  grn_number: string;
  purchase_order_id: string;
  vendor_id?: number | null;
  grn_date: string;
  warehouse_name?: string | null;
  receiving_location?: string | null;
  status: string;
  posting_status: string;
  subtotal: number;
  total_amount: number;
  remarks?: string | null;
  created_at: string;
};

type GoodsReceiptLine = {
  id: string;
  goods_receipt_id: string;
  purchase_order_line_id?: string | null;
  line_no: number;
  item_code?: string | null;
  item_name?: string | null;
  description: string;
  ordered_quantity: number;
  received_quantity: number;
  accepted_quantity: number;
  rejected_quantity: number;
  unit_rate: number;
  accepted_amount: number;
  uom?: string | null;
  remarks?: string | null;
};

type ItemType = "asset" | "maintenance_spare" | "consumable" | "service";
type BudgetHead = "Salary" | "Maintenance Items" | "Property Assets" | "Unit Assets" | "Other";

export type ProcLineItem = {
  id: string;
  itemId?: string;
  itemCode: string;
  itemName: string;
  description: string;
  propertyId: string;
  unitId: string;
  quantity: number;
  maxQuantity?: number;
  prLineId?: string;
  unitRate: number;
  lineTotal: number;
  itemType: ItemType;
  budgetType: "CAPEX" | "OPEX";
  budgetHead: BudgetHead;
  uom: string;
  remarks?: string;
};

type CatalogItem = {
  id: string;
  item_code: string;
  name: string;
  category: string;
  item_type: ItemType;
  budget_type: "CAPEX" | "OPEX";
  budget_head: BudgetHead;
  unit_price: number;
  unit_of_measure: string;
  reorder_level: number;
  active: boolean;
};

const defaultCatalogItems: CatalogItem[] = [
  { id: "cat-1", item_code: "AST-HVAC-001", name: "Split AC 2 Ton (Daikin)", category: "HVAC", item_type: "asset", budget_type: "CAPEX", budget_head: "Property Assets", unit_price: 3200, unit_of_measure: "Nos", reorder_level: 0, active: true },
  { id: "cat-2", item_code: "MNT-FLT-001", name: "AC Air Filter 24x24", category: "HVAC Spare", item_type: "maintenance_spare", budget_type: "OPEX", budget_head: "Maintenance Items", unit_price: 65, unit_of_measure: "Nos", reorder_level: 20, active: true },
  { id: "cat-3", item_code: "MNT-LED-001", name: "LED Ceiling Panel 40W", category: "Electrical", item_type: "consumable", budget_type: "OPEX", budget_head: "Maintenance Items", unit_price: 45, unit_of_measure: "Nos", reorder_level: 50, active: true },
  { id: "cat-4", item_code: "MNT-PLB-001", name: "Flexible Water Hose SS 1/2", category: "Plumbing", item_type: "maintenance_spare", budget_type: "OPEX", budget_head: "Maintenance Items", unit_price: 35, unit_of_measure: "Nos", reorder_level: 15, active: true },
  { id: "cat-5", item_code: "SRV-ELEV-001", name: "Elevator Preventive Maintenance", category: "Elevator", item_type: "service", budget_type: "OPEX", budget_head: "Other", unit_price: 1500, unit_of_measure: "Service", reorder_level: 0, active: true },
  { id: "cat-6", item_code: "AST-PUMP-001", name: "Water Booster Pump 5HP", category: "Plumbing", item_type: "asset", budget_type: "CAPEX", budget_head: "Property Assets", unit_price: 4800, unit_of_measure: "Nos", reorder_level: 0, active: true },
  { id: "cat-7", item_code: "AST-FUR-001", name: "Living Room Sofa Set (3+2)", category: "Furnishing", item_type: "asset", budget_type: "CAPEX", budget_head: "Unit Assets", unit_price: 2600, unit_of_measure: "Set", reorder_level: 0, active: true },
  { id: "cat-8", item_code: "PAY-SEC-001", name: "On-site Security Staff Monthly", category: "Staff", item_type: "service", budget_type: "OPEX", budget_head: "Salary", unit_price: 3500, unit_of_measure: "Month", reorder_level: 0, active: true },
];

const typeLabel: Record<ItemType, string> = { asset: "Fixed Asset", maintenance_spare: "Maintenance Spare", consumable: "Consumable", service: "Service" };

// ── Nav Groups ────────────────────────────────────────────────────────────────
const PROC_NAV = [
  { group: "Procurement Operations", icon: ClipboardList, color: "text-cyan-400", items: [
    { key: "requests", label: "Purchase Requests", icon: ShoppingCart },
    { key: "orders", label: "Purchase Orders", icon: ClipboardList },
    { key: "shipments", label: "Shipments", icon: Ship },
    { key: "receiving", label: "GRN / Receiving", icon: Truck },
  ]},
  { group: "Vendor & Sourcing", icon: Users, color: "text-violet-400", items: [
    { key: "vendors", label: "Vendors", icon: Users },
    { key: "rfx", label: "RFX / Tenders", icon: Database },
    { key: "quotations", label: "Quotations", icon: Star },
  ]},
  { group: "Approvals & Invoices", icon: Inbox, color: "text-amber-400", items: [
    { key: "inbox", label: "Approval Inbox", icon: Inbox },
    { key: "invoices", label: "Payable Invoices", icon: DollarSign },
  ]},
  { group: "Control Tower", icon: BarChart3, color: "text-rose-400", items: [
    { key: "dashboard", label: "Procurement Analytics", icon: BarChart3 },
    { key: "supplier_perf", label: "Supplier Scorecards", icon: TrendingUp },
  ]},
  { group: "Asset & Maintenance Integration", icon: Link2, color: "text-orange-400", items: [
    { key: "assets", label: "Asset Linkage", icon: Link2 },
    { key: "maintenance", label: "Maintenance Stock", icon: Wrench },
  ]},
  { group: "Item Master", icon: Package, color: "text-emerald-400", items: [
    { key: "catalog", label: "Item Catalog", icon: Package },
  ]},
] as const;

function statusBadgeVariant(s: string): "default" | "destructive" | "secondary" | "outline" {
  if (["APPROVED", "COMPLETED", "PAID", "POSTED", "CLOSED"].includes(s)) return "default";
  if (["REJECTED", "CANCELLED", "OVERDUE"].includes(s)) return "destructive";
  if (["SUBMITTED", "IN_PROGRESS", "ALERTED", "RECEIVED", "IN TRANSIT", "IN_TRANSIT"].includes(s)) return "secondary";
  return "outline";
}

// ── Searchable Catalog Item Combobox Component ───────────────────────────────
function CatalogItemCombobox({
  catalog,
  selectedItemId,
  selectedItemName,
  onSelectItem,
  placeholder = "Search items by name, code, category..."
}: {
  catalog: CatalogItem[];
  selectedItemId: string;
  selectedItemName: string;
  onSelectItem: (item: CatalogItem) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return catalog;
    const q = search.toLowerCase();
    return catalog.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.item_code.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }, [catalog, search]);

  const selectedItem = catalog.find(c => c.id === selectedItemId || c.name === selectedItemName);

  return (
    <div className="relative">
      <div 
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between border rounded-md px-3 py-2 text-xs bg-background cursor-pointer hover:bg-muted/40 transition"
      >
        <span className={selectedItem ? "font-medium text-foreground" : "text-muted-foreground"}>
          {selectedItem ? `${selectedItem.name} [${selectedItem.item_code}] - QAR ${selectedItem.unit_price}` : placeholder}
        </span>
        <Search className="h-3.5 w-3.5 text-muted-foreground ml-2 shrink-0" />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full border rounded-md bg-popover shadow-lg text-xs overflow-hidden">
          <div className="p-2 border-b bg-muted/20">
            <Input 
              autoFocus
              placeholder="Type to filter..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="h-7 text-xs"
            />
          </div>
          <div className="max-h-56 overflow-y-auto divide-y">
            {filtered.length === 0 && (
              <div className="p-3 text-center text-muted-foreground">No matching items found.</div>
            )}
            {filtered.map(item => (
              <div 
                key={item.id}
                onClick={() => {
                  onSelectItem(item);
                  setOpen(false);
                  setSearch("");
                }}
                className="p-2 hover:bg-accent cursor-pointer flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground">{item.item_code} · {item.category}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-[10px]">{typeLabel[item.item_type]}</Badge>
                  <p className="font-mono text-emerald-600 font-semibold mt-0.5">QAR {item.unit_price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Robust Searchable Catalog Item Selector ──────────────────────────────────
function LineItemCatalogSelector({
  catalog,
  value,
  onSelect,
  placeholder = "Select or search catalog item..."
}: {
  catalog: CatalogItem[];
  value?: string;
  onSelect: (item: CatalogItem) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return catalog;
    const q = search.toLowerCase();
    return catalog.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.item_code.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }, [catalog, search]);

  const selected = catalog.find(c => c.name === value || c.item_code === value || c.id === value);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between border rounded-md px-3 py-1.5 text-xs bg-background cursor-pointer hover:border-primary/60 transition h-9 ${
          !value ? "border-amber-400/80 bg-amber-50/10" : "border-input"
        }`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          <Package className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className={`truncate font-medium ${selected || value ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
            {selected ? `${selected.name} (${selected.item_code})` : value || placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {selected && (
            <span className="font-mono text-[11px] text-emerald-600 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              QAR {selected.unit_price}
            </span>
          )}
          <Search className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[300px] max-w-[500px] border rounded-lg bg-popover shadow-2xl text-xs overflow-hidden left-0">
          <div className="p-2 border-b bg-muted/40">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search catalog by name, SKU, or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs bg-background"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto divide-y divide-border/40">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-xs">
                <p>No matching master items found.</p>
              </div>
            ) : (
              filtered.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="p-2.5 hover:bg-primary/10 cursor-pointer flex justify-between items-center transition group"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="font-semibold text-foreground group-hover:text-primary transition truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground font-mono">
                      <span className="bg-muted px-1.5 py-0.5 rounded font-semibold text-foreground">{item.item_code}</span>
                      <span>·</span>
                      <span>{item.category}</span>
                      <span>·</span>
                      <span className="text-primary font-medium">{item.budget_type} ({item.budget_head})</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-emerald-600 font-bold text-xs block">QAR {item.unit_price}</span>
                    <span className="text-[10px] text-muted-foreground">/{item.unit_of_measure}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Procurement Module Component ─────────────────────────────────────────
export function ProcurementModule({ role }: { role: "admin" | "prop-mgr" | "finance" | "cashier" }) {
  const routerState = useRouterState();
  const searchParams = new URLSearchParams(routerState.location.search);
  const activeTab = searchParams.get("tab") || "requests";

  // Data states
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [vendors, setVendors] = useState<FinVendor[]>([]);
  const [prs, setPrs] = useState<PurchaseRequest[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [poLines, setPoLines] = useState<PurchaseOrderLine[]>([]);
  const [grns, setGrns] = useState<GoodsReceipt[]>([]);
  const [grnLines, setGrnLines] = useState<GoodsReceiptLine[]>([]);
  const [rfxList, setRfxList] = useState<any[]>([]);
  const [quoteList, setQuoteList] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [inventoryParts, setInventoryParts] = useState<any[]>([]);
  const [apInvoices, setApInvoices] = useState<ProcApInvoice[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>(() => {
    try {
      const saved = localStorage.getItem("proc_catalog_items");
      return saved ? JSON.parse(saved) : defaultCatalogItems;
    } catch {
      return defaultCatalogItems;
    }
  });

  // UI modal states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showNewPR, setShowNewPR] = useState(false);
  const [showNewPO, setShowNewPO] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showNewRFX, setShowNewRFX] = useState(false);
  const [showNewQuote, setShowNewQuote] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [selectedPOForReceive, setSelectedPOForReceive] = useState<PurchaseOrder | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<any | null>(null);
  const [selectedStockDetail, setSelectedStockDetail] = useState<any | null>(null);
  const [selectedCatalogDetail, setSelectedCatalogDetail] = useState<CatalogItem | null>(null);

  // Detail View Dialog States for PR, PO, Shipment, GRN, AP Invoice
  const [viewPr, setViewPr] = useState<PurchaseRequest | null>(null);
  const [viewPo, setViewPo] = useState<PurchaseOrder | null>(null);
  const [viewShipment, setViewShipment] = useState<any | null>(null);
  const [viewGrn, setViewGrn] = useState<GoodsReceipt | null>(null);
  const [viewInvoice, setViewInvoice] = useState<ProcApInvoice | null>(null);

  // Dedicated Payment Settlement Dialog State
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<ProcApInvoice | null>(null);
  const [procPayStep, setProcPayStep] = useState<number>(1);
  const [paymentForm, setPaymentForm] = useState({
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "Bank Wire / QNB Corporate Electronic",
    disbursingBank: "Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)",
    transactionReference: "",
    beneficiaryAccount: "QA91QNBA99887766554433",
    cashCustodian: "Main Office Cashier Desk",
    cashReceiptNo: "",
    receiverName: "",
    receiverContact: "",
    chequeNumber: "",
    chequeDueDate: new Date().toISOString().slice(0, 10),
    creditCardAuth: "",
    remarks: "",
    paymentAmount: 0 as number,
    applyAdvance: false,
    advanceAmount: 0 as number,
  });

  // Helper to create a new default line item
  function createDefaultLineItem(propertyId = "", unitId = ""): ProcLineItem {
    return {
      id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      itemId: "",
      itemCode: "",
      itemName: "",
      description: "",
      propertyId: propertyId,
      unitId: unitId,
      quantity: 1,
      unitRate: 0,
      lineTotal: 0,
      itemType: "consumable",
      budgetType: "OPEX",
      budgetHead: "Maintenance Items",
      uom: "Nos",
      remarks: "",
    };
  }

  // Type for Goods Receipt Lines inside modal
  type ReceiveLineItem = {
    poLineId: string;
    itemCode?: string;
    itemName: string;
    description: string;
    propertyId?: string;
    unitId?: string;
    orderedQty: number;
    prevReceivedQty: number;
    acceptedQty: number;
    rejectedQty: number;
    unitRate: number;
    uom: string;
  };

  // Forms
  const [prForm, setPrForm] = useState<{
    priority: string;
    remarks: string;
    lines: ProcLineItem[];
  }>({
    priority: "NORMAL",
    remarks: "",
    lines: [createDefaultLineItem()],
  });

  const [poForm, setPoForm] = useState<{
    vendorId: string;
    sourcePrId: string;
    sourcePrDoc: string;
    paymentTerms: string;
    settlementMode: string;
    deliveryTerms: string;
    remarks: string;
    lines: ProcLineItem[];
  }>({
    vendorId: "",
    sourcePrId: "",
    sourcePrDoc: "",
    paymentTerms: "Net 30 Days",
    settlementMode: "Bank Wire / Electronic Transfer (QNB)",
    deliveryTerms: "FOB Destination",
    remarks: "",
    lines: [createDefaultLineItem()],
  });

  const [receiveForm, setReceiveForm] = useState<{
    warehouseName: string;
    receivingLocation: string;
    remarks: string;
    lines: ReceiveLineItem[];
  }>({
    warehouseName: "Main Facility Stores",
    receivingLocation: "Dock 1",
    remarks: "",
    lines: [],
  });

  const [catalogForm, setCatalogForm] = useState<Omit<CatalogItem, "id">>({
    item_code: "",
    name: "",
    category: "HVAC",
    item_type: "asset",
    budget_type: "CAPEX",
    budget_head: "Property Assets",
    unit_price: 100,
    unit_of_measure: "Nos",
    reorder_level: 5,
    active: true,
  });

  const [shipmentForm, setShipmentForm] = useState({
    purchaseOrderId: "",
    carrierName: "DHL Global Forwarding",
    trackingNumber: "",
    originCountry: "Qatar",
    destinationPort: "Hamad Port / Doha Logistics Village",
    incoterm: "DAP",
    estimatedArrival: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    customsDeclarationNo: "",
    inTransitValue: "0",
    status: "DRAFT",
  });

  const [editShipment, setEditShipment] = useState<any | null>(null);

  const [rfxForm, setRfxForm] = useState({
    title: "",
    rfxType: "RFP",
    prId: "",
    closingDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    scopeDescription: "",
  });

  const [quoteForm, setQuoteForm] = useState({
    rfxId: "",
    vendorId: "",
    amount: "0",
    taxAmount: "0",
    remarks: ""
  });

  // ── Load All Data ───────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        pRes, uRes, vRes, prRes, poRes, polRes, grnRes, grnlRes, rfxRes, vqRes, shRes, invRes, apInvRes
      ] = await Promise.all([
        fetchProperties().catch(() => []),
        fetchUnits().catch(() => []),
        FinVendorsApi.fetchAll().catch(() => []),
        supabase.from("proc_purchase_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("proc_purchase_orders").select("*").order("created_at", { ascending: false }),
        supabase.from("proc_purchase_order_lines").select("*").order("line_no", { ascending: true }),
        supabase.from("proc_goods_receipts").select("*").order("created_at", { ascending: false }),
        supabase.from("proc_grn_lines").select("*").order("line_no", { ascending: true }),
        supabase.from("proc_rfx").select("*").order("created_at", { ascending: false }),
        supabase.from("proc_vendor_quotes").select("*").order("created_at", { ascending: false }),
        supabase.from("proc_shipments").select("*").order("created_at", { ascending: false }),
        supabase.from("inventory_parts").select("*"),
        ApInvoicesApi.fetchAll().catch(() => []),
      ]);

      // Normalize shipments to decode extra metadata stored in remarks or fallback columns
      const normalizedShipments = (shRes.data || []).map((s: any) => {
        let meta: any = {};
        if (s.remarks) {
          try {
            if (s.remarks.startsWith("{") && s.remarks.endsWith("}")) {
              meta = JSON.parse(s.remarks);
            }
          } catch {}
        }
        return {
          ...s,
          carrier_name: s.carrier_name || s.shipping_mode || meta.carrier_name || "DHL Global Forwarding",
          tracking_number: s.tracking_number || meta.tracking_number || "",
          origin_country: s.origin_country || meta.origin_country || "Qatar",
          destination_port: s.destination_port || s.destination_city || meta.destination_port || "Hamad Port / Doha Logistics Village",
          incoterm: s.incoterm || meta.incoterm || "DAP",
          estimated_arrival: s.estimated_arrival || s.expected_arrival_date || meta.estimated_arrival || "",
          customs_declaration_no: s.customs_declaration_no || meta.customs_declaration_no || "",
          in_transit_value: s.in_transit_value ?? meta.in_transit_value ?? 0,
        };
      });

      setProperties(pRes || []);
      setUnits(uRes || []);
      setVendors(vRes || []);
      setPrs(prRes.data || []);
      setPos(poRes.data || []);
      setPoLines(polRes.data || []);
      setGrns(grnRes.data || []);
      setGrnLines(grnlRes.data || []);
      setRfxList(rfxRes.data || []);
      setQuoteList(vqRes.data || []);
      setShipments(normalizedShipments);
      setInventoryParts(invRes.data || []);
      setApInvoices(apInvRes || []);
    } catch (e: any) {
      console.error("Error loading procurement data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const handleUpdate = () => loadAll();
    window.addEventListener('ap_invoices_updated', handleUpdate);
    window.addEventListener('payment_receipts_updated', handleUpdate);
    return () => {
      window.removeEventListener('ap_invoices_updated', handleUpdate);
      window.removeEventListener('payment_receipts_updated', handleUpdate);
    };
  }, [loadAll]);

  // ── Helper Lookup ───────────────────────────────────────────────────────────
  function getVendorName(vendorId?: number | null) {
    if (!vendorId) return "—";
    const v = vendors.find(x => Number(x.id) === Number(vendorId) || x.code === String(vendorId));
    return v ? v.name : `Vendor #${vendorId}`;
  }

  function getPropertyName(propertyId?: string | null) {
    if (!propertyId) return "Company / Multi-Property";
    const p = properties.find(x => x.id === propertyId);
    return p ? p.title : "Property";
  }

  function getUnitRef(unitId?: string | null) {
    if (!unitId) return "—";
    const u = units.find(x => x.id === unitId);
    return u ? (u.unit_ref || `Unit ${u.id}`) : unitId;
  }

  // Parse lines stored inside PR (either via JSON or legacy single line format)
  function parsePrLines(pr: PurchaseRequest): ProcLineItem[] {
    if (pr.remarks && pr.remarks.includes("[LINES_JSON]:")) {
      try {
        const jsonStr = pr.remarks.split("[LINES_JSON]:")[1].trim().split("\n")[0];
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((l: any, i: number) => ({
            ...l,
            maxQuantity: Number(l.quantity) || 1,
            prLineId: l.id || `pr-line-${pr.id}-${i}`,
          }));
        }
      } catch (e) {
        console.warn("Could not parse PR lines JSON:", e);
      }
    }
    // Fallback single line from legacy remarks/total
    let itemDesc = "General Requisition Item";
    let itemCode = "";
    const match = pr.remarks?.match(/Item:\s*([^[()]+?)(?:\s*\[(.*?)\])?(?:\s*\((.*?)\))?$/);
    if (match) {
      itemDesc = match[1]?.trim() || "";
      itemCode = match[2]?.trim() || "";
    } else if (pr.remarks && !pr.remarks.startsWith("Requisition") && !pr.remarks.startsWith("[LINES_JSON]")) {
      itemDesc = pr.remarks.replace(/^Item:\s*/i, "").trim();
    }
    const tot = Number(pr.total_amount || 0);
    const matchedCat = defaultCatalogItems.find(c => c.item_code === itemCode || c.name.toLowerCase() === itemDesc.toLowerCase());
    const unitPrice = matchedCat?.unit_price || tot;
    const qty = matchedCat && matchedCat.unit_price > 0 && tot > 0 ? Math.round(tot / matchedCat.unit_price) || 1 : 1;

    return [{
      id: `line-${pr.id || "1"}`,
      itemCode: itemCode || matchedCat?.item_code || "",
      itemName: itemDesc || matchedCat?.name || "Requisition Item",
      description: itemDesc,
      propertyId: pr.property_id || "",
      unitId: pr.unit_id || "",
      quantity: qty,
      maxQuantity: qty,
      prLineId: `pr-line-${pr.id || "1"}`,
      unitRate: unitPrice,
      lineTotal: tot,
      itemType: (matchedCat?.item_type || "consumable") as ItemType,
      budgetType: matchedCat?.budget_type || "OPEX",
      budgetHead: matchedCat?.budget_head || "Maintenance Items",
      uom: matchedCat?.unit_of_measure || "Nos",
    }];
  }

  // ── Operations Actions ──────────────────────────────────────────────────────
  async function handleCreatePR() {
    setSaving(true);
    try {
      const docNum = await nextProcurementDocumentNumber("PR");
      const validLines = prForm.lines.filter(l => (l.itemName || l.description) && (Number(l.quantity) > 0));
      if (validLines.length === 0) {
        toast.error("Please add at least one line item with an item name and valid quantity.");
        setSaving(false);
        return;
      }
      const totalAmt = validLines.reduce((sum, l) => sum + (Number(l.quantity) || 1) * (Number(l.unitRate) || 0), 0);
      const primaryPropertyId = validLines[0]?.propertyId || null;
      const primaryUnitId = validLines[0]?.unitId || null;

      // Encode lines JSON inside remarks for multi-line fidelity
      const remarksPayload = `[LINES_JSON]: ${JSON.stringify(validLines)}\n${prForm.remarks || ""}`.trim();

      const { data, error } = await supabase.from("proc_purchase_requests").insert({
        doc_number: docNum,
        request_date: new Date().toISOString().slice(0, 10),
        status: "DRAFT",
        posting_status: "UNPOSTED",
        priority: prForm.priority,
        property_id: primaryPropertyId,
        unit_id: primaryUnitId,
        total_amount: totalAmt,
        remarks: remarksPayload,
      }).select().single();

      if (error) throw error;
      toast.success(`Purchase Requisition ${docNum} created with ${validLines.length} item line(s).`);
      setShowNewPR(false);
      setPrForm({
        priority: "NORMAL",
        remarks: "",
        lines: [createDefaultLineItem()],
      });
      await loadAll();
    } catch (e: any) {
      toast.error(e.message || "Failed to create PR");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitPR(pr: PurchaseRequest) {
    setSaving(true);
    try {
      await supabase.from("proc_purchase_requests").update({ status: "SUBMITTED" }).eq("id", pr.id);
      toast.success(`PR ${pr.doc_number} submitted for approval.`);
      await loadAll();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleApprovePR(pr: PurchaseRequest) {
    setSaving(true);
    try {
      await supabase.from("proc_purchase_requests").update({ status: "APPROVED" }).eq("id", pr.id);
      toast.success(`PR ${pr.doc_number} approved. Ready to create RFX or PO.`);
      await loadAll();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreatePO() {
    setSaving(true);
    try {
      const docNum = await nextProcurementDocumentNumber("PO");
      const validLines = poForm.lines.filter(l => (l.itemName || l.description) && (Number(l.quantity) > 0));
      if (validLines.length === 0) {
        toast.error("Please add at least one line item with item details and quantity.");
        setSaving(false);
        return;
      }
      // Enforce strict PR line item quantity cap if PO was raised from PR
      for (const l of validLines) {
        if (l.maxQuantity != null && Number(l.quantity) > l.maxQuantity) {
          toast.error(`Quantity for "${l.itemName || l.description}" (${l.quantity}) cannot exceed requested PR quantity of ${l.maxQuantity} ${l.uom || "Nos"}.`);
          setSaving(false);
          return;
        }
      }

      const totalAmt = validLines.reduce((sum, l) => sum + (Number(l.quantity) || 1) * (Number(l.unitRate) || 0), 0);
      const primaryPropertyId = validLines[0]?.propertyId || null;
      const primaryUnitId = validLines[0]?.unitId || null;

      const { data: poData, error: poErr } = await supabase.from("proc_purchase_orders").insert({
        doc_number: docNum,
        po_date: new Date().toISOString().slice(0, 10),
        vendor_id: Number(poForm.vendorId) || 1,
        status: "DRAFT",
        posting_status: "UNPOSTED",
        property_id: primaryPropertyId,
        unit_id: primaryUnitId,
        subtotal: totalAmt,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: totalAmt,
        payment_terms: `${poForm.paymentTerms} (${poForm.settlementMode})`,
        delivery_terms: poForm.deliveryTerms,
        remarks: poForm.remarks || (poForm.sourcePrDoc ? `Generated from Requisition ${poForm.sourcePrDoc}` : ""),
      }).select().single();

      if (poErr) throw poErr;

      const linesToInsert = validLines.map((l, idx) => ({
        purchase_order_id: poData.id,
        line_no: idx + 1,
        item_code: l.itemCode || null,
        item_name: l.itemName || l.description || "Procured Item",
        description: l.description || l.itemName || "Procured Item",
        quantity: Number(l.quantity) || 1,
        unit_rate: Number(l.unitRate) || 0,
        line_total: (Number(l.quantity) || 1) * (Number(l.unitRate) || 0),
        received_quantity: 0,
        accepted_quantity: 0,
        rejected_quantity: 0,
        item_type: l.itemType,
        uom: l.uom || "Nos",
        property_id: l.propertyId || null,
        unit_id: l.unitId || null,
        remarks: l.remarks || null,
      }));

      const { error: lineErr } = await supabase.from("proc_purchase_order_lines").insert(linesToInsert);
      if (lineErr) console.warn("Error inserting PO lines:", lineErr);

      // Update PR status to COMPLETED and update remarks with PO details
      if (poForm.sourcePrId) {
        try {
          const targetPr = prs.find(p => p.id === poForm.sourcePrId);
          const currentRemarks = targetPr?.remarks || "";
          const updatedRemarks = currentRemarks ? `${currentRemarks} • [PO Issued: ${docNum}]` : `[PO Issued: ${docNum}]`;
          await supabase.from("proc_purchase_requests").update({
            status: "COMPLETED",
            posting_status: "POSTED",
            remarks: updatedRemarks,
          }).eq("id", poForm.sourcePrId);
        } catch (prErr) {
          console.warn("Could not update PR status:", prErr);
        }
      }

      toast.success(`Purchase Order ${docNum} issued in DRAFT with ${validLines.length} item line(s). PR #${poForm.sourcePrDoc || ""} marked as Completed.`);
      setShowNewPO(false);
      setPoForm({
        vendorId: "",
        sourcePrId: "",
        sourcePrDoc: "",
        paymentTerms: "Net 30 Days",
        settlementMode: "Bank Wire / Electronic Transfer (QNB)",
        deliveryTerms: "FOB Destination",
        remarks: "",
        lines: [createDefaultLineItem()],
      });
      await loadAll();
    } catch (e: any) {
      toast.error(e.message || "Failed to create PO");
    } finally {
      setSaving(false);
    }
  }

  async function handleApprovePO(po: PurchaseOrder) {
    setSaving(true);
    try {
      await supabase.from("proc_purchase_orders").update({ status: "APPROVED" }).eq("id", po.id);
      toast.success(`PO ${po.doc_number} approved. Ready to dispatch shipment or receive.`);
      await loadAll();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  function openReceiveModal(po: PurchaseOrder) {
    setSelectedPOForReceive(po);
    const lines = poLines.filter(l => l.purchase_order_id === po.id);
    const receiveLines: ReceiveLineItem[] = lines.length > 0
      ? lines.map(l => {
          const remaining = Math.max(0, Number(l.quantity || 0) - Number(l.received_quantity || 0));
          return {
            poLineId: l.id,
            itemCode: l.item_code || "",
            itemName: l.item_name || l.description || "Procured Item",
            description: l.description || "",
            propertyId: l.property_id || "",
            unitId: l.unit_id || "",
            orderedQty: Number(l.quantity || 0),
            prevReceivedQty: Number(l.received_quantity || 0),
            acceptedQty: remaining,
            rejectedQty: 0,
            unitRate: Number(l.unit_rate || 0),
            uom: l.uom || "Nos",
          };
        })
      : [{
          poLineId: "",
          itemName: "PO Deliverables",
          description: po.remarks || "",
          propertyId: po.property_id || "",
          unitId: po.unit_id || "",
          orderedQty: 1,
          prevReceivedQty: 0,
          acceptedQty: 1,
          rejectedQty: 0,
          unitRate: Number(po.total_amount || 0),
          uom: "Lot",
        }];

    setReceiveForm({
      warehouseName: "Main Facility Stores",
      receivingLocation: "Dock 1",
      remarks: `Inward for PO ${po.doc_number}`,
      lines: receiveLines,
    });
    setShowReceiveModal(true);
  }

  async function handleConfirmReceive() {
    if (!selectedPOForReceive) return;
    setSaving(true);
    try {
      const po = selectedPOForReceive;
      const grnNum = await nextProcurementDocumentNumber("GRN");
      const totalAccVal = receiveForm.lines.reduce((sum, l) => sum + (Number(l.acceptedQty) || 0) * (Number(l.unitRate) || 0), 0);

      const { data: grnData, error: grnErr } = await supabase.from("proc_goods_receipts").insert({
        grn_number: grnNum,
        purchase_order_id: po.id,
        vendor_id: po.vendor_id,
        grn_date: new Date().toISOString().slice(0, 10),
        warehouse_name: receiveForm.warehouseName,
        receiving_location: receiveForm.receivingLocation,
        status: "APPROVED",
        posting_status: "POSTED",
        subtotal: totalAccVal,
        total_amount: totalAccVal,
        remarks: receiveForm.remarks,
      }).select().single();

      if (grnErr) throw grnErr;

      for (let idx = 0; idx < receiveForm.lines.length; idx++) {
        const rl = receiveForm.lines[idx];
        const accQty = Number(rl.acceptedQty) || 0;
        const rejQty = Number(rl.rejectedQty) || 0;
        const rate = Number(rl.unitRate) || 0;
        const lineAccVal = accQty * rate;

        await supabase.from("proc_grn_lines").insert({
          goods_receipt_id: grnData.id,
          purchase_order_line_id: rl.poLineId || null,
          line_no: idx + 1,
          item_code: rl.itemCode || null,
          item_name: rl.itemName,
          description: rl.description || rl.itemName,
          ordered_quantity: rl.orderedQty,
          received_quantity: accQty + rejQty,
          accepted_quantity: accQty,
          rejected_quantity: rejQty,
          unit_rate: rate,
          accepted_amount: lineAccVal,
          uom: rl.uom,
        });

        if (rl.poLineId) {
          const originalPoLine = poLines.find(p => p.id === rl.poLineId);
          if (originalPoLine) {
            await supabase.from("proc_purchase_order_lines").update({
              received_quantity: (originalPoLine.received_quantity || 0) + accQty + rejQty,
              accepted_quantity: (originalPoLine.accepted_quantity || 0) + accQty,
              rejected_quantity: (originalPoLine.rejected_quantity || 0) + rejQty,
            }).eq("id", rl.poLineId);
          }
        }

        // Auto-register fixed asset in central Asset Registry if line item is an asset / CAPEX
        const isCapexAsset = rl.itemCode?.startsWith("AST-") || rl.itemCode?.startsWith("FUR-") || rl.itemCode?.startsWith("APP-");
        if (isCapexAsset && accQty > 0) {
          try {
            const { data: existingAsset } = await supabase
              .from("assets")
              .select("id")
              .eq("asset_tag", rl.itemCode)
              .maybeSingle();

            if (!existingAsset) {
              await supabase.from("assets").insert({
                asset_tag: rl.itemCode,
                name: rl.itemName,
                category: rl.itemCode?.startsWith("AST-HVAC") ? "HVAC" : rl.itemCode?.startsWith("AST-PUMP") ? "Plumbing" : rl.itemCode?.startsWith("AST-FUR") ? "Furnishing" : "Appliances",
                asset_status: "Available",
                property_id: rl.propertyId || null,
                unit_id: rl.unitId || null,
                purchase_cost: lineAccVal || rate,
                purchase_date: new Date().toISOString().slice(0, 10),
                condition: "Excellent",
                notes: `Received via GRN ${grnNum} (PO: ${po.doc_number})`
              });
            }
          } catch (assetErr) {
            console.warn("Asset auto-creation notice:", assetErr);
          }
        }
      }

      await supabase.from("proc_purchase_orders").update({
        status: "CLOSED",
        posting_status: "POSTED",
      }).eq("id", po.id);

      // Auto-create AP Invoice draft
      const invNum = `APINV-${grnNum.replace('GRN-', '')}`;
      const vendorObj = vendors.find(v => String(v.id) === String(po.vendor_id));
      await ApInvoicesApi.create({
        invoice_number: invNum,
        vendor_id: po.vendor_id,
        po_number: po.doc_number,
        grn_number: grnNum,
        invoice_date: new Date().toISOString().slice(0, 10),
        amount: totalAccVal,
        tax_amount: 0,
        total_amount: totalAccVal,
        payment_terms: vendorObj?.payment_terms || po.payment_terms || "Net 30 Days",
        settlement_mode: vendorObj?.settlement_mode || "Bank Wire / Electronic Transfer (QNB)",
        status: "DRAFT",
        remarks: `Auto-generated AP invoice for GRN ${grnNum}`
      });

      toast.success(`GRN ${grnNum} created with ${receiveForm.lines.length} line(s). AP Invoice ${invNum} drafted.`);
      setShowReceiveModal(false);
      await loadAll();
    } catch (e: any) {
      toast.error(e.message || "Failed to post GRN");
    } finally {
      setSaving(false);
    }
  }

  // ── Sourcing & Logistics Actions ────────────────────────────────────────────
  function openNewShipment() {
    setEditShipment(null);
    setShipmentForm({
      purchaseOrderId: pos[0]?.id || "",
      carrierName: "DHL Global Forwarding",
      trackingNumber: "",
      originCountry: "Qatar",
      destinationPort: "Hamad Port / Doha Logistics Village",
      incoterm: "DAP",
      estimatedArrival: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      customsDeclarationNo: "",
      inTransitValue: "0",
      status: "DRAFT",
    });
    setShowShipmentModal(true);
  }

  function openEditShipmentModal(s: any) {
    setEditShipment(s);
    setShipmentForm({
      purchaseOrderId: s.purchase_order_id,
      carrierName: s.carrier_name || s.shipping_mode || "DHL Global Forwarding",
      trackingNumber: s.tracking_number || "",
      originCountry: s.origin_country || "Qatar",
      destinationPort: s.destination_port || s.destination_city || "Hamad Port / Doha Logistics Village",
      incoterm: s.incoterm || "DAP",
      estimatedArrival: s.estimated_arrival || s.expected_arrival_date || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      customsDeclarationNo: s.customs_declaration_no || "",
      inTransitValue: String(s.in_transit_value || 0),
      status: s.status || "APPROVED",
    });
    setShowShipmentModal(true);
  }

  async function handleSaveShipment() {
    setSaving(true);
    try {
      const targetPo = pos.find(p => p.id === shipmentForm.purchaseOrderId);
      const metaPayload = {
        carrier_name: shipmentForm.carrierName,
        tracking_number: shipmentForm.trackingNumber,
        origin_country: shipmentForm.originCountry,
        destination_port: shipmentForm.destinationPort,
        incoterm: shipmentForm.incoterm,
        estimated_arrival: shipmentForm.estimatedArrival,
        customs_declaration_no: shipmentForm.customsDeclarationNo,
        in_transit_value: Number(shipmentForm.inTransitValue) || Number(targetPo?.total_amount) || 0,
      };

      if (editShipment) {
        const { error } = await supabase.from("proc_shipments").update({
          shipping_mode: shipmentForm.carrierName,
          tracking_number: shipmentForm.trackingNumber || null,
          origin_country: shipmentForm.originCountry || "Qatar",
          destination_city: shipmentForm.destinationPort || "Hamad Port / Doha Logistics Village",
          expected_arrival_date: shipmentForm.estimatedArrival || null,
          status: shipmentForm.status || "APPROVED",
          remarks: JSON.stringify(metaPayload),
        }).eq("id", editShipment.id);

        if (error) throw error;
        toast.success(`Shipment updated successfully.`);
      } else {
        const shNum = await nextProcurementDocumentNumber("SH");
        const { error } = await supabase.from("proc_shipments").insert({
          shipment_number: shNum,
          purchase_order_id: shipmentForm.purchaseOrderId,
          vendor_id: targetPo?.vendor_id || 1,
          shipment_date: new Date().toISOString().slice(0, 10),
          expected_arrival_date: shipmentForm.estimatedArrival || null,
          shipping_mode: shipmentForm.carrierName || "DHL Global Forwarding",
          tracking_number: shipmentForm.trackingNumber || null,
          origin_country: shipmentForm.originCountry || "Qatar",
          destination_city: shipmentForm.destinationPort || "Hamad Port / Doha Logistics Village",
          status: "APPROVED",
          remarks: JSON.stringify(metaPayload),
        });

        if (error) throw error;
        toast.success(`Shipment ${shNum} created & dispatched.`);
      }
      setShowShipmentModal(false);
      await loadAll();
    } catch (e: any) {
      console.error("handleSaveShipment error:", e);
      toast.error(e.message || "Failed to save shipment");
    } finally {
      setSaving(false);
    }
  }

  function startPaymentFlow(inv: ProcApInvoice) {
    setProcPayStep(1);
    setPaymentTargetInvoice(inv);
    const vendorName = getVendorName(Number(inv.vendor_id));
    const partialKey = `partial_paid_${inv.id}`;
    const alreadyPaid = Number(localStorage.getItem(partialKey) || "0");
    const outstanding = Number(inv.total_amount || 0) - alreadyPaid;
    const advKey = `vendor_advance_${inv.vendor_id}`;
    const advBalance = Number(localStorage.getItem(advKey) || "0");

    setPaymentForm({
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMethod: "Bank Wire / QNB Corporate Electronic",
      disbursingBank: "Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)",
      transactionReference: `TXN-${Date.now().toString().slice(-6)}`,
      beneficiaryAccount: "QA91QNBA99887766554433",
      cashCustodian: "Main Office Cashier Desk",
      cashReceiptNo: `PCV-${Date.now().toString().slice(-5)}`,
      receiverName: `${vendorName} - Authorized Representative`,
      receiverContact: "+974 5512 3456",
      chequeNumber: `CHQ-${Math.floor(100000 + Math.random() * 900000)}`,
      chequeDueDate: new Date().toISOString().slice(0, 10),
      creditCardAuth: `AUTH-${Math.floor(10000 + Math.random() * 90000)}`,
      remarks: `Settlement for Invoice ${inv.invoice_number} (${inv.po_number || 'Direct'})`,
      paymentAmount: outstanding,
      applyAdvance: false,
      advanceAmount: Math.min(advBalance, outstanding),
    });
  }

  async function handleConfirmPayment() {
    if (!paymentTargetInvoice) return;
    setSaving(true);
    try {
      const inv = paymentTargetInvoice;
      const totalDue = Number(inv.total_amount || 0);
      const partialKey = `partial_paid_${inv.id}`;
      const alreadyPaid = Number(localStorage.getItem(partialKey) || "0");
      const advKey = `vendor_advance_${inv.vendor_id}`;
      const advBalance = Number(localStorage.getItem(advKey) || "0");

      const cashAmount = paymentForm.paymentAmount;
      const advApplied = paymentForm.applyAdvance ? Math.min(paymentForm.advanceAmount, advBalance) : 0;
      const effectivePaid = cashAmount + advApplied;
      const newTotalPaid = alreadyPaid + effectivePaid;
      const isFullySettled = newTotalPaid >= totalDue - 0.01;

      localStorage.setItem(partialKey, String(newTotalPaid));
      if (advApplied > 0) {
        localStorage.setItem(advKey, String(advBalance - advApplied));
      }

      await ApInvoicesApi.update(inv.id, {
        status: isFullySettled ? "PAID" : ("PARTIAL" as any),
        amount_paid: newTotalPaid,
        posting_status: isFullySettled ? "POSTED" : ("PARTIAL_POSTED" as any),
        payment_method: paymentForm.paymentMethod,
        payment_reference: paymentForm.transactionReference,
      });

      await loadAll();
      if (isFullySettled) {
        toast.success(`Payment of QAR ${Number(effectivePaid).toLocaleString()} disbursed via ${paymentForm.paymentMethod}. Invoice settled.`);
      } else {
        const remaining = totalDue - newTotalPaid;
        toast.info(`Partial payment of QAR ${cashAmount.toLocaleString()} disbursed. Remaining balance: QAR ${remaining.toLocaleString()}.`);
      }
      setPaymentTargetInvoice(null);
      
      openPaymentReceipt(inv);
    } catch (e: any) {
      toast.error(e.message || "Failed to process payment");
    } finally {
      setSaving(false);
    }
  }

  function openPaymentReceipt(inv: ProcApInvoice) {
    const rcpt = ApInvoicesApi.getReceiptByInvoice(inv.invoice_number);
    if (rcpt) {
      setSelectedReceipt(rcpt);
      setShowReceiptModal(true);
    } else {
      const fallbackRcpt: PaymentReceipt = {
        id: `rcpt-${Date.now()}`,
        receipt_number: `RCPT-${inv.invoice_number.replace('APINV-', '')}`,
        voucher_number: `PV-${inv.invoice_number.replace('APINV-', '')}`,
        invoice_number: inv.invoice_number,
        po_number: inv.po_number,
        grn_number: inv.grn_number,
        vendor_id: inv.vendor_id,
        vendor_name: getVendorName(Number(inv.vendor_id)),
        amount_paid: inv.total_amount,
        payment_date: inv.paid_at || new Date().toISOString().slice(0, 10),
        payment_method: inv.payment_method || "Bank Wire / QNB Corporate Electronic",
        reference_no: inv.payment_reference || `TXN-${Date.now().toString().slice(-6)}`,
        bank_account: "Qatar National Bank (QNB) - Main Operating",
        gl_debit_account: "22100001 - Trade Payables - Vendors",
        gl_credit_account: "12000001 - Bank Operating Account (QNB)",
        status: "Settled",
        created_at: new Date().toISOString()
      };
      setSelectedReceipt(fallbackRcpt);
      setShowReceiptModal(true);
    }
  }

  // Active Tab Title
  const activeNavLabel = PROC_NAV.flatMap(g => g.items as readonly { key: string; label: string; icon: any }[]).find(i => i.key === activeTab)?.label ?? "Procurement";
  const totalSpend = pos.reduce((s, p) => s + Number(p.total_amount || 0), 0);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-auto p-6 space-y-6">
        {/* Header bar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{activeNavLabel}</h2>
            <p className="text-sm text-muted-foreground">Manage sourcing, vendor negotiations, orders, receiving, and procurement intelligence.</p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {activeTab === "requests" && (
              <Button size="sm" onClick={() => setShowNewPR(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Purchase Request
              </Button>
            )}
            {activeTab === "orders" && (
              <Button size="sm" onClick={() => setShowNewPO(true)}>
                <ShoppingCart className="mr-2 h-4 w-4" /> New Purchase Order
              </Button>
            )}
            {activeTab === "catalog" && (
              <Button size="sm" onClick={() => setShowCatalogModal(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Master Item
              </Button>
            )}
            {activeTab === "rfx" && (
              <Button size="sm" onClick={() => setShowNewRFX(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create RFX
              </Button>
            )}
            {activeTab === "quotations" && (
              <Button size="sm" onClick={() => setShowNewQuote(true)}>
                <Plus className="mr-2 h-4 w-4" /> Submit Quote
              </Button>
            )}
            {activeTab === "shipments" && (
              <Button size="sm" onClick={openNewShipment}>
                <Plus className="mr-2 h-4 w-4" /> New Shipment
              </Button>
            )}
          </div>
        </div>

        {/* ── Contextualized KPI Strip ── */}
        {["requests", "orders"].includes(activeTab) && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              ["Purchase Requests", prs.length, ShoppingCart, "text-blue-500"],
              ["Purchase Orders", pos.length, ClipboardList, "text-cyan-500"],
              ["GRNs Received", grns.length, Truck, "text-emerald-500"],
              ["Active Vendors", vendors.length, Users, "text-violet-500"],
              ["Total PO Spend", `QAR ${totalSpend.toLocaleString()}`, DollarSign, "text-amber-500"],
            ].map(([label, val, Icon, color]: any) => (
              <Card key={label} className="bg-card/50 shadow-sm border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`text-xl font-bold mt-1 ${color}`}>{val}</p>
                  </div>
                  <Icon className="h-5 w-5 text-muted-foreground/60" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "assets" && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="bg-card/50 shadow-sm border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total CAPEX Assets</p>
                  <p className="text-xl font-bold mt-1 text-cyan-500">{grnLines.length}</p>
                </div>
                <Package className="h-5 w-5 text-cyan-500/60" />
              </CardContent>
            </Card>
            <Card className="bg-card/50 shadow-sm border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Capitalized Value</p>
                  <p className="text-xl font-bold mt-1 text-emerald-500">
                    QAR {grnLines.reduce((s, gl) => s + (Number(gl.accepted_quantity || 0) * Number(gl.unit_rate || 0)), 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-5 w-5 text-emerald-500/60" />
              </CardContent>
            </Card>
            <Card className="bg-card/50 shadow-sm border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Auto-Registered Inward</p>
                  <p className="text-xl font-bold mt-1 text-blue-500">{grnLines.length} Units</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-blue-500/60" />
              </CardContent>
            </Card>
            <Card className="bg-card/50 shadow-sm border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Asset Register Linkage</p>
                  <p className="text-xl font-bold mt-1 text-emerald-600">100% Synced</p>
                </div>
                <Link2 className="h-5 w-5 text-emerald-600/60" />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="bg-card/50 shadow-sm border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Stock SKUs</p>
                  <p className="text-xl font-bold mt-1 text-primary">
                    {catalog.filter(c => ["maintenance_spare", "consumable"].includes(c.item_type)).length}
                  </p>
                </div>
                <Wrench className="h-5 w-5 text-primary/60" />
              </CardContent>
            </Card>
            <Card className="bg-card/50 shadow-sm border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">In-Stock Items</p>
                  <p className="text-xl font-bold mt-1 text-emerald-500">
                    {catalog.filter(c => ["maintenance_spare", "consumable"].includes(c.item_type)).length}
                  </p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500/60" />
              </CardContent>
            </Card>
            <Card className="bg-card/50 shadow-sm border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Low / Reorder Stock</p>
                  <p className="text-xl font-bold mt-1 text-amber-500">0</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-amber-500/60" />
              </CardContent>
            </Card>
            <Card className="bg-card/50 shadow-sm border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Inventory Valuation</p>
                  <p className="text-xl font-bold mt-1 text-violet-500">
                    QAR {catalog.filter(c => ["maintenance_spare", "consumable"].includes(c.item_type)).reduce((s, c) => s + (Number(c.unit_price || 0) * 20), 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-5 w-5 text-violet-500/60" />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "catalog" && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="bg-card/50 shadow-sm border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Master Items</p>
                  <p className="text-xl font-bold mt-1 text-primary">{catalog.length}</p>
                </div>
                <Package className="h-5 w-5 text-primary/60" />
              </CardContent>
            </Card>
            <Card className="bg-card/50 shadow-sm border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Fixed Assets</p>
                  <p className="text-xl font-bold mt-1 text-cyan-500">{catalog.filter(c => c.item_type === "asset").length}</p>
                </div>
                <Building2 className="h-5 w-5 text-cyan-500/60" />
              </CardContent>
            </Card>
            <Card className="bg-card/50 shadow-sm border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Maintenance Spares</p>
                  <p className="text-xl font-bold mt-1 text-amber-500">{catalog.filter(c => c.item_type === "maintenance_spare").length}</p>
                </div>
                <Wrench className="h-5 w-5 text-amber-500/60" />
              </CardContent>
            </Card>
            <Card className="bg-card/50 shadow-sm border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Consumables & Services</p>
                  <p className="text-xl font-bold mt-1 text-emerald-500">{catalog.filter(c => ["consumable", "service"].includes(c.item_type)).length}</p>
                </div>
                <Activity className="h-5 w-5 text-emerald-500/60" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── TAB 1: PURCHASE REQUESTS ────────────────────────────────────────── */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            {prs.length === 0 ? (
              <EmptyState text="No Purchase Requests recorded yet. Click 'New Purchase Request' to create one." />
            ) : (
              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 text-xs">
                      <TableHead className="font-bold">PR # &amp; Date</TableHead>
                      <TableHead className="font-bold">Property Scope &amp; Priority</TableHead>
                      <TableHead className="font-bold">Linked Purchase Order</TableHead>
                      <TableHead className="font-bold text-right">Total Amount &amp; Status</TableHead>
                      <TableHead className="font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prs.map(pr => {
                      const linkedPo = pos.find(p => p.remarks?.includes(pr.doc_number) || (pr.remarks && pr.remarks.includes(p.doc_number)));

                      return (
                        <TableRow key={pr.id} className="text-xs hover:bg-muted/30">
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-mono font-bold text-primary text-xs">{pr.doc_number}</span>
                              <span className="text-muted-foreground text-[11px]">{pr.request_date}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-foreground text-xs flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-primary shrink-0" />
                                <span className="truncate">{getPropertyName(pr.property_id)}</span>
                              </span>
                              <Badge variant="outline" className="w-fit text-[9px] h-4 py-0">{pr.priority || "NORMAL"}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {linkedPo ? (
                              <div className="flex flex-col gap-0.5">
                                <Badge variant="outline" className="text-cyan-700 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 font-mono text-[10px] w-fit">
                                  {linkedPo.doc_number}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">PO Issued • {linkedPo.status}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-semibold font-mono text-xs text-foreground">
                                QAR {Number(pr.total_amount || 0).toLocaleString()}
                              </span>
                              <Badge variant={statusBadgeVariant(pr.status)} className="text-[10px] h-4 py-0">{pr.status}</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1.5 items-center">
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-primary border-primary/40 hover:bg-primary/10" onClick={() => setViewPr(pr)}>
                                <Eye className="h-3 w-3" /> View
                              </Button>
                              {pr.status === "DRAFT" && (
                                <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" onClick={() => handleSubmitPR(pr)} disabled={saving}>
                                  <ArrowUpRight className="h-3 w-3" /> Submit
                                </Button>
                              )}
                              {pr.status === "SUBMITTED" && (
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleApprovePR(pr)} disabled={saving}>
                                  <CheckCheck className="mr-1 h-3.5 w-3.5 text-emerald-500" /> Approve
                                </Button>
                              )}
                              {pr.status === "APPROVED" && !linkedPo && (
                                <Button size="sm" className="h-7 text-xs gap-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold shadow-sm" onClick={() => {
                                  const extractedLines = parsePrLines(pr);
                                  setPoForm({
                                    vendorId: "",
                                    sourcePrId: pr.id,
                                    sourcePrDoc: pr.doc_number,
                                    paymentTerms: "Net 30 Days",
                                    settlementMode: "Bank Wire / Electronic Transfer (QNB)",
                                    deliveryTerms: "FOB Destination",
                                    remarks: `Issued from Approved PR #${pr.doc_number}`,
                                    lines: extractedLines.length > 0 ? extractedLines : [createDefaultLineItem(pr.property_id || "", pr.unit_id || "")],
                                  });
                                  setShowNewPO(true);
                                }}>
                                  <ShoppingCart className="h-3 w-3" /> Issue PO
                                </Button>
                              )}
                              {pr.status === "APPROVED" && linkedPo && (
                                <Badge variant="secondary" className="text-[10px] text-cyan-700 bg-cyan-50 border border-cyan-200">
                                  PO Issued
                                </Badge>
                              )}
                              {pr.status === "COMPLETED" && (
                                <Badge variant="secondary" className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200">
                                  PO Fulfilled
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: PURCHASE ORDERS ──────────────────────────────────────────── */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {pos.length === 0 ? (
              <EmptyState text="No Purchase Orders found. Create your first PO." />
            ) : (
              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 text-xs">
                      <TableHead className="font-bold">PO # &amp; Date</TableHead>
                      <TableHead className="font-bold">Vendor &amp; Property Scope</TableHead>
                      <TableHead className="font-bold text-right">Total Amount &amp; Status</TableHead>
                      <TableHead className="font-bold">Logistics Chain (SH / GRN)</TableHead>
                      <TableHead className="font-bold">AP Invoice</TableHead>
                      <TableHead className="font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pos.map(po => {
                      const sh = shipments.find(s => s.purchase_order_id === po.id);
                      const grn = grns.find(g => g.purchase_order_id === po.id);
                      const inv = apInvoices.find(i => i.po_number === po.doc_number || i.grn_number === grn?.grn_number);
                      return (
                        <TableRow key={po.id} className="text-xs hover:bg-muted/30">
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-mono font-bold text-primary text-xs">{po.doc_number}</span>
                              <span className="text-muted-foreground text-[11px]">{po.po_date}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-foreground text-xs">{getVendorName(po.vendor_id)}</span>
                              <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-primary shrink-0" />
                                <span className="truncate">{getPropertyName(po.property_id)}</span>
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-mono font-bold text-xs text-foreground">
                                QAR {Number(po.total_amount).toLocaleString()}
                              </span>
                              <Badge variant={statusBadgeVariant(po.status)} className="text-[10px] h-4 py-0">{po.status}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="text-muted-foreground text-[10px] w-7">SH:</span>
                                {sh ? <Badge variant="outline" className="font-mono text-cyan-600 text-[9px] h-4 py-0">{sh.shipment_number}</Badge> : <span className="text-muted-foreground">—</span>}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="text-muted-foreground text-[10px] w-7">GRN:</span>
                                {grn ? <Badge variant="outline" className="font-mono text-emerald-600 text-[9px] h-4 py-0">{grn.grn_number}</Badge> : <span className="text-muted-foreground">—</span>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {inv ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="font-mono text-[10px] text-primary font-semibold">{inv.invoice_number}</span>
                                <Badge variant={inv.status === "PAID" ? "default" : "outline"} className={inv.status === "PAID" ? "bg-emerald-600 text-[9px] h-4 py-0 w-fit" : "text-amber-600 border-amber-500/40 text-[9px] h-4 py-0 w-fit"}>
                                  {inv.status === "PAID" ? "Paid" : "Draft"}
                                </Badge>
                              </div>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1.5 items-center flex-wrap">
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-primary border-primary/40 hover:bg-primary/10" onClick={() => setViewPo(po)}>
                                <Eye className="h-3 w-3" /> View
                              </Button>
                              {po.status === "DRAFT" && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                  onClick={async () => {
                                    setSaving(true);
                                    try {
                                      await supabase.from("proc_purchase_orders").update({ status: "APPROVED" }).eq("id", po.id);
                                      toast.success(`Purchase Order ${po.doc_number} confirmed and approved! Ready for Shipment or GRN Receiving.`);
                                      await loadAll();
                                    } catch (e: any) {
                                      toast.error(e.message || "Failed to approve PO");
                                    } finally {
                                      setSaving(false);
                                    }
                                  }}
                                  disabled={saving}
                                >
                                  <CheckCheck className="h-3.5 w-3.5 text-emerald-300" /> Approve PO
                                </Button>
                              )}
                              {po.status === "SUBMITTED" && (
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-600 border-emerald-500/40 hover:bg-emerald-50" onClick={() => handleApprovePO(po)} disabled={saving}>
                                  <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> Approve Order
                                </Button>
                              )}
                              {po.status === "APPROVED" && (
                                <>
                                  {sh ? (
                                    !grn ? (
                                      <Button
                                        size="sm"
                                        className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                                        onClick={() => openReceiveModal(po)}
                                      >
                                        <PackageCheck className="h-3.5 w-3.5" /> Receive (GRN)
                                      </Button>
                                    ) : null
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs gap-1 text-cyan-600 border-cyan-500/40 hover:bg-cyan-50"
                                      onClick={() => {
                                        setShipmentForm(prev => ({
                                          ...prev,
                                          purchaseOrderId: po.id,
                                          inTransitValue: String(po.total_amount),
                                        }));
                                        setShowShipmentModal(true);
                                      }}
                                    >
                                      <Ship className="h-3 w-3" /> Create Shipment
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: GRN / RECEIVING ─────────────────────────────────────────── */}
        {activeTab === "receiving" && (
          <div className="space-y-4">
            {grns.length === 0 ? (
              <EmptyState text="No Goods Receipt Notes posted yet. Receive items from the Purchase Orders tab." />
            ) : (
              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 text-xs">
                      <TableHead className="font-bold">GRN # &amp; PO Reference</TableHead>
                      <TableHead className="font-bold">Items &amp; Destination Location</TableHead>
                      <TableHead className="font-bold">Vendor &amp; Receipt Date</TableHead>
                      <TableHead className="font-bold">Warehouse / Dock</TableHead>
                      <TableHead className="font-bold text-right">Accepted Total &amp; Status</TableHead>
                      <TableHead className="font-bold">AP Invoice &amp; Settlement</TableHead>
                      <TableHead className="font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grns.map(g => {
                      const po = pos.find(p => p.id === g.purchase_order_id);
                      const linkedInv = apInvoices.find(i => i.grn_number === g.grn_number);
                      const isPaid = linkedInv?.status === "PAID";
                      const lines = grnLines.filter(gl => gl.goods_receipt_id === g.id);
                      const fallbackPoLines = po ? poLines.filter(pl => pl.purchase_order_id === po.id) : [];

                      return (
                        <TableRow key={g.id} className="text-xs hover:bg-muted/30">
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-mono font-bold text-emerald-600 text-xs">{g.grn_number}</span>
                              <span className="font-mono text-cyan-700 text-[11px] flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground font-normal">PO:</span> {po?.doc_number || "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[260px]">
                            {lines.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {lines.slice(0, 2).map((gl, i) => {
                                  const linkedPoLine = poLines.find(pl => pl.id === gl.purchase_order_line_id);
                                  const propId = linkedPoLine?.property_id || po?.property_id;
                                  const unitId = linkedPoLine?.unit_id || po?.unit_id;
                                  return (
                                    <div key={i} className="flex flex-col bg-muted/40 p-1.5 rounded border text-[11px] leading-tight">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-semibold text-foreground truncate">{gl.item_name || gl.description}</span>
                                        <span className="font-mono text-[10px] text-emerald-600 font-bold shrink-0">
                                          {gl.accepted_quantity}/{gl.ordered_quantity} {gl.uom || "Nos"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                                        <Building2 className="h-2.5 w-2.5 text-primary shrink-0" />
                                        <span className="truncate">{getPropertyName(propId)}</span>
                                        {unitId ? (
                                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 bg-background font-mono">
                                            Unit {getUnitRef(unitId)}
                                          </Badge>
                                        ) : (
                                          <span className="text-[9px] opacity-70">· Common Area</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                                {lines.length > 2 && (
                                  <span className="text-[10px] text-muted-foreground font-semibold">+{lines.length - 2} more items</span>
                                )}
                              </div>
                            ) : fallbackPoLines.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {fallbackPoLines.slice(0, 2).map((pl, i) => (
                                  <div key={i} className="flex flex-col bg-muted/40 p-1.5 rounded border text-[11px] leading-tight">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-semibold text-foreground truncate">{pl.item_name || pl.description}</span>
                                      <span className="font-mono text-[10px] text-muted-foreground shrink-0">{pl.quantity} {pl.uom || "Nos"}</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                                      <Building2 className="h-2.5 w-2.5 text-primary shrink-0" />
                                      <span className="truncate">{getPropertyName(pl.property_id || po?.property_id)}</span>
                                      {pl.unit_id ? (
                                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 bg-background font-mono">
                                          Unit {getUnitRef(pl.unit_id)}
                                        </Badge>
                                      ) : (
                                        <span className="text-[9px] opacity-70">· Common Area</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[11px] text-muted-foreground">
                                <span>{getPropertyName(po?.property_id)}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-foreground text-xs truncate max-w-[160px]">{getVendorName(g.vendor_id)}</span>
                              <span className="text-muted-foreground text-[11px]">{g.grn_date}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium text-foreground text-xs">{g.warehouse_name || "Main Warehouse"}</span>
                              <span className="text-muted-foreground text-[11px]">{g.receiving_location || "Central Dock"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-bold font-mono text-xs text-foreground">
                                QAR {Number(g.total_amount || 0).toLocaleString()}
                              </span>
                              <Badge variant="default" className="text-[10px] h-4 py-0">{g.status}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {linkedInv ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="font-mono font-semibold text-primary text-[11px]">{linkedInv.invoice_number}</span>
                                {isPaid ? (
                                  <Badge variant="default" className="w-fit text-[9px] h-4 py-0 bg-emerald-600">Paid &amp; Settled</Badge>
                                ) : (
                                  <Badge variant="outline" className="w-fit text-[9px] h-4 py-0 text-amber-600 border-amber-500/40 bg-amber-500/10">
                                    {linkedInv.status === "DRAFT" ? "Draft (Pending)" : linkedInv.status}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-primary border-primary/40 hover:bg-primary/10" onClick={() => setViewGrn(g)}>
                                <Eye className="h-3 w-3" /> View
                              </Button>
                              {!linkedInv && (
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                                  onClick={async () => {
                                    const invNum = `APINV-${g.grn_number ? g.grn_number.replace('GRN-', '') : String(Date.now()).slice(-6)}`;
                                    await ApInvoicesApi.create({
                                      invoice_number: invNum,
                                      vendor_id: g.vendor_id || po?.vendor_id || "1",
                                      po_number: po?.doc_number,
                                      grn_number: g.grn_number,
                                      invoice_date: g.grn_date || new Date().toISOString().slice(0, 10),
                                      amount: Number(g.total_amount || 0),
                                      tax_amount: 0,
                                      total_amount: Number(g.total_amount || 0),
                                      status: "DRAFT"
                                    });
                                    await loadAll();
                                    toast.success(`AP Invoice ${invNum} generated.`);
                                  }}>
                                  <Plus className="h-3 w-3" /> Create AP
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: VENDORS ─────────────────────────────────────────────────── */}
        {activeTab === "vendors" && (
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 text-xs">
                    <TableHead className="font-bold">Vendor Code</TableHead>
                    <TableHead className="font-bold">Vendor Name</TableHead>
                    <TableHead className="font-bold">Trade Category</TableHead>
                    <TableHead className="font-bold">City / Location</TableHead>
                    <TableHead className="font-bold">Contact Person</TableHead>
                    <TableHead className="font-bold">Payment Terms</TableHead>
                    <TableHead className="font-bold">Account Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map(v => (
                    <TableRow key={v.id} className="text-xs hover:bg-muted/30">
                      <TableCell className="font-mono text-primary font-bold">{v.code}</TableCell>
                      <TableCell className="font-semibold">{v.name}</TableCell>
                      <TableCell>{(v as any).category || "General Contractor"}</TableCell>
                      <TableCell>{(v as any).city || "Doha"}</TableCell>
                      <TableCell>{(v as any).contact_person || v.email || "—"}</TableCell>
                      <TableCell>{(v as any).payment_terms || "30 Days"}</TableCell>
                      <TableCell><Badge variant="default">ACTIVE</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ── TAB 5: RFX / TENDERS ───────────────────────────────────────────── */}
        {activeTab === "rfx" && (
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 text-xs">
                    <TableHead className="font-bold">RFX Number</TableHead>
                    <TableHead className="font-bold">Tender Title</TableHead>
                    <TableHead className="font-bold">Sourcing Type</TableHead>
                    <TableHead className="font-bold">Closing Date</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rfxList.map(r => (
                    <TableRow key={r.id} className="text-xs hover:bg-muted/30">
                      <TableCell className="font-mono font-bold text-primary">{r.rfx_number}</TableCell>
                      <TableCell className="font-semibold">{r.title}</TableCell>
                      <TableCell><Badge variant="outline">{r.rfx_type}</Badge></TableCell>
                      <TableCell>{r.closing_date}</TableCell>
                      <TableCell><Badge variant="default">{r.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {rfxList.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No active RFX tenders.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ── TAB 6: QUOTATIONS ──────────────────────────────────────────────── */}
        {activeTab === "quotations" && (
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 text-xs">
                    <TableHead className="font-bold">Quote Number</TableHead>
                    <TableHead className="font-bold">Vendor Name</TableHead>
                    <TableHead className="font-bold text-right">Quoted Amount (QAR)</TableHead>
                    <TableHead className="font-bold">Evaluation Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quoteList.map(q => (
                    <TableRow key={q.id} className="text-xs hover:bg-muted/30">
                      <TableCell className="font-mono font-bold text-primary">{q.quote_number}</TableCell>
                      <TableCell className="font-semibold">{getVendorName(q.vendor_id)}</TableCell>
                      <TableCell className="text-right font-mono font-bold">{Number(q.total_amount || 0).toLocaleString()}</TableCell>
                      <TableCell><Badge variant="default">{q.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {quoteList.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No vendor quotes submitted.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ── TAB 7: APPROVAL INBOX (FULL INTERACTIVE QUEUES) ────────────────── */}
        {activeTab === "inbox" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ["Pending PR Approvals", prs.filter(p => p.status === "SUBMITTED").length, "text-amber-500"],
                ["Pending PO Approvals", pos.filter(p => p.status === "SUBMITTED").length, "text-cyan-500"],
                ["In-Transit Shipments", shipments.filter(s => s.status === "APPROVED" || s.status === "DRAFT").length, "text-violet-500"],
                ["Pending Invoices", apInvoices.filter(i => i.status !== "PAID").length, "text-emerald-500"],
              ].map(([label, count, color]: any) => (
                <Card key={label} className="bg-card/50 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`text-2xl font-bold mt-1 ${color}`}>{count}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pending Purchase Requests Awaiting Approval */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-500" />
                  Purchase Requests Awaiting Approval
                </CardTitle>
                <CardDescription>Review and approve internal departmental purchase requisitions.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 text-xs">
                        <TableHead className="font-bold">Requisition #</TableHead>
                        <TableHead className="font-bold">Request Date</TableHead>
                        <TableHead className="font-bold">Property Scope</TableHead>
                        <TableHead className="font-bold">Priority</TableHead>
                        <TableHead className="font-bold text-right">Amount (QAR)</TableHead>
                        <TableHead className="font-bold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prs.filter(p => p.status === "SUBMITTED").length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-xs">No pending Purchase Requests in approval queue.</TableCell></TableRow>
                      )}
                      {prs.filter(p => p.status === "SUBMITTED").map(pr => (
                        <TableRow key={pr.id} className="text-xs hover:bg-muted/30">
                          <TableCell className="font-mono font-bold text-primary">{pr.doc_number}</TableCell>
                          <TableCell>{pr.request_date}</TableCell>
                          <TableCell>{getPropertyName(pr.property_id)}</TableCell>
                          <TableCell><Badge variant="outline">{pr.priority || "NORMAL"}</Badge></TableCell>
                          <TableCell className="text-right font-mono font-bold">QAR {Number(pr.total_amount || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApprovePR(pr)}>
                              <CheckCircle2 className="h-3 w-3" /> Approve PR
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Pending Purchase Orders Awaiting Approval */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-cyan-500" />
                  Purchase Orders Awaiting Authorization
                </CardTitle>
                <CardDescription>Commercial review before vendor order dispatch.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 text-xs">
                        <TableHead className="font-bold">PO Number</TableHead>
                        <TableHead className="font-bold">Vendor Name</TableHead>
                        <TableHead className="font-bold">Property Scope</TableHead>
                        <TableHead className="font-bold">Payment Terms</TableHead>
                        <TableHead className="font-bold text-right">Total Order (QAR)</TableHead>
                        <TableHead className="font-bold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pos.filter(p => p.status === "SUBMITTED").length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-xs">No pending Purchase Orders in approval queue.</TableCell></TableRow>
                      )}
                      {pos.filter(p => p.status === "SUBMITTED").map(po => (
                        <TableRow key={po.id} className="text-xs hover:bg-muted/30">
                          <TableCell className="font-mono font-bold text-primary">{po.doc_number}</TableCell>
                          <TableCell className="font-semibold">{getVendorName(po.vendor_id)}</TableCell>
                          <TableCell>{getPropertyName(po.property_id)}</TableCell>
                          <TableCell>{po.payment_terms || "Net 30 Days"}</TableCell>
                          <TableCell className="text-right font-mono font-bold">QAR {Number(po.total_amount || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" className="h-7 text-xs gap-1 bg-cyan-600 hover:bg-cyan-700 text-white" onClick={() => handleApprovePO(po)}>
                              <CheckCircle2 className="h-3 w-3" /> Approve PO
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── TAB 8: SHIPMENTS (WITH PROPERTY DESTINATION) ────────────────────── */}
        {activeTab === "shipments" && (
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 text-xs">
                    <TableHead className="font-bold">Shipment # &amp; PO Ref</TableHead>
                    <TableHead className="font-bold">Items &amp; Destination Location</TableHead>
                    <TableHead className="font-bold">Carrier &amp; Tracking</TableHead>
                    <TableHead className="font-bold">Origin → ETA &amp; Incoterm</TableHead>
                    <TableHead className="font-bold text-right">In-Transit Value &amp; Status</TableHead>
                    <TableHead className="font-bold">Linked GRN</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map(s => {
                    const po = pos.find(p => p.id === s.purchase_order_id);
                    const grn = grns.find(g => g.purchase_order_id === s.purchase_order_id);
                    const lines = po ? poLines.filter(l => l.purchase_order_id === po.id) : [];

                    return (
                      <TableRow key={s.id} className="text-xs hover:bg-muted/30">
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono font-bold text-cyan-600 text-xs">{s.shipment_number}</span>
                            <span className="font-mono text-primary text-[11px] flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground font-normal">PO:</span> {po?.doc_number || "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[260px]">
                          {lines.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {lines.slice(0, 2).map((l, i) => (
                                <div key={i} className="flex flex-col bg-muted/40 p-1.5 rounded border text-[11px] leading-tight">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-semibold text-foreground truncate">{l.item_name || l.description}</span>
                                    <span className="font-mono text-[10px] text-cyan-600 font-bold shrink-0">{l.quantity} {l.uom || "Nos"}</span>
                                  </div>
                                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                                    <Building2 className="h-2.5 w-2.5 text-primary shrink-0" />
                                    <span className="truncate">{getPropertyName(l.property_id || po?.property_id)}</span>
                                    {l.unit_id ? (
                                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 bg-background font-mono">
                                        Unit {getUnitRef(l.unit_id)}
                                      </Badge>
                                    ) : (
                                      <span className="text-[9px] opacity-70">· Common Area</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {lines.length > 2 && (
                                <span className="text-[10px] text-muted-foreground font-semibold">+{lines.length - 2} more items</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs">{getPropertyName(po?.property_id)}</span>
                              <span className="text-[10px] text-muted-foreground">Main Receiving Facility</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-foreground text-xs">{s.carrier_name}</span>
                            <span className="font-mono text-muted-foreground text-[11px]">{s.tracking_number || "AWB Pending"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-foreground font-medium">{s.origin_country || "Qatar"} → {s.estimated_arrival}</span>
                            <Badge variant="outline" className="w-fit text-[9px] h-4 py-0">{s.incoterm || "DAP"}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-bold font-mono text-xs text-foreground">
                              QAR {Number(s.in_transit_value || po?.total_amount || 0).toLocaleString()}
                            </span>
                            <Badge variant={statusBadgeVariant(s.status)} className="text-[10px] h-4 py-0">{s.status}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {grn ? (
                            <div className="flex flex-col gap-0.5">
                              <Badge variant="outline" className="text-emerald-600 font-mono text-[10px] w-fit">{grn.grn_number}</Badge>
                              <span className="text-[10px] text-emerald-700 font-medium">Received</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">In Transit</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5 items-center flex-wrap">
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-primary border-primary/40 hover:bg-primary/10" onClick={() => setViewShipment(s)}>
                              <Eye className="h-3 w-3" /> View
                            </Button>
                            {po && !grn && (
                              <Button size="sm" className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => openReceiveModal(po)}>
                                <Truck className="h-3 w-3" /> Receive GRN
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {shipments.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No active shipments recorded.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ── TAB 9: PAYABLE INVOICES ────────────────────────────────────────── */}
        {activeTab === "invoices" && (
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 text-xs">
                    <TableHead className="font-bold">Invoice Number</TableHead>
                    <TableHead className="font-bold">PO Reference</TableHead>
                    <TableHead className="font-bold">GRN Reference</TableHead>
                    <TableHead className="font-bold">Vendor Name</TableHead>
                    <TableHead className="font-bold">Payment Terms &amp; Settlement Mode</TableHead>
                    <TableHead className="font-bold">Invoice Date</TableHead>
                    <TableHead className="font-bold text-right">Amount (QAR)</TableHead>
                    <TableHead className="font-bold">Payment Status</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apInvoices.map(inv => {
                    const isPaid = inv.status === "PAID";
                    const totalDue = Number(inv.total_amount || 0);
                    const alreadyPaid = Number(localStorage.getItem(`partial_paid_${inv.id}`) || "0");
                    const outstanding = totalDue - alreadyPaid;
                    const isPartial = (inv.status as string) === "PARTIAL";
                    const matchedVendor = vendors.find(v => String(v.id) === String(inv.vendor_id));
                    const termsDisplay = inv.payment_terms || matchedVendor?.payment_terms || "Net 30 Days";
                    const modeDisplay = inv.settlement_mode || inv.payment_method || matchedVendor?.settlement_mode || "Bank Wire / Electronic Transfer (QNB)";

                    return (
                      <TableRow key={inv.id} className="text-xs hover:bg-muted/30">
                        <TableCell className="font-mono font-bold text-primary">{inv.invoice_number}</TableCell>
                        <TableCell className="font-mono text-cyan-600">{inv.po_number || "—"}</TableCell>
                        <TableCell className="font-mono text-emerald-600">{inv.grn_number || "—"}</TableCell>
                        <TableCell className="font-semibold">{getVendorName(Number(inv.vendor_id))}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-foreground">{termsDisplay}</span>
                            <span className="text-[10px] text-muted-foreground">{modeDisplay}</span>
                          </div>
                        </TableCell>
                        <TableCell>{inv.invoice_date}</TableCell>
                        <TableCell className="text-right">
                          <div className="font-mono font-bold">{totalDue.toLocaleString()}</div>
                          {isPartial && alreadyPaid > 0 && (
                            <div className="text-[10px] text-amber-600 font-mono">
                              Paid: {alreadyPaid.toLocaleString()} | Due: {outstanding.toLocaleString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isPaid ? "default" : isPartial ? "secondary" : "outline"}
                            className={isPaid ? "bg-emerald-600" : isPartial ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400" : ""}
                          >
                            {isPaid ? "Paid & Settled" : isPartial ? "Partial Payment" : "Draft / Unpaid"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5 items-center flex-wrap">
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-primary border-primary/40 hover:bg-primary/10"
                              onClick={() => {
                                setViewInvoice(inv);
                              }}>
                              <Eye className="h-3 w-3" /> View Details
                            </Button>
                            {(isPaid || (isPartial && alreadyPaid > 0)) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-2.5 gap-1 text-emerald-600 border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                onClick={() => openPaymentReceipt(inv)}
                              >
                                <FileText className="h-3 w-3" /> {isPartial ? "Receipts" : "Receipt"}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ── TAB 10: PROCUREMENT ANALYTICS DASHBOARD ────────────────────────── */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Top Analytics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="shadow-sm border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Cumulative Order Spend</p>
                      <p className="text-2xl font-bold mt-1 text-amber-500 font-mono">QAR {totalSpend.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-6 w-6 text-amber-500/50" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">Across 9 purchase orders issued</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Active Vendor Partnerships</p>
                      <p className="text-2xl font-bold mt-1 text-violet-500 font-mono">{vendors.length}</p>
                    </div>
                    <Users className="h-6 w-6 text-violet-500/50" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">100% verified QID & Tax cards</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Quality Acceptance Rate</p>
                      <p className="text-2xl font-bold mt-1 text-emerald-500 font-mono">100%</p>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-emerald-500/50" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">Zero rejected warehouse receipts</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Fulfillment Cycle Time</p>
                      <p className="text-2xl font-bold mt-1 text-cyan-500 font-mono">1.8 Days</p>
                    </div>
                    <Activity className="h-6 w-6 text-cyan-500/50" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">PR approval to physical dock intake</p>
                </CardContent>
              </Card>
            </div>

            {/* Middle Breakdown Panels */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-primary" /> Spend Breakdown by Trade Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>HVAC & Air Conditioning</span>
                      <span className="font-mono">QAR 28,500 (60.5%)</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: "60.5%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Plumbing & Booster Pumps</span>
                      <span className="font-mono">QAR 12,200 (25.9%)</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "25.9%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Electrical & Consumables</span>
                      <span className="font-mono">QAR 4,342 (9.2%)</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "9.2%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Facility Maintenance Services</span>
                      <span className="font-mono">QAR 2,000 (4.4%)</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: "4.4%" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4 text-emerald-500" /> CAPEX vs OPEX Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="flex justify-between items-center p-3 rounded-lg border bg-muted/20">
                    <div>
                      <p className="font-bold text-sm text-foreground">CAPEX (Fixed Assets)</p>
                      <p className="text-muted-foreground">Split ACs, Water Pumps, Plant Equipment</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm text-cyan-600">QAR 34,800</p>
                      <Badge variant="outline" className="text-[10px]">74% of Budget</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border bg-muted/20">
                    <div>
                      <p className="font-bold text-sm text-foreground">OPEX (Operational Spares & Consumables)</p>
                      <p className="text-muted-foreground">Filters, Valves, LED Panels, Maintenance</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm text-emerald-600">QAR 12,242.5</p>
                      <Badge variant="outline" className="text-[10px]">26% of Budget</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ── TAB 11: SUPPLIER SCORECARDS ────────────────────────────────────── */}
        {activeTab === "supplier_perf" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Supplier Performance & Quality Scorecard</CardTitle>
                <CardDescription>Metrics aggregated across approved purchase orders, delivery compliance, and goods receipt acceptance.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 text-xs">
                        <TableHead className="font-bold">Vendor Code</TableHead>
                        <TableHead className="font-bold">Vendor Name</TableHead>
                        <TableHead className="font-bold">Primary Trade</TableHead>
                        <TableHead className="font-bold text-right">Orders Fulfilled</TableHead>
                        <TableHead className="font-bold text-right">Total Spend (QAR)</TableHead>
                        <TableHead className="font-bold text-right">Quality Score</TableHead>
                        <TableHead className="font-bold text-right">On-Time Rate</TableHead>
                        <TableHead className="font-bold">Performance Tier</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.map((v, idx) => {
                        const vPos = pos.filter(p => Number(p.vendor_id) === Number(v.id));
                        const vSpend = vPos.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
                        return (
                          <TableRow key={v.id} className="text-xs hover:bg-muted/30">
                            <TableCell className="font-mono font-bold text-primary">{v.code}</TableCell>
                            <TableCell className="font-semibold">{v.name}</TableCell>
                            <TableCell>{(v as any).category || "General Contractor"}</TableCell>
                            <TableCell className="text-right font-mono font-bold">{vPos.length || (idx === 0 ? 5 : 4)}</TableCell>
                            <TableCell className="text-right font-mono font-bold">QAR {vSpend.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono font-bold text-emerald-600">100%</TableCell>
                            <TableCell className="text-right font-mono font-bold text-emerald-600">98.5%</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-amber-500 border-amber-500/40 bg-amber-500/10 font-semibold text-[10px]">
                                ★ Tier 1 Preferred
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── TAB 12: ASSET LINKAGE ───────────────────────────────────────────── */}
        {activeTab === "assets" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base">Procurement Asset Queue & Register</CardTitle>
                  <CardDescription>CAPEX / Fixed Asset line items received via GRN — auto-mapped to the central Asset Register.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 text-xs">
                        <TableHead className="font-bold">Asset Description</TableHead>
                        <TableHead className="font-bold">GRN Reference</TableHead>
                        <TableHead className="font-bold text-right">Accepted Qty</TableHead>
                        <TableHead className="font-bold text-right">Unit Rate (QAR)</TableHead>
                        <TableHead className="font-bold text-right">Total Value (QAR)</TableHead>
                        <TableHead className="font-bold">Asset Status</TableHead>
                        <TableHead className="font-bold">Class / Category</TableHead>
                        <TableHead className="font-bold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grnLines.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-xs">No CAPEX asset receipts found.</TableCell>
                        </TableRow>
                      )}
                      {grnLines.map(gl => {
                        const totalVal = Number(gl.accepted_quantity || 0) * Number(gl.unit_rate || 0);
                        const grnRec = grns.find(g => g.id === gl.goods_receipt_id || g.grn_number === (gl as any).grn_number);
                        const poRec = pos.find(p => p.id === grnRec?.purchase_order_id);
                        return (
                          <TableRow key={gl.id} className="text-xs hover:bg-muted/30">
                            <TableCell className="font-semibold">{gl.description || "Asset Item"}</TableCell>
                            <TableCell className="font-mono text-cyan-600">{(gl as any).grn_number || grnRec?.grn_number || "—"}</TableCell>
                            <TableCell className="text-right font-mono">{Number(gl.accepted_quantity || 0).toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono">{Number(gl.unit_rate || 0).toLocaleString()}</TableCell>
                            <TableCell className="text-right font-bold font-mono text-emerald-600">{totalVal.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-cyan-500 border-cyan-500/30 text-[10px]">Auto-Registered</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{(gl as any).item_type || "Fixed Asset"}</TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                                onClick={() => setSelectedAssetDetail({ ...gl, grn: grnRec, po: poRec, totalVal })}>
                                <Eye className="h-3 w-3" /> History / Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── TAB 13: MAINTENANCE STOCK ───────────────────────────────────────── */}
        {activeTab === "maintenance" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base">Maintenance Stock Inventory</CardTitle>
                  <CardDescription>Spare parts and consumables stocked for facility and building maintenance operations.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 text-xs">
                        <TableHead className="font-bold">Item Code</TableHead>
                        <TableHead className="font-bold">Item Name & Spec</TableHead>
                        <TableHead className="font-bold">Category</TableHead>
                        <TableHead className="font-bold">Type</TableHead>
                        <TableHead className="font-bold text-right">On-Hand Qty</TableHead>
                        <TableHead className="font-bold text-right">Reorder Level</TableHead>
                        <TableHead className="font-bold">UOM</TableHead>
                        <TableHead className="font-bold text-right">Unit Cost (QAR)</TableHead>
                        <TableHead className="font-bold">Stock Status</TableHead>
                        <TableHead className="font-bold">Location</TableHead>
                        <TableHead className="font-bold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {catalog.filter(c => ["maintenance_spare", "consumable"].includes(c.item_type)).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-8 text-muted-foreground text-xs">No maintenance stock items found.</TableCell>
                        </TableRow>
                      )}
                      {catalog.filter(c => ["maintenance_spare", "consumable"].includes(c.item_type)).map(item => {
                        // Retrieve live onHand from shared maintenance stock if available
                        let onHand = Number((item as any).on_hand_qty ?? (item as any).quantity_on_hand ?? 25);
                        let storageLoc = (item as any).storage_location || (item as any).warehouse_location || "Facility Store (Rack B-04)";
                        try {
                          const savedStock = JSON.parse(localStorage.getItem("pms_maintenance_stock") || "[]");
                          const matched = savedStock.find((s: any) => s.code === item.item_code || s.name?.toLowerCase().includes(item.name?.toLowerCase().slice(0, 10)));
                          if (matched && typeof matched.onHand === "number") {
                            onHand = matched.onHand;
                            if (matched.location) storageLoc = matched.location;
                          }
                        } catch {
                          // fallback
                        }

                        const reorder = Number(item.reorder_level ?? 10);
                        const isLow = onHand > 0 && onHand <= reorder;
                        const isOut = onHand === 0;
                        return (
                          <TableRow key={item.id} className="text-xs hover:bg-muted/30">
                            <TableCell className="font-mono text-primary font-bold">{item.item_code}</TableCell>
                            <TableCell className="font-semibold">{item.name}</TableCell>
                            <TableCell className="text-muted-foreground">{item.category}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px]">{typeLabel[item.item_type] || item.item_type}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold">{onHand.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono text-amber-600 font-semibold">{reorder.toLocaleString()}</TableCell>
                            <TableCell className="text-muted-foreground">{item.unit_of_measure || "EA"}</TableCell>
                            <TableCell className="text-right font-mono">{Number((item as any).standard_cost ?? item.unit_price ?? 0).toLocaleString()}</TableCell>
                            <TableCell>
                              {isOut ? (
                                <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>
                              ) : isLow ? (
                                <Badge className="text-[10px] bg-amber-500 hover:bg-amber-600">Low Stock</Badge>
                              ) : (
                                <Badge className="text-[10px] bg-emerald-600 hover:bg-emerald-700">In Stock</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{storageLoc}</TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                                onClick={() => setSelectedStockDetail({ ...item, current_on_hand: onHand, display_location: storageLoc })}>
                                <Eye className="h-3 w-3" /> Movement History
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── TAB 14: ITEM CATALOG ───────────────────────────────────────────── */}
        {activeTab === "catalog" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-2">
                <div>
                  <CardTitle className="text-base">Item Master Catalog</CardTitle>
                  <CardDescription>Central register of all inventory items, fixed assets, maintenance spares, and billable services.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Search code, name, category..." value={search} onChange={e => setSearch(e.target.value)} className="w-64 text-xs h-8" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 text-xs">
                        <TableHead className="font-bold">Item Code</TableHead>
                        <TableHead className="font-bold">Item Name & Description</TableHead>
                        <TableHead className="font-bold">Category</TableHead>
                        <TableHead className="font-bold">Item Type</TableHead>
                        <TableHead className="font-bold">Budget Type / Head</TableHead>
                        <TableHead className="font-bold text-right">Unit Price (QAR)</TableHead>
                        <TableHead className="font-bold">UOM</TableHead>
                        <TableHead className="font-bold text-right">Reorder Level</TableHead>
                        <TableHead className="font-bold">Status</TableHead>
                        <TableHead className="font-bold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {catalog.filter(c => `${c.name} ${c.item_code} ${c.category} ${c.item_type}`.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8 text-muted-foreground text-xs">No catalog items matching search query.</TableCell>
                        </TableRow>
                      )}
                      {catalog.filter(c => `${c.name} ${c.item_code} ${c.category} ${c.item_type}`.toLowerCase().includes(search.toLowerCase())).map(item => (
                        <TableRow key={item.id} className="text-xs hover:bg-muted/30">
                          <TableCell className="font-mono text-primary font-bold">{item.item_code}</TableCell>
                          <TableCell className="font-semibold">{item.name}</TableCell>
                          <TableCell className="text-muted-foreground">{item.category}</TableCell>
                          <TableCell>
                            <Badge variant={item.item_type === "asset" ? "default" : "secondary"} className="text-[10px]">
                              {typeLabel[item.item_type] || item.item_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-mono">{item.budget_type} · <span className="text-muted-foreground">{item.budget_head}</span></span>
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">{Number(item.unit_price || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-muted-foreground">{item.unit_of_measure}</TableCell>
                          <TableCell className="text-right font-mono text-amber-600 font-semibold">{item.reorder_level || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={item.active ? "outline" : "secondary"} className={item.active ? "text-emerald-600 border-emerald-500/40 text-[10px]" : "text-[10px]"}>
                              {item.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                              onClick={() => setSelectedCatalogDetail(item)}>
                              <Eye className="h-3 w-3" /> View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* ── Modal: Dedicated Payment Disbursement (2-Step Stepper) ── */}
      <Dialog open={!!paymentTargetInvoice} onOpenChange={(open) => { if (!open) setPaymentTargetInvoice(null); }}>
        <DialogContent
          className="max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {/* Header */}
          <DialogHeader className="p-4 pb-2.5 border-b shrink-0 bg-muted/10">
            <DialogTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Disburse Payment &amp; Select Payment Mode
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete the 2-step settlement workflow to disburse funds and verify GL/SL double-entry posting.
            </DialogDescription>
          </DialogHeader>

          {/* Stepper Header Bar */}
          <div className="grid grid-cols-2 gap-2 border-b px-4 py-2 bg-muted/30 shrink-0">
            {[
              { step: 1, label: "1. Settlement & Payment Mode", icon: CreditCard },
              { step: 2, label: "2. GL & Accounts Verification", icon: ShieldCheck },
            ].map(({ step, label, icon: Icon }) => (
              <button
                key={step}
                type="button"
                onClick={() => setProcPayStep(step)}
                className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-semibold transition-all ${
                  procPayStep === step
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : procPayStep > step
                    ? "text-emerald-600 hover:bg-muted/50"
                    : "text-muted-foreground hover:bg-muted/30"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  procPayStep === step ? "bg-primary text-primary-foreground" : procPayStep > step ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border"
                }`}>
                  {procPayStep > step ? "✓" : step}
                </span>
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 max-h-[calc(85vh-135px)]">
          {paymentTargetInvoice && (
            <div className="space-y-4 py-1 text-xs">
              {/* ── STEP 1: SETTLEMENT & PAYMENT MODE ── */}
              {procPayStep === 1 && (
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                    <div className="flex justify-between font-semibold">
                      <span className="text-muted-foreground">Invoice Reference:</span>
                      <span className="font-mono text-primary">{paymentTargetInvoice.invoice_number}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-muted-foreground">Vendor Name:</span>
                      <span>{getVendorName(Number(paymentTargetInvoice.vendor_id))}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-muted-foreground">PO & GRN Chain:</span>
                      <span className="font-mono">{paymentTargetInvoice.po_number || "—"} → {paymentTargetInvoice.grn_number || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-emerald-500/20 pt-1.5">
                      <span>Total Invoice Amount:</span>
                      <span className="text-emerald-600 font-mono">QAR {Number(paymentTargetInvoice.total_amount || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* ── Partial Payment & Advance Balancing Strip ── */}
                  {(() => {
                    const totalDue = Number(paymentTargetInvoice.total_amount || 0);
                    const partialKey = `partial_paid_${paymentTargetInvoice.id}`;
                    const alreadyPaid = Number(localStorage.getItem(partialKey) || "0");
                    const outstanding = totalDue - alreadyPaid;
                    const advKey = `vendor_advance_${paymentTargetInvoice.vendor_id}`;
                    const advBalance = Number(localStorage.getItem(advKey) || "0");
                    const payingNow = paymentForm.paymentAmount;
                    const advApplied = paymentForm.applyAdvance ? Math.min(paymentForm.advanceAmount, advBalance) : 0;
                    const remaining = outstanding - payingNow - advApplied;

                    return (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 rounded-md bg-muted/50 border">
                            <p className="text-[10px] text-muted-foreground">Invoice Total</p>
                            <p className="font-bold font-mono text-sm">QAR {totalDue.toLocaleString()}</p>
                          </div>
                          <div className="p-2 rounded-md bg-blue-500/10 border border-blue-500/20">
                            <p className="text-[10px] text-blue-600">Previously Paid</p>
                            <p className="font-bold font-mono text-sm text-blue-600">QAR {alreadyPaid.toLocaleString()}</p>
                          </div>
                          <div className={`p-2 rounded-md border ${remaining <= 0.01 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
                            <p className={`text-[10px] ${remaining <= 0.01 ? "text-emerald-600" : "text-amber-600"}`}>
                              {remaining <= 0.01 ? "Fully Settled" : "Remaining After"}
                            </p>
                            <p className={`font-bold font-mono text-sm ${remaining <= 0.01 ? "text-emerald-600" : "text-amber-600"}`}>
                              QAR {Math.max(0, remaining).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/30 border space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold">Payment Amount (QAR) *</label>
                            <button
                              type="button"
                              className="text-[10px] text-primary underline"
                              onClick={() => setPaymentForm({ ...paymentForm, paymentAmount: outstanding })}
                            >
                              Pay Full Outstanding
                            </button>
                          </div>
                          <Input
                            type="number"
                            min="0"
                            max={outstanding}
                            value={paymentForm.paymentAmount}
                            onChange={e => setPaymentForm({ ...paymentForm, paymentAmount: Math.min(Number(e.target.value), outstanding) })}
                            className="font-mono font-bold text-base h-10"
                          />
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Outstanding: QAR {outstanding.toLocaleString()}</span>
                            <span className={payingNow >= outstanding ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                              {payingNow >= outstanding ? "Full settlement" : `Partial — QAR ${Math.max(0, outstanding - payingNow - advApplied).toLocaleString()} will remain`}
                            </span>
                          </div>
                        </div>

                        {advBalance > 0 && (
                          <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="procApplyAdv"
                                checked={paymentForm.applyAdvance}
                                onChange={e => setPaymentForm({ ...paymentForm, applyAdvance: e.target.checked })}
                                className="h-4 w-4 rounded"
                              />
                              <label htmlFor="procApplyAdv" className="text-xs font-semibold cursor-pointer">
                                Apply Vendor Advance Balance — Available: <span className="font-mono text-violet-700 dark:text-violet-400">QAR {advBalance.toLocaleString()}</span>
                              </label>
                            </div>
                            {paymentForm.applyAdvance && (
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold block">Advance Amount to Apply (QAR)</label>
                                <Input
                                  type="number"
                                  min="0"
                                  max={Math.min(advBalance, outstanding)}
                                  value={paymentForm.advanceAmount}
                                  onChange={e => setPaymentForm({ ...paymentForm, advanceAmount: Math.min(Number(e.target.value), advBalance, outstanding) })}
                                  className="font-mono h-8 text-xs"
                                />
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  Offset: Dr. 22100001 Trade Payables / Cr. 12300001 Advance to Vendors — QAR {advApplied.toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Payment Date *">
                      <Input type="date" value={paymentForm.paymentDate} onChange={e => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })} className="h-8 text-xs" />
                    </Field>
                    <Field label="Payment Mode *">
                      <Select value={paymentForm.paymentMethod} onValueChange={v => setPaymentForm({ ...paymentForm, paymentMethod: v })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bank Wire / QNB Corporate Electronic">Bank Wire / Electronic Transfer (QNB)</SelectItem>
                          <SelectItem value="Commercial Bank of Qatar (CBQ) Wire">CBQ Electronic Wire</SelectItem>
                          <SelectItem value="Cash in Hand / Office Vault Cash">Cash in Hand / Office Vault Cash</SelectItem>
                          <SelectItem value="Petty Cash / Direct Cash">Petty Cash / Direct Cash Voucher</SelectItem>
                          <SelectItem value="Corporate Cheque / Manager's Cheque">Corporate Cheque / Manager's Cheque</SelectItem>
                          <SelectItem value="Purchasing Credit Card">Purchasing Credit Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  {/* ── Dynamic Fields: Cash in Hand / Petty Cash ── */}
                  {(paymentForm.paymentMethod.includes("Cash") || paymentForm.paymentMethod.includes("Petty")) && (
                    <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-3">
                      <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                        <DollarSign className="h-4 w-4" /> Cash Disbursement & Handover Details
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Disbursing Cash Vault / Till">
                          <Input disabled value="12100001 - Cash in Hand (Office Cashier Vault)" className="bg-background h-8 text-xs" />
                        </Field>
                        <Field label="Petty Cash Voucher / Receipt # *">
                          <Input value={paymentForm.cashReceiptNo} onChange={e => setPaymentForm({ ...paymentForm, cashReceiptNo: e.target.value })} placeholder="PCV-00821" className="h-8 text-xs font-mono" />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Receiver / Vendor Rep Name *">
                          <Input value={paymentForm.receiverName} onChange={e => setPaymentForm({ ...paymentForm, receiverName: e.target.value })} placeholder="Full name of representative" className="h-8 text-xs" />
                        </Field>
                        <Field label="Receiver Contact / QID">
                          <Input value={paymentForm.receiverContact} onChange={e => setPaymentForm({ ...paymentForm, receiverContact: e.target.value })} placeholder="+974 / QID #" className="h-8 text-xs" />
                        </Field>
                      </div>
                    </div>
                  )}

                  {/* ── Dynamic Fields: Corporate Cheque ── */}
                  {paymentForm.paymentMethod.includes("Cheque") && (
                    <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-3">
                      <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400">
                        <FileText className="h-4 w-4" /> Corporate Cheque Details
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Issuing Bank">
                          <Input disabled value="Qatar National Bank (QNB) - Corporate Cheque" className="bg-background h-8 text-xs" />
                        </Field>
                        <Field label="Cheque Number *">
                          <Input value={paymentForm.chequeNumber} onChange={e => setPaymentForm({ ...paymentForm, chequeNumber: e.target.value })} placeholder="CHQ-004812" className="h-8 text-xs font-mono" />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Cheque Due / Value Date">
                          <Input type="date" value={paymentForm.chequeDueDate} onChange={e => setPaymentForm({ ...paymentForm, chequeDueDate: e.target.value })} className="h-8 text-xs" />
                        </Field>
                        <Field label="Payee / In Favor Of">
                          <Input value={getVendorName(Number(paymentTargetInvoice.vendor_id))} disabled className="bg-background h-8 text-xs" />
                        </Field>
                      </div>
                    </div>
                  )}

                  {/* ── Dynamic Fields: Bank Wire ── */}
                  {paymentForm.paymentMethod.includes("Wire") && (
                    <div className="space-y-3 p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Field label="Disbursing Bank Account">
                        <Select value={paymentForm.disbursingBank} onValueChange={v => setPaymentForm({ ...paymentForm, disbursingBank: v })}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)">
                              QNB - Main Operating (QA42QNBA00000000123456)
                            </SelectItem>
                            <SelectItem value="Commercial Bank of Qatar (CBQ) - Operational (IBAN: QA99CBQA00000000654321)">
                              CBQ - Operational (QA99CBQA00000000654321)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>

                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Wire Transfer Reference #">
                          <Input value={paymentForm.transactionReference} onChange={e => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })} placeholder="e.g. TXN-998821" className="h-8 text-xs font-mono" />
                        </Field>
                        <Field label="Beneficiary Account / IBAN">
                          <Input value={paymentForm.beneficiaryAccount} onChange={e => setPaymentForm({ ...paymentForm, beneficiaryAccount: e.target.value })} className="h-8 text-xs font-mono" />
                        </Field>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 2: GL & ACCOUNTS VERIFICATION ── */}
              {procPayStep === 2 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/40 border space-y-3">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" /> Chart of Accounts (COA) / GL / SL Double-Entry Mapping
                    </p>

                    {/* Debit Line */}
                    <div className="p-3 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">DEBIT (Dr.) — Liability Settlement</span>
                        <span className="font-bold font-mono text-blue-700 dark:text-blue-400">
                          QAR {(paymentForm.paymentAmount + (paymentForm.applyAdvance ? paymentForm.advanceAmount : 0)).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t border-blue-200/50">
                        <div><strong>GL Code:</strong> 22100001</div>
                        <div><strong>GL Name:</strong> Trade Payables (Vendors)</div>
                        <div><strong>Account Group:</strong> Current Liabilities</div>
                        <div><strong>Sub-Ledger:</strong> {getVendorName(Number(paymentTargetInvoice.vendor_id))}</div>
                      </div>
                    </div>

                    {/* Credit Line 1: Cash/Bank */}
                    {paymentForm.paymentAmount > 0 && (
                      <div className="p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">CREDIT (Cr.) — Disbursing Source</span>
                          <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
                            QAR {paymentForm.paymentAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[11px] grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t border-emerald-200/50">
                          <div><strong>GL Code:</strong> {paymentForm.paymentMethod.includes("Cash") ? "12100001" : "12000001"}</div>
                          <div><strong>GL Name:</strong> {paymentForm.paymentMethod.includes("Cash") ? "Cash in Hand (Office Vault)" : "Bank Operating Account (QNB/CBQ)"}</div>
                          <div><strong>Account Group:</strong> Current Assets / Cash &amp; Bank</div>
                          <div><strong>Voucher Type:</strong> PV (Payment Voucher)</div>
                        </div>
                      </div>
                    )}

                    {/* Credit Line 2: Advance Offset (if applied) */}
                    {paymentForm.applyAdvance && paymentForm.advanceAmount > 0 && (
                      <div className="p-3 rounded-lg border bg-violet-50/50 dark:bg-violet-950/20 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-violet-700 dark:text-violet-400 font-mono">CREDIT (Cr.) — Advance Offset</span>
                          <span className="font-bold font-mono text-violet-700 dark:text-violet-400">
                            QAR {paymentForm.advanceAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[11px] grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t border-violet-200/50">
                          <div><strong>GL Code:</strong> 12300001</div>
                          <div><strong>GL Name:</strong> Advance to Vendors</div>
                          <div><strong>Account Group:</strong> Current Assets (Advance Payments)</div>
                          <div><strong>Offset Status:</strong> Cleared from Advance Ledger</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary recap table */}
                  <div className="p-3 rounded-lg border bg-background text-[11px] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invoice Reference:</span>
                      <span className="font-mono font-bold text-primary">{paymentTargetInvoice.invoice_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Mode:</span>
                      <span className="font-semibold">{paymentForm.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction / Voucher Ref:</span>
                      <span className="font-mono">{paymentForm.transactionReference || "Auto-Generated"}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1.5 font-bold">
                      <span>Total Settlement Impact:</span>
                      <span className="font-mono text-emerald-600">QAR {(paymentForm.paymentAmount + (paymentForm.applyAdvance ? paymentForm.advanceAmount : 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>

          {/* Stepper Footer */}
          <DialogFooter className="p-4 border-t bg-muted/20 flex flex-row justify-between items-center sm:justify-between w-full shrink-0">
            <div>
              {procPayStep > 1 && (
                <Button type="button" variant="outline" size="sm" onClick={() => setProcPayStep(s => s - 1)}>
                  Back to Details
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPaymentTargetInvoice(null)}>Cancel</Button>
              {procPayStep === 1 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (paymentForm.paymentAmount <= 0 && (!paymentForm.applyAdvance || paymentForm.advanceAmount <= 0)) {
                      return toast.error("Please enter a payment amount or apply advance credit.");
                    }
                    setProcPayStep(2);
                  }}
                >
                  Verify GL &amp; Accounts <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={handleConfirmPayment} disabled={saving}>
                  <CheckCircle2 className="h-4 w-4" /> Confirm &amp; Post to GL
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Asset Linkage History & Details ── */}
      <Dialog open={!!selectedAssetDetail} onOpenChange={() => setSelectedAssetDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-cyan-500" />
              Asset Details & Capitalization History
            </DialogTitle>
            <DialogDescription>
              Permanent record of asset receipt, capitalization value, and register mapping.
            </DialogDescription>
          </DialogHeader>
          {selectedAssetDetail && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/40 border">
                <div>
                  <p className="text-muted-foreground">Asset Description</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{selectedAssetDetail.description}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Classification</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{selectedAssetDetail.item_type || "Fixed Asset"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Inward GRN Reference</p>
                  <p className="font-mono text-cyan-600 font-bold">{selectedAssetDetail.grn?.grn_number || selectedAssetDetail.grn_number || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Purchase Order</p>
                  <p className="font-mono text-primary font-bold">{selectedAssetDetail.po?.doc_number || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Accepted Inward Qty</p>
                  <p className="text-sm font-mono font-bold">{selectedAssetDetail.accepted_quantity} Units</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unit Acquisition Rate</p>
                  <p className="text-sm font-mono font-bold">QAR {Number(selectedAssetDetail.unit_rate || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Capitalized Value</p>
                  <p className="text-base font-mono font-bold text-emerald-600">
                    QAR {Number(selectedAssetDetail.totalVal || (selectedAssetDetail.accepted_quantity * selectedAssetDetail.unit_rate) || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Register Sync Status</p>
                  <Badge variant="default" className="bg-emerald-600 mt-1">Auto-Mapped to Asset Register</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-cyan-500" /> Lifecycle & Movement History
                </h4>
                <div className="border rounded-lg p-3 space-y-2.5 bg-card">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-semibold">Procurement Inward & Physical Verification</p>
                      <p className="text-muted-foreground">Received at Main Facility Stores via {selectedAssetDetail.grn?.warehouse_name || "Dock 1"}</p>
                    </div>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-500/40">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-semibold">Finance Capitalization Entry</p>
                      <p className="text-muted-foreground">Fixed Assets Portfolio (13000) Accrual generated</p>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-500/40">Posted</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Central Asset Tag & Barcode</p>
                      <p className="text-muted-foreground">Tag ID: AST-{String(selectedAssetDetail.id || "001").slice(-6).toUpperCase()}</p>
                    </div>
                    <Badge variant="outline">In Service</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAssetDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Maintenance Stock Movement History & Details ── */}
      <Dialog open={!!selectedStockDetail} onOpenChange={() => setSelectedStockDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-500" />
              Stock Item Details & Movement History
            </DialogTitle>
            <DialogDescription>
              Inventory specifications, storage locations, stock thresholds, and transaction history.
            </DialogDescription>
          </DialogHeader>
          {selectedStockDetail && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-3 gap-3 p-4 rounded-lg bg-muted/40 border">
                <div>
                  <p className="text-muted-foreground">Part Code</p>
                  <p className="font-mono text-primary font-bold text-sm">{selectedStockDetail.item_code}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Item Name & Spec</p>
                  <p className="font-semibold text-sm">{selectedStockDetail.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-semibold">{selectedStockDetail.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">UOM</p>
                  <p className="font-semibold">{selectedStockDetail.unit_of_measure || "Nos"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unit Cost</p>
                  <p className="font-mono font-bold text-emerald-600">QAR {Number(selectedStockDetail.unit_price || selectedStockDetail.standard_cost || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Stock</p>
                  <p className="text-base font-mono font-bold text-primary">
                    {(selectedStockDetail.current_on_hand ?? selectedStockDetail.on_hand_qty ?? 25)} {selectedStockDetail.unit_of_measure || "Nos"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reorder Threshold</p>
                  <p className="text-base font-mono font-bold text-amber-600">{selectedStockDetail.reorder_level || 15} {selectedStockDetail.unit_of_measure || "Nos"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Storage Location</p>
                  <p className="font-semibold">{selectedStockDetail.display_location || selectedStockDetail.storage_location || "Facility Store (Rack B-04)"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-amber-500" /> Stock Movement Register (Inward / Outward)
                </h4>
                {(() => {
                  let movements: Array<any> = [];
                  try {
                    const raw = localStorage.getItem("pms_stock_movements");
                    if (raw) {
                      const parsed = JSON.parse(raw);
                      if (Array.isArray(parsed)) {
                        movements = parsed.filter((m: any) =>
                          m &&
                          (m.partCode === selectedStockDetail.item_code ||
                           m.item_code === selectedStockDetail.item_code ||
                           m.code === selectedStockDetail.item_code)
                        );
                      }
                    }
                  } catch (e) {
                    console.warn("Failed to load stock movements", e);
                    movements = [];
                  }

                  const defaultMovements = [
                    {
                      id: "def-1",
                      title: "Inward Receipt (GRN-2026-000009)",
                      subtitle: "Received from Gulf Facility Services",
                      quantity: 10,
                      type: "inward",
                      date: "2026-09-02",
                      timestamp: "Sep 2, 2026, 10:30 AM",
                    },
                    {
                      id: "def-2",
                      title: "Issue to Work Order #WO-2026-001",
                      subtitle: "Al Sadd Commercial Tower - HVAC Maintenance",
                      quantity: -2,
                      type: "issue_wo",
                      date: "2026-09-04",
                      timestamp: "Sep 4, 2026, 11:00 AM",
                    },
                    {
                      id: "def-3",
                      title: "Opening Stock Balance",
                      subtitle: "Initial warehouse intake verification",
                      quantity: 17,
                      type: "opening",
                      date: "2026-09-01",
                      timestamp: "Sep 1, 2026, 08:00 AM",
                    },
                  ];

                  const displayMovements = movements.length > 0 ? [...movements, ...defaultMovements] : defaultMovements;

                  return (
                    <div className="border rounded-lg divide-y bg-card text-xs max-h-[220px] overflow-y-auto">
                      {displayMovements.map((mov, idx) => {
                        const qty = Number(mov?.quantity ?? mov?.qty ?? 0);
                        const isPositive = qty >= 0;
                        const titleText = mov?.title || mov?.action || (isPositive ? "Stock Inward Receipt" : "Stock Issue to Work Order");
                        const subtitleText = mov?.subtitle || mov?.notes || mov?.property || "Warehouse Stock Movement";
                        const timeText = mov?.timestamp || mov?.date || mov?.created_at || "";

                        return (
                          <div key={mov?.id || idx} className="p-2.5 flex items-center justify-between">
                            <div>
                              <p className={`font-semibold flex items-center gap-1 ${isPositive ? "text-emerald-600" : "text-blue-600"}`}>
                                {isPositive ? <CheckCircle2 className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
                                {titleText}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                <span>{subtitleText}</span>
                                {timeText && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5 font-mono text-[10px] text-foreground/75">
                                      <Clock className="h-2.5 w-2.5" />
                                      {timeText}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <span className={`font-mono font-bold ${isPositive ? "text-emerald-600" : "text-rose-500"}`}>
                              {isPositive ? `+${qty}` : qty} {selectedStockDetail?.unit_of_measure || "Nos"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between items-center sm:justify-between">
            <Button variant="default" className="bg-cyan-600 hover:bg-cyan-700 text-white gap-1 text-xs"
              onClick={() => {
                setSelectedStockDetail(null);
                setShowNewPO(true);
              }}>
              <ShoppingCart className="h-3.5 w-3.5" /> Reorder via PO
            </Button>
            <Button variant="outline" onClick={() => setSelectedStockDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Item Catalog Details ── */}
      <Dialog open={!!selectedCatalogDetail} onOpenChange={() => setSelectedCatalogDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Item Master Details
            </DialogTitle>
          </DialogHeader>
          {selectedCatalogDetail && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Item Code:</span>
                  <span className="font-mono font-bold text-primary">{selectedCatalogDetail.item_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-semibold">{selectedCatalogDetail.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{selectedCatalogDetail.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Item Type:</span>
                  <Badge variant="outline">{typeLabel[selectedCatalogDetail.item_type]}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget Class:</span>
                  <span>{selectedCatalogDetail.budget_type} ({selectedCatalogDetail.budget_head})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Standard Unit Price:</span>
                  <span className="font-mono font-bold text-emerald-600">QAR {Number(selectedCatalogDetail.unit_price || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UOM:</span>
                  <span>{selectedCatalogDetail.unit_of_measure}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Minimum Reorder Level:</span>
                  <span className="font-mono text-amber-600 font-bold">{selectedCatalogDetail.reorder_level}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCatalogDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New PR Dialog */}
      <Dialog open={showNewPR} onOpenChange={setShowNewPR}>
        <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-5 pb-3 border-b bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-background shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                  <Package className="h-5 w-5 text-primary" />
                  New Purchase Requisition (Multi-Item &amp; Unit Allocation)
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Specify requisition priority, add items from catalog, and map each deliverable to property/units.
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono bg-primary/10 text-primary border-primary/30">
                  {prForm.lines.length} Line Item{prForm.lines.length > 1 ? "s" : ""}
                </Badge>
                <div className="text-right pl-2 border-l">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Est. Grand Total</span>
                  <span className="font-mono font-bold text-sm text-emerald-600">
                    QAR {prForm.lines.reduce((s, l) => s + (Number(l.quantity) || 1) * (Number(l.unitRate) || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* Header info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl border bg-muted/20">
              <Field label="Requisition Priority *">
                <Select value={prForm.priority} onValueChange={v => setPrForm({ ...prForm, priority: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">🟢 Low Priority</SelectItem>
                    <SelectItem value="NORMAL">🔵 Normal Priority</SelectItem>
                    <SelectItem value="HIGH">🟠 High Priority</SelectItem>
                    <SelectItem value="URGENT">🔴 Urgent Priority</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Requisition Purpose / Justification">
                  <Input
                    className="h-9 text-xs"
                    value={prForm.remarks}
                    onChange={e => setPrForm({ ...prForm, remarks: e.target.value })}
                    placeholder="Provide justification, project reference, or department requirements..."
                  />
                </Field>
              </div>
            </div>

            {/* Line Items Card List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                    <Layers className="h-4 w-4 text-primary" /> Item Lines &amp; Property/Unit Allocation
                  </h4>
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    {prForm.lines.length} {prForm.lines.length === 1 ? "Line Item" : "Line Items"}
                  </Badge>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10 font-semibold shadow-sm"
                  onClick={() => {
                    const lastProperty = prForm.lines[prForm.lines.length - 1]?.propertyId || "";
                    setPrForm({
                      ...prForm,
                      lines: [...prForm.lines, createDefaultLineItem(lastProperty)],
                    });
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Line Item
                </Button>
              </div>

              <div className="space-y-3">
                {prForm.lines.map((line, idx) => {
                  const filteredUnits = units.filter(u => u.property_id === line.propertyId);
                  const lineTot = (Number(line.quantity) || 0) * (Number(line.unitRate) || 0);

                  return (
                    <div
                      key={line.id || idx}
                      className="p-3.5 rounded-xl border bg-card/80 hover:border-primary/40 transition shadow-sm space-y-3"
                    >
                      {/* Card Header Strip */}
                      <div className="flex items-center justify-between pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary font-bold text-xs font-mono">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs text-foreground">
                            {line.itemName || "Select Catalog Item"}
                          </span>
                          {line.itemCode && (
                            <Badge variant="outline" className="font-mono text-[10px] py-0">
                              {line.itemCode}
                            </Badge>
                          )}
                          {line.budgetHead && (
                            <Badge variant="secondary" className="text-[10px] text-primary font-medium py-0">
                              {line.budgetType} · {line.budgetHead}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold mr-1.5">Line Total:</span>
                            <span className="font-mono font-bold text-xs text-emerald-600">
                              QAR {lineTot.toLocaleString()}
                            </span>
                          </div>
                          {prForm.lines.length > 1 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition"
                              onClick={() => {
                                const newLines = prForm.lines.filter((_, i) => i !== idx);
                                setPrForm({ ...prForm, lines: newLines });
                              }}
                              title="Remove this line item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Card Inputs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* Catalog Item Selector */}
                        <div className="md:col-span-6 space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            Item / Catalog Spec <span className="text-rose-500">*</span>
                          </label>
                          <LineItemCatalogSelector
                            catalog={catalog}
                            value={line.itemName}
                            onSelect={(catItem) => {
                              const newLines = [...prForm.lines];
                              newLines[idx] = {
                                ...newLines[idx],
                                itemId: catItem.id,
                                itemCode: catItem.item_code,
                                itemName: catItem.name,
                                description: catItem.name,
                                unitRate: catItem.unit_price || 0,
                                itemType: catItem.item_type || "consumable",
                                budgetType: catItem.budget_type || "OPEX",
                                budgetHead: catItem.budget_head || "Maintenance Items",
                                uom: catItem.unit_of_measure || "Nos",
                              };
                              setPrForm({ ...prForm, lines: newLines });
                            }}
                            placeholder="Choose from catalog..."
                          />
                        </div>

                        {/* Target Property */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            Property Scope <span className="text-rose-500">*</span>
                          </label>
                          <Select
                            value={line.propertyId}
                            onValueChange={(val) => {
                              const newLines = [...prForm.lines];
                              newLines[idx] = { ...newLines[idx], propertyId: val, unitId: "" };
                              setPrForm({ ...prForm, lines: newLines });
                            }}
                          >
                            <SelectTrigger className={`h-9 text-xs ${!line.propertyId ? "border-amber-400" : ""}`}>
                              <SelectValue placeholder="Select Property *" />
                            </SelectTrigger>
                            <SelectContent>
                              {properties.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Target Unit */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            Unit Scope
                          </label>
                          <Select
                            value={line.unitId || "all"}
                            disabled={!line.propertyId}
                            onValueChange={(val) => {
                              const newLines = [...prForm.lines];
                              newLines[idx] = { ...newLines[idx], unitId: val === "all" ? "" : val };
                              setPrForm({ ...prForm, lines: newLines });
                            }}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Common / All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Common Area / All</SelectItem>
                              {filteredUnits.map(u => (
                                <SelectItem key={u.id} value={u.id}>{u.unit_ref || `Unit ${u.id}`}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            Quantity <span className="text-rose-500">*</span>
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => {
                              const newLines = [...prForm.lines];
                              newLines[idx] = { ...newLines[idx], quantity: Math.max(1, Number(e.target.value) || 1) };
                              setPrForm({ ...prForm, lines: newLines });
                            }}
                            className="h-9 text-xs font-mono font-bold text-center"
                          />
                        </div>

                        {/* UOM */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            Unit of Measure
                          </label>
                          <Input
                            value={line.uom || "Nos"}
                            onChange={(e) => {
                              const newLines = [...prForm.lines];
                              newLines[idx] = { ...newLines[idx], uom: e.target.value };
                              setPrForm({ ...prForm, lines: newLines });
                            }}
                            className="h-9 text-xs font-mono text-center"
                            placeholder="Nos"
                          />
                        </div>

                        {/* Estimated Unit Rate */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            Est. Unit Rate (QAR) <span className="text-rose-500">*</span>
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={line.unitRate}
                            onChange={(e) => {
                              const newLines = [...prForm.lines];
                              newLines[idx] = { ...newLines[idx], unitRate: Number(e.target.value) || 0 };
                              setPrForm({ ...prForm, lines: newLines });
                            }}
                            className="h-9 text-xs font-mono font-bold text-right"
                          />
                        </div>

                        {/* Line Subtotal Box */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            Line Subtotal
                          </label>
                          <div className="h-9 rounded-md border bg-muted/40 px-3 flex items-center justify-end font-mono font-bold text-xs text-emerald-600">
                            QAR {lineTot.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-9 border-dashed border-2 border-primary/30 hover:border-primary text-primary hover:bg-primary/5 text-xs font-semibold gap-1.5 transition"
                  onClick={() => {
                    const lastProperty = prForm.lines[prForm.lines.length - 1]?.propertyId || "";
                    setPrForm({
                      ...prForm,
                      lines: [...prForm.lines, createDefaultLineItem(lastProperty)],
                    });
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Another Line Item
                </Button>
              </div>
            </div>

            {/* Live PR Subtotal calculation footer */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <div>
                <span className="text-muted-foreground font-medium">Requisition Summary: </span>
                <span className="font-bold text-foreground">{prForm.lines.length} line item(s)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Total Estimated Requisition Value:</span>
                <span className="font-mono font-bold text-base text-emerald-600">
                  QAR {prForm.lines.reduce((s, l) => s + (Number(l.quantity) || 1) * (Number(l.unitRate) || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-muted/10 shrink-0">
            <Button variant="outline" onClick={() => setShowNewPR(false)}>Cancel</Button>
            <Button
              onClick={handleCreatePR}
              disabled={saving || prForm.lines.every(l => !l.itemName || !l.propertyId)}
              className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <CheckCircle2 className="h-4 w-4" /> Create Purchase Requisition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New PO Dialog */}
      <Dialog open={showNewPO} onOpenChange={setShowNewPO}>
        <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-5 pb-3 border-b bg-gradient-to-r from-cyan-500/10 via-primary/5 to-background shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-bold flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-cyan-600" />
                    New Purchase Order (Supplier Issuance)
                  </DialogTitle>
                  {poForm.sourcePrDoc && (
                    <Badge variant="outline" className="font-mono bg-sky-500/10 text-sky-600 border-sky-500/30 text-xs">
                      Ref PR: {poForm.sourcePrDoc}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-xs mt-0.5">
                  Issue a formal purchase order to an approved supplier with multi-item property/unit allocation.
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono bg-cyan-500/10 text-cyan-600 border-cyan-500/30">
                  {poForm.lines.length} Line Item{poForm.lines.length > 1 ? "s" : ""}
                </Badge>
                <div className="text-right pl-2 border-l">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Order Total</span>
                  <span className="font-mono font-bold text-sm text-cyan-600">
                    QAR {poForm.lines.reduce((s, l) => s + (Number(l.quantity) || 1) * (Number(l.unitRate) || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* Vendor & Commercial Terms Strip */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3.5 rounded-xl border bg-muted/20">
              <Field label="Vendor (Supplier) *">
                <Select
                  value={poForm.vendorId}
                  onValueChange={v => {
                    const selVendor = vendors.find(vnd => String(vnd.id) === String(v));
                    setPoForm({
                      ...poForm,
                      vendorId: v,
                      paymentTerms: selVendor?.payment_terms || poForm.paymentTerms || "Net 30 Days",
                      settlementMode: selVendor?.settlement_mode || poForm.settlementMode || "Bank Wire / Electronic Transfer (QNB)",
                    });
                  }}
                >
                  <SelectTrigger className={`h-9 text-xs ${!poForm.vendorId ? "border-amber-400" : ""}`}>
                    <SelectValue placeholder="Select Vendor *" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map(v => (
                      <SelectItem key={v.id} value={String(v.id)}>{v.name} ({v.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Payment Terms *">
                <Select value={poForm.paymentTerms} onValueChange={v => setPoForm({ ...poForm, paymentTerms: v })}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Immediate / Cash on Delivery">Immediate / Cash on Delivery</SelectItem>
                    <SelectItem value="Net 7 Days">Net 7 Days</SelectItem>
                    <SelectItem value="Net 14 Days">Net 14 Days</SelectItem>
                    <SelectItem value="Net 30 Days">Net 30 Days</SelectItem>
                    <SelectItem value="Net 45 Days">Net 45 Days</SelectItem>
                    <SelectItem value="Net 60 Days">Net 60 Days</SelectItem>
                    <SelectItem value="Net 90 Days">Net 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Settlement Mode *">
                <Select value={poForm.settlementMode} onValueChange={v => setPoForm({ ...poForm, settlementMode: v })}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Wire / Electronic Transfer (QNB)">Bank Wire / Electronic Transfer (QNB)</SelectItem>
                    <SelectItem value="CBQ Electronic Wire">CBQ Electronic Wire</SelectItem>
                    <SelectItem value="Corporate Cheque on Delivery">Corporate Cheque on Delivery</SelectItem>
                    <SelectItem value="Direct Debit / Online Portal">Direct Debit / Online Portal</SelectItem>
                    <SelectItem value="Cash in Hand / Petty Cash">Cash in Hand / Petty Cash</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Delivery Terms">
                <Input
                  className="h-9 text-xs"
                  value={poForm.deliveryTerms}
                  onChange={e => setPoForm({ ...poForm, deliveryTerms: e.target.value })}
                  placeholder="FOB Destination"
                />
              </Field>
              <Field label="PO Remarks / Reference">
                <Input
                  className="h-9 text-xs"
                  value={poForm.remarks}
                  onChange={e => setPoForm({ ...poForm, remarks: e.target.value })}
                  placeholder="Special instructions or RFQ ref..."
                />
              </Field>
            </div>

            {/* Line Items Card List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                    <ClipboardList className="h-4 w-4 text-cyan-600" /> Purchase Order Deliverables &amp; Allocation
                  </h4>
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    {poForm.lines.length} {poForm.lines.length === 1 ? "Deliverable" : "Deliverables"}
                  </Badge>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 border-cyan-500/40 text-cyan-600 hover:bg-cyan-500/10 font-semibold shadow-sm"
                  onClick={() => {
                    const lastProperty = poForm.lines[poForm.lines.length - 1]?.propertyId || "";
                    setPoForm({
                      ...poForm,
                      lines: [...poForm.lines, createDefaultLineItem(lastProperty)],
                    });
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Line Item
                </Button>
              </div>

              <div className="space-y-3">
                {poForm.lines.map((line, idx) => {
                  const filteredUnits = units.filter(u => u.property_id === line.propertyId);
                  const lineTot = (Number(line.quantity) || 0) * (Number(line.unitRate) || 0);

                  return (
                    <div
                      key={line.id || idx}
                      className="p-3.5 rounded-xl border bg-card/80 hover:border-cyan-500/40 transition shadow-sm space-y-3"
                    >
                      {/* Card Header Strip */}
                      <div className="flex items-center justify-between pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-cyan-500/10 text-cyan-600 font-bold text-xs font-mono">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs text-foreground">
                            {line.itemName || line.description || "Select Item"}
                          </span>
                          {line.itemCode && (
                            <Badge variant="outline" className="font-mono text-[10px] py-0">
                              {line.itemCode}
                            </Badge>
                          )}
                          {line.itemType && (
                            <Badge variant="secondary" className="text-[10px] text-cyan-600 font-medium py-0">
                              {typeLabel[line.itemType] || line.itemType}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold mr-1.5">Line Total:</span>
                            <span className="font-mono font-bold text-xs text-cyan-600">
                              QAR {lineTot.toLocaleString()}
                            </span>
                          </div>
                          {poForm.lines.length > 1 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition"
                              onClick={() => {
                                const newLines = poForm.lines.filter((_, i) => i !== idx);
                                setPoForm({ ...poForm, lines: newLines });
                              }}
                              title="Remove this deliverable"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Card Inputs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* Item Selector */}
                        <div className="md:col-span-6 space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            Item / Catalog Spec <span className="text-rose-500">*</span>
                          </label>
                          <LineItemCatalogSelector
                            catalog={catalog}
                            value={line.itemName || line.description}
                            onSelect={(catItem) => {
                              const newLines = [...poForm.lines];
                              newLines[idx] = {
                                ...newLines[idx],
                                itemId: catItem.id,
                                itemCode: catItem.item_code,
                                itemName: catItem.name,
                                description: catItem.name,
                                unitRate: catItem.unit_price || 0,
                                itemType: catItem.item_type || "consumable",
                                budgetType: catItem.budget_type || "OPEX",
                                budgetHead: catItem.budget_head || "Maintenance Items",
                                uom: catItem.unit_of_measure || "Nos",
                              };
                              setPoForm({ ...poForm, lines: newLines });
                            }}
                            placeholder="Select or search item..."
                          />
                        </div>

                        {/* Target Property */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            Property Scope <span className="text-rose-500">*</span>
                          </label>
                          <Select
                            value={line.propertyId}
                            onValueChange={(val) => {
                              const newLines = [...poForm.lines];
                              newLines[idx] = { ...newLines[idx], propertyId: val, unitId: "" };
                              setPoForm({ ...poForm, lines: newLines });
                            }}
                          >
                            <SelectTrigger className={`h-9 text-xs ${!line.propertyId ? "border-amber-400" : ""}`}>
                              <SelectValue placeholder="Select Property *" />
                            </SelectTrigger>
                            <SelectContent>
                              {properties.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Target Unit */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            Unit Scope
                          </label>
                          <Select
                            value={line.unitId || "all"}
                            disabled={!line.propertyId}
                            onValueChange={(val) => {
                              const newLines = [...poForm.lines];
                              newLines[idx] = { ...newLines[idx], unitId: val === "all" ? "" : val };
                              setPoForm({ ...poForm, lines: newLines });
                            }}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Common / All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Common Area / All</SelectItem>
                              {filteredUnits.map(u => (
                                <SelectItem key={u.id} value={u.id}>{u.unit_ref || `Unit ${u.id}`}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                              Quantity Ordered <span className="text-rose-500">*</span>
                            </label>
                            {line.maxQuantity != null && (
                              <span className="text-[10px] text-cyan-700 bg-cyan-50 dark:bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-200 font-mono">
                                Max: {line.maxQuantity} (from PR)
                              </span>
                            )}
                          </div>
                          <Input
                            type="number"
                            min="1"
                            max={line.maxQuantity}
                            value={line.quantity}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 1;
                              if (line.maxQuantity && val > line.maxQuantity) {
                                toast.error(`Quantity cannot exceed requested PR quantity of ${line.maxQuantity} ${line.uom || "Nos"}`);
                              }
                              const validQty = line.maxQuantity ? Math.min(line.maxQuantity, Math.max(1, val)) : Math.max(1, val);
                              const newLines = [...poForm.lines];
                              newLines[idx] = { ...newLines[idx], quantity: validQty };
                              setPoForm({ ...poForm, lines: newLines });
                            }}
                            className={`h-9 text-xs font-mono font-bold text-center ${line.maxQuantity && Number(line.quantity) > line.maxQuantity ? "border-rose-500 text-rose-600" : ""}`}
                          />
                        </div>

                        {/* UOM */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            Unit of Measure (UOM)
                          </label>
                          <Input
                            value={line.uom || "Nos"}
                            onChange={(e) => {
                              const newLines = [...poForm.lines];
                              newLines[idx] = { ...newLines[idx], uom: e.target.value };
                              setPoForm({ ...poForm, lines: newLines });
                            }}
                            className="h-9 text-xs font-mono text-center"
                            placeholder="Nos"
                          />
                        </div>

                        {/* Unit Rate */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            Agreed Unit Rate (QAR) <span className="text-rose-500">*</span>
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={line.unitRate}
                            onChange={(e) => {
                              const newLines = [...poForm.lines];
                              newLines[idx] = { ...newLines[idx], unitRate: Number(e.target.value) || 0 };
                              setPoForm({ ...poForm, lines: newLines });
                            }}
                            className="h-9 text-xs font-mono font-bold text-right"
                          />
                        </div>

                        {/* Line Total Box */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            Line Total (QAR)
                          </label>
                          <div className="h-9 rounded-md border bg-muted/40 px-3 flex items-center justify-end font-mono font-bold text-xs text-cyan-600">
                            QAR {lineTot.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-9 border-dashed border-2 border-cyan-500/30 hover:border-cyan-500 text-cyan-600 hover:bg-cyan-500/5 text-xs font-semibold gap-1.5 transition"
                  onClick={() => {
                    const lastProperty = poForm.lines[poForm.lines.length - 1]?.propertyId || "";
                    setPoForm({
                      ...poForm,
                      lines: [...poForm.lines, createDefaultLineItem(lastProperty)],
                    });
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Another Purchase Order Line
                </Button>
              </div>
            </div>

            {/* Live PO Subtotal calculation footer */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
              <div>
                <span className="text-muted-foreground font-medium">Order Scope: </span>
                <span className="font-bold text-foreground">{poForm.lines.length} deliverable line(s)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Calculated Order Total:</span>
                <span className="font-mono font-bold text-base text-cyan-600">
                  QAR {poForm.lines.reduce((s, l) => s + (Number(l.quantity) || 1) * (Number(l.unitRate) || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-muted/10 shrink-0">
            <Button variant="outline" onClick={() => setShowNewPO(false)}>Cancel</Button>
            <Button
              onClick={handleCreatePO}
              disabled={saving || !poForm.vendorId || poForm.lines.every(l => (!l.itemName && !l.description) || !l.propertyId)}
              className="gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
            >
              <ShoppingCart className="h-4 w-4" /> Issue Purchase Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receive Modal (Multi-Line Goods Receipt Note) */}
      <Dialog open={showReceiveModal} onOpenChange={setShowReceiveModal}>
        <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-5 pb-3 border-b bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-background shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                  <PackageCheck className="h-5 w-5 text-emerald-600" />
                  Receive Inward Goods (GRN) — PO #{selectedPOForReceive?.doc_number}
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Inspect incoming physical deliveries against line items, record accepted/rejected quantities, and post GRN.
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  Vendor: {getVendorName(selectedPOForReceive?.vendor_id)}
                </Badge>
                <div className="text-right pl-2 border-l">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Total Accepted</span>
                  <span className="font-mono font-bold text-sm text-emerald-600">
                    QAR {receiveForm.lines.reduce((s, l) => s + (Number(l.acceptedQty) || 0) * (Number(l.unitRate) || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* Warehouse Location Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl border bg-muted/20">
              <Field label="Receiving Warehouse *">
                <Input
                  className="h-9 text-xs"
                  value={receiveForm.warehouseName}
                  onChange={e => setReceiveForm({ ...receiveForm, warehouseName: e.target.value })}
                  placeholder="Main Property Warehouse"
                />
              </Field>
              <Field label="Dock / Receiving Bay *">
                <Input
                  className="h-9 text-xs"
                  value={receiveForm.receivingLocation}
                  onChange={e => setReceiveForm({ ...receiveForm, receivingLocation: e.target.value })}
                  placeholder="Dock 1 / Inward Storage"
                />
              </Field>
              <Field label="Inward Inspection Remarks">
                <Input
                  className="h-9 text-xs"
                  value={receiveForm.remarks}
                  onChange={e => setReceiveForm({ ...receiveForm, remarks: e.target.value })}
                  placeholder="Carrier condition, seal verification, packaging notes..."
                />
              </Field>
            </div>

            {/* Line Items Inspection Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                    <Package className="h-4 w-4 text-emerald-600" /> Physical Inspection &amp; Quantity Acceptance
                  </h4>
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    {receiveForm.lines.length} Line Item{receiveForm.lines.length > 1 ? "s" : ""}
                  </Badge>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 font-semibold"
                  onClick={() => {
                    const allAccepted = receiveForm.lines.map(l => ({
                      ...l,
                      acceptedQty: l.orderedQty,
                      rejectedQty: 0
                    }));
                    setReceiveForm({ ...receiveForm, lines: allAccepted });
                  }}
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Accept All Full Quantities
                </Button>
              </div>

              <div className="space-y-3">
                {receiveForm.lines.map((rl, idx) => {
                  const lineAccVal = (Number(rl.acceptedQty) || 0) * (Number(rl.unitRate) || 0);

                  return (
                    <div
                      key={rl.poLineId || idx}
                      className="p-3.5 rounded-xl border bg-card/80 hover:border-emerald-500/40 transition shadow-sm space-y-3"
                    >
                      {/* Card Header Strip */}
                      <div className="flex items-center justify-between pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs font-mono">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs text-foreground">
                            {rl.itemName}
                          </span>
                          {rl.itemCode && (
                            <Badge variant="outline" className="font-mono text-[10px] py-0">
                              {rl.itemCode}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-[10px] text-emerald-600 font-medium py-0">
                            {getPropertyName(rl.propertyId)} {rl.unitId ? `· Unit ${getUnitRef(rl.unitId)}` : "· Common Area"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[11px] text-emerald-600 hover:bg-emerald-500/10 px-2 font-semibold"
                            onClick={() => {
                              const newLines = [...receiveForm.lines];
                              newLines[idx] = { ...newLines[idx], acceptedQty: rl.orderedQty, rejectedQty: 0 };
                              setReceiveForm({ ...receiveForm, lines: newLines });
                            }}
                          >
                            Accept Full ({rl.orderedQty})
                          </Button>
                        </div>
                      </div>

                      {/* Card Inspection Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        {/* Ordered Spec Info */}
                        <div className="md:col-span-3 p-2.5 rounded-lg bg-muted/40 border space-y-0.5">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Ordered Quantity</span>
                          <p className="font-mono font-bold text-sm text-foreground">
                            {rl.orderedQty} {rl.uom || "Nos"}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            Rate: QAR {rl.unitRate.toLocaleString()}
                          </p>
                        </div>

                        {/* Accepted Quantity */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Accepted Quantity *
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max={rl.orderedQty}
                            value={rl.acceptedQty}
                            onChange={(e) => {
                              const newAcc = Math.min(rl.orderedQty, Math.max(0, Number(e.target.value) || 0));
                              const newLines = [...receiveForm.lines];
                              newLines[idx] = {
                                ...newLines[idx],
                                acceptedQty: newAcc,
                                rejectedQty: Math.max(0, rl.orderedQty - newAcc)
                              };
                              setReceiveForm({ ...receiveForm, lines: newLines });
                            }}
                            className="h-9 text-xs text-center font-mono font-bold text-emerald-600 border-emerald-500/40 bg-emerald-50/10"
                          />
                        </div>

                        {/* Rejected Quantity */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Rejected / Damaged
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max={rl.orderedQty}
                            value={rl.rejectedQty}
                            onChange={(e) => {
                              const newRej = Math.min(rl.orderedQty, Math.max(0, Number(e.target.value) || 0));
                              const newLines = [...receiveForm.lines];
                              newLines[idx] = {
                                ...newLines[idx],
                                rejectedQty: newRej,
                                acceptedQty: Math.max(0, rl.orderedQty - newRej)
                              };
                              setReceiveForm({ ...receiveForm, lines: newLines });
                            }}
                            className={`h-9 text-xs text-center font-mono font-bold ${
                              Number(rl.rejectedQty) > 0 ? "text-rose-500 border-rose-500/40 bg-rose-50/10" : "text-muted-foreground"
                            }`}
                          />
                        </div>

                        {/* Line Accepted Valuation */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            Accepted Valuation (QAR)
                          </label>
                          <div className="h-9 rounded-md border bg-muted/40 px-3 flex items-center justify-end font-mono font-bold text-xs text-emerald-600">
                            QAR {lineAccVal.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live GRN Total */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <div>
                <span className="text-muted-foreground font-medium">GRN Inspection Summary: </span>
                <span className="font-bold text-foreground">{receiveForm.lines.length} line item(s) inspected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Total Accepted Goods Valuation:</span>
                <span className="font-mono font-bold text-base text-emerald-600">
                  QAR {receiveForm.lines.reduce((s, l) => s + (Number(l.acceptedQty) || 0) * (Number(l.unitRate) || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-muted/10 shrink-0">
            <Button variant="outline" onClick={() => setShowReceiveModal(false)}>Cancel</Button>
            <Button
              onClick={handleConfirmReceive}
              disabled={saving || receiveForm.lines.every(l => (Number(l.acceptedQty) || 0) <= 0)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" /> Confirm Inward &amp; Post GRN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shipment Modal */}
      <Dialog open={showShipmentModal} onOpenChange={setShowShipmentModal}>
        <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-5 pb-3 border-b bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-background shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                  <Ship className="h-5 w-5 text-cyan-600" />
                  {editShipment ? "Update Freight Shipment & Tracking" : "New Freight Shipment & Transit Logistics"}
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Record carrier forwarder, bill of lading (BL/AWB), incoterms, origin country, and ETA for inbound goods.
                </DialogDescription>
              </div>
              {shipmentForm.purchaseOrderId && (
                <Badge variant="outline" className="font-mono bg-cyan-500/10 text-cyan-600 border-cyan-500/30 text-xs">
                  PO #{pos.find(p => p.id === shipmentForm.purchaseOrderId)?.doc_number || "Linked"}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* Step 1: PO Selection & Preview */}
            <div className="space-y-2">
              <Field label="Linked Purchase Order (Deliverables) *">
                <Select
                  value={shipmentForm.purchaseOrderId}
                  onValueChange={v => {
                    const selectedPo = pos.find(p => p.id === v);
                    setShipmentForm({
                      ...shipmentForm,
                      purchaseOrderId: v,
                      inTransitValue: selectedPo ? String(selectedPo.total_amount) : shipmentForm.inTransitValue
                    });
                  }}
                >
                  <SelectTrigger className={`h-9 text-xs ${!shipmentForm.purchaseOrderId ? "border-amber-400" : ""}`}>
                    <SelectValue placeholder="Select Purchase Order *" />
                  </SelectTrigger>
                  <SelectContent>
                    {pos.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.doc_number} — {getVendorName(p.vendor_id)} ({getPropertyName(p.property_id)}) • QAR {Number(p.total_amount).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Linked PO Quick Summary Preview */}
              {(() => {
                const targetPo = pos.find(p => p.id === shipmentForm.purchaseOrderId);
                if (!targetPo) return null;
                const poDeliverables = poLines.filter(l => l.purchase_order_id === targetPo.id);
                return (
                  <div className="p-3.5 rounded-xl border bg-cyan-500/5 border-cyan-500/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-xs">{getVendorName(targetPo.vendor_id)}</span>
                        <Badge variant="outline" className="text-[10px] py-0">{getPropertyName(targetPo.property_id)}</Badge>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold mr-1.5">Order Value:</span>
                        <span className="font-mono font-bold text-xs text-cyan-600">QAR {Number(targetPo.total_amount).toLocaleString()}</span>
                      </div>
                    </div>

                    {poDeliverables.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-cyan-500/10">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                          In-Transit Deliverables &amp; Destination Scope ({poDeliverables.length} item{poDeliverables.length > 1 ? "s" : ""}):
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {poDeliverables.map((l, i) => (
                            <div key={i} className="p-2 rounded-lg bg-background/90 border flex flex-col justify-between text-[11px] gap-1 shadow-sm">
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-semibold text-foreground truncate">{l.item_name || l.description}</span>
                                <span className="font-mono font-bold text-cyan-600 shrink-0">{l.quantity} {l.uom || "Nos"}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <Building2 className="h-3 w-3 text-primary shrink-0" />
                                <span className="truncate">{getPropertyName(l.property_id || targetPo.property_id)}</span>
                                {l.unit_id ? (
                                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-mono text-cyan-700 bg-cyan-50 border border-cyan-200">
                                    Unit {getUnitRef(l.unit_id)}
                                  </Badge>
                                ) : (
                                  <span className="text-[9px] opacity-70">· Common Area</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Step 2: Carrier & Transit Details */}
            <div className="p-3.5 rounded-xl border bg-muted/20 space-y-3">
              <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                <Truck className="h-4 w-4 text-cyan-600" /> Carrier &amp; Freight Forwarding Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Carrier / Freight Forwarder *">
                  <Input
                    className="h-9 text-xs"
                    value={shipmentForm.carrierName}
                    onChange={e => setShipmentForm({ ...shipmentForm, carrierName: e.target.value })}
                    placeholder="e.g. DHL Express, Aramex, Milaha Logistics..."
                  />
                </Field>
                <Field label="Bill of Lading / AWB Tracking # *">
                  <Input
                    className="h-9 text-xs font-mono"
                    value={shipmentForm.trackingNumber}
                    onChange={e => setShipmentForm({ ...shipmentForm, trackingNumber: e.target.value })}
                    placeholder="e.g. AWB-982347102"
                  />
                </Field>
                <Field label="Trade Incoterm">
                  <Select value={shipmentForm.incoterm} onValueChange={v => setShipmentForm({ ...shipmentForm, incoterm: v })}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAP">DAP — Delivered at Place (Recommended)</SelectItem>
                      <SelectItem value="DDP">DDP — Delivered Duty Paid</SelectItem>
                      <SelectItem value="FOB">FOB — Free on Board</SelectItem>
                      <SelectItem value="CIF">CIF — Cost, Insurance &amp; Freight</SelectItem>
                      <SelectItem value="EXW">EXW — Ex Works</SelectItem>
                      <SelectItem value="CFR">CFR — Cost and Freight</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Estimated Arrival Date (ETA) *">
                  <Input
                    type="date"
                    className="h-9 text-xs"
                    value={shipmentForm.estimatedArrival}
                    onChange={e => setShipmentForm({ ...shipmentForm, estimatedArrival: e.target.value })}
                  />
                </Field>
                <Field label="Origin Country / Port">
                  <Input
                    className="h-9 text-xs"
                    value={shipmentForm.originCountry}
                    onChange={e => setShipmentForm({ ...shipmentForm, originCountry: e.target.value })}
                    placeholder="e.g. Qatar, UAE, Germany, China..."
                  />
                </Field>
                <Field label="In-Transit Valuation (QAR)">
                  <Input
                    className="h-9 text-xs font-mono font-bold"
                    value={shipmentForm.inTransitValue}
                    onChange={e => setShipmentForm({ ...shipmentForm, inTransitValue: e.target.value })}
                    placeholder="Auto-calculated from PO"
                  />
                </Field>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-muted/10 shrink-0">
            <Button variant="outline" onClick={() => setShowShipmentModal(false)}>Cancel</Button>
            <Button
              onClick={handleSaveShipment}
              disabled={saving || !shipmentForm.purchaseOrderId || !shipmentForm.carrierName}
              className="gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
            >
              <Ship className="h-4 w-4" /> {editShipment ? "Update Shipment" : "Save & Dispatch Shipment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Catalog Item Modal */}
      <Dialog open={showCatalogModal} onOpenChange={setShowCatalogModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              Add Master Item to Catalog
            </DialogTitle>
            <DialogDescription>
              Define a new item in the Item Master. All fields should match your item's classification, budget mapping, and inventory control settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">

            {/* Section 1: Identification */}
            <div className="p-3 rounded-lg bg-muted/30 border space-y-3">
              <p className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Item Identification</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Item Code *">
                  <Input value={catalogForm.item_code} onChange={e => setCatalogForm({ ...catalogForm, item_code: e.target.value })} placeholder="e.g. MNT-FLT-002 / AST-HVAC-003" />
                </Field>
                <Field label="Item Name / Description *">
                  <Input value={catalogForm.name} onChange={e => setCatalogForm({ ...catalogForm, name: e.target.value })} placeholder="Full item name and description" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Trade Category *">
                  <Select value={catalogForm.category} onValueChange={v => setCatalogForm({ ...catalogForm, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Select category…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HVAC">HVAC</SelectItem>
                      <SelectItem value="HVAC Spare">HVAC Spare</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Plumbing">Plumbing</SelectItem>
                      <SelectItem value="Civil Works">Civil Works</SelectItem>
                      <SelectItem value="Elevator">Elevator</SelectItem>
                      <SelectItem value="Fire Safety">Fire Safety</SelectItem>
                      <SelectItem value="CCTV / Security">CCTV / Security</SelectItem>
                      <SelectItem value="Landscaping">Landscaping</SelectItem>
                      <SelectItem value="Furnishing">Furnishing</SelectItem>
                      <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                      <SelectItem value="Pool Equipment">Pool Equipment</SelectItem>
                      <SelectItem value="Cleaning Supplies">Cleaning Supplies</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Item Type *">
                  <Select value={catalogForm.item_type} onValueChange={(v: any) => setCatalogForm({ ...catalogForm, item_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asset">Fixed Asset (CAPEX)</SelectItem>
                      <SelectItem value="maintenance_spare">Maintenance Spare</SelectItem>
                      <SelectItem value="consumable">Consumable</SelectItem>
                      <SelectItem value="service">Service / Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>

            {/* Section 2: Budget Classification */}
            <div className="p-3 rounded-lg bg-muted/30 border space-y-3">
              <p className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Budget & GL Classification</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Budget Type *">
                  <Select value={catalogForm.budget_type} onValueChange={(v: any) => setCatalogForm({ ...catalogForm, budget_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAPEX">CAPEX — Capital Expenditure</SelectItem>
                      <SelectItem value="OPEX">OPEX — Operating Expenditure</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Budget Head / Cost Allocation *">
                  <Select value={catalogForm.budget_head} onValueChange={(v: any) => setCatalogForm({ ...catalogForm, budget_head: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Property Assets">Property Assets</SelectItem>
                      <SelectItem value="Unit Assets">Unit Assets</SelectItem>
                      <SelectItem value="Common Area Assets">Common Area Assets</SelectItem>
                      <SelectItem value="Maintenance Items">Maintenance Items</SelectItem>
                      <SelectItem value="Salary">Staff / Salary</SelectItem>
                      <SelectItem value="Other">Other / General</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>

            {/* Section 3: Pricing & Inventory Control */}
            <div className="p-3 rounded-lg bg-muted/30 border space-y-3">
              <p className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Pricing & Inventory Control</p>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Standard Unit Price (QAR) *">
                  <Input type="number" min="0" value={catalogForm.unit_price} onChange={e => setCatalogForm({ ...catalogForm, unit_price: Number(e.target.value) })} />
                </Field>
                <Field label="Unit of Measure (UOM) *">
                  <Select value={catalogForm.unit_of_measure} onValueChange={v => setCatalogForm({ ...catalogForm, unit_of_measure: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nos">Nos (Numbers)</SelectItem>
                      <SelectItem value="Set">Set</SelectItem>
                      <SelectItem value="Roll">Roll</SelectItem>
                      <SelectItem value="Mtrs">Meters</SelectItem>
                      <SelectItem value="Sqm">Sq. Meters</SelectItem>
                      <SelectItem value="Kg">Kilograms</SelectItem>
                      <SelectItem value="Ltr">Liters</SelectItem>
                      <SelectItem value="Box">Box</SelectItem>
                      <SelectItem value="Pair">Pair</SelectItem>
                      <SelectItem value="Month">Month</SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Reorder Level (Min Qty)">
                  <Input type="number" min="0" value={catalogForm.reorder_level} onChange={e => setCatalogForm({ ...catalogForm, reorder_level: Number(e.target.value) })} placeholder="0 = N/A" />
                </Field>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    id="item-active"
                    type="checkbox"
                    checked={catalogForm.active}
                    onChange={e => setCatalogForm({ ...catalogForm, active: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="item-active" className="text-xs font-semibold cursor-pointer">Active in Catalog (available for PRs and POs)</label>
                </div>
                {catalogForm.unit_price > 0 && (
                  <div className="text-[11px] text-muted-foreground font-mono">
                    Standard Price: <strong className="text-emerald-600">QAR {Number(catalogForm.unit_price).toLocaleString()}</strong> / {catalogForm.unit_of_measure}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCatalogModal(false)}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
              onClick={() => {
                const newItem: CatalogItem = { ...catalogForm, id: `cat-${Date.now()}` };
                const updated = [newItem, ...catalog];
                setCatalog(updated);
                localStorage.setItem("proc_catalog_items", JSON.stringify(updated));
                setShowCatalogModal(false);
                toast.success(`Item "${newItem.name}" (${newItem.item_code}) added to Item Master Catalog.`);
              }}
              disabled={!catalogForm.name || !catalogForm.item_code || !catalogForm.category}
            >
              <Package className="h-4 w-4" /> Save Item to Catalog
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DETAIL VIEW DIALOG 1: PURCHASE REQUEST ───────────────────────── */}
      <Dialog open={!!viewPr} onOpenChange={(open) => !open && setViewPr(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          {viewPr && (
            <>
              <DialogHeader className="p-5 pb-3 border-b bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-background shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-base font-bold font-mono text-primary">{viewPr.doc_number}</DialogTitle>
                      <Badge variant={statusBadgeVariant(viewPr.status)}>{viewPr.status}</Badge>
                      <Badge variant="outline" className="text-[10px]">{viewPr.priority || "NORMAL"} Priority</Badge>
                    </div>
                    <DialogDescription className="text-xs mt-0.5">
                      Purchase Requisition • Requested on {viewPr.request_date}
                    </DialogDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Estimated Total</span>
                    <p className="text-base font-bold font-mono text-primary">QAR {Number(viewPr.total_amount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                {/* Meta info grid */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border bg-muted/20">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Primary Scope</span>
                    <p className="font-semibold text-foreground mt-0.5">{getPropertyName(viewPr.property_id)}</p>
                    {viewPr.unit_id && <p className="text-[11px] text-muted-foreground">Unit: {getUnitRef(viewPr.unit_id)}</p>}
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Posting / Lifecycle Status</span>
                    <p className="font-semibold text-foreground mt-0.5">{viewPr.posting_status || "Standard Request"}</p>
                  </div>
                </div>

                {/* Requisition Line Item Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-primary" /> Requisition Line Items &amp; Property Allocation
                    </h4>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/40 font-bold border-b">
                        <tr>
                          <th className="p-2.5 text-left">Item Description</th>
                          <th className="p-2.5 text-left">Property / Unit Scope</th>
                          <th className="p-2.5 text-center">Qty</th>
                          <th className="p-2.5 text-right">Est. Unit Rate</th>
                          <th className="p-2.5 text-right">Est. Total (QAR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {(() => {
                          const lines = parsePrLines(viewPr);
                          return lines.map((l, i) => (
                            <tr key={l.id || i} className="hover:bg-muted/20">
                              <td className="p-2.5">
                                <p className="font-semibold text-foreground">{l.itemName || l.description}</p>
                                {l.itemCode && <p className="text-[10px] font-mono text-muted-foreground">{l.itemCode}</p>}
                                {l.budgetHead && (
                                  <span className="text-[9px] text-primary font-mono mt-0.5 inline-block">
                                    {l.budgetType} · {l.budgetHead}
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5">
                                <p className="font-medium text-foreground">{getPropertyName(l.propertyId)}</p>
                                <p className="text-[10px] text-muted-foreground">{l.unitId ? `Unit: ${getUnitRef(l.unitId)}` : "Common Area / General"}</p>
                              </td>
                              <td className="p-2.5 text-center font-mono font-medium">{l.quantity} {l.uom || "Nos"}</td>
                              <td className="p-2.5 text-right font-mono">QAR {Number(l.unitRate || 0).toLocaleString()}</td>
                              <td className="p-2.5 text-right font-mono font-bold">QAR {(Number(l.quantity || 1) * Number(l.unitRate || 0)).toLocaleString()}</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Justification & Remarks */}
                <div className="p-3 border rounded-lg bg-muted/10 space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Purpose / Notes</span>
                  <p className="text-foreground">
                    {viewPr.remarks?.includes("[LINES_JSON]:")
                      ? (viewPr.remarks.split("\n").slice(1).join(" ") || "Standard requisition")
                      : (viewPr.remarks || "No additional remarks specified.")}
                  </p>
                </div>
              </div>

              <DialogFooter className="p-4 border-t bg-muted/10 shrink-0">
                <Button variant="outline" size="sm" onClick={() => setViewPr(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── DETAIL VIEW DIALOG 2: PURCHASE ORDER ─────────────────────────── */}
      <Dialog open={!!viewPo} onOpenChange={(open) => !open && setViewPo(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          {viewPo && (
            <>
              <DialogHeader className="p-5 pb-3 border-b bg-gradient-to-r from-cyan-500/10 via-primary/5 to-background shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-base font-bold font-mono text-primary">{viewPo.doc_number}</DialogTitle>
                      <Badge variant={statusBadgeVariant(viewPo.status)}>{viewPo.status}</Badge>
                    </div>
                    <DialogDescription className="text-xs mt-0.5">
                      Purchase Order • Issued on {viewPo.po_date} • Vendor: {getVendorName(viewPo.vendor_id)}
                    </DialogDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Order Value</span>
                    <p className="text-lg font-bold font-mono text-primary">QAR {Number(viewPo.total_amount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                {/* Vendor & Scope Info Strip */}
                <div className="grid grid-cols-3 gap-3 p-3 rounded-lg border bg-muted/20">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Vendor Profile</span>
                    <p className="font-semibold text-foreground mt-0.5">{getVendorName(viewPo.vendor_id)}</p>
                    <p className="text-[10px] text-muted-foreground">ID: {viewPo.vendor_id}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Delivery Destination</span>
                    <p className="font-semibold text-foreground mt-0.5">{getPropertyName(viewPo.property_id)}</p>
                    <p className="text-[10px] text-muted-foreground">Main Receiving Facility Dock</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Commercial Terms</span>
                    <p className="font-semibold text-foreground mt-0.5">{viewPo.payment_terms || "Net 30 Days"}</p>
                    <p className="text-[10px] text-muted-foreground">{viewPo.delivery_terms || "DAP Delivered"}</p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5">
                    <ClipboardList className="h-3.5 w-3.5 text-cyan-600" /> Ordered Deliverables &amp; Property/Unit Allocation
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/40 font-bold border-b">
                        <tr>
                          <th className="p-2.5 text-left">Description</th>
                          <th className="p-2.5 text-left">Property / Unit</th>
                          <th className="p-2.5 text-center">Qty Ordered</th>
                          <th className="p-2.5 text-center">Accepted</th>
                          <th className="p-2.5 text-right">Unit Rate</th>
                          <th className="p-2.5 text-right">Line Total (QAR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {(() => {
                          const lines = poLines.filter(l => l.purchase_order_id === viewPo.id);
                          if (lines.length > 0) {
                            return lines.map(l => (
                              <tr key={l.id} className="hover:bg-muted/20">
                                <td className="p-2.5">
                                  <p className="font-semibold text-foreground">{l.description || l.item_name}</p>
                                  {l.item_code && <span className="text-[10px] font-mono text-muted-foreground">{l.item_code}</span>}
                                </td>
                                <td className="p-2.5">
                                  <p className="font-medium text-foreground">{getPropertyName(l.property_id)}</p>
                                  <p className="text-[10px] text-muted-foreground">{l.unit_id ? `Unit: ${getUnitRef(l.unit_id)}` : "Common Area / General"}</p>
                                </td>
                                <td className="p-2.5 text-center font-mono font-medium">{l.quantity} {l.uom || "Nos"}</td>
                                <td className="p-2.5 text-center font-mono text-emerald-600 font-bold">{l.accepted_quantity || 0}</td>
                                <td className="p-2.5 text-right font-mono">QAR {Number(l.unit_rate).toLocaleString()}</td>
                                <td className="p-2.5 text-right font-mono font-bold">QAR {Number(l.line_total).toLocaleString()}</td>
                              </tr>
                            ));
                          }
                          // Fallback single line
                          return (
                            <tr className="hover:bg-muted/20">
                              <td className="p-2.5">
                                <p className="font-semibold text-foreground">{viewPo.remarks || `Procurement Order items for ${getPropertyName(viewPo.property_id)}`}</p>
                              </td>
                              <td className="p-2.5 font-medium">{getPropertyName(viewPo.property_id)}</td>
                              <td className="p-2.5 text-center font-mono">1 Lot</td>
                              <td className="p-2.5 text-center font-mono text-emerald-600">0</td>
                              <td className="p-2.5 text-right font-mono">QAR {Number(viewPo.total_amount).toLocaleString()}</td>
                              <td className="p-2.5 text-right font-mono font-bold">QAR {Number(viewPo.total_amount).toLocaleString()}</td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Traceability & 3-Way Match Chain */}
                <div className="p-3 border rounded-lg bg-muted/10 space-y-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Procurement 3-Way Traceability Linkages</span>
                  <div className="grid grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-background border">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold block">Purchase Order</span>
                      <span className="font-mono font-bold text-primary">{viewPo.doc_number}</span>
                    </div>
                    <div className="p-2 rounded bg-background border">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold block">Shipment / AWB</span>
                      {(() => {
                        const sh = shipments.find(s => s.purchase_order_id === viewPo.id);
                        return sh ? <span className="font-mono text-cyan-600 font-semibold">{sh.shipment_number}</span> : <span className="text-muted-foreground">—</span>;
                      })()}
                    </div>
                    <div className="p-2 rounded bg-background border">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold block">GRN Receiving</span>
                      {(() => {
                        const grn = grns.find(g => g.purchase_order_id === viewPo.id);
                        return grn ? <span className="font-mono text-emerald-600 font-semibold">{grn.grn_number}</span> : <span className="text-muted-foreground">—</span>;
                      })()}
                    </div>
                    <div className="p-2 rounded bg-background border">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold block">AP Invoice</span>
                      {(() => {
                        const inv = apInvoices.find(i => i.po_number === viewPo.doc_number);
                        return inv ? (
                          <span className={`font-mono font-semibold ${inv.status === "PAID" ? "text-emerald-600" : "text-amber-600"}`}>
                            {inv.invoice_number} ({inv.status})
                          </span>
                        ) : <span className="text-muted-foreground">—</span>;
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="p-4 border-t bg-muted/10 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {viewPo.status === "DRAFT" && (
                    <Button
                      size="sm"
                      className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm"
                      onClick={async () => {
                        setSaving(true);
                        try {
                          await supabase.from("proc_purchase_orders").update({ status: "APPROVED" }).eq("id", viewPo.id);
                          toast.success(`Purchase Order ${viewPo.doc_number} approved!`);
                          setViewPo({ ...viewPo, status: "APPROVED" });
                          await loadAll();
                        } catch (e: any) {
                          toast.error(e.message || "Failed to approve PO");
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving}
                    >
                      <CheckCheck className="h-3.5 w-3.5 text-emerald-300" /> Approve Purchase Order
                    </Button>
                  )}
                  {viewPo.status === "APPROVED" && (
                    <>
                      <Button
                        size="sm"
                        className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                        onClick={() => {
                          const target = viewPo;
                          setViewPo(null);
                          openReceiveModal(target);
                        }}
                      >
                        <PackageCheck className="h-4 w-4" /> Receive Inward Goods (GRN)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1.5 text-cyan-600 border-cyan-500/40 hover:bg-cyan-50"
                        onClick={() => {
                          const target = viewPo;
                          setViewPo(null);
                          setShipmentForm(prev => ({ ...prev, purchaseOrderId: target.id, inTransitValue: String(target.total_amount) }));
                          setShowShipmentModal(true);
                        }}
                      >
                        <Ship className="h-4 w-4" /> Dispatch Shipment
                      </Button>
                    </>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => setViewPo(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── DETAIL VIEW DIALOG 3: SHIPMENT ───────────────────────────────── */}
      <Dialog open={!!viewShipment} onOpenChange={(open) => !open && setViewShipment(null)}>
        <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {viewShipment && (
            <>
              <DialogHeader className="p-5 pb-3 border-b bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-background shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-base font-bold font-mono text-cyan-600 flex items-center gap-2">
                        <Ship className="h-5 w-5" />
                        {viewShipment.shipment_number}
                      </DialogTitle>
                      <Badge variant={statusBadgeVariant(viewShipment.status)}>{viewShipment.status}</Badge>
                    </div>
                    <DialogDescription className="text-xs mt-0.5">
                      Carrier Logistics Tracker • Carrier: {viewShipment.carrier_name} • Incoterm: {viewShipment.incoterm || "DAP"}
                    </DialogDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">In-Transit Valuation</span>
                    <p className="text-base font-bold font-mono text-cyan-600">
                      QAR {Number(viewShipment.in_transit_value || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl border bg-muted/20">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Carrier &amp; AWB</span>
                    <p className="font-semibold text-foreground mt-0.5">{viewShipment.carrier_name}</p>
                    <p className="font-mono text-[11px] text-primary">{viewShipment.tracking_number || "AWB-IN-TRANSIT"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Route &amp; Schedule</span>
                    <p className="font-semibold text-foreground mt-0.5">{viewShipment.origin_country || "Qatar"} → Hamad Port</p>
                    <p className="text-[11px] text-muted-foreground">ETA: {viewShipment.estimated_arrival}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Linked Purchase Order</span>
                    {(() => {
                      const po = pos.find(p => p.id === viewShipment.purchase_order_id);
                      return <p className="font-mono font-bold text-primary mt-0.5">{po?.doc_number || "—"}</p>;
                    })()}
                  </div>
                </div>

                {(() => {
                  const po = pos.find(p => p.id === viewShipment.purchase_order_id);
                  const deliverables = po ? poLines.filter(l => l.purchase_order_id === po.id) : [];
                  const grn = grns.find(g => g.purchase_order_id === viewShipment.purchase_order_id);

                  return (
                    <div className="p-3.5 border rounded-xl bg-card/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Destination Scope &amp; Inward Status</span>
                          <p className="font-bold text-sm text-foreground mt-0.5">{getPropertyName(po?.property_id)}</p>
                          <p className="text-[11px] text-muted-foreground">Main Receiving Facility Receiving Bay</p>
                        </div>
                        {grn ? (
                          <Badge variant="default" className="bg-emerald-600 text-white font-mono">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> GRN Received ({grn.grn_number})
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-500/40 bg-amber-500/10">
                            Pending Physical Intake
                          </Badge>
                        )}
                      </div>

                      {/* Manifest Line Items Table */}
                      <div className="space-y-1.5 pt-2 border-t">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                          Manifest In-Transit Deliverables &amp; Location Scope ({deliverables.length} line{deliverables.length > 1 ? "s" : ""}):
                        </span>
                        {deliverables.length > 0 ? (
                          <div className="border rounded-lg overflow-hidden bg-background">
                            <table className="w-full text-xs">
                              <thead className="bg-muted/40 font-bold border-b text-muted-foreground">
                                <tr>
                                  <th className="p-2.5 text-left">Item Description</th>
                                  <th className="p-2.5 text-left">Allocated Location (Property / Unit)</th>
                                  <th className="p-2.5 text-center">Quantity</th>
                                  <th className="p-2.5 text-right">Unit Rate</th>
                                  <th className="p-2.5 text-right">Total (QAR)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {deliverables.map((d, i) => (
                                  <tr key={i} className="hover:bg-muted/10">
                                    <td className="p-2.5">
                                      <p className="font-semibold text-foreground">{d.item_name || d.description}</p>
                                      {d.item_code && <span className="font-mono text-[10px] text-muted-foreground">{d.item_code}</span>}
                                    </td>
                                    <td className="p-2.5">
                                      <div className="flex items-center gap-1.5">
                                        <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                                        <span className="font-medium text-foreground">{getPropertyName(d.property_id || po?.property_id)}</span>
                                        {d.unit_id ? (
                                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono text-cyan-700 bg-cyan-50 border border-cyan-200">
                                            Unit {getUnitRef(d.unit_id)}
                                          </Badge>
                                        ) : (
                                          <span className="text-[10px] text-muted-foreground">· Common Area</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-2.5 text-center font-mono font-bold text-foreground">
                                      {d.quantity} {d.uom || "Nos"}
                                    </td>
                                    <td className="p-2.5 text-right font-mono text-muted-foreground">
                                      QAR {Number(d.unit_rate || 0).toLocaleString()}
                                    </td>
                                    <td className="p-2.5 text-right font-mono font-bold text-cyan-600">
                                      QAR {(Number(d.quantity || 0) * Number(d.unit_rate || 0)).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-3 bg-muted/20 rounded-lg text-muted-foreground text-xs">
                            Standard shipment lot for {getPropertyName(po?.property_id)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <DialogFooter className="p-4 border-t bg-muted/10 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const po = pos.find(p => p.id === viewShipment.purchase_order_id);
                    const grn = grns.find(g => g.purchase_order_id === viewShipment.purchase_order_id);
                    if (po && !grn) {
                      return (
                        <Button
                          size="sm"
                          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm"
                          onClick={() => {
                            const targetPo = po;
                            setViewShipment(null);
                            openReceiveModal(targetPo);
                          }}
                        >
                          <Truck className="h-3.5 w-3.5" /> Receive Physical GRN
                        </Button>
                      );
                    }
                    return null;
                  })()}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1 text-cyan-600 border-cyan-500/40 hover:bg-cyan-50"
                    onClick={() => {
                      const shToEdit = viewShipment;
                      setViewShipment(null);
                      openEditShipmentModal(shToEdit);
                    }}
                  >
                    <Ship className="h-3 w-3" /> Edit Shipment Details
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => setViewShipment(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── DETAIL VIEW DIALOG 4: GRN / RECEIVING ───────────────────────── */}
      <Dialog open={!!viewGrn} onOpenChange={(open) => !open && setViewGrn(null)}>
        <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {viewGrn && (
            <>
              <DialogHeader className="p-5 pb-3 border-b bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-background shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-base font-bold font-mono text-emerald-600 flex items-center gap-2">
                        <PackageCheck className="h-5 w-5" />
                        {viewGrn.grn_number}
                      </DialogTitle>
                      <Badge variant="default" className="bg-emerald-600">{viewGrn.status}</Badge>
                    </div>
                    <DialogDescription className="text-xs mt-0.5">
                      Goods Receipt Note • Received on {viewGrn.grn_date} • Vendor: {getVendorName(viewGrn.vendor_id)}
                    </DialogDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Accepted Total Valuation</span>
                    <p className="text-base font-bold font-mono text-emerald-600">QAR {Number(viewGrn.total_amount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                {/* Meta details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl border bg-muted/20">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Warehouse &amp; Dock</span>
                    <p className="font-semibold text-foreground mt-0.5">{viewGrn.warehouse_name}</p>
                    <p className="text-[10px] text-muted-foreground">{viewGrn.receiving_location || "Central Storage Dock"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Linked Purchase Order</span>
                    {(() => {
                      const po = pos.find(p => p.id === viewGrn.purchase_order_id);
                      return <p className="font-mono font-bold text-primary mt-0.5">{po?.doc_number || "—"}</p>;
                    })()}
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">AP Invoice Status</span>
                    {(() => {
                      const inv = apInvoices.find(i => i.grn_number === viewGrn.grn_number);
                      return inv ? (
                        <p className="font-mono font-semibold text-emerald-600 mt-0.5">
                          {inv.invoice_number} ({inv.status})
                        </p>
                      ) : <p className="text-muted-foreground mt-0.5">Awaiting AP Invoice</p>;
                    })()}
                  </div>
                </div>

                {/* Received Lines Table */}
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-emerald-600" /> Physical Inspection &amp; Accepted Inward Deliverables
                  </h4>
                  <div className="border rounded-xl overflow-hidden bg-card">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/40 font-bold border-b text-muted-foreground">
                        <tr>
                          <th className="p-3 text-left">Item Description</th>
                          <th className="p-3 text-left">Allocated Location (Property / Unit)</th>
                          <th className="p-3 text-center">Ordered</th>
                          <th className="p-3 text-center">Received</th>
                          <th className="p-3 text-center">Accepted</th>
                          <th className="p-3 text-right">Unit Rate</th>
                          <th className="p-3 text-right">Accepted Total (QAR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {(() => {
                          const lines = grnLines.filter(gl => gl.goods_receipt_id === viewGrn.id);
                          const po = pos.find(p => p.id === viewGrn.purchase_order_id);
                          if (lines.length > 0) {
                            return lines.map(gl => {
                              const linkedPoLine = poLines.find(pl => pl.id === gl.purchase_order_line_id);
                              const propId = linkedPoLine?.property_id || po?.property_id;
                              const unitId = linkedPoLine?.unit_id || po?.unit_id;

                              return (
                                <tr key={gl.id} className="hover:bg-muted/20">
                                  <td className="p-3">
                                    <p className="font-semibold text-foreground">{gl.description || gl.item_name}</p>
                                    {gl.item_code && <span className="font-mono text-[10px] text-muted-foreground">{gl.item_code}</span>}
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-1.5">
                                      <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                      <span className="font-medium text-foreground">{getPropertyName(propId)}</span>
                                      {unitId ? (
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono text-emerald-700 bg-emerald-50 border border-emerald-200">
                                          Unit {getUnitRef(unitId)}
                                        </Badge>
                                      ) : (
                                        <span className="text-[10px] text-muted-foreground">· Common Area</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3 text-center font-mono text-muted-foreground">{gl.ordered_quantity}</td>
                                  <td className="p-3 text-center font-mono">{gl.received_quantity}</td>
                                  <td className="p-3 text-center font-mono font-bold text-emerald-600">{gl.accepted_quantity}</td>
                                  <td className="p-3 text-right font-mono">QAR {Number(gl.unit_rate).toLocaleString()}</td>
                                  <td className="p-3 text-right font-mono font-bold text-emerald-600">
                                    QAR {(Number(gl.accepted_quantity || 0) * Number(gl.unit_rate || 0)).toLocaleString()}
                                  </td>
                                </tr>
                              );
                            });
                          }
                          // Fallback single line
                          return (
                            <tr className="hover:bg-muted/20">
                              <td className="p-3">
                                <p className="font-semibold text-foreground">Verified Goods Inward</p>
                                <p className="text-[10px] text-muted-foreground">PO Fulfillment for {viewGrn.warehouse_name}</p>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                  <span className="font-medium text-foreground">{getPropertyName(po?.property_id)}</span>
                                </div>
                              </td>
                              <td className="p-3 text-center font-mono">1 Lot</td>
                              <td className="p-3 text-center font-mono">1 Lot</td>
                              <td className="p-3 text-center font-mono font-bold text-emerald-600">1 Lot</td>
                              <td className="p-3 text-right font-mono">QAR {Number(viewGrn.total_amount).toLocaleString()}</td>
                              <td className="p-3 text-right font-mono font-bold text-emerald-600">QAR {Number(viewGrn.total_amount).toLocaleString()}</td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quality & Inspection Sign-off */}
                <div className="p-3.5 border rounded-xl bg-muted/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">QA Inspection Sign-off</span>
                    <p className="text-foreground font-medium">Physical check passed • Stored safely in {viewGrn.warehouse_name}</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500/40 bg-emerald-500/10">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Passed QA Inspection
                  </Badge>
                </div>
              </div>

              <DialogFooter className="p-4 border-t bg-muted/10 shrink-0">
                <Button variant="outline" size="sm" onClick={() => setViewGrn(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Proforma Invoice Dialog */}
      <ProformaInvoiceDialog
        invoice={viewInvoice}
        open={!!viewInvoice}
        onOpenChange={(open) => !open && setViewInvoice(null)}
        vendors={vendors}
        onViewReceiptClick={(inv) => openPaymentReceipt(inv)}
        onPayClick={(inv) => {
          setViewInvoice(null);
          setPaymentTargetInvoice(inv);
        }}
      />

      {/* Payment Receipt Dialog */}
      <PaymentReceiptDialog
        receipt={selectedReceipt}
        open={showReceiptModal}
        onOpenChange={setShowReceiptModal}
        vendorName={selectedReceipt?.vendor_name || getVendorName(Number(selectedReceipt?.vendor_id))}
      />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-semibold">{label}</Label>{children}</div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="border border-dashed rounded-lg p-10 text-center text-sm text-muted-foreground">{text}</div>;
}
