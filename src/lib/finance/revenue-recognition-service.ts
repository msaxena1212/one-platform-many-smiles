import { supabase } from "@/lib/supabase";
import { postVoucher } from "@/lib/finance/posting-engine";

export interface MonthEndAccrualResult {
  closingMonth: string;
  leasesProcessed: number;
  totalRevenueRecognized: number;
  voucherId?: string;
  errors?: string[];
}

/**
 * Executes Month-End closing for revenue recognition across active leases.
 * Automatically computes monthly rent entitlement and posts to General Ledger.
 */
export async function executeMonthEndRevenueRecognition(
  closingMonth: string, // YYYY-MM
  executedBy?: string
): Promise<MonthEndAccrualResult> {
  const result: MonthEndAccrualResult = {
    closingMonth,
    leasesProcessed: 0,
    totalRevenueRecognized: 0,
    errors: [],
  };

  try {
    // 1. Fetch all active leases covering this month
    const { data: leases, error } = await supabase
      .from("leases")
      .select("id, lease_id, tenant_name, property_id, unit_id, rent_amount, start_date, end_date, lease_status, monthly_rent")
      .in("lease_status", ["active", "fully_signed", "renewal_due"]);

    if (error) throw error;
    if (!leases || leases.length === 0) {
      return result;
    }

    const [year, month] = closingMonth.split("-").map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    let totalEarned = 0;
    const processedLeaseDetails: any[] = [];

    for (const lease of leases) {
      const leaseStart = new Date(lease.start_date);
      const leaseEnd = new Date(lease.end_date);

      // Check if lease is active during this calendar month
      if (leaseEnd >= monthStart && leaseStart <= monthEnd) {
        const monthlyRent = Number(lease.monthly_rent || lease.rent_amount || 0);
        if (monthlyRent > 0) {
          totalEarned += monthlyRent;
          result.leasesProcessed += 1;
          processedLeaseDetails.push({
            lease_id: lease.id,
            tenant_name: lease.tenant_name,
            amount: monthlyRent,
          });
        }
      }
    }

    result.totalRevenueRecognized = totalEarned;

    if (totalEarned > 0) {
      // Post Journal Entry to General Ledger:
      // DR: 1200 (Rent Receivable / Deferred Revenue Liability Reduction)
      // CR: 4000 (Rental Revenue Income)
      const postingResult = await postVoucher({
        voucher_date: monthEnd.toISOString().split("T")[0],
        voucher_type: "Journal",
        reference_no: `REV-REC-${closingMonth}`,
        description: `Automated Month-End Rental Revenue Recognition for ${closingMonth} (${result.leasesProcessed} leases)`,
        source_type: "REVENUE_RECOGNITION",
        lines: [
          {
            account_code: "1200",
            account_name: "Deferred Rental Revenue / Receivable",
            debit: totalEarned,
            credit: 0,
            description: `Accrual realization for ${closingMonth}`,
          },
          {
            account_code: "4000",
            account_name: "Rental Revenue - Operational",
            debit: 0,
            credit: totalEarned,
            description: `Rental Revenue recognized for ${closingMonth}`,
          },
        ],
      });

      result.voucherId = postingResult.voucher_id;

      // Log the month-end closing run to database
      await supabase.from("revenue_recognition_logs").insert([
        {
          closing_month: closingMonth,
          run_by: executedBy || null,
          total_leases_processed: result.leasesProcessed,
          total_revenue_recognized: totalEarned,
          journal_voucher_id: postingResult.voucher_id || null,
          status: "completed",
          details: processedLeaseDetails,
        },
      ]);
    }

    return result;
  } catch (err: any) {
    console.error("Month-end revenue recognition failed:", err);
    result.errors = [err.message || "Failed to execute revenue recognition"];
    return result;
  }
}
