import { i as __toESM } from "../_runtime.mjs";
import { U as supabase } from "./supabase-DqnF3U5S.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-data-context-6wxPWjtr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var today = /* @__PURE__ */ new Date();
function addDays(date, days) {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next.toISOString().split("T")[0];
}
var INITIAL_SEED_RESERVATIONS = [];
var EMPTY_DATA = {
	units: [],
	customers: [],
	reservations: [],
	leases: [],
	pdcs: [],
	vouchers: [],
	keyNotices: [],
	handovers: [],
	checkIns: [],
	auditEvents: []
};
var AppDataContext = (0, import_react.createContext)(null);
function AppDataProvider({ children }) {
	const [appData, setAppData] = (0, import_react.useState)(EMPTY_DATA);
	const [syncing, setSyncing] = (0, import_react.useState)(true);
	const fetchDirectFromDatabase = (0, import_react.useCallback)(async () => {
		setSyncing(true);
		try {
			async function fetchAllRows(queryFn) {
				let rows = [];
				let from = 0;
				const pageSize = 1e3;
				while (true) try {
					const res = await Promise.resolve(queryFn(from, from + pageSize - 1));
					if (res.error || !res.data || res.data.length === 0) break;
					rows = rows.concat(res.data);
					if (res.data.length < pageSize) break;
					from += pageSize;
				} catch {
					break;
				}
				return rows;
			}
			const [unitsData, propertiesData, customersData, leasesData, finPdcsData, altPdcsData, reservationsData, vouchersData, handoversData, inspectionsData] = await Promise.all([
				fetchAllRows((from, to) => supabase.from("units").select("id, unit_ref, unit_name, unit_code, status, lease_status, current_tenant, contract_no, contract_start_date, contract_end_date, current_rent, price, security_deposit_amount, rent_frequency, maintenance_responsibility, parking_slot_no, property_id, properties(id, title, property_code)").range(from, to)),
				fetchAllRows((from, to) => supabase.from("properties").select("id, title, property_code").range(from, to)),
				fetchAllRows((from, to) => supabase.from("customers").select("*").range(from, to)),
				fetchAllRows((from, to) => supabase.from("leases").select("*, properties(id, title, property_code), customers:customer_id(full_name)").range(from, to)),
				fetchAllRows((from, to) => supabase.from("fin_pdc_register").select("*").range(from, to)),
				fetchAllRows((from, to) => supabase.from("pdcs").select("*").range(from, to)),
				fetchAllRows((from, to) => supabase.from("reservations").select("*").range(from, to)),
				fetchAllRows((from, to) => supabase.from("fin_vouchers").select("*").range(from, to)),
				fetchAllRows((from, to) => supabase.from("key_handovers").select("*").range(from, to)),
				fetchAllRows((from, to) => supabase.from("inspection_reports").select("*").range(from, to))
			]);
			const unitsRes = { data: unitsData };
			const propertiesRes = { data: propertiesData };
			const customersRes = { data: customersData };
			const leasesRes = { data: leasesData };
			const pdcsRes = { data: finPdcsData };
			const altPdcsRes = { data: altPdcsData };
			const reservationsRes = { data: reservationsData };
			const vouchersRes = { data: vouchersData };
			const handoversRes = { data: handoversData };
			const inspectionsRes = { data: inspectionsData };
			const propMap = /* @__PURE__ */ new Map();
			(propertiesRes.data || []).forEach((p) => {
				if (p.id) propMap.set(p.id, p.title);
				if (p.property_code) propMap.set(p.property_code, p.title);
			});
			const unitMap = /* @__PURE__ */ new Map();
			(unitsRes.data || []).forEach((u) => {
				if (u.id) unitMap.set(u.id, u.unit_ref || u.unit_name || u.unit_code || "Unit");
			});
			const mappedUnits = (unitsRes.data || []).map((u) => {
				const propTitle = u.properties?.title || propMap.get(u.property_id) || u.property_id || "Property";
				return {
					id: u.id,
					property: propTitle,
					unit: u.unit_ref || u.unit_name || u.unit_code || "Unit",
					status: (u.status === "Occupied" || u.lease_status === "Leased" ? "Occupied" : u.status === "Available" ? "Available" : u.status) || "Available",
					rent: Number(u.current_rent || u.price || 0)
				};
			});
			const seenCustIds = /* @__PURE__ */ new Set();
			const seenCustNames = /* @__PURE__ */ new Set();
			const mergedCustomers = [];
			const normalizeCustKey = (name) => {
				if (!name) return "";
				let n = name.toLowerCase().trim();
				n = n.replace(/^m\s*\/\s*s\.?\s*/i, "m/s ");
				n = n.replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
				return n;
			};
			const canonicalName = (name) => {
				if (!name) return name;
				return name.trim().replace(/^(M|m)\s*\/\s*(S|s)\.?\s*/, "M/s ");
			};
			const resolveName = (c) => (c.full_name || c.name || c.tenant_name || c.customer_name || (c.first_name && c.last_name ? `${c.first_name} ${c.last_name}`.trim() : "") || c.first_name || c.last_name || "").trim();
			const guessType = (name) => {
				const l = (name || "").toLowerCase().trim();
				return l.startsWith("m/s") || l.startsWith("m/s.") || l.includes("trading") || l.includes("w.l.l") || l.includes("llc") || l.includes("corp") || l.includes("group") || l.includes("co.") || l.includes("company") || l.includes("services") || l.includes("international") || l.includes("logistics") || l.includes("contracting") || l.includes("industries") || l.includes("enterprise") || l.includes("real estate") || l.includes("embassy") || l.includes("solutions") || l.includes("limited") || l.includes("sport club") || l.includes("electrical") || l.includes("katara") || l.includes("larsen") || l.includes("qentz") || l.includes("saipem") || l.includes("special numberz") || l.includes("glamour") || l.includes("alfanet") || l.includes("axiom") ? "company" : "individual";
			};
			for (const c of customersRes.data || []) {
				const name = resolveName(c);
				if (!name || name.toLowerCase().includes("abc trading")) continue;
				const id = String(c.id);
				const normKey = normalizeCustKey(name);
				if (seenCustIds.has(id) || normKey && seenCustNames.has(normKey)) continue;
				seenCustIds.add(id);
				if (normKey) seenCustNames.add(normKey);
				mergedCustomers.push({
					id,
					name,
					type: c.customer_type?.toLowerCase() === "company" || c.type?.toLowerCase() === "company" || guessType(name) === "company" ? "company" : "individual",
					qatarId: c.qatar_id || c.qatarId || "",
					passport: c.passport_number || c.passport || "",
					crNumber: c.commercial_registration || c.cr_number || c.crNumber || "",
					mobile: c.mobile_number || c.mobile || c.phone || "",
					email: c.email_address || c.email || "",
					status: "active",
					_source: "db"
				});
			}
			try {
				const rawHistory = localStorage.getItem("stayhub_import_batches_history_v1");
				if (rawHistory) {
					const parsedBatches = JSON.parse(rawHistory);
					if (Array.isArray(parsedBatches)) parsedBatches.forEach((b) => {
						if (b.module === "customer" && Array.isArray(b.records)) b.records.forEach((r) => {
							const norm = r.normalizedData || r.rawRowData || {};
							const custName = norm.full_name || norm["Full Name / Company Name"] || norm["Full Name / Company Name *"] || r.recordName;
							if (custName && (r.status === "SUCCESS" || r.status === "READY" || b.status === "COMPLETED" || b.status === "PARTIAL_SUCCESS")) {
								const nameClean = String(custName).trim();
								const normKey = normalizeCustKey(nameClean);
								if (!nameClean || normKey && seenCustNames.has(normKey) || nameClean.toLowerCase().includes("abc trading")) return;
								if (normKey) seenCustNames.add(normKey);
								const isCompany = (norm.customer_type || norm["Customer Type"])?.toLowerCase() === "company" || guessType(nameClean) === "company";
								mergedCustomers.push({
									id: r.recordId || `cust-imp-${r.recordKey || Math.floor(Math.random() * 1e5)}`,
									name: nameClean,
									type: isCompany ? "company" : "individual",
									qatarId: norm.qatar_id || norm["Qatar ID"] || (isCompany ? "" : r.recordKey),
									passport: norm.passport_number || norm["Passport Number"] || "",
									crNumber: norm.commercial_registration || norm["Commercial Registration (CR)"] || (isCompany ? r.recordKey : ""),
									mobile: norm.mobile_number || norm["Mobile Number"] || "",
									email: norm.email_address || norm["Email Address"] || "",
									status: "active",
									_source: "import"
								});
							}
						});
					});
				}
			} catch (err) {
				console.warn("Failed to load local imported customers:", err);
			}
			const mappedCustomers = mergedCustomers.sort((a, b) => a.name.localeCompare(b.name, void 0, { sensitivity: "base" }));
			const existingLeases = (leasesRes.data || []).map((l) => ({
				id: l.lease_number || l.id,
				customerId: l.customer_id || "",
				reservationId: l.id || "",
				property: l.properties?.title || propMap.get(l.property_id) || "Property",
				unit: unitMap.get(l.unit_id) || l.unit_ref || "Unit",
				tenantName: canonicalName(l.customers?.full_name || l.tenant_name || "Tenant"),
				startDate: l.commencement_date || "",
				endDate: l.expiry_date || "",
				monthlyRent: Number(l.rental_amount || 0),
				securityDeposit: Number(l.security_deposit || 0),
				pdcCount: Number(l.number_of_pdc || 12),
				paymentFrequency: l.payment_frequency?.toLowerCase() || "monthly",
				gracePeriodDays: Number(l.grace_period_days || 7),
				penalties: `${l.late_penalty_percentage || 0}%`,
				maintenanceResponsibility: l.maintenance_responsibility || "Landlord",
				utilityResponsibility: l.utility_responsibility || "Tenant",
				parkingDetails: l.parking_details || "",
				specialConditions: l.special_conditions || "",
				noticePeriodDays: Number(l.notice_period_days || 30),
				status: l.lease_status?.toLowerCase() || "active",
				collectionCompleted: true
			}));
			const seenLeaseUnits = new Set(existingLeases.map((l) => `${l.property}-${l.unit}`.toLowerCase()));
			const unitContracts = [];
			(unitsRes.data || []).forEach((u, idx) => {
				if (u.status?.toLowerCase() === "occupied" || u.lease_status?.toLowerCase() === "leased" && u.status?.toLowerCase() !== "available" || u.current_tenant && u.current_tenant.trim().length > 0) {
					const propTitle = u.properties?.title || propMap.get(u.property_id) || u.property_id || "Property";
					const unitIdentifier = u.unit_ref || u.unit_name || u.unit_code || "Unit";
					const unitKey = `${propTitle}-${unitIdentifier}`.toLowerCase();
					if (!seenLeaseUnits.has(unitKey)) {
						seenLeaseUnits.add(unitKey);
						const monthlyRent = Number(u.current_rent || u.price || u.rent_amount || 6500);
						const secDeposit = Number(u.security_deposit_amount || monthlyRent);
						const contractNo = u.contract_no || `L-${unitIdentifier.replace(/\W/g, "") || u.id.slice(0, 5)}`;
						const tenantName = u.current_tenant && u.current_tenant.trim() ? canonicalName(u.current_tenant.trim()) : `Tenant (${unitIdentifier})`;
						const custId = `cust-${u.id.slice(0, 8)}`;
						unitContracts.push({
							id: contractNo,
							customerId: custId,
							reservationId: `res-${u.id.slice(0, 8)}`,
							property: propTitle,
							unit: unitIdentifier,
							tenantName,
							startDate: u.contract_start_date || "2026-01-01",
							endDate: u.contract_end_date || (() => {
								const d = /* @__PURE__ */ new Date();
								d.setFullYear(d.getFullYear() + 1);
								return d.toISOString().split("T")[0];
							})(),
							monthlyRent,
							securityDeposit: secDeposit,
							pdcCount: 12,
							paymentFrequency: (u.rent_frequency || "monthly").toLowerCase(),
							gracePeriodDays: 7,
							penalties: "5%",
							maintenanceResponsibility: u.maintenance_responsibility || "Landlord",
							utilityResponsibility: "Tenant",
							parkingDetails: u.parking_slot_no ? `Slot ${u.parking_slot_no}` : "Dedicated parking",
							specialConditions: "Standard Tenancy Agreement",
							noticePeriodDays: 60,
							status: "active",
							collectionCompleted: true
						});
					}
				}
			});
			const mappedLeases = [...existingLeases, ...unitContracts];
			const pdcsLookup = /* @__PURE__ */ new Map();
			(altPdcsRes.data || []).forEach((p) => {
				const u = (p.unit_name || p.unit_ref || "").trim();
				const c = String(p.cheque_number || p.id).trim();
				if (c) {
					if (u) pdcsLookup.set(`${u}||${c}`, p);
					if (!pdcsLookup.has(c)) pdcsLookup.set(c, p);
				}
			});
			const allRawPdcs = [];
			const seenPdcIds = /* @__PURE__ */ new Set();
			(pdcsRes.data || []).forEach((p) => {
				const id = `fin-${p.id}`;
				if (!seenPdcIds.has(id)) {
					seenPdcIds.add(id);
					const chq = String(p.cheque_number || "").trim();
					const u = (p.unit_name || p.unit_ref || "").trim();
					const matched = (u && chq ? pdcsLookup.get(`${u}||${chq}`) : null) || (chq ? pdcsLookup.get(chq) : null);
					allRawPdcs.push({
						...p,
						id: String(p.id),
						property_name: matched?.property_name || matched?.property_code || p.property_name || p.property_code || "",
						unit_name: matched?.unit_name || matched?.unit_ref || p.unit_name || p.unit_ref || "",
						tenant_name: matched?.tenant_name || matched?.drawer_name || p.tenant_name || p.drawer_name || "",
						bank: matched?.bank || p.bank || p.bank_name || "QNB"
					});
				}
			});
			(altPdcsRes.data || []).forEach((p) => {
				const chq = String(p.cheque_number || p.id).trim();
				if (!allRawPdcs.some((f) => String(f.cheque_number || f.id).trim() === chq)) allRawPdcs.push(p);
			});
			const mappedPdcs = allRawPdcs.map((p) => ({
				id: String(p.id),
				leaseId: p.lease_id || "",
				chequeNo: p.cheque_number || "",
				bank: p.bank || p.bank_name || "QNB",
				date: p.maturity_date || p.cheque_date || "",
				amount: Number(p.amount || 0),
				status: p.status?.toLowerCase().replace(/ /g, "_") || "received",
				payerName: p.tenant_name || p.drawer_name || "Tenant"
			}));
			const rawReservations = (reservationsRes.data || []).map((r) => ({
				id: r.id,
				property: "Property",
				unit: r.unit_id || "",
				tenantName: r.prospect_name || "Prospect",
				startDate: r.expected_start_date || "",
				validUntil: r.reservation_validity || "",
				rent: Number(r.proposed_rental_amount || 0),
				status: r.status?.toLowerCase() || "reserved",
				remarks: r.special_conditions
			}));
			const leaseReservations = mappedLeases.map((l, idx) => ({
				id: `res-lease-${l.id || idx}`,
				property: l.property || "Property",
				unit: l.unit || "Unit",
				tenantName: l.tenantName || "Tenant",
				agent: "Leasing Desk",
				startDate: l.startDate || today.toISOString().split("T")[0],
				validUntil: l.endDate || addDays(today, 30),
				rent: l.monthlyRent || 0,
				status: "converted",
				remarks: `Linked to Lease Contract ${l.id} (${l.status || "Active"})`
			}));
			const seenResKey = /* @__PURE__ */ new Set();
			const combinedReservations = [];
			[...rawReservations, ...leaseReservations].forEach((res) => {
				const key = `${(res.property || "").trim().toLowerCase()}--${(res.unit || "").trim().toLowerCase()}`;
				if (res.unit && !seenResKey.has(key)) {
					seenResKey.add(key);
					combinedReservations.push(res);
				}
			});
			let mappedReservations = combinedReservations;
			if (mappedReservations.length === 0) {
				const availUnits = mappedUnits.filter((u) => u.status === "Available" || u.status === "Reserved").slice(0, 6);
				const sampleProspects = [
					{
						name: "Khalid Ibrahim Al-Hajri",
						agent: "Sarah Jenkins (Leasing Officer)",
						days: 7,
						rent: 7500
					},
					{
						name: "Doha Engineering Services W.L.L.",
						agent: "Ahmed Al-Baker (Corporate Leasing)",
						days: 10,
						rent: 11e3
					},
					{
						name: "Mariam Al-Kaabi",
						agent: "Sarah Jenkins (Leasing Officer)",
						days: 5,
						rent: 6200
					},
					{
						name: "Apex International Media",
						agent: "Marketing Direct",
						days: 14,
						rent: 8500
					},
					{
						name: "Mohammed Reza",
						agent: "Leasing Desk",
						days: 3,
						rent: 5800
					}
				];
				mappedReservations = (availUnits.length > 0 ? availUnits : mappedUnits.slice(0, 5)).map((u, i) => {
					const prospect = sampleProspects[i % sampleProspects.length];
					const todayIso = today.toISOString().split("T")[0];
					const validDate = addDays(today, prospect.days);
					return {
						id: `res-seed-${i + 1}`,
						property: u.property,
						unit: u.unit,
						tenantName: prospect.name,
						agent: prospect.agent,
						startDate: todayIso,
						validUntil: validDate,
						rent: u.rent || prospect.rent,
						status: i === 0 ? "reserved" : i === 1 ? "reserved" : i === 2 ? "reserved" : i === 3 ? "converted" : "reserved",
						remarks: "Deposit hold confirmed. Tenancy agreement under draft."
					};
				});
			}
			const mappedVouchers = [...(vouchersRes.data || []).map((v) => ({
				id: v.id,
				leaseId: v.party_id || v.tenant_id || v.lease_id || "",
				name: v.narration || v.voucher_no || "General Voucher",
				receiptNo: v.voucher_no || v.reference_no,
				method: v.voucher_type === "Receipt" ? "Bank Transfer" : "Journal",
				period: v.voucher_date,
				debit: "Bank",
				credit: "Receivable",
				amount: Number(v.total_amount || 0),
				status: v.status || "posted"
			}))];
			const mappedHandovers = (handoversRes.data || []).map((h) => ({
				id: h.id,
				leaseId: h.lease_id,
				handoverAt: h.handover_date,
				keys: (h.keys_issued || []).length || 2,
				accessCards: (h.access_cards_issued || []).length || 1,
				parkingRemotes: (h.parking_remotes || []).length || 1,
				acknowledged: true
			}));
			const mappedCheckIns = (inspectionsRes.data || []).map((i) => ({
				id: i.id,
				leaseId: i.lease_id,
				date: i.inspection_date,
				condition: typeof i.unit_condition === "string" ? i.unit_condition : "Good",
				photos: (i.photos || []).length
			}));
			setAppData({
				units: mappedUnits,
				customers: mappedCustomers,
				leases: mappedLeases,
				pdcs: mappedPdcs,
				reservations: mappedReservations,
				vouchers: mappedVouchers,
				keyNotices: [],
				handovers: mappedHandovers,
				checkIns: mappedCheckIns,
				auditEvents: []
			});
		} catch (err) {
			console.error("Failed to load initial data from Supabase:", err);
			setAppData((prev) => ({
				...prev,
				reservations: prev.reservations.length > 0 ? prev.reservations : INITIAL_SEED_RESERVATIONS
			}));
		} finally {
			setSyncing(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		fetchDirectFromDatabase();
		const handleRefresh = () => {
			fetchDirectFromDatabase();
		};
		window.addEventListener("finance_vouchers_updated", handleRefresh);
		window.addEventListener("pms_data_updated", handleRefresh);
		return () => {
			window.removeEventListener("finance_vouchers_updated", handleRefresh);
			window.removeEventListener("pms_data_updated", handleRefresh);
		};
	}, [fetchDirectFromDatabase]);
	function makeUpdater(key) {
		return (fn) => {
			setAppData((prev) => ({
				...prev,
				[key]: fn(prev[key])
			}));
		};
	}
	const value = (0, import_react.useMemo)(() => ({
		...appData,
		setUnits: makeUpdater("units"),
		setCustomers: makeUpdater("customers"),
		setReservations: makeUpdater("reservations"),
		setLeases: makeUpdater("leases"),
		setPdcs: makeUpdater("pdcs"),
		setVouchers: makeUpdater("vouchers"),
		setKeyNotices: makeUpdater("keyNotices"),
		setHandovers: makeUpdater("handovers"),
		setCheckIns: makeUpdater("checkIns"),
		setAuditEvents: makeUpdater("auditEvents"),
		syncing,
		refetchData: fetchDirectFromDatabase
	}), [
		appData,
		syncing,
		fetchDirectFromDatabase
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppDataContext.Provider, {
		value,
		children
	});
}
function useAppData() {
	const context = (0, import_react.useContext)(AppDataContext);
	if (!context) throw new Error("useAppData must be used inside <AppDataProvider>");
	return context;
}
//#endregion
export { useAppData as n, AppDataProvider as t };
