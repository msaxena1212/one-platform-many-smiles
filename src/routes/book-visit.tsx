import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { properties } from "@/lib/mock-data";

export const Route = createFileRoute("/book-visit")({
  head: () => ({
    meta: [
      { title: "Book a visit — ZYNO Property Management" },
      { name: "description", content: "Schedule a guided visit to any ZYNO Property Management development across the Kingdom." },
    ],
  }),
  component: BookVisit,
});

function BookVisit() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-gold">Schedule</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Book a property visit</h1>
          <p className="mt-3 text-muted-foreground">
            Pick a property, a date and a time — our sales team will confirm within one business hour.
          </p>
          <div className="mt-8 space-y-3 text-sm">
            {[
              "Personalised tour with a property specialist",
              "Full pricing, payment plans and unit options",
              "Bilingual hosts — Arabic & English",
              "Refreshments and prayer facilities on-site",
            ].map(t => (
              <p key={t} className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.55_0.13_155)]" /> {t}
              </p>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            {submitted ? (
              <div className="py-10 text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[oklch(0.55_0.13_155)]/15 text-[oklch(0.45_0.13_155)]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-xl font-semibold">Request received</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your visit reference is <span className="font-mono font-medium text-foreground">VIS-{Math.floor(Math.random() * 90000) + 10000}</span>.
                  We'll be in touch shortly.
                </p>
                <Button asChild className="mt-6"><Link to="/properties">Back to properties</Link></Button>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" id="name"><Input id="name" required placeholder="Your name" /></Field>
                  <Field label="Phone" id="phone"><Input id="phone" required type="tel" placeholder="+966 5x xxx xxxx" /></Field>
                </div>
                <Field label="Email" id="email"><Input id="email" required type="email" placeholder="you@example.com" /></Field>
                <Field label="Property of interest" id="property">
                  <select id="property" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name} — {p.city}</option>)}
                  </select>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Preferred date" id="date"><Input id="date" required type="date" /></Field>
                  <Field label="Preferred time" id="time"><Input id="time" required type="time" /></Field>
                </div>
                <Field label="Notes (optional)" id="notes"><Textarea id="notes" rows={3} placeholder="Anything we should know?" /></Field>
                <Button type="submit" className="w-full" size="lg">Request visit</Button>
                <p className="text-center text-xs text-muted-foreground">
                  By submitting, you agree to be contacted by ZYNO Property Management sales.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
      <PublicFooter />
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
