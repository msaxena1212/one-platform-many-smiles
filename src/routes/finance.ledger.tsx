import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchJournalEntries, type JournalEntry } from "@/lib/supabase";
import { useFinanceStore } from "@/lib/finance/finance-store";
import { Loader2, Search, FileText, ArrowUpDown, Filter, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/finance/ledger")({
  component: GeneralLedger,
});

function GeneralLedger() {
  const { allLedgerTransactions, vouchers, journalEntries: storeJournalEntries } = useFinanceStore();
  const [dbEntries, setDbEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  useEffect(() => {
    fetchJournalEntries()
      .then(data => {
        setDbEntries(data || []);
      })
      .catch(err => {
        console.warn("Error loading DB journal entries:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const combinedTransactions = useMemo(() => {
    // Combine all ledger transactions from the single source of truth Finance Store
    let list = allLedgerTransactions || [];

    if (sourceFilter !== "all") {
      list = list.filter(t => t.source === sourceFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        (t.account_code || "").includes(q) ||
        (t.account_name || "").toLowerCase().includes(q) ||
        (t.reference || "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.property_name || "").toLowerCase().includes(q) ||
        (t.unit_ref || "").toLowerCase().includes(q) ||
        (t.tenant_name || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [allLedgerTransactions, search, sourceFilter]);

  const totalDebit = useMemo(() => combinedTransactions.reduce((s, t) => s + (t.debit || 0), 0), [combinedTransactions]);
  const totalCredit = useMemo(() => combinedTransactions.reduce((s, t) => s + (t.credit || 0), 0), [combinedTransactions]);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">General Ledger & Transaction Stream</h2>
          <p className="text-sm text-muted-foreground">Immutable dual-entry accounting record across all leases, PDCs, deposits, AP, and payroll.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`font-mono text-xs px-2.5 py-1 ${isBalanced ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`}>
            {isBalanced ? '✓ Dr = Cr Balanced' : '⚠ Discrepancy'}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-8 text-xs"
            onClick={() => toast.success("Exporting General Ledger to Excel/PDF...")}
          >
            <Download className="h-3.5 w-3.5" /> Export GL
          </Button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-muted/20 p-3.5 rounded-lg border">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 h-9 text-xs bg-background"
            placeholder="Search account code, account name, reference, property, unit, tenant..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="sm:col-span-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Source:</span>
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
          >
            <option value="all">All Modules & Vouchers</option>
            <option value="PDC Management">PDC Management</option>
            <option value="Security Deposits">Security Deposits</option>
            <option value="Receivables">Receivables & Invoices</option>
            <option value="Payable Invoice">Payable Invoices (AP)</option>
            <option value="Payroll Sync">Payroll & Salary</option>
            <option value="Journal Entry">Manual Journals</option>
          </select>
        </div>
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-card shadow-sm border">
          <div className="text-xs font-medium text-muted-foreground">Total Debits</div>
          <div className="text-xl font-bold font-mono text-blue-600 mt-1">
            QR {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="p-4 bg-card shadow-sm border">
          <div className="text-xs font-medium text-muted-foreground">Total Credits</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
            QR {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="p-4 bg-card shadow-sm border">
          <div className="text-xs font-medium text-muted-foreground">Total Ledger Postings</div>
          <div className="text-xl font-bold font-mono text-foreground mt-1">
            {combinedTransactions.length} lines
          </div>
        </Card>
      </div>

      {/* Ledger Table */}
      <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 border-b border-border text-left">
              <tr>
                <th className="px-4 py-3 font-bold">Date</th>
                <th className="px-4 py-3 font-bold">GL / SL Code</th>
                <th className="px-4 py-3 font-bold">Account Description</th>
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 font-bold">Reference / Entity</th>
                <th className="px-4 py-3 font-bold">Source</th>
                <th className="px-4 py-3 text-right font-bold w-32">Debit (QAR)</th>
                <th className="px-4 py-3 text-right font-bold w-32">Credit (QAR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {combinedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No ledger transactions matching criteria.
                  </td>
                </tr>
              ) : (
                combinedTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-muted-foreground whitespace-nowrap">{tx.date}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-primary">{tx.account_code}</td>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-foreground">{tx.account_name}</div>
                      {tx.description && <div className="text-[11px] text-muted-foreground truncate max-w-xs">{tx.description}</div>}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant="outline" className={`text-[10px] capitalize font-semibold ${
                        tx.account_type === 'Assets' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                        tx.account_type === 'Liabilities' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                        tx.account_type === 'Revenue' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                        tx.account_type === 'Expenses' ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-purple-700'
                      }`}>
                        {tx.account_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 font-mono">
                      <div className="font-semibold text-foreground">{tx.reference}</div>
                      {(tx.property_name || tx.unit_ref || tx.tenant_name) && (
                        <div className="text-[10px] text-muted-foreground">
                          {[tx.property_name, tx.unit_ref, tx.tenant_name].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {tx.source}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-blue-600">
                      {tx.debit > 0 ? tx.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-emerald-600">
                      {tx.credit > 0 ? tx.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {combinedTransactions.length > 0 && (
              <tfoot className="bg-muted/40 border-t-2 border-border font-bold text-xs">
                <tr>
                  <td className="px-4 py-3" colSpan={6}>Total ({combinedTransactions.length} postings)</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-blue-700">
                    QR {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                    QR {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

