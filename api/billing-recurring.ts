import { createClient } from "@supabase/supabase-js";

interface BillingSummary {
  activeLeasesChecked: number;
  invoicesGenerated: number;
  totalBilledAmount: number;
  errors: string[];
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Authorization check (Service role or Bearer token or Cron Secret)
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers?.authorization || req.headers?.["x-cron-secret"];
  if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}` && authHeader !== cronSecret) {
    return res.status(401).json({ error: "Unauthorized: Invalid CRON_SECRET" });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rnebpqnzignwjeukgztz.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzU4ODIsImV4cCI6MjA5OTc1MTg4Mn0.maLd6Jgr8uggrfu5uZg9sjRmG0z0r7NlaMB4wIdSRTg";

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // ── Qatar Standard Time (AST = UTC+3, no DST) ─────────────────────────────
  const QATAR_OFFSET_MS = 3 * 60 * 60 * 1000;
  const nowQatar = new Date(Date.now() + QATAR_OFFSET_MS);
  const today = nowQatar.toISOString().split("T")[0];               // YYYY-MM-DD in AST
  const dayOfMonth = nowQatar.getUTCDate();                         // Day-of-month in Qatar
  const currentMonthPeriod = `${nowQatar.getUTCFullYear()}-${String(nowQatar.getUTCMonth() + 1).padStart(2, "0")}`;

  // Guard: billing engine only runs on 1st of the month (Qatar time).
  // The Vercel cron fires nightly; skip silently on all other days.
  if (dayOfMonth !== 1 && req.headers["x-force-run"] !== "true") {
    return res.status(200).json({
      success: true,
      skipped: true,
      reason: `Billing engine only runs on the 1st of each month (Qatar time). Today is the ${dayOfMonth}th.`,
      timezone: "Asia/Qatar (UTC+3)",
    });
  }

  const summary: BillingSummary = {
    activeLeasesChecked: 0,
    invoicesGenerated: 0,
    totalBilledAmount: 0,
    errors: [],
  };

  try {
    // 1. Query active leases
    const { data: leases, error: leaseErr } = await supabase
      .from("leases")
      .select("*")
      .in("lease_status", ["active", "Active", "fully_signed", "Renewed", "renewed"])
      .lte("commencement_date", today)
      .gte("expiry_date", today);

    if (leaseErr) {
      return res.status(500).json({ error: "Failed to query active leases", details: leaseErr.message });
    }

    summary.activeLeasesChecked = (leases || []).length;

    for (const lease of (leases || [])) {
      try {
        const leaseId = lease.id || lease.lease_number;
        const customerId = lease.customer_id;
        const rentAmount = Number(lease.rental_amount || lease.monthly_rent || 0);

        if (rentAmount <= 0) continue;

        // Check if an invoice was already generated for this lease in the current billing period
        const invoiceRef = `INV-${lease.lease_number || leaseId}-${currentMonthPeriod}`;
        
        const { data: existingVoucher } = await supabase
          .from("fin_vouchers")
          .select("id")
          .eq("voucher_no", invoiceRef)
          .maybeSingle();

        if (existingVoucher) {
          // Already billed for this period
          continue;
        }

        // Create the invoice voucher
        const { error: invErr } = await supabase
          .from("fin_vouchers")
          .insert({
            voucher_no: invoiceRef,
            voucher_type: "invoice",
            voucher_date: today,
            party_type: "customer",
            party_id: customerId,
            total_amount: rentAmount,
            status: "posted",
            narration: `Automated recurring rent invoice for Lease ${lease.lease_number || leaseId} - Period ${currentMonthPeriod}`,
            created_at: new Date().toISOString(),
          });

        if (invErr) {
          summary.errors.push(`Error generating invoice for Lease ${leaseId}: ${invErr.message}`);
        } else {
          summary.invoicesGenerated += 1;
          summary.totalBilledAmount += rentAmount;
        }
      } catch (err: any) {
        summary.errors.push(err.message || String(err));
      }
    }

    return res.status(200).json({
      success: true,
      period: currentMonthPeriod,
      timezone: "Asia/Qatar (UTC+3)",
      qatarDate: today,
      summary,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Recurring Billing Engine Error", message: error.message });
  }
}
