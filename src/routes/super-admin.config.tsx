import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Globe, Save, Mail, Bell, Shield, Database,
  Key, Languages, Clock, Upload
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/super-admin/config")({
  head: () => ({ meta: [{ title: "Global Config — ZYNO Super Admin" }] }),
  component: ConfigPage,
});

function SectionCard({ title, description, icon, children }: {
  title: string; description: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Toggle2({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <button
        onClick={() => setChecked(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

function ConfigPage() {
  const [platformName, setPlatformName] = useState("ZYNO Property Management");
  const [supportEmail, setSupportEmail] = useState("support@zyno.com");
  const [timezone, setTimezone] = useState("Asia/Riyadh");
  const [currency, setCurrency] = useState("SAR");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");

  function handleSave(section: string) {
    toast.success(`${section} configuration saved!`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Global Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform-wide settings applied across all tenants.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Identity */}
        <SectionCard title="Platform Identity" description="Branding and display settings" icon={<Globe className="h-4 w-4" />}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input id="platform-name" value={platformName} onChange={e => setPlatformName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="support-email">Support Email</Label>
              <Input id="support-email" type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Platform Logo</Label>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">Z</div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-3.5 w-3.5" /> Upload Logo
                </Button>
              </div>
            </div>
            <Button onClick={() => handleSave("Platform Identity")} className="w-full gap-2">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </SectionCard>

        {/* Localization */}
        <SectionCard title="Localization" description="Regional and format settings" icon={<Languages className="h-4 w-4" />}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="timezone">Default Timezone</Label>
              <select
                id="timezone"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Asia/Riyadh">Asia/Riyadh (AST +3)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST +4)</option>
                <option value="Asia/Doha">Asia/Doha (AST +3)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">Default Currency</Label>
              <select
                id="currency"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="SAR">SAR — Saudi Riyal</option>
                <option value="QAR">QAR — Qatari Riyal</option>
                <option value="AED">AED — UAE Dirham</option>
                <option value="USD">USD — US Dollar</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date-format">Date Format</Label>
              <select
                id="date-format"
                value={dateFormat}
                onChange={e => setDateFormat(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <Button onClick={() => handleSave("Localization")} className="w-full gap-2">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </SectionCard>

        {/* Email & Notifications */}
        <SectionCard title="Email & Notifications" description="Global communication settings" icon={<Mail className="h-4 w-4" />}>
          <div className="space-y-2 divide-y divide-border">
            <Toggle2 label="Send welcome email on tenant onboarding" defaultChecked={true} />
            <Toggle2 label="Notify Super Admin on new tenant signup" defaultChecked={true} />
            <Toggle2 label="Email invoice on billing cycle" defaultChecked={true} />
            <Toggle2 label="Send lease renewal reminders" defaultChecked={true} />
            <Toggle2 label="Send maintenance ticket updates" defaultChecked={false} />
            <Toggle2 label="Enable SMS notifications" defaultChecked={false} />
          </div>
          <Button onClick={() => handleSave("Email & Notifications")} className="w-full gap-2 mt-4">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </SectionCard>

        {/* Security Settings */}
        <SectionCard title="Security Policies" description="Platform-wide security configuration" icon={<Shield className="h-4 w-4" />}>
          <div className="space-y-2 divide-y divide-border">
            <Toggle2 label="Enforce 2FA for Super Admins" defaultChecked={true} />
            <Toggle2 label="Enforce 2FA for Tenant Admins" defaultChecked={false} />
            <Toggle2 label="Auto-lock accounts after 5 failed attempts" defaultChecked={true} />
            <Toggle2 label="Session timeout after 8 hours" defaultChecked={true} />
            <Toggle2 label="Log all API calls to audit trail" defaultChecked={true} />
            <Toggle2 label="Enable IP allowlisting" defaultChecked={false} />
          </div>
          <Button onClick={() => handleSave("Security Policies")} className="w-full gap-2 mt-4">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </SectionCard>

        {/* Data Retention */}
        <SectionCard title="Data Retention" description="Backup and archival configuration" icon={<Database className="h-4 w-4" />}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Audit Log Retention</Label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>7 Years (Recommended)</option>
                <option>5 Years</option>
                <option>3 Years</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Deleted Record Retention</Label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>90 Days</option>
                <option>30 Days</option>
                <option>180 Days</option>
              </select>
            </div>
            <div className="space-y-2 divide-y divide-border">
              <Toggle2 label="Auto-backup daily" defaultChecked={true} />
              <Toggle2 label="Enable Point-In-Time Recovery" defaultChecked={true} />
            </div>
            <Button onClick={() => handleSave("Data Retention")} className="w-full gap-2 mt-2">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </SectionCard>

        {/* API Keys */}
        <SectionCard title="API & Integrations" description="Manage API keys and third-party integrations" icon={<Key className="h-4 w-4" />}>
          <div className="space-y-3">
            {[
              { name: "Supabase", status: "Connected", key: "eyJhbGciOi..." },
              { name: "Twilio SMS", status: "Not configured", key: "" },
              { name: "Stripe Billing", status: "Not configured", key: "" },
              { name: "SendGrid Email", status: "Connected", key: "SG.abc..." },
            ].map(integration => (
              <div key={integration.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{integration.name}</p>
                  {integration.key && (
                    <p className="text-xs font-mono text-muted-foreground">{integration.key}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${integration.status === "Connected" ? "text-emerald-600" : "text-muted-foreground"}`}>
                    {integration.status}
                  </span>
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    {integration.status === "Connected" ? "Manage" : "Configure"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
