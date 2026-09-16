import { supabase } from '../supabase';
import { referenceDropdowns } from '../reference-data';
import {
  fetchGenders,
  fetchDepartments,
  fetchDesignations,
  fetchEmploymentTypes,
  fetchWorkLocations,
  fetchEmployeeStatuses,
  fetchAssetCategories,
  fetchAssetOwnershipTypes,
  fetchAssetConditions,
  fetchAssetStatuses,
} from '../supabase-masters';

export interface MasterOptionsCache {
  propertyTypes: string[];
  propertyCategories: string[];
  ownershipTypes: string[];
  propertyStatuses: string[];
  unitUsages: string[];
  viewTypes: string[];
  furnishingTypes: string[];
  unitStatuses: string[];
  leaseStatuses: string[];
  rentFrequencies: string[];
  maintenanceResponsibilities: string[];
  customerTypes: string[];
  verificationStatuses: string[];
  genders: string[];
  departments: string[];
  designations: string[];
  employmentTypes: string[];
  workLocations: string[];
  employeeStatuses: string[];
  assetCategories: string[];
  assetOwnershipTypes: string[];
  assetConditions: string[];
  assetStatuses: string[];
  countries: string[];
}

let cachedOptions: MasterOptionsCache | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60000; // 1 minute cache

export async function getMasterOptions(): Promise<MasterOptionsCache> {
  const now = Date.now();
  if (cachedOptions && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedOptions;
  }

  // Fallbacks from reference-data
  const fallback: MasterOptionsCache = {
    propertyTypes: referenceDropdowns.propertyTypes.map(p => p.value),
    propertyCategories: referenceDropdowns.propertyCategories.map(p => p.value),
    ownershipTypes: referenceDropdowns.ownershipTypes.map(p => p.value),
    propertyStatuses: referenceDropdowns.propertyStatuses.map(p => p.value),
    unitUsages: ['Residential', 'Commercial', 'Staff Accommodation', 'Storage', 'Retail'],
    viewTypes: ['City View', 'Sea View', 'Garden View', 'Street View', 'Courtyard View', 'Open View'],
    furnishingTypes: ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'],
    unitStatuses: referenceDropdowns.unitStatuses.map(p => p.value),
    leaseStatuses: ['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'CLOSED'],
    rentFrequencies: referenceDropdowns.rentFrequencies.map(p => p.value),
    maintenanceResponsibilities: ['Landlord', 'Tenant', 'Shared'],
    customerTypes: ['Individual', 'Company'],
    verificationStatuses: ['Pending', 'Verified', 'Rejected', 'Additional Info Required'],
    genders: ['Male', 'Female', 'Other'],
    departments: ['Administration', 'Finance & Accounts', 'Leasing & Sales', 'Property Management', 'Operations & Maintenance', 'HR', 'Legal'],
    designations: ['Property Manager', 'Leasing Executive', 'Finance Manager', 'Accountant', 'Cashier', 'Maintenance Supervisor', 'Technician', 'HR Officer', 'General Manager'],
    employmentTypes: ['Full-Time', 'Part-Time', 'Contract', 'Probation', 'Temporary'],
    workLocations: ['Doha HQ', 'Old Salata Office', 'Lusail Branch', 'On-Site Property'],
    employeeStatuses: ['Active', 'On Leave', 'Probation', 'Terminated', 'Resigned'],
    assetCategories: ['HVAC', 'Electrical', 'Plumbing', 'Furniture', 'Appliances', 'IT & Security', 'Vehicles', 'Elevator & Mechanical'],
    assetOwnershipTypes: ['Owned', 'Leased', 'Customer Provided', 'Landlord Provided'],
    assetConditions: ['Brand New', 'Good', 'Fair', 'Needs Repair', 'Scrap / Disposed'],
    assetStatuses: ['Available', 'In Use', 'Under Maintenance', 'Damaged', 'Disposed'],
    countries: ['Qatar', 'Saudi Arabia', 'United Arab Emirates', 'Kuwait', 'Bahrain', 'Oman'],
  };

  try {
    const [
      genders,
      depts,
      desigs,
      empTypes,
      workLocs,
      empStatuses,
      assetCats,
      assetOwnerTypes,
      assetConds,
      assetStats,
    ] = await Promise.allSettled([
      fetchGenders(),
      fetchDepartments(),
      fetchDesignations(),
      fetchEmploymentTypes(),
      fetchWorkLocations(),
      fetchEmployeeStatuses(),
      fetchAssetCategories(),
      fetchAssetOwnershipTypes(),
      fetchAssetConditions(),
      fetchAssetStatuses(),
    ]);

    const extractNames = (result: PromiseSettledResult<any[]>, fallbackList: string[]) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value) && result.value.length > 0) {
        return result.value.map(item => item.name || item.label || item.code || String(item)).filter(Boolean);
      }
      return fallbackList;
    };

    cachedOptions = {
      propertyTypes: fallback.propertyTypes,
      propertyCategories: fallback.propertyCategories,
      ownershipTypes: fallback.ownershipTypes,
      propertyStatuses: fallback.propertyStatuses,
      unitUsages: fallback.unitUsages,
      viewTypes: fallback.viewTypes,
      furnishingTypes: fallback.furnishingTypes,
      unitStatuses: fallback.unitStatuses,
      leaseStatuses: fallback.leaseStatuses,
      rentFrequencies: fallback.rentFrequencies,
      maintenanceResponsibilities: fallback.maintenanceResponsibilities,
      customerTypes: fallback.customerTypes,
      verificationStatuses: fallback.verificationStatuses,
      genders: extractNames(genders, fallback.genders),
      departments: extractNames(depts, fallback.departments),
      designations: extractNames(desigs, fallback.designations),
      employmentTypes: extractNames(empTypes, fallback.employmentTypes),
      workLocations: extractNames(workLocs, fallback.workLocations),
      employeeStatuses: extractNames(empStatuses, fallback.employeeStatuses),
      assetCategories: extractNames(assetCats, fallback.assetCategories),
      assetOwnershipTypes: extractNames(assetOwnerTypes, fallback.assetOwnershipTypes),
      assetConditions: extractNames(assetConds, fallback.assetConditions),
      assetStatuses: extractNames(assetStats, fallback.assetStatuses),
      countries: fallback.countries,
    };

    lastFetchTime = now;
    return cachedOptions;
  } catch {
    cachedOptions = fallback;
    lastFetchTime = now;
    return cachedOptions;
  }
}
