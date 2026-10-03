import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as ManagePropertyPage } from "./prop-mgr.manage._id-Dh5t18nq.mjs";
import { t as Route } from "./owner.manage._id-ytL8Jn0_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/owner.manage._id-vs2HtQPy.js
var import_jsx_runtime = require_jsx_runtime();
function OwnerManageProperty() {
	const { id } = Route.useParams();
	const { mode } = Route.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManagePropertyPage, {
		basePath: "/owner",
		id,
		mode
	});
}
//#endregion
export { OwnerManageProperty as component };
