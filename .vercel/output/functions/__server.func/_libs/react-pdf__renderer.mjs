import { k as lib_exports } from "./@react-pdf/image+[...].mjs";
import { n as PDFDocument, t as FontStore } from "./@react-pdf/font+[...].mjs";
import { _ as upperFirst } from "./react-pdf__fns.mjs";
import { t as render$1 } from "./@react-pdf/render+[...].mjs";
import { t as layout } from "./@react-pdf/layout+[...].mjs";
import { t as renderer$1 } from "./@react-pdf/reconciler+[...].mjs";
import "fs";
import "buffer";
//#region node_modules/@react-pdf/renderer/lib/react-pdf.js
var omitNils = (object) => Object.fromEntries(Object.entries(object).filter((_ref) => {
	let [, value] = _ref;
	return value !== void 0;
}));
var createInstance = (type, _ref) => {
	let { style, children, ...props } = _ref;
	return {
		type,
		box: {},
		style: style || {},
		props: props || {},
		children: []
	};
};
var createTextInstance = (text) => ({
	type: "TEXT_INSTANCE",
	value: text
});
var appendChild = (parent, child) => {
	const isParentText = parent.type === "TEXT" || parent.type === "LINK" || parent.type === "TSPAN" || parent.type === "NOTE";
	if (child.type === "TEXT_INSTANCE" && !isParentText) {
		console.warn(`Invalid '${child.value}' string child outside <Text> component`);
		return;
	}
	parent.children.push(child);
};
var appendChildToContainer = (parentInstance, child) => {
	if (parentInstance.type === "ROOT") parentInstance.document = child;
	else appendChild(parentInstance, child);
};
var insertBefore = (parentInstance, child, beforeChild) => {
	var _parentInstance$child;
	const index = (_parentInstance$child = parentInstance.children) === null || _parentInstance$child === void 0 ? void 0 : _parentInstance$child.indexOf(beforeChild);
	if (index === void 0) return;
	if (index !== -1 && child) parentInstance.children.splice(index, 0, child);
};
var removeChild = (parentInstance, child) => {
	var _parentInstance$child2;
	const index = (_parentInstance$child2 = parentInstance.children) === null || _parentInstance$child2 === void 0 ? void 0 : _parentInstance$child2.indexOf(child);
	if (index === void 0) return;
	if (index !== -1) parentInstance.children.splice(index, 1);
};
var removeChildFromContainer = (parentInstance, child) => {
	var _parentInstance$child3;
	const index = (_parentInstance$child3 = parentInstance.children) === null || _parentInstance$child3 === void 0 ? void 0 : _parentInstance$child3.indexOf(child);
	if (index === void 0) return;
	if (index !== -1) parentInstance.children.splice(index, 1);
};
var commitTextUpdate = (textInstance, oldText, newText) => {
	textInstance.value = newText;
};
var commitUpdate = (instance, updatePayload, type, oldProps, newProps) => {
	const { style, ...props } = newProps;
	instance.props = props;
	instance.style = style;
};
var createRenderer = (_ref2) => {
	let { onChange = () => {} } = _ref2;
	return renderer$1({
		appendChild,
		appendChildToContainer,
		commitTextUpdate,
		commitUpdate,
		createInstance,
		createTextInstance,
		insertBefore,
		removeChild,
		removeChildFromContainer,
		resetAfterCommit: onChange
	});
};
var { version } = { version: "4.5.1" };
var fontStore = new FontStore();
var renderer;
var events = {};
var pdf = (initialValue) => {
	const onChange = () => {
		var _events$change;
		const listeners = ((_events$change = events.change) === null || _events$change === void 0 ? void 0 : _events$change.slice()) || [];
		for (let i = 0; i < listeners.length; i += 1) listeners[i]();
	};
	const container = {
		type: "ROOT",
		document: null
	};
	renderer = renderer || createRenderer({ onChange });
	const mountNode = renderer.createContainer(container);
	const updateContainer = (doc, callback) => {
		renderer.updateContainer(doc, mountNode, null, callback);
	};
	if (initialValue) updateContainer(initialValue);
	const render = async function(compress) {
		if (compress === void 0) compress = true;
		const { pdfVersion, language, pageLayout, pageMode, title, author, subject, keywords, creator = "react-pdf", producer = "react-pdf", creationDate = /* @__PURE__ */ new Date(), modificationDate, ownerPassword, userPassword, permissions } = container.document.props || {};
		const ctx = new PDFDocument({
			compress,
			pdfVersion,
			lang: language,
			displayTitle: true,
			autoFirstPage: false,
			ownerPassword,
			userPassword,
			permissions,
			pageLayout,
			info: omitNils({
				Title: title,
				Author: author,
				Subject: subject,
				Keywords: keywords,
				Creator: creator,
				Producer: producer,
				CreationDate: creationDate,
				ModificationDate: modificationDate
			})
		});
		if (pageMode) ctx._root.data.PageMode = upperFirst(pageMode);
		const layout$1 = await layout(container.document, fontStore);
		return {
			layout: layout$1,
			fileStream: render$1(ctx, layout$1)
		};
	};
	const callOnRender = function(params) {
		if (params === void 0) params = {};
		if (container.document.props.onRender) container.document.props.onRender(params);
	};
	const toBlob = async () => {
		const chunks = [];
		const { layout: _INTERNAL__LAYOUT__DATA_, fileStream: instance } = await render();
		return new Promise((resolve, reject) => {
			instance.on("data", (chunk) => {
				chunks.push(chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk));
			});
			instance.on("end", () => {
				try {
					const blob = new Blob(chunks, { type: "application/pdf" });
					callOnRender({
						blob,
						_INTERNAL__LAYOUT__DATA_
					});
					resolve(blob);
				} catch (error) {
					reject(error);
				}
			});
		});
	};
	const toBuffer = async () => {
		const { layout: _INTERNAL__LAYOUT__DATA_, fileStream } = await render();
		callOnRender({ _INTERNAL__LAYOUT__DATA_ });
		return fileStream;
	};
	const toString = async () => {
		let result = "";
		const { fileStream: instance } = await render(false);
		return new Promise((resolve, reject) => {
			try {
				instance.on("data", (buffer) => {
					result += buffer;
				});
				instance.on("end", () => {
					callOnRender();
					resolve(result);
				});
			} catch (error) {
				reject(error);
			}
		});
	};
	const on = (event, listener) => {
		if (!events[event]) events[event] = [];
		events[event].push(listener);
	};
	const removeListener = (event, listener) => {
		if (!events[event]) return;
		const idx = events[event].indexOf(listener);
		if (idx > -1) events[event].splice(idx, 1);
	};
	return {
		on,
		container,
		toBlob,
		toBuffer,
		toString,
		removeListener,
		updateContainer
	};
};
var StyleSheet = { create: (s) => s };
({ ...lib_exports });
//#endregion
export { pdf as n, StyleSheet as t };
