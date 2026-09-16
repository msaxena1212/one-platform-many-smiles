import { i as __toESM, t as __commonJSMin } from "../../_runtime.mjs";
import { C as Select, D as Tspan, E as TextInstance, S as Rect, T as TextInput, b as Polyline, c as FieldSet, d as Line, f as LinearGradient, g as Note, i as Circle, l as Image, m as List, n as Canvas, p as Link, r as Checkbox, s as Ellipse, u as ImageBackground, v as Path, w as Text, x as RadialGradient, y as Polygon } from "./image+[...].mjs";
import { c as isNil, d as matchPercent } from "../react-pdf__fns.mjs";
import { n as cs } from "./layout+[...].mjs";
//#region node_modules/abs-svg-path/index.js
var require_abs_svg_path = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = absolutize;
	/**
	* redefine `path` with absolute coordinates
	*
	* @param {Array} path
	* @return {Array}
	*/
	function absolutize(path) {
		var startX = 0;
		var startY = 0;
		var x = 0;
		var y = 0;
		return path.map(function(seg) {
			seg = seg.slice();
			var type = seg[0];
			var command = type.toUpperCase();
			if (type != command) {
				seg[0] = command;
				switch (type) {
					case "a":
						seg[6] += x;
						seg[7] += y;
						break;
					case "v":
						seg[1] += y;
						break;
					case "h":
						seg[1] += x;
						break;
					default: for (var i = 1; i < seg.length;) {
						seg[i++] += x;
						seg[i++] += y;
					}
				}
			}
			switch (command) {
				case "Z":
					x = startX;
					y = startY;
					break;
				case "H":
					x = seg[1];
					break;
				case "V":
					y = seg[1];
					break;
				case "M":
					x = startX = seg[1];
					y = startY = seg[2];
					break;
				default:
					x = seg[seg.length - 2];
					y = seg[seg.length - 1];
			}
			return seg;
		});
	}
}));
//#endregion
//#region node_modules/parse-svg-path/index.js
var require_parse_svg_path = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = parse;
	/**
	* expected argument lengths
	* @type {Object}
	*/
	var length = {
		a: 7,
		c: 6,
		h: 1,
		l: 2,
		m: 2,
		q: 4,
		s: 4,
		t: 2,
		v: 1,
		z: 0
	};
	/**
	* segment pattern
	* @type {RegExp}
	*/
	var segment = /([astvzqmhlc])([^astvzqmhlc]*)/gi;
	/**
	* parse an svg path data string. Generates an Array
	* of commands where each command is an Array of the
	* form `[command, arg1, arg2, ...]`
	*
	* @param {String} path
	* @return {Array}
	*/
	function parse(path) {
		var data = [];
		path.replace(segment, function(_, command, args) {
			var type = command.toLowerCase();
			args = parseValues(args);
			if (type == "m" && args.length > 2) {
				data.push([command].concat(args.splice(0, 2)));
				type = "l";
				command = command == "m" ? "l" : "L";
			}
			while (true) {
				if (args.length == length[type]) {
					args.unshift(command);
					return data.push(args);
				}
				if (args.length < length[type]) throw new Error("malformed path data");
				data.push([command].concat(args.splice(0, length[type])));
			}
		});
		return data;
	}
	var number = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi;
	function parseValues(args) {
		var numbers = args.match(number);
		return numbers ? numbers.map(Number) : [];
	}
}));
//#endregion
//#region node_modules/svg-arc-to-cubic-bezier/modules/index.js
var import_abs_svg_path = /* @__PURE__ */ __toESM(require_abs_svg_path(), 1);
var import_parse_svg_path = /* @__PURE__ */ __toESM(require_parse_svg_path(), 1);
var _slicedToArray = function() {
	function sliceIterator(arr, i) {
		var _arr = [];
		var _n = true;
		var _d = false;
		var _e = void 0;
		try {
			for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
				_arr.push(_s.value);
				if (i && _arr.length === i) break;
			}
		} catch (err) {
			_d = true;
			_e = err;
		} finally {
			try {
				if (!_n && _i["return"]) _i["return"]();
			} finally {
				if (_d) throw _e;
			}
		}
		return _arr;
	}
	return function(arr, i) {
		if (Array.isArray(arr)) return arr;
		else if (Symbol.iterator in Object(arr)) return sliceIterator(arr, i);
		else throw new TypeError("Invalid attempt to destructure non-iterable instance");
	};
}();
var TAU = Math.PI * 2;
var mapToEllipse = function mapToEllipse(_ref, rx, ry, cosphi, sinphi, centerx, centery) {
	var x = _ref.x, y = _ref.y;
	x *= rx;
	y *= ry;
	var xp = cosphi * x - sinphi * y;
	var yp = sinphi * x + cosphi * y;
	return {
		x: xp + centerx,
		y: yp + centery
	};
};
var approxUnitArc = function approxUnitArc(ang1, ang2) {
	var a = ang2 === 1.5707963267948966 ? .551915024494 : ang2 === -1.5707963267948966 ? -.551915024494 : 4 / 3 * Math.tan(ang2 / 4);
	var x1 = Math.cos(ang1);
	var y1 = Math.sin(ang1);
	var x2 = Math.cos(ang1 + ang2);
	var y2 = Math.sin(ang1 + ang2);
	return [
		{
			x: x1 - y1 * a,
			y: y1 + x1 * a
		},
		{
			x: x2 + y2 * a,
			y: y2 - x2 * a
		},
		{
			x: x2,
			y: y2
		}
	];
};
var vectorAngle = function vectorAngle(ux, uy, vx, vy) {
	var sign = ux * vy - uy * vx < 0 ? -1 : 1;
	var dot = ux * vx + uy * vy;
	if (dot > 1) dot = 1;
	if (dot < -1) dot = -1;
	return sign * Math.acos(dot);
};
var getArcCenter = function getArcCenter(px, py, cx, cy, rx, ry, largeArcFlag, sweepFlag, sinphi, cosphi, pxp, pyp) {
	var rxsq = Math.pow(rx, 2);
	var rysq = Math.pow(ry, 2);
	var pxpsq = Math.pow(pxp, 2);
	var pypsq = Math.pow(pyp, 2);
	var radicant = rxsq * rysq - rxsq * pypsq - rysq * pxpsq;
	if (radicant < 0) radicant = 0;
	radicant /= rxsq * pypsq + rysq * pxpsq;
	radicant = Math.sqrt(radicant) * (largeArcFlag === sweepFlag ? -1 : 1);
	var centerxp = radicant * rx / ry * pyp;
	var centeryp = radicant * -ry / rx * pxp;
	var centerx = cosphi * centerxp - sinphi * centeryp + (px + cx) / 2;
	var centery = sinphi * centerxp + cosphi * centeryp + (py + cy) / 2;
	var vx1 = (pxp - centerxp) / rx;
	var vy1 = (pyp - centeryp) / ry;
	var vx2 = (-pxp - centerxp) / rx;
	var vy2 = (-pyp - centeryp) / ry;
	var ang1 = vectorAngle(1, 0, vx1, vy1);
	var ang2 = vectorAngle(vx1, vy1, vx2, vy2);
	if (sweepFlag === 0 && ang2 > 0) ang2 -= TAU;
	if (sweepFlag === 1 && ang2 < 0) ang2 += TAU;
	return [
		centerx,
		centery,
		ang1,
		ang2
	];
};
var arcToBezier = function arcToBezier(_ref2) {
	var px = _ref2.px, py = _ref2.py, cx = _ref2.cx, cy = _ref2.cy, rx = _ref2.rx, ry = _ref2.ry, _ref2$xAxisRotation = _ref2.xAxisRotation, xAxisRotation = _ref2$xAxisRotation === void 0 ? 0 : _ref2$xAxisRotation, _ref2$largeArcFlag = _ref2.largeArcFlag, largeArcFlag = _ref2$largeArcFlag === void 0 ? 0 : _ref2$largeArcFlag, _ref2$sweepFlag = _ref2.sweepFlag, sweepFlag = _ref2$sweepFlag === void 0 ? 0 : _ref2$sweepFlag;
	var curves = [];
	if (rx === 0 || ry === 0) return [];
	var sinphi = Math.sin(xAxisRotation * TAU / 360);
	var cosphi = Math.cos(xAxisRotation * TAU / 360);
	var pxp = cosphi * (px - cx) / 2 + sinphi * (py - cy) / 2;
	var pyp = -sinphi * (px - cx) / 2 + cosphi * (py - cy) / 2;
	if (pxp === 0 && pyp === 0) return [];
	rx = Math.abs(rx);
	ry = Math.abs(ry);
	var lambda = Math.pow(pxp, 2) / Math.pow(rx, 2) + Math.pow(pyp, 2) / Math.pow(ry, 2);
	if (lambda > 1) {
		rx *= Math.sqrt(lambda);
		ry *= Math.sqrt(lambda);
	}
	var _getArcCenter2 = _slicedToArray(getArcCenter(px, py, cx, cy, rx, ry, largeArcFlag, sweepFlag, sinphi, cosphi, pxp, pyp), 4), centerx = _getArcCenter2[0], centery = _getArcCenter2[1], ang1 = _getArcCenter2[2], ang2 = _getArcCenter2[3];
	var ratio = Math.abs(ang2) / (TAU / 4);
	if (Math.abs(1 - ratio) < 1e-7) ratio = 1;
	var segments = Math.max(Math.ceil(ratio), 1);
	ang2 /= segments;
	for (var i = 0; i < segments; i++) {
		curves.push(approxUnitArc(ang1, ang2));
		ang1 += ang2;
	}
	return curves.map(function(curve) {
		var _mapToEllipse = mapToEllipse(curve[0], rx, ry, cosphi, sinphi, centerx, centery), x1 = _mapToEllipse.x, y1 = _mapToEllipse.y;
		var _mapToEllipse2 = mapToEllipse(curve[1], rx, ry, cosphi, sinphi, centerx, centery), x2 = _mapToEllipse2.x, y2 = _mapToEllipse2.y;
		var _mapToEllipse3 = mapToEllipse(curve[2], rx, ry, cosphi, sinphi, centerx, centery);
		return {
			x1,
			y1,
			x2,
			y2,
			x: _mapToEllipse3.x,
			y: _mapToEllipse3.y
		};
	});
};
//#endregion
//#region node_modules/normalize-svg-path/index.mjs
function normalize(path) {
	var prev;
	var result = [];
	var bezierX = 0;
	var bezierY = 0;
	var startX = 0;
	var startY = 0;
	var quadX = null;
	var quadY = null;
	var x = 0;
	var y = 0;
	for (var i = 0, len = path.length; i < len; i++) {
		var seg = path[i];
		var command = seg[0];
		switch (command) {
			case "M":
				startX = seg[1];
				startY = seg[2];
				break;
			case "A":
				var curves = arcToBezier({
					px: x,
					py: y,
					cx: seg[6],
					cy: seg[7],
					rx: seg[1],
					ry: seg[2],
					xAxisRotation: seg[3],
					largeArcFlag: seg[4],
					sweepFlag: seg[5]
				});
				if (!curves.length) continue;
				for (var j = 0, c; j < curves.length; j++) {
					c = curves[j];
					seg = [
						"C",
						c.x1,
						c.y1,
						c.x2,
						c.y2,
						c.x,
						c.y
					];
					if (j < curves.length - 1) result.push(seg);
				}
				break;
			case "S":
				var cx = x;
				var cy = y;
				if (prev == "C" || prev == "S") {
					cx += cx - bezierX;
					cy += cy - bezierY;
				}
				seg = [
					"C",
					cx,
					cy,
					seg[1],
					seg[2],
					seg[3],
					seg[4]
				];
				break;
			case "T":
				if (prev == "Q" || prev == "T") {
					quadX = x * 2 - quadX;
					quadY = y * 2 - quadY;
				} else {
					quadX = x;
					quadY = y;
				}
				seg = quadratic(x, y, quadX, quadY, seg[1], seg[2]);
				break;
			case "Q":
				quadX = seg[1];
				quadY = seg[2];
				seg = quadratic(x, y, seg[1], seg[2], seg[3], seg[4]);
				break;
			case "L":
				seg = line(x, y, seg[1], seg[2]);
				break;
			case "H":
				seg = line(x, y, seg[1], y);
				break;
			case "V":
				seg = line(x, y, x, seg[1]);
				break;
			case "Z":
				seg = line(x, y, startX, startY);
				break;
		}
		prev = command;
		x = seg[seg.length - 2];
		y = seg[seg.length - 1];
		if (seg.length > 4) {
			bezierX = seg[seg.length - 4];
			bezierY = seg[seg.length - 3];
		} else {
			bezierX = x;
			bezierY = y;
		}
		result.push(seg);
	}
	return result;
}
function line(x1, y1, x2, y2) {
	return [
		"C",
		x1,
		y1,
		x2,
		y2,
		x2,
		y2
	];
}
function quadratic(x1, y1, cx, cy, x2, y2) {
	return [
		"C",
		x1 / 3 + 2 / 3 * cx,
		y1 / 3 + 2 / 3 * cy,
		x2 / 3 + 2 / 3 * cx,
		y2 / 3 + 2 / 3 * cy,
		x2,
		y2
	];
}
//#endregion
//#region node_modules/@react-pdf/render/lib/index.js
var renderPath = (ctx, node) => {
	if (node.props?.d) ctx.path(node.props.d);
};
var KAPPA$3 = 4 * ((Math.sqrt(2) - 1) / 3);
var renderRect = (ctx, node) => {
	const x = node.props?.x || 0;
	const y = node.props?.y || 0;
	const rx = node.props?.rx || 0;
	const ry = node.props?.ry || 0;
	const width = node.props?.width || 0;
	const height = node.props?.height || 0;
	if (!width || !height) return;
	if (rx && ry) {
		const krx = rx * KAPPA$3;
		const kry = ry * KAPPA$3;
		ctx.moveTo(x + rx, y);
		ctx.lineTo(x - rx + width, y);
		ctx.bezierCurveTo(x - rx + width + krx, y, x + width, y + ry - kry, x + width, y + ry);
		ctx.lineTo(x + width, y + height - ry);
		ctx.bezierCurveTo(x + width, y + height - ry + kry, x - rx + width + krx, y + height, x - rx + width, y + height);
		ctx.lineTo(x + rx, y + height);
		ctx.bezierCurveTo(x + rx - krx, y + height, x, y + height - ry + kry, x, y + height - ry);
		ctx.lineTo(x, y + ry);
		ctx.bezierCurveTo(x, y + ry - kry, x + rx - krx, y, x + rx, y);
	} else {
		ctx.moveTo(x, y);
		ctx.lineTo(x + width, y);
		ctx.lineTo(x + width, y + height);
		ctx.lineTo(x, y + height);
	}
	ctx.closePath();
};
var renderLine$1 = (ctx, node) => {
	const { x1, x2, y1, y2 } = node.props || {};
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
};
var renderGroup = () => {};
var KAPPA$2 = 4 * ((Math.sqrt(2) - 1) / 3);
var drawEllipse = (ctx, rx, ry, cx = 0, cy = 0) => {
	const x = cx - rx;
	const y = cy - ry;
	const ox = rx * KAPPA$2;
	const oy = ry * KAPPA$2;
	const xe = x + rx * 2;
	const ye = y + ry * 2;
	const xm = x + rx;
	const ym = y + ry;
	ctx.moveTo(x, ym);
	ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
	ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
	ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
	ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
	ctx.closePath();
};
var renderEllipse = (ctx, node) => {
	const { cx, cy, rx, ry } = node.props || {};
	drawEllipse(ctx, rx, ry, cx, cy);
};
var renderCircle = (ctx, node) => {
	const cx = node.props?.cx;
	const cy = node.props?.cy;
	const r = node.props?.r;
	drawEllipse(ctx, r, r, cx, cy);
};
var encodeGlyphs = (font, glyphs) => {
	if (font.subset) {
		const res = [];
		for (let i = 0; i < glyphs.length; i++) {
			const glyph = glyphs[i];
			const gid = font.subset.includeGlyph(glyph.id);
			res.push(`0000${gid.toString(16)}`.slice(-4));
			if (font.widths[gid] == null) font.widths[gid] = glyph.advanceWidth * font.scale;
			if (font.unicode[gid] == null) font.unicode[gid] = glyph.codePoints;
		}
		return res;
	}
	const res = [];
	for (const glyph of glyphs) res.push(`00${glyph.id.toString(16)}`.slice(-2));
	return res;
};
var number = (n) => {
	if (n > -1e21 && n < 1e21) return Math.round(n * 1e6) / 1e6;
	throw new Error(`unsupported number: ${n}`);
};
var _renderGlyphs = (ctx, encoded, positions, x, y) => {
	const commands = [];
	const scale = ctx._fontSize / 1e3;
	let i;
	let last = 0;
	let hadOffset = false;
	ctx.save();
	ctx.transform(1, 0, 0, -1, 0, ctx.page.height);
	y = ctx.page.height - y;
	if (ctx.page.fonts[ctx._font.id] == null) ctx.page.fonts[ctx._font.id] = ctx._font.ref();
	ctx.addContent("BT");
	ctx.addContent(`1 0 0 1 ${number(x)} ${number(y)} Tm`);
	ctx.addContent(`/${ctx._font.id} ${number(ctx._fontSize)} Tf`);
	const addSegment = (cur) => {
		if (last < cur) {
			const hex = encoded.slice(last, cur).join("");
			const advance = positions[cur - 1].xAdvance - positions[cur - 1].advanceWidth;
			commands.push(`<${hex}> ${number(-advance)}`);
		}
		return last = cur;
	};
	const flush = (s) => {
		addSegment(s);
		if (commands.length > 0) {
			ctx.addContent(`[${commands.join(" ")}] TJ`);
			return commands.length = 0;
		}
	};
	for (i = 0; i < positions.length; i += 1) {
		const pos = positions[i];
		if (pos.xOffset || pos.yOffset) {
			flush(i);
			ctx.addContent(`1 0 0 1 ${number(x + pos.xOffset * scale)} ${number(y + pos.yOffset * scale)} Tm`);
			flush(i + 1);
			hadOffset = true;
		} else {
			if (hadOffset) {
				ctx.addContent(`1 0 0 1 ${number(x)} ${number(y)} Tm`);
				hadOffset = false;
			}
			if (pos.xAdvance - pos.advanceWidth !== 0) addSegment(i + 1);
		}
		x += pos.xAdvance * scale;
	}
	flush(i);
	ctx.addContent("ET");
	return ctx.restore();
};
var renderGlyphs = (ctx, glyphs, positions, x, y) => {
	const scale = 1e3 / ctx._fontSize;
	const advanceWidthScale = 1e3 / (ctx._font.font.unitsPerEm || 1e3);
	return _renderGlyphs(ctx, encodeGlyphs(ctx._font, glyphs), positions.map((pos, i) => ({
		xAdvance: pos.xAdvance * scale,
		yAdvance: pos.yAdvance * scale,
		xOffset: pos.xOffset,
		yOffset: pos.yOffset,
		advanceWidth: glyphs[i].advanceWidth * advanceWidthScale
	})), x, y);
};
var renderRun$1 = (ctx, run) => {
	if (!run.glyphs) return;
	if (!run.positions) return;
	const runAdvanceWidth = run.xAdvance;
	const font = run.attributes.font?.[0];
	const { fontSize, color, opacity } = run.attributes;
	if (color) ctx.fillColor(color);
	ctx.fillOpacity(opacity);
	if (font) ctx.font(font.type === "STANDARD" ? font.fullName : font, fontSize);
	try {
		renderGlyphs(ctx, run.glyphs, run.positions, 0, 0);
	} catch (error) {
		console.log(error);
	}
	ctx.translate(runAdvanceWidth, 0);
};
var renderSpan = (ctx, line, textAnchor, dominantBaseline) => {
	ctx.save();
	const x = line.box?.x || 0;
	const y = line.box?.y || 0;
	const font = line.runs[0]?.attributes.font?.[0];
	const scale = line.runs[0]?.attributes?.scale || 1;
	const width = line.xAdvance;
	if (!font) return;
	const ascent = font.ascent * scale;
	const xHeight = font.xHeight * scale;
	const descent = font.descent * scale;
	const capHeight = font.capHeight * scale;
	let xTranslate = x;
	let yTranslate = y;
	switch (textAnchor) {
		case "middle":
			xTranslate = x - width / 2;
			break;
		case "end":
			xTranslate = x - width;
			break;
		default:
			xTranslate = x;
			break;
	}
	switch (dominantBaseline) {
		case "middle":
		case "central":
			yTranslate = y + capHeight / 2;
			break;
		case "hanging":
			yTranslate = y + capHeight;
			break;
		case "mathematical":
			yTranslate = y + xHeight;
			break;
		case "text-after-edge":
			yTranslate = y + descent;
			break;
		case "text-before-edge":
			yTranslate = y + ascent;
			break;
		default:
			yTranslate = y;
			break;
	}
	ctx.translate(xTranslate, yTranslate);
	line.runs.forEach((run) => renderRun$1(ctx, run));
	ctx.restore();
};
var renderSvgText = (ctx, node) => {
	node.children.forEach((span) => renderSpan(ctx, span.lines[0], span.props.textAnchor, span.props.dominantBaseline));
};
var pairs = (values) => {
	const result = [];
	for (let i = 0; i < values.length; i += 2) result.push([values[i], values[i + 1]]);
	return result;
};
/**
* Parse svg-like points into number arrays
*
* @param points string ex. "20,30 50,60"
* @returns points array ex. [[20, 30], [50, 60]]
*/
var parsePoints = (points) => {
	let values = (points || "").trim().replace(/,/g, " ").replace(/(\d)-(\d)/g, "$1 -$2").split(/\s+/);
	if (values.length % 2 !== 0) values = values.slice(0, -1);
	return pairs(values.map(parseFloat));
};
var drawPolyline = (ctx, points) => {
	if (points.length > 0) {
		ctx.moveTo(points[0][0], points[0][1]);
		points.slice(1).forEach((p) => ctx.lineTo(p[0], p[1]));
	}
};
var renderPolyline = (ctx, node) => {
	drawPolyline(ctx, parsePoints(node.props.points || ""));
};
var renderPolygon = (ctx, node) => {
	drawPolyline(ctx, parsePoints(node.props.points || ""));
	ctx.closePath();
};
var renderImage$1 = (ctx, node) => {
	if (!node.box) return;
	if (!node.image?.data) return;
	const { x = 0, y = 0 } = node.props;
	const { width, height, opacity } = node.style;
	const paddingTop = node.box.paddingLeft || 0;
	const paddingLeft = node.box.paddingLeft || 0;
	if (width === 0 || height === 0) {
		console.warn(`Image with src '${node.props.href}' skipped due to invalid dimensions`);
		return;
	}
	if (typeof width === "string" || typeof height === "string") {
		console.warn(`Image with src '${node.props.href}' skipped due to percentage width or height`);
		return;
	}
	ctx.save();
	ctx.fillOpacity(opacity || 1).image(node.image.data, x + paddingLeft, y + paddingTop, {
		width,
		height
	});
	ctx.restore();
};
var KAPPA$1 = 4 * ((Math.sqrt(2) - 1) / 3);
var clipNode = (ctx, node) => {
	if (!node.box) return;
	if (!node.style) return;
	const { top, left, width, height } = node.box;
	const { borderTopLeftRadius = 0, borderTopRightRadius = 0, borderBottomRightRadius = 0, borderBottomLeftRadius = 0 } = node.style;
	const rtr = Math.min(borderTopRightRadius, .5 * width, .5 * height);
	const ctr = rtr * (1 - KAPPA$1);
	ctx.moveTo(left + rtr, top);
	ctx.lineTo(left + width - rtr, top);
	ctx.bezierCurveTo(left + width - ctr, top, left + width, top + ctr, left + width, top + rtr);
	const rbr = Math.min(borderBottomRightRadius, .5 * width, .5 * height);
	const cbr = rbr * (1 - KAPPA$1);
	ctx.lineTo(left + width, top + height - rbr);
	ctx.bezierCurveTo(left + width, top + height - cbr, left + width - cbr, top + height, left + width - rbr, top + height);
	const rbl = Math.min(borderBottomLeftRadius, .5 * width, .5 * height);
	const cbl = rbl * (1 - KAPPA$1);
	ctx.lineTo(left + rbl, top + height);
	ctx.bezierCurveTo(left + cbl, top + height, left, top + height - cbl, left, top + height - rbl);
	const rtl = Math.min(borderTopLeftRadius, .5 * width, .5 * height);
	const ctl = rtl * (1 - KAPPA$1);
	ctx.lineTo(left, top + rtl);
	ctx.bezierCurveTo(left, top + ctl, left + ctl, top, left + rtl, top);
	ctx.closePath();
	ctx.clip();
};
var applySingleTransformation = (ctx, transform, origin) => {
	const { operation, value } = transform;
	switch (operation) {
		case "scale": {
			const [scaleX, scaleY] = value;
			ctx.scale(scaleX, scaleY, { origin });
			break;
		}
		case "rotate": {
			const [angle, cx, cy] = value;
			ctx.translate(cx, cy);
			ctx.rotate(angle, { origin });
			ctx.translate(-cx, -cy);
			break;
		}
		case "translate": {
			const [x, y = 0] = value;
			ctx.translate(x, y, { origin });
			break;
		}
		case "skew": {
			const [xAngle = 0, yAngle = 0] = value;
			const radx = xAngle * Math.PI / 180;
			const rady = yAngle * Math.PI / 180;
			const tanx = Math.tan(radx);
			const tany = Math.tan(rady);
			let x = 0;
			let y = 0;
			if (origin != null) {
				[x, y] = Array.from(origin);
				const x1 = x + tanx * y;
				const y1 = y + tany * x;
				x -= x1;
				y -= y1;
			}
			ctx.transform(1, tany, tanx, 1, x, y);
			break;
		}
		case "matrix":
			ctx.transform(...value);
			break;
		default: console.error(`Transform operation: '${operation}' doesn't supported`);
	}
};
var applyTransformations = (ctx, node) => {
	if (!node.origin) return;
	const { props, style } = node;
	const origin = [node.origin.left, node.origin.top];
	const propsTransform = "transform" in props ? props.transform : void 0;
	(style?.transform || propsTransform || []).forEach((operation) => {
		applySingleTransformation(ctx, operation, origin);
	});
};
var getPathBoundingBox = (node) => {
	const path = normalize((0, import_abs_svg_path.default)((0, import_parse_svg_path.default)(node.props?.d || "")));
	if (!path.length) return [
		0,
		0,
		0,
		0
	];
	const bounds = [
		Infinity,
		Infinity,
		-Infinity,
		-Infinity
	];
	for (let i = 0, l = path.length; i < l; i += 1) {
		const points = path[i].slice(1);
		for (let j = 0; j < points.length; j += 2) {
			if (points[j + 0] < bounds[0]) bounds[0] = points[j + 0];
			if (points[j + 1] < bounds[1]) bounds[1] = points[j + 1];
			if (points[j + 0] > bounds[2]) bounds[2] = points[j + 0];
			if (points[j + 1] > bounds[3]) bounds[3] = points[j + 1];
		}
	}
	return bounds;
};
var getCircleBoundingBox = (node) => {
	const r = node.props?.r || 0;
	const cx = node.props?.cx || 0;
	const cy = node.props?.cy || 0;
	return [
		cx - r,
		cy - r,
		cx + r,
		cy + r
	];
};
var getEllipseBoundingBox = (node) => {
	const cx = node.props?.cx || 0;
	const cy = node.props?.cy || 0;
	const rx = node.props?.rx || 0;
	const ry = node.props?.ry || 0;
	return [
		cx - rx,
		cy - ry,
		cx + rx,
		cy + ry
	];
};
var getLineBoundingBox = (node) => {
	const x1 = node.props?.x1 || 0;
	const y1 = node.props?.y1 || 0;
	const x2 = node.props?.x2 || 0;
	const y2 = node.props?.y2 || 0;
	return [
		Math.min(x1, x2),
		Math.min(y1, y2),
		Math.max(x1, x2),
		Math.max(y1, y2)
	];
};
var getRectBoundingBox = (node) => {
	const x = node.props?.x || 0;
	const y = node.props?.y || 0;
	const width = node.props?.width || 0;
	const height = node.props?.height || 0;
	return [
		x,
		y,
		x + width,
		y + height
	];
};
var max = (values) => Math.max(-Infinity, ...values);
var min = (values) => Math.min(Infinity, ...values);
var getPolylineBoundingBox = (node) => {
	const points = parsePoints(node.props?.points);
	const xValues = points.map((p) => p[0]);
	const yValues = points.map((p) => p[1]);
	return [
		min(xValues),
		min(yValues),
		max(xValues),
		max(yValues)
	];
};
var boundingBoxFns = {
	[Rect]: getRectBoundingBox,
	[Line]: getLineBoundingBox,
	[Path]: getPathBoundingBox,
	[Circle]: getCircleBoundingBox,
	[Ellipse]: getEllipseBoundingBox,
	[Polygon]: getPolylineBoundingBox,
	[Polyline]: getPolylineBoundingBox
};
var getBoundingBox = (node) => {
	const boundingBoxFn = boundingBoxFns[node.type];
	return boundingBoxFn ? boundingBoxFn(node) : [
		0,
		0,
		0,
		0
	];
};
var angleBetween = (x1, y1, x2, y2) => {
	return Math.atan2(y2 - y1, x2 - x1);
};
var bisectAngle = (inAngle, outAngle) => {
	let diff = outAngle - inAngle;
	while (diff > Math.PI) diff -= 2 * Math.PI;
	while (diff < -Math.PI) diff += 2 * Math.PI;
	return inAngle + diff / 2;
};
var getLineMarkerPoints = (node) => {
	const x1 = node.props?.x1 || 0;
	const y1 = node.props?.y1 || 0;
	const x2 = node.props?.x2 || 0;
	const y2 = node.props?.y2 || 0;
	const angle = angleBetween(x1, y1, x2, y2);
	return {
		start: {
			x: x1,
			y: y1,
			angle
		},
		end: {
			x: x2,
			y: y2,
			angle
		}
	};
};
var getPointListMarkerPoints = (points, closed) => {
	if (points.length === 0) return {};
	if (points.length === 1) return { start: {
		x: points[0][0],
		y: points[0][1],
		angle: 0
	} };
	const n = points.length;
	const result = {};
	const startOutAngle = angleBetween(points[0][0], points[0][1], points[1][0], points[1][1]);
	if (closed) {
		const startInAngle = angleBetween(points[n - 1][0], points[n - 1][1], points[0][0], points[0][1]);
		result.start = {
			x: points[0][0],
			y: points[0][1],
			angle: bisectAngle(startInAngle, startOutAngle)
		};
	} else result.start = {
		x: points[0][0],
		y: points[0][1],
		angle: startOutAngle
	};
	if (n > 2) {
		result.mid = [];
		for (let i = 1; i < n - 1; i++) {
			const inAngle = angleBetween(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1]);
			const outAngle = angleBetween(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
			result.mid.push({
				x: points[i][0],
				y: points[i][1],
				angle: bisectAngle(inAngle, outAngle)
			});
		}
	}
	const endInAngle = angleBetween(points[n - 2][0], points[n - 2][1], points[n - 1][0], points[n - 1][1]);
	if (closed) {
		const endOutAngle = angleBetween(points[n - 1][0], points[n - 1][1], points[0][0], points[0][1]);
		result.end = {
			x: points[n - 1][0],
			y: points[n - 1][1],
			angle: bisectAngle(endInAngle, endOutAngle)
		};
	} else result.end = {
		x: points[n - 1][0],
		y: points[n - 1][1],
		angle: endInAngle
	};
	return result;
};
var getPolylineMarkerPoints = (node) => {
	return getPointListMarkerPoints(parsePoints(node.props?.points), false);
};
var getPolygonMarkerPoints = (node) => {
	return getPointListMarkerPoints(parsePoints(node.props?.points), true);
};
var getPathMarkerPoints = (node) => {
	const d = node.props?.d;
	if (!d) return {};
	const path = normalize((0, import_abs_svg_path.default)((0, import_parse_svg_path.default)(d)));
	if (!path.length) return {};
	const vertices = [];
	let cx = 0;
	let cy = 0;
	for (let i = 0; i < path.length; i++) {
		const cmd = path[i];
		if (cmd[0] === "M") {
			cx = cmd[1];
			cy = cmd[2];
			vertices.push({
				x: cx,
				y: cy
			});
		} else if (cmd[0] === "C") {
			const cp1x = cmd[1];
			const cp1y = cmd[2];
			const cp2x = cmd[3];
			const cp2y = cmd[4];
			const ex = cmd[5];
			const ey = cmd[6];
			const prev = vertices[vertices.length - 1];
			if (prev) {
				const dx = cp1x - cx;
				const dy = cp1y - cy;
				if (Math.abs(dx) > 1e-6 || Math.abs(dy) > 1e-6) prev.outAngle = Math.atan2(dy, dx);
				else prev.outAngle = Math.atan2(ey - cy, ex - cx);
			}
			const dx2 = ex - cp2x;
			const dy2 = ey - cp2y;
			let inAngle;
			if (Math.abs(dx2) > 1e-6 || Math.abs(dy2) > 1e-6) inAngle = Math.atan2(dy2, dx2);
			else inAngle = Math.atan2(ey - cy, ex - cx);
			vertices.push({
				x: ex,
				y: ey,
				inAngle
			});
			cx = ex;
			cy = ey;
		}
	}
	if (vertices.length === 0) return {};
	if (vertices.length === 1) return { start: {
		x: vertices[0].x,
		y: vertices[0].y,
		angle: 0
	} };
	const n = vertices.length;
	const result = {};
	const startAngle = vertices[0].outAngle ?? 0;
	result.start = {
		x: vertices[0].x,
		y: vertices[0].y,
		angle: startAngle
	};
	if (n > 2) {
		result.mid = [];
		for (let i = 1; i < n - 1; i++) {
			const v = vertices[i];
			const inA = v.inAngle ?? 0;
			const outA = v.outAngle ?? inA;
			result.mid.push({
				x: v.x,
				y: v.y,
				angle: bisectAngle(inA, outA)
			});
		}
	}
	const endAngle = vertices[n - 1].inAngle ?? 0;
	result.end = {
		x: vertices[n - 1].x,
		y: vertices[n - 1].y,
		angle: endAngle
	};
	return result;
};
var markerPointFns = {
	[Line]: getLineMarkerPoints,
	[Polyline]: getPolylineMarkerPoints,
	[Polygon]: getPolygonMarkerPoints,
	[Path]: getPathMarkerPoints
};
var getMarkerPoints = (node) => {
	const fn = markerPointFns[node.type];
	return fn ? fn(node) : null;
};
var RAD_TO_DEG = 180 / Math.PI;
var DEFAULT_MARKER_WIDTH = 3;
var DEFAULT_MARKER_HEIGHT = 3;
var drawMarkerChildren = (ctx, node, drawNode) => {
	(node.children || []).forEach((child) => {
		ctx.save();
		drawNode(ctx, child);
		drawMarkerChildren(ctx, child, drawNode);
		ctx.restore();
	});
};
var renderMarkerInstance = (ctx, marker, point, strokeWidth, isStart, drawNode) => {
	const props = marker.props || {};
	const markerWidth = props.markerWidth ?? DEFAULT_MARKER_WIDTH;
	const markerHeight = props.markerHeight ?? DEFAULT_MARKER_HEIGHT;
	const refX = props.refX ?? 0;
	const refY = props.refY ?? 0;
	const orient = props.orient ?? 0;
	const markerUnits = props.markerUnits ?? "strokeWidth";
	const viewBox = props.viewBox;
	ctx.save();
	ctx.translate(point.x, point.y);
	if (orient === "auto") ctx.rotate(point.angle * RAD_TO_DEG);
	else if (orient === "auto-start-reverse") {
		const angle = isStart ? point.angle + Math.PI : point.angle;
		ctx.rotate(angle * RAD_TO_DEG);
	} else {
		const angle = typeof orient === "number" ? orient : 0;
		ctx.rotate(angle);
	}
	if (markerUnits === "strokeWidth") ctx.scale(strokeWidth, strokeWidth);
	if (viewBox) {
		const scaleX = markerWidth / viewBox.maxX;
		const scaleY = markerHeight / viewBox.maxY;
		ctx.scale(scaleX, scaleY);
		ctx.translate(-viewBox.minX - refX, -viewBox.minY - refY);
	} else ctx.translate(-refX, -refY);
	drawMarkerChildren(ctx, marker, drawNode);
	ctx.restore();
};
var hasMarkers = (node) => {
	if (!node.props) return false;
	return "markerStart" in node.props && !!node.props.markerStart || "markerMid" in node.props && !!node.props.markerMid || "markerEnd" in node.props && !!node.props.markerEnd;
};
var MARKER_TYPES = new Set([
	Line,
	Polyline,
	Polygon,
	Path
]);
var renderMarkers = (ctx, node, drawNode) => {
	if (!hasMarkers(node)) return;
	if (!MARKER_TYPES.has(node.type)) return;
	const points = getMarkerPoints(node);
	if (!points) return;
	const strokeWidth = "strokeWidth" in (node.props || {}) && node.props.strokeWidth || 1;
	const props = node.props || {};
	if ("markerStart" in props && props.markerStart && points.start) renderMarkerInstance(ctx, props.markerStart, points.start, strokeWidth, true, drawNode);
	if ("markerMid" in props && props.markerMid && points.mid) {
		const marker = props.markerMid;
		points.mid.forEach((point) => {
			renderMarkerInstance(ctx, marker, point, strokeWidth, false, drawNode);
		});
	}
	if ("markerEnd" in props && props.markerEnd && points.end) renderMarkerInstance(ctx, props.markerEnd, points.end, strokeWidth, false, drawNode);
};
var setStrokeWidth = (ctx, node) => {
	if (!node.props) return;
	if (!("strokeWidth" in node.props)) return;
	const lineWidth = node.props.strokeWidth;
	if (lineWidth) ctx.lineWidth(lineWidth);
};
var setStrokeColor = (ctx, node) => {
	if (!node.props) return;
	if (!("stroke" in node.props)) return;
	const strokeColor = node.props.stroke;
	if (strokeColor) ctx.strokeColor(strokeColor);
};
var setOpacity = (ctx, node) => {
	if (!node.props) return;
	if (!("opacity" in node.props)) return;
	const opacity = node.props.opacity;
	if (!isNil(opacity)) ctx.opacity(opacity);
};
var setFillOpacity = (ctx, node) => {
	if (!node.props) return;
	if (!("fillOpacity" in node.props)) return;
	const fillOpacity = node.props.fillOpacity || null;
	if (!isNil(fillOpacity)) ctx.fillOpacity(fillOpacity);
};
var setStrokeOpacity = (ctx, node) => {
	if (!node.props) return;
	if (!("strokeOpacity" in node.props)) return;
	const strokeOpacity = node.props?.strokeOpacity;
	if (!isNil(strokeOpacity)) ctx.strokeOpacity(strokeOpacity);
};
var setLineJoin = (ctx, node) => {
	if (!node.props) return;
	if (!("strokeLinejoin" in node.props)) return;
	const lineJoin = node.props.strokeLinejoin;
	if (lineJoin) ctx.lineJoin(lineJoin);
};
var setLineCap = (ctx, node) => {
	if (!node.props) return;
	if (!("strokeLinecap" in node.props)) return;
	const lineCap = node.props?.strokeLinecap;
	if (lineCap) ctx.lineCap(lineCap);
};
var setLineDash = (ctx, node) => {
	if (!node.props) return;
	if (!("strokeDasharray" in node.props)) return;
	const value = node.props?.strokeDasharray || null;
	if (value) ctx.dash(value.split(/[\s,]+/).map(Number));
};
var hasLinearGradientFill = (node) => {
	if (!node.props) return false;
	if (!("fill" in node.props)) return false;
	if (typeof node.props.fill === "string") return false;
	return node.props.fill?.type === LinearGradient;
};
var hasRadialGradientFill = (node) => {
	if (!node.props) return false;
	if (!("fill" in node.props)) return false;
	if (typeof node.props.fill === "string") return false;
	return node.props.fill?.type === RadialGradient;
};
function multiplyMatrices(m1, m2) {
	return [
		m1[0] * m2[0] + m1[2] * m2[1],
		m1[1] * m2[0] + m1[3] * m2[1],
		m1[0] * m2[2] + m1[2] * m2[3],
		m1[1] * m2[2] + m1[3] * m2[3],
		m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
		m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
	];
}
var transformGradient = (grad, transforms, bbox, units) => {
	const matrix = transforms.map((transform) => {
		switch (transform.operation) {
			case "scale": {
				const value = transform.value;
				return [
					value[0],
					0,
					0,
					value[1],
					0,
					0
				];
			}
			case "translate": {
				const value = transform.value;
				let x = value[0] || 0;
				let y = value[1] || 0;
				if (units === "objectBoundingBox") {
					x = (bbox[2] - bbox[0]) * x;
					y = (bbox[3] - bbox[1]) * y;
				}
				return [
					1,
					0,
					0,
					1,
					x,
					y
				];
			}
			case "rotate": {
				const value = transform.value;
				const cos = Math.cos(value[0]);
				const sin = Math.sin(value[0]);
				const cx = value[1] || 0;
				const cy = value[2] || 0;
				return [
					cos,
					sin,
					-sin,
					cos,
					cx * (1 - cos) + cy * sin,
					cy * (1 - cos) - cx * sin
				];
			}
			case "skew": {
				const value = transform.value;
				return [
					1,
					Math.tan(value[0]),
					Math.tan(value[1]),
					1,
					0,
					0
				];
			}
			case "matrix": {
				const value = transform.value;
				let x = value[4] || 0;
				let y = value[5] || 0;
				if (units === "objectBoundingBox") {
					x = (bbox[2] - bbox[0]) * x;
					y = (bbox[3] - bbox[1]) * y;
				}
				return [
					value[0],
					value[1],
					value[2],
					value[3],
					x,
					y
				];
			}
			default: return [
				1,
				0,
				0,
				1,
				0,
				0
			];
		}
	}).reduce(multiplyMatrices, [
		1,
		0,
		0,
		1,
		0,
		0
	]);
	grad.setTransform(...matrix);
};
var setLinearGradientFill = (ctx, node) => {
	if (!node.props) return;
	if (!("fill" in node.props)) return;
	const bbox = getBoundingBox(node);
	const gradient = node.props?.fill;
	if (!gradient) return;
	const units = gradient.props.gradientUnits || "objectBoundingBox";
	const transforms = gradient.props.gradientTransform || [];
	let x1 = gradient.props.x1 || 0;
	let y1 = gradient.props.y1 || 0;
	let x2 = gradient.props.x2 || 1;
	let y2 = gradient.props.y2 || 0;
	if (units === "objectBoundingBox") {
		const m0 = bbox[2] - bbox[0];
		const m3 = bbox[3] - bbox[1];
		const m4 = bbox[0];
		const m5 = bbox[1];
		x1 = m0 * x1 + m4;
		y1 = m3 * y1 + m5;
		x2 = m0 * x2 + m4;
		y2 = m3 * y2 + m5;
	}
	const grad = ctx.linearGradient(x1, y1, x2, y2);
	transformGradient(grad, transforms, bbox, units);
	gradient.children?.forEach((stop) => {
		grad.stop(stop.props.offset, stop.props.stopColor, stop.props.stopOpacity);
	});
	ctx.fill(grad);
};
var setRadialGradientFill = (ctx, node) => {
	if (!node.props) return;
	if (!("fill" in node.props)) return;
	const bbox = getBoundingBox(node);
	const gradient = node.props?.fill;
	if (!gradient) return;
	const units = gradient.props.gradientUnits || "objectBoundingBox";
	const transforms = gradient.props.gradientTransform || [];
	let r = gradient.props.r || .5;
	let cx = gradient.props.cx || .5;
	let cy = gradient.props.cy || .5;
	let fx = gradient.props.fx || cx;
	let fy = gradient.props.fy || cy;
	if (units === "objectBoundingBox") {
		const m0 = bbox[2] - bbox[0];
		const m3 = bbox[3] - bbox[1];
		const m4 = bbox[0];
		const m5 = bbox[1];
		r = r * m0;
		cx = m0 * cx + m4;
		cy = m3 * cy + m5;
		fx = m0 * fx + m4;
		fy = m3 * fy + m5;
	}
	const grad = ctx.radialGradient(cx, cy, 0, fx, fy, r);
	transformGradient(grad, transforms, bbox, units);
	gradient.children?.forEach((stop) => {
		grad.stop(stop.props.offset, stop.props.stopColor, stop.props.stopOpacity);
	});
	ctx.fill(grad);
};
var setFillColor = (ctx, node) => {
	if (!node.props) return;
	if (!("fill" in node.props)) return;
	const fillColor = node.props?.fill;
	if (fillColor) ctx.fillColor(fillColor);
};
var setFill = (ctx, node) => {
	if (hasLinearGradientFill(node)) return setLinearGradientFill(ctx, node);
	if (hasRadialGradientFill(node)) return setRadialGradientFill(ctx, node);
	return setFillColor(ctx, node);
};
var draw = (ctx, node) => {
	const props = node.props || {};
	if ("fill" in props && "stroke" in props && props.fill && props.stroke) ctx.fillAndStroke(props.fillRule);
	else if ("fill" in props && props.fill) ctx.fill(props.fillRule);
	else if ("stroke" in props && props.stroke) ctx.stroke();
	else {
		ctx.save();
		ctx.opacity(0);
		ctx.fill(null);
		ctx.restore();
	}
};
var noop = () => {};
var renderFns$1 = {
	[Tspan]: noop,
	[TextInstance]: noop,
	[Path]: renderPath,
	[Rect]: renderRect,
	[Line]: renderLine$1,
	["G"]: renderGroup,
	[Text]: renderSvgText,
	[Circle]: renderCircle,
	[Image]: renderImage$1,
	[Ellipse]: renderEllipse,
	[Polygon]: renderPolygon,
	[Polyline]: renderPolyline
};
var renderNode$1 = (ctx, node) => {
	const renderFn = renderFns$1[node.type];
	if (renderFn) renderFn(ctx, node);
	else console.warn(`SVG node of type ${node.type} is not currently supported`);
};
var drawNode = (ctx, node) => {
	setLineCap(ctx, node);
	setLineDash(ctx, node);
	setLineJoin(ctx, node);
	setStrokeWidth(ctx, node);
	setStrokeColor(ctx, node);
	setFill(ctx, node);
	setStrokeOpacity(ctx, node);
	setFillOpacity(ctx, node);
	setOpacity(ctx, node);
	applyTransformations(ctx, node);
	renderNode$1(ctx, node);
	draw(ctx, node);
};
var clipPath = (ctx, node) => {
	if (!node.props) return;
	if (!("clipPath" in node.props)) return;
	const value = node.props.clipPath;
	if (value) {
		(value.children || []).forEach((child) => renderNode$1(ctx, child));
		ctx.clip();
	}
};
var drawChildren = (ctx, node) => {
	(node.children || []).forEach((child) => {
		ctx.save();
		clipPath(ctx, child);
		drawNode(ctx, child);
		renderMarkers(ctx, child, drawNode);
		drawChildren(ctx, child);
		ctx.restore();
	});
};
var resolveAspectRatio = (ctx, node) => {
	if (!node.box) return;
	const { width, height } = node.box;
	const { viewBox, preserveAspectRatio } = node.props;
	const { meetOrSlice = "meet", align = "xMidYMid" } = preserveAspectRatio || {};
	if (viewBox == null || width == null || height == null) return;
	const x = viewBox?.minX || 0;
	const y = viewBox?.minY || 0;
	const logicalWidth = viewBox?.maxX || width;
	const logicalHeight = viewBox?.maxY || height;
	const logicalRatio = logicalWidth / logicalHeight;
	const physicalRatio = width / height;
	const scaleX = width / logicalWidth;
	const scaleY = height / logicalHeight;
	if (align === "none") {
		ctx.scale(scaleX, scaleY);
		ctx.translate(-x, -y);
		return;
	}
	if (logicalRatio < physicalRatio && meetOrSlice === "meet" || logicalRatio >= physicalRatio && meetOrSlice === "slice") {
		ctx.scale(scaleY, scaleY);
		switch (align) {
			case "xMinYMin":
			case "xMinYMid":
			case "xMinYMax":
				ctx.translate(-x, -y);
				break;
			case "xMidYMin":
			case "xMidYMid":
			case "xMidYMax":
				ctx.translate(-x - (logicalWidth - width * logicalHeight / height) / 2, -y);
				break;
			default: ctx.translate(-x - (logicalWidth - width * logicalHeight / height), -y);
		}
	} else {
		ctx.scale(scaleX, scaleX);
		switch (align) {
			case "xMinYMin":
			case "xMidYMin":
			case "xMaxYMin":
				ctx.translate(-x, -y);
				break;
			case "xMinYMid":
			case "xMidYMid":
			case "xMaxYMid":
				ctx.translate(-x, -y - (logicalHeight - height * logicalWidth / width) / 2);
				break;
			default: ctx.translate(-x, -y - (logicalHeight - height * logicalWidth / width));
		}
	}
};
var moveToOrigin = (ctx, node) => {
	if (!node.box) return;
	const { top, left } = node.box;
	const paddingLeft = node.box.paddingLeft || 0;
	const paddingTop = node.box.paddingTop || 0;
	ctx.translate(left + paddingLeft, top + paddingTop);
};
var renderSvg = (ctx, node) => {
	ctx.save();
	clipNode(ctx, node);
	moveToOrigin(ctx, node);
	resolveAspectRatio(ctx, node);
	drawChildren(ctx, node);
	ctx.restore();
};
var black = {
	value: "#000",
	opacity: 1
};
var hslToRgb = (h, s, l) => {
	const sNorm = s / 100;
	const lNorm = l / 100;
	const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
	const x = c * (1 - Math.abs(h / 60 % 2 - 1));
	const m = lNorm - c / 2;
	let r, g, b;
	if (h < 60) [r, g, b] = [
		c,
		x,
		0
	];
	else if (h < 120) [r, g, b] = [
		x,
		c,
		0
	];
	else if (h < 180) [r, g, b] = [
		0,
		c,
		x
	];
	else if (h < 240) [r, g, b] = [
		0,
		x,
		c
	];
	else if (h < 300) [r, g, b] = [
		x,
		0,
		c
	];
	else [r, g, b] = [
		c,
		0,
		x
	];
	return [
		Math.round((r + m) * 255),
		Math.round((g + m) * 255),
		Math.round((b + m) * 255)
	];
};
var hwbToRgb = (h, w, bl) => {
	const wNorm = w / 100;
	const blNorm = bl / 100;
	if (wNorm + blNorm >= 1) {
		const gray = Math.round(wNorm / (wNorm + blNorm) * 255);
		return [
			gray,
			gray,
			gray
		];
	}
	const [r, g, b] = hslToRgb(h, 100, 50);
	return [
		Math.round(r / 255 * (1 - wNorm - blNorm) * 255 + wNorm * 255),
		Math.round(g / 255 * (1 - wNorm - blNorm) * 255 + wNorm * 255),
		Math.round(b / 255 * (1 - wNorm - blNorm) * 255 + wNorm * 255)
	];
};
var parseColor = (hex) => {
	if (!hex) return black;
	const parsed = cs.get(hex);
	if (!parsed) return black;
	let r, g, b;
	if (parsed.model === "hsl") [r, g, b] = hslToRgb(parsed.value[0], parsed.value[1], parsed.value[2]);
	else if (parsed.model === "hwb") [r, g, b] = hwbToRgb(parsed.value[0], parsed.value[1], parsed.value[2]);
	else [r, g, b] = parsed.value;
	const value = cs.to.hex(r, g, b);
	const opacity = parsed.value[3];
	if (!value) return black;
	return {
		value,
		opacity
	};
};
var DEST_REGEXP = /^#.+/;
var isSrcId$1 = (src) => src.match(DEST_REGEXP);
var renderAttachment = (ctx, attachment) => {
	const { xOffset = 0, yOffset = 0, width, height, image } = attachment;
	ctx.translate(-width + xOffset, -height + yOffset);
	ctx.image(image, 0, 0, {
		fit: [width, height],
		align: "center",
		valign: "bottom"
	});
};
var renderAttachments = (ctx, run, glyphs) => {
	if (!glyphs) return;
	if (!run.positions) return;
	const font = run.attributes.font?.[0];
	if (!font) return;
	ctx.save();
	const space = font.glyphForCodePoint(32);
	const objectReplacement = font.glyphForCodePoint(65532);
	let attachmentAdvance = 0;
	for (let i = 0; i < glyphs.length; i += 1) {
		const position = run.positions[i];
		const glyph = glyphs[i];
		attachmentAdvance += position.xAdvance || 0;
		if (glyph.id === objectReplacement.id && run.attributes.attachment) {
			ctx.translate(attachmentAdvance, position.yOffset || 0);
			renderAttachment(ctx, run.attributes.attachment);
			glyphs[i] = space;
			attachmentAdvance = 0;
		}
	}
	ctx.restore();
};
var renderRun = (ctx, run) => {
	if (!run.glyphs) return;
	if (!run.positions) return;
	const font = run.attributes.font?.[0];
	if (!font) return;
	const { fontSize, link } = run.attributes;
	const color = parseColor(run.attributes.color);
	const opacity = isNil(run.attributes.opacity) ? color.opacity : run.attributes.opacity;
	const { height = 0, descent = 0, xAdvance = 0 } = run;
	ctx.fillColor(color.value);
	ctx.fillOpacity(opacity);
	if (link) if (isSrcId$1(link)) ctx.goTo(0, -height - descent, xAdvance, height, link.slice(1));
	else ctx.link(0, -height - descent, xAdvance, height, link);
	const glyphs = [...run.glyphs];
	renderAttachments(ctx, run, glyphs);
	ctx.font(font.type === "STANDARD" ? font.fullName : font, fontSize);
	try {
		renderGlyphs(ctx, glyphs, run.positions, 0, 0);
	} catch (error) {
		console.log(error);
	}
	ctx.translate(xAdvance, 0);
};
var renderBackground$1 = (ctx, rect, backgroundColor) => {
	const color = parseColor(backgroundColor);
	ctx.save();
	ctx.fillOpacity(color.opacity);
	ctx.rect(rect.x, rect.y, rect.width, rect.height);
	ctx.fill(color.value);
	ctx.restore();
};
var renderDecorationLine = (ctx, decorationLine) => {
	const color = parseColor(decorationLine.color);
	const opacity = isNil(decorationLine.opacity) ? color.opacity : decorationLine.opacity;
	ctx.save();
	ctx.lineWidth(decorationLine.rect.height);
	ctx.strokeOpacity(opacity);
	if (/dashed/.test(decorationLine.style)) ctx.dash(3 * decorationLine.rect.height, {});
	else if (/dotted/.test(decorationLine.style)) ctx.dash(decorationLine.rect.height, {});
	if (/wavy/.test(decorationLine.style)) {
		const dist = Math.max(2, decorationLine.rect.height);
		let step = 1.1 * dist;
		const stepCount = Math.floor(decorationLine.rect.width / (2 * step));
		const adjustment = (decorationLine.rect.width - stepCount * 2 * step) / stepCount / 2;
		step += adjustment;
		const cp1y = decorationLine.rect.y + dist;
		const cp2y = decorationLine.rect.y - dist;
		let { x } = decorationLine.rect;
		ctx.moveTo(decorationLine.rect.x, decorationLine.rect.y);
		for (let i = 0; i < stepCount; i += 1) {
			ctx.bezierCurveTo(x + step, cp1y, x + step, cp2y, x + 2 * step, decorationLine.rect.y);
			x += 2 * step;
		}
	} else {
		ctx.moveTo(decorationLine.rect.x, decorationLine.rect.y);
		ctx.lineTo(decorationLine.rect.x + decorationLine.rect.width, decorationLine.rect.y);
		if (/double/.test(decorationLine.style)) {
			ctx.moveTo(decorationLine.rect.x, decorationLine.rect.y + decorationLine.rect.height * 2);
			ctx.lineTo(decorationLine.rect.x + decorationLine.rect.width, decorationLine.rect.y + decorationLine.rect.height * 2);
		}
	}
	ctx.stroke(color.value);
	ctx.restore();
};
var renderLine = (ctx, line) => {
	if (!line.box) return;
	const lineAscent = line.ascent || 0;
	ctx.save();
	ctx.translate(line.box.x, line.box.y + lineAscent);
	for (let i = 0; i < line.runs.length; i += 1) {
		const run = line.runs[i];
		const isLastRun = i === line.runs.length - 1;
		if (run.attributes.backgroundColor) {
			const xAdvance = run.xAdvance ?? 0;
			const overflowRight = isLastRun ? line.overflowRight ?? 0 : 0;
			renderBackground$1(ctx, {
				x: 0,
				y: -lineAscent,
				height: line.box.height,
				width: xAdvance - overflowRight
			}, run.attributes.backgroundColor);
		}
		renderRun(ctx, run);
	}
	ctx.restore();
	ctx.save();
	ctx.translate(line.box.x, line.box.y);
	if (line.decorationLines) for (let i = 0; i < line.decorationLines.length; i += 1) {
		const decorationLine = line.decorationLines[i];
		renderDecorationLine(ctx, decorationLine);
	}
	ctx.restore();
};
var renderBlock = (ctx, block) => {
	block.forEach((line) => {
		renderLine(ctx, line);
	});
};
var renderText = (ctx, node) => {
	if (!node.box) return;
	if (!node.lines) return;
	const { top, left } = node.box;
	const blocks = [node.lines];
	const paddingTop = node.box?.paddingTop || 0;
	const paddingLeft = node.box?.paddingLeft || 0;
	const initialY = node.lines[0] ? node.lines[0].box.y : 0;
	const offsetX = node.alignOffset || 0;
	ctx.save();
	ctx.translate(left + paddingLeft - offsetX, top + paddingTop - initialY);
	blocks.forEach((block) => {
		renderBlock(ctx, block);
	});
	ctx.restore();
};
var renderPage = (ctx, node) => {
	if (!node.box) return;
	const { width, height } = node.box;
	const userUnit = (node.props?.dpi || 72) / 72;
	ctx.addPage({
		size: [width, height],
		margin: 0,
		userUnit
	});
};
var renderNote = (ctx, node) => {
	if (!node.box) return;
	const { top, left } = node.box;
	const value = node?.children?.[0].value || "";
	const color = node.style?.backgroundColor;
	ctx.note(left, top, 0, 0, value, { color });
};
var isNumeric = (n) => {
	return !Number.isNaN(parseFloat(n)) && Number.isFinite(n);
};
var applyContainObjectFit = (cw, ch, iw, ih, px, py) => {
	const cr = cw / ch;
	const ir = iw / ih;
	const pxp = matchPercent(px ?? null);
	const pyp = matchPercent(py ?? null);
	const pxv = pxp ? pxp.percent : .5;
	const pyv = pyp ? pyp.percent : .5;
	if (cr > ir) {
		const height = ch;
		const width = height * ir;
		const yOffset = isNumeric(py) ? py : 0;
		return {
			width,
			height,
			xOffset: isNumeric(px) ? px : (cw - width) * pxv,
			yOffset
		};
	}
	const width = cw;
	const height = width / ir;
	const xOffset = isNumeric(px) ? px : 0;
	return {
		width,
		height,
		yOffset: isNumeric(py) ? py : (ch - height) * pyv,
		xOffset
	};
};
var applyNoneObjectFit = (cw, ch, iw, ih, px, py) => {
	const width = iw;
	const height = ih;
	const pxp = matchPercent(px ?? null);
	const pyp = matchPercent(py ?? null);
	const pxv = pxp ? pxp.percent : .5;
	const pyv = pyp ? pyp.percent : .5;
	return {
		width,
		height,
		xOffset: isNumeric(px) ? px : (cw - width) * pxv,
		yOffset: isNumeric(py) ? py : (ch - height) * pyv
	};
};
var applyCoverObjectFit = (cw, ch, iw, ih, px, py) => {
	const ir = iw / ih;
	const cr = cw / ch;
	const pxp = matchPercent(px ?? null);
	const pyp = matchPercent(py ?? null);
	const pxv = pxp ? pxp.percent : .5;
	const pyv = pyp ? pyp.percent : .5;
	if (cr > ir) {
		const width = cw;
		const height = width / ir;
		const xOffset = isNumeric(px) ? px : 0;
		return {
			width,
			height,
			yOffset: isNumeric(py) ? py : (ch - height) * pyv,
			xOffset
		};
	}
	const height = ch;
	const width = height * ir;
	return {
		width,
		height,
		xOffset: isNumeric(px) ? px : (cw - width) * pxv,
		yOffset: isNumeric(py) ? py : 0
	};
};
var applyScaleDownObjectFit = (cw, ch, iw, ih, px, py) => {
	const containDimension = applyContainObjectFit(cw, ch, iw, ih, px, py);
	const noneDimension = applyNoneObjectFit(cw, ch, iw, ih, px, py);
	return containDimension.width < noneDimension.width ? containDimension : noneDimension;
};
var applyFillObjectFit = (cw, ch, px, py) => {
	return {
		width: cw,
		height: ch,
		xOffset: matchPercent(px ?? null) ? 0 : px || 0,
		yOffset: matchPercent(py ?? null) ? 0 : py || 0
	};
};
var resolveObjectFit = (type = "fill", cw, ch, iw, ih, px, py) => {
	switch (type) {
		case "contain": return applyContainObjectFit(cw, ch, iw, ih, px, py);
		case "cover": return applyCoverObjectFit(cw, ch, iw, ih, px, py);
		case "none": return applyNoneObjectFit(cw, ch, iw, ih, px, py);
		case "scale-down": return applyScaleDownObjectFit(cw, ch, iw, ih, px, py);
		default: return applyFillObjectFit(cw, ch, px, py);
	}
};
var drawImage = (ctx, options) => {
	const { x, y, width: containerWidth, height: containerHeight, image, opacity, objectFit, objectPositionX, objectPositionY, imageCache = /* @__PURE__ */ new Map() } = options;
	const { width, height, xOffset, yOffset } = resolveObjectFit(objectFit, containerWidth, containerHeight, image.width, image.height, objectPositionX, objectPositionY);
	if (!image.data) return;
	if (width === 0 || height === 0) return;
	const cacheKey = image.key;
	let embeddedImage = imageCache.get(cacheKey);
	if (!embeddedImage) {
		const src = image.data;
		embeddedImage = typeof src === "string" && ctx._imageRegistry[src] || ctx.openImage(src);
		if (!embeddedImage.obj) embeddedImage.embed(ctx);
	}
	if (cacheKey) imageCache.set(cacheKey, embeddedImage);
	const imageOpacity = isNil(opacity) ? 1 : opacity;
	ctx.fillOpacity(imageOpacity).image(embeddedImage, x + xOffset, y + yOffset, {
		width,
		height
	});
};
var renderImage = (ctx, node, options) => {
	if (!node.box) return;
	if (!node.image) return;
	const { left, top } = node.box;
	const paddingTop = node.box.paddingTop || 0;
	const paddingRight = node.box.paddingRight || 0;
	const paddingBottom = node.box.paddingBottom || 0;
	const paddingLeft = node.box.paddingLeft || 0;
	ctx.save();
	clipNode(ctx, node);
	drawImage(ctx, {
		x: left + paddingLeft,
		y: top + paddingTop,
		width: node.box.width - paddingLeft - paddingRight,
		height: node.box.height - paddingTop - paddingBottom,
		image: node.image,
		opacity: node.style?.opacity,
		objectFit: node.style?.objectFit,
		objectPositionX: node.style?.objectPositionX,
		objectPositionY: node.style?.objectPositionY,
		imageCache: options.imageCache
	});
	ctx.restore();
};
var renderImageBackground = (ctx, node, options) => {
	if (!node.box) return;
	if (!node.image) return;
	const { left, top } = node.box;
	const paddingTop = node.box.paddingTop || 0;
	const paddingRight = node.box.paddingRight || 0;
	const paddingBottom = node.box.paddingBottom || 0;
	const paddingLeft = node.box.paddingLeft || 0;
	ctx.save();
	clipNode(ctx, node);
	drawImage(ctx, {
		x: left + paddingLeft,
		y: top + paddingTop,
		width: node.box.width - paddingLeft - paddingRight,
		height: node.box.height - paddingTop - paddingBottom,
		image: node.image,
		opacity: node.style?.opacity,
		objectFit: node.style?.objectFit,
		objectPositionX: node.style?.objectPositionX,
		objectPositionY: node.style?.objectPositionY,
		imageCache: options.imageCache
	});
	ctx.restore();
};
var ZERO = {
	top: 0,
	bottom: 0,
	left: 0,
	right: 0
};
var resolveHitSlop = (hitSlop) => {
	if (!hitSlop) return ZERO;
	if (typeof hitSlop === "number") return {
		top: hitSlop,
		bottom: hitSlop,
		left: hitSlop,
		right: hitSlop
	};
	return {
		top: hitSlop.top ?? 0,
		bottom: hitSlop.bottom ?? 0,
		left: hitSlop.left ?? 0,
		right: hitSlop.right ?? 0
	};
};
var CONTENT_COLOR = "#a1c6e7";
var PADDING_COLOR = "#c4deb9";
var MARGIN_COLOR = "#f8cca1";
var HITSLOP_COLOR = "#d8b4fe";
var debugContent = (ctx, node) => {
	if (!node.box) return;
	const { left, top, width, height, paddingLeft = 0, paddingTop = 0, paddingRight = 0, paddingBottom = 0, borderLeftWidth = 0, borderTopWidth = 0, borderRightWidth = 0, borderBottomWidth = 0 } = node.box;
	ctx.fillColor(CONTENT_COLOR).opacity(.5).rect(left + paddingLeft + borderLeftWidth, top + paddingTop + borderTopWidth, width - paddingLeft - paddingRight - borderRightWidth - borderLeftWidth, height - paddingTop - paddingBottom - borderTopWidth - borderBottomWidth).fill();
};
var debugPadding = (ctx, node) => {
	if (!node.box) return;
	const { left, top, width, height, paddingLeft = 0, paddingTop = 0, paddingRight = 0, paddingBottom = 0, borderLeftWidth = 0, borderTopWidth = 0, borderRightWidth = 0, borderBottomWidth = 0 } = node.box;
	ctx.fillColor(PADDING_COLOR).opacity(.5);
	ctx.rect(left + paddingLeft + borderLeftWidth, top + borderTopWidth, width - paddingRight - paddingLeft - borderLeftWidth - borderRightWidth, paddingTop).fill();
	ctx.rect(left + borderLeftWidth, top + borderTopWidth, paddingLeft, height - borderTopWidth - borderBottomWidth).fill();
	ctx.rect(left + width - paddingRight - borderRightWidth, top + borderTopWidth, paddingRight, height - borderTopWidth - borderBottomWidth).fill();
	ctx.rect(left + paddingLeft + borderLeftWidth, top + height - paddingBottom - borderBottomWidth, width - paddingRight - paddingLeft - borderLeftWidth - borderRightWidth, paddingBottom).fill();
};
var debugMargin = (ctx, node) => {
	if (!node.box) return;
	const { left, top, width, height } = node.box;
	const { marginLeft = 0, marginTop = 0, marginRight = 0, marginBottom = 0 } = node.box;
	ctx.fillColor(MARGIN_COLOR).opacity(.5);
	ctx.rect(left, top - marginTop, width, marginTop).fill();
	ctx.rect(left - marginLeft, top - marginTop, marginLeft, height + marginTop + marginBottom).fill();
	ctx.rect(left + width, top - marginTop, marginRight, height + marginTop + marginBottom).fill();
	ctx.rect(left, top + height, width, marginBottom).fill();
};
var debugText = (ctx, node) => {
	if (!node.box) return;
	const { left, top, width, height } = node.box;
	const { marginLeft = 0, marginTop = 0, marginRight = 0, marginBottom = 0 } = node.box;
	const roundedWidth = Math.round(width + marginLeft + marginRight);
	const roundedHeight = Math.round(height + marginTop + marginBottom);
	ctx.fontSize(6).opacity(1).fillColor("black").text(`${roundedWidth} x ${roundedHeight}`, left - marginLeft, Math.max(top - marginTop - 4, 1), { width: Infinity });
};
var debugOrigin = (ctx, node) => {
	if (node.origin) ctx.circle(node.origin.left, node.origin.top, 3).fill("red").circle(node.origin.left, node.origin.top, 5).stroke("red");
};
var debugHitSlop = (ctx, node) => {
	if (!node.box || !node.props) return;
	if (!("hitSlop" in node.props)) return;
	const slop = resolveHitSlop(node.props.hitSlop);
	if (!slop.top && !slop.bottom && !slop.left && !slop.right) return;
	const { left, top, width, height } = node.box;
	ctx.fillColor(HITSLOP_COLOR).opacity(.35);
	if (slop.top) ctx.rect(left - slop.left, top - slop.top, width + slop.left + slop.right, slop.top).fill();
	if (slop.bottom) ctx.rect(left - slop.left, top + height, width + slop.left + slop.right, slop.bottom).fill();
	if (slop.left) ctx.rect(left - slop.left, top, slop.left, height).fill();
	if (slop.right) ctx.rect(left + width, top, slop.right, height).fill();
};
var renderDebug = (ctx, node) => {
	if (!node.props) return;
	if (!("debug" in node.props) || !node.props.debug) return;
	ctx.save();
	debugContent(ctx, node);
	debugPadding(ctx, node);
	debugMargin(ctx, node);
	debugHitSlop(ctx, node);
	debugText(ctx, node);
	debugOrigin(ctx, node);
	ctx.restore();
};
var availableMethods = [
	"dash",
	"clip",
	"save",
	"path",
	"fill",
	"font",
	"text",
	"rect",
	"scale",
	"moveTo",
	"lineTo",
	"stroke",
	"rotate",
	"circle",
	"lineCap",
	"opacity",
	"ellipse",
	"polygon",
	"restore",
	"lineJoin",
	"fontSize",
	"fillColor",
	"lineWidth",
	"translate",
	"miterLimit",
	"strokeColor",
	"fillOpacity",
	"roundedRect",
	"fillAndStroke",
	"strokeOpacity",
	"bezierCurveTo",
	"quadraticCurveTo",
	"linearGradient",
	"radialGradient"
];
var painter = (ctx) => {
	const p = availableMethods.reduce((acc, prop) => ({
		...acc,
		[prop]: (...args) => {
			ctx[prop](...args);
			return p;
		}
	}), {});
	return p;
};
var renderCanvas = (ctx, node) => {
	if (!node.box) return;
	const { top, left, width, height } = node.box;
	const paddingTop = node.box.paddingTop || 0;
	const paddingLeft = node.box.paddingLeft || 0;
	const paddingRight = node.box.paddingRight || 0;
	const paddingBottom = node.box.paddingBottom || 0;
	const availableWidth = width - paddingLeft - paddingRight;
	const availableHeight = height - paddingTop - paddingBottom;
	if (!availableWidth || !availableHeight) console.warn("Canvas element has null width or height. Please provide valid values via the `style` prop in order to correctly render it.");
	ctx.save().translate(left + paddingLeft, top + paddingTop);
	if (node.props.paint) node.props.paint(painter(ctx), availableWidth, availableHeight);
	ctx.restore();
};
var KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
var clipBorderTop = (ctx, layout, style, rtr, rtl) => {
	const { top, left, width, height } = layout;
	const { borderTopWidth, borderRightWidth, borderLeftWidth } = style;
	ctx.moveTo(left + rtl, top);
	ctx.lineTo(left + width - rtr, top);
	const c0 = rtr * (1 - KAPPA);
	ctx.bezierCurveTo(left + width - c0, top, left + width, top + c0, left + width, top + rtr);
	const topRightYCoord = top + Math.max(borderTopWidth, rtr);
	ctx.lineTo(left + width, topRightYCoord);
	ctx.lineTo(left + width - borderRightWidth, topRightYCoord);
	const innerTopRightRadiusX = Math.max(rtr - borderRightWidth, 0);
	const innerTopRightRadiusY = Math.max(rtr - borderTopWidth, 0);
	const c1 = innerTopRightRadiusX * (1 - KAPPA);
	const c2 = innerTopRightRadiusY * (1 - KAPPA);
	ctx.bezierCurveTo(left + width - borderRightWidth, top + borderTopWidth + c2, left + width - borderRightWidth - c1, top + borderTopWidth, left + width - borderRightWidth - innerTopRightRadiusX, top + borderTopWidth);
	ctx.lineTo(left + Math.max(rtl, borderLeftWidth), top + borderTopWidth);
	const innerTopLeftRadiusX = Math.max(rtl - borderLeftWidth, 0);
	const innerTopLeftRadiusY = Math.max(rtl - borderTopWidth, 0);
	const c3 = innerTopLeftRadiusX * (1 - KAPPA);
	const c4 = innerTopLeftRadiusY * (1 - KAPPA);
	const topLeftYCoord = top + Math.max(borderTopWidth, rtl);
	ctx.bezierCurveTo(left + borderLeftWidth + c3, top + borderTopWidth, left + borderLeftWidth, top + borderTopWidth + c4, left + borderLeftWidth, topLeftYCoord);
	ctx.lineTo(left, topLeftYCoord);
	ctx.lineTo(left, top + rtl);
	const c5 = rtl * (1 - KAPPA);
	ctx.bezierCurveTo(left, top + c5, left + c5, top, left + rtl, top);
	ctx.closePath();
	ctx.clip();
	if (borderRightWidth) {
		const trSlope = -borderTopWidth / borderRightWidth;
		ctx.moveTo(left + width / 2, trSlope * (-width / 2) + top);
		ctx.lineTo(left + width, top);
		ctx.lineTo(left, top);
		ctx.lineTo(left, top + height);
		ctx.closePath();
		ctx.clip();
	}
	if (borderLeftWidth) {
		const trSlope = -borderTopWidth / borderLeftWidth;
		ctx.moveTo(left + width / 2, trSlope * (-width / 2) + top);
		ctx.lineTo(left, top);
		ctx.lineTo(left + width, top);
		ctx.lineTo(left + width, top + height);
		ctx.closePath();
		ctx.clip();
	}
};
var fillBorderTop = (ctx, layout, style, rtr, rtl) => {
	const { top, left, width } = layout;
	const { borderTopColor, borderTopWidth, borderTopStyle, borderRightWidth, borderLeftWidth } = style;
	const c0 = rtl * (1 - KAPPA);
	const c1 = rtr * (1 - KAPPA);
	ctx.moveTo(left, top + Math.max(rtl, borderTopWidth));
	ctx.bezierCurveTo(left, top + c0, left + c0, top, left + rtl, top);
	ctx.lineTo(left + width - rtr, top);
	ctx.bezierCurveTo(left + width - c1, top, left + width, top + c1, left + width, top + rtr);
	ctx.strokeColor(borderTopColor);
	ctx.lineWidth(Math.max(borderRightWidth, borderTopWidth, borderLeftWidth) * 2);
	if (borderTopStyle === "dashed") ctx.dash(borderTopWidth * 2, { space: borderTopWidth * 1.2 });
	else if (borderTopStyle === "dotted") ctx.dash(borderTopWidth, { space: borderTopWidth * 1.2 });
	ctx.stroke();
	ctx.undash();
};
var clipBorderRight = (ctx, layout, style, rtr, rbr) => {
	const { top, left, width, height } = layout;
	const { borderTopWidth, borderRightWidth, borderBottomWidth } = style;
	ctx.moveTo(left + width, top + rtr);
	ctx.lineTo(left + width, top + height - rbr);
	const c0 = rbr * (1 - KAPPA);
	ctx.bezierCurveTo(left + width, top + height - c0, left + width - c0, top + height, left + width - rbr, top + height);
	const topBottomXCoord = left + width - Math.max(borderRightWidth, rbr);
	ctx.lineTo(topBottomXCoord, top + height);
	ctx.lineTo(topBottomXCoord, top + height - borderBottomWidth);
	const innerBottomRightRadiusX = Math.max(rbr - borderRightWidth, 0);
	const innerBottomRightRadiusY = Math.max(rbr - borderBottomWidth, 0);
	const c1 = innerBottomRightRadiusX * (1 - KAPPA);
	const c2 = innerBottomRightRadiusY * (1 - KAPPA);
	ctx.bezierCurveTo(left + width - borderRightWidth - c1, top + height - borderBottomWidth, left + width - borderRightWidth, top + height - borderBottomWidth - c2, left + width - borderRightWidth, top + height - Math.max(rbr, borderBottomWidth));
	ctx.lineTo(left + width - borderRightWidth, top + Math.max(rtr, borderTopWidth));
	const innerTopRightRadiusX = Math.max(rtr - borderRightWidth, 0);
	const innerTopRightRadiusY = Math.max(rtr - borderTopWidth, 0);
	const c3 = innerTopRightRadiusX * (1 - KAPPA);
	const c4 = innerTopRightRadiusY * (1 - KAPPA);
	const topRightXCoord = left + width - Math.max(rtr, borderRightWidth);
	ctx.bezierCurveTo(left + width - borderRightWidth, top + borderTopWidth + c4, left + width - borderRightWidth - c3, top + borderTopWidth, topRightXCoord, top + borderTopWidth);
	ctx.lineTo(topRightXCoord, top);
	ctx.lineTo(left + width - rtr, top);
	const c5 = rtr * (1 - KAPPA);
	ctx.bezierCurveTo(left + width - c5, top, left + width, top + c5, left + width, top + rtr);
	ctx.closePath();
	ctx.clip();
	if (borderTopWidth) {
		const trSlope = -borderTopWidth / borderRightWidth;
		ctx.moveTo(left + width / 2, trSlope * (-width / 2) + top);
		ctx.lineTo(left + width, top);
		ctx.lineTo(left + width, top + height);
		ctx.lineTo(left, top + height);
		ctx.closePath();
		ctx.clip();
	}
	if (borderBottomWidth) {
		const brSlope = borderBottomWidth / borderRightWidth;
		ctx.moveTo(left + width / 2, brSlope * (-width / 2) + top + height);
		ctx.lineTo(left + width, top + height);
		ctx.lineTo(left + width, top);
		ctx.lineTo(left, top);
		ctx.closePath();
		ctx.clip();
	}
};
var fillBorderRight = (ctx, layout, style, rtr, rbr) => {
	const { top, left, width, height } = layout;
	const { borderRightColor, borderRightStyle, borderRightWidth, borderTopWidth, borderBottomWidth } = style;
	const c0 = rbr * (1 - KAPPA);
	const c1 = rtr * (1 - KAPPA);
	ctx.moveTo(left + width - rtr, top);
	ctx.bezierCurveTo(left + width - c1, top, left + width, top + c1, left + width, top + rtr);
	ctx.lineTo(left + width, top + height - rbr);
	ctx.bezierCurveTo(left + width, top + height - c0, left + width - c0, top + height, left + width - rbr, top + height);
	ctx.strokeColor(borderRightColor);
	ctx.lineWidth(Math.max(borderRightWidth, borderTopWidth, borderBottomWidth) * 2);
	if (borderRightStyle === "dashed") ctx.dash(borderRightWidth * 2, { space: borderRightWidth * 1.2 });
	else if (borderRightStyle === "dotted") ctx.dash(borderRightWidth, { space: borderRightWidth * 1.2 });
	ctx.stroke();
	ctx.undash();
};
var clipBorderBottom = (ctx, layout, style, rbl, rbr) => {
	const { top, left, width, height } = layout;
	const { borderBottomWidth, borderRightWidth, borderLeftWidth } = style;
	ctx.moveTo(left + width - rbr, top + height);
	ctx.lineTo(left + rbl, top + height);
	const c0 = rbl * (1 - KAPPA);
	ctx.bezierCurveTo(left + c0, top + height, left, top + height - c0, left, top + height - rbl);
	const bottomLeftYCoord = top + height - Math.max(borderBottomWidth, rbl);
	ctx.lineTo(left, bottomLeftYCoord);
	ctx.lineTo(left + borderLeftWidth, bottomLeftYCoord);
	const innerBottomLeftRadiusX = Math.max(rbl - borderLeftWidth, 0);
	const innerBottomLeftRadiusY = Math.max(rbl - borderBottomWidth, 0);
	const c1 = innerBottomLeftRadiusX * (1 - KAPPA);
	const c2 = innerBottomLeftRadiusY * (1 - KAPPA);
	ctx.bezierCurveTo(left + borderLeftWidth, top + height - borderBottomWidth - c2, left + borderLeftWidth + c1, top + height - borderBottomWidth, left + borderLeftWidth + innerBottomLeftRadiusX, top + height - borderBottomWidth);
	ctx.lineTo(left + width - Math.max(rbr, borderRightWidth), top + height - borderBottomWidth);
	const innerBottomRightRadiusX = Math.max(rbr - borderRightWidth, 0);
	const innerBottomRightRadiusY = Math.max(rbr - borderBottomWidth, 0);
	const c3 = innerBottomRightRadiusX * (1 - KAPPA);
	const c4 = innerBottomRightRadiusY * (1 - KAPPA);
	const bottomRightYCoord = top + height - Math.max(borderBottomWidth, rbr);
	ctx.bezierCurveTo(left + width - borderRightWidth - c3, top + height - borderBottomWidth, left + width - borderRightWidth, top + height - borderBottomWidth - c4, left + width - borderRightWidth, bottomRightYCoord);
	ctx.lineTo(left + width, bottomRightYCoord);
	ctx.lineTo(left + width, top + height - rbr);
	const c5 = rbr * (1 - KAPPA);
	ctx.bezierCurveTo(left + width, top + height - c5, left + width - c5, top + height, left + width - rbr, top + height);
	ctx.closePath();
	ctx.clip();
	if (borderRightWidth) {
		const brSlope = borderBottomWidth / borderRightWidth;
		ctx.moveTo(left + width / 2, brSlope * (-width / 2) + top + height);
		ctx.lineTo(left + width, top + height);
		ctx.lineTo(left, top + height);
		ctx.lineTo(left, top);
		ctx.closePath();
		ctx.clip();
	}
	if (borderLeftWidth) {
		const trSlope = -borderBottomWidth / borderLeftWidth;
		ctx.moveTo(left + width / 2, trSlope * (width / 2) + top + height);
		ctx.lineTo(left, top + height);
		ctx.lineTo(left + width, top + height);
		ctx.lineTo(left + width, top);
		ctx.closePath();
		ctx.clip();
	}
};
var fillBorderBottom = (ctx, layout, style, rbl, rbr) => {
	const { top, left, width, height } = layout;
	const { borderBottomColor, borderBottomStyle, borderBottomWidth, borderRightWidth, borderLeftWidth } = style;
	const c0 = rbl * (1 - KAPPA);
	const c1 = rbr * (1 - KAPPA);
	ctx.moveTo(left + width, top + height - rbr);
	ctx.bezierCurveTo(left + width, top + height - c1, left + width - c1, top + height, left + width - rbr, top + height);
	ctx.lineTo(left + rbl, top + height);
	ctx.bezierCurveTo(left + c0, top + height, left, top + height - c0, left, top + height - rbl);
	ctx.strokeColor(borderBottomColor);
	ctx.lineWidth(Math.max(borderBottomWidth, borderRightWidth, borderLeftWidth) * 2);
	if (borderBottomStyle === "dashed") ctx.dash(borderBottomWidth * 2, { space: borderBottomWidth * 1.2 });
	else if (borderBottomStyle === "dotted") ctx.dash(borderBottomWidth, { space: borderBottomWidth * 1.2 });
	ctx.stroke();
	ctx.undash();
};
var clipBorderLeft = (ctx, layout, style, rbl, rtl) => {
	const { top, left, width, height } = layout;
	const { borderTopWidth, borderLeftWidth, borderBottomWidth } = style;
	ctx.moveTo(left, top + height - rbl);
	ctx.lineTo(left, top + rtl);
	const c0 = rtl * (1 - KAPPA);
	ctx.bezierCurveTo(left, top + c0, left + c0, top, left + rtl, top);
	const topLeftCoordX = left + Math.max(borderLeftWidth, rtl);
	ctx.lineTo(topLeftCoordX, top);
	ctx.lineTo(topLeftCoordX, top + borderTopWidth);
	const innerTopLeftRadiusX = Math.max(rtl - borderLeftWidth, 0);
	const innerTopLeftRadiusY = Math.max(rtl - borderTopWidth, 0);
	const c1 = innerTopLeftRadiusX * (1 - KAPPA);
	const c2 = innerTopLeftRadiusY * (1 - KAPPA);
	ctx.bezierCurveTo(left + borderLeftWidth + c1, top + borderTopWidth, left + borderLeftWidth, top + borderTopWidth + c2, left + borderLeftWidth, top + Math.max(rtl, borderTopWidth));
	ctx.lineTo(left + borderLeftWidth, top + height - Math.max(rbl, borderBottomWidth));
	const innerBottomLeftRadiusX = Math.max(rbl - borderLeftWidth, 0);
	const innerBottomLeftRadiusY = Math.max(rbl - borderBottomWidth, 0);
	const c3 = innerBottomLeftRadiusX * (1 - KAPPA);
	const c4 = innerBottomLeftRadiusY * (1 - KAPPA);
	const bottomLeftXCoord = left + Math.max(rbl, borderLeftWidth);
	ctx.bezierCurveTo(left + borderLeftWidth, top + height - borderBottomWidth - c4, left + borderLeftWidth + c3, top + height - borderBottomWidth, bottomLeftXCoord, top + height - borderBottomWidth);
	ctx.lineTo(bottomLeftXCoord, top + height);
	ctx.lineTo(left + rbl, top + height);
	const c5 = rbl * (1 - KAPPA);
	ctx.bezierCurveTo(left + c5, top + height, left, top + height - c5, left, top + height - rbl);
	ctx.closePath();
	ctx.clip();
	if (borderBottomWidth) {
		const trSlope = -borderBottomWidth / borderLeftWidth;
		ctx.moveTo(left + width / 2, trSlope * (width / 2) + top + height);
		ctx.lineTo(left, top + height);
		ctx.lineTo(left, top);
		ctx.lineTo(left + width, top);
		ctx.closePath();
		ctx.clip();
	}
	if (borderTopWidth) {
		const trSlope = -borderTopWidth / borderLeftWidth;
		ctx.moveTo(left + width / 2, trSlope * (-width / 2) + top);
		ctx.lineTo(left, top);
		ctx.lineTo(left, top + height);
		ctx.lineTo(left + width, top + height);
		ctx.closePath();
		ctx.clip();
	}
};
var fillBorderLeft = (ctx, layout, style, rbl, rtl) => {
	const { top, left, height } = layout;
	const { borderLeftColor, borderLeftStyle, borderLeftWidth, borderTopWidth, borderBottomWidth } = style;
	const c0 = rbl * (1 - KAPPA);
	const c1 = rtl * (1 - KAPPA);
	ctx.moveTo(left + rbl, top + height);
	ctx.bezierCurveTo(left + c0, top + height, left, top + height - c0, left, top + height - rbl);
	ctx.lineTo(left, top + rtl);
	ctx.bezierCurveTo(left, top + c1, left + c1, top, left + rtl, top);
	ctx.strokeColor(borderLeftColor);
	ctx.lineWidth(Math.max(borderLeftWidth, borderTopWidth, borderBottomWidth) * 2);
	if (borderLeftStyle === "dashed") ctx.dash(borderLeftWidth * 2, { space: borderLeftWidth * 1.2 });
	else if (borderLeftStyle === "dotted") ctx.dash(borderLeftWidth, { space: borderLeftWidth * 1.2 });
	ctx.stroke();
	ctx.undash();
};
var shouldRenderBorders = (node) => node.box && (node.box.borderTopWidth || node.box.borderRightWidth || node.box.borderBottomWidth || node.box.borderLeftWidth);
var renderBorders = (ctx, node) => {
	if (!node.box) return;
	if (!shouldRenderBorders(node)) return;
	const { width, height, borderTopWidth = 0, borderLeftWidth = 0, borderRightWidth = 0, borderBottomWidth = 0 } = node.box;
	const { opacity = 1, borderTopColor = "black", borderTopStyle = "solid", borderLeftColor = "black", borderLeftStyle = "solid", borderRightColor = "black", borderRightStyle = "solid", borderBottomColor = "black", borderBottomStyle = "solid" } = node.style;
	const borderTopLeftRadius = node.style.borderTopLeftRadius || 0;
	const borderTopRightRadius = node.style.borderTopRightRadius || 0;
	const borderBottomLeftRadius = node.style.borderBottomLeftRadius || 0;
	const borderBottomRightRadius = node.style.borderBottomRightRadius || 0;
	const style = {
		borderTopColor,
		borderTopWidth,
		borderTopStyle,
		borderLeftColor,
		borderLeftWidth,
		borderLeftStyle,
		borderRightColor,
		borderRightWidth,
		borderRightStyle,
		borderBottomColor,
		borderBottomWidth,
		borderBottomStyle
	};
	const rtr = Math.min(borderTopRightRadius, .5 * width, .5 * height);
	const rtl = Math.min(borderTopLeftRadius, .5 * width, .5 * height);
	const rbr = Math.min(borderBottomRightRadius, .5 * width, .5 * height);
	const rbl = Math.min(borderBottomLeftRadius, .5 * width, .5 * height);
	ctx.save();
	ctx.strokeOpacity(opacity);
	if (borderTopWidth) {
		ctx.save();
		clipBorderTop(ctx, node.box, style, rtr, rtl);
		fillBorderTop(ctx, node.box, style, rtr, rtl);
		ctx.restore();
	}
	if (borderRightWidth) {
		ctx.save();
		clipBorderRight(ctx, node.box, style, rtr, rbr);
		fillBorderRight(ctx, node.box, style, rtr, rbr);
		ctx.restore();
	}
	if (borderBottomWidth) {
		ctx.save();
		clipBorderBottom(ctx, node.box, style, rbl, rbr);
		fillBorderBottom(ctx, node.box, style, rbl, rbr);
		ctx.restore();
	}
	if (borderLeftWidth) {
		ctx.save();
		clipBorderLeft(ctx, node.box, style, rbl, rtl);
		fillBorderLeft(ctx, node.box, style, rbl, rtl);
		ctx.restore();
	}
	ctx.restore();
};
var drawBackground = (ctx, node) => {
	if (!node.box) return;
	const { top, left, width, height } = node.box;
	const color = parseColor(node.style.backgroundColor);
	const nodeOpacity = isNil(node.style?.opacity) ? 1 : node.style.opacity;
	const opacity = Math.min(color.opacity, nodeOpacity);
	ctx.fillOpacity(opacity).fillColor(color.value).rect(left, top, width, height).fill();
};
var renderBackground = (ctx, node) => {
	if (!!node.box && !!node.style?.backgroundColor) {
		ctx.save();
		clipNode(ctx, node);
		drawBackground(ctx, node);
		ctx.restore();
	}
};
var isString = (value) => typeof value === "string";
var isSrcId = (value) => /^#.+/.test(value);
var renderLink = (ctx, node, src) => {
	if (!src || !node.box) return;
	const isId = isSrcId(src);
	const method = isId ? "goTo" : "link";
	const value = isId ? src.slice(1) : src;
	const { top, left, width, height } = node.box;
	const props = node.props || {};
	const slop = resolveHitSlop("hitSlop" in props ? props.hitSlop : void 0);
	ctx[method](left - slop.left, top - slop.top, width + slop.left + slop.right, height + slop.top + slop.bottom, value);
};
var setLink = (ctx, node) => {
	const props = node.props || {};
	if ("src" in props && isString(props.src)) return renderLink(ctx, node, props.src);
	if ("href" in props && isString(props.href)) return renderLink(ctx, node, props.href);
};
var setDestination = (ctx, node) => {
	if (!node.box) return;
	if (!node.props) return;
	if ("id" in node.props) ctx.addNamedDestination(node.props.id, "XYZ", null, node.box.top, null);
};
var clean = (options) => {
	const opt = { ...options };
	Object.entries(opt).forEach((pair) => {
		if (!pair[1]) delete opt[pair[0]];
	});
	return opt;
};
var parseCommonFormOptions = (node) => {
	return {
		required: node.props?.required || false,
		noExport: node.props?.noExport || false,
		readOnly: node.props?.readOnly || false,
		value: node.props?.value || void 0,
		defaultValue: node.props?.defaultValue || void 0
	};
};
var parseTextInputOptions = (node, fieldSet) => {
	return clean({
		...parseCommonFormOptions(node),
		parent: fieldSet || void 0,
		align: node.props?.align || "left",
		multiline: node.props?.multiline || void 0,
		password: node.props?.password || false,
		noSpell: node.props?.noSpell || false,
		format: node.props?.format || void 0,
		fontSize: node.props?.fontSize || void 0,
		MaxLen: node.props?.maxLength || void 0
	});
};
var parseSelectAndListFieldOptions = (node) => {
	return clean({
		...parseCommonFormOptions(node),
		sort: node.props?.sort || false,
		edit: node.props?.edit || false,
		multiSelect: node.props?.multiSelect || false,
		noSpell: node.props?.noSpell || false,
		select: node.props?.select || [""]
	});
};
var getAppearance = (ctx, codepoint, width, height) => {
	const appearance = ctx.ref({
		Type: "XObject",
		Subtype: "Form",
		BBox: [
			0,
			0,
			width,
			height
		],
		Resources: {
			ProcSet: [
				"PDF",
				"Text",
				"ImageB",
				"ImageC",
				"ImageI"
			],
			Font: { ZaDi: ctx._acroform.fonts.ZaDi }
		}
	});
	appearance.initDeflate();
	appearance.write(`/Tx BMC\nq\n/ZaDi ${height * .8} Tf\nBT\n${width * .45} ${height / 4} Td (${codepoint}) Tj\nET\nQ\nEMC`);
	appearance.end(null);
	return appearance;
};
var parseCheckboxOptions = (ctx, node, fieldSet) => {
	const { width, height } = node.box || {};
	const onOption = node.props?.onState || "Yes";
	const offOption = node.props?.offState || "Off";
	const xMark = node.props?.xMark || false;
	if (!Object.prototype.hasOwnProperty.call(ctx._acroform.fonts, "ZaDi")) {
		const ref = ctx.ref({
			Type: "Font",
			Subtype: "Type1",
			BaseFont: "ZapfDingbats"
		});
		ctx._acroform.fonts.ZaDi = ref;
		ref.end(null);
	}
	const normalAppearance = {
		[onOption]: getAppearance(ctx, xMark ? "8" : "4", width, height),
		[offOption]: getAppearance(ctx, xMark ? " " : "8", width, height)
	};
	return clean({
		...parseCommonFormOptions(node),
		backgroundColor: node.props?.backgroundColor || void 0,
		borderColor: node.props?.borderColor || void 0,
		parent: fieldSet || void 0,
		value: `/${node.props?.checked === true ? onOption : offOption}`,
		defaultValue: `/${node.props?.checked === true ? onOption : offOption}`,
		AS: node.props?.checked === true ? onOption : offOption,
		AP: {
			N: normalAppearance,
			D: normalAppearance
		}
	});
};
var renderTextInput = (ctx, node, options) => {
	if (!node.box) return;
	const { top, left, width, height } = node.box;
	const name = node.props?.name || "";
	const fieldSetOptions = options.fieldSets?.at(0);
	if (!ctx._root.data.AcroForm) ctx.initForm();
	ctx.formText(name, left, top, width, height, parseTextInputOptions(node, fieldSetOptions));
};
var renderSelect = (ctx, node) => {
	if (!node.box) return;
	const { top, left, width, height } = node.box;
	const name = node.props?.name || "";
	if (!ctx._root.data.AcroForm) ctx.initForm();
	ctx.formCombo(name, left, top, width, height, parseSelectAndListFieldOptions(node));
};
var renderFieldSet = (ctx, node, options) => {
	const name = node.props?.name || "";
	if (!ctx._root.data.AcroForm) ctx.initForm();
	const formField = ctx.formField(name);
	const option = options;
	if (!option.fieldSets) option.fieldSets = [formField];
	else option.fieldSets.push(formField);
};
var cleanUpFieldSet = (_ctx, _node, options) => {
	options.fieldSets.pop();
};
var renderList = (ctx, node) => {
	if (!node.box) return;
	const { top, left, width, height } = node.box || {};
	const name = "name" in node.props ? node.props.name || "" : "";
	if (!ctx._root.data.AcroForm) ctx.initForm();
	ctx.formList(name, left, top, width, height, parseSelectAndListFieldOptions(node));
};
var renderCheckbox = (ctx, node, options) => {
	if (!node.box) return;
	const { top, left, width, height } = node.box;
	const name = node.props?.name || "";
	const fieldSetOptions = options.fieldSets?.at(0);
	if (!ctx._root.data.AcroForm) ctx.initForm();
	ctx.formCheckbox(name, left, top, width, height, parseCheckboxOptions(ctx, node, fieldSetOptions));
};
var isRecursiveNode = (node) => node.type !== "TEXT" && node.type !== "SVG";
var renderChildren = (ctx, node, options) => {
	ctx.save();
	if (node.box) ctx.translate(node.box.left, node.box.top);
	const children = node.children || [];
	const renderChild = (child) => renderNode(ctx, child, options);
	children.forEach(renderChild);
	ctx.restore();
};
var renderFns = {
	[Text]: renderText,
	[Note]: renderNote,
	[Image]: renderImage,
	[ImageBackground]: renderImageBackground,
	[FieldSet]: renderFieldSet,
	[TextInput]: renderTextInput,
	[Select]: renderSelect,
	[Checkbox]: renderCheckbox,
	[List]: renderList,
	[Canvas]: renderCanvas,
	["SVG"]: renderSvg,
	[Link]: setLink
};
var cleanUpFns = { [FieldSet]: cleanUpFieldSet };
var renderNode = (ctx, node, options) => {
	const overflowHidden = node.style?.overflow === "hidden";
	const shouldRenderChildren = isRecursiveNode(node);
	if (node.type === "PAGE") renderPage(ctx, node);
	ctx.save();
	if (overflowHidden) clipNode(ctx, node);
	applyTransformations(ctx, node);
	renderBackground(ctx, node);
	renderBorders(ctx, node);
	const renderFn = renderFns[node.type];
	if (renderFn) renderFn(ctx, node, options);
	if (shouldRenderChildren) renderChildren(ctx, node, options);
	const cleanUpFn = cleanUpFns[node.type];
	if (cleanUpFn) cleanUpFn(ctx, node, options);
	setDestination(ctx, node);
	renderDebug(ctx, node);
	ctx.restore();
};
var addNodeBookmark = (ctx, node, pageNumber, registry) => {
	if (!node.box) return;
	if (!node.props) return;
	if ("bookmark" in node.props && node.props.bookmark) {
		const bookmark = node.props.bookmark;
		const { title, parent, expanded, zoom, fit } = bookmark;
		const outline = registry[parent] || ctx.outline;
		const top = bookmark.top || node.box.top;
		const left = bookmark.left || node.box.left;
		const instance = outline.addItem(title, {
			pageNumber,
			expanded,
			top,
			left,
			zoom,
			fit
		});
		registry[bookmark.ref] = instance;
	}
	if (!node.children) return;
	node.children.forEach((child) => addNodeBookmark(ctx, child, pageNumber, registry));
};
var addBookmarks = (ctx, root) => {
	const registry = {};
	(root.children || []).forEach((page, i) => {
		addNodeBookmark(ctx, page, i, registry);
	});
};
var render = (ctx, doc) => {
	const pages = doc.children || [];
	const options = {
		imageCache: /* @__PURE__ */ new Map(),
		fieldSets: []
	};
	pages.forEach((page) => renderNode(ctx, page, options));
	addBookmarks(ctx, doc);
	ctx.end();
	return ctx;
};
//#endregion
export { render as t };
