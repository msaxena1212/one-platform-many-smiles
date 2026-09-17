import { i as __toESM } from "../_runtime.mjs";
import { v as fetchGuestBookings } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as ShieldCheck, At as FilePenLine, G as Phone, Jt as CircleX, Lt as Download, Ot as FileText, Qt as CircleCheck, St as Grid2x2, T as SlidersHorizontal, Vt as CreditCard, W as Plus, Wt as Clock, dn as Calendar, it as Mail, r as Wrench, rt as MapPin, s as Users, tt as MessageSquare, u as UserRound, yn as BedDouble } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guest-DND0CvlR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MOCK_GUEST_ID = "00000000-0000-4000-8000-000000000002";
var FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800";
var payments = [{
	receipt: "RCP-10421",
	date: "May 28, 2026",
	method: "Visa •••• 4242",
	amount: "$1,180",
	status: "Paid"
}, {
	receipt: "RCP-10422",
	date: "Jun 28, 2026",
	method: "Mastercard •••• 8812",
	amount: "$1,180",
	status: "Due"
}];
var facilities = [
	{
		name: "Swimming Pool",
		hours: "06:00 - 22:00",
		status: "Confirmed",
		slot: "Tomorrow, 08:00 AM"
	},
	{
		name: "Gym",
		hours: "24 Hours",
		status: "Pending",
		slot: "Waiting List"
	},
	{
		name: "BBQ Area",
		hours: "10:00 - 23:00",
		status: "Available",
		slot: "Not Booked"
	}
];
var guestDocuments = [
	{
		name: "Lease Agreement",
		size: "2.4 MB",
		date: "Jan 15, 2026",
		action: "Download"
	},
	{
		name: "Welcome Pack",
		size: "1.1 MB",
		date: "Jan 16, 2026",
		action: "Download"
	},
	{
		name: "Move-in Condition Form",
		size: "150 KB",
		date: "Pending",
		action: "Sign"
	}
];
var supportItems = [
	{
		ref: "SR-920",
		subject: "Air conditioning not cooling",
		category: "Maintenance",
		priority: "High",
		status: "Confirmed",
		assignee: "Tech Team"
	},
	{
		ref: "SR-915",
		subject: "Extra keycard request",
		category: "Services",
		priority: "Medium",
		status: "In Progress",
		assignee: "Front Desk"
	},
	{
		ref: "SR-884",
		subject: "Late checkout inquiry",
		category: "General",
		priority: "Low",
		status: "Closed",
		assignee: "Concierge"
	}
];
var STATUS_CONFIG = {
	CONFIRMED: {
		label: "Confirmed",
		className: "bg-emerald-100 text-emerald-800 border-emerald-200",
		icon: CircleCheck
	},
	PENDING: {
		label: "Pending",
		className: "bg-amber-100 text-amber-800 border-amber-200",
		icon: Clock
	},
	CANCELLED: {
		label: "Cancelled",
		className: "bg-red-100 text-red-800 border-red-200",
		icon: CircleX
	},
	COMPLETED: {
		label: "Completed",
		className: "bg-sky-100 text-sky-800 border-sky-200",
		icon: CircleCheck
	}
};
function GuestDashboard() {
	const [bookings, setBookings] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [profile, setProfile] = (0, import_react.useState)({
		fullName: "Alice Morgan",
		email: "alice.morgan@example.com",
		phone: "+1 415 555 0198",
		emergencyContact: "Daniel Morgan, +1 415 555 0112",
		arrivalTime: "15:30",
		travelPurpose: "Family vacation",
		specialRequests: "Quiet room if available, baby cot, and airport transfer quote."
	});
	const [preferences, setPreferences] = (0, import_react.useState)({
		language: "English",
		bedSetup: "King bed",
		temperature: "22 C",
		accessibility: "No special accessibility needs",
		marketing: false,
		whatsapp: true
	});
	const [companions, setCompanions] = (0, import_react.useState)(["Daniel Morgan", "Mia Morgan"]);
	(0, import_react.useEffect)(() => {
		fetchGuestBookings(MOCK_GUEST_ID).then(setBookings).catch((error) => {
			console.error(error);
			setBookings([]);
		}).finally(() => setLoading(false));
	}, []);
	const activeBooking = (0, import_react.useMemo)(() => bookings.find((booking) => booking.status === "CONFIRMED") ?? bookings[0], [bookings]);
	const upcoming = bookings.filter((booking) => booking.status === "CONFIRMED" || booking.status === "PENDING");
	const past = bookings.filter((booking) => booking.status === "COMPLETED" || booking.status === "CANCELLED");
	const openRequests = supportItems.filter((item) => item.status !== "Confirmed").length;
	const saveProfile = () => toast.success("Guest details updated");
	const savePreferences = () => toast.success("Stay preferences updated");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
		defaultValue: "overview",
		className: "min-h-screen bg-[#f8f6ef] text-[#061514]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-screen",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuestSidebar, { openRequests }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-20 flex h-[58px] items-center justify-between border-b border-[#d9ded8] bg-[#fbfaf5] px-5 lg:px-7",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-base font-semibold",
						children: "Guest portal"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "hidden text-xs text-[#435552] hover:text-[#004d48] sm:inline",
							children: "← Back to public site"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 rounded-full border border-[#d7dfdc] bg-white px-3 py-1.5 shadow-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#004d48] text-xs font-bold text-white",
								children: "AM"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs leading-tight",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-semibold",
									children: profile.fullName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-[#5f6d6a]",
									children: "Guest - Active stay"
								})]
							})]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "px-5 py-6 lg:px-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "overview",
							className: "m-0 space-y-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-b-2xl bg-gradient-to-br from-[#004d48] to-[#2e6f69] p-7 text-white shadow-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75",
											children: ["Guest - ", activeBooking?.properties?.title ?? "Upcoming stay"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
											className: "mt-2 text-3xl font-semibold",
											children: ["Hello, ", profile.fullName.split(" ")[0]]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 max-w-2xl text-sm text-white/90",
											children: "Review your reservation, update arrival details, manage documents, and contact guest services before check-in."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-5 flex flex-wrap gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												className: "bg-white text-[#004d48] hover:bg-white/90",
												onClick: saveProfile,
												children: "Save details"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "outline",
												className: "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
												onClick: () => toast.success("Message drafted"),
												children: "Message host"
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
											label: "Upcoming stays",
											value: String(upcoming.length),
											hint: loading ? "Loading stays" : "Synced from bookings",
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, {})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
											label: "Guests",
											value: String(companions.length + 1),
											hint: "Primary plus companions",
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
											label: "Documents",
											value: "4",
											hint: "1 requires signature",
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
											label: "Open requests",
											value: String(openRequests),
											hint: "Guest services tracking",
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, {})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-5 xl:grid-cols-[1.4fr_0.7fr]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalCard, {
										title: "Stay details",
										description: "Reservation status, dates, and property details.",
										children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingRows, {}) : activeBooking ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveStay, { booking: activeBooking }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
											title: "No active stay",
											action: "Find a stay",
											to: "/"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PortalCard, {
										title: "Next payment",
										description: "Balance due before arrival.",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-3xl font-semibold",
												children: "$1,180"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-[#53615e]",
												children: "Due Jun 28, 2026 - Stay balance"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-5 space-y-3 text-sm",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
														k: "Method",
														v: "Card ending 4242"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
														k: "Reference",
														v: "GST-10422"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
														k: "Security hold",
														v: "$300 at check-in"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												className: "mt-5 w-full bg-[#004d48] hover:bg-[#003f3b]",
												children: "Pay now"
											})
										]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "stays",
							className: "m-0 space-y-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
								title: "My stays",
								description: "All active, upcoming, and past guest bookings."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalCard, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "divide-y divide-[#d9ded8]",
								children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingRows, {}) : upcoming.length > 0 ? upcoming.map((booking) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingRow, { booking }, booking.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
									title: "No upcoming trips",
									action: "Browse properties",
									to: "/"
								}), !loading && past.map((booking) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingRow, { booking }, booking.id))]
							}) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "details",
							className: "m-0 space-y-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
									title: "Guest details",
									description: "Update contact, arrival, companions, and stay preferences."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-5 xl:grid-cols-[1fr_0.85fr]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalCard, {
										title: "Personal and arrival details",
										description: "Host-visible details for this stay.",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-4 sm:grid-cols-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Full name",
													value: profile.fullName,
													onChange: (value) => setProfile({
														...profile,
														fullName: value
													}),
													icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, {})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Email",
													value: profile.email,
													onChange: (value) => setProfile({
														...profile,
														email: value
													}),
													icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Phone",
													value: profile.phone,
													onChange: (value) => setProfile({
														...profile,
														phone: value
													}),
													icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, {})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Arrival time",
													value: profile.arrivalTime,
													onChange: (value) => setProfile({
														...profile,
														arrivalTime: value
													}),
													type: "time",
													icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "sm:col-span-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														htmlFor: "emergency",
														children: "Emergency contact"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														id: "emergency",
														value: profile.emergencyContact,
														onChange: (event) => setProfile({
															...profile,
															emergencyContact: event.target.value
														})
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "sm:col-span-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														htmlFor: "requests",
														children: "Special requests"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
														id: "requests",
														value: profile.specialRequests,
														onChange: (event) => setProfile({
															...profile,
															specialRequests: event.target.value
														}),
														rows: 4
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													onClick: saveProfile,
													className: "bg-[#004d48] hover:bg-[#003f3b]",
													children: "Save changes"
												})
											]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalCard, {
										title: "Companions",
										description: "Keep guest names current before check-in.",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-3",
											children: [companions.map((name, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													"aria-label": `Companion ${index + 1}`,
													value: name,
													onChange: (event) => setCompanions((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "outline",
													onClick: () => setCompanions((current) => current.filter((_, itemIndex) => itemIndex !== index)),
													children: "Remove"
												})]
											}, `${name}-${index}`)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "outline",
												onClick: () => setCompanions((current) => [...current, "New guest"]),
												className: "w-full gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "Add companion"]
											})]
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalCard, {
									title: "Stay preferences",
									description: "These details help the host prepare the property before arrival.",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Language",
												value: preferences.language,
												onChange: (value) => setPreferences({
													...preferences,
													language: value
												}),
												icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, {})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Bed setup",
												value: preferences.bedSetup,
												onChange: (value) => setPreferences({
													...preferences,
													bedSetup: value
												}),
												icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BedDouble, {})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Temperature",
												value: preferences.temperature,
												onChange: (value) => setPreferences({
													...preferences,
													temperature: value
												}),
												icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, {})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Accessibility",
												value: preferences.accessibility,
												onChange: (value) => setPreferences({
													...preferences,
													accessibility: value
												}),
												icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreferenceToggle, {
												label: "WhatsApp updates",
												checked: preferences.whatsapp,
												onChange: (checked) => setPreferences({
													...preferences,
													whatsapp: checked
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreferenceToggle, {
												label: "Marketing emails",
												checked: preferences.marketing,
												onChange: (checked) => setPreferences({
													...preferences,
													marketing: checked
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "sm:col-span-2 xl:col-span-4",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													onClick: savePreferences,
													className: "bg-[#004d48] hover:bg-[#003f3b]",
													children: "Save preferences"
												})
											})
										]
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "payments",
							className: "m-0 space-y-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, { title: "Payments" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-lg border border-[#e5c478] bg-white p-6 shadow-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center justify-between gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[11px] uppercase tracking-[0.18em] text-[#40524f]",
												children: "Next balance"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-3xl font-semibold",
												children: "$1,180"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-[#53615e]",
												children: "Due Jun 28, 2026 - Reference GST-10422"
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													className: "bg-[#004d48] hover:bg-[#003f3b]",
													children: "Pay with card"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "outline",
													children: "Pay with bank"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "ghost",
													children: "Set up auto-pay"
												})
											]
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalCard, {
									title: "Payment history",
									description: "All receipts on your guest account",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
										columns: [
											"Receipt",
											"Date",
											"Method",
											"Amount",
											"Status"
										],
										rows: payments.map((payment) => [
											payment.receipt,
											payment.date,
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoftBadge, { label: payment.method }, "method"),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold",
												children: payment.amount
											}, "amount"),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoftBadge, {
												label: payment.status,
												tone: payment.status === "Due" ? "warning" : "success"
											}, "status")
										])
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "facilities",
							className: "m-0 space-y-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, { title: "Facility booking" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-5 lg:grid-cols-2 xl:grid-cols-3",
								children: facilities.map((facility) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "border-[#d8dfdc] bg-white shadow-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "p-6",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start justify-between gap-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
													className: "font-semibold",
													children: facility.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-xs text-[#40524f]",
													children: ["Open hours: ", facility.hours]
												})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoftBadge, {
													label: facility.status,
													tone: facility.status === "Pending" ? "warning" : "success"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-5 text-sm",
												children: ["Your next slot: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold",
													children: facility.slot
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-5 flex gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													className: "bg-[#004d48] hover:bg-[#003f3b]",
													children: "Book a slot"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "ghost",
													children: "View calendar"
												})]
											})
										]
									})
								}, facility.name))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "documents",
							className: "m-0 space-y-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, { title: "Documents" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalCard, {
								title: "My documents",
								description: "Booking confirmations, arrival forms, and guest policies.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "divide-y divide-[#d9ded8]",
									children: guestDocuments.map((document) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-4 py-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex min-w-0 items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#e8f1ef] text-[#004d48]",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "truncate font-semibold",
													children: document.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-xs text-[#53615e]",
													children: [
														document.size,
														" - ",
														document.date
													]
												})]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: document.action === "Sign" ? "default" : "outline",
											className: document.action === "Sign" ? "bg-[#004d48] hover:bg-[#003f3b]" : "",
											children: [document.action === "Sign" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), document.action]
										})]
									}, document.name))
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "support",
							className: "m-0 space-y-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
									title: "Guest support",
									description: "All guest service requests attached to your stay."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex justify-end",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										className: "gap-2 bg-[#004d48] hover:bg-[#003f3b]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " New request"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalCard, {
									title: "Contact guest services",
									description: "Send a note about arrival, amenities, or documents.",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-4 md:grid-cols-[0.7fr_1fr_auto]",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												defaultValue: "Arrival and check-in",
												"aria-label": "Support topic"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												defaultValue: "Please confirm if early bag drop is possible before 15:00.",
												"aria-label": "Support message"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												onClick: () => toast.success("Message sent to guest services"),
												className: "bg-[#004d48] hover:bg-[#003f3b]",
												children: "Send"
											})
										]
									})
								})
							]
						})
					]
				})]
			})]
		})
	});
}
function GuestSidebar({ openRequests }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "hidden w-[230px] shrink-0 border-r border-white/10 bg-[#052724] text-white md:block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-[58px] items-center gap-3 border-b border-white/10 px-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#e4ad31] font-bold text-[#052724]",
				children: "K"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "leading-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm font-semibold",
					children: "Kinan"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-[10px] uppercase tracking-[0.22em] text-white/65",
					children: "Customer Portal"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
			className: "flex h-auto flex-col items-stretch justify-start bg-transparent p-3",
			children: [
				{
					value: "overview",
					label: "Overview",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid2x2, { className: "h-4 w-4" })
				},
				{
					value: "stays",
					label: "Stays",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BedDouble, { className: "h-4 w-4" })
				},
				{
					value: "details",
					label: "Details",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "h-4 w-4" })
				},
				{
					value: "payments",
					label: "Payments",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-4 w-4" })
				},
				{
					value: "facilities",
					label: "Facility booking",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4" })
				},
				{
					value: "documents",
					label: "Documents",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
				},
				{
					value: "support",
					label: "Support",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-4 w-4" }),
					badge: openRequests
				}
			].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
				value: item.value,
				className: "mb-1 flex h-9 w-full justify-start gap-3 rounded-md px-3 text-left text-sm font-medium text-white/90 data-[state=active]:bg-[#123f3c] data-[state=active]:text-white",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[#e4ad31]",
						children: item.icon
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex-1",
						children: item.label
					}),
					item.badge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-[#e4ad31] px-2 py-0.5 text-[10px] font-bold text-[#052724]",
						children: item.badge
					}) : null
				]
			}, item.value))
		})]
	});
}
function ActiveStay({ booking }) {
	const property = booking.properties;
	const image = property?.property_images?.[0]?.image_url || FALLBACK_IMAGE;
	const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.PENDING;
	const StatusIcon = status.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 md:grid-cols-[13rem_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-40 overflow-hidden rounded-md bg-[#e8ece9] md:h-full",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: image,
				alt: property?.title ?? "Guest stay",
				className: "h-full w-full object-cover"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-semibold",
					children: property?.title ?? "Upcoming stay"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 flex items-center gap-1.5 text-sm text-[#53615e]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" }),
						property?.city,
						", ",
						property?.country
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: status.className,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIcon, { className: "mr-1 h-3.5 w-3.5" }), status.label]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-4 text-sm sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StayFact, {
						label: "Check-in",
						value: formatDate(booking.check_in)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StayFact, {
						label: "Check-out",
						value: formatDate(booking.check_out)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StayFact, {
						label: "Guests",
						value: String(booking.guests_count)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StayFact, {
						label: "Total",
						value: `$${booking.total_price}`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-5 bg-[#004d48] hover:bg-[#003f3b]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/guest",
					children: "View property"
				})
			})
		] })]
	});
}
function BookingRow({ booking }) {
	const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.PENDING;
	const property = booking.properties;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3 py-4 text-sm lg:grid-cols-[1.2fr_0.8fr_0.6fr_0.6fr_auto] lg:items-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-semibold",
				children: property?.title ?? "Property booking"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-[#53615e]",
				children: [
					property?.city,
					", ",
					property?.country
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				formatShortDate(booking.check_in),
				" - ",
				formatShortDate(booking.check_out)
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [booking.guests_count, " guests"] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-semibold",
				children: ["$", booking.total_price]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "outline",
				className: status.className,
				children: status.label
			})
		]
	});
}
function PortalCard({ title, description, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "overflow-hidden border-[#d8dfdc] bg-white shadow-sm",
		children: [(title || description) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "border-b border-[#d9ded8] px-6 py-5",
			children: [title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: title
			}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
				className: "text-xs text-[#40524f]",
				children: description
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "p-6",
			children
		})]
	});
}
function MetricCard({ icon, label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "border-[#d8dfdc] bg-white shadow-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "p-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-[0.16em] text-[#40524f]",
						children: label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-2xl font-semibold",
						children: value
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-[#53615e]",
						children: hint
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#e8f1ef] text-[#004d48] [&>svg]:h-4 [&>svg]:w-4",
					children: icon
				})]
			})
		})
	});
}
function PageTitle({ title, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "text-base font-semibold",
		children: title
	}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1 text-sm text-[#40524f]",
		children: description
	})] });
}
function DataTable({ columns, rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "-m-6 overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[720px] text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-[#f4f2ec] text-left text-[11px] uppercase tracking-[0.12em] text-[#40524f]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "px-6 py-3 font-medium",
					children: column
				}, column)) })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row, rowIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: "border-t border-[#d9ded8]",
				children: row.map((cell, cellIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-6 py-3",
					children: cell
				}, cellIndex))
			}, rowIndex)) })]
		})
	});
}
function SoftBadge({ label, tone = "neutral" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${{
			success: "bg-emerald-100 text-emerald-800",
			warning: "bg-amber-100 text-amber-800",
			info: "bg-cyan-100 text-cyan-800",
			neutral: "bg-[#e8f1ef] text-[#004d48]"
		}[tone]}`,
		children: label
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[#53615e]",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-semibold",
			children: v
		})]
	});
}
function StayFact({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[11px] uppercase tracking-[0.14em] text-[#53615e]",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "font-semibold",
		children: value
	})] });
}
function Field({ label, value, onChange, type = "text", icon }) {
	const id = label.toLowerCase().replace(/\s+/g, "-");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
		htmlFor: id,
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#53615e] [&>svg]:h-4 [&>svg]:w-4",
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			id,
			type,
			value,
			onChange: (event) => onChange(event.target.value),
			className: "pl-9"
		})]
	})] });
}
function PreferenceToggle({ label, checked, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex min-h-10 items-center justify-between rounded-md border border-[#d8dfdc] px-3 py-2 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "checkbox",
			checked,
			onChange: (event) => onChange(event.target.checked),
			className: "h-4 w-4 accent-[#004d48]"
		})]
	});
}
function EmptyPanel({ title, action, to }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-dashed border-[#d8dfdc] p-8 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "mx-auto h-8 w-8 text-[#53615e]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-medium",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-4 bg-[#004d48] hover:bg-[#003f3b]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to,
					children: action
				})
			})
		]
	});
}
function LoadingRows() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: [0, 1].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-lg bg-[#edf0ec]" }, item))
	});
}
function formatDate(value) {
	return new Date(value).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric"
	});
}
function formatShortDate(value) {
	return new Date(value).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short"
	});
}
//#endregion
export { GuestDashboard as component };
