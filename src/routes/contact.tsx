import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Kinan" },
      { name: "description", content: "Get in touch with Kinan sales, leasing or customer service." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-gold">Talk to us</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">We're here to help</h1>
          <p className="mt-3 text-muted-foreground">Sales, leasing, customer service, or partnership — pick the channel that fits.</p>
          <div className="mt-8 space-y-4">
            <Info icon={<Phone className="h-4 w-4" />} k="Customer service" v="920 000 000" />
            <Info icon={<Mail className="h-4 w-4" />} k="Email" v="hello@kinan.example" />
            <Info icon={<MapPin className="h-4 w-4" />} k="Headquarters" v="King Fahd Road, Riyadh, KSA" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6 sm:p-8">
            {sent ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-[oklch(0.55_0.13_155)]" />
                <h2 className="mt-3 text-xl font-semibold">Message sent</h2>
                <p className="mt-2 text-sm text-muted-foreground">We'll get back to you within one business day.</p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5"><Label htmlFor="cn">Name</Label><Input id="cn" required /></div>
                  <div className="space-y-1.5"><Label htmlFor="ce">Email</Label><Input id="ce" required type="email" /></div>
                </div>
                <div className="space-y-1.5"><Label htmlFor="cs">Subject</Label><Input id="cs" required /></div>
                <div className="space-y-1.5"><Label htmlFor="cm">Message</Label><Textarea id="cm" required rows={5} /></div>
                <Button type="submit" className="w-full">Send message</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
      <PublicFooter />
    </div>
  );
}

function Info({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-primary">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{k}</p>
        <p className="font-medium text-foreground">{v}</p>
      </div>
    </div>
  );
}
