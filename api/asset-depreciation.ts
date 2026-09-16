import { createClient } from "@supabase/supabase-js";

interface DepreciationSummary {
  assetsEvaluated: number;
  depreciatedAssets: number;
  totalDepreciationAmount: number;
  journalEntriesCreated: number;
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
  const currentPeriod = `${nowQatar.getUTCFullYear()}-${String(nowQatar.getUTCMonth() + 1).padStart(2, "0")}`;

  // Guard: depreciation engine only runs on 1st of the month (Qatar time).
  // The Vercel cron fires nightly; skip silently on all other days.
  if (dayOfMonth !== 1 && req.headers["x-force-run"] !== "true") {
    return res.status(200).json({
      success: true,
      skipped: true,
      reason: `Depreciation engine only runs on the 1st of each month (Qatar time). Today is the ${dayOfMonth}th.`,
      timezone: "Asia/Qatar (UTC+3)",
    });
  }

  const summary: DepreciationSummary = {
    assetsEvaluated: 0,
    depreciatedAssets: 0,
    totalDepreciationAmount: 0,
    journalEntriesCreated: 0,
    errors: [],
  };

  try {
    // 1. Fetch active fixed assets
    const { data: assets, error: assetErr } = await supabase
      .from("fixed_assets")
      .select("*")
      .in("status", ["in_service", "In Service", "active", "Active"]);

    if (assetErr) {
      return res.status(500).json({ error: "Failed to fetch fixed assets", details: assetErr.message });
    }

    summary.assetsEvaluated = (assets || []).length;

    for (const asset of (assets || [])) {
      try {
        const purchaseCost = Number(asset.purchase_cost || asset.cost || 0);
        const salvageValue = Number(asset.salvage_value || 0);
        const usefulLifeYears = Number(asset.useful_life_years || asset.useful_life || 5);
        const currentAccumDep = Number(asset.accumulated_depreciation || 0);
        const netBookValue = Number(asset.net_book_value || purchaseCost - currentAccumDep);

        if (netBookValue <= salvageValue || usefulLifeYears <= 0) {
          // Fully depreciated or invalid life
          continue;
        }

        // Straight-line monthly depreciation: (Cost - Salvage) / (Years * 12)
        const annualDep = (purchaseCost - salvageValue) / usefulLifeYears;
        const monthlyDep = Math.min(
          Math.round((annualDep / 12) * 100) / 100,
          netBookValue - salvageValue
        );

        if (monthlyDep <= 0) continue;

        const newAccumDep = currentAccumDep + monthlyDep;
        const newNBV = purchaseCost - newAccumDep;

        // Update asset balances
        const { error: updateErr } = await supabase
          .from("fixed_assets")
          .update({
            accumulated_depreciation: newAccumDep,
            net_book_value: newNBV,
            last_depreciation_date: today,
            updated_at: new Date().toISOString(),
          })
          .eq("id", asset.id);

        if (updateErr) {
          summary.errors.push(`Failed to update asset ${asset.asset_code || asset.id}: ${updateErr.message}`);
          continue;
        }

        summary.depreciatedAssets += 1;
        summary.totalDepreciationAmount += monthlyDep;

        // Post Depreciation Journal Voucher (Depreciation Expense DR / Accumulated Depreciation CR)
        const jeRef = `DEP-${asset.asset_code || asset.id.slice(0, 6)}-${currentPeriod}`;
        const { error: jeErr } = await supabase
          .from("fin_vouchers")
          .insert({
            voucher_no: jeRef,
            voucher_type: "journal",
            voucher_date: today,
            party_type: "asset",
            party_id: asset.id,
            total_amount: monthlyDep,
            status: "posted",
            narration: `Monthly straight-line depreciation for ${asset.asset_name || asset.name} (${asset.asset_code || ""}) - ${currentPeriod}`,
            created_at: new Date().toISOString(),
          });

        if (!jeErr) {
          summary.journalEntriesCreated += 1;
        }
      } catch (err: any) {
        summary.errors.push(err.message || String(err));
      }
    }

    return res.status(200).json({
      success: true,
      period: currentPeriod,
      timezone: "Asia/Qatar (UTC+3)",
      qatarDate: today,
      summary,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Asset Depreciation Engine Error", message: error.message });
  }
}
