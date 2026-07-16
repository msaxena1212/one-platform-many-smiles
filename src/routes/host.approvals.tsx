import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, CheckCircle2, XCircle, Clock, RefreshCw, ShieldCheck, AlertTriangle } from "lucide-react";
import {
  fetchApprovalRequests, createApprovalRequest, processApproval,
  type ApprovalRequest
} from "@/lib/supabase";

export const Route = createFileRoute("/host/approvals")({
  component: ApprovalsPage,
});

const TARGET_TABLES = [
  "deposit_deductions",
  "discount_overrides",
  "maintenance_escalations",
  "lease_terminations",
  "rent_waivers",
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const SEED_APPROVALS: Omit<ApprovalRequest, "id" | "created_at" | "updated_at">[] = [
  { target_record_id: "00000000-0000-4000-8000-000000000011", target_table: "deposit_deductions", requested_by: "Property Manager", amount: 1500, status: "pending", notes: "Damage deduction from security deposit for unit A-1201 — broken AC remote, repainted walls" },
  { target_record_id: "00000000-0000-4000-8000-000000000012", target_table: "discount_overrides", requested_by: "Leasing Agent", amount: 500, status: "pending", notes: "Monthly rent discount for tenant Sara Al-Qahtani — unit V-07. Requesting 3-month discount of $500/mo to retain long-term tenant" },
  { target_record_id: "00000000-0000-4000-8000-000000000013", target_table: "maintenance_escalations", requested_by: "Facilities Manager", amount: 4500, status: "pending", notes: "Emergency elevator repair — OTIS parts replacement required. Exceeds $2,000 pre-approval threshold." },
  { target_record_id: "00000000-0000-4000-8000-000000000014", target_table: "rent_waivers", requested_by: "Property Manager", amount: 4500, status: "approved", notes: "Waiver of June rent for Khalid Al-Mutairi — unit uninhabitable due to water damage. Insurance claim pending." },
  { target_record_id: "00000000-0000-4000-8000-000000000015", target_table: "lease_terminations", requested_by: "Legal", amount: 0, status: "rejected", notes: "Early termination request for Omar Industries LLC (C-2210). Rejected — contract penalty clause not met." },
];

function ApprovalsPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [showNew, setShowNew] = useState(false);
  const [reviewItem, setReviewItem] = useState<ApprovalRequest | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  const [form, setForm] = useState({
    target_table: "deposit_deductions",
    requested_by: "",
    amount: "",
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApprovalRequests();
      setRequests(data);
    } catch (e: any) { console.error(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-seed approvals when none exist
  useEffect(() => {
    if (!loading && requests.length === 0) {
      seedApprovals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function seedApprovals() {
    setSeeding(true);
    try {
      for (const a of SEED_APPROVALS) {
        await createApprovalRequest(a);
      }
      await load();
    } catch (e: any) { console.error(e.message); }
    finally { setSeeding(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createApprovalRequest({
        target_record_id: crypto.randomUUID(),
        target_table: form.target_table,
        requested_by: form.requested_by,
        amount: Number(form.amount) || undefined,
        status: "pending",
        notes: form.notes,
      });
      setShowNew(false);
      setForm({ target_table: "deposit_deductions", requested_by: "", amount: "", notes: "" });
      await load();
    } catch (e: any) { console.error(e.message); }
    finally { setSaving(false); }
  }

  async function handleDecision(id: string, decision: "approved" | "rejected") {
    setSaving(true);
    try {
      await processApproval(id, decision, reviewNotes);
      setReviewItem(null);
      setReviewNotes("");
      await load();
    } catch (e: any) { console.error(e.message); }
    finally { setSaving(false); }
  }

  const filtered = requests.filter(r => {
    if (activeTab === "all") return true;
    return r.status === activeTab;
  });

  const pendingCount = requests.filter(r => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Approval Workflows</h2>
          <p className="text-muted-foreground">Manage hierarchical approvals — deposits, discounts, escalations, waivers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Request
          </Button>
        </div>
      </div>

      {/* Auto-seed approvals when empty handled in effect below */}

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-amber-700 uppercase tracking-wider">Pending Approval</CardTitle>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">{pendingCount}</div>
            <p className="text-xs text-amber-600 mt-1">Awaiting manager action</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-green-700 uppercase tracking-wider">Approved</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{requests.filter(r => r.status === "approved").length}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-red-700 uppercase tracking-wider">Rejected</CardTitle>
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{requests.filter(r => r.status === "rejected").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">Pending {pendingCount > 0 && <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-500 px-1.5 text-[10px] font-semibold text-white">{pendingCount}</span>}</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No requests in this category. Click "Seed Sample Data" to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((req) => (
                <div key={req.id} className="p-6 hover:bg-muted/10 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[req.status]}`}>
                          {req.status}
                        </span>
                        <span className="text-xs text-muted-foreground bg-muted rounded px-2 py-0.5">{req.target_table.replace(/_/g, " ")}</span>
                        {req.amount && req.amount > 0 && (
                          <span className="text-xs font-semibold text-slate-700">${Number(req.amount).toLocaleString()}</span>
                        )}
                      </div>
                      <p className="text-sm text-foreground mt-1">{req.notes || "No details provided"}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>Requested by: <strong className="text-foreground">{req.requested_by}</strong></span>
                        <span>·</span>
                        <span>{new Date(req.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {req.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => { setReviewItem(req); }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Review
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!reviewItem} onOpenChange={() => { setReviewItem(null); setReviewNotes(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Approval Request</DialogTitle>
            <DialogDescription>{reviewItem?.target_table?.replace(/_/g, " ")} — Requested by {reviewItem?.requested_by}</DialogDescription>
          </DialogHeader>
          {reviewItem && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 text-sm">
                {reviewItem.amount && reviewItem.amount > 0 && (
                  <div className="text-lg font-bold mb-2">${Number(reviewItem.amount).toLocaleString()}</div>
                )}
                <p>{reviewItem.notes}</p>
              </div>
              <div className="space-y-1">
                <Label>Decision Notes (optional)</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="Add your reasoning for approval or rejection..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setReviewItem(null); setReviewNotes(""); }}>Cancel</Button>
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              disabled={saving}
              onClick={() => reviewItem && handleDecision(reviewItem.id, "rejected")}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
              Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              disabled={saving}
              onClick={() => reviewItem && handleDecision(reviewItem.id, "approved")}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Request Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Approval Request</DialogTitle>
            <DialogDescription>Route a decision to the appropriate manager</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <Label>Request Type *</Label>
              <Select value={form.target_table} onValueChange={v => setForm(p => ({ ...p, target_table: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TARGET_TABLES.map(t => (
                    <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Requested By *</Label>
                <Input required value={form.requested_by} onChange={e => setForm(p => ({ ...p, requested_by: e.target.value }))} placeholder="Your name / role" />
              </div>
              <div className="space-y-1">
                <Label>Amount ($)</Label>
                <Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Details / Justification *</Label>
              <Textarea required value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Describe the request and reason in full..." rows={4} />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
