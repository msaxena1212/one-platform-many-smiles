import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Wallet, Wrench, FileSignature, ArrowRight, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { properties, tickets, payments, leases, formatSAR } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — ZYNO Property Management Staff" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const totalUnits = properties.reduce((s, p) => s + p.units, 0);
  const avgOcc = properties.reduce((s, p) => s + p.occupancy, 0) / properties.length;
  const collected = payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const openTickets = tickets.filter(t => t.status !== "closed" && t.status !== "resolved").length;
  const expiringLeases = leases.filter(l => l.status === "expiring").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Portfolio" value={`${properties.length} properties`} hint={`${totalUnits} units total`} icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Occupancy" value={`${Math.round(avgOcc * 100)}%`} tone="success" delta="▲ 2.1%" hint="vs last month" icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Collected (June)" value={formatSAR(collected)} tone="success" delta="▲ 12%" icon={<Wallet className="h-4 w-4" />} />
        <StatCard label="Open tickets" value={String(openTickets)} tone="warning" hint={`${tickets.filter(t => t.priority === "Urgent").length} urgent`} icon={<Wrench className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Portfolio at a glance</h3>
              <Button asChild variant="ghost" size="sm"><Link to="/admin/properties">All properties <ArrowRight /></Link></Button>
            </div>
            <div className="mt-4 space-y-3">
              {properties.slice(0, 5).map(p => (
                <div key={p.id} className="grid grid-cols-12 items-center gap-3">
                  <div className="col-span-5 min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.city} · {p.units} units</p>
                  </div>
                  <div className="col-span-5">
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${p.occupancy * 100}%` }} />
                    </div>
                  </div>
                  <p className="col-span-2 text-right text-sm font-medium">{Math.round(p.occupancy * 100)}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold">Approvals queue</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <Approval icon={<FileSignature className="h-4 w-4" />} title="Lease draft L4" sub="Layla Al-Harbi · A-1202" />
              <Approval icon={<Wrench className="h-4 w-4" />} title="Vendor PO #2241" sub="HVAC repair · A-1201" />
              <Approval icon={<Wallet className="h-4 w-4" />} title="Refund request" sub="RCT-10395 · 4,500 USD" />
              <Approval icon={<FileSignature className="h-4 w-4" />} title="Lease termination" sub="Lease L2 · Sara Al-Qahtani" />
            </ul>
            <Button asChild variant="outline" className="mt-5 w-full"><Link to="/admin/leases">Open queue</Link></Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold">Recent tickets</h3>
            <ul className="mt-4 divide-y divide-border">
              {tickets.slice(0, 4).map(t => (
                <li key={t.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.unit} · {t.category}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-secondary-foreground">{t.status.replace("_", " ")}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold">Leases needing attention</h3>
            <p className="mt-1 text-xs text-muted-foreground">{expiringLeases} expiring · 1 draft awaiting approval</p>
            <ul className="mt-4 divide-y divide-border">
              {leases.map(l => (
                <li key={l.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{l.tenant}</p>
                    <p className="text-xs text-muted-foreground">{l.start} → {l.end} · {formatSAR(l.annualRent)}/yr</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                    l.status === "active" ? "bg-[oklch(0.55_0.13_155)]/15 text-[oklch(0.4_0.13_155)]" :
                    l.status === "expiring" ? "bg-gold/20 text-gold-foreground" :
                    l.status === "draft" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                  }`}>{l.status}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Approval({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">{icon}</span>
        <div className="min-w-0">
          <p className="truncate font-medium">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{sub}</p>
        </div>
      </div>
      <div className="flex gap-1.5">
        <button className="rounded-md bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary/90">Approve</button>
        <button className="rounded-md bg-secondary px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground hover:bg-secondary/80">Reject</button>
      </div>
    </li>
  );
}
