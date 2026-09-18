import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { G as Plus, I as Search, J as Pencil, Z as Package, gn as Building2, jt as FilePenLine, s as Users, v as Trash2, zt as DoorOpen } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as ScrollArea } from "./scroll-area-BlnbM3_c.mjs";
import { y as useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-C7RsdMLq.mjs";
import { n as MASTER_DEFINITIONS, t as DynamicMastersService } from "./dynamic-masters-service-4scH-jHP.mjs";
import { t as Switch } from "./switch-C_mzcXif.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/masters-module-DzvRqiSa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NAV_GROUPS = [
	{
		label: "HR & Employee Masters",
		icon: Users,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
		items: MASTER_DEFINITIONS.filter((m) => m.category === "Employee").map((m) => ({
			key: m.key,
			label: m.label
		}))
	},
	{
		label: "Asset Masters",
		icon: Package,
		color: "text-emerald-500",
		bg: "bg-emerald-500/10",
		items: MASTER_DEFINITIONS.filter((m) => m.category === "Asset").map((m) => ({
			key: m.key,
			label: m.label
		}))
	},
	{
		label: "Property Masters",
		icon: Building2,
		color: "text-amber-500",
		bg: "bg-amber-500/10",
		items: MASTER_DEFINITIONS.filter((m) => m.category === "Property").map((m) => ({
			key: m.key,
			label: m.label
		}))
	},
	{
		label: "Unit Masters",
		icon: DoorOpen,
		color: "text-purple-500",
		bg: "bg-purple-500/10",
		items: MASTER_DEFINITIONS.filter((m) => m.category === "Unit").map((m) => ({
			key: m.key,
			label: m.label
		}))
	},
	{
		label: "Customer & Lease Masters",
		icon: FilePenLine,
		color: "text-teal-500",
		bg: "bg-teal-500/10",
		items: MASTER_DEFINITIONS.filter((m) => m.category === "Lease").map((m) => ({
			key: m.key,
			label: m.label
		}))
	}
];
function DynamicMasterPanel({ definition, items, isMandatory, onToggleMandatory, onAdd, onEdit, onDelete }) {
	const [search, setSearch] = (0, import_react.useState)("");
	const [showDialog, setShowDialog] = (0, import_react.useState)(false);
	const [editItem, setEditItem] = (0, import_react.useState)(null);
	const [value, setValue] = (0, import_react.useState)("");
	const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
	function openAdd() {
		setEditItem(null);
		setValue("");
		setShowDialog(true);
	}
	function openEdit(item) {
		setEditItem(item);
		setValue(item.name);
		setShowDialog(true);
	}
	function handleSave() {
		if (!value.trim()) return;
		try {
			if (editItem) {
				onEdit(editItem.id, value.trim());
				toast.success(`Updated "${value.trim()}" in ${definition.label}`);
			} else {
				onAdd(value.trim());
				toast.success(`Added "${value.trim()}" to ${definition.label}`);
			}
			setShowDialog(false);
		} catch (err) {
			toast.error(err.message || "Operation failed");
		}
	}
	function handleDelete(id, name) {
		if (!confirm(`Delete "${name}" from ${definition.label}?`)) return;
		try {
			onDelete(id);
			toast.success(`Deleted "${name}"`);
		} catch (err) {
			toast.error(err.message || "Delete failed");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-lg font-bold",
					children: [definition.label, " Master"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: "text-xs",
					children: [items.length, " Options Configured"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground mt-0.5",
				children: [
					"Category: ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-foreground",
						children: definition.category
					}),
					" — Synchronized with Excel upload & manual dropdowns."
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 bg-muted/40 p-2 px-3 rounded-lg border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold",
						children: "Mandatory Field"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] text-muted-foreground",
						children: "Require value during creation"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: isMandatory,
					onCheckedChange: (checked) => {
						onToggleMandatory(checked);
						toast.success(`${definition.label} is now ${checked ? "Mandatory" : "Optional"}`);
					}
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex-1 max-w-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: `Search ${definition.label}...`,
					className: "pl-9",
					value: search,
					onChange: (e) => setSearch(e.target.value)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				className: "gap-2 ml-3 bg-teal-600 hover:bg-teal-700 text-white",
				onClick: openAdd,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
					" Add New ",
					definition.label
				]
			})]
		}),
		filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground text-center py-8",
			children: search ? "No matches found." : "No master options configured yet."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-1 md:grid-cols-2 gap-2",
			children: filtered.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-3.5 py-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors group",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-medium",
					children: item.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "h-7 w-7",
						onClick: () => openEdit(item),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "h-7 w-7 text-destructive hover:text-destructive",
						onClick: () => handleDelete(item.id, item.name),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
					})]
				})]
			}, item.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: showDialog,
			onOpenChange: setShowDialog,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "sm:max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editItem ? `Edit ${definition.label}` : `Add New ${definition.label}` }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3 py-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [definition.label, " Name / Value"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: `Enter ${definition.label.toLowerCase()} value...`,
								value,
								onChange: (e) => setValue(e.target.value),
								onKeyDown: (e) => e.key === "Enter" && handleSave(),
								autoFocus: true
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setShowDialog(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: handleSave,
						disabled: !value.trim(),
						className: "bg-teal-600 hover:bg-teal-700 text-white",
						children: editItem ? "Update" : "Add to Master"
					})] })
				]
			})
		})
	] });
}
function MastersModule({ role }) {
	const activeKey = useSearch({ strict: false }).tab || "gender";
	const [items, setItems] = (0, import_react.useState)([]);
	const [isMandatory, setIsMandatory] = (0, import_react.useState)(false);
	const activeDef = MASTER_DEFINITIONS.find((d) => d.key === activeKey) || MASTER_DEFINITIONS[0];
	const refreshActive = (0, import_react.useCallback)(() => {
		if (activeDef) {
			setItems(DynamicMastersService.getMasterValues(activeDef.key));
			setIsMandatory(DynamicMastersService.isMasterMandatory(activeDef.key));
		}
	}, [activeDef]);
	(0, import_react.useEffect)(() => {
		refreshActive();
	}, [activeKey, refreshActive]);
	const activeGroup = NAV_GROUPS.find((g) => g.items.some((i) => i.key === activeKey));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-bold tracking-tight",
			children: "Masters & Configuration"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground mt-1",
			children: "Configure dynamic master reference values for Properties, Units, Assets, and Employees with full Excel sync and mandatory controls."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-6 min-h-[600px]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 min-w-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "h-full",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3 border-b",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [activeGroup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `p-1.5 rounded-md ${activeGroup.bg}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(activeGroup.icon, { className: `h-4 w-4 ${activeGroup.color}` })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: activeDef.label
							}), activeGroup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: activeGroup.label
							})] })]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "pt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
							className: "h-[600px] pr-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicMasterPanel, {
								definition: activeDef,
								items,
								isMandatory,
								onToggleMandatory: (val) => {
									DynamicMastersService.setMandatoryFlag(activeDef.key, val);
									setIsMandatory(val);
								},
								onAdd: (name) => {
									DynamicMastersService.addMasterValue(activeDef.key, name);
									refreshActive();
								},
								onEdit: (id, name) => {
									DynamicMastersService.updateMasterValue(activeDef.key, id, name);
									refreshActive();
								},
								onDelete: (id) => {
									DynamicMastersService.deleteMasterValue(activeDef.key, id);
									refreshActive();
								}
							})
						})
					})]
				})
			})
		})]
	});
}
//#endregion
export { MastersModule };
