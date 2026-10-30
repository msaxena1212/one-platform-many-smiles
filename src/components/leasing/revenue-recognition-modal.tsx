import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Play, DollarSign, Calendar } from "lucide-react";
import { executeMonthEndRevenueRecognition, MonthEndAccrualResult } from "@/lib/finance/revenue-recognition-service";
import { toast } from "sonner";

interface RevenueRecognitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RevenueRecognitionModal: React.FC<RevenueRecognitionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [closingMonth, setClosingMonth] = useState(currentMonthStr);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<MonthEndAccrualResult | null>(null);

  const handleRunRecognition = async () => {
    if (!closingMonth) {
      toast.error("Please select a closing month (YYYY-MM)");
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const res = await executeMonthEndRevenueRecognition(closingMonth);
      setResult(res);
      if (res.errors && res.errors.length > 0) {
        toast.error(`Revenue recognition failed: ${res.errors[0]}`);
      } else {
        toast.success(`Recognized QAR ${res.totalRevenueRecognized.toLocaleString()} across ${res.leasesProcessed} leases.`);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to execute revenue recognition");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Month-End Rental Revenue Recognition
          </DialogTitle>
          <DialogDescription>
            Accrue and recognize earned monthly rent from deferred lease liabilities directly to the General Ledger.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <Label htmlFor="closing-month" className="flex items-center gap-1.5 text-sm font-semibold">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Accounting Closing Month (YYYY-MM)
            </Label>
            <Input
              id="closing-month"
              type="month"
              value={closingMonth}
              onChange={(e) => setClosingMonth(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          {result && (
            <div className={`p-4 rounded-lg border text-sm space-y-2 ${result.errors && result.errors.length > 0 ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
              <div className="flex items-center gap-2 font-semibold">
                {result.errors && result.errors.length > 0 ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Processing Issues Encountered
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Revenue Accrual Successfully Posted
                  </>
                )}
              </div>
              <div>
                <p><strong>Month:</strong> {result.closingMonth}</p>
                <p><strong>Active Leases Processed:</strong> {result.leasesProcessed}</p>
                <p><strong>Total Revenue Recognized:</strong> QAR {result.totalRevenueRecognized.toLocaleString()}</p>
                {result.voucherId && <p><strong>Journal Voucher ID:</strong> {result.voucherId}</p>}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Close
          </Button>
          <Button onClick={handleRunRecognition} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Play className="w-4 h-4 mr-2" />
            {isProcessing ? "Processing..." : "Run Month-End Closing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
