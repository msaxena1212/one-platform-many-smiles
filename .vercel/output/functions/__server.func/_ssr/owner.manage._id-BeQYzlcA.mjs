import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as ManagePropertyPage } from "./prop-mgr.manage._id-jChdsZOC.mjs";
import { t as Route } from "./owner.manage._id-C8O4oLdn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/owner.manage._id-BeQYzlcA.js
var import_jsx_runtime = require_jsx_runtime();
function OwnerManageProperty() {
	const { id } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManagePropertyPage, {
		basePath: "/owner",
		id
	});
}
//#endregion
export { OwnerManageProperty as component };
