import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Save, Trash2, Calendar as CalendarIcon, Users, Loader2, AlertCircle, Plus, Wrench } from "lucide-react";
import { fetchPropertyById, fetchHostBookings, updateProperty, createMaintenanceTicket, fetchUnits, fetchLeases, type Property } from "@/lib/supabase";
import { toast } from "sonner";
import { useJsApiLoader } from "@react-google-maps/api";

export const Route = createFileRoute("/host/manage/$id")({
  component: ManageProperty,
});

const MOCK_HOST_ID = "00000000-0000-4000-8000-000000000001";

const ROOM_TYPES = [
  { value: "bedroom", label: "Bedroom" },
  { value: "bathroom", label: "Bathroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "balcony", label: "Balcony" },
  { value: "drawing_room", label: "Drawing Room" },
  { value: "dining_room", label: "Dining Room" },
  { value: "other", label: "Other" },
];

const UNIT_TYPES = [
  { value: 'FLAT', label: 'Flat' },
  { value: 'SHOP', label: 'Shop' },
  { value: 'COMPOUND', label: 'Compound' },
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

function ManageProperty() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCN4v-DS9QmFjoiyaiwN8yfrPeZPbSA_xU',
    libraries: ['places']
  });

  const [property, setProperty] = useState<Property | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [unitsCount, setUnitsCount] = useState<number | null>(null);
  const [occupancyPct, setOccupancyPct] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (isLoaded && !autocompleteService.current) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      const map = new window.google.maps.Map(document.createElement("div"));
      placesService.current = new window.google.maps.places.PlacesService(map);
    }
  }, [isLoaded]);

  useEffect(() => {
    Promise.all([
      fetchPropertyById(id),
      fetchHostBookings(MOCK_HOST_ID),
    ])
      .then(([prop, bks]) => {
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
        setPropertyType(prop.property_type || "");
        setKahramaaNumber((prop as any).kahramaa_number || "");
        setMunicipalityDetails(JSON.stringify((prop as any).municipality_details || {}, null, 2));
        
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
            const leases = await fetchLeases({ property_id: id });
            const activeLeases = (leases || []).filter(l => l.lease_status === 'ACTIVE').length;
            setOccupancyPct(units.length ? Math.round((activeLeases / units.length) * 100) : 0);
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
    setSaving(true);
    try {
      let muni: any = null;
      try { muni = municipalityDetails ? JSON.parse(municipalityDetails) : null; } catch { muni = municipalityDetails; }
      await updateProperty(property.id, {
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
        kahramaa_number: kahramaaNumber || undefined,
        municipality_details: muni,
      });
      toast.success("Property updated successfully!");
    } catch (err: any) {
      toast.error("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to deactivate this listing?")) return;
    try {
      await updateProperty(id, { is_active: false });
      toast.success("Listing deactivated.");
      navigate({ to: "/host" });
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
            <Link to="/host/properties">Back to Properties</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3">
            <Link to="/host/properties"><ChevronLeft className="mr-1 h-4 w-4" /> Back to Properties</Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Property</h1>
          <p className="mt-1 text-muted-foreground">{property.title} — {property.city}, {property.country}</p>
          <p className="mt-1 text-xs text-muted-foreground">Units: {unitsCount ?? '—'} · Occupancy: {occupancyPct ?? '—'}%</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={maintenanceOpen} onOpenChange={setMaintenanceOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                <Wrench className="mr-2 h-4 w-4" /> Add Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Maintenance Ticket</DialogTitle>
                <DialogDescription>Create a new maintenance request for this property or a specific unit.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={ticketTitle} onChange={e => setTicketTitle(e.target.value)} placeholder="e.g. Broken AC" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={ticketDesc} onChange={e => setTicketDesc(e.target.value)} placeholder="Details..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Unit (Optional)</Label>
                    <Input value={ticketUnit} onChange={e => setTicketUnit(e.target.value)} placeholder="e.g. A-12" />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={ticketPriority} onValueChange={(v: any) => setTicketPriority(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={ticketCategory} onValueChange={setTicketCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="hvac">HVAC</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setMaintenanceOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateTicket} disabled={submittingTicket}>
                  {submittingTicket && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Ticket
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Deactivate
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        
        {/* Left Column: Edit Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
              <CardDescription>Update your listing's public information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Listing Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} className="h-32" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price per night ($)</Label>
                  <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={isActive ? "active" : "unlisted"}
                    onChange={e => setIsActive(e.target.value === "active")}
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="unlisted">Unlisted (Hidden)</option>
                  </select>
                </div>
              </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label>Unit Type</Label>
                    <Select value={propertyType} onValueChange={v => setPropertyType(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {UNIT_TYPES.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Kahramaa Number</Label>
                    <Input value={kahramaaNumber} onChange={e => setKahramaaNumber(e.target.value)} placeholder="Kahramaa / DEWA ref" />
                  </div>
                  <div className="space-y-2">
                    <Label>Municipality Details</Label>
                    <Input value={municipalityDetails} onChange={e => setMunicipalityDetails(e.target.value)} placeholder="JSON or short text" />
                  </div>
                </div>

              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
                <div className="space-y-2">
                  <Label>Max Guests</Label>
                  <Input type="number" defaultValue={property.max_guests} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Bedrooms</Label>
                  <Input type="number" defaultValue={property.bedrooms} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Bathrooms</Label>
                  <Input type="number" defaultValue={property.bathrooms} disabled className="bg-muted/50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Dimensions Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Room Dimensions</CardTitle>
              <CardDescription>Detailed dimensions give guests confidence in booking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {roomDetails.length === 0 ? (
                <p className="text-muted-foreground text-sm">No rooms added yet.</p>
              ) : (
                <div className="space-y-4">
                  {roomDetails.map((room) => (
                    <div key={room.id} className="p-4 border border-border rounded-xl bg-muted/10 relative">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeRoom(room.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Room Name</Label>
                          <Input 
                            value={room.name} 
                            onChange={e => updateRoom(room.id, "name", e.target.value)} 
                            placeholder="e.g. Master Bedroom"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Room Type</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                            value={room.type}
                            onChange={e => updateRoom(room.id, "type", e.target.value)}
                          >
                            {ROOM_TYPES.map(rt => (
                              <option key={rt.value} value={rt.value}>{rt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Length</Label>
                          <Input type="number" placeholder="0" value={room.length} onChange={e => updateRoom(room.id, "length", e.target.value)} required className="w-24" />
                        </div>
                        <span className="text-muted-foreground mt-6">×</span>
                        <div className="space-y-1">
                          <Label className="text-xs">Width</Label>
                          <Input type="number" placeholder="0" value={room.width} onChange={e => updateRoom(room.id, "width", e.target.value)} required className="w-24" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Unit</Label>
                          <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={room.unit} onChange={e => updateRoom(room.id, "unit", e.target.value)}>
                            <option value="ft">ft</option>
                            <option value="m">m</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-border flex items-center gap-3">
                <select 
                  id="manage-new-room-type"
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue="bedroom"
                >
                  {ROOM_TYPES.map(rt => (
                    <option key={rt.value} value={rt.value}>{rt.label}</option>
                  ))}
                </select>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    const select = document.getElementById("manage-new-room-type") as HTMLSelectElement;
                    addRoom(select.value);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Room
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
              <CardDescription>Select what your property offers.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {AMENITIES.filter(a => a.types.includes("all") || a.types.includes(property.property_type)).map((amenity) => (
                  <div
                    key={amenity.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      amenities.includes(amenity.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={amenity.id}
                      className="h-4 w-4 cursor-pointer"
                      checked={amenities.includes(amenity.id)}
                      onChange={() => {
                        setAmenities(prev => 
                          prev.includes(amenity.id) 
                            ? prev.filter(a => a !== amenity.id) 
                            : [...prev, amenity.id]
                        );
                      }}
                    />
                    <Label htmlFor={amenity.id} className="cursor-pointer flex-1 text-sm font-medium">{amenity.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
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
                  onFocus={() => { if (predictions.length > 0) setShowPredictions(true); }}
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
                    {!loadingPredictions && predictions.length > 0 && (
                      <div className="px-4 py-2 text-xs text-center text-muted-foreground bg-muted/30 italic">
                        Showing top {predictions.length} results
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={city} onChange={e => setCity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>State / Province</Label>
                  <Input value={state} onChange={e => setState(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Zip / Postal Code</Label>
                  <Input value={zipCode} onChange={e => setZipCode(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={country} onChange={e => setCountry(e.target.value)} />
                </div>
              </div>
              {city || country ? (
                <div className="mt-4 aspect-video bg-muted rounded-xl flex items-center justify-center border border-border overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCN4v-DS9QmFjoiyaiwN8yfrPeZPbSA_xU&q=${encodeURIComponent(`${address}, ${city}, ${state}, ${country}`)}`}
                  ></iframe>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Bookings & Stats */}
        <div className="space-y-6">

          {/* Availability Calendar Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Availability
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>&lt;</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>&gt;</Button>
                </div>
              </CardTitle>
              <CardDescription>
                {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center mb-2 text-xs font-semibold text-muted-foreground">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => (
                  <div 
                    key={i} 
                    className={`
                      aspect-square flex items-center justify-center rounded-md text-sm
                      ${!day ? "" : day.isBooked ? "bg-red-100 text-red-700 font-medium" : "bg-green-100 text-green-700 font-medium"}
                    `}
                    title={day ? (day.isBooked ? "Booked" : "Vacant") : ""}
                  >
                    {day?.day || ""}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-100"></div> Vacant</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-100"></div> Booked</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No bookings yet.</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking: any) => (
                    <div key={booking.id} className="flex items-start gap-4 border-b border-border last:border-0 pb-4 last:pb-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Guest #{booking.guest_id.slice(-4)}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(booking.check_in).toLocaleDateString()} – {new Date(booking.check_out).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{booking.guests_count} guest(s) · ${booking.total_price}</p>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold mt-2 ${
                          booking.status === "CONFIRMED" ? "bg-green-100 text-green-700"
                          : booking.status === "PENDING" ? "bg-yellow-100 text-yellow-700"
                          : booking.status === "COMPLETED" ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Property Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Price/Night</span>
                <span className="font-medium">${property.base_price_per_night}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cleaning Fee</span>
                <span className="font-medium">${property.cleaning_fee}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Bookings</span>
                <span className="font-medium">{bookings.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{property.property_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Listed Since</span>
                <span className="font-medium">{new Date(property.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
