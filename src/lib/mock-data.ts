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
}

export interface Unit {
  id: string;
  propertyId: string;
  number: string;
  bedrooms: number;
  area: number; // sqm
  price: number; // USD
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

export const properties: Property[] = [
  {
    id: "p1", code: "KIN-RYD-01", name: "Al Nakheel Residences", city: "Riyadh",
    district: "Al Nakheel", type: "Residential Tower", units: 184, occupancy: 0.92,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
  },
  {
    id: "p2", code: "KIN-JED-02", name: "Al Shati Villas", city: "Jeddah",
    district: "Al Shati", type: "Villa Compound", units: 48, occupancy: 0.85,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80",
  },
  {
    id: "p3", code: "KIN-RYD-03", name: "Olaya Business Park", city: "Riyadh",
    district: "Olaya", type: "Commercial", units: 72, occupancy: 0.78,
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80",
  },
  {
    id: "p4", code: "KIN-DMM-04", name: "Corniche Heights", city: "Dammam",
    district: "Corniche", type: "Mixed Use", units: 220, occupancy: 0.88,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
  },
  {
    id: "p5", code: "KIN-MED-05", name: "Madinah Gardens", city: "Madinah",
    district: "Quba", type: "Residential Tower", units: 96, occupancy: 0.95,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
  },
  {
    id: "p6", code: "KIN-RYD-06", name: "Diplomatic Quarter Suites", city: "Riyadh",
    district: "DQ", type: "Residential Tower", units: 60, occupancy: 0.80,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
  },
];

export const units: Unit[] = [
  { id: "u1", propertyId: "p1", number: "A-1201", bedrooms: 2, area: 110, price: 880000, status: "available" },
  { id: "u2", propertyId: "p1", number: "A-1202", bedrooms: 3, area: 145, price: 1180000, status: "reserved" },
  { id: "u3", propertyId: "p1", number: "A-1305", bedrooms: 3, area: 152, price: 1240000, status: "sold" },
  { id: "u4", propertyId: "p2", number: "V-07", bedrooms: 5, area: 420, price: 3400000, status: "available" },
  { id: "u5", propertyId: "p2", number: "V-12", bedrooms: 4, area: 360, price: 2900000, status: "leased" },
  { id: "u6", propertyId: "p4", number: "C-2210", bedrooms: 2, area: 98, price: 760000, status: "available" },
];

export const leases: Lease[] = [
  { id: "l1", unitId: "u5", tenant: "Khalid Al-Mutairi", start: "2024-03-01", end: "2026-02-28", annualRent: 180000, status: "active" },
  { id: "l2", unitId: "u3", tenant: "Sara Al-Qahtani", start: "2023-09-15", end: "2025-09-14", annualRent: 95000, status: "expiring" },
  { id: "l3", unitId: "u6", tenant: "Omar Industries LLC", start: "2024-01-01", end: "2027-01-01", annualRent: 220000, status: "active" },
  { id: "l4", unitId: "u2", tenant: "Layla Al-Harbi", start: "2026-07-01", end: "2028-06-30", annualRent: 120000, status: "draft" },
];

export const tickets: Ticket[] = [
  { id: "t1", subject: "AC not cooling in master bedroom", unit: "A-1201", category: "HVAC", priority: "High", status: "in_progress", createdAt: "2026-06-20", assignee: "Faisal T." },
  { id: "t2", subject: "Leaking kitchen tap", unit: "V-12", category: "Plumbing", priority: "Medium", status: "assigned", createdAt: "2026-06-21", assignee: "Mahmoud K." },
  { id: "t3", subject: "Lobby light flickering", unit: "Common", category: "Electrical", priority: "Low", status: "new", createdAt: "2026-06-22" },
  { id: "t4", subject: "Deep clean before move-in", unit: "C-2210", category: "Cleaning", priority: "Medium", status: "resolved", createdAt: "2026-06-15", assignee: "CleanCo" },
  { id: "t5", subject: "Front door lock replacement", unit: "V-07", category: "General", priority: "Urgent", status: "new", createdAt: "2026-06-22" },
];

export const payments: Payment[] = [
  { id: "pay1", reference: "RCT-10421", payer: "Khalid Al-Mutairi", amount: 45000, method: "SADAD", status: "completed", date: "2026-06-01" },
  { id: "pay2", reference: "RCT-10422", payer: "Sara Al-Qahtani", amount: 23750, method: "Mada", status: "completed", date: "2026-06-05" },
  { id: "pay3", reference: "RCT-10423", payer: "Omar Industries LLC", amount: 55000, method: "Bank Transfer", status: "pending", date: "2026-06-20" },
  { id: "pay4", reference: "RCT-10424", payer: "Layla Al-Harbi", amount: 12000, method: "Apple Pay", status: "completed", date: "2026-06-22" },
  { id: "pay5", reference: "RCT-10425", payer: "Mohammed Al-Saud", amount: 8000, method: "STC Pay", status: "failed", date: "2026-06-22" },
];

export const journal: JournalEntry[] = [
  { id: "je1", date: "2026-06-01", memo: "Rent receipt — Lease L1", debit: 45000, credit: 0, account: "1100 Cash @ Bank" },
  { id: "je2", date: "2026-06-01", memo: "Rent receipt — Lease L1", debit: 0, credit: 45000, account: "4100 Rental Income" },
  { id: "je3", date: "2026-06-05", memo: "Rent receipt — Lease L2", debit: 23750, credit: 0, account: "1100 Cash @ Bank" },
  { id: "je4", date: "2026-06-05", memo: "Rent receipt — Lease L2", debit: 0, credit: 23750, account: "4100 Rental Income" },
  { id: "je5", date: "2026-06-10", memo: "HVAC maintenance T1", debit: 3200, credit: 0, account: "5200 Maintenance Expense" },
  { id: "je6", date: "2026-06-10", memo: "HVAC maintenance T1", debit: 0, credit: 3200, account: "2100 Accounts Payable" },
];

export interface DocumentItem {
  id: string;
  name: string;
  size: string;
  date: string;
  action: "download" | "sign";
  category: string;
}

export interface FacilityBooking {
  id: string;
  name: string;
  type: string;
  hours: string;
  nextSlot: string;
  status: string;
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
  status: string;
}

export interface CRMContact {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  status: "Active" | "Prospect" | "Inactive";
  source: string;
  createdAt: string;
}

export interface CRMInteraction {
  id: string;
  contactId: string;
  type: "Call" | "Email" | "Meeting" | "Support";
  subject: string;
  date: string;
  owner: string;
  channel: string;
  notes: string;
}

export interface MarketingAsset {
  id: string;
  title: string;
  type: "Brochure" | "Video" | "Banner" | "Email";
  status: "Draft" | "Published" | "Archived";
  updatedAt: string;
}

export interface SalesLead {
  id: string;
  name: string;
  email: string;
  projectInterest: string;
  stage: "New" | "Qualified" | "Negotiation" | "Closed";
  amount: number;
  assignedTo: string;
  created_at: string;
  status: "Open" | "Won" | "Lost";
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
  outcome: "Success" | "Failure";
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

export const documents: DocumentItem[] = [
  { id: "d1", name: "Lease agreement — A-1201", size: "248 KB", date: "2024-08-15", action: "download", category: "Legal" },
  { id: "d2", name: "Q3 2026 rent invoice", size: "92 KB", date: "2026-06-15", action: "download", category: "Finance" },
  { id: "d3", name: "Move-in inspection report", size: "1.2 MB", date: "2024-08-20", action: "download", category: "Inspection" },
  { id: "d4", name: "Lease renewal — sign required", size: "186 KB", date: "2026-06-20", action: "sign", category: "Legal" },
  { id: "d5", name: "Community house rules v3", size: "412 KB", date: "2026-01-01", action: "download", category: "Policy" },
  { id: "d6", name: "Pool access acknowledgement — sign required", size: "44 KB", date: "2026-06-10", action: "sign", category: "Facilities" },
];

export const facilities: FacilityBooking[] = [
  { id: "pool", name: "Swimming pool", type: "Amenity", hours: "06:00 – 22:00", nextSlot: "Fri · 18:00–20:00", status: "Confirmed", availableSlots: 2 },
  { id: "gym", name: "Fitness gym", type: "Amenity", hours: "24/7", nextSlot: "Open", status: "Drop-in", availableSlots: 8 },
  { id: "hall", name: "Event hall", type: "Facility", hours: "By booking", nextSlot: "Sun · 16:00–19:00", status: "Available", availableSlots: 4 },
  { id: "majlis", name: "Family majlis", type: "Facility", hours: "By booking", nextSlot: "Sat · 19:00–22:00", status: "Pending", availableSlots: 1 },
  { id: "court", name: "Padel court", type: "Amenity", hours: "06:00 – 23:00", nextSlot: "Thu · 21:00–22:00", status: "Available", availableSlots: 5 },
];

export const communityPosts: CommunityPost[] = [
  { id: "c1", author: "ZYNO Property Management Community Team", time: "2h", title: "Pool maintenance Tuesday 9 AM – 12 PM", body: "We\'ll be running our quarterly deep-clean. Thanks for your patience.", likes: 28, comments: 4 },
  { id: "c2", author: "Sara · A-805", time: "1d", title: "Lost set of car keys near lobby", body: "If found, please drop at concierge — much appreciated 🙏", likes: 18, comments: 3 },
  { id: "c3", author: "ZYNO Property Management Events", time: "3d", title: "Eid family majlis — Saturday 19:00", body: "Open to all residents. RSVP via Facility Booking.", likes: 41, comments: 9 },
];

export const communityEvents: CommunityEvent[] = [
  { id: "e1", title: "Coffee morning", when: "Fri 24 Jun · 10:00", location: "Lobby Lounge", status: "Open" },
  { id: "e2", title: "Kids movie night", when: "Sat 25 Jun · 19:00", location: "Community Hall", status: "Open" },
  { id: "e3", title: "Building town hall", when: "Wed 29 Jun · 18:00", location: "Conference Room", status: "RSVP" },
];

export const crmContacts: CRMContact[] = [
  { id: "crm1", name: "Noura Al-Faisal", company: "Kinan Real Estate", role: "Resident", email: "noura.alfaisal@example.com", phone: "+966 55 123 4567", status: "Active", source: "Mobile App", createdAt: "2026-05-01" },
  { id: "crm2", name: "Mansour Al-Shehri", company: "Kinan Leasing", role: "Investor", email: "mansour.shehri@example.com", phone: "+966 54 987 6543", status: "Prospect", source: "CRM Campaign", createdAt: "2026-04-18" },
  { id: "crm3", name: "Lina Al-Harbi", company: "Kinan Operations", role: "Service Manager", email: "lina.alharbi@example.com", phone: "+966 55 321 9876", status: "Active", source: "Referral", createdAt: "2026-06-08" },
];

export const crmInteractions: CRMInteraction[] = [
  { id: "ci1", contactId: "crm1", type: "Email", subject: "Follow-up on maintenance ticket", date: "2026-06-20", owner: "Support Team", channel: "Email", notes: "Shared status update and ETA for repair." },
  { id: "ci2", contactId: "crm2", type: "Call", subject: "Sales appointment request", date: "2026-06-18", owner: "Sales Agent", channel: "Phone", notes: "Booked discussion for villa reservation." },
  { id: "ci3", contactId: "crm3", type: "Meeting", subject: "Community event planning", date: "2026-06-15", owner: "Community Manager", channel: "In-person", notes: "Reviewed upcoming Eid majlis logistics." },
];

export const marketingAssets: MarketingAsset[] = [
  { id: "ma1", title: "Summer campaign banner", type: "Banner", status: "Published", updatedAt: "2026-06-10" },
  { id: "ma2", title: "Property brochure — Madinah Gardens", type: "Brochure", status: "Published", updatedAt: "2026-05-20" },
  { id: "ma3", title: "Reservation workflow video", type: "Video", status: "Draft", updatedAt: "2026-06-17" },
];

export const salesLeads: SalesLead[] = [
  { id: "lead1", name: "Riyad Al-Qahtani", email: "riyad.q@example.com", projectInterest: "Al Nakheel Residences", stage: "New", amount: 1200000, assignedTo: "Sales Team", created_at: "2026-06-14", status: "Open" },
  { id: "lead2", name: "Huda Al-Zahrani", email: "huda.z@example.com", projectInterest: "Corniche Heights", stage: "Qualified", amount: 900000, assignedTo: "Sales Team", created_at: "2026-06-10", status: "Open" },
  { id: "lead3", name: "Fahad Al-Mutlaq", email: "fahad.m@example.com", projectInterest: "Madinah Gardens", stage: "Negotiation", amount: 1600000, assignedTo: "Sales Team", created_at: "2026-05-28", status: "Open" },
];

export const integrationHealth: IntegrationHealth[] = [
  { source: "Kinan CRM", status: "Healthy", lastSynced: "2026-06-22 09:12", notes: "Customer data sync is current." },
  { source: "ERP Leasing", status: "Warning", lastSynced: "2026-06-22 08:45", notes: "One rent schedule failed to upsert." },
  { source: "Payment Gateway", status: "Healthy", lastSynced: "2026-06-22 09:08", notes: "No failed transactions in last 24 hours." },
];

export const securityAuditLogs: SecurityAuditLog[] = [
  { id: "alog1", user: "admin@kinan.com", action: "Login", resource: "Admin Console", outcome: "Success", timestamp: "2026-06-22 09:05" },
  { id: "alog2", user: "support@kinan.com", action: "Update ticket", resource: "Maintenance Ticket T2", outcome: "Success", timestamp: "2026-06-22 08:58" },
  { id: "alog3", user: "user@kinan.com", action: "Download document", resource: "Lease agreement", outcome: "Success", timestamp: "2026-06-21 18:37" },
];

export const complianceChecks: ComplianceCheck[] = [
  { id: "comp1", title: "PCI DSS readiness", status: "Passed", lastChecked: "2026-06-20", details: "Payment gateway integration is using tokenization." },
  { id: "comp2", title: "Data residency review", status: "Passed", lastChecked: "2026-06-18", details: "All customer data is stored within KSA region." },
  { id: "comp3", title: "MFA enforcement", status: "Warning", lastChecked: "2026-06-19", details: "Admin login requires MFA; customer login still pending enablement." },
];

export const accessPolicies: AccessPolicy[] = [
  { id: "policy1", name: "Admin MFA", description: "Require MFA for all admin users.", enforcement: "Policy Engine", status: "Enabled", updatedAt: "2026-06-19" },
  { id: "policy2", name: "Data encryption at rest", description: "AES-256 encryption for all stored data.", enforcement: "Storage layer", status: "Enabled", updatedAt: "2026-05-30" },
  { id: "policy3", name: "Least privilege access", description: "Restrict roles to least privilege.", enforcement: "IAM policies", status: "Enabled", updatedAt: "2026-06-21" },
];

export const dataResidency: DataResidency[] = [
  { region: "KSA", compliant: true, note: "Primary cloud region with full data residency enforcement." },
  { region: "EU", compliant: false, note: "No cross-border data flows currently permitted." },
];

export interface OwnerStatement {
  id: string;
  period: string;
  gross_revenue: number;
  expenses: number;
  net_payable: number;
  paid: boolean;
  paid_date?: string;
}

export const mockOwnerStatements: OwnerStatement[] = [
  { id: "stmt1", period: "June 2026", gross_revenue: 255000, expenses: 42500, net_payable: 212500, paid: true, paid_date: "2026-06-15" },
  { id: "stmt2", period: "May 2026", gross_revenue: 250000, expenses: 40000, net_payable: 210000, paid: true, paid_date: "2026-05-15" },
  { id: "stmt3", period: "April 2026", gross_revenue: 235000, expenses: 38500, net_payable: 196500, paid: false },
  { id: "stmt4", period: "March 2026", gross_revenue: 245000, expenses: 41000, net_payable: 204000, paid: true, paid_date: "2026-03-15" },
  { id: "stmt5", period: "February 2026", gross_revenue: 230000, expenses: 39000, net_payable: 191000, paid: true, paid_date: "2026-02-15" },
];

export const formatSAR = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
