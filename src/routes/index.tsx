import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Users, Wrench, Receipt, ShieldCheck, BarChart3 } from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { properties } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kinan — Unified Real Estate Platform" },
      { name: "description", content: "One platform for buying, leasing, living and managing real estate across the Kingdom — by Kinan International Real Estate Development Co." },
      { property: "og:title", content: "Kinan — Unified Real Estate Platform" },
      { property: "og:description", content: "One platform for buying, leasing, living and managing real estate across the Kingdom." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/40 to-background">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
          <div>
            <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-gold" />
              Kinan Unified Real Estate Platform · Web MVP
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              One platform.<br />
              <span className="text-primary">Every door</span> we build, sell and serve.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              From discovery and reservation to leases, payments, maintenance and finance —
              Kinan unifies the customer journey and the ERP backbone on a single source of truth.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/properties">Browse properties <ArrowRight /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/admin">Open staff console</Link>
              </Button>
            </div>
            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8">
              <Stat k="943+" v="Residents served" />
              <Stat k="680" v="Units under management" />
              <Stat k="4" v="Cities across KSA" />
            </dl>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border shadow-2xl">
              <img
                src={properties[0].image}
                alt="Featured Kinan development"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground">
                <p className="text-xs uppercase tracking-widest opacity-80">Featured · Riyadh</p>
                <p className="mt-1 text-2xl font-semibold">Al Nakheel Residences</p>
                <p className="text-sm opacity-90">184 units · 92% occupancy</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden w-56 rounded-xl border border-border bg-card p-4 shadow-xl sm:block">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">This month</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">SAR 2.84M</p>
              <p className="text-xs text-[oklch(0.55_0.13_155)]">▲ 12% rent receipts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-gold">Platform modules</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Three surfaces. One source of truth.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Customer-facing experiences, an internal admin console, and a real-estate ERP backbone — all sharing the same data, rules and audit trail.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <ModuleCard
              tag="Customers"
              title="Customer Portal"
              desc="Tickets, payments, facility booking, documents and surveys for tenants and owners."
              to="/portal"
              icon={<Users className="h-5 w-5" />}
            />
            <ModuleCard
              tag="Sales"
              title="Marketing & Sales"
              desc="Public discovery, visit booking, reservation, e-signature and milestone payments."
              to="/properties"
              icon={<Building2 className="h-5 w-5" />}
            />
            <ModuleCard
              tag="ERP"
              title="Staff Console"
              desc="Properties, units, leases, PDC, finance, fixed assets and maintenance — with approvals."
              to="/admin"
              icon={<BarChart3 className="h-5 w-5" />}
            />
          </div>
        </div>
      </section>

      {/* Capability strip */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-8">
          <Capability icon={<Receipt />} title="Balanced postings" desc="Every receipt, expense and accrual produces a balanced journal entry, automatically." />
          <Capability icon={<Wrench />} title="Workflow engine" desc="State machines enforce who can move a ticket, lease or unit — server-side." />
          <Capability icon={<ShieldCheck />} title="Audit by default" desc="Every write is captured. AES-256 at rest, TLS 1.2+, MFA for staff." />
          <Capability icon={<BarChart3 />} title="Decisions in real time" desc="Live dashboards across occupancy, collections, tickets and asset health." />
        </div>
      </section>

      {/* Featured properties */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-gold">Featured properties</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Live inventory</h2>
            </div>
            <Button asChild variant="ghost">
              <Link to="/properties">View all <ArrowRight /></Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                to="/properties/$id"
                params={{ id: p.id }}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-foreground backdrop-blur">
                    {p.type}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-xs text-muted-foreground">{p.code} · {p.city}</p>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">{p.name}</h3>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{p.units} units</span>
                    <span className="font-medium text-primary">{Math.round(p.occupancy * 100)}% occupied</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-2xl font-semibold tracking-tight text-foreground">{k}</dt>
      <dd className="mt-1 text-xs text-muted-foreground">{v}</dd>
    </div>
  );
}

function ModuleCard({ tag, title, desc, to, icon }: { tag: string; title: string; desc: string; to: string; icon: React.ReactNode }) {
  return (
    <Link to={to} className="group block">
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">{icon}</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">{tag}</span>
          </div>
          <h3 className="mt-5 text-xl font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          <p className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
            Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function Capability({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-primary [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
