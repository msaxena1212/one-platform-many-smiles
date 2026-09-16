import { i as __toESM } from "../_runtime.mjs";
import { B as supabase, E as fetchMaterialUsage, R as logMaterialUsage, T as fetchMaintenanceTickets, U as updateMaintenanceTicket, b as fetchInventoryParts, n as createApprovalRequest } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { V as RefreshCw, ct as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-EOzTavlY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/maintenance.tickets-ByoZ-j4c.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MOCK_HOST_ID = "00000000-0000-4000-8000-000000000001";
var COLUMNS = [
	{
		key: "new",
		label: "New"
	},
	{
		key: "assigned",
		label: "Assigned"
	},
	{
		key: "in_progress",
		label: "In progress"
	},
	{
		key: "resolved",
		label: "Resolved"
	}
];
var PRIORITY_STYLES = {
	low: "bg-slate-100 text-slate-700",
	medium: "bg-blue-100 text-blue-700",
	high: "bg-orange-100 text-orange-700",
	urgent: "bg-red-100 text-red-700"
};
var FALLBACK_TICKETS = [
	{
		id: "f1",
		property_id: null,
		unit_ref: "A-1201",
		title: "AC not cooling in master bedroom",
		description: null,
		category: "hvac",
		priority: "high",
		status: "in_progress",
		assignee: "Faisal T.",
		host_id: null,
		reported_by: "Khalid Al-Mutairi",
		resolved_at: null,
		created_at: "",
		updated_at: ""
	},
	{
		id: "f2",
		property_id: null,
		unit_ref: "V-12",
		title: "Leaking kitchen tap",
		description: null,
		category: "plumbing",
		priority: "medium",
		status: "assigned",
		assignee: "Mahmoud K.",
		host_id: null,
		reported_by: "Sara Al-Qahtani",
		resolved_at: null,
		created_at: "",
		updated_at: ""
	},
	{
		id: "f3",
		property_id: null,
		unit_ref: "Common",
		title: "Lobby light flickering",
		description: null,
		category: "electrical",
		priority: "low",
		status: "new",
		assignee: null,
		host_id: null,
		reported_by: "Security Guard",
		resolved_at: null,
		created_at: "",
		updated_at: ""
	},
	{
		id: "f4",
		property_id: null,
		unit_ref: "C-2210",
		title: "Deep clean before move-in",
		description: null,
		category: "cleaning",
		priority: "medium",
		status: "resolved",
		assignee: "CleanCo",
		host_id: null,
		reported_by: "Property Manager",
		resolved_at: null,
		created_at: "",
		updated_at: ""
	},
	{
		id: "f5",
		property_id: null,
		unit_ref: "V-07",
		title: "Front door lock replacement",
		description: null,
		category: "security",
		priority: "urgent",
		status: "new",
		assignee: null,
		host_id: null,
		reported_by: "Yousef Bin Hamad",
		resolved_at: null,
		created_at: "",
		updated_at: ""
	}
];
function TicketCard({ ticket }) {
	const ticketNo = ticket.id.startsWith("f") ? `#T${ticket.id.slice(1)}` : `#${ticket.id.slice(0, 6).toUpperCase()}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-background rounded-lg p-4 shadow-sm border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-start mb-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "font-medium text-sm leading-tight text-foreground",
					children: ticket.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide shrink-0 capitalize ${PRIORITY_STYLES[ticket.priority]}`,
					children: ticket.priority
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground mb-1 capitalize",
				children: [
					ticket.category,
					" · ",
					ticket.unit_ref ?? "—"
				]
			}),
			ticket.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mb-3 line-clamp-2",
				children: ticket.description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center text-xs text-muted-foreground mt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono",
					children: ticketNo
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ticket.assignee ?? "Unassigned" })]
			})
		]
	});
}
function HostMaintenance() {
	const [tickets, setTickets] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [usingFallback, setUsingFallback] = (0, import_react.useState)(false);
	const [selectedTicket, setSelectedTicket] = (0, import_react.useState)(null);
	const [editStatus, setEditStatus] = (0, import_react.useState)("");
	const [editAssignee, setEditAssignee] = (0, import_react.useState)("");
	const [editDescription, setEditDescription] = (0, import_react.useState)("");
	const [inventoryParts, setInventoryParts] = (0, import_react.useState)([]);
	const [materialUsage, setMaterialUsage] = (0, import_react.useState)([]);
	const [partId, setPartId] = (0, import_react.useState)("");
	const [partQty, setPartQty] = (0, import_react.useState)(1);
	const [logging, setLogging] = (0, import_react.useState)(false);
	const [escalating, setEscalating] = (0, import_react.useState)(false);
	const load = (0, import_react.useCallback)(async () => {
		try {
			const data = await fetchMaintenanceTickets({ host_id: MOCK_HOST_ID });
			if (data.length > 0) {
				setTickets(data);
				setUsingFallback(false);
			} else {
				setTickets(FALLBACK_TICKETS);
				setUsingFallback(true);
			}
		} catch {
			setTickets(FALLBACK_TICKETS);
			setUsingFallback(true);
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		load();
		const channel = supabase.channel("maintenance_tickets_changes").on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "maintenance_tickets"
		}, () => {
			fetchMaintenanceTickets({ host_id: MOCK_HOST_ID }).then((data) => {
				if (data.length > 0) {
					setTickets(data);
					setUsingFallback(false);
				}
			}).catch(() => {});
		}).subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, [load]);
	(0, import_react.useEffect)(() => {
		fetchInventoryParts().then((p) => setInventoryParts(p)).catch(() => setInventoryParts([]));
	}, []);
	const grouped = COLUMNS.map((col) => ({
		...col,
		items: tickets.filter((t) => t.status === col.key)
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: load,
						disabled: loading,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}` }), "Refresh"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						children: "Export CSV"
					})]
				})
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-48 items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start",
				children: grouped.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-muted/30 rounded-xl p-4 border border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-semibold text-sm",
							children: col.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex h-5 w-5 items-center justify-center rounded-full bg-background text-xs font-medium text-muted-foreground shadow-sm",
							children: col.items.length
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: col.items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "py-6 text-center text-xs text-muted-foreground",
							children: "No tickets"
						}) : col.items.map((ticket) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							onClick: async () => {
								setSelectedTicket(ticket);
								setEditStatus(ticket.status);
								setEditAssignee(ticket.assignee || "");
								setEditDescription(ticket.description || "");
								try {
									setMaterialUsage(await fetchMaterialUsage(ticket.id) || []);
								} catch {
									setMaterialUsage([]);
								}
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TicketCard, { ticket })
						}, ticket.id))
					})]
				}, col.key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!selectedTicket,
				onOpenChange: (open) => {
					if (!open) {
						setSelectedTicket(null);
						setMaterialUsage([]);
					}
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: selectedTicket?.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
							selectedTicket?.category,
							" · ",
							selectedTicket?.unit_ref
						] })] }),
						selectedTicket && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg bg-muted/50 p-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-medium",
										children: ["Reported by: ", selectedTicket.reported_by || "—"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-1",
										children: selectedTicket.description || "No additional details"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "font-semibold",
									children: "Material Usage"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 space-y-3",
									children: materialUsage.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: "No parts logged yet."
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-border bg-background p-3 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-[1fr_auto_auto] gap-4 text-xs uppercase tracking-wide text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Part" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-center",
													children: "Qty"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-right",
													children: "Cost"
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-3 space-y-2",
											children: materialUsage.map((mu) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-[1fr_auto_auto] items-center gap-4 text-sm",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: mu.inventory_parts?.name ?? "Part" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-center",
														children: mu.quantity
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-right font-medium",
														children: ["$", Number(mu.cost).toLocaleString()]
													})
												]
											}, mu.id))
										})]
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "font-semibold",
									children: "Log Material / Part"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-3 gap-3 mt-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Part" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: partId,
											onValueChange: (v) => setPartId(v),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: inventoryParts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
												value: p.id,
												children: [
													p.name,
													" — $",
													p.unit_cost
												]
											}, p.id)) })]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Quantity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											value: partQty,
											onChange: (e) => setPartQty(Number(e.target.value))
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex items-end",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												onClick: async () => {
													if (!selectedTicket) return;
													if (!partId) return;
													setLogging(true);
													try {
														await logMaterialUsage({
															ticket_id: selectedTicket.id,
															part_id: partId,
															quantity: partQty
														});
														setMaterialUsage(await fetchMaterialUsage(selectedTicket.id) || []);
														setInventoryParts(await fetchInventoryParts() || []);
														setPartQty(1);
													} catch (e) {
														console.error(e);
														alert(e?.message || "Unable to issue material.");
													} finally {
														setLogging(false);
													}
												},
												disabled: logging,
												children: logging ? "Logging..." : "Add"
											})
										})
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "font-semibold",
									children: "Available Parts"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 grid gap-2",
									children: inventoryParts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: "Inventory loading or no parts available."
									}) : inventoryParts.map((part) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium",
											children: part.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground",
											children: ["Unit cost: $", Number(part.unit_cost).toLocaleString()]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted-foreground",
											children: [part.quantity_on_hand, " in stock"]
										})]
									}, part.id))
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-1/2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-sm text-muted-foreground",
											children: ["Total Parts Cost: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["$", materialUsage.reduce((s, m) => s + Number(m.cost || m.cost || 0), 0).toLocaleString()] })]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "outline",
												onClick: () => {
													setSelectedTicket(null);
													setMaterialUsage([]);
												},
												children: "Close"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												className: "bg-primary hover:bg-primary/90",
												onClick: async () => {
													if (!selectedTicket) return;
													try {
														await updateMaintenanceTicket(selectedTicket.id, {
															status: editStatus || selectedTicket.status,
															assignee: editAssignee || null,
															description: editDescription || null
														});
														await load();
														setSelectedTicket(null);
														setMaterialUsage([]);
													} catch (e) {
														console.error(e);
														alert("Failed to update ticket");
													}
												},
												children: "Save"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												className: "bg-amber-600 hover:bg-amber-700",
												onClick: async () => {
													if (!selectedTicket) return;
													setEscalating(true);
													try {
														const total = materialUsage.reduce((s, m) => s + Number(m.cost || m.cost || 0), 0);
														await createApprovalRequest({
															target_record_id: selectedTicket.id,
															target_table: "maintenance_escalations",
															requested_by: "Host Portal",
															amount: total,
															status: "pending",
															notes: `Escalation for ticket: ${selectedTicket.title}. Parts cost: ${total}`
														});
														setSelectedTicket(null);
														setMaterialUsage([]);
													} catch (e) {
														console.error(e);
													} finally {
														setEscalating(false);
													}
												},
												disabled: escalating,
												children: escalating ? "Escalating..." : "Escalate"
											})
										]
									})]
								})
							]
						}),
						selectedTicket && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "font-semibold",
								children: "Update Ticket"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: editStatus || "",
										onValueChange: (v) => setEditStatus(v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: COLUMNS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: c.key,
											children: c.label
										}, c.key)) })]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Assignee" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: editAssignee || "",
										onChange: (e) => setEditAssignee(e.target.value)
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: editDescription || "",
										onChange: (e) => setEditDescription(e.target.value)
									})] })
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, {})
					]
				})
			})
		]
	});
}
//#endregion
export { HostMaintenance as component };
