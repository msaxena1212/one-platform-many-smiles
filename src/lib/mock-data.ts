// Centralized mock data for the ZYNO Property Management platform.

export type PropertyStatus = "available" | "reserved" | "sold" | "leased";

export interface Property {
  id: string; code: string; name: string; city: string; district: string;
  type: "Residential Tower" | "Villa Compound" | "Mixed Use" | "Commercial";
  units: number; occupancy: number; image: string;
  ownership_type?: string; area_zone?: string; street_building_name?: string;
  owner_landlord?: string; property_manager?: string; no_of_floors?: string;
  parking_count?: number; no_of_elevators?: number; amenities_text?: string; property_category?: string;
}

export interface Unit {
  id: string; propertyId: string; number: string;
  bedrooms: number; area: number; price: number; status: PropertyStatus;
}

export interface Lease {
  id: string; unitId: string; tenant: string; start: string; end: string;
  annualRent: number; status: "active" | "expiring" | "terminated" | "draft";
}

export interface TenantLease {
  id: string; contractNumber: string; property: string; unit: string;
  floor: string; area: number; bedrooms: number; annualRent: number;
  installments: number; installmentAmount: number; startDate: string;
  endDate: string; noticePeriodDays: number;
  renewalStatus: "none" | "pending" | "confirmed" | "declined";
  moveInDate: string; moveOutDate?: string; securityDeposit: number;
  landlord: string; propertyManager: string; pmContact: string;
  unitCondition: "Good" | "Fair" | "Needs Attention"; parkingSlot: string;
}

export interface PdcCheque {
  id: string; chequeNumber: string; bank: string; amount: number;
  dueDate: string; installmentLabel: string;
  status: "upcoming" | "cleared" | "bounced" | "cancelled";
}

export interface TenantInvoice {
  id: string; invoiceNumber: string; description: string; amount: number;
  dueDate: string; issuedDate: string; status: "paid" | "outstanding" | "overdue";
  type: "rent" | "utility" | "maintenance" | "other";
}

export interface TicketTimeline { date: string; event: string; by?: string; }

export interface Ticket {
  id: string; subject: string; description?: string; unit: string;
  property?: string; complaintArea?: string;
  category: "Carpenter" | "CCTV" | "Civil & Structural" | "Door Issue" |
    "Electrician" | "Elevator / Lift" | "Fire & Safety" | "Groutin" |
    "Housekeeping" | "HVAC & Chillers" | "Intercom" | "Mason" | "Painter" |
    "Plumber" | "Security" | "Other" | "Plumbing" | "Electrical" | "HVAC" |
    "General" | "Cleaning";
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "new" | "assigned" | "in_progress" | "resolved" | "closed";
  createdAt: string; assignee?: string; assigneePhone?: string;
  estimatedVisit?: string; resolvedAt?: string;
  timeline?: TicketTimeline[];
}

export interface Payment {
  id: string; reference: string; payer: string; amount: number;
  method: "SADAD" | "Mada" | "Apple Pay" | "STC Pay" | "Bank Transfer" | "QNB Online" | "Cheque";
  status: "pending" | "completed" | "failed" | "refunded";
  date: string; description?: string;
}

export interface JournalEntry {
  id: string; date: string; memo: string; debit: number; credit: number; account: string;
}

export interface DocumentItem {
  id: string; name: string; size: string; date: string;
  action: "download" | "sign";
  category: "Legal" | "Finance" | "Inspection" | "Policy" | "NOC & Letters";
}

export interface FacilityBooking {
  id: string; name: string; type: string; hours: string; nextSlot: string;
  status: "Confirmed" | "Available" | "Pending" | "Drop-in";
  availableSlots: number; capacity?: number; bookingFee?: number;
}

export interface MyFacilityBooking {
  id: string; facilityId: string; facilityName: string; date: string;
  time: string; status: "confirmed" | "pending" | "cancelled"; reference: string;
}

export interface CommunityPost {
  id: string; author: string; time: string; title: string; body: string;
  likes: number; comments: number;
}

export interface CommunityEvent {
  id: string; title: string; when: string; location: string; status: "Open" | "RSVP";
}

export interface CRMContact {
  id: string; name: string; company: string; role: string; email: string;
  phone: string; status: "Active" | "Inactive"; source: string; createdAt: string;
}

export interface CRMInteraction {
  id: string; contactId: string; type: "Call" | "Meeting" | "Email" | "Note";
  subject: string; date: string; owner: string; channel: string; notes: string;
}

export interface MarketingAsset {
  id: string; title: string; type: "Banner" | "Brochure" | "Video" | "Template";
  status: "Published" | "Draft" | "Archived"; updatedAt: string;
}

export interface SalesLead {
  id: string; name: string; email: string; projectInterest: string;
  stage: "New" | "Qualified" | "Negotiation" | "Won" | "Lost";
  amount: number; assignedTo: string; created_at: string; status: "Open" | "Closed";
}

export interface IntegrationHealth {
  source: string; status: "Healthy" | "Warning" | "Error"; lastSynced: string; notes: string;
}

export interface SecurityAuditLog {
  id: string; user: string; action: string; resource: string;
  outcome: "Success" | "Failed"; timestamp: string;
}

export interface ComplianceCheck {
  id: string; title: string; status: "Passed" | "Warning" | "Failed";
  lastChecked: string; details: string;
}

export interface AccessPolicy {
  id: string; name: string; description: string; enforcement: string;
  status: "Enabled" | "Disabled"; updatedAt: string;
}

export interface DataResidency { region: string; compliant: boolean; note: string; }

export interface OwnerStatement {
  id: string; period: string; gross_revenue: number; expenses: number;
  net_payable: number; paid: boolean; paid_date?: string;
}

export interface VisitorPass {
  id: string; visitorName: string; purpose: string; visitDate: string;
  visitTime: string; vehiclePlate?: string;
  status: "active" | "used" | "cancelled" | "expired";
  reference: string; createdAt: string;
}

// Seeded Data

export const tenantLease: TenantLease = {
  id: 'lease-001', contractNumber: 'ZY-2024-1201-AL',
  property: 'Al Nakheel Residences', unit: 'A-1201', floor: '12th Floor',
  area: 142, bedrooms: 2, annualRent: 60000, installments: 4,
  installmentAmount: 15000, startDate: '2024-01-01', endDate: '2026-12-31',
  noticePeriodDays: 90, renewalStatus: 'none', moveInDate: '2024-01-05',
  securityDeposit: 15000, landlord: 'Nakheel Properties W.L.L',
  propertyManager: 'Sarah Al-Kuwari', pmContact: '+974 3344 5566',
  unitCondition: 'Good', parkingSlot: 'B-045',
};

export const pdcCheques: PdcCheque[] = [
  { id: 'pdc-1', chequeNumber: 'QNB-001234', bank: 'Qatar National Bank (QNB)', amount: 15000, dueDate: '2026-01-01', installmentLabel: 'Q1 2026 Rent', status: 'cleared' },
  { id: 'pdc-2', chequeNumber: 'QNB-001235', bank: 'Qatar National Bank (QNB)', amount: 15000, dueDate: '2026-04-01', installmentLabel: 'Q2 2026 Rent', status: 'cleared' },
  { id: 'pdc-3', chequeNumber: 'QNB-001236', bank: 'Qatar National Bank (QNB)', amount: 15000, dueDate: '2026-07-01', installmentLabel: 'Q3 2026 Rent', status: 'upcoming' },
  { id: 'pdc-4', chequeNumber: 'QNB-001237', bank: 'Qatar National Bank (QNB)', amount: 15000, dueDate: '2026-10-01', installmentLabel: 'Q4 2026 Rent', status: 'upcoming' },
];

export const tenantInvoices: TenantInvoice[] = [
  { id: 'inv-1', invoiceNumber: 'INV-2026-0031', description: 'Q3 2026 Rent Installment', amount: 15000, dueDate: '2026-07-01', issuedDate: '2026-06-15', status: 'outstanding', type: 'rent' },
  { id: 'inv-2', invoiceNumber: 'INV-2026-0018', description: 'Q2 2026 Rent Installment', amount: 15000, dueDate: '2026-04-01', issuedDate: '2026-03-15', status: 'paid', type: 'rent' },
  { id: 'inv-3', invoiceNumber: 'INV-2026-0005', description: 'Q1 2026 Rent Installment', amount: 15000, dueDate: '2026-01-01', issuedDate: '2025-12-15', status: 'paid', type: 'rent' },
  { id: 'inv-4', invoiceNumber: 'INV-2026-0042', description: 'Building Maintenance Levy - Jun 2026', amount: 350, dueDate: '2026-06-30', issuedDate: '2026-06-01', status: 'overdue', type: 'maintenance' },
  { id: 'inv-5', invoiceNumber: 'INV-2026-0033', description: 'Parking Slot Renewal - A-1201', amount: 1200, dueDate: '2026-07-15', issuedDate: '2026-06-20', status: 'outstanding', type: 'other' },
];

export const properties: Property[] = [];
export const units: Unit[] = [];
export const leases: Lease[] = [];

export const tickets: Ticket[] = [
  {
    id: 'tkt-0001', subject: 'Kitchen tap leaking - constant drip',
    description: 'The hot water tap in the kitchen has been dripping continuously since Sunday.',
    unit: 'A-1201', property: 'Al Nakheel Residences', complaintArea: 'Kitchen',
    category: 'Plumber', priority: 'High', status: 'in_progress', createdAt: '2026-06-22',
    assignee: 'Mohammad Al-Balushi', assigneePhone: '+974 5566 7788',
    estimatedVisit: '2026-06-24 10:00 AM',
    timeline: [
      { date: '2026-06-22', event: 'Ticket raised by tenant', by: 'Khalid Al-Mansouri' },
      { date: '2026-06-22', event: 'Ticket reviewed and accepted', by: 'Maintenance Desk' },
      { date: '2026-06-23', event: 'Assigned to Mohammad Al-Balushi (Plumber)', by: 'Sarah Al-Kuwari' },
      { date: '2026-06-24', event: 'Technician visit scheduled - 10:00 AM', by: 'Mohammad Al-Balushi' },
    ],
  },
  {
    id: 'tkt-0002', subject: 'AC not cooling in master bedroom',
    description: 'Master bedroom split AC is running but not producing cold air. E5 error code.',
    unit: 'A-1201', property: 'Al Nakheel Residences', complaintArea: 'Bedroom',
    category: 'HVAC & Chillers', priority: 'Urgent', status: 'resolved', createdAt: '2026-05-14',
    assignee: 'Suresh Kumar', resolvedAt: '2026-05-16',
    timeline: [
      { date: '2026-05-14', event: 'Ticket raised by tenant', by: 'Khalid Al-Mansouri' },
      { date: '2026-05-14', event: 'Escalated to HVAC team - Urgent priority', by: 'Maintenance Desk' },
      { date: '2026-05-15', event: 'Suresh Kumar visited - refrigerant refill required', by: 'Suresh Kumar' },
      { date: '2026-05-16', event: 'Repair completed. AC fully operational.', by: 'Suresh Kumar' },
    ],
  },
  {
    id: 'tkt-0003', subject: 'Main door intercom not working',
    description: 'The door intercom screen is blank and not ringing when visitors press the bell.',
    unit: 'A-1201', property: 'Al Nakheel Residences', complaintArea: 'Unit / Apartment',
    category: 'Intercom', priority: 'Medium', status: 'closed', createdAt: '2026-04-03',
    assignee: 'Ali Hassan', resolvedAt: '2026-04-05',
    timeline: [
      { date: '2026-04-03', event: 'Ticket raised', by: 'Khalid Al-Mansouri' },
      { date: '2026-04-04', event: 'Ali Hassan visited - intercom unit replaced', by: 'Ali Hassan' },
      { date: '2026-04-05', event: 'Ticket closed after tenant confirmation', by: 'Sarah Al-Kuwari' },
    ],
  },
];

export const payments: Payment[] = [
  { id: 'pay-1', reference: 'RCP-2026-0018', payer: 'Khalid Al-Mansouri', amount: 15000, method: 'Cheque', status: 'completed', date: '2026-04-01', description: 'Q2 2026 Rent' },
  { id: 'pay-2', reference: 'RCP-2026-0005', payer: 'Khalid Al-Mansouri', amount: 15000, method: 'Cheque', status: 'completed', date: '2026-01-01', description: 'Q1 2026 Rent' },
  { id: 'pay-3', reference: 'RCP-2025-0048', payer: 'Khalid Al-Mansouri', amount: 15000, method: 'QNB Online', status: 'completed', date: '2025-10-01', description: 'Q4 2025 Rent' },
  { id: 'pay-4', reference: 'RCP-2025-0031', payer: 'Khalid Al-Mansouri', amount: 15000, method: 'Cheque', status: 'completed', date: '2025-07-01', description: 'Q3 2025 Rent' },
];

export const journal: JournalEntry[] = [];

export const documents: DocumentItem[] = [
  { id: 'doc-1', name: 'Lease Agreement - ZY-2024-1201-AL.pdf', size: '2.4 MB', date: '2024-01-01', action: 'download', category: 'Legal' },
  { id: 'doc-2', name: 'Lease Renewal Addendum - 2025.pdf', size: '1.1 MB', date: '2025-01-01', action: 'download', category: 'Legal' },
  { id: 'doc-3', name: 'Tenancy Contract Amendment - Parking.pdf', size: '540 KB', date: '2026-03-15', action: 'sign', category: 'Legal' },
  { id: 'doc-4', name: 'Move-In Inspection Report - Jan 2024.pdf', size: '4.8 MB', date: '2024-01-05', action: 'download', category: 'Inspection' },
  { id: 'doc-5', name: 'Q2 2026 Rent Receipt - RCP-2026-0018.pdf', size: '320 KB', date: '2026-04-01', action: 'download', category: 'Finance' },
  { id: 'doc-6', name: 'Q1 2026 Rent Receipt - RCP-2026-0005.pdf', size: '318 KB', date: '2026-01-01', action: 'download', category: 'Finance' },
  { id: 'doc-7', name: 'Building Rules and Community Policy.pdf', size: '980 KB', date: '2024-01-01', action: 'download', category: 'Policy' },
  { id: 'doc-8', name: 'NOC - Salary Certificate Embassy.pdf', size: '290 KB', date: '2026-05-12', action: 'download', category: 'NOC & Letters' },
];

export const facilities: FacilityBooking[] = [
  { id: 'fac-1', name: 'Swimming Pool', type: 'Recreational', hours: '06:00-22:00', nextSlot: 'Today 18:00-20:00', status: 'Available', availableSlots: 8, capacity: 20, bookingFee: 0 },
  { id: 'fac-2', name: 'Gymnasium', type: 'Fitness', hours: '05:30-23:00', nextSlot: 'Tomorrow 07:00-08:00', status: 'Available', availableSlots: 5, capacity: 15, bookingFee: 0 },
  { id: 'fac-3', name: 'Multi-Purpose Event Hall', type: 'Community', hours: '09:00-22:00', nextSlot: '26 Jun 17:00-20:00', status: 'Pending', availableSlots: 2, capacity: 80, bookingFee: 150 },
  { id: 'fac-4', name: 'BBQ Area Terrace B', type: 'Outdoor', hours: '16:00-23:00', nextSlot: '28 Jun 19:00-22:00', status: 'Available', availableSlots: 4, capacity: 10, bookingFee: 50 },
  { id: 'fac-5', name: 'Kids Play Room', type: 'Children', hours: '09:00-20:00', nextSlot: 'Today 10:00-12:00', status: 'Available', availableSlots: 12, capacity: 20, bookingFee: 0 },
  { id: 'fac-6', name: 'Squash Court', type: 'Sports', hours: '06:00-22:00', nextSlot: '25 Jun 19:00-20:00', status: 'Confirmed', availableSlots: 3, capacity: 4, bookingFee: 30 },
];

export const myBookings: MyFacilityBooking[] = [
  { id: 'bk-1', facilityId: 'fac-6', facilityName: 'Squash Court', date: '2026-06-25', time: '19:00-20:00', status: 'confirmed', reference: 'BK-20260625-001' },
  { id: 'bk-2', facilityId: 'fac-3', facilityName: 'Multi-Purpose Event Hall', date: '2026-06-26', time: '17:00-20:00', status: 'pending', reference: 'BK-20260626-003' },
];

export const communityPosts: CommunityPost[] = [
  { id: 'cp-1', author: 'Building Management', time: '2h', title: 'Elevator B maintenance - 24 June 8AM-12PM', body: 'Elevator B on the west side will be under scheduled maintenance on Tuesday morning. Please use Elevator A or the stairwell during this time.', likes: 12, comments: 3 },
  { id: 'cp-2', author: 'Fatima Al-Rashid (A-803)', time: '1d', title: 'Lost and found: Black umbrella near the pool deck', body: 'Found a black umbrella near the pool lounge chairs on Sunday evening. Please contact the reception or reply here if it belongs to you.', likes: 4, comments: 1 },
  { id: 'cp-3', author: 'Omar Al-Kuwari (B-402)', time: '3d', title: 'Recommendation: Shukran Laundry same-day service', body: 'Shukran Laundry at the Al Nakheel Mall has been fantastic for same-day delivery. Highly recommended!', likes: 21, comments: 7 },
];

export const communityEvents: CommunityEvent[] = [
  { id: 'ce-1', title: 'Eid Celebration and Community Gathering', when: '28 Jun 19:00', location: 'Main Lobby and Garden', status: 'RSVP' },
  { id: 'ce-2', title: 'Kids Art Workshop', when: '29 Jun 10:00', location: 'Kids Play Room', status: 'Open' },
  { id: 'ce-3', title: 'Fitness Bootcamp Rooftop Terrace', when: '30 Jun 06:30', location: 'Rooftop Terrace', status: 'Open' },
];

export const visitorPasses: VisitorPass[] = [
  { id: 'vp-1', visitorName: 'Rashid Al-Balushi', purpose: 'Family Visit', visitDate: '2026-06-25', visitTime: '14:00', status: 'active', reference: 'VP-240625-001', createdAt: '2026-06-23' },
  { id: 'vp-2', visitorName: 'IKEA Qatar Delivery', purpose: 'Furniture Delivery', visitDate: '2026-06-20', visitTime: '10:00', vehiclePlate: 'Q-42819', status: 'used', reference: 'VP-240620-003', createdAt: '2026-06-19' },
  { id: 'vp-3', visitorName: 'External Plumber AC Service', purpose: 'Pre-approved Maintenance', visitDate: '2026-06-18', visitTime: '09:00', status: 'expired', reference: 'VP-240618-001', createdAt: '2026-06-17' },
];

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

export const formatQAR = (n: number) =>
  'QAR ' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

export const formatSAR = formatQAR;