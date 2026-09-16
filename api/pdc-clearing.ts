import { createClient } from "@supabase/supabase-js";

interface PdcClearingResult {
  processed: number;
  cleared: number;
  bounced: number;
  journalEntriesCreated: number;
  errors: string[];
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Authorization check (Service role or Bearer token or Cron Secret)
  const cronSecret = process.env.CRON_SECRET || "zyno-pms-cron-secret";
  const authHeader = req.headers?.authorization || req.headers?.["x-cron-secret"];
  
  if (req.method === "POST" && authHeader && authHeader !== `Bearer ${cronSecret}` && authHeader !== cronSecret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rnebpqnzignwjeukgztz.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzU4ODIsImV4cCI6MjA5OTc1MTg4Mn0.maLd6Jgr8uggrfu5uZg9sjRmG0z0r7NlaMB4wIdSRTg";

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const today = new Date().toISOString().split("T")[0];
  const results: PdcClearingResult = {
    processed: 0,
    cleared: 0,
    bounced: 0,
    journalEntriesCreated: 0,
    errors: [],
  };

  try {
    // 1. Fetch deposited PDCs whose due date is on or before today
    const { data: maturingPdcs, error: fetchErr } = await supabase
      .from("fin_pdc_register")
      .select("*")
      .in("status", ["Deposited", "deposited", "Under Clearing", "under_clearing"])
      .lte("cheque_date", today);

    if (fetchErr) {
      // Fallback: check pdcs table if fin_pdc_register has no matching columns
      const { data: legacyPdcs, error: legacyErr } = await supabase
        .from("pdcs")
        .select("*")
        .in("status", ["deposited", "Deposited"])
        .lte("due_date", today);

      if (legacyErr) {
        return res.status(500).json({ error: "Failed to fetch maturing PDCs", details: fetchErr.message });
      }
    }

    const pdcsToProcess = maturingPdcs || [];
    results.processed = pdcsToProcess.length;

    for (const pdc of pdcsToProcess) {
      try {
        const pdcId = pdc.id;
        const amount = Number(pdc.amount || pdc.cheque_amount || 0);
        const chequeNo = pdc.cheque_number || pdc.cheque_no;

        // Auto-clear maturing PDC
        const { error: updateErr } = await supabase
          .from("fin_pdc_register")
          .update({
            status: "Cleared",
            cleared_at: new Date().toISOString(),
            clearing_date: today,
            updated_at: new Date().toISOString(),
          })
          .eq("id", pdcId);

        if (updateErr) {
          results.errors.push(`Failed to update PDC ${pdcId}: ${updateErr.message}`);
          continue;
        }

        results.cleared += 1;

        // Create double-entry Voucher/Journal Line: Bank DR, PDC In-Hand CR
        const jeNo = `PDC-CLR-${Date.now().toString().slice(-6)}-${chequeNo}`;
        const { data: voucher, error: voucherErr } = await supabase
          .from("fin_vouchers")
          .insert({
            voucher_no: jeNo,
            voucher_type: "receipt",
            voucher_date: today,
            party_type: "customer",
            party_id: pdc.customer_id || pdc.tenant_id,
            total_amount: amount,
            status: "posted",
            narration: `Automated clearing of PDC #${chequeNo} for Lease ${pdc.lease_id || pdc.lease_number || ""}`,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!voucherErr && voucher) {
          results.journalEntriesCreated += 1;
        }
      } catch (err: any) {
        results.errors.push(err.message || String(err));
      }
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: results,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "PDC Clearing Engine Error", message: error.message });
  }
}
