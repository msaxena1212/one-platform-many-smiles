import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  RefreshCw,
  Wrench,
  Calendar,
  ClipboardList,
  Users,
  Package,
  Building2,
  DollarSign,
  Plus,
  Search,
  ShoppingCart,
  CheckCircle2,
  CheckCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  FileText,
  Truck,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Send,
  Eye,
  PlusCircle,
  FileCheck,
  Tag,
  Receipt,
  UserCheck,
  Star,
  Paperclip,
  MessageSquare,
  Upload,
  X,
  File,
  Image as ImageIcon,
  Globe,
  Lock,
  Flame,
  ShieldAlert,
  CornerDownLeft,
  Trash2,
  Info,
  ChevronRight,
  FileUp,
} from "lucide-react";
import { ApInvoicesApi } from "@/lib/proc-invoices-api";
import {
  supabase,
  fetchMaintenanceTickets,
  updateMaintenanceTicket,
  type MaintenanceTicket,
  fetchInventoryParts,
  fetchMaterialUsage,
  logMaterialUsage,
  type InventoryPart,
  type MaterialUsage,
  fetchProperties,
  fetchAllProperties,
  fetchUnits,
  type Property,
  type Unit,
} from "@/lib/supabase";
import { properties as mockProperties, units as mockUnits } from "@/lib/mock-data";

export interface MaintenanceModuleProps {
  role: "admin" | "prop-mgr" | "owner";
}

const MOCK_HOST_ID = "00000000-0000-4000-8000-000000000001";

// ── Types & Constants ────────────────────────────────────────────────────────

export const TICKET_CATEGORIES = [
  "Carpenter",
  "CCTV",
  "Civil & Structural",
  "Door Issue",
  "Electrician",
  "Elevator / Lift",
  "Fire & Safety",
  "Groutin",
  "Housekeeping",
  "HVAC & Chillers",
  "Intercom",
  "Mason",
  "Painter",
  "Plumber",
  "Security",
  "Other",
] as const;

export const PROPERTY_UNITS: Record<string, string[]> = {
  "Al Sadd Commercial Tower": [
    "Office 101",
    "Office 102",
    "Office 201",
    "Office 305",
    "Office 402",
    "Retail Shop 1",
    "Retail Shop 2",
    "B2 Pump Room",
    "Main Chiller Plant Room",
    "Common Area Corridor",
  ],
  "Lusail Marina Heights": [
    "Apt 101",
    "Apt 204",
    "Apt 502",
    "Apt 801",
    "Apt 1204",
    "Penthouse 1",
    "Basement Parking B1",
    "Lobby & Reception",
    "Gym & Club",
  ],
  "West Bay Pearl Residence": [
    "Apt 301",
    "Apt 405",
    "Apt 702",
    "Apt 1103",
    "Apt 1502",
    "Building Pump Room B2",
    "Elevator Shaft 2",
    "Common Corridor",
  ],
  "Doha Port Logistics Park": [
    "Warehouse A1",
    "Warehouse A2",
    "Loading Bay 3",
    "Office Block B",
    "Security Gate 1",
  ],
};

export const PROPERTIES_LIST = Object.keys(PROPERTY_UNITS);

export const MAINTENANCE_GL_ACCOUNTS = [
  { code: "52100001", name: "Building Repairs & Structural Maintenance Opex", category: "OPEX" },
  { code: "52100002", name: "HVAC & Central Chiller Plant Servicing", category: "OPEX" },
  { code: "52100003", name: "Elevator & Escalator Statutory Maintenance", category: "OPEX" },
  { code: "52100004", name: "Fire Protection & Safety Systems Maintenance", category: "OPEX" },
  { code: "52100005", name: "Plumbing, Pumps & Drainage Systems", category: "OPEX" },
  { code: "52100006", name: "Electrical Switchgear & Lighting Fixtures", category: "OPEX" },
  { code: "52100007", name: "Civil Works, Carpentry & Painting Maintenance", category: "OPEX" },
  { code: "52100008", name: "Tenant Recoverable Damage & Chargeback Clearing", category: "RECOVERABLE" },
  { code: "11200001", name: "Tenant Accounts Receivable (Trade Debtors)", category: "ASSET" },
  { code: "21200001", name: "Tenant Security Deposits Held (Escrow Liability)", category: "LIABILITY" },
  { code: "41300002", name: "Tenant Damage Recharge & Admin Surcharge Income", category: "REVENUE" },
  { code: "12400001", name: "Internal Maintenance Warehouse Stock Asset", category: "ASSET" },
];

export const COST_CENTERS = [
  { code: "CC-101", name: "Property Operations & Facility Management" },
  { code: "CC-102", name: "MEP Technical Engineering Services" },
  { code: "CC-103", name: "Common Area Maintenance (CAM)" },
  { code: "CC-104", name: "Tenant Fit-Out & Reactive Maintenance" },
];

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  className = "",
}: {
  value: string;
  onValueChange: (val: string) => void;
  options: { label: string; value: string; subtext?: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.value.toLowerCase().includes(search.toLowerCase()) ||
      (opt.subtext && opt.subtext.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs cursor-pointer hover:bg-muted/40 transition-colors"
      >
        <span className={selectedOption ? "text-foreground font-medium truncate" : "text-muted-foreground truncate"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <Search className="h-3 w-3 text-muted-foreground shrink-0 ml-1.5 opacity-60" />
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg max-h-56 overflow-hidden flex flex-col min-w-[280px]">
            <div className="p-1 border-b border-border/60 flex items-center gap-1.5">
              <Search className="h-3 w-3 text-muted-foreground shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/70"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="overflow-y-auto max-h-44 py-1">
              {filtered.length === 0 ? (
                <div className="p-2 text-center text-[11px] text-muted-foreground">No matches found</div>
              ) : (
                filtered.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer hover:bg-muted transition-colors ${
                      opt.value === value ? "bg-orange-500/10 text-orange-600 font-semibold" : "text-foreground"
                    }`}
                  >
                    <div className="truncate">
                      <span>{opt.label}</span>
                      {opt.subtext && (
                        <span className="text-[10px] text-muted-foreground ml-1.5 opacity-70">({opt.subtext})</span>
                      )}
                    </div>
                    {opt.value === value && <CheckCircle2 className="h-3 w-3 text-orange-600 shrink-0" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export const COMPLAINT_AREAS = [
  "Property",
  "Unit (name)",
  "Commercial",
  "Common Area",
  "Entry Gate",
  "Exit Gate",
  "Facility Office",
  "Gym & Club",
  "Shop",
  "Security Office",
  "Parking",
] as const;

export interface TicketCommentItem {
  id: string;
  author: string;
  role: "Tenant" | "Technician" | "Property Manager" | "Vendor";
  timestamp: string;
  comment: string;
  attachments?: Array<{ name: string; size: string; url?: string }>;
}

export interface WorkOrder {
  id: string;
  ticketId?: string;
  title: string;
  property: string;
  unitRef: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  assigneeType: "in_house" | "vendor";
  technicianName?: string;
  vendorId?: string;
  vendorName?: string;
  scheduledDate: string;
  completionDate?: string;
  labourCost: number;
  materialsCost: number;
  totalCost: number;
  chargebackToTenant: boolean;
  tenantChargeReason?: string;
  chargebackStatus?: "AR Invoice Queued" | "Deposit Deducted" | "Billed on Next Rent" | "Absorbed in OPEX" | "Settled";
  scopeOfWork: string;
  notes?: string;
  spareParts?: Array<{
    partId: string;
    code: string;
    name: string;
    quantity: number;
    unitCost: number;
  }>;
}

export interface PpmSchedule {
  id: string;
  title: string;
  property: string;
  unitRef?: string;
  scopeType?: "property" | "unit" | "common_area";
  category: string;
  frequency: "Monthly" | "Quarterly" | "Semi-Annual" | "Annual";
  nextDueDate: string;
  lastDoneDate?: string;
  assignedVendorName?: string;
  estimatedCost: number;
  status: "Active" | "Upcoming" | "Overdue";
  checklist: string[];
}

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  activeWorkload: number;
  status: "Available" | "On-Site" | "On-Leave";
  rating: number;
  completedJobsCount: number;
}

export interface MaintenanceVendorInvoice {
  id: string;
  invoiceNo: string;
  ticketId: string;
  workOrderId?: string;
  vendorName: string;
  property: string;
  unitRef: string;
  invoiceDate: string;
  dueDate?: string;
  amount: number;
  baseAmount?: number;
  taxAmount?: number;
  partsDescription: string;
  labourDescription: string;
  status: "Draft" | "Submitted" | "Approved" | "Paid";
  glAccount: string;
  paymentMode: string;
  paymentTerms?: string;
  settlementMode?: string;
  receiptAttachment?: string;
  receiptFileName?: string;
}

// ── Initial Mock Data (Empty for Fresh System) ───────────────────────────

export const initialTickets: MaintenanceTicket[] = [];

const initialWorkOrders: WorkOrder[] = [];

const initialPpmSchedules: PpmSchedule[] = [];

const initialTechnicians: Technician[] = [];

const initialVendorInvoices: MaintenanceVendorInvoice[] = [];

export interface StockItem {
  id: string;
  code: string;
  name: string;
  category: string;
  onHand: number;
  minLevel: number;
  unitCost: number;
  uom: string;
  location: string;
}

const initialStockCatalog: StockItem[] = [];

const COLUMNS: { key: MaintenanceTicket["status"]; label: string }[] = [
  { key: "new", label: "New Request" },
  { key: "dispatched", label: "Dispatched" },
  { key: "scheduled", label: "Scheduled" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved / Closed" },
  { key: "cancelled", label: "Cancelled" },
];

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export function MaintenanceModule({ role }: MaintenanceModuleProps) {
  const routerState = useRouterState();
  const searchParams = new URLSearchParams(routerState.location.search);
  const activeTab = searchParams.get("tab") || "tickets";

  // Persistent Data State from LocalStorage
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => {
    try {
      const saved = localStorage.getItem("pms_maintenance_tickets");
      return saved ? JSON.parse(saved) : initialTickets;
    } catch {
      return initialTickets;
    }
  });
  const [loading, setLoading] = useState(false);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    return initialWorkOrders;
  });
  const [ppmSchedules, setPpmSchedules] = useState<PpmSchedule[]>(() => {
    try {
      const saved = localStorage.getItem("pms_ppm_schedules");
      return saved ? JSON.parse(saved) : initialPpmSchedules;
    } catch {
      return initialPpmSchedules;
    }
  });
  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    try {
      const saved = localStorage.getItem("pms_technicians");
      return saved ? JSON.parse(saved) : initialTechnicians;
    } catch {
      return initialTechnicians;
    }
  });
  const [vendorInvoices, setVendorInvoices] = useState<MaintenanceVendorInvoice[]>(() => {
    return initialVendorInvoices;
  });
  const [stockCatalog, setStockCatalog] = useState<StockItem[]>(() => {
    return initialStockCatalog;
  });
  // Dynamic Properties & Units from Supabase
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    localStorage.removeItem("pms_work_orders");
    localStorage.removeItem("pms_vendor_invoices");
    localStorage.removeItem("pms_maintenance_stock");
  }, []);

  // Ticket Spare Parts Map state (persisted per ticket)
  const [ticketSparePartsMap, setTicketSparePartsMap] = useState<Record<string, Array<{ id: string; partId: string; quantity: number }>>>(() => {
    try {
      const saved = localStorage.getItem("pms_ticket_spare_parts");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("pms_ticket_spare_parts", JSON.stringify(ticketSparePartsMap));
    } catch (e) {
      console.error("Failed to save ticketSparePartsMap to localStorage", e);
    }
  }, [ticketSparePartsMap]);

  useEffect(() => {
    try {
      localStorage.setItem("pms_vendor_invoices", JSON.stringify(vendorInvoices));
    } catch (e) {
      console.error("Failed to save vendorInvoices to localStorage", e);
    }
  }, [vendorInvoices]);

  useEffect(() => {
    try {
      localStorage.setItem("pms_work_orders", JSON.stringify(workOrders));
    } catch (e) {
      console.error("Failed to save workOrders to localStorage", e);
    }
  }, [workOrders]);

  // Real-time listener for invoice payment updates from Finance / Vendor Management
  useEffect(() => {
    const handleInvoiceSync = () => {
      try {
        const saved = localStorage.getItem("pms_vendor_invoices");
        if (saved) {
          setVendorInvoices(JSON.parse(saved));
        }
      } catch {}
    };
    window.addEventListener("pms_vendor_invoices_updated", handleInvoiceSync);
    window.addEventListener("finance_vouchers_updated", handleInvoiceSync);
    window.addEventListener("ap_invoices_updated", handleInvoiceSync);
    return () => {
      window.removeEventListener("pms_vendor_invoices_updated", handleInvoiceSync);
      window.removeEventListener("finance_vouchers_updated", handleInvoiceSync);
      window.removeEventListener("ap_invoices_updated", handleInvoiceSync);
    };
  }, []);

  // Derived dynamic property lists and units map matching other modules
  const dynamicPropertyList = useMemo(() => {
    const list: string[] = [];
    // 1. From live supabase properties
    properties.forEach(p => {
      if (p.title) list.push(p.title);
      const anyP = p as any;
      if (anyP.name && !list.includes(anyP.name)) list.push(anyP.name);
      if (anyP.code && !list.includes(anyP.code)) list.push(anyP.code);
    });
    // 2. From mockProperties (matching units directory)
    mockProperties.forEach(p => {
      if (p.name && !list.includes(p.name)) list.push(p.name);
      if (p.code && !list.includes(p.code)) list.push(p.code);
    });
    // 3. Fallback to default properties list
    PROPERTIES_LIST.forEach(p => {
      if (!list.includes(p)) list.push(p);
    });
    return Array.from(new Set(list.filter(Boolean)));
  }, [properties]);

  const dynamicPropertyUnitsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    dynamicPropertyList.forEach(pName => {
      const prop = properties.find(p => p.title === pName || (p as any).name === pName || (p as any).code === pName || p.id === pName);
      const mockProp = mockProperties.find(p => p.name === pName || p.code === pName || p.id === pName);

      const foundUnits: string[] = [];

      // 1. From live supabase units
      if (prop) {
        units
          .filter(u => u.property_id === prop.id)
          .forEach(u => {
            const uName = u.unit_name || u.unit_ref || u.unit_code;
            if (uName && !foundUnits.includes(uName)) foundUnits.push(uName);
          });
      }

      // 2. From mockUnits
      if (mockProp) {
        mockUnits
          .filter(u => u.propertyId === mockProp.id)
          .forEach(u => {
            const uName = u.number ? `Unit ${u.number}` : "";
            if (uName && !foundUnits.includes(uName)) foundUnits.push(uName);
          });
      }

      // 3. If any matched
      if (foundUnits.length > 0) {
        map[pName] = foundUnits;
        return;
      }

      // 4. Default fallback
      map[pName] = PROPERTY_UNITS[pName] || [
        "Unit 101",
        "Unit 102",
        "Unit 201",
        "Penthouse 1",
        "Common Corridor",
        "Main Pump Room",
        "Lobby Area",
        "Basement Parking",
      ];
    });
    return map;
  }, [properties, units, dynamicPropertyList]);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProperty, setFilterProperty] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterArea, setFilterArea] = useState("all");
  const [ticketStatusTab, setTicketStatusTab] = useState<string>("all");
  const [woStatusTab, setWoStatusTab] = useState<string>("all");
  const [chargebackStatusTab, setChargebackStatusTab] = useState<string>("all");

  // Dialog & Form States
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [editStatus, setEditStatus] = useState<MaintenanceTicket["status"] | "">("");
  const [editAssignee, setEditAssignee] = useState<string | null>("");
  const [editDescription, setEditDescription] = useState<string | null>("");
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showNewWoModal, setShowNewWoModal] = useState(false);
  const [showNewPpmModal, setShowNewPpmModal] = useState(false);
  const [showNewTechModal, setShowNewTechModal] = useState(false);
  const [showVendorInvoiceModal, setShowVendorInvoiceModal] = useState(false);
  const [showNewChargebackModal, setShowNewChargebackModal] = useState(false);
  const [showProcurePrModal, setShowProcurePrModal] = useState(false);
  const [procurePartTarget, setProcurePartTarget] = useState<any>(null);

  // Selected Work Order for detail & timeline
  const [selectedWoForDetail, setSelectedWoForDetail] = useState<WorkOrder | null>(null);
  // Track partial material consumption per work order and part code
  const [woConsumedQtyMap, setWoConsumedQtyMap] = useState<Record<string, Record<string, number>>>({});

  // Selected PPM Schedule for generating Work Order
  const [selectedPpmForWo, setSelectedPpmForWo] = useState<PpmSchedule | null>(null);
  const [ppmWoForm, setPpmWoForm] = useState({
    title: "",
    scheduledDate: "",
    scopeOfWork: "",
    assigneeType: "vendor" as "in_house" | "vendor",
    vendorName: "Carrier Middle East Qatar",
    technicianName: "Faisal Tariq (HVAC Specialist)",
    estimatedCost: 0,
  });

  // In-House Chargeable Material Entry Modal State
  const [showInHouseMaterialModal, setShowInHouseMaterialModal] = useState(false);
  const [inHouseMaterialForm, setInHouseMaterialForm] = useState({
    materialName: "",
    property: "Al Sadd Commercial Tower",
    unitRef: "Office 402",
    quantity: 1,
    unitPrice: 0,
    costCenter: "CC-101",
    glAccount: "52100008",
    reason: "Chargeable replacement part provided by internal MEP team",
    chargebackToTenant: true,
  });

  // Generated Financial Receipt / Voucher Modal State
  const [generatedReceipt, setGeneratedReceipt] = useState<{
    receiptNo: string;
    voucherType: "AP_INVOICE" | "IN_HOUSE_MATERIAL" | "TENANT_CHARGEBACK";
    date: string;
    partyName: string;
    referenceId: string;
    property: string;
    unitRef: string;
    baseAmount: number;
    taxAmount: number;
    totalAmount: number;
    glAccount: string;
    glAccountName: string;
    costCenter: string;
    description: string;
    paymentMode: string;
    issuedBy: string;
    journalLines?: Array<{
      account: string;
      description: string;
      costCenter: string;
      debit?: number;
      credit?: number;
    }>;
  } | null>(null);

  // Default logged in user reportedBy
  const defaultReportedBy = role === "admin" ? "Admin Operations (Staff)" : role === "owner" ? "Property Owner" : "Property Manager (Operations)";

  // Form: New Ticket
  const [ticketForm, setTicketForm] = useState({
    title: "",
    property: "Al Sadd Commercial Tower",
    visibility: "Personal (Only Me)" as "Personal (Only Me)" | "Community (All)",
    category: "Electrician",
    complaintArea: "Unit (name)",
    unitRef: "Office 402",
    isUrgent: false,
    description: "",
    reportedBy: defaultReportedBy,
    attachments: [] as Array<{ name: string; size: string }>,
  });

  // Attachments temp upload input
  const [tempAttachmentName, setTempAttachmentName] = useState("");

  const initialTicketCommentsState: Record<string, TicketCommentItem[]> = {
    "f1": [
      {
        id: "tc-1",
        author: "Ahmed Al-Kuwari",
        role: "Tenant",
        timestamp: "2026-09-04 09:15 AM",
        comment: "AC blowing warm air since morning. Thermostat display shows error code E-41.",
        attachments: [{ name: "thermostat_error_e41.jpg", size: "1.2 MB" }],
      },
      {
        id: "tc-2",
        author: "Faisal Tariq",
        role: "Technician",
        timestamp: "2026-09-04 10:30 AM",
        comment: "Inspected FCU unit. The 2-way chilled water actuator is locked in closed position. Procuring replacement Honeywell actuator from warehouse.",
      },
    ],
    "f2": [
      {
        id: "tc-3",
        author: "Security Office",
        role: "Property Manager",
        timestamp: "2026-09-03 04:45 PM",
        comment: "Booster pump B2 making high pressure vibration sounds. Dispatched Qatar Facilities Management.",
      },
    ],
  };

  const initialWoCommentsState: Record<string, TicketCommentItem[]> = {
    "WO-2026-001": [
      {
        id: "woc-1",
        author: "Faisal Tariq",
        role: "Technician",
        timestamp: "2026-09-04 11:00 AM",
        comment: "Replaced 2-way valve and actuator. Water pressure tested up to 4.5 bar without leaks. Temperature normalized at 18°C.",
        attachments: [{ name: "completion_chiller_valve.jpg", size: "2.4 MB" }],
      },
    ],
    "WO-2026-003": [
      {
        id: "woc-2",
        author: "Al Mana Maintenance",
        role: "Vendor",
        timestamp: "2026-09-03 02:00 PM",
        comment: "Tempered balcony glass replaced and sealed with silicone. Mortise lock latch aligned. Tenant accepted handover.",
        attachments: [{ name: "glass_door_inspection.pdf", size: "840 KB" }],
      },
    ],
  };

  // Timeline / Comments state for Tickets
  const [ticketComments, setTicketComments] = useState<Record<string, TicketCommentItem[]>>(() => {
    try {
      const saved = localStorage.getItem("pms_ticket_comments");
      return saved ? JSON.parse(saved) : initialTicketCommentsState;
    } catch {
      return initialTicketCommentsState;
    }
  });

  // Timeline / Comments state for Work Orders
  const [woComments, setWoComments] = useState<Record<string, TicketCommentItem[]>>(() => {
    try {
      const saved = localStorage.getItem("pms_wo_comments");
      return saved ? JSON.parse(saved) : initialWoCommentsState;
    } catch {
      return initialWoCommentsState;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("pms_ticket_comments", JSON.stringify(ticketComments));
    } catch (e) {
      console.error("Failed to save ticketComments to localStorage", e);
    }
  }, [ticketComments]);

  useEffect(() => {
    try {
      localStorage.setItem("pms_wo_comments", JSON.stringify(woComments));
    } catch (e) {
      console.error("Failed to save woComments to localStorage", e);
    }
  }, [woComments]);

  // Comment Box input states
  const [newTicketCommentText, setNewTicketCommentText] = useState("");
  const [newTicketCommentRole, setNewTicketCommentRole] = useState<"Tenant" | "Technician" | "Property Manager" | "Vendor">("Property Manager");
  const [newTicketCommentFile, setNewTicketCommentFile] = useState("");

  const [newWoCommentText, setNewWoCommentText] = useState("");
  const [newWoCommentRole, setNewWoCommentRole] = useState<"Tenant" | "Technician" | "Property Manager" | "Vendor">("Property Manager");
  const [newWoCommentFile, setNewWoCommentFile] = useState("");

  // Form: New Work Order
  const [woForm, setWoForm] = useState({
    title: "",
    property: "Al Sadd Commercial Tower",
    unitRef: "Unit 101",
    category: "HVAC",
    priority: "medium",
    assigneeType: "in_house",
    technicianName: "Faisal Tariq",
    vendorName: "Carrier Middle East Qatar",
    scheduledDate: new Date().toISOString().slice(0, 10),
    labourCost: 150,
    materialsCost: 200,
    scopeOfWork: "",
    chargebackToTenant: false,
    tenantChargeReason: "",
  });

  // Form: New PPM Schedule
  const [ppmForm, setPpmForm] = useState({
    title: "",
    property: "Al Sadd Commercial Tower",
    scopeType: "property" as "property" | "unit" | "common_area",
    unitRef: "Entire Building / Common MEP",
    category: "HVAC",
    frequency: "Quarterly",
    nextDueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    assignedVendorName: "Carrier Middle East Qatar",
    estimatedCost: 2500,
    checklist: "Compressor oil check, condenser coil cleaning, water flow test, thermostat calibration",
  });

  // Form: New Field Technician
  const [techForm, setTechForm] = useState({
    name: "",
    specialty: "HVAC & Chiller Plants",
    phone: "+974 5511 2233",
    email: "",
    status: "Available",
  });

  // Form: Vendor AP Invoice Modal
  const [vendorInvStep, setVendorInvStep] = useState<number>(1);
  const [vendorInvModalForm, setVendorInvModalForm] = useState({
    invoiceNo: "",
    vendorName: "Carrier Middle East Qatar",
    property: "Al Sadd Commercial Tower",
    unitRef: "Office 402",
    amount: 1200,
    taxRate: 0,
    costCenter: "CC-101",
    partsDescription: "Replacement sensor and filter assembly",
    labourDescription: "Emergency on-site troubleshooting",
    glAccount: "52100001",
    paymentMode: "Bank Wire / Electronic Transfer (QNB)",
    paymentTerms: "Net 30 Days",
    settlementMode: "Bank Wire / Electronic Transfer (QNB)",
    receiptFileName: "",
    receiptAttachment: "",
  });

  // Form: Tenant Chargeback Notice
  const [chargebackForm, setChargebackForm] = useState({
    workOrderId: "WO-2026-003",
    tenantName: "Salim Mansour (Apt 1204)",
    property: "Lusail Marina Heights",
    unitRef: "Apt 1204",
    damageCategory: "Move-in / Move-out Accidental Damage",
    inspectionRef: "INSP-2026-881",
    incidentDate: new Date().toISOString().slice(0, 10),
    laborCost: 200,
    materialsCost: 550,
    adminFeeRate: 0,
    amount: 750,
    reason: "Broken Balcony Sliding Door Glass & Lock Latch during furniture move-in",
    recoveryMode: "Security Deposit Deduction",
    debitGlAccount: "21200001",
    creditGlAccount: "52100008",
    costCenter: "CC-104",
  });

  // Form: Dual Sourcing Part in Ticket
  const [partSourceMode, setPartSourceMode] = useState<"warehouse" | "vendor">("warehouse");
  const [selectedWarehousePartId, setSelectedWarehousePartId] = useState("");
  const [warehouseQty, setWarehouseQty] = useState(1);
  const [ticketSpareParts, setTicketSpareParts] = useState<Array<{ id: string; partId: string; quantity: number }>>([]);
  const [vendorInvoiceRaised, setVendorInvoiceRaised] = useState(false);
  const [vendorPartForm, setVendorPartForm] = useState({
    vendorName: "Carrier Middle East Qatar",
    partDescription: "",
    quantity: 1,
    unitPrice: 0,
    invoiceNo: "",
    glAccount: "52100001 - Building Maintenance Expense",
  });

  // Form: Quick PR Generation
  const [prForm, setPrForm] = useState({
    partName: initialStockCatalog[0]?.name || "",
    itemCode: initialStockCatalog[0]?.code || "",
    qty: 10,
    estimatedCost: initialStockCatalog[0]?.unitCost || 0,
    property: "Al Sadd Commercial Tower",
    urgency: "HIGH",
    budgetHead: "Maintenance Items",
    notes: "Auto-replenishment for maintenance warehouse",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketsData, propsData, unitsData] = await Promise.all([
        fetchMaintenanceTickets(role === "admin" ? {} : { host_id: MOCK_HOST_ID }),
        fetchAllProperties().catch(() => fetchProperties().catch(() => [])),
        fetchUnits().catch(() => []),
      ]);
      if (ticketsData && ticketsData.length > 0) {
        setTickets(ticketsData);
      } else {
        setTickets(initialTickets);
      }
      if (propsData && propsData.length > 0) {
        setProperties(propsData);
      }
      if (unitsData && unitsData.length > 0) {
        setUnits(unitsData);
      }
    } catch {
      setTickets(initialTickets);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    load();
  }, [load]);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = !searchQuery.trim() ||
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.reported_by?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignee?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.unit_ref?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = filterCategory === "all" || t.category?.toLowerCase() === filterCategory.toLowerCase();
      const matchesArea = filterArea === "all" || t.unit_ref?.toLowerCase().includes(filterArea.toLowerCase());
      const matchesProperty = filterProperty === "all" || (t.unit_ref && t.unit_ref.toLowerCase().includes(filterProperty.toLowerCase()));

      const matchesStatusTab = ticketStatusTab === "all" ||
        (ticketStatusTab === "new" && t.status === "new") ||
        (ticketStatusTab === "assigned" && (t.status === "assigned" || t.status === "dispatched")) ||
        (ticketStatusTab === "in_progress" && t.status === "in_progress") ||
        (ticketStatusTab === "resolved" && (t.status === "resolved" || (t.status as string) === "completed" || (t.status as string) === "closed")) ||
        (ticketStatusTab === "cancelled" && t.status === "cancelled") ||
        t.status === ticketStatusTab;

      return matchesSearch && matchesCategory && matchesArea && matchesProperty && matchesStatusTab;
    });
  }, [tickets, searchQuery, filterProperty, filterCategory, filterArea, ticketStatusTab]);

  // Filtered Work Orders (Status Tab & Search)
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(w => {
      const matchesSearch = !searchQuery.trim() ||
        w.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.property?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.unitRef?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.technicianName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.vendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = woStatusTab === "all" || w.status === woStatusTab;
      return matchesSearch && matchesStatus;
    });
  }, [workOrders, searchQuery, woStatusTab]);

  // Filtered Chargebacks
  const filteredChargebacks = useMemo(() => {
    return workOrders.filter(w => {
      const matchesSearch = !searchQuery.trim() ||
        w.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.property?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.unitRef?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.tenantChargeReason?.toLowerCase().includes(searchQuery.toLowerCase());

      if (chargebackStatusTab === "chargeable") {
        return matchesSearch && w.chargebackToTenant;
      }
      if (chargebackStatusTab === "opex") {
        return matchesSearch && !w.chargebackToTenant;
      }
      if (chargebackStatusTab === "deposit") {
        return matchesSearch && w.chargebackToTenant && w.chargebackStatus === "Deposit Deducted";
      }
      if (chargebackStatusTab === "ar_invoice") {
        return matchesSearch && w.chargebackToTenant && (w.chargebackStatus === "AR Invoice Queued" || w.chargebackStatus === "Billed on Next Rent");
      }
      return matchesSearch;
    });
  }, [workOrders, searchQuery, chargebackStatusTab]);

  const grouped = useMemo(() => {
    return COLUMNS.map(col => ({
      ...col,
      items: filteredTickets.filter(t => {
        if (col.key === "new") return t.status === "new";
        if (col.key === "dispatched") return t.status === "dispatched" || t.status === "assigned";
        if (col.key === "scheduled") return t.status === "scheduled";
        if (col.key === "in_progress") return t.status === "in_progress";
        if (col.key === "resolved") return t.status === "resolved" || (t.status as string) === "completed" || (t.status as string) === "closed";
        if (col.key === "cancelled") return t.status === "cancelled";
        return t.status === col.key;
      }),
    }));
  }, [filteredTickets]);

  // Handler: Add Manual Ticket
  function handleCreateTicket() {
    if (!ticketForm.title.trim()) {
      toast.error("Please enter a ticket title");
      return;
    }
    if (!ticketForm.description.trim()) {
      toast.error("Description is mandatory. Please provide detailed symptoms.");
      return;
    }
    const newT: MaintenanceTicket = {
      id: `T-${Date.now().toString().slice(-4)}`,
      property_id: null,
      unit_ref: ticketForm.complaintArea === "Unit (name)" ? ticketForm.unitRef : ticketForm.complaintArea,
      title: ticketForm.title,
      description: ticketForm.description,
      category: ticketForm.category,
      priority: (ticketForm.isUrgent ? "urgent" : "medium") as any,
      status: "new",
      assignee: null,
      host_id: null,
      reported_by: `${ticketForm.reportedBy} (${ticketForm.visibility})`,
      resolved_at: null,
      created_at: new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString().slice(0, 10),
    };

    // If attachments exist, seed initial comment
    if (ticketForm.attachments.length > 0) {
      setTicketComments(prev => ({
        ...prev,
        [newT.id]: [
          {
            id: `tc-init-${Date.now()}`,
            author: ticketForm.reportedBy,
            role: "Tenant",
            timestamp: new Date().toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" }),
            comment: `Initial complaint logged with ${ticketForm.attachments.length} attachment(s).`,
            attachments: ticketForm.attachments,
          },
        ],
      }));
    }

    // If ticket is marked Urgent / Emergency, automatically generate and dispatch linked Work Order immediately
    if (ticketForm.isUrgent) {
      const autoWo: WorkOrder = {
        id: `WO-2026-${(workOrders.length + 1).toString().padStart(3, "0")}`,
        ticketId: newT.id,
        title: `EMERGENCY: ${ticketForm.title}`,
        property: ticketForm.property,
        unitRef: ticketForm.complaintArea === "Unit (name)" ? ticketForm.unitRef : ticketForm.complaintArea,
        category: ticketForm.category,
        priority: "urgent",
        status: "in_progress",
        assigneeType: "in_house",
        technicianName: "Faisal Tariq (Emergency Lead)",
        scheduledDate: new Date().toISOString().slice(0, 10),
        labourCost: 200,
        materialsCost: 250,
        totalCost: 450,
        chargebackToTenant: false,
        scopeOfWork: `Emergency triage auto-dispatched from Ticket ${newT.id}: ${ticketForm.description}`,
      };
      setWorkOrders(prev => [autoWo, ...prev]);
      newT.status = "in_progress";
      newT.assignee = "Faisal Tariq (Emergency Lead)";
      toast.info(`Emergency SLA: Linked Work Order ${autoWo.id} auto-created & dispatched to on-call technician`);
    }

    setTickets(prev => [newT, ...prev]);
    toast.success(`Maintenance ticket ${newT.id} created successfully (${ticketForm.visibility})`);
    setShowNewTicketModal(false);
    setTicketForm({
      title: "",
      property: "Al Sadd Commercial Tower",
      visibility: "Personal (Only Me)",
      category: "Electrician",
      complaintArea: "Unit (name)",
      unitRef: "Office 402",
      isUrgent: false,
      description: "",
      reportedBy: "Tenant Portal",
      attachments: [],
    });
    setTempAttachmentName("");
  }

  // Handler: 1-Click Convert Ticket to Work Order
  function handleConvertTicketToWorkOrder(ticket: MaintenanceTicket) {
    const newWoId = `WO-2026-${(workOrders.length + 1).toString().padStart(3, "0")}`;
    const newWo: WorkOrder = {
      id: newWoId,
      ticketId: ticket.id,
      title: ticket.title,
      property: PROPERTIES_LIST.find(p => ticket.unit_ref && PROPERTY_UNITS[p]?.includes(ticket.unit_ref)) || "Al Sadd Commercial Tower",
      unitRef: ticket.unit_ref || "General",
      category: ticket.category || "General",
      priority: ticket.priority as any,
      status: "scheduled",
      assigneeType: "in_house",
      technicianName: ticket.assignee || "Faisal Tariq",
      scheduledDate: new Date().toISOString().slice(0, 10),
      labourCost: 150,
      materialsCost: 100,
      totalCost: 250,
      chargebackToTenant: false,
      scopeOfWork: `Dispatched from Ticket ${ticket.id}: ${ticket.description || ticket.title}`,
    };

    setWorkOrders(prev => [newWo, ...prev]);

    // Update Ticket status and add timeline log
    setTickets(prev =>
      prev.map(t =>
        t.id === ticket.id
          ? { ...t, status: "assigned" as any, assignee: t.assignee || "Faisal Tariq" }
          : t
      )
    );

    const convertLog: TicketCommentItem = {
      id: `tc-conv-${Date.now()}`,
      author: role === "admin" ? "Admin Operations" : "Property Manager",
      role: "Property Manager",
      timestamp: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
      comment: `Converted to Work Order ${newWoId}. Scheduled with ${newWo.technicianName}.`,
    };

    setTicketComments(prev => ({
      ...prev,
      [ticket.id]: [...(prev[ticket.id] || []), convertLog],
    }));

    toast.success(`Work Order ${newWoId} created & scheduled from Ticket ${ticket.id}`);
    setSelectedTicket(null);
  }

  // Handler: Add Ticket Comment
  function handleAddTicketComment(ticketId: string) {
    if (!newTicketCommentText.trim() && !newTicketCommentFile.trim()) {
      toast.error("Please type a comment or attach a file");
      return;
    }
    const newC: TicketCommentItem = {
      id: `tc-${Date.now()}`,
      author: newTicketCommentRole === "Tenant" ? "Tenant" : newTicketCommentRole === "Technician" ? (selectedTicket?.assignee || "Assigned Technician") : "Property Manager",
      role: newTicketCommentRole,
      timestamp: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
      comment: newTicketCommentText.trim() || "Uploaded attachment update.",
      attachments: newTicketCommentFile.trim() ? [{ name: newTicketCommentFile.trim(), size: "1.5 MB" }] : undefined,
    };

    setTicketComments(prev => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), newC],
    }));

    toast.success("Comment and attachment posted to ticket timeline");
    setNewTicketCommentText("");
    setNewTicketCommentFile("");
  }

  // Handler: Add Work Order Comment
  function handleAddWoComment(woId: string) {
    if (!newWoCommentText.trim() && !newWoCommentFile.trim()) {
      toast.error("Please type an update note or attach a file");
      return;
    }
    const currentAuthor = role === "admin" ? "Admin Operations" : role === "owner" ? "Property Owner" : "Property Manager";
    const newC: TicketCommentItem = {
      id: `woc-${Date.now()}`,
      author: currentAuthor,
      role: "Property Manager",
      timestamp: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
      comment: newWoCommentText.trim() || "Uploaded job sheet / photo.",
      attachments: newWoCommentFile.trim() ? [{ name: newWoCommentFile.trim(), size: "2.1 MB" }] : undefined,
    };

    setWoComments(prev => ({
      ...prev,
      [woId]: [...(prev[woId] || []), newC],
    }));

    toast.success("Note and timestamped attachment added to Work Order");
    setNewWoCommentText("");
    setNewWoCommentFile("");
  }

  // Handler: Create Work Order
  function handleCreateWorkOrder() {
    if (!woForm.title.trim()) {
      toast.error("Please enter a work order title");
      return;
    }
    const newWo: WorkOrder = {
      id: `WO-2026-${(workOrders.length + 1).toString().padStart(3, "0")}`,
      title: woForm.title,
      property: woForm.property,
      unitRef: woForm.unitRef,
      category: woForm.category,
      priority: woForm.priority as any,
      status: "scheduled",
      assigneeType: woForm.assigneeType as any,
      technicianName: woForm.assigneeType === "in_house" ? woForm.technicianName : undefined,
      vendorName: woForm.assigneeType === "vendor" ? woForm.vendorName : undefined,
      scheduledDate: woForm.scheduledDate,
      labourCost: Number(woForm.labourCost) || 0,
      materialsCost: Number(woForm.materialsCost) || 0,
      totalCost: (Number(woForm.labourCost) || 0) + (Number(woForm.materialsCost) || 0),
      chargebackToTenant: woForm.chargebackToTenant,
      tenantChargeReason: woForm.chargebackToTenant ? woForm.tenantChargeReason : undefined,
      scopeOfWork: woForm.scopeOfWork || "Standard maintenance task execution.",
    };
    setWorkOrders(prev => [newWo, ...prev]);
    toast.success(`Work Order ${newWo.id} created & scheduled`);
    setShowNewWoModal(false);
    setWoForm({ title: "", property: "Al Sadd Commercial Tower", unitRef: "Unit 101", category: "HVAC & Chillers", priority: "medium", assigneeType: "in_house", technicianName: "Faisal Tariq", vendorName: "Carrier Middle East Qatar", scheduledDate: new Date().toISOString().slice(0, 10), labourCost: 150, materialsCost: 200, scopeOfWork: "", chargebackToTenant: false, tenantChargeReason: "" });
  }

  // Unified handler to change work order status and auto-sync linked maintenance service ticket
  async function handleUpdateWorkOrderStatus(woId: string, newStatus: WorkOrder["status"]) {
    let targetWo: WorkOrder | undefined;

    setWorkOrders(prev => prev.map(w => {
      if (w.id === woId) {
        const updated = { ...w, status: newStatus };
        if (newStatus === "completed") {
          updated.completionDate = new Date().toISOString().slice(0, 10);
        }
        targetWo = updated;
        return updated;
      }
      return w;
    }));

    if (selectedWoForDetail?.id === woId) {
      setSelectedWoForDetail(prev => prev ? {
        ...prev,
        status: newStatus,
        completionDate: newStatus === "completed" ? new Date().toISOString().slice(0, 10) : prev.completionDate,
      } : null);
    }

    const currentWo = targetWo || workOrders.find(w => w.id === woId);
    if (currentWo?.ticketId) {
      const ticketId = currentWo.ticketId;
      // Map WO status to Service Ticket status
      const mappedTicketStatus: MaintenanceTicket["status"] =
        newStatus === "completed" ? "resolved" :
        newStatus === "in_progress" ? "in_progress" :
        newStatus === "scheduled" ? "assigned" :
        newStatus === "cancelled" ? "cancelled" : "new";

      setTickets(prev => prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: mappedTicketStatus,
              resolved_at: newStatus === "completed" ? new Date().toISOString() : t.resolved_at,
            }
          : t
      ));

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? {
          ...prev,
          status: mappedTicketStatus,
          resolved_at: newStatus === "completed" ? new Date().toISOString() : prev.resolved_at,
        } : null);
        setEditStatus(mappedTicketStatus);
      }

      // Sync with Supabase if applicable
      try {
        await updateMaintenanceTicket(ticketId, {
          status: mappedTicketStatus as any,
          resolved_at: newStatus === "completed" ? new Date().toISOString() : null,
        });
      } catch (e) {
        console.warn("Skipping remote ticket update for mock ticket:", ticketId, e);
      }

      // Add status synchronization update to timeline
      const timestamp = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
      const syncNote = `Work Order ${woId} status updated to [${newStatus.toUpperCase().replace("_", " ")}]. Linked Service Ticket ${ticketId} status automatically updated to [${mappedTicketStatus.toUpperCase()}].`;

      const syncComment: TicketCommentItem = {
        id: `sync-${Date.now()}`,
        author: role === "admin" ? "Admin Operations" : "Property Manager",
        role: "Property Manager",
        timestamp: timestamp,
        comment: syncNote,
      };

      setTicketComments(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), syncComment],
      }));

      setWoComments(prev => ({
        ...prev,
        [woId]: [...(prev[woId] || []), syncComment],
      }));

      toast.success(`Work Order ${woId} is now ${newStatus.toUpperCase()}. Linked Ticket ${ticketId} updated to ${mappedTicketStatus.toUpperCase()}!`);
    } else {
      toast.success(`Work Order ${woId} status updated to ${newStatus.toUpperCase()}`);
    }
  }

  // Handler: Create PPM Schedule
  function handleCreatePpm() {
    if (!ppmForm.title.trim()) {
      toast.error("Please enter a PPM title");
      return;
    }
    const newPpm: PpmSchedule = {
      id: `PPM-${(ppmSchedules.length + 1).toString().padStart(3, "0")}`,
      title: ppmForm.title,
      property: ppmForm.property,
      unitRef: ppmForm.scopeType === "property" ? "Entire Building / Common MEP" : ppmForm.unitRef,
      scopeType: ppmForm.scopeType,
      category: ppmForm.category,
      frequency: ppmForm.frequency as any,
      nextDueDate: ppmForm.nextDueDate,
      lastDoneDate: new Date().toISOString().slice(0, 10),
      assignedVendorName: ppmForm.assignedVendorName,
      estimatedCost: Number(ppmForm.estimatedCost) || 0,
      status: "Upcoming",
      checklist: ppmForm.checklist.split(",").map(c => c.trim()).filter(Boolean),
    };
    setPpmSchedules(prev => [newPpm, ...prev]);
    toast.success(`Preventive PPM schedule ${newPpm.id} registered`);
    setShowNewPpmModal(false);
    setPpmForm({
      title: "",
      property: "Al Sadd Commercial Tower",
      scopeType: "property",
      unitRef: "Entire Building / Common MEP",
      category: "HVAC",
      frequency: "Quarterly",
      nextDueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      assignedVendorName: "Carrier Middle East Qatar",
      estimatedCost: 2500,
      checklist: "Compressor oil check, condenser coil cleaning, water flow test, thermostat calibration",
    });
  }

  // Handler: Add Field Technician
  function handleCreateTechnician() {
    if (!techForm.name.trim()) {
      toast.error("Please enter the technician's full name");
      return;
    }
    const newTech: Technician = {
      id: `tech-${technicians.length + 1}`,
      name: techForm.name,
      specialty: techForm.specialty,
      phone: techForm.phone,
      email: techForm.email || `${techForm.name.toLowerCase().replace(/\s+/g, ".")}@pms.qa`,
      activeWorkload: 0,
      status: techForm.status as any,
      rating: 5.0,
      completedJobsCount: 0,
    };
    setTechnicians(prev => [newTech, ...prev]);
    toast.success(`Technician ${newTech.name} added to in-house roster`);
    setShowNewTechModal(false);
    setTechForm({ name: "", specialty: "HVAC & Chiller Plants", phone: "+974 5511 2233", email: "", status: "Available" });
  }

  // Handler: Dispatch Work Order from PPM Modal
  function handleDispatchWoFromPpm() {
    if (!selectedPpmForWo) return;
    const newWoId = `WO-2026-${(workOrders.length + 1).toString().padStart(3, "0")}`;
    const newWo: WorkOrder = {
      id: newWoId,
      title: ppmWoForm.title || `${selectedPpmForWo.title} (PPM)`,
      property: selectedPpmForWo.property,
      unitRef: selectedPpmForWo.unitRef || (selectedPpmForWo.scopeType === "property" ? "Entire Property" : "Specific Unit"),
      category: selectedPpmForWo.category,
      priority: "medium",
      status: "scheduled",
      assigneeType: ppmWoForm.assigneeType,
      technicianName: ppmWoForm.assigneeType === "in_house" ? ppmWoForm.technicianName : undefined,
      vendorName: ppmWoForm.assigneeType === "vendor" ? ppmWoForm.vendorName : undefined,
      scheduledDate: ppmWoForm.scheduledDate || selectedPpmForWo.nextDueDate,
      labourCost: ppmWoForm.assigneeType === "vendor" ? Math.round(Number(ppmWoForm.estimatedCost) * 0.4) : 0,
      materialsCost: ppmWoForm.assigneeType === "vendor" ? Math.round(Number(ppmWoForm.estimatedCost) * 0.6) : 0,
      totalCost: ppmWoForm.assigneeType === "vendor" ? Number(ppmWoForm.estimatedCost) || 0 : 0,
      chargebackToTenant: false,
      scopeOfWork: ppmWoForm.scopeOfWork || `Statutory PPM routine execution.\nCheckpoints:\n` + selectedPpmForWo.checklist.map(c => `- ${c}`).join("\n"),
    };

    setWorkOrders(prev => [newWo, ...prev]);

    // Update PPM schedule last done date
    setPpmSchedules(prev => prev.map(p =>
      p.id === selectedPpmForWo.id
        ? {
            ...p,
            lastDoneDate: new Date().toISOString().slice(0, 10),
            status: "Active",
          }
        : p
    ));

    toast.success(`Work Order ${newWoId} created & dispatched from ${selectedPpmForWo.id}`);
    setSelectedPpmForWo(null);
  }

  // Handler: Add In-House Chargeable Material / Service Line
  function handleCreateInHouseMaterial() {
    if (!inHouseMaterialForm.materialName.trim() || Number(inHouseMaterialForm.unitPrice) <= 0) {
      toast.error("Please enter a valid material name and unit price");
      return;
    }
    const qty = Number(inHouseMaterialForm.quantity || 1);
    const unitPrice = Number(inHouseMaterialForm.unitPrice || 0);
    const totalAmount = qty * unitPrice;
    const glItem = MAINTENANCE_GL_ACCOUNTS.find(g => g.code === inHouseMaterialForm.glAccount) || MAINTENANCE_GL_ACCOUNTS[7];
    const costCenterItem = COST_CENTERS.find(c => c.code === inHouseMaterialForm.costCenter) || COST_CENTERS[0];

    const newInv: MaintenanceVendorInvoice = {
      id: `VI-IH-${Date.now().toString().slice(-4)}`,
      invoiceNo: `IH-MAT-${Date.now().toString().slice(-5)}`,
      ticketId: "T-IH-CHARGE",
      workOrderId: "WO-INHOUSE",
      vendorName: "In-House Facilities & Workshop Stock",
      property: inHouseMaterialForm.property,
      unitRef: inHouseMaterialForm.unitRef,
      invoiceDate: new Date().toISOString().slice(0, 10),
      amount: totalAmount,
      partsDescription: `${qty}x ${inHouseMaterialForm.materialName} (Internal Stock Issue)`,
      labourDescription: inHouseMaterialForm.reason,
      status: "Submitted",
      glAccount: `${glItem.code} - ${glItem.name}`,
      paymentMode: "Internal Cost Journal",
    };

    setVendorInvoices(prev => [newInv, ...prev]);
    toast.success(`In-House Material [${inHouseMaterialForm.materialName}] logged & mapped to GL ${glItem.code}`);
    setShowInHouseMaterialModal(false);

    // Generate Printable / Downloadable Receipt Voucher
    setGeneratedReceipt({
      receiptNo: `MAT-RCP-${Date.now().toString().slice(-6)}`,
      voucherType: "IN_HOUSE_MATERIAL",
      date: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
      partyName: "In-House Maintenance Workshop (Internal Stock)",
      referenceId: newInv.invoiceNo,
      property: inHouseMaterialForm.property,
      unitRef: inHouseMaterialForm.unitRef,
      baseAmount: totalAmount,
      taxAmount: 0,
      totalAmount: totalAmount,
      glAccount: `${glItem.code} - ${glItem.name}`,
      glAccountName: glItem.name,
      costCenter: `${costCenterItem.code} - ${costCenterItem.name}`,
      description: `${inHouseMaterialForm.materialName} (Qty: ${qty}) · ${inHouseMaterialForm.reason}`,
      paymentMode: inHouseMaterialForm.chargebackToTenant ? "Tenant Damage Chargeback (Deposit / Ledger)" : "Landlord Maintenance OPEX",
      issuedBy: role === "admin" ? "Facilities Operations Admin" : "Property Manager (Maintenance Lead)",
    });

    setInHouseMaterialForm({
      materialName: "",
      property: "Al Sadd Commercial Tower",
      unitRef: "Office 402",
      quantity: 1,
      unitPrice: 0,
      costCenter: "CC-101",
      glAccount: "52100008",
      reason: "Chargeable replacement part provided by internal MEP team",
      chargebackToTenant: true,
    });
  }

  // ── Shared: push AP invoice to Finance Store localStorage + trigger sync ──
  function pushApInvoiceToFinanceStore(inv: {
    invoice_no: string;
    vendor: string;
    date: string;
    due_date: string;
    account: string;
    account_code: string;
    base_amount?: number;
    tax_amount?: number;
    amount: number;
    receipt_attachment?: string;
    property?: string;
    unit_ref?: string;
    work_order_id?: string;
    ticket_id?: string;
    payment_terms?: string;
    settlement_mode?: string;
  }) {
    try {
      const baseAmt = inv.base_amount !== undefined ? inv.base_amount : (inv.amount - (inv.tax_amount || 0));
      const taxAmt = inv.tax_amount || 0;
      const totalAmt = inv.amount;

      const FINANCE_AP_KEY = "zyno-pms-finance-data-v1-ap";
      // Push AP invoice to Finance AP Key
      const existing: any[] = JSON.parse(localStorage.getItem(FINANCE_AP_KEY) || "[]");
      const alreadyExists = existing.some((i: any) => i.invoice_no === inv.invoice_no);
      if (!alreadyExists) {
        existing.unshift({
          ...inv,
          id: `ap-mnt-${Date.now()}`,
          status: "Unpaid",
          base_amount: baseAmt,
          tax_amount: taxAmt,
          amount: totalAmt,
          property: inv.property || "Unassigned",
          unit_ref: inv.unit_ref || "Building Maintenance",
          po_number: inv.work_order_id || inv.ticket_id || "—",
          grn_number: inv.ticket_id || "—",
          payment_terms: inv.payment_terms || "Net 30 Days",
          settlement_mode: inv.settlement_mode || "Bank Wire / Electronic Transfer (QNB)",
          receipt_attachment: inv.receipt_attachment,
        });
        localStorage.setItem(FINANCE_AP_KEY, JSON.stringify(existing));
      }

      // Also register in centralized ApInvoicesApi cache so Vendor Management -> Financials -> AP Invoices reflects it
      void ApInvoicesApi.create({
        invoice_number: inv.invoice_no,
        vendor_id: inv.vendor,
        vendor_name: inv.vendor,
        po_number: inv.work_order_id || inv.ticket_id || "—",
        grn_number: inv.ticket_id || "—",
        invoice_date: inv.date,
        due_date: inv.due_date,
        amount: baseAmt,
        tax_amount: taxAmt,
        total_amount: totalAmt,
        payment_terms: inv.payment_terms || "Net 30 Days",
        settlement_mode: inv.settlement_mode || "Bank Wire / Electronic Transfer (QNB)",
        status: "SUBMITTED",
        posting_status: "UNPOSTED",
        source_type: "MAINTENANCE",
        remarks: `Maintenance AP Invoice: ${inv.vendor} (${inv.invoice_no})`,
        receipt_attachment: inv.receipt_attachment,
        property: inv.property,
        unit_ref: inv.unit_ref,
        expense_gl_account: inv.account,
        expense_gl_code: inv.account_code,
      });

      // Dispatch cross-module sync event
      window.dispatchEvent(new Event("finance_vouchers_updated"));
      window.dispatchEvent(new Event("ap_invoices_updated"));
      window.dispatchEvent(new Event("pms_vendor_invoices_updated"));
    } catch (e) {
      console.warn("[Maintenance] Finance store sync failed:", e);
    }
  }

  // ── Shared: push GL Journal to Finance Store ───────────────────────────────
  function pushJournalToFinanceStore(entry: {
    je_no: string;
    posting_date: string;
    reference: string;
    narration: string;
    dr_account: string;
    dr_code: string;
    cr_account: string;
    cr_code: string;
    amount: number;
  }) {
    try {
      const FINANCE_JOURNALS_KEY = "zyno-pms-finance-data-v1-journals";
      const journals: any[] = JSON.parse(localStorage.getItem(FINANCE_JOURNALS_KEY) || "[]");
      journals.unshift({ ...entry, id: `je-mnt-${Date.now()}`, status: "Posted" });
      localStorage.setItem(FINANCE_JOURNALS_KEY, JSON.stringify(journals));
      window.dispatchEvent(new Event("finance_vouchers_updated"));
    } catch (e) {
      console.warn("[Maintenance] GL Journal sync failed:", e);
    }
  }

  // Handler: Add Vendor AP Invoice (from Vendor Jobs Tab CTA)
  function handleCreateVendorInvoiceFromModal() {
    if (!vendorInvModalForm.invoiceNo.trim() || Number(vendorInvModalForm.amount) <= 0) {
      toast.error("Please specify a valid invoice number and amount");
      return;
    }
    const baseAmt = Number(vendorInvModalForm.amount) || 0;
    const taxRate = Number(vendorInvModalForm.taxRate) || 0;
    const taxAmt = baseAmt * (taxRate / 100);
    const totalPayable = baseAmt + taxAmt;
    const glItem = MAINTENANCE_GL_ACCOUNTS.find(g => g.code === vendorInvModalForm.glAccount) || MAINTENANCE_GL_ACCOUNTS[0];
    const invoiceDate = new Date().toISOString().slice(0, 10);
    const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

    const newInv: MaintenanceVendorInvoice = {
      id: `VI-${Date.now().toString().slice(-4)}`,
      invoiceNo: vendorInvModalForm.invoiceNo,
      ticketId: "T-101",
      workOrderId: "WO-2026-001",
      vendorName: vendorInvModalForm.vendorName,
      property: vendorInvModalForm.property,
      unitRef: vendorInvModalForm.unitRef,
      invoiceDate,
      dueDate,
      amount: totalPayable,
      baseAmount: baseAmt,
      taxAmount: taxAmt,
      partsDescription: vendorInvModalForm.partsDescription,
      labourDescription: vendorInvModalForm.labourDescription,
      status: "Submitted",
      glAccount: `${glItem.code} - ${glItem.name}`,
      paymentMode: vendorInvModalForm.settlementMode || vendorInvModalForm.paymentMode || "Bank Wire / Electronic Transfer (QNB)",
      paymentTerms: vendorInvModalForm.paymentTerms || "Net 30 Days",
      settlementMode: vendorInvModalForm.settlementMode || "Bank Wire / Electronic Transfer (QNB)",
      receiptAttachment: vendorInvModalForm.receiptAttachment || vendorInvModalForm.receiptFileName,
      receiptFileName: vendorInvModalForm.receiptFileName,
    };

    const updatedInvoices = [newInv, ...vendorInvoices.filter(i => i.invoiceNo !== newInv.invoiceNo)];
    setVendorInvoices(updatedInvoices);
    try {
      localStorage.setItem("pms_vendor_invoices", JSON.stringify(updatedInvoices));
    } catch (e) {
      console.error("Failed to save pms_vendor_invoices:", e);
    }

    // ── Push to Finance → Payable Invoice & Vendor Management ──────────────
    pushApInvoiceToFinanceStore({
      invoice_no: vendorInvModalForm.invoiceNo,
      vendor: vendorInvModalForm.vendorName,
      date: invoiceDate,
      due_date: dueDate,
      account: `${glItem.code} - ${glItem.name}`,
      account_code: glItem.code,
      base_amount: baseAmt,
      tax_amount: taxAmt,
      amount: totalPayable,
      payment_terms: vendorInvModalForm.paymentTerms || "Net 30 Days",
      settlement_mode: vendorInvModalForm.settlementMode || "Bank Wire / Electronic Transfer (QNB)",
      receipt_attachment: vendorInvModalForm.receiptAttachment || vendorInvModalForm.receiptFileName,
      property: vendorInvModalForm.property,
      unit_ref: vendorInvModalForm.unitRef,
      work_order_id: "WO-2026-001",
      ticket_id: "T-101",
    });

    toast.success(`AP Payable Invoice ${newInv.invoiceNo} registered & submitted to Finance team for payment settlement`);
    setShowVendorInvoiceModal(false);

    setVendorInvModalForm({
      invoiceNo: "",
      vendorName: "Carrier Middle East Qatar",
      property: "Al Sadd Commercial Tower",
      unitRef: "Office 402",
      amount: 1200,
      taxRate: 0,
      costCenter: "CC-101",
      partsDescription: "Replacement sensor and filter assembly",
      labourDescription: "Emergency on-site troubleshooting",
      glAccount: "52100001",
      paymentMode: "Bank Wire / Electronic Transfer (QNB)",
      paymentTerms: "Net 30 Days",
      settlementMode: "Bank Wire / Electronic Transfer (QNB)",
      receiptFileName: "",
      receiptAttachment: "",
    });
  }

  // Handler: Add Tenant Chargeback Notice (with full GL posting)
  function handleCreateChargeback() {
    const linkedWo = workOrders.find(w => w.id === chargebackForm.workOrderId);
    const totalCost = (Number(chargebackForm.laborCost) || 0) + (Number(chargebackForm.materialsCost) || 0);
    const adminFee = totalCost * ((Number(chargebackForm.adminFeeRate) || 0) / 100);
    const totalChargeback = totalCost + adminFee;
    const chargebackAmount = Number(chargebackForm.amount) || totalChargeback;
    const today = new Date().toISOString().slice(0, 10);
    const jeNo = `JE-CB-${Date.now().toString().slice(-6)}`;

    // Determine GL accounts based on recovery mode
    const isDepositDeduction = chargebackForm.recoveryMode === "Security Deposit Deduction";
    const drCode = isDepositDeduction ? "21200001" : "11200001";
    const drName = isDepositDeduction
      ? "Tenant Security Deposits Held (Escrow Liability)"
      : "Tenant Accounts Receivable (Trade Debtors)";
    const crCode = "52100008";
    const crName = "Tenant Recoverable Damage & Chargeback Clearing";
    const costCenterItem = COST_CENTERS.find(c => c.code === chargebackForm.costCenter) || COST_CENTERS[3];

    // Update the linked Work Order chargeback status
    setWorkOrders(prev => prev.map(w =>
      w.id === chargebackForm.workOrderId
        ? {
            ...w,
            chargebackStatus: isDepositDeduction ? "Deposit Deducted" : "AR Invoice Queued",
            chargebackToTenant: true,
          }
        : w
    ));

    // Push balanced GL journal to Finance Store
    pushJournalToFinanceStore({
      je_no: jeNo,
      posting_date: today,
      reference: `CB-${chargebackForm.workOrderId}-${chargebackForm.inspectionRef}`,
      narration: `Tenant Chargeback: ${chargebackForm.tenantName} | ${chargebackForm.damageCategory} | ${chargebackForm.reason}`,
      dr_account: drName,
      dr_code: drCode,
      cr_account: crName,
      cr_code: crCode,
      amount: chargebackAmount,
    });

    // If "Direct Invoice" mode — also raise an AR receivable
    if (!isDepositDeduction) {
      try {
        const FINANCE_AR_KEY = "zyno-pms-finance-data-v1-ar";
        const existingAr: any[] = JSON.parse(localStorage.getItem(FINANCE_AR_KEY) || "[]");
        existingAr.unshift({
          id: `ar-cb-${Date.now()}`,
          invoice_no: `AR-CB-${chargebackForm.workOrderId.replace("WO-", "")}`,
          tenant: chargebackForm.tenantName,
          property: chargebackForm.property,
          unit: chargebackForm.unitRef,
          date: today,
          due_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
          stream: "Tenant Damage Recharge",
          account_code: "41300002",
          amount: chargebackAmount,
          status: "Pending",
        });
        localStorage.setItem(FINANCE_AR_KEY, JSON.stringify(existingAr));
        window.dispatchEvent(new Event("finance_vouchers_updated"));
      } catch (e) {
        console.warn("[Maintenance] AR chargeback sync failed:", e);
      }
    }

    // Generate receipt voucher for chargeback
    setGeneratedReceipt({
      receiptNo: `CB-VCHR-${Date.now().toString().slice(-6)}`,
      voucherType: "TENANT_CHARGEBACK",
      date: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
      partyName: chargebackForm.tenantName,
      referenceId: `${chargebackForm.workOrderId} | ${chargebackForm.inspectionRef}`,
      property: chargebackForm.property,
      unitRef: chargebackForm.unitRef,
      baseAmount: totalCost,
      taxAmount: adminFee,
      totalAmount: chargebackAmount,
      glAccount: `${crCode} - ${crName}`,
      glAccountName: crName,
      costCenter: `${costCenterItem.code} - ${costCenterItem.name}`,
      description: `${chargebackForm.damageCategory}: ${chargebackForm.reason}`,
      paymentMode: chargebackForm.recoveryMode,
      issuedBy: role === "admin" ? "Facilities Operations Admin" : "Property Manager (Maintenance Lead)",
      journalLines: [
        {
          account: `${drCode} - ${drName}`,
          description: isDepositDeduction
            ? `Security Deposit Deduction: ${chargebackForm.tenantName}`
            : `AR Invoice Raised: ${chargebackForm.tenantName}`,
          costCenter: `${costCenterItem.code} - ${costCenterItem.name}`,
          debit: chargebackAmount,
        },
        {
          account: `${crCode} - ${crName}`,
          description: `Chargeback Clearing: WO ${chargebackForm.workOrderId} | Labor QAR ${chargebackForm.laborCost} + Materials QAR ${chargebackForm.materialsCost}${adminFee > 0 ? ` + Admin Fee QAR ${adminFee.toFixed(2)}` : ""}`,
          costCenter: `${costCenterItem.code} - ${costCenterItem.name}`,
          credit: chargebackAmount,
        },
      ],
    });

    toast.success(`Tenant chargeback of QAR ${chargebackAmount.toLocaleString()} posted for ${chargebackForm.tenantName}. GL Journal ${jeNo} generated.`);
    setShowNewChargebackModal(false);
  }

  // Handler: Add Vendor Invoice (from Ticket Dual Sourcing)
  function handleAddVendorInvoice() {
    if (!vendorPartForm.invoiceNo.trim() || vendorPartForm.unitPrice <= 0) {
      toast.error("Please specify a valid invoice number and amount");
      return;
    }
    const invDate = new Date().toISOString().slice(0, 10);
    const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    const invAmt = vendorPartForm.unitPrice * vendorPartForm.quantity;
    const glCodeRaw = vendorPartForm.glAccount.split(" - ")[0] || "52100001";
    const glNameRaw = vendorPartForm.glAccount.split(" - ").slice(1).join(" - ") || "Building Maintenance Expense";
    const newInv: MaintenanceVendorInvoice = {
      id: `VI-${Date.now().toString().slice(-4)}`,
      invoiceNo: vendorPartForm.invoiceNo,
      ticketId: selectedTicket?.id || "T-GEN",
      vendorName: vendorPartForm.vendorName,
      property: selectedTicket?.unit_ref ? "West Bay Pearl Residence" : "Al Sadd Commercial Tower",
      unitRef: selectedTicket?.unit_ref || "Unit",
      invoiceDate: invDate,
      amount: invAmt,
      partsDescription: vendorPartForm.partDescription || "Vendor supplied maintenance material",
      labourDescription: "Specialist vendor on-site maintenance service",
      status: "Submitted",
      glAccount: vendorPartForm.glAccount,
      paymentMode: "Bank Transfer (Net 30)",
    };
    setVendorInvoices(prev => [newInv, ...prev]);
    // ── Push to Finance → Payable Invoice + General Ledger ──────────────────
    pushApInvoiceToFinanceStore({
      invoice_no: vendorPartForm.invoiceNo,
      vendor: vendorPartForm.vendorName,
      date: invDate,
      due_date: dueDate,
      account: vendorPartForm.glAccount,
      account_code: glCodeRaw,
      amount: invAmt,
    });
    toast.success(`AP Payable Invoice ${newInv.invoiceNo} registered & synced to Finance Payable`);
    setVendorPartForm({ vendorName: "Carrier Middle East Qatar", partDescription: "", quantity: 1, unitPrice: 0, invoiceNo: "", glAccount: "52100001 - Building Maintenance Expense" });
  }

  // Handler: Trigger Procurement Purchase Request (PR)
  function handleCreateProcurementPr() {
    toast.success(`Purchase Request (PR) raised for ${prForm.qty}x ${prForm.partName} to Procurement Module`);
    setShowProcurePrModal(false);
  }

  // ── DYNAMIC CONTEXTUAL METRIC CARDS & PRIMARY ACTION CTA PER TAB ─────────────
  const currentTabConfig = useMemo(() => {
    switch (activeTab) {
      case "work_orders":
        return {
          title: "Work Orders & Job Execution",
          subtitle: "Dispatch technicians, allocate internal spares or vendor parts, and track job costs.",
          ctaLabel: "+ Create Work Order",
          ctaIcon: Plus,
          onCtaClick: () => setShowNewWoModal(true),
          cards: [
            { title: "Total Work Orders", value: workOrders.length, subtext: "Active & dispatched jobs", icon: ClipboardList, colorClass: "text-blue-600" },
            { title: "In-House Assigned", value: workOrders.filter(w => w.assigneeType === "in_house").length, subtext: "Handled by field staff", icon: Users, colorClass: "text-indigo-600" },
            { title: "Contractor Dispatched", value: workOrders.filter(w => w.assigneeType === "vendor").length, subtext: "Outsourced specialized MEP", icon: Building2, colorClass: "text-amber-600" },
            { title: "Total Job Cost (MTD)", value: `QAR ${workOrders.reduce((s, w) => s + w.totalCost, 0).toLocaleString()}`, subtext: "Labor + parts incurred", icon: DollarSign, colorClass: "text-emerald-600" },
          ],
        };
      case "ppm":
        return {
          title: "Preventive Maintenance (PPM)",
          subtitle: "Recurring routine schedules, compliance inspection checklists, and statutory servicing.",
          ctaLabel: "+ Add PPM Schedule",
          ctaIcon: Plus,
          onCtaClick: () => setShowNewPpmModal(true),
          cards: [
            { title: "Active Schedules", value: ppmSchedules.length, subtext: "Recurring asset routines", icon: Calendar, colorClass: "text-blue-600" },
            { title: "Due in 30 Days", value: ppmSchedules.filter(p => p.status === "Upcoming").length, subtext: "Upcoming inspection dates", icon: AlertCircle, colorClass: "text-amber-600" },
            { title: "Critical MEP Assets", value: ppmSchedules.filter(p => ["HVAC", "Elevator", "Fire Safety"].includes(p.category)).length, subtext: "Statutory compliance", icon: ShieldCheck, colorClass: "text-indigo-600" },
            { title: "Estimated PPM Budget", value: `QAR ${ppmSchedules.reduce((s, p) => s + p.estimatedCost, 0).toLocaleString()}`, subtext: "Annual routine reserve", icon: DollarSign, colorClass: "text-emerald-600" },
          ],
        };
      case "technicians":
        return {
          title: "Technicians & Maintenance Teams",
          subtitle: "Field staff directory, trade certifications, availability status, and workload allocation synchronized with HRMS / Staff Operations.",
          cards: [
            { title: "Total Field Staff", value: technicians.length, subtext: "Active in-house team", icon: Users, colorClass: "text-blue-600" },
            { title: "Available on Standby", value: technicians.filter(t => t.status === "Available").length, subtext: "Ready for immediate dispatch", icon: CheckCircle, colorClass: "text-emerald-600" },
            { title: "On-Site Active", value: technicians.filter(t => t.status === "On-Site").length, subtext: "Handling live work orders", icon: Wrench, colorClass: "text-amber-600" },
            { title: "Avg Tech Rating", value: "4.85 / 5.0", subtext: "Tenant satisfaction score", icon: Star, colorClass: "text-yellow-600" },
          ],
        };
      case "inventory":
        return {
          title: "Spare Parts & Maintenance Inventory",
          subtitle: "Warehouse stock levels, min-max thresholds, and Procurement PR automated re-ordering.",
          ctaLabel: "+ Reorder via Procurement PR",
          ctaIcon: ShoppingCart,
          onCtaClick: () => {
            const part = stockCatalog[0];
            setProcurePartTarget(part);
            setPrForm({
              partName: part?.name || "AC Air Filter (24x24x2)",
              itemCode: part?.code || "HVAC-FLT-2024",
              qty: 20,
              estimatedCost: part?.unitCost || 65,
              property: "Al Sadd Commercial Tower",
              urgency: "HIGH",
              budgetHead: "Maintenance Items",
              notes: "Regular stock replenishment for warehouse",
            });
            setShowProcurePrModal(true);
          },
          cards: [
            { title: "Catalog Items Tracked", value: stockCatalog.length, subtext: "Warehouse SKU parts", icon: Package, colorClass: "text-blue-600" },
            { title: "Low Stock Alerts", value: stockCatalog.filter(p => p.onHand <= p.minLevel).length, subtext: "Below reorder threshold", icon: AlertTriangle, colorClass: "text-red-600" },
            { title: "Warehouse Valuation", value: `QAR ${stockCatalog.reduce((s, p) => s + (p.onHand * p.unitCost), 0).toLocaleString()}`, subtext: "Current inventory valuation", icon: DollarSign, colorClass: "text-emerald-600" },
            { title: "Procurement Restocks", value: "3 Active PRs", subtext: "In PR -> PO -> GRN pipeline", icon: ShoppingCart, colorClass: "text-indigo-600" },
          ],
        };
      case "vendor_jobs":
        return {
          title: "Vendor Jobs & Accounts Payable",
          subtitle: "3rd-party specialist contractor jobs, parts billing, and direct AP invoice processing.",
          ctaLabel: "+ Record Vendor AP Invoice",
          ctaIcon: Plus,
          onCtaClick: () => setShowVendorInvoiceModal(true),
          cards: [
            { title: "Contractor Invoices", value: vendorInvoices.length, subtext: "Direct AP bills registered", icon: FileText, colorClass: "text-blue-600" },
            { title: "Total AP Invoiced", value: `QAR ${vendorInvoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}`, subtext: "Queued to Finance AP", icon: CreditCard, colorClass: "text-violet-600" },
            { title: "Specialist Vendors", value: "5 Registered", subtext: "Carrier, Otis, Al Mana, QFM...", icon: Building2, colorClass: "text-indigo-600" },
            { title: "Pending Finance Approval", value: vendorInvoices.filter(i => i.status === "Submitted").length, subtext: "Awaiting controller sign-off", icon: Clock, colorClass: "text-amber-600" },
          ],
        };
      case "chargebacks":
        return {
          title: "Maintenance Costing & Tenant Chargebacks",
          subtitle: "Tenant accidental damage recoveries, security deposit deductions, and cost allocation.",
          ctaLabel: "+ Create Chargeback Notice",
          ctaIcon: Plus,
          onCtaClick: () => setShowNewChargebackModal(true),
          cards: [
            { title: "Tenant Chargeable Jobs", value: workOrders.filter(w => w.chargebackToTenant).length, subtext: "Tenant damage liabilities", icon: AlertCircle, colorClass: "text-orange-600" },
            { title: "Billable Recovery Value", value: `QAR ${workOrders.filter(w => w.chargebackToTenant).reduce((s, w) => s + w.totalCost, 0).toLocaleString()}`, subtext: "To recover from tenants", icon: DollarSign, colorClass: "text-red-600" },
            { title: "Deposit Deductions", value: "1 Settled", subtext: "Deducted on checkout", icon: CheckCircle, colorClass: "text-emerald-600" },
            { title: "Absorbed in OPEX", value: `QAR ${workOrders.filter(w => !w.chargebackToTenant).reduce((s, w) => s + w.totalCost, 0).toLocaleString()}`, subtext: "Property operating expense", icon: Building2, colorClass: "text-slate-600" },
          ],
        };
      case "tickets":
      default:
        return {
          title: "Maintenance Service Tickets",
          subtitle: "Intake customer requests, triage priority faults, and track resolution SLAs.",
          ctaLabel: "+ Log Service Ticket",
          ctaIcon: Plus,
          onCtaClick: () => setShowNewTicketModal(true),
          cards: [
            { title: "Active Tickets", value: tickets.filter(t => t.status !== "resolved").length, subtext: "Open or in progress", icon: Wrench, colorClass: "text-orange-600" },
            { title: "Urgent & High Priority", value: tickets.filter(t => t.priority === "urgent" || t.priority === "high").length, subtext: "Immediate dispatch required", icon: AlertTriangle, colorClass: "text-red-600" },
            { title: "In Progress", value: tickets.filter(t => t.status === "in_progress").length, subtext: "Under technician resolution", icon: Clock, colorClass: "text-blue-600" },
            { title: "Resolved (30d)", value: tickets.filter(t => t.status === "resolved").length, subtext: "Successfully closed", icon: CheckCircle, colorClass: "text-emerald-600" },
          ],
        };
    }
  }, [activeTab, tickets, workOrders, ppmSchedules, technicians, stockCatalog, vendorInvoices]);

  return (
    <div className="space-y-6">
      {/* ── TOP CONTEXTUAL STATS HEADER ────────────────────────────────────── */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{currentTabConfig.title}</h2>
          <p className="text-muted-foreground text-sm">{currentTabConfig.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          {currentTabConfig.ctaLabel && (
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white" onClick={currentTabConfig.onCtaClick}>
              <currentTabConfig.ctaIcon className="h-4 w-4 mr-1" /> {currentTabConfig.ctaLabel}
            </Button>
          )}
        </div>
      </div>

      {/* ── METRIC SUMMARY CARDS (DYNAMICALLY ADAPTED PER SUB-TAB) ───────────── */}
      <div className="grid gap-4 md:grid-cols-4">
        {currentTabConfig.cards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <Card key={idx} className="border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium uppercase text-muted-foreground">{card.title}</CardTitle>
                  <IconComp className={`h-4 w-4 ${card.colorClass}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-[11px] text-muted-foreground mt-1">{card.subtext}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── TABS NAVIGATION ────────────────────────────────────────────────── */}
      {/* ── TABS CONTENT (CONTROLLED BY SIDEBAR NAVIGATION) ───────────────── */}
      <Tabs value={activeTab} onValueChange={tab => {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tab);
        window.history.pushState({}, "", url.toString());
      }} className="space-y-4">

        {/* ── TAB 1: SERVICE TICKETS & KANBAN ─────────────────────────────── */}
        <TabsContent value="tickets" className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5 bg-muted/20 p-3 rounded-xl border border-border">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets by ID, title, description, assignee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs bg-background"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 shrink-0 sm:w-[500px]">
              {/* Property Filter */}
              <SearchableSelect
                value={filterProperty}
                onValueChange={setFilterProperty}
                options={[
                  { label: "All Properties", value: "all" },
                  ...dynamicPropertyList.map(p => ({ label: p, value: p })),
                ]}
                placeholder="All Properties"
                searchPlaceholder="Search property..."
              />

              {/* Category Filter */}
              <SearchableSelect
                value={filterCategory}
                onValueChange={setFilterCategory}
                options={[
                  { label: "All Categories", value: "all" },
                  ...TICKET_CATEGORIES.map(cat => ({ label: cat, value: cat })),
                ]}
                placeholder="All Categories"
                searchPlaceholder="Search category..."
              />

              {/* Complaint Area Filter */}
              <SearchableSelect
                value={filterArea}
                onValueChange={setFilterArea}
                options={[
                  { label: "All Areas", value: "all" },
                  ...COMPLAINT_AREAS.map(area => ({ label: area, value: area })),
                ]}
                placeholder="All Areas"
                searchPlaceholder="Search area..."
              />
            </div>
          </div>

          {/* Quick Status Tabs Filter Bar */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-muted/30 rounded-xl border border-border">
            {[
              { key: "all", label: "All Tickets", count: tickets.length },
              { key: "new", label: "New Request", count: tickets.filter(t => t.status === "new").length },
              { key: "assigned", label: "Assigned", count: tickets.filter(t => t.status === "assigned" || t.status === "dispatched").length },
              { key: "in_progress", label: "In Progress", count: tickets.filter(t => t.status === "in_progress").length },
              { key: "resolved", label: "Resolved / Closed", count: tickets.filter(t => t.status === "resolved" || (t.status as string) === "completed" || (t.status as string) === "closed").length },
              { key: "cancelled", label: "Cancelled", count: tickets.filter(t => t.status === "cancelled").length },
            ].map((st) => (
              <button
                key={st.key}
                type="button"
                onClick={() => setTicketStatusTab(st.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  ticketStatusTab === st.key
                    ? "bg-orange-600 text-white shadow-sm font-semibold"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <span>{st.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  ticketStatusTab === st.key ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {st.count}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold">Maintenance Service Tickets</CardTitle>
                  <CardDescription className="text-xs">
                    Comprehensive log of all reported issues, fault triage, technician assignments, and SLA status.
                  </CardDescription>
                </div>
                <div className="text-xs text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredTickets.length}</span> of {tickets.length} tickets
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs bg-muted/40">
                      <TableHead className="w-16">Ticket #</TableHead>
                      <TableHead>Issue & Scope</TableHead>
                      <TableHead>Property & Unit / Scope</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assigned Staff / Vendor</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Date Logged</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-xs text-muted-foreground">
                          No service tickets found matching current filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTickets.map((ticket) => {
                        const isPersonal = !ticket.reported_by?.includes("Community");
                        return (
                          <TableRow key={ticket.id} className="text-xs hover:bg-muted/30">
                            <TableCell className="font-mono font-bold text-orange-600">{ticket.id}</TableCell>
                            <TableCell className="max-w-xs">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-foreground truncate" title={ticket.title}>{ticket.title}</span>
                                {ticket.description && (
                                  <span className="text-[11px] text-muted-foreground truncate max-w-xs" title={ticket.description}>
                                    {ticket.description}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">{(ticket as any).property || "Al Sadd Commercial Tower"}</span>
                                <span className="text-[10px] text-muted-foreground">{ticket.unit_ref || "General MEP"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] bg-muted/40 font-normal">
                                {ticket.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide capitalize ${PRIORITY_STYLES[ticket.priority] || ""}`}>
                                {ticket.priority}
                              </span>
                            </TableCell>
                            <TableCell>
                              {ticket.assignee ? (
                                <span className="font-medium text-foreground">{ticket.assignee}</span>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] text-muted-foreground">Unassigned</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-muted-foreground">{ticket.reported_by || "Tenant"}</span>
                                <span className="text-[9px] text-muted-foreground">{isPersonal ? "Personal (Only Me)" : "Community (All)"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground font-mono">
                              {ticket.created_at ? ticket.created_at.slice(0, 10) : "2026-09-04"}
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-[10px] capitalize font-medium ${
                                ticket.status === "resolved" ? "bg-green-600 text-white" :
                                ticket.status === "in_progress" ? "bg-blue-600 text-white" :
                                ticket.status === "assigned" ? "bg-purple-600 text-white" :
                                "bg-amber-600 text-white"
                              }`}>
                                {COLUMNS.find(c => c.key === ticket.status)?.label || ticket.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-orange-700 dark:text-orange-300"
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setEditStatus(ticket.status);
                                  let partsForTicket = ticketSparePartsMap[ticket.id] || [];
                                  if (partsForTicket.length === 0) {
                                    const linkedWo = workOrders.find(w => w.ticketId === ticket.id);
                                    if (linkedWo?.spareParts && linkedWo.spareParts.length > 0) {
                                      partsForTicket = linkedWo.spareParts.map((sp: any, i: number) => {
                                        const foundCatalog = stockCatalog.find(c => c.code === (sp.code || sp.partCode) || c.id === sp.partId);
                                        return {
                                          id: `sp-${ticket.id}-${i}-${Date.now()}`,
                                          partId: foundCatalog ? foundCatalog.id : (sp.partId || sp.code || `item-${i}`),
                                          quantity: sp.quantity || sp.qty || 1,
                                        };
                                      });
                                    }
                                  }
                                  setTicketSpareParts(partsForTicket);
                                  setVendorInvoiceRaised(false);
                                  setVendorPartForm({
                                    vendorName: "Carrier Middle East Qatar",
                                    partDescription: "",
                                    quantity: 1,
                                    unitPrice: 0,
                                    invoiceNo: "",
                                    glAccount: "52100001 - Building Maintenance Expense",
                                  });
                                }}
                              >
                                <Eye className="h-3 w-3" /> View / Edit
                                {(ticketComments[ticket.id]?.length || 0) > 0 && (
                                  <Badge variant="secondary" className="ml-0.5 text-[9px] px-1 py-0 h-3.5 bg-orange-100 text-orange-800">
                                    {ticketComments[ticket.id].length}
                                  </Badge>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── TAB 2: WORK ORDERS ───────────────────────────────────────────── */}
        <TabsContent value="work_orders" className="space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {([
              { key: "all", label: "All", count: workOrders.length },
              { key: "scheduled", label: "Scheduled", count: workOrders.filter(w => w.status === "scheduled").length },
              { key: "in_progress", label: "In Progress", count: workOrders.filter(w => w.status === "in_progress").length },
              { key: "completed", label: "Completed", count: workOrders.filter(w => w.status === "completed").length },
              { key: "cancelled", label: "Cancelled", count: workOrders.filter(w => w.status === "cancelled").length },
            ] as const).map(st => (
              <button
                key={st.key}
                onClick={() => setWoStatusTab(st.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  woStatusTab === st.key
                    ? st.key === "completed" ? "bg-green-600 text-white border-green-600 shadow-sm"
                    : st.key === "in_progress" ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : st.key === "scheduled" ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : st.key === "cancelled" ? "bg-red-500 text-white border-red-500 shadow-sm"
                    : "bg-orange-600 text-white border-orange-600 shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:bg-muted/60"
                }`}
              >
                {st.label}
                <span className={`text-[10px] font-bold px-1 py-0 rounded-full ${
                  woStatusTab === st.key ? "bg-white/20" : "bg-muted text-muted-foreground"
                }`}>{st.count}</span>
              </button>
            ))}
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Work Orders & Job Execution</CardTitle>
                <CardDescription className="text-xs">Dispatch technicians, allocate spares or vendor parts, track job costs and sign-offs.
                  {woStatusTab !== "all" && (
                    <span className="ml-1 font-semibold text-foreground capitalize">
                      — Showing: {woStatusTab.replace("_", " ")}
                    </span>
                  )}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[11px]">{filteredWorkOrders.length} job{filteredWorkOrders.length !== 1 ? "s" : ""}</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs bg-muted/40">
                    <TableHead>WO #</TableHead>
                    <TableHead>Job Title & Scope</TableHead>
                    <TableHead>Property / Unit</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Schedule Date</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-xs text-muted-foreground">
                        No work orders found for the selected status.
                      </TableCell>
                    </TableRow>
                  ) : filteredWorkOrders.map((wo) => (
                    <TableRow key={wo.id} className="text-xs hover:bg-muted/30">
                      <TableCell className="font-mono font-bold text-orange-600">{wo.id}</TableCell>
                      <TableCell className="font-medium max-w-xs truncate" title={wo.scopeOfWork}>
                        <div className="flex flex-col">
                          <span>{wo.title}</span>
                          {wo.chargebackToTenant && (
                            <Badge className="text-[9px] px-1 py-0 h-3.5 bg-rose-600 w-fit mt-0.5">Tenant Chargeback</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{wo.property} ({wo.unitRef})</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{wo.category}</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{wo.technicianName || wo.vendorName}</span>
                          <span className="text-[10px] text-muted-foreground">{wo.assigneeType === "in_house" ? "In-House Staff" : "3rd-Party Vendor"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{wo.scheduledDate}</TableCell>
                      <TableCell className="text-right font-mono font-bold">QAR {wo.totalCost.toLocaleString()}</TableCell>
                      <TableCell>
                        <Select
                          value={wo.status}
                          onValueChange={(val: WorkOrder["status"]) => handleUpdateWorkOrderStatus(wo.id, val)}
                        >
                          <SelectTrigger className={`h-6 text-[11px] font-semibold w-32 border-0 shadow-none px-2 ${
                            wo.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300" :
                            wo.status === "in_progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" :
                            wo.status === "scheduled" ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300" :
                            wo.status === "cancelled" ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300" :
                            "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-orange-700 dark:text-orange-300"
                          onClick={() => setSelectedWoForDetail(wo)}
                        >
                          <MessageSquare className="h-3 w-3" /> Details
                          {(woComments[wo.id]?.length || 0) > 0 && (
                            <Badge variant="secondary" className="ml-0.5 text-[9px] px-1 py-0 h-3.5 bg-orange-100 text-orange-800">
                              {woComments[wo.id].length}
                            </Badge>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: PREVENTIVE MAINTENANCE (PPM) ─────────────────────────── */}
        <TabsContent value="ppm" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Preventive Maintenance (PPM) Schedules</CardTitle>
                <CardDescription className="text-xs">Automated routine servicing for central chillers, elevators, fire systems, pumps, and water tanks.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs bg-muted/40">
                    <TableHead>PPM Code</TableHead>
                    <TableHead>Maintenance Task</TableHead>
                    <TableHead>Property & Unit / Scope</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Due Date</TableHead>
                    <TableHead>Contractor / Vendor</TableHead>
                    <TableHead className="text-right">Est. Budget</TableHead>
                    <TableHead>Checklist Items</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ppmSchedules.map((ppm) => (
                    <TableRow key={ppm.id} className="text-xs hover:bg-muted/30">
                      <TableCell className="font-mono font-bold text-blue-600">{ppm.id}</TableCell>
                      <TableCell className="font-medium">{ppm.title}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{ppm.property}</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            {ppm.scopeType === "property" ? (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 bg-blue-50/50 text-blue-700 dark:bg-blue-950/40">
                                Entire Property
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 bg-purple-50/50 text-purple-700 dark:bg-purple-950/40">
                                {ppm.unitRef || "Specific Unit"}
                              </Badge>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{ppm.frequency}</Badge></TableCell>
                      <TableCell className="font-semibold text-orange-600">{ppm.nextDueDate}</TableCell>
                      <TableCell>{ppm.assignedVendorName || "In-House Team"}</TableCell>
                      <TableCell className="text-right font-mono font-bold">QAR {ppm.estimatedCost.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{ppm.checklist.length} checklist checkpoints</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-orange-200 hover:bg-orange-50 text-orange-700 dark:text-orange-300 font-medium"
                          onClick={() => {
                            setSelectedPpmForWo(ppm);
                            setPpmWoForm({
                              title: `${ppm.title} - [PPM Service]`,
                              scheduledDate: ppm.nextDueDate,
                              scopeOfWork: `Checklist Requirements:\n` + ppm.checklist.map((c, i) => `${i + 1}. ${c}`).join("\n"),
                              assigneeType: ppm.assignedVendorName ? "vendor" : "in_house",
                              vendorName: ppm.assignedVendorName || "Carrier Middle East Qatar",
                              technicianName: "Faisal Tariq (HVAC Specialist)",
                              estimatedCost: ppm.estimatedCost,
                            });
                          }}
                        >
                          <Wrench className="h-3 w-3" /> Generate WO
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: TECHNICIANS & TEAMS ──────────────────────────────────── */}
        <TabsContent value="technicians" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">In-House Maintenance Technicians</CardTitle>
                <CardDescription className="text-xs">Capacity management, skills directory, contact details, and performance scores.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs bg-muted/40">
                    <TableHead>Technician Name</TableHead>
                    <TableHead>Primary Trade Specialty</TableHead>
                    <TableHead>Contact Phone</TableHead>
                    <TableHead>Active Jobs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Completed Jobs</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technicians.map((tech) => (
                    <TableRow key={tech.id} className="text-xs hover:bg-muted/30">
                      <TableCell className="font-semibold">{tech.name}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{tech.specialty}</Badge></TableCell>
                      <TableCell className="font-mono text-muted-foreground">{tech.phone}</TableCell>
                      <TableCell className="font-bold text-orange-600">{tech.activeWorkload} active</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${tech.status === "Available" ? "bg-green-600" : tech.status === "On-Site" ? "bg-blue-600" : "bg-slate-500"}`}>
                          {tech.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">{tech.completedJobsCount}</TableCell>
                      <TableCell className="text-right font-mono text-amber-500 font-bold">⭐ {tech.rating}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 5: SPARE PARTS INVENTORY & PR REORDER ───────────────────── */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Facility Spare Parts Warehouse</CardTitle>
                <CardDescription className="text-xs">Real-time shelf counts, bin locations, and direct integration to Procurement via Purchase Requests (PR).</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs bg-muted/40">
                    <TableHead>Item Code</TableHead>
                    <TableHead>Part Name & Spec</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">On Hand</TableHead>
                    <TableHead className="text-right">Min Reorder Level</TableHead>
                    <TableHead>UOM</TableHead>
                    <TableHead className="text-right">Unit Cost (QAR)</TableHead>
                    <TableHead>Bin Location</TableHead>
                    <TableHead>Stock Status</TableHead>
                    <TableHead className="text-right">Procurement Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockCatalog.map((part) => {
                    const isLow = part.onHand <= part.minLevel;
                    return (
                      <TableRow key={part.id} className="text-xs hover:bg-muted/30">
                        <TableCell className="font-mono font-bold text-primary">{part.code}</TableCell>
                        <TableCell className="font-medium">{part.name}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{part.category}</Badge></TableCell>
                        <TableCell className="text-right font-mono font-bold">{part.onHand}</TableCell>
                        <TableCell className="text-right font-mono text-amber-600">{part.minLevel}</TableCell>
                        <TableCell className="text-muted-foreground">{part.uom}</TableCell>
                        <TableCell className="text-right font-mono font-bold">QAR {part.unitCost}</TableCell>
                        <TableCell className="text-muted-foreground">{part.location}</TableCell>
                        <TableCell>
                          {isLow ? (
                            <Badge className="text-[10px] bg-amber-500 hover:bg-amber-600">Low Stock</Badge>
                          ) : (
                            <Badge className="text-[10px] bg-emerald-600 hover:bg-emerald-700">In Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={isLow ? "default" : "outline"}
                            className={`h-7 text-xs gap-1 ${isLow ? "bg-orange-600 hover:bg-orange-700 text-white" : ""}`}
                            onClick={() => {
                              setProcurePartTarget(part);
                              setPrForm({
                                partName: part.name,
                                itemCode: part.code,
                                qty: part.minLevel * 2,
                                estimatedCost: part.unitCost,
                                property: "Al Sadd Commercial Tower",
                                urgency: isLow ? "HIGH" : "NORMAL",
                                budgetHead: "Maintenance Items",
                                notes: `Restock request for facility inventory bin: ${part.location}`,
                              });
                              setShowProcurePrModal(true);
                            }}
                          >
                            <ShoppingCart className="h-3 w-3" /> Procure via PR
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 6: VENDOR JOBS & AP INVOICES ────────────────────────────── */}
        <TabsContent value="vendor_jobs" className="space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/20 border border-border rounded-xl">
            <div className="text-xs">
              <span className="font-semibold text-foreground">Vendor Work Invoicing &amp; AP Sync</span>
              <p className="text-[11px] text-muted-foreground">Raise final AP payable invoices for completed vendor contractor jobs, or record chargeable internal stock. Raised invoices are automatically synced to Finance → Payable Invoice &amp; General Ledger.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1.5 border-blue-300 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-medium"
                onClick={() => setShowInHouseMaterialModal(true)}
              >
                <Package className="h-3.5 w-3.5 text-blue-600" /> + Record In-House Chargeable Material
              </Button>
            </div>
          </div>

          {/* ── SUB-SECTION 1: COMPLETED 3RD-PARTY VENDOR WORK ORDERS (PENDING AP INVOICE) ── */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b border-border/60">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-violet-600" />
                  Completed 3rd-Party Vendor Work Orders (Pending AP Invoicing)
                </CardTitle>
                <CardDescription className="text-xs">
                  Work orders successfully completed by outsourced vendors ready to raise final AP invoices with items and costs.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[11px] bg-violet-50 text-violet-700 border-violet-200 font-medium">
                {workOrders.filter(w => w.assigneeType === "vendor" && w.status === "completed").length} Completed Jobs
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs bg-muted/40">
                    <TableHead>WO #</TableHead>
                    <TableHead>3rd-Party Vendor</TableHead>
                    <TableHead>Property & Unit / Scope</TableHead>
                    <TableHead>Completed Date</TableHead>
                    <TableHead>Items & Materials Used / Scope</TableHead>
                    <TableHead className="text-right">Total Cost (QAR)</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const completedVendorWos = workOrders.filter(w => w.assigneeType === "vendor" && w.status === "completed");
                    if (completedVendorWos.length === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                            No completed 3rd-party vendor work orders pending invoice.
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return completedVendorWos.map((wo) => {
                      const itemsSummary = wo.spareParts && wo.spareParts.length > 0
                        ? wo.spareParts.map(s => `${s.quantity || 1}x ${s.name}`).join(", ")
                        : wo.scopeOfWork;

                      return (
                        <TableRow key={wo.id} className="text-xs hover:bg-muted/30">
                          <TableCell className="font-mono font-bold text-orange-600">{wo.id}</TableCell>
                          <TableCell className="font-semibold text-foreground">{wo.vendorName || "Outsourced Vendor"}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{wo.property}</span>
                              <span className="text-[10px] text-muted-foreground">{wo.unitRef}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">{wo.completionDate || wo.scheduledDate}</TableCell>
                          <TableCell className="max-w-xs truncate" title={itemsSummary}>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground truncate">{wo.title}</span>
                              <span className="text-[10px] text-muted-foreground truncate">{itemsSummary}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-emerald-600">
                            QAR {wo.totalCost.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-violet-600 hover:bg-violet-700 text-white gap-1"
                              onClick={() => {
                                setVendorInvModalForm({
                                  invoiceNo: `INV-WO-${wo.id.replace("WO-", "")}`,
                                  vendorName: wo.vendorName || "Carrier Middle East Qatar",
                                  property: wo.property,
                                  unitRef: wo.unitRef,
                                  amount: wo.totalCost,
                                  taxRate: 0,
                                  costCenter: "CC-101",
                                  partsDescription: itemsSummary,
                                  labourDescription: `Final contractor maintenance invoice for ${wo.title} (${wo.id})`,
                                  glAccount: "52100001",
                                  paymentMode: "Bank Wire / Electronic Transfer (QNB)",
                                  paymentTerms: "Net 30 Days",
                                  settlementMode: "Bank Wire / Electronic Transfer (QNB)",
                                  receiptFileName: "",
                                  receiptAttachment: "",
                                });
                                setShowVendorInvoiceModal(true);
                              }}
                            >
                              <FileCheck className="h-3.5 w-3.5" /> Raise AP Invoice
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })()}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* ── SUB-SECTION 2: POSTED VENDOR INVOICES TABLE ── */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Posted Vendor Maintenance Invoices &amp; AP Sync</CardTitle>
                <CardDescription className="text-xs">Invoices raised directly by 3rd-party maintenance contractors from Vendor Management, synced into Finance AP.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs bg-muted/40">
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Contractor / Vendor</TableHead>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Property / Unit</TableHead>
                    <TableHead>Payment Terms &amp; Settlement</TableHead>
                    <TableHead>Parts &amp; Labor Details</TableHead>
                    <TableHead>GL Account</TableHead>
                    <TableHead className="text-right">Total (QAR)</TableHead>
                    <TableHead>Finance Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorInvoices.map((inv) => (
                    <TableRow key={inv.id} className="text-xs hover:bg-muted/30">
                      <TableCell className="font-mono font-bold text-violet-600">{inv.invoiceNo}</TableCell>
                      <TableCell className="font-semibold">{inv.vendorName}</TableCell>
                      <TableCell className="font-mono">{inv.ticketId}</TableCell>
                      <TableCell>{inv.property} ({inv.unitRef})</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground">{inv.paymentTerms || "Net 30 Days"}</span>
                          <span className="text-[10px] text-muted-foreground">{inv.settlementMode || inv.paymentMode || "Bank Wire / Electronic Transfer (QNB)"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={inv.partsDescription}>{inv.partsDescription}</TableCell>
                      <TableCell className="text-[11px] font-mono text-muted-foreground">{inv.glAccount}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono font-bold text-emerald-600">QAR {inv.amount.toLocaleString()}</span>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Base: {Number(inv.baseAmount || (inv.amount - (inv.taxAmount || 0))).toLocaleString()} | Tax: {Number(inv.taxAmount || 0).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${inv.status === "Approved" ? "bg-green-600" : "bg-amber-600"}`}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 7: COSTING & CHARGEBACKS ────────────────────────────────── */}
        <TabsContent value="chargebacks" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Tenant Maintenance Cost Allocation &amp; Chargebacks</CardTitle>
                <CardDescription className="text-xs">
                  Automated lease liability resolution: Landlord Opex vs. Tenant Damage Billing with complete Work Order itemization.
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white gap-1.5"
                onClick={() => setShowNewChargebackModal(true)}
              >
                <Plus className="h-3.5 w-3.5" /> Issue Tenant Chargeback
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs bg-muted/40">
                    <TableHead>WO / Ticket #</TableHead>
                    <TableHead>Property &amp; Unit</TableHead>
                    <TableHead>Service &amp; Scope Provided</TableHead>
                    <TableHead>Items / Materials Utilized</TableHead>
                    <TableHead>Responsibility Rule</TableHead>
                    <TableHead>Charge Reason</TableHead>
                    <TableHead className="text-right">Cost Breakdown (QAR)</TableHead>
                    <TableHead>Billing Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrders.map((wo) => {
                    const linkedTicket = tickets.find(t => t.id === wo.ticketId);
                    const itemsText = wo.scopeOfWork ? wo.scopeOfWork : `${wo.title}`;
                    return (
                      <TableRow key={wo.id} className="text-xs hover:bg-muted/30">
                        <TableCell>
                          <div className="font-mono font-bold text-primary">{wo.id}</div>
                          <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                            <span>Ticket:</span>
                            <span className="font-semibold text-orange-600">{wo.ticketId || linkedTicket?.id || "T-GEN"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-foreground">{wo.property}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{wo.unitRef}</div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="font-medium text-foreground">{wo.title}</div>
                          <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{itemsText}</div>
                          <div className="text-[10px] text-primary/80 mt-0.5">
                            Assigned: {wo.technicianName || wo.vendorName || "In-House Team"}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="text-[11px] font-mono bg-muted/50 p-1.5 rounded border border-border/60">
                            {wo.id === "WO-2026-003"
                              ? "Custom Double-Glazed Glass Panel (1x) + Mortise Lock Latch"
                              : wo.id === "WO-2026-001"
                              ? "Honeywell Modulating 2-Way Actuator Valve (1x) + R410A Freon Gas"
                              : wo.id === "WO-2026-002"
                              ? "Digital Pressure Transducer 0-10 Bar (1x) + Switch Assembly"
                              : `Warehouse Part / Materials for ${wo.category}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          {wo.chargebackToTenant ? (
                            <Badge className="text-[10px] bg-rose-600 hover:bg-rose-700">Tenant Responsibility</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">Landlord Opex Expense</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[11px]">
                          {wo.tenantChargeReason || (wo.chargebackToTenant ? "Tenant Move-in/out Damage" : "Normal Wear & Tear")}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <div className="font-bold text-foreground">QAR {wo.totalCost.toLocaleString()}</div>
                          <div className="text-[10px] text-muted-foreground">
                            Labor: {wo.labourCost || 0} | Mat: {wo.materialsCost || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          {wo.chargebackToTenant ? (
                            <Badge variant="outline" className="text-[10px] border-rose-400 text-rose-600 bg-rose-50/30">
                              {wo.chargebackStatus || "AR Invoice Queued"}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-600">
                              Absorbed in Opex
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── MODAL: TICKET DETAIL & INTERACTIVE TIMELINE / DUAL SOURCING ───── */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => { if (!open) setSelectedTicket(null); }}>
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
              <div>
                <DialogTitle className="text-lg font-bold">{selectedTicket?.title}</DialogTitle>
                <DialogDescription className="text-xs flex items-center gap-2 mt-1">
                  <span className="font-mono font-bold text-orange-600">{selectedTicket?.id}</span>
                  <span>·</span>
                  <Badge variant="outline" className="text-[10px]">{selectedTicket?.category}</Badge>
                  <span>·</span>
                  <span>{selectedTicket?.unit_ref}</span>
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {selectedTicket?.reported_by?.includes("Community") ? (
                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> Community (All)</span>
                  ) : (
                    <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Personal (Only Me)</span>
                  )}
                </Badge>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide capitalize ${selectedTicket ? PRIORITY_STYLES[selectedTicket.priority] : ""}`}>
                  {selectedTicket?.priority}
                </span>
              </div>
            </div>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4 py-2">
              {/* Ticket Meta Summary */}
              <div className="rounded-lg bg-muted/40 p-3.5 text-xs space-y-2 border border-border/60">
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <p><span className="font-semibold text-foreground">Reported By:</span> {selectedTicket.reported_by || "Tenant"}</p>
                  <p><span className="font-semibold text-foreground">Date Logged:</span> {selectedTicket.created_at}</p>
                </div>
                <div className="pt-1 border-t border-border/40">
                  <span className="font-semibold text-foreground">Description & Symptoms:</span>
                  <p className="mt-1 text-foreground/90 whitespace-pre-wrap leading-relaxed">{selectedTicket.description || "No further details provided."}</p>
                </div>
              </div>

              {/* Inner Tabs for Ticket: Resolution/Parts vs Timeline & Comments */}
              <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="grid grid-cols-2 w-full h-8 bg-muted/60">
                  <TabsTrigger value="timeline" className="text-xs gap-1.5 h-7">
                    <MessageSquare className="h-3.5 w-3.5 text-orange-600" /> Comments & Attachments Timeline
                    <Badge variant="secondary" className="ml-1 text-[9px] px-1 py-0 h-3.5 bg-orange-100 text-orange-800">
                      {ticketComments[selectedTicket.id]?.length || 0}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="parts_sourcing" className="text-xs gap-1.5 h-7">
                    <Wrench className="h-3.5 w-3.5 text-blue-600" /> Parts Sourcing & Dispatch
                  </TabsTrigger>
                </TabsList>

                {/* ── SUB-TAB: COMMENTS & ATTACHMENTS TIMELINE ── */}
                <TabsContent value="timeline" className="space-y-3 pt-2">
                  <div className="rounded-lg border border-border p-3 space-y-3 bg-muted/10 max-h-[260px] overflow-y-auto">
                    {(ticketComments[selectedTicket.id]?.length || 0) === 0 ? (
                      <div className="text-center py-6 text-xs text-muted-foreground">
                        <MessageSquare className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                        No comments or attachments logged yet. Post an update below.
                      </div>
                    ) : (
                      ticketComments[selectedTicket.id]?.map((cmt) => (
                        <div key={cmt.id} className="p-2.5 rounded-lg bg-background border border-border/70 space-y-1.5 shadow-sm">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5 font-medium">
                              <span className="text-foreground">{cmt.author}</span>
                              <Badge variant="outline" className={`text-[9px] px-1 py-0 h-3.5 ${
                                cmt.role === "Tenant" ? "bg-emerald-50 text-emerald-700 border-emerald-300" :
                                cmt.role === "Technician" ? "bg-blue-50 text-blue-700 border-blue-300" :
                                cmt.role === "Vendor" ? "bg-violet-50 text-violet-700 border-violet-300" :
                                "bg-amber-50 text-amber-700 border-amber-300"
                              }`}>
                                {cmt.role}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">{cmt.timestamp}</span>
                          </div>
                          <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">{cmt.comment}</p>
                          {cmt.attachments && cmt.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {cmt.attachments.map((att, idx) => (
                                <div key={idx} className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-[10px] font-mono text-muted-foreground border border-border">
                                  <Paperclip className="h-3 w-3 text-orange-600" />
                                  <span>{att.name}</span>
                                  <span className="opacity-60">({att.size})</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add New Comment Box */}
                  <div className="rounded-lg border border-border/80 p-3 space-y-2.5 bg-background">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold flex items-center gap-1 text-foreground">
                        <MessageSquare className="h-3.5 w-3.5 text-orange-600" /> Add Comment or Attachment
                      </span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Label className="text-[11px] text-muted-foreground">Posting As:</Label>
                        <Badge variant="outline" className="text-[11px] font-medium bg-muted/60 text-foreground border-border px-2 py-0.5 rounded">
                          {role === "admin" ? "Admin Operations" : role === "owner" ? "Property Owner" : "Property Manager"}
                        </Badge>
                      </div>
                    </div>
                    <Textarea
                      placeholder="Type comment, technician diagnostic notes, tenant feedback..."
                      value={newTicketCommentText}
                      onChange={e => setNewTicketCommentText(e.target.value)}
                      className="text-xs min-h-[50px]"
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-1">
                        <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <Input
                          placeholder="Attach filename (e.g. photo_defect.jpg, repair_slip.pdf)"
                          value={newTicketCommentFile}
                          onChange={e => setNewTicketCommentFile(e.target.value)}
                          className="h-7 text-xs font-mono"
                        />
                      </div>
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white shrink-0"
                        onClick={() => handleAddTicketComment(selectedTicket.id)}
                      >
                        <Send className="h-3 w-3 mr-1" /> Post Update
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* ── SUB-TAB: PARTS SOURCING & DISPATCH ── */}
                <TabsContent value="parts_sourcing" className="space-y-3 pt-2">
                  <div className="rounded-lg border border-border p-3.5 space-y-3 bg-muted/10">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">Parts & Material Sourcing</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={partSourceMode === "warehouse" ? "default" : "outline"}
                          className="h-7 text-xs"
                          onClick={() => setPartSourceMode("warehouse")}
                        >
                          <Package className="h-3 w-3 mr-1" /> Internal Warehouse Stock
                        </Button>
                        <Button
                          size="sm"
                          variant={partSourceMode === "vendor" ? "default" : "outline"}
                          className="h-7 text-xs"
                          onClick={() => setPartSourceMode("vendor")}
                        >
                          <Building2 className="h-3 w-3 mr-1" /> Vendor Provided & Invoiced
                        </Button>
                      </div>
                    </div>

                    {partSourceMode === "warehouse" ? (
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                          <div className="md:col-span-7">
                            <Label className="text-[11px]">Select Warehouse Spare Part</Label>
                            <SearchableSelect
                              value={selectedWarehousePartId}
                              onValueChange={setSelectedWarehousePartId}
                              options={stockCatalog.map(p => ({
                                label: p.name,
                                value: p.id,
                                subtext: `${p.onHand} in stock · QAR ${p.unitCost}`,
                              }))}
                              placeholder="Select in-stock part..."
                              searchPlaceholder="Search warehouse items..."
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-[11px]">Qty</Label>
                            <Input
                              type="number"
                              min="1"
                              value={warehouseQty}
                              onChange={e => setWarehouseQty(Math.max(1, Number(e.target.value)))}
                              className="h-8 text-xs font-mono"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <Button
                              size="sm"
                              className="h-8 text-xs w-full bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700"
                              onClick={() => {
                                const part = stockCatalog.find(p => p.id === selectedWarehousePartId);
                                if (!part) {
                                  toast.error("Please select a spare part first");
                                  return;
                                }
                                if (part.onHand < warehouseQty) {
                                  toast.warning(`Insufficient stock (${part.onHand} on hand). You can still add the line or raise a PR.`);
                                }
                                setTicketSpareParts(prev => {
                                  const existingIdx = prev.findIndex(item => item.partId === part.id);
                                  if (existingIdx >= 0) {
                                    const updated = [...prev];
                                    updated[existingIdx].quantity += warehouseQty;
                                    return updated;
                                  }
                                  return [...prev, { id: `item-${Date.now()}-${Math.random()}`, partId: part.id, quantity: warehouseQty }];
                                });
                                toast.success(`Added ${warehouseQty}x ${part.name} to required parts list`);
                                setSelectedWarehousePartId("");
                                setWarehouseQty(1);
                              }}
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" /> Add Part Line
                            </Button>
                          </div>
                        </div>

                        {/* Selected Parts List / Table */}
                        <div className="rounded-lg border border-border bg-background p-2.5 space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                            <span>Allocated Spare Parts ({ticketSpareParts.length} items)</span>
                            <span className="text-[11px] text-muted-foreground font-normal">
                              Parts will be issued & deducted upon clicking &quot;Save Updates&quot;
                            </span>
                          </div>

                          {ticketSpareParts.length === 0 ? (
                            <div className="py-4 text-center text-xs text-muted-foreground border border-dashed border-border rounded">
                              No warehouse parts added yet. Select an item above and click &quot;Add Part Line&quot;.
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                              {ticketSpareParts.map((item) => {
                                const part = stockCatalog.find(p => p.id === item.partId);
                                if (!part) return null;
                                const isLowStock = part.onHand < item.quantity;
                                return (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between p-2 rounded border border-border/80 bg-muted/20 text-xs gap-2"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-foreground truncate flex items-center gap-1.5">
                                        <span>{part.name}</span>
                                        <span className="font-mono text-[10px] text-muted-foreground">({part.code})</span>
                                        {isLowStock && (
                                          <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                                            Low Stock ({part.onHand} avail)
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-muted-foreground">
                                        QAR {part.unitCost} / {part.uom} · Stock: {part.onHand} on hand · Location: {part.location}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <div className="flex items-center gap-1">
                                        <Label className="text-[10px] text-muted-foreground">Qty:</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={item.quantity}
                                          onChange={(e) => {
                                            const newQty = Math.max(1, Number(e.target.value));
                                            setTicketSpareParts(prev =>
                                              prev.map(p => p.id === item.id ? { ...p, quantity: newQty } : p)
                                            );
                                          }}
                                          className="h-7 w-16 text-xs font-mono text-center"
                                        />
                                      </div>
                                      <span className="font-mono font-bold text-foreground text-xs w-20 text-right">
                                        QAR {(part.unitCost * item.quantity).toLocaleString()}
                                      </span>
                                      <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-medium shrink-0 h-6">
                                        Allocated to Ticket
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}

                              <div className="flex justify-between items-center pt-2 border-t border-border/60 text-xs font-semibold px-1">
                                <span>Estimated Materials Total:</span>
                                <span className="font-mono text-orange-600 font-bold">
                                  QAR {ticketSpareParts.reduce((acc, item) => {
                                    const part = stockCatalog.find(p => p.id === item.partId);
                                    return acc + (part ? part.unitCost * item.quantity : 0);
                                  }, 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <Label className="text-[11px]">Certified Vendor (Vendor Master)</Label>
                            <Select value={vendorPartForm.vendorName} onValueChange={v => setVendorPartForm(f => ({ ...f, vendorName: v }))}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Carrier Middle East Qatar">Carrier Middle East Qatar</SelectItem>
                                <SelectItem value="Qatar Facilities Management (QFM)">Qatar Facilities Management (QFM)</SelectItem>
                                <SelectItem value="Al Mana Engineering & Maintenance">Al Mana Engineering & Maintenance</SelectItem>
                                <SelectItem value="Otis Elevator Qatar WLL">Otis Elevator Qatar WLL</SelectItem>
                                <SelectItem value="Doha Fire Protection Solutions">Doha Fire Protection Solutions</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-[11px]">Vendor Work Order / Dispatch Ref</Label>
                            <Input
                              placeholder="e.g. VWO-2026-081"
                              value={vendorPartForm.invoiceNo}
                              onChange={e => setVendorPartForm(f => ({ ...f, invoiceNo: e.target.value }))}
                              className="h-8 text-xs font-mono"
                            />
                          </div>
                        </div>

                        {/* Vendor Estimated Charges & Direct Link to Vendor Jobs AP */}
                        <div className="p-3 rounded-lg border border-border/80 bg-background space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                              <Receipt className="h-3.5 w-3.5 text-orange-600" /> Vendor Service & Estimated Charges
                            </span>
                            <Badge variant={vendorInvoiceRaised ? "default" : "outline"} className={vendorInvoiceRaised ? "bg-emerald-600 text-[10px]" : "text-[10px] text-muted-foreground"}>
                              {vendorInvoiceRaised ? "Initial Estimate Recorded" : "Estimated Amount (Initial)"}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            The amount entered here is an <strong className="text-foreground">estimated budget</strong> for reference. The actual final invoice, AP posting, and approval will be finalized via the <strong className="text-foreground">Vendor Jobs &amp; AP</strong> sub-module. Final settlement is performed under <strong className="text-foreground">Finance &gt; Payable Invoice</strong>.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            <div>
                              <Label className="text-[11px]">Part / Service Scope Description</Label>
                              <Input
                                placeholder="e.g. Copper coil brazing, compressor capacitor"
                                value={vendorPartForm.partDescription}
                                onChange={e => setVendorPartForm(f => ({ ...f, partDescription: e.target.value }))}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div>
                              <Label className="text-[11px]">Estimated Cost / Quote (QAR)</Label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={vendorPartForm.unitPrice || ""}
                                onChange={e => setVendorPartForm(f => ({ ...f, unitPrice: Number(e.target.value) }))}
                                className="h-8 text-xs font-mono"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-muted-foreground italic">
                              * Final bill settlement processed in Finance &gt; Payable Invoice
                            </span>
                            <Button
                              size="sm"
                              disabled={vendorInvoiceRaised}
                              className="h-8 text-xs bg-violet-600 hover:bg-violet-700 text-white"
                              onClick={() => {
                                if (!vendorPartForm.unitPrice || vendorPartForm.unitPrice <= 0) {
                                  toast.error("Please enter the estimated amount");
                                  return;
                                }
                                handleAddVendorInvoice();
                                setVendorInvoiceRaised(true);
                              }}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              {vendorInvoiceRaised ? "Estimate Linked to AP" : "Record Vendor Estimate to AP"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status & Assignee Update */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <Label className="text-xs">Update Status</Label>
                      <Select value={editStatus || ""} onValueChange={v => setEditStatus(v as any)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {COLUMNS.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Technician / Vendor Assignee</Label>
                      <Input value={editAssignee || ""} onChange={e => setEditAssignee(e.target.value)} className="h-8 text-xs" placeholder="e.g. Faisal Tariq" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter className="mt-2 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>Close</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm" onClick={async () => {
              if (!selectedTicket) return;

              // 1. Process multi-item warehouse parts issuance & stock deduction (deduplicating by partId)
              let issuedSummary: string[] = [];
              let calculatedMaterialsCost = 0;
              const consolidatedSparePartsMap = new Map<string, number>();
              ticketSpareParts.forEach(item => {
                consolidatedSparePartsMap.set(
                  item.partId,
                  (consolidatedSparePartsMap.get(item.partId) || 0) + Number(item.quantity || 1)
                );
              });

              const issuedPartsList: Array<{ partId: string; code: string; name: string; quantity: number; unitCost: number }> = [];

              if (consolidatedSparePartsMap.size > 0) {
                setStockCatalog(prevCatalog => {
                  let updatedCatalog = [...prevCatalog];
                  consolidatedSparePartsMap.forEach((qty, partId) => {
                    const part = updatedCatalog.find(p => p.id === partId);
                    if (part) {
                      updatedCatalog = updatedCatalog.map(p =>
                        p.id === part.id ? { ...p, onHand: Math.max(0, p.onHand - qty) } : p
                      );
                      issuedSummary.push(`${qty}x ${part.name}`);
                      calculatedMaterialsCost += (part.unitCost * qty);
                      issuedPartsList.push({
                        partId: part.id,
                        code: part.code,
                        name: part.name,
                        quantity: qty,
                        unitCost: part.unitCost,
                      });
                    }
                  });
                  return updatedCatalog;
                });

                // Persist parts for this ticket
                setTicketSparePartsMap(prev => ({
                  ...prev,
                  [selectedTicket.id]: ticketSpareParts,
                }));
              }

              // 2. Automatically generate / sync linked Work Order
              const assignedTechnicianOrVendor = editAssignee || selectedTicket.assignee || "Faisal Tariq (Field Lead)";
              const newWoId = `WO-2026-${(workOrders.length + 1).toString().padStart(3, "0")}`;
              const targetProperty = dynamicPropertyList.find(p => selectedTicket.unit_ref && dynamicPropertyUnitsMap[p]?.includes(selectedTicket.unit_ref)) || selectedTicket.unit_ref || "Al Sadd Commercial Tower";

              const newWo: WorkOrder = {
                id: newWoId,
                ticketId: selectedTicket.id,
                title: selectedTicket.title,
                property: targetProperty,
                unitRef: selectedTicket.unit_ref || "General Area",
                category: selectedTicket.category || "General Maintenance",
                priority: selectedTicket.priority as any,
                status: "scheduled",
                assigneeType: "in_house",
                technicianName: assignedTechnicianOrVendor,
                scheduledDate: new Date().toISOString().slice(0, 10),
                labourCost: 150,
                materialsCost: calculatedMaterialsCost > 0 ? calculatedMaterialsCost : 100,
                totalCost: 150 + (calculatedMaterialsCost > 0 ? calculatedMaterialsCost : 100),
                chargebackToTenant: false,
                scopeOfWork: `Executed from Ticket ${selectedTicket.id}: ${editDescription || selectedTicket.description || selectedTicket.title}${
                  issuedSummary.length > 0 ? ` | Issued Spares: ${issuedSummary.join(", ")}` : ""
                }`,
                spareParts: issuedPartsList.length > 0 ? issuedPartsList : undefined,
              };

              setWorkOrders(prev => [newWo, ...prev]);

              // 3. Automated Timeline Audit Log & Copy Ticket Context to Work Order
              const partsNote = issuedSummary.length > 0 ? ` Issued Parts: ${issuedSummary.join(", ")}.` : "";
              const currentTimestamp = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
              const auditLog: TicketCommentItem = {
                id: `tc-save-wo-${Date.now()}`,
                author: role === "admin" ? "Admin Operations" : "Property Manager",
                role: "Property Manager",
                timestamp: currentTimestamp,
                comment: `Updated ticket details & dispatched linked Work Order ${newWoId} to ${assignedTechnicianOrVendor}.${partsNote}`,
              };

              setTicketComments(prev => ({
                ...prev,
                [selectedTicket.id]: [...(prev[selectedTicket.id] || []), auditLog],
              }));

              // Copy existing ticket comments + dispatch log to new work order timeline
              const existingTicketTimeline = ticketComments[selectedTicket.id] || [];
              setWoComments(prev => ({
                ...prev,
                [newWoId]: [
                  ...existingTicketTimeline,
                  {
                    id: `woc-init-${Date.now()}`,
                    author: role === "admin" ? "Admin Operations" : "Property Manager",
                    role: "Property Manager",
                    timestamp: currentTimestamp,
                    comment: `Work Order ${newWoId} initiated and dispatched from Ticket ${selectedTicket.id}.${partsNote}`,
                  }
                ],
              }));

              // Record stock movement log in shared movement register with exact date & time stamp
              if (issuedPartsList.length > 0) {
                try {
                  const existingMovements = JSON.parse(localStorage.getItem("pms_stock_movements") || "[]");
                  const newMovements = issuedPartsList.map((part, idx) => ({
                    id: `mov-${Date.now()}-${idx}`,
                    partCode: part.code,
                    type: "issue_wo",
                    title: `Issue to Work Order #${newWoId}`,
                    subtitle: `${targetProperty} - Maintenance execution`,
                    quantity: -part.quantity,
                    uom: "Nos",
                    date: new Date().toISOString().slice(0, 10),
                    timestamp: currentTimestamp,
                    refNo: newWoId,
                  }));
                  localStorage.setItem("pms_stock_movements", JSON.stringify([...newMovements, ...existingMovements]));
                } catch (e) {
                  console.error("Failed to append stock movements", e);
                }
              }

              // 4. Safe Update Ticket in Supabase & Local State
              const targetStatus = editStatus || "in_progress";

              try {
                await updateMaintenanceTicket(selectedTicket.id, {
                  status: targetStatus as any,
                  assignee: assignedTechnicianOrVendor || null,
                  description: editDescription || null,
                });
              } catch (e) {
                console.warn("Remote Supabase update skipped for local/mock ticket ID:", selectedTicket.id, e);
              }

              // Always update local state seamlessly
              setTickets(prev =>
                prev.map(t =>
                  t.id === selectedTicket.id
                    ? {
                        ...t,
                        status: targetStatus as any,
                        assignee: assignedTechnicianOrVendor,
                        description: editDescription || t.description,
                      }
                    : t
                )
              );

              toast.success(`Saved & dispatched Work Order ${newWoId} linked to Ticket ${selectedTicket.id}`);
              setSelectedTicket(null);
            }}>
              <Wrench className="h-3.5 w-3.5 mr-1" />
              Save Updates & Dispatch Work Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: LOG NEW SERVICE TICKET (WITH ALL REQUIRED FIELDS) ──────── */}
      <Dialog open={showNewTicketModal} onOpenChange={setShowNewTicketModal}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Log Maintenance Service Ticket</DialogTitle>
            <DialogDescription>Create a complaint with property visibility, category, area, and attachments.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5 py-2 text-xs">
            {/* Complaint Visibility */}
            <div>
              <Label className="font-semibold text-foreground">Complaint Visibility *</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div
                  onClick={() => setTicketForm(f => ({ ...f, visibility: "Personal (Only Me)" }))}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2 ${
                    ticketForm.visibility === "Personal (Only Me)" ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20" : "border-border hover:bg-muted/40"
                  }`}
                >
                  <Lock className={`h-4 w-4 mt-0.5 ${ticketForm.visibility === "Personal (Only Me)" ? "text-orange-600" : "text-muted-foreground"}`} />
                  <div>
                    <span className="font-semibold text-foreground block text-[11px]">Personal (Only Me)</span>
                    <span className="text-[10px] text-muted-foreground leading-tight block">Visible only to you & management</span>
                  </div>
                </div>
                <div
                  onClick={() => setTicketForm(f => ({ ...f, visibility: "Community (All)" }))}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2 ${
                    ticketForm.visibility === "Community (All)" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" : "border-border hover:bg-muted/40"
                  }`}
                >
                  <Globe className={`h-4 w-4 mt-0.5 ${ticketForm.visibility === "Community (All)" ? "text-blue-600" : "text-muted-foreground"}`} />
                  <div>
                    <span className="font-semibold text-foreground block text-[11px]">Community (All)</span>
                    <span className="text-[10px] text-muted-foreground leading-tight block">Visible to all property residents</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Property */}
            <div>
              <Label>Property *</Label>
              <SearchableSelect
                value={ticketForm.property}
                onValueChange={(v) => {
                  setTicketForm(f => ({
                    ...f,
                    property: v,
                    unitRef: dynamicPropertyUnitsMap[v]?.[0] || "",
                  }));
                }}
                options={dynamicPropertyList.map(p => ({ label: p, value: p }))}
                placeholder="Select property..."
                searchPlaceholder="Search property..."
                className="mt-1"
              />
            </div>

            {/* Category & Complaint Area */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label>Category *</Label>
                <SearchableSelect
                  value={ticketForm.category}
                  onValueChange={v => setTicketForm(f => ({ ...f, category: v }))}
                  options={TICKET_CATEGORIES.map(cat => ({ label: cat, value: cat }))}
                  placeholder="Select category..."
                  searchPlaceholder="Search category..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Complaint Area *</Label>
                <SearchableSelect
                  value={ticketForm.complaintArea}
                  onValueChange={v => setTicketForm(f => ({ ...f, complaintArea: v }))}
                  options={COMPLAINT_AREAS.map(area => ({ label: area, value: area }))}
                  placeholder="Select area..."
                  searchPlaceholder="Search area..."
                  className="mt-1"
                />
              </div>
            </div>

            {/* Unit Name / Specific Location if Unit or specified */}
            {ticketForm.complaintArea === "Unit (name)" && (
              <div>
                <Label>Unit / Location *</Label>
                <SearchableSelect
                  value={ticketForm.unitRef}
                  onValueChange={v => setTicketForm(f => ({ ...f, unitRef: v }))}
                  options={(dynamicPropertyUnitsMap[ticketForm.property] || []).map(u => ({ label: u, value: u }))}
                  placeholder="Select unit / location..."
                  searchPlaceholder="Search unit (e.g. Apt 1204, Office 402)..."
                  className="mt-1"
                />
              </div>
            )}

            {/* Complaint / Issue Title */}
            <div>
              <Label>Issue Title *</Label>
              <Input
                placeholder="e.g. Water leak under kitchen sink pipe joint"
                value={ticketForm.title}
                onChange={e => setTicketForm(f => ({ ...f, title: e.target.value }))}
                className="h-8 text-xs mt-1"
              />
            </div>

            {/* Mandatory Description */}
            <div>
              <Label className="flex items-center justify-between">
                <span>Mandatory Detailed Description *</span>
                <span className="text-[10px] text-red-500 font-normal">Required</span>
              </Label>
              <Textarea
                placeholder="Provide detailed description of the symptoms, noise, water leakage severity, exact room location..."
                value={ticketForm.description}
                onChange={e => setTicketForm(f => ({ ...f, description: e.target.value }))}
                className="text-xs min-h-[70px] mt-1"
              />
            </div>

            {/* Urgent Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Label className="font-semibold text-xs cursor-pointer">Urgent / Emergency Fault</Label>
                  {ticketForm.isUrgent && (
                    <Badge className="bg-red-600 text-[9px] px-1 py-0 h-4">EMERGENCY SLA</Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">Toggle on for major water leaks, total power outages, or safety hazards.</p>
              </div>
              <Switch
                checked={ticketForm.isUrgent}
                onCheckedChange={c => setTicketForm(f => ({ ...f, isUrgent: c }))}
              />
            </div>

            {/* Attachments Section */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-foreground">
                <Paperclip className="h-3.5 w-3.5 text-orange-600" /> Attachments & Photos
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter file name or photo name (e.g. pipe_leak_photo.jpg)"
                  value={tempAttachmentName}
                  onChange={e => setTempAttachmentName(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs shrink-0"
                  onClick={() => {
                    if (!tempAttachmentName.trim()) {
                      toast.error("Please enter a file name");
                      return;
                    }
                    setTicketForm(f => ({
                      ...f,
                      attachments: [...f.attachments, { name: tempAttachmentName.trim(), size: "1.8 MB" }],
                    }));
                    setTempAttachmentName("");
                    toast.success("Attachment added to draft ticket");
                  }}
                >
                  <Upload className="h-3.5 w-3.5 mr-1" /> Add File
                </Button>
              </div>

              {ticketForm.attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ticketForm.attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md text-[11px] font-mono border border-border">
                      <File className="h-3 w-3 text-orange-600" />
                      <span>{att.name}</span>
                      <span className="text-[9px] text-muted-foreground">({att.size})</span>
                      <X
                        className="h-3 w-3 text-muted-foreground hover:text-red-600 cursor-pointer ml-1"
                        onClick={() => {
                          setTicketForm(f => ({
                            ...f,
                            attachments: f.attachments.filter((_, i) => i !== idx),
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reported By */}
            <div>
              <Label>Reported By (Contact)</Label>
              <Input
                placeholder="Ahmed Al-Kuwari (+974 5512 3456)"
                value={ticketForm.reportedBy}
                onChange={e => setTicketForm(f => ({ ...f, reportedBy: e.target.value }))}
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTicketModal(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleCreateTicket}>
              Submit Service Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: WORK ORDER DETAILS & COMMENTS TIMELINE ───────────────────── */}
      <Dialog open={!!selectedWoForDetail} onOpenChange={(open) => { if (!open) setSelectedWoForDetail(null); }}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex flex-wrap items-center justify-between gap-3 pr-6 pb-2 border-b">
              <div>
                <DialogTitle className="text-lg font-bold">{selectedWoForDetail?.title}</DialogTitle>
                <DialogDescription className="text-xs flex items-center gap-2 mt-1">
                  <span className="font-mono font-bold text-orange-600">{selectedWoForDetail?.id}</span>
                  <span>·</span>
                  <span>{selectedWoForDetail?.property} ({selectedWoForDetail?.unitRef})</span>
                  <span>·</span>
                  <Badge variant="outline" className="text-[10px]">{selectedWoForDetail?.category}</Badge>
                  {selectedWoForDetail?.ticketId && (
                    <>
                      <span>·</span>
                      <span className="text-muted-foreground font-mono">Linked Ticket: {selectedWoForDetail.ticketId}</span>
                    </>
                  )}
                </DialogDescription>
              </div>

              {/* Interactive Status Changer with Auto Ticket Sync */}
              {selectedWoForDetail && (
                <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-lg border">
                  <span className="text-[11px] font-semibold text-muted-foreground">WO Status:</span>
                  <Select
                    value={selectedWoForDetail.status}
                    onValueChange={(val: WorkOrder["status"]) => handleUpdateWorkOrderStatus(selectedWoForDetail.id, val)}
                  >
                    <SelectTrigger className="h-7 text-xs font-semibold w-36 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dispatched">Dispatched</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed (Resolved)</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  {selectedWoForDetail.status !== "completed" ? (
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                      onClick={() => handleUpdateWorkOrderStatus(selectedWoForDetail.id, "completed")}
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Mark Completed
                    </Button>
                  ) : (
                    <Badge className="bg-emerald-600 text-white text-xs px-2 py-1 gap-1">
                      <CheckCircle className="h-3 w-3" /> Job Completed
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </DialogHeader>

          {selectedWoForDetail && (
            <div className="space-y-4 py-2 text-xs">
              {/* WO Details summary card */}
              <div className="rounded-lg bg-muted/40 p-3.5 space-y-2.5 border border-border">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground">
                  <div>
                    <span className="block text-[10px] uppercase font-semibold">Assigned To</span>
                    <span className="font-medium text-foreground">{selectedWoForDetail.technicianName || selectedWoForDetail.vendorName}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold">Scheduled Date</span>
                    <span className="font-medium text-foreground">{selectedWoForDetail.scheduledDate}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold">Labor + Spares</span>
                    <span className="font-mono font-bold text-foreground">QAR {selectedWoForDetail.totalCost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold">Liability</span>
                    {selectedWoForDetail.chargebackToTenant ? (
                      <span className="font-medium text-rose-600">Tenant Chargeable</span>
                    ) : (
                      <span className="font-medium text-slate-600">Landlord OPEX</span>
                    )}
                  </div>
                </div>
                <div className="pt-2 border-t border-border/40">
                  <span className="font-semibold text-foreground">Scope of Work:</span>
                  <p className="mt-0.5 text-foreground/90 whitespace-pre-wrap leading-relaxed">{selectedWoForDetail.scopeOfWork}</p>
                </div>
              </div>

              {/* Allocated Spare Parts & Consumables with Partial Usage Tracking */}
              {(() => {
                if (!selectedWoForDetail.spareParts || selectedWoForDetail.spareParts.length === 0) return null;
                const woId = selectedWoForDetail.id;
                const consolidatedMap = new Map<string, { partId: string; code: string; name: string; quantity: number; unitCost: number }>();
                selectedWoForDetail.spareParts.forEach(sp => {
                  const key = sp.code || sp.name;
                  const existing = consolidatedMap.get(key);
                  if (existing) {
                    existing.quantity += (sp.quantity || 1);
                  } else {
                    consolidatedMap.set(key, {
                      partId: sp.partId || sp.code || sp.name,
                      code: sp.code,
                      name: sp.name,
                      quantity: sp.quantity || 1,
                      unitCost: sp.unitCost || 0,
                    });
                  }
                });
                const consolidatedList = Array.from(consolidatedMap.values());
                const totalAllocatedCount = consolidatedList.reduce((acc, it) => acc + it.quantity, 0);

                // Compute current consumed count and total material cost based on consumption map
                let totalConsumedCount = 0;
                let calculatedMaterialsCost = 0;
                let hasPartialChanges = false;

                consolidatedList.forEach(sp => {
                  const consumed = woConsumedQtyMap[woId]?.[sp.code] !== undefined
                    ? woConsumedQtyMap[woId][sp.code]
                    : sp.quantity;
                  totalConsumedCount += consumed;
                  calculatedMaterialsCost += (consumed * sp.unitCost);
                  if (consumed !== sp.quantity) {
                    hasPartialChanges = true;
                  }
                });

                const totalReturnedCount = totalAllocatedCount - totalConsumedCount;

                const handleSaveConsumption = () => {
                  const updatedSpareParts = consolidatedList.map(sp => {
                    const consumed = woConsumedQtyMap[woId]?.[sp.code] !== undefined
                      ? woConsumedQtyMap[woId][sp.code]
                      : sp.quantity;
                    return {
                      partId: sp.partId,
                      code: sp.code,
                      name: sp.name,
                      quantity: consumed,
                      unitCost: sp.unitCost,
                    };
                  });

                  // Update stockCatalog by returning unused units to onHand inventory
                  if (totalReturnedCount > 0) {
                    setStockCatalog(prev => prev.map(stock => {
                      const matched = consolidatedList.find(sp => sp.code === stock.code);
                      if (matched) {
                        const consumed = woConsumedQtyMap[woId]?.[matched.code] !== undefined
                          ? woConsumedQtyMap[woId][matched.code]
                          : matched.quantity;
                        const returned = Math.max(0, matched.quantity - consumed);
                        if (returned > 0) {
                          return { ...stock, onHand: stock.onHand + returned };
                        }
                      }
                      return stock;
                    }));
                  }

                  // Update Work Order state
                  const updatedLabourCost = selectedWoForDetail.labourCost || 0;
                  const newTotalCost = updatedLabourCost + calculatedMaterialsCost;

                  setWorkOrders(prev => prev.map(w => {
                    if (w.id === woId) {
                      return {
                        ...w,
                        spareParts: updatedSpareParts,
                        materialsCost: calculatedMaterialsCost,
                        totalCost: newTotalCost,
                      };
                    }
                    return w;
                  }));

                  setSelectedWoForDetail(prev => prev ? {
                    ...prev,
                    spareParts: updatedSpareParts,
                    materialsCost: calculatedMaterialsCost,
                    totalCost: newTotalCost,
                  } : null);

                  // Add timeline log for consumption and stock return
                  const timestamp = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
                  const logDetail = consolidatedList.map(sp => {
                    const consumed = woConsumedQtyMap[woId]?.[sp.code] !== undefined ? woConsumedQtyMap[woId][sp.code] : sp.quantity;
                    const returned = sp.quantity - consumed;
                    return `${sp.name}: ${consumed}/${sp.quantity} consumed (${returned} returned to warehouse)`;
                  }).join(" | ");

                  const consumptionLog: TicketCommentItem = {
                    id: `mat-usage-${Date.now()}`,
                    author: role === "admin" ? "Admin Operations" : "Property Manager (Maintenance Lead)",
                    role: "Property Manager",
                    timestamp: timestamp,
                    comment: `Updated material consumption: ${logDetail}. Billed Material Cost: QAR ${calculatedMaterialsCost.toLocaleString()} (${totalReturnedCount} unused units returned to inventory).`,
                  };

                  setWoComments(prev => ({
                    ...prev,
                    [woId]: [...(prev[woId] || []), consumptionLog],
                  }));

                  toast.success(`Material consumption updated! ${totalReturnedCount} unused units returned to inventory.`);
                };

                return (
                  <div className="rounded-lg border border-border/80 p-3 space-y-2.5 bg-background shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-orange-600" /> Allocated Spare Parts &amp; Material Consumption
                        </h4>
                        <p className="text-[11px] text-muted-foreground">Adjust consumed quantities to bill exact usage and return unused units to warehouse stock.</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 border-orange-200">
                          {totalAllocatedCount} Issued
                        </Badge>
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                          {totalConsumedCount} Consumed
                        </Badge>
                        {totalReturnedCount > 0 && (
                          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                            {totalReturnedCount} Returned to Stock
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 text-[11px]">
                            <TableHead className="py-1 px-2.5 font-semibold">Part Code</TableHead>
                            <TableHead className="py-1 px-2.5 font-semibold">Item Name</TableHead>
                            <TableHead className="py-1 px-2.5 font-semibold text-center">Allocated</TableHead>
                            <TableHead className="py-1 px-2.5 font-semibold text-center">Actual Consumed</TableHead>
                            <TableHead className="py-1 px-2.5 font-semibold text-center">Unused / Return</TableHead>
                            <TableHead className="py-1 px-2.5 font-semibold text-right">Unit Cost (QAR)</TableHead>
                            <TableHead className="py-1 px-2.5 font-semibold text-right">Billed Cost (QAR)</TableHead>
                            <TableHead className="py-1 px-2.5 font-semibold text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {consolidatedList.map((sp, idx) => {
                            const currentConsumed = woConsumedQtyMap[woId]?.[sp.code] !== undefined
                              ? woConsumedQtyMap[woId][sp.code]
                              : sp.quantity;
                            const unusedCount = Math.max(0, sp.quantity - currentConsumed);
                            const billedTotal = currentConsumed * sp.unitCost;

                            return (
                              <TableRow key={idx} className="text-xs">
                                <TableCell className="py-1.5 px-2.5 font-mono font-medium text-orange-600">{sp.code}</TableCell>
                                <TableCell className="py-1.5 px-2.5 font-medium">{sp.name}</TableCell>
                                <TableCell className="py-1.5 px-2.5 font-mono text-center text-muted-foreground font-semibold">
                                  {sp.quantity}
                                </TableCell>
                                <TableCell className="py-1.5 px-2.5 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Input
                                      type="number"
                                      min={0}
                                      max={sp.quantity}
                                      value={currentConsumed}
                                      onChange={(e) => {
                                        const val = Math.min(sp.quantity, Math.max(0, parseInt(e.target.value) || 0));
                                        setWoConsumedQtyMap(prev => ({
                                          ...prev,
                                          [woId]: {
                                            ...(prev[woId] || {}),
                                            [sp.code]: val,
                                          },
                                        }));
                                      }}
                                      className="h-7 w-16 text-center font-mono font-bold text-xs p-1"
                                    />
                                    <span className="text-[10px] text-muted-foreground">/ {sp.quantity}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-1.5 px-2.5 font-mono text-center">
                                  {unusedCount > 0 ? (
                                    <span className="text-blue-600 font-bold">+{unusedCount} returned</span>
                                  ) : (
                                    <span className="text-muted-foreground">0</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-1.5 px-2.5 font-mono text-right">{sp.unitCost.toLocaleString()}</TableCell>
                                <TableCell className="py-1.5 px-2.5 font-mono font-bold text-right text-emerald-600">
                                  {billedTotal.toLocaleString()}
                                </TableCell>
                                <TableCell className="py-1.5 px-2.5 text-right">
                                  {currentConsumed === sp.quantity ? (
                                    <Badge className="bg-emerald-600 text-white text-[10px] font-medium gap-1">
                                      <CheckCircle2 className="h-2.5 w-2.5" /> Fully Consumed
                                    </Badge>
                                  ) : currentConsumed > 0 ? (
                                    <Badge variant="outline" className="text-[10px] text-blue-700 bg-blue-50 border-blue-300 font-medium">
                                      Partially Used ({currentConsumed}/{sp.quantity})
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px] text-slate-600 bg-slate-100 border-slate-300 font-medium">
                                      Returned Unused
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="text-xs text-muted-foreground">
                        <span>Calculated Material Total: </span>
                        <span className="font-mono font-bold text-foreground">QAR {calculatedMaterialsCost.toLocaleString()}</span>
                        {totalReturnedCount > 0 && (
                          <span className="text-blue-600 ml-1 font-medium">({totalReturnedCount} units will return to warehouse stock)</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white gap-1"
                        onClick={handleSaveConsumption}
                      >
                        <CheckCircle className="h-3 w-3" /> Update Consumption &amp; Restock Unused Items
                      </Button>
                    </div>
                  </div>
                );
              })()}

              {/* Work Order Comments & Attachments Timeline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-orange-600" /> Work Order Timeline & Technical Notes
                  </h4>
                  <Badge variant="secondary" className="text-[9px]">
                    {woComments[selectedWoForDetail.id]?.length || 0} updates
                  </Badge>
                </div>

                <div className="rounded-lg border border-border p-3 space-y-2.5 bg-muted/10 max-h-[220px] overflow-y-auto">
                  {(woComments[selectedWoForDetail.id]?.length || 0) === 0 ? (
                    <div className="text-center py-5 text-xs text-muted-foreground">
                      <ClipboardList className="h-5 w-5 mx-auto mb-1 opacity-40" />
                      No field updates logged yet for this work order.
                    </div>
                  ) : (
                    woComments[selectedWoForDetail.id]?.map((cmt) => (
                      <div key={cmt.id} className="p-2.5 rounded-lg bg-background border border-border/70 space-y-1 shadow-sm">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 font-medium">
                            <span className="text-foreground">{cmt.author}</span>
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 bg-blue-50 text-blue-700 border-blue-300">
                              {cmt.role}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">{cmt.timestamp}</span>
                        </div>
                        <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">{cmt.comment}</p>
                        {cmt.attachments && cmt.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {cmt.attachments.map((att, idx) => (
                              <div key={idx} className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-[10px] font-mono text-muted-foreground border border-border">
                                <Paperclip className="h-3 w-3 text-orange-600" />
                                <span>{att.name}</span>
                                <span className="opacity-60">({att.size})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Add Work Order Note Composer */}
                <div className="rounded-lg border border-border/80 p-3 space-y-2 bg-background">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Add Work Order Log & Attachment</span>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Label className="text-[11px] text-muted-foreground">Posting As:</Label>
                      <Badge variant="outline" className="text-[11px] font-medium bg-muted/50 border-border text-foreground px-2 py-0.5">
                        {role === "admin" ? "Admin Operations" : role === "owner" ? "Property Owner" : "Property Manager"}
                      </Badge>
                    </div>
                  </div>
                  <Textarea
                    placeholder="Add diagnostic notes, pressure tests, completed steps..."
                    value={newWoCommentText}
                    onChange={e => setNewWoCommentText(e.target.value)}
                    className="text-xs min-h-[45px]"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-1">
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <Input
                        placeholder="Attach job sheet or photo (e.g. completion_photo.jpg)"
                        value={newWoCommentFile}
                        onChange={e => setNewWoCommentFile(e.target.value)}
                        className="h-7 text-xs font-mono"
                      />
                    </div>
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white shrink-0"
                      onClick={() => handleAddWoComment(selectedWoForDetail.id)}
                    >
                      <Send className="h-3 w-3 mr-1" /> Post Note
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedWoForDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: QUICK PURCHASE REQUEST (PR) GENERATION ──────────────────── */}
      <Dialog open={showProcurePrModal} onOpenChange={setShowProcurePrModal}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Raise Procurement Purchase Request (PR)</DialogTitle>
                <DialogDescription className="text-xs">Order replacement spare parts via the Procurement & Inventory module.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            {/* Item Dropdown from Catalog */}
            <div>
              <Label className="font-semibold text-foreground">Select Catalog Item / Spare Part *</Label>
              <Select
                value={prForm.itemCode}
                onValueChange={(selectedCode) => {
                  const part = stockCatalog.find(p => p.code === selectedCode);
                  if (part) {
                    setPrForm(f => ({
                      ...f,
                      itemCode: part.code,
                      partName: part.name,
                      estimatedCost: part.unitCost,
                    }));
                  }
                }}
              >
                <SelectTrigger className="h-9 text-xs mt-1">
                  <SelectValue placeholder="Select catalog spare item" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {stockCatalog.map(item => (
                    <SelectItem key={item.id} value={item.code}>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground ml-1.5 font-mono text-[11px]">({item.code} · QAR {item.unitCost} / {item.uom})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Item Description (Customizable) */}
            <div>
              <Label className="text-muted-foreground">Item Description & Specification</Label>
              <Input
                value={prForm.partName}
                onChange={e => setPrForm(f => ({ ...f, partName: e.target.value }))}
                placeholder="e.g. AC Air Filter 24x24"
                className="h-8 text-xs mt-1"
              />
            </div>

            {/* SKU and Quantity */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label>Item Code / SKU</Label>
                <Input disabled value={prForm.itemCode} className="h-8 text-xs bg-muted font-mono font-medium mt-1" />
              </div>
              <div>
                <Label>Required Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  value={prForm.qty}
                  onChange={e => setPrForm(f => ({ ...f, qty: Math.max(1, Number(e.target.value)) }))}
                  className="h-8 text-xs font-mono mt-1"
                />
              </div>
            </div>

            {/* Pricing Summary Card */}
            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-lg border border-border bg-muted/20">
              <div>
                <Label className="text-[11px] text-muted-foreground">Estimated Unit Cost</Label>
                <p className="font-mono font-bold text-sm text-foreground mt-0.5">QAR {prForm.estimatedCost}</p>
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground">Total Estimated Value</Label>
                <p className="font-mono font-bold text-sm text-emerald-600 mt-0.5">
                  QAR {(prForm.estimatedCost * prForm.qty).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Destination Property & Unit */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label>Destination Property *</Label>
                <SearchableSelect
                  value={prForm.property}
                  onValueChange={(v) => {
                    setPrForm(f => ({
                      ...f,
                      property: v,
                    }));
                  }}
                  options={dynamicPropertyList.map(p => ({ label: p, value: p }))}
                  placeholder="Select property..."
                  searchPlaceholder="Search property..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Budget Head & Type</Label>
                <Input disabled value="OPEX / Maintenance Items" className="h-8 text-xs bg-muted mt-1" />
              </div>
            </div>

            {/* Notes & Justification */}
            <div>
              <Label>Notes & Restock Justification</Label>
              <Textarea
                placeholder="Explain the urgency or link to active fault tickets..."
                value={prForm.notes}
                onChange={e => setPrForm(f => ({ ...f, notes: e.target.value }))}
                className="text-xs min-h-[60px] mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProcurePrModal(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleCreateProcurementPr}>
              <Send className="h-3.5 w-3.5 mr-1" /> Submit PR to Procurement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: CREATE WORK ORDER ────────────────────────────────────────── */}
      <Dialog open={showNewWoModal} onOpenChange={setShowNewWoModal}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Create & Dispatch Work Order</DialogTitle>
                <DialogDescription className="text-xs">Assign job scope to in-house technician or specialized vendor contractor.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            {/* Work Order Title */}
            <div>
              <Label className="font-semibold text-foreground">Work Order Title / Scope *</Label>
              <Input
                placeholder="e.g. Chiller Condenser Pump Mechanical Seal Replacement"
                value={woForm.title}
                onChange={e => setWoForm(f => ({ ...f, title: e.target.value }))}
                className="h-8 text-xs mt-1"
              />
            </div>

            {/* Property & Unit */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label>Property *</Label>
                <SearchableSelect
                  value={woForm.property}
                  onValueChange={(v) => {
                    setWoForm(f => ({
                      ...f,
                      property: v,
                      unitRef: dynamicPropertyUnitsMap[v]?.[0] || "",
                    }));
                  }}
                  options={dynamicPropertyList.map(p => ({ label: p, value: p }))}
                  placeholder="Select property..."
                  searchPlaceholder="Search property..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Unit / Location *</Label>
                <SearchableSelect
                  value={woForm.unitRef}
                  onValueChange={v => setWoForm(f => ({ ...f, unitRef: v }))}
                  options={(dynamicPropertyUnitsMap[woForm.property] || []).map(u => ({ label: u, value: u }))}
                  placeholder="Select unit..."
                  searchPlaceholder="Search unit..."
                  className="mt-1"
                />
              </div>
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label>Category *</Label>
                <SearchableSelect
                  value={woForm.category}
                  onValueChange={v => setWoForm(f => ({ ...f, category: v }))}
                  options={TICKET_CATEGORIES.map(cat => ({ label: cat, value: cat }))}
                  placeholder="Select category..."
                  searchPlaceholder="Search category..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Priority *</Label>
                <Select value={woForm.priority} onValueChange={v => setWoForm(f => ({ ...f, priority: v as any }))}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Standard)</SelectItem>
                    <SelectItem value="medium">Medium (48h SLA)</SelectItem>
                    <SelectItem value="high">High (24h SLA)</SelectItem>
                    <SelectItem value="urgent">Urgent (Emergency)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assignee Sourcing Type */}
            <div>
              <Label className="font-semibold text-foreground">Assignee Dispatch Mode *</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div
                  onClick={() => setWoForm(f => ({ ...f, assigneeType: "in_house" }))}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2 ${
                    woForm.assigneeType === "in_house" ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20" : "border-border hover:bg-muted/40"
                  }`}
                >
                  <Users className={`h-4 w-4 mt-0.5 ${woForm.assigneeType === "in_house" ? "text-orange-600" : "text-muted-foreground"}`} />
                  <div>
                    <span className="font-semibold text-foreground block text-[11px]">In-House Team</span>
                    <span className="text-[10px] text-muted-foreground leading-tight block">Internal field technician</span>
                  </div>
                </div>
                <div
                  onClick={() => setWoForm(f => ({ ...f, assigneeType: "vendor" }))}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2 ${
                    woForm.assigneeType === "vendor" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" : "border-border hover:bg-muted/40"
                  }`}
                >
                  <Building2 className={`h-4 w-4 mt-0.5 ${woForm.assigneeType === "vendor" ? "text-blue-600" : "text-muted-foreground"}`} />
                  <div>
                    <span className="font-semibold text-foreground block text-[11px]">Outsourced Vendor</span>
                    <span className="text-[10px] text-muted-foreground leading-tight block">Specialist 3rd-party vendor</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Technician / Vendor Selection */}
            <div>
              <Label>{woForm.assigneeType === "in_house" ? "Assign In-House Technician" : "Assign Specialist Contractor"}</Label>
              {woForm.assigneeType === "in_house" ? (
                <Select value={woForm.technicianName} onValueChange={v => setWoForm(f => ({ ...f, technicianName: v }))}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {technicians.map(t => (
                      <SelectItem key={t.id} value={t.name}>
                        {t.name} ({t.specialty}) · {t.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={woForm.vendorName} onValueChange={v => setWoForm(f => ({ ...f, vendorName: v }))}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Carrier Middle East Qatar">Carrier Middle East Qatar</SelectItem>
                    <SelectItem value="Qatar Facilities Management (QFM)">Qatar Facilities Management (QFM)</SelectItem>
                    <SelectItem value="Al Mana Engineering & Maintenance">Al Mana Engineering & Maintenance</SelectItem>
                    <SelectItem value="Otis Elevator Qatar WLL">Otis Elevator Qatar WLL</SelectItem>
                    <SelectItem value="Doha Fire Protection Solutions">Doha Fire Protection Solutions</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Estimated Costs or In-House Team Payroll / Inventory Notice */}
            {woForm.assigneeType === "in_house" ? (
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
                  <Users className="h-3.5 w-3.5 text-blue-600" /> In-House Field Team Execution
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Technician labor is covered under internal company payroll / HRMS. Materials are issued directly from warehouse stock. If materials or services are chargeable to tenant, record a line in <strong className="text-foreground font-medium">Vendor Jobs &amp; AP</strong>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label>Est. Labor Cost (QAR)</Label>
                  <Input
                    type="number"
                    value={woForm.labourCost}
                    onChange={e => setWoForm(f => ({ ...f, labourCost: Number(e.target.value) }))}
                    className="h-8 text-xs font-mono mt-1"
                  />
                </div>
                <div>
                  <Label>Est. Materials Cost (QAR)</Label>
                  <Input
                    type="number"
                    value={woForm.materialsCost}
                    onChange={e => setWoForm(f => ({ ...f, materialsCost: Number(e.target.value) }))}
                    className="h-8 text-xs font-mono mt-1"
                  />
                </div>
              </div>
            )}

            {/* Scope of Work */}
            <div>
              <Label>Detailed Scope of Work & Procedures</Label>
              <Textarea
                placeholder="Specific maintenance instructions, safety procedures, parts required..."
                value={woForm.scopeOfWork}
                onChange={e => setWoForm(f => ({ ...f, scopeOfWork: e.target.value }))}
                className="text-xs min-h-[60px] mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewWoModal(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleCreateWorkOrder}>
              <Wrench className="h-3.5 w-3.5 mr-1" /> Dispatch Work Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: ADD PPM SCHEDULE ─────────────────────────────────────────── */}
      <Dialog open={showNewPpmModal} onOpenChange={setShowNewPpmModal}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Register Preventive Maintenance (PPM) Schedule</DialogTitle>
                <DialogDescription className="text-xs">Set up statutory and routine recurring maintenance schedules for building assets.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div>
              <Label className="font-semibold text-foreground">PPM Routine Title *</Label>
              <Input
                placeholder="e.g. Bi-Annual Fire Alarm & Smoke Detector System Certification"
                value={ppmForm.title}
                onChange={e => setPpmForm(f => ({ ...f, title: e.target.value }))}
                className="h-8 text-xs mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label>Target Property *</Label>
                <SearchableSelect
                  value={ppmForm.property}
                  onValueChange={(v) => {
                    setPpmForm(f => ({
                      ...f,
                      property: v,
                      unitRef: dynamicPropertyUnitsMap[v]?.[0] || "Unit 101",
                    }));
                  }}
                  options={dynamicPropertyList.map(p => ({ label: p, value: p }))}
                  placeholder="Select property..."
                  searchPlaceholder="Search property..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Coverage Scope *</Label>
                <Select
                  value={ppmForm.scopeType}
                  onValueChange={(v: "property" | "unit" | "common_area") => {
                    setPpmForm(f => ({
                      ...f,
                      scopeType: v,
                      unitRef: v === "property" ? "Entire Building / Common MEP" : (dynamicPropertyUnitsMap[f.property]?.[0] || "Unit 101"),
                    }));
                  }}
                >
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property">Entire Property (Building-Wide)</SelectItem>
                    <SelectItem value="unit">Specific Unit</SelectItem>
                    <SelectItem value="common_area">Common Area Facility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target Unit if scope is unit or common area */}
            {ppmForm.scopeType !== "property" && (
              <div>
                <Label>{ppmForm.scopeType === "unit" ? "Specific Unit *" : "Facility / Common Area Location *"}</Label>
                <SearchableSelect
                  value={ppmForm.unitRef}
                  onValueChange={v => setPpmForm(f => ({ ...f, unitRef: v }))}
                  options={(dynamicPropertyUnitsMap[ppmForm.property] || []).map(u => ({ label: u, value: u }))}
                  placeholder="Select unit or area..."
                  searchPlaceholder="Search unit..."
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label>Asset Category *</Label>
              <SearchableSelect
                value={ppmForm.category}
                onValueChange={v => setPpmForm(f => ({ ...f, category: v }))}
                options={[
                  { label: "HVAC & Central Chillers", value: "HVAC" },
                  { label: "Elevators & Escalators", value: "Elevator" },
                  { label: "Fire Protection & Safety Systems", value: "Fire Safety" },
                  { label: "Plumbing, Pumps & Drainage", value: "Plumbing" },
                  { label: "Electrical Switchgear & BMS", value: "Electrical" },
                  { label: "Civil & Structural", value: "Civil" },
                  { label: "Carpenter & Joinery", value: "Carpenter" },
                  { label: "Painter & Surface Finishing", value: "Painter" },
                  { label: "CCTV & Access Control", value: "CCTV" },
                  { label: "Intercom & Communication", value: "Intercom" },
                  { label: "Housekeeping & Sanitation", value: "Housekeeping" },
                  { label: "Door & Lock Systems", value: "Door Issue" },
                  { label: "Security Systems", value: "Security" },
                  { label: "Mason & Grouting", value: "Mason" },
                  { label: "General Facility", value: "General" },
                ]}
                placeholder="Select category..."
                searchPlaceholder="Search category..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label>Frequency Cycle</Label>
                <Select value={ppmForm.frequency} onValueChange={v => setPpmForm(f => ({ ...f, frequency: v as any }))}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Semi-Annual">Semi-Annual</SelectItem>
                    <SelectItem value="Annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Next Inspection Due Date</Label>
                <Input
                  type="date"
                  value={ppmForm.nextDueDate}
                  onChange={e => setPpmForm(f => ({ ...f, nextDueDate: e.target.value }))}
                  className="h-8 text-xs font-mono mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label>Assigned Vendor Specialist</Label>
                <Select value={ppmForm.assignedVendorName} onValueChange={v => setPpmForm(f => ({ ...f, assignedVendorName: v }))}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Carrier Middle East Qatar">Carrier Middle East Qatar</SelectItem>
                    <SelectItem value="Otis Elevator Qatar WLL">Otis Elevator Qatar WLL</SelectItem>
                    <SelectItem value="Doha Fire Protection Solutions">Doha Fire Protection Solutions</SelectItem>
                    <SelectItem value="Qatar Facilities Management (QFM)">Qatar Facilities Management (QFM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Est. Cost per Cycle (QAR)</Label>
                <Input
                  type="number"
                  value={ppmForm.estimatedCost}
                  onChange={e => setPpmForm(f => ({ ...f, estimatedCost: Number(e.target.value) }))}
                  className="h-8 text-xs font-mono mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Checklist Inspection Checkpoints (comma separated)</Label>
              <Textarea
                placeholder="e.g. Compressor oil check, condenser coil cleaning, water flow test"
                value={ppmForm.checklist}
                onChange={e => setPpmForm(f => ({ ...f, checklist: e.target.value }))}
                className="text-xs min-h-[55px] mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPpmModal(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleCreatePpm}>
              <Calendar className="h-3.5 w-3.5 mr-1" /> Save PPM Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: ADD FIELD TECHNICIAN ─────────────────────────────────────── */}
      <Dialog open={showNewTechModal} onOpenChange={setShowNewTechModal}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Add In-House Field Technician</DialogTitle>
                <DialogDescription className="text-xs">Register a certified technician to the internal facilities maintenance roster.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div>
              <Label className="font-semibold text-foreground">Technician Full Name *</Label>
              <Input
                placeholder="e.g. Tariq Al-Hassan"
                value={techForm.name}
                onChange={e => setTechForm(f => ({ ...f, name: e.target.value }))}
                className="h-8 text-xs mt-1"
              />
            </div>

            <div>
              <Label>Primary Trade Specialty *</Label>
              <Select value={techForm.specialty} onValueChange={v => setTechForm(f => ({ ...f, specialty: v }))}>
                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HVAC & Chiller Plants">HVAC & Chiller Plants</SelectItem>
                  <SelectItem value="Plumbing & Drainage">Plumbing & Drainage</SelectItem>
                  <SelectItem value="Electrical & BMS Automation">Electrical & BMS Automation</SelectItem>
                  <SelectItem value="Carpentry & Locks">Carpentry & Locks</SelectItem>
                  <SelectItem value="Multi-Skilled Generalist">Multi-Skilled Generalist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label>Direct Contact Phone</Label>
                <Input
                  placeholder="+974 5511 2233"
                  value={techForm.phone}
                  onChange={e => setTechForm(f => ({ ...f, phone: e.target.value }))}
                  className="h-8 text-xs font-mono mt-1"
                />
              </div>
              <div>
                <Label>Initial Availability Status</Label>
                <Select value={techForm.status} onValueChange={v => setTechForm(f => ({ ...f, status: v as any }))}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available (Standby)</SelectItem>
                    <SelectItem value="On-Site">On-Site Active</SelectItem>
                    <SelectItem value="On-Leave">On-Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Email Address</Label>
              <Input
                placeholder="technician@pms.qa"
                value={techForm.email}
                onChange={e => setTechForm(f => ({ ...f, email: e.target.value }))}
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTechModal(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleCreateTechnician}>
              <UserCheck className="h-3.5 w-3.5 mr-1" /> Add to Team Roster
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: RECORD VENDOR AP INVOICE (STEPPER WIZARD) ────────────────── */}
      <Dialog
        open={showVendorInvoiceModal}
        onOpenChange={(open) => {
          setShowVendorInvoiceModal(open);
          if (open) setVendorInvStep(1);
        }}
      >
        <DialogContent
          className="max-w-lg p-0 overflow-hidden flex flex-col"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Modal Header */}
          <DialogHeader className="p-4 pb-3 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-sm font-bold">Record Vendor AP Invoice &amp; GL Mapping</DialogTitle>
                  <DialogDescription className="text-[11px]">Synchronize invoice directly with Finance AP &amp; General Ledger.</DialogDescription>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] bg-background">
                Step {vendorInvStep} of 3
              </Badge>
            </div>

            {/* Stepper Tabs Bar */}
            <div className="grid grid-cols-3 gap-1.5 pt-2">
              <div
                onClick={() => setVendorInvStep(1)}
                className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded text-[11px] font-medium cursor-pointer transition ${
                  vendorInvStep === 1
                    ? "bg-orange-600 text-white font-bold shadow-sm"
                    : vendorInvStep > 1
                    ? "bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-200"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span>1. Vendor &amp; Location</span>
              </div>
              <div
                onClick={() => {
                  if (vendorInvModalForm.invoiceNo.trim()) setVendorInvStep(2);
                }}
                className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded text-[11px] font-medium cursor-pointer transition ${
                  vendorInvStep === 2
                    ? "bg-orange-600 text-white font-bold shadow-sm"
                    : vendorInvStep > 2
                    ? "bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-200"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span>2. Pricing &amp; GL</span>
              </div>
              <div
                onClick={() => {
                  if (vendorInvModalForm.invoiceNo.trim() && Number(vendorInvModalForm.amount) > 0) setVendorInvStep(3);
                }}
                className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded text-[11px] font-medium cursor-pointer transition ${
                  vendorInvStep === 3
                    ? "bg-orange-600 text-white font-bold shadow-sm"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span>3. Scope &amp; Bill</span>
              </div>
            </div>
          </DialogHeader>

          {/* Stepper Body Container (Compact, Fixed, No scroll required) */}
          <div className="p-4 text-xs">
            {/* ── STEP 1: VENDOR & LOCATION ── */}
            {vendorInvStep === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label className="font-semibold text-foreground text-[11px]">Certified Vendor *</Label>
                    <Select value={vendorInvModalForm.vendorName} onValueChange={v => setVendorInvModalForm(f => ({ ...f, vendorName: v }))}>
                      <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Carrier Middle East Qatar">Carrier Middle East Qatar</SelectItem>
                        <SelectItem value="Qatar Facilities Management (QFM)">Qatar Facilities Management (QFM)</SelectItem>
                        <SelectItem value="Al Mana Engineering & Maintenance">Al Mana Engineering & Maintenance</SelectItem>
                        <SelectItem value="Otis Elevator Qatar WLL">Otis Elevator Qatar WLL</SelectItem>
                        <SelectItem value="Doha Fire Protection Solutions">Doha Fire Protection Solutions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-semibold text-foreground text-[11px]">Vendor Invoice / DN # *</Label>
                    <Input
                      placeholder="INV-2026-901"
                      value={vendorInvModalForm.invoiceNo}
                      onChange={e => setVendorInvModalForm(f => ({ ...f, invoiceNo: e.target.value }))}
                      className="h-8 text-xs font-mono mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label className="text-[11px]">Property *</Label>
                    <SearchableSelect
                      value={vendorInvModalForm.property}
                      onValueChange={(v) => {
                        setVendorInvModalForm(f => ({
                          ...f,
                          property: v,
                          unitRef: dynamicPropertyUnitsMap[v]?.[0] || "",
                        }));
                      }}
                      options={dynamicPropertyList.map(p => ({ label: p, value: p }))}
                      placeholder="Select property..."
                      searchPlaceholder="Search property..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">Unit / Location *</Label>
                    <SearchableSelect
                      value={vendorInvModalForm.unitRef}
                      onValueChange={v => setVendorInvModalForm(f => ({ ...f, unitRef: v }))}
                      options={(dynamicPropertyUnitsMap[vendorInvModalForm.property] || []).map(u => ({ label: u, value: u }))}
                      placeholder="Select unit..."
                      searchPlaceholder="Search unit..."
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label className="text-[11px] font-semibold text-foreground">Payment Terms *</Label>
                    <Select
                      value={vendorInvModalForm.paymentTerms || "Net 30 Days"}
                      onValueChange={v => setVendorInvModalForm(f => ({ ...f, paymentTerms: v }))}
                    >
                      <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
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
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold text-foreground">Settlement Mode *</Label>
                    <Select
                      value={vendorInvModalForm.settlementMode || "Bank Wire / Electronic Transfer (QNB)"}
                      onValueChange={v => setVendorInvModalForm(f => ({ ...f, settlementMode: v, paymentMode: v }))}
                    >
                      <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Wire / Electronic Transfer (QNB)">Bank Wire (QNB)</SelectItem>
                        <SelectItem value="CBQ Electronic Wire">CBQ Electronic Wire</SelectItem>
                        <SelectItem value="Corporate Cheque on Delivery">Corporate Cheque on Delivery</SelectItem>
                        <SelectItem value="Direct Debit / Online Portal">Direct Debit / Online Portal</SelectItem>
                        <SelectItem value="Cash in Hand / Petty Cash">Cash in Hand / Petty Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: PRICING, TAX & GL MAPPING ── */}
            {vendorInvStep === 2 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label className="font-semibold text-foreground text-[11px]">Invoice Base Amount (QAR) *</Label>
                    <Input
                      type="number"
                      value={vendorInvModalForm.amount}
                      onChange={e => setVendorInvModalForm(f => ({ ...f, amount: Number(e.target.value) }))}
                      className="h-8 text-xs font-mono font-bold text-foreground mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-foreground text-[11px]">Tax / VAT Rate (%)</Label>
                    <Select
                      value={String(vendorInvModalForm.taxRate || 0)}
                      onValueChange={v => setVendorInvModalForm(f => ({ ...f, taxRate: Number(v) }))}
                    >
                      <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0% (Zero Rated / Exempt)</SelectItem>
                        <SelectItem value="5">5% VAT / Tax</SelectItem>
                        <SelectItem value="10">10% Standard Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Financial Totals Preview */}
                {(() => {
                  const base = Number(vendorInvModalForm.amount || 0);
                  const rate = Number(vendorInvModalForm.taxRate || 0);
                  const tax = base * (rate / 100);
                  const total = base + tax;
                  return (
                    <div className="p-2 rounded-lg bg-muted/40 border border-border grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase">Base Amount</span>
                        <p className="font-mono font-bold text-foreground">QAR {base.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase">Tax ({rate}%)</span>
                        <p className="font-mono font-medium text-amber-600">QAR {tax.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase">Net Payable AP</span>
                        <p className="font-mono font-bold text-emerald-600">QAR {total.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label className="font-semibold text-foreground text-[11px]">General Ledger (GL) Account *</Label>
                    <Select
                      value={vendorInvModalForm.glAccount}
                      onValueChange={v => setVendorInvModalForm(f => ({ ...f, glAccount: v }))}
                    >
                      <SelectTrigger className="h-8 text-xs mt-1 font-mono"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MAINTENANCE_GL_ACCOUNTS.map(gl => (
                          <SelectItem key={gl.code} value={gl.code}>
                            {gl.code} - {gl.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-semibold text-foreground text-[11px]">Cost Center Allocation *</Label>
                    <Select
                      value={vendorInvModalForm.costCenter}
                      onValueChange={v => setVendorInvModalForm(f => ({ ...f, costCenter: v }))}
                    >
                      <SelectTrigger className="h-8 text-xs mt-1 font-mono"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {COST_CENTERS.map(cc => (
                          <SelectItem key={cc.code} value={cc.code}>
                            {cc.code} - {cc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: SCOPE & BILL ATTACHMENT ── */}
            {vendorInvStep === 3 && (
              <div className="space-y-3">
                <div>
                  <Label className="text-[11px]">Parts &amp; Material Supplied</Label>
                  <Input
                    placeholder="e.g. Replacement sensor and filter assembly"
                    value={vendorInvModalForm.partsDescription}
                    onChange={e => setVendorInvModalForm(f => ({ ...f, partsDescription: e.target.value }))}
                    className="h-8 text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-[11px]">Specialist Labor &amp; Services Performed</Label>
                  <Input
                    placeholder="e.g. Emergency on-site troubleshooting"
                    value={vendorInvModalForm.labourDescription}
                    onChange={e => setVendorInvModalForm(f => ({ ...f, labourDescription: e.target.value }))}
                    className="h-8 text-xs mt-1"
                  />
                </div>

                {/* Vendor Receipt / Tax Invoice Attachment Upload */}
                <div className="p-2.5 rounded-lg border border-dashed border-primary/40 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                      <Upload className="h-3.5 w-3.5 text-primary" /> Vendor Bill / Scanned Invoice Document *
                    </Label>
                    <span className="text-[10px] text-muted-foreground">PDF, PNG, JPG up to 10MB</span>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <label className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-input bg-background hover:bg-muted/40 cursor-pointer text-xs transition">
                      <FileUp className="h-3.5 w-3.5 text-orange-600" />
                      <span className="truncate text-foreground font-mono text-[11px]">
                        {vendorInvModalForm.receiptFileName || "Click to browse & upload file..."}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setVendorInvModalForm(f => ({
                              ...f,
                              receiptFileName: file.name,
                              receiptAttachment: file.name
                            }));
                            toast.success(`Attached "${file.name}"`);
                          }
                        }}
                      />
                    </label>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs shrink-0 gap-1 font-medium"
                      onClick={() => {
                        const sampleName = `Vendor_Bill_${vendorInvModalForm.invoiceNo || 'INV'}_Scanned.pdf`;
                        setVendorInvModalForm(f => ({ ...f, receiptFileName: sampleName, receiptAttachment: sampleName }));
                        toast.success("Sample invoice PDF attached");
                      }}
                    >
                      <Paperclip className="h-3.5 w-3.5" /> Auto-Attach
                    </Button>
                  </div>

                  {vendorInvModalForm.receiptFileName && (
                    <div className="flex items-center justify-between p-1.5 px-2.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono border border-emerald-300 dark:border-emerald-800">
                      <span className="flex items-center gap-1.5 truncate">
                        <FileCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        {vendorInvModalForm.receiptFileName}
                      </span>
                      <button
                        type="button"
                        onClick={() => setVendorInvModalForm(f => ({ ...f, receiptFileName: "", receiptAttachment: "" }))}
                        className="text-[10px] text-destructive hover:underline ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-900 dark:text-blue-200 flex gap-2 items-start">
                  <Info className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Finance Routing:</strong> Registered in <strong>Submitted (Unpaid)</strong> status. Payment and official receipt are settled by the Finance team via <strong>Finance &rarr; Payable Invoice</strong>.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Footer Controls */}
          <DialogFooter className="p-3 border-t bg-muted/20 flex flex-row justify-between items-center sm:justify-between w-full">
            <div>
              {vendorInvStep > 1 ? (
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setVendorInvStep(s => s - 1)}>
                  Back
                </Button>
              ) : (
                <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setShowVendorInvoiceModal(false)}>
                  Cancel
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {vendorInvStep < 3 ? (
                <Button
                  type="button"
                  size="sm"
                  className="h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white gap-1"
                  onClick={() => {
                    if (vendorInvStep === 1) {
                      if (!vendorInvModalForm.invoiceNo.trim()) {
                        toast.error("Please enter a Vendor Invoice #");
                        return;
                      }
                      setVendorInvStep(2);
                    } else if (vendorInvStep === 2) {
                      if (Number(vendorInvModalForm.amount) <= 0) {
                        toast.error("Please enter a valid base amount");
                        return;
                      }
                      setVendorInvStep(3);
                    }
                  }}
                >
                  Next Step <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white gap-1.5"
                  onClick={handleCreateVendorInvoiceFromModal}
                >
                  <Send className="h-3.5 w-3.5" /> Submit to Finance AP
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: CREATE TENANT CHARGEBACK NOTICE ─────────────────────────── */}
      <Dialog open={showNewChargebackModal} onOpenChange={setShowNewChargebackModal}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Issue Tenant Chargeback Notice</DialogTitle>
                <DialogDescription className="text-xs">Bill tenant or deduct from security deposit for accidental unit damage repairs.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            {/* Row 1: WO Reference & Tenant */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="font-semibold text-foreground">Referenced Work Order *</Label>
                <Select
                  value={chargebackForm.workOrderId}
                  onValueChange={v => {
                    const wo = workOrders.find(w => w.id === v);
                    setChargebackForm(f => ({
                      ...f,
                      workOrderId: v,
                      property: wo?.property || f.property,
                      unitRef: wo?.unitRef || f.unitRef,
                      laborCost: wo?.labourCost || f.laborCost,
                      materialsCost: wo?.materialsCost || f.materialsCost,
                      amount: wo?.totalCost || f.amount,
                    }));
                  }}
                >
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {workOrders.filter(w => w.chargebackToTenant).map(w => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.id} — {w.unitRef} ({w.vendorName || w.technicianName})
                      </SelectItem>
                    ))}
                    {workOrders.filter(w => !w.chargebackToTenant).map(w => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.id} — {w.unitRef}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-semibold text-foreground">Tenant Name & Unit *</Label>
                <Input
                  value={chargebackForm.tenantName}
                  onChange={e => setChargebackForm(f => ({ ...f, tenantName: e.target.value }))}
                  placeholder="e.g. Salim Mansour (Apt 1204)"
                  className="h-8 text-xs mt-1"
                />
              </div>
            </div>

            {/* Row 2: Property & Damage Category */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label>Property & Unit Ref</Label>
                <div className="flex gap-1 mt-1">
                  <Input
                    value={chargebackForm.property}
                    onChange={e => setChargebackForm(f => ({ ...f, property: e.target.value }))}
                    className="h-8 text-xs flex-1"
                    placeholder="Property name"
                  />
                  <Input
                    value={chargebackForm.unitRef}
                    onChange={e => setChargebackForm(f => ({ ...f, unitRef: e.target.value }))}
                    className="h-8 text-xs w-24"
                    placeholder="Unit ref"
                  />
                </div>
              </div>
              <div>
                <Label>Damage / Chargeback Category</Label>
                <Select value={chargebackForm.damageCategory} onValueChange={v => setChargebackForm(f => ({ ...f, damageCategory: v }))}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Move-in / Move-out Accidental Damage">Move-in / Move-out Accidental Damage</SelectItem>
                    <SelectItem value="Tenant Negligence / Wilful Damage">Tenant Negligence / Wilful Damage</SelectItem>
                    <SelectItem value="Unauthorised Modifications">Unauthorised Modifications</SelectItem>
                    <SelectItem value="End of Lease Unit Restoration">End of Lease Unit Restoration</SelectItem>
                    <SelectItem value="Appliance / Fixture Misuse">Appliance / Fixture Misuse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Cost Breakdown */}
            <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-2">
              <p className="font-semibold text-foreground text-[11px] uppercase tracking-wide">Cost Breakdown</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px]">Labour Cost (QAR)</Label>
                  <Input
                    type="number"
                    value={chargebackForm.laborCost}
                    onChange={e => {
                      const labor = Number(e.target.value);
                      const mat = Number(chargebackForm.materialsCost);
                      const admin = (labor + mat) * (Number(chargebackForm.adminFeeRate) / 100);
                      setChargebackForm(f => ({ ...f, laborCost: labor, amount: labor + mat + admin }));
                    }}
                    className="h-8 text-xs font-mono mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Materials Cost (QAR)</Label>
                  <Input
                    type="number"
                    value={chargebackForm.materialsCost}
                    onChange={e => {
                      const mat = Number(e.target.value);
                      const labor = Number(chargebackForm.laborCost);
                      const admin = (labor + mat) * (Number(chargebackForm.adminFeeRate) / 100);
                      setChargebackForm(f => ({ ...f, materialsCost: mat, amount: labor + mat + admin }));
                    }}
                    className="h-8 text-xs font-mono mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Admin Fee %</Label>
                  <Input
                    type="number"
                    value={chargebackForm.adminFeeRate}
                    onChange={e => {
                      const rate = Number(e.target.value);
                      const labor = Number(chargebackForm.laborCost);
                      const mat = Number(chargebackForm.materialsCost);
                      const admin = (labor + mat) * (rate / 100);
                      setChargebackForm(f => ({ ...f, adminFeeRate: rate, amount: labor + mat + admin }));
                    }}
                    className="h-8 text-xs font-mono mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                <span className="text-[11px] font-semibold text-foreground">Total Chargeback Amount</span>
                <span className="font-mono font-bold text-rose-600 text-sm">QAR {Number(chargebackForm.amount).toLocaleString()}</span>
              </div>
            </div>

            {/* Row 4: Recovery Mode & Inspection Ref */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="font-semibold text-foreground">Recovery Mode</Label>
                <Select value={chargebackForm.recoveryMode} onValueChange={v => setChargebackForm(f => ({ ...f, recoveryMode: v }))}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Security Deposit Deduction">Security Deposit Deduction</SelectItem>
                    <SelectItem value="Direct Invoice / Payment Link">Direct Invoice / AR Invoice</SelectItem>
                    <SelectItem value="Add to Next Month Rent">Add to Next Month Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Inspection / Evidence Ref</Label>
                <Input
                  value={chargebackForm.inspectionRef}
                  onChange={e => setChargebackForm(f => ({ ...f, inspectionRef: e.target.value }))}
                  placeholder="e.g. INSP-2026-881"
                  className="h-8 text-xs mt-1"
                />
              </div>
            </div>

            {/* GL Preview */}
            <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 space-y-2 text-[11px]">
              <p className="font-semibold text-blue-700 dark:text-blue-300">📘 Auto-Generated GL Journal</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Dr.</span>{" "}
                    {chargebackForm.recoveryMode === "Security Deposit Deduction"
                      ? "21200001 - Tenant Security Deposits Held"
                      : "11200001 - Tenant Accounts Receivable"}
                  </span>
                  <span className="font-mono font-bold text-foreground">QAR {Number(chargebackForm.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">Cr.</span>{" "}
                    52100008 - Tenant Recoverable Damage &amp; Chargeback Clearing
                  </span>
                  <span className="font-mono font-bold text-foreground">QAR {Number(chargebackForm.amount).toLocaleString()}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground pt-1 border-t border-blue-200/60 dark:border-blue-800/60">
                {chargebackForm.recoveryMode === "Security Deposit Deduction"
                  ? "Security deposit escrow balance will be reduced. No AR invoice generated."
                  : "An AR Receivable invoice will be created in Finance and sent to the tenant."}
              </p>
            </div>

            {/* Reason */}
            <div>
              <Label>Reason & Damage Evidence Details</Label>
              <Textarea
                placeholder="Explain tenant liability, inspection report references, and move-in/out check comparisons..."
                value={chargebackForm.reason}
                onChange={e => setChargebackForm(f => ({ ...f, reason: e.target.value }))}
                className="text-xs min-h-[55px] mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewChargebackModal(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleCreateChargeback}>
              <Send className="h-3.5 w-3.5 mr-1" /> Post Chargeback & GL Journal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: GENERATE / DISPATCH WORK ORDER FROM PPM ─────────────────── */}
      <Dialog open={!!selectedPpmForWo} onOpenChange={(open) => { if (!open) setSelectedPpmForWo(null); }}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Generate Work Order from PPM Routine</DialogTitle>
                <DialogDescription className="text-xs">
                  Review schedule parameters, assigned contractor/team, checklist, and dispatch automated Work Order.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedPpmForWo && (
            <div className="space-y-3.5 py-2 text-xs">
              {/* Summary Card */}
              <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-orange-600">{selectedPpmForWo.id}</span>
                  <Badge variant="secondary" className="text-[10px]">{selectedPpmForWo.frequency}</Badge>
                </div>
                <div className="text-foreground font-semibold text-sm">{selectedPpmForWo.title}</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <div>
                    <span className="font-semibold text-foreground">Property:</span> {selectedPpmForWo.property}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Scope:</span>{" "}
                    {selectedPpmForWo.scopeType === "property" ? "Entire Property" : selectedPpmForWo.unitRef || "Specific Unit"}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Category:</span> {selectedPpmForWo.category}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Est. Budget:</span>{" "}
                    <span className="font-mono font-bold text-foreground">QAR {selectedPpmForWo.estimatedCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Work Order Title */}
              <div>
                <Label className="font-semibold text-foreground">Work Order Title *</Label>
                <Input
                  value={ppmWoForm.title}
                  onChange={e => setPpmWoForm(f => ({ ...f, title: e.target.value }))}
                  className="h-8 text-xs mt-1"
                />
              </div>

              {/* Target Execution Date */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label>Scheduled Service Date *</Label>
                  <Input
                    type="date"
                    value={ppmWoForm.scheduledDate}
                    onChange={e => setPpmWoForm(f => ({ ...f, scheduledDate: e.target.value }))}
                    className="h-8 text-xs font-mono mt-1"
                  />
                </div>
                <div>
                  <Label>Dispatch Mode *</Label>
                  <Select
                    value={ppmWoForm.assigneeType}
                    onValueChange={(v: "in_house" | "vendor") => setPpmWoForm(f => ({ ...f, assigneeType: v }))}
                  >
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor">Outsourced Specialist Vendor</SelectItem>
                      <SelectItem value="in_house">In-House Field Technician</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contractor or Technician */}
              {ppmWoForm.assigneeType === "vendor" ? (
                <div>
                  <Label>Assigned Vendor Contractor</Label>
                  <Select
                    value={ppmWoForm.vendorName}
                    onValueChange={v => setPpmWoForm(f => ({ ...f, vendorName: v }))}
                  >
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Carrier Middle East Qatar">Carrier Middle East Qatar</SelectItem>
                      <SelectItem value="Otis Elevator Qatar WLL">Otis Elevator Qatar WLL</SelectItem>
                      <SelectItem value="Doha Fire Protection Solutions">Doha Fire Protection Solutions</SelectItem>
                      <SelectItem value="Qatar Facilities Management (QFM)">Qatar Facilities Management (QFM)</SelectItem>
                      <SelectItem value="Al Mana Engineering & Maintenance">Al Mana Engineering & Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label>Assigned In-House Technician</Label>
                  <Select
                    value={ppmWoForm.technicianName}
                    onValueChange={v => setPpmWoForm(f => ({ ...f, technicianName: v }))}
                  >
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {technicians.map(t => (
                        <SelectItem key={t.id} value={t.name}>
                          {t.name} ({t.specialty}) · {t.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Checklist Inspection Tasks */}
              <div>
                <Label className="font-semibold text-foreground">Statutory Inspection Checkpoints</Label>
                <div className="mt-1 rounded-lg border border-border p-2.5 bg-muted/20 space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedPpmForWo.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-foreground">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPpmForWo(null)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleDispatchWoFromPpm}>
              <Wrench className="h-3.5 w-3.5 mr-1" /> Confirm &amp; Dispatch Work Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: RECORD IN-HOUSE CHARGEABLE MATERIAL / SERVICE ───────────── */}
      <Dialog open={showInHouseMaterialModal} onOpenChange={setShowInHouseMaterialModal}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Record In-House Chargeable Material &amp; GL Journal</DialogTitle>
                <DialogDescription className="text-xs">
                  Log chargeable warehouse parts or specialized materials with General Ledger cost allocation.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div>
              <Label className="font-semibold text-foreground">Material / Part Name &amp; Description *</Label>
              <Input
                placeholder="e.g. 60x60 LED Panel 40W, Heavy Duty Brass Ball Valve 1-inch"
                value={inHouseMaterialForm.materialName}
                onChange={e => setInHouseMaterialForm(f => ({ ...f, materialName: e.target.value }))}
                className="h-8 text-xs mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label>Destination Property *</Label>
                <SearchableSelect
                  value={inHouseMaterialForm.property}
                  onValueChange={(v) => {
                    setInHouseMaterialForm(f => ({
                      ...f,
                      property: v,
                      unitRef: dynamicPropertyUnitsMap[v]?.[0] || "",
                    }));
                  }}
                  options={dynamicPropertyList.map(p => ({ label: p, value: p }))}
                  placeholder="Select property..."
                  searchPlaceholder="Search property..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Unit / Location *</Label>
                <SearchableSelect
                  value={inHouseMaterialForm.unitRef}
                  onValueChange={v => setInHouseMaterialForm(f => ({ ...f, unitRef: v }))}
                  options={(dynamicPropertyUnitsMap[inHouseMaterialForm.property] || []).map(u => ({ label: u, value: u }))}
                  placeholder="Select unit..."
                  searchPlaceholder="Search unit..."
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="font-semibold text-foreground">Quantity Issued *</Label>
                <Input
                  type="number"
                  min="1"
                  value={inHouseMaterialForm.quantity}
                  onChange={e => setInHouseMaterialForm(f => ({ ...f, quantity: Math.max(1, Number(e.target.value)) }))}
                  className="h-8 text-xs font-mono mt-1"
                />
              </div>
              <div>
                <Label className="font-semibold text-foreground">Unit Price (QAR) *</Label>
                <Input
                  type="number"
                  value={inHouseMaterialForm.unitPrice}
                  onChange={e => setInHouseMaterialForm(f => ({ ...f, unitPrice: Number(e.target.value) }))}
                  className="h-8 text-xs font-mono font-bold text-foreground mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="font-semibold text-foreground">GL Accounting Mapping *</Label>
                <Select
                  value={inHouseMaterialForm.glAccount}
                  onValueChange={v => setInHouseMaterialForm(f => ({ ...f, glAccount: v }))}
                >
                  <SelectTrigger className="h-8 text-xs mt-1 font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MAINTENANCE_GL_ACCOUNTS.map(gl => (
                      <SelectItem key={gl.code} value={gl.code}>
                        {gl.code} - {gl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-semibold text-foreground">Cost Center Allocation *</Label>
                <Select
                  value={inHouseMaterialForm.costCenter}
                  onValueChange={v => setInHouseMaterialForm(f => ({ ...f, costCenter: v }))}
                >
                  <SelectTrigger className="h-8 text-xs mt-1 font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COST_CENTERS.map(cc => (
                      <SelectItem key={cc.code} value={cc.code}>
                        {cc.code} - {cc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/20">
              <input
                type="checkbox"
                id="ihChargebackCheck"
                checked={inHouseMaterialForm.chargebackToTenant}
                onChange={e => setInHouseMaterialForm(f => ({ ...f, chargebackToTenant: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="ihChargebackCheck" className="text-xs font-medium cursor-pointer">
                Billable / Recoverable from Tenant (Charge to Tenant Ledger / Security Deposit)
              </label>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Total Material Valuation:</span>
              <span className="font-mono font-bold text-sm text-emerald-600">
                QAR {(Number(inHouseMaterialForm.unitPrice || 0) * Number(inHouseMaterialForm.quantity || 1)).toLocaleString()}
              </span>
            </div>

            <div>
              <Label>Reason / Usage Justification</Label>
              <Textarea
                placeholder="Explain the necessity of the part replacement, damage reason, or tenant charge justification..."
                value={inHouseMaterialForm.reason}
                onChange={e => setInHouseMaterialForm(f => ({ ...f, reason: e.target.value }))}
                className="text-xs min-h-[55px] mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInHouseMaterialModal(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreateInHouseMaterial}>
              <Package className="h-3.5 w-3.5 mr-1" /> Post &amp; Generate Financial Voucher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: GENERATED FINANCIAL RECEIPT / AP VOUCHER ─────────────────── */}
      <Dialog open={!!generatedReceipt} onOpenChange={(open) => { if (!open) setGeneratedReceipt(null); }}>
        <DialogContent
          className="max-w-xl max-h-[92vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">
                    {generatedReceipt?.voucherType === "AP_INVOICE" ? "Accounts Payable (AP) Voucher" : "Material Chargeback & Cost Journal"}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Official General Ledger posting voucher &amp; synchronization receipt.
                  </DialogDescription>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 bg-muted">
                {generatedReceipt?.receiptNo}
              </Badge>
            </div>
          </DialogHeader>

          {generatedReceipt && (
            <div className="space-y-4 py-2 text-xs">
              {/* Receipt Header Card */}
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-2.5">
                <div className="flex justify-between items-center text-[11px] text-muted-foreground pb-2 border-b border-border/50">
                  <span>Issued Date: <strong className="text-foreground">{generatedReceipt.date}</strong></span>
                  <span>Ref #: <strong className="font-mono text-orange-600">{generatedReceipt.referenceId}</strong></span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[11px]">Party / Contractor:</span>
                    <p className="font-semibold text-foreground">{generatedReceipt.partyName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Property &amp; Location:</span>
                    <p className="font-semibold text-foreground">{generatedReceipt.property} ({generatedReceipt.unitRef})</p>
                  </div>
                </div>
              </div>

              {/* General Ledger Breakdown */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-blue-600" /> General Ledger (GL) Accounting Entries
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 text-[11px]">
                        <TableHead className="py-1 px-2.5 font-semibold">Account Code &amp; Description</TableHead>
                        <TableHead className="py-1 px-2.5 font-semibold">Cost Center</TableHead>
                        <TableHead className="py-1 px-2.5 font-semibold text-right">Debit (QAR)</TableHead>
                        <TableHead className="py-1 px-2.5 font-semibold text-right">Credit (QAR)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Debit Line */}
                      <TableRow className="text-xs">
                        <TableCell className="py-1.5 px-2.5">
                          <div className="font-mono font-bold text-primary">{generatedReceipt.glAccount}</div>
                          <div className="text-[10px] text-muted-foreground">{generatedReceipt.description}</div>
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5 font-mono text-[11px] text-muted-foreground">
                          {generatedReceipt.costCenter}
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5 font-mono font-bold text-right text-emerald-600">
                          {generatedReceipt.baseAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5 font-mono text-right text-muted-foreground">-</TableCell>
                      </TableRow>

                      {/* Tax Debit Line if applicable */}
                      {generatedReceipt.taxAmount > 0 && (
                        <TableRow className="text-xs">
                          <TableCell className="py-1.5 px-2.5">
                            <div className="font-mono font-semibold text-foreground">21300001 - VAT / Input Tax Recoverable</div>
                          </TableCell>
                          <TableCell className="py-1.5 px-2.5 font-mono text-[11px] text-muted-foreground">
                            {generatedReceipt.costCenter}
                          </TableCell>
                          <TableCell className="py-1.5 px-2.5 font-mono font-bold text-right text-amber-600">
                            {generatedReceipt.taxAmount.toLocaleString()}
                          </TableCell>
                          <TableCell className="py-1.5 px-2.5 font-mono text-right text-muted-foreground">-</TableCell>
                        </TableRow>
                      )}

                      {/* Credit Line */}
                      <TableRow className="text-xs bg-muted/10">
                        <TableCell className="py-1.5 px-2.5">
                          <div className="font-mono font-bold text-foreground">
                            {generatedReceipt.voucherType === "AP_INVOICE"
                              ? "21100001 - Accounts Payable (Trade Creditors)"
                              : "12400001 - Internal Facility Spare Parts Inventory"}
                          </div>
                          <div className="text-[10px] text-muted-foreground">Settlement via {generatedReceipt.paymentMode}</div>
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5 font-mono text-[11px] text-muted-foreground">
                          {generatedReceipt.costCenter}
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5 font-mono text-right text-muted-foreground">-</TableCell>
                        <TableCell className="py-1.5 px-2.5 font-mono font-bold text-right text-foreground">
                          {generatedReceipt.totalAmount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Summary and Authorization */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">Authorized By / Originator</span>
                  <p className="font-medium text-foreground">{generatedReceipt.issuedBy}</p>
                  <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-mono">
                    <CheckCircle className="h-3 w-3" /> Digitally Signed &amp; Synced to AP
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-right space-y-0.5">
                  <span className="text-[10px] uppercase text-emerald-800 dark:text-emerald-300 font-semibold">Total Voucher Value</span>
                  <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                    QAR {generatedReceipt.totalAmount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Inclusive of all applied taxes</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full pt-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => {
                window.print();
              }}
            >
              <FileText className="h-3.5 w-3.5" /> Print / Save PDF
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
              onClick={() => setGeneratedReceipt(null)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Done &amp; Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
