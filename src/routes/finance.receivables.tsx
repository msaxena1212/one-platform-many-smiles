import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fetchARLedgers, ARLedger } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/finance/receivables")({
  component: FinanceReceivables,
});

function FinanceReceivables() {
  const [ledgers, setLedgers] = useState<ARLedger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchARLedgers().then(res => setLedgers(res)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Receivables</h1>
      <Card>
        <CardHeader>
          <CardTitle>Accounts Receivable Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              {ledgers.map(l => (
                <div key={l.id} className="flex justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">{l.reference}</p>
                    <p className="text-sm text-muted-foreground">{new Date(l.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">QAR {l.amount}</p>
                    <p className={`text-sm ${l.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>Balance: QAR {l.balance}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
