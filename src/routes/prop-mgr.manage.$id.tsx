import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Save, Trash2, Calendar as CalendarIcon, Users, Loader2, AlertCircle, Plus, Wrench, Pencil } from "lucide-react";
import { fetchPropertyById, fetchHostBookings, updateProperty, createMaintenanceTicket, fetchUnits, fetchLeases, fetchPropertyTypes, fetchOwnershipTypes, fetchPropertyCategories, fetchCostCenters, updatePropertyImages, type Property } from "@/lib/supabase";
import { ImageUploader, type ImageFile } from "@/components/image-uploader";
import { properties as mockProperties, units as mockUnits, leases as mockLeases, type Property as MockProperty } from "@/lib/mock-data";
import { buildPropertyPayload } from "@/lib/property-master";
import { toast } from "sonner";
import { useJsApiLoader } from "@react-google-maps/api";

export const Route = createFileRoute("/prop-mgr/manage/$id")({
  component: PropMgrManageProperty,
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search.mode as string) === 'edit' ? 'edit' : 'view',
  }),
});

const MOCK_HOST_ID = "00000000-0000-4000-8000-000000000001";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ROOM_TYPES = [
  { value: "bedroom", label: "Bedroom" },
  { value: "bathroom", label: "Bathroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "balcony", label: "Balcony" },
  { value: "drawing_room", label: "Drawing Room" },
  { value: "dining_room", label: "Dining Room" },
  { value: "other", label: "Other" },
];

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "house", label: "House" },
  { value: "studio", label: "Studio" },
  { value: "townhouse", label: "Townhouse" },
  { value: "commercial", label: "Commercial" },
  { value: "mixed_use", label: "Mixed Use" },
];

const AMENITIES = [
  // General
  { id: "wifi", label: "Fast WiFi", types: ["all"] },
  { id: "ac", label: "Air Conditioning", types: ["all"] },
  { id: "tv", label: "Smart TV", types: ["all"] },
  { id: "workspace", label: "Dedicated Workspace", types: ["all"] },
  { id: "parking", label: "Free Parking", types: ["all"] },
  { id: "washer", label: "Washer/Dryer", types: ["all"] },
  // Kitchen
  { id: "kitchen", label: "Fully Equipped Kitchen", types: ["apartment", "villa", "house", "penthouse", "townhouse"] },
  { id: "kitchenette", label: "Kitchenette", types: ["studio"] },
  // Luxury / Villa / Penthouse
  { id: "private_pool", label: "Private Pool", types: ["villa", "house", "penthouse"] },
  { id: "servant_quarters", label: "Servant Quarters", types: ["villa", "house"] },
  { id: "rooftop_terrace", label: "Rooftop Terrace", types: ["penthouse", "villa"] },
  { id: "elevator", label: "Private Elevator", types: ["penthouse"] },
  { id: "garden", label: "Private Garden", types: ["villa", "house", "townhouse", "penthouse"] },
  // Shared / Apartment
  { id: "shared_gym", label: "Shared Gym", types: ["apartment", "studio"] },
  { id: "community_pool", label: "Community Pool", types: ["apartment", "studio", "townhouse"] },
  { id: "garage", label: "Garage Parking", types: ["villa", "house", "townhouse"] },
];

function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

function inferPropertyType(type: MockProperty["type"]) {
  switch (type) {
    case "Villa Compound":
      return "villa";
    case "Commercial":
      return "commercial";
    case "Mixed Use":
      return "mixed_use";
    default:
      return "apartment";
  }
}

function mapMockPropertyToManagedProperty(mockProperty: MockProperty): Property {
  const propertyUnits = mockUnits.filter((unit) => unit.propertyId === mockProperty.id);
  const leasedUnits = propertyUnits.filter((unit) => unit.status === "leased");
  const sampleUnit = propertyUnits[0];
  const amenities = (mockProperty.amenities_text || "")
    .split("/")
    .map((amenity) => amenity.trim().toLowerCase().replace(/\s+/g, "_"))
    .filter(Boolean);

  return {
    id: mockProperty.id,
    host_id: MOCK_HOST_ID,
    title: mockProperty.name,
    description: `${mockProperty.property_category || mockProperty.type} in ${mockProperty.city}, ${mockProperty.district}.`,
    property_type: inferPropertyType(mockProperty.type),
    address: mockProperty.street_building_name || "",
    city: mockProperty.city,
    state: "Doha Municipality",
    zip_code: "",
    country: "Qatar",
    max_guests: sampleUnit ? Math.max(sampleUnit.bedrooms * 2, 2) : 2,
    bedrooms: sampleUnit?.bedrooms ?? 0,
    beds: sampleUnit?.bedrooms ?? 0,
    bathrooms: sampleUnit?.bedrooms ?? 0,
    base_price_per_night: sampleUnit?.price ?? 0,
    cleaning_fee: 0,
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    amenities,
    room_details: [],
    property_code: mockProperty.code,
    property_category: mockProperty.property_category ?? mockProperty.type,
    ownership_type: mockProperty.ownership_type,
    area_zone: mockProperty.area_zone,
    street_building_name: mockProperty.street_building_name,
    property_manager: mockProperty.property_manager,
    no_of_floors: Number.parseInt(String(mockProperty.no_of_floors || "0"), 10) || undefined,
    no_of_units: mockProperty.units,
    parking_count: mockProperty.parking_count,
    no_of_elevators: mockProperty.no_of_elevators,
    municipality_details: {
      owner_landlord: mockProperty.owner_landlord,
      district: mockProperty.district,
      occupancy_rate: Math.round(mockProperty.occupancy * 100),
      leased_units: leasedUnits.length,
    },
  };
}

function PropMgrManageProperty() {
  const { id } = Route.useParams();
  const { mode } = Route.useSearch();
  return <ManagePropertyPage basePath="/prop-mgr" id={id} mode={mode} />;
}

export function ManagePropertyPage({
  basePath,
  id,
  mode = 'edit',
}: {
  basePath: "/admin" | "/owner" | "/prop-mgr";
  id: string;
  mode?: 'view' | 'edit';
}) {
  const navigate = useNavigate();
  const isViewMode = mode === 'view';

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCN4v-DS9QmFjoiyaiwN8yfrPeZPbSA_xU',
    libraries: ['places']
  });

  const [property, setProperty] = useState<Property | null>(null);
  const [isMockProperty, setIsMockProperty] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [unitsCount, setUnitsCount] = useState<number | null>(null);
  const [occupancyPct, setOccupancyPct] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Master Data Options
  const [propCategoryOptions, setPropCategoryOptions] = useState<{ id: string; label: string }[]>([]);
  const [propTypeOptions, setPropTypeOptions] = useState<{ id: string; label: string }[]>([]);
  const [ownershipOptions, setOwnershipOptions] = useState<{ id: string; label: string }[]>([]);
  const [costCenterOptions, setCostCenterOptions] = useState<{ code: string; name: string }[]>([]);
  const [images, setImages] = useState<ImageFile[]>([]);

  // Editable form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [propertyType, setPropertyType] = useState<string>("");
  const [customPropertyType, setCustomPropertyType] = useState<string>("");
  const [propertyCode, setPropertyCode] = useState("");
  const [propertyCategory, setPropertyCategory] = useState("");
  const [costCenterCode, setCostCenterCode] = useState("");
  const [costCenterName, setCostCenterName] = useState("");
  const [proposedPropertyCode, setProposedPropertyCode] = useState("");
  const [proposedPropertyName, setProposedPropertyName] = useState("");
  const [proposedCostCenterCode, setProposedCostCenterCode] = useState("");
  const [proposedCostCenterName, setProposedCostCenterName] = useState("");
  const [ownershipType, setOwnershipType] = useState("");
  const [areaZone, setAreaZone] = useState("");
  const [streetBuildingName, setStreetBuildingName] = useState("");
  const [plotBuildingNo, setPlotBuildingNo] = useState("");
  const [titleDeedNo, setTitleDeedNo] = useState("");
  const [municipalityRefNo, setMunicipalityRefNo] = useState("");
  const [ownerLandlord, setOwnerLandlord] = useState("");
  const [propertyManager, setPropertyManager] = useState("");
  const [noOfFloors, setNoOfFloors] = useState("");
  const [noOfUnits, setNoOfUnits] = useState("");
  const [totalBuiltUpAreaSqm, setTotalBuiltUpAreaSqm] = useState("");
  const [commonAreaSqm, setCommonAreaSqm] = useState("");
  const [parkingCount, setParkingCount] = useState("");
  const [noOfElevators, setNoOfElevators] = useState("");
  const [amenity1, setAmenity1] = useState("");
  const [amenity2, setAmenity2] = useState("");
  const [amenity3, setAmenity3] = useState("");
  const [amenity4, setAmenity4] = useState("");
  const [amenity5, setAmenity5] = useState("");
  const [otherAmenitiesFacilities, setOtherAmenitiesFacilities] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [handoverDate, setHandoverDate] = useState("");
  const [propertyStatus, setPropertyStatus] = useState("");
  const [documentsReceived, setDocumentsReceived] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [kahramaaNumber, setKahramaaNumber] = useState("");
  const [municipalityDetails, setMunicipalityDetails] = useState("");
  const [roomDetails, setRoomDetails] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);

  // Autocomplete state
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const populateForm = (prop: Property) => {
    const municipality = (prop.municipality_details || {}) as Record<string, any>;
    const changeRequest = (municipality.change_request || {}) as Record<string, any>;
    const facilityAmenities = Array.isArray(municipality.facility_amenities)
      ? municipality.facility_amenities
      : [];

    setProperty(prop);
    setTitle(prop.title);
    setDescription(prop.description || "");
    setPrice(prop.base_price_per_night);
    setCity(prop.city);
    setState(prop.state || "");
    setZipCode(prop.zip_code || "");
    setCountry(prop.country);
    setAddress(prop.address);
    setIsActive(prop.is_active);
    setAmenities(prop.amenities || []);
    setImages((prop.property_images || []).map((img) => ({
      id: crypto.randomUUID(),
      url: img.image_url,
      category: "Exterior",
      isCover: img.is_primary,
    })));
    setPropertyType(prop.property_type || "");
    setCustomPropertyType("");
    setPropertyCode(prop.property_code || `PROP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    setPropertyCategory(prop.property_category || "");
    setCostCenterCode(prop.cost_center_code || "");
    setCostCenterName(prop.cost_center_name || "");
    setProposedPropertyCode(changeRequest.property_code_new || "");
    setProposedPropertyName(changeRequest.property_name_new || "");
    setProposedCostCenterCode(changeRequest.cost_center_code_new || "");
    setProposedCostCenterName(changeRequest.cost_center_name_new || "");
    setOwnershipType(prop.ownership_type || "");
    setAreaZone(prop.area_zone || "");
    setStreetBuildingName(prop.street_building_name || "");
    setPlotBuildingNo(prop.plot_building_no || "");
    setTitleDeedNo(prop.title_deed_no || "");
    setMunicipalityRefNo(prop.municipality_ref_no || "");
    setOwnerLandlord(String(municipality.owner_landlord || ""));
    setPropertyManager(prop.property_manager || "");
    setNoOfFloors(String(prop.no_of_floors ?? ""));
    setNoOfUnits(String(prop.no_of_units ?? ""));
    setTotalBuiltUpAreaSqm(String(prop.total_built_up_area_sqm ?? ""));
    setCommonAreaSqm(String(prop.common_area_sqm ?? ""));
    setParkingCount(String(prop.parking_count ?? ""));
    setNoOfElevators(String(prop.no_of_elevators ?? ""));
    setAmenity1(facilityAmenities[0] || "");
    setAmenity2(facilityAmenities[1] || "");
    setAmenity3(facilityAmenities[2] || "");
    setAmenity4(facilityAmenities[3] || "");
    setAmenity5(facilityAmenities[4] || "");
    setOtherAmenitiesFacilities(String(municipality.other_amenities_facilities || ""));
    setCompletionDate(prop.completion_date || "");
    setHandoverDate(prop.handover_date || "");
    setPropertyStatus(prop.property_status || "");
    setDocumentsReceived(Boolean(prop.documents_received));
    setRemarks(prop.remarks || "");
    setKahramaaNumber((prop as any).kahramaa_number || "");
    setMunicipalityDetails(JSON.stringify(prop.municipality_details || {}, null, 2));
  };

  useEffect(() => {
    if (isLoaded && !autocompleteService.current) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      const map = new window.google.maps.Map(document.createElement("div"));
      placesService.current = new window.google.maps.places.PlacesService(map);
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!isUuid(id)) {
      const mockProperty = mockProperties.find((item) => item.id === id || item.code === id);

      if (!mockProperty) {
        setError(`No property matched reference "${id}".`);
        setLoading(false);
        return;
      }

      const mappedProperty = mapMockPropertyToManagedProperty(mockProperty);
      const propertyUnits = mockUnits.filter((unit) => unit.propertyId === mockProperty.id);
      const propertyLeases = mockLeases.filter((lease) =>
        propertyUnits.some((unit) => unit.id === lease.unitId),
      );
      const activeLeases = propertyLeases.filter((lease) => lease.status === "active" || lease.status === "expiring").length;

      setIsMockProperty(true);
      setError(null);
      populateForm(mappedProperty);
      setRoomDetails(Array.isArray(mappedProperty.room_details) ? mappedProperty.room_details : []);
      setBookings([]);
      setUnitsCount(propertyUnits.length || mockProperty.units || 0);
      setOccupancyPct(
        propertyUnits.length
          ? Math.round((activeLeases / propertyUnits.length) * 100)
          : Math.round(mockProperty.occupancy * 100),
      );
      setLoading(false);
      return;
    }

    setIsMockProperty(false);
    Promise.all([
      fetchPropertyById(id),
      fetchHostBookings(MOCK_HOST_ID),
      fetchPropertyCategories(),
      fetchPropertyTypes(),
      fetchOwnershipTypes(),
      fetchCostCenters(),
    ])
      .then(([prop, bks, pc, pt, ow, cc]) => {
        setPropCategoryOptions(pc);
        setPropTypeOptions(pt);
        setOwnershipOptions(ow);
        setCostCenterOptions(cc);
        populateForm(prop);
        
        if (prop.room_details) {
          // Backwards compatibility: Check if old static object, convert to array
          if (!Array.isArray(prop.room_details)) {
            const arr = [];
            const old = prop.room_details as any;
            if (old.bedroom?.length) arr.push({ id: crypto.randomUUID(), type: "bedroom", name: "Bedroom", length: old.bedroom.length, width: old.bedroom.width, unit: old.bedroom.unit });
            if (old.bathroom?.length) arr.push({ id: crypto.randomUUID(), type: "bathroom", name: "Bathroom", length: old.bathroom.length, width: old.bathroom.width, unit: old.bathroom.unit });
            if (old.kitchen?.has) arr.push({ id: crypto.randomUUID(), type: "kitchen", name: "Kitchen", length: old.kitchen.length, width: old.kitchen.width, unit: old.kitchen.unit });
            if (old.balcony?.has) arr.push({ id: crypto.randomUUID(), type: "balcony", name: "Balcony", length: old.balcony.length, width: old.balcony.width, unit: old.balcony.unit });
            setRoomDetails(arr);
          } else {
            setRoomDetails(prop.room_details);
          }
        }

        const filtered = (bks as any[]).filter(b => b.property_id === id);
        setBookings(filtered);
        // fetch unit/lease metrics
        (async () => {
          try {
            const units = await fetchUnits({ property_id: id });
            setUnitsCount(units.length || 0);
            const occupiedUnits = (units || []).filter(
              (u: any) =>
                u.status?.toLowerCase() === "occupied" ||
                u.lease_status?.toLowerCase() === "leased" ||
                u.lease_status?.toLowerCase() === "active"
            ).length;
            setOccupancyPct(units.length ? Math.round((occupiedUnits / units.length) * 100) : 0);
          } catch (e) {
            setUnitsCount(null);
            setOccupancyPct(null);
          }
        })();
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddressSearch = (val: string) => {
    setAddress(val);
    if (!val.trim()) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }
    if (autocompleteService.current) {
      setLoadingPredictions(true);
      autocompleteService.current.getPlacePredictions({ input: val, types: ['address'] }, (results, status) => {
        setLoadingPredictions(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
          setShowPredictions(true);
        } else {
          setPredictions([]);
        }
      });
    }
  };

  const handleSelectPrediction = (placeId: string, descriptionStr: string) => {
    setAddress(descriptionStr);
    setShowPredictions(false);
    
    if (placesService.current) {
      placesService.current.getDetails({ placeId, fields: ['address_components'] }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.address_components) {
          let stNumber = "";
          let route = "";
          let c = "";
          let s = "";
          let cntry = "";
          let z = "";

          place.address_components.forEach(comp => {
            const types = comp.types;
            if (types.includes("street_number")) stNumber = comp.long_name;
            if (types.includes("route")) route = comp.long_name;
            if (types.includes("locality") || types.includes("postal_town")) c = comp.long_name;
            if (types.includes("administrative_area_level_1")) s = comp.long_name;
            if (types.includes("country")) cntry = comp.long_name;
            if (types.includes("postal_code")) z = comp.long_name;
          });

          setAddress(`${stNumber} ${route}`.trim() || descriptionStr.split(',')[0]);
          if (c) setCity(c);
          if (s) setState(s);
          if (cntry) setCountry(cntry);
          if (z) setZipCode(z);
        }
      });
    }
  };

  const handleSave = async () => {
    if (!property) return;
    const payload = buildPropertyPayload({
      title,
      description,
      propertyType: propertyType === "Other" ? customPropertyType : (propertyType || property.property_type),
      address,
      city,
      state,
      zipCode,
      country,
      basePricePerNight: price,
      maxGuests: property.max_guests,
      bedrooms: property.bedrooms,
      beds: property.beds,
      bathrooms: property.bathrooms,
      cleaningFee: property.cleaning_fee,
      isActive,
      roomDetails,
      amenities,
      propertyCode,
      costCenterCode,
      costCenterName,
      propertyCategory,
      ownershipType,
      areaZone,
      streetBuildingName,
      plotBuildingNo,
      titleDeedNo,
      municipalityRefNo,
      propertyManager,
      noOfFloors,
      noOfUnits,
      totalUnits: noOfUnits,
      totalBuiltUpAreaSqm,
      commonAreaSqm,
      parkingCount,
      noOfElevators,
      amenityFields: [amenity1, amenity2, amenity3, amenity4, amenity5],
      otherAmenitiesFacilities,
      completionDate,
      handoverDate,
      propertyStatus,
      documentsReceived,
      remarks,
      kahramaaNumber,
      municipalityDetails,
      proposedFields: {
        propertyCode: proposedPropertyCode,
        propertyName: proposedPropertyName,
        costCenterCode: proposedCostCenterCode,
        costCenterName: proposedCostCenterName,
      },
      ownerLandlord,
    });
    if (isMockProperty) {
      setProperty({
        ...property,
        ...payload,
        title,
        description,
        property_type: propertyType || property.property_type,
        base_price_per_night: price,
        city,
        state,
        zip_code: zipCode,
        country,
        address,
        is_active: isActive,
        room_details: roomDetails,
        amenities,
        property_category: propertyCategory,
      });
      toast.success("Demo property updated in the current session.");
      return;
    }

    setSaving(true);
    try {
      await updateProperty(property.id, payload as Partial<Omit<Property, "id" | "created_at" | "property_images">>);
      await updatePropertyImages(
        property.id,
        images.map((img, idx) => ({
          image_url: img.url,
          is_primary: img.isCover,
          display_order: idx,
        }))
      );
      toast.success("Property updated successfully!");
    } catch (err: any) {
      toast.error("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to deactivate this listing?")) return;
    if (isMockProperty) {
      toast.success("Demo property marked inactive for this session.");
      navigate({ to: `${basePath}/properties` });
      return;
    }
    try {
      await updateProperty(id, { is_active: false });
      toast.success("Listing deactivated.");
      navigate({ to: "/prop-mgr" });
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    }
  };

  const addRoom = (type: string) => {
    const typeLabel = ROOM_TYPES.find(r => r.value === type)?.label || "Room";
    const existingCount = roomDetails.filter(r => r.type === type).length;
    setRoomDetails([
      ...roomDetails, 
      { id: crypto.randomUUID(), type, name: `${typeLabel} ${existingCount + 1}`, length: "", width: "", unit: "ft" }
    ]);
  };

  const removeRoom = (rid: string) => {
    setRoomDetails(roomDetails.filter(r => r.id !== rid));
  };

  const updateRoom = (rid: string, field: string, value: any) => {
    setRoomDetails(roomDetails.map(r => r.id === rid ? { ...r, [field]: value } : r));
  };

  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketUnit, setTicketUnit] = useState("");
  const [ticketPriority, setTicketPriority] = useState<"low"|"medium"|"high"|"urgent">("medium");
  const [ticketCategory, setTicketCategory] = useState("general");
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const handleCreateTicket = async () => {
    if (!ticketTitle) return toast.error("Please enter a title");
    if (isMockProperty) {
      toast.success("Maintenance ticket captured for this demo property.");
      setMaintenanceOpen(false);
      setTicketTitle("");
      setTicketDesc("");
      setTicketUnit("");
      return;
    }
    setSubmittingTicket(true);
    try {
      await createMaintenanceTicket({
        property_id: id,
        host_id: property?.host_id ?? '',
        title: ticketTitle,
        description: ticketDesc,
        unit_ref: ticketUnit || null,
        priority: ticketPriority,
        category: ticketCategory,
        status: "new",
        assignee: null,
        reported_by: "Host Portal",
        resolved_at: null,
      });
      toast.success("Maintenance ticket created!");
      setMaintenanceOpen(false);
      setTicketTitle("");
      setTicketDesc("");
      setTicketUnit("");
    } catch (err: any) {
      toast.error("Failed to create ticket: " + err.message);
    } finally {
      setSubmittingTicket(false);
    }
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = new Date(year, month, i).toISOString().split("T")[0];
      const isBooked = bookings.some(b => {
        const checkIn = new Date(b.check_in).toISOString().split("T")[0];
        const checkOut = new Date(b.check_out).toISOString().split("T")[0];
        return dateStr >= checkIn && dateStr < checkOut;
      });
      days.push({ day: i, dateStr, isBooked });
    }
    return days;
  }, [currentMonth, bookings]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold">Property not found</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button asChild className="mt-4">
            <Link to={`${basePath}/properties`}>Back to Properties</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3">
            <Link to={`${basePath}/properties`}><ChevronLeft className="mr-1 h-4 w-4" /> Back to Properties</Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isViewMode ? 'View Property' : 'Edit Property'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{property.title} · {property.city}, {property.country}</p>
        </div>
        <div className="flex items-center gap-3">
          {isViewMode ? (
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => navigate({ to: `${basePath}/manage/$id`, params: { id }, search: { mode: 'edit' } } as any)}
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit Property
            </Button>
          ) : (
            <>
              <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Deactivate
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">

        {/* ── Left Column: Property Edit Form ── */}
        <div className="md:col-span-2 space-y-6">

          {/* 1. Identity & Codes */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Property Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Listing Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} readOnly={isViewMode} disabled={isViewMode} className={isViewMode ? 'bg-muted' : ''} />
                </div>
                <div className="space-y-2">
                  <Label>Property Code</Label>
                  <Input value={propertyCode} onChange={e => setPropertyCode(e.target.value)} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted disabled:cursor-not-allowed"
                    value={isActive ? "active" : "inactive"}
                    onChange={e => setIsActive(e.target.value === "active")}
                    disabled={isViewMode}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Cost Center Code</Label>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">🔒 Locked</span>
                  </div>
                  <Input
                    readOnly
                    value={costCenterCode || (property ? `CC-PROP-${property.id.slice(0, 8).toUpperCase()}` : "CC-PROP-DEFAULT")}
                    className="bg-muted font-mono font-semibold"
                    placeholder="Cost Center Code"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cost Center Name</Label>
                  <Input
                    readOnly
                    value={costCenterName || title || property?.title || "Property Cost Center"}
                    className="bg-muted font-medium"
                    placeholder="Auto-synced Cost Center"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} className="h-20" readOnly={isViewMode} disabled={isViewMode} />
              </div>
            </CardContent>
          </Card>

          {/* 1.5 Photos */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader 
                images={images} 
                onChange={setImages} 
                categories={['Exterior', 'Interior', 'Floor Plan', 'Other']}
                disabled={isViewMode}
              />
            </CardContent>
          </Card>

          {/* 2. Classification */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <SearchableSelect
                    options={[
                      ...propTypeOptions.map(u => ({ label: u.label, value: u.id })),
                      ...(propertyType && propertyType !== "Other" && !propTypeOptions.find(o => o.id === propertyType) ? [{ label: propertyType, value: propertyType }] : []),
                      { label: 'Other (Add new)', value: 'Other' },
                    ]}
                    value={propertyType}
                    onValueChange={v => { setPropertyType(v); if (v !== "Other") setCustomPropertyType(""); }}
                    placeholder="Search property type..."
                    disabled={isViewMode}
                  />
                  {propertyType === "Other" && (
                    <div className="mt-1 flex gap-2">
                      <Input placeholder="Enter custom type..." value={customPropertyType} onChange={e => setCustomPropertyType(e.target.value)} className="h-8 text-xs" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Property Category</Label>
                  <SearchableSelect
                    options={propCategoryOptions.map(u => ({ label: u.label, value: u.id }))}
                    value={propertyCategory}
                    onValueChange={v => setPropertyCategory(v)}
                    placeholder="Search category..."
                    disabled={isViewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ownership Type</Label>
                  <SearchableSelect
                    options={ownershipOptions.map(u => ({ label: u.label, value: u.id }))}
                    value={ownershipType}
                    onValueChange={v => setOwnershipType(v)}
                    placeholder="Search ownership type..."
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Location */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 relative">
                <Label>Street Address</Label>
                <Input 
                  value={address} 
                  onChange={e => handleAddressSearch(e.target.value)} 
                  onFocus={() => { if (!isViewMode && predictions.length > 0) setShowPredictions(true); }}
                  readOnly={isViewMode}
                  disabled={isViewMode}
                  className={isViewMode ? 'bg-muted' : ''}
                />
                {showPredictions && (
                  <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {loadingPredictions && <div className="p-3 text-sm text-muted-foreground flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Loading...</div>}
                    {!loadingPredictions && predictions.map((p) => (
                      <div 
                        key={p.place_id} 
                        className="px-4 py-3 cursor-pointer hover:bg-muted text-sm border-b border-border last:border-0"
                        onClick={() => handleSelectPrediction(p.place_id, p.description)}
                      >
                        <div className="font-medium">{p.structured_formatting.main_text}</div>
                        <div className="text-muted-foreground text-xs">{p.structured_formatting.secondary_text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={country} onChange={e => setCountry(e.target.value)} readOnly={isViewMode} disabled={isViewMode} className={isViewMode ? 'bg-muted' : ''} />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={city} onChange={e => setCity(e.target.value)} readOnly={isViewMode} disabled={isViewMode} className={isViewMode ? 'bg-muted' : ''} />
                </div>
                <div className="space-y-2">
                  <Label>Area / Zone</Label>
                  <Input value={areaZone} onChange={e => setAreaZone(e.target.value)} readOnly={isViewMode} disabled={isViewMode} className={isViewMode ? 'bg-muted' : ''} />
                </div>
                <div className="space-y-2">
                  <Label>Zip / Postal Code</Label>
                  <Input value={zipCode} onChange={e => setZipCode(e.target.value)} readOnly={isViewMode} disabled={isViewMode} className={isViewMode ? 'bg-muted' : ''} />
                </div>
              </div>
              {(city || country) && (
                <div className="mt-2 aspect-video rounded-xl border border-border overflow-hidden">
                  <iframe
                    width="100%" height="100%"
                    style={{ border: 0 }} loading="lazy" allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCN4v-DS9QmFjoiyaiwN8yfrPeZPbSA_xU&q=${encodeURIComponent(`${address}, ${city}, ${country}`)}`}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column: Summary Sidebar ── */}
        <div className="space-y-6">

          {/* Property Summary */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Property Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Units</span>
                <span className="font-semibold">{unitsCount ?? '—'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Occupancy</span>
                <span className="font-semibold">{occupancyPct != null ? `${occupancyPct}%` : '—'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${property.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {property.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start" size="sm">
                <Link to={`${basePath}/units` as any} search={{ property_id: id } as any}>
                  <Users className="mr-2 h-4 w-4" /> Manage Units
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
