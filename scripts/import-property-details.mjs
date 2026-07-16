import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..", "..");
const markdownPath = path.join(rootDir, "Property_Details.-EM.md");

function parseCell(value) {
  return value.replace(/â€“/g, "-").replace(/â€™/g, "'").trim();
}

function parseMoney(value) {
  const cleaned = parseCell(String(value || "")).replace(/[^\d.-]/g, "");
  return cleaned ? Number(cleaned) : null;
}

function parseDate(value) {
  const cleaned = parseCell(String(value || ""));
  if (!cleaned) return null;
  const match = cleaned.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  const parts = cleaned.match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (parts) return `${parts[3]}-${parts[2]}-${parts[1]}`;
  return null;
}

function parseIntOrNull(value) {
  const cleaned = parseCell(String(value || "")).replace(/[^\d-]/g, "");
  return cleaned ? Number.parseInt(cleaned, 10) : null;
}

function normalizeKey(value) {
  return parseCell(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map(parseCell);
}

function parseMarkdownTables(markdown) {
  const sections = {};
  let section = "";
  for (const line of markdown.split(/\r?\n/)) {
    const title = line.match(/^# Sheet: (.+)$/);
    if (title) {
      section = title[1].trim();
      sections[section] = [];
      continue;
    }
    if (section && line.trim().startsWith("|")) {
      const row = splitRow(line);
      if (row.some(Boolean)) sections[section].push(row);
    }
  }
  return sections;
}

function tableObjects(rows) {
  const header = rows[0] || [];
  return rows.slice(1).map((row) => {
    const item = {};
    header.forEach((column, index) => {
      item[column] = row[index] ?? "";
    });
    return item;
  });
}

function longRows(sectionName, rows) {
  return rows.slice(1).map((row, index) => ({
    section_name: sectionName,
    row_no: index + 1,
    row_data: row,
  }));
}

function getPropertyPayload(row) {
  const amenities = [
    row["Amenity / Facility 1"],
    row["Amenity / Facility 2"],
    row["Amenity / Facility 3"],
    row["Amenity / Facility 4"],
    row["Amenity / Facility 5"],
    row["Other Amenities / Facilities"],
  ].filter(Boolean);
  return {
    property_code: row["Property Code"],
    property_name: row["Property Name"],
    cost_center_code: row["Cost Center Code"] || null,
    cost_center_name: row["Cost Center Name"] || row["Property Name"],
    property_type: row["Property Type"],
    property_category: row["Property Category"],
    ownership_type: row["Ownership Type"],
    country: row["Country"],
    city: row["City"],
    area_zone: row["Area / Zone"] || null,
    street_building_name: row["Street / Building Name"] || null,
    plot_building_no: row["Plot / Building No."] || null,
    title_deed_no: row["Title Deed / Registration No."] || null,
    municipality_ref_no: row["Municipality / Building Ref No."] || null,
    owner_landlord: row["Owner / Landlord"],
    property_manager: row["Property Manager"],
    floors: row["No. of Floors"] || null,
    units_count: parseIntOrNull(row["No. of Units"]),
    total_built_up_area_sqm: parseMoney(row["Total Built-up Area Sqm"]),
    common_area_sqm: parseMoney(row["Common Area Sqm"]),
    parking_count: parseIntOrNull(row["Parking Count"]),
    elevator_count: parseIntOrNull(row["No of Elevator"]),
    amenities,
    completion_date: parseDate(row["Completion Date"]),
    handover_date: parseDate(row["Handover Date"]),
    property_status: row["Property Status"] || "Active",
    documents_received: row["Documents Received?"] || null,
    remarks: row["Remarks"] || null,
  };
}

function getUnitPayload(row) {
  return {
    unit_code: row["Unit Code / No."],
    property_code: row["Property Code"],
    unit_cost_center_code: row["Unit Cost Center Code"],
    unit_name: row["Unit Name"],
    parent_cost_center_code: row["Parent Cost Center Code"] || null,
    unit_type: row["Unit Type"] || null,
    unit_usage: row["Unit Usage"] || null,
    block_tower: row["Block / Tower"] || null,
    floor: row["Floor"] || null,
    bedrooms: parseIntOrNull(row["Bedrooms (1-7)"]),
    bathrooms: parseIntOrNull(row["Bathrooms (1-7)"]),
    area_sqm: parseMoney(row["Area Sqm"]),
    balcony_sqm: parseMoney(row["Balcony Sqm"]),
    total_area_sqm: parseMoney(row["Total Area Sqm"]),
    view_type: row["View Type"] || null,
    furnishing: row["Furnishing"] || null,
    parking_slot_no: row["Parking Slot No."] || null,
    electricity_meter_no: row["Electricity Meter No."] || null,
    water_meter_no: row["Water Meter No."] || null,
    cooling_chiller_meter_no: row["Cooling / Chiller Meter No."] || null,
    unit_status: row["Unit Status"] || null,
    lease_status: row["Lease Status"] || null,
    default_rent_amount: parseMoney(row["Default Rent Amount/ Base Rate"]),
    rent_frequency: row["Rent Frequency"] || null,
    current_tenant: row["Current Tenant"] || null,
    contract_no: row["Contract No."] || null,
    contract_start_date: parseDate(row["Contract Start Date"]),
    contract_end_date: parseDate(row["Contract End Date"]),
    current_rent: parseMoney(row["Current Rent"]),
    security_deposit_type: row["Security Deposit"] || null,
    security_deposit_amount: parseMoney(row["Sequirity Deposit Amount"]),
    service_charge: parseMoney(row["Service Charge"]),
    maintenance_responsibility: row["Maintenance Responsibility"] || null,
    handover_date: parseDate(row["Handover Date"]),
    documents_received: row["Documents Received"] || null,
    remarks: row["Remarks"] || null,
  };
}

async function upsert(client, table, conflictTarget, payload) {
  const keys = Object.keys(payload);
  const values = Object.values(payload);
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
  const updates = keys
    .filter((key) => !conflictTarget.split(",").map((k) => k.trim()).includes(key))
    .map((key) => `${key}=excluded.${key}`)
    .join(", ");
  await client.query(
    `insert into ${table} (${keys.join(", ")}) values (${placeholders})
     on conflict (${conflictTarget}) do update set ${updates}, updated_at=now()`,
    values,
  );
}

async function ensureSchema(client) {
  await client.query(`
    create extension if not exists pgcrypto;

    create table if not exists public.erp_property_masters (
      property_code text primary key,
      property_name text not null,
      cost_center_code text,
      cost_center_name text,
      property_type text,
      property_category text,
      ownership_type text,
      country text,
      city text,
      area_zone text,
      street_building_name text,
      plot_building_no text,
      title_deed_no text,
      municipality_ref_no text,
      owner_landlord text,
      property_manager text,
      floors text,
      units_count integer,
      total_built_up_area_sqm numeric(18,4),
      common_area_sqm numeric(18,4),
      parking_count integer,
      elevator_count integer,
      amenities text[] not null default '{}',
      completion_date date,
      handover_date date,
      property_status text,
      documents_received text,
      remarks text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists public.erp_unit_masters (
      unit_cost_center_code text primary key,
      unit_code text not null,
      property_code text not null references public.erp_property_masters(property_code),
      unit_name text not null,
      parent_cost_center_code text,
      unit_type text,
      unit_usage text,
      block_tower text,
      floor text,
      bedrooms integer,
      bathrooms integer,
      area_sqm numeric(18,4),
      balcony_sqm numeric(18,4),
      total_area_sqm numeric(18,4),
      view_type text,
      furnishing text,
      parking_slot_no text,
      electricity_meter_no text,
      water_meter_no text,
      cooling_chiller_meter_no text,
      unit_status text,
      lease_status text,
      default_rent_amount numeric(18,4),
      rent_frequency text,
      current_tenant text,
      contract_no text,
      contract_start_date date,
      contract_end_date date,
      current_rent numeric(18,4),
      security_deposit_type text,
      security_deposit_amount numeric(18,4),
      service_charge numeric(18,4),
      maintenance_responsibility text,
      handover_date date,
      documents_received text,
      remarks text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create index if not exists erp_unit_masters_property_code_idx on public.erp_unit_masters(property_code);
    create index if not exists erp_unit_masters_lease_status_idx on public.erp_unit_masters(lease_status);

    create table if not exists public.erp_dropdown_masters (
      master_type text not null,
      value text not null,
      sort_order integer not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (master_type, value)
    );

    create table if not exists public.erp_raw_sheet_rows (
      section_name text not null,
      row_no integer not null,
      row_data jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (section_name, row_no)
    );

    create table if not exists public.erp_tenant_masters (
      tenant_name text primary key,
      customer_type text not null default 'individual',
      source text not null default 'Property_Details.-EM.md',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists public.erp_lease_contracts (
      lease_key text primary key,
      unit_cost_center_code text not null references public.erp_unit_masters(unit_cost_center_code),
      tenant_name text not null references public.erp_tenant_masters(tenant_name),
      contract_no text,
      start_date date,
      end_date date,
      current_rent numeric(18,4),
      default_rent numeric(18,4),
      rent_frequency text,
      security_deposit_type text,
      security_deposit_amount numeric(18,4),
      lease_status text,
      documents_received text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create index if not exists erp_lease_contracts_tenant_idx on public.erp_lease_contracts(tenant_name);
    create index if not exists erp_lease_contracts_unit_idx on public.erp_lease_contracts(unit_cost_center_code);
  `);
}

async function main() {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) throw new Error("SUPABASE_DB_URL is required");
  const markdown = fs.readFileSync(markdownPath, "utf8");
  const sections = parseMarkdownTables(markdown);
  const properties = tableObjects(sections["Property Master"] || []);
  const units = tableObjects(sections["Unit Master"] || []);
  const dropdownRows = tableObjects(sections["Dropdown Lists"] || []);
  const rawRows = [
    ...longRows("Accounts", sections["Accounts"] || []),
    ...longRows("Accounts-Transactions", sections["Accounts-Transactions"] || []),
  ];

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await ensureSchema(client);
    await client.query("begin");

    for (const row of properties) {
      const payload = getPropertyPayload(row);
      if (payload.property_code) await upsert(client, "public.erp_property_masters", "property_code", payload);
    }

    for (const row of units) {
      const payload = getUnitPayload(row);
      if (payload.unit_cost_center_code && payload.property_code) {
        await upsert(client, "public.erp_unit_masters", "unit_cost_center_code", payload);
      }
    }

    for (const row of dropdownRows) {
      let sort = 0;
      for (const [column, value] of Object.entries(row)) {
        if (!value) continue;
        sort += 1;
        await upsert(client, "public.erp_dropdown_masters", "master_type, value", {
          master_type: normalizeKey(column),
          value,
          sort_order: sort,
        });
      }
    }

    for (const raw of rawRows) {
      await upsert(client, "public.erp_raw_sheet_rows", "section_name, row_no", raw);
    }

    const occupiedUnits = units.map(getUnitPayload).filter((unit) => unit.current_tenant && unit.contract_start_date && unit.contract_end_date);
    for (const unit of occupiedUnits) {
      await upsert(client, "public.erp_tenant_masters", "tenant_name", {
        tenant_name: unit.current_tenant,
        customer_type: /^m\/?s\.?|embassy|trading|real estate/i.test(unit.current_tenant) ? "company" : "individual",
        source: "Property_Details.-EM.md",
      });
      await upsert(client, "public.erp_lease_contracts", "lease_key", {
        lease_key: `${unit.unit_cost_center_code}:${unit.current_tenant}:${unit.contract_start_date}`,
        unit_cost_center_code: unit.unit_cost_center_code,
        tenant_name: unit.current_tenant,
        contract_no: unit.contract_no,
        start_date: unit.contract_start_date,
        end_date: unit.contract_end_date,
        current_rent: unit.current_rent,
        default_rent: unit.default_rent_amount,
        rent_frequency: unit.rent_frequency,
        security_deposit_type: unit.security_deposit_type,
        security_deposit_amount: unit.security_deposit_amount,
        lease_status: unit.lease_status,
        documents_received: unit.documents_received,
      });
    }

    await client.query("commit");

    const counts = await client.query(`
      select
        (select count(*) from public.erp_property_masters) as properties,
        (select count(*) from public.erp_unit_masters) as units,
        (select count(*) from public.erp_tenant_masters) as tenants,
        (select count(*) from public.erp_lease_contracts) as leases,
        (select count(*) from public.erp_dropdown_masters) as dropdown_values,
        (select count(*) from public.erp_raw_sheet_rows) as raw_rows
    `);
    console.log(JSON.stringify(counts.rows[0], null, 2));
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
