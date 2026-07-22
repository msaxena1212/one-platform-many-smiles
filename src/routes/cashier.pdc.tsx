import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fetchPDCs, PDC, updatePDC } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cashier/pdc")({
  component: CashierPDCs,
});

function CashierPDCs() {
  const [pdcs, setPdcs] = useState<PDC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPDCs();
  }, []);

  async function loadPDCs() {
    setLoading(true);
    fetchPDCs().then(res => setPdcs(res)).finally(() => setLoading(false));
  }

  async function handleMark(id: string, status: PDC['status']) {
    await updatePDC(id, status);
    loadPDCs();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">PDC Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Post Dated Cheques</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              {pdcs.map(pdc => (
                <div key={pdc.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">Chq: {pdc.cheque_number}</p>
                    <p className="text-sm text-muted-foreground">{pdc.bank_name} &bull; Due: {new Date(pdc.deposit_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-bold">QAR {pdc.amount}</p>
                      <p className="text-sm uppercase">{pdc.status}</p>
                    </div>
                    {pdc.status === 'held' && (
                      <div className="flex gap-2">
                         <Button size="sm" onClick={() => handleMark(pdc.id, 'deposited')}>Deposit</Button>
                         <Button size="sm" variant="destructive" onClick={() => handleMark(pdc.id, 'bounced')}>Bounce</Button>
                      </div>
                    )}
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
