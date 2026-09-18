import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as ManagePropertyPage } from "./prop-mgr.manage._id-BxT1pqqG.mjs";
import { t as Route } from "./admin.manage._id-3nUrTtey.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.manage._id-CTYBSC63.js
var import_jsx_runtime = require_jsx_runtime();
function AdminManageProperty() {
	const { id } = Route.useParams();
	const { mode } = Route.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManagePropertyPage, {
		basePath: "/admin",
		id,
		mode
	});
}
//#endregion
export { AdminManageProperty as component };
