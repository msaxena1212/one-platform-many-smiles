// Centralized mock data for the ZYNO Property Management platform skeleton.

export type PropertyStatus = "available" | "reserved" | "sold" | "leased";

export interface Property {
  id: string;
  code: string;
  name: string;
  city: string;
  district: string;
  type: "Residential Tower" | "Villa Compound" | "Mixed Use" | "Commercial";
  units: number;
  occupancy: number; // 0..1
  image: string;
  // Extended ERP fields from Property Master
  ownership_type?: string;
  area_zone?: string;
  street_building_name?: string;
  owner_landlord?: string;
  property_manager?: string;
  no_of_floors?: string;
  parking_count?: number;
  no_of_elevators?: number;
  amenities_text?: string;
  property_category?: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  number: string;
  bedrooms: number;
  area: number; // sqm
  price: number; // QAR
  status: PropertyStatus;
}

export interface Lease {
  id: string;
  unitId: string;
  tenant: string;
  start: string;
  end: string;
  annualRent: number;
  status: "active" | "expiring" | "terminated" | "draft";
}

export interface Ticket {
  id: string;
  subject: string;
  unit: string;
  category: "Plumbing" | "Electrical" | "HVAC" | "General" | "Cleaning";
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "new" | "assigned" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  assignee?: string;
}

export interface Payment {
  id: string;
  reference: string;
  payer: string;
  amount: number;
  method: "SADAD" | "Mada" | "Apple Pay" | "STC Pay" | "Bank Transfer";
  status: "pending" | "completed" | "failed" | "refunded";
  date: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  memo: string;
  debit: number;
  credit: number;
  account: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  size: string;
  date: string;
  action: "download" | "sign";
  category: "Legal" | "Finance" | "Inspection" | "Policy";
}

export interface FacilityBooking {
  id: string;
  name: string;
  type: string;
  hours: string;
  nextSlot: string;
  status: "Confirmed" | "Available" | "Pending" | "Drop-in";
  availableSlots: number;
}

export interface CommunityPost {
  id: string;
  author: string;
  time: string;
  title: string;
  body: string;
  likes: number;
  comments: number;
}

export interface CommunityEvent {
  id: string;
  title: string;
  when: string;
  location: string;
  status: "Open" | "RSVP";
}

export interface CRMContact {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  source: string;
  createdAt: string;
}

export interface CRMInteraction {
  id: string;
  contactId: string;
  type: "Call" | "Meeting" | "Email" | "Note";
  subject: string;
  date: string;
  owner: string;
  channel: string;
  notes: string;
}

export interface MarketingAsset {
  id: string;
  title: string;
  type: "Banner" | "Brochure" | "Video" | "Template";
  status: "Published" | "Draft" | "Archived";
  updatedAt: string;
}

export interface SalesLead {
  id: string;
  name: string;
  email: string;
  projectInterest: string;
  stage: "New" | "Qualified" | "Negotiation" | "Won" | "Lost";
  amount: number;
  assignedTo: string;
  created_at: string;
  status: "Open" | "Closed";
}

export interface IntegrationHealth {
  source: string;
  status: "Healthy" | "Warning" | "Error";
  lastSynced: string;
  notes: string;
}

export interface SecurityAuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  outcome: "Success" | "Failed";
  timestamp: string;
}

export interface ComplianceCheck {
  id: string;
  title: string;
  status: "Passed" | "Warning" | "Failed";
  lastChecked: string;
  details: string;
}

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  enforcement: string;
  status: "Enabled" | "Disabled";
  updatedAt: string;
}

export interface DataResidency {
  region: string;
  compliant: boolean;
  note: string;
}

export interface OwnerStatement {
  id: string;
  period: string;
  gross_revenue: number;
  expenses: number;
  net_payable: number;
  paid: boolean;
  paid_date?: string;
}

export const properties: Property[] = [];
export const units: Unit[] = [];
export const leases: Lease[] = [];
export const tickets: Ticket[] = [];
export const payments: Payment[] = [];
export const journal: JournalEntry[] = [];
export const documents: DocumentItem[] = [];
export const facilities: FacilityBooking[] = [];
export const communityPosts: CommunityPost[] = [];
export const communityEvents: CommunityEvent[] = [];
export const crmContacts: CRMContact[] = [];
export const crmInteractions: CRMInteraction[] = [];
export const marketingAssets: MarketingAsset[] = [];
export const salesLeads: SalesLead[] = [];
export const integrationHealth: IntegrationHealth[] = [];
export const securityAuditLogs: SecurityAuditLog[] = [];
export const complianceChecks: ComplianceCheck[] = [];
export const accessPolicies: AccessPolicy[] = [];
export const dataResidency: DataResidency[] = [];
export const mockOwnerStatements: OwnerStatement[] = [];

export const formatSAR = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
