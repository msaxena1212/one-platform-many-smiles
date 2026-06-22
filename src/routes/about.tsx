import { createFileRoute } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/public-header";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Kinan" },
      { name: "description", content: "Kinan International Real Estate Development Co. builds and operates residential, commercial and mixed-use destinations across Saudi Arabia." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-widest text-gold">About Kinan</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          Building places people are proud to live and work in.
        </h1>
        <div className="mt-8 space-y-5 text-muted-foreground">
          <p>
            Kinan International Real Estate Development Co. is a leading Saudi developer with a portfolio spanning
            residential towers, villa compounds, mixed-use destinations and commercial assets in Riyadh, Jeddah,
            Dammam and Madinah.
          </p>
          <p>
            We operate end-to-end: design, build, sell, lease, and serve. Our unified platform brings every customer
            journey and every back-office workflow onto a single source of truth — so residents get faster service
            and management gets sharper decisions.
          </p>
          <p>
            With ~943 customers, ~680 units under management and a growing pipeline, our north star is simple:
            do the right thing for the resident, the asset, and the books.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <Pillar n="01" t="Resident first" d="Service delivered in the customer's language, on their schedule, with full transparency." />
          <Pillar n="02" t="Asset discipline" d="Every unit, lease and ledger entry tracked, balanced and auditable." />
          <Pillar n="03" t="Community" d="Spaces and programs that bring neighbours together, not just doors and walls." />
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}

function Pillar({ n, t, d }: { n: string; t: string; d: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="font-mono text-xs text-gold">{n}</p>
      <h3 className="mt-2 text-lg font-semibold">{t}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{d}</p>
    </div>
  );
}
