import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { fn as Calendar, it as MapPin } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portal.community.events-Co2mDar6.js
var import_jsx_runtime = require_jsx_runtime();
function CommunityEvents() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold tracking-tight",
					children: "Community Events"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Join and stay updated on community activities"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "+ Create Event" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-medium",
							children: "Upcoming Events"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xl font-bold",
						children: "2"
					}) })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-medium",
							children: "Total Attendees (This Month)"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xl font-bold",
						children: "246"
					}) })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-medium",
							children: "You're Attending"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xl font-bold",
						children: "1"
					}) })] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: [
					{
						id: 1,
						title: "Summer Fitness Challenge",
						date: "2026-07-01",
						time: "06:00 - 08:00",
						location: "Gym Complex",
						attendees: 45,
						status: "upcoming"
					},
					{
						id: 2,
						title: "Community BBQ Night",
						date: "2026-06-29",
						time: "18:00 - 21:00",
						location: "Central Courtyard",
						attendees: 128,
						status: "upcoming"
					},
					{
						id: 3,
						title: "Kids Pool Party",
						date: "2026-06-25",
						time: "15:00 - 17:00",
						location: "Swimming Pool",
						attendees: 73,
						status: "completed"
					}
				].map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "overflow-hidden hover:shadow-md transition",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-4 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-8 w-8" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold",
											children: event.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-4 text-sm text-muted-foreground mt-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4" }),
													new Date(event.date).toLocaleDateString(),
													" ",
													event.time
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4" }), event.location]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground mt-1",
											children: [event.attendees, " attending"]
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: event.status === "upcoming" ? "default" : "outline",
											children: event.status
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "outline",
											children: event.status === "upcoming" ? "Join" : "View"
										})]
									})]
								})
							})]
						})
					})
				}, event.id))
			})
		]
	});
}
//#endregion
export { CommunityEvents as component };
