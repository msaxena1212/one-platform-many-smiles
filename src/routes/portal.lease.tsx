import { createFileRoute } from "@tanstack/react-router";
import {
  Building2, Calendar, Clock, Home, Shield, User, Phone,
  CheckCircle2, AlertTriangle, FileText, ChevronRight, Layers, Car
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { tenantLease, formatQAR } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/portal/lease")({
  head: () => ({ meta: [{ title: "My Lease — ZYNO Tenant Portal" }] }),
  component: LeasePage,
});

function LeasePage() {
  const lease = tenantLease;

  const startMs = new Date(lease.startDate).getTime();
  const endMs = new Date(lease.endDate).getTime();
  const nowMs = Date.now();
  const totalDays = (endMs - startMs) / 86400000;
  const elapsedDays = (nowMs - startMs) / 86400000;
  const progressPct = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  const daysRemaining = Math.max(0, Math.ceil((endMs - nowMs) / 86400000));
  const noticeCutoff = new Date(endMs - lease.noticePeriodDays * 86400000).toISOString().slice(0, 10);

  const renewalColors = {
    none: "bg-muted text-muted-foreground",
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    declined: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[oklch(0.28_0.06_200)] to-[oklch(0.22_0.05_210)] p-6 text-white">
        <p className="text-xs uppercase tracking-widest opacity-70">Active Tenancy Contract</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{lease.property}</h2>
            <p className="mt-1 opacity-80">{lease.unit} &middot; {lease.floor} &middot; {lease.bedrooms} BR &middot; {lease.area} m²</p>
            <p className="mt-0.5 font-mono text-sm opacity-60">{lease.contractNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70">Annual Rent</p>
            <p className="text-2xl font-bold">{formatQAR(lease.annualRent)}</p>
            <p className="text-xs opacity-70">{lease.installments} installments · {formatQAR(lease.installmentAmount)} each</p>
          </div>
        </div>

        {/* Lease Progress */}
        <div className="mt-5">
          <div className="flex justify-between text-xs opacity-70 mb-1">
            <span>Move-in: {lease.moveInDate}</span>
            <span>{daysRemaining} days remaining</span>
            <span>Expiry: {lease.endDate}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/20">
            <div
              className="h-2 rounded-full bg-white transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs opacity-60">{progressPct.toFixed(0)}% of lease period elapsed</p>
        </div>
      </div>

      {/* Status Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard icon={<Calendar className="h-4 w-4" />} label="Lease Start" value={lease.startDate} />
        <StatusCard icon={<Calendar className="h-4 w-4" />} label="Lease Expiry" value={lease.endDate} />
        <StatusCard icon={<Clock className="h-4 w-4" />} label="Notice Required By" value={noticeCutoff} hint={`${lease.noticePeriodDays}-day notice period`} />
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            <Shield className="h-3.5 w-3.5" /> Renewal Status
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${renewalColors[lease.renewalStatus]}`}>
            {lease.renewalStatus === "none" ? "Not Initiated" : lease.renewalStatus}
          </span>
          {lease.renewalStatus === "none" && (
            <Button size="sm" className="mt-3 w-full h-7 text-xs" onClick={() => toast("Renewal request submitted. Property manager will contact you.")}>
              Request Renewal
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Unit Details */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Unit & Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit Information</h4>
                <div className="space-y-2.5 text-sm">
                  <Row k="Property" v={lease.property} />
                  <Row k="Unit Number" v={lease.unit} />
                  <Row k="Floor" v={lease.floor} />
                  <Row k="Bedrooms" v={String(lease.bedrooms)} />
                  <Row k="Unit Area" v={`${lease.area} m²`} />
                  <Row k="Parking Slot" v={lease.parkingSlot} />
                  <Row k="Unit Condition" v={lease.unitCondition} />
                </div>
              </div>
              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Financial Terms</h4>
                <div className="space-y-2.5 text-sm">
                  <Row k="Annual Rent" v={formatQAR(lease.annualRent)} />
                  <Row k="Installments" v={String(lease.installments)} />
                  <Row k="Per Installment" v={formatQAR(lease.installmentAmount)} />
                  <Row k="Security Deposit" v={formatQAR(lease.securityDeposit)} />
                </div>

                <h4 className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contract Parties</h4>
                <div className="space-y-2.5 text-sm">
                  <Row k="Landlord" v={lease.landlord} />
                  <Row k="Property Manager" v={lease.propertyManager} />
                  <Row k="PM Contact" v={lease.pmContact} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions & Move-In Checklist */}
        <div className="space-y-4">
          {/* Actions */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold">Contract Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => toast("Lease Agreement download started.")}>
                  <FileText className="h-3.5 w-3.5" /> Download Lease Agreement
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => toast("Renewal request sent to property manager.")}>
                  <ChevronRight className="h-3.5 w-3.5" /> Request Lease Renewal
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => toast("Contact request sent to property manager.")}>
                  <Phone className="h-3.5 w-3.5" /> Contact Property Manager
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => toast("Move-out notice submitted.")}>
                  <AlertTriangle className="h-3.5 w-3.5" /> Initiate Move-Out Notice
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Move-In Checklist */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold">Move-In Checklist</h3>
              <ul className="space-y-2">
                {[
                  { label: "Lease agreement signed", done: true },
                  { label: "Security deposit paid", done: true },
                  { label: "PDC cheques submitted", done: true },
                  { label: "Move-in inspection completed", done: true },
                  { label: "Keys & access cards issued", done: true },
                  { label: "Utility connections active", done: true },
                  { label: "Parking slot allocated", done: true },
                  { label: "Community rules acknowledged", done: false },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm">
                    {item.done
                      ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      : <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />}
                    <span className={item.done ? "text-foreground" : "text-amber-700 font-medium"}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notice Period Info */}
      <Card className="border-amber-200 bg-amber-50/40">
        <CardContent className="flex gap-4 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">Notice Period Reminder</p>
            <p className="mt-1 text-amber-800">
              Your lease expires on <strong>{lease.endDate}</strong>. Qatar law requires a minimum <strong>{lease.noticePeriodDays}-day written notice</strong> before vacating or non-renewal. 
              You must notify your landlord by <strong>{noticeCutoff}</strong> to avoid automatic renewal or legal obligations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
        {icon} {label}
      </div>
      <p className="text-sm font-semibold">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{k}</span>
      <span className="font-medium text-right">{v}</span>
    </div>
  );
}
