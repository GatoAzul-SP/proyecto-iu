"use strict";

var FONT_DB_NAME = "CustomFontsDB";
var FONT_DB_VER = 1;
var FONT_STORE_NAME = "fonts";

var getElById = document.getElementById.bind(document);
var createEl = document.createElement.bind(document);

function reversedMap(simpleMap) {
	const reversed = {__proto__: null};
	Object.entries(simpleMap).forEach(pair => {
		if (pair[1] != null) reversed[pair[1]] = pair[0];
	});
	return reversed;
}

function reflexedMap(simpleMap) {
	return Object.assign({__proto__: null}, simpleMap, reversedMap(simpleMap));
}

function isOnAdmin() {
	const path = (window.location && window.location.pathname) ? window.location.pathname : "";
	const test = /^\/admin\//i.test(path);
	return test;
}

function loadSetting(name) {
	try {
		let setting = localStorage.getItem(name);
		setting = JSON.parse(setting);
		return setting || null;
	} catch(e) { return null; }
}

function saveSetting(name, setting) {
	localStorage.setItem(name, JSON.stringify(setting));
}

function openDB(name, ver, cb_upgrade) {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(name, ver);
		request.onupgradeneeded = cb_upgrade;
		request.onerror = () => { reject(request.error); };
		request.onsuccess = () => { resolve(request.result); };
	});
}

function getDBObject(store, key) {
	return new Promise((resolve, reject) => {
		const request = store.get(name);
		request.onsuccess = () => { resolve(request.result); };
		request.onerror = () => { reject(request.error); };
	});
}

function getAllDBObjects(store) {
	return new Promise((resolve, reject) => {
		const request = store.getAll();
		request.onsuccess = () => { resolve(request.result); };
		request.onerror = () => { reject(request.error); };
	});
}

function storeDBObject(store, key, obj) {
	return new Promise((resolve, reject) => {
		const request = store.put(obj);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

function bcChannelPost(channelName, message) {
	if (window.BroadcastChannel) {
		const channel = new BroadcastChannel(channelName);
		channel.postMessage(message);
		channel.close();
		return true;
	} else {
		return false;
	}
}

function bcChannelListen(channelName, handler) {
	if (window.BroadcastChannel) {
		const channel = new BroadcastChannel(channelName);
		if (handler) {
			channel.addEventListener("message", handler);
		}
		return channel;
	}
}

function openFontDB() {
	return openDB(FONT_DB_NAME, 1, e => {
		const db = e.target.result;
		if (!db.objectStoreNames.contains(FONT_STORE_NAME)) {
			db.createObjectStore(FONT_STORE_NAME, { keyPath: "name" });
		}
	});
}

// Load a specific custom font from IndexedDB
function loadCustomFont(name) {
	return openFontDB().then(db => {
		const tx = db.transaction(FONT_STORE_NAME, "readonly");
		const store = tx.objectStore(FONT_STORE_NAME);
		return getDBObject(store, name);
	});
}

function applySiteColors(root, colors) {
	try {
		if (!colors) {
			colors = loadSetting("siteColors");
			if (!colors) return;
		}

		for (const color of ["accent-1", "accent-2", "foreground",
		                     "background", "background-shadowed"]) {
			if (colors[color]) {
				root.style.setProperty(`--color-${color}`, colors[color]);
			}
		}
	} catch(e) { console.warn("Error aplicando colores del sitio", e); }
};

function injectGoogleFont(docLike, font) {
	if (!docLike || !font) return;
	// Exclude fonts already present
	if (["Poppins", "Open Sans"].indexOf(font) >= 0) return;

	const id = "gf-" + font.replace(/\s+/g,"-");
	if (docLike.getElementById(id)) return;

	const link = document.createElement("link");
	link.id = id; link.rel = "stylesheet";
	link.href = "https://fonts.googleapis.com/css2?family=" + encodeURIComponent(font) +
	            ":wght@300;400;500;600;700&display=swap";
	(docLike.head || docLike).appendChild(link);
}

function injectCustomFont(docLike, fontName, blob) {
	return new Promise((resolve, reject) => {
		if (!(docLike && fontName && blob)) { reject(); return; }
		const reader = new FileReader();
		reader.onload = (e) => {
			const dataUrl = e.target.result;

			const id = "custom-font-" + fontName.replace(/\s+/g, "-");
			if (docLike.getElementById(styleId)) { resolve(); return; }

			const style = document.createElement("style");
			style.id = id;
			style.textContent = `
@font-face {
	font-family: "${fontName}";
	src: url("${dataUrl}") format("truetype");
	font-weight: normal;
	font-style: normal;
}`;
			(docLike.head || docLike).appendChild(style);
			resolve();
		};
		reader.onerror = () => { reject(); };
		reader.readAsDataURL(blob);
	});
}

function applySiteFonts(root, fonts) {
	const docLike = root.getRootNode();
	if (!docLike.getElementById) {
		throw new TypeError("'root' no está conectado a un (sub)documento");
	}

	try {
		if (!fonts) {
			fonts = loadSetting("admin_typography_settings");
			if (!fonts) return;
		}

		const applyFont = (propName, fontName) => {
			if (fontName.startsWith("custom:")) {
				fontName = fontName.slice("custom:".length);
				loadCustomFont(fontName).then(font =>
					injectCustomFontFace(docLike, fontName, font.blob)
				).catch(e => { console.warn("Error cargando fuente primaria:", e); }
				).then(() => {
					root.style.setProperty(`--font-${propName}`, `"${fontName}"`);
				});
			} else {
				injectGoogleFont(docLike, fontName);
				root.style.setProperty(`--font-${propName}`, `"${fontName}"`);
			}
		}

		if (fonts.primary) {
			applyFont("title", fonts.primary);
		}

		if (fonts.secondary) {
			applyFont("general", fonts.secondary);
		}

		if (typeof fonts.titleSize !== "undefined") {
			root.style.setProperty("--size-title", fonts.titleSize + "px");
		}

		if (typeof fonts.subtitleSize !== "undefined") {
			root.style.setProperty("--size-subtitle", fonts.subtitleSize + "px");
		}

		if (typeof fonts.paragraphSize !== "undefined") {
			root.style.setProperty("--size-general", fonts.paragraphSize + "px");
		}
	} catch (e) { console.warn("Error aplicando ajustes de fuentes del sitio", e); }

	/*
	try {
		if (!fonts) {
			fonts = loadSetting("siteFonts");
			if (!fonts) return;
		}

		if (fonts.sizes) {
			for (let size of ["title", "subtitle", "general"]) {
				if (fonts.sizes[size]) {
					root.style.setProperty(`--size-${size}`, fonts.sizes[size]);
				}
			}
		}

		if (fonts.typographies) {
			for (let typography of ["title", "general"]) {
				if (fonts.typographies[typography]) {
					root.style.setProperty(`--font-${typography}`,
					                       fonts.typographies[typography]);
				}
			}
		}
	} catch(e) { console.warn("Error applying site font settings", e); }
	*/
};

if (!isOnAdmin()) {
	applySiteColors(document.body);
	applySiteFonts(document.body);

	try {
		bcChannelListen("admin-colors", function(ev) {
			if (ev.data && ev.data.type === "colors-applied" && ev.data.colors) {
				applySiteColors(document.body, ev.data.colors);
			}
		});

		bcChannelListen("admin-typography", function(ev) {
			if (ev.data && ev.data.type === "settings-applied" && ev.data.settings) {
				applySiteFonts(document.body, ev.data.settings);
			}
		});
	} catch (e) {}
}
