import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, CreditCard, CalendarCheck2, FileText, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { tickets, payments, crmContacts, integrationHealth, complianceChecks, formatSAR } from "@/lib/mock-data";

export const Route = createFileRoute("/portal/")({
  head: () => ({ meta: [{ title: "My dashboard — ZYNO Property Management Portal" }] }),
  component: PortalHome,
});

function PortalHome() {
  const open = tickets.filter(t => t.status !== "closed" && t.status !== "resolved").length;
  const paidThisMonth = payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const crmCount = crmContacts.length;
  const healthyIntegrations = integrationHealth.filter(i => i.status === "Healthy").length;
  const passedCompliance = complianceChecks.filter(c => c.status === "Passed").length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground sm:p-8">
        <p className="text-xs uppercase tracking-widest opacity-80">Tenant · Al Nakheel Residences · A-1201</p>
        <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">Hello, Khalid 👋</h2>
        <p className="mt-2 max-w-xl text-sm opacity-90">
          Your next rent installment is due on <span className="font-semibold">July 1</span>. You have {open} open service requests.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild variant="secondary"><Link to="/portal/payments">Pay now</Link></Button>
          <Button asChild variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <Link to="/portal/tickets">Report an issue</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open tickets" value={String(open)} hint="2 awaiting technician" icon={<Wrench className="h-4 w-4" />} />
        <StatCard label="Paid this month" value={formatSAR(paidThisMonth)} tone="success" delta="On track" icon={<CreditCard className="h-4 w-4" />} />
        <StatCard label="Upcoming booking" value="Pool · Fri" hint="22 Jun · 18:00–20:00" icon={<CalendarCheck2 className="h-4 w-4" />} />
        <StatCard label="CRM contacts" value={String(crmCount)} hint="Leads and customers" icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Healthy integrations" value={String(healthyIntegrations)} tone="success" hint="ERP / CRM / payments" icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Compliance checks" value={`${passedCompliance}/${complianceChecks.length}`} hint="Security and data residency" icon={<FileText className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Recent activity</h3>
              <Button asChild variant="ghost" size="sm"><Link to="/portal/tickets">All tickets <ArrowRight /></Link></Button>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {tickets.slice(0, 4).map(t => (
                <li key={t.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.category} · {t.unit} · {t.createdAt}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-secondary-foreground">
                    {t.status.replace("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold">Next payment</h3>
            <p className="mt-4 text-3xl font-semibold">{formatSAR(15000)}</p>
            <p className="text-xs text-muted-foreground">Due July 1, 2026 · Q3 rent</p>
            <div className="mt-5 space-y-2 text-sm">
              <Row k="Method" v="SADAD bill" />
              <Row k="Reference" v="119988443" />
              <Row k="Late fee after" v="July 8" />
            </div>
            <Button asChild className="mt-5 w-full"><Link to="/portal/payments">Pay now</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
