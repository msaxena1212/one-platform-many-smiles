import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchJournalEntries, type JournalEntry } from "@/lib/supabase";
import { formatSAR } from "@/lib/mock-data"; // Reuse formatting for now
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/finance/ledger")({
  component: GeneralLedger,
});

function GeneralLedger() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJournalEntries().then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">General Ledger</h2>
          <p className="text-sm text-muted-foreground">Immutable record of all financial transactions.</p>
        </div>
      </div>

      <div className="space-y-6">
        {entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No journal entries found.
            </CardContent>
          </Card>
        ) : (
          entries.map(je => (
            <Card key={je.id} className="overflow-hidden">
              <div className="bg-muted/40 border-b border-border px-6 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-foreground">{je.je_no}</span>
                  <span className="text-muted-foreground">{je.posting_date}</span>
                  <span className="text-muted-foreground uppercase text-xs tracking-wider">{je.source_module}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    je.status === 'posted' ? 'bg-[oklch(0.55_0.13_155)]/15 text-[oklch(0.4_0.13_155)]' : 'bg-muted text-muted-foreground'
                  }`}>
                    {je.status}
                  </span>
                </div>
              </div>
              <div className="px-6 py-3 border-b border-border text-sm text-muted-foreground">
                {je.narration}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-2 font-medium w-16">Line</th>
                      <th className="px-6 py-2 font-medium">Account</th>
                      <th className="px-6 py-2 font-medium text-right w-32">Debit</th>
                      <th className="px-6 py-2 font-medium text-right w-32">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(je.journal_lines || []).sort((a, b) => a.line_no - b.line_no).map(line => (
                      <tr key={line.id}>
                        <td className="px-6 py-2 text-muted-foreground">{line.line_no}</td>
                        <td className="px-6 py-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs">{line.gl_accounts?.code}</span>
                            <span>{line.gl_accounts?.name_en}</span>
                          </div>
                        </td>
                        <td className="px-6 py-2 text-right font-medium">
                          {line.debit > 0 ? formatSAR(line.debit) : ""}
                        </td>
                        <td className="px-6 py-2 text-right font-medium">
                          {line.credit > 0 ? formatSAR(line.credit) : ""}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-muted/10 font-medium">
                      <td className="px-6 py-2" colSpan={2}>Totals</td>
                      <td className="px-6 py-2 text-right">
                        {formatSAR((je.journal_lines || []).reduce((sum, l) => sum + Number(l.debit), 0))}
                      </td>
                      <td className="px-6 py-2 text-right">
                        {formatSAR((je.journal_lines || []).reduce((sum, l) => sum + Number(l.credit), 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
