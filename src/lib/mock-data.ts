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

// =====================================================================
// REAL PROPERTY DATA — Qatar (from Real Estate - Simerjith.xlsx)
// 23 Properties | City: Doha | Manager: Jithin Abdul Latheef
// =====================================================================
export const properties: Property[] = [
  {
    id: 'p1', code: 'AAA', name: 'OLD SALATA - BLDG23',
    city: 'Doha', district: 'Area 18', type: 'Residential Tower',
    units: 44, occupancy: 0.75,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '18', street_building_name: 'Street 840',
    owner_landlord: 'Sheikh Hassan Al-Thani', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: 'GF + 7', parking_count: 9, no_of_elevators: 2,
    amenities_text: 'Covered Parking, Security / CCTV, Reception / Lobby, Elevator / Lift, Waste Disposal, Wifi/Internet',
    property_category: 'Building',
  },
  {
    id: 'p2', code: 'OLD SALATA 2', name: 'OLD SALATA - BLDG13',
    city: 'Doha', district: 'Area 18', type: 'Residential Tower',
    units: 28, occupancy: 0.89,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '18', street_building_name: 'Street 841',
    owner_landlord: 'Mohamed Eisa Al-Mohannadi', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: '7', parking_count: 8, no_of_elevators: 1,
    amenities_text: 'Covered Parking, Security / CCTV, Reception / Lobby, Elevator / Lift, Waste Disposal, Wifi/Internet / Gym / Fire Alarm',
    property_category: 'Building',
  },
  {
    id: 'p3', code: 'BIN OMRAN 1', name: 'BIN OMRAN - BLDG90',
    city: 'Doha', district: 'Area 37', type: 'Residential Tower',
    units: 15, occupancy: 0.87,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '37', street_building_name: 'Street 856',
    owner_landlord: 'Sheikh Hassan Al-Thani', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: 'GF + 3', parking_count: 15, no_of_elevators: 1,
    amenities_text: 'Covered Parking, Security / CCTV, Reception / Lobby, Elevator / Lift, Waste Disposal, Wifi/Internet/Fire Alarm',
    property_category: 'Building',
  },
  {
    id: 'p4', code: 'BIN OMRAN 2', name: 'BIN OMRAN - BLDG07',
    city: 'Doha', district: 'Area 37', type: 'Residential Tower',
    units: 51, occupancy: 0.96,
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '37', street_building_name: 'Street 877',
    owner_landlord: 'Abdulaziz A M Al-Emadi', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: 'GF + 3', parking_count: 52, no_of_elevators: 2,
    amenities_text: 'Covered Parking, Security / CCTV, Reception / Lobby, Elevator / Lift, Waste Disposal, Wifi/Internet / Gym / Fire Alarm',
    property_category: 'Building',
  },
  {
    id: 'p5', code: 'LULU 1', name: 'OLD AIPORT - BLDG124',
    city: 'Doha', district: 'Area 45', type: 'Residential Tower',
    units: 8, occupancy: 1.0,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '45', street_building_name: 'Street 805',
    owner_landlord: 'Sheikh Hassan Al-Thani', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: '3', parking_count: 8, no_of_elevators: 0,
    amenities_text: 'Covered Parking, Security',
    property_category: 'Building',
  },
  {
    id: 'p6', code: 'LULU 2', name: 'OLD AIPORT - BLDG17',
    city: 'Doha', district: 'Area 45', type: 'Residential Tower',
    units: 6, occupancy: 0.67,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '45', street_building_name: 'Street 977',
    owner_landlord: 'Sheikh Hassan Al-Thani', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: '3', parking_count: 6, no_of_elevators: 0,
    amenities_text: 'Covered Parking, Security / CCTV, Wi-Fi / Internet',
    property_category: 'Building',
  },
  {
    id: 'p7', code: 'RDM 1', name: 'OLD AIRPORT - BLDG29',
    city: 'Doha', district: 'Area 45', type: 'Residential Tower',
    units: 5, occupancy: 0.80,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '45', street_building_name: 'Street 940',
    owner_landlord: 'Sheikh Hassan Al-Thani', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: '3', parking_count: 5, no_of_elevators: 0,
    amenities_text: 'Covered Parking, Security',
    property_category: 'Building',
  },
  {
    id: 'p8', code: 'RDM 2', name: 'OLD AIRPORT - BLDG33',
    city: 'Doha', district: 'Area 45', type: 'Residential Tower',
    units: 8, occupancy: 1.0,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '45', street_building_name: 'Street 929',
    owner_landlord: 'Sheikh Hassan Al-Thani', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: '3', parking_count: 8, no_of_elevators: 0,
    amenities_text: 'Covered Parking, Security',
    property_category: 'Building',
  },
  {
    id: 'p9', code: 'OA56', name: 'OLD AIRPORT - BLDG56',
    city: 'Doha', district: 'Area 45', type: 'Residential Tower',
    units: 13, occupancy: 1.0,
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '45', street_building_name: 'Street 990',
    owner_landlord: 'Hassen Ali Al-Mulla', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: '3', parking_count: 13, no_of_elevators: 1,
    amenities_text: 'Covered Parking, Security / CCTV, Elevator / Lift, Waste Disposal, Wi-Fi / Internet, Fire Alarm',
    property_category: 'Building',
  },
  {
    id: 'p10', code: 'THIHAMA 2', name: 'OLD AIRPORT - BLDG01',
    city: 'Doha', district: 'Area 45', type: 'Residential Tower',
    units: 13, occupancy: 0.77,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '45', street_building_name: 'Street 834',
    owner_landlord: 'Sheikh Hassan Al-Thani', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: '3', parking_count: 13, no_of_elevators: 1,
    amenities_text: 'Covered Parking, Security / CCTV, Elevator / Lift, Waste Disposal, Wi-Fi / Internet, Fire Alarm',
    property_category: 'Building',
  },
  {
    id: 'p11', code: 'OA - KWT', name: 'OLD AIRPORT - KUWAIT VILLA',
    city: 'Doha', district: 'Area 45', type: 'Villa Compound',
    units: 1, occupancy: 1.0,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '45', street_building_name: 'Street 656',
    owner_landlord: 'Sheikh Hassan Al-Thani', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: '1', parking_count: 1, no_of_elevators: 0,
    amenities_text: 'Covered Parking, Wi-Fi / Internet, Waste Disposal',
    property_category: 'Villa Compound',
  },
  {
    id: 'p12', code: 'NASER - 03', name: 'AL NASER - BLDG03',
    city: 'Doha', district: 'Area 39', type: 'Residential Tower',
    units: 25, occupancy: 1.0,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '39', street_building_name: 'Street 837',
    owner_landlord: 'A. Razzak Al-Abdulghani', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: 'GF + 4', parking_count: 25, no_of_elevators: 2,
    amenities_text: 'Covered Parking, Security / CCTV, Elevator / Lift, Waste Disposal, Wi-Fi / Internet, Fire Alarm',
    property_category: 'Building',
  },
  {
    id: 'p13', code: 'AL SAAD - 53', name: 'AL SAAD - BLDG53',
    city: 'Doha', district: 'Area 38', type: 'Residential Tower',
    units: 18, occupancy: 1.0,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '38', street_building_name: 'Street 850',
    owner_landlord: 'Sheikh Hassan Al-Thani', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: '6', parking_count: 13, no_of_elevators: 2,
    amenities_text: 'Covered Parking, Security, Elevator / Lift, Waste Disposal, Wi-Fi / Internet, Fire Alarm',
    property_category: 'Building',
  },
  {
    id: 'p14', code: 'MANSOURA - JM2', name: 'MANSOURA - BLDG06',
    city: 'Doha', district: 'Area 25', type: 'Residential Tower',
    units: 18, occupancy: 0.94,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '25', street_building_name: 'Street 828',
    owner_landlord: 'A. Rahman Al-Abdulghani', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: '6', parking_count: 18, no_of_elevators: 2,
    amenities_text: 'Covered Parking, Security / CCTV, Elevator / Lift, Waste Disposal, Wi-Fi / Internet, Fire Alarm',
    property_category: 'Building',
  },
  {
    id: 'p15', code: 'MANSOURA - JM10', name: 'MANSOURA - BLDG16',
    city: 'Doha', district: 'Area 25', type: 'Residential Tower',
    units: 16, occupancy: 1.0,
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '25', street_building_name: 'Street 816',
    owner_landlord: 'A. Rahman Al-Abdulghani', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: 'GF + 6', parking_count: 15, no_of_elevators: 1,
    amenities_text: 'Covered Parking, Security, Elevator / Lift, Waste Disposal, Wi-Fi / Internet',
    property_category: 'Building',
  },
  {
    id: 'p16', code: 'MANSOURA - 40', name: 'MANSOURA - BLDG40',
    city: 'Doha', district: 'Area 25', type: 'Residential Tower',
    units: 1, occupancy: 1.0,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '25', street_building_name: 'Street 970',
    owner_landlord: 'Sheikh Hassan Al-Thani', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: '1', parking_count: 1, no_of_elevators: 1,
    amenities_text: 'Covered Parking',
    property_category: 'Building',
  },
  {
    id: 'p17', code: 'MANSOURA - 25', name: 'MANSOURA - BLDG03',
    city: 'Doha', district: 'Area 26', type: 'Residential Tower',
    units: 1, occupancy: 1.0,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '26', street_building_name: 'Street 851',
    owner_landlord: '', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: '1', parking_count: 1, no_of_elevators: 1,
    amenities_text: 'Covered Parking, Elevator / Lift',
    property_category: 'Building',
  },
  {
    id: 'p18', code: 'PQ - AP10', name: 'PEARL QATAR - BLDG19',
    city: 'Doha', district: 'Area 66', type: 'Residential Tower',
    units: 48, occupancy: 0.88,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '66', street_building_name: 'Street 183',
    owner_landlord: 'Ahmad Eissa Al Hashemi', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: 'GF + 6', parking_count: 55, no_of_elevators: 2,
    amenities_text: 'Covered Parking, Security / CCTV, Elevator / Lift, Waste Disposal, Wi-Fi / Internet, Gym / Swimming Pool',
    property_category: 'Building',
  },
  {
    id: 'p19', code: 'MUSHEIREB - 05', name: 'MUSHEIREB - BLDG05',
    city: 'Doha', district: 'Area 13', type: 'Residential Tower',
    units: 32, occupancy: 0.97,
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '13', street_building_name: 'Street 850',
    owner_landlord: 'Jassim Mohd Al-Darwish', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: '4', parking_count: 8, no_of_elevators: 2,
    amenities_text: 'Covered Parking, Security, Elevator / Lift, Waste Disposal, Wi-Fi / Internet, Fire Alarm',
    property_category: 'Building',
  },
  {
    id: 'p20', code: 'MUGALINA - 1BHK', name: 'MUGALINA - BLDG88',
    city: 'Doha', district: 'Area 27', type: 'Residential Tower',
    units: 12, occupancy: 0.67,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '27', street_building_name: 'Street 830',
    owner_landlord: 'Jamal Nasser Al-Bader', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: '4', parking_count: 7, no_of_elevators: 1,
    amenities_text: 'Covered Parking, Security / CCTV, Elevator / Lift, Wi-Fi / Internet',
    property_category: 'Building',
  },
  {
    id: 'p21', code: 'MUGALINA - 2BHK', name: 'MUGALINA - BLDG16',
    city: 'Doha', district: 'Area 27', type: 'Residential Tower',
    units: 1, occupancy: 1.0,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '27', street_building_name: 'Street 935',
    owner_landlord: 'Sheikh Hassan Al-Thani', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: '1', parking_count: 1, no_of_elevators: 1,
    amenities_text: '',
    property_category: 'Building',
  },
  {
    id: 'p22', code: 'WAKRA - 01', name: 'AL WAKRA - BLDG01',
    city: 'Doha', district: 'Area 90', type: 'Residential Tower',
    units: 11, occupancy: 1.0,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '90', street_building_name: 'Street 993',
    owner_landlord: 'Jassim Mohd Al-Darwish', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: 'GF + 3', parking_count: 11, no_of_elevators: 1,
    amenities_text: 'Covered Parking, Security, Elevator / Lift, Waste Disposal, Wi-Fi / Internet',
    property_category: 'Building',
  },
  {
    id: 'p23', code: 'BIRKAT - 49', name: 'BIRKAT AL AWAMER - BLDG49',
    city: 'Doha', district: 'Area 91', type: 'Residential Tower',
    units: 21, occupancy: 1.0,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    ownership_type: 'Leased', area_zone: '91', street_building_name: 'Street 3086',
    owner_landlord: 'Nasser Abdullah Al-Ghanim', property_manager: 'Jithin Abdul Latheef',
    no_of_floors: '3', parking_count: 0, no_of_elevators: 0,
    amenities_text: 'Security',
    property_category: 'Building',
  },
];

// =====================================================================
// REAL UNIT DATA — Qatar (from Unit Master sheet, representative sample)
// =====================================================================
export const units: Unit[] = [
  // AAA — OLD SALATA - BLDG23
  { id: 'u1', propertyId: 'p1', number: 'AAA-GF1', bedrooms: 2, area: 90, price: 0, status: 'available' },
  { id: 'u2', propertyId: 'p1', number: 'AAA-GF2', bedrooms: 2, area: 90, price: 0, status: 'available' },
  { id: 'u3', propertyId: 'p1', number: 'AAA-Flat11', bedrooms: 2, area: 90, price: 0, status: 'available' },
  { id: 'u4', propertyId: 'p1', number: 'AAA-Flat12', bedrooms: 2, area: 90, price: 5400, status: 'leased' },
  { id: 'u5', propertyId: 'p1', number: 'AAA-Flat13', bedrooms: 2, area: 90, price: 5400, status: 'leased' },
  { id: 'u6', propertyId: 'p1', number: 'AAA-Flat14', bedrooms: 2, area: 90, price: 7500, status: 'leased' },
  // OLD SALATA 2 — OLD SALATA - BLDG13
  { id: 'u7', propertyId: 'p2', number: 'OS2-GF01', bedrooms: 1, area: 70, price: 4000, status: 'leased' },
  { id: 'u8', propertyId: 'p2', number: 'OS2-Flat01', bedrooms: 1, area: 70, price: 4000, status: 'leased' },
  { id: 'u9', propertyId: 'p2', number: 'OS2-Flat02', bedrooms: 1, area: 70, price: 4000, status: 'leased' },
  { id: 'u10', propertyId: 'p2', number: 'OS2-Flat04', bedrooms: 1, area: 70, price: 4000, status: 'available' },
  { id: 'u11', propertyId: 'p2', number: 'OS2-Flat05', bedrooms: 1, area: 70, price: 4000, status: 'available' },
  { id: 'u12', propertyId: 'p2', number: 'OS2-Flat06', bedrooms: 1, area: 70, price: 4300, status: 'leased' },
  // BIN OMRAN 1
  { id: 'u13', propertyId: 'p3', number: 'BO1-Flat01', bedrooms: 2, area: 90, price: 5000, status: 'leased' },
  { id: 'u14', propertyId: 'p3', number: 'BO1-Flat02', bedrooms: 2, area: 90, price: 4800, status: 'leased' },
  { id: 'u15', propertyId: 'p3', number: 'BO1-Flat03', bedrooms: 2, area: 90, price: 5200, status: 'leased' },
  // BIN OMRAN 2
  { id: 'u16', propertyId: 'p4', number: 'BO2-Flat01', bedrooms: 2, area: 95, price: 5100, status: 'leased' },
  { id: 'u17', propertyId: 'p4', number: 'BO2-Flat02', bedrooms: 2, area: 95, price: 4900, status: 'leased' },
  { id: 'u18', propertyId: 'p4', number: 'BO2-Flat03', bedrooms: 2, area: 95, price: 5300, status: 'leased' },
  // RDM 2 — 100% occupied
  { id: 'u19', propertyId: 'p8', number: 'RDM2-Flat01', bedrooms: 2, area: 80, price: 4500, status: 'leased' },
  { id: 'u20', propertyId: 'p8', number: 'RDM2-Flat02', bedrooms: 2, area: 80, price: 4700, status: 'leased' },
  { id: 'u21', propertyId: 'p8', number: 'RDM2-Flat03', bedrooms: 2, area: 80, price: 4600, status: 'leased' },
  // OA56 — 100% occupied
  { id: 'u22', propertyId: 'p9', number: 'OA56-Flat01', bedrooms: 2, area: 85, price: 4800, status: 'leased' },
  { id: 'u23', propertyId: 'p9', number: 'OA56-Flat02', bedrooms: 2, area: 85, price: 5000, status: 'leased' },
  { id: 'u24', propertyId: 'p9', number: 'OA56-Flat03', bedrooms: 2, area: 85, price: 4900, status: 'leased' },
  // NASER - 03 — 100% occupied
  { id: 'u25', propertyId: 'p12', number: 'NAS03-Flat01', bedrooms: 2, area: 90, price: 5500, status: 'leased' },
  { id: 'u26', propertyId: 'p12', number: 'NAS03-Flat02', bedrooms: 2, area: 90, price: 5900, status: 'leased' },
  { id: 'u27', propertyId: 'p12', number: 'NAS03-Flat08', bedrooms: 2, area: 90, price: 5900, status: 'leased' },
  // PQ - AP10 — PEARL QATAR
  { id: 'u28', propertyId: 'p18', number: 'PQ-AP10-Flat01', bedrooms: 2, area: 110, price: 8000, status: 'leased' },
  { id: 'u29', propertyId: 'p18', number: 'PQ-AP10-Flat02', bedrooms: 2, area: 110, price: 7800, status: 'leased' },
  { id: 'u30', propertyId: 'p18', number: 'PQ-AP10-Flat03', bedrooms: 2, area: 110, price: 8200, status: 'leased' },
  { id: 'u31', propertyId: 'p18', number: 'PQ-AP10-Flat10', bedrooms: 3, area: 140, price: 10000, status: 'leased' },
  { id: 'u32', propertyId: 'p18', number: 'PQ-AP10-Flat24', bedrooms: 2, area: 110, price: 0, status: 'available' },
  // WAKRA - 01
  { id: 'u33', propertyId: 'p22', number: 'WAK01-Flat01', bedrooms: 2, area: 85, price: 4700, status: 'leased' },
  { id: 'u34', propertyId: 'p22', number: 'WAK01-Flat02', bedrooms: 2, area: 85, price: 4700, status: 'leased' },
  { id: 'u35', propertyId: 'p22', number: 'WAK01-Flat03', bedrooms: 2, area: 85, price: 4700, status: 'leased' },
  // MUSHEIREB - 05
  { id: 'u36', propertyId: 'p19', number: 'MUS05-Flat01', bedrooms: 2, area: 95, price: 6500, status: 'leased' },
  { id: 'u37', propertyId: 'p19', number: 'MUS05-Flat02', bedrooms: 2, area: 95, price: 6200, status: 'leased' },
  { id: 'u38', propertyId: 'p19', number: 'MUS05-Flat03', bedrooms: 2, area: 95, price: 6800, status: 'leased' },
  // AL SAAD - 53
  { id: 'u39', propertyId: 'p13', number: 'ALS53-Flat11', bedrooms: 2, area: 95, price: 6100, status: 'leased' },
  { id: 'u40', propertyId: 'p13', number: 'ALS53-Flat12', bedrooms: 2, area: 95, price: 5800, status: 'leased' },
  // MANSOURA - JM2
  { id: 'u41', propertyId: 'p14', number: 'MNS-JM2-Flat01', bedrooms: 2, area: 90, price: 5200, status: 'leased' },
  { id: 'u42', propertyId: 'p14', number: 'MNS-JM2-Flat02', bedrooms: 2, area: 90, price: 5400, status: 'leased' },
  { id: 'u43', propertyId: 'p14', number: 'MNS-JM2-Flat03', bedrooms: 2, area: 90, price: 5000, status: 'leased' },
  // BIRKAT - 49
  { id: 'u44', propertyId: 'p23', number: 'BIR49-Flat01', bedrooms: 2, area: 85, price: 3500, status: 'leased' },
  { id: 'u45', propertyId: 'p23', number: 'BIR49-Flat02', bedrooms: 2, area: 85, price: 3500, status: 'leased' },
];

// =====================================================================
// REAL LEASE DATA — from Unit Master (active tenants with contracts)
// =====================================================================
export const leases: Lease[] = [
  { id: 'l1', unitId: 'u4', tenant: 'Mr. Dawood Sulaiman S Al Rahbi', start: '2026-04-10', end: '2027-04-09', annualRent: 64800, status: 'active' },
  { id: 'l2', unitId: 'u5', tenant: 'Mr. Basiron Yusop', start: '2025-09-10', end: '2026-09-09', annualRent: 64800, status: 'expiring' },
  { id: 'l3', unitId: 'u6', tenant: 'M/s. Embassy of Pakistan', start: '2026-07-01', end: '2027-06-30', annualRent: 90000, status: 'active' },
  { id: 'l4', unitId: 'u7', tenant: 'Mr. Shankar Manjapara Sankaran', start: '2026-03-15', end: '2027-03-14', annualRent: 48000, status: 'active' },
  { id: 'l5', unitId: 'u8', tenant: 'Mr. Sherwin Raman', start: '2026-01-01', end: '2026-12-31', annualRent: 48000, status: 'expiring' },
  { id: 'l6', unitId: 'u19', tenant: 'Mr. Shaikh Mosarrof Hossain', start: '2025-10-01', end: '2026-09-30', annualRent: 54000, status: 'expiring' },
  { id: 'l7', unitId: 'u25', tenant: 'Mr. Christopher Herd', start: '2026-03-01', end: '2027-02-28', annualRent: 66000, status: 'active' },
  { id: 'l8', unitId: 'u26', tenant: 'Mr. Wissam Khalil Younis', start: '2025-12-01', end: '2026-11-30', annualRent: 70800, status: 'expiring' },
  { id: 'l9', unitId: 'u27', tenant: 'Mr. Mohamed Aboulazayem Hassan', start: '2026-05-01', end: '2027-04-30', annualRent: 70800, status: 'active' },
  { id: 'l10', unitId: 'u28', tenant: 'Mr. Ahmed Al Farsi', start: '2026-01-01', end: '2026-12-31', annualRent: 96000, status: 'expiring' },
  { id: 'l11', unitId: 'u33', tenant: 'Mr. Shailesh Lanjewar', start: '2025-07-15', end: '2026-07-14', annualRent: 56400, status: 'expiring' },
  { id: 'l12', unitId: 'u39', tenant: 'Mr. Mahmoud Ghazal', start: '2025-08-01', end: '2026-08-31', annualRent: 73200, status: 'expiring' },
];

export const tickets: Ticket[] = [
  { id: 't1', subject: 'AC not cooling — master bedroom', unit: 'AAA-Flat32', category: 'HVAC', priority: 'High', status: 'in_progress', createdAt: '2026-07-10', assignee: 'Faisal T.' },
  { id: 't2', subject: 'Leaking kitchen tap', unit: 'OS2-Flat06', category: 'Plumbing', priority: 'Medium', status: 'assigned', createdAt: '2026-07-12', assignee: 'Mahmoud K.' },
  { id: 't3', subject: 'Lobby light flickering', unit: 'Common — BIN OMRAN 1', category: 'Electrical', priority: 'Low', status: 'new', createdAt: '2026-07-14' },
  { id: 't4', subject: 'Deep clean before move-in', unit: 'PQ-AP10-Flat24', category: 'Cleaning', priority: 'Medium', status: 'resolved', createdAt: '2026-07-08', assignee: 'CleanCo' },
  { id: 't5', subject: 'Main door lock replacement', unit: 'NASER-03-Flat05', category: 'General', priority: 'Urgent', status: 'new', createdAt: '2026-07-15' },
];

// =====================================================================
// PDC-BASED PAYMENTS — from PDC in Hand New sheet (QAR amounts)
// =====================================================================
export const payments: Payment[] = [
  { id: 'pay1', reference: 'PDC-01000103', payer: 'Mr. Shailesh Lanjewar', amount: 4700, method: 'Bank Transfer', status: 'pending', date: '2026-08-05' },
  { id: 'pay2', reference: 'PDC-01000105', payer: 'Mr. Shailesh Lanjewar', amount: 4700, method: 'Bank Transfer', status: 'pending', date: '2026-09-05' },
  { id: 'pay3', reference: 'PDC-00000072', payer: 'Mr. Mohamed Aboulazayem Hassan', amount: 5900, method: 'Bank Transfer', status: 'pending', date: '2027-02-05' },
  { id: 'pay4', reference: 'PDC-00000073', payer: 'Mr. Mohamed Aboulazayem Hassan', amount: 5900, method: 'Bank Transfer', status: 'pending', date: '2027-03-05' },
  { id: 'pay5', reference: 'PDC-00000074', payer: 'Mr. Mohamed Aboulazayem Hassan', amount: 2950, method: 'Bank Transfer', status: 'pending', date: '2027-04-05' },
];

export const journal: JournalEntry[] = [
  { id: 'je1', date: '2026-07-01', memo: 'Rent receipt — AAA-Flat12 (Mr. Dawood Sulaiman)', debit: 5400, credit: 0, account: '1100 Cash @ Bank' },
  { id: 'je2', date: '2026-07-01', memo: 'Rent receipt — AAA-Flat12 (Mr. Dawood Sulaiman)', debit: 0, credit: 5400, account: '4100 Rental Income' },
  { id: 'je3', date: '2026-07-01', memo: 'Rent receipt — AAA-Flat14 (Embassy of Pakistan)', debit: 7500, credit: 0, account: '1100 Cash @ Bank' },
  { id: 'je4', date: '2026-07-01', memo: 'Rent receipt — AAA-Flat14 (Embassy of Pakistan)', debit: 0, credit: 7500, account: '4100 Rental Income' },
  { id: 'je5', date: '2026-07-10', memo: 'HVAC maintenance — AAA-Flat32', debit: 1200, credit: 0, account: '5200 Maintenance Expense' },
  { id: 'je6', date: '2026-07-10', memo: 'HVAC maintenance — AAA-Flat32', debit: 0, credit: 1200, account: '2100 Accounts Payable' },
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
  { id: 'd1', name: 'Lease agreement — AAA-Flat12 (Dawood Al Rahbi)', size: '248 KB', date: '2026-04-10', action: 'download', category: 'Legal' },
  { id: 'd2', name: 'Q3 2026 rent invoice — Embassy of Pakistan', size: '92 KB', date: '2026-07-01', action: 'download', category: 'Finance' },
  { id: 'd3', name: 'Move-in inspection — PQ-AP10-Flat01', size: '1.2 MB', date: '2026-06-15', action: 'download', category: 'Inspection' },
  { id: 'd4', name: 'Lease renewal — AAA-Flat13 (sign required)', size: '186 KB', date: '2026-07-20', action: 'sign', category: 'Legal' },
  { id: 'd5', name: 'Building rules — OLD SALATA BLDG23', size: '412 KB', date: '2026-01-01', action: 'download', category: 'Policy' },
  { id: 'd6', name: 'PDC acknowledgement — Mr. Shailesh Lanjewar', size: '44 KB', date: '2026-07-15', action: 'sign', category: 'Finance' },
];

export const facilities: FacilityBooking[] = [
  { id: 'pool', name: 'Swimming pool', type: 'Amenity', hours: '06:00 – 22:00', nextSlot: 'Fri · 18:00–20:00', status: 'Confirmed', availableSlots: 2 },
  { id: 'gym', name: 'Fitness gym', type: 'Amenity', hours: '24/7', nextSlot: 'Open', status: 'Drop-in', availableSlots: 8 },
  { id: 'hall', name: 'Event hall', type: 'Facility', hours: 'By booking', nextSlot: 'Sun · 16:00–19:00', status: 'Available', availableSlots: 4 },
  { id: 'majlis', name: 'Family majlis', type: 'Facility', hours: 'By booking', nextSlot: 'Sat · 19:00–22:00', status: 'Pending', availableSlots: 1 },
  { id: 'court', name: 'Padel court', type: 'Amenity', hours: '06:00 – 23:00', nextSlot: 'Thu · 21:00–22:00', status: 'Available', availableSlots: 5 },
];

export const communityPosts: CommunityPost[] = [
  { id: 'c1', author: 'ZYNO Property Management Team', time: '2h', title: 'Pool maintenance Tuesday 9 AM – 12 PM', body: "We'll be running our quarterly deep-clean. Thanks for your patience.", likes: 28, comments: 4 },
  { id: 'c2', author: 'Resident · AAA-Flat54', time: '1d', title: 'Lost set of car keys near lobby', body: 'If found, please drop at reception — much appreciated 🙏', likes: 18, comments: 3 },
  { id: 'c3', author: 'ZYNO Property Management Events', time: '3d', title: 'Eid family gathering — Saturday 19:00', body: 'Open to all residents. RSVP via Facility Booking.', likes: 41, comments: 9 },
];

export const communityEvents: CommunityEvent[] = [
  { id: 'e1', title: 'Coffee morning', when: 'Fri 25 Jul · 10:00', location: 'Lobby Lounge — AAA', status: 'Open' },
  { id: 'e2', title: 'Kids movie night', when: 'Sat 26 Jul · 19:00', location: 'Community Hall', status: 'Open' },
  { id: 'e3', title: 'Building town hall', when: 'Wed 30 Jul · 18:00', location: 'Conference Room', status: 'RSVP' },
];

export const crmContacts: CRMContact[] = [
  { id: 'crm1', name: 'Jithin Abdul Latheef', company: 'ZYNO Property Management', role: 'Property Manager', email: 'jithin@zyno.qa', phone: '+974 55 123 4567', status: 'Active', source: 'Internal', createdAt: '2026-01-01' },
  { id: 'crm2', name: 'Sheikh Hassan Al-Thani', company: 'Al-Thani Holdings', role: 'Owner / Landlord', email: 'hassan@althani.qa', phone: '+974 55 987 6543', status: 'Active', source: 'Property Master', createdAt: '2026-01-01' },
  { id: 'crm3', name: 'Ahmad Eissa Al Hashemi', company: 'Al Hashemi Properties', role: 'Owner / Landlord', email: 'ahmed@alhashemi.qa', phone: '+974 55 321 9876', status: 'Active', source: 'Property Master', createdAt: '2026-01-01' },
];

export const crmInteractions: CRMInteraction[] = [
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
