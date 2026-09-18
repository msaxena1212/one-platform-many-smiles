import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/owner.manage._id-BWCe3eVW.js
var $$splitComponentImporter = () => import("./owner.manage._id-D0elzSVh.mjs");
var Route = createFileRoute("/owner/manage/$id")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	validateSearch: (search) => ({ mode: search.mode === "edit" ? "edit" : "view" })
});
//#endregion
export { Route as t };
