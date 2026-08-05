import type { Property } from "@/lib/supabase";

export type PropertySavePayload = Partial<Omit<Property, "id" | "created_at" | "property_images">>;

export function buildPropertyPayload(input: {
  title: string;
  description?: string | null;
  propertyType?: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  basePricePerNight?: number;
  maxGuests?: number | string;
  bedrooms?: number | string;
  beds?: number | string;
  bathrooms?: number | string;
  cleaningFee?: number | string;
  isActive?: boolean;
  roomDetails?: any;
  amenities?: string[];
  propertyCode?: string;
  costCenterCode?: string;
  costCenterName?: string;
  propertyCategory?: string;
  ownershipType?: string;
  areaZone?: string;
  streetBuildingName?: string;
  plotBuildingNo?: string;
  titleDeedNo?: string;
  municipalityRefNo?: string;
  propertyManager?: string;
  noOfFloors?: string | number;
  noOfUnits?: string | number;
  totalBuiltUpAreaSqm?: string | number;
  commonAreaSqm?: string | number;
  parkingCount?: string | number;
  noOfElevators?: string | number;
  amenityFields?: string[];
  otherAmenitiesFacilities?: string;
  completionDate?: string;
  handoverDate?: string;
  propertyStatus?: string;
  documentsReceived?: boolean;
  remarks?: string;
  kahramaaNumber?: string;
  municipalityDetails?: string;
  proposedFields?: {
    propertyCode?: string;
    propertyName?: string;
    costCenterCode?: string;
    costCenterName?: string;
  };
  ownerLandlord?: string;
  hostId?: string;
}): PropertySavePayload {
  const amenityValues = input.amenities ?? (input.amenityFields ?? []).filter(Boolean);
  const municipalityPayload = buildMunicipalityPayload(
    input.municipalityDetails,
    input.ownerLandlord,
    amenityValues,
    input.otherAmenitiesFacilities,
    input.proposedFields,
  );

  return {
    host_id: input.hostId,
    title: input.title,
    description: input.description ?? null,
    property_type: input.propertyType || "apartment",
    address: input.address,
    city: input.city,
    state: input.state || undefined,
    zip_code: input.zipCode || undefined,
    country: input.country,
    max_guests: Number(input.maxGuests) || 1,
    bedrooms: Number(input.bedrooms) || 1,
    beds: Number(input.beds) || 1,
    bathrooms: Number(input.bathrooms) || 1,
    base_price_per_night: Number(input.basePricePerNight) || 0,
    cleaning_fee: Number(input.cleaningFee) || 0,
    is_active: input.isActive ?? true,
    room_details: input.roomDetails ?? {},
    amenities: amenityValues,
    property_code: input.propertyCode || undefined,
    cost_center_code: input.costCenterCode || undefined,
    cost_center_name: input.costCenterName || undefined,
    property_category: input.propertyCategory || undefined,
    ownership_type: input.ownershipType || undefined,
    area_zone: input.areaZone || undefined,
    street_building_name: input.streetBuildingName || undefined,
    plot_building_no: input.plotBuildingNo || undefined,
    title_deed_no: input.titleDeedNo || undefined,
    municipality_ref_no: input.municipalityRefNo || undefined,
    property_manager: input.propertyManager || undefined,
    no_of_floors: input.noOfFloors ? Number(input.noOfFloors) : undefined,
    no_of_units: input.noOfUnits ? Number(input.noOfUnits) : undefined,
    total_built_up_area_sqm: input.totalBuiltUpAreaSqm ? Number(input.totalBuiltUpAreaSqm) : undefined,
    common_area_sqm: input.commonAreaSqm ? Number(input.commonAreaSqm) : undefined,
    parking_count: input.parkingCount ? Number(input.parkingCount) : undefined,
    no_of_elevators: input.noOfElevators ? Number(input.noOfElevators) : undefined,
    completion_date: input.completionDate || undefined,
    handover_date: input.handoverDate || undefined,
    property_status: input.propertyStatus || undefined,
    documents_received: Boolean(input.documentsReceived),
    remarks: input.remarks || undefined,
    kahramaa_number: input.kahramaaNumber || undefined,
    municipality_details: municipalityPayload,
  };
}

function buildMunicipalityPayload(
  municipalityDetails: string | undefined,
  ownerLandlord: string | undefined,
  amenitiesFields: string[],
  otherAmenitiesFacilities: string | undefined,
  proposedFields?: {
    propertyCode?: string;
    propertyName?: string;
    costCenterCode?: string;
    costCenterName?: string;
  },
) {
  let municipality: any = null;
  try {
    municipality = municipalityDetails ? JSON.parse(municipalityDetails) : null;
  } catch {
    municipality = municipalityDetails;
  }

  return {
    ...(typeof municipality === "object" && municipality !== null ? municipality : {}),
    owner_landlord: ownerLandlord || undefined,
    facility_amenities: amenitiesFields.filter(Boolean),
    other_amenities_facilities: otherAmenitiesFacilities || undefined,
    change_request: {
      property_code_new: proposedFields?.propertyCode || undefined,
      property_name_new: proposedFields?.propertyName || undefined,
      cost_center_code_new: proposedFields?.costCenterCode || undefined,
      cost_center_name_new: proposedFields?.costCenterName || undefined,
    },
  };
}
