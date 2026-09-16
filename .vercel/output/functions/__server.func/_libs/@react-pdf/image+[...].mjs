import { n as __exportAll } from "../../_runtime.mjs";
import { i as src_default, r as PNG$1 } from "./font+[...].mjs";
import fs from "fs";
import url from "url";
import path from "path";
//#region node_modules/@react-pdf/primitives/lib/index.js
var lib_exports = /* @__PURE__ */ __exportAll({
	Canvas: () => Canvas,
	Checkbox: () => Checkbox,
	Circle: () => Circle,
	ClipPath: () => ClipPath,
	Defs: () => Defs,
	Document: () => Document,
	Ellipse: () => Ellipse,
	FieldSet: () => FieldSet,
	G: () => "G",
	Image: () => Image,
	ImageBackground: () => ImageBackground,
	Line: () => Line,
	LinearGradient: () => LinearGradient,
	Link: () => Link,
	List: () => List,
	Marker: () => Marker,
	Note: () => Note,
	Page: () => Page,
	Path: () => Path,
	Polygon: () => Polygon,
	Polyline: () => Polyline,
	RadialGradient: () => RadialGradient,
	Rect: () => Rect,
	Select: () => Select,
	Stop: () => Stop,
	Svg: () => "SVG",
	Text: () => Text,
	TextInput: () => TextInput,
	TextInstance: () => TextInstance,
	Tspan: () => Tspan,
	View: () => View
});
var View = "VIEW";
var Text = "TEXT";
var Link = "LINK";
var Page = "PAGE";
var Note = "NOTE";
var Path = "PATH";
var Rect = "RECT";
var Line = "LINE";
var FieldSet = "FIELD_SET";
var TextInput = "TEXT_INPUT";
var Select = "SELECT";
var Checkbox = "CHECKBOX";
var List = "LIST";
var Stop = "STOP";
var Defs = "DEFS";
var Image = "IMAGE";
var ImageBackground = "IMAGE_BACKGROUND";
var Tspan = "TSPAN";
var Canvas = "CANVAS";
var Circle = "CIRCLE";
var Ellipse = "ELLIPSE";
var Polygon = "POLYGON";
var Document = "DOCUMENT";
var Polyline = "POLYLINE";
var ClipPath = "CLIP_PATH";
var TextInstance = "TEXT_INSTANCE";
var LinearGradient = "LINEAR_GRADIENT";
var RadialGradient = "RADIAL_GRADIENT";
var Marker = "MARKER";
//#endregion
//#region node_modules/@react-pdf/svg/lib/index.js
var XML_ENTITY_MAP = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: "\"",
	apos: "'"
};
var ENTITY_REGEX = /&(amp|lt|gt|quot|apos);/g;
var ATTR_REGEX = /([a-zA-Z][a-zA-Z0-9_:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
function decodeXmlEntities(str) {
	return str.replace(ENTITY_REGEX, (_, key) => XML_ENTITY_MAP[key]);
}
function parseAttributes(attrString) {
	const attrs = {};
	ATTR_REGEX.lastIndex = 0;
	let match;
	while ((match = ATTR_REGEX.exec(attrString)) !== null) attrs[match[1]] = decodeXmlEntities(match[2] ?? match[3]);
	return attrs;
}
function tokenize(xmlString) {
	const str = xmlString.replace(/<\?xml[^?]*\?>|<!DOCTYPE[^>]*>|<!--[\s\S]*?-->/gi, "");
	const tokens = [];
	let pos = 0;
	while (pos < str.length) {
		const nextTag = str.indexOf("<", pos);
		if (nextTag === -1) break;
		if (nextTag > pos) {
			const raw = str.slice(pos, nextTag);
			if (/\S/.test(raw)) tokens.push({
				type: "text",
				text: decodeXmlEntities(raw)
			});
		}
		if (str.startsWith("<![CDATA[", nextTag)) {
			const cdataEnd = str.indexOf("]]>", nextTag + 9);
			if (cdataEnd === -1) break;
			const text = str.slice(nextTag + 9, cdataEnd);
			if (text) tokens.push({
				type: "text",
				text
			});
			pos = cdataEnd + 3;
			continue;
		}
		const tagEnd = str.indexOf(">", nextTag);
		if (tagEnd === -1) break;
		const tagContent = str.slice(nextTag + 1, tagEnd);
		pos = tagEnd + 1;
		if (tagContent.startsWith("/")) {
			tokens.push({
				type: "close",
				tagName: tagContent.slice(1).trim()
			});
			continue;
		}
		const isSelfClosing = tagContent.endsWith("/");
		const rawTag = isSelfClosing ? tagContent.slice(0, -1) : tagContent;
		const spaceIndex = rawTag.search(/[\s/]/);
		const tagName = spaceIndex === -1 ? rawTag.trim() : rawTag.slice(0, spaceIndex).trim();
		const attrString = spaceIndex === -1 ? "" : rawTag.slice(spaceIndex);
		tokens.push({
			type: isSelfClosing ? "self-close" : "open",
			tagName,
			attributes: parseAttributes(attrString)
		});
	}
	return tokens;
}
var CAMEL_CASE_REGEX = /[-:]([a-z])/g;
var TAG_NAME_MAP = {
	svg: "SVG",
	g: "G",
	path: Path,
	rect: Rect,
	circle: Circle,
	ellipse: Ellipse,
	line: Line,
	polyline: Polyline,
	polygon: Polygon,
	text: Text,
	tspan: Tspan,
	defs: Defs,
	clippath: ClipPath,
	lineargradient: LinearGradient,
	radialgradient: RadialGradient,
	marker: Marker,
	stop: Stop,
	image: Image
};
var SKIP_ELEMENTS = new Set([
	"script",
	"foreignobject",
	"filter",
	"mask",
	"pattern",
	"use",
	"symbol",
	"animate",
	"animatetransform",
	"animatemotion",
	"set"
]);
var TEXT_TYPES = new Set([Text, Tspan]);
function toCamelCase(str) {
	return str.replace(CAMEL_CASE_REGEX, (_, letter) => letter.toUpperCase());
}
function parseStyleAttribute(styleString) {
	if (!styleString) return {};
	const result = {};
	for (const declaration of styleString.split(";")) {
		const colonIndex = declaration.indexOf(":");
		if (colonIndex === -1) continue;
		const property = declaration.slice(0, colonIndex).trim();
		const value = declaration.slice(colonIndex + 1).trim();
		if (property && value) result[toCamelCase(property)] = value;
	}
	return result;
}
function convertAttributes(attributes) {
	const props = {};
	for (const [name, value] of Object.entries(attributes)) if (name === "style") Object.assign(props, parseStyleAttribute(value));
	else props[toCamelCase(name)] = value;
	return props;
}
function buildTree(tokens) {
	const stack = [];
	const tagNames = [];
	let root = null;
	let skipDepth = 0;
	for (const token of tokens) {
		if (token.type === "text") {
			if (skipDepth || stack.length === 0) continue;
			const parent = stack[stack.length - 1];
			if (!TEXT_TYPES.has(parent.type)) continue;
			const text = token.text.trim();
			if (text) parent.children.push({
				type: TextInstance,
				props: {},
				value: text
			});
			continue;
		}
		if (token.type === "close") {
			if (skipDepth) skipDepth--;
			else if (stack.length > 1) {
				if (tagNames[tagNames.length - 1] === token.tagName) {
					tagNames.pop();
					stack.pop();
				}
			}
			continue;
		}
		if (skipDepth) {
			if (token.type === "open") skipDepth++;
			continue;
		}
		const lowerTag = token.tagName.toLowerCase();
		if (SKIP_ELEMENTS.has(lowerTag)) {
			console.warn(`Unsupported SVG element: <${lowerTag}> will be skipped`);
			if (token.type === "open") skipDepth = 1;
			continue;
		}
		const mappedType = TAG_NAME_MAP[lowerTag];
		if (!mappedType) {
			if (token.type === "open") skipDepth = 1;
			continue;
		}
		const node = {
			type: mappedType,
			props: convertAttributes(token.attributes),
			children: []
		};
		if (stack.length > 0) stack[stack.length - 1].children.push(node);
		if (!root) root = node;
		if (token.type === "open") {
			tagNames.push(token.tagName);
			stack.push(node);
		}
	}
	return root;
}
var EMPTY_SVG = {
	type: "SVG",
	props: {},
	children: []
};
function parseSvg(svgString) {
	const root = buildTree(tokenize(svgString));
	if (!root) {
		console.warn("SVG parse error: failed to parse XML");
		return EMPTY_SVG;
	}
	return root;
}
//#endregion
//#region node_modules/@react-pdf/image/lib/index.js
var PNG = class {
	data;
	width;
	height;
	format;
	constructor(data) {
		const png = new PNG$1(data);
		this.data = data;
		this.width = png.width;
		this.height = png.height;
		this.format = "png";
	}
	static isValid(data) {
		return data && Buffer.isBuffer(data) && data[0] === 137 && data[1] === 80 && data[2] === 78 && data[3] === 71 && data[4] === 13 && data[5] === 10 && data[6] === 26 && data[7] === 10;
	}
};
var JPEG = class {
	data;
	width;
	height;
	format;
	constructor(data) {
		this.data = data;
		this.format = "jpeg";
		this.width = 0;
		this.height = 0;
		if (data.readUInt16BE(0) !== 65496) throw new Error("SOI not found in JPEG");
		const markers = src_default.decode(this.data);
		let orientation;
		for (let i = 0; i < markers.length; i += 1) {
			const marker = markers[i];
			if (marker.name === "EXIF" && marker.entries.orientation) orientation = marker.entries.orientation;
			if (marker.name === "SOF") {
				this.width ||= marker.width;
				this.height ||= marker.height;
			}
		}
		if (orientation > 4) [this.width, this.height] = [this.height, this.width];
	}
	static isValid(data) {
		return data && Buffer.isBuffer(data) && data.readUInt16BE(0) === 65496;
	}
};
var UNIT_TO_PT = {
	px: 72 / 96,
	pt: 1,
	in: 72,
	cm: 72 / 2.54,
	mm: 72 / 25.4
};
function parseNumber(value) {
	if (typeof value !== "string") return void 0;
	const match = value.match(/^(-?\d*\.?\d+)(px|pt|in|cm|mm)?$/);
	if (!match) return void 0;
	const num = parseFloat(match[1]);
	const unit = match[2];
	if (!unit) return num;
	return num * (UNIT_TO_PT[unit] ?? 1);
}
function parseViewBox(value) {
	if (typeof value !== "string") return void 0;
	const parts = value.trim().split(/[\s,]+/).map(Number);
	if (parts.length !== 4 || parts.some(isNaN)) return void 0;
	return {
		minX: parts[0],
		minY: parts[1],
		maxX: parts[2],
		maxY: parts[3]
	};
}
var SVG = class {
	data;
	width;
	height;
	format;
	constructor(data) {
		const parsed = parseSvg(data.toString("utf-8"));
		const viewBox = parseViewBox(parsed.props.viewBox);
		this.data = parsed;
		this.format = "svg";
		this.width = parseNumber(parsed.props.width) ?? viewBox?.maxX ?? 0;
		this.height = parseNumber(parsed.props.height) ?? viewBox?.maxY ?? 0;
	}
	static isValid(data) {
		if (!Buffer.isBuffer(data)) return false;
		const str = data.toString("utf-8").trimStart();
		return str.startsWith("<?xml") || str.startsWith("<svg");
	}
};
var createCache = ({ limit = 100 } = {}) => {
	let cache = /* @__PURE__ */ new Map();
	return {
		get: (key) => key ? cache.get(key) ?? void 0 : null,
		set: (key, value) => {
			cache.delete(key);
			if (cache.size >= limit) {
				const firstKey = cache.keys().next().value;
				cache.delete(firstKey);
			}
			cache.set(key, value);
		},
		reset: () => {
			cache = /* @__PURE__ */ new Map();
		},
		length: () => cache.size
	};
};
var IMAGE_CACHE = createCache({ limit: 30 });
var isBuffer = Buffer.isBuffer;
var isBlob = (src) => {
	return typeof Blob !== "undefined" && src instanceof Blob;
};
var isDataImageSrc = (src) => {
	return "data" in src;
};
var isDataUri = (imageSrc) => "uri" in imageSrc && imageSrc.uri.startsWith("data:");
var getAbsoluteLocalPath = (src) => {
	const { protocol, auth, host, port, hostname, path: pathname } = url.parse(src);
	const absolutePath = pathname ? path.resolve(src) : void 0;
	if (protocol && protocol !== "file:" || auth || host || port || hostname) return;
	return absolutePath;
};
var fetchLocalFile = (src) => new Promise((resolve, reject) => {
	try {
		const absolutePath = getAbsoluteLocalPath(src.uri);
		if (!absolutePath) {
			reject(/* @__PURE__ */ new Error(`Cannot fetch non-local path: ${src.uri}`));
			return;
		}
		fs.readFile(absolutePath, (err, data) => err ? reject(err) : resolve(data));
	} catch (err) {
		reject(err);
	}
});
var fetchRemoteFile = async (src) => {
	const { method = "GET", headers, body, credentials } = src;
	const buffer = await (await fetch(src.uri, {
		method,
		headers,
		body,
		credentials
	})).arrayBuffer();
	return Buffer.from(buffer);
};
var isValidFormat = (format) => {
	const lower = format.toLowerCase();
	return lower === "jpg" || lower === "jpeg" || lower === "png" || lower === "svg" || lower === "svg+xml";
};
var getImageFormat = (buffer) => {
	let format;
	if (JPEG.isValid(buffer)) format = "jpg";
	else if (PNG.isValid(buffer)) format = "png";
	else if (SVG.isValid(buffer)) format = "svg";
	return format;
};
function getImage(body, format) {
	switch (format.toLowerCase()) {
		case "jpg":
		case "jpeg": return new JPEG(body);
		case "png": return new PNG(body);
		case "svg":
		case "svg+xml": return new SVG(body);
		default: return null;
	}
}
var resolveBase64Image = async ({ uri }) => {
	const match = /^data:image\/([a-zA-Z+]*);base64,([^"]*)/g.exec(uri);
	if (!match) throw new Error(`Invalid base64 image: ${uri}`);
	const format = match[1];
	const data = match[2];
	if (!isValidFormat(format)) throw new Error(`Base64 image invalid format: ${format}`);
	return getImage(Buffer.from(data, "base64"), format);
};
var resolveImageFromData = async (src) => {
	if (src.data && src.format) return getImage(src.data, src.format);
	throw new Error(`Invalid data given for local file: ${JSON.stringify(src)}`);
};
var resolveBufferImage = async (buffer) => {
	const format = getImageFormat(buffer);
	if (format) return getImage(buffer, format);
	return null;
};
var resolveBlobImage = async (blob) => {
	const { type } = blob;
	if (!type || type === "application/octet-stream") {
		const arrayBuffer = await blob.arrayBuffer();
		return resolveBufferImage(Buffer.from(arrayBuffer));
	}
	if (!type.startsWith("image/")) throw new Error(`Invalid blob type: ${type}`);
	const format = type.replace("image/", "");
	if (!isValidFormat(format)) throw new Error(`Invalid blob type: ${type}`);
	const buffer = await blob.arrayBuffer();
	return getImage(Buffer.from(buffer), format);
};
var resolveImageFromUrl = async (src) => {
	const data = getAbsoluteLocalPath(src.uri) ? await fetchLocalFile(src) : await fetchRemoteFile(src);
	const format = getImageFormat(data);
	if (!format) throw new Error("Not valid image extension");
	return getImage(data, format);
};
var getCacheKey = (src) => {
	if (isBlob(src) || isBuffer(src)) return null;
	if (isDataImageSrc(src)) return src.data?.toString("base64") ?? null;
	return src.uri;
};
var resolveImage = (src, { cache = true } = {}) => {
	let image;
	const cacheKey = getCacheKey(src);
	if (isBlob(src)) image = resolveBlobImage(src);
	else if (isBuffer(src)) image = resolveBufferImage(src);
	else if (cache && IMAGE_CACHE.get(cacheKey)) return IMAGE_CACHE.get(cacheKey);
	else if (isDataUri(src)) image = resolveBase64Image(src);
	else if (isDataImageSrc(src)) image = resolveImageFromData(src);
	else image = resolveImageFromUrl(src);
	if (cache && cacheKey) IMAGE_CACHE.set(cacheKey, image);
	return image;
};
//#endregion
export { Select as C, Tspan as D, TextInstance as E, View as O, Rect as S, TextInput as T, Page as _, Defs as a, Polyline as b, FieldSet as c, Line as d, LinearGradient as f, Note as g, Marker as h, Circle as i, lib_exports as k, Image as l, List as m, Canvas as n, Document as o, Link as p, Checkbox as r, Ellipse as s, resolveImage as t, ImageBackground as u, Path as v, Text as w, RadialGradient as x, Polygon as y };
