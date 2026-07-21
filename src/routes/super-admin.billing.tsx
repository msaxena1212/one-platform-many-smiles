import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, CheckCircle2, TrendingUp, Wallet, AlertTriangle, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/super-admin/billing")({
  head: () => ({ meta: [{ title: "Billing & Plans — ZYNO Super Admin" }] }),
  component: BillingPage,
});

const PLANS = [
  {
    name: "Starter",
    price: "SAR 299",
    period: "/month",
    description: "For small landlords with 1 property.",
    color: "border-border",
    features: ["Up to 1 Property", "10 Units", "Basic Finance", "Email Support"],
    tenants: 3,
  },
  {
    name: "Professional",
    price: "SAR 999",
    period: "/month",
    description: "For growing property managers.",
    color: "border-primary",
    highlight: true,
    features: ["Up to 10 Properties", "100 Units", "Full Finance Module", "HRMS", "Priority Support"],
    tenants: 8,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large-scale operations & chains.",
    color: "border-purple-500",
    features: ["Unlimited Properties", "Unlimited Units", "All Modules", "Dedicated Account Manager", "SLA"],
    tenants: 2,
  },
];

const INVOICES = [
  { id: "INV-2026-001", tenant: "Al Baraka Properties LLC", plan: "Professional", amount: "SAR 999", date: "2026-07-01", status: "Paid" },
  { id: "INV-2026-002", tenant: "Doha Realty Group", plan: "Enterprise", amount: "SAR 4,500", date: "2026-07-01", status: "Paid" },
  { id: "INV-2026-003", tenant: "Pearl Tower Mgmt", plan: "Starter", amount: "SAR 299", date: "2026-07-05", status: "Overdue" },
  { id: "INV-2026-004", tenant: "Gulf Housing Co.", plan: "Professional", amount: "SAR 999", date: "2026-07-10", status: "Pending" },
  { id: "INV-2026-005", tenant: "Westbay Holdings", plan: "Professional", amount: "SAR 999", date: "2026-07-15", status: "Paid" },
];

const STATUS_COLORS: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-700",
};

function BillingPage() {
  const totalMRR = 999 * 8 + 299 * 3 + 4500 * 2;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage subscription plans and monitor platform revenue.</p>
      </div>

      {/* Revenue Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Monthly Revenue (MRR)</p>
            <Wallet className="h-4 w-4 text-primary opacity-70" />
          </div>
          <p className="text-2xl font-bold">SAR {totalMRR.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 mt-1">▲ 14% vs last month</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Active Subscriptions</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-70" />
          </div>
          <p className="text-2xl font-bold">13</p>
          <p className="text-xs text-muted-foreground mt-1">Across all plans</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Overdue Invoices</p>
            <AlertTriangle className="h-4 w-4 text-red-500 opacity-70" />
          </div>
          <p className="text-2xl font-bold text-red-600">1</p>
          <p className="text-xs text-muted-foreground mt-1">Requires follow-up</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Churn Rate (30d)</p>
            <TrendingUp className="h-4 w-4 text-primary opacity-70" />
          </div>
          <p className="text-2xl font-bold">0%</p>
          <p className="text-xs text-emerald-600 mt-1">No cancellations</p>
        </CardContent></Card>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-base font-semibold mb-4">Subscription Plans</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {PLANS.map(plan => (
            <Card key={plan.name} className={`border-2 ${plan.color} relative`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-xs">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-5">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {plan.tenants} active tenants
                  </span>
                  <Button size="sm" variant="outline">Edit Plan</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Invoice Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Invoices</CardTitle>
          <CardDescription>Platform billing history across all tenants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left py-3 pr-4">Invoice</th>
                  <th className="text-left py-3 pr-4">Tenant</th>
                  <th className="text-left py-3 pr-4">Plan</th>
                  <th className="text-right py-3 pr-4">Amount</th>
                  <th className="text-left py-3 pr-4">Date</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {INVOICES.map(inv => (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs">{inv.id}</td>
                    <td className="py-3 pr-4 font-medium">{inv.tenant}</td>
                    <td className="py-3 pr-4"><Badge variant="outline" className="text-xs">{inv.plan}</Badge></td>
                    <td className="py-3 pr-4 text-right font-semibold">{inv.amount}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{inv.date}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[inv.status]}`}>
                        {inv.status}
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
  );
}
