// Centralized mock data for the Kinan platform skeleton.

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
  price: number; // SAR
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

export const formatSAR = (n: number) =>
  new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(n);
