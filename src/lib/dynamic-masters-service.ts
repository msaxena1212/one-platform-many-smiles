// Dynamic Master Store & Management Service
// Supports full CRUD, is_mandatory toggles, and real-time syncing for Excel templates & manual forms.

export interface MasterEntry {
  id: string;
  name: string;
  code?: string;
  is_mandatory?: boolean;
  extra?: Record<string, any>;
}

export interface MasterGroupDefinition {
  key: string;
  label: string;
  category: 'Asset' | 'Employee' | 'Property' | 'Unit' | 'Lease' | 'System';
  description?: string;
  isMandatoryField?: boolean; // Can mark the field itself as mandatory
  initialValues: string[];
}

export const MASTER_DEFINITIONS: MasterGroupDefinition[] = [
  // ── Asset & Employee Masters ──
  {
    key: 'gender',
    label: 'Gender',
    category: 'Employee',
    isMandatoryField: false,
    initialValues: ['Male', 'Female', 'Other'],
  },
  {
    key: 'department',
    label: 'Department',
    category: 'Employee',
    isMandatoryField: false,
    initialValues: [
      'Management',
      'Finance & Accounts',
      'HR & Administration',
      'Sales & Marketing',
      'Operations',
      'Procurement',
      'Information Technology',
      'Customer Service',
      'Maintenance / Technical',
      'Warehouse',
      'Other',
    ],
  },
  {
    key: 'designation',
    label: 'Designation',
    category: 'Employee',
    isMandatoryField: false,
    initialValues: [
      'Director',
      'General Manager',
      'Manager',
      'Assistant Manager',
      'Accountant',
      'HR Executive',
      'Admin Executive',
      'Sales Executive',
      'Operations Executive',
      'Procurement Executive',
      'IT Support',
      'Customer Service Executive',
      'Supervisor',
      'Technician',
      'Driver',
      'Office Assistant',
      'Other',
    ],
  },
  {
    key: 'employment_type',
    label: 'Employment Type',
    category: 'Employee',
    isMandatoryField: false,
    initialValues: ['Permanent', 'Contract', 'Temporary', 'Part-Time', 'Intern'],
  },
  {
    key: 'work_location',
    label: 'Work Location',
    category: 'Employee',
    isMandatoryField: false,
    initialValues: ['Head Office', 'Branch 1', 'Branch 2', 'Warehouse', 'Client Site', 'Remote', 'Other'],
  },
  {
    key: 'employee_status',
    label: 'Employee Status',
    category: 'Employee',
    isMandatoryField: false,
    initialValues: ['Active', 'Probation', 'On Leave', 'Resigned', 'Terminated', 'Inactive'],
  },
  {
    key: 'asset_category',
    label: 'Asset Category',
    category: 'Asset',
    isMandatoryField: false,
    initialValues: [
      'IT Equipment',
      'Mobile Device',
      'Furniture',
      'Office Equipment',
      'Vehicle',
      'Tools & Equipment',
      'Appliances',
      'Other',
      'Access Control',
      'CCTV Systems',
      'Commercial Kitchen Equipments',
      'Furniture & Fixtures',
      'Investment Properties Building',
      'Investment Properties Land',
      'Machinery (Light)',
      'Sports and Gym Equipment',
      'Tools and Equipment',
      'Vehicles',
    ],
  },
  {
    key: 'asset_subcategory',
    label: 'Asset Subcategory',
    category: 'Asset',
    isMandatoryField: false,
    initialValues: [
      'Laptop',
      'Desktop',
      'Monitor',
      'Printer',
      'Scanner',
      'Mobile Phone',
      'Tablet',
      'Router',
      'Server',
      'Desk',
      'Chair',
      'Cabinet',
      'Vehicle',
      'Tool',
      'Gate Barrier',
      'Cooking Range',
      'Cooler',
      'Dishwasher',
      'Kitchen Appliances',
      'Microwave Oven',
      'Refrigerator',
      'Washing Machine',
      'Cameras',
      'Invertor and UPS',
      'Ceramic Hob',
      'Dispensers',
      'Garbage Bin',
      'Griller',
      'Hood',
      'Pasta Cooker',
      'Water Filter',
      'Air Conditioner',
      'Bed',
      'Bedroom Set',
      'Bench',
      'Carpet',
      'Coffee Table',
      'Curtain',
      'Dining Set',
      'Dresser',
      'Housing Keeping Trolleys',
      'Lamp',
      'Mattress',
      'Miscellaneous Furnitures',
      'Rack and Shelves',
      'Sofa Set',
      'Stands',
      'Stool',
      'Swimming Pool Furniture',
      'Table',
      'Television',
      'Wardrobe',
      'Water Tank',
      'Freehold Building',
      'Freehold Land',
      'Pump',
      'Backup Devices',
      'Computers',
      'Currency Counting Machine',
      'Electronic Notepads',
      'Laptops',
      'Miscellaneous Office Equipment',
      'Printers',
      'Abdominal',
      'Abduction Machine',
      'Angled Bar',
      'Bikes',
      'Chest Press',
      'Disc Rack',
      'Dumbbells',
      'Gymnasium Equipment',
      'Machine For leg',
      'Mat',
      'Olympic Bar',
      'Press Machine',
      'Treadmill',
      'Weighing Scale',
      'Weight Plates',
      'Audio Equipment',
      'Carpet Dryer',
      'Chain Saw',
      'Pressure Cleaner',
      'Safety Equipment',
      'Scrubber Dryer',
      'Trolleys',
      'Vacuum Cleaner',
      'Motor Car',
      'Other',
    ],
  },
  {
    key: 'ownership_type',
    label: 'Ownership Type',
    category: 'Asset',
    isMandatoryField: false,
    initialValues: [
      'Company Owned',
      'Owned',
      'Leased',
      'Rented',
      'Client Owned',
      'Managed for Owner',
      'Joint Venture',
      'Subleased',
      'Other',
    ],
  },
  {
    key: 'asset_condition',
    label: 'Asset Condition',
    category: 'Asset',
    isMandatoryField: false,
    initialValues: ['New', 'Good', 'Fair', 'Damaged', 'Under Repair', 'Scrap', 'Brand New', 'Needs Repair'],
  },
  {
    key: 'asset_status',
    label: 'Asset Status',
    category: 'Asset',
    isMandatoryField: false,
    initialValues: ['Available', 'Assigned', 'Under Repair', 'Lost', 'Disposed', 'Inactive', 'In Use'],
  },

  // ── Property & Unit Masters ──
  {
    key: 'property_type',
    label: 'Property Type',
    category: 'Property',
    isMandatoryField: true,
    initialValues: [
      'Residential',
      'Commercial',
      'Mixed Use',
      'Retail',
      'Office',
      'Warehouse',
      'Industrial',
      'Staff Accommodation',
      'Hotel / Hospitality',
      'Land',
      'Other',
    ],
  },
  {
    key: 'property_category',
    label: 'Property Category',
    category: 'Property',
    isMandatoryField: false,
    initialValues: [
      'Building',
      'Villa Compound',
      'Tower',
      'Mall',
      'Office Complex',
      'Warehouse Complex',
      'Staff Accommodation',
      'Standalone Villa',
      'Compound',
      'Land Parcel',
      'Other',
    ],
  },
  {
    key: 'property_status',
    label: 'Property Status',
    category: 'Property',
    isMandatoryField: false,
    initialValues: [
      'Active',
      'Inactive',
      'Under Development',
      'Under Renovation',
      'On Hold',
      'Sold',
      'Archived',
    ],
  },
  {
    key: 'country',
    label: 'Country',
    category: 'Property',
    isMandatoryField: true,
    initialValues: ['Qatar', 'United Arab Emirates', 'Saudi Arabia', 'Kuwait', 'Bahrain', 'Oman'],
  },
  {
    key: 'vat_tax_treatment',
    label: 'VAT / Tax Treatment',
    category: 'Property',
    isMandatoryField: false,
    initialValues: ['Taxable', 'Exempt', 'Zero Rated', 'Out of Scope', 'Not Applicable'],
  },
  {
    key: 'amenities_facilities',
    label: 'Amenities / Facilities',
    category: 'Property',
    isMandatoryField: false,
    initialValues: [
      'Swimming Pool',
      'Gym / Fitness Center',
      'Kids Play Area',
      'Covered Parking',
      'Visitor Parking',
      'Security / CCTV',
      'Reception / Lobby',
      'Elevator / Lift',
      'Central AC / Chiller',
      'Fire Alarm System',
      'Access Control',
      'Intercom',
      'Waste Disposal',
      'Garden / Landscaping',
      'BBQ Area',
      'Clubhouse / Community Hall',
      'Prayer Room',
      'Retail Shops',
      'Cafeteria / Restaurant',
      'Laundry Room',
      'Sports Court',
      'Jogging Track',
      'Spa / Sauna',
      'Storage Area',
      'Rooftop Terrace',
      'Driver Room',
      'Maid Room',
      'Concierge',
      'Property Management Office',
      'Maintenance Office',
      'Wi-Fi / Internet',
      'Other',
    ],
  },
  {
    key: 'unit_type',
    label: 'Unit Type',
    category: 'Unit',
    isMandatoryField: false,
    initialValues: [
      'Apartment',
      'Studio',
      'Villa',
      'Townhouse',
      'Office',
      'Shop',
      'Showroom',
      'Warehouse',
      'Retail Unit',
      'Parking',
      'Storage',
      'Common Area',
      'Other',
    ],
  },
  {
    key: 'unit_usage',
    label: 'Unit Usage',
    category: 'Unit',
    isMandatoryField: false,
    initialValues: [
      'Residential',
      'Commercial',
      'Retail',
      'Office',
      'Storage',
      'Parking',
      'Common Area',
      'Staff Accommodation',
      'Other',
    ],
  },
  {
    key: 'bedroom_count',
    label: 'Bedroom Count',
    category: 'Unit',
    isMandatoryField: false,
    initialValues: ['1', '2', '3', '4', '5', '6', '7'],
  },
  {
    key: 'bathroom_count',
    label: 'Bathroom Count',
    category: 'Unit',
    isMandatoryField: false,
    initialValues: ['1', '2', '3', '4', '5', '6', '7'],
  },
  {
    key: 'bathroom_layout',
    label: 'Bathroom Type / Layout',
    category: 'Unit',
    isMandatoryField: false,
    initialValues: ['Full Only', 'Half Only', 'Full + Half', 'Not Applicable'],
  },
  {
    key: 'view_type',
    label: 'View Type',
    category: 'Unit',
    isMandatoryField: false,
    initialValues: ['Road View', 'Sea View', 'City View', 'Garden View', 'Pool View', 'Internal View', 'No Specific View', 'Other'],
  },
  {
    key: 'furnishing',
    label: 'Furnishing',
    category: 'Unit',
    isMandatoryField: false,
    initialValues: ['Unfurnished', 'Semi Furnished', 'Fully Furnished', 'Not Applicable'],
  },
  {
    key: 'unit_status',
    label: 'Unit Status',
    category: 'Unit',
    isMandatoryField: false,
    initialValues: ['Available', 'Occupied', 'Reserved', 'Under Maintenance', 'Blocked', 'Sold', 'Inactive'],
  },
  {
    key: 'lease_status',
    label: 'Lease Status',
    category: 'Unit',
    isMandatoryField: false,
    initialValues: ['Vacant', 'Leased', 'Notice Given', 'Renewal Due', 'Expired', 'Legal Case', 'Not Applicable'],
  },
  {
    key: 'rent_frequency',
    label: 'Rent Frequency',
    category: 'Unit',
    isMandatoryField: false,
    initialValues: ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly', 'One Time', 'Not Applicable'],
  },
  {
    key: 'maintenance_responsibility',
    label: 'Maintenance Responsibility',
    category: 'Unit',
    isMandatoryField: false,
    initialValues: ['Owner', 'Tenant', 'Property Manager', 'Shared', 'Not Applicable'],
  },
  {
    key: 'security_deposit_type',
    label: 'Security Deposit',
    category: 'Unit',
    isMandatoryField: false,
    initialValues: ['Cash', 'Guarantee Cheque', 'PDC', 'Bank Transfer', 'None'],
  },

  // ── Customer, Lease & KYC Masters ──
  {
    key: 'nationality',
    label: 'Nationality',
    category: 'Lease',
    isMandatoryField: false,
    description: 'Master list of nationalities for KYC identification.',
    initialValues: [
      'Qatari',
      'Emirati',
      'Saudi',
      'Kuwaiti',
      'Bahraini',
      'Omani',
      'British',
      'American',
      'Canadian',
      'Australian',
      'Indian',
      'Pakistani',
      'Filipino',
      'Egyptian',
      'Jordanian',
      'Lebanese',
      'Syrian',
      'Palestinian',
      'Sudanese',
      'Tunisian',
      'Moroccan',
      'Algerian',
      'Yemeni',
      'Turkish',
      'French',
      'German',
      'Italian',
      'Spanish',
      'South African',
      'Nigerian',
      'Kenyan',
      'Nepalese',
      'Sri Lankan',
      'Bangladeshi',
      'Russian',
      'Chinese',
      'Japanese',
      'South Korean',
      'Other',
    ],
  },
  {
    key: 'profession',
    label: 'Profession',
    category: 'Lease',
    isMandatoryField: false,
    description: 'Master list of professions and occupations.',
    initialValues: [
      'Accountant',
      'Architect / Urban Planner',
      'Auditor / Chartered Accountant',
      'Banker / Financial Analyst',
      'Business Owner / Entrepreneur',
      'Civil Engineer',
      'Consultant / Strategy Advisor',
      'Contractor',
      'Corporate Executive / CEO',
      'Dentist',
      'Director / General Manager',
      'Doctor / Physician',
      'Electrical Engineer',
      'Finance Director / CFO',
      'Government Official / Diplomat',
      'HR Director / Manager',
      'IT Professional / Software Engineer',
      'Lawyer / Legal Counsel',
      'Manager / Supervisor',
      'Marketing / Sales Director',
      'Mechanical Engineer',
      'Nurse / Healthcare Specialist',
      'Operations Manager',
      'Petroleum / Oil & Gas Engineer',
      'Pilot / Aviation Officer',
      'Procurement / Supply Chain Specialist',
      'Professor / Academic',
      'Real Estate Developer / Agent',
      'Sales Executive',
      'Teacher / Educator',
      'Technician / Technical Specialist',
      'Student',
      'Retired',
      'Private Sector Employee',
      'Public Sector Employee',
      'Other',
    ],
  },
  {
    key: 'agreement_type',
    label: 'Agreement / Lease Type',
    category: 'Lease',
    isMandatoryField: false,
    description: 'Master list of contract & lease agreement types.',
    initialValues: [
      'Residential Tenancy Agreement',
      'Commercial Lease Agreement',
      'Short-Term Furnished Lease',
      'Corporate Staff Accommodation',
      'Retail Shop Lease',
      'Office Space Agreement',
      'Warehouse / Storage Lease',
      'Mixed-Use Agreement',
    ],
  },
  {
    key: 'customer_type',
    label: 'Customer / Tenant Type',
    category: 'Lease',
    isMandatoryField: false,
    description: 'Master list of tenant and customer classifications.',
    initialValues: [
      'Individual (Resident / QID)',
      'Individual (Visitor / Passport)',
      'Corporate / Commercial Entity (CR)',
      'Government / Semi-Government Entity',
      'Diplomatic / Embassy',
      'VIP / Executive Tenant',
    ],
  },
];

const LOCAL_STORAGE_KEY = 'zyno_custom_dynamic_masters_v1';
const MANDATORY_FLAGS_KEY = 'zyno_master_mandatory_flags_v1';

export class DynamicMastersService {
  private static getStoredData(): Record<string, MasterEntry[]> {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private static setStoredData(data: Record<string, MasterEntry[]>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving dynamic masters:', e);
    }
  }

  private static getMandatoryFlags(): Record<string, boolean> {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(MANDATORY_FLAGS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  public static setMandatoryFlag(masterKey: string, isMandatory: boolean): void {
    if (typeof window === 'undefined') return;
    const flags = this.getMandatoryFlags();
    flags[masterKey] = isMandatory;
    localStorage.setItem(MANDATORY_FLAGS_KEY, JSON.stringify(flags));
  }

  public static isMasterMandatory(masterKey: string): boolean {
    const flags = this.getMandatoryFlags();
    if (flags[masterKey] !== undefined) return flags[masterKey];
    const def = MASTER_DEFINITIONS.find(d => d.key === masterKey);
    return def?.isMandatoryField ?? false;
  }

  public static getMasterValues(masterKey: string): MasterEntry[] {
    const stored = this.getStoredData();
    const customList = stored[masterKey];
    if (customList && Array.isArray(customList) && customList.length > 0) {
      return customList;
    }

    // Default initialization from definition
    const def = MASTER_DEFINITIONS.find(d => d.key === masterKey);
    if (!def) return [];

    return def.initialValues.map((name, idx) => ({
      id: `${masterKey}-${idx + 1}`,
      name,
    }));
  }

  public static getMasterStringOptions(masterKey: string): string[] {
    return this.getMasterValues(masterKey).map(m => m.name);
  }

  public static addMasterValue(masterKey: string, name: string): MasterEntry {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Name cannot be empty');

    const stored = this.getStoredData();
    const current = this.getMasterValues(masterKey);

    if (current.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`Item "${trimmed}" already exists in ${masterKey}.`);
    }

    const newEntry: MasterEntry = {
      id: `${masterKey}-${Date.now()}`,
      name: trimmed,
    };

    stored[masterKey] = [...current, newEntry];
    this.setStoredData(stored);
    return newEntry;
  }

  public static updateMasterValue(masterKey: string, id: string, newName: string): void {
    const trimmed = newName.trim();
    if (!trimmed) throw new Error('Name cannot be empty');

    const stored = this.getStoredData();
    const current = this.getMasterValues(masterKey);

    const updated = current.map(item => (item.id === id ? { ...item, name: trimmed } : item));
    stored[masterKey] = updated;
    this.setStoredData(stored);
  }

  public static deleteMasterValue(masterKey: string, id: string): void {
    const stored = this.getStoredData();
    const current = this.getMasterValues(masterKey);
    const updated = current.filter(item => item.id !== id);
    stored[masterKey] = updated;
    this.setStoredData(stored);
  }
}
