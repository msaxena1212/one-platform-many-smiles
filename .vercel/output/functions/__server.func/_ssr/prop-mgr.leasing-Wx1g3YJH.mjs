import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as ModuleSuspense } from "./module-suspense-Bvj7y08x.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prop-mgr.leasing-Wx1g3YJH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* prop-mgr.leasing.tsx — thin route wrapper
*
* The full LeasingPage component (7000+ lines, ~408KB) lives in
* `src/components/leasing-module.tsx` and is loaded lazily — it is only
* downloaded when the user actually navigates to this route.
*/
var LeasingPage = (0, import_react.lazy)(() => import("./leasing-module-CUA9Yj5B.mjs"));
function LazyLeasingPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModuleSuspense, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeasingPage, {}) });
}
//#endregion
export { LazyLeasingPage as component };
