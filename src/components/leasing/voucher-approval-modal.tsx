import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { FileCheck, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { approveAndPostVoucher, rejectVoucher, PendingVoucher } from "@/lib/finance/voucher-approval-service";
import { toast } from "sonner";

interface VoucherApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VoucherApprovalModal: React.FC<VoucherApprovalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [vouchers, setVouchers] = useState<PendingVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<{ [id: string]: string }>({});
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);

  const fetchPendingVouchers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("fin_vouchers")
        .select(`
          id,
          voucher_no,
          voucher_date,
          voucher_type,
          narration,
          total_amount,
          approval_status,
          origin_module,
          fin_voucher_lines (*)
        `)
        .eq("approval_status", "pending_approval")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVouchers((data as any) || []);
    } catch (err: any) {
      console.error("Failed to load pending vouchers:", err);
      toast.error("Could not load pending vouchers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPendingVouchers();
    }
  }, [isOpen]);

  const handleApprove = async (id: string) => {
    try {
      await approveAndPostVoucher(id);
      toast.success("Voucher approved and successfully posted to the General Ledger!");
      fetchPendingVouchers();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve voucher");
    }
  };

  const handleReject = async (id: string) => {
    const reason = rejectionReason[id] || "Rejected by Finance Manager";
    try {
      await rejectVoucher(id, reason);
      toast.success("Voucher rejected.");
      fetchPendingVouchers();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject voucher");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            Voucher Approval Workflow
          </DialogTitle>
          <DialogDescription>
            Review and approve manual draft vouchers submitted from Leasing or Operations before they post to the General Ledger.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {isLoading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Loading pending vouchers...</div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-slate-50 text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="font-medium">No pending vouchers awaiting approval</p>
              <p className="text-xs">All manual entries are currently posted or synchronized.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vouchers.map((v) => (
                <div key={v.id} className="border rounded-lg p-4 space-y-3 bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{v.voucher_no}</span>
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                          {v.voucher_type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Origin: {v.origin_module || "leasing"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Date: {v.voucher_date}</p>
                      <p className="text-sm mt-1">{v.narration}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">QAR {Number(v.total_amount || 0).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Lines breakdown */}
                  {v.lines && v.lines.length > 0 && (
                    <div className="border rounded bg-slate-50/50 p-2 text-xs">
                      <div className="grid grid-cols-4 font-semibold text-muted-foreground border-b pb-1 mb-1">
                        <div>Account</div>
                        <div>Name</div>
                        <div className="text-right">Debit</div>
                        <div className="text-right">Credit</div>
                      </div>
                      {v.lines.map((l: any, idx: number) => (
                        <div key={idx} className="grid grid-cols-4 py-0.5">
                          <div className="font-mono">{l.account_code}</div>
                          <div>{l.account_name}</div>
                          <div className="text-right">{l.debit ? `QAR ${Number(l.debit).toLocaleString()}` : "-"}</div>
                          <div className="text-right">{l.credit ? `QAR ${Number(l.credit).toLocaleString()}` : "-"}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex-1 mr-4">
                      <Input
                        placeholder="Rejection reason (if rejecting)..."
                        className="h-8 text-xs"
                        value={rejectionReason[v.id] || ""}
                        onChange={(e) => setRejectionReason({ ...rejectionReason, [v.id]: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => handleReject(v.id)}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleApprove(v.id)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Approve & Post to GL
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
