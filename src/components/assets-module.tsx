import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { ExcelImportEmbedded } from "@/components/excel-import-embedded";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, Plus, Package, CheckCircle2, AlertTriangle, Trash2, Printer, ArrowRightLeft, FileDown, FileUp, Building2,
  Calendar, Layers, ShieldCheck, Tag, DollarSign, Upload, Percent, RefreshCw, FileText, Check, PlusCircle, TrendingUp, TrendingDown,
  Eye, Wrench, Clock, CheckCheck, XCircle, ArrowUpRight, ArrowDownLeft, Info, HelpCircle, User, MapPin, Hash, Sparkles,
  Pencil, Search, Shield, FileCheck, Paperclip, ChevronRight, ChevronLeft, Download, FileSpreadsheet
} from "lucide-react";
import { fetchAssets, createAsset, updateAsset, deleteAsset, fetchProperties, fetchUnits, type Asset, type Property, type Unit } from "@/lib/supabase";
import { FinVendorsApi, type FinVendor } from "@/lib/supabase-finance";
import { useFinanceStore } from "@/lib/finance/finance-store";
import { formatDDMMMYYYY, getTodayIST } from "@/lib/date-utils";
import { toast } from "sonner";
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';

// ── Types for Sub-module Records ──────────────────────────────────────────
export interface AssetRevaluationRecord {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_code: string;
  prev_value: number;
  new_value: number;
  reason: string;
  date: string;
}

export interface AssetSaleRecord {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_code: string;
  book_value: number;
  sale_value: number;
  buyer: string;
  date: string;
  remarks: string;
}

export interface AssetWriteoffRecord {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_code: string;
  book_value: number;
  writeoff_reason: string;
  date: string;
  approved_by: string;
}

export interface AssetAllocationRecord {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_code: string;
  action_type: "ALLOCATION" | "DEALLOCATION" | "TRANSFER";
  allocation_type?: "PROPERTY_UNIT" | "OFFICIAL_STAFF";
  from_property?: string;
  from_unit?: string;
  from_employee?: string;
  to_property?: string;
  to_unit?: string;
  to_employee?: string;
  department?: string;
  date: string;
  remarks: string;
  condition?: string;
}

export interface AssetMaintenanceRecord {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_code: string;
  maintenance_type: "Preventive Maintenance" | "Breakdown Repair" | "Routine Inspection" | "Calibration / Testing";
  priority: "Low" | "Medium" | "High" | "Critical";
  service_vendor: string;
  technician_name?: string;
  scheduled_date: string;
  completed_date?: string;
  estimated_cost: number;
  actual_cost?: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  description: string;
  completion_notes?: string;
  invoice_ref?: string;
  created_at: string;
}

export interface AssetWarrantyDocument {
  id: string;
  name: string;
  file_name: string;
  upload_date: string;
  file_type?: string;
}

export interface AssetWarrantyRecord {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_code: string;
  warranty_type: "Standard Manufacturer" | "Extended Warranty" | "Annual Maintenance Contract (AMC)" | "Comprehensive SLA";
  provider_name: string;
  policy_number?: string;
  support_email?: string;
  support_phone?: string;
  start_date: string;
  expiry_date: string;
  duration_months: number;
  coverage_scope: string;
  amc_cost?: number;
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "EXTENDED";
  documents: AssetWarrantyDocument[];
  created_at: string;
}

export interface AssetDepreciationRecord {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_code: string;
  category: string;
  purchase_date: string;
  acquisition_cost: number;
  depreciation_method: "Straight Line Method (SLM)" | "Written Down Value (WDV)";
  useful_life_years: number;
  depreciation_rate_pct: number;
  accumulated_depreciation: number;
  current_book_value: number;
  last_depreciation_date?: string;
  fiscal_year: string;
}

// ── Reusable Standard Pagination Footer ───────────────────────────────────
function TablePagination({
  currentPage,
  totalItems,
  pageSize = 15,
  onPageChange,
  onPageSizeChange,
}: {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  return (
    <div className="p-3 px-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-muted/10">
      <div className="text-muted-foreground">
        Showing <span className="font-semibold text-foreground font-mono">{startItem}</span> to{" "}
        <span className="font-semibold text-foreground font-mono">{endItem}</span> of{" "}
        <span className="font-semibold text-foreground font-mono">{totalItems}</span> entries
      </div>

      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 mr-2">
            <span className="text-muted-foreground text-[11px]">Show</span>
            <Select value={String(pageSize)} onValueChange={v => onPageSizeChange(Number(v))}>
              <SelectTrigger className="h-7 w-16 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-muted-foreground text-[11px]">per page</span>
          </div>
        )}

        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-xs gap-1"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </Button>

        <span className="font-mono font-medium text-foreground px-1">
          {currentPage} / {totalPages}
        </span>

        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-xs gap-1"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function AssetManager({ role }: { role: "admin" | "prop-mgr" }) {
  const routerSearch = useRouterState({ select: (s) => s.location.search }) as Record<string, any>;
  const navigate = useNavigate();
  const { addJournalEntry, addVoucher } = useFinanceStore();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [vendors, setVendors] = useState<FinVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [bulkAssetOpen, setBulkAssetOpen] = useState(false);
  const [bulkAssetData, setBulkAssetData] = useState("");
  const [bulkAssetLoading, setBulkAssetLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeRegistryFilter, setActiveRegistryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [printBarcode, setPrintBarcode] = useState<string | null>(null);

  // ── Pagination States for each module ──
  const [registryPage, setRegistryPage] = useState(1);
  const [registryPageSize, setRegistryPageSize] = useState(15);

  const [allocPage, setAllocPage] = useState(1);
  const [allocPageSize, setAllocPageSize] = useState(15);

  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(15);

  const [warrantyPage, setWarrantyPage] = useState(1);
  const [warrantyPageSize, setWarrantyPageSize] = useState(15);

  const [maintPage, setMaintPage] = useState(1);
  const [maintPageSize, setMaintPageSize] = useState(15);

  const [revalPage, setRevalPage] = useState(1);
  const [revalPageSize, setRevalPageSize] = useState(15);

  const [sellPage, setSellPage] = useState(1);
  const [sellPageSize, setSellPageSize] = useState(15);

  const [writeoffPage, setWriteoffPage] = useState(1);
  const [writeoffPageSize, setWriteoffPageSize] = useState(15);

  const [deprPage, setDeprPage] = useState(1);
  const [deprPageSize, setDeprPageSize] = useState(15);
  const [deprMethodFilter, setDeprMethodFilter] = useState("all");
  const [deprSearch, setDeprSearch] = useState("");

  // ── Selected Asset for Detail View Modal ──
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);

  // ── Edit Asset Modal State ──
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editForm, setEditForm] = useState({
    asset_name: "",
    category: "Furniture",
    asset_code: "",
    serial_number: "",
    purchase_cost: "",
    purchase_date: getTodayIST(),
    life_of_asset: "60",
    brand: "Straight Line Method (SLM)",
    supplier: "",
    asset_condition: "Good",
    description: "",
  });

  // ── Module-level sub-tabs (synced with URL ?tab=...) ──
  const initialModuleTab = typeof routerSearch?.tab === "string" ? routerSearch.tab : "registry";
  const [moduleTab, setModuleTabState] = useState(initialModuleTab);

  useEffect(() => {
    if (routerSearch?.tab && routerSearch.tab !== moduleTab) {
      setModuleTabState(routerSearch.tab);
    }
  }, [routerSearch?.tab]);

  // ── Persistent Sub-module Records (LocalStorage fallback) ──
  const [revaluations, setRevaluations] = useState<AssetRevaluationRecord[]>(() => {
    try {
      const saved = localStorage.getItem("asset_revaluation_records_v2");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [sells, setSells] = useState<AssetSaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem("asset_sale_records_v2");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [writeoffs, setWriteoffs] = useState<AssetWriteoffRecord[]>(() => {
    try {
      const saved = localStorage.getItem("asset_writeoff_records_v2");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [allocations, setAllocations] = useState<AssetAllocationRecord[]>(() => {
    try {
      const saved = localStorage.getItem("asset_allocation_records_v2");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [maintenances, setMaintenances] = useState<AssetMaintenanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem("asset_maintenance_records_v2");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [warranties, setWarranties] = useState<AssetWarrantyRecord[]>(() => {
    try {
      const saved = localStorage.getItem("asset_warranty_records_v2");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Sync state changes to localStorage
  useEffect(() => {
    try { localStorage.setItem("asset_revaluation_records_v2", JSON.stringify(revaluations)); } catch {}
  }, [revaluations]);

  useEffect(() => {
    try { localStorage.setItem("asset_sale_records_v2", JSON.stringify(sells)); } catch {}
  }, [sells]);

  useEffect(() => {
    try { localStorage.setItem("asset_writeoff_records_v2", JSON.stringify(writeoffs)); } catch {}
  }, [writeoffs]);

  useEffect(() => {
    try { localStorage.setItem("asset_allocation_records_v2", JSON.stringify(allocations)); } catch {}
  }, [allocations]);

  useEffect(() => {
    try { localStorage.setItem("asset_maintenance_records_v2", JSON.stringify(maintenances)); } catch {}
  }, [maintenances]);

  useEffect(() => {
    try { localStorage.setItem("asset_warranty_records_v2", JSON.stringify(warranties)); } catch {}
  }, [warranties]);

  const [showDepreciationModal, setShowDepreciationModal] = useState(false);
  const [selectedAssetForDepr, setSelectedAssetForDepr] = useState<Asset | null>(null);
  const [depreciationForm, setDepreciationForm] = useState({
    fiscal_year: "2025-2026",
    posting_date: getTodayIST(),
    depreciation_method: "Straight Line Method (SLM)" as "Straight Line Method (SLM)" | "Written Down Value (WDV)",
    useful_life_years: "5",
    depreciation_rate_pct: "20",
    charge_amount: "",
    remarks: "",
  });

  // ── Dialog States ──
  const [showRevaluation, setShowRevaluation] = useState(false);
  const [revalForm, setRevalForm] = useState({ asset_id: "", prev_value: "", new_value: "", reason: "", date: getTodayIST() });

  const [showSell, setShowSell] = useState(false);
  const [sellForm, setSellForm] = useState({ asset_id: "", book_value: "", sale_value: "", buyer: "", date: getTodayIST(), remarks: "" });

  const [showWriteoff, setShowWriteoff] = useState(false);
  const [writeoffForm, setWriteoffForm] = useState({ asset_id: "", book_value: "", writeoff_reason: "", date: getTodayIST(), approved_by: "" });

  // ── Warranty Dialogs ──
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [warrantyModalMode, setWarrantyModalMode] = useState<"NEW" | "EXTEND">("NEW");
  const [selectedWarrantyToEdit, setSelectedWarrantyToEdit] = useState<AssetWarrantyRecord | null>(null);
  const [warrantyForm, setWarrantyForm] = useState({
    asset_id: "",
    warranty_type: "Standard Manufacturer" as AssetWarrantyRecord["warranty_type"],
    provider_name: "",
    policy_number: "",
    support_email: "",
    support_phone: "",
    start_date: getTodayIST(),
    duration_months: "12",
    expiry_date: "",
    coverage_scope: "Comprehensive Parts & Labor Coverage",
    amc_cost: "0",
    new_doc_name: "Warranty Certificate",
    new_doc_filename: "",
    documents: [] as AssetWarrantyDocument[],
  });

  // ── Allocation Action Dialog (Allocate / Deallocate / Transfer) ──
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [allocationMode, setAllocationMode] = useState<"ALLOCATE" | "DEALLOCATE" | "TRANSFER">("ALLOCATE");
  const [allocationTargetAsset, setAllocationTargetAsset] = useState<Asset | null>(null);
  const [allocationForm, setAllocationForm] = useState({
    asset_id: "",
    allocation_type: "PROPERTY_UNIT" as "PROPERTY_UNIT" | "OFFICIAL_STAFF",
    to_property_id: "",
    to_unit_id: "",
    to_employee_name: "",
    department: "",
    condition: "Good / Operational",
    date: getTodayIST(),
    remarks: "",
  });

  // Allocation screen sub-tab and search
  const [allocSubTab, setAllocSubTab] = useState<"active" | "history">("active");
  const [allocSearch, setAllocSearch] = useState("");

  // Warranty screen sub-tab & search
  const [warrantyFilter, setWarrantyFilter] = useState("all");
  const [warrantySearch, setWarrantySearch] = useState("");

  // ── Maintenance Dialogs ──
  const [showNewMaintenance, setShowNewMaintenance] = useState(false);
  const [maintForm, setMaintForm] = useState({
    asset_id: "",
    maintenance_type: "Preventive Maintenance" as AssetMaintenanceRecord["maintenance_type"],
    priority: "Medium" as AssetMaintenanceRecord["priority"],
    service_vendor: "",
    technician_name: "",
    scheduled_date: getTodayIST(),
    estimated_cost: "0",
    description: "",
  });

  const [completeMaintModal, setCompleteMaintModal] = useState<AssetMaintenanceRecord | null>(null);
  const [completeMaintForm, setCompleteMaintForm] = useState({
    actual_cost: "",
    completed_date: getTodayIST(),
    completion_notes: "",
    invoice_ref: "",
  });

  // ── Canonical Multi-Step Direct Asset Creation Form ──
  const [stepperStep, setStepperStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState({
    asset_type: "Fixed Asset",
    category: "Furniture",
    item_name: "",
    commission_date: getTodayIST(),
    put_to_use_date: getTodayIST(),
    asset_tag_id: "",
    serial_number: "",
    acquisition_amount: "",
    vendor_id: "",
    useful_life_years: "5",
    depreciation_rate: "20",
    depreciation_method: "Straight Line Method (SLM)",

    account_rows: [
      { id: "1", account_code: "12300001", account_name: "12300001 - Fixed Asset (Capital Cost / Asset A/C)", debit: "", credit: "" },
      { id: "2", account_code: "22100001", account_name: "22100001 - Trade Payables (Vendors / Supplier A/C)", debit: "", credit: "" }
    ],

    has_warranty: true,
    warranty_type: "Standard Manufacturer" as AssetWarrantyRecord["warranty_type"],
    warranty_provider: "",
    warranty_policy_no: "",
    warranty_start_date: getTodayIST(),
    warranty_duration_months: "12",
    warranty_expiry_date: "",
    warranty_support_email: "",
    warranty_support_phone: "",
    warranty_coverage: "Standard 1-Year Comprehensive Manufacturer Warranty (Parts & Labor)",
    amc_fee: "0",

    documents: [] as AssetWarrantyDocument[],
    doc_input_name: "Purchase Invoice",
    doc_input_file: "",

    specifications: [] as Array<{ id: string; spec_type: string; spec_details: string }>,
    spec_type_input: "",
    spec_details_input: "",
  });

  // Helper to calculate warranty expiry date
  useEffect(() => {
    if (form.warranty_start_date && form.warranty_duration_months) {
      try {
        const d = new Date(form.warranty_start_date);
        d.setMonth(d.getMonth() + Number(form.warranty_duration_months));
        setForm(f => ({ ...f, warranty_expiry_date: d.toISOString().split("T")[0] }));
      } catch {}
    }
  }, [form.warranty_start_date, form.warranty_duration_months]);

  useEffect(() => {
    if (warrantyForm.start_date && warrantyForm.duration_months) {
      try {
        const d = new Date(warrantyForm.start_date);
        d.setMonth(d.getMonth() + Number(warrantyForm.duration_months));
        setWarrantyForm(f => ({ ...f, expiry_date: d.toISOString().split("T")[0] }));
      } catch {}
    }
  }, [warrantyForm.start_date, warrantyForm.duration_months]);

  // ── Dynamic Status Derivation ──────────────────────────────────────────
  const getAssetStatus = useCallback((asset: Asset) => {
    if (sells.some(s => s.asset_id === asset.id) || asset.asset_status === "Sold / Discarded" || asset.asset_status === "Sold") {
      return {
        key: "sold",
        label: "Sold",
        badgeClass: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30",
        isAllocated: false,
        canBeActioned: false,
        description: "Asset disposed through sale",
      };
    }
    if (writeoffs.some(w => w.asset_id === asset.id) || asset.asset_status === "Disposed" || asset.asset_status === "Written Off") {
      return {
        key: "writeoff",
        label: "Written Off",
        badgeClass: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
        isAllocated: false,
        canBeActioned: false,
        description: "Asset decommissioned & written off",
      };
    }
    const hasActiveMaint = maintenances.some(m => m.asset_id === asset.id && ["SCHEDULED", "IN_PROGRESS"].includes(m.status));
    if (hasActiveMaint || asset.asset_status === "Maintenance" || asset.asset_status === "In Maintenance") {
      return {
        key: "maintenance",
        label: "Under Maintenance",
        badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
        isAllocated: false,
        canBeActioned: false,
        description: "Under active service or work order",
      };
    }
    const isAllocated = Boolean(
      asset.assigned_property_id ||
      asset.assigned_property_code ||
      asset.assigned_unit_id ||
      asset.assigned_unit_code ||
      asset.assigned_employee_name ||
      asset.properties?.title ||
      asset.units?.unit_code ||
      asset.asset_status === "Assigned" ||
      asset.asset_status === "In Use" ||
      asset.asset_status === "Allocated"
    );

    if (isAllocated) {
      return {
        key: "allocated",
        label: "Allocated",
        badgeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
        isAllocated: true,
        canBeActioned: true,
        description: "Assigned to a property, unit, or occupant",
      };
    }

    return {
      key: "available",
      label: "Available",
      badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      isAllocated: false,
      canBeActioned: true,
      description: "In central inventory, ready for allocation",
    };
  }, [sells, writeoffs, maintenances]);

  // ── Load Reference Data & Assets ──
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allAssets, allProps, allUnits, allVendors] = await Promise.all([
        fetchAssets(),
        fetchProperties(),
        fetchUnits(),
        FinVendorsApi.fetchAll().catch(() => []),
      ]);
      setAssets(allAssets);
      setProperties(allProps);
      setUnits(allUnits);
      setVendors(allVendors);

      // Auto-synthesize baseline warranties from assets if empty
      setWarranties(prev => {
        if (prev.length > 0) return prev;
        const initialList: AssetWarrantyRecord[] = [];
        allAssets.slice(0, 30).forEach((a, idx) => {
          const startDate = a.purchase_date || "2025-01-15";
          const durMonths = (idx % 3 === 0) ? 24 : (idx % 2 === 0) ? 36 : 12;
          const expDate = new Date(startDate);
          expDate.setMonth(expDate.getMonth() + durMonths);
          const expIso = expDate.toISOString().split("T")[0];

          const todayStr = getTodayIST();
          const isExpired = expIso < todayStr;
          const daysLeft = Math.ceil((new Date(expIso).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24));
          const isExpiringSoon = !isExpired && daysLeft <= 45;

          const wType = (idx % 4 === 0) ? "Annual Maintenance Contract (AMC)" : (idx % 3 === 0) ? "Extended Warranty" : "Standard Manufacturer";
          
          initialList.push({
            id: `WAR-${a.asset_code || `AST-${1000 + idx}`}`,
            asset_id: a.id,
            asset_name: a.asset_name,
            asset_code: a.asset_code || `AST-${1000 + idx}`,
            warranty_type: wType as any,
            provider_name: a.supplier || "Al-Futtaim Technologies / LG Electronics",
            policy_number: `POL-QA-2026-${5000 + idx}`,
            support_email: "service@alfuttaim.qa",
            support_phone: "+974 4455 6677",
            start_date: startDate,
            expiry_date: expIso,
            duration_months: durMonths,
            coverage_scope: "Comprehensive Parts, Compressor & On-site Repair Labor",
            status: isExpired ? "EXPIRED" : isExpiringSoon ? "EXPIRING_SOON" : wType === "Extended Warranty" ? "EXTENDED" : "ACTIVE",
            documents: [
              { id: `doc-${idx}-1`, name: "Warranty Certificate", file_name: `Warranty_Cert_${a.asset_code || a.id.slice(0, 6)}.pdf`, upload_date: startDate },
              { id: `doc-${idx}-2`, name: "Purchase Invoice", file_name: `Invoice_INV_${a.asset_code || a.id.slice(0, 6)}.pdf`, upload_date: startDate },
            ],
            created_at: new Date().toISOString()
          });
        });
        return initialList;
      });
    } catch (err: any) {
      toast.error(`Failed to load assets: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Unallocated (Available) Assets Memo ──
  const availableUnallocatedAssets = useMemo(() => {
    return assets.filter(a => {
      const st = getAssetStatus(a);
      return !st.isAllocated && st.key === "available";
    });
  }, [assets, getAssetStatus]);

  // ── Currently Allocated Assets Memo ──
  const allocatedAssetsList = useMemo(() => {
    return assets.filter(a => getAssetStatus(a).isAllocated);
  }, [assets, getAssetStatus]);

  // Filtered & Paged Allocated Assets for Allocation screen
  const filteredAllocatedAssets = useMemo(() => {
    if (!allocSearch.trim()) return allocatedAssetsList;
    const q = allocSearch.toLowerCase();
    return allocatedAssetsList.filter(a =>
      a.asset_name?.toLowerCase().includes(q) ||
      a.asset_code?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q) ||
      a.assigned_property_code?.toLowerCase().includes(q) ||
      a.assigned_unit_code?.toLowerCase().includes(q) ||
      a.assigned_employee_name?.toLowerCase().includes(q) ||
      a.properties?.title?.toLowerCase().includes(q)
    );
  }, [allocatedAssetsList, allocSearch]);

  const pagedAllocatedAssets = useMemo(() => {
    const start = (allocPage - 1) * allocPageSize;
    return filteredAllocatedAssets.slice(start, start + allocPageSize);
  }, [filteredAllocatedAssets, allocPage, allocPageSize]);

  // Paged Allocation History
  const pagedAllocationHistory = useMemo(() => {
    const start = (historyPage - 1) * historyPageSize;
    return allocations.slice(start, start + historyPageSize);
  }, [allocations, historyPage, historyPageSize]);

  // ── Warranties Filtered & Paged List ──
  const filteredWarranties = useMemo(() => {
    return warranties.filter(w => {
      if (warrantyFilter === "active" && w.status !== "ACTIVE" && w.status !== "EXTENDED") return false;
      if (warrantyFilter === "expiring" && w.status !== "EXPIRING_SOON") return false;
      if (warrantyFilter === "extended" && w.warranty_type !== "Extended Warranty" && w.warranty_type !== "Annual Maintenance Contract (AMC)") return false;
      if (warrantyFilter === "expired" && w.status !== "EXPIRED") return false;

      if (warrantySearch.trim()) {
        const q = warrantySearch.toLowerCase();
        return (
          w.asset_name?.toLowerCase().includes(q) ||
          w.asset_code?.toLowerCase().includes(q) ||
          w.provider_name?.toLowerCase().includes(q) ||
          w.policy_number?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [warranties, warrantyFilter, warrantySearch]);

  const pagedWarranties = useMemo(() => {
    const start = (warrantyPage - 1) * warrantyPageSize;
    return filteredWarranties.slice(start, start + warrantyPageSize);
  }, [filteredWarranties, warrantyPage, warrantyPageSize]);

  // ── Warranty Metrics ──
  const warrantyCounts = useMemo(() => {
    let active = 0;
    let expiringSoon = 0;
    let expired = 0;
    let extended = 0;

    warranties.forEach(w => {
      if (w.status === "ACTIVE") active++;
      if (w.status === "EXPIRING_SOON") expiringSoon++;
      if (w.status === "EXPIRED") expired++;
      if (w.warranty_type === "Extended Warranty" || w.warranty_type === "Annual Maintenance Contract (AMC)") extended++;
    });

    return { total: warranties.length, active, expiringSoon, expired, extended };
  }, [warranties]);

  // ── Status Counts ──
  const assetCounts = useMemo(() => {
    let available = 0;
    let allocated = 0;
    let maintenance = 0;
    let disposed = 0;

    assets.forEach(a => {
      const st = getAssetStatus(a);
      if (st.key === "available") available++;
      else if (st.key === "allocated") allocated++;
      else if (st.key === "maintenance") maintenance++;
      else if (st.key === "sold" || st.key === "writeoff") disposed++;
    });

    return { total: assets.length, available, allocated, maintenance, disposed };
  }, [assets, getAssetStatus]);

  // ── Filtered Assets for Registry Table ──
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const st = getAssetStatus(a);
      if (activeRegistryFilter === "available" && st.key !== "available") return false;
      if (activeRegistryFilter === "allocated" && st.key !== "allocated") return false;
      if (activeRegistryFilter === "maintenance" && st.key !== "maintenance") return false;
      if (activeRegistryFilter === "disposed" && st.key !== "sold" && st.key !== "writeoff") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = a.asset_name?.toLowerCase().includes(q);
        const matchCode = a.asset_code?.toLowerCase().includes(q);
        const matchCat = a.category?.toLowerCase().includes(q);
        const matchSerial = a.serial_number?.toLowerCase().includes(q);
        const matchProp = a.assigned_property_code?.toLowerCase().includes(q) || a.properties?.title?.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchCat && !matchSerial && !matchProp) return false;
      }
      return true;
    });
  }, [assets, activeRegistryFilter, searchQuery, getAssetStatus]);

  const pagedAssets = useMemo(() => {
    const start = (registryPage - 1) * registryPageSize;
    return filteredAssets.slice(start, start + registryPageSize);
  }, [filteredAssets, registryPage, registryPageSize]);

  // Paged lists for other submodules
  const pagedMaintenances = useMemo(() => {
    const start = (maintPage - 1) * maintPageSize;
    return maintenances.slice(start, start + maintPageSize);
  }, [maintenances, maintPage, maintPageSize]);

  const pagedRevaluations = useMemo(() => {
    const start = (revalPage - 1) * revalPageSize;
    return revaluations.slice(start, start + revalPageSize);
  }, [revaluations, revalPage, revalPageSize]);

  const pagedSells = useMemo(() => {
    const start = (sellPage - 1) * sellPageSize;
    return sells.slice(start, start + sellPageSize);
  }, [sells, sellPage, sellPageSize]);

  const pagedWriteoffs = useMemo(() => {
    const start = (writeoffPage - 1) * writeoffPageSize;
    return writeoffs.slice(start, start + writeoffPageSize);
  }, [writeoffs, writeoffPage, writeoffPageSize]);

  // ── Asset Depreciation Computed Calculations ──
  const assetDepreciationList = useMemo(() => {
    return assets.map((a, idx) => {
      const cost = Number(a.purchase_cost) || 0;
      const purchaseYear = a.purchase_date ? new Date(a.purchase_date).getFullYear() : 2024;
      const currentYear = new Date().getFullYear();
      const yearsElapsed = Math.max(0, currentYear - purchaseYear);
      const usefulYears = a.life_of_asset ? Math.max(1, Math.round(Number(a.life_of_asset) / 12)) : 5;
      const deprMethod: "Straight Line Method (SLM)" | "Written Down Value (WDV)" = 
        a.brand?.includes("WDV") || (idx % 3 === 0) ? "Written Down Value (WDV)" : "Straight Line Method (SLM)";
      const ratePct = deprMethod === "Straight Line Method (SLM)" ? +(100 / usefulYears).toFixed(1) : +(150 / usefulYears).toFixed(1);

      let accumulated = 0;
      if (deprMethod === "Straight Line Method (SLM)") {
        const annualDepr = cost / usefulYears;
        accumulated = Math.min(cost, annualDepr * Math.min(yearsElapsed, usefulYears));
      } else {
        let remaining = cost;
        for (let y = 0; y < Math.min(yearsElapsed, usefulYears); y++) {
          const yearDepr = remaining * (ratePct / 100);
          accumulated += yearDepr;
          remaining -= yearDepr;
        }
      }
      accumulated = Math.round(accumulated);
      const bookValue = Math.max(0, cost - accumulated);

      return {
        id: `DEPR-${a.id}`,
        asset_id: a.id,
        asset_name: a.asset_name,
        asset_code: a.asset_code || `AST-${1000 + idx}`,
        category: a.category || "General Asset",
        purchase_date: a.purchase_date || "2024-01-01",
        acquisition_cost: cost,
        depreciation_method: deprMethod,
        useful_life_years: usefulYears,
        depreciation_rate_pct: ratePct,
        accumulated_depreciation: accumulated,
        current_book_value: bookValue,
        last_depreciation_date: `${currentYear}-01-01`,
        fiscal_year: "2025-2026",
      };
    });
  }, [assets]);

  const filteredDepreciationList = useMemo(() => {
    return assetDepreciationList.filter(item => {
      if (deprMethodFilter === "slm" && item.depreciation_method !== "Straight Line Method (SLM)") return false;
      if (deprMethodFilter === "wdv" && item.depreciation_method !== "Written Down Value (WDV)") return false;
      if (deprSearch.trim()) {
        const q = deprSearch.toLowerCase();
        return (
          item.asset_name?.toLowerCase().includes(q) ||
          item.asset_code?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [assetDepreciationList, deprMethodFilter, deprSearch]);

  const pagedDepreciationList = useMemo(() => {
    const start = (deprPage - 1) * deprPageSize;
    return filteredDepreciationList.slice(start, start + deprPageSize);
  }, [filteredDepreciationList, deprPage, deprPageSize]);

  const depreciationMetrics = useMemo(() => {
    let totalCost = 0;
    let totalAccum = 0;
    let totalNetBook = 0;
    assetDepreciationList.forEach(item => {
      totalCost += item.acquisition_cost;
      totalAccum += item.accumulated_depreciation;
      totalNetBook += item.current_book_value;
    });
    return {
      totalAssets: assetDepreciationList.length,
      totalCost,
      totalAccum,
      totalNetBook,
    };
  }, [assetDepreciationList]);

  // Open Post Depreciation Dialog for a single or global batch
  function openDepreciationModal(targetAsset?: Asset) {
    if (targetAsset) {
      setSelectedAssetForDepr(targetAsset);
      const cost = Number(targetAsset.purchase_cost) || 0;
      const usefulYears = targetAsset.life_of_asset ? Math.max(1, Math.round(Number(targetAsset.life_of_asset) / 12)) : 5;
      const isWdv = targetAsset.brand?.includes("WDV");
      const deprMethod: "Straight Line Method (SLM)" | "Written Down Value (WDV)" = isWdv ? "Written Down Value (WDV)" : "Straight Line Method (SLM)";
      const ratePct = isWdv ? (150 / usefulYears) : (100 / usefulYears);
      const annualCharge = Math.round(cost * (ratePct / 100));

      setDepreciationForm({
        fiscal_year: "2025-2026",
        posting_date: getTodayIST(),
        depreciation_method: deprMethod,
        useful_life_years: String(usefulYears),
        depreciation_rate_pct: String(ratePct),
        charge_amount: String(annualCharge),
        remarks: `Annual Depreciation Charge FY 2025-26 for ${targetAsset.asset_name} (${targetAsset.asset_code || ""})`,
      });
    } else {
      setSelectedAssetForDepr(null);
      setDepreciationForm({
        fiscal_year: "2025-2026",
        posting_date: getTodayIST(),
        depreciation_method: "Straight Line Method (SLM)",
        useful_life_years: "5",
        depreciation_rate_pct: "20",
        charge_amount: String(Math.round(depreciationMetrics.totalCost * 0.15)),
        remarks: "Portfolio-wide Periodic Depreciation Run for FY 2025-2026",
      });
    }
    setShowDepreciationModal(true);
  }

  // Handle Post Depreciation Run to General Ledger
  function handlePostDepreciation() {
    const charge = Number(depreciationForm.charge_amount) || 0;
    if (charge <= 0) {
      toast.error("Please enter a valid depreciation charge amount.");
      return;
    }

    setSaving(true);
    try {
      const jeNumber = `JE-DEPR-${Date.now().toString().slice(-6)}`;
      addJournalEntry({
        je_no: jeNumber,
        posting_date: depreciationForm.posting_date || getTodayIST(),
        reference: selectedAssetForDepr ? (selectedAssetForDepr.asset_code || selectedAssetForDepr.id) : "PORTFOLIO-BATCH",
        narration: depreciationForm.remarks || `Depreciation Expense: ${selectedAssetForDepr ? selectedAssetForDepr.asset_name : "Portfolio Batch"} (FY ${depreciationForm.fiscal_year})`,
        dr_account: "Depreciation Expense on Fixed Assets",
        dr_code: "54100001",
        cr_account: "Accumulated Depreciation - Fixed Assets",
        cr_code: "12400001",
        amount: charge,
      });

      toast.success(
        selectedAssetForDepr
          ? `Depreciation of QAR ${charge.toLocaleString()} posted to GL for ${selectedAssetForDepr.asset_name} (${jeNumber}).`
          : `Batch depreciation of QAR ${charge.toLocaleString()} posted to GL (${jeNumber}).`
      );
      setShowDepreciationModal(false);
    } catch (err: any) {
      toast.error(`Depreciation posting failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  // ── Open Edit Asset Modal ──
  function openEditAssetModal(a: Asset) {
    setEditingAsset(a);
    setEditForm({
      asset_name: a.asset_name || "",
      category: a.category || "Furniture",
      asset_code: a.asset_code || "",
      serial_number: a.serial_number || "",
      purchase_cost: a.purchase_cost ? String(a.purchase_cost) : "",
      purchase_date: a.purchase_date || getTodayIST(),
      life_of_asset: a.life_of_asset ? String(a.life_of_asset) : "60",
      brand: a.brand || "Straight Line Method (SLM)",
      supplier: a.supplier || "",
      asset_condition: a.asset_condition || "Good",
      description: a.description || "",
    });
  }

  // ── Submit Edit Asset Form ──
  async function handleEditAssetSubmit() {
    if (!editingAsset) return;
    if (!editForm.asset_name.trim()) {
      toast.error("Please enter an asset name.");
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<Asset> = {
        asset_name: editForm.asset_name.trim(),
        category: editForm.category,
        asset_code: editForm.asset_code.trim() || editingAsset.asset_code,
        serial_number: editForm.serial_number.trim() || undefined,
        purchase_cost: editForm.purchase_cost ? Number(editForm.purchase_cost) : 0,
        purchase_date: editForm.purchase_date || undefined,
        life_of_asset: editForm.life_of_asset ? Number(editForm.life_of_asset) : undefined,
        brand: editForm.brand || undefined,
        supplier: editForm.supplier || undefined,
        asset_condition: editForm.asset_condition || "Good",
        description: editForm.description || undefined,
      };

      await updateAsset(editingAsset.id, payload);
      setAssets(prev => prev.map(a => a.id === editingAsset.id ? { ...a, ...payload } : a));
      if (selectedAssetForDetail?.id === editingAsset.id) {
        setSelectedAssetForDetail(prev => prev ? { ...prev, ...payload } : null);
      }
      toast.success(`Asset "${editForm.asset_name}" updated successfully.`);
      setEditingAsset(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update asset.");
    } finally {
      setSaving(false);
    }
  }

  // ── Open Warranty Registration / Extension Modal ──
  function openWarrantyModal(asset?: Asset, existingWarranty?: AssetWarrantyRecord) {
    if (existingWarranty) {
      setWarrantyModalMode("EXTEND");
      setSelectedWarrantyToEdit(existingWarranty);
      setWarrantyForm({
        asset_id: existingWarranty.asset_id,
        warranty_type: existingWarranty.warranty_type,
        provider_name: existingWarranty.provider_name,
        policy_number: existingWarranty.policy_number || "",
        support_email: existingWarranty.support_email || "",
        support_phone: existingWarranty.support_phone || "",
        start_date: existingWarranty.start_date,
        duration_months: String(existingWarranty.duration_months || 12),
        expiry_date: existingWarranty.expiry_date,
        coverage_scope: existingWarranty.coverage_scope || "",
        amc_cost: String(existingWarranty.amc_cost || 0),
        new_doc_name: "Extended Warranty Agreement",
        new_doc_filename: "",
        documents: existingWarranty.documents || [],
      });
    } else {
      setWarrantyModalMode("NEW");
      setSelectedWarrantyToEdit(null);
      setWarrantyForm({
        asset_id: asset?.id || "",
        warranty_type: "Standard Manufacturer",
        provider_name: asset?.supplier || "",
        policy_number: `POL-${Date.now().toString().slice(-6)}`,
        support_email: "support@provider.qa",
        support_phone: "+974 4400 0000",
        start_date: asset?.purchase_date || getTodayIST(),
        duration_months: "12",
        expiry_date: "",
        coverage_scope: "Comprehensive Parts & On-site Repair SLA",
        amc_cost: "0",
        new_doc_name: "Warranty Certificate",
        new_doc_filename: "",
        documents: [
          { id: `doc-${Date.now()}`, name: "Warranty Certificate", file_name: `Warranty_Cert_${asset?.asset_code || "AST"}.pdf`, upload_date: getTodayIST() }
        ],
      });
    }
    setShowWarrantyModal(true);
  }

  // ── Save Warranty Record (New or Extended) ──
  function handleSaveWarranty() {
    if (!warrantyForm.asset_id || !warrantyForm.provider_name) {
      toast.error("Please select an asset and specify the warranty provider.");
      return;
    }
    const asset = assets.find(a => a.id === warrantyForm.asset_id);
    if (!asset) return;

    const todayStr = getTodayIST();
    const isExpired = warrantyForm.expiry_date < todayStr;
    const daysLeft = Math.ceil((new Date(warrantyForm.expiry_date).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24));
    const isExpiringSoon = !isExpired && daysLeft <= 45;

    const status: AssetWarrantyRecord["status"] = isExpired ? "EXPIRED" : isExpiringSoon ? "EXPIRING_SOON" : warrantyForm.warranty_type === "Extended Warranty" ? "EXTENDED" : "ACTIVE";

    const record: AssetWarrantyRecord = {
      id: selectedWarrantyToEdit ? selectedWarrantyToEdit.id : `WAR-${asset.asset_code || Date.now().toString().slice(-6)}`,
      asset_id: asset.id,
      asset_name: asset.asset_name,
      asset_code: asset.asset_code || "",
      warranty_type: warrantyForm.warranty_type,
      provider_name: warrantyForm.provider_name,
      policy_number: warrantyForm.policy_number,
      support_email: warrantyForm.support_email,
      support_phone: warrantyForm.support_phone,
      start_date: warrantyForm.start_date,
      expiry_date: warrantyForm.expiry_date,
      duration_months: Number(warrantyForm.duration_months) || 12,
      coverage_scope: warrantyForm.coverage_scope,
      amc_cost: Number(warrantyForm.amc_cost) || 0,
      status,
      documents: warrantyForm.documents,
      created_at: selectedWarrantyToEdit ? selectedWarrantyToEdit.created_at : new Date().toISOString(),
    };

    setWarranties(prev => {
      const idx = prev.findIndex(w => w.asset_id === asset.id || (selectedWarrantyToEdit && w.id === selectedWarrantyToEdit.id));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [record, ...prev];
    });

    toast.success(`Warranty terms updated for ${asset.asset_name}. Documents attached.`);
    setShowWarrantyModal(false);
  }

  // ── Contextual Open Allocation Dialog ──
  function openAllocationModalForAsset(asset: Asset, mode: "ALLOCATE" | "DEALLOCATE" | "TRANSFER") {
    setAllocationMode(mode);
    setAllocationTargetAsset(asset);
    
    // Check if currently assigned to Corporate Office / staff
    const isCorpStaff = asset.assigned_property_code === "Corporate Office" || (!asset.assigned_property_id && Boolean(asset.assigned_employee_name));

    setAllocationForm({
      asset_id: asset.id,
      allocation_type: isCorpStaff ? "OFFICIAL_STAFF" : "PROPERTY_UNIT",
      to_property_id: mode === "TRANSFER" ? (asset.assigned_property_id || "") : "",
      to_unit_id: mode === "TRANSFER" ? (asset.assigned_unit_code || asset.assigned_unit_id || "") : "",
      to_employee_name: asset.assigned_employee_name || "",
      department: isCorpStaff ? (asset.assigned_unit_code || "Administration & Executive") : "",
      condition: "Good / Operational",
      date: getTodayIST(),
      remarks: mode === "DEALLOCATE" ? "Returned to central inventory" : "",
    });
    setShowAllocationDialog(true);
  }

  // ── Allocation Dialog Submit Handler ──
  async function handleConfirmAllocation() {
    if (!allocationForm.asset_id) {
      toast.error("Please select an asset.");
      return;
    }
    const asset = assets.find(a => a.id === allocationForm.asset_id);
    if (!asset) return;

    const currentStatus = getAssetStatus(asset);

    if (allocationMode === "ALLOCATE") {
      if (currentStatus.isAllocated) {
        toast.error("This asset is already allocated. Use Transfer to relocate or Deallocate first.");
        return;
      }

      if (allocationForm.allocation_type === "OFFICIAL_STAFF") {
        if (!allocationForm.to_employee_name.trim()) {
          toast.error("Please enter or select the official staff member name.");
          return;
        }

        const corpProp = properties.find(p => 
          p.title?.toLowerCase().includes("corporate") || 
          p.title?.toLowerCase().includes("headquarter") || 
          p.title?.toLowerCase().includes("hq")
        );

        const locationDetails = allocationForm.department 
          ? `${allocationForm.department}${allocationForm.to_unit_id ? ` • ${allocationForm.to_unit_id}` : ""}`
          : (allocationForm.to_unit_id || "HQ Office Space");

        setSaving(true);
        try {
          await updateAsset(asset.id, {
            assigned_property_id: corpProp?.id || undefined,
            assigned_property_code: "Corporate Office",
            assigned_unit_id: undefined,
            assigned_unit_code: locationDetails,
            assigned_employee_name: allocationForm.to_employee_name.trim(),
            asset_status: "Assigned"
          });

          const newRec: AssetAllocationRecord = {
            id: String(Date.now()),
            asset_id: asset.id,
            asset_name: asset.asset_name,
            asset_code: asset.asset_code || "",
            action_type: "ALLOCATION",
            allocation_type: "OFFICIAL_STAFF",
            from_property: "Central Storage (Available)",
            to_property: "Corporate Office",
            to_unit: locationDetails,
            to_employee: allocationForm.to_employee_name.trim(),
            department: allocationForm.department || "Corporate Office",
            date: allocationForm.date,
            remarks: allocationForm.remarks || `Allocated to Official Staff: ${allocationForm.to_employee_name.trim()} (${allocationForm.department || "Corporate Office"})`,
            condition: allocationForm.condition
          };
          setAllocations(prev => [newRec, ...prev]);
          toast.success(`Asset "${asset.asset_name}" allocated to ${allocationForm.to_employee_name.trim()} at Corporate Office.`);
          setShowAllocationDialog(false);
          setAllocationForm({ asset_id: "", allocation_type: "PROPERTY_UNIT", to_property_id: "", to_unit_id: "", to_employee_name: "", department: "", condition: "Good / Operational", date: getTodayIST(), remarks: "" });
          await load();
        } catch (err: any) {
          toast.error(`Allocation failed: ${err.message}`);
        } finally { setSaving(false); }

      } else {
        if (!allocationForm.to_property_id) {
          toast.error("Please select a target Property for allocation.");
          return;
        }
        const targetProp = properties.find(p => p.id === allocationForm.to_property_id);
        const targetUnit = units.find(u => u.id === allocationForm.to_unit_id);

        setSaving(true);
        try {
          await updateAsset(asset.id, {
            assigned_property_id: targetProp?.id,
            assigned_property_code: targetProp?.title,
            assigned_unit_id: targetUnit?.id || undefined,
            assigned_unit_code: targetUnit?.unit_ref || undefined,
            assigned_employee_name: allocationForm.to_employee_name.trim() || undefined,
            asset_status: "Assigned"
          });

          const newRec: AssetAllocationRecord = {
            id: String(Date.now()),
            asset_id: asset.id,
            asset_name: asset.asset_name,
            asset_code: asset.asset_code || "",
            action_type: "ALLOCATION",
            allocation_type: "PROPERTY_UNIT",
            from_property: "Central Storage (Available)",
            to_property: targetProp?.title || "Property",
            to_unit: targetUnit?.unit_ref,
            to_employee: allocationForm.to_employee_name.trim() || undefined,
            date: allocationForm.date,
            remarks: allocationForm.remarks || "Allocated to property/unit",
            condition: allocationForm.condition
          };
          setAllocations(prev => [newRec, ...prev]);
          toast.success(`Asset "${asset.asset_name}" allocated to ${targetProp?.title}${targetUnit ? ` (Unit ${targetUnit.unit_ref})` : ""}.`);
          setShowAllocationDialog(false);
          setAllocationForm({ asset_id: "", allocation_type: "PROPERTY_UNIT", to_property_id: "", to_unit_id: "", to_employee_name: "", department: "", condition: "Good / Operational", date: getTodayIST(), remarks: "" });
          await load();
        } catch (err: any) {
          toast.error(`Allocation failed: ${err.message}`);
        } finally { setSaving(false); }
      }

    } else if (allocationMode === "DEALLOCATE") {
      setSaving(true);
      try {
        const fromPropName = asset.assigned_property_code || asset.properties?.title || "Allocated Site";
        const fromUnitRef = asset.assigned_unit_code || asset.units?.unit_code;

        await updateAsset(asset.id, {
          assigned_property_id: undefined,
          assigned_property_code: undefined,
          assigned_unit_id: undefined,
          assigned_unit_code: undefined,
          assigned_employee_id: undefined,
          assigned_employee_name: undefined,
          asset_status: "Available"
        });

        const newRec: AssetAllocationRecord = {
          id: String(Date.now()),
          asset_id: asset.id,
          asset_name: asset.asset_name,
          asset_code: asset.asset_code || "",
          action_type: "DEALLOCATION",
          from_property: fromPropName,
          from_unit: fromUnitRef,
          from_employee: asset.assigned_employee_name,
          to_property: "Central Storage (Available)",
          date: allocationForm.date,
          remarks: allocationForm.remarks || "Returned / Deallocated to inventory pool",
          condition: allocationForm.condition
        };
        setAllocations(prev => [newRec, ...prev]);
        toast.success(`Asset "${asset.asset_name}" deallocated and returned to inventory pool.`);
        setShowAllocationDialog(false);
        setAllocationForm({ asset_id: "", allocation_type: "PROPERTY_UNIT", to_property_id: "", to_unit_id: "", to_employee_name: "", department: "", condition: "Good / Operational", date: getTodayIST(), remarks: "" });
        await load();
      } catch (err: any) {
        toast.error(`Deallocation failed: ${err.message}`);
      } finally { setSaving(false); }

    } else if (allocationMode === "TRANSFER") {
      const fromPropName = asset.assigned_property_code || asset.properties?.title || "General Pool";
      const fromUnitRef = asset.assigned_unit_code || asset.units?.unit_code;

      if (allocationForm.allocation_type === "OFFICIAL_STAFF") {
        if (!allocationForm.to_employee_name.trim()) {
          toast.error("Please enter or select the official staff member.");
          return;
        }

        const corpProp = properties.find(p => 
          p.title?.toLowerCase().includes("corporate") || 
          p.title?.toLowerCase().includes("headquarter") || 
          p.title?.toLowerCase().includes("hq")
        );

        const locationDetails = allocationForm.department 
          ? `${allocationForm.department}${allocationForm.to_unit_id ? ` • ${allocationForm.to_unit_id}` : ""}`
          : (allocationForm.to_unit_id || "HQ Office Space");

        setSaving(true);
        try {
          await updateAsset(asset.id, {
            assigned_property_id: corpProp?.id || undefined,
            assigned_property_code: "Corporate Office",
            assigned_unit_id: undefined,
            assigned_unit_code: locationDetails,
            assigned_employee_name: allocationForm.to_employee_name.trim(),
            asset_status: "Assigned"
          });

          const newRec: AssetAllocationRecord = {
            id: String(Date.now()),
            asset_id: asset.id,
            asset_name: asset.asset_name,
            asset_code: asset.asset_code || "",
            action_type: "TRANSFER",
            allocation_type: "OFFICIAL_STAFF",
            from_property: fromPropName,
            from_unit: fromUnitRef,
            from_employee: asset.assigned_employee_name,
            to_property: "Corporate Office",
            to_unit: locationDetails,
            to_employee: allocationForm.to_employee_name.trim(),
            department: allocationForm.department || "Corporate Office",
            date: allocationForm.date,
            remarks: allocationForm.remarks || `Transferred to Official Staff: ${allocationForm.to_employee_name.trim()} at Corporate Office`,
            condition: allocationForm.condition
          };
          setAllocations(prev => [newRec, ...prev]);
          toast.success(`Asset "${asset.asset_name}" transferred to ${allocationForm.to_employee_name.trim()} (Corporate Office).`);
          setShowAllocationDialog(false);
          setAllocationForm({ asset_id: "", allocation_type: "PROPERTY_UNIT", to_property_id: "", to_unit_id: "", to_employee_name: "", department: "", condition: "Good / Operational", date: getTodayIST(), remarks: "" });
          await load();
        } catch (err: any) {
          toast.error(`Transfer failed: ${err.message}`);
        } finally { setSaving(false); }

      } else {
        if (!allocationForm.to_property_id) {
          toast.error("Please select a target Property for transfer.");
          return;
        }
        const targetProp = properties.find(p => p.id === allocationForm.to_property_id);
        const targetUnit = units.find(u => u.id === allocationForm.to_unit_id);

        setSaving(true);
        try {
          await updateAsset(asset.id, {
            assigned_property_id: targetProp?.id,
            assigned_property_code: targetProp?.title,
            assigned_unit_id: targetUnit?.id || undefined,
            assigned_unit_code: targetUnit?.unit_ref || undefined,
            assigned_employee_name: allocationForm.to_employee_name.trim() || asset.assigned_employee_name,
            asset_status: "Assigned"
          });

          const newRec: AssetAllocationRecord = {
            id: String(Date.now()),
            asset_id: asset.id,
            asset_name: asset.asset_name,
            asset_code: asset.asset_code || "",
            action_type: "TRANSFER",
            allocation_type: "PROPERTY_UNIT",
            from_property: fromPropName,
            from_unit: fromUnitRef,
            from_employee: asset.assigned_employee_name,
            to_property: targetProp?.title,
            to_unit: targetUnit?.unit_ref,
            to_employee: allocationForm.to_employee_name.trim() || asset.assigned_employee_name,
            date: allocationForm.date,
            remarks: allocationForm.remarks || `Transferred from ${fromPropName} to ${targetProp?.title}`,
            condition: allocationForm.condition
          };
          setAllocations(prev => [newRec, ...prev]);
          toast.success(`Asset "${asset.asset_name}" transferred to ${targetProp?.title}.`);
          setShowAllocationDialog(false);
          setAllocationForm({ asset_id: "", allocation_type: "PROPERTY_UNIT", to_property_id: "", to_unit_id: "", to_employee_name: "", department: "", condition: "Good / Operational", date: getTodayIST(), remarks: "" });
          await load();
        } catch (err: any) {
          toast.error(`Transfer failed: ${err.message}`);
        } finally { setSaving(false); }
      }
    }
  }

  // ── Asset Maintenance Handlers ──
  async function handleCreateMaintenance() {
    if (!maintForm.asset_id) {
      toast.error("Please select an asset for maintenance.");
      return;
    }
    const asset = assets.find(a => a.id === maintForm.asset_id);
    if (!asset) return;

    const st = getAssetStatus(asset);
    if (st.isAllocated) {
      toast.error(`Cannot schedule maintenance. "${asset.asset_name}" is currently allocated. Please deallocate it first.`);
      return;
    }

    setSaving(true);
    try {
      const newMaint: AssetMaintenanceRecord = {
        id: `WO-MAINT-${Date.now().toString().slice(-6)}`,
        asset_id: asset.id,
        asset_name: asset.asset_name,
        asset_code: asset.asset_code || "",
        maintenance_type: maintForm.maintenance_type,
        priority: maintForm.priority,
        service_vendor: maintForm.service_vendor || "In-House Facility Team",
        technician_name: maintForm.technician_name,
        scheduled_date: maintForm.scheduled_date,
        estimated_cost: Number(maintForm.estimated_cost) || 0,
        status: "SCHEDULED",
        description: maintForm.description || "Routine preventive / corrective service work order",
        created_at: new Date().toISOString()
      };

      setMaintenances(prev => [newMaint, ...prev]);
      await updateAsset(asset.id, { asset_status: "Maintenance" }).catch(() => {});
      toast.success(`Maintenance Order ${newMaint.id} created for ${asset.asset_name}.`);
      setShowNewMaintenance(false);
      setMaintForm({
        asset_id: "",
        maintenance_type: "Preventive Maintenance",
        priority: "Medium",
        service_vendor: "",
        technician_name: "",
        scheduled_date: getTodayIST(),
        estimated_cost: "0",
        description: "",
      });
      await load();
    } catch (err: any) {
      toast.error(`Failed to create maintenance: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleStartMaintenance(maint: AssetMaintenanceRecord) {
    setMaintenances(prev => prev.map(m => m.id === maint.id ? { ...m, status: "IN_PROGRESS" } : m));
    toast.success(`Work order ${maint.id} marked In-Progress.`);
  }

  async function handleCompleteMaintenance() {
    if (!completeMaintModal) return;
    const actualCost = Number(completeMaintForm.actual_cost) || completeMaintModal.estimated_cost;

    setMaintenances(prev => prev.map(m => {
      if (m.id === completeMaintModal.id) {
        return {
          ...m,
          status: "COMPLETED",
          actual_cost: actualCost,
          completed_date: completeMaintForm.completed_date,
          completion_notes: completeMaintForm.completion_notes,
          invoice_ref: completeMaintForm.invoice_ref,
        };
      }
      return m;
    }));

    await updateAsset(completeMaintModal.asset_id, { asset_status: "Available" }).catch(() => {});
    toast.success(`Maintenance work order ${completeMaintModal.id} completed. Asset restored to Available inventory.`);
    setCompleteMaintModal(null);
    setCompleteMaintForm({ actual_cost: "", completed_date: getTodayIST(), completion_notes: "", invoice_ref: "" });
    await load();
  }

  async function handleCancelMaintenance(maint: AssetMaintenanceRecord) {
    if (!confirm(`Cancel maintenance work order ${maint.id}?`)) return;
    setMaintenances(prev => prev.map(m => m.id === maint.id ? { ...m, status: "CANCELLED" } : m));
    await updateAsset(maint.asset_id, { asset_status: "Available" }).catch(() => {});
    toast.info(`Maintenance Order ${maint.id} cancelled.`);
    await load();
  }

  // ── Multi-Step Direct Asset Creation Handler ──
  async function handleCreateAsset() {
    if (!form.item_name.trim()) {
      toast.error("Please enter an Asset / Item Name.");
      setStepperStep(1);
      return;
    }
    const acqAmount = Number(form.acquisition_amount) || 0;
    const usefulLifeMonths = (Number(form.useful_life_years) || 5) * 12;
    const tagCode = form.asset_tag_id.trim() || `AST-${Date.now().toString().slice(-4)}`;

    setSaving(true);
    try {
      // 1. Create the Asset record in Supabase / Local database
      const newAsset = await createAsset({
        asset_name: form.item_name.trim(),
        category: form.category,
        asset_code: tagCode,
        serial_number: form.serial_number.trim() || undefined,
        purchase_cost: acqAmount,
        purchase_date: form.commission_date,
        life_of_asset: usefulLifeMonths,
        brand: form.depreciation_method,
        supplier: vendors.find(v => v.id === form.vendor_id)?.name || form.warranty_provider || undefined,
        asset_condition: "New",
        asset_status: "Available",
        description: form.specifications.length > 0 ? form.specifications.map(s => `${s.spec_type}: ${s.spec_details}`).join(" | ") : undefined,
      });

      // 2. Post Journal Entry for Fixed Asset Capitalization if amount > 0
      if (acqAmount > 0) {
        addJournalEntry({
          je_no: `JE-AST-CAP-${Date.now().toString().slice(-6)}`,
          posting_date: form.commission_date,
          reference: tagCode,
          narration: `Asset Capitalization & Acquisition: ${form.item_name} (Tag: ${tagCode})`,
          dr_account: "Fixed Asset (Capital Cost / Asset A/C)",
          dr_code: "12300001",
          cr_account: "Trade Payables (Vendors / Supplier A/C)",
          cr_code: "22100001",
          amount: acqAmount,
        });
      }

      // 3. Register Warranty & Documents if configured
      if (form.has_warranty && form.warranty_provider.trim()) {
        const todayStr = getTodayIST();
        const isExpired = form.warranty_expiry_date < todayStr;
        const daysLeft = Math.ceil((new Date(form.warranty_expiry_date).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24));
        const isExpiringSoon = !isExpired && daysLeft <= 45;

        const newWar: AssetWarrantyRecord = {
          id: `WAR-${tagCode}`,
          asset_id: newAsset.id,
          asset_name: form.item_name.trim(),
          asset_code: tagCode,
          warranty_type: form.warranty_type,
          provider_name: form.warranty_provider.trim(),
          policy_number: form.warranty_policy_no.trim() || `POL-${tagCode}`,
          support_email: form.warranty_support_email.trim(),
          support_phone: form.warranty_support_phone.trim(),
          start_date: form.warranty_start_date,
          expiry_date: form.warranty_expiry_date || form.warranty_start_date,
          duration_months: Number(form.warranty_duration_months) || 12,
          coverage_scope: form.warranty_coverage,
          amc_cost: Number(form.amc_fee) || 0,
          status: isExpired ? "EXPIRED" : isExpiringSoon ? "EXPIRING_SOON" : form.warranty_type === "Extended Warranty" ? "EXTENDED" : "ACTIVE",
          documents: form.documents,
          created_at: new Date().toISOString(),
        };
        setWarranties(prev => [newWar, ...prev]);
      }

      toast.success(`Asset "${form.item_name}" registered successfully with Tag ${tagCode}.`);
      setShowNew(false);
      // Reset form
      setForm({
        asset_type: "Fixed Asset",
        category: "Furniture",
        item_name: "",
        commission_date: getTodayIST(),
        put_to_use_date: getTodayIST(),
        asset_tag_id: "",
        serial_number: "",
        acquisition_amount: "",
        vendor_id: "",
        useful_life_years: "5",
        depreciation_rate: "20",
        depreciation_method: "Straight Line Method (SLM)",
        account_rows: [
          { id: "1", account_code: "12300001", account_name: "12300001 - Fixed Asset (Capital Cost / Asset A/C)", debit: "", credit: "" },
          { id: "2", account_code: "22100001", account_name: "22100001 - Trade Payables (Vendors / Supplier A/C)", debit: "", credit: "" }
        ],
        has_warranty: true,
        warranty_type: "Standard Manufacturer",
        warranty_provider: "",
        warranty_policy_no: "",
        warranty_start_date: getTodayIST(),
        warranty_duration_months: "12",
        warranty_expiry_date: "",
        warranty_support_email: "",
        warranty_support_phone: "",
        warranty_coverage: "Standard 1-Year Comprehensive Manufacturer Warranty (Parts & Labor)",
        amc_fee: "0",
        documents: [],
        doc_input_name: "Purchase Invoice",
        doc_input_file: "",
        specifications: [],
        spec_type_input: "",
        spec_details_input: "",
      });
      setStepperStep(1);
      await load();
    } catch (err: any) {
      toast.error(`Failed to create asset: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const downloadAssetCsvTemplate = () => {
    const headers = ["AssetName", "Category", "AssetTag", "SerialNumber", "AcquisitionCost", "PurchaseDate", "UsefulLifeYears", "DepreciationMethod", "Supplier", "AssetCondition", "Description"];
    const rows = [
      ["Carrier 2.5 Ton Split AC", "HVAC", "AST-HVAC-001", "CR-8829102", "3800", "2026-01-15", "7", "Straight Line Method (SLM)", "Mannai Trading", "Brand New", "Master Bedroom High-Wall AC"],
      ["LG Double-Door Refrigerator 600L", "Appliances", "AST-APP-002", "LG-RF-7721", "4500", "2026-02-01", "5", "Straight Line Method (SLM)", "LG Electronics Qatar", "Good", "Kitchen Main Refrigerator"]
    ];
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `asset_import_template_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Asset CSV template downloaded");
  };

  const handleBulkAssetImport = async () => {
    if (!bulkAssetData.trim()) {
      toast.error("Please provide CSV content to import");
      return;
    }
    setBulkAssetLoading(true);
    try {
      const lines = bulkAssetData.trim().split("\n").filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        toast.error("CSV contains no data rows");
        setBulkAssetLoading(false);
        return;
      }
      const dataRows = lines.slice(1);
      let successCount = 0;
      let failCount = 0;

      for (const line of dataRows) {
        const parts = line.split(",").map(p => p.trim());
        if (!parts[0] || !parts[4]) {
          failCount++;
          continue;
        }
        const [
          assetName, category, assetTag, serialNumber,
          acquisitionCost, purchaseDate, usefulLife, depMethod,
          supplier, condition, desc
        ] = parts;

        const code = assetTag || `AST-${String(assets.length + successCount + 1).padStart(4, "0")}`;
        const costNum = parseFloat(acquisitionCost) || 0;

        const payload: any = {
          asset_name: assetName,
          category: category || "Furniture",
          asset_code: code,
          serial_number: serialNumber || "",
          purchase_cost: costNum,
          purchase_date: purchaseDate || getTodayIST(),
          commission_date: purchaseDate || getTodayIST(),
          life_of_asset: usefulLife ? String(Number(usefulLife) * 12) : "60",
          brand: depMethod || "Straight Line Method (SLM)",
          supplier: supplier || "",
          asset_condition: condition || "Good",
          description: desc || "",
          asset_status: "Available",
          current_value: costNum,
          created_at: new Date().toISOString()
        };

        const res = await createAsset(payload);
        if (res) {
          successCount++;
        } else {
          failCount++;
        }
      }

      toast.success(`Bulk Asset Ingestion Complete: ${successCount} created, ${failCount} failed.`);
      setBulkAssetOpen(false);
      setBulkAssetData("");
      await load();
    } catch (err: any) {
      toast.error("Bulk asset import failed: " + err.message);
    } finally {
      setBulkAssetLoading(false);
    }
  };

  // ── Asset Revaluation Handler ──
  async function handleCreateRevaluation() {
    if (!revalForm.asset_id || !revalForm.new_value) {
      toast.error("Please select an asset and enter the new fair value.");
      return;
    }
    const asset = assets.find(a => a.id === revalForm.asset_id);
    if (!asset) return;

    const st = getAssetStatus(asset);
    if (st.isAllocated) {
      toast.error(`Cannot revalue "${asset.asset_name}" while allocated. Please deallocate it first.`);
      return;
    }

    const prevVal = Number(revalForm.prev_value) || Number(asset.purchase_cost) || 0;
    const newVal = Number(revalForm.new_value) || 0;
    const diff = newVal - prevVal;

    setSaving(true);
    try {
      const rec: AssetRevaluationRecord = {
        id: `REV-${Date.now().toString().slice(-6)}`,
        asset_id: asset.id,
        asset_name: asset.asset_name,
        asset_code: asset.asset_code || "",
        prev_value: prevVal,
        new_value: newVal,
        reason: revalForm.reason || "Annual Fair Value Revaluation Assessment",
        date: revalForm.date || getTodayIST(),
      };

      setRevaluations(prev => [rec, ...prev]);
      await updateAsset(asset.id, { purchase_cost: newVal }).catch(() => {});

      // Post Revaluation Journal Entry (Surplus or Impairment)
      if (diff > 0) {
        addJournalEntry({
          je_no: `JE-REVAL-UP-${Date.now().toString().slice(-6)}`,
          posting_date: revalForm.date,
          reference: rec.id,
          narration: `Asset Revaluation Surplus: ${asset.asset_name} (Tag: ${asset.asset_code})`,
          dr_account: "Fixed Asset (Capital Cost / Asset A/C)",
          dr_code: "12300001",
          cr_account: "Revaluation Reserve / Surplus A/C",
          cr_code: "31000001",
          amount: diff,
        });
      } else if (diff < 0) {
        addJournalEntry({
          je_no: `JE-REVAL-DOWN-${Date.now().toString().slice(-6)}`,
          posting_date: revalForm.date,
          reference: rec.id,
          narration: `Asset Impairment Loss: ${asset.asset_name} (Tag: ${asset.asset_code})`,
          dr_account: "Impairment Loss on Fixed Assets",
          dr_code: "54200001",
          cr_account: "Fixed Asset (Capital Cost / Asset A/C)",
          cr_code: "12300001",
          amount: Math.abs(diff),
        });
      }

      toast.success(`Revaluation recorded for ${asset.asset_name}. Book value adjusted to QAR ${newVal.toLocaleString()}.`);
      setShowRevaluation(false);
      setRevalForm({ asset_id: "", prev_value: "", new_value: "", reason: "", date: getTodayIST() });
      await load();
    } catch (err: any) {
      toast.error(`Revaluation failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  // ── Asset Sale Handler ──
  async function handleCreateSell() {
    if (!sellForm.asset_id || !sellForm.sale_value || !sellForm.buyer.trim()) {
      toast.error("Please select an asset, specify sale price, and enter the buyer name.");
      return;
    }
    const asset = assets.find(a => a.id === sellForm.asset_id);
    if (!asset) return;

    const st = getAssetStatus(asset);
    if (st.isAllocated) {
      toast.error(`Cannot sell "${asset.asset_name}" while allocated. Please deallocate it first.`);
      return;
    }

    const bookVal = Number(sellForm.book_value) || Number(asset.purchase_cost) || 0;
    const saleVal = Number(sellForm.sale_value) || 0;
    const gainLoss = saleVal - bookVal;

    setSaving(true);
    try {
      const rec: AssetSaleRecord = {
        id: `SALE-${Date.now().toString().slice(-6)}`,
        asset_id: asset.id,
        asset_name: asset.asset_name,
        asset_code: asset.asset_code || "",
        book_value: bookVal,
        sale_value: saleVal,
        buyer: sellForm.buyer.trim(),
        date: sellForm.date || getTodayIST(),
        remarks: sellForm.remarks || `Disposed via sale to ${sellForm.buyer.trim()}`,
      };

      setSells(prev => [rec, ...prev]);
      await updateAsset(asset.id, { asset_status: "Sold / Discarded" }).catch(() => {});

      // 1. Post Receipt Voucher for Cash/Bank received
      addVoucher({
        voucher_no: `RV-SALE-${Date.now().toString().slice(-6)}`,
        voucher_type: "Receipt Voucher",
        date: sellForm.date || getTodayIST(),
        name: `Asset Disposal Proceeds — ${asset.asset_name} (${rec.buyer})`,
        debit: "Bank Operating Account (QNB/CBQ)",
        debit_code: "12000001",
        credit: "Sundry Asset Disposal Clearing",
        credit_code: "12399999",
        amount: saleVal,
        method: "Bank Transfer",
      });

      // 2. Post General Ledger Derecognition Journal Entry
      addJournalEntry({
        je_no: `JE-AST-SALE-${Date.now().toString().slice(-6)}`,
        posting_date: sellForm.date || getTodayIST(),
        reference: rec.id,
        narration: `Asset Sale Derecognition: ${asset.asset_name} (Buyer: ${rec.buyer}, Tag: ${asset.asset_code})`,
        dr_account: "Sundry Asset Disposal Clearing",
        dr_code: "12399999",
        cr_account: "Fixed Asset (Capital Cost / Asset A/C)",
        cr_code: "12300001",
        amount: bookVal,
      });

      // 3. Post Gain or Loss on Disposal if any difference
      if (gainLoss > 0) {
        addJournalEntry({
          je_no: `JE-GAIN-DISP-${Date.now().toString().slice(-6)}`,
          posting_date: sellForm.date || getTodayIST(),
          reference: rec.id,
          narration: `Gain on Disposal of Fixed Asset: ${asset.asset_name}`,
          dr_account: "Sundry Asset Disposal Clearing",
          dr_code: "12399999",
          cr_account: "Gain on Sale of Fixed Assets",
          cr_code: "43200001",
          amount: gainLoss,
        });
      } else if (gainLoss < 0) {
        addJournalEntry({
          je_no: `JE-LOSS-DISP-${Date.now().toString().slice(-6)}`,
          posting_date: sellForm.date || getTodayIST(),
          reference: rec.id,
          narration: `Loss on Disposal of Fixed Asset: ${asset.asset_name}`,
          dr_account: "Loss on Sale of Fixed Assets",
          dr_code: "54200001",
          cr_account: "Sundry Asset Disposal Clearing",
          cr_code: "12399999",
          amount: Math.abs(gainLoss),
        });
      }

      toast.success(`Asset "${asset.asset_name}" marked as Sold. GL Derecognition & Receipt Voucher posted.`);
      setShowSell(false);
      setSellForm({ asset_id: "", book_value: "", sale_value: "", buyer: "", date: getTodayIST(), remarks: "" });
      await load();
    } catch (err: any) {
      toast.error(`Sale recording failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  // ── Asset Write-off Handler ──
  async function handleCreateWriteoff() {
    if (!writeoffForm.asset_id || !writeoffForm.writeoff_reason.trim()) {
      toast.error("Please select an asset and state the write-off reason.");
      return;
    }
    const asset = assets.find(a => a.id === writeoffForm.asset_id);
    if (!asset) return;

    const st = getAssetStatus(asset);
    if (st.isAllocated) {
      toast.error(`Cannot write off "${asset.asset_name}" while allocated. Please deallocate it first.`);
      return;
    }

    const bookVal = Number(writeoffForm.book_value) || Number(asset.purchase_cost) || 0;

    setSaving(true);
    try {
      const rec: AssetWriteoffRecord = {
        id: `WROFF-${Date.now().toString().slice(-6)}`,
        asset_id: asset.id,
        asset_name: asset.asset_name,
        asset_code: asset.asset_code || "",
        book_value: bookVal,
        writeoff_reason: writeoffForm.writeoff_reason.trim(),
        date: writeoffForm.date || getTodayIST(),
        approved_by: writeoffForm.approved_by.trim() || "Management Committee",
      };

      setWriteoffs(prev => [rec, ...prev]);
      await updateAsset(asset.id, { asset_status: "Written Off" }).catch(() => {});

      // Post Journal Entry to record loss on write-off and derecognize fixed asset
      if (bookVal > 0) {
        addJournalEntry({
          je_no: `JE-AST-WROFF-${Date.now().toString().slice(-6)}`,
          posting_date: writeoffForm.date || getTodayIST(),
          reference: rec.id,
          narration: `Asset Derecognition & Write-Off: ${asset.asset_name} (Reason: ${rec.writeoff_reason}, Tag: ${asset.asset_code})`,
          dr_account: "Loss on Asset Write-off & Scrapping",
          dr_code: "54200001",
          cr_account: "Fixed Asset (Capital Cost / Asset A/C)",
          cr_code: "12300001",
          amount: bookVal,
        });
      }

      toast.success(`Asset "${asset.asset_name}" written off. Loss recognized in General Ledger.`);
      setShowWriteoff(false);
      setWriteoffForm({ asset_id: "", book_value: "", writeoff_reason: "", date: getTodayIST(), approved_by: "" });
      await load();
    } catch (err: any) {
      toast.error(`Write-off failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  // ── Asset History Lookup for Details Modal ──
  const assetDetailHistory = useMemo(() => {
    if (!selectedAssetForDetail) return null;
    const aid = selectedAssetForDetail.id;
    return {
      allocations: allocations.filter(a => a.asset_id === aid),
      maintenances: maintenances.filter(m => m.asset_id === aid),
      revaluations: revaluations.filter(r => r.asset_id === aid),
      warranty: warranties.find(w => w.asset_id === aid) || null,
      sale: sells.find(s => s.asset_id === aid) || null,
      writeoff: writeoffs.find(w => w.asset_id === aid) || null,
    };
  }, [selectedAssetForDetail, allocations, maintenances, revaluations, warranties, sells, writeoffs]);

  const pageHeaderInfo = useMemo(() => {
    switch (moduleTab) {
      case "depreciation":
        return {
          title: "Asset Depreciation & Book Valuation",
          desc: "Calculate and monitor depreciation schedules (SLM & WDV), accumulated depreciation, and post journal entries to GL.",
          badge: `${depreciationMetrics.totalAssets} Active Assets`,
        };
      case "allocation":
        return {
          title: "Asset Allocation & Movement",
          desc: "Manage asset deployments across properties, units, and custodians, with full audit trail.",
          badge: `${assetCounts.allocated} Active Deployments`,
        };
      case "warranty":
        return {
          title: "Asset Warranty & AMC Contracts",
          desc: "Track manufacturer warranties, extended coverage, SLA agreements, and attached contract documents.",
          badge: `${warrantyCounts.total} Tracked Policies`,
        };
      case "maintenance":
        return {
          title: "Asset Maintenance & Work Orders",
          desc: "Schedule and manage preventive servicing, repairs, and calibration for unallocated assets.",
          badge: `${assetCounts.maintenance} In Service`,
        };
      case "revaluation":
        return {
          title: "Asset Revaluation",
          desc: "Record fair value adjustments, revaluation surpluses, and asset impairment logs.",
          badge: `${revaluations.length} Records`,
        };
      case "sell":
        return {
          title: "Asset Sale & Derecognition",
          desc: "Record asset disposals to buyers with automatic General Ledger derecognition & receipt voucher posting.",
          badge: `${sells.length} Disposed`,
        };
      case "writeoff":
        return {
          title: "Asset Write-off & Disposal",
          desc: "Retire damaged or obsolete assets with automated write-off loss postings to General Ledger.",
          badge: `${writeoffs.length} Written Off`,
        };
      default:
        return {
          title: "Asset Registry",
          desc: "Master register of all fixed assets, serials, tag barcodes, valuations, and lifecycle states.",
          badge: `${assetCounts.total} Total Tracked`,
        };
    }
  }, [moduleTab, assetCounts, warrantyCounts.total, revaluations.length, sells.length, writeoffs.length, depreciationMetrics.totalAssets]);

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">{pageHeaderInfo.title}</h2>
            <Badge variant="outline" className="text-xs font-mono bg-amber-500/10 text-amber-600 border-amber-500/30">
              {pageHeaderInfo.badge}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {pageHeaderInfo.desc}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          {moduleTab === "registry" && (
            <>
              <Button variant="outline" size="sm" onClick={() => setBulkAssetOpen(true)} className="gap-1.5 text-xs">
                <FileSpreadsheet className="h-3.5 w-3.5 text-primary" /> Bulk Import
              </Button>
              <Button size="sm" onClick={() => { setStepperStep(1); setShowNew(true); }} className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-white shadow-sm">
                <Plus className="h-3.5 w-3.5" /> Add Asset
              </Button>
            </>
          )}

          {moduleTab === "depreciation" && (
            <Button size="sm" onClick={() => openDepreciationModal()} className="gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
              <Plus className="h-3.5 w-3.5" /> Run Depreciation Batch
            </Button>
          )}

          {moduleTab === "warranty" && (
            <Button size="sm" onClick={() => openWarrantyModal()} className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
              <Plus className="h-3.5 w-3.5" /> Register / Extend Warranty
            </Button>
          )}

          {moduleTab === "maintenance" && (
            <Button size="sm" onClick={() => {
              setMaintForm({ asset_id: "", maintenance_type: "Preventive Maintenance", priority: "Medium", service_vendor: "", technician_name: "", scheduled_date: getTodayIST(), estimated_cost: "0", description: "" });
              setShowNewMaintenance(true);
            }} className="gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
              <Plus className="h-3.5 w-3.5" /> New Maintenance Order
            </Button>
          )}

          {moduleTab === "revaluation" && (
            <Button size="sm" onClick={() => setShowRevaluation(true)} className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
              <Plus className="h-3.5 w-3.5" /> New Revaluation
            </Button>
          )}

          {moduleTab === "sell" && (
            <Button size="sm" onClick={() => setShowSell(true)} className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
              <Plus className="h-3.5 w-3.5" /> Record Asset Sale
            </Button>
          )}

          {moduleTab === "writeoff" && (
            <Button size="sm" onClick={() => setShowWriteoff(true)} className="gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white shadow-sm">
              <Plus className="h-3.5 w-3.5" /> New Write-off
            </Button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-MODULE 1: ASSET REGISTRY ───────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {moduleTab === "registry" && (
        <div className="space-y-4">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Total Assets</CardTitle>
                <Package className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-foreground font-mono">{assetCounts.total}</div>
                <p className="text-[10px] text-muted-foreground">Total tracked in registry</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Available (In Stock)</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-emerald-600 font-mono">{assetCounts.available}</div>
                <p className="text-[10px] text-muted-foreground">Ready for allocation / service</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Allocated</CardTitle>
                <Building2 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-blue-600 font-mono">{assetCounts.allocated}</div>
                <p className="text-[10px] text-muted-foreground">Deployed to properties &amp; units</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">In Maintenance</CardTitle>
                <Wrench className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-amber-600 font-mono">{assetCounts.maintenance}</div>
                <p className="text-[10px] text-muted-foreground">Under active repair or service</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <Tabs defaultValue="all" value={activeRegistryFilter} onValueChange={v => { setActiveRegistryFilter(v); setRegistryPage(1); }}>
              <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b">
                <TabsList className="grid grid-cols-5 h-9 w-full md:w-auto">
                  <TabsTrigger value="all" className="text-xs">All Assets ({assetCounts.total})</TabsTrigger>
                  <TabsTrigger value="available" className="text-xs">Available ({assetCounts.available})</TabsTrigger>
                  <TabsTrigger value="allocated" className="text-xs">Allocated ({assetCounts.allocated})</TabsTrigger>
                  <TabsTrigger value="maintenance" className="text-xs">Maintenance ({assetCounts.maintenance})</TabsTrigger>
                  <TabsTrigger value="disposed" className="text-xs">Disposed / Written Off ({assetCounts.disposed})</TabsTrigger>
                </TabsList>

                <div className="relative w-full md:w-80">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by code, name, category, serial, property..."
                    className="pl-8 h-9 text-xs"
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setRegistryPage(1); }}
                  />
                </div>
              </div>

              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center py-20 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading asset register...
                  </div>
                ) : filteredAssets.length === 0 ? (
                  <div className="text-center py-14 text-muted-foreground">
                    <Package className="mx-auto h-10 w-10 mb-2 opacity-30" />
                    <p className="text-sm font-medium">No assets found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try clearing filters or adding new assets.</p>
                  </div>
                ) : (
                  <div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b bg-muted/40 font-bold">
                            <th className="h-9 px-3 text-left">Asset Name &amp; Code</th>
                            <th className="h-9 px-2.5 text-left">Category</th>
                            <th className="h-9 px-2.5 text-left">Allocation / Location</th>
                            <th className="h-9 px-2 text-center whitespace-nowrap">Commission</th>
                            <th className="h-9 px-2.5 text-right whitespace-nowrap">Value (QAR)</th>
                            <th className="h-9 px-2 text-center whitespace-nowrap">Status</th>
                            <th className="h-9 px-3 text-right whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedAssets.map((asset) => {
                            const st = getAssetStatus(asset);
                            return (
                              <tr key={asset.id} className="border-b hover:bg-muted/30 transition-colors">
                                <td className="px-3 py-2.5 max-w-[220px]">
                                  <div className="font-semibold text-foreground leading-snug line-clamp-2">{asset.asset_name}</div>
                                  <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                    <span>{asset.asset_code || "No Code"}</span>
                                    {asset.asset_code && (
                                      <button 
                                        onClick={() => setPrintBarcode(asset.asset_code || "")}
                                        className="hover:text-primary transition-colors"
                                        title="Print Tag Barcode"
                                      >
                                        <Printer className="h-2.5 w-2.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>

                                <td className="px-2.5 py-2.5">
                                  <Badge variant="secondary" className="text-[10px] font-normal truncate max-w-[110px]">
                                    {asset.category || "Fixed Asset"}
                                  </Badge>
                                </td>

                                <td className="px-2.5 py-2.5 max-w-[200px]">
                                  {st.isAllocated ? (
                                    <div className="space-y-0.5">
                                      <div className="font-medium text-foreground flex items-center gap-1 truncate" title={asset.assigned_property_code || asset.properties?.title || "Assigned Property"}>
                                        <Building2 className="h-3 w-3 text-blue-500 shrink-0" />
                                        <span className="truncate">{asset.assigned_property_code || asset.properties?.title || "Assigned Property"}</span>
                                      </div>
                                      {asset.assigned_unit_code && (
                                        <div className="text-[10px] text-muted-foreground ml-4 truncate">
                                          Unit: {asset.assigned_unit_code}
                                        </div>
                                      )}
                                      {asset.assigned_employee_name && (
                                        <div className="text-[10px] text-muted-foreground ml-4 flex items-center gap-0.5 truncate">
                                          <User className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">{asset.assigned_employee_name}</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground italic flex items-center gap-1 text-[11px]">
                                      <MapPin className="h-3 w-3 opacity-40 shrink-0" /> Central Stock (Available)
                                    </span>
                                  )}
                                </td>

                                <td className="px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap">
                                  {formatDDMMMYYYY(asset.purchase_date)}
                                </td>

                                <td className="px-2.5 py-2.5 text-right font-mono font-bold whitespace-nowrap">
                                  QAR {asset.purchase_cost ? Number(asset.purchase_cost).toLocaleString() : "0"}
                                </td>

                                <td className="px-2 py-2.5 text-center whitespace-nowrap">
                                  <Badge variant="outline" className={`text-[10px] font-medium ${st.badgeClass}`} title={st.description}>
                                    {st.label}
                                  </Badge>
                                </td>

                                <td className="px-3 py-2.5 text-right whitespace-nowrap">
                                  <div className="flex justify-end gap-1 items-center">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-[11px] gap-1 border-primary/40 text-primary hover:bg-primary/10 font-medium"
                                      onClick={() => setSelectedAssetForDetail(asset)}
                                      title="View Asset Details & Complete History"
                                    >
                                      <Eye className="h-3 w-3" /> Details
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-[11px] gap-1 border-border text-foreground hover:bg-muted"
                                      onClick={() => openEditAssetModal(asset)}
                                      title="Edit Asset Details"
                                    >
                                      <Pencil className="h-3 w-3" /> Edit
                                    </Button>

                                    {/* CONTEXTUAL ALLOCATE CTA FOR AVAILABLE ASSETS */}
                                    {st.key === "available" && (
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-7 px-2 text-[11px] gap-1 text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 font-medium"
                                        onClick={() => openAllocationModalForAsset(asset, "ALLOCATE")}
                                        title="Allocate Asset to Property / Unit"
                                      >
                                        <ArrowRightLeft className="h-3 w-3" /> Allocate
                                      </Button>
                                    )}

                                    {/* CONTEXTUAL DEALLOCATE CTA FOR ALLOCATED ASSETS */}
                                    {st.key === "allocated" && (
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-7 px-2 text-[11px] gap-1 text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 font-medium"
                                        onClick={() => openAllocationModalForAsset(asset, "DEALLOCATE")}
                                        title="Deallocate / Return Asset to Stock"
                                      >
                                        <ArrowDownLeft className="h-3 w-3" /> Deallocate
                                      </Button>
                                    )}

                                    {role === "admin" && (
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                        title="Delete Asset"
                                        onClick={async () => {
                                          if (!confirm(`Are you sure you want to delete asset "${asset.asset_name}"?`)) return;
                                          await deleteAsset(asset.id);
                                          toast.success("Asset deleted.");
                                          load();
                                        }}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination for Registry */}
                    <TablePagination
                      currentPage={registryPage}
                      totalItems={filteredAssets.length}
                      pageSize={registryPageSize}
                      onPageChange={setRegistryPage}
                      onPageSizeChange={(sz) => { setRegistryPageSize(sz); setRegistryPage(1); }}
                    />
                  </div>
                )}
              </CardContent>
            </Tabs>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-MODULE: ASSET DEPRECIATION & VALUATION ─────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {moduleTab === "depreciation" && (
        <div className="space-y-4">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Total Acquisition Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-foreground font-mono">QAR {depreciationMetrics.totalCost.toLocaleString()}</div>
                <p className="text-[10px] text-muted-foreground">Gross historical asset value</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Accumulated Depreciation</CardTitle>
                <TrendingDown className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-amber-600 font-mono">QAR {depreciationMetrics.totalAccum.toLocaleString()}</div>
                <p className="text-[10px] text-muted-foreground">Total depreciation charged to date</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Net Carrying (Book) Value</CardTitle>
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-emerald-600 font-mono">QAR {depreciationMetrics.totalNetBook.toLocaleString()}</div>
                <p className="text-[10px] text-muted-foreground">Current balance sheet asset value</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Depreciated Portfolio</CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-blue-600 font-mono">{depreciationMetrics.totalAssets} Units</div>
                <p className="text-[10px] text-muted-foreground">SLM &amp; WDV amortization models</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <Tabs defaultValue="all" value={deprMethodFilter} onValueChange={v => { setDeprMethodFilter(v); setDeprPage(1); }}>
              <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b">
                <TabsList className="grid grid-cols-3 h-9 w-full md:w-auto">
                  <TabsTrigger value="all" className="text-xs">All Methods ({assetDepreciationList.length})</TabsTrigger>
                  <TabsTrigger value="slm" className="text-xs">Straight Line (SLM)</TabsTrigger>
                  <TabsTrigger value="wdv" className="text-xs">Written Down Value (WDV)</TabsTrigger>
                </TabsList>

                <div className="relative w-full md:w-80">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search asset, tag, category..."
                    className="pl-8 h-9 text-xs"
                    value={deprSearch}
                    onChange={e => { setDeprSearch(e.target.value); setDeprPage(1); }}
                  />
                </div>
              </div>

              <CardContent className="p-0">
                {filteredDepreciationList.length === 0 ? (
                  <div className="text-center py-14 text-muted-foreground">
                    <TrendingDown className="mx-auto h-10 w-10 mb-2 opacity-30" />
                    <p className="text-sm font-medium">No depreciation records found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try clearing filters or checking asset acquisition dates.</p>
                  </div>
                ) : (
                  <div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b bg-muted/40 font-bold">
                            <th className="h-9 px-3 text-left">Asset Details</th>
                            <th className="h-9 px-2.5 text-left">Category</th>
                            <th className="h-9 px-2 text-center whitespace-nowrap">Acquisition</th>
                            <th className="h-9 px-2.5 text-center">Method &amp; Rate</th>
                            <th className="h-9 px-3 text-right">Cost (QAR)</th>
                            <th className="h-9 px-3 text-right">Accum. Depr (QAR)</th>
                            <th className="h-9 px-3 text-right">Net Book Value (QAR)</th>
                            <th className="h-9 px-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {pagedDepreciationList.map(item => {
                            const originalAsset = assets.find(a => a.id === item.asset_id);
                            return (
                              <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                <td className="p-3">
                                  <div className="font-semibold text-foreground">{item.asset_name}</div>
                                  <div className="text-[11px] font-mono text-muted-foreground">{item.asset_code}</div>
                                </td>
                                <td className="p-2.5">
                                  <Badge variant="outline" className="text-[10px] font-medium">{item.category}</Badge>
                                </td>
                                <td className="p-2 text-center whitespace-nowrap font-mono text-muted-foreground">
                                  {formatDDMMMYYYY(item.purchase_date)}
                                </td>
                                <td className="p-2.5 text-center">
                                  <Badge variant="outline" className={`text-[10px] font-mono ${item.depreciation_method.includes("SLM") ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "bg-purple-500/10 text-purple-600 border-purple-500/30"}`}>
                                    {item.depreciation_method.includes("SLM") ? "SLM" : "WDV"} ({item.depreciation_rate_pct}% / {item.useful_life_years}y)
                                  </Badge>
                                </td>
                                <td className="p-3 text-right font-mono font-medium">
                                  {item.acquisition_cost.toLocaleString()}
                                </td>
                                <td className="p-3 text-right font-mono text-amber-600 font-semibold">
                                  {item.accumulated_depreciation.toLocaleString()}
                                </td>
                                <td className="p-3 text-right font-mono text-emerald-600 font-bold">
                                  {item.current_book_value.toLocaleString()}
                                </td>
                                <td className="p-3 text-center">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs gap-1 border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                                    onClick={() => originalAsset && openDepreciationModal(originalAsset)}
                                  >
                                    <TrendingUp className="h-3 w-3" /> Post GL Run
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <TablePagination
                      currentPage={deprPage}
                      totalItems={filteredDepreciationList.length}
                      pageSize={deprPageSize}
                      onPageChange={setDeprPage}
                      onPageSizeChange={sz => { setDeprPageSize(sz); setDeprPage(1); }}
                    />
                  </div>
                )}
              </CardContent>
            </Tabs>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-MODULE 2: ASSET ALLOCATION (ACTIVE ALLOCATIONS & MOVEMENTS) ─────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {moduleTab === "allocation" && (
        <div className="space-y-4">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Currently Allocated</CardTitle>
                <Building2 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-blue-600 font-mono">{assetCounts.allocated}</div>
                <p className="text-[10px] text-muted-foreground">Active in properties &amp; units</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Available for Allocation</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-emerald-600 font-mono">{assetCounts.available}</div>
                <p className="text-[10px] text-muted-foreground">In stock ready to deploy</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Recorded Movement Logs</CardTitle>
                <ArrowRightLeft className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-foreground font-mono">{allocations.length}</div>
                <p className="text-[10px] text-muted-foreground">Historical transfers &amp; returns</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Quick Actions</CardTitle>
                <Sparkles className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0 flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs flex-1 gap-1 border-blue-500/30 text-blue-600 hover:bg-blue-500/10" onClick={() => {
                  setAllocationMode("ALLOCATE");
                  setAllocationTargetAsset(null);
                  setAllocationForm({ asset_id: "", allocation_type: "PROPERTY_UNIT", to_property_id: "", to_unit_id: "", to_employee_name: "", department: "", condition: "Good / Operational", date: getTodayIST(), remarks: "" });
                  setShowAllocationDialog(true);
                }}>
                  <ArrowUpRight className="h-3 w-3" /> Allocate
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs flex-1 gap-1 border-amber-500/30 text-amber-600 hover:bg-amber-500/10" onClick={() => {
                  setAllocationMode("DEALLOCATE");
                  setAllocationTargetAsset(null);
                  setAllocationForm({ asset_id: "", allocation_type: "PROPERTY_UNIT", to_property_id: "", to_unit_id: "", to_employee_name: "", department: "", condition: "Good / Operational", date: getTodayIST(), remarks: "" });
                  setShowAllocationDialog(true);
                }}>
                  <ArrowDownLeft className="h-3 w-3" /> Return
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <Tabs defaultValue="active" value={allocSubTab} onValueChange={(v: any) => setAllocSubTab(v)}>
              <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b">
                <TabsList className="grid grid-cols-2 h-9 w-full md:w-auto">
                  <TabsTrigger value="active" className="text-xs gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-blue-500" /> Active Allocations ({assetCounts.allocated})
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-xs gap-1.5">
                    <ArrowRightLeft className="h-3.5 w-3.5 text-purple-500" /> Movement Audit Trail ({allocations.length})
                  </TabsTrigger>
                </TabsList>

                {allocSubTab === "active" && (
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search allocated asset, property, unit, staff..."
                      className="pl-8 h-9 text-xs"
                      value={allocSearch}
                      onChange={e => { setAllocSearch(e.target.value); setAllocPage(1); }}
                    />
                  </div>
                )}
              </div>

              {/* TAB 1: ACTIVE ALLOCATIONS LIST */}
              {allocSubTab === "active" && (
                <CardContent className="p-0">
                  {filteredAllocatedAssets.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Building2 className="mx-auto h-10 w-10 mb-2 opacity-30" />
                      <p className="text-sm font-medium">No allocated assets found</p>
                      <p className="text-xs text-muted-foreground mt-1">Use Quick Actions &gt; Allocate to deploy stock assets to properties, units, or corporate office staff.</p>
                    </div>
                  ) : (
                    <div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b bg-muted/40 font-bold">
                              <th className="h-9 px-3 text-left">Asset Name &amp; Tag</th>
                              <th className="h-9 px-2.5 text-left">Category</th>
                              <th className="h-9 px-2.5 text-left">Assigned Property</th>
                              <th className="h-9 px-2.5 text-left">Unit / Staff Custodian</th>
                              <th className="h-9 px-2 text-center whitespace-nowrap">Commission</th>
                              <th className="h-9 px-2.5 text-right whitespace-nowrap">Value (QAR)</th>
                              <th className="h-9 px-2 text-center whitespace-nowrap">Status</th>
                              <th className="h-9 px-3 text-right whitespace-nowrap">Allocation Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedAllocatedAssets.map(asset => {
                              const isCorpStaff = asset.assigned_property_code === "Corporate Office" || (!asset.assigned_property_id && Boolean(asset.assigned_employee_name));
                              return (
                                <tr key={asset.id} className="border-b hover:bg-muted/30">
                                  <td className="px-3 py-2.5 max-w-[220px]">
                                    <div className="font-semibold text-foreground leading-snug line-clamp-2">{asset.asset_name}</div>
                                    <div className="text-[10px] font-mono text-muted-foreground">{asset.asset_code || "No Code"}</div>
                                  </td>
                                  <td className="px-2.5 py-2.5">
                                    <Badge variant="secondary" className="text-[10px] truncate max-w-[100px]">{asset.category || "Fixed Asset"}</Badge>
                                  </td>
                                  <td className="px-2.5 py-2.5 max-w-[190px]">
                                    {isCorpStaff ? (
                                      <div className="flex items-center gap-1.5 truncate">
                                        <Badge variant="outline" className="text-[10px] bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 gap-1 font-semibold truncate">
                                          <Building2 className="h-3 w-3 text-indigo-600 shrink-0" />
                                          <span className="truncate">Corporate Office</span>
                                        </Badge>
                                      </div>
                                    ) : (
                                      <div className="font-medium text-foreground flex items-center gap-1 truncate" title={asset.assigned_property_code || asset.properties?.title || "Assigned Property"}>
                                        <Building2 className="h-3 w-3 text-blue-500 shrink-0" />
                                        <span className="truncate">{asset.assigned_property_code || asset.properties?.title || "Assigned Property"}</span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-2.5 py-2.5 max-w-[160px]">
                                    {isCorpStaff ? (
                                      <div className="space-y-0.5">
                                        <div className="font-semibold text-foreground text-xs flex items-center gap-1 truncate" title={asset.assigned_employee_name}>
                                          <User className="h-3 w-3 text-indigo-600 shrink-0" />
                                          <span className="truncate">{asset.assigned_employee_name || "Official Staff"}</span>
                                        </div>
                                        <div className="text-[10px] text-muted-foreground truncate" title={asset.assigned_unit_code || "HQ Space"}>
                                          {asset.assigned_unit_code || "HQ Office Workspace"}
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="truncate">{asset.assigned_unit_code ? `Unit ${asset.assigned_unit_code}` : "—"}</div>
                                        {asset.assigned_employee_name && (
                                          <div className="text-[10px] text-muted-foreground flex items-center gap-0.5 truncate">
                                            <User className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">{asset.assigned_employee_name}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap">{formatDDMMMYYYY(asset.purchase_date)}</td>
                                  <td className="px-2.5 py-2.5 text-right font-mono font-bold whitespace-nowrap">
                                    QAR {Number(asset.purchase_cost || 0).toLocaleString()}
                                  </td>
                                  <td className="px-2 py-2.5 text-center whitespace-nowrap">
                                    <Badge variant="outline" className={`text-[10px] ${isCorpStaff ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30" : "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30"}`}>
                                      {isCorpStaff ? "Staff Custody" : "Allocated"}
                                    </Badge>
                                  </td>
                                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                                    <div className="flex justify-end gap-1 items-center">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-[11px] gap-1 border-purple-500/30 text-purple-600 hover:bg-purple-500/10"
                                        onClick={() => openAllocationModalForAsset(asset, "TRANSFER")}
                                        title="Transfer Asset to another property/unit/staff"
                                      >
                                        <ArrowRightLeft className="h-3 w-3" /> Transfer
                                      </Button>

                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-[11px] gap-1 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                                        onClick={() => openAllocationModalForAsset(asset, "DEALLOCATE")}
                                        title="Return / Deallocate Asset to Stock"
                                      >
                                        <ArrowDownLeft className="h-3 w-3" /> Return
                                      </Button>

                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-1.5 text-xs text-primary hover:bg-primary/10"
                                        onClick={() => setSelectedAssetForDetail(asset)}
                                        title="View Details"
                                      >
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <TablePagination
                        currentPage={allocPage}
                        totalItems={filteredAllocatedAssets.length}
                        pageSize={allocPageSize}
                        onPageChange={setAllocPage}
                        onPageSizeChange={(sz) => { setAllocPageSize(sz); setAllocPage(1); }}
                      />
                    </div>
                  )}
                </CardContent>
              )}

              {/* TAB 2: HISTORICAL MOVEMENT AUDIT TRAIL */}
              {allocSubTab === "history" && (
                <CardContent className="p-0">
                  {allocations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ArrowRightLeft className="mx-auto h-8 w-8 mb-2 opacity-30" />
                      <p className="text-xs">No movement history logs recorded yet.</p>
                    </div>
                  ) : (
                    <div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b bg-muted/40 font-bold">
                              <th className="h-9 px-3 text-left">Asset</th>
                              <th className="h-9 px-2.5 text-left whitespace-nowrap">Action</th>
                              <th className="h-9 px-2 text-center whitespace-nowrap">Date</th>
                              <th className="h-9 px-2.5 text-left">From</th>
                              <th className="h-9 px-2.5 text-left">To Destination</th>
                              <th className="h-9 px-2.5 text-left">Condition</th>
                              <th className="h-9 px-3 text-left">Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedAllocationHistory.map(al => {
                              const isStaffHist = al.allocation_type === "OFFICIAL_STAFF" || al.to_property === "Corporate Office" || al.from_property === "Corporate Office";
                              return (
                                <tr key={al.id} className="border-b hover:bg-muted/30">
                                  <td className="px-3 py-2.5 max-w-[200px]">
                                    <div className="font-semibold text-foreground truncate">{al.asset_name}</div>
                                    <div className="text-[10px] font-mono text-muted-foreground">{al.asset_code}</div>
                                  </td>
                                  <td className="px-2.5 py-2.5 whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                      <Badge 
                                        variant="outline" 
                                        className={`text-[10px] font-mono ${
                                          al.action_type === "ALLOCATION" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" :
                                          al.action_type === "DEALLOCATION" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" :
                                          "bg-purple-500/10 text-purple-600 border-purple-500/30"
                                        }`}
                                      >
                                        {al.action_type}
                                      </Badge>
                                      {isStaffHist && (
                                        <Badge variant="outline" className="text-[9px] bg-indigo-500/10 text-indigo-600 border-indigo-500/30 font-mono">
                                          Staff
                                        </Badge>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap">{formatDDMMMYYYY(al.date)}</td>
                                  <td className="px-2.5 py-2.5 text-muted-foreground max-w-[160px]">
                                    <div className="truncate">{al.from_property || "Central Inventory"}</div>
                                    {al.from_unit && <div className="text-[10px] truncate">Space: {al.from_unit}</div>}
                                    {al.from_employee && <div className="text-[10px] text-muted-foreground truncate">From: {al.from_employee}</div>}
                                  </td>
                                  <td className="px-2.5 py-2.5 font-medium text-foreground max-w-[180px]">
                                    <div className="truncate">{al.to_property || "Central Inventory"}</div>
                                    {al.to_unit && <div className="text-[10px] text-primary truncate">Space: {al.to_unit}</div>}
                                    {al.to_employee && <div className="text-[10px] text-muted-foreground truncate">Recipient: {al.to_employee}</div>}
                                  </td>
                                  <td className="px-2.5 py-2.5 text-muted-foreground text-[11px] whitespace-nowrap">{al.condition || "Operational"}</td>
                                  <td className="px-3 py-2.5 text-muted-foreground text-[11px] max-w-[200px] truncate">{al.remarks || "—"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <TablePagination
                        currentPage={historyPage}
                        totalItems={allocations.length}
                        pageSize={historyPageSize}
                        onPageChange={setHistoryPage}
                        onPageSizeChange={(sz) => { setHistoryPageSize(sz); setHistoryPage(1); }}
                      />
                    </div>
                  )}
                </CardContent>
              )}
            </Tabs>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-MODULE 3: ASSET WARRANTY & AMC CONTRACTS ───────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {moduleTab === "warranty" && (
        <div className="space-y-4">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Active Warranties</CardTitle>
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-emerald-600 font-mono">{warrantyCounts.active}</div>
                <p className="text-[10px] text-muted-foreground">Fully covered under active terms</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Expiring Soon</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-amber-600 font-mono">{warrantyCounts.expiringSoon}</div>
                <p className="text-[10px] text-muted-foreground">Expiring within 45 days</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Extended / AMC</CardTitle>
                <Shield className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-indigo-600 font-mono">{warrantyCounts.extended}</div>
                <p className="text-[10px] text-muted-foreground">Annual AMC &amp; extended policies</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Expired Warranties</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-red-600 font-mono">{warrantyCounts.expired}</div>
                <p className="text-[10px] text-muted-foreground">Eligible for renewal or AMC</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <Tabs defaultValue="all" value={warrantyFilter} onValueChange={(v) => { setWarrantyFilter(v); setWarrantyPage(1); }}>
              <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b">
                <TabsList className="grid grid-cols-5 h-9 w-full md:w-auto">
                  <TabsTrigger value="all" className="text-xs">All ({warrantyCounts.total})</TabsTrigger>
                  <TabsTrigger value="active" className="text-xs">Active ({warrantyCounts.active})</TabsTrigger>
                  <TabsTrigger value="expiring" className="text-xs">Expiring Soon ({warrantyCounts.expiringSoon})</TabsTrigger>
                  <TabsTrigger value="extended" className="text-xs">Extended / AMC ({warrantyCounts.extended})</TabsTrigger>
                  <TabsTrigger value="expired" className="text-xs">Expired ({warrantyCounts.expired})</TabsTrigger>
                </TabsList>

                <div className="relative w-full md:w-80">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search asset, provider, policy #..."
                    className="pl-8 h-9 text-xs"
                    value={warrantySearch}
                    onChange={e => { setWarrantySearch(e.target.value); setWarrantyPage(1); }}
                  />
                </div>
              </div>

              <CardContent className="p-0">
                {filteredWarranties.length === 0 ? (
                  <div className="text-center py-14 text-muted-foreground">
                    <ShieldCheck className="mx-auto h-10 w-10 mb-2 opacity-30" />
                    <p className="text-sm font-medium">No warranty records found</p>
                    <p className="text-xs text-muted-foreground mt-1">Click "Register / Extend Warranty" to add coverage with documents.</p>
                  </div>
                ) : (
                  <div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b bg-muted/40 font-bold">
                            <th className="h-9 px-3 text-left">Asset Name &amp; Tag</th>
                            <th className="h-9 px-2.5 text-left">Warranty &amp; Policy #</th>
                            <th className="h-9 px-2.5 text-left">Provider &amp; Support</th>
                            <th className="h-9 px-2 text-center whitespace-nowrap">Start</th>
                            <th className="h-9 px-2 text-center whitespace-nowrap">Expiry</th>
                            <th className="h-9 px-2 text-center whitespace-nowrap">Status</th>
                            <th className="h-9 px-2.5 text-left">Attached Documents</th>
                            <th className="h-9 px-3 text-right whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedWarranties.map(w => {
                            const todayStr = getTodayIST();
                            const isExpired = w.expiry_date < todayStr;
                            const daysLeft = Math.ceil((new Date(w.expiry_date).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24));

                            return (
                              <tr key={w.id} className="border-b hover:bg-muted/30">
                                <td className="px-3 py-2.5 max-w-[200px]">
                                  <div className="font-semibold text-foreground leading-snug truncate">{w.asset_name}</div>
                                  <div className="text-[10px] font-mono text-muted-foreground">{w.asset_code}</div>
                                </td>
                                <td className="px-2.5 py-2.5 max-w-[170px]">
                                  <Badge variant="outline" className={`text-[10px] truncate max-w-[160px] ${
                                    w.warranty_type === "Extended Warranty" ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/30" :
                                    w.warranty_type === "Annual Maintenance Contract (AMC)" ? "bg-purple-500/10 text-purple-600 border-purple-500/30" :
                                    "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                  }`}>
                                    {w.warranty_type}
                                  </Badge>
                                  {w.policy_number && (
                                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">#{w.policy_number}</div>
                                  )}
                                </td>
                                <td className="px-2.5 py-2.5 max-w-[150px]">
                                  <div className="font-medium text-foreground truncate">{w.provider_name}</div>
                                  <div className="text-[10px] text-muted-foreground truncate">{w.support_phone || w.support_email || "Contact on file"}</div>
                                </td>
                                <td className="px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap">{formatDDMMMYYYY(w.start_date)}</td>
                                <td className="px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap">
                                  <div className="font-bold text-foreground">{formatDDMMMYYYY(w.expiry_date)}</div>
                                  <div className={`text-[10px] font-semibold ${
                                    isExpired ? "text-red-500" :
                                    daysLeft <= 45 ? "text-amber-500" :
                                    "text-emerald-600"
                                  }`}>
                                    {isExpired ? "Expired" : `${daysLeft}d left`}
                                  </div>
                                </td>
                                <td className="px-2 py-2.5 text-center whitespace-nowrap">
                                  <Badge variant="outline" className={`text-[10px] font-mono ${
                                    w.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" :
                                    w.status === "EXPIRING_SOON" ? "bg-amber-500/10 text-amber-600 border-amber-500/30 animate-pulse" :
                                    w.status === "EXTENDED" ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/30" :
                                    "bg-red-500/10 text-red-600 border-red-500/30"
                                  }`}>
                                    {w.status.replace("_", " ")}
                                  </Badge>
                                </td>
                                <td className="px-2.5 py-2.5 max-w-[160px]">
                                  {w.documents && w.documents.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {w.documents.map(d => (
                                        <Badge 
                                          key={d.id} 
                                          variant="secondary" 
                                          className="text-[9px] gap-1 cursor-pointer hover:bg-muted/80 max-w-[130px] truncate"
                                          onClick={() => toast.info(`Viewing document: ${d.name} (${d.file_name})`)}
                                        >
                                          <Paperclip className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">{d.name}</span>
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-[10px] italic">No files attached</span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-right whitespace-nowrap">
                                  <div className="flex justify-end gap-1 items-center">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-[11px] gap-1 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10 font-medium"
                                      onClick={() => openWarrantyModal(undefined, w)}
                                      title="Extend or Update Warranty Terms"
                                    >
                                      <ShieldCheck className="h-3 w-3" /> Extend
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-1.5 text-xs text-primary hover:bg-primary/10"
                                      onClick={() => {
                                        const matchingAsset = assets.find(a => a.id === w.asset_id);
                                        if (matchingAsset) setSelectedAssetForDetail(matchingAsset);
                                      }}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <TablePagination
                      currentPage={warrantyPage}
                      totalItems={filteredWarranties.length}
                      pageSize={warrantyPageSize}
                      onPageChange={setWarrantyPage}
                      onPageSizeChange={(sz) => { setWarrantyPageSize(sz); setWarrantyPage(1); }}
                    />
                  </div>
                )}
              </CardContent>
            </Tabs>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-MODULE 4: ASSET MAINTENANCE ────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {moduleTab === "maintenance" && (
        <div className="space-y-4">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Active Work Orders</CardTitle>
                <Wrench className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-amber-600 font-mono">
                  {maintenances.filter(m => ["SCHEDULED", "IN_PROGRESS"].includes(m.status)).length}
                </div>
                <p className="text-[10px] text-muted-foreground">Scheduled or In-Progress</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Completed Services</CardTitle>
                <CheckCheck className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-emerald-600 font-mono">
                  {maintenances.filter(m => m.status === "COMPLETED").length}
                </div>
                <p className="text-[10px] text-muted-foreground">Restored to available pool</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Total Maint. Spend</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-foreground font-mono">
                  QAR {maintenances.reduce((acc, m) => acc + (m.actual_cost || m.estimated_cost || 0), 0).toLocaleString()}
                </div>
                <p className="text-[10px] text-muted-foreground">Actual incurred service costs</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Eligible Assets</CardTitle>
                <Package className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold text-emerald-600 font-mono">{availableUnallocatedAssets.length}</div>
                <p className="text-[10px] text-muted-foreground">Unallocated pool ready for service</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <CardHeader className="border-b bg-muted/20 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500" /> Asset Maintenance &amp; Service Work Orders
                </CardTitle>
                <CardDescription className="text-xs">
                  Log and track maintenance requests, technician assignments, costs, and return assets to available inventory upon service completion.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {maintenances.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Wrench className="mx-auto h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">No maintenance work orders logged yet.</p>
                </div>
              ) : (
                <div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b bg-muted/40 font-bold">
                          <th className="h-9 px-3 text-left">Order #</th>
                          <th className="h-9 px-3 text-left">Asset</th>
                          <th className="h-9 px-2.5 text-left">Type</th>
                          <th className="h-9 px-2.5 text-left">Vendor &amp; Tech</th>
                          <th className="h-9 px-2 text-center whitespace-nowrap">Scheduled Date</th>
                          <th className="h-9 px-2.5 text-right whitespace-nowrap">Cost (QAR)</th>
                          <th className="h-9 px-2 text-center whitespace-nowrap">Status</th>
                          <th className="h-9 px-3 text-right whitespace-nowrap">Workflow Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedMaintenances.map(m => (
                          <tr key={m.id} className="border-b hover:bg-muted/30">
                            <td className="px-3 py-2.5 font-mono font-semibold text-foreground whitespace-nowrap">{m.id}</td>
                            <td className="px-3 py-2.5 max-w-[200px]">
                              <div className="font-semibold text-foreground truncate">{m.asset_name}</div>
                              <div className="text-[10px] font-mono text-muted-foreground">{m.asset_code}</div>
                            </td>
                            <td className="px-2.5 py-2.5">
                              <Badge variant="outline" className="text-[10px]">{m.maintenance_type}</Badge>
                            </td>
                            <td className="px-2.5 py-2.5 text-muted-foreground max-w-[150px]">
                              <div className="font-medium text-foreground truncate">{m.service_vendor}</div>
                              {m.technician_name && <div className="text-[10px] truncate">Tech: {m.technician_name}</div>}
                            </td>
                            <td className="px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap">{formatDDMMMYYYY(m.scheduled_date)}</td>
                            <td className="px-2.5 py-2.5 text-right font-mono font-bold whitespace-nowrap">
                              {m.actual_cost ? `QAR ${m.actual_cost.toLocaleString()}` : `Est: QAR ${m.estimated_cost.toLocaleString()}`}
                            </td>
                            <td className="px-2 py-2.5 text-center whitespace-nowrap">
                              <Badge 
                                variant="outline"
                                className={`text-[10px] font-mono ${
                                  m.status === "SCHEDULED" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" :
                                  m.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-600 border-amber-500/30 animate-pulse" :
                                  m.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" :
                                  "bg-zinc-500/10 text-zinc-600 border-zinc-500/30"
                                }`}
                              >
                                {m.status}
                              </Badge>
                            </td>
                            <td className="px-3 py-2.5 text-right whitespace-nowrap">
                              <div className="flex justify-end gap-1.5 items-center">
                                {m.status === "SCHEDULED" && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-6 px-2 text-[11px] gap-1 text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                                    onClick={() => handleStartMaintenance(m)}
                                  >
                                    Start Work
                                  </Button>
                                )}

                                {m.status === "IN_PROGRESS" && (
                                  <Button 
                                    size="sm" 
                                    className="h-6 px-2 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => {
                                      setCompleteMaintModal(m);
                                      setCompleteMaintForm({
                                        actual_cost: String(m.estimated_cost || ""),
                                        completed_date: getTodayIST(),
                                        completion_notes: "",
                                        invoice_ref: "",
                                      });
                                    }}
                                  >
                                    <Check className="h-3 w-3" /> Complete
                                  </Button>
                                )}

                                {["SCHEDULED", "IN_PROGRESS"].includes(m.status) && (
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleCancelMaintenance(m)}
                                    title="Cancel Work Order"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <TablePagination
                    currentPage={maintPage}
                    totalItems={maintenances.length}
                    pageSize={maintPageSize}
                    onPageChange={setMaintPage}
                    onPageSizeChange={(sz) => { setMaintPageSize(sz); setMaintPage(1); }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-MODULE 5: ASSET REVALUATION ────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {moduleTab === "revaluation" && (
        <Card className="border-border">
          <CardHeader className="border-b bg-muted/20 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-purple-500" /> Asset Revaluation Register
              </CardTitle>
              <CardDescription className="text-xs">Fair value adjustments and revaluation reserve logs.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {revaluations.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <TrendingUp className="mx-auto h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">No revaluation entries recorded yet. Click "New Revaluation" to add.</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b bg-muted/40 font-bold">
                        <th className="h-9 px-3 text-left">Asset</th>
                        <th className="h-9 px-2 text-center whitespace-nowrap">Date</th>
                        <th className="h-9 px-2.5 text-right whitespace-nowrap">Previous Value (QAR)</th>
                        <th className="h-9 px-2.5 text-right whitespace-nowrap">New Value (QAR)</th>
                        <th className="h-9 px-2.5 text-right whitespace-nowrap">Gain / Loss (QAR)</th>
                        <th className="h-9 px-3 text-left">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRevaluations.map(r => {
                        const diff = r.new_value - r.prev_value;
                        return (
                          <tr key={r.id} className="border-b hover:bg-muted/30">
                            <td className="px-3 py-2.5 font-medium text-foreground max-w-[200px]">
                              <div className="truncate">{r.asset_name}</div>
                              <div className="text-[10px] font-mono text-muted-foreground">{r.asset_code}</div>
                            </td>
                            <td className="px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap">{formatDDMMMYYYY(r.date)}</td>
                            <td className="px-2.5 py-2.5 text-right font-mono text-muted-foreground whitespace-nowrap">QAR {r.prev_value.toLocaleString()}</td>
                            <td className="px-2.5 py-2.5 text-right font-mono font-bold text-primary whitespace-nowrap">QAR {r.new_value.toLocaleString()}</td>
                            <td className={`px-2.5 py-2.5 text-right font-mono font-bold whitespace-nowrap ${diff >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                              {diff >= 0 ? `+QAR ${diff.toLocaleString()}` : `-QAR ${Math.abs(diff).toLocaleString()}`}
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground max-w-[220px] truncate">{r.reason}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <TablePagination
                  currentPage={revalPage}
                  totalItems={revaluations.length}
                  pageSize={revalPageSize}
                  onPageChange={setRevalPage}
                  onPageSizeChange={(sz) => { setRevalPageSize(sz); setRevalPage(1); }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-MODULE 6: ASSET SALE & DERECOGNITION (WITH GL POSTING) ─────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {moduleTab === "sell" && (
        <Card className="border-border">
          <CardHeader className="border-b bg-muted/20 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" /> Asset Sale Register &amp; General Ledger Postings
              </CardTitle>
              <CardDescription className="text-xs">
                Disposal of fixed assets to third parties with automated Receipt Voucher generation and General Ledger derecognition.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {sells.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <DollarSign className="mx-auto h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">No asset sales recorded yet. Click "Record Asset Sale" to begin.</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b bg-muted/40 font-bold">
                        <th className="h-9 px-3 text-left">Asset</th>
                        <th className="h-9 px-2 text-center whitespace-nowrap">Sale Date</th>
                        <th className="h-9 px-2.5 text-left">Buyer</th>
                        <th className="h-9 px-2.5 text-right whitespace-nowrap">Book Value (QAR)</th>
                        <th className="h-9 px-2.5 text-right whitespace-nowrap">Sale Price (QAR)</th>
                        <th className="h-9 px-2.5 text-right whitespace-nowrap">GL Gain / Loss</th>
                        <th className="h-9 px-3 text-left">Remarks &amp; Posting</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedSells.map(s => {
                        const gainLoss = s.sale_value - s.book_value;
                        return (
                          <tr key={s.id} className="border-b hover:bg-muted/30">
                            <td className="px-3 py-2.5 font-medium text-foreground max-w-[190px]">
                              <div className="truncate">{s.asset_name}</div>
                              <div className="text-[10px] font-mono text-muted-foreground">{s.asset_code}</div>
                            </td>
                            <td className="px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap">{formatDDMMMYYYY(s.date)}</td>
                            <td className="px-2.5 py-2.5 font-medium max-w-[140px] truncate">{s.buyer}</td>
                            <td className="px-2.5 py-2.5 text-right font-mono text-muted-foreground whitespace-nowrap">QAR {s.book_value.toLocaleString()}</td>
                            <td className="px-2.5 py-2.5 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">QAR {s.sale_value.toLocaleString()}</td>
                            <td className={`px-2.5 py-2.5 text-right font-mono font-bold whitespace-nowrap ${gainLoss >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                              {gainLoss >= 0 ? `+QAR ${gainLoss.toLocaleString()}` : `-QAR ${Math.abs(gainLoss).toLocaleString()}`}
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground max-w-[180px]">
                              <div className="truncate">{s.remarks || "Sold to buyer"}</div>
                              <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono mt-0.5 whitespace-nowrap">
                                GL Posted
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <TablePagination
                  currentPage={sellPage}
                  totalItems={sells.length}
                  pageSize={sellPageSize}
                  onPageChange={setSellPage}
                  onPageSizeChange={(sz) => { setSellPageSize(sz); setSellPage(1); }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-MODULE 7: ASSET WRITE-OFF (WITH GL LOSS POSTINGS) ──────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {moduleTab === "writeoff" && (
        <Card className="border-border">
          <CardHeader className="border-b bg-muted/20 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500" /> Asset Write-off Register &amp; GL Loss Logs
              </CardTitle>
              <CardDescription className="text-xs">
                Scrapped or decommissioned unallocated assets with automated General Ledger write-off loss journal vouchers.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {writeoffs.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <AlertTriangle className="mx-auto h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">No write-offs recorded yet. Click "New Write-off" to add.</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b bg-muted/40 font-bold">
                        <th className="h-9 px-3 text-left">Asset</th>
                        <th className="h-9 px-2 text-center whitespace-nowrap">Write-off Date</th>
                        <th className="h-9 px-2.5 text-right whitespace-nowrap">Written-off Value (QAR)</th>
                        <th className="h-9 px-3 text-left">Reason</th>
                        <th className="h-9 px-2.5 text-left">Approved By</th>
                        <th className="h-9 px-2 text-center whitespace-nowrap">GL Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedWriteoffs.map(w => (
                        <tr key={w.id} className="border-b hover:bg-muted/30">
                          <td className="px-3 py-2.5 font-medium text-foreground max-w-[200px]">
                            <div className="truncate">{w.asset_name}</div>
                            <div className="text-[10px] font-mono text-muted-foreground">{w.asset_code}</div>
                          </td>
                          <td className="px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap">{formatDDMMMYYYY(w.date)}</td>
                          <td className="px-2.5 py-2.5 text-right font-mono font-bold text-destructive whitespace-nowrap">QAR {w.book_value.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-muted-foreground max-w-[200px] truncate">{w.writeoff_reason}</td>
                          <td className="px-2.5 py-2.5 max-w-[140px] truncate">{w.approved_by || "—"}</td>
                          <td className="px-2 py-2.5 text-center whitespace-nowrap">
                            <Badge variant="outline" className="text-[9px] bg-red-500/10 text-red-600 border-red-500/20 font-mono">
                              Loss Posted
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <TablePagination
                  currentPage={writeoffPage}
                  totalItems={writeoffs.length}
                  pageSize={writeoffPageSize}
                  onPageChange={setWriteoffPage}
                  onPageSizeChange={(sz) => { setWriteoffPageSize(sz); setWriteoffPage(1); }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: CONTEXTUAL ALLOCATION / DEALLOCATION / TRANSFER ─────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showAllocationDialog} onOpenChange={setShowAllocationDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-blue-500" />
              {allocationMode === "ALLOCATE" ? "Allocate Asset to Property / Unit / Office Staff" :
               allocationMode === "DEALLOCATE" ? "Deallocate Asset (Return to Central Stock)" :
               "Transfer Asset between Properties / Units / Staff"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {allocationMode === "ALLOCATE" ? "Assign an available stock asset to a Property/Unit or directly to Corporate Office Staff." :
               allocationMode === "DEALLOCATE" ? "Return an allocated asset back to available central stock with condition verification." :
               "Relocate an allocated asset directly to another Property/Unit or Corporate Office Staff member."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            {/* CONTEXTUAL MODE SWITCHER:
                - If allocating an available item: show ONLY Allocate (no switcher)
                - If item is allocated: show ONLY Deallocate / Return and Transfer (2 buttons, no Allocate)
            */}
            {allocationMode !== "ALLOCATE" && (
              <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-muted/40 border">
                {(["DEALLOCATE", "TRANSFER"] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setAllocationMode(m);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded transition-all ${
                      allocationMode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "DEALLOCATE" ? "Deallocate / Return" : "Transfer / Relocate"}
                  </button>
                ))}
              </div>
            )}

            {/* Asset Selector */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Selected Asset *</Label>
              <Select 
                value={allocationForm.asset_id} 
                onValueChange={v => {
                  const a = assets.find(x => x.id === v);
                  setAllocationTargetAsset(a || null);
                  setAllocationForm(f => ({ ...f, asset_id: v }));
                }}
                disabled={Boolean(allocationTargetAsset)}
              >
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Choose asset..." />
                </SelectTrigger>
                <SelectContent>
                  {allocationMode === "ALLOCATE" ? (
                    availableUnallocatedAssets.length === 0 ? (
                      <div className="p-3 text-center text-xs text-muted-foreground">No available unallocated assets in stock.</div>
                    ) : (
                      availableUnallocatedAssets.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.asset_name} ({a.asset_code || "No Code"}) — Available in Stock (QAR {Number(a.purchase_cost || 0).toLocaleString()})
                        </SelectItem>
                      ))
                    )
                  ) : (
                    allocatedAssetsList.length === 0 ? (
                      <div className="p-3 text-center text-xs text-muted-foreground">No currently allocated assets found.</div>
                    ) : (
                      allocatedAssetsList.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.asset_name} ({a.asset_code || "No Code"}) — At: {a.assigned_property_code || a.properties?.title || "Property"} {a.assigned_unit_code ? `(${a.assigned_unit_code})` : ""} {a.assigned_employee_name ? `• ${a.assigned_employee_name}` : ""}
                        </SelectItem>
                      ))
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Allocation Target Type: Property & Unit vs Official Staff (Corporate Office) */}
            {(allocationMode === "ALLOCATE" || allocationMode === "TRANSFER") && (
              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-semibold">Allocation Target Type *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAllocationForm(f => ({ 
                      ...f, 
                      allocation_type: "PROPERTY_UNIT",
                      to_employee_name: "",
                      department: ""
                    }))}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                      allocationForm.allocation_type === "PROPERTY_UNIT"
                        ? "border-blue-500 bg-blue-500/10 text-foreground ring-1 ring-blue-500"
                        : "border-border bg-card/60 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Building2 className={`h-4 w-4 mt-0.5 shrink-0 ${allocationForm.allocation_type === "PROPERTY_UNIT" ? "text-blue-500" : "text-muted-foreground"}`} />
                    <div>
                      <div className="font-semibold text-xs text-foreground">Property &amp; Unit</div>
                      <div className="text-[10px] text-muted-foreground">Deploy to site, building, tenant or unit</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAllocationForm(f => ({ 
                      ...f, 
                      allocation_type: "OFFICIAL_STAFF",
                      to_property_id: "",
                      to_unit_id: "",
                      department: f.department || "Administration & Executive"
                    }))}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                      allocationForm.allocation_type === "OFFICIAL_STAFF"
                        ? "border-indigo-500 bg-indigo-500/10 text-foreground ring-1 ring-indigo-500"
                        : "border-border bg-card/60 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <User className={`h-4 w-4 mt-0.5 shrink-0 ${allocationForm.allocation_type === "OFFICIAL_STAFF" ? "text-indigo-600" : "text-muted-foreground"}`} />
                    <div>
                      <div className="font-semibold text-xs text-foreground">Office Staff</div>
                      <div className="text-[10px] text-muted-foreground">Fixed to Corporate Office HQ &amp; staff</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* FLOW A: OFFICIAL STAFF ALLOCATION (PROPERTY FIXED TO CORPORATE OFFICE) */}
            {(allocationMode === "ALLOCATE" || allocationMode === "TRANSFER") && allocationForm.allocation_type === "OFFICIAL_STAFF" && (
              <div className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold flex items-center justify-between">
                      <span>Assigned Property</span>
                      <Badge variant="outline" className="text-[9px] bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-semibold">
                        Auto-Fixed for Staff
                      </Badge>
                    </Label>
                    <div className="h-8 px-3 rounded-md border bg-muted/70 flex items-center gap-2 text-xs font-semibold text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span>Corporate Office (HQ)</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Department / Business Unit *</Label>
                    <Select 
                      value={allocationForm.department} 
                      onValueChange={v => setAllocationForm(f => ({ ...f, department: v }))}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Administration & Executive",
                          "Finance & Accounting",
                          "Leasing & Marketing",
                          "Property & Facility Management",
                          "Operations & Field Support",
                          "IT & Systems Infrastructure",
                          "Human Resources (HR)",
                          "Procurement & Supply Chain",
                          "Legal & Compliance"
                        ].map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Official Staff / Employee Name *</Label>
                    <Input
                      className="h-8 text-xs bg-background"
                      placeholder="e.g. Tariq Mansoor / Fatima Al-Thani"
                      value={allocationForm.to_employee_name}
                      onChange={e => setAllocationForm(f => ({ ...f, to_employee_name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Workspace / Desk / Room (Optional)</Label>
                    <Input
                      className="h-8 text-xs bg-background"
                      placeholder="e.g. HQ 2nd Floor - Desk #12 / Office 204"
                      value={allocationForm.to_unit_id}
                      onChange={e => setAllocationForm(f => ({ ...f, to_unit_id: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FLOW B: PROPERTY / UNIT ALLOCATION */}
            {(allocationMode === "ALLOCATE" || allocationMode === "TRANSFER") && allocationForm.allocation_type === "PROPERTY_UNIT" && (
              <div className="p-3 rounded-lg border bg-muted/20 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Target Property *</Label>
                    <Select value={allocationForm.to_property_id} onValueChange={v => setAllocationForm(f => ({ ...f, to_property_id: v, to_unit_id: "" }))}>
                      <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="Select Property" /></SelectTrigger>
                      <SelectContent>
                        {properties.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Target Unit (Optional)</Label>
                    <Select 
                      value={allocationForm.to_unit_id} 
                      onValueChange={v => setAllocationForm(f => ({ ...f, to_unit_id: v }))}
                      disabled={!allocationForm.to_property_id}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="Select Unit" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">— Entire Property —</SelectItem>
                        {units.filter(u => u.property_id === allocationForm.to_property_id).map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.unit_ref || `Unit ${u.id}`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Unit Tenant / Property Custodian Name (Optional)</Label>
                  <Input
                    className="h-8 text-xs bg-background"
                    placeholder="e.g. Unit Tenant / Site Caretaker"
                    value={allocationForm.to_employee_name}
                    onChange={e => setAllocationForm(f => ({ ...f, to_employee_name: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Effective Movement Date *</Label>
                <Input
                  type="date"
                  className="h-8 text-xs bg-background"
                  value={allocationForm.date}
                  onChange={e => setAllocationForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Asset Condition Check</Label>
                <Select value={allocationForm.condition} onValueChange={v => setAllocationForm(f => ({ ...f, condition: v }))}>
                  <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["New", "Good / Operational", "Minor Wear", "Requires Maintenance"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Movement Remarks &amp; Handover Notes</Label>
              <Input
                className="h-8 text-xs bg-background"
                placeholder="e.g. Issued for official staff workstation / Routine unit handover"
                value={allocationForm.remarks}
                onChange={e => setAllocationForm(f => ({ ...f, remarks: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAllocationDialog(false)}>Cancel</Button>
            <Button 
              size="sm" 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]" 
              onClick={handleConfirmAllocation}
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              {allocationMode === "ALLOCATE" ? "Confirm Allocation" : allocationMode === "DEALLOCATE" ? "Confirm Deallocation" : "Confirm Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: REGISTER / EXTEND WARRANTY (WITH DOCUMENT UPLOAD) ───────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showWarrantyModal} onOpenChange={setShowWarrantyModal}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              {warrantyModalMode === "EXTEND" ? "Extend / Update Asset Warranty Terms" : "Register New Asset Warranty Policy"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure manufacturer warranty, extended warranty, or comprehensive AMC SLA with attached contract documents.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Select Asset *</Label>
              <Select 
                value={warrantyForm.asset_id} 
                onValueChange={v => setWarrantyForm(f => ({ ...f, asset_id: v }))}
                disabled={warrantyModalMode === "EXTEND"}
              >
                <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="Choose asset..." /></SelectTrigger>
                <SelectContent>
                  {assets.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.asset_name} ({a.asset_code || "No Tag"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Warranty / Coverage Type *</Label>
                <Select 
                  value={warrantyForm.warranty_type} 
                  onValueChange={(v: any) => setWarrantyForm(f => ({ ...f, warranty_type: v }))}
                >
                  <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard Manufacturer">Standard Manufacturer Warranty</SelectItem>
                    <SelectItem value="Extended Warranty">Extended Warranty (Add-on)</SelectItem>
                    <SelectItem value="Annual Maintenance Contract (AMC)">Annual Maintenance Contract (AMC)</SelectItem>
                    <SelectItem value="Comprehensive SLA">Comprehensive SLA / 24x7 Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Warranty Provider / Vendor *</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="e.g. Al-Futtaim Engineering / Carrier Qatar"
                  value={warrantyForm.provider_name}
                  onChange={e => setWarrantyForm(f => ({ ...f, provider_name: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Policy / Certificate #</Label>
                <Input
                  className="h-8 text-xs font-mono"
                  placeholder="POL-2026-XXXX"
                  value={warrantyForm.policy_number}
                  onChange={e => setWarrantyForm(f => ({ ...f, policy_number: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Start Date *</Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={warrantyForm.start_date}
                  onChange={e => setWarrantyForm(f => ({ ...f, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Duration (Months)</Label>
                <Select value={warrantyForm.duration_months} onValueChange={v => setWarrantyForm(f => ({ ...f, duration_months: v }))}>
                  <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months (1 Year)</SelectItem>
                    <SelectItem value="24">24 Months (2 Years)</SelectItem>
                    <SelectItem value="36">36 Months (3 Years)</SelectItem>
                    <SelectItem value="60">60 Months (5 Years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Support Contact Email</Label>
                <Input
                  type="email"
                  className="h-8 text-xs"
                  placeholder="service@vendor.qa"
                  value={warrantyForm.support_email}
                  onChange={e => setWarrantyForm(f => ({ ...f, support_email: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Support Helpline Phone</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="+974 4400 0000"
                  value={warrantyForm.support_phone}
                  onChange={e => setWarrantyForm(f => ({ ...f, support_phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Coverage Terms &amp; Inclusions</Label>
              <Textarea
                className="text-xs"
                rows={2}
                placeholder="Details of covered components (e.g. Compressor, motor, free labor, emergency response within 4 hours)..."
                value={warrantyForm.coverage_scope}
                onChange={e => setWarrantyForm(f => ({ ...f, coverage_scope: e.target.value }))}
              />
            </div>

            {/* Document Upload Section */}
            <div className="p-3 rounded-lg border bg-muted/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5 text-primary" /> Upload Warranty Certificates &amp; Invoices
                </Label>
                <span className="text-[10px] text-muted-foreground">PDF / Images</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Input
                  className="h-8 text-xs col-span-1"
                  placeholder="Doc Name (e.g. Warranty Certificate)"
                  value={warrantyForm.new_doc_name}
                  onChange={e => setWarrantyForm(f => ({ ...f, new_doc_name: e.target.value }))}
                />
                <Input
                  type="file"
                  className="h-8 text-xs col-span-1 bg-background"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) setWarrantyForm(prev => ({ ...prev, new_doc_filename: f.name }));
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => {
                    if (!warrantyForm.new_doc_name.trim()) return toast.error("Please enter a document name.");
                    const docName = warrantyForm.new_doc_name.trim();
                    const fileName = warrantyForm.new_doc_filename || `${docName.replace(/\s+/g, "_")}.pdf`;
                    setWarrantyForm(prev => ({
                      ...prev,
                      documents: [
                        ...prev.documents,
                        { id: `doc-${Date.now()}`, name: docName, file_name: fileName, upload_date: getTodayIST() }
                      ],
                      new_doc_filename: ""
                    }));
                    toast.success(`Document "${docName}" attached.`);
                  }}
                >
                  <Upload className="h-3 w-3" /> Attach File
                </Button>
              </div>

              {warrantyForm.documents.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {warrantyForm.documents.map((doc, idx) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 rounded bg-card border text-xs">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="font-semibold text-foreground">{doc.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">({doc.file_name})</span>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 text-destructive hover:bg-destructive/10"
                        onClick={() => setWarrantyForm(prev => ({
                          ...prev,
                          documents: prev.documents.filter((_, i) => i !== idx)
                        }))}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowWarrantyModal(false)}>Cancel</Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSaveWarranty}>
              Save Warranty Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: EDIT ASSET DETAILS ──────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={!!editingAsset} onOpenChange={open => !open && setEditingAsset(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-primary" /> Edit Asset Details
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update specification, category, valuation, serials, and condition for {editingAsset?.asset_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Asset Name *</Label>
                <Input
                  className="h-8 text-xs"
                  value={editForm.asset_name}
                  onChange={e => setEditForm(f => ({ ...f, asset_name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Category *</Label>
                <Select value={editForm.category} onValueChange={v => setEditForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Furniture", "Appliances", "Electronics", "Plant & Machinery", "Vehicles", "Office Equipment", "Fixtures & Fittings", "Building Improvement", "Other"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Asset Tag / Barcode</Label>
                <Input
                  className="h-8 text-xs font-mono"
                  value={editForm.asset_code}
                  onChange={e => setEditForm(f => ({ ...f, asset_code: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Serial Number</Label>
                <Input
                  className="h-8 text-xs font-mono"
                  value={editForm.serial_number}
                  onChange={e => setEditForm(f => ({ ...f, serial_number: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Purchase Value (QAR)</Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-mono"
                  value={editForm.purchase_cost}
                  onChange={e => setEditForm(f => ({ ...f, purchase_cost: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Commission Date</Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={editForm.purchase_date}
                  onChange={e => setEditForm(f => ({ ...f, purchase_date: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Useful Life (Months)</Label>
                <Input
                  type="number"
                  className="h-8 text-xs"
                  value={editForm.life_of_asset}
                  onChange={e => setEditForm(f => ({ ...f, life_of_asset: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Depreciation Method / Brand</Label>
                <Input
                  className="h-8 text-xs"
                  value={editForm.brand}
                  onChange={e => setEditForm(f => ({ ...f, brand: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Supplier / Vendor</Label>
                <Input
                  className="h-8 text-xs"
                  value={editForm.supplier}
                  onChange={e => setEditForm(f => ({ ...f, supplier: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Asset Condition</Label>
                <Select value={editForm.asset_condition} onValueChange={v => setEditForm(f => ({ ...f, asset_condition: v }))}>
                  <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["New", "Good", "Minor Wear", "Needs Repair", "Fair"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Specifications / Description</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="Dimensions, model details..."
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditingAsset(null)}>Cancel</Button>
            <Button size="sm" disabled={saving} onClick={handleEditAssetSubmit} className="bg-primary hover:bg-primary/90 text-white min-w-[100px]">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: ASSET DETAILS & COMPLETE HISTORY (CTA TARGET) ───────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={!!selectedAssetForDetail} onOpenChange={(open) => !open && setSelectedAssetForDetail(null)}>
        <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-xl">
          {selectedAssetForDetail && (
            <>
              <DialogHeader className="p-5 pb-3 border-b bg-gradient-to-r from-muted/60 via-background to-muted/40 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-lg font-bold">{selectedAssetForDetail.asset_name}</DialogTitle>
                      <Badge variant="outline" className={`text-xs ${getAssetStatus(selectedAssetForDetail).badgeClass}`}>
                        {getAssetStatus(selectedAssetForDetail).label}
                      </Badge>
                    </div>
                    <DialogDescription className="text-xs font-mono mt-0.5 flex items-center gap-2">
                      <span>Tag: {selectedAssetForDetail.asset_code}</span>
                      {selectedAssetForDetail.serial_number && <span>• SN: {selectedAssetForDetail.serial_number}</span>}
                      <span>• Category: {selectedAssetForDetail.category || "Fixed Asset"}</span>
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10"
                      onClick={() => openEditAssetModal(selectedAssetForDetail)}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 gap-1.5 text-xs font-mono"
                      onClick={() => setPrintBarcode(selectedAssetForDetail.asset_code || "")}
                    >
                      <Printer className="h-3.5 w-3.5" /> Print QR / Tag
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg border bg-card/60">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Purchase Cost</span>
                    <p className="text-sm font-bold font-mono text-foreground mt-0.5">
                      QAR {Number(selectedAssetForDetail.purchase_cost || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-card/60">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Useful Life</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {selectedAssetForDetail.life_of_asset ? `${(selectedAssetForDetail.life_of_asset / 12).toFixed(1)} Years` : "5.0 Years"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-card/60">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Current Location</span>
                    <p className={`text-sm font-semibold mt-0.5 truncate ${selectedAssetForDetail.assigned_property_code === "Corporate Office" ? "text-indigo-600" : "text-blue-600"}`}>
                      {selectedAssetForDetail.assigned_property_code === "Corporate Office" ? "Corporate Office (HQ)" : (selectedAssetForDetail.assigned_property_code || selectedAssetForDetail.properties?.title || "Central Inventory Pool")}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-card/60">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      {selectedAssetForDetail.assigned_property_code === "Corporate Office" ? "Staff Custodian & Space" : "Assigned Unit / User"}
                    </span>
                    <p className="text-sm font-semibold text-foreground mt-0.5 truncate">
                      {selectedAssetForDetail.assigned_property_code === "Corporate Office" ? (
                        selectedAssetForDetail.assigned_employee_name 
                          ? `${selectedAssetForDetail.assigned_employee_name}${selectedAssetForDetail.assigned_unit_code ? ` (${selectedAssetForDetail.assigned_unit_code})` : ""}`
                          : "Corporate Staff"
                      ) : (
                        selectedAssetForDetail.assigned_unit_code ? `Unit ${selectedAssetForDetail.assigned_unit_code}` : (selectedAssetForDetail.assigned_employee_name || "— Unassigned —")
                      )}
                    </p>
                  </div>
                </div>

                <Tabs defaultValue="history" className="w-full">
                  <TabsList className="grid grid-cols-5 h-9">
                    <TabsTrigger value="history" className="text-xs gap-1">
                      <ArrowRightLeft className="h-3 w-3" /> Allocations
                    </TabsTrigger>
                    <TabsTrigger value="warranty" className="text-xs gap-1">
                      <ShieldCheck className="h-3 w-3" /> Warranty &amp; AMC
                    </TabsTrigger>
                    <TabsTrigger value="maintenance" className="text-xs gap-1">
                      <Wrench className="h-3 w-3" /> Maintenance
                    </TabsTrigger>
                    <TabsTrigger value="financials" className="text-xs gap-1">
                      <DollarSign className="h-3 w-3" /> Financials
                    </TabsTrigger>
                    <TabsTrigger value="specs" className="text-xs gap-1">
                      <Layers className="h-3 w-3" /> Specs
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="history" className="space-y-3 pt-3">
                    <div className="rounded-lg border p-4 bg-muted/20">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                        <ArrowRightLeft className="h-3.5 w-3.5 text-primary" /> Lifecycle Movement &amp; Custody Trail
                      </h4>
                      {assetDetailHistory?.allocations.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <ArrowRightLeft className="mx-auto h-6 w-6 mb-1 opacity-40" />
                          <p className="text-xs">No movements recorded yet.</p>
                          {getAssetStatus(selectedAssetForDetail).isAllocated && (
                            <p className="text-[11px] text-primary mt-1">
                              Currently deployed to: {selectedAssetForDetail.assigned_property_code || "Property"} {selectedAssetForDetail.assigned_unit_code ? `(Unit ${selectedAssetForDetail.assigned_unit_code})` : ""}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {assetDetailHistory?.allocations.map(al => (
                            <div key={al.id} className="flex items-start gap-3 p-2.5 rounded border bg-card text-xs">
                              <div className="p-1.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold shrink-0">
                                {al.action_type}
                              </div>
                              <div className="flex-1 space-y-0.5">
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-foreground">
                                    {al.action_type === "ALLOCATION" ? `Allocated to ${al.to_property}` :
                                     al.action_type === "DEALLOCATION" ? `Deallocated back to inventory` :
                                     `Transferred: ${al.from_property} → ${al.to_property}`}
                                  </span>
                                  <span className="text-[11px] font-mono text-muted-foreground">{formatDDMMMYYYY(al.date)}</span>
                                </div>
                                <p className="text-muted-foreground text-[11px]">
                                  {al.to_unit && `Unit: ${al.to_unit} • `}
                                  {al.to_employee && `Recipient: ${al.to_employee} • `}
                                  Condition: {al.condition || "Good"}
                                </p>
                                {al.remarks && <p className="text-xs italic text-muted-foreground mt-1">"{al.remarks}"</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="warranty" className="space-y-3 pt-3">
                    <div className="rounded-lg border p-4 bg-muted/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" /> Active Warranty Policy &amp; Terms
                        </h4>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs gap-1 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10"
                          onClick={() => openWarrantyModal(selectedAssetForDetail, assetDetailHistory?.warranty || undefined)}
                        >
                          <ShieldCheck className="h-3 w-3" /> Update Warranty
                        </Button>
                      </div>

                      {assetDetailHistory?.warranty ? (
                        <div className="space-y-3 text-xs">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="p-2.5 rounded bg-card border">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">Policy Type</span>
                              <p className="font-semibold text-foreground mt-0.5">{assetDetailHistory.warranty.warranty_type}</p>
                              {assetDetailHistory.warranty.policy_number && (
                                <p className="text-[10px] font-mono text-muted-foreground">#{assetDetailHistory.warranty.policy_number}</p>
                              )}
                            </div>
                            <div className="p-2.5 rounded bg-card border">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">Provider / Vendor</span>
                              <p className="font-semibold text-foreground mt-0.5">{assetDetailHistory.warranty.provider_name}</p>
                              <p className="text-[10px] text-muted-foreground">{assetDetailHistory.warranty.support_phone || "Support on record"}</p>
                            </div>
                            <div className="p-2.5 rounded bg-card border">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">Valid Until</span>
                              <p className="font-mono font-bold text-foreground mt-0.5">{formatDDMMMYYYY(assetDetailHistory.warranty.expiry_date)}</p>
                              <Badge variant="outline" className="text-[9px] mt-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-mono">
                                {assetDetailHistory.warranty.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="p-3 rounded bg-card border">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase">Coverage Scope &amp; Terms:</span>
                            <p className="text-foreground mt-1">{assetDetailHistory.warranty.coverage_scope}</p>
                          </div>

                          {assetDetailHistory.warranty.documents && assetDetailHistory.warranty.documents.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] text-muted-foreground font-bold uppercase">Attached Proof Documents:</span>
                              <div className="flex flex-wrap gap-2">
                                {assetDetailHistory.warranty.documents.map(d => (
                                  <div key={d.id} className="flex items-center gap-1.5 p-1.5 px-2.5 rounded border bg-card text-xs">
                                    <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    <span className="font-medium text-foreground">{d.name}</span>
                                    <span className="text-[10px] text-muted-foreground font-mono">({d.file_name})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Shield className="mx-auto h-6 w-6 mb-1 opacity-40" />
                          <p className="text-xs">No warranty policy registered for this asset.</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs mt-2 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10"
                            onClick={() => openWarrantyModal(selectedAssetForDetail)}
                          >
                            Register Warranty Now
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="maintenance" className="space-y-3 pt-3">
                    <div className="rounded-lg border p-4 bg-muted/20">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                        <Wrench className="h-3.5 w-3.5 text-amber-500" /> Maintenance &amp; Repair Work Orders
                      </h4>
                      {assetDetailHistory?.maintenances.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Wrench className="mx-auto h-6 w-6 mb-1 opacity-40" />
                          <p className="text-xs">No maintenance work orders logged for this asset.</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {assetDetailHistory?.maintenances.map(m => (
                            <div key={m.id} className="p-3 rounded border bg-card flex items-center justify-between gap-3 text-xs">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-foreground">{m.id}</span>
                                  <Badge variant="outline" className="text-[10px]">{m.maintenance_type}</Badge>
                                  <Badge variant="outline" className="text-[10px] font-mono text-amber-600 bg-amber-500/10 border-amber-500/30">
                                    {m.status}
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  Vendor: {m.service_vendor} {m.technician_name && `• Tech: ${m.technician_name}`} • Scheduled: {formatDDMMMYYYY(m.scheduled_date)}
                                </p>
                                {m.completion_notes && (
                                  <p className="text-[11px] text-emerald-600 mt-0.5">Notes: {m.completion_notes}</p>
                                )}
                              </div>
                              <div className="text-right font-mono font-bold">
                                QAR {(m.actual_cost || m.estimated_cost || 0).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="financials" className="space-y-3 pt-3">
                    <div className="rounded-lg border p-4 bg-muted/20 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-500" /> Book Value &amp; Depreciation Profile
                      </h4>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="p-2.5 rounded bg-card border">
                          <span className="text-[10px] text-muted-foreground">Original Cost</span>
                          <p className="font-mono font-bold text-foreground">QAR {Number(selectedAssetForDetail.purchase_cost || 0).toLocaleString()}</p>
                        </div>
                        <div className="p-2.5 rounded bg-card border">
                          <span className="text-[10px] text-muted-foreground">Depreciation Method</span>
                          <p className="font-medium text-foreground">{selectedAssetForDetail.brand || "Straight Line Method (SLM)"}</p>
                        </div>
                        <div className="p-2.5 rounded bg-card border">
                          <span className="text-[10px] text-muted-foreground">Commission Date</span>
                          <p className="font-mono text-foreground">{formatDDMMMYYYY(selectedAssetForDetail.purchase_date)}</p>
                        </div>
                      </div>

                      {assetDetailHistory?.revaluations && assetDetailHistory.revaluations.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-[11px] font-bold text-foreground mb-1.5">Revaluation Adjustments</h5>
                          {assetDetailHistory.revaluations.map(r => (
                            <div key={r.id} className="p-2 rounded bg-card border flex justify-between text-xs font-mono">
                              <span>{formatDDMMMYYYY(r.date)}: QAR {r.prev_value.toLocaleString()} → QAR {r.new_value.toLocaleString()}</span>
                              <span className="text-muted-foreground">({r.reason})</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {assetDetailHistory?.sale && (
                        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs">
                          <span className="font-bold text-emerald-700 dark:text-emerald-300">Disposal via Sale</span>
                          <p className="text-[11px] mt-0.5">
                            Sold to {assetDetailHistory.sale.buyer} on {formatDDMMMYYYY(assetDetailHistory.sale.date)} for <strong>QAR {assetDetailHistory.sale.sale_value.toLocaleString()}</strong>.
                          </p>
                        </div>
                      )}

                      {assetDetailHistory?.writeoff && (
                        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs">
                          <span className="font-bold text-red-700 dark:text-red-300">Written Off &amp; Scrapped</span>
                          <p className="text-[11px] mt-0.5">
                            Decommissioned on {formatDDMMMYYYY(assetDetailHistory.writeoff.date)}. Reason: {assetDetailHistory.writeoff.writeoff_reason}. Approved by: {assetDetailHistory.writeoff.approved_by || "Management"}.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="specs" className="space-y-3 pt-3">
                    <div className="rounded-lg border p-4 bg-muted/20 space-y-3 text-xs">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-blue-500" /> Technical Data &amp; Specifications
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Asset ID: <span className="font-mono text-foreground">{selectedAssetForDetail.id}</span></div>
                        <div>Category: <span className="text-foreground">{selectedAssetForDetail.category || "Fixed Asset"}</span></div>
                        <div>Serial Number: <span className="font-mono text-foreground">{selectedAssetForDetail.serial_number || "N/A"}</span></div>
                        <div>Condition: <span className="text-foreground">{selectedAssetForDetail.asset_condition || "Good"}</span></div>
                        <div>Supplier / Vendor: <span className="text-foreground">{selectedAssetForDetail.supplier || "—"}</span></div>
                        <div>Barcode: <span className="font-mono text-foreground">{selectedAssetForDetail.asset_code}</span></div>
                      </div>
                      {selectedAssetForDetail.description && (
                        <div className="p-2.5 rounded bg-card border mt-2">
                          <span className="text-[10px] text-muted-foreground font-semibold">Notes / Description:</span>
                          <p className="mt-1 text-foreground">{selectedAssetForDetail.description}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter className="p-3 border-t bg-muted/20 shrink-0">
                <Button size="sm" variant="outline" onClick={() => setSelectedAssetForDetail(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: 4-STEP CANONICAL ASSET CREATION (ADD ASSET) ────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3 border-b bg-gradient-to-r from-muted/60 via-background to-muted/40 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Register New Fixed Asset
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Complete asset details, finance general ledger setup, warranty terms, and document attachments.
                </DialogDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono bg-primary/10 text-primary border-primary/20">
                Step {stepperStep} of 4
              </Badge>
            </div>

            {/* Stepper Navigation */}
            <div className="grid grid-cols-4 gap-2 pt-3">
              {[
                { step: 1, label: "Asset & Finance GL", icon: DollarSign },
                { step: 2, label: "Warranty & SLA", icon: ShieldCheck },
                { step: 3, label: "Documents & Invoices", icon: Paperclip },
                { step: 4, label: "Specifications & Review", icon: Layers },
              ].map((s) => {
                const Icon = s.icon;
                const isActive = stepperStep === s.step;
                const isDone = stepperStep > s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setStepperStep(s.step as any)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-all border ${
                      isActive
                        ? "bg-primary text-white border-primary shadow-sm font-semibold"
                        : isDone
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                        : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted"
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                      isActive ? "bg-white text-primary" : isDone ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {isDone ? <Check className="h-3 w-3" /> : s.step}
                    </div>
                    <span className="truncate text-[11px]">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* ── STEP 1: ASSET DETAILS & FINANCE GENERAL LEDGER ── */}
            {stepperStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Asset / Item Name *</Label>
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. Executive Wooden Conference Table"
                      value={form.item_name}
                      onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Category *</Label>
                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                      <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Furniture", "Appliances", "Electronics", "Plant & Machinery", "Vehicles", "Office Equipment", "Fixtures & Fittings", "Building Improvement", "Other"].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Asset Tag / Barcode Code</Label>
                    <Input
                      className="h-8 text-xs font-mono"
                      placeholder="e.g. AST-0820 (Auto if blank)"
                      value={form.asset_tag_id}
                      onChange={e => setForm(f => ({ ...f, asset_tag_id: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Serial Number</Label>
                    <Input
                      className="h-8 text-xs font-mono"
                      placeholder="e.g. SN-98234-LG"
                      value={form.serial_number}
                      onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Supplier / Vendor</Label>
                    <Select value={form.vendor_id} onValueChange={v => setForm(f => ({ ...f, vendor_id: v }))}>
                      <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="Select supplier..." /></SelectTrigger>
                      <SelectContent>
                        {vendors.map(v => (
                          <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Acquisition / Purchase Cost (QAR) *</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs font-mono"
                      placeholder="0.00"
                      value={form.acquisition_amount}
                      onChange={e => setForm(f => ({ ...f, acquisition_amount: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Commission / Purchase Date</Label>
                    <Input
                      type="date"
                      className="h-8 text-xs"
                      value={form.commission_date}
                      onChange={e => setForm(f => ({ ...f, commission_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Useful Life (Years)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs font-mono"
                      value={form.useful_life_years}
                      onChange={e => setForm(f => ({ ...f, useful_life_years: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Finance GL Account Mapping Box */}
                <div className="p-3.5 rounded-lg border bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> General Ledger Accounting Postings (Automated)
                    </Label>
                    <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 border-emerald-500/30">
                      Balance: QAR {Number(form.acquisition_amount || 0).toLocaleString()}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2 rounded bg-card border text-xs">
                      <span className="font-mono text-muted-foreground">Dr: 12300001 - Fixed Asset (Capital Cost / Asset A/C)</span>
                      <span className="font-mono font-bold text-emerald-600">QAR {Number(form.acquisition_amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-card border text-xs">
                      <span className="font-mono text-muted-foreground">Cr: 22100001 - Trade Payables (Vendors / Supplier A/C)</span>
                      <span className="font-mono font-bold text-emerald-600">QAR {Number(form.acquisition_amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: WARRANTY & SLA ── */}
            {stepperStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div>
                    <p className="font-bold text-foreground text-xs">Register Warranty &amp; Maintenance Terms</p>
                    <p className="text-[11px] text-muted-foreground">Enable to track manufacturer warranty, SLA coverage, and renewal dates.</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    checked={form.has_warranty}
                    onChange={e => setForm(f => ({ ...f, has_warranty: e.target.checked }))}
                  />
                </div>

                {form.has_warranty && (
                  <div className="space-y-3 p-3.5 rounded-lg border bg-card">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Warranty Policy Type *</Label>
                        <Select
                          value={form.warranty_type}
                          onValueChange={v => setForm(f => ({ ...f, warranty_type: v as any }))}
                        >
                          <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Standard Manufacturer">Standard Manufacturer Warranty</SelectItem>
                            <SelectItem value="Extended Warranty">Extended Warranty</SelectItem>
                            <SelectItem value="Annual Maintenance Contract (AMC)">Annual Maintenance Contract (AMC)</SelectItem>
                            <SelectItem value="Comprehensive SLA">Comprehensive SLA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Warranty / Service Provider *</Label>
                        <Input
                          className="h-8 text-xs"
                          placeholder="e.g. Al-Futtaim Technologies / LG Electronics"
                          value={form.warranty_provider}
                          onChange={e => setForm(f => ({ ...f, warranty_provider: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Policy / Contract No.</Label>
                        <Input
                          className="h-8 text-xs font-mono"
                          placeholder="e.g. POL-QA-2026-9021"
                          value={form.warranty_policy_no}
                          onChange={e => setForm(f => ({ ...f, warranty_policy_no: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Warranty Start Date</Label>
                        <Input
                          type="date"
                          className="h-8 text-xs"
                          value={form.warranty_start_date}
                          onChange={e => setForm(f => ({ ...f, warranty_start_date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Duration (Months)</Label>
                        <Input
                          type="number"
                          className="h-8 text-xs font-mono"
                          value={form.warranty_duration_months}
                          onChange={e => setForm(f => ({ ...f, warranty_duration_months: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Support Contact Email</Label>
                        <Input
                          type="email"
                          className="h-8 text-xs"
                          placeholder="service@provider.qa"
                          value={form.warranty_support_email}
                          onChange={e => setForm(f => ({ ...f, warranty_support_email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Support Helpline Phone</Label>
                        <Input
                          className="h-8 text-xs"
                          placeholder="+974 4400 0000"
                          value={form.warranty_support_phone}
                          onChange={e => setForm(f => ({ ...f, warranty_support_phone: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Coverage Terms &amp; Inclusions</Label>
                      <Textarea
                        className="text-xs"
                        rows={2}
                        value={form.warranty_coverage}
                        onChange={e => setForm(f => ({ ...f, warranty_coverage: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: DOCUMENT UPLOADS ── */}
            {stepperStep === 3 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                        <Paperclip className="h-4 w-4 text-primary" /> Attach Invoices, Warranty Cards &amp; Manuals
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Upload supporting documentation for compliance and warranty claims.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      className="h-8 text-xs col-span-1"
                      placeholder="Doc Name (e.g. Invoice / Warranty Card)"
                      value={form.doc_input_name}
                      onChange={e => setForm(f => ({ ...f, doc_input_name: e.target.value }))}
                    />
                    <Input
                      type="file"
                      className="h-8 text-xs col-span-1 bg-background"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) setForm(prev => ({ ...prev, doc_input_file: f.name }));
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => {
                        if (!form.doc_input_name.trim()) return toast.error("Please enter a document title.");
                        const docName = form.doc_input_name.trim();
                        const fileName = form.doc_input_file || `${docName.replace(/\s+/g, "_")}.pdf`;
                        setForm(prev => ({
                          ...prev,
                          documents: [
                            ...prev.documents,
                            { id: `doc-${Date.now()}`, name: docName, file_name: fileName, upload_date: getTodayIST() }
                          ],
                          doc_input_file: ""
                        }));
                        toast.success(`Document "${docName}" attached.`);
                      }}
                    >
                      <Upload className="h-3 w-3" /> Attach File
                    </Button>
                  </div>

                  {form.documents.length > 0 ? (
                    <div className="space-y-1.5 pt-2">
                      {form.documents.map((doc, idx) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 rounded bg-card border text-xs">
                          <div className="flex items-center gap-2">
                            <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="font-semibold text-foreground">{doc.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">({doc.file_name})</span>
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 text-destructive hover:bg-destructive/10"
                            onClick={() => setForm(prev => ({
                              ...prev,
                              documents: prev.documents.filter((_, i) => i !== idx)
                            }))}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                      <Paperclip className="mx-auto h-5 w-5 mb-1 opacity-40" />
                      <p className="text-xs">No documents attached yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 4: SPECIFICATIONS & REVIEW ── */}
            {stepperStep === 4 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg border bg-muted/20 space-y-3">
                  <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" /> Technical Specifications
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      className="h-8 text-xs"
                      placeholder="Property (e.g. Dimensions)"
                      value={form.spec_type_input}
                      onChange={e => setForm(f => ({ ...f, spec_type_input: e.target.value }))}
                    />
                    <Input
                      className="h-8 text-xs"
                      placeholder="Value (e.g. 200cm x 100cm)"
                      value={form.spec_details_input}
                      onChange={e => setForm(f => ({ ...f, spec_details_input: e.target.value }))}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1"
                      onClick={() => {
                        if (!form.spec_type_input.trim() || !form.spec_details_input.trim()) {
                          return toast.error("Enter specification key and value.");
                        }
                        setForm(f => ({
                          ...f,
                          specifications: [...f.specifications, { id: String(Date.now()), spec_type: f.spec_type_input.trim(), spec_details: f.spec_details_input.trim() }],
                          spec_type_input: "",
                          spec_details_input: "",
                        }));
                      }}
                    >
                      <Plus className="h-3 w-3" /> Add Spec
                    </Button>
                  </div>

                  {form.specifications.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {form.specifications.map((s, idx) => (
                        <div key={s.id} className="flex items-center justify-between p-2 rounded bg-card border text-xs">
                          <div>
                            <span className="font-semibold text-foreground">{s.spec_type}:</span> {s.spec_details}
                          </div>
                          <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, specifications: f.specifications.filter((_, i) => i !== idx) }))}
                            className="text-destructive hover:opacity-75"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary Review Card */}
                <div className="p-3.5 rounded-lg border bg-card space-y-2.5">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                    Registration Summary
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded bg-muted/40">
                      <span className="text-[10px] text-muted-foreground">Asset Name</span>
                      <p className="font-semibold truncate">{form.item_name || "—"}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/40">
                      <span className="text-[10px] text-muted-foreground">Category</span>
                      <p className="font-semibold">{form.category}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/40">
                      <span className="text-[10px] text-muted-foreground">Acquisition Cost</span>
                      <p className="font-mono font-bold text-emerald-600">QAR {Number(form.acquisition_amount || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/40">
                      <span className="text-[10px] text-muted-foreground">Warranty</span>
                      <p className="font-semibold">{form.has_warranty ? `${form.warranty_duration_months} Mos (${form.warranty_type})` : "None"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t bg-muted/20 shrink-0 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={stepperStep === 1}
              onClick={() => setStepperStep(s => Math.max(1, s - 1) as any)}
            >
              Previous
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowNew(false)}>
                Cancel
              </Button>
              {stepperStep < 4 ? (
                <Button
                  size="sm"
                  className="bg-primary text-white"
                  onClick={() => {
                    if (stepperStep === 1 && !form.item_name.trim()) {
                      return toast.error("Please enter Asset Name.");
                    }
                    setStepperStep(s => Math.min(4, s + 1) as any);
                  }}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={saving}
                  onClick={handleCreateAsset}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null} Complete &amp; Capitalize
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: NEW MAINTENANCE WORK ORDER ──────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showNewMaintenance} onOpenChange={setShowNewMaintenance}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-500" /> New Maintenance Work Order
            </DialogTitle>
            <DialogDescription className="text-xs">
              Log preventive maintenance, service ticket, or repair for unallocated available stock items.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Select Available Asset *</Label>
              <Select value={maintForm.asset_id} onValueChange={v => setMaintForm(f => ({ ...f, asset_id: v }))}>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Select available unallocated asset..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUnallocatedAssets.length === 0 ? (
                    <div className="p-3 text-center text-xs text-muted-foreground">No available unallocated assets found.</div>
                  ) : (
                    availableUnallocatedAssets.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.asset_name} ({a.asset_code || "No Code"}) — Available in Stock
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Maintenance Type *</Label>
                <Select
                  value={maintForm.maintenance_type}
                  onValueChange={v => setMaintForm(f => ({ ...f, maintenance_type: v as any }))}
                >
                  <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Preventive Maintenance", "Corrective Repair", "Calibration / Testing", "Inspection / Audit", "Major Overhaul"].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Priority *</Label>
                <Select
                  value={maintForm.priority}
                  onValueChange={v => setMaintForm(f => ({ ...f, priority: v as any }))}
                >
                  <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Low", "Medium", "High", "Critical"].map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Service Vendor / Contractor</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="e.g. In-House Facility Team / Al-Mana MEP"
                  value={maintForm.service_vendor}
                  onChange={e => setMaintForm(f => ({ ...f, service_vendor: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Technician Name</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="e.g. Tariq Mahmoud"
                  value={maintForm.technician_name}
                  onChange={e => setMaintForm(f => ({ ...f, technician_name: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Scheduled Date *</Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={maintForm.scheduled_date}
                  onChange={e => setMaintForm(f => ({ ...f, scheduled_date: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Estimated Cost (QAR)</Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-mono"
                  value={maintForm.estimated_cost}
                  onChange={e => setMaintForm(f => ({ ...f, estimated_cost: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Work Order Description</Label>
              <Textarea
                className="text-xs"
                rows={2}
                placeholder="Scope of service, fault reported, parts to inspect..."
                value={maintForm.description}
                onChange={e => setMaintForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowNewMaintenance(false)}>Cancel</Button>
            <Button size="sm" disabled={saving} onClick={handleCreateMaintenance} className="bg-amber-600 hover:bg-amber-700 text-white min-w-[120px]">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null} Create Work Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: COMPLETE MAINTENANCE WORK ORDER ─────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={!!completeMaintModal} onOpenChange={open => !open && setCompleteMaintModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Complete Work Order {completeMaintModal?.id}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record completion details and restore {completeMaintModal?.asset_name} to Available inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Actual Incurred Cost (QAR) *</Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-mono"
                  placeholder={String(completeMaintModal?.estimated_cost || 0)}
                  value={completeMaintForm.actual_cost}
                  onChange={e => setCompleteMaintForm(f => ({ ...f, actual_cost: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Completion Date</Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={completeMaintForm.completed_date}
                  onChange={e => setCompleteMaintForm(f => ({ ...f, completed_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Vendor Invoice / Reference No.</Label>
              <Input
                className="h-8 text-xs font-mono"
                placeholder="e.g. INV-SVC-9921"
                value={completeMaintForm.invoice_ref}
                onChange={e => setCompleteMaintForm(f => ({ ...f, invoice_ref: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Completion Notes / Work Carried Out</Label>
              <Textarea
                className="text-xs"
                rows={2}
                placeholder="Summary of repair actions, filters replaced, oil changed..."
                value={completeMaintForm.completion_notes}
                onChange={e => setCompleteMaintForm(f => ({ ...f, completion_notes: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCompleteMaintModal(null)}>Cancel</Button>
            <Button size="sm" onClick={handleCompleteMaintenance} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Complete &amp; Restore Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: NEW ASSET REVALUATION ───────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showRevaluation} onOpenChange={setShowRevaluation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" /> Record Asset Revaluation
            </DialogTitle>
            <DialogDescription className="text-xs">
              Adjust carrying fair market value for unallocated assets. Surplus or impairment is posted to GL.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Select Available Asset *</Label>
              <Select
                value={revalForm.asset_id}
                onValueChange={v => {
                  const a = assets.find(x => x.id === v);
                  setRevalForm(f => ({
                    ...f,
                    asset_id: v,
                    prev_value: a ? String(a.purchase_cost || 0) : "",
                  }));
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Choose unallocated asset..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUnallocatedAssets.length === 0 ? (
                    <div className="p-3 text-center text-xs text-muted-foreground">No available unallocated assets.</div>
                  ) : (
                    availableUnallocatedAssets.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.asset_name} ({a.asset_code || "No Code"}) — Book Val: QAR {Number(a.purchase_cost || 0).toLocaleString()}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Previous Book Value (QAR)</Label>
                <Input
                  className="h-8 text-xs font-mono bg-muted"
                  disabled
                  value={revalForm.prev_value}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">New Fair Value (QAR) *</Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-mono font-bold text-purple-600"
                  placeholder="0.00"
                  value={revalForm.new_value}
                  onChange={e => setRevalForm(f => ({ ...f, new_value: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Revaluation Date *</Label>
              <Input
                type="date"
                className="h-8 text-xs"
                value={revalForm.date}
                onChange={e => setRevalForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Reason for Adjustment</Label>
              <Input
                className="h-8 text-xs"
                placeholder="e.g. Annual market valuation, expert appraisal, tech obsolescence"
                value={revalForm.reason}
                onChange={e => setRevalForm(f => ({ ...f, reason: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowRevaluation(false)}>Cancel</Button>
            <Button size="sm" disabled={saving} onClick={handleCreateRevaluation} className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null} Post Revaluation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: RECORD ASSET SALE ───────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showSell} onOpenChange={setShowSell}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" /> Record Asset Sale &amp; Disposal
            </DialogTitle>
            <DialogDescription className="text-xs">
              Dispose of unallocated assets with automated Receipt Voucher generation and GL derecognition.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Select Available Asset *</Label>
              <Select
                value={sellForm.asset_id}
                onValueChange={v => {
                  const a = assets.find(x => x.id === v);
                  setSellForm(f => ({
                    ...f,
                    asset_id: v,
                    book_value: a ? String(a.purchase_cost || 0) : "",
                  }));
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Choose unallocated asset..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUnallocatedAssets.length === 0 ? (
                    <div className="p-3 text-center text-xs text-muted-foreground">No available unallocated assets.</div>
                  ) : (
                    availableUnallocatedAssets.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.asset_name} ({a.asset_code || "No Code"}) — Book Val: QAR {Number(a.purchase_cost || 0).toLocaleString()}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Book Value (QAR)</Label>
                <Input
                  className="h-8 text-xs font-mono bg-muted"
                  disabled
                  value={sellForm.book_value}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Agreed Sale Price (QAR) *</Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-mono font-bold text-emerald-600"
                  placeholder="0.00"
                  value={sellForm.sale_value}
                  onChange={e => setSellForm(f => ({ ...f, sale_value: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Buyer Name / Entity *</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="e.g. Al-Diyar Trading LLC"
                  value={sellForm.buyer}
                  onChange={e => setSellForm(f => ({ ...f, buyer: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Disposal Date *</Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={sellForm.date}
                  onChange={e => setSellForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Remarks / Sales Invoice Ref</Label>
              <Input
                className="h-8 text-xs"
                placeholder="e.g. Salvage disposal invoice #SINV-8021"
                value={sellForm.remarks}
                onChange={e => setSellForm(f => ({ ...f, remarks: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowSell(false)}>Cancel</Button>
            <Button size="sm" disabled={saving} onClick={handleCreateSell} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null} Record Sale &amp; Post GL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: RECORD ASSET WRITE-OFF ──────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showWriteoff} onOpenChange={setShowWriteoff}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500" /> New Asset Write-Off &amp; Scrapping
            </DialogTitle>
            <DialogDescription className="text-xs">
              Decommission damaged or unserviceable assets. Derecognizes asset and posts write-off loss to GL.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Select Available Asset *</Label>
              <Select
                value={writeoffForm.asset_id}
                onValueChange={v => {
                  const a = assets.find(x => x.id === v);
                  setWriteoffForm(f => ({
                    ...f,
                    asset_id: v,
                    book_value: a ? String(a.purchase_cost || 0) : "",
                  }));
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Choose unallocated asset..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUnallocatedAssets.length === 0 ? (
                    <div className="p-3 text-center text-xs text-muted-foreground">No available unallocated assets.</div>
                  ) : (
                    availableUnallocatedAssets.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.asset_name} ({a.asset_code || "No Code"}) — Book Val: QAR {Number(a.purchase_cost || 0).toLocaleString()}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Carrying Value (QAR)</Label>
                <Input
                  className="h-8 text-xs font-mono bg-muted"
                  disabled
                  value={writeoffForm.book_value}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Write-off Date *</Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={writeoffForm.date}
                  onChange={e => setWriteoffForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Write-off Reason *</Label>
              <Select
                value={writeoffForm.writeoff_reason}
                onValueChange={v => setWriteoffForm(f => ({ ...f, writeoff_reason: v }))}
              >
                <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="Select reason..." /></SelectTrigger>
                <SelectContent>
                  {["Severe Water Damage", "Irreparable Hardware Failure", "Technical Obsolescence", "Lost / Stolen", "Scrapped after Lifespan Expiry", "Health & Safety Hazard"].map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Approved By (Authority)</Label>
              <Input
                className="h-8 text-xs"
                placeholder="e.g. Asset Committee / GM"
                value={writeoffForm.approved_by}
                onChange={e => setWriteoffForm(f => ({ ...f, approved_by: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowWriteoff(false)}>Cancel</Button>
            <Button size="sm" disabled={saving} onClick={handleCreateWriteoff} className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null} Approve &amp; Write Off
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: BULK ASSET IMPORT ─────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={bulkAssetOpen} onOpenChange={setBulkAssetOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card">
          <ExcelImportEmbedded
            module="asset"
            title="Fixed Assets: Excel Bulk Import & Management"
            description="Production-grade Excel CREATE, UPDATE, and DELETE engine for HVAC, equipment, machinery, and fixtures."
            onCompleted={() => {
              load();
            }}
          />
        </DialogContent>
      </Dialog>
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: POST ASSET DEPRECIATION TO GENERAL LEDGER ─────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showDepreciationModal} onOpenChange={setShowDepreciationModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              {selectedAssetForDepr ? `Post Depreciation: ${selectedAssetForDepr.asset_name}` : "Portfolio Periodic Depreciation Run"}
            </DialogTitle>
            <DialogDescription>
              Record periodic depreciation amortization charge and automatically post journal entry debiting Depreciation Expense (54100001) and crediting Accumulated Depreciation (12400001).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Fiscal Year *</Label>
                <Select
                  value={depreciationForm.fiscal_year}
                  onValueChange={v => setDepreciationForm(f => ({ ...f, fiscal_year: v }))}
                >
                  <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-2025">FY 2024-2025</SelectItem>
                    <SelectItem value="2025-2026">FY 2025-2026</SelectItem>
                    <SelectItem value="2026-2027">FY 2026-2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">GL Posting Date *</Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={depreciationForm.posting_date}
                  onChange={e => setDepreciationForm(f => ({ ...f, posting_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Depreciation Method</Label>
                <Select
                  value={depreciationForm.depreciation_method}
                  onValueChange={(v: any) => setDepreciationForm(f => ({ ...f, depreciation_method: v }))}
                >
                  <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Straight Line Method (SLM)">Straight Line Method (SLM)</SelectItem>
                    <SelectItem value="Written Down Value (WDV)">Written Down Value (WDV)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Depreciation Charge (QAR) *</Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-mono font-bold text-amber-600"
                  placeholder="0.00"
                  value={depreciationForm.charge_amount}
                  onChange={e => setDepreciationForm(f => ({ ...f, charge_amount: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Journal Narration / Audit Memo</Label>
              <Textarea
                className="text-xs h-18"
                placeholder="Narration for General Ledger journal entry..."
                value={depreciationForm.remarks}
                onChange={e => setDepreciationForm(f => ({ ...f, remarks: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowDepreciationModal(false)}>Cancel</Button>
            <Button size="sm" disabled={saving} onClick={handlePostDepreciation} className="bg-amber-600 hover:bg-amber-700 text-white min-w-[130px]">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null} Post GL Journal Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
