import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchGLAccounts, type GLAccount } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/finance/coa")({
  component: ChartOfAccounts,
});

function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<GLAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGLAccounts().then(data => {
      setAccounts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  // Group accounts by type
  const grouped = accounts.reduce((acc, account) => {
    const type = account.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(account);
    return acc;
  }, {} as Record<string, GLAccount[]>);

  const typeOrder = ['asset', 'liability', 'equity', 'income', 'expense'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Chart of Accounts</h2>
          <p className="text-sm text-muted-foreground">Manage the general ledger accounts for financial posting.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {typeOrder.map(type => {
          if (!grouped[type] || grouped[type].length === 0) return null;
          
          return (
            <Card key={type}>
              <CardHeader className="py-4 bg-muted/30 border-b border-border">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {type}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="bg-muted/10 text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 font-medium w-32">Account Code</th>
                      <th className="px-6 py-3 font-medium">Account Name</th>
                      <th className="px-6 py-3 font-medium w-24">Currency</th>
                      <th className="px-6 py-3 font-medium text-right w-24">Postable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {grouped[type].map(acc => (
                      <tr key={acc.id} className="hover:bg-muted/10">
                        <td className="px-6 py-3 font-mono font-medium">{acc.code}</td>
                        <td className="px-6 py-3">{acc.name_en}</td>
                        <td className="px-6 py-3 text-muted-foreground">{acc.currency}</td>
                        <td className="px-6 py-3 text-right">
                          {acc.is_postable ? (
                            <span className="inline-flex items-center rounded-full bg-[oklch(0.55_0.13_155)]/15 px-2 py-0.5 text-xs font-medium text-[oklch(0.4_0.13_155)]">Yes</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
