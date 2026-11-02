import React from "react";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, MapPin, Building, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export interface QatarNationalAddressProps {
  zone?: string | number;
  street?: string | number;
  building?: string | number;
  unit?: string | number;
  pin?: string | number;
  kahramaaMeter?: string | number;
  city?: string;
  className?: string;
  compact?: boolean;
  interactive?: boolean;
  showUnit?: boolean;
}

/**
 * Extracts and parses Qatar National Address fields from any raw string or object
 */
export function extractNationalAddressParts(data: any): {
  zone: string;
  street: string;
  building: string;
  unit: string;
  pin: string;
} {
  if (!data) return { zone: "", street: "", building: "", unit: "", pin: "" };

  const zone = String(
    data.zone || data.zoneNo || data.zone_no || data.area_zone || data.areaZone || "",
  )
    .replace(/[^0-9a-zA-Z\s-]/g, "")
    .trim();

  const street = String(
    data.street ||
      data.streetNo ||
      data.street_no ||
      data.streetNumber ||
      data.street_building_name ||
      "",
  )
    .replace(/[^0-9a-zA-Z\s-]/g, "")
    .trim();

  const building = String(
    data.building ||
      data.buildingNo ||
      data.building_no ||
      data.buildingNumber ||
      data.plot_building_no ||
      data.plotBuildingNo ||
      "",
  )
    .replace(/[^0-9a-zA-Z\s-]/g, "")
    .trim();

  const unit = String(
    data.unit || data.unitNo || data.unit_no || data.propertyUnitNumber || data.unitCode || "",
  ).trim();

  const pin = String(
    data.pin ||
      data.pinNo ||
      data.pin_no ||
      data.kahramaa_number ||
      data.kahramaaNumber ||
      data.electricityNumber ||
      "",
  ).trim();

  return { zone, street, building, unit, pin };
}

/**
 * Formats a Qatar National Address as standard single-line address text
 */
export function formatQatarNationalAddress(data: any): string {
  const { zone, street, building, unit, pin } = extractNationalAddressParts(data);
  const parts: string[] = [];
  if (unit) parts.push(`Unit ${unit}`);
  if (building) parts.push(`Bldg ${building}`);
  if (street) parts.push(`Street ${street}`);
  if (zone) parts.push(`Zone ${zone}`);
  if (pin) parts.push(`PIN: ${pin}`);
  parts.push("Doha, Qatar");
  return parts.join(", ");
}

/**
 * Visual Official Qatar Blue Plate (اللوحة الزرقاء - العنوان الوطني)
 * Modeled after the official Qatar Ministry of Municipality (MME) enameled metal plate.
 */
export function QatarBluePlate({
  zone,
  street,
  building,
  unit,
  pin,
  kahramaaMeter,
  className = "",
  compact = false,
  interactive = true,
  showUnit = true,
}: QatarNationalAddressProps) {
  const [copied, setCopied] = React.useState(false);

  const cleanZone = String(zone || "60").replace(/^Zone\s*/i, "");
  const cleanStreet = String(street || "840").replace(/^Street\s*/i, "");
  const cleanBuilding = String(building || "42").replace(/^Building\s*/i, "");
  const cleanUnit = unit ? String(unit) : "";
  const cleanPin = String(pin || kahramaaMeter || "41020304");

  const fullAddress = `Building ${cleanBuilding}, Street ${cleanStreet}, Zone ${cleanZone}${cleanUnit ? `, Unit ${cleanUnit}` : ""}, PIN: ${cleanPin}, Doha, State of Qatar`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    toast.success("Official National Address copied", {
      description: fullAddress,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <div
        onClick={interactive ? handleCopy : undefined}
        title={fullAddress + " (Click to copy)"}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-mono cursor-pointer transition-colors bg-[#082852] text-white border-blue-400/40 hover:bg-[#0b3875] ${className}`}
      >
        <span className="text-[10px] font-bold text-amber-400">🇶🇦</span>
        <span className="text-blue-200">Z:</span>
        <strong className="text-white">{cleanZone}</strong>
        <span className="text-blue-300">/</span>
        <span className="text-blue-200">St:</span>
        <strong className="text-white">{cleanStreet}</strong>
        <span className="text-blue-300">/</span>
        <span className="text-blue-200">Bldg:</span>
        <strong className="text-white">{cleanBuilding}</strong>
        {cleanUnit && (
          <>
            <span className="text-blue-300">/</span>
            <span className="text-blue-200">U:</span>
            <strong className="text-amber-300">{cleanUnit}</strong>
          </>
        )}
        {cleanPin && (
          <span className="text-[10px] text-blue-300/80 pl-1 border-l border-blue-400/30">
            PIN {cleanPin}
          </span>
        )}
        {interactive &&
          (copied ? (
            <Check className="h-3 w-3 text-emerald-400 ml-0.5" />
          ) : (
            <Copy className="h-2.5 w-2.5 text-blue-300 opacity-60 hover:opacity-100 ml-0.5" />
          ))}
      </div>
    );
  }

  // Full Qatar Blue Plate Badge Representation
  return (
    <div
      onClick={interactive ? handleCopy : undefined}
      title="Official Qatar National Address (Click to copy standard address)"
      className={`relative inline-block select-none rounded-md bg-[#0a2f64] text-white p-2.5 border-2 border-white shadow-md font-sans tracking-normal overflow-hidden transition-all hover:shadow-lg ${interactive ? "cursor-pointer hover:scale-[1.01]" : ""} ${className}`}
      style={{
        boxShadow: "0 4px 12px rgba(10, 47, 100, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
      }}
    >
      {/* Subtle enameled border reflection */}
      <div className="absolute inset-0.5 rounded-[4px] border border-blue-300/30 pointer-events-none" />

      {/* Plate Header: State of Qatar & National Address */}
      <div className="flex items-center justify-between border-b border-blue-300/30 pb-1 mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">🇶🇦</span>
          <span className="text-[10px] font-bold tracking-wider text-blue-100 uppercase">
            العنوان الوطني • National Address
          </span>
        </div>
        <div className="flex items-center gap-1">
          {interactive &&
            (copied ? (
              <span className="text-[9px] text-emerald-300 font-bold flex items-center gap-0.5">
                <Check className="h-3 w-3" /> Copied
              </span>
            ) : (
              <Copy className="h-2.5 w-2.5 text-blue-300/70" />
            ))}
        </div>
      </div>

      {/* 3 Main Blue Plate Number Columns (Building - Street - Zone) */}
      <div className="grid grid-cols-3 gap-2 text-center px-1">
        {/* Building Number */}
        <div className="bg-[#07234b]/80 rounded p-1.5 border border-blue-400/20">
          <div className="text-[9px] text-blue-200 font-medium">المبنى / Building</div>
          <div className="text-lg font-black font-mono tracking-tight text-white mt-0.5">
            {cleanBuilding}
          </div>
        </div>

        {/* Street Number */}
        <div className="bg-[#07234b]/80 rounded p-1.5 border border-blue-400/20">
          <div className="text-[9px] text-blue-200 font-medium">الشارع / Street</div>
          <div className="text-lg font-black font-mono tracking-tight text-white mt-0.5">
            {cleanStreet}
          </div>
        </div>

        {/* Zone Number */}
        <div className="bg-[#07234b]/80 rounded p-1.5 border border-blue-400/20">
          <div className="text-[9px] text-blue-200 font-medium">المنطقة / Zone</div>
          <div className="text-lg font-black font-mono tracking-tight text-white mt-0.5">
            {cleanZone}
          </div>
        </div>
      </div>

      {/* Footer Strip: Unit & Kahramaa PIN */}
      <div className="mt-2 pt-1 border-t border-blue-300/20 flex items-center justify-between text-[10px] px-1 text-blue-200">
        <div className="flex items-center gap-1 font-mono">
          <span className="text-blue-300">PIN / كهرماء:</span>
          <strong className="text-amber-300">{cleanPin}</strong>
        </div>
        {showUnit && cleanUnit && (
          <div className="flex items-center gap-1 font-mono">
            <span className="text-blue-300">الوحدة / Unit:</span>
            <strong className="text-white bg-blue-500/30 px-1 rounded">{cleanUnit}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact Blue Plate Pill for dense tables & cards
 */
export function QatarNationalAddressPill(props: QatarNationalAddressProps) {
  return <QatarBluePlate {...props} compact={true} />;
}
