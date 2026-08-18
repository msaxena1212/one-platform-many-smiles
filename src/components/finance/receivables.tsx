import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Scale, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "@/lib/app-data-context";
import { useFinanceStore } from "@/lib/finance/finance-store";

const PAGE_SIZE = 20;

export function ReceivablesLegal() {
  const { leases } = useAppData();
  const { legalReceivables, addLegalEscalation, recoverLegalReceivable } = useFinanceStore();
  const [page, setPage] = useState(1);

  // Escalate Modal State
  const [openEscalate, setOpenEscalate] = useState(false);
  const [escalateForm, setEscalateForm] = useState({
    tenant_name: "",
    property_name: "",
    unit_ref: "",
    amount: "5500",
    reason: "Rent cheques returned unpaid; 60 days overdue notice period expired",
    legal_case_id: `LGL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    status: "Legal Notice Sent" as const,
  });

  // Recovery Modal State
  const [openRecover, setOpenRecover] = useState(false);
  const [recoverTarget, setRecoverTarget] = useState<any | null>(null);
  const [recoverAmount, setRecoverAmount] = useState("");
  const [bankRef, setBankRef] = useState("BANK-REC-");

  function handleSelectLease(leaseId: string) {
    const l = leases?.find(lease => lease.id === leaseId);
    if (l) {
      setEscalateForm(prev => ({
        ...prev,
        tenant_name: l.tenantName,
        property_name: l.property,
        unit_ref: l.unit,
        amount: String(l.monthlyRent * 2 || 5500),
      }));
    }
  }

  function submitEscalate() {
    if (!escalateForm.tenant_name || !escalateForm.amount) {
      toast.error("Please enter tenant name and amount");
      return;
    }
    const amt = parseFloat(escalateForm.amount) || 0;

    addLegalEscalation({
      legal_case_id: escalateForm.legal_case_id,
      tenant_name: escalateForm.tenant_name,
      property_name: escalateForm.property_name || "Old Salata - Residence No:23",
      unit_ref: escalateForm.unit_ref || "Unit",
      original_amount: amt,
      outstanding_balance: amt,
      escalation_date: new Date().toISOString().split("T")[0],
      reason: escalateForm.reason,
      status: escalateForm.status,
    });

    setOpenEscalate(false);
  }

  function openRecoveryModal(rec: any) {
    setRecoverTarget(rec);
    setRecoverAmount(String(rec.outstanding_balance));
    setBankRef(`REC-${rec.legal_case_id || 'PAY'}-${Date.now().toString().slice(-4)}`);
    setOpenRecover(true);
  }

  function submitRecover() {
    if (!recoverTarget) return;
    const amt = parseFloat(recoverAmount) || 0;
    if (amt <= 0 || amt > recoverTarget.outstanding_balance) {
      toast.error("Invalid recovery amount. Must be between 1 and outstanding balance.");
      return;
    }

    recoverLegalReceivable(recoverTarget.legal_case_id || recoverTarget.id, amt, bankRef);
    setOpenRecover(false);
  }

  const totalPages = Math.max(1, Math.ceil(legalReceivables.length / PAGE_SIZE));
  const paginated = legalReceivables.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalOutstanding = legalReceivables.reduce((s, r) => s + (Number(r.outstanding_balance) || 0), 0);

  return (
    <Card className="shadow-sm border-border/70">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-4 w-4 text-orange-500" />
            Legal Receivables & Overdue Default Console
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {legalReceivables.length} active legal cases • Total Outstanding: <strong className="text-rose-600 font-mono">QR {totalOutstanding.toLocaleString()}</strong>
          </p>
        </div>
        <Button size="sm" onClick={() => setOpenEscalate(true)} className="gap-1.5 text-xs bg-orange-600 hover:bg-orange-700">
          <Plus className="h-3.5 w-3.5" /> Escalate Overdue
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 text-xs">
                <TableHead className="font-bold">Case # / Date</TableHead>
                <TableHead className="font-bold">Property</TableHead>
                <TableHead className="font-bold">Unit</TableHead>
                <TableHead className="font-bold">Tenant / Legal Notice</TableHead>
                <TableHead className="text-right font-bold">Original (QAR)</TableHead>
                <TableHead className="text-right font-bold">Outstanding (QAR)</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-xs">
                    No Legal Receivables found. Click "Escalate Overdue" to register a case.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map(rec => (
                  <TableRow key={rec.id} className="hover:bg-muted/30 text-xs">
                    <TableCell>
                      <div className="font-mono font-bold text-primary">{rec.legal_case_id || `LGL-${rec.id}`}</div>
                      <div className="text-[10px] text-muted-foreground">{rec.escalation_date}</div>
                    </TableCell>
                    <TableCell className="font-medium">{rec.property_name || '—'}</TableCell>
                    <TableCell className="font-mono">{rec.unit_ref || '—'}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">{rec.tenant_name || 'Valued Tenant'}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">{rec.reason}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {Number(rec.original_amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-bold font-mono text-rose-600">
                      {Number(rec.outstanding_balance).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          rec.status === 'Fully Recovered' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                          rec.status === 'Partially Recovered' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                          'bg-rose-50 text-rose-700 border-rose-300'
                        }`}
                      >
                        {rec.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {rec.outstanding_balance > 0 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => openRecoveryModal(rec)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Recover Funds
                        </Button>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-semibold">Settled</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {legalReceivables.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, legalReceivables.length)} of {legalReceivables.length}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-7" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button key={p} size="sm" variant={p === page ? "default" : "outline"} className="h-7 w-7 p-0" onClick={() => setPage(p)}>{p}</Button>
              ))}
              <Button size="sm" variant="outline" className="h-7" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Escalate Dialog */}
      <Dialog open={openEscalate} onOpenChange={setOpenEscalate}>
        <DialogContent className="sm:max-w-lg bg-card border shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600 text-base font-bold">
              <Scale className="h-5 w-5" /> Escalate Overdue Receivable to Legal
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Transfers defaulted rent/utility receivables to Legal Account (12411) and updates the General Ledger.
            </p>
          </DialogHeader>
          <div className="space-y-3.5 py-2 text-xs">
            {leases && leases.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Select From Existing Leases</Label>
                <Select onValueChange={handleSelectLease}>
                  <SelectTrigger className="text-xs bg-background"><SelectValue placeholder="Quick fill from lease..." /></SelectTrigger>
                  <SelectContent>
                    {leases.map(l => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.tenantName} — {l.unit} ({l.property})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Tenant Name <span className="text-destructive">*</span></Label>
                <Input
                  className="text-xs bg-background"
                  placeholder="Tenant Full Name"
                  value={escalateForm.tenant_name}
                  onChange={e => setEscalateForm({...escalateForm, tenant_name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Legal Case Ref #</Label>
                <Input
                  className="text-xs font-mono bg-background"
                  value={escalateForm.legal_case_id}
                  onChange={e => setEscalateForm({...escalateForm, legal_case_id: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Property Name</Label>
                <Input
                  className="text-xs bg-background"
                  placeholder="Property Name"
                  value={escalateForm.property_name}
                  onChange={e => setEscalateForm({...escalateForm, property_name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Unit Reference</Label>
                <Input
                  className="text-xs bg-background"
                  placeholder="Flat / Unit No."
                  value={escalateForm.unit_ref}
                  onChange={e => setEscalateForm({...escalateForm, unit_ref: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Outstanding Amount (QAR) <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  className="text-xs font-mono font-bold bg-background"
                  placeholder="5500"
                  value={escalateForm.amount}
                  onChange={e => setEscalateForm({...escalateForm, amount: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Legal Action Status</Label>
                <Select
                  value={escalateForm.status}
                  onValueChange={(v: any) => setEscalateForm({...escalateForm, status: v})}
                >
                  <SelectTrigger className="text-xs bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Legal Notice Sent">Legal Notice Sent (7-Day Notice)</SelectItem>
                    <SelectItem value="Court Case Filed">Rental Dispute Committee Filed</SelectItem>
                    <SelectItem value="Under Negotiation">Under Negotiation / Settlement</SelectItem>
                    <SelectItem value="Eviction Notice Issued">Eviction Notice Issued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Reason & Chronology for Legal Escalation</Label>
              <Textarea
                rows={2}
                className="text-xs bg-background resize-none"
                placeholder="Details on non-payment, returned cheques, and contact attempts..."
                value={escalateForm.reason}
                onChange={e => setEscalateForm({...escalateForm, reason: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter className="border-t pt-3">
            <Button variant="outline" onClick={() => setOpenEscalate(false)}>Cancel</Button>
            <Button onClick={submitEscalate} className="bg-orange-600 hover:bg-orange-700">
              Confirm & Post Escalation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recover Funds Dialog */}
      <Dialog open={openRecover} onOpenChange={setOpenRecover}>
        <DialogContent className="sm:max-w-md bg-card border shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600 text-base font-bold">
              <CheckCircle2 className="h-5 w-5" /> Record Legal Settlement & Recovery
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Credits Legal Receivables (12411) and Debits Bank Operating Account (12000).
            </p>
          </DialogHeader>
          {recoverTarget && (
            <div className="space-y-3 py-2 text-xs">
              <div className="bg-muted/40 p-3 rounded-lg border space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Case Reference:</span>
                  <span className="font-mono font-bold">{recoverTarget.legal_case_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tenant:</span>
                  <span className="font-semibold">{recoverTarget.tenant_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Outstanding:</span>
                  <span className="font-bold text-rose-600 font-mono">QR {Number(recoverTarget.outstanding_balance).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Recovery Amount (QAR) <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  className="text-xs font-mono font-bold bg-background"
                  value={recoverAmount}
                  onChange={e => setRecoverAmount(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Bank / Receipt Reference <span className="text-destructive">*</span></Label>
                <Input
                  className="text-xs font-mono bg-background"
                  value={bankRef}
                  onChange={e => setBankRef(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter className="border-t pt-3">
            <Button variant="outline" onClick={() => setOpenRecover(false)}>Cancel</Button>
            <Button onClick={submitRecover} className="bg-emerald-600 hover:bg-emerald-700">
              Confirm Receipt & Post Journal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
