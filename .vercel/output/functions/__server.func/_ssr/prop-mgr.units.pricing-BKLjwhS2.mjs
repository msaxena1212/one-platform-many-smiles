import { i as __toESM } from "../_runtime.mjs";
import { B as supabase } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { Bt as DollarSign, G as Plus, ct as LoaderCircle, fn as Calendar, v as Trash2 } from "../_libs/lucide-react.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prop-mgr.units.pricing-BKLjwhS2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PricingEngine() {
	const [rules, setRules] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [units, setUnits] = (0, import_react.useState)([]);
	const [formData, setFormData] = (0, import_react.useState)({
		unit_id: "",
		rule_name: "",
		start_date: "",
		end_date: "",
		price_modifier: 0,
		modifier_type: "FIXED",
		min_stay_days: 1
	});
	const loadData = async () => {
		setLoading(true);
		const [{ data: rulesData }, { data: unitsData }] = await Promise.all([supabase.from("pricing_rules").select("*, units(unit_name, unit_ref)"), supabase.from("units").select("id, unit_name, unit_ref")]);
		if (rulesData) setRules(rulesData);
		if (unitsData) setUnits(unitsData);
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
		loadData();
	}, []);
	const handleAddRule = async () => {
		const { error } = await supabase.from("pricing_rules").insert([formData]);
		if (error) alert("Error adding rule: " + error.message);
		else loadData();
	};
	const handleDelete = async (id) => {
		const { error } = await supabase.from("pricing_rules").delete().eq("id", id);
		if (!error) loadData();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-2xl font-bold tracking-tight",
			children: "Dynamic Pricing Engine"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground text-sm mt-1",
			children: "Configure seasonal pricing and minimum stay rules for your units."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid md:grid-cols-3 gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "md:col-span-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Add New Rule" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Unit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: formData.unit_id,
								onValueChange: (v) => setFormData({
									...formData,
									unit_id: v
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Unit" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: units.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: u.id,
									children: u.unit_name || u.unit_ref
								}, u.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Rule Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "e.g. Summer Peak Season",
								value: formData.rule_name,
								onChange: (e) => setFormData({
									...formData,
									rule_name: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Start Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: formData.start_date,
									onChange: (e) => setFormData({
										...formData,
										start_date: e.target.value
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "End Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: formData.end_date,
									onChange: (e) => setFormData({
										...formData,
										end_date: e.target.value
									})
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Modifier Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: formData.modifier_type,
								onValueChange: (v) => setFormData({
									...formData,
									modifier_type: v
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "FIXED",
									children: "Fixed Amount Override"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "PERCENTAGE",
									children: "Percentage Adjustment (+/-)"
								})] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Price Modifier" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: formData.price_modifier,
								onChange: (e) => setFormData({
									...formData,
									price_modifier: Number(e.target.value)
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Minimum Stay (Days)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 1,
								value: formData.min_stay_days,
								onChange: (e) => setFormData({
									...formData,
									min_stay_days: Number(e.target.value)
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "w-full",
							onClick: handleAddRule,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " Add Pricing Rule"]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "md:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Active Pricing Rules" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center p-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin text-muted-foreground" })
				}) : rules.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-center p-8 text-muted-foreground",
					children: "No pricing rules configured."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: rules.map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between items-center p-4 border rounded-lg bg-muted/20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "font-semibold text-foreground",
								children: rule.rule_name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: rule.units?.unit_name || rule.units?.unit_ref
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-4 mt-2 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "mr-1 h-3 w-3" }),
											" ",
											rule.start_date,
											" to ",
											rule.end_date
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "mr-1 h-3 w-3" }),
											" ",
											rule.modifier_type === "PERCENTAGE" ? `${rule.price_modifier}%` : `QR ${rule.price_modifier}`
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"Min Stay: ",
										rule.min_stay_days,
										" days"
									] })
								]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: () => handleDelete(rule.id),
							className: "text-destructive hover:text-destructive hover:bg-destructive/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
						})]
					}, rule.id))
				}) })]
			})]
		})]
	});
}
//#endregion
export { PricingEngine as component };
