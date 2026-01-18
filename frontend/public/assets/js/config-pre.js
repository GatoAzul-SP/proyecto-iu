"use strict";

function isOnAdmin() {
	const path = (window.location && window.location.pathname) ? window.location.pathname : '';
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

function applySiteColors(root, colors) {
	try {
		if (!colors) {
			colors = loadSetting('siteColors');
			if (!colors) return;
		}

		for (let color of ["accent-1", "accent-2", "foreground",
		                   "background", "background-shadowed"]) {
			if (colors[color]) {
				root.style.setProperty(`--color-${color}`, colors[color]);
			}
		}
	} catch(e) { console.warn('Error aplicando colores del sitio', e); }
};

function injectGoogleFontInDoc(doc, font) {
	if (!doc || !font) return;
	// Exclude fonts already present
	if (["Poppins", "Open Sans"].indexOf(font) < 0) return;

	const id = 'gf-' + font.replace(/\s+/g,'-');
	if (doc.getElementById(id)) return;

	const link = doc.createElement('link');
	link.id = id; link.rel = 'stylesheet';
	link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(font) +
	            ':wght@300;400;500;600;700&display=swap';
	doc.head.appendChild(link);
}

function applySiteFonts(doc /*root*/, fonts) {
	const bodyStyle = doc.body.style;

	try {
		if (!fonts) {
			fonts = loadSetting('admin_typography_settings');
			if (!fonts) return;
		}

		if (fonts.primary) {
			injectGoogleFontInDoc(doc, fonts.primary);
			bodyStyle.setProperty("--font-title", `'${fonts.primary}'`);
		}

		if (fonts.secondary) {
			injectGoogleFontInDoc(doc, fonts.secondary);
			bodyStyle.setProperty("--font-general", `'${fonts.secondary}'`);
		}

		if (typeof fonts.titleSize !== "undefined") {
			bodyStyle.setProperty("--size-title", fonts.titleSize + "px");
		}

		if (typeof fonts.subtitleSize !== "undefined") {
			bodyStyle.setProperty("--size-subtitle", fonts.subtitleSize + "px");
		}

		if (typeof fonts.paragraphSize !== "undefined") {
			bodyStyle.setProperty("--size-general", fonts.paragraphSize + "px");
		}
	} catch (e) { console.warn('Error aplicando ajustes de fuentes del sitio', e); }

	/*
	try {
		if (!fonts) {
			fonts = loadSetting('siteFonts');
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
	} catch(e) { console.warn('Error applying site font settings', e); }
	*/
};

if (!isOnAdmin()) {
	applySiteColors(document.body);
	applySiteFonts(document);

	try {
		if (window.BroadcastChannel) {
			const bcColors = new BroadcastChannel("admin-colors");
			bcColors.addEventListener("message", function(ev) {
				if (ev.data && ev.data.type === 'colors-applied' && ev.data.colors) {
					applySiteColors(document.body, ev.data.colors);
				}
			});

			const bcFonts = new BroadcastChannel("admin-typography");
			bcFonts.addEventListener("message", function(ev) {
				if (ev.data && ev.data.type === 'settings-applied' && ev.data.settings) {
					applySiteFonts(document.body, ev.data.settings);
				}
			});
		}
	} catch (e) {}
}
