// Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
	// ---------- Display logged-in user ----------
	(function displayCurrentUser() {
		try {
			const session = loadSetting('admin_session') || {};
			const firstName = session.firstName || 'Admin';
			const lastName = session.lastName || 'User';
			const fullName = firstName + ' ' + lastName;

			const userNameEl = getElById('user-name');
			const userAvatarEl = getElById('user-avatar');

			if (userNameEl) {
				userNameEl.textContent = fullName;
			}
			if (userAvatarEl) {
				userAvatarEl.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fullName) + '&background=1B73E8&color=fff';
				userAvatarEl.alt = fullName;
			}
		} catch (e) {
			console.warn('No se pudo cargar la sesión del usuario:', e);
		}
	})();


	// ========== BASE DEFINITIONS ==========

	const iframe = getElById('site-preview');
	function getIframeDoc() {
		try {
			return iframe?.contentDocument || iframe?.contentWindow?.document;
		} catch(e) { console.warn('No se puede acceder al iframe:', e); return null; }
	}

	function createTextCell(content) {
		const td = createEl('td');
		td.textContent = content || '';
		return td;
	}

	function setupContextMenu(id, options) {
		const menu = getElById(id);
		if (menu.children.length > 0) return menu;

		options.forEach(label => {
			const item = createEl('li');
			item.textContent = label;
			item.dataset.action = label.toLowerCase();
			menu.appendChild(item);
		});

		document.addEventListener('click', function() {
			menu.hidden = true;
		});
		document.addEventListener('keydown', function(e) {
			if (e.key === 'Escape') menu.hidden = true;
		});

		return menu;
	}

	function showContextMenu(menu, x, y) {
		menu.style.left = x + 'px';
		menu.style.top = y + 'px';
		menu.hidden = false;

		const {top, height} = menu.getBoundingClientRect();
		const windowHeight = document.documentElement.clientHeight;
		if (top + height > windowHeight) {
			menu.style.top = y - top + windowHeight - height + 'px';
		}
	}


	// ---------- Other existing controls ----------

	// Refresh preview button
	const refreshBtn = getElById('refresh-preview');
	if (refreshBtn && iframe) {
		refreshBtn.addEventListener('click', function() { iframe.src = iframe.src; });
	}
	// View site button
	const viewSiteBtn = getElById('view-site');
	if (viewSiteBtn) {
		viewSiteBtn.addEventListener('click', function() { window.open('/', '_blank'); });
	}

	// Smooth scrolling for sidebar links
	document.querySelectorAll('.sidebar-menu a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', function (e) {
			e.preventDefault();
			const target = document.querySelector(this.getAttribute('href'));
			if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	});


	// ========== COLORS SECTION ==========

	// ---------- Definitions ----------

	const colorInputMap = reflexedMap({
		'accent-1': 'color-1',
		'accent-2': 'color-2',
		'foreground': 'color-3',
		'background': 'color-4',
		'background-shadowed': 'color-5'
	});

	function getNewPalette() {
		const original = getDefaultColorHistory()[0];
		return {
			name: getElById('palette-name')?.value.trim() || 'Sin nombre',
			type: 'normal',
			"accent-1": getElById('color-1')?.value || original["accent-1"],
			"accent-2": getElById('color-2')?.value || original["accent-2"],
			"foreground": getElById('color-3')?.value || original["foreground"],
			"background": getElById('color-4')?.value || original["background"],
			"background-shadowed": getElById('color-5')?.value || original["background-shadowed"],
			timestamp: Date.now(),
			active: false
		};
	}

	function applyColorsToUI(colors) {
		if (!colors) return;

		applySiteColors(document.documentElement, colors);
		updateColorInputs(colors);
	}

	function applyColorsToIframe(colors) {
		const iframeDoc = getIframeDoc();
		if (!iframeDoc) return;

		// Aplicar variables CSS al iframe
		applySiteColors(iframeDoc.body, colors);
	}

	// Helper function to create color cell with preview box
	function createColorCell(colorValue) {
		const td = createEl('td');

		// Use a wrapper div for flexbox layout instead of td
		const wrapper = createEl('div');
		wrapper.className = "color-wrapper";

		const colorBox = createEl('span');
		colorBox.className = "color-swatch";
		colorBox.style.backgroundColor = colorValue || '#fff';

		const hexText = createEl('span');
		hexText.textContent = colorValue || '';

		wrapper.appendChild(colorBox);
		wrapper.appendChild(hexText);
		td.appendChild(wrapper);
		return td;
	}

	// ---------- Color history ----------

	function getDefaultColorHistory() {
		return [
			{
				name: 'Original',
				type: 'normal',
				"accent-1": '#fd18c0',
				"accent-2": '#cb69f2',
				"foreground": '#000000',
				"background": '#ffffff',
				"background-shadowed": '#f0f0f0',
				timestamp: 0,
				active: true
			},
			{
				// Daltonic-friendly palette (colorblind-friendly)
				name: 'Original daltonismo',
				type: 'daltonism',
				"accent-1": '#fd18c0',
				"accent-2": '#cb69f2',
				"foreground": '#000000',
				"background": '#ffffff',
				"background-shadowed": '#e0e0e0',
				timestamp: 0,
				active: true
			},
			{
				name: 'Original oscuro',
				type: 'dark',
				"accent-1": '#fd18c0',
				"accent-2": '#cb69f2',
				"foreground": '#ffffff',
				"background": '#000000',
				"background-shadowed": '#202020',
				timestamp: 0,
				active: true
			}
		];
	}

	function loadColorHistory() {
		let ch;
		try {
			ch = loadSetting('admin_color_history');
		} catch(e) {}
		return ch || getDefaultColorHistory();
	}

	function saveColorHistory(arr) {
		try {
			saveSetting('admin_color_history', arr);
		} catch(e) { console.warn('No se pudo guardar el historial de colores', e); }
	}

	function renderColorHistory() {
		const tbody = document.querySelector('#colors-changes tbody');
		if (!tbody) return;
		const hist = loadColorHistory();
		tbody.innerHTML = '';

		const typeDisplayMap = {
			'normal': 'Normal',
			'daltonism': 'Daltonismo',
			'dark': 'Oscuro'
		};

		hist.forEach((entry, idx) => {
			const tr = createEl('tr');

			tr.appendChild(createTextCell((idx + 1) + (entry.active ? ' ✓' : '') ));
			tr.appendChild(createTextCell(entry.name || 'Sin nombre'));

			for (let color of [
				entry["accent-1"], entry["accent-2"], entry["foreground"], entry["background"],
				entry["background-shadowed"] ]) {
				tr.appendChild(createColorCell(color));
			}

			tr.appendChild(createTextCell(typeDisplayMap[entry.type] || ''));

			tr.addEventListener('contextmenu', function(ev) {
				ev.preventDefault();
				showColorContextMenu(ev.pageX, ev.pageY, idx);
			});

			tbody.appendChild(tr);
		});
	}

	// ---------- Color inputs ----------

	function updateColorInputs(colors) {
		let idx = 1;
		for (let color of ["accent-1", "accent-2", "foreground",
						"background", "background-shadowed"]) {
			try {
				const colorInput = getElById(`color-${idx}`);
				const hexInput = getElById(`color-${idx}-hex`);

				color = colors[color] || '';
				colorInput.value = color;
				if (hexInput) hexInput.value = color;
			} catch(e) {}
			++idx;
		}
	}

	// Color picker functionality
	const colorInputs = document.querySelectorAll('#colors-section input[type="color"]');
	const colorTextInputs = document.querySelectorAll('#colors-section input[type="text"][id$="-hex"]');

	if (colorInputs && colorTextInputs && colorInputs.length === colorTextInputs.length) {
		colorInputs.forEach((input, index) => {
			input.addEventListener('input', function() {
				if (colorTextInputs[index]) {
					colorTextInputs[index].value = this.value;
				}
			});
		});

		const cleanColorValue = (value) => {
			return (!value[0] === '#' ? '#' + value.replaceAll('#', '') : value).toLowerCase();
		};

		colorTextInputs.forEach((input, index) => {
			input.addEventListener('input', function() {
				const value = cleanColorValue(this.value);
				this.value = value;

				if (value.match(/^#[0-9A-F]{6}$/i) && colorInputs[index]) {
					colorInputs[index].value = value;
				}
			});

			input.addEventListener('focus', function () {
				this.value = cleanColorValue(this.value);
			});
		});
	}

	// ---------- Reset buttons ----------
	const resetButtons = document.querySelectorAll('.color-item .btn-reset');
	resetButtons.forEach((btn) => {
		btn.addEventListener('click', function () {
			const colorItem = this.closest('.color-item');
			if (!colorItem) return;

			const colorInput = colorItem.querySelector('input[type="color"]');
			const hexInput = colorItem.querySelector('input[type="text"][id$="-hex"]');

			const colorName = colorInputMap[colorInput && colorInput.id
			                                || hexInput && hexInput.id.replace('-hex', '')];
			const resetColor = colorName && getDefaultColorHistory()[0][colorName] || '#ffffff';

			if (colorInput) colorInput.value = resetColor;
			if (hexInput) hexInput.value = resetColor;
		});
	});

	// ---------- Apply colors button ----------

	function applyColors() {
		const colorSettings = getNewPalette();

		// Aplicar colores al admin
		applySiteColors(document.documentElement, colorSettings);

		// Aplicar colores al iframe (página principal)
		applyColorsToIframe(colorSettings);

		// Almacenar como paleta global (siteColors)
		try {
			const ch = loadColorHistory();
			ch.push(colorSettings);
			saveColorHistory(ch);
			renderColorHistory();
		} catch(e) { console.warn('No se pudo guardar los colores en el historial', e); }

		try {
			bcChannelPost('admin-colors', {
				type: 'colors-applied',
				colors: colorSettings
			});
		} catch(e) {}

		alert('Colores aplicados correctamente');
	}

	const applyColorsBtn = getElById('apply-colors');
	if (applyColorsBtn) {
		applyColorsBtn.addEventListener('click', applyColors);
	}

	// ---------- Color context menu ----------

	let colorContextMenuEl = null;
	function ensureColorContextMenu() {
		if (colorContextMenuEl) return colorContextMenuEl;
		return colorContextMenuEl = setupContextMenu('color-context-menu',
			['Editar', 'Eliminar', 'Aplicar']);
	}

	function showColorContextMenu(x, y, index) {
		const menu = ensureColorContextMenu();
		const isActive = loadColorHistory()[index]?.active;

		showContextMenu(menu, x, y);

		Array.from(menu.children).forEach(child => {
			const action = child.dataset.action;

			if (isActive && (action === 'eliminar')) {
				child.classList.add('disabled');
			} else {
				child.classList.remove('disabled');
			}

			child.onclick = function(ev) {
				handleColorContextAction(action, index);
				menu.hidden = true;
			};
		});
	}

	function handleColorContextAction(action, index) {
		const hist = loadColorHistory();
		const entry = hist[index];
		if (!entry) return;

		if (action === 'editar') {
			showColorEditModal(index, entry);
		} else if (action === 'eliminar') {
			if (entry.active) {
				alert('Esta entrada está en uso y no se puede eliminar.');
				return;
			}
			showColorDeleteModal(index);
		} else if (action === 'aplicar') {
			showColorApplyModal(index, entry);
		}
	}

	// Color delete confirmation modal
	let colorDeleteOverlay = null;
	function ensureColorDeleteModal() {
		if (colorDeleteOverlay) return colorDeleteOverlay;
		colorDeleteOverlay = getElById('color-delete-modal');

		// handlers
		colorDeleteOverlay.querySelector('.btn-cancel').addEventListener('click',
			() => { colorDeleteOverlay.hidden = true; });
		colorDeleteOverlay.querySelector('.btn-confirm').addEventListener('click', () => {
			const idx = colorDeleteOverlay.dataset.deleteIndex;
			try {
				const h = loadColorHistory();
				if (typeof idx !== 'undefined') {
					h.splice(parseInt(idx,10), 1);
					saveColorHistory(h);
					renderColorHistory();
				}
			} catch(e) { console.warn('Error eliminando entrada de colores', e); }

			colorDeleteOverlay.hidden = true;
		});

		return colorDeleteOverlay;
	}

	function showColorDeleteModal(index) {
		const modal = ensureColorDeleteModal();
		modal.dataset.deleteIndex = index;
		modal.hidden = false;
	}

	// Color edit confirmation modal
	let colorEditOverlay = null;
	function ensureColorEditModal() {
		if (colorEditOverlay) return colorEditOverlay;
		colorEditOverlay = getElById('color-edit-modal');

		// handlers
		colorEditOverlay.querySelector('.btn-cancel').addEventListener('click',
			() => { colorEditOverlay.hidden = true; });
		colorEditOverlay.querySelector('.btn-confirm').addEventListener('click', () => {
			const idx = parseInt(colorEditOverlay.dataset.editIndex, 10);
			const newName = colorEditOverlay.querySelector('#edit-palette-name').value.trim() || 'Sin nombre';
			try {
				const h = loadColorHistory();
				h[index] = Object.assign(getNewPalette(), { name: newName });
				saveColorHistory(h);
				renderColorHistory();
			} catch (e) { console.warn('Error editando entrada de colores', e); }

			colorEditOverlay.hidden = true;
		});

		return colorEditOverlay;
	}

	function showColorEditModal(index, entry) {
		const modal = ensureColorEditModal();
		modal.dataset.editIndex = index;
		modal.querySelector('#edit-palette-name').value = entry.name || '';
		modal.hidden = false;
	}

	// Color apply confirmation modal
	let colorApplyOverlay = null;
	function ensureColorApplyModal() {
		if (colorApplyOverlay) return colorApplyOverlay;
		colorApplyOverlay = getElById('color-apply-modal');

		// handlers
		colorApplyOverlay.querySelector('.btn-cancel').addEventListener('click',
			() => { colorApplyOverlay.hidden = true; });
		colorApplyOverlay.querySelector('.btn-confirm').addEventListener('click', () => {
			const idx = parseInt(colorApplyOverlay.dataset.applyIndex, 10);
			try {
				const h = loadColorHistory();
				const entry = h[idx];
				if (entry) {
					applyColorsToUI(entry);
					applyColorsToIframe(entry);
					saveSetting('siteColors', {
						type: entry.type,
						"accent-1": entry["accent-1"],
						"accent-2": entry["accent-2"],
						"foreground": entry["foreground"],
						"background": entry["background"],
						"background-shadowed": entry["background-shadowed"]
					});
				}
			} catch (e) { console.warn('Error aplicando colores', e); }

			colorApplyOverlay.hidden = true;
		});

		return colorApplyOverlay;
	}

	function showColorApplyModal(index, entry) {
		const modal = ensureColorApplyModal();
		modal.dataset.applyIndex = index;

		// Update preview colors
		const previews = modal.querySelectorAll('.color-swatch');
		previews.forEach(p => {
			const colorType = p.dataset.color;
			if (entry[colorType]) p.style.backgroundColor = entry[colorType];
		});

		modal.hidden = false;
	}

	// Initialize color controls from saved settings
	(function initColorControls() {
		try {
			const colors = loadSetting('siteColors');
			if (colors) applyColorsToUI(colors);
		} catch(e) { console.warn('No se pudo inicializar controles de color', e); }

		// Listen for BroadcastChannel messages from other admin instances
		try {
			bcChannelListen('admin-colors', function(ev) {
				try { if (ev.data && ev.data.type === 'colors-applied' && ev.data.colors) {
					applyColorsToUI(ev.data.colors);
				}} catch(e) {}
			});
		} catch(e) {}

		// ensure there is at least one history entry
		try {
			saveColorHistory(loadColorHistory());
		} catch(e) {}
		renderColorHistory();
	})();


	// ========== TYPOGRAPHY SECTION ==========

	// ---------- Definitions ----------

	const baseFonts = [
		'Poppins', 'Roboto', 'Open Sans', 'Montserrat', 'Lato',
		'Playfair Display', 'Arial', 'Helvetica', 'Times New Roman'
	];

	const typographyStorageKey = 'admin_typography_settings';
	const typographyHistoryKey = 'admin_typography_history';

	function loadTypographySettings() {
		try {
			return loadSetting(typographyStorageKey);
		} catch(e) { return null; }
	}

	function saveTypographySettings(fontSettings) {
		try {
			saveSetting(typographyStorageKey, fontSettings);
		} catch(e) { console.warn('No se pudo guardar la configuración de tipografía', e); }
	}

	const primarySelect = getElById('primary-font');
	const secondarySelect = getElById('secondary-font');

	const titleSlider = getElById('title-size');
	const subtitleSlider = getElById('subtitle-size');
	const paragraphSlider = getElById('paragraph-size');

	function getNewFontSettings() {
		return {
			primary: primarySelect?.value || 'Poppins',
			secondary: secondarySelect?.value || 'Poppins',
			titleSize: titleSlider && parseInt(titleSlider.value,10) || 36,
			subtitleSize: subtitleSlider && parseInt(subtitleSlider.value,10) || 24,
			paragraphSize: paragraphSlider && parseInt(paragraphSlider.value,10) || 16
		};
	}

	function applyTypographyToIframe(settings) {
		const doc = getIframeDoc();
		if (!doc) return;

		applySiteFonts(doc.body, settings);
	}

	// ---------- Custom fonts ----------

	// Format font names (show star for custom fonts)
	function formatFont(f) {
		if (!f) return '';
		return f.startsWith('custom:') ? '⭐ ' + f.replace('custom:', '') : f;
	}

	let customFontsCache = [];

	// Load all custom fonts from IndexedDB
	function loadCustomFonts() {
		return openFontDB().then(db => {
			const tx = db.transaction(FONT_STORE_NAME, "readonly");
			const store = tx.objectStore(FONT_STORE_NAME);
			return getAllDBObjects(store);
		});
	}

	function saveCustomFont(name, blob) {
		return openFontDB().then(db => {
			const tx = db.transaction(FONT_STORE_NAME, "readwrite");
			const store = tx.objectStore(FONT_STORE_NAME);
			return storeDBObject(store, key, blob);
		});
	}

	// Load custom fonts, update selectors, and re-render history
	function loadAndRefreshCustomFonts() {
		loadCustomFonts().then(fonts => {
			customFontsCache = fonts;
			refreshFontSelectors();
			renderTypographyHistory();
		}).catch(e => {
			console.warn('Error cargando fuentes personalizadas:', e);
		});
	}

	// Initialize custom fonts on page load
	loadAndRefreshCustomFonts();

	// ---------- Typography history ----------

	function getDefaultTypographyHistory() {
		return [
			{
				primary: 'Poppins',
				secondary: 'Poppins',
				titleSize: 36,
				subtitleSize: 24,
				paragraphSize: 16,
				timestamp: 0,
				isProtected: true
			}
		];
	}

	function loadTypographyHistory() {
		let th;
		try {
			th = loadSetting(typographyHistoryKey);
		} catch(e) {}
		return th || getDefaultTypographyHistory();
	}

	function saveTypographyHistory(arr) {
		try {
			saveSetting(typographyHistoryKey, arr);
		} catch(e) { console.warn('No se pudo guardar el historial de tipografía', e); }
	}

	function renderTypographyHistory() {
		const tbody = document.querySelector('#typography-changes tbody');
		if (!tbody) return;
		const hist = loadTypographyHistory();
		tbody.innerHTML = '';

		// Get the font family property value for styling
		const getFontFamily = (f) => {
			if (!f) return 'inherit';
			if (f.startsWith('custom:')) {
				const customName = f.replace('custom:', '');
				// Inject custom font if available
				const fontData = customFontsCache.find(cf => cf.name === customName);
				if (fontData && fontData.blob) {
					injectCustomFont(document, customName, fontData.blob);
				}
				return `'${customName}', sans-serif`;
			} else {
				// Inject Google font into admin document
				injectGoogleFont(document, f);
				return `'${f}', sans-serif`;
			}
		};

		const createFontNameCell = (name) => {
			const td = createTextCell(formatFont(name));
			td.style.fontFamily = getFontFamily(name);
			return td;
		}

		const createFontSizeCell = (size) => {
			const td = createTextCell(size && size + 'px');
			if (size) td.style.fontSize = size + 'px';
			return td;
		}

		hist.forEach((entry, idx) => {
			const tr = createEl('tr');

			// Style protected row
			if (entry.isProtected) {
				tr.style.background = 'linear-gradient(90deg, #e8f5e9 0%, #f1f8e9 100%)';
			}

			// ID with lock icon for protected
			const idTd = createTextCell((idx + 1) + (entry.isProtected ? ' 🔒' : ''));
			idTd.style.fontWeight = entry.isProtected ? 'bold' : 'normal';
			tr.appendChild(idTd);

			tr.appendChild(createFontNameCell(entry.primary));
			tr.appendChild(createFontNameCell(entry.secondary));


			tr.appendChild(createFontSizeCell(entry.titleSize));
			tr.appendChild(createFontSizeCell(entry.subtitleSize));
			tr.appendChild(createFontSizeCell(entry.paragraphSize));

			// attach context menu handler to row
			tr.addEventListener('contextmenu', function(ev) {
				ev.preventDefault();
				showTypographyContextMenu(ev.pageX, ev.pageY, idx);
			});

			tbody.appendChild(tr);
		});
	}

	// ---------- Typography inputs ----------

	const applyTypoBtn = getElById('apply-typography');

	// Refresh font selectors to include custom fonts
	function refreshFontSelectors() {
		if (!primarySelect || !secondarySelect) return;

		const customNames = customFontsCache.map(f => f.name);

		const currentPrimary = primarySelect.value;
		const currentSecondary = secondarySelect.value;

		// Helper to populate a select
		const populate = (select, current) => {
			select.innerHTML = '';

			const createOption = (value, display) => {
				const opt = createEl('option');
				opt.value = value;
				opt.textContent = display;
				if (current === value) opt.selected = true;
				return opt;
			}

			// Add custom fonts first (with prefix indicator)
			customNames.forEach(name => {
				select.appendChild(createOption('custom:' + name, '⭐ ' + name));
			});

			// Add separator if there are custom fonts
			if (customNames.length > 0) {
				const sep = createOption('', '─────────────────');
				sep.disabled = true;
				select.appendChild(sep);
			}

			// Add base fonts
			baseFonts.forEach(name => {
				select.appendChild(createOption(name, name));
			});
		};

		populate(primarySelect, currentPrimary);
		populate(secondarySelect, currentSecondary);
	}

	// Handle font file upload
	const fontFileInput = getElById('font-file-input');
	const btnUploadFont = getElById('btn-upload-font');

	if (btnUploadFont && fontFileInput) {
		btnUploadFont.addEventListener('click', () => fontFileInput.click());

		fontFileInput.addEventListener('change', function () {
			const file = this.files[0];
			if (!file) return;

			// Extract font name from filename (without extension)
			let fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');
			fontName = fontName.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();

			// Capitalize first letter of each word
			fontName = fontName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

			// Check if font already exists
			if (customFontsCache.some(f => f.name.toLowerCase() === fontName.toLowerCase())) {
				alert(`La fuente "${fontName}" ya existe.`);
				this.value = '';
				return;
			}

			// Save the font
			saveCustomFont(fontName, file).then(() => {
				loadAndRefreshCustomFonts();
				alert(`Fuente "${fontName}" subida correctamente.`);
			}).catch(e => {
				console.error('Error guardando fuente:', e);
				alert('Error al guardar la fuente.');
			});

			this.value = ''; // Reset file input
		});
	}

	// Live change handlers
	const previewBox = getElById('typography-preview');

	// Helper: apply only primary font (titles) to iframe and preview
	function applyPrimaryFontOnly(font) {
		if (!font) return;
		/*
		// inject into iframe
		const doc = getIframeDoc();

		applySiteFonts(doc.body, {primary: font});
		*/

		if (font.startsWith("custom:")) {
			font = font.replace('custom:', '');
			// Find font in cache
			if (!customFontsCache.some(f => f.name === font)) {
				font = '';
			}
		}

		if (previewBox && font) {
			applySiteFonts(document.documentElement, {primary: font});
			previewBox.querySelectorAll('h2').forEach(h => h.style.fontFamily = `'${font}', serif`);
		}
	}

	// Helper: apply only secondary font (body, subtitles, paragraphs) to iframe and preview
	function applySecondaryFontOnly(font) {
		if (!font) return;
		/*
		// inject into iframe
		const doc = getIframeDoc();

		applySiteFonts(doc.body, {secondary: font});
		*/


		if (font.startsWith("custom:")) {
			font = font.replace('custom:', '');
			// Find font in cache
			if (!customFontsCache.some(f => f.name === font)) {
				font = '';
			}
		}

		if (previewBox && font) {
			applySiteFonts(document.documentElement, {secondary: font});
			const fontFamilyProp = `'${font}', sans-serif`;
			previewBox.style.fontFamily = fontFamilyProp;
			previewBox.querySelectorAll('h4').forEach(h => h.style.fontFamily = fontFamilyProp);
			previewBox.querySelectorAll('p').forEach(p => p.style.fontFamily = fontFamilyProp);
		}
	}

	if (primarySelect) primarySelect.addEventListener('change', (ev) => {
		const newPrimary = ev.currentTarget ? ev.currentTarget.value : primarySelect.value;
		try{ console.debug('primarySelect change ->', newPrimary); }catch(e){}
		applyPrimaryFontOnly(newPrimary);
	});
	if (secondarySelect) secondarySelect.addEventListener('change', (ev) => {
		const newSecondary = ev.currentTarget ? ev.currentTarget.value : secondarySelect.value;
		try{ console.debug('secondarySelect change ->', newSecondary); }catch(e){}
		applySecondaryFontOnly(newSecondary);
	});

	// sliders update iframe too
	[titleSlider, subtitleSlider, paragraphSlider].forEach(sl => {
		if (!sl) return;
		sl.addEventListener('input', () => {
			const s = getNewFontSettings();
			//applyTypographyToIframe(s);
			updateTypographyPreview(s);
		});
	});

	// Apply / Save
	if (applyTypoBtn) {
		applyTypoBtn.addEventListener('click', () => {
			const s = getNewFontSettings();
			saveTypographySettings(s);
			applyTypographyToIframe(s);
			updateTypographyPreview(s);

			// push to history
			try {
				const h = loadTypographyHistory();
				h.push(Object.assign({}, s, { timestamp: Date.now() }));
				saveTypographyHistory(h);
				renderTypographyHistory();
			} catch(e) { console.warn('No se pudo actualizar historial', e); }

			try {
				bcChannelPost('admin-typography', {
					type: 'settings-applied',
					settings: s
				});
			} catch(e) {}

			alert('Configuración de tipografía guardada localmente.');
		});
	}

	// Cancel button (only for typography section)
	if (applyTypoBtn) {
		const typographySection = applyTypoBtn.closest('.config-section');
		const cancelBtn = typographySection ? typographySection.querySelector('.btn-secondary') : null;

		if (cancelBtn) {
			cancelBtn.addEventListener('click', () => {
				const saved = loadTypographySettings();
				if (saved) {
					if (primarySelect) primarySelect.value = saved.primary;
					if (secondarySelect) secondarySelect.value = saved.secondary;
					if (titleSlider && typeof saved.titleSize !== 'undefined') titleSlider.value = saved.titleSize;
					if (subtitleSlider && typeof saved.subtitleSize !== 'undefined') subtitleSlider.value = saved.subtitleSize;
					if (paragraphSlider && typeof saved.paragraphSize !== 'undefined') paragraphSlider.value = saved.paragraphSize;
					//applyTypographyToIframe(saved);
					updateTypographyPreview();
				} else {
					// reload iframe to original
					if (iframe) iframe.contentWindow.location.reload();
				}
			});
		}
	}

	// ---------- Typography preview ----------

	const titleValueSpan = getElById('title-size-value');
	const subtitleValueSpan = getElById('subtitle-size-value');
	const paragraphValueSpan = getElById('paragraph-size-value');

	function updateTypographyPreview(settings) {
		if (!previewBox) return;

		settings = Object.assign(getNewFontSettings(), settings);

		// update displayed values
		if (titleValueSpan) titleValueSpan.textContent = settings.titleSize + 'px';
		if (subtitleValueSpan) subtitleValueSpan.textContent = settings.subtitleSize + 'px';
		if (paragraphValueSpan) paragraphValueSpan.textContent = settings.paragraphSize + 'px';

		// apply fonts: primary -> titles (h2), secondary -> subtitles (h4) and paragraphs (p)
		applyPrimaryFontOnly(settings.primary);
		applySecondaryFontOnly(settings.secondary);

		// apply sizes to matching elements in the preview
		previewBox.querySelectorAll('h2').forEach(h => h.style.fontSize = settings.titleSize + 'px');
		previewBox.querySelectorAll('h4').forEach(h => h.style.fontSize = settings.subtitleSize + 'px');
		previewBox.querySelectorAll('p').forEach(p => p.style.fontSize = settings.paragraphSize + 'px');
	}

	/*
	function normFontName(f) {
		return (f||'').split(',')[0].replace(/["']/g,'').trim();
	}

	function detectFontsFromIframe() {
		const doc = getIframeDoc();
		if (!doc) return { primary: 'Poppins', secondary: 'Poppins' };
		const body = doc.body;
		const bodyFont = normFontName(getComputedStyle(body).getPropertyValue('font-family')) || 'Poppins';
		// Titles are h2 on this site, use first h2 to detect title font
		const h2 = doc.querySelector('h2');
		const h2Font = h2 ? normFontName(getComputedStyle(h2).getPropertyValue('font-family')) : bodyFont;
		return { primary: h2Font, secondary: bodyFont };
	}

	function detectSizesFromIframe() {
		const doc = getIframeDoc();
		// Defaults adjusted to the site's original sizes
		if (!doc) return { titleSize: 36, subtitleSize: 24, paragraphSize: 16 };
		function pxToInt(v) {
			try {
				return Math.round(parseFloat(v.replace(/px$/, '') ));
			} catch(e) {}
		}
		// Titles are h2, subtitles are h4, paragraphs are p
		const h2 = doc.querySelector('h2');
		const h4 = doc.querySelector('h4');
		const p = doc.querySelector('p');
		const titleSize = h2 ? pxToInt(getComputedStyle(h2).getPropertyValue('font-size')) : undefined;
		const subtitleSize = h4 ? pxToInt(getComputedStyle(h4).getPropertyValue('font-size')) : undefined;
		const paragraphSize = p ? pxToInt(getComputedStyle(p).getPropertyValue('font-size')) : undefined;
		return { titleSize: titleSize || 36, subtitleSize: subtitleSize || 24, paragraphSize: paragraphSize || 16 };
	}
	*/

	// ---------- Typography context menu ----------

	let typographyContextMenuEl = null;
	function ensureTypographyContextMenu() {
		if (typographyContextMenuEl) return typographyContextMenuEl;
		return typographyContextMenuEl = setupContextMenu('typography-context-menu',
			['Editar', 'Eliminar', 'Aplicar']);
	}

	function showTypographyContextMenu(x, y, index) {
		const menu = ensureTypographyContextMenu();
		const hist = loadTypographyHistory();
		const entry = hist[index];
		const isProtected = entry && entry.isProtected;

		showContextMenu(menu, x, y);

		// wire actions and update styling for protected entries
		Array.from(menu.children).forEach(child => {
			const action = child.dataset.action;

			if (isProtected && (action === 'eliminar')) {
				child.classList.add('disabled');
			} else {
				child.classList.remove('disabled');
			}

			child.onclick = function (ev) {
				handleTypographyContextAction(action, index);
				menu.hidden = true;
			};
		});
	}

	function handleTypographyContextAction(action, index) {
		const hist = loadTypographyHistory();
		const entry = hist[index];
		if (!entry) return;

		if (action === 'editar') {
			showTypographyEditModal(index, entry);
		} else if (action === 'eliminar') {
			if (entry.isProtected) {
				alert('Esta entrada está en uso y no se puede eliminar');
				return;
			}
			showTypographyDeleteModal(index);
		} else if (action === 'aplicar') {
			showTypographyApplyModal(index, entry);
		}
	}

	// Typography delete modal
	let typographyDeleteOverlay = null;
	function ensureTypographyDeleteModal() {
		if (typographyDeleteOverlay) return typographyDeleteOverlay;
		typographyDeleteOverlay = getElById('typography-delete-modal');

		// handlers
		typographyDeleteOverlay.querySelector('.btn-cancel').addEventListener('click',
			() => { typographyDeleteOverlay.hidden = true; });
		typographyDeleteOverlay.querySelector('.btn-confirm').addEventListener('click', () => {
			const idx = typographyDeleteOverlay.dataset.deleteIndex;
			try {
				const h = loadTypographyHistory();
				if (typeof idx !== 'undefined') {
					h.splice(parseInt(idx,10), 1);
					saveTypographyHistory(h);
					renderTypographyHistory();
				}
			} catch(e) { console.warn('Error eliminando entrada', e); }
			typographyDeleteOverlay.hidden = true;
		});

		return typographyDeleteOverlay;
	}

	function showTypographyDeleteModal(index) {
		const modal = ensureTypographyDeleteModal();
		modal.dataset.deleteIndex = index;
		modal.hidden = false;
	}

	// Typography edit modal
	let typoEditOverlay = null;
	function ensureTypographyEditModal() {
		if (typoEditOverlay) return typoEditOverlay;
		typoEditOverlay = getElById('typography-edit-modal');

		// handlers
		typoEditOverlay.querySelector('.btn-cancel').addEventListener('click',
			() => { typoEditOverlay.hidden = true; });
		typoEditOverlay.querySelector('.btn-confirm').addEventListener('click', () => {
			const errorDiv = getElById('typo-edit-error');

			// Validate pixel sizes (min 12, max 100)
			const titleVal = parseInt(getElById('typo-edit-title').value, 10);
			const subtitleVal = parseInt(getElById('typo-edit-subtitle').value, 10);
			const paragraphVal = parseInt(getElById('typo-edit-paragraph').value, 10);

			const isInvalid = (val) => isNaN(val) || val < 12 || val > 100;

			if (isInvalid(titleVal) || isInvalid(subtitleVal) || isInvalid(paragraphVal)) {
				// Show red error note
				if (errorDiv) errorDiv.style.display = 'block';
				return;
			}

			// Hide error if values are valid
			if (errorDiv) errorDiv.style.display = 'none';

			const hist = loadTypographyHistory();
			hist[index] = Object.assign({}, hist[index], {
				primary: getElById('typo-edit-primary').value,
				secondary: getElById('typo-edit-secondary').value,
				titleSize: titleVal,
				subtitleSize: subtitleVal,
				paragraphSize: paragraphVal,
				timestamp: Date.now()
			});
			saveTypographyHistory(hist);
			renderTypographyHistory();

			typoEditOverlay.hidden = true;
		});

		return typoEditOverlay;
	}
	function showTypographyEditModal(index, entry) {
		// Populate font selects
		const baseFonts = ['Poppins', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Playfair Display', 'Arial', 'Helvetica', 'Times New Roman'];
		const customNames = customFontsCache.map(f => 'custom:' + f.name);
		const allFonts = [...customNames, ...baseFonts];

		['typo-edit-primary', 'typo-edit-secondary'].forEach(id => {
			const sel = getElById(id);
			sel.innerHTML = '';
			allFonts.forEach(f => {
				const opt = createEl('option');
				opt.value = f;
				opt.textContent = formatFont(f);
				sel.appendChild(opt);
			});
		});

		// Set current values
		getElById('typo-edit-primary').value = entry.primary || 'Poppins';
		getElById('typo-edit-secondary').value = entry.secondary || 'Poppins';
		getElById('typo-edit-title').value = entry.titleSize || 56;
		getElById('typo-edit-subtitle').value = entry.subtitleSize || 36;
		getElById('typo-edit-paragraph').value = entry.paragraphSize || 15;

		typoEditOverlay.hidden = false;
	}

	// Typography apply modal
	let typoApplyOverlay = null;
	function ensureTypographyApplyModal() {
		if (typoApplyOverlay) return typoApplyOverlay;
		typoApplyOverlay = getElById('typography-apply-modal');

		// handlers
		typoApplyOverlay.querySelector('.btn-cancel').addEventListener('click',
			() => { typoApplyOverlay.hidden = true; });
		typoApplyOverlay.querySelector('.btn-confirm').addEventListener('click', () => {
			const idx = parseInt(typoApplyOverlay.dataset.applyIndex, 10);
			try {
				const h = loadTypographyHistory();
				const entry = h[idx];
				if (entry) {
					if (primarySelect) primarySelect.value = entry.primary || 'Poppins';
					if (secondarySelect) secondarySelect.value = entry.secondary || 'Poppins';
					if (titleSlider) titleSlider.value = entry.titleSize || 36;
					if (subtitleSlider) subtitleSlider.value = entry.subtitleSize || 24;
					if (paragraphSlider) paragraphSlider.value = entry.paragraphSize || 16;

					// Apply to iframe and preview
					const settings = {
						primary: entry.primary,
						secondary: entry.secondary,
						titleSize: entry.titleSize,
						subtitleSize: entry.subtitleSize,
						paragraphSize: entry.paragraphSize
					};
					applyTypographyToIframe(settings);
					updateTypographyPreview(settings);
					saveTypographySettings(settings);
				}
			} catch (e) { console.warn('Error aplicando tipografía', e); }

			typoApplyOverlay.hidden = true;
		});

		return typoApplyOverlay;
	}

	function showTypographyApplyModal(index, entry) {
		const modal = ensureTypographyApplyModal();
		modal.dataset.applyIndex = index;

		// Update preview typography
		const namePreviews = modal.querySelectorAll('.font-name');
		namePreviews.forEach(prev => {
			const name = entry[prev.dataset.name];
			if (name) {
				prev.textContent = name;
				prev.style.fontFamily = `'${name}', sans-serif`;
			}
		});
		const sizePreviews = modal.querySelectorAll('.font-size');
		sizePreviews.forEach(prev => {
			const size = entry[prev.dataset.size];
			if (size) {
				prev.textContent = size + 'px';
				prev.style.fontSize = size + 'px';
			}
		});

		modal.hidden = false;
	}

	// Initialize selects from saved settings
	(function initTypographyControls() {
		const saved = loadTypographySettings();
		if (!saved) return;

		const selectSaved = (select, fontName) => {
			if (select && fontName) {
				select.selectedIndex = Array.from(select.children).findIndex(
					opt => opt.value === fontName
				);
			}
		}

		selectSaved(primarySelect, saved.primary);
		selectSaved(secondarySelect, saved.secondary);
		refreshFontSelectors();

		if (titleSlider && typeof saved.titleSize !== 'undefined')
			titleSlider.value = saved.titleSize;
		if (subtitleSlider && typeof saved.subtitleSize !== 'undefined')
			subtitleSlider.value = saved.subtitleSize;
		if (paragraphSlider && typeof saved.paragraphSize !== 'undefined')
			paragraphSlider.value = saved.paragraphSize;

		// Apply saved immediately
		applyTypographyToIframe(saved);
	})();

	// Ensure history has a default entry if empty (preserve existing history)
	(function ensureInitialHistory() {
		try {
			saveTypographyHistory(loadTypographyHistory());
		} catch(e) { console.warn('No se pudo inicializar el historial de tipografías', e); }
		renderTypographyHistory();
	})();

});
