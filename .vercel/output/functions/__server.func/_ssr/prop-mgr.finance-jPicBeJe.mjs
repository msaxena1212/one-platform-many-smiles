import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as ModuleSuspense } from "./module-suspense-Bvj7y08x.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prop-mgr.finance-jPicBeJe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FinanceModule = (0, import_react.lazy)(() => import("./finance-module-BnEE7jvr.mjs").then((m) => ({ default: m.FinanceModule })));
function HostFinance() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModuleSuspense, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinanceModule, { role: "prop-mgr" }) });
}
//#endregion
export { HostFinance as component };
