import { createClient } from "@supabase/supabase-js";

interface PaymentWebhookPayload {
  event: "payment.success" | "payment.failed" | "charge.succeeded" | "payment_intent.succeeded";
  gateway: "qpay" | "stripe" | "naps" | "qnb";
  transaction_id: string;
  lease_id?: string;
  customer_id?: string;
  invoice_id?: string;
  amount: number;
  currency: string;
  status: "success" | "failed";
  payment_method?: string;
  signature?: string;
  metadata?: Record<string, any>;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rnebpqnzignwjeukgztz.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzU4ODIsImV4cCI6MjA5OTc1MTg4Mn0.maLd6Jgr8uggrfu5uZg9sjRmG0z0r7NlaMB4wIdSRTg";

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const payload: PaymentWebhookPayload = req.body || {};

  try {
    const {
      transaction_id,
      gateway = "qpay",
      lease_id,
      customer_id,
      invoice_id,
      amount,
      currency = "QAR",
      status,
      payment_method = "Card",
      metadata = {},
    } = payload;

    if (!transaction_id || !amount) {
      return res.status(400).json({ error: "Missing transaction_id or amount" });
    }

    const today = new Date().toISOString().split("T")[0];
    const receiptNo = `REC-${gateway.toUpperCase()}-${transaction_id.slice(-8)}`;

    // 1. Record the payment receipt in collection_receipts
    const { data: receipt, error: receiptErr } = await supabase
      .from("collection_receipts")
      .insert({
        receipt_number: receiptNo,
        receipt_date: today,
        amount: amount,
        payment_mode: gateway === "qpay" ? "QPAY" : payment_method.toUpperCase(),
        reference_number: transaction_id,
        lease_id: lease_id || null,
        customer_id: customer_id || null,
        status: status === "success" ? "approved" : "rejected",
        notes: `Online gateway payment received via ${gateway.toUpperCase()} - Transaction Ref: ${transaction_id}`,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    // 2. If payment is successful, post a receipt voucher in fin_vouchers
    if (status === "success" || payload.event === "payment.success" || payload.event === "payment_intent.succeeded") {
      await supabase
        .from("fin_vouchers")
        .insert({
          voucher_no: `VOUCH-${receiptNo}`,
          voucher_type: "receipt",
          voucher_date: today,
          party_type: "customer",
          party_id: customer_id || lease_id,
          total_amount: amount,
          status: "posted",
          narration: `Payment gateway settlement via ${gateway.toUpperCase()} Ref: ${transaction_id}`,
          created_at: new Date().toISOString(),
        });

      // Update invoice if specified
      if (invoice_id) {
        await supabase
          .from("fin_vouchers")
          .update({ status: "settled", updated_at: new Date().toISOString() })
          .eq("voucher_no", invoice_id);
      }
    }

    return res.status(200).json({
      success: true,
      receiptNumber: receiptNo,
      message: `Webhook processed successfully for transaction ${transaction_id}`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Payment Webhook Error", message: error.message });
  }
}
