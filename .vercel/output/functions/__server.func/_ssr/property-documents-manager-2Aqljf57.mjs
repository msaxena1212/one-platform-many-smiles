import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $t as CircleCheck, Dt as File, Pt as Eye, Rt as Download, X as Paperclip, j as ShieldCheck, kt as FileText, n as X, p as Upload, tn as CircleAlert, v as Trash2 } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as useDropzone } from "../_libs/react-dropzone.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/property-documents-manager-2Aqljf57.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function buildPropertyPayload(input) {
	const amenityValues = input.amenities ?? (input.amenityFields ?? []).filter(Boolean);
	const municipalityPayload = buildMunicipalityPayload(input.municipalityDetails, input.ownerLandlord, amenityValues, input.otherAmenitiesFacilities, input.proposedFields, input.documents);
	return {
		host_id: input.hostId,
		title: input.title,
		description: input.description ?? null,
		property_type: input.propertyType || "apartment",
		address: input.address,
		city: input.city,
		state: input.state || void 0,
		zip_code: input.zipCode || void 0,
		country: input.country,
		max_guests: Number(input.maxGuests) || 1,
		bedrooms: Number(input.bedrooms) || 1,
		beds: Number(input.beds) || 1,
		bathrooms: Number(input.bathrooms) || 1,
		base_price_per_night: Number(input.basePricePerNight) || 0,
		cleaning_fee: Number(input.cleaningFee) || 0,
		is_active: input.isActive ?? true,
		room_details: input.roomDetails ?? {},
		property_code: input.propertyCode || void 0,
		cost_center_code: input.costCenterCode || void 0,
		cost_center_name: input.costCenterName || void 0,
		property_category: input.propertyCategory || void 0,
		ownership_type: input.ownershipType || void 0,
		area_zone: input.areaZone || void 0,
		street_building_name: input.streetBuildingName || void 0,
		plot_building_no: input.plotBuildingNo || void 0,
		title_deed_no: input.titleDeedNo || void 0,
		municipality_ref_no: input.municipalityRefNo || void 0,
		property_manager: input.propertyManager || void 0,
		no_of_floors: input.noOfFloors ? Number(input.noOfFloors) : void 0,
		no_of_units: input.noOfUnits ? Number(input.noOfUnits) : input.totalUnits ? Number(input.totalUnits) : void 0,
		total_units: input.totalUnits ? Number(input.totalUnits) : input.noOfUnits ? Number(input.noOfUnits) : void 0,
		total_built_up_area_sqm: input.totalBuiltUpAreaSqm ? Number(input.totalBuiltUpAreaSqm) : void 0,
		common_area_sqm: input.commonAreaSqm ? Number(input.commonAreaSqm) : void 0,
		parking_count: input.parkingCount ? Number(input.parkingCount) : void 0,
		no_of_elevators: input.noOfElevators ? Number(input.noOfElevators) : void 0,
		completion_date: input.completionDate || void 0,
		handover_date: input.handoverDate || void 0,
		property_status: input.propertyStatus || void 0,
		documents_received: Boolean(input.documentsReceived),
		remarks: input.remarks || void 0,
		kahramaa_number: input.kahramaaNumber || void 0,
		municipality_details: municipalityPayload
	};
}
function buildMunicipalityPayload(municipalityDetails, ownerLandlord, amenitiesFields, otherAmenitiesFacilities, proposedFields, documents) {
	let municipality = null;
	try {
		municipality = municipalityDetails ? JSON.parse(municipalityDetails) : null;
	} catch {
		municipality = municipalityDetails;
	}
	return {
		...typeof municipality === "object" && municipality !== null ? municipality : {},
		owner_landlord: ownerLandlord || void 0,
		facility_amenities: amenitiesFields.filter(Boolean),
		other_amenities_facilities: otherAmenitiesFacilities || void 0,
		property_documents: documents ?? municipality?.property_documents ?? void 0,
		change_request: {
			property_code_new: proposedFields?.propertyCode || void 0,
			property_name_new: proposedFields?.propertyName || void 0,
			cost_center_code_new: proposedFields?.costCenterCode || void 0,
			cost_center_name_new: proposedFields?.costCenterName || void 0
		}
	};
}
function ImageUploader({ images, onChange, categories, disabled = false }) {
	const [draggedId, setDraggedId] = (0, import_react.useState)(null);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop: (0, import_react.useCallback)((acceptedFiles) => {
			const newImages = acceptedFiles.map((file) => ({
				id: crypto.randomUUID(),
				url: URL.createObjectURL(file),
				file,
				category: categories[0] || "Uncategorized",
				isCover: images.length === 0
			}));
			onChange([...images, ...newImages]);
		}, [
			images,
			onChange,
			categories
		]),
		accept: { "image/*": [
			".jpeg",
			".jpg",
			".png",
			".webp"
		] }
	});
	const removeImage = (id) => {
		const filtered = images.filter((img) => img.id !== id);
		if (filtered.length > 0 && images.find((i) => i.id === id)?.isCover) filtered[0].isCover = true;
		onChange(filtered);
	};
	const setCover = (id) => {
		onChange(images.map((img) => ({
			...img,
			isCover: img.id === id
		})));
	};
	const updateCategory = (id, category) => {
		onChange(images.map((img) => img.id === id ? {
			...img,
			category
		} : img));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [!disabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			...getRootProps(),
			className: `border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { ...getInputProps() }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mx-auto h-10 w-10 text-muted-foreground mb-4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-medium",
					children: "Drag & drop photos here"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "PNG, JPG, WEBP up to 10MB"
				})
			]
		}), images.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 md:grid-cols-4 gap-4 mt-4",
			children: images.map((img, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: `overflow-hidden relative group ${img.isCover ? "ring-2 ring-primary" : ""}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "aspect-square relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: img.url,
							alt: "Uploaded preview",
							className: "object-cover w-full h-full"
						}),
						!disabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-start",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "bg-background/80 hover:bg-background text-[10px] cursor-pointer",
									onClick: () => setCover(img.id),
									children: img.isCover ? "Cover Photo" : "Set as Cover"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "destructive",
									className: "h-6 w-6 rounded-full",
									onClick: () => removeImage(img.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "h-7 text-xs rounded bg-background/90 text-foreground border-0 px-2",
								value: img.category,
								onChange: (e) => updateCategory(img.id, e.target.value),
								children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c,
									children: c
								}, c))
							})]
						}),
						disabled && img.isCover && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute top-2 left-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: "bg-background/80 text-[10px]",
								children: "Cover Photo"
							})
						})
					]
				})
			}, img.id))
		})]
	});
}
var REQUIRED_DOCUMENT_TYPES = [
	{
		id: "title_deed",
		label: "Title Deed / Ownership Certificate",
		category: "Ownership",
		required: true
	},
	{
		id: "building_permit",
		label: "Building / Construction Permit",
		category: "Compliance",
		required: true
	},
	{
		id: "municipality_license",
		label: "Municipality License / Registration",
		category: "Compliance",
		required: true
	},
	{
		id: "civil_defense",
		label: "Civil Defense / Fire Safety Certificate",
		category: "Safety",
		required: true
	},
	{
		id: "kahramaa_approval",
		label: "Kahramaa / Electricity & Water Clearance",
		category: "Utilities",
		required: false
	},
	{
		id: "insurance_policy",
		label: "Property Insurance Policy",
		category: "Insurance",
		required: false
	},
	{
		id: "architectural_drawings",
		label: "As-Built / Architectural Drawings",
		category: "Technical",
		required: false
	},
	{
		id: "mep_specifications",
		label: "MEP & Elevator Maintenance Contract",
		category: "Maintenance",
		required: false
	}
];
var CATEGORY_COLORS = {
	Ownership: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
	Compliance: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
	Safety: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
	Utilities: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
	Insurance: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
	Technical: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
	Maintenance: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
	General: "bg-muted text-muted-foreground border-border"
};
function PropertyDocumentsManager({ documents, onChange, disabled = false }) {
	const rowFileRefs = (0, import_react.useRef)({});
	const otherFileInputRef = (0, import_react.useRef)(null);
	const [otherDocName, setOtherDocName] = (0, import_react.useState)("");
	const formatFileSize = (bytes) => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = [
			"B",
			"KB",
			"MB",
			"GB"
		];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
	};
	const getDocsForType = (typeId) => documents.filter((d) => d.typeId === typeId);
	const handleRowUpload = (e, typeId, typeLabel) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;
		const newDocs = Array.from(files).map((file) => ({
			id: crypto.randomUUID(),
			name: file.name,
			type: typeLabel,
			typeId,
			size: file.size,
			uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
			url: URL.createObjectURL(file)
		}));
		onChange([...documents, ...newDocs]);
		toast.success(newDocs.length > 1 ? `${newDocs.length} files uploaded for ${typeLabel}.` : `"${newDocs[0].name}" uploaded for ${typeLabel}.`);
		if (rowFileRefs.current[typeId]) rowFileRefs.current[typeId].value = "";
	};
	const handleOtherUpload = (e) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;
		const label = otherDocName.trim() || "Other Documents";
		const newDocs = Array.from(files).map((file) => ({
			id: crypto.randomUUID(),
			name: file.name,
			type: label,
			typeId: "other",
			size: file.size,
			uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
			url: URL.createObjectURL(file)
		}));
		onChange([...documents, ...newDocs]);
		toast.success(`${newDocs.length} document(s) uploaded.`);
		setOtherDocName("");
		if (otherFileInputRef.current) otherFileInputRef.current.value = "";
	};
	const handleRemoveDoc = (id) => {
		onChange(documents.filter((d) => d.id !== id));
		toast.info("Document removed.");
	};
	const mandatoryTotal = REQUIRED_DOCUMENT_TYPES.filter((r) => r.required).length;
	const mandatoryDone = REQUIRED_DOCUMENT_TYPES.filter((r) => r.required && getDocsForType(r.id).length > 0).length;
	const otherDocs = documents.filter((d) => d.typeId === "other");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-border bg-card overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-bold uppercase tracking-wider text-foreground",
						children: "Required Document Compliance Checklist"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: `text-xs font-bold px-2.5 py-0.5 rounded-full border ${mandatoryDone === mandatoryTotal ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"}`,
					children: [
						mandatoryDone,
						"/",
						mandatoryTotal,
						" Mandatory"
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border bg-muted/20",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-4 py-2.5 font-semibold text-muted-foreground",
								children: "#"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-2.5 font-semibold text-muted-foreground",
								children: "Document Name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-2.5 font-semibold text-muted-foreground",
								children: "Category"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-2.5 font-semibold text-muted-foreground",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-2.5 font-semibold text-muted-foreground",
								children: "Uploaded Files"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right px-4 py-2.5 font-semibold text-muted-foreground",
								children: "Action"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-border",
						children: REQUIRED_DOCUMENT_TYPES.map((req, idx) => {
							const rowDocs = getDocsForType(req.id);
							const uploaded = rowDocs.length > 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: `transition-colors ${uploaded ? "bg-emerald-500/5 hover:bg-emerald-500/10" : req.required ? "bg-amber-500/5 hover:bg-amber-500/10" : "hover:bg-muted/20"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-muted-foreground font-medium",
										children: idx + 1
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [
												uploaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 text-emerald-500 shrink-0" }) : req.required ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-3.5 w-3.5 text-amber-500 shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(File, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium text-foreground",
													children: req.label
												}),
												req.required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-red-500 font-bold shrink-0",
													children: "*"
												})
											]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${CATEGORY_COLORS[req.category] || CATEGORY_COLORS.General}`,
											children: req.category
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: `text-[10px] px-2 py-0.5 font-semibold ${uploaded ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10" : req.required ? "border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10" : "border-border text-muted-foreground"}`,
											children: uploaded ? `Uploaded (${rowDocs.length})` : req.required ? "Required" : "Optional"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 min-w-[200px]",
										children: rowDocs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground italic",
											children: "No file uploaded"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex flex-col gap-1.5",
											children: rowDocs.map((doc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between gap-2 p-1.5 rounded-md bg-muted/30 border border-border/50 text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1.5 min-w-0 flex-1",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-foreground font-medium truncate",
															title: doc.name,
															children: doc.name
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "text-muted-foreground shrink-0 text-[11px]",
															children: [
																"(",
																formatFileSize(doc.size),
																")"
															]
														})
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1 shrink-0",
													children: [doc.url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														onClick: () => window.open(doc.url, "_blank"),
														className: "p-1 rounded text-primary hover:bg-primary/10 transition-colors",
														title: "View / Open File",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" })
													}), !disabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														onClick: () => handleRemoveDoc(doc.id),
														className: "p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
														title: "Remove File",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
													})]
												})]
											}, doc.id))
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-right",
										children: !disabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "file",
											ref: (el) => {
												rowFileRefs.current[req.id] = el;
											},
											onChange: (e) => handleRowUpload(e, req.id, req.label),
											className: "hidden",
											multiple: true,
											accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.xls,.xlsx"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "button",
											variant: uploaded ? "outline" : req.required ? "default" : "outline",
											size: "sm",
											onClick: () => rowFileRefs.current[req.id]?.click(),
											className: `h-7 text-[11px] gap-1.5 ${!uploaded && req.required ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3 w-3" }), uploaded ? "Add More" : "Upload"]
										})] })
									})
								]
							}, req.id);
						})
					})]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-border bg-card overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-4 w-4 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-bold uppercase tracking-wider text-foreground",
						children: "Other Documents"
					}),
					otherDocs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "secondary",
						className: "text-[10px] ml-auto",
						children: [
							otherDocs.length,
							" file",
							otherDocs.length !== 1 ? "s" : ""
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 space-y-3",
				children: [
					!disabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row gap-3 items-end",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Document Label (Optional)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: otherDocName,
								onChange: (e) => setOtherDocName(e.target.value),
								placeholder: "e.g. Environmental Clearance, NOC Letter...",
								className: "h-9 bg-background text-xs"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								ref: otherFileInputRef,
								onChange: handleOtherUpload,
								className: "hidden",
								multiple: true,
								accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.xls,.xlsx"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "outline",
								size: "sm",
								onClick: () => otherFileInputRef.current?.click(),
								className: "h-9 gap-2 text-xs w-full sm:w-auto",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3.5 w-3.5" }), "Select and Upload Files"]
							})]
						})]
					}),
					otherDocs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-center py-6 text-muted-foreground text-xs gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 opacity-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "No additional documents uploaded yet." })]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "divide-y divide-border rounded-lg border border-border overflow-hidden",
						children: otherDocs.map((doc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between p-3 gap-3 hover:bg-muted/30 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-1.5 rounded-md bg-primary/10 text-primary shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-foreground truncate",
										children: doc.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] text-muted-foreground",
										children: [
											doc.type,
											" - ",
											formatFileSize(doc.size),
											" - ",
											new Date(doc.uploadedAt).toLocaleDateString()
										]
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 shrink-0",
								children: [
									doc.url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "ghost",
										size: "sm",
										className: "h-7 w-7 p-0 text-muted-foreground hover:text-foreground",
										onClick: () => window.open(doc.url, "_blank"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "ghost",
										size: "sm",
										className: "h-7 w-7 p-0 text-muted-foreground hover:text-foreground",
										onClick: () => {
											if (!doc.url) {
												toast.info(`No file URL for ${doc.name}`);
												return;
											}
											const a = document.createElement("a");
											a.href = doc.url;
											a.download = doc.name;
											document.body.appendChild(a);
											a.click();
											document.body.removeChild(a);
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" })
									}),
									!disabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "ghost",
										size: "sm",
										className: "h-7 w-7 p-0 text-muted-foreground hover:text-destructive",
										onClick: () => handleRemoveDoc(doc.id),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
									})
								]
							})]
						}, doc.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted-foreground",
						children: "Accepts PDF, DOC, DOCX, Images, Excel up to 25 MB per file. You may select multiple files at once."
					})
				]
			})]
		})]
	});
}
//#endregion
export { PropertyDocumentsManager as n, buildPropertyPayload as r, ImageUploader as t };
