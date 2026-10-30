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
