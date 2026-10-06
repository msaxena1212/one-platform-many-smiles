import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Lock, User, Eye, EyeOff, CheckCircle2, Shield } from "lucide-react";

export const Route = createFileRoute("/portal/settings")({
  head: () => ({ meta: [{ title: "Account Settings — ZYNO Tenant Portal" }] }),
  component: CustomerSettings,
});

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Lowercase letter", ok: /[a-z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Special character (!@#$...)", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ["bg-rose-500", "bg-rose-400", "bg-amber-400", "bg-emerald-400", "bg-emerald-500"];
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0,1,2,3,4].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < score ? colors[score - 1] : "bg-muted"}`} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Strength: <span className="font-medium">{score > 0 ? labels[score - 1] : "—"}</span></p>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <div key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? "text-emerald-600" : "text-muted-foreground"}`}>
            <CheckCircle2 className={`h-3 w-3 ${c.ok ? "text-emerald-500" : "text-muted"}`} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomerSettings() {
  const [name, setName] = useState("Khalid Al-Mansouri");
  const [email, setEmail] = useState("khalid.almansouri@email.com");
  const [phone, setPhone] = useState("+974 5512 3456");
  const [emergency, setEmergency] = useState({ name: "Fatima Al-Mansouri", phone: "+974 5599 8877", relation: "Spouse" });
  const [lang, setLang] = useState("English");
  const [notifications, setNotifications] = useState({ email: true, sms: true, push: false, whatsapp: true });
  const [notifTypes, setNotifTypes] = useState({ payment: true, maintenance: true, community: false, lease: true });
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSaveProfile = () => toast.success("Profile updated successfully.");
  const handleSaveNotifications = () => toast.success("Notification preferences saved.");

  const handleChangePassword = () => {
    if (!currentPwd) return toast.error("Please enter your current password.");
    if (newPwd.length < 8) return toast.error("New password must be at least 8 characters.");
    if (newPwd !== confirmPwd) return toast.error("New passwords do not match.");
    toast.success("Password changed successfully. Please use your new password next time you log in.");
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button type="button" onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile, notifications and security</p>
      </div>

      <Tabs defaultValue="profile" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-sm">
          <TabsTrigger value="profile" className="gap-2"><User className="h-3.5 w-3.5" />Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-3.5 w-3.5" />Alerts</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Lock className="h-3.5 w-3.5" />Security</TabsTrigger>
        </TabsList>

        {/* ── Profile ── */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle><CardDescription>Update your contact and emergency details</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="p-name">Full Name</Label>
                  <Input id="p-name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-lang">Preferred Language</Label>
                  <select id="p-lang" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={lang} onChange={e => setLang(e.target.value)}>
                    <option>English</option><option>Arabic</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-email">Email Address</Label>
                  <Input id="p-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-phone">Mobile Number</Label>
                  <Input id="p-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+974 ..." />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold mb-3">Emergency Contact</h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ec-name">Name</Label>
                    <Input id="ec-name" value={emergency.name} onChange={e => setEmergency({ ...emergency, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ec-phone">Phone</Label>
                    <Input id="ec-phone" type="tel" value={emergency.phone} onChange={e => setEmergency({ ...emergency, phone: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ec-rel">Relationship</Label>
                    <Input id="ec-rel" value={emergency.relation} onChange={e => setEmergency({ ...emergency, relation: e.target.value })} />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveProfile}>Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications ── */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Notification Channels</CardTitle><CardDescription>Choose how you receive alerts from ZYNO</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {(["email", "sms", "push", "whatsapp"] as const).map(key => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="font-medium capitalize">{key === "push" ? "Push Notifications" : key === "whatsapp" ? "WhatsApp" : key.toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      {key === "email" ? "Receive emails for invoices, receipts and updates" :
                       key === "sms" ? "Get SMS alerts for payments and maintenance updates" :
                       key === "push" ? "Browser or app notifications" :
                       "WhatsApp messages for quick updates"}
                    </p>
                  </div>
                  <Toggle checked={notifications[key]} onChange={() => setNotifications({ ...notifications, [key]: !notifications[key] })} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Notification Types</CardTitle><CardDescription>Control what you get notified about</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {([
                { key: "payment", label: "Payment Reminders", desc: "Due dates, receipts and overdue alerts" },
                { key: "maintenance", label: "Maintenance Updates", desc: "Ticket status changes and technician visits" },
                { key: "lease", label: "Lease Alerts", desc: "Renewal reminders and contract updates" },
                { key: "community", label: "Community Notices", desc: "Building announcements and events" },
              ] as const).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Toggle checked={notifTypes[key]} onChange={() => setNotifTypes({ ...notifTypes, [key]: !notifTypes[key] })} />
                </div>
              ))}
              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security ── */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Change Password Form */}
            <Card>
              <CardHeader><CardTitle>Change Password</CardTitle><CardDescription>Use a strong, unique password for your account</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pw-cur">Current Password</Label>
                  <div className="relative">
                    <Input id="pw-cur" type={showCurrent ? "text" : "password"} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} className="pr-10" />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pw-new">New Password</Label>
                  <div className="relative">
                    <Input id="pw-new" type={showNew ? "text" : "password"} value={newPwd} onChange={e => setNewPwd(e.target.value)} className="pr-10" />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {newPwd && <PasswordStrength password={newPwd} />}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pw-confirm">Confirm New Password</Label>
                  <div className="relative">
                    <Input id="pw-confirm" type={showConfirm ? "text" : "password"} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className={`pr-10 ${confirmPwd && newPwd !== confirmPwd ? "border-rose-400" : ""}`} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPwd && newPwd !== confirmPwd && (
                    <p className="text-xs text-rose-500">Passwords do not match</p>
                  )}
                  {confirmPwd && newPwd === confirmPwd && newPwd.length >= 8 && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Passwords match</p>
                  )}
                </div>
                <Button onClick={handleChangePassword} className="w-full">Update Password</Button>
              </CardContent>
            </Card>

            {/* Security Info */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-emerald-500/10 p-2"><Shield className="h-5 w-5 text-emerald-600" /></div>
                    <div>
                      <p className="font-semibold text-sm">Account Status</p>
                      <p className="text-xs text-emerald-600">Active &amp; Secure</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Last login</span><span className="font-medium">Today, 08:34 AM</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Login location</span><span className="font-medium">Doha, Qatar</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">2FA</span><span className="text-amber-600 font-medium">Not enabled</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <h4 className="text-sm font-semibold mb-2">Password Requirements</h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {["Minimum 8 characters", "At least one uppercase letter", "At least one number", "At least one special character", "Do not reuse your last 3 passwords"].map((r, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />{r}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <h4 className="text-sm font-semibold mb-3">Enable Two-Factor Authentication</h4>
                  <p className="text-xs text-muted-foreground mb-3">Add an extra layer of security using an authenticator app like Google Authenticator or Microsoft Authenticator.</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => toast("2FA setup flow coming soon.")}>Setup 2FA</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
