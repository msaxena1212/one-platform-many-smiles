import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.manage._id-3nUrTtey.js
var $$splitComponentImporter = () => import("./admin.manage._id-CTYBSC63.mjs");
var Route = createFileRoute("/admin/manage/$id")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	validateSearch: (search) => ({ mode: search.mode === "edit" ? "edit" : "view" })
});
//#endregion
export { Route as t };
