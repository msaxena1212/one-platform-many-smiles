import React from 'react';
import {
  generateBilingualLeaseContractHtml,
  printBilingualLeaseContract,
  buildContractData,
  type LeaseContractData
} from '@/lib/qatar-lease-contract';

export {
  generateBilingualLeaseContractHtml,
  printBilingualLeaseContract,
  buildContractData,
  type LeaseContractData
};

export interface LeaseAgreementData extends LeaseContractData {
  tenantName: string;
  landlordName?: string;
  propertyAddress?: string;
  unit?: string;
  startDate?: string;
  endDate?: string;
  monthlyRent: number;
  securityDeposit?: number;
  depositNonRefundable?: string;
  leaseNo?: string;
  paymentFrequency?: string;
  pdcCount?: number;
  gracePeriodDays?: number;
  penalties?: string;
  maintenanceResponsibility?: string;
  utilityResponsibility?: string;
  parkingDetails?: string;
  specialConditions?: string;
  noticePeriodDays?: number;
}

/**
 * Bedroom count and furnishing for a unit, read from the units table so the printed
 * contract describes the actual unit instead of template defaults.
 */
export async function fetchUnitContractAttributes(unitCode: string): Promise<{
  bedroomCount?: string;
  furnishingStatusEn?: string;
  streetNumber?: string;
  buildingNumber?: string;
  zoneEn?: string;
}> {
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data } = await supabase
      .from('units')
      .select('bedrooms, furnishing, properties(area_zone, street_building_name, plot_building_no)')
      .or('unit_ref.eq.' + unitCode + ',unit_code.eq.' + unitCode + ',unit_name.eq.' + unitCode)
      .limit(1)
      .maybeSingle();
    const row = data as {
      bedrooms?: number | null;
      furnishing?: string | null;
      properties?: { area_zone?: string | null; street_building_name?: string | null; plot_building_no?: string | null } | null;
    } | null;
    // Street and building come from the property's own record ("Street 840", "Building No.23"), never a default.
    const digits = (s?: string | null) => (s || '').match(/\d+/)?.[0];
    const p = row?.properties;
    return {
      bedroomCount: row?.bedrooms ? String(row.bedrooms) : undefined,
      furnishingStatusEn: row?.furnishing || undefined,
      streetNumber: digits(p?.street_building_name),
      buildingNumber: digits(p?.plot_building_no),
      zoneEn: p?.area_zone ? `Zone ${p.area_zone}` : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Generates an HTML Blob of the Qatar Bilingual Lease Contract
 */
export async function generateLeaseAgreementBlob(data: LeaseAgreementData): Promise<Blob> {
  const html = generateBilingualLeaseContractHtml(data);
  return new Blob([html], { type: 'text/html;charset=utf-8' });
}

/**
 * Opens and prints / downloads the official Qatar Bilingual Lease Contract for any lease/tenant
 */
export function openAndPrintBilingualLeaseContract(data: Partial<LeaseContractData> | any): void {
  printBilingualLeaseContract(data);
}
