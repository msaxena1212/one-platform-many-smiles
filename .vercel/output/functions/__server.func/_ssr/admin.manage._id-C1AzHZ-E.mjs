import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.manage._id-C1AzHZ-E.js
var $$splitComponentImporter = () => import("./admin.manage._id-CTlr2ct0.mjs");
var Route = createFileRoute("/admin/manage/$id")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	validateSearch: (search) => ({ mode: search.mode === "edit" ? "edit" : "view" })
});
//#endregion
export { Route as t };
