import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { G as Plus } from "../_libs/lucide-react.mjs";
import { n as CardContent, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { p as tickets } from "./mock-data-B9OWnoA7.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-EOzTavlY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portal.tickets-DJDTmv3d.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var priorityClass = {
	Low: "bg-secondary text-secondary-foreground",
	Medium: "bg-[oklch(0.92_0.04_220)] text-[oklch(0.35_0.08_220)]",
	High: "bg-gold/20 text-gold-foreground",
	Urgent: "bg-destructive/15 text-destructive"
};
var statusClass = {
	new: "bg-secondary text-secondary-foreground",
	assigned: "bg-[oklch(0.92_0.04_220)] text-[oklch(0.35_0.08_220)]",
	in_progress: "bg-gold/20 text-gold-foreground",
	resolved: "bg-[oklch(0.55_0.13_155)]/15 text-[oklch(0.4_0.13_155)]",
	closed: "bg-muted text-muted-foreground"
};
function TicketsPage() {
	const [list, setList] = (0, import_react.useState)(tickets);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [subject, setSubject] = (0, import_react.useState)("");
	const [desc, setDesc] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("Other");
	const [priority, setPriority] = (0, import_react.useState)("Medium");
	const [property, setProperty] = (0, import_react.useState)("");
	const [unit, setUnit] = (0, import_react.useState)("");
	const [complaintArea, setComplaintArea] = (0, import_react.useState)("Unit / Apartment");
	const submit = (e) => {
		e.preventDefault();
		setList([{
			id: `t${Date.now()}`,
			subject: subject || desc.slice(0, 60),
			description: desc,
			unit: unit || "Not specified",
			property: property || "Not specified",
			complaintArea,
			category,
			priority,
			status: "new",
			createdAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		}, ...list]);
		setSubject("");
		setDesc("");
		setCategory("Other");
		setPriority("Medium");
		setProperty("");
		setUnit("");
		setComplaintArea("Unit / Apartment");
		setOpen(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "All service requests across your unit."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), " New ticket"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[90vh] overflow-y-auto sm:max-w-2xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Report a Maintenance Issue" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Create a service ticket with property visibility, category, complaint area, priority, and detailed symptoms." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: submit,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "s",
									children: "Subject"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "s",
									value: subject,
									onChange: (e) => setSubject(e.target.value),
									required: true
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "category",
											children: "Issue category"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											id: "category",
											className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm",
											value: category,
											onChange: (e) => setCategory(e.target.value),
											children: [
												"Carpenter",
												"CCTV",
												"Civil & Structural",
												"Door Issue",
												"Electrician",
												"Elevator / Lift",
												"Fire & Safety",
												"Groutin",
												"Housekeeping",
												"HVAC & Chillers",
												"Intercom",
												"Mason",
												"Painter",
												"Plumber",
												"Security",
												"Other"
											].map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: option }, option))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "priority",
											children: "Priority"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											id: "priority",
											className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm",
											value: priority,
											onChange: (e) => setPriority(e.target.value),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Low" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Medium" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "High" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Urgent" })
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "property",
											children: "Property / building"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "property",
											value: property,
											onChange: (e) => setProperty(e.target.value),
											required: true
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "unit",
											children: "Unit / room"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "unit",
											value: unit,
											onChange: (e) => setUnit(e.target.value),
											required: true
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "area",
									children: "Complaint area"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									id: "area",
									className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm",
									value: complaintArea,
									onChange: (e) => setComplaintArea(e.target.value),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Unit / Apartment" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Kitchen" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Bathroom" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Bedroom" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Living Area" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Balcony / Exterior" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Common Area" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Parking" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Other" })
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "d",
									children: "Detailed symptoms and requested action"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "d",
									value: desc,
									onChange: (e) => setDesc(e.target.value),
									placeholder: "Describe what happened, when it started, and any access or safety details.",
									required: true,
									rows: 5
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Submit ticket"
							})] })
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "p-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Ref"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Subject"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Category"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Priority"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Created"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Assignee"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border bg-card",
							children: list.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 font-mono text-xs text-muted-foreground",
									children: ["#", t.id.slice(-4).toUpperCase()]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 font-medium",
									children: t.subject
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-muted-foreground",
									children: t.category
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityClass[t.priority]}`,
										children: t.priority
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusClass[t.status]}`,
										children: t.status.replace("_", " ")
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-muted-foreground",
									children: t.createdAt
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-muted-foreground",
									children: t.assignee ?? "—"
								})
							] }, t.id))
						})]
					})
				})
			}) })
		]
	});
}
//#endregion
export { TicketsPage as component };
