import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Image as ImageIcon, CheckCircle, ChevronLeft, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { createProperty } from "@/lib/supabase";
import { toast } from "sonner";
import { useJsApiLoader } from "@react-google-maps/api";

export const Route = createFileRoute("/host/create")({
  component: HostCreateProperty,
});

const MOCK_HOST_ID = "00000000-0000-4000-8000-000000000001";

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

const STEP_LABELS = ["Location", "Details", "Room Dimensions", "Amenities", "Photos", "Pricing"];

const ROOM_TYPES = [
  { value: "bedroom", label: "Bedroom" },
  { value: "bathroom", label: "Bathroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "balcony", label: "Balcony" },
  { value: "drawing_room", label: "Drawing Room" },
  { value: "dining_room", label: "Dining Room" },
  { value: "other", label: "Other" },
];

function HostCreateProperty() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const totalSteps = 6;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCN4v-DS9QmFjoiyaiwN8yfrPeZPbSA_xU',
    libraries: ['places']
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "apartment",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    guests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: [] as string[],
    basePrice: 100,
    cleaningFee: 50,
    roomDetails: [] as any[]
  });

  // Places Autocomplete state
  const [addressInput, setAddressInput] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (isLoaded && !autocompleteService.current) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      // Dummy map element for PlacesService
      const map = new window.google.maps.Map(document.createElement("div"));
      placesService.current = new window.google.maps.places.PlacesService(map);
    }
  }, [isLoaded]);

  const handleAddressSearch = (val: string) => {
    setAddressInput(val);
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

  const handleSelectPrediction = (placeId: string, description: string) => {
    setAddressInput(description);
    setShowPredictions(false);
    
    if (placesService.current) {
      placesService.current.getDetails({ placeId, fields: ['address_components'] }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.address_components) {
          let stNumber = "";
          let route = "";
          let city = "";
          let state = "";
          let country = "";
          let zip = "";

          place.address_components.forEach(comp => {
            const types = comp.types;
            if (types.includes("street_number")) stNumber = comp.long_name;
            if (types.includes("route")) route = comp.long_name;
            if (types.includes("locality") || types.includes("postal_town")) city = comp.long_name;
            if (types.includes("administrative_area_level_1")) state = comp.long_name;
            if (types.includes("country")) country = comp.long_name;
            if (types.includes("postal_code")) zip = comp.long_name;
          });

          setFormData(prev => ({
            ...prev,
            address: `${stNumber} ${route}`.trim() || description.split(',')[0],
            city: city || prev.city,
            state: state || prev.state,
            country: country || prev.country,
            zipCode: zip || prev.zipCode
          }));
        }
      });
    }
  };

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (id: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id],
    }));
  };

  const spawnRooms = () => {
    if (formData.roomDetails.length > 0) return; // Already spawned
    
    const newRooms = [];
    if (formData.propertyType === "studio") {
      newRooms.push({ id: crypto.randomUUID(), type: "other", name: `Studio Space`, length: "", width: "", unit: "ft" });
    } else {
      for (let i = 0; i < formData.bedrooms; i++) {
        newRooms.push({ id: crypto.randomUUID(), type: "bedroom", name: `Bedroom ${i + 1}`, length: "", width: "", unit: "ft" });
      }
    }
    for (let i = 0; i < formData.bathrooms; i++) {
      newRooms.push({ id: crypto.randomUUID(), type: "bathroom", name: `Bathroom ${i + 1}`, length: "", width: "", unit: "ft" });
    }
    setFormData(prev => ({ ...prev, roomDetails: newRooms }));
  };

  const addRoom = (type: string) => {
    const typeLabel = ROOM_TYPES.find(r => r.value === type)?.label || "Room";
    const existingCount = formData.roomDetails.filter(r => r.type === type).length;
    setFormData(prev => ({
      ...prev,
      roomDetails: [
        ...prev.roomDetails, 
        { id: crypto.randomUUID(), type, name: `${typeLabel} ${existingCount + 1}`, length: "", width: "", unit: "ft" }
      ]
    }));
  };

  const removeRoom = (id: string) => {
    setFormData(prev => ({
      ...prev,
      roomDetails: prev.roomDetails.filter(r => r.id !== id)
    }));
  };

  const updateRoom = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      roomDetails: prev.roomDetails.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 2) {
      spawnRooms();
    }
    
    // Validation for Room Dimensions step
    if (step === 3) {
      const invalidRooms = formData.roomDetails.filter(r => !r.length || !r.width || !r.name);
      if (invalidRooms.length > 0) {
        toast.error("Please fill in the dimensions and name for all rooms.");
        return;
      }
    }

    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newProperty = await createProperty({
        host_id: MOCK_HOST_ID,
        title: formData.title,
        description: formData.description,
        property_type: formData.propertyType,
        address: formData.address || addressInput,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        country: formData.country,
        max_guests: formData.guests,
        bedrooms: formData.bedrooms,
        beds: formData.beds,
        bathrooms: formData.bathrooms,
        base_price_per_night: formData.basePrice,
        cleaning_fee: formData.cleaningFee,
        is_active: true,
        room_details: formData.roomDetails,
        amenities: formData.amenities,
      });
      toast.success("🎉 Listing published successfully!");
      navigate({ to: "/host/manage/$id", params: { id: newProperty.id } });
    } catch (err: any) {
      toast.error("Failed to create listing: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3">
          <Link to="/host/properties"><ChevronLeft className="mr-1 h-4 w-4" /> Back to Properties</Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Create a new listing</h1>
            <p className="mt-1 text-muted-foreground">Step {step} of {totalSteps} — {STEP_LABELS[step - 1]}</p>
          </div>
        </div>
      </div>

      <div className="w-full bg-border h-1.5 rounded-full mb-8 overflow-hidden">
        <div className="bg-primary h-full transition-all duration-300 ease-out" style={{ width: `${(step / totalSteps) * 100}%` }} />
      </div>

      <Card className="border-border shadow-lg">
        <form onSubmit={step === totalSteps ? handleSubmit : handleNext}>

          {/* Step 1: Location */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Where is your place located?</CardTitle>
                <CardDescription>Guests will only get your exact address once they've booked.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 relative">
                  <Label>Street Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Start typing your address..."
                      value={addressInput || formData.address}
                      onChange={(e) => handleAddressSearch(e.target.value)}
                      onFocus={() => { if (predictions.length > 0) setShowPredictions(true); }}
                      required
                    />
                  </div>
                  
                  {/* Autocomplete Dropdown */}
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
                    <Input
                      placeholder="e.g. Riyadh"
                      value={formData.city}
                      onChange={(e) => updateForm("city", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State / Province</Label>
                    <Input
                      placeholder="e.g. Riyadh Province"
                      value={formData.state}
                      onChange={(e) => updateForm("state", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Zip / Postal Code</Label>
                    <Input
                      placeholder="e.g. 12211"
                      value={formData.zipCode}
                      onChange={(e) => updateForm("zipCode", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      placeholder="e.g. Saudi Arabia"
                      value={formData.country}
                      onChange={(e) => updateForm("country", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {formData.city || formData.country ? (
                  <div className="mt-4 aspect-video bg-muted rounded-xl flex items-center justify-center border border-border overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCN4v-DS9QmFjoiyaiwN8yfrPeZPbSA_xU&q=${encodeURIComponent(`${formData.address}, ${formData.city}, ${formData.country}`)}`}
                    ></iframe>
                  </div>
                ) : (
                  <div className="mt-4 aspect-video bg-muted rounded-xl flex items-center justify-center border border-border">
                    <p className="text-muted-foreground flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" /> Enter location details to see map preview
                    </p>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Describe your property</CardTitle>
                <CardDescription>Share what makes your place special.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={formData.propertyType}
                    onChange={e => updateForm("propertyType", e.target.value)}
                  >
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="house">House</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="studio">Studio</option>
                    <option value="townhouse">Townhouse</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Listing Title</Label>
                  <Input
                    placeholder="e.g. Luxury Penthouse with City Views"
                    value={formData.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    required
                    maxLength={50}
                />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Tell guests about the space, the neighborhood, and anything else they should know."
                    className="h-32"
                    value={formData.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    required
                  />
                </div>
                <div className="border-t border-border pt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label>Max Guests</Label>
                    <Input type="number" min="1" max="16" value={formData.guests} onChange={(e) => updateForm("guests", parseInt(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bedrooms</Label>
                    <Input 
                      type="number" 
                      min="0" max="10" 
                      value={formData.propertyType === "studio" ? 0 : formData.bedrooms} 
                      onChange={(e) => updateForm("bedrooms", parseInt(e.target.value))} 
                      disabled={formData.propertyType === "studio"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Beds</Label>
                    <Input type="number" min="1" max="20" value={formData.beds} onChange={(e) => updateForm("beds", parseInt(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bathrooms</Label>
                    <Input type="number" min="1" max="10" step="0.5" value={formData.bathrooms} onChange={(e) => updateForm("bathrooms", parseFloat(e.target.value))} />
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Room Dimensions */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Room Dimensions</CardTitle>
                <CardDescription>Provide detailed dimensions for all rooms. We've added empty cards based on your inputs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {formData.roomDetails.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No rooms added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {formData.roomDetails.map((room, index) => (
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
                    id="new-room-type"
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
                      const select = document.getElementById("new-room-type") as HTMLSelectElement;
                      addRoom(select.value);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Room
                  </Button>
                </div>

              </CardContent>
            </>
          )}

          {/* Step 4: Amenities */}
          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>What amenities do you offer?</CardTitle>
                <CardDescription>Check all that apply to your property.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {AMENITIES.filter(a => a.types.includes("all") || a.types.includes(formData.propertyType)).map((amenity) => (
                    <div
                      key={amenity.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        formData.amenities.includes(amenity.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <Checkbox
                        id={amenity.id}
                        checked={formData.amenities.includes(amenity.id)}
                        onCheckedChange={() => toggleAmenity(amenity.id)}
                      />
                      <Label htmlFor={amenity.id} className="cursor-pointer flex-1">{amenity.label}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </>
          )}

          {/* Step 5: Photos */}
          {step === 5 && (
            <>
              <CardHeader>
                <CardTitle>Add some photos of your place</CardTitle>
                <CardDescription>You'll need at least 5 photos to get started. Photos are uploaded to Supabase Storage.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:bg-muted/30 transition-colors cursor-pointer">
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Drag your photos here</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">PNG, JPG, WEBP up to 10MB each</p>
                  <Button type="button" variant="outline">Browse from device</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  ☁️ Files are uploaded to your Supabase Storage bucket.
                </p>
              </CardContent>
            </>
          )}

          {/* Step 6: Pricing */}
          {step === 6 && (
            <>
              <CardHeader>
                <CardTitle>Now, set your price</CardTitle>
                <CardDescription>You can change this at any time from your dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="max-w-sm mx-auto p-6 bg-muted/30 rounded-2xl border border-border text-center space-y-3">
                  <Label className="text-base font-semibold">Base price per night</Label>
                  <div className="flex items-center justify-center gap-2 text-4xl font-bold text-foreground">
                    <span className="text-muted-foreground text-2xl font-normal">$</span>
                    <Input
                      type="number"
                      className="w-28 h-14 text-3xl text-center font-bold bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 border-primary rounded-none focus-visible:ring-0 px-0"
                      value={formData.basePrice}
                      onChange={(e) => updateForm("basePrice", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Guest pays <span className="font-semibold text-foreground">${(formData.basePrice * 1.15).toFixed(0)}</span> with service fees</p>
                    <p>You earn ~<span className="font-semibold text-foreground">${(formData.basePrice * 0.97).toFixed(0)}</span> per night</p>
                  </div>
                </div>

                <div className="max-w-sm mx-auto space-y-4">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <Label>Cleaning fee</Label>
                      <p className="text-xs text-muted-foreground">Charged once per booking</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">$</span>
                      <Input
                        type="number"
                        className="w-20 text-right"
                        value={formData.cleaningFee}
                        onChange={(e) => updateForm("cleaningFee", parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between"><span>Base price</span><span>${formData.basePrice}/night</span></div>
                    <div className="flex justify-between"><span>Cleaning fee (once)</span><span>${formData.cleaningFee}</span></div>
                    <div className="flex justify-between font-semibold border-t border-border pt-2 mt-2"><span>5-night stay total</span><span>${formData.basePrice * 5 + formData.cleaningFee}</span></div>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          <CardFooter className="flex justify-between border-t border-border pt-6 mt-6">
            <Button type="button" variant="outline" onClick={handlePrev} disabled={step === 1}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={submitting}>
              {step === totalSteps ? (
                submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</>
                ) : (
                  <><CheckCircle className="mr-2 h-4 w-4" /> Publish Listing</>
                )
              ) : (
                <>Next <ChevronRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
