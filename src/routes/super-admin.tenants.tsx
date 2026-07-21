import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2, Plus, Search, MoreHorizontal, CheckCircle2,
  XCircle, Clock, Mail, Phone, Users, Edit, Trash2, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/super-admin/tenants")({
  head: () => ({ meta: [{ title: "Tenant Management — ZYNO Super Admin" }] }),
  component: TenantsPage,
});

type TenantRow = {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
  propertyCount?: number;
  plan?: string;
  status?: string;
};

const PLAN_COLORS: Record<string, string> = {
  Enterprise: "bg-purple-100 text-purple-700 border-purple-200",
  Professional: "bg-blue-100 text-blue-700 border-blue-200",
  Starter: "bg-slate-100 text-slate-700 border-slate-200",
};

function TenantsPage() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", plan: "Starter" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  async function loadTenants() {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, created_at")
        .in("role", ["HOST", "ADMIN", "SUPER_ADMIN"])
        .order("created_at", { ascending: false });
      if (error) throw error;

      const rows: TenantRow[] = (profiles || []).map((p) => ({
        ...p,
        plan: p.role === "SUPER_ADMIN" ? "Enterprise" : p.role === "ADMIN" ? "Professional" : "Starter",
        status: "Active",
      }));

      // Enrich with property counts
      const { data: props } = await supabase.from("properties").select("id, host_id");
      const propMap: Record<string, number> = {};
      (props || []).forEach((p: any) => {
        propMap[p.host_id] = (propMap[p.host_id] || 0) + 1;
      });
      rows.forEach((r) => { r.propertyCount = propMap[r.id] || 0; });

      setTenants(rows);
    } catch (e: any) {
      toast.error("Failed to load tenants: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTenant(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: "ChangeMe@2024",
        options: { data: { full_name: form.full_name, role: "ADMIN" } }
      });
      if (error) throw error;
      toast.success(`Tenant "${form.full_name}" created! Temporary password: ChangeMe@2024`);
      setShowAddDialog(false);
      setForm({ full_name: "", email: "", plan: "Starter" });
      loadTenants();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = tenants.filter(t =>
    t.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tenant Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Onboard, manage and monitor all organisations on this platform.
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Onboard Tenant
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5">
          <p className="text-sm text-muted-foreground">Total Tenants</p>
          <p className="text-3xl font-bold mt-1">{tenants.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-3xl font-bold mt-1 text-emerald-600">{tenants.filter(t => t.status === "Active").length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-muted-foreground">Total Properties</p>
          <p className="text-3xl font-bold mt-1">{tenants.reduce((s, t) => s + (t.propertyCount || 0), 0)}</p>
        </CardContent></Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-base">All Tenants</CardTitle>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants..."
                className="pl-9 h-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left py-3 pr-4">Organisation</th>
                  <th className="text-left py-3 pr-4">Role</th>
                  <th className="text-center py-3 pr-4">Properties</th>
                  <th className="text-left py-3 pr-4">Plan</th>
                  <th className="text-left py-3 pr-4">Status</th>
                  <th className="text-left py-3 pr-4">Joined</th>
                  <th className="text-right py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Loading tenants...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No tenants found.</td></tr>
                ) : filtered.map(tenant => (
                  <tr key={tenant.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{tenant.full_name}</p>
                          <p className="text-xs text-muted-foreground">{tenant.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline" className="text-xs">{tenant.role}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-center">{tenant.propertyCount}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${PLAN_COLORS[tenant.plan || "Starter"]}`}>
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {tenant.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {new Date(tenant.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2"><Eye className="h-4 w-4" /> View Details</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2"><Edit className="h-4 w-4" /> Edit Plan</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive"><XCircle className="h-4 w-4" /> Suspend</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Tenant Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Onboard New Tenant</DialogTitle>
            <DialogDescription>
              Create a new organisation account. The admin will receive a welcome email with login credentials.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTenant} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="org-name">Organisation / Full Name</Label>
              <Input
                id="org-name"
                placeholder="e.g. Al Baraka Properties LLC"
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="org-email">Admin Email</Label>
              <Input
                id="org-email"
                type="email"
                placeholder="admin@organisation.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Plan</Label>
              <div className="grid grid-cols-3 gap-2">
                {["Starter", "Professional", "Enterprise"].map(plan => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, plan }))}
                    className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                      form.plan === plan
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {plan}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "Creating..." : "Create Tenant"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
