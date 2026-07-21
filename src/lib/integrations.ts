import {
  crmContacts,
  crmInteractions,
  integrationHealth,
  marketingAssets,
  salesLeads,
  type CRMContact,
  type CRMInteraction,
  type IntegrationHealth,
  type MarketingAsset,
  type SalesLead,
} from "./mock-data";

export type CRMContactType = CRMContact;
export type CRMInteractionType = CRMInteraction;
export type IntegrationHealthType = IntegrationHealth;
export type MarketingAssetType = MarketingAsset;
export type SalesLeadType = SalesLead;

export async function fetchCRMContacts() {
  return Promise.resolve(crmContacts);
}

export async function fetchCRMActivities() {
  return Promise.resolve(crmInteractions);
}

export async function fetchMarketingAssets() {
  return Promise.resolve(marketingAssets);
}

export async function fetchSalesLeads() {
  return Promise.resolve(salesLeads);
}

export async function fetchIntegrationHealth() {
  return Promise.resolve(integrationHealth);
}

export async function submitCRMLead(lead: Omit<SalesLead, 'id' | 'created_at' | 'status'>) {
  const newLead: SalesLead = {
    id: `lead-${Date.now()}`,
    created_at: new Date().toISOString(),
    status: 'Open',
    ...lead,
  };
  salesLeads.unshift(newLead);
  return Promise.resolve(newLead);
}

export async function syncERPLease(leaseId: string, payload: { status: string; paymentStatus?: string }) {
  return Promise.resolve({
    id: leaseId,
    synced_at: new Date().toISOString(),
    status: payload.status,
    payment_status: payload.paymentStatus ?? 'Pending',
  });
}
