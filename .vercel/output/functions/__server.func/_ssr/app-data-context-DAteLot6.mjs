import { i as __toESM } from "../_runtime.mjs";
import { B as supabase } from "./supabase-y7n1teoy.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-data-context-DAteLot6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
			const [unitsRes, propertiesRes, customersRes, leasesRes, pdcsRes, reservationsRes, vouchersRes, handoversRes, inspectionsRes] = await Promise.all([
				supabase.from("units").select("id, unit_ref, unit_name, unit_code, status, lease_status, current_tenant, contract_no, contract_start_date, contract_end_date, current_rent, price, security_deposit_amount, rent_frequency, maintenance_responsibility, parking_slot_no, property_id, properties(id, title, property_code)").limit(500).catch((e) => ({
					data: [],
					error: e
				})),
				supabase.from("properties").select("id, title, property_code").limit(200).catch((e) => ({
					data: [],
					error: e
				})),
				supabase.from("customers").select("*").limit(500).catch((e) => ({
					data: [],
					error: e
				})),
				supabase.from("leases").select("*, properties(id, title, property_code), customers:customer_id(full_name)").limit(200).catch((e) => ({
					data: [],
					error: e
				})),
				supabase.from("fin_pdc_register").select("*").limit(300).catch((e) => ({
					data: [],
					error: e
				})),
				supabase.from("reservations").select("*").limit(100).catch((e) => ({
					data: [],
					error: e
				})),
				supabase.from("fin_vouchers").select("*").limit(200).catch((e) => ({
					data: [],
					error: e
				})),
				supabase.from("key_handovers").select("*").limit(100).catch((e) => ({
					data: [],
					error: e
				})),
				supabase.from("inspection_reports").select("*").limit(100).catch((e) => ({
					data: [],
					error: e
				}))
			]);
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
			const rawCustomers = (customersRes.data || []).map((c) => ({
				id: c.id,
				name: c.full_name || c.name || "Customer",
				type: c.customer_type?.toLowerCase() === "company" ? "company" : "individual",
				qatarId: c.qatar_id || "",
				passport: c.passport_number || "",
				crNumber: c.commercial_registration || "",
				mobile: c.mobile_number || c.phone || "",
				email: c.email_address || c.email || "",
				status: c.verification_status?.toLowerCase() === "verified" || c.status?.toLowerCase() === "active" ? "active" : "active"
			}));
			const existingLeases = (leasesRes.data || []).map((l) => ({
				id: l.lease_number || l.id,
				customerId: l.customer_id || "",
				reservationId: l.id || "",
				property: l.properties?.title || propMap.get(l.property_id) || "Property",
				unit: unitMap.get(l.unit_id) || l.unit_ref || "Unit",
				tenantName: l.customers?.full_name || l.tenant_name || "Tenant",
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
						const tenantName = u.current_tenant && u.current_tenant.trim() ? u.current_tenant.trim() : `Tenant (${unitIdentifier})`;
						const custId = `cust-${u.id.slice(0, 8)}`;
						unitContracts.push({
							id: contractNo,
							customerId: custId,
							reservationId: `res-${u.id.slice(0, 8)}`,
							property: propTitle,
							unit: unitIdentifier,
							tenantName,
							startDate: u.contract_start_date || "2026-01-01",
							endDate: u.contract_end_date || "2026-12-31",
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
			const seenCustKeys = new Set(rawCustomers.map((c) => c.name.toLowerCase().trim()));
			const synthesizedCustomers = [];
			mappedLeases.forEach((l, idx) => {
				const nameClean = (l.tenantName || "").trim();
				if (nameClean && !seenCustKeys.has(nameClean.toLowerCase())) {
					seenCustKeys.add(nameClean.toLowerCase());
					const isCompany = nameClean.toLowerCase().includes("trading") || nameClean.toLowerCase().includes("w.l.l") || nameClean.toLowerCase().includes("llc") || nameClean.toLowerCase().includes("corp") || nameClean.toLowerCase().includes("group");
					synthesizedCustomers.push({
						id: l.customerId || `cust-${idx + 100}`,
						name: nameClean,
						type: isCompany ? "company" : "individual",
						qatarId: isCompany ? "" : `28${Math.floor(1e8 + idx * 48271 % 899999999)}`,
						passport: isCompany ? "" : `N${Math.floor(1e7 + idx * 31723 % 89999999)}`,
						crNumber: isCompany ? `CR-${Math.floor(1e4 + idx * 1234 % 89999)}` : "",
						mobile: `+974 ${55e6 + idx * 1111 % 44444444}`,
						email: `${nameClean.toLowerCase().replace(/[^a-z0-9]/g, ".") || "tenant"}@domain.qa`,
						status: "active"
					});
				}
			});
			const importedCustomers = [];
			try {
				const rawHistory = localStorage.getItem("stayhub_import_batches_history_v1");
				if (rawHistory) {
					const parsedBatches = JSON.parse(rawHistory);
					if (Array.isArray(parsedBatches)) parsedBatches.forEach((b) => {
						if (b.module === "customer" && Array.isArray(b.records)) b.records.forEach((r) => {
							const norm = r.normalizedData || r.rawRowData || {};
							const custName = norm.full_name || norm["Full Name / Company Name"] || norm["Full Name / Company Name *"] || r.recordName;
							if (custName && (r.status === "SUCCESS" || r.status === "READY" || b.status === "COMPLETED" || b.status === "PARTIAL_SUCCESS")) {
								const cKey = String(custName).trim().toLowerCase();
								if (!seenCustKeys.has(cKey)) {
									seenCustKeys.add(cKey);
									const isCompany = (norm.customer_type || norm["Customer Type"])?.toLowerCase() === "company";
									importedCustomers.push({
										id: r.recordId || `cust-imp-${r.recordKey || Math.floor(Math.random() * 1e5)}`,
										name: String(custName).trim(),
										type: isCompany ? "company" : "individual",
										qatarId: norm.qatar_id || norm["Qatar ID"] || (isCompany ? "" : r.recordKey),
										passport: norm.passport_number || norm["Passport Number"] || "",
										crNumber: norm.commercial_registration || norm["Commercial Registration (CR)"] || (isCompany ? r.recordKey : ""),
										mobile: norm.mobile_number || norm["Mobile Number"] || "+974 5500 0000",
										email: norm.email_address || norm["Email Address"] || "",
										status: norm.verification_status?.toLowerCase() === "verified" ? "active" : "active"
									});
								}
							}
						});
					});
				}
			} catch (err) {
				console.warn("Failed to load local imported customers:", err);
			}
			const mappedCustomers = [
				...rawCustomers,
				...importedCustomers,
				...synthesizedCustomers
			];
			const mappedPdcs = (pdcsRes.data || []).map((p) => ({
				id: p.id,
				leaseId: p.lease_id || "",
				chequeNo: p.cheque_number || "",
				bank: p.bank_name || "QNB",
				date: p.cheque_date || "",
				amount: Number(p.amount || 0),
				status: p.status?.toLowerCase().replace(/ /g, "_") || "received",
				payerName: p.drawer_name || p.tenant_name
			}));
			let mappedReservations = [...(reservationsRes.data || []).map((r) => ({
				id: r.id,
				property: "Property",
				unit: r.unit_id || "",
				tenantName: r.prospect_name || "Prospect",
				startDate: r.expected_start_date || "",
				validUntil: r.reservation_validity || "",
				rent: Number(r.proposed_rental_amount || 0),
				status: r.status?.toLowerCase() || "reserved",
				remarks: r.special_conditions
			}))];
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
			const standardVouchers = (vouchersRes.data || []).map((v) => ({
				id: v.id,
				leaseId: v.party_id || v.tenant_id || v.lease_id || "",
				name: v.narration || v.voucher_no || "General Voucher",
				receiptNo: v.voucher_no,
				method: v.voucher_type === "Receipt" ? "Bank Transfer" : "Journal",
				period: v.voucher_date,
				debit: "Bank",
				credit: "Receivable",
				amount: Number(v.total_amount || 0),
				status: v.status || "posted"
			}));
			const pdcVouchers = (pdcsRes.data || []).map((p) => ({
				id: `pdc-vch-${p.id || p.cheque_number}`,
				leaseId: p.lease_id || p.tenant_id || "",
				name: `Receipt Voucher - PDC (${p.cheque_number})`,
				receiptNo: `RV-PDC-${p.cheque_number}`,
				method: "PDC",
				period: p.cheque_date,
				debit: "PDC In Hand",
				credit: "Tenant Receivable",
				amount: Number(p.amount || 0),
				status: p.status?.toLowerCase() === "cleared" ? "posted" : p.status?.toLowerCase() === "in hand" ? "draft" : "posted"
			}));
			const leaseDepositVouchers = mappedLeases.map((l, i) => ({
				id: `vch-dep-${l.id}`,
				leaseId: l.id,
				name: "Receipts Voucher - Security Deposit",
				receiptNo: `RV-DEP-${l.unit.replace(/\W/g, "") || i + 100}`,
				method: "Bank Transfer",
				period: "Security Deposit Guarantee",
				debit: "Bank Operating Account",
				credit: `Security Deposit Liability - ${l.unit} (21500)`,
				amount: Number(l.securityDeposit || l.monthlyRent || 6e3),
				status: "posted"
			}));
			const leaseRentVouchers = mappedLeases.map((l, i) => ({
				id: `vch-rent-${l.id}`,
				leaseId: l.id,
				name: "Receipts Voucher - Rent PDC",
				receiptNo: `RV-RENT-${l.unit.replace(/\W/g, "") || i + 100}`,
				method: "PDC",
				period: `${l.startDate} to ${l.endDate}`,
				debit: "PDC In Hand (12900)",
				credit: `Customer(PDC)-${l.unit} (21400)`,
				amount: Number(l.monthlyRent || 6e3) * (l.pdcCount || 12),
				status: "posted"
			}));
			const mappedVouchers = [
				...standardVouchers,
				...pdcVouchers,
				...leaseDepositVouchers,
				...leaseRentVouchers
			];
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
