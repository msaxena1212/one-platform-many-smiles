import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
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
  CreditCard, Ship, DollarSign, Star, Pencil, Trash2, Send, CheckCheck
} from "lucide-react";
import { fetchProperties, fetchUnits, type Property, type Unit } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { FinVendorsApi, type FinVendor } from "@/lib/supabase-finance";
import { nextProcurementDocumentNumber } from "@/lib/procurement/numbering";

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
  { group: "Operations", icon: ClipboardList, color: "text-cyan-400", items: [
    { key: "requests", label: "Purchase Requests", icon: ShoppingCart },
    { key: "orders", label: "Purchase Orders", icon: ClipboardList },
    { key: "receiving", label: "GRN / Receiving", icon: Truck },
  ]},
  { group: "Vendor & Sourcing", icon: Users, color: "text-violet-400", items: [
    { key: "vendors", label: "Vendors", icon: Users },
    { key: "rfx", label: "RFX / Tenders", icon: Database },
    { key: "quotations", label: "Quotations", icon: Star },
  ]},
  { group: "Approvals & Invoices", icon: Inbox, color: "text-amber-400", items: [
    { key: "inbox", label: "Approval Inbox", icon: Inbox },
    { key: "shipments", label: "Shipments", icon: Ship },
  ]},
  { group: "Control Tower", icon: BarChart3, color: "text-rose-400", items: [
    { key: "dashboard", label: "Analytics Dashboard", icon: BarChart3 },
    { key: "supplier_perf", label: "Supplier Performance", icon: TrendingUp },
  ]},
  { group: "Integration & Masters", icon: Link2, color: "text-orange-400", items: [
    { key: "assets", label: "Asset Linkage", icon: Link2 },
    { key: "maintenance", label: "Maintenance Stock", icon: Wrench },
    { key: "catalog", label: "Item Catalog", icon: Package },
  ]},
] as const;

function statusBadgeVariant(s: string): "default" | "destructive" | "secondary" | "outline" {
  if (["APPROVED", "COMPLETED", "PAID", "POSTED", "CLOSED"].includes(s)) return "default";
  if (["REJECTED", "CANCELLED", "OVERDUE"].includes(s)) return "destructive";
  if (["SUBMITTED", "IN_PROGRESS", "ALERTED", "RECEIVED"].includes(s)) return "secondary";
  return "outline";
}

// ─────────────────────────────────────────────────────────────────────────────
export function ProcurementModule({ role }: { role: "admin" | "prop-mgr" }) {
  const routerSearch = useRouterState({ select: (s) => s.location.search }) as Record<string, any>;
  const activeTab = typeof routerSearch?.tab === "string" ? routerSearch.tab : "requests";

  // Data state
  const [prs, setPrs] = useState<PurchaseRequest[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [poLines, setPoLines] = useState<PurchaseOrderLine[]>([]);
  const [grns, setGrns] = useState<GoodsReceipt[]>([]);
  const [grnLines, setGrnLines] = useState<GoodsReceiptLine[]>([]);
  const [vendors, setVendors] = useState<FinVendor[]>([]);
  const [rfxList, setRfxList] = useState<any[]>([]);
  const [quoteList, setQuoteList] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>(defaultCatalogItems);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [inventoryParts, setInventoryParts] = useState<any[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // Dialogs
  const [showNewPR, setShowNewPR] = useState(false);
  const [showNewPO, setShowNewPO] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showNewRFX, setShowNewRFX] = useState(false);
  const [showNewQuote, setShowNewQuote] = useState(false);

  // Selected for actions
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [receiveInput, setReceiveInput] = useState<Record<string, { received: number; accepted: number; rejected: number }>>({});
  // Item Search in PR and PO Dialogs
  const [itemSearchPR, setItemSearchPR] = useState("");
  const [itemSearchPO, setItemSearchPO] = useState("");

  const filteredCatalogPR = useMemo(() => {
    if (!itemSearchPR.trim()) return catalog;
    const q = itemSearchPR.toLowerCase();
    return catalog.filter(it =>
      (it.name || "").toLowerCase().includes(q) ||
      (it.item_code || "").toLowerCase().includes(q) ||
      (it.category || "").toLowerCase().includes(q)
    );
  }, [catalog, itemSearchPR]);

  const filteredCatalogPO = useMemo(() => {
    if (!itemSearchPO.trim()) return catalog;
    const q = itemSearchPO.toLowerCase();
    return catalog.filter(it =>
      (it.name || "").toLowerCase().includes(q) ||
      (it.item_code || "").toLowerCase().includes(q) ||
      (it.category || "").toLowerCase().includes(q)
    );
  }, [catalog, itemSearchPO]);

  // Form states
  const [prForm, setPrForm] = useState({
    itemId: "",
    itemName: "",
    itemCode: "",
    budgetType: "OPEX" as "CAPEX" | "OPEX",
    budgetHead: "Maintenance Items" as BudgetHead,
    priority: "NORMAL",
    quantity: "1",
    unitRate: "0",
    propertyId: "",
    unitId: "",
    remarks: ""
  });

  const [poForm, setPoForm] = useState({
    vendorId: "",
    itemId: "",
    itemName: "",
    itemCode: "",
    budgetType: "OPEX" as "CAPEX" | "OPEX",
    budgetHead: "Maintenance Items" as BudgetHead,
    propertyId: "",
    unitId: "",
    orderDate: new Date().toISOString().slice(0, 10),
    deliveryDate: "",
    paymentTerms: "30 Days",
    deliveryTerms: "Standard Delivery",
    remarks: "",
    lineQuantity: "1",
    lineRate: "0"
  });

  const [vendorForm, setVendorForm] = useState({
    code: "",
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    tax_number: "",
    status: "Active" as "Active" | "Inactive"
  });

  const [catalogForm, setCatalogForm] = useState({
    item_code: "",
    name: "",
    category: "General",
    item_type: "maintenance_spare" as ItemType,
    budget_type: "OPEX" as "CAPEX" | "OPEX",
    budget_head: "Maintenance Items" as BudgetHead,
    unit_price: "0",
    unit_of_measure: "Nos",
    reorder_level: "10"
  });

  const [shipmentForm, setShipmentForm] = useState({
    purchaseOrderId: "",
    blAwbNo: "",
    incoterm: "CIF",
    originCountry: "Qatar",
    eta: "",
    goodsInTransitAmount: "0",
    remarks: ""
  });

  const [rfxForm, setRfxForm] = useState({
    prId: "",
    rfxType: "RFQ",
    remarks: ""
  });

  const [quoteForm, setQuoteForm] = useState({
    rfxId: "",
    vendorId: "",
    amount: "0",
    taxAmount: "0",
    remarks: ""
  });

  // ── Load All Data ──────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        pRes, uRes, vRes, prRes, poRes, polRes, grnRes, grnlRes, rfxRes, vqRes, shRes, invRes
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
      ]);

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
      setShipments(shRes.data || []);
      setInventoryParts(invRes.data || []);
    } catch (e: any) {
      console.error("Error loading procurement data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Helper Lookup ─────────────────────────────────────────────────────────
  function getVendorName(vendorId?: number | null) {
    if (!vendorId) return "—";
    const v = vendors.find(x => Number(x.id) === Number(vendorId) || x.code === String(vendorId));
    return v ? v.name : `Vendor #${vendorId}`;
  }

  function getPropertyName(propertyId?: string | null) {
    if (!propertyId) return "Company / General Pool";
    const p = properties.find(x => x.id === propertyId);
    return p ? p.title : "Property";
  }

  function handleSelectItemForPR(itemId: string) {
    const item = catalog.find(c => c.id === itemId);
    if (!item) return;
    setPrForm(prev => ({
      ...prev,
      itemId: item.id,
      itemName: item.name,
      itemCode: item.item_code,
      unitRate: String(item.unit_price || 0),
      budgetType: item.budget_type,
      budgetHead: item.budget_head
    }));
  }

  function handleSelectItemForPO(itemId: string) {
    const item = catalog.find(c => c.id === itemId);
    if (!item) return;
    setPoForm(prev => ({
      ...prev,
      itemId: item.id,
      itemName: item.name,
      itemCode: item.item_code,
      lineRate: String(item.unit_price || 0),
      budgetType: item.budget_type,
      budgetHead: item.budget_head
    }));
  }

  // ── Operations Actions ────────────────────────────────────────────────────
  async function handleCreatePR() {
    if (!prForm.propertyId) return toast.error("Property is mandatory. Please select a property.");
    if (!prForm.itemName.trim()) return toast.error("Please select an item from the Item Master.");

    const qty = Number(prForm.quantity) || 1;
    const rate = Number(prForm.unitRate) || 0;
    const total = qty * rate;

    setSaving(true);
    try {
      let docNumber = "PR-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-6);
      try {
        docNumber = await nextProcurementDocumentNumber("PR");
      } catch {}

      const formattedRemarks = [
        `[Budget Head: ${prForm.budgetHead}]`,
        `[Budget Type: ${prForm.budgetType}]`,
        prForm.remarks
      ].filter(Boolean).join(" ");

      const { data: pr, error: prErr } = await supabase.from("proc_purchase_requests").insert({
        doc_number: docNumber,
        request_date: new Date().toISOString().slice(0, 10),
        status: "DRAFT",
        posting_status: "UNPOSTED",
        priority: prForm.priority,
        property_id: prForm.propertyId,
        unit_id: prForm.unitId || null,
        total_amount: total,
        remarks: formattedRemarks
      }).select().single();

      if (prErr) throw prErr;

      // Add line item with schema-matching columns (line_total is auto-generated by database)
      const { error: lineErr } = await supabase.from("proc_purchase_request_lines").insert({
        purchase_request_id: pr.id,
        line_no: 1,
        item_code: prForm.itemCode || null,
        item_name: prForm.itemName,
        description: prForm.itemName,
        item_type: prForm.budgetType,
        quantity: qty,
        estimated_unit_rate: rate,
        property_id: prForm.propertyId,
        unit_id: prForm.unitId || null,
        remarks: formattedRemarks
      });

      if (lineErr) throw lineErr;

      toast.success(`Purchase Request ${docNumber} created successfully.`);
      setShowNewPR(false);
      setPrForm({ itemId: "", itemName: "", itemCode: "", budgetType: "OPEX", budgetHead: "Maintenance Items", priority: "NORMAL", quantity: "1", unitRate: "0", propertyId: "", unitId: "", remarks: "" });
      await loadAll();
    } catch (e: any) {
      toast.error(`Failed to create PR: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitPR(pr: PurchaseRequest) {
    setSaving(true);
    try {
      const { error } = await supabase.from("proc_purchase_requests").update({
        status: "SUBMITTED",
        updated_at: new Date().toISOString()
      }).eq("id", pr.id);

      if (error) throw error;
      toast.success(`PR ${pr.doc_number} submitted for approval.`);
      await loadAll();
    } catch (e: any) {
      toast.error(`Submit failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleApprovePR(pr: PurchaseRequest) {
    setSaving(true);
    try {
      const { error } = await supabase.from("proc_purchase_requests").update({
        status: "APPROVED",
        updated_at: new Date().toISOString()
      }).eq("id", pr.id);

      if (error) throw error;
      toast.success(`PR ${pr.doc_number} approved.`);
      await loadAll();
    } catch (e: any) {
      toast.error(`Approval failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreatePO() {
    if (!poForm.vendorId) return toast.error("Please select a vendor.");
    if (!poForm.propertyId) return toast.error("Property is mandatory. Please select a property.");
    if (!poForm.itemName.trim()) return toast.error("Please select an item from the Item Master.");

    const qty = Number(poForm.lineQuantity) || 1;
    const rate = Number(poForm.lineRate) || 0;
    const subtotal = qty * rate;
    const tax = subtotal * 0.05; // 5% standard vat/tax
    const total = subtotal + tax;

    setSaving(true);
    try {
      let docNumber = "PO-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-6);
      try {
        docNumber = await nextProcurementDocumentNumber("PO");
      } catch {}

      const formattedRemarks = [
        `[Budget Head: ${poForm.budgetHead}]`,
        `[Budget Type: ${poForm.budgetType}]`,
        poForm.remarks
      ].filter(Boolean).join(" ");

      const { data: po, error: poErr } = await supabase.from("proc_purchase_orders").insert({
        doc_number: docNumber,
        po_date: poForm.orderDate || new Date().toISOString().slice(0, 10),
        vendor_id: Number(poForm.vendorId),
        property_id: poForm.propertyId,
        unit_id: poForm.unitId || null,
        delivery_date: poForm.deliveryDate || null,
        payment_terms: poForm.paymentTerms,
        delivery_terms: poForm.deliveryTerms,
        status: "APPROVED",
        posting_status: "UNPOSTED",
        subtotal: subtotal,
        tax_amount: tax,
        discount_amount: 0,
        total_amount: total,
        remarks: formattedRemarks
      }).select().single();

      if (poErr) throw poErr;

      // Add PO line with item_name and schema attributes
      const { error: polErr } = await supabase.from("proc_purchase_order_lines").insert({
        purchase_order_id: po.id,
        line_no: 1,
        item_code: poForm.itemCode || null,
        item_name: poForm.itemName,
        description: poForm.itemName,
        item_type: poForm.budgetType,
        quantity: qty,
        unit_rate: rate,
        ordered_quantity: qty,
        received_quantity: 0,
        accepted_quantity: 0,
        rejected_quantity: 0,
        property_id: poForm.propertyId,
        unit_id: poForm.unitId || null,
        remarks: formattedRemarks
      });

      if (polErr) throw polErr;

      toast.success(`Purchase Order ${docNumber} created.`);
      setShowNewPO(false);
      setPoForm({ vendorId: "", itemId: "", itemName: "", itemCode: "", budgetType: "OPEX", budgetHead: "Maintenance Items", propertyId: "", unitId: "", orderDate: new Date().toISOString().slice(0, 10), deliveryDate: "", paymentTerms: "30 Days", deliveryTerms: "Standard Delivery", remarks: "", lineQuantity: "1", lineRate: "0" });
      await loadAll();
    } catch (e: any) {
      toast.error(`Failed to create PO: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleApprovePO(po: PurchaseOrder) {
    setSaving(true);
    try {
      const { error } = await supabase.from("proc_purchase_orders").update({
        status: "APPROVED",
        approved_at: new Date().toISOString()
      }).eq("id", po.id);

      if (error) throw error;
      toast.success(`PO ${po.doc_number} approved.`);
      await loadAll();
    } catch (e: any) {
      toast.error(`PO Approval failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  function openReceiveModal(po: PurchaseOrder) {
    setSelectedPO(po);
    const relatedLines = poLines.filter(l => l.purchase_order_id === po.id);
    const initialInputs: Record<string, { received: number; accepted: number; rejected: number }> = {};

    if (relatedLines.length > 0) {
      relatedLines.forEach(l => {
        const remaining = Math.max(0, Number(l.quantity || 1) - Number(l.received_quantity || 0));
        initialInputs[l.id] = {
          received: remaining,
          accepted: remaining,
          rejected: 0
        };
      });
    } else {
      // Create fallback synthetic line key if lines were created in an earlier session without lines table
      initialInputs["fallback-line"] = {
        received: 1,
        accepted: 1,
        rejected: 0
      };
    }

    setReceiveInput(initialInputs);
    setShowReceive(true);
  }

  async function handlePostGRN() {
    if (!selectedPO) return;
    let linesToProcess = poLines.filter(l => l.purchase_order_id === selectedPO.id);

    setSaving(true);
    try {
      let docNumber = "GRN-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-6);
      try {
        docNumber = await nextProcurementDocumentNumber("GRN");
      } catch {}

      // If legacy PO had no lines row, synthesize one so GRN succeeds
      if (!linesToProcess.length) {
        const { data: newLine } = await supabase.from("proc_purchase_order_lines").insert({
          purchase_order_id: selectedPO.id,
          line_no: 1,
          item_name: `PO Order ${selectedPO.doc_number}`,
          description: selectedPO.remarks || `Order ${selectedPO.doc_number}`,
          item_type: "OPEX",
          quantity: 1,
          unit_rate: Number(selectedPO.subtotal || selectedPO.total_amount || 0)
        }).select().single();

        if (newLine) {
          linesToProcess = [newLine as any];
          receiveInput[newLine.id] = { received: 1, accepted: 1, rejected: 0 };
        }
      }

      const totalAccepted = linesToProcess.reduce((sum, l) => {
        const inp = receiveInput[l.id] || { accepted: 1 };
        return sum + (inp.accepted * Number(l.unit_rate || 0));
      }, 0) || Number(selectedPO.total_amount || 0);

      const { data: grn, error: grnErr } = await supabase.from("proc_goods_receipts").insert({
        grn_number: docNumber,
        purchase_order_id: selectedPO.id,
        vendor_id: selectedPO.vendor_id,
        grn_date: new Date().toISOString().slice(0, 10),
        warehouse_name: "Main Facility Stores",
        receiving_location: "Dock 1",
        status: "APPROVED",
        posting_status: "UNPOSTED",
        subtotal: totalAccepted,
        total_amount: totalAccepted,
        remarks: `Received against ${selectedPO.doc_number}`
      }).select().single();

      if (grnErr) throw grnErr;

      // Insert GRN lines & update PO line received counts
      for (const line of linesToProcess) {
        const inp = receiveInput[line.id] || { received: 1, accepted: 1, rejected: 0 };
        if (inp.received > 0) {
          await supabase.from("proc_grn_lines").insert({
            goods_receipt_id: grn.id,
            purchase_order_line_id: line.id,
            line_no: line.line_no || 1,
            item_name: line.item_name || line.description || "Procured Item",
            description: line.description || "Procured Item",
            ordered_quantity: line.quantity || 1,
            received_quantity: inp.received,
            accepted_quantity: inp.accepted,
            rejected_quantity: inp.rejected,
            unit_rate: line.unit_rate || 0,
            accepted_amount: inp.accepted * Number(line.unit_rate || 0),
            remarks: "GRN accepted"
          });

          await supabase.from("proc_purchase_order_lines").update({
            received_quantity: Number(line.received_quantity || 0) + inp.received,
            accepted_quantity: Number(line.accepted_quantity || 0) + inp.accepted,
            rejected_quantity: Number(line.rejected_quantity || 0) + inp.rejected
          }).eq("id", line.id);
        }
      }

      // Mark PO as CLOSED if fully received
      await supabase.from("proc_purchase_orders").update({
        status: "CLOSED",
        updated_at: new Date().toISOString()
      }).eq("id", selectedPO.id);

      toast.success(`GRN ${docNumber} posted successfully.`);
      setShowReceive(false);
      setSelectedPO(null);
      await loadAll();
    } catch (e: any) {
      toast.error(`Failed to post GRN: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  // ── Vendor Actions ────────────────────────────────────────────────────────
  function openNewVendor() {
    setEditVendor(null);
    setVendorForm({ code: "VEND-" + String(Date.now()).slice(-4), name: "", contact_person: "", email: "", phone: "", tax_number: "", status: "Active" });
    setShowVendorModal(true);
  }

  function openEditVendor(v: FinVendor) {
    setEditVendor(v);
    setVendorForm({ code: v.code, name: v.name, contact_person: v.contact_person || "", email: v.email || "", phone: v.phone || "", tax_number: v.tax_number || "", status: v.status });
    setShowVendorModal(true);
  }

  async function handleSaveVendor() {
    if (!vendorForm.code.trim() || !vendorForm.name.trim()) return toast.error("Vendor Code & Name are required.");
    setSaving(true);
    try {
      if (editVendor) {
        await FinVendorsApi.update(editVendor.id, vendorForm);
        toast.success("Vendor updated successfully.");
      } else {
        await FinVendorsApi.create(vendorForm as any);
        toast.success("Vendor created successfully.");
      }
      setShowVendorModal(false);
      setEditVendor(null);
      await loadAll();
    } catch (e: any) {
      toast.error(`Vendor save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteVendor(v: FinVendor) {
    if (!confirm(`Are you sure you want to delete vendor "${v.name}"?`)) return;
    setSaving(true);
    try {
      await FinVendorsApi.delete(v.id);
      toast.success("Vendor deleted.");
      await loadAll();
    } catch (e: any) {
      toast.error(`Delete failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  // ── Sourcing & Logistics Actions ──────────────────────────────────────────
  async function handleCreateRFX() {
    if (!rfxForm.prId) return toast.error("Please select a Purchase Request.");
    setSaving(true);
    try {
      let docNumber = (rfxForm.rfxType || "RFQ") + "-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-6);
      try {
        docNumber = await nextProcurementDocumentNumber(rfxForm.rfxType || "RFQ");
      } catch {}

      const selectedPR = prs.find(p => p.id === rfxForm.prId);
      const title = `${rfxForm.rfxType || "RFQ"} Tender for ${selectedPR?.doc_number || "Procurement"}`;

      const { error } = await supabase.from("proc_rfx").insert({
        doc_number: docNumber,
        rfx_type: rfxForm.rfxType,
        title: title,
        description: rfxForm.remarks || title,
        purchase_request_id: rfxForm.prId,
        property_id: selectedPR?.property_id || null,
        total_estimated_amount: Number(selectedPR?.total_amount || 0),
        issue_date: new Date().toISOString().slice(0, 10),
        status: "DRAFT",
        remarks: rfxForm.remarks || null
      });

      if (error) throw error;
      toast.success(`RFX ${docNumber} created successfully.`);
      setShowNewRFX(false);
      setRfxForm({ prId: "", rfxType: "RFQ", remarks: "" });
      await loadAll();
    } catch (e: any) {
      toast.error(`Failed to create RFX: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateQuote() {
    if (!quoteForm.rfxId) return toast.error("Please select an RFX.");
    if (!quoteForm.vendorId) return toast.error("Please select a Vendor.");
    const total = Number(quoteForm.amount) || 0;
    const tax = Number(quoteForm.taxAmount) || 0;

    setSaving(true);
    try {
      let docNumber = "QT-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-6);
      try {
        docNumber = await nextProcurementDocumentNumber("QT");
      } catch {}

      const { error } = await supabase.from("proc_vendor_quotes").insert({
        quote_number: docNumber,
        doc_number: docNumber,
        rfx_id: quoteForm.rfxId,
        vendor_id: Number(quoteForm.vendorId),
        quote_date: new Date().toISOString().slice(0, 10),
        total_amount: total + tax,
        tax_amount: tax,
        discount_amount: 0,
        status: "DRAFT",
        posting_status: "UNPOSTED",
        is_selected: false,
        remarks: quoteForm.remarks || null
      });

      if (error) throw error;
      toast.success(`Vendor Quote ${docNumber} logged.`);
      setShowNewQuote(false);
      setQuoteForm({ rfxId: "", vendorId: "", amount: "0", taxAmount: "0", remarks: "" });
      await loadAll();
    } catch (e: any) {
      toast.error(`Failed to log quote: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateShipment() {
    if (!shipmentForm.purchaseOrderId) return toast.error("Please select a Purchase Order.");
    setSaving(true);
    try {
      let docNumber = "SH-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-6);
      try {
        docNumber = await nextProcurementDocumentNumber("SH");
      } catch {}

      const { error } = await supabase.from("proc_shipments").insert({
        shipment_number: docNumber,
        doc_number: docNumber,
        purchase_order_id: shipmentForm.purchaseOrderId,
        status: "ALERTED",
        bl_awb_no: shipmentForm.blAwbNo || null,
        incoterm: shipmentForm.incoterm || "CIF",
        origin_country: shipmentForm.originCountry || "Qatar",
        eta: shipmentForm.eta || null,
        goods_in_transit_amount: Number(shipmentForm.goodsInTransitAmount || 0),
        remarks: shipmentForm.remarks || null
      });

      if (error) throw error;
      toast.success(`Shipment ${docNumber} created.`);
      setShowShipmentModal(false);
      setShipmentForm({ purchaseOrderId: "", blAwbNo: "", incoterm: "CIF", originCountry: "Qatar", eta: "", goodsInTransitAmount: "0", remarks: "" });
      await loadAll();
    } catch (e: any) {
      toast.error(`Failed to create shipment: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  // ── Catalog Actions ───────────────────────────────────────────────────────
  function handleAddCatalogItem() {
    if (!catalogForm.name.trim() || !catalogForm.item_code.trim()) return toast.error("Code and Name are required.");
    const newItem: CatalogItem = {
      id: "cat-" + Date.now(),
      item_code: catalogForm.item_code,
      name: catalogForm.name,
      category: catalogForm.category,
      item_type: catalogForm.item_type,
      budget_type: catalogForm.budget_type,
      budget_head: catalogForm.budget_head,
      unit_price: Number(catalogForm.unit_price) || 0,
      unit_of_measure: catalogForm.unit_of_measure,
      reorder_level: Number(catalogForm.reorder_level) || 0,
      active: true
    };
    setCatalog(prev => [newItem, ...prev]);
    toast.success(`Item ${newItem.name} added to catalog.`);
    setShowCatalogModal(false);
  }

  // ── Active Tab Title ──────────────────────────────────────────────────────
  const activeNavLabel = PROC_NAV.flatMap(g => g.items as readonly { key: string; label: string; icon: any }[]).find(i => i.key === activeTab)?.label ?? "Procurement";

  // KPIs
  const totalSpend = pos.reduce((s, p) => s + Number(p.total_amount || 0), 0);
  const openPosCount = pos.filter(p => ["SUBMITTED", "APPROVED"].includes(p.status)).length;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      {/* ── Main Workspace ──────────────────────────────────── */}
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
                <Plus className="mr-2 h-4 w-4" /> New Request
              </Button>
            )}
            {activeTab === "orders" && (
              <Button size="sm" onClick={() => setShowNewPO(true)}>
                <ShoppingCart className="mr-2 h-4 w-4" /> New Purchase Order
              </Button>
            )}
            {activeTab === "vendors" && (
              <Button size="sm" onClick={openNewVendor}>
                <Plus className="mr-2 h-4 w-4" /> New Vendor
              </Button>
            )}
            {activeTab === "catalog" && (
              <Button size="sm" onClick={() => setShowCatalogModal(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
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
              <Button size="sm" onClick={() => setShowShipmentModal(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Shipment
              </Button>
            )}
          </div>
        </div>

        {/* Global KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            ["Purchase Requests", prs.length, ShoppingCart, "text-blue-500"],
            ["Purchase Orders", pos.length, ClipboardList, "text-cyan-500"],
            ["GRNs Received", grns.length, Truck, "text-emerald-500"],
            ["Active Vendors", vendors.length, Users, "text-violet-500"],
            ["Total PO Spend", `QAR ${totalSpend.toLocaleString()}`, DollarSign, "text-amber-500"],
          ].map(([label, val, Icon, color]: any) => (
            <Card key={label} className="bg-card/50">
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

        {/* ── TAB 1: PURCHASE REQUESTS ────────────────────────────────────────── */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            {prs.length === 0 ? (
              <EmptyState text="No Purchase Requests recorded yet. Click 'New Request' to create one." />
            ) : (
              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 text-xs">
                      <TableHead className="font-bold">Doc #</TableHead>
                      <TableHead className="font-bold">Date</TableHead>
                      <TableHead className="font-bold">Priority</TableHead>
                      <TableHead className="font-bold">Property / Scope</TableHead>
                      <TableHead className="font-bold text-right">Total Amount</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prs.map(pr => (
                      <TableRow key={pr.id} className="text-xs hover:bg-muted/30">
                        <TableCell className="font-mono font-bold text-primary">{pr.doc_number}</TableCell>
                        <TableCell>{pr.request_date}</TableCell>
                        <TableCell><Badge variant="outline">{pr.priority || "NORMAL"}</Badge></TableCell>
                        <TableCell>{getPropertyName(pr.property_id)}</TableCell>
                        <TableCell className="text-right font-semibold">QAR {Number(pr.total_amount || 0).toLocaleString()}</TableCell>
                        <TableCell><Badge variant={statusBadgeVariant(pr.status)}>{pr.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            {pr.status === "DRAFT" && (
                              <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" onClick={() => handleSubmitPR(pr)} disabled={saving}>
                                <ArrowUpRight className="h-3 w-3" /> Submit for Approval
                              </Button>
                            )}
                            {pr.status === "SUBMITTED" && (
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleApprovePR(pr)} disabled={saving}>
                                <CheckCheck className="mr-1 h-3.5 w-3.5 text-emerald-500" /> Approve
                              </Button>
                            )}
                            {pr.status === "APPROVED" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs gap-1"
                                  onClick={() => {
                                    setRfxForm(prev => ({ ...prev, prId: pr.id }));
                                    setShowNewRFX(true);
                                  }}
                                >
                                  <Database className="h-3 w-3" /> Create RFX
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-7 text-xs gap-1"
                                  onClick={() => {
                                    setPoForm(prev => ({
                                      ...prev,
                                      propertyId: pr.property_id || "",
                                      unitId: pr.unit_id || "",
                                      lineDescription: `Requisition ${pr.doc_number}`,
                                      lineRate: String(pr.total_amount || 0)
                                    }));
                                    setShowNewPO(true);
                                  }}
                                >
                                  <ShoppingCart className="h-3 w-3" /> Issue PO
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
                      <TableHead className="font-bold">PO Number</TableHead>
                      <TableHead className="font-bold">PO Date</TableHead>
                      <TableHead className="font-bold">Vendor</TableHead>
                      <TableHead className="font-bold">Property</TableHead>
                      <TableHead className="font-bold text-right">Total (QAR)</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pos.map(po => (
                      <TableRow key={po.id} className="text-xs hover:bg-muted/30">
                        <TableCell className="font-mono font-bold text-primary">{po.doc_number}</TableCell>
                        <TableCell>{po.po_date}</TableCell>
                        <TableCell className="font-semibold">{getVendorName(po.vendor_id)}</TableCell>
                        <TableCell>{getPropertyName(po.property_id)}</TableCell>
                        <TableCell className="text-right font-semibold">{Number(po.total_amount).toLocaleString()}</TableCell>
                        <TableCell><Badge variant={statusBadgeVariant(po.status)}>{po.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            {po.status === "SUBMITTED" && (
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleApprovePO(po)} disabled={saving}>
                                Approve
                              </Button>
                            )}
                            {["APPROVED", "SUBMITTED"].includes(po.status) && (
                              <Button size="sm" className="h-7 text-xs gap-1" onClick={() => openReceiveModal(po)}>
                                <Truck className="h-3 w-3" /> Receive
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
                      <TableHead className="font-bold">GRN Number</TableHead>
                      <TableHead className="font-bold">Date</TableHead>
                      <TableHead className="font-bold">Vendor</TableHead>
                      <TableHead className="font-bold">Warehouse / Dock</TableHead>
                      <TableHead className="font-bold text-right">Accepted Total (QAR)</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grns.map(g => (
                      <TableRow key={g.id} className="text-xs hover:bg-muted/30">
                        <TableCell className="font-mono font-bold text-emerald-500">{g.grn_number}</TableCell>
                        <TableCell>{g.grn_date}</TableCell>
                        <TableCell className="font-semibold">{getVendorName(g.vendor_id)}</TableCell>
                        <TableCell>{g.warehouse_name} ({g.receiving_location})</TableCell>
                        <TableCell className="text-right font-semibold">{Number(g.total_amount || 0).toLocaleString()}</TableCell>
                        <TableCell><Badge variant="default">{g.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: VENDORS (SOURCE OF TRUTH) ────────────────────────────────── */}
        {activeTab === "vendors" && (
          <div className="space-y-4">
            <div className="rounded-md border border-cyan-200 bg-cyan-50 dark:bg-cyan-950/20 dark:border-cyan-900 p-3 text-xs text-cyan-900 dark:text-cyan-300 flex gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>Vendor Master Register:</strong> This is the single source of truth for supplier data. Finance and AP modules read from here in read-only mode.
              </span>
            </div>
            <div className="border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 text-xs">
                    <TableHead className="font-bold">Code</TableHead>
                    <TableHead className="font-bold">Vendor Name</TableHead>
                    <TableHead className="font-bold">Contact Person</TableHead>
                    <TableHead className="font-bold">Phone / Email</TableHead>
                    <TableHead className="font-bold">Tax / CR No</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold text-right w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs">No vendors registered yet. Click 'New Vendor'.</TableCell></TableRow>
                  ) : vendors.map(v => (
                    <TableRow key={v.id} className="hover:bg-muted/30 text-xs">
                      <TableCell className="font-mono font-bold text-primary">{v.code}</TableCell>
                      <TableCell className="font-semibold">{v.name}</TableCell>
                      <TableCell>{v.contact_person || "—"}</TableCell>
                      <TableCell>{[v.phone, v.email].filter(Boolean).join(" • ") || "—"}</TableCell>
                      <TableCell className="font-mono">{v.tax_number || "—"}</TableCell>
                      <TableCell><Badge variant={v.status === "Active" ? "default" : "secondary"}>{v.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditVendor(v)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteVendor(v)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ── TAB 5: RFX / TENDERS ────────────────────────────────────────────── */}
        {activeTab === "rfx" && (
          <div className="space-y-4">
            {rfxList.length === 0 ? (
              <EmptyState text="No RFX tenders yet. Convert a Purchase Request or click 'Create RFX'." />
            ) : (
              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 text-xs">
                      <TableHead className="font-bold">Doc #</TableHead>
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Issue Date</TableHead>
                      <TableHead className="font-bold text-right">Estimated Amount (QAR)</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rfxList.map(r => (
                      <TableRow key={r.id} className="text-xs hover:bg-muted/30">
                        <TableCell className="font-mono font-bold text-primary">{r.doc_number}</TableCell>
                        <TableCell><Badge variant="outline">{r.rfx_type}</Badge></TableCell>
                        <TableCell>{r.issue_date || r.created_at?.slice(0,10)}</TableCell>
                        <TableCell className="text-right font-semibold">{Number(r.total_amount || 0).toLocaleString()}</TableCell>
                        <TableCell><Badge variant={statusBadgeVariant(r.status)}>{r.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 6: QUOTATIONS ───────────────────────────────────────────────── */}
        {activeTab === "quotations" && (
          <div className="space-y-4">
            {quoteList.length === 0 ? (
              <EmptyState text="No vendor quotes recorded yet. Click 'Submit Quote' to log a quotation against an RFX." />
            ) : (
              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 text-xs">
                      <TableHead className="font-bold">Quote #</TableHead>
                      <TableHead className="font-bold">Vendor</TableHead>
                      <TableHead className="font-bold">Date</TableHead>
                      <TableHead className="font-bold text-right">Total Amount (QAR)</TableHead>
                      <TableHead className="font-bold">Selection</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quoteList.map(q => (
                      <TableRow key={q.id} className="text-xs hover:bg-muted/30">
                        <TableCell className="font-mono font-bold text-primary">{q.doc_number || q.quote_number}</TableCell>
                        <TableCell className="font-semibold">{getVendorName(q.vendor_id)}</TableCell>
                        <TableCell>{q.quote_date}</TableCell>
                        <TableCell className="text-right font-semibold">{Number(q.total_amount || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          {q.is_selected ? <Badge className="bg-emerald-500">Selected Winner</Badge> : <Badge variant="outline">Evaluating</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 7: APPROVAL INBOX ───────────────────────────────────────────── */}
        {activeTab === "inbox" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ["Pending PR Approvals", prs.filter(p => p.status === "SUBMITTED").length, "text-amber-500"],
                ["Pending PO Approvals", pos.filter(p => p.status === "SUBMITTED").length, "text-cyan-500"],
                ["Ready for Receipt", pos.filter(p => p.status === "APPROVED").length, "text-emerald-500"],
                ["Completed / Closed", pos.filter(p => p.status === "CLOSED").length, "text-muted-foreground"],
              ].map(([label, count, color]: any) => (
                <Card key={label}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`text-2xl font-bold mt-1 ${color}`}>{count}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Approval Action Items</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {pos.filter(p => p.status === "SUBMITTED").map(po => (
                  <div key={po.id} className="flex justify-between items-center border rounded-lg p-3 text-xs">
                    <div>
                      <p className="font-semibold text-sm">{po.doc_number} · QAR {Number(po.total_amount).toLocaleString()}</p>
                      <p className="text-muted-foreground mt-0.5">{getVendorName(po.vendor_id)} · Order Date: {po.po_date}</p>
                    </div>
                    <Button size="sm" onClick={() => handleApprovePO(po)} disabled={saving}>
                      <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Approve PO
                    </Button>
                  </div>
                ))}
                {prs.filter(p => p.status === "SUBMITTED").map(pr => (
                  <div key={pr.id} className="flex justify-between items-center border rounded-lg p-3 text-xs">
                    <div>
                      <p className="font-semibold text-sm">{pr.doc_number} · Priority: {pr.priority}</p>
                      <p className="text-muted-foreground mt-0.5">Amount: QAR {Number(pr.total_amount).toLocaleString()} · {getPropertyName(pr.property_id)}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleApprovePR(pr)} disabled={saving}>
                      <CheckCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Approve PR
                    </Button>
                  </div>
                ))}
                {!pos.some(p => p.status === "SUBMITTED") && !prs.some(p => p.status === "SUBMITTED") && (
                  <p className="text-sm text-muted-foreground text-center py-6">All approval queues are up to date. No pending items!</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── TAB 8: SHIPMENTS ────────────────────────────────────────────────── */}
        {activeTab === "shipments" && (
          <div className="space-y-4">
            {shipments.length === 0 ? (
              <EmptyState text="No logistics shipments recorded. Click 'New Shipment' to track inbound orders." />
            ) : (
              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 text-xs">
                      <TableHead className="font-bold">Shipment #</TableHead>
                      <TableHead className="font-bold">PO Reference</TableHead>
                      <TableHead className="font-bold">BL / AWB No</TableHead>
                      <TableHead className="font-bold">Incoterm</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipments.map(s => (
                      <TableRow key={s.id} className="text-xs hover:bg-muted/30">
                        <TableCell className="font-mono font-bold text-primary">{s.doc_number || s.shipment_number}</TableCell>
                        <TableCell>{pos.find(p => p.id === s.purchase_order_id)?.doc_number || "—"}</TableCell>
                        <TableCell className="font-mono">{s.bl_awb_no || "—"}</TableCell>
                        <TableCell>{s.incoterm || "CIF"}</TableCell>
                        <TableCell><Badge variant="secondary">{s.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 9: ANALYTICS DASHBOARD ──────────────────────────────────────── */}
        {activeTab === "dashboard" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ["Total PO Commitments", `QAR ${totalSpend.toLocaleString()}`, "text-emerald-500"],
                ["Total Orders Issued", pos.length, "text-cyan-500"],
                ["Total GRNs Received", grns.length, "text-blue-500"],
                ["Active Sourcing Vendors", vendors.length, "text-violet-500"],
              ].map(([label, val, color]: any) => (
                <Card key={label}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`text-2xl font-bold mt-1 ${color}`}>{val}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Recent Purchase Orders</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {pos.slice(0, 5).map(po => (
                    <div key={po.id} className="flex justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-semibold">{po.doc_number}</p>
                        <p className="text-muted-foreground">{getVendorName(po.vendor_id)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">QAR {Number(po.total_amount).toLocaleString()}</p>
                        <Badge variant={statusBadgeVariant(po.status)}>{po.status}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Recent Deliveries (GRN)</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {grns.slice(0, 5).map(g => (
                    <div key={g.id} className="flex justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-semibold">{g.grn_number}</p>
                        <p className="text-muted-foreground">{g.grn_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-500">QAR {Number(g.total_amount).toLocaleString()}</p>
                        <Badge variant="default">{g.status}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ── TAB 10: SUPPLIER PERFORMANCE ────────────────────────────────────── */}
        {activeTab === "supplier_perf" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vendor Spend & Performance Overview</CardTitle>
                <CardDescription>Metrics aggregated across approved purchase orders and goods receipt notes.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 text-xs">
                        <TableHead className="font-bold">Vendor Name</TableHead>
                        <TableHead className="font-bold">Code</TableHead>
                        <TableHead className="font-bold text-right">PO Count</TableHead>
                        <TableHead className="font-bold text-right">Total Spend (QAR)</TableHead>
                        <TableHead className="font-bold">Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.map(v => {
                        const vPos = pos.filter(p => Number(p.vendor_id) === Number(v.id));
                        const vSpend = vPos.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
                        return (
                          <TableRow key={v.id} className="text-xs hover:bg-muted/30">
                            <TableCell className="font-semibold">{v.name}</TableCell>
                            <TableCell className="font-mono text-muted-foreground">{v.code}</TableCell>
                            <TableCell className="text-right">{vPos.length}</TableCell>
                            <TableCell className="text-right font-bold">QAR {vSpend.toLocaleString()}</TableCell>
                            <TableCell><Badge variant="outline" className="text-amber-500 border-amber-500/30">★★★★★ Tier 1</Badge></TableCell>
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

        {/* ── TAB 11: ASSET LINKAGE ───────────────────────────────────────────── */}
        {activeTab === "assets" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Procurement Asset Queue</CardTitle>
                <CardDescription>Line items procured as CAPEX / Fixed Assets are mapped into the central Asset Register.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {grnLines.map(gl => (
                  <div key={gl.id} className="flex justify-between items-center border rounded-lg p-3 text-xs">
                    <div>
                      <p className="font-semibold text-sm">{gl.description}</p>
                      <p className="text-muted-foreground mt-0.5">Accepted Qty: {gl.accepted_quantity} · Rate: QAR {Number(gl.unit_rate).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className="text-cyan-500 border-cyan-500/30">
                      Auto-Registered
                    </Badge>
                  </div>
                ))}
                {grnLines.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No asset receipts pending registration.</p>}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── TAB 12: MAINTENANCE STOCK ───────────────────────────────────────── */}
        {activeTab === "maintenance" && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {catalog.filter(c => ["maintenance_spare", "consumable"].includes(c.item_type)).map(item => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.item_code} · {item.category}</p>
                      </div>
                      <Badge variant="outline">{typeLabel[item.item_type]}</Badge>
                    </div>
                    <div className="mt-4 flex justify-between text-xs text-muted-foreground border-t pt-2">
                      <span>Status: <strong className="text-emerald-500">In Stock</strong></span>
                      <span>Reorder Level: {item.reorder_level} {item.unit_of_measure}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 13: ITEM CATALOG ────────────────────────────────────────────── */}
        {activeTab === "catalog" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input placeholder="Search catalog items..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs text-xs" />
            </div>
            <div className="border rounded-lg overflow-hidden bg-card divide-y">
              {catalog.filter(c => `${c.name} ${c.item_code} ${c.category}`.toLowerCase().includes(search.toLowerCase())).map(item => (
                <div key={item.id} className="p-3.5 flex justify-between items-center text-xs hover:bg-muted/30">
                  <div>
                    <span className="font-semibold text-sm">{item.name}</span>
                    <span className="font-mono text-muted-foreground ml-2">[{item.item_code}]</span>
                    <p className="text-muted-foreground mt-0.5">{item.category} · UOM: {item.unit_of_measure}</p>
                  </div>
                  <Badge variant={item.item_type === "asset" ? "default" : "secondary"}>{typeLabel[item.item_type]}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── DIALOGS ──────────────────────────────────────────────────────────── */}

      {/* New PR Dialog */}
      <Dialog open={showNewPR} onOpenChange={setShowNewPR}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>New Purchase Requisition</DialogTitle>
            <DialogDescription>Submit an internal purchase request for approval against allocated budgets.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2 text-xs">
            {/* Item Selector from Master with Search */}
            <Field label="Select Item (from Item Master) *">
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search items by name, code, category..."
                    value={itemSearchPR}
                    onChange={e => setItemSearchPR(e.target.value)}
                    className="pl-8 h-8 text-xs bg-muted/20"
                  />
                  {itemSearchPR && (
                    <button
                      type="button"
                      onClick={() => setItemSearchPR("")}
                      className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <Select value={prForm.itemId} onValueChange={handleSelectItemForPR}>
                  <SelectTrigger className="font-medium h-9"><SelectValue placeholder="-- Choose an item from Catalog --" /></SelectTrigger>
                  <SelectContent className="max-h-56">
                    {filteredCatalogPR.length === 0 ? (
                      <div className="p-2 text-center text-xs text-muted-foreground">No items matching "{itemSearchPR}"</div>
                    ) : (
                      filteredCatalogPR.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          <span className="font-semibold">{item.name}</span>
                          <span className="text-muted-foreground ml-2">[{item.item_code}]</span>
                          <span className="text-emerald-600 font-mono ml-2">· QAR {item.unit_price} / {item.unit_of_measure}</span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </Field>

            {/* Property (Mandatory) & Unit (Optional) */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Property (Mandatory) *">
                <Select value={prForm.propertyId} onValueChange={v => setPrForm({ ...prForm, propertyId: v, unitId: "" })}>
                  <SelectTrigger className={!prForm.propertyId ? "border-amber-400" : ""}>
                    <SelectValue placeholder="Select Property *" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Unit (Optional)">
                <Select value={prForm.unitId} onValueChange={v => setPrForm({ ...prForm, unitId: v })} disabled={!prForm.propertyId}>
                  <SelectTrigger><SelectValue placeholder="Common / Whole Property" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Whole Property / Common Area</SelectItem>
                    {units.filter(u => !prForm.propertyId || u.property_id === prForm.propertyId).map(u => (
                      <SelectItem key={u.id} value={u.id}>Unit {u.unit_ref}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Budget Head & Budget Type */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Budget Head *">
                <Select value={prForm.budgetHead} onValueChange={(v: BudgetHead) => setPrForm({ ...prForm, budgetHead: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Salary">Salary & Staffing</SelectItem>
                    <SelectItem value="Maintenance Items">Maintenance Items</SelectItem>
                    <SelectItem value="Property Assets">Property Assets</SelectItem>
                    <SelectItem value="Unit Assets">Unit Assets</SelectItem>
                    <SelectItem value="Other">Other / General</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Budget Type *">
                <Select value={prForm.budgetType} onValueChange={(v: "CAPEX" | "OPEX") => setPrForm({ ...prForm, budgetType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEX">OPEX (Operating Expense)</SelectItem>
                    <SelectItem value="CAPEX">CAPEX (Capital Asset)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Quantity, Unit Rate, Total & Priority */}
            <div className="grid grid-cols-3 gap-3">
              <Field label="Quantity *">
                <Input type="number" min="1" value={prForm.quantity} onChange={e => setPrForm({ ...prForm, quantity: e.target.value })} />
              </Field>
              <Field label="Unit Rate (QAR) *">
                <Input type="number" value={prForm.unitRate} onChange={e => setPrForm({ ...prForm, unitRate: e.target.value })} />
              </Field>
              <Field label="Priority">
                <Select value={prForm.priority} onValueChange={v => setPrForm({ ...prForm, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Total Estimated Cost Banner */}
            <div className="rounded-md bg-muted/60 p-2.5 flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Estimated Requisition Total:</span>
              <span className="font-bold text-sm text-primary">
                QAR {(Number(prForm.quantity || 1) * Number(prForm.unitRate || 0)).toLocaleString()}
              </span>
            </div>

            <Field label="Justification / Remarks">
              <Textarea value={prForm.remarks} onChange={e => setPrForm({ ...prForm, remarks: e.target.value })} rows={2} placeholder="Business justification or operational context..." />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPR(false)}>Cancel</Button>
            <Button onClick={handleCreatePR} disabled={saving || !prForm.propertyId || !prForm.itemName}>
              Submit Requisition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New PO Dialog */}
      <Dialog open={showNewPO} onOpenChange={setShowNewPO}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>New Purchase Order</DialogTitle>
            <DialogDescription>Issue a formal purchase order to a registered vendor against allocated budgets.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2 text-xs">
            {/* Vendor Selector */}
            <Field label="Vendor (Mandatory) *">
              <Select value={poForm.vendorId} onValueChange={v => setPoForm({ ...poForm, vendorId: v })}>
                <SelectTrigger className={!poForm.vendorId ? "border-amber-400 font-medium" : "font-medium"}>
                  <SelectValue placeholder="-- Select Registered Vendor --" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map(v => <SelectItem key={v.id} value={String(v.id)}>{v.name} ({v.code})</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            {/* Item Selector from Master with Search */}
            <Field label="Select Item (from Item Master) *">
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search items by name, code, category..."
                    value={itemSearchPO}
                    onChange={e => setItemSearchPO(e.target.value)}
                    className="pl-8 h-8 text-xs bg-muted/20"
                  />
                  {itemSearchPO && (
                    <button
                      type="button"
                      onClick={() => setItemSearchPO("")}
                      className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <Select value={poForm.itemId} onValueChange={handleSelectItemForPO}>
                  <SelectTrigger className="font-medium h-9"><SelectValue placeholder="-- Choose an item from Catalog --" /></SelectTrigger>
                  <SelectContent className="max-h-56">
                    {filteredCatalogPO.length === 0 ? (
                      <div className="p-2 text-center text-xs text-muted-foreground">No items matching "{itemSearchPO}"</div>
                    ) : (
                      filteredCatalogPO.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          <span className="font-semibold">{item.name}</span>
                          <span className="text-muted-foreground ml-2">[{item.item_code}]</span>
                          <span className="text-emerald-600 font-mono ml-2">· QAR {item.unit_price} / {item.unit_of_measure}</span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </Field>

            {/* Property (Mandatory) & Unit (Optional) */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Property (Mandatory) *">
                <Select value={poForm.propertyId} onValueChange={v => setPoForm({ ...poForm, propertyId: v, unitId: "" })}>
                  <SelectTrigger className={!poForm.propertyId ? "border-amber-400" : ""}>
                    <SelectValue placeholder="Select Property *" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Unit (Optional)">
                <Select value={poForm.unitId} onValueChange={v => setPoForm({ ...poForm, unitId: v })} disabled={!poForm.propertyId}>
                  <SelectTrigger><SelectValue placeholder="Common / Whole Property" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Whole Property / Common Area</SelectItem>
                    {units.filter(u => !poForm.propertyId || u.property_id === poForm.propertyId).map(u => (
                      <SelectItem key={u.id} value={u.id}>Unit {u.unit_ref}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Budget Head & Budget Type */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Budget Head *">
                <Select value={poForm.budgetHead} onValueChange={(v: BudgetHead) => setPoForm({ ...poForm, budgetHead: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Salary">Salary & Staffing</SelectItem>
                    <SelectItem value="Maintenance Items">Maintenance Items</SelectItem>
                    <SelectItem value="Property Assets">Property Assets</SelectItem>
                    <SelectItem value="Unit Assets">Unit Assets</SelectItem>
                    <SelectItem value="Other">Other / General</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Budget Type *">
                <Select value={poForm.budgetType} onValueChange={(v: "CAPEX" | "OPEX") => setPoForm({ ...poForm, budgetType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEX">OPEX (Operating Expense)</SelectItem>
                    <SelectItem value="CAPEX">CAPEX (Capital Asset)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Quantity, Unit Rate */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity *">
                <Input type="number" min="1" value={poForm.lineQuantity} onChange={e => setPoForm({ ...poForm, lineQuantity: e.target.value })} />
              </Field>
              <Field label="Unit Rate (QAR) *">
                <Input type="number" value={poForm.lineRate} onChange={e => setPoForm({ ...poForm, lineRate: e.target.value })} />
              </Field>
            </div>

            {/* Order Date & Delivery Date */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Order Date">
                <Input type="date" value={poForm.orderDate} onChange={e => setPoForm({ ...poForm, orderDate: e.target.value })} />
              </Field>
              <Field label="Expected Delivery Date">
                <Input type="date" value={poForm.deliveryDate} onChange={e => setPoForm({ ...poForm, deliveryDate: e.target.value })} />
              </Field>
            </div>

            {/* Total Estimated Cost Banner */}
            <div className="rounded-md bg-muted/60 p-2.5 flex justify-between items-center text-xs">
              <span className="text-muted-foreground">PO Subtotal (+ 5% Est. Tax):</span>
              <span className="font-bold text-sm text-primary">
                QAR {((Number(poForm.lineQuantity || 1) * Number(poForm.lineRate || 0)) * 1.05).toLocaleString()}
              </span>
            </div>

            <Field label="Terms / Remarks">
              <Input value={poForm.remarks} onChange={e => setPoForm({ ...poForm, remarks: e.target.value })} placeholder="Delivery and payment instructions..." />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPO(false)}>Cancel</Button>
            <Button onClick={handleCreatePO} disabled={saving || !poForm.vendorId || !poForm.propertyId || !poForm.itemName}>
              Create Purchase Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receive GRN Dialog */}
      <Dialog open={showReceive} onOpenChange={setShowReceive}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receive Goods & Post GRN</DialogTitle>
            <DialogDescription>
              Record physical receipt for {selectedPO?.doc_number}. Accepted quantities will update stores and inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs max-h-[50vh] overflow-auto">
            {selectedPO && (
              poLines.filter(l => l.purchase_order_id === selectedPO.id).length > 0 ? (
                poLines.filter(l => l.purchase_order_id === selectedPO.id).map(line => {
                  const inp = receiveInput[line.id] || { received: 0, accepted: 0, rejected: 0 };
                  return (
                    <div key={line.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between">
                        <p className="font-semibold text-sm">{line.item_name || line.description}</p>
                        <span className="text-muted-foreground font-mono">Ordered: {line.quantity}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="Received Quantity">
                          <Input
                            type="number"
                            value={inp.received}
                            onChange={e => {
                              const val = Number(e.target.value) || 0;
                              setReceiveInput(prev => ({
                                ...prev,
                                [line.id]: { received: val, accepted: val, rejected: 0 }
                              }));
                            }}
                          />
                        </Field>
                        <Field label="Accepted Quantity">
                          <Input
                            type="number"
                            value={inp.accepted}
                            onChange={e => {
                              const val = Number(e.target.value) || 0;
                              setReceiveInput(prev => ({
                                ...prev,
                                [line.id]: { ...inp, accepted: val, rejected: Math.max(0, inp.received - val) }
                              }));
                            }}
                          />
                        </Field>
                        <Field label="Rejected Quantity">
                          <Input
                            type="number"
                            value={inp.rejected}
                            onChange={e => {
                              const val = Number(e.target.value) || 0;
                              setReceiveInput(prev => ({
                                ...prev,
                                [line.id]: { ...inp, rejected: val, accepted: Math.max(0, inp.received - val) }
                              }));
                            }}
                          />
                        </Field>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <p className="font-semibold text-sm">{selectedPO.remarks || `Order ${selectedPO.doc_number}`}</p>
                    <span className="text-muted-foreground font-mono">Amount: QAR {Number(selectedPO.total_amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Received Quantity">
                      <Input
                        type="number"
                        value={receiveInput["fallback-line"]?.received ?? 1}
                        onChange={e => {
                          const val = Number(e.target.value) || 1;
                          setReceiveInput(prev => ({ ...prev, "fallback-line": { received: val, accepted: val, rejected: 0 } }));
                        }}
                      />
                    </Field>
                    <Field label="Accepted Quantity">
                      <Input
                        type="number"
                        value={receiveInput["fallback-line"]?.accepted ?? 1}
                        onChange={e => {
                          const val = Number(e.target.value) || 1;
                          setReceiveInput(prev => ({ ...prev, "fallback-line": { received: val, accepted: val, rejected: 0 } }));
                        }}
                      />
                    </Field>
                    <Field label="Rejected Quantity">
                      <Input
                        type="number"
                        value={receiveInput["fallback-line"]?.rejected ?? 0}
                        onChange={e => {
                          const val = Number(e.target.value) || 0;
                          setReceiveInput(prev => ({ ...prev, "fallback-line": { ...prev["fallback-line"], rejected: val } }));
                        }}
                      />
                    </Field>
                  </div>
                </div>
              )
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceive(false)}>Cancel</Button>
            <Button onClick={handlePostGRN} disabled={saving} className="gap-2">
              <Truck className="h-4 w-4" /> Post Goods Receipt Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vendor Master Modal */}
      <Dialog open={showVendorModal} onOpenChange={setShowVendorModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editVendor ? "Edit Vendor" : "New Vendor"}</DialogTitle>
            <DialogDescription>Vendor details are managed here as the single source of truth across all modules.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Vendor Code *">
                <Input value={vendorForm.code} onChange={e => setVendorForm({ ...vendorForm, code: e.target.value })} placeholder="VEND-101" />
              </Field>
              <Field label="Tax / CR Number">
                <Input value={vendorForm.tax_number} onChange={e => setVendorForm({ ...vendorForm, tax_number: e.target.value })} placeholder="CR-99281" />
              </Field>
            </div>
            <Field label="Company Name *">
              <Input value={vendorForm.name} onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })} placeholder="e.g. Gulf Facility Solutions WLL" />
            </Field>
            <Field label="Contact Person">
              <Input value={vendorForm.contact_person} onChange={e => setVendorForm({ ...vendorForm, contact_person: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone">
                <Input value={vendorForm.phone} onChange={e => setVendorForm({ ...vendorForm, phone: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input type="email" value={vendorForm.email} onChange={e => setVendorForm({ ...vendorForm, email: e.target.value })} />
              </Field>
            </div>
            <Field label="Status">
              <Select value={vendorForm.status} onValueChange={(v: "Active" | "Inactive") => setVendorForm({ ...vendorForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVendorModal(false)}>Cancel</Button>
            <Button onClick={handleSaveVendor} disabled={saving}>{editVendor ? "Update Vendor" : "Save Vendor"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Catalog Modal */}
      <Dialog open={showCatalogModal} onOpenChange={setShowCatalogModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Catalog Item</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2 text-xs">
            <Field label="Item Code *"><Input value={catalogForm.item_code} onChange={e => setCatalogForm({ ...catalogForm, item_code: e.target.value })} placeholder="AST-001" /></Field>
            <Field label="Item Name *"><Input value={catalogForm.name} onChange={e => setCatalogForm({ ...catalogForm, name: e.target.value })} /></Field>
            <Field label="Category"><Input value={catalogForm.category} onChange={e => setCatalogForm({ ...catalogForm, category: e.target.value })} /></Field>
            <Field label="Classification">
              <Select value={catalogForm.item_type} onValueChange={(v: ItemType) => setCatalogForm({ ...catalogForm, item_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">Fixed Asset</SelectItem>
                  <SelectItem value="maintenance_spare">Maintenance Spare</SelectItem>
                  <SelectItem value="consumable">Consumable</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Unit of Measure"><Input value={catalogForm.unit_of_measure} onChange={e => setCatalogForm({ ...catalogForm, unit_of_measure: e.target.value })} /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCatalogModal(false)}>Cancel</Button>
            <Button onClick={handleAddCatalogItem}>Add to Catalog</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* New RFX Modal */}
      <Dialog open={showNewRFX} onOpenChange={setShowNewRFX}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create RFX / Tender</DialogTitle>
            <DialogDescription>Initiate an RFI, RFQ, or RFP from an approved Purchase Request.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2 text-xs">
            <Field label="Purchase Request *">
              <Select value={rfxForm.prId} onValueChange={v => setRfxForm({ ...rfxForm, prId: v })}>
                <SelectTrigger><SelectValue placeholder="Select Purchase Request" /></SelectTrigger>
                <SelectContent>
                  {prs.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.doc_number} (QAR {Number(p.total_amount || 0).toLocaleString()})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Tender Type">
              <Select value={rfxForm.rfxType} onValueChange={v => setRfxForm({ ...rfxForm, rfxType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RFQ">RFQ - Request for Quotation</SelectItem>
                  <SelectItem value="RFP">RFP - Request for Proposal</SelectItem>
                  <SelectItem value="RFI">RFI - Request for Information</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Remarks">
              <Input value={rfxForm.remarks} onChange={e => setRfxForm({ ...rfxForm, remarks: e.target.value })} placeholder="Sourcing specifications & scope" />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRFX(false)}>Cancel</Button>
            <Button onClick={handleCreateRFX} disabled={saving}>Create RFX</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Quote Modal */}
      <Dialog open={showNewQuote} onOpenChange={setShowNewQuote}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Vendor Quotation</DialogTitle>
            <DialogDescription>Log a quotation received from an invited supplier.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2 text-xs">
            <Field label="RFX Tender *">
              <Select value={quoteForm.rfxId} onValueChange={v => setQuoteForm({ ...quoteForm, rfxId: v })}>
                <SelectTrigger><SelectValue placeholder="Select RFX" /></SelectTrigger>
                <SelectContent>
                  {rfxList.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.doc_number} ({r.rfx_type})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Vendor *">
              <Select value={quoteForm.vendorId} onValueChange={v => setQuoteForm({ ...quoteForm, vendorId: v })}>
                <SelectTrigger><SelectValue placeholder="Select Vendor" /></SelectTrigger>
                <SelectContent>
                  {vendors.map(v => (
                    <SelectItem key={v.id} value={String(v.id)}>{v.name} ({v.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quote Amount (QAR) *">
                <Input type="number" value={quoteForm.amount} onChange={e => setQuoteForm({ ...quoteForm, amount: e.target.value })} />
              </Field>
              <Field label="Tax Amount (QAR)">
                <Input type="number" value={quoteForm.taxAmount} onChange={e => setQuoteForm({ ...quoteForm, taxAmount: e.target.value })} />
              </Field>
            </div>
            <Field label="Remarks">
              <Input value={quoteForm.remarks} onChange={e => setQuoteForm({ ...quoteForm, remarks: e.target.value })} placeholder="Payment & delivery terms" />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewQuote(false)}>Cancel</Button>
            <Button onClick={handleCreateQuote} disabled={saving}>Log Quote</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Shipment Modal */}
      <Dialog open={showShipmentModal} onOpenChange={setShowShipmentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Logistics Shipment</DialogTitle>
            <DialogDescription>Track in-transit shipping and customs clearance for an order.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2 text-xs">
            <Field label="Purchase Order *">
              <Select value={shipmentForm.purchaseOrderId} onValueChange={v => setShipmentForm({ ...shipmentForm, purchaseOrderId: v })}>
                <SelectTrigger><SelectValue placeholder="Select Purchase Order" /></SelectTrigger>
                <SelectContent>
                  {pos.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.doc_number} ({getVendorName(p.vendor_id)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="BL / Air Waybill No">
                <Input value={shipmentForm.blAwbNo} onChange={e => setShipmentForm({ ...shipmentForm, blAwbNo: e.target.value })} placeholder="AWB-88391" />
              </Field>
              <Field label="Incoterm">
                <Input value={shipmentForm.incoterm} onChange={e => setShipmentForm({ ...shipmentForm, incoterm: e.target.value })} placeholder="CIF, FOB, EXW" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Estimated Arrival (ETA)">
                <Input type="date" value={shipmentForm.eta} onChange={e => setShipmentForm({ ...shipmentForm, eta: e.target.value })} />
              </Field>
              <Field label="In-Transit Value (QAR)">
                <Input type="number" value={shipmentForm.goodsInTransitAmount} onChange={e => setShipmentForm({ ...shipmentForm, goodsInTransitAmount: e.target.value })} />
              </Field>
            </div>
            <Field label="Remarks">
              <Input value={shipmentForm.remarks} onChange={e => setShipmentForm({ ...shipmentForm, remarks: e.target.value })} placeholder="Port of entry, carrier info" />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShipmentModal(false)}>Cancel</Button>
            <Button onClick={handleCreateShipment} disabled={saving}>Create Shipment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
