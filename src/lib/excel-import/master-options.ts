import { DynamicMastersService } from '../dynamic-masters-service';

export interface MasterOptionsCache {
  propertyTypes: string[];
  propertyCategories: string[];
  ownershipTypes: string[];
  propertyStatuses: string[];
  unitUsages: string[];
  unitTypes: string[];
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
  assetSubcategories: string[];
  assetOwnershipTypes: string[];
  assetConditions: string[];
  assetStatuses: string[];
  countries: string[];
  securityDepositTypes: string[];
}

export async function getMasterOptions(): Promise<MasterOptionsCache> {
  return {
    propertyTypes: DynamicMastersService.getMasterStringOptions('property_type'),
    propertyCategories: DynamicMastersService.getMasterStringOptions('property_category'),
    ownershipTypes: DynamicMastersService.getMasterStringOptions('ownership_type'),
    propertyStatuses: DynamicMastersService.getMasterStringOptions('property_status'),
    unitUsages: DynamicMastersService.getMasterStringOptions('unit_usage'),
    unitTypes: DynamicMastersService.getMasterStringOptions('unit_type'),
    viewTypes: DynamicMastersService.getMasterStringOptions('view_type'),
    furnishingTypes: DynamicMastersService.getMasterStringOptions('furnishing'),
    unitStatuses: DynamicMastersService.getMasterStringOptions('unit_status'),
    leaseStatuses: DynamicMastersService.getMasterStringOptions('lease_status'),
    rentFrequencies: DynamicMastersService.getMasterStringOptions('rent_frequency'),
    maintenanceResponsibilities: DynamicMastersService.getMasterStringOptions('maintenance_responsibility'),
    customerTypes: ['Individual', 'Company'],
    verificationStatuses: ['Pending', 'Verified', 'Rejected', 'Additional Info Required'],
    genders: DynamicMastersService.getMasterStringOptions('gender'),
    departments: DynamicMastersService.getMasterStringOptions('department'),
    designations: DynamicMastersService.getMasterStringOptions('designation'),
    employmentTypes: DynamicMastersService.getMasterStringOptions('employment_type'),
    workLocations: DynamicMastersService.getMasterStringOptions('work_location'),
    employeeStatuses: DynamicMastersService.getMasterStringOptions('employee_status'),
    assetCategories: DynamicMastersService.getMasterStringOptions('asset_category'),
    assetSubcategories: DynamicMastersService.getMasterStringOptions('asset_subcategory'),
    assetOwnershipTypes: DynamicMastersService.getMasterStringOptions('ownership_type'),
    assetConditions: DynamicMastersService.getMasterStringOptions('asset_condition'),
    assetStatuses: DynamicMastersService.getMasterStringOptions('asset_status'),
    countries: DynamicMastersService.getMasterStringOptions('country'),
    securityDepositTypes: DynamicMastersService.getMasterStringOptions('security_deposit_type'),
  };
}
