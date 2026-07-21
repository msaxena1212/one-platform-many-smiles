import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users, Search, Plus, MoreHorizontal, ShieldCheck, Shield,
  UserCog, Eye, Edit, XCircle, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/super-admin/users")({
  head: () => ({ meta: [{ title: "User Management — ZYNO Super Admin" }] }),
  component: UsersPage,
});

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  ADMIN: "bg-blue-100 text-blue-700 border-blue-200",
  HOST: "bg-cyan-100 text-cyan-700 border-cyan-200",
  GUEST: "bg-slate-100 text-slate-700 border-slate-200",
  SALES: "bg-amber-100 text-amber-700 border-amber-200",
  OWNER: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  SUPER_ADMIN: <ShieldCheck className="h-3.5 w-3.5" />,
  ADMIN: <Shield className="h-3.5 w-3.5" />,
  HOST: <UserCog className="h-3.5 w-3.5" />,
  GUEST: <Users className="h-3.5 w-3.5" />,
  SALES: <Users className="h-3.5 w-3.5" />,
  OWNER: <Users className="h-3.5 w-3.5" />,
};

type UserRow = {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
  avatar_url?: string | null;
};

function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const roles = ["All", "SUPER_ADMIN", "ADMIN", "HOST", "SALES", "OWNER", "GUEST"];

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, created_at, avatar_url")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (e: any) {
      toast.error("Failed to load users: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function changeRole(userId: string, newRole: string) {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success("Role updated successfully.");
    loadUsers();
  }

  const filtered = users.filter(u => {
    const matchesSearch = u.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleCounts = roles.slice(1).reduce((acc, r) => {
    acc[r] = users.filter(u => u.role === r).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage roles and access for all platform users.</p>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {roles.slice(1).map(role => (
          <button
            key={role}
            onClick={() => setRoleFilter(role === roleFilter ? "All" : role)}
            className={`rounded-lg border p-3 text-left transition-all ${
              roleFilter === role ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
            }`}
          >
            <div className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-semibold mb-1 ${ROLE_COLORS[role] || ""}`}>
              {ROLE_ICONS[role]} {role.replace("_", " ")}
            </div>
            <p className="text-2xl font-bold">{roleCounts[role] || 0}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base">
              All Users <span className="text-muted-foreground font-normal text-sm">({filtered.length})</span>
            </CardTitle>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
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
                  <th className="text-left py-3 pr-4">User</th>
                  <th className="text-left py-3 pr-4">Current Role</th>
                  <th className="text-left py-3 pr-4">Joined</th>
                  <th className="text-right py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">Loading users...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No users found.</td></tr>
                ) : filtered.map(user => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground">{user.id.slice(0, 12)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${ROLE_COLORS[user.role] || "bg-muted"}`}>
                        {ROLE_ICONS[user.role]}
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <div className="px-2 py-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wide">Change Role</div>
                          {roles.slice(1).filter(r => r !== user.role).map(r => (
                            <DropdownMenuItem key={r} onClick={() => changeRole(user.id, r)} className="gap-2">
                              {ROLE_ICONS[r]} {r.replace("_", " ")}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem className="gap-2 text-destructive mt-1">
                            <XCircle className="h-4 w-4" /> Suspend User
                          </DropdownMenuItem>
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
    </div>
  );
}
