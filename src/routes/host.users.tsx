import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/host/users")({
  component: HostUsers,
});

const staffUsers = [
  { name: "Ahmad Al-Rashid", email: "ahmad@kinan.example", role: "Finance Officer", status: "ACTIVE", mfa: "ENABLED" },
  { name: "Noura Al-Saud", email: "noura@kinan.example", role: "Real Estate Officer", status: "ACTIVE", mfa: "ENABLED" },
  { name: "Yousef Bin Hamad", email: "yousef@kinan.example", role: "Maintenance Coordinator", status: "ACTIVE", mfa: "ENABLED" },
  { name: "Hala Al-Otaibi", email: "hala@kinan.example", role: "Management", status: "ACTIVE", mfa: "ENABLED" },
  { name: "Faisal T.", email: "faisal@kinan.example", role: "Technician", status: "ACTIVE", mfa: "OFF" },
  { name: "Mahmoud K.", email: "mahmoud@kinan.example", role: "Technician", status: "INVITED", mfa: "OFF" },
];

const roles = [
  { name: "Admin", desc: "Full platform", users: 2 },
  { name: "Finance Officer", desc: "Finance, PDC, ledger, reports", users: 3 },
  { name: "Real Estate Officer", desc: "Leases, units, tenants", users: 4 },
  { name: "Maintenance Coordinator", desc: "Tickets, vendors, POs", users: 2 },
  { name: "Management", desc: "Dashboards, approvals (no posting)", users: 3 },
  { name: "Technician / Vendor", desc: "Assigned tickets only", users: 12 },
  { name: "Owner (3rd-party)", desc: "Owner statements only", users: 8 },
];

function HostUsers() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-start justify-between pb-4">
            <div>
              <CardTitle>Staff users</CardTitle>
              <CardDescription>6 accounts · MFA enforced for admin roles</CardDescription>
            </div>
            <Button className="bg-primary hover:bg-primary/90">Invite user</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-y border-border bg-muted/10">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">MFA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {staffUsers.map((user, i) => (
                    <tr key={i} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{user.role}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                          user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                          user.mfa === 'ENABLED' ? 'text-primary' : 'text-red-500'
                        }`}>
                          {user.mfa}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle>Roles</CardTitle>
            <CardDescription>Row-level policies enforce these scopes server-side.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {roles.map((role, i) => (
                <div key={i} className="px-6 py-4 flex justify-between items-center hover:bg-muted/10 transition-colors">
                  <div>
                    <div className="font-medium text-sm text-foreground">{role.name}</div>
                    <div className="text-xs text-muted-foreground">{role.desc}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{role.users} users</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
