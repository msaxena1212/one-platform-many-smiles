import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as Star } from "../_libs/lucide-react.mjs";
import { n as CardContent, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portal.community.reviews-CleMFCvW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CommunityReviews() {
	const [reviews] = (0, import_react.useState)([
		{
			id: 1,
			author: "Ahmed K.",
			facility: "Gym",
			rating: 5,
			text: "Excellent facility and staff!",
			date: "2026-06-20"
		},
		{
			id: 2,
			author: "Fatima M.",
			facility: "Pool",
			rating: 4,
			text: "Great for families, very clean",
			date: "2026-06-18"
		},
		{
			id: 3,
			author: "Omar H.",
			facility: "Event Hall",
			rating: 5,
			text: "Perfect for gatherings",
			date: "2026-06-15"
		}
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold tracking-tight",
					children: "Community Reviews"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Share your experience and see what others think"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "+ Write Review" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center justify-center gap-1 mb-2",
								children: [...Array(5)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-6 w-6 fill-amber-400 text-amber-400" }, i))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-3xl font-bold",
								children: "4.7/5"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted-foreground mt-1",
								children: [reviews.length, " reviews from residents"]
							})
						]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: reviews.map((review) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "hover:shadow-md transition",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between mb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold",
									children: review.author
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										review.facility,
										" • ",
										new Date(review.date).toLocaleDateString()
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-0.5",
									children: [...Array(review.rating)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-4 w-4 fill-amber-400 text-amber-400" }, i))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-foreground",
								children: review.text
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2 mt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									className: "h-8",
									children: "👍 Helpful"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									className: "h-8",
									children: "Flag"
								})]
							})
						]
					})
				}, review.id))
			})
		]
	});
}
//#endregion
export { CommunityReviews as component };
