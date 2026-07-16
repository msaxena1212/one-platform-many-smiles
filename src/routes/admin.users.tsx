import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const users = [
  { name: "Ahmad Al-Rashid", email: "ahmad@ZYNO Property Management.example", role: "Finance Officer", status: "active", mfa: true },
  { name: "Noura Al-Saud", email: "noura@ZYNO Property Management.example", role: "Real Estate Officer", status: "active", mfa: true },
  { name: "Yousef Bin Hamad", email: "yousef@ZYNO Property Management.example", role: "Maintenance Coordinator", status: "active", mfa: true },
  { name: "Hala Al-Otaibi", email: "hala@ZYNO Property Management.example", role: "Management", status: "active", mfa: true },
  { name: "Faisal T.", email: "faisal@ZYNO Property Management.example", role: "Technician", status: "active", mfa: false },
  { name: "Mahmoud K.", email: "mahmoud@ZYNO Property Management.example", role: "Technician", status: "invited", mfa: false },
];

const roles = [
  { name: "Admin", scope: "Full platform", count: 2 },
  { name: "Finance Officer", scope: "Finance, PDC, ledger, reports", count: 3 },
  { name: "Real Estate Officer", scope: "Leases, units, tenants", count: 4 },
  { name: "Maintenance Coordinator", scope: "Tickets, vendors, POs", count: 2 },
  { name: "Management", scope: "Dashboards, approvals (no posting)", count: 3 },
  { name: "Technician / Vendor", scope: "Assigned tickets only", count: 12 },
  { name: "Owner (3rd-party)", scope: "Owner statements only", count: 8 },
];

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users & roles — ZYNO Property Management Staff" }] }),
  component: AdminUsers,
});

function AdminUsers() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h3 className="text-base font-semibold">Staff users</h3>
                <p className="text-xs text-muted-foreground">{users.length} accounts · MFA enforced for admin roles</p>
              </div>
              <Button>Invite user</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">MFA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {users.map(u => (
                    <tr key={u.email}>
                      <td className="px-6 py-3">
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{u.role}</td>
                      <td className="px-6 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                          u.status === "active" ? "bg-[oklch(0.55_0.13_155)]/15 text-[oklch(0.4_0.13_155)]" : "bg-gold/20 text-gold-foreground"
                        }`}>{u.status}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                          u.mfa ? "bg-secondary text-secondary-foreground" : "bg-destructive/15 text-destructive"
                        }`}>{u.mfa ? "Enabled" : "Off"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardContent className="p-6">
          <h3 className="text-base font-semibold">Roles</h3>
          <p className="text-xs text-muted-foreground">Row-level policies enforce these scopes server-side.</p>
          <ul className="mt-4 space-y-3 text-sm">
            {roles.map(r => (
              <li key={r.name} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{r.name}</p>
                  <span className="text-xs text-muted-foreground">{r.count} users</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.scope}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
