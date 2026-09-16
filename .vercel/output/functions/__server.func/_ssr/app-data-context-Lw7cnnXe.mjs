import { i as __toESM } from "../_runtime.mjs";
import { B as supabase } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-data-context-Lw7cnnXe.js
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
			const [unitsRes, customersRes, leasesRes, pdcsRes, reservationsRes, vouchersRes, handoversRes, inspectionsRes] = await Promise.all([
				supabase.from("units").select("id, unit_number, status, rent_amount, property_id, properties(title)").limit(200),
				supabase.from("customer_masters").select("id, full_name, customer_type, qatar_id, passport_no, commercial_registration_no, mobile, email, verification_status").limit(200),
				supabase.from("leases").select("*, properties(title), units(unit_number), customers:customer_id(full_name)").limit(200),
				supabase.from("fin_pdc_register").select("*").limit(300),
				supabase.from("reservations").select("*").limit(100),
				supabase.from("fin_vouchers").select("*").limit(200),
				supabase.from("key_handovers").select("*").limit(100),
				supabase.from("inspection_reports").select("*").limit(100)
			]);
			setAppData({
				units: (unitsRes.data || []).map((u) => ({
					id: u.id,
					property: u.properties?.title || "Property",
					unit: u.unit_number || "Unit",
					status: u.status || "Available",
					rent: Number(u.rent_amount || 0)
				})),
				customers: (customersRes.data || []).map((c) => ({
					id: c.id,
					name: c.full_name || "Customer",
					type: c.customer_type === "Company" ? "company" : "individual",
					qatarId: c.qatar_id || "",
					passport: c.passport_no || "",
					crNumber: c.commercial_registration_no || "",
					mobile: c.mobile || "",
					email: c.email || "",
					status: "active"
				})),
				leases: (leasesRes.data || []).map((l) => ({
					id: l.lease_number || l.id,
					customerId: l.customer_id || "",
					reservationId: l.id || "",
					property: l.properties?.title || "Property",
					unit: l.units?.unit_number || l.unit_ref || "Unit",
					tenantName: l.customers?.full_name || l.tenant_name || "Tenant",
					startDate: l.commencement_date || "",
					endDate: l.expiry_date || "",
					monthlyRent: Number(l.rental_amount || 0),
					securityDeposit: Number(l.security_deposit || 0),
					pdcCount: Number(l.number_of_pdc || 0),
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
				})),
				pdcs: (pdcsRes.data || []).map((p) => ({
					id: p.id,
					leaseId: p.lease_id || "",
					chequeNo: p.cheque_number || "",
					bank: p.bank_name || "QNB",
					date: p.cheque_date || "",
					amount: Number(p.amount || 0),
					status: p.status?.toLowerCase().replace(/ /g, "_") || "received",
					payerName: p.drawer_name || p.tenant_name
				})),
				reservations: (reservationsRes.data || []).map((r) => ({
					id: r.id,
					property: "Property",
					unit: r.unit_id || "",
					tenantName: r.prospect_name || "Prospect",
					startDate: r.expected_start_date || "",
					validUntil: r.reservation_validity || "",
					rent: Number(r.proposed_rental_amount || 0),
					status: r.status?.toLowerCase() || "reserved",
					remarks: r.special_conditions
				})),
				vouchers: (vouchersRes.data || []).map((v) => ({
					id: v.id,
					leaseId: v.party_id || "",
					name: v.narration || v.voucher_no,
					receiptNo: v.voucher_no,
					debit: "Bank",
					credit: "Receivable",
					amount: Number(v.total_amount || 0),
					status: v.status || "posted"
				})),
				keyNotices: [],
				handovers: (handoversRes.data || []).map((h) => ({
					id: h.id,
					leaseId: h.lease_id,
					handoverAt: h.handover_date,
					keys: (h.keys_issued || []).length || 2,
					accessCards: (h.access_cards_issued || []).length || 1,
					parkingRemotes: (h.parking_remotes || []).length || 1,
					acknowledged: true
				})),
				checkIns: (inspectionsRes.data || []).map((i) => ({
					id: i.id,
					leaseId: i.lease_id,
					date: i.inspection_date,
					condition: typeof i.unit_condition === "string" ? i.unit_condition : "Good",
					photos: (i.photos || []).length
				})),
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
