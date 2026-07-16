import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { leases, units, formatSAR, type Lease } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/leases")({
  head: () => ({ meta: [{ title: "Leases & PDC — ZYNO Property Management Staff" }] }),
  component: AdminLeases,
});

const statusClass: Record<Lease["status"], string> = {
  active: "bg-[oklch(0.55_0.13_155)]/15 text-[oklch(0.4_0.13_155)]",
  expiring: "bg-gold/20 text-gold-foreground",
  terminated: "bg-muted text-muted-foreground",
  draft: "bg-secondary text-secondary-foreground",
};

function AdminLeases() {
  const unitMap = Object.fromEntries(units.map(u => [u.id, u.number]));
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Mini k="Active" v={String(leases.filter(l => l.status === "active").length)} />
        <Mini k="Expiring < 90d" v={String(leases.filter(l => l.status === "expiring").length)} tone="warn" />
        <Mini k="Drafts" v={String(leases.filter(l => l.status === "draft").length)} />
        <Mini k="Annual rent roll" v={formatSAR(leases.filter(l => l.status === "active").reduce((s, l) => s + l.annualRent, 0))} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="text-base font-semibold">Leases</h3>
            <Button>New lease</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Ref</th>
                  <th className="px-6 py-3 font-medium">Tenant</th>
                  <th className="px-6 py-3 font-medium">Unit</th>
                  <th className="px-6 py-3 font-medium">Start</th>
                  <th className="px-6 py-3 font-medium">End</th>
                  <th className="px-6 py-3 font-medium text-right">Annual rent</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {leases.map(l => (
                  <tr key={l.id} className="hover:bg-muted/40">
                    <td className="px-6 py-3 font-mono text-xs">L-{l.id.slice(-4).toUpperCase()}</td>
                    <td className="px-6 py-3 font-medium">{l.tenant}</td>
                    <td className="px-6 py-3 text-muted-foreground">{unitMap[l.unitId]}</td>
                    <td className="px-6 py-3 text-muted-foreground">{l.start}</td>
                    <td className="px-6 py-3 text-muted-foreground">{l.end}</td>
                    <td className="px-6 py-3 text-right font-medium">{formatSAR(l.annualRent)}</td>
                    <td className="px-6 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusClass[l.status]}`}>{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-semibold">Post-dated cheques (PDC)</h3>
          <p className="mt-1 text-xs text-muted-foreground">Upcoming bank presentations · auto-posted to ledger when cleared</p>
          <ul className="mt-4 space-y-2 text-sm">
            <PDC date="2026-07-01" tenant="Khalid Al-Mutairi" bank="SNB" amount={45000} />
            <PDC date="2026-07-15" tenant="Sara Al-Qahtani" bank="Al Rajhi" amount={23750} />
            <PDC date="2026-08-01" tenant="Omar Industries LLC" bank="SAB" amount={55000} />
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Mini({ k, v, tone }: { k: string; v: string; tone?: "warn" }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{k}</p>
        <p className={`mt-2 text-2xl font-semibold ${tone === "warn" ? "text-[oklch(0.6_0.15_75)]" : "text-foreground"}`}>{v}</p>
      </CardContent>
    </Card>
  );
}

function PDC({ date, tenant, bank, amount }: { date: string; tenant: string; bank: string; amount: number }) {
  return (
    <li className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
      <div>
        <p className="font-medium">{tenant}</p>
        <p className="text-xs text-muted-foreground">{bank} · presents {date}</p>
      </div>
      <span className="font-medium">{formatSAR(amount)}</span>
    </li>
  );
}
