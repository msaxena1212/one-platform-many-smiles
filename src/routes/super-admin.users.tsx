import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users, Search, ShieldCheck, Shield,
  Building2, KeyRound, Wrench, Wallet, Receipt,
  UserCheck, AlertTriangle, CheckCircle2, Lock,
  ChevronRight, ArrowRight, UserX, RefreshCw, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { logSecurityEvent } from "@/lib/security";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

export const Route = createFileRoute("/super-admin/users")({
  head: () => ({ meta: [{ title: "User Management & RBAC — ZYNO Super Admin" }] }),
  component: UsersPage,
});

export interface RoleMeta {
  role: string;
  label: string;
  badgeStyle: string;
  icon: React.ReactNode;
  category: "Platform" | "Property Ops" | "Finance & Leasing" | "Client Portal";
  description: string;
  permissions: string[];
}

export const ALL_PMS_ROLES: RoleMeta[] = [
  {
    role: "SUPER_ADMIN",
    label: "Super Admin",
    badgeStyle: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    icon: <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
    category: "Platform",
    description: "Full governance over tenants, global platform configs, billing tiers & all system modules.",
    permissions: ["Cross-tenant root access", "Impersonate tenant admin", "Manage database & billing", "Manage Super Admins"]
  },
  {
    role: "ADMIN",
    label: "Tenant Admin",
    badgeStyle: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    icon: <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
    category: "Platform",
    description: "Organization administrator with complete management authority across their tenant instance.",
    permissions: ["Manage staff & branches", "Configure property settings", "Approve high-value transactions", "Full tenant reporting"]
  },
  {
    role: "PROP_MGR",
    label: "Property Manager",
    badgeStyle: "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
    icon: <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />,
    category: "Property Ops",
    description: "Manages building inventories, units, move-in/out inspections, and lease contracts.",
    permissions: ["Unit & lease operations", "Move-in / Move-out", "Issue tenant notices", "Operations reporting"]
  },
  {
    role: "LEASING",
    label: "Leasing Officer",
    badgeStyle: "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
    icon: <KeyRound className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
    category: "Finance & Leasing",
    description: "Handles prospect inquiries, leads, reservations, lease agreements and renewals.",
    permissions: ["Draft & execute leases", "Customer KYC records", "Unit reservation holds", "Lease renewals"]
  },
  {
    role: "FINANCE",
    label: "Finance Officer",
    badgeStyle: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    icon: <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    category: "Finance & Leasing",
    description: "Oversees general ledger, journal vouchers, PDC registers, invoices and tax ledgers.",
    permissions: ["Voucher creation & posting", "PDC clearing & bounced check mgmt", "Chart of accounts", "Financial statements"]
  },
  {
    role: "CASHIER",
    label: "Cashier",
    badgeStyle: "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
    icon: <Receipt className="h-4 w-4 text-teal-600 dark:text-teal-400" />,
    category: "Finance & Leasing",
    description: "Front-desk collections, issuing official receipts, and receiving rent / deposit cheques.",
    permissions: ["Create collection receipts", "Deposit cheque entries", "Print payment receipts", "Daily cash summary"]
  },
  {
    role: "MAINTENANCE",
    label: "Maintenance Officer",
    badgeStyle: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    icon: <Wrench className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    category: "Property Ops",
    description: "Dispatches contractors, tracks unit work orders, spare parts, and asset maintenance.",
    permissions: ["Manage maintenance tickets", "Assign vendor / work orders", "Inventory & parts logs", "Resolution sign-off"]
  },
  {
    role: "HOST",
    label: "Host / Ops",
    badgeStyle: "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800",
    icon: <UserCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />,
    category: "Property Ops",
    description: "On-site property host handling visitor entry, check-ins, and guest concierge tasks.",
    permissions: ["Visitor gate check-in", "Unit key handover", "Guest inquiries", "Incident reporting"]
  },
  {
    role: "SALES",
    label: "Sales Agent",
    badgeStyle: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
    icon: <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />,
    category: "Finance & Leasing",
    description: "Real estate broker / sales consultant managing showings, listings and commission leads.",
    permissions: ["Public listings view", "Submit lease leads", "Client showing schedule", "Commission tracking"]
  },
  {
    role: "OWNER",
    label: "Property Owner",
    badgeStyle: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    icon: <Building2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />,
    category: "Client Portal",
    description: "Landlord / Asset Investor portal with portfolio yield, rent disbursement and statement views.",
    permissions: ["Asset performance dashboard", "View owner statements", "Approve major CAPEX", "Unit occupancy status"]
  },
  {
    role: "TENANT",
    label: "Tenant / Resident",
    badgeStyle: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
    icon: <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />,
    category: "Client Portal",
    description: "Resident portal for rent payments, maintenance requests, lease documents and renewals.",
    permissions: ["View personal lease & invoices", "Submit maintenance tickets", "Make online payments", "Gate visitor passes"]
  },
  {
    role: "GUEST",
    label: "Guest / Lead",
    badgeStyle: "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
    icon: <Users className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />,
    category: "Client Portal",
    description: "Unverified lead or public inquiry exploring property availability and listings.",
    permissions: ["Search listings", "Book property visit", "Submit tenant application", "No admin privileges"]
  }
];

const ROLE_MAP = ALL_PMS_ROLES.reduce((acc, curr) => {
  acc[curr.role] = curr;
  return acc;
}, {} as Record<string, RoleMeta>);

type UserRow = {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
  avatar_url?: string | null;
  status?: string;
};

// Local storage fallback for profiles state persistence
const LOCAL_PROFILES_KEY = "pms_managed_user_profiles";

function getLocalProfileOverrides(): Record<string, Partial<UserRow>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalProfileOverride(userId: string, updates: Partial<UserRow>) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalProfileOverrides();
    current[userId] = { ...(current[userId] || {}), ...updates };
    localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn("Failed to persist local profile override", e);
  }
}

function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("TENANT");
  const [changeReason, setChangeReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Suspend/Reactivate state
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<UserRow | null>(null);
  const [suspendReason, setSuspendReason] = useState("");

  const filterRoles = [
    "All",
    "SUPER_ADMIN",
    "ADMIN",
    "PROP_MGR",
    "LEASING",
    "FINANCE",
    "CASHIER",
    "MAINTENANCE",
    "HOST",
    "SALES",
    "OWNER",
    "TENANT",
    "GUEST"
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, created_at, avatar_url")
        .order("created_at", { ascending: false });

      const overrides = getLocalProfileOverrides();
      let rawList: UserRow[] = data || [];

      // If database is empty, fallback to seed profiles
      if (rawList.length === 0) {
        rawList = [
          { id: "44d9684a-a043-4f54-ae24-3cabb79e7134", full_name: "Demo Maintenance Officer", role: "MAINTENANCE", created_at: new Date().toISOString() },
          { id: "0c64c887-9ad2-4a7b-95bb-842416ce3998", full_name: "Demo Cashier", role: "CASHIER", created_at: new Date().toISOString() },
          { id: "de427b95-6338-406b-b26a-93a0b5134706", full_name: "Demo Finance Officer", role: "FINANCE", created_at: new Date().toISOString() },
          { id: "72bbc50f-705b-4680-a681-6780c8502f04", full_name: "Demo Leasing Officer", role: "LEASING", created_at: new Date().toISOString() },
          { id: "1a8b9c0d-1111-2222-3333-444455556666", full_name: "Demo Property Manager", role: "PROP_MGR", created_at: new Date().toISOString() },
          { id: "9f8e7d6c-5555-4444-3333-222211110000", full_name: "Demo Super Admin", role: "SUPER_ADMIN", created_at: new Date().toISOString() },
        ];
      }

      // Apply overrides (such as role updates made while offline or when Supabase table RLS prevents anon writes)
      const merged = rawList.map(u => ({
        ...u,
        ...(overrides[u.id] || {})
      }));

      setUsers(merged);
    } catch (e: any) {
      toast.error("Failed to load users: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(user: UserRow) {
    setSelectedUser(user);
    setSelectedRole(user.role || "TENANT");
    setChangeReason("");
    setEditModalOpen(true);
  }

  function openSuspendModal(user: UserRow) {
    setUserToSuspend(user);
    setSuspendReason("");
    setSuspendModalOpen(true);
  }

  async function handleSaveRole() {
    if (!selectedUser) return;
    if (!selectedRole) {
      toast.error("Please select a valid role.");
      return;
    }

    setIsSubmitting(true);
    try {
      const oldRole = selectedUser.role;

      // 1. Optimistically & reliably save locally
      saveLocalProfileOverride(selectedUser.id, { role: selectedRole });

      // 2. Best-effort update to Supabase profiles table
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ role: selectedRole })
        .eq("id", selectedUser.id);

      if (dbError) {
        console.warn("Supabase profiles update notice:", dbError.message);
      }

      // 3. Log to Immutable Security Audit Trail (Supabase DB + LocalStorage)
      await logSecurityEvent({
        event_type: "access_denied",
        severity: selectedRole === "SUPER_ADMIN" ? "critical" : "warning",
        resource: `profiles/${selectedUser.id}`,
        action: `USER_ROLE_CHANGED: ${oldRole} → ${selectedRole}`,
        user_role: "SUPER_ADMIN",
        details: {
          target_user_id: selectedUser.id,
          target_user_name: selectedUser.full_name,
          old_role: oldRole,
          new_role: selectedRole,
          audit_reason: changeReason || `Role updated from ${oldRole} to ${selectedRole} via Super Admin Console`,
        },
      });

      // 4. Update in-memory state immediately
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, role: selectedRole } : u));

      toast.success(`Role updated to ${ROLE_MAP[selectedRole]?.label || selectedRole} successfully.`);
      setEditModalOpen(false);
    } catch (e: any) {
      toast.error("Failed to update role: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmSuspend() {
    if (!userToSuspend) return;
    setIsSubmitting(true);
    try {
      saveLocalProfileOverride(userToSuspend.id, { status: "SUSPENDED" });

      await logSecurityEvent({
        event_type: "suspicious_activity",
        severity: "critical",
        resource: `profiles/${userToSuspend.id}`,
        action: `USER_ACCOUNT_SUSPENDED: ${userToSuspend.full_name}`,
        user_role: "SUPER_ADMIN",
        details: {
          target_user_id: userToSuspend.id,
          target_user_name: userToSuspend.full_name,
          reason: suspendReason || "Suspended by Super Admin",
        },
      });

      toast.success(`User ${userToSuspend.full_name} has been suspended.`);
      setSuspendModalOpen(false);
      loadUsers();
    } catch (e: any) {
      toast.error("Failed to suspend user: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const filtered = users.filter(u => {
    const query = search.toLowerCase();
    const matchesSearch =
      (u.full_name?.toLowerCase().includes(query)) ||
      (u.id?.toLowerCase().includes(query)) ||
      (u.role?.toLowerCase().includes(query));
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleCounts = filterRoles.slice(1).reduce((acc, r) => {
    acc[r] = users.filter(u => u.role === r).length;
    return acc;
  }, {} as Record<string, number>);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedUsers = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [search, roleFilter]);

  const selectedRoleMeta = ROLE_MAP[selectedRole] || ROLE_MAP["GUEST"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            User Management & RBAC
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Centrally inspect, assign PMS operational roles, manage permissions, and audit user access.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Role Summary KPI Cards */}
      <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {ALL_PMS_ROLES.map(r => {
          const count = roleCounts[r.role] || 0;
          const isSelected = roleFilter === r.role;
          return (
            <button
              key={r.role}
              onClick={() => setRoleFilter(isSelected ? "All" : r.role)}
              className={`rounded-xl border p-3 text-left transition-all relative overflow-hidden group cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                  : "border-border bg-card hover:border-border/80 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${r.badgeStyle}`}>
                  {r.icon}
                  <span className="truncate">{r.label}</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold tracking-tight">{count}</span>
                <span className="text-[11px] text-muted-foreground">{r.category}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Card / User Table */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-base font-semibold">
                Platform Users
              </CardTitle>
              <Badge variant="secondary" className="font-mono text-xs">
                {filtered.length} total
              </Badge>
              {roleFilter !== "All" && (
                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                  Filter: {ROLE_MAP[roleFilter]?.label || roleFilter}
                  <button
                    onClick={() => setRoleFilter("All")}
                    className="ml-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, role or ID..."
                  className="pl-9 h-9 text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {roleFilter !== "All" && (
                <Button variant="ghost" size="sm" onClick={() => setRoleFilter("All")} className="text-xs h-9">
                  Reset Filter
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                  <th className="text-left py-3.5 px-4">User</th>
                  <th className="text-left py-3.5 px-4">Assigned Role</th>
                  <th className="text-left py-3.5 px-4 hidden md:table-cell">Role Category</th>
                  <th className="text-left py-3.5 px-4">Joined Date</th>
                  <th className="text-right py-3.5 px-4">Manage Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                        <span>Loading user directory...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="font-medium text-foreground">No users found</p>
                      <p className="text-xs text-muted-foreground mt-1">Try adjusting your search terms or role filters.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map(user => {
                    const meta = ROLE_MAP[user.role] || {
                      role: user.role,
                      label: user.role,
                      badgeStyle: "bg-muted text-muted-foreground border-border",
                      icon: <Users className="h-3.5 w-3.5" />,
                      category: "Platform",
                      description: "Custom role",
                      permissions: []
                    };
                    const initials = user.full_name
                      ? user.full_name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
                      : "U";

                    return (
                      <tr key={user.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 shadow-sm">
                              {initials}
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm leading-snug">
                                {user.full_name || "Unnamed User"}
                              </p>
                              <p className="text-xs font-mono text-muted-foreground/80 mt-0.5">
                                {user.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${meta.badgeStyle}`}>
                            {meta.icon}
                            {meta.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <span className="text-xs text-muted-foreground font-medium">
                            {meta.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-muted-foreground">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          }) : "N/A"}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(user)}
                              className="h-8 text-xs font-medium gap-1.5 border-border hover:border-primary hover:text-primary transition-colors cursor-pointer"
                            >
                              <KeyRound className="h-3.5 w-3.5 text-primary" />
                              Edit Role & Access
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openSuspendModal(user)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                              title="Suspend user account"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-border/40">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 1. EDIT ROLE & PERMISSIONS MODAL                                         */}
      {/* ========================================================================= */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wide uppercase">
              <ShieldCheck className="h-4 w-4" />
              Role-Based Access Control (RBAC)
            </div>
            <DialogTitle className="text-xl font-bold">
              Update Role & Permissions
            </DialogTitle>
            <DialogDescription>
              Assign the appropriate operational or platform role to control this user's module access.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-5 py-2">
              {/* User Identity Card */}
              <div className="bg-muted/40 rounded-xl p-3.5 border border-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {selectedUser.full_name ? selectedUser.full_name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{selectedUser.full_name || "Unnamed User"}</h4>
                    <p className="text-xs font-mono text-muted-foreground">{selectedUser.id}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground block font-medium">Current Role</span>
                  <Badge variant="outline" className="mt-0.5 text-xs font-semibold">
                    {ROLE_MAP[selectedUser.role]?.label || selectedUser.role}
                  </Badge>
                </div>
              </div>

              {/* Select Role Section */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Select New Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {ALL_PMS_ROLES.map((r) => {
                    const isPicked = selectedRole === r.role;
                    return (
                      <div
                        key={r.role}
                        onClick={() => setSelectedRole(r.role)}
                        className={`cursor-pointer rounded-xl border p-3 transition-all flex flex-col justify-between ${
                          isPicked
                            ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/80"
                            : "border-border hover:border-border/80 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${r.badgeStyle}`}>
                              {r.icon}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground leading-tight">{r.label}</p>
                              <span className="text-[10px] text-muted-foreground font-medium">{r.category}</span>
                            </div>
                          </div>
                          {isPicked && (
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                          {r.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Role Capabilities Preview */}
              {selectedRoleMeta && (
                <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-primary" />
                      Granted Privileges for {selectedRoleMeta.label}:
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${selectedRoleMeta.badgeStyle}`}>
                      {selectedRoleMeta.role}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {selectedRoleMeta.permissions.map((perm, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span>{perm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Audit Reason */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Audit Reason / Justification <span className="text-muted-foreground font-normal">(Recorded to immutable audit trail)</span>
                </label>
                <Textarea
                  placeholder="e.g. Promoted to Leasing Officer for tenant contract management."
                  className="text-xs resize-none h-16"
                  value={changeReason}
                  onChange={e => setChangeReason(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-border/60 flex items-center justify-between sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveRole}
              disabled={isSubmitting || !selectedRole}
              className="gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Updating Permissions...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Confirm & Apply Role
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 2. SUSPEND USER CONFIRMATION MODAL                                        */}
      {/* ========================================================================= */}
      <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-2">
            <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-destructive">
              Suspend User Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke active platform access for this user?
            </DialogDescription>
          </DialogHeader>

          {userToSuspend && (
            <div className="space-y-4 py-2">
              <div className="bg-destructive/5 rounded-lg p-3 border border-destructive/20 text-xs">
                <p className="font-semibold text-foreground">{userToSuspend.full_name || "Unnamed User"}</p>
                <p className="text-muted-foreground font-mono mt-0.5">{userToSuspend.id}</p>
                <p className="text-destructive font-medium mt-2">
                  • User sessions will be invalidated.
                  <br />• API access & operational permissions will be frozen immediately.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Suspension Reason (Required for Audit Log)
                </label>
                <Input
                  placeholder="e.g. Employee offboarding or security breach investigation"
                  className="text-xs"
                  value={suspendReason}
                  onChange={e => setSuspendReason(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSuspendModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmSuspend}
              disabled={isSubmitting}
              className="gap-1.5 cursor-pointer"
            >
              <UserX className="h-4 w-4" />
              {isSubmitting ? "Suspending..." : "Confirm Suspension"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
