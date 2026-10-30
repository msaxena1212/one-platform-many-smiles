import { supabase } from "@/lib/supabase";
import { postVoucher } from "@/lib/finance/posting-engine";

export interface PendingVoucher {
  id: string;
  voucher_no: string;
  voucher_date: string;
  voucher_type: string;
  narration: string;
  total_amount: number;
  approval_status: "draft" | "pending_approval" | "posted" | "rejected";
  origin_module?: string;
  lines?: any[];
}

/**
 * Submits a manual voucher as draft/pending approval instead of silently dropping or shadow ledgering
 */
export async function submitVoucherForApproval(voucher: {
  voucher_type: string;
  voucher_date: string;
  narration: string;
  lines: Array<{
    account_code: string;
    account_name: string;
    debit: number;
    credit: number;
    narration?: string;
  }>;
  origin_module?: string;
}) {
  const totalAmount = voucher.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const voucherNo = `DRF-${Date.now().toString().slice(-6)}`;

  const { data, error } = await supabase
    .from("fin_vouchers")
    .insert([
      {
        voucher_no: voucherNo,
        voucher_type: voucher.voucher_type,
        voucher_date: voucher.voucher_date,
        narration: voucher.narration,
        total_amount: totalAmount,
        approval_status: "pending_approval",
        origin_module: voucher.origin_module || "leasing",
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to submit draft voucher: ${error.message}`);
  }

  // Insert lines
  if (voucher.lines && voucher.lines.length > 0 && data?.id) {
    const linesPayload = voucher.lines.map((l, idx) => ({
      voucher_id: data.id,
      line_no: idx + 1,
      account_code: l.account_code,
      account_name: l.account_name,
      debit: l.debit || 0,
      credit: l.credit || 0,
      narration: l.narration || voucher.narration,
    }));
    await supabase.from("fin_voucher_lines").insert(linesPayload);
  }

  return data;
}

/**
 * Approves a pending draft voucher and posts it to the general ledger
 */
export async function approveAndPostVoucher(voucherId: string, reviewerId?: string) {
  const { data: voucher, error: vErr } = await supabase
    .from("fin_vouchers")
    .select(`
      *,
      fin_voucher_lines (*)
    `)
    .eq("id", voucherId)
    .single();

  if (vErr || !voucher) {
    throw new Error("Voucher not found for approval.");
  }

  // Post to General Ledger using posting engine
  const postResult = await postVoucher({
    voucher_date: voucher.voucher_date,
    voucher_type: voucher.voucher_type || "Journal",
    reference_no: voucher.voucher_no,
    description: `[APPROVED] ${voucher.narration}`,
    source_type: "VOUCHER_APPROVAL",
    source_id: voucherId,
    lines: (voucher.fin_voucher_lines || []).map((l: any) => ({
      account_code: l.account_code,
      account_name: l.account_name,
      debit: Number(l.debit || 0),
      credit: Number(l.credit || 0),
      description: l.narration,
    })),
  });

  // Update voucher status
  await supabase
    .from("fin_vouchers")
    .update({
      approval_status: "posted",
      reviewed_by: reviewerId || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", voucherId);

  return postResult;
}

/**
 * Rejects a draft voucher with a reason
 */
export async function rejectVoucher(voucherId: string, reason: string, reviewerId?: string) {
  const { error } = await supabase
    .from("fin_vouchers")
    .update({
      approval_status: "rejected",
      rejection_reason: reason,
      reviewed_by: reviewerId || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", voucherId);

  if (error) throw error;
  return true;
}
