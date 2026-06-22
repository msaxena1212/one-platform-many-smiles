import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { payments, journal, formatSAR } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/finance")({
  head: () => ({ meta: [{ title: "Finance — Kinan Staff" }] }),
  component: AdminFinance,
});

function AdminFinance() {
  const collected = payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const debits = journal.reduce((s, j) => s + j.debit, 0);
  const credits = journal.reduce((s, j) => s + j.credit, 0);
  const balanced = debits === credits;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Collected MTD" value={formatSAR(collected)} tone="success" delta="▲ 12%" icon={<Wallet className="h-4 w-4" />} />
        <StatCard label="Pending receipts" value={formatSAR(pending)} tone="warning" icon={<AlertCircle className="h-4 w-4" />} />
        <StatCard label="Forecast Q3" value={formatSAR(2_840_000)} tone="success" delta="On plan" icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h3 className="text-base font-semibold">General ledger — June 2026</h3>
              <p className="text-xs text-muted-foreground">All postings server-enforced and reversible</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              balanced ? "bg-[oklch(0.55_0.13_155)]/15 text-[oklch(0.4_0.13_155)]" : "bg-destructive/15 text-destructive"
            }`}>
              {balanced ? "✓ Balanced" : "⚠ Out of balance"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Memo</th>
                  <th className="px-6 py-3 font-medium">Account</th>
                  <th className="px-6 py-3 font-medium text-right">Debit</th>
                  <th className="px-6 py-3 font-medium text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {journal.map(j => (
                  <tr key={j.id}>
                    <td className="px-6 py-3 text-muted-foreground">{j.date}</td>
                    <td className="px-6 py-3">{j.memo}</td>
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{j.account}</td>
                    <td className="px-6 py-3 text-right font-medium">{j.debit ? formatSAR(j.debit) : "—"}</td>
                    <td className="px-6 py-3 text-right font-medium">{j.credit ? formatSAR(j.credit) : "—"}</td>
                  </tr>
                ))}
                <tr className="bg-muted/40 font-semibold">
                  <td className="px-6 py-3" colSpan={3}>Totals</td>
                  <td className="px-6 py-3 text-right">{formatSAR(debits)}</td>
                  <td className="px-6 py-3 text-right">{formatSAR(credits)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-semibold">Recent receipts</h3>
          <ul className="mt-4 divide-y divide-border text-sm">
            {payments.slice(0, 5).map(p => (
              <li key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{p.payer}</p>
                  <p className="text-xs text-muted-foreground">{p.reference} · {p.method} · {p.date}</p>
                </div>
                <span className="font-medium">{formatSAR(p.amount)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
