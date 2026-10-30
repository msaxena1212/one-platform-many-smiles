/**
 * Period-Based Revenue Recognition Engine
 *
 * Implements authoritative revenue recognition rules:
 * 1. Revenue is earned when the service/rental period has completed as of the As-Of Date.
 * 2. PDCs & receipts represent payment instruments / collection tracking, NOT automatic revenue.
 * 3. Early vacancy / approved termination calculates prorated revenue based on chargeable days.
 * 4. Distinct separation between Recognized (earned), Deferred (unearned), and Prorated revenue.
 * 5. Idempotency and detailed audit calculations.
 */

export type ProrationMethod = 'CALENDAR_DAYS' | '30_DAY_MONTH' | 'ACTUAL_365';

export type RevenueStatus = 'RECOGNIZED' | 'DEFERRED' | 'PARTIALLY_RECOGNIZED' | 'REVERSED';

export type RevenueReasonCode =
  | 'FULL_PERIOD'
  | 'EARLY_TERMINATION'
  | 'NEW_TENANCY_PRORATION'
  | 'LEASE_EXPIRY'
  | 'RENT_REVISION'
  | 'DISCOUNT'
  | 'WAIVER'
  | 'MANUAL_ADJUSTMENT'
  | 'CREDIT_NOTE'
  | 'DEBIT_NOTE'
  | 'REVERSAL'
  | 'TRANSFER';

export type RevenueType =
  | 'RENTAL_REVENUE'
  | 'PARKING_REVENUE'
  | 'SERVICE_CHARGE'
  | 'UTILITY_RECOVERY'
  | 'LATE_PAYMENT'
  | 'MANAGEMENT_FEE';

export interface RevenuePeriodSchedule {
  id: string;
  recognitionKey: string;
  leaseId: string;
  tenantId?: string;
  tenantName: string;
  propertyId?: string;
  propertyName: string;
  unitId?: string;
  unitRef: string;
  revenueType: RevenueType;
  periodStart: string;
  periodEnd: string;
  effectiveRevenueEnd: string;
  contractualRent: number;
  totalDaysInPeriod: number;
  recognizableDays: number;
  grossRevenue: number;
  discountOrWaiver: number;
  netRecognizedRevenue: number;
  deferredRevenue: number;
  status: RevenueStatus;
  reasonCode: RevenueReasonCode;
  recognitionDate?: string;
  calculationExplanation: string;
  pdcChequeNo?: string;
  pdcStatus?: string;
  pdcAmount?: number;
  isEarlyVacate: boolean;
}

export interface RevenueGenerationBatchSummary {
  batchId: string;
  asOfDate: string;
  prorationMethod: ProrationMethod;
  generatedAt: string;
  totalTenants: number;
  totalUnits: number;
  totalContractualRent: number;
  totalRecognizedRevenue: number;
  totalDeferredRevenue: number;
  records: RevenuePeriodSchedule[];
}

/**
 * Calculates calendar days between two ISO date strings (inclusive).
 */
export function getInclusiveDays(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Generates the monthly revenue recognition schedule for a lease as of a given date.
 */
export function calculateLeaseRevenueSchedule(params: {
  leaseId: string;
  tenantName: string;
  propertyName: string;
  unitRef: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  asOfDate: string;
  plannedVacateDate?: string;
  actualVacateDate?: string;
  effectiveRevenueEndDate?: string;
  earlyVacate?: boolean;
  prorationMethod?: ProrationMethod;
  pdcs?: Array<{ chequeNo?: string; date?: string; amount?: number; status?: string; period?: string }>;
}): RevenuePeriodSchedule[] {
  const {
    leaseId,
    tenantName,
    propertyName,
    unitRef,
    startDate,
    endDate,
    monthlyRent,
    asOfDate,
    plannedVacateDate,
    actualVacateDate,
    effectiveRevenueEndDate,
    earlyVacate,
    prorationMethod = 'CALENDAR_DAYS',
    pdcs = [],
  } = params;

  const schedules: RevenuePeriodSchedule[] = [];
  if (!startDate || !endDate || monthlyRent <= 0) return schedules;

  const leaseStart = new Date(startDate);
  const leaseEnd = new Date(endDate);
  const asOf = new Date(asOfDate || new Date().toISOString().split('T')[0]);

  // Determine effective revenue termination date: explicit override > actualVacateDate > plannedVacateDate > leaseEnd
  const approvedVacate = effectiveRevenueEndDate || actualVacateDate || (earlyVacate ? plannedVacateDate : undefined);
  const effectiveTermDate = approvedVacate ? new Date(approvedVacate) : leaseEnd;

  let currentMonthCursor = new Date(leaseStart.getFullYear(), leaseStart.getMonth(), 1);

  while (currentMonthCursor <= leaseEnd) {
    const year = currentMonthCursor.getFullYear();
    const month = currentMonthCursor.getMonth();

    // Natural start and end of this calendar month
    const naturalMonthStart = new Date(year, month, 1);
    const naturalMonthEnd = new Date(year, month + 1, 0);

    // Bounded period start and end for this lease
    const periodStart = naturalMonthStart < leaseStart ? leaseStart : naturalMonthStart;
    const periodEnd = naturalMonthEnd > leaseEnd ? leaseEnd : naturalMonthEnd;

    if (periodStart > leaseEnd || periodStart > effectiveTermDate) {
      break;
    }

    const periodStartStr = periodStart.toISOString().split('T')[0];
    const periodEndStr = periodEnd.toISOString().split('T')[0];

    // Determine effective revenue end for this specific period
    const effectivePeriodEnd = effectiveTermDate < periodEnd ? effectiveTermDate : periodEnd;
    const effectivePeriodEndStr = effectivePeriodEnd.toISOString().split('T')[0];

    // Total days in the calendar month for daily rate determination
    const daysInMonth = naturalMonthEnd.getDate();
    const chargeableDaysInPeriod = getInclusiveDays(periodStartStr, periodEndStr);

    // Is this period completed as of the As-Of Date?
    const isCompleted = effectivePeriodEnd <= asOf;

    // Daily rate based on configured methodology
    const dailyRate = prorationMethod === 'CALENDAR_DAYS'
      ? monthlyRent / daysInMonth
      : monthlyRent / 30;

    let recognizableDays = 0;
    let status: RevenueStatus = 'DEFERRED';
    let reasonCode: RevenueReasonCode = 'FULL_PERIOD';
    let isEarlyPeriod = false;

    if (effectivePeriodEnd < periodEnd) {
      // Early termination occurred within this month
      isEarlyPeriod = true;
      reasonCode = 'EARLY_TERMINATION';
      if (effectivePeriodEnd <= asOf) {
        recognizableDays = getInclusiveDays(periodStartStr, effectivePeriodEndStr);
        status = 'RECOGNIZED';
      } else {
        recognizableDays = 0;
        status = 'DEFERRED';
      }
    } else if (chargeableDaysInPeriod < daysInMonth) {
      // Mid-month lease start or normal lease expiry
      reasonCode = periodStart > naturalMonthStart ? 'NEW_TENANCY_PRORATION' : 'LEASE_EXPIRY';
      if (isCompleted) {
        recognizableDays = chargeableDaysInPeriod;
        status = 'RECOGNIZED';
      } else {
        recognizableDays = 0;
        status = 'DEFERRED';
      }
    } else {
      // Standard full month
      reasonCode = 'FULL_PERIOD';
      if (isCompleted) {
        recognizableDays = daysInMonth;
        status = 'RECOGNIZED';
      } else {
        recognizableDays = 0;
        status = 'DEFERRED';
      }
    }

    // Revenue amounts
    const fullPeriodGross = Math.round(chargeableDaysInPeriod * dailyRate * 100) / 100;
    const netRecognizedRevenue = status === 'RECOGNIZED'
      ? (recognizableDays === daysInMonth ? monthlyRent : Math.round(recognizableDays * dailyRate * 100) / 100)
      : 0;

    const deferredRevenue = status === 'DEFERRED' ? fullPeriodGross : 0;

    // Check for matching PDC
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const matchingPdc = pdcs.find((p) => {
      if (p.period && p.period.includes(monthKey)) return true;
      if (p.date && p.date.startsWith(monthKey)) return true;
      return false;
    });

    let explanation = '';
    if (status === 'RECOGNIZED') {
      if (reasonCode === 'EARLY_TERMINATION') {
        explanation = `Early vacancy on ${effectivePeriodEndStr}: ${recognizableDays} days / ${daysInMonth} days × QR ${monthlyRent.toLocaleString()} = QR ${netRecognizedRevenue.toLocaleString()}`;
      } else if (reasonCode === 'NEW_TENANCY_PRORATION' || reasonCode === 'LEASE_EXPIRY') {
        explanation = `Prorated tenancy (${periodStartStr} to ${periodEndStr}): ${recognizableDays} days × QR ${dailyRate.toFixed(2)}/day = QR ${netRecognizedRevenue.toLocaleString()}`;
      } else {
        explanation = `Full monthly period completed (${periodStartStr} to ${periodEndStr}) as of ${asOfDate} → QR ${netRecognizedRevenue.toLocaleString()} recognized.`;
      }
    } else {
      explanation = `Service period (${periodStartStr} to ${periodEndStr}) is uncompleted as of ${asOfDate} → Deferred (Unearned).`;
    }

    const recognitionKey = `${leaseId}|${periodStartStr}|${periodEndStr}|RENTAL_REVENUE`;

    schedules.push({
      id: `REV-${leaseId}-${monthKey}`,
      recognitionKey,
      leaseId,
      tenantName,
      propertyName,
      unitRef,
      revenueType: 'RENTAL_REVENUE',
      periodStart: periodStartStr,
      periodEnd: periodEndStr,
      effectiveRevenueEnd: effectivePeriodEndStr,
      contractualRent: monthlyRent,
      totalDaysInPeriod: chargeableDaysInPeriod,
      recognizableDays,
      grossRevenue: fullPeriodGross,
      discountOrWaiver: 0,
      netRecognizedRevenue,
      deferredRevenue,
      status,
      reasonCode,
      recognitionDate: status === 'RECOGNIZED' ? effectivePeriodEndStr : undefined,
      calculationExplanation: explanation,
      pdcChequeNo: matchingPdc?.chequeNo,
      pdcStatus: matchingPdc?.status,
      pdcAmount: matchingPdc?.amount,
      isEarlyVacate: isEarlyPeriod,
    });

    // Move to next month
    currentMonthCursor = new Date(year, month + 1, 1);
  }

  return schedules;
}

/**
 * Computes a portfolio-wide Revenue Recognition batch across multiple leases.
 */
export function generatePortfolioRevenueBatch(params: {
  leases: Array<{
    id: string;
    tenantName: string;
    property: string;
    unit: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    plannedVacateDate?: string;
    actualVacateDate?: string;
    effectiveRevenueEndDate?: string;
    earlyVacate?: boolean;
    status?: string;
  }>;
  asOfDate: string;
  prorationMethod?: ProrationMethod;
  pdcs?: Array<{ leaseId?: string; chequeNo?: string; date?: string; amount?: number; status?: string; period?: string }>;
}): RevenueGenerationBatchSummary {
  const { leases, asOfDate, prorationMethod = 'CALENDAR_DAYS', pdcs = [] } = params;

  const allRecords: RevenuePeriodSchedule[] = [];

  leases.forEach((lease) => {
    if (lease.status === 'draft' || lease.status === 'cancelled') return;

    const leasePdcs = pdcs.filter((p) => p.leaseId === lease.id);
    const leaseSchedule = calculateLeaseRevenueSchedule({
      leaseId: lease.id,
      tenantName: lease.tenantName,
      propertyName: lease.property,
      unitRef: lease.unit,
      startDate: lease.startDate,
      endDate: lease.endDate,
      monthlyRent: lease.monthlyRent,
      asOfDate,
      plannedVacateDate: lease.plannedVacateDate,
      actualVacateDate: lease.actualVacateDate,
      effectiveRevenueEndDate: lease.effectiveRevenueEndDate,
      earlyVacate: lease.earlyVacate,
      prorationMethod,
      pdcs: leasePdcs,
    });

    allRecords.push(...leaseSchedule);
  });

  const uniqueTenants = new Set(allRecords.map((r) => r.tenantName)).size;
  const uniqueUnits = new Set(allRecords.map((r) => r.unitRef)).size;

  const totalContractualRent = allRecords.reduce((s, r) => s + r.grossRevenue, 0);
  const totalRecognizedRevenue = allRecords.reduce((s, r) => s + r.netRecognizedRevenue, 0);
  const totalDeferredRevenue = allRecords.reduce((s, r) => s + r.deferredRevenue, 0);

  return {
    batchId: `RGB-${Date.now().toString().slice(-6)}`,
    asOfDate,
    prorationMethod,
    generatedAt: new Date().toISOString(),
    totalTenants: uniqueTenants,
    totalUnits: uniqueUnits,
    totalContractualRent,
    totalRecognizedRevenue,
    totalDeferredRevenue,
    records: allRecords,
  };
}

// ---------------------------------------------------------------------------
// Contract-period (accrual) monthly proration — used by the Property-wise P&L.
// Revenue is recognised on the days of the contract falling in each accounting
// month, irrespective of cheque clearance or cash collection.
// ---------------------------------------------------------------------------

export interface MonthRevenueProration {
  monthKey: string; // e.g. "2026-10"
  monthName: string; // e.g. "October 2026"
  periodStart: string; // "2026-10-15"
  periodEnd: string; // "2026-10-31"
  totalDaysInMonth: number; // e.g. 31
  applicableDays: number; // e.g. 17
  isFullMonth: boolean;
  dailyRate: number;
  monthlyRent: number;
  recognizedRevenue: number;
  reasonCode: RevenueReasonCode;
  explanation: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Calculates the exact contract-period accrual revenue for a single lease within a specific accounting month.
 *
 * Implements authoritative accrual rules:
 * - Full month (e.g. 1 Oct to 31 Oct): 100% of monthly rent recognized in October.
 * - Prorated mid-month (e.g. 15 Oct to 14 Nov):
 *     15–31 October (17 days) recognized in October = 17 / 31 × monthlyRent.
 *     1–14 November (14 days) recognized in November = 14 / 30 × monthlyRent.
 *
 * Irrespective of whether payment has been collected or cheques cleared.
 */
export function calculateContractPeriodMonthlyRevenue(params: {
  startDate: string;
  endDate: string;
  monthlyRent: number;
  targetMonth: string; // "YYYY-MM"
  prorationMethod?: ProrationMethod;
  effectiveRevenueEndDate?: string;
  actualVacateDate?: string;
  earlyVacate?: boolean;
}): MonthRevenueProration | null {
  const {
    startDate,
    endDate,
    monthlyRent,
    targetMonth,
    prorationMethod = 'CALENDAR_DAYS',
    effectiveRevenueEndDate,
    actualVacateDate,
    earlyVacate,
  } = params;

  if (!startDate || !endDate || monthlyRent <= 0 || !targetMonth) return null;

  const [yearStr, monthStr] = targetMonth.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;
  if (isNaN(year) || isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return null;

  const monthStart = new Date(Date.UTC(year, monthIndex, 1));
  const monthEnd = new Date(Date.UTC(year, monthIndex + 1, 0)); // Last day of month
  const totalDaysInMonth = monthEnd.getUTCDate();

  const leaseStart = new Date(startDate);
  const leaseEnd = new Date(endDate);

  // Determine effective termination if early vacated
  const approvedVacate = effectiveRevenueEndDate || actualVacateDate || (earlyVacate ? actualVacateDate : undefined);
  const effectiveTermDate = approvedVacate ? new Date(approvedVacate) : leaseEnd;

  // Bounded start and end within the target calendar month
  const periodStart = leaseStart > monthStart ? leaseStart : monthStart;
  const periodEnd = effectiveTermDate < monthEnd ? effectiveTermDate : monthEnd;

  // Check if lease overlaps with this accounting month
  if (periodStart > effectiveTermDate || periodStart > monthEnd || periodEnd < monthStart) {
    return null;
  }

  const periodStartStr = periodStart.toISOString().split('T')[0];
  const periodEndStr = periodEnd.toISOString().split('T')[0];
  const applicableDays = getInclusiveDays(periodStartStr, periodEndStr);

  if (applicableDays <= 0) return null;

  // Daily rate determination
  const dailyRate = prorationMethod === '30_DAY_MONTH'
    ? monthlyRent / 30
    : monthlyRent / totalDaysInMonth;

  const isFullMonth = applicableDays === totalDaysInMonth;
  const isEarlyTerminated = effectiveTermDate < monthEnd && approvedVacate !== undefined;

  let reasonCode: RevenueReasonCode = 'FULL_PERIOD';
  let explanation = '';

  let recognizedRevenue = 0;
  if (isFullMonth) {
    recognizedRevenue = monthlyRent;
    reasonCode = 'FULL_PERIOD';
    explanation = `Full month (${periodStartStr} to ${periodEndStr}): QR ${monthlyRent.toLocaleString()} recognized on contract period (${totalDaysInMonth}/${totalDaysInMonth} days).`;
  } else {
    recognizedRevenue = Math.round(applicableDays * dailyRate * 100) / 100;
    if (isEarlyTerminated) {
      reasonCode = 'EARLY_TERMINATION';
      explanation = `Early termination on ${periodEndStr}: ${applicableDays} of ${totalDaysInMonth} days × QR ${dailyRate.toFixed(2)}/day = QR ${recognizedRevenue.toLocaleString()} recognized on contract period.`;
    } else if (periodStart > monthStart && periodEnd < monthEnd) {
      reasonCode = 'NEW_TENANCY_PRORATION';
      explanation = `Short-term tenancy (${periodStartStr} to ${periodEndStr}): ${applicableDays} of ${totalDaysInMonth} days × QR ${dailyRate.toFixed(2)}/day = QR ${recognizedRevenue.toLocaleString()} recognized on contract period.`;
    } else if (periodStart > monthStart) {
      reasonCode = 'NEW_TENANCY_PRORATION';
      explanation = `Prorated new tenancy (${periodStartStr} to ${periodEndStr}): ${applicableDays} of ${totalDaysInMonth} days × QR ${dailyRate.toFixed(2)}/day = QR ${recognizedRevenue.toLocaleString()} recognized on contract period.`;
    } else {
      reasonCode = 'LEASE_EXPIRY';
      explanation = `Prorated lease expiry (${periodStartStr} to ${periodEndStr}): ${applicableDays} of ${totalDaysInMonth} days × QR ${dailyRate.toFixed(2)}/day = QR ${recognizedRevenue.toLocaleString()} recognized on contract period.`;
    }
  }

  const monthName = `${MONTH_NAMES[monthIndex]} ${year}`;

  return {
    monthKey: targetMonth,
    monthName,
    periodStart: periodStartStr,
    periodEnd: periodEndStr,
    totalDaysInMonth,
    applicableDays,
    isFullMonth,
    dailyRate,
    monthlyRent,
    recognizedRevenue,
    reasonCode,
    explanation,
  };
}

/**
 * Groups and aggregates contract-period recognized revenue by property for a given accounting month.
 */
export function calculatePropertyPortfolioRevenue(params: {
  leases: Array<{
    id: string;
    tenantName: string;
    property: string;
    unit: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    status?: string;
  }>;
  targetMonth: string; // "YYYY-MM"
  prorationMethod?: ProrationMethod;
}): Record<string, {
  property: string;
  totalLeases: number;
  totalContractualRent: number;
  totalRecognizedRevenue: number;
  records: MonthRevenueProration[];
}> {
  const { leases, targetMonth, prorationMethod = 'CALENDAR_DAYS' } = params;
  const result: Record<string, any> = {};

  leases.forEach((lease) => {
    if (lease.status === 'draft' || lease.status === 'cancelled') return;
    const propName = lease.property || 'Unassigned Property';

    if (!result[propName]) {
      result[propName] = {
        property: propName,
        totalLeases: 0,
        totalContractualRent: 0,
        totalRecognizedRevenue: 0,
        records: [],
      };
    }

    const proration = calculateContractPeriodMonthlyRevenue({
      startDate: lease.startDate,
      endDate: lease.endDate,
      monthlyRent: lease.monthlyRent,
      targetMonth,
      prorationMethod,
    });

    if (proration) {
      result[propName].totalLeases += 1;
      result[propName].totalContractualRent += Number(lease.monthlyRent) || 0;
      result[propName].totalRecognizedRevenue += proration.recognizedRevenue;
      result[propName].records.push({
        ...proration,
        leaseId: lease.id,
        tenantName: lease.tenantName,
        unit: lease.unit,
      });
    }
  });

  return result;
}
