// Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
	// ---------- Display logged-in user ----------
	(function displayCurrentUser() {
		try {
			const session = loadSetting('admin_session') || {};
			const firstName = session.firstName || 'Admin';
			const lastName = session.lastName || 'User';
			const fullName = firstName + ' ' + lastName;

			const userNameEl = document.getElementById('user-name');
			const userAvatarEl = document.getElementById('user-avatar');

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

	// ---------- Color picker functionality (unchanged) ----------
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

		colorTextInputs.forEach((input, index) => {
			input.addEventListener('input', function() {
				let value = this.value;
				if (!value.startsWith('#')) {
					value = '#' + value;
				}
				value = value.toUpperCase();
				this.value = value;

				if (value.match(/^#[0-9A-F]{6}$/i) && colorInputs[index]) {
					colorInputs[index].value = value;
				}
			});

			input.addEventListener('focus', function () {
				if (!this.value.startsWith('#')) {
					this.value = '#' + this.value;
				}
			});
		});
	}

	// ---------- Reset buttons functionality ----------
	const resetButtons = document.querySelectorAll('.color-item .btn-reset');
	resetButtons.forEach((btn) => {
		btn.addEventListener('click', function () {
			const colorItem = this.closest('.color-item');
			if (!colorItem) return;

			const colorInput = colorItem.querySelector('input[type="color"]');
			const hexInput = colorItem.querySelector('input[type="text"][id$="-hex"]');

			// Reset to white
			const resetColor = '#ffffff';
			if (colorInput) colorInput.value = resetColor;
			if (hexInput) hexInput.value = resetColor;
		});
	});

	function getNewColors() {
		return {
			"accent-1": document.getElementById('color-1')?.value || '#fd18c0',
			"accent-2": document.getElementById('color-2')?.value || '#cb69f2',
			"foreground": document.getElementById('color-3')?.value || '#000000',
			"background": document.getElementById('color-4')?.value || '#ffffff',
			"background-shadowed": document.getElementById('color-5')?.value || '#f0f0f0'
		};
	}

	// Apply colors button
	const applyColorsBtn = document.getElementById('apply-colors');
	if (applyColorsBtn) {
		applyColorsBtn.addEventListener('click', function() {
			const colors = getNewColors();
			const paletteName = document.getElementById('palette-name')?.value || 'Sin nombre';

			// Aplicar colores al admin
			applySiteColors(document.documentElement, colors);

			// Aplicar colores al iframe (página principal)
			applyColorsToIframe(colors);

			// Persistir como paleta global (siteColors)
			try {
				const colorSettings = { ...colors,
										name: paletteName,
										timestamp: Date.now(),
										active: false };
				const ch = loadColorHistory();
				ch.push(colorSettings);
				saveColorHistory(ch);
				renderColorHistory();
			} catch(e) { console.warn('No se pudo guardar los colores en el historial', e); }

			try {
				if (window.BroadcastChannel) {
					const bc = new BroadcastChannel('admin-colors');
					bc.postMessage({
						type: 'colors-applied',
						colors: colors
					});
					bc.close();
				}
			} catch(e) {}

			alert('Colores aplicados correctamente');
		});
	}

	// Función mejorada para aplicar colores al iframe
	function applyColorsToIframe(colors) {
		const iframe = document.getElementById('site-preview');
		const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;

		if (!iframeDoc) return;

		// Aplicar variables CSS al iframe
		applySiteColors(iframeDoc.body, colors);
	}

	// ---------- Color history (fixed two entries) ----------
	function getFixedColorHistory(){
		return [
			{
				name: 'Original',
				type: 'normal',
				"accent-1": '#FD18C0',
				"accent-2": '#CB69F2',
				"foreground": '#000000',
				"background": '#FFFFFF',
				"background-shadowed": '#F0F0F0',
				timestamp: 0,
				active: true
			},
			{
				// Daltonic-friendly palette (colorblind-friendly)
				name: 'Original daltonismo',
				type: 'daltonism',
				"accent-1": '#FD18C0',
				"accent-2": '#CB69F2',
				"foreground": '#000000',
				"background": '#FFFFFF',
				"background-shadowed": '#E0E0E0',
				timestamp: 0,
				active: true
			},
			{
				name: 'Original oscuro',
				type: 'dark',
				"accent-1": '#FD18C0',
				"accent-2": '#CB69F2',
				"foreground": '#FFFFFF',
				"background": '#000000',
				"background-shadowed": '#202020',
				timestamp: 0,
				active: true
			}
		];
	}

	function loadColorHistory() {
		try {
			const ch = loadSetting('admin_color_history');
			if (!ch) {
				return getFixedColorHistory();
			}
			return ch;
		} catch(e) {
			return getFixedColorHistory();
		}
	}
	function saveColorHistory(arr) {
		try {
			saveSetting('admin_color_history', arr);
		} catch(e) { console.warn('No se pudo guardar el historial de colores', e); }
	}

	function renderColorHistory(){
		const tbody = document.querySelector('#colors-changes tbody');
		if (!tbody) return;
		const hist = loadColorHistory();
		tbody.innerHTML = '';
		hist.forEach((entry, idx) => {
			const tr = document.createElement('tr');

			const createTextCell = (content) => {
				const td = document.createElement('td');
				td.textContent = content || '';
				return td;
			}

			// Helper function to create color cell with preview box
			const createColorCell = (colorValue) => {
				const td = document.createElement('td');

				// Use a wrapper div for flexbox layout instead of td
				const wrapper = document.createElement('div');
				wrapper.class = "color-wrapper";

				const colorBox = document.createElement('span');
				colorBox.class = "color-swatch";
				colorBox.style.backgroundColor = colorValue || '#fff';

				const hexText = document.createElement('span');
				hexText.textContent = colorValue || '';

				wrapper.appendChild(colorBox);
				wrapper.appendChild(hexText);
				td.appendChild(wrapper);
				return td;
			};

			tr.appendChild(createTextCell( (idx + 1).toString() ));
			tr.appendChild(createTextCell(entry.name || 'Sin nombre'));

			for (let color of [
				entry["accent-1"], entry["accent-2"], entry["foreground"], entry["background"],
				entry["background-shadowed"] ]) {
				tr.appendChild(createColorCell(color));
			}

			tr.appendChild(createTextCell(entry.active ? '✓' : ''));

			tr.addEventListener('contextmenu', function(ev) {
				ev.preventDefault();
				showColorContextMenu(ev.pageX, ev.pageY, idx);
			});

			tbody.appendChild(tr);
		});
	}

	// Color context menu (separate instance)
	let colorContextMenuEl = null;
	function ensureColorContextMenu(){
		if (colorContextMenuEl) return colorContextMenuEl;
		colorContextMenuEl = document.createElement('div');
		colorContextMenuEl.id = 'color-context-menu';
		colorContextMenuEl.style.position = 'absolute';
		colorContextMenuEl.style.zIndex = 9999;
		colorContextMenuEl.style.background = '#fff';
		colorContextMenuEl.style.border = '1px solid #ccc';
		colorContextMenuEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
		colorContextMenuEl.style.padding = '6px 0';
		colorContextMenuEl.style.minWidth = '140px';
		colorContextMenuEl.style.display = 'none';
		const opts = ['Editar','Eliminar','Aplicar'];
		opts.forEach((label) => {
			const item = document.createElement('div');
			item.textContent = label;
			item.style.padding = '8px 12px';
			item.style.cursor = 'pointer';
			item.addEventListener('mouseenter', ()=> item.style.background = '#f0f0f0');
			item.addEventListener('mouseleave', ()=> item.style.background = 'transparent');
			item.dataset.action = label.toLowerCase();
			colorContextMenuEl.appendChild(item);
		});
		document.body.appendChild(colorContextMenuEl);
		document.addEventListener('click', function(){ if(colorContextMenuEl) colorContextMenuEl.style.display = 'none'; });
		document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && colorContextMenuEl) colorContextMenuEl.style.display = 'none'; });
		return colorContextMenuEl;
	}

	function showColorContextMenu(x, y, index){
		const menu = ensureColorContextMenu();
		const isActive = loadColorHistory()[index]?.active;

		menu.style.left = x + 'px';
		menu.style.top = y + 'px';
		menu.style.display = 'block';

		const {top, height} = menu.getBoundingClientRect();
		const windowHeight = document.documentElement.clientHeight;
		if (top + height > windowHeight) {
			menu.style.top = y - top + windowHeight - height + 'px';
		}

		Array.from(menu.children).forEach(child => {
			const action = child.dataset.action;

			if (isActive && (action === 'eliminar')) {
				child.style.opacity = '0.4';
				child.style.cursor = 'not-allowed';
				child.style.pointerEvents = 'none';
			} else {
				child.style.opacity = '1';
				child.style.cursor = 'pointer';
				child.style.pointerEvents = 'auto';
			}

			child.onclick = function(ev){
				handleColorContextAction(action, index);
				menu.style.display = 'none';
			};
		});
	}

	function handleColorContextAction(action, index){
		const hist = loadColorHistory();
		const entry = hist[index];
		if (!entry) return;

		if (action === 'editar') {
			try {
				const h = loadColorHistory();
				const newEntry = Object.assign(getNewColors(), { timestamp: Date.now() });
				h[index] = newEntry;
				saveColorHistory(h);
				renderColorHistory();
				// apply and update previews
				applyColorsToUI(newEntry);
				alert('Entrada de color actualizada con los valores actuales.');
			} catch(e) { console.warn('Error actualizando entrada de color', e); }
		} else if (action === 'eliminar') {
			if (entry.active) {
				alert('Esta entrada está en uso y no se puede eliminar.');
				return;
			}
			showColorDeleteConfirmation(index);
		} else if (action === 'aplicar') {
			applyColorsToUI(entry);
			applyColorsToIframe(entry);
			try {
				saveSetting('siteColors', entry);
			} catch(e) {}
			alert('Configuración de colores aplicada desde el historial.');
		}
	}

	// Color delete confirmation modal
	let colorConfirmOverlay = null;
	function ensureColorConfirmModal(){
		if (colorConfirmOverlay) return colorConfirmOverlay;
		colorConfirmOverlay = document.createElement('div');
		colorConfirmOverlay.className = 'admin-confirm-overlay';
		colorConfirmOverlay.innerHTML = `
			<div class="admin-confirm" role="dialog" aria-modal="true">
				<h3>Confirmar eliminación (colores)</h3>
				<p>¿Eliminar esta entrada del historial de colores?</p>
				<div class="confirm-actions">
					<button class="btn-cancel">Cancelar</button>
					<button class="btn-confirm">Eliminar</button>
				</div>
			</div>`;
		document.body.appendChild(colorConfirmOverlay);
		// Apply high-contrast inline styles so modal is visible regardless of theme colors
		try {
			colorConfirmOverlay.style.position = 'fixed';
			colorConfirmOverlay.style.left = '0';
			colorConfirmOverlay.style.top = '0';
			colorConfirmOverlay.style.right = '0';
			colorConfirmOverlay.style.bottom = '0';
			colorConfirmOverlay.style.display = 'none';
			colorConfirmOverlay.style.alignItems = 'center';
			colorConfirmOverlay.style.justifyContent = 'center';
			colorConfirmOverlay.style.background = 'rgba(0,0,0,0.36)';
			colorConfirmOverlay.style.zIndex = '10000';

			const dialog = colorConfirmOverlay.querySelector('.admin-confirm');
			if (dialog) {
				dialog.style.background = '#ffffff';
				dialog.style.color = '#111111';
				dialog.style.padding = '20px';
				dialog.style.borderRadius = '8px';
				dialog.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
				dialog.style.maxWidth = '520px';
				dialog.style.width = '90%';
			}

			const btnCancel = colorConfirmOverlay.querySelector('.btn-cancel');
			const btnConfirm = colorConfirmOverlay.querySelector('.btn-confirm');
			if (btnCancel) {
				btnCancel.style.background = '#f0f0f0';
				btnCancel.style.color = '#111111';
				btnCancel.style.border = '1px solid rgba(0,0,0,0.08)';
				btnCancel.style.padding = '8px 12px';
				btnCancel.style.borderRadius = '4px';
				btnCancel.style.cursor = 'pointer';
			}
			if (btnConfirm) {
				btnConfirm.style.background = '#e53935';
				btnConfirm.style.color = '#ffffff';
				btnConfirm.style.border = 'none';
				btnConfirm.style.padding = '8px 12px';
				btnConfirm.style.borderRadius = '4px';
				btnConfirm.style.cursor = 'pointer';
			}

			const actions = colorConfirmOverlay.querySelector('.confirm-actions');
			if (actions) {
				actions.style.display = 'flex';
				actions.style.gap = '8px';
				actions.style.justifyContent = 'flex-end';
				actions.style.marginTop = '12px';
			}
		} catch(e) {}

		// handlers
		colorConfirmOverlay.querySelector('.btn-cancel').addEventListener('click', ()=>{ colorConfirmOverlay.style.display = 'none'; });
		colorConfirmOverlay.querySelector('.btn-confirm').addEventListener('click', ()=>{
			const idx = colorConfirmOverlay.dataset.deleteIndex;
			try {
				const h = loadColorHistory();
				if (typeof idx !== 'undefined') {
					h.splice(parseInt(idx,10), 1);
					saveColorHistory(h);
					renderColorHistory();
				}
			} catch(e) { console.warn('Error eliminando entrada de colores', e); }
			colorConfirmOverlay.style.display = 'none';
		});

		return colorConfirmOverlay;
	}

	function showColorDeleteConfirmation(index){
		const modal = ensureColorConfirmModal();
		modal.dataset.deleteIndex = index;
		// ensure inline styles enforced before showing
		modal.style.display = 'flex';
	}

	// ---------- Color Edit Confirmation Modal ----------
	let colorEditOverlay = null;
	function ensureColorEditModal() {
		if (colorEditOverlay) return colorEditOverlay;
		colorEditOverlay = document.createElement('div');
		colorEditOverlay.className = 'admin-confirm-overlay';
		colorEditOverlay.innerHTML = `
			<div class="admin-confirm" role="dialog" aria-modal="true">
				<h3>Editar Paleta de Colores</h3>
				<p>Ingresa un nuevo nombre para esta paleta:</p>
				<input type="text" id="edit-palette-name" class="form-control" placeholder="Nombre de la paleta" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 6px;">
				<div class="confirm-actions">
					<button class="btn-cancel">Cancelar</button>
					<button class="btn-confirm" style="background: #1B73E8 !important;">Guardar</button>
				</div>
			</div>`;
		document.body.appendChild(colorEditOverlay);

		// Apply styles
		colorEditOverlay.style.position = 'fixed';
		colorEditOverlay.style.left = '0';
		colorEditOverlay.style.top = '0';
		colorEditOverlay.style.right = '0';
		colorEditOverlay.style.bottom = '0';
		colorEditOverlay.style.display = 'none';
		colorEditOverlay.style.alignItems = 'center';
		colorEditOverlay.style.justifyContent = 'center';
		colorEditOverlay.style.background = 'rgba(0,0,0,0.36)';
		colorEditOverlay.style.zIndex = '10000';

		const dialog = colorEditOverlay.querySelector('.admin-confirm');
		if (dialog) {
			dialog.style.background = '#ffffff';
			dialog.style.color = '#111111';
			dialog.style.padding = '20px';
			dialog.style.borderRadius = '8px';
			dialog.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
			dialog.style.maxWidth = '520px';
			dialog.style.width = '90%';
		}

		const btnCancel = colorEditOverlay.querySelector('.btn-cancel');
		const btnConfirm = colorEditOverlay.querySelector('.btn-confirm');
		if (btnCancel) {
			btnCancel.style.background = '#f0f0f0';
			btnCancel.style.color = '#111111';
			btnCancel.style.border = '1px solid rgba(0,0,0,0.08)';
			btnCancel.style.padding = '8px 12px';
			btnCancel.style.borderRadius = '4px';
			btnCancel.style.cursor = 'pointer';
		}
		if (btnConfirm) {
			btnConfirm.style.background = '#1B73E8';
			btnConfirm.style.color = '#ffffff';
			btnConfirm.style.border = 'none';
			btnConfirm.style.padding = '8px 12px';
			btnConfirm.style.borderRadius = '4px';
			btnConfirm.style.cursor = 'pointer';
		}

		const actions = colorEditOverlay.querySelector('.confirm-actions');
		if (actions) {
			actions.style.display = 'flex';
			actions.style.gap = '8px';
			actions.style.justifyContent = 'flex-end';
			actions.style.marginTop = '12px';
		}

		// Handlers
		colorEditOverlay.querySelector('.btn-cancel').addEventListener('click', () => { colorEditOverlay.style.display = 'none'; });
		colorEditOverlay.querySelector('.btn-confirm').addEventListener('click', () => {
			const idx = parseInt(colorEditOverlay.dataset.editIndex, 10);
			const newName = colorEditOverlay.querySelector('#edit-palette-name').value.trim() || 'Sin nombre';
			try {
				const h = loadColorHistory();
				if (h[idx]) {
					h[idx].name = newName;
					h[idx].timestamp = Date.now();
					saveColorHistory(h);
					renderColorHistory();
				}
			} catch (e) { console.warn('Error editando entrada de colores', e); }
			colorEditOverlay.style.display = 'none';
		});

		return colorEditOverlay;
	}

	function showColorEditConfirmation(index, entry) {
		const modal = ensureColorEditModal();
		modal.dataset.editIndex = index;
		modal.querySelector('#edit-palette-name').value = entry.name || '';
		modal.style.display = 'flex';
	}

	// ---------- Color Apply Confirmation Modal ----------
	let colorApplyOverlay = null;
	function ensureColorApplyModal() {
		if (colorApplyOverlay) return colorApplyOverlay;
		colorApplyOverlay = document.createElement('div');
		colorApplyOverlay.className = 'admin-confirm-overlay';
		colorApplyOverlay.innerHTML = `
			<div class="admin-confirm" role="dialog" aria-modal="true">
				<h3>Aplicar Paleta de Colores</h3>
				<p>¿Estás seguro de que deseas aplicar esta paleta de colores?</p>
				<div class="palette-preview" style="display: flex; gap: 8px; margin: 15px 0;">
					<div class="preview-color" data-color="primary" style="width: 40px; height: 40px; border-radius: 6px; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.15);"></div>
					<div class="preview-color" data-color="secondary" style="width: 40px; height: 40px; border-radius: 6px; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.15);"></div>
					<div class="preview-color" data-color="accent" style="width: 40px; height: 40px; border-radius: 6px; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.15);"></div>
					<div class="preview-color" data-color="neutral" style="width: 40px; height: 40px; border-radius: 6px; border: 2px solid #ddd; box-shadow: 0 2px 6px rgba(0,0,0,0.15);"></div>
				</div>
				<div class="confirm-actions">
					<button class="btn-cancel">Cancelar</button>
					<button class="btn-confirm" style="background: #34A853 !important;">Aplicar</button>
				</div>
			</div>`;
		document.body.appendChild(colorApplyOverlay);

		// Apply styles
		colorApplyOverlay.style.position = 'fixed';
		colorApplyOverlay.style.left = '0';
		colorApplyOverlay.style.top = '0';
		colorApplyOverlay.style.right = '0';
		colorApplyOverlay.style.bottom = '0';
		colorApplyOverlay.style.display = 'none';
		colorApplyOverlay.style.alignItems = 'center';
		colorApplyOverlay.style.justifyContent = 'center';
		colorApplyOverlay.style.background = 'rgba(0,0,0,0.36)';
		colorApplyOverlay.style.zIndex = '10000';

		const dialog = colorApplyOverlay.querySelector('.admin-confirm');
		if (dialog) {
			dialog.style.background = '#ffffff';
			dialog.style.color = '#111111';
			dialog.style.padding = '20px';
			dialog.style.borderRadius = '8px';
			dialog.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
			dialog.style.maxWidth = '520px';
			dialog.style.width = '90%';
		}

		const btnCancel = colorApplyOverlay.querySelector('.btn-cancel');
		const btnConfirm = colorApplyOverlay.querySelector('.btn-confirm');
		if (btnCancel) {
			btnCancel.style.background = '#f0f0f0';
			btnCancel.style.color = '#111111';
			btnCancel.style.border = '1px solid rgba(0,0,0,0.08)';
			btnCancel.style.padding = '8px 12px';
			btnCancel.style.borderRadius = '4px';
			btnCancel.style.cursor = 'pointer';
		}
		if (btnConfirm) {
			btnConfirm.style.background = '#34A853';
			btnConfirm.style.color = '#ffffff';
			btnConfirm.style.border = 'none';
			btnConfirm.style.padding = '8px 12px';
			btnConfirm.style.borderRadius = '4px';
			btnConfirm.style.cursor = 'pointer';
		}

		const actions = colorApplyOverlay.querySelector('.confirm-actions');
		if (actions) {
			actions.style.display = 'flex';
			actions.style.gap = '8px';
			actions.style.justifyContent = 'flex-end';
			actions.style.marginTop = '12px';
		}

		// Handlers
		colorApplyOverlay.querySelector('.btn-cancel').addEventListener('click', () => { colorApplyOverlay.style.display = 'none'; });
		colorApplyOverlay.querySelector('.btn-confirm').addEventListener('click', () => {
			const idx = parseInt(colorApplyOverlay.dataset.applyIndex, 10);
			try {
				const h = loadColorHistory();
				const entry = h[idx];
				if (entry) {
					applyColorsToUI(entry);
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
			colorApplyOverlay.style.display = 'none';
		});

		return colorApplyOverlay;
	}

	function showColorApplyConfirmation(index, entry) {
		const modal = ensureColorApplyModal();
		modal.dataset.applyIndex = index;

		// Update preview colors
		const previews = modal.querySelectorAll('.preview-color');
		previews.forEach(p => {
			const colorType = p.dataset.color;
			if (entry[colorType]) p.style.backgroundColor = entry[colorType];
		});

		modal.style.display = 'flex';
	}

	function applyColorsToUI(colors){
		if (!colors) return;

		applySiteColors(document.documentElement, colors);

		// update inputs & previews
		let idx = 1;
		for (let color of ["accent-1", "accent-2", "foreground",
						"background", "background-shadowed"]) {
			try {
				const colorInput = document.getElementById(`color-${idx}`);
				const parent = colorInput.closest('.color-item');
				const hexInput = parent.querySelector('input[type="text"][id$="-hex"]');

				color = colors[color] || '';
				colorInput.value = color;
				if (hexInput) hexInput.value = color;
			} catch(e) {}
			++idx;
		}
	}

	// Initialize color controls from saved settings
	(function initColorControls() {
		try {
			const colors = loadSetting('siteColors');
			if (colors) applyColorsToUI(colors);
		} catch(e) { console.warn('No se pudo inicializar controles de color', e); }

		// Listen for BroadcastChannel messages from other admin instances
		try {
			if (window.BroadcastChannel) {
				const bc = new BroadcastChannel('admin-colors');
				bc.onmessage = function(ev) {
					try { if(ev.data && ev.data.type === 'colors-applied' && ev.data.colors) {
						applyColorsToUI(ev.data.colors);
					}} catch(e) {}
				};
			}
		} catch(e) {}

		// ensure there is at least one history entry
		try {
			saveColorHistory(loadColorHistory());
		} catch(e) {}
		renderColorHistory();
	})();

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

	// Cache for loaded custom fonts
	let customFontsCache = [];

	// Load custom fonts, update selectors, and re-render history
	function loadAndRefreshCustomFonts() {
		loadCustomFonts().then(fonts => {
			customFontsCache = fonts;
			refreshFontSelectors();
			// Re-render history to apply font styles now that fonts are loaded
			if (typeof renderHistory === 'function') {
				renderHistory();
			}
		}).catch(e => {
			console.warn('Error cargando fuentes personalizadas:', e);
		});
	}

	// Refresh font selectors to include custom fonts
	function refreshFontSelectors() {
		const primarySelect = document.getElementById('primary-font');
		const secondarySelect = document.getElementById('secondary-font');
		if (!primarySelect || !secondarySelect) return;

		const baseFonts = ['Poppins', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Playfair Display', 'Arial', 'Helvetica', 'Times New Roman'];
		const customNames = customFontsCache.map(f => f.name);

		const currentPrimary = primarySelect.value;
		const currentSecondary = secondarySelect.value;

		// Helper to populate a select
		const populate = (select, current) => {
			select.innerHTML = '';
			// Add custom fonts first (with prefix indicator)
			customNames.forEach(name => {
				const opt = document.createElement('option');
				opt.value = 'custom:' + name;
				opt.textContent = '⭐ ' + name;
				if (current === 'custom:' + name) opt.selected = true;
				select.appendChild(opt);
			});
			// Add separator if there are custom fonts
			if (customNames.length > 0) {
				const sep = document.createElement('option');
				sep.disabled = true;
				sep.textContent = '─────────────────';
				select.appendChild(sep);
			}
			// Add base fonts
			baseFonts.forEach(name => {
				const opt = document.createElement('option');
				opt.value = name;
				opt.textContent = name;
				if (current === name) opt.selected = true;
				select.appendChild(opt);
			});
		};

		populate(primarySelect, currentPrimary);
		populate(secondarySelect, currentSecondary);
	}

	// Handle font file upload
	const fontFileInput = document.getElementById('font-file-input');
	const btnUploadFont = document.getElementById('btn-upload-font');

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

	// Initialize custom fonts on page load
	loadAndRefreshCustomFonts();

	// ---------- Typography preview and persistence (new) ----------
	const iframe = document.getElementById('site-preview');
	const primarySelect = document.getElementById('primary-font');
	const secondarySelect = document.getElementById('secondary-font');
	const applyTypoBtn = document.getElementById('apply-typography');
	const storageKey = 'admin_typography_settings';
	const historyKey = 'admin_typography_history';

	// Sliders for sizes (if present)
	const titleSlider = document.getElementById('title-size');
	const subtitleSlider = document.getElementById('subtitle-size');
	const paragraphSlider = document.getElementById('paragraph-size');

	function safeGetIframeDoc(){
		try { return iframe?.contentDocument || iframe?.contentWindow?.document; }
		catch(e){ console.warn('No se puede acceder al iframe:', e); return null; }
	}

	function normFontName(f){ return (f||'').split(',')[0].replace(/["']/g,'').trim(); }

	function detectFontsFromIframe(){
		const doc = safeGetIframeDoc();
		if (!doc) return { primary: 'Poppins', secondary: 'Poppins' };
		const body = doc.body;
		const bodyFont = normFontName(getComputedStyle(body).getPropertyValue('font-family')) || 'Poppins';
		// Titles are h2 on this site, use first h2 to detect title font
		const h2 = doc.querySelector('h2');
		const h2Font = h2 ? normFontName(getComputedStyle(h2).getPropertyValue('font-family')) : bodyFont;
		return { primary: h2Font, secondary: bodyFont };
	}

	function detectSizesFromIframe(){
		const doc = safeGetIframeDoc();
		// Defaults adjusted to the site's original sizes
		if (!doc) return { titleSize: 36, subtitleSize: 24, paragraphSize: 16 };
		function pxToInt(v){ try{ return Math.round(parseFloat(v)); }catch(e){return undefined;} }
		// Titles are h2, subtitles are h4, paragraphs are p
		const h2 = doc.querySelector('h2');
		const h4 = doc.querySelector('h4');
		const p = doc.querySelector('p');
		const titleSize = h2 ? pxToInt(getComputedStyle(h2).getPropertyValue('font-size')) : undefined;
		const subtitleSize = h4 ? pxToInt(getComputedStyle(h4).getPropertyValue('font-size')) : undefined;
		const paragraphSize = p ? pxToInt(getComputedStyle(p).getPropertyValue('font-size')) : undefined;
		return { titleSize: titleSize || 36, subtitleSize: subtitleSize || 24, paragraphSize: paragraphSize || 16 };
	}

	function populateFontSelect(selectEl, current){
		if (!selectEl) return;
		const fallback = ['Poppins','Roboto','Open Sans','Montserrat','Lato','Playfair Display','Arial','Helvetica','Times New Roman'];
		selectEl.innerHTML = '';
		const add = (name) => { const o = document.createElement('option'); o.value = name; o.textContent = name; selectEl.appendChild(o); };
		add(current);
		fallback.forEach(f => { if (f !== current) add(f); });
	}

	function applyTypographyToIframe(settings) {
		const doc = safeGetIframeDoc();
		if (!doc) return;

		applySiteFonts(doc, settings);

		/*
		// Apply families: primary -> titles (h2), secondary -> subtitles (h4) and paragraphs
		if (settings.secondary) doc.body.style.fontFamily = settings.secondary + ', sans-serif';
		if (settings.primary) {
			doc.querySelectorAll('h2').forEach(h => { h.style.fontFamily = settings.primary + ', serif'; });
		}
		if (settings.secondary) {
			doc.querySelectorAll('h4').forEach(h => { h.style.fontFamily = settings.secondary + ', sans-serif'; });
			doc.querySelectorAll('p').forEach(pel => { pel.style.fontFamily = settings.secondary + ', sans-serif'; });
		}

		// apply sizes if provided to all matching elements
		if (typeof settings.titleSize !== 'undefined') {
			doc.querySelectorAll('h2').forEach(h => h.style.fontSize = settings.titleSize + 'px');
		}
		if (typeof settings.subtitleSize !== 'undefined') {
			doc.querySelectorAll('h4').forEach(h => h.style.fontSize = settings.subtitleSize + 'px');
		}
		if (typeof settings.paragraphSize !== 'undefined') {
			doc.querySelectorAll('p').forEach(pel => pel.style.fontSize = settings.paragraphSize + 'px');
		}
		*/
	}

	function loadTypographySettings(){
		try {
			return loadSetting(storageKey);
		} catch(e) { return null; }
	}

	function saveTypographySettings(fontSettings){
		try {
			saveSetting(storageKey, fontSettings);
		} catch(e){ console.warn('No se pudo guardar la configuración de tipografía', e); }
	}

	// ---------- History storage & rendering ----------
	function loadHistory() {
		try {
			return loadSetting(historyKey) || [];
		} catch(e) { return []; }
	}
	function saveHistory(arr) {
		try {
			saveSetting(historyKey, arr);
		} catch(e) { console.warn('No se pudo guardar el historial de tipografía', e); }
	}

	function renderHistory(){
		const tbody = document.querySelector('#typography-changes tbody');
		if (!tbody) return;
		const hist = loadHistory();
		tbody.innerHTML = '';
		hist.forEach((entry, idx) => {
			const tr = document.createElement('tr');

			// Style protected row
			if (entry.isProtected) {
				tr.style.background = 'linear-gradient(90deg, #e8f5e9 0%, #f1f8e9 100%)';
			}

			// ID with lock icon for protected
			const idTd = document.createElement('td');
			idTd.textContent = entry.isProtected ? '? ' + (idx + 1) : (idx + 1).toString();
			idTd.style.fontWeight = entry.isProtected ? 'bold' : 'normal';
			tr.appendChild(idTd);

			// Format font names (show star for custom fonts) and apply font style
			const formatFont = (f) => {
				if (!f) return '';
				if (f.startsWith('custom:')) return '⭐ ' + f.replace('custom:', '');
				return f;
			};

			// Get the actual font family name for styling
			const getFontFamily = (f) => {
				if (!f) return 'inherit';
				if (f.startsWith('custom:')) {
					const customName = f.replace('custom:', '');
					// Inject custom font if available
					const fontData = customFontsCache.find(cf => cf.name === customName);
					if (fontData && fontData.blob) {
						injectCustomFontFace(document, customName, fontData.blob);
					}
					return `'${customName}', sans-serif`;
				}
				// Inject Google font into admin document
				injectGoogleFont(document, f);
				return `'${f}', sans-serif`;
			};

			// Primary font cell - styled with the font itself
			const pTd = document.createElement('td');
			pTd.textContent = formatFont(entry.primary);
			pTd.style.fontFamily = getFontFamily(entry.primary);
			tr.appendChild(pTd);

			// Secondary font cell - styled with the font itself
			const sTd = document.createElement('td');
			sTd.textContent = formatFont(entry.secondary);
			sTd.style.fontFamily = getFontFamily(entry.secondary);
			tr.appendChild(sTd);


			const tTd = document.createElement('td');
			tTd.textContent = (entry.titleSize || '') + 'px';
			if (entry.titleSize) tTd.style.fontSize = entry.titleSize + 'px';
			tr.appendChild(tTd);

			const subTd = document.createElement('td');
			subTd.textContent = (entry.subtitleSize || '') + 'px';
			if (entry.subtitleSize) subTd.style.fontSize = entry.subtitleSize + 'px';
			tr.appendChild(subTd);

			const parTd = document.createElement('td');
			parTd.textContent = (entry.paragraphSize || '') + 'px';
			if (entry.paragraphSize) parTd.style.fontSize = entry.paragraphSize + 'px';
			tr.appendChild(parTd);

			const timeTd = document.createElement('td'); timeTd.textContent = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '';
			tr.appendChild(timeTd);


			/*
			for (let content of [(idx+1).toString(), entry.primary, entry.secondary,
								(entry.titleSize || '') + 'px', (entry.subtitleSize || '') + 'px',
								(entry.paragraphSize || '') + 'px',
								entry.timestamp && new Date(entry.timestamp).toLocaleString()] ) {
				const td = document.createElement('td');
				td.textContent = content || '';
				tr.appendChild(td);
			}
			*/

			// attach context menu handler to row
			tr.addEventListener('contextmenu', function(ev) {
				ev.preventDefault();
				showContextMenu(ev.pageX, ev.pageY, idx);
			});
			tbody.appendChild(tr);
		});
	}

	// Create a simple context menu DOM (single instance)
	let contextMenuEl = null;
	function ensureContextMenu(){
		if(contextMenuEl) return contextMenuEl;
		contextMenuEl = document.createElement('div');
		contextMenuEl.id = 'typography-context-menu';
		contextMenuEl.style.position = 'absolute';
		contextMenuEl.style.zIndex = 9999;
		contextMenuEl.style.background = '#fff';
		contextMenuEl.style.border = '1px solid #ccc';
		contextMenuEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
		contextMenuEl.style.padding = '6px 0';
		contextMenuEl.style.minWidth = '140px';
		contextMenuEl.style.display = 'none';
		const opts = ['Editar','Eliminar','Aplicar'];
		opts.forEach((label, i) => {
			const item = document.createElement('div');
			item.textContent = label;
			item.style.padding = '8px 12px';
			item.style.cursor = 'pointer';
			item.addEventListener('mouseenter', ()=> item.style.background = '#f0f0f0');
			item.addEventListener('mouseleave', ()=> item.style.background = 'transparent');
			item.dataset.action = label.toLowerCase();
			contextMenuEl.appendChild(item);
		});
		document.body.appendChild(contextMenuEl);
		// global click to hide
		document.addEventListener('click', function(){ if(contextMenuEl) contextMenuEl.style.display = 'none'; });
		document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && contextMenuEl) contextMenuEl.style.display = 'none'; });
		return contextMenuEl;
	}

	function showContextMenu(x,y,index){
		const menu = ensureContextMenu();
		const hist = loadHistory();
		const entry = hist[index];
		const isProtected = entry && entry.isProtected;

		menu.style.left = x + 'px';
		menu.style.top = y + 'px';
		menu.style.display = 'block';

		// wire actions and update styling for protected entries
		Array.from(menu.children).forEach(child => {
			const action = child.dataset.action;

			// Disable edit/delete for protected entries
			if (isProtected && (action === 'editar' || action === 'eliminar')) {
				child.style.color = '#aaa';
				child.style.cursor = 'not-allowed';
			} else {
				child.style.color = '#333';
				child.style.cursor = 'pointer';
			}

			child.onclick = function (ev) {
				handleTypographyContextAction(action, index);
				menu.style.display = 'none';
			};
		});
	}

	/*
	function handleContextAction(action, index) {
		const hist = loadHistory();
		const entry = hist[index];
		if (!entry) return;

		if (action === 'editar') {
			// Overwrite this history entry with current control values (save what is currently set)
			try {
				const h = loadHistory();
				const newEntry = Object.assign(getNewFontSettings(), { timestamp: Date.now() });
				h[index] = newEntry;
				saveHistory(h);
				renderHistory();

				// apply and update previews
				saveTypographySettings(entry);
				applyTypographyToIframe(entry);
				updateAdminPreview(entry);

				alert('Entrada de tipografía actualizada con los valores actuales.');
			} catch(e) { console.warn('Error actualizando entrada de tipografía', e); }
		} else if (action === 'eliminar') {
			showDeleteConfirmation(index);
		} else if (action === 'aplicar') {
			try {
				saveTypographySettings(entry);
				applyTypographyToIframe(entry);
				updateAdminPreview(entry);
			} catch(e) {}

			alert('Configuración de tipografía aplicada desde el historial.');
		}
	}
	*/

	// ---------- Styled confirmation modal for delete ----------
	let confirmOverlay = null;
	function ensureConfirmModal() {
		if (confirmOverlay) return confirmOverlay;
		confirmOverlay = document.createElement('div');
		confirmOverlay.className = 'admin-confirm-overlay';
		confirmOverlay.innerHTML = `
			<div class="admin-confirm" role="dialog" aria-modal="true">
				<h3>Confirmar eliminación</h3>
				<p>¿Estás seguro de que deseas eliminar esta entrada del historial? Esta acción no se puede deshacer.</p>
				<div class="confirm-actions">
					<button class="btn-cancel">Cancelar</button>
					<button class="btn-confirm">Eliminar</button>
				</div>
			</div>`;
		document.body.appendChild(confirmOverlay);
		try {
			confirmOverlay.style.position = 'fixed';
			confirmOverlay.style.left = '0';
			confirmOverlay.style.top = '0';
			confirmOverlay.style.right = '0';
			confirmOverlay.style.bottom = '0';
			confirmOverlay.style.display = 'none';
			confirmOverlay.style.alignItems = 'center';
			confirmOverlay.style.justifyContent = 'center';
			confirmOverlay.style.background = 'rgba(0,0,0,0.36)';
			confirmOverlay.style.zIndex = '10000';

			const dialog = confirmOverlay.querySelector('.admin-confirm');
			if (dialog) {
				dialog.style.background = '#ffffff';
				dialog.style.color = '#111111';
				dialog.style.padding = '20px';
				dialog.style.borderRadius = '8px';
				dialog.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
				dialog.style.maxWidth = '520px';
				dialog.style.width = '90%';
			}

			const btnCancel = confirmOverlay.querySelector('.btn-cancel');
			const btnConfirm = confirmOverlay.querySelector('.btn-confirm');
			if (btnCancel) {
				btnCancel.style.background = '#f0f0f0';
				btnCancel.style.color = '#111111';
				btnCancel.style.border = '1px solid rgba(0,0,0,0.08)';
				btnCancel.style.padding = '8px 12px';
				btnCancel.style.borderRadius = '4px';
				btnCancel.style.cursor = 'pointer';
			}
			if (btnConfirm) {
				btnConfirm.style.background = '#e53935';
				btnConfirm.style.color = '#ffffff';
				btnConfirm.style.border = 'none';
				btnConfirm.style.padding = '8px 12px';
				btnConfirm.style.borderRadius = '4px';
				btnConfirm.style.cursor = 'pointer';
			}

			const actions = confirmOverlay.querySelector('.confirm-actions');
			if (actions) {
				actions.style.display = 'flex';
				actions.style.gap = '8px';
				actions.style.justifyContent = 'flex-end';
				actions.style.marginTop = '12px';
			}
		} catch(e) { /* ignore style application errors */ }

		// handlers
		confirmOverlay.querySelector('.btn-cancel').addEventListener('click', ()=>{ confirmOverlay.style.display = 'none'; });
		confirmOverlay.querySelector('.btn-confirm').addEventListener('click', ()=>{
			const idx = confirmOverlay.dataset.deleteIndex;
			try {
				const h = loadHistory();
				if (typeof idx !== 'undefined'){
					h.splice(parseInt(idx,10), 1);
					saveHistory(h);
					renderHistory();
				}
			} catch(e) { console.warn('Error eliminando entrada', e); }
			confirmOverlay.style.display = 'none';
		});

		return confirmOverlay;
	}

	// ---------- Typography Context Actions ----------
	function handleTypographyContextAction(action, index) {
		const hist = loadHistory();
		const entry = hist[index];
		if (!entry) return;

		// Block edit and delete for protected entry (index 0 = ID 1)
		if (entry.isProtected && (action === 'editar' || action === 'eliminar')) {
			alert('Esta entrada es la original y no se puede ' + (action === 'editar' ? 'editar' : 'eliminar') + '.');
			return;
		}

		if (action === 'editar') {
			showTypographyEditModal(index, entry);
		} else if (action === 'eliminar') {
			showDeleteConfirmation(index);
		} else if (action === 'aplicar') {
			showTypographyApplyModal(index, entry);
		}
	}

	// ---------- Typography Edit Modal ----------
	let typoEditOverlay = null;
	function showTypographyEditModal(index, entry) {
		if (!typoEditOverlay) {
			typoEditOverlay = document.createElement('div');
			typoEditOverlay.className = 'admin-confirm-overlay';
			typoEditOverlay.innerHTML = `
				<div class="admin-confirm" role="dialog" aria-modal="true">
					<h3>Editar Tipografía</h3>
					<div style="margin: 16px 0;">
						<label style="display:block;margin-bottom:8px;font-weight:500;">Fuente Principal:</label>
						<select id="typo-edit-primary" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;"></select>
					</div>
					<div style="margin: 16px 0;">
						<label style="display:block;margin-bottom:8px;font-weight:500;">Fuente Secundaria:</label>
						<select id="typo-edit-secondary" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;"></select>
					</div>
					<div style="margin: 16px 0;">
						<label style="display:block;margin-bottom:8px;font-weight:500;">Tamaño Títulos (px):</label>
						<input type="number" id="typo-edit-title" min="12" max="100" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;">
					</div>
					<div style="margin: 16px 0;">
						<label style="display:block;margin-bottom:8px;font-weight:500;">Tamaño Subtítulos (px):</label>
						<input type="number" id="typo-edit-subtitle" min="12" max="100" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;">
					</div>
					<div style="margin: 16px 0;">
						<label style="display:block;margin-bottom:8px;font-weight:500;">Tamaño Párrafos (px):</label>
						<input type="number" id="typo-edit-paragraph" min="12" max="100" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;">
					</div>
					<div id="typo-edit-error" style="display:none;background:#ffe0e0;color:#c62828;padding:10px;border-radius:4px;margin-bottom:12px;font-size:14px;border:1px solid #ef9a9a;">
						⚠️ Los tamaños deben estar entre 12px y 100px.
					</div>
					<div class="confirm-actions" style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">
						<button class="btn-cancel" style="background:#f0f0f0;color:#111;border:1px solid rgba(0,0,0,0.08);padding:8px 12px;border-radius:4px;cursor:pointer;">Cancelar</button>
						<button class="btn-confirm" style="background:#1b73e8;color:#fff;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;">Guardar</button>
					</div>
				</div>`;
			typoEditOverlay.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.36);z-index:10000;';
			const dialog = typoEditOverlay.querySelector('.admin-confirm');
			dialog.style.cssText = 'background:#fff;color:#111;padding:20px;border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,0.2);max-width:400px;width:90%;max-height:80vh;overflow-y:auto;';
			document.body.appendChild(typoEditOverlay);

			typoEditOverlay.querySelector('.btn-cancel').addEventListener('click', () => {
				typoEditOverlay.style.display = 'none';
			});
		}

		// Hide error message when opening modal
		const errorDiv = document.getElementById('typo-edit-error');
		if (errorDiv) errorDiv.style.display = 'none';

		// Populate font selects
		const baseFonts = ['Poppins', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Playfair Display', 'Arial', 'Helvetica', 'Times New Roman'];
		const customNames = customFontsCache.map(f => 'custom:' + f.name);
		const allFonts = [...customNames, ...baseFonts];

		['typo-edit-primary', 'typo-edit-secondary'].forEach(id => {
			const sel = document.getElementById(id);
			sel.innerHTML = '';
			allFonts.forEach(f => {
				const opt = document.createElement('option');
				opt.value = f;
				opt.textContent = f.startsWith('custom:') ? '⭐ ' + f.replace('custom:', '') : f;
				sel.appendChild(opt);
			});
		});

		// Set current values
		document.getElementById('typo-edit-primary').value = entry.primary || 'Poppins';
		document.getElementById('typo-edit-secondary').value = entry.secondary || 'Poppins';
		document.getElementById('typo-edit-title').value = entry.titleSize || 56;
		document.getElementById('typo-edit-subtitle').value = entry.subtitleSize || 36;
		document.getElementById('typo-edit-paragraph').value = entry.paragraphSize || 15;

		// Set up confirm button
		const confirmBtn = typoEditOverlay.querySelector('.btn-confirm');
		confirmBtn.onclick = function () {
			const errorDiv = document.getElementById('typo-edit-error');

			// Validate pixel sizes (min 12, max 100)
			const titleVal = parseInt(document.getElementById('typo-edit-title').value, 10);
			const subtitleVal = parseInt(document.getElementById('typo-edit-subtitle').value, 10);
			const paragraphVal = parseInt(document.getElementById('typo-edit-paragraph').value, 10);

			const isInvalid = (val) => isNaN(val) || val < 12 || val > 100;

			if (isInvalid(titleVal) || isInvalid(subtitleVal) || isInvalid(paragraphVal)) {
				// Show red error note
				if (errorDiv) errorDiv.style.display = 'block';
				return;
			}

			// Hide error if values are valid
			if (errorDiv) errorDiv.style.display = 'none';

			const hist = loadHistory();
			hist[index] = {
				...hist[index],
				primary: document.getElementById('typo-edit-primary').value,
				secondary: document.getElementById('typo-edit-secondary').value,
				titleSize: titleVal,
				subtitleSize: subtitleVal,
				paragraphSize: paragraphVal,
				timestamp: Date.now()
			};
			saveHistory(hist);
			renderHistory();
			typoEditOverlay.style.display = 'none';
		};

		typoEditOverlay.style.display = 'flex';
	}

	// ---------- Typography Apply Modal ----------
	let typoApplyOverlay = null;
	function showTypographyApplyModal(index, entry) {
		if (!typoApplyOverlay) {
			typoApplyOverlay = document.createElement('div');
			typoApplyOverlay.className = 'admin-confirm-overlay';
			typoApplyOverlay.innerHTML = `
				<div class="admin-confirm" role="dialog" aria-modal="true">
					<h3>Aplicar Tipografía</h3>
					<p>¿Deseas aplicar esta configuración de tipografía al sitio?</p>
					<div id="typo-apply-preview" style="margin:16px 0;padding:12px;background:#f8f9fa;border-radius:6px;"></div>
					<div class="confirm-actions" style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">
						<button class="btn-cancel" style="background:#f0f0f0;color:#111;border:1px solid rgba(0,0,0,0.08);padding:8px 12px;border-radius:4px;cursor:pointer;">Cancelar</button>
						<button class="btn-confirm" style="background:#34a853;color:#fff;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;">Aplicar</button>
					</div>
				</div>`;
			typoApplyOverlay.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.36);z-index:10000;';
			const dialog = typoApplyOverlay.querySelector('.admin-confirm');
			dialog.style.cssText = 'background:#fff;color:#111;padding:20px;border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,0.2);max-width:400px;width:90%;';
			document.body.appendChild(typoApplyOverlay);

			typoApplyOverlay.querySelector('.btn-cancel').addEventListener('click', () => {
				typoApplyOverlay.style.display = 'none';
			});
		}

		// Show preview
		const previewDiv = document.getElementById('typo-apply-preview');
		const displayPrimary = entry.primary?.startsWith('custom:') ? '⭐ ' + entry.primary.replace('custom:', '') : entry.primary;
		const displaySecondary = entry.secondary?.startsWith('custom:') ? '⭐ ' + entry.secondary.replace('custom:', '') : entry.secondary;
		previewDiv.innerHTML = `
			<div style="margin-bottom:8px;"><strong>Fuente Principal:</strong> ${displayPrimary || 'Poppins'}</div>
			<div style="margin-bottom:8px;"><strong>Fuente Secundaria:</strong> ${displaySecondary || 'Poppins'}</div>
			<div style="margin-bottom:8px;"><strong>Tamaño Títulos:</strong> ${entry.titleSize || 56}px</div>
			<div style="margin-bottom:8px;"><strong>Tamaño Subtítulos:</strong> ${entry.subtitleSize || 36}px</div>
			<div><strong>Tamaño Párrafos:</strong> ${entry.paragraphSize || 15}px</div>
		`;

		// Set up confirm button
		const confirmBtn = typoApplyOverlay.querySelector('.btn-confirm');
		confirmBtn.onclick = function () {
			// Apply to controls
			if (primarySelect) primarySelect.value = entry.primary || 'Poppins';
			if (secondarySelect) secondarySelect.value = entry.secondary || 'Poppins';
			if (titleSlider) titleSlider.value = entry.titleSize || 56;
			if (subtitleSlider) subtitleSlider.value = entry.subtitleSize || 36;
			if (paragraphSlider) paragraphSlider.value = entry.paragraphSize || 15;

			// Apply to iframe and preview
			const settings = {
				primary: entry.primary,
				secondary: entry.secondary,
				titleSize: entry.titleSize,
				subtitleSize: entry.subtitleSize,
				paragraphSize: entry.paragraphSize
			};
			applyTypographyToIframe(settings);
			updateAdminPreview(settings);
			saveTypographySettings(settings);

			typoApplyOverlay.style.display = 'none';
			alert('Tipografía aplicada correctamente.');
		};

		typoApplyOverlay.style.display = 'flex';
	}

	function showDeleteConfirmation(index) {
		const hist = loadHistory();
		const entry = hist[index];
		// Block delete for protected entry
		if (entry && entry.isProtected) {
			alert('Esta entrada es la original y no se puede eliminar.');
			return;
		}

		const modal = ensureConfirmModal();
		modal.dataset.deleteIndex = index;
		modal.style.display = 'flex';
	}


	// Initialize selects from iframe or saved settings
	(function initTypographyControls() {
		const detected = detectFontsFromIframe();
		const saved = loadTypographySettings();
		const primary = saved?.primary || detected.primary;
		const secondary = saved?.secondary || detected.secondary;

		populateFontSelect(primarySelect, primary);
		populateFontSelect(secondarySelect, secondary);

		// set slider values from saved if exist
		if (saved) {
			if (titleSlider && typeof saved.titleSize !== 'undefined')
				titleSlider.value = saved.titleSize;
			if (subtitleSlider && typeof saved.subtitleSize !== 'undefined')
				subtitleSlider.value = saved.subtitleSize;
			if (paragraphSlider && typeof saved.paragraphSize !== 'undefined')
				paragraphSlider.value = saved.paragraphSize;

			// Apply saved immediately
			applyTypographyToIframe(saved);
		}
	})();

	// Ensure history has a default entry if empty (preserve existing history)
	(function ensureInitialHistory() {
		try {
			let hist = loadHistory();
			if (!hist || hist.length === 0) {
				const defaultEntry = {
					primary: 'Poppins',
					secondary: 'Poppins',
					titleSize: 56,
					subtitleSize: 36,
					paragraphSize: 15,
					timestamp: 0,
					isProtected: true // Mark as protected (original)
				};
				saveHistory([defaultEntry]);
			} else {
				// Ensure first entry is marked as protected
				if (!hist[0].isProtected) {
					hist[0].isProtected = true;
					saveHistory(hist);
				}
			}
		} catch(e) { console.warn('No se pudo inicializar el historial de tipografías', e); }
		renderHistory();
	})();

	// Update admin preview (the local preview box inside admin.html)
	const previewBox = document.getElementById('typography-preview');
	const titleValueSpan = document.getElementById('title-size-value');
	const subtitleValueSpan = document.getElementById('subtitle-size-value');
	const paragraphValueSpan = document.getElementById('paragraph-size-value');

	function updateAdminPreview(settings){
		if (!previewBox) return;
		const primary = settings?.primary || primarySelect?.value;
		const secondary = settings?.secondary || secondarySelect?.value;
		const titleSize = typeof settings?.titleSize !== 'undefined' ? settings.titleSize : (titleSlider ? titleSlider.value : undefined);
		const subtitleSize = typeof settings?.subtitleSize !== 'undefined' ? settings.subtitleSize : (subtitleSlider ? subtitleSlider.value : undefined);
		const paragraphSize = typeof settings?.paragraphSize !== 'undefined' ? settings.paragraphSize : (paragraphSlider ? paragraphSlider.value : undefined);

		// update displayed values
		if (titleValueSpan && typeof titleSize !== 'undefined') titleValueSpan.textContent = titleSize + 'px';
		if (subtitleValueSpan && typeof subtitleSize !== 'undefined') subtitleValueSpan.textContent = subtitleSize + 'px';
		if (paragraphValueSpan && typeof paragraphSize !== 'undefined') paragraphValueSpan.textContent = paragraphSize + 'px';

		// apply fonts: primary -> titles (h2), secondary -> subtitles (h4) and paragraphs (p)
		if (secondary) previewBox.style.fontFamily = secondary + ', sans-serif';
		// apply primary to title elements (h2)
		previewBox.querySelectorAll('h2').forEach(h => { if (primary) h.style.fontFamily = primary + ', serif'; });
		// apply secondary to subtitle elements (h4) and paragraphs
		previewBox.querySelectorAll('h4').forEach(h => { if (secondary) h.style.fontFamily = secondary + ', sans-serif'; });
		previewBox.querySelectorAll('p').forEach(p => { if (secondary) p.style.fontFamily = secondary + ', sans-serif'; });

		// apply sizes to matching elements in the preview
		if (typeof titleSize !== 'undefined') {
			previewBox.querySelectorAll('h2').forEach(h => h.style.fontSize = titleSize + 'px');
		}
		if (typeof subtitleSize !== 'undefined') {
			previewBox.querySelectorAll('h4').forEach(h => h.style.fontSize = subtitleSize + 'px');
		}
		if (typeof paragraphSize !== 'undefined') {
			previewBox.querySelectorAll('p').forEach(p => p.style.fontSize = paragraphSize + 'px');
		}
	}

	// Live change handlers
	// Helper: apply only primary font (titles) to iframe and preview
	function applyPrimaryFontOnly(font) {
		if (!font) return;
		// inject into iframe
		const doc = safeGetIframeDoc();

		applySiteFonts(doc, {primary: font});
		applySiteFonts(document, {primary: font});

		if (font.startsWith("custom:")) {
			const fontName = font.replace('custom:', '');

            // Find font in cache
            if (customFontsCache.some(f => f.name === fontName)) {
				if (previewBox) previewBox.querySelectorAll('h2').forEach(h => h.style.fontFamily = `'${fontName}', serif`);
			}
		} else {
			if (previewBox) previewBox.querySelectorAll('h2').forEach(h => h.style.fontFamily = font + ', serif');
		}
	}

	// Helper: apply only secondary font (body, subtitles, paragraphs) to iframe and preview
	function applyPrimaryFontOnly(font) {
		if (!font) return;
		// inject into iframe
		const doc = safeGetIframeDoc();

		applySiteFonts(doc, {secondary: font});
		applySiteFonts(document, {secondary: font});

		if (font.startsWith("custom:")) {
			const fontName = font.replace('custom:', '');

            // Find font in cache
            if (customFontsCache.some(f => f.name === fontName)) {
				if (previewBox) {
					previewBox.style.fontFamily = `'${fontName}', sans-serif`;
					previewBox.querySelectorAll('h4').forEach(h => h.style.fontFamily = `'${fontName}', sans-serif`);
					previewBox.querySelectorAll('p').forEach(p => p.style.fontFamily = `'${fontName}', sans-serif`);
				}
			}
		} else {
			if (previewBox) {
				previewBox.style.fontFamily = font + ', sans-serif';
				previewBox.querySelectorAll('h4').forEach(h => h.style.fontFamily = font + ', sans-serif');
				previewBox.querySelectorAll('p').forEach(p => p.style.fontFamily = font + ', sans-serif');
			}
		}
	}
	function applySecondaryFontOnly(font){
		if (!font) return;
		const doc = safeGetIframeDoc();
		if (doc) injectGoogleFontInDoc(doc, font);
		try{ if(doc) doc.body.style.fontFamily = font + ', sans-serif'; }catch(e){}
		try{ if(doc) doc.querySelectorAll('h4').forEach(h => h.style.fontFamily = font + ', sans-serif'); }catch(e){}
		try{ if(doc) doc.querySelectorAll('p').forEach(p => p.style.fontFamily = font + ', sans-serif'); }catch(e){}
		// admin preview
		try{ if(previewBox) previewBox.style.fontFamily = font + ', sans-serif'; }catch(e){}
		try{ if(previewBox) previewBox.querySelectorAll('h4').forEach(h => h.style.fontFamily = font + ', sans-serif'); }catch(e){}
		try{ if(previewBox) previewBox.querySelectorAll('p').forEach(p => p.style.fontFamily = font + ', sans-serif'); }catch(e){}
	}

	if(primarySelect) primarySelect.addEventListener('change', (ev)=>{
		const newPrimary = ev.currentTarget ? ev.currentTarget.value : primarySelect.value;
		try{ console.debug('primarySelect change ->', newPrimary); }catch(e){}
		applyPrimaryFontOnly(newPrimary);
	});
	if(secondarySelect) secondarySelect.addEventListener('change', (ev)=>{
		const newSecondary = ev.currentTarget ? ev.currentTarget.value : secondarySelect.value;
		try{ console.debug('secondarySelect change ->', newSecondary); }catch(e){}
		applySecondaryFontOnly(newSecondary);
	});

	// sliders update iframe too
	[titleSlider, subtitleSlider, paragraphSlider].forEach(sl => {
		if (!sl) return;
		sl.addEventListener('input', ()=>{
			const s = getNewFontSettings();
			applyTypographyToIframe(s);
			updateAdminPreview(s);
		});
	});

	function getNewFontSettings() {
		return {
			primary: primarySelect?.value || 'Poppins',
			secondary: secondarySelect?.value || 'Poppins',
			titleSize: titleSlider && parseInt(titleSlider.value,10) || 36,
			subtitleSize: subtitleSlider && parseInt(subtitleSlider.value,10) || 24,
			paragraphSize: paragraphSlider && parseInt(paragraphSlider.value,10) || 16
		};
	}

	// Apply / Save
	if (applyTypoBtn){
		applyTypoBtn.addEventListener('click', ()=>{
			const s = getNewFontSettings();
			saveTypographySettings(s);
			applyTypographyToIframe(s);
			updateAdminPreview(s);

			// push to history
			try {
				const h = loadHistory();
				h.push(Object.assign({}, s, { timestamp: Date.now() }));
				saveHistory(h);
				renderHistory();
			} catch(e) { console.warn('No se pudo actualizar historial', e); }
			try {
				if (window.BroadcastChannel) {
					const bc = new BroadcastChannel('admin-typography');
					bc.postMessage({ type: 'settings-applied',
									settings: s });
					bc.close();
				}
			} catch(e) {}

			alert('Configuración de tipografía guardada localmente.');
		});
	}

	// Cancel button (only for typography section)
	if (applyTypoBtn) {
		const typographySection = applyTypoBtn.closest('.config-section');
		const cancelBtn = typographySection ? typographySection.querySelector('.btn-secondary') : null;
		if (cancelBtn) {
			cancelBtn.addEventListener('click', ()=>{
				const saved = loadTypographySettings();
				if (saved) {
					if(primarySelect) primarySelect.value = saved.primary;
					if(secondarySelect) secondarySelect.value = saved.secondary;
					if(titleSlider && typeof saved.titleSize !== 'undefined') titleSlider.value = saved.titleSize;
					if(subtitleSlider && typeof saved.subtitleSize !== 'undefined') subtitleSlider.value = saved.subtitleSize;
					if(paragraphSlider && typeof saved.paragraphSize !== 'undefined') paragraphSlider.value = saved.paragraphSize;
					applyTypographyToIframe(saved);
				} else {
					// reload iframe to original
					if (iframe) iframe.contentWindow.location.reload();
				}
			});
		}
	}

	// Font import functionality is disabled. Previously the code allowed selecting a local
	// font file and registering it in the iframe via blob URLs and IndexedDB. That code
	// was removed to avoid issues applying fonts across reloads. If needed, re-implement
	// using a server-side font store or a robust IndexedDB solution.

	// ---------- Other existing controls ----------
	// Refresh preview button
	const refreshBtn = document.getElementById('refresh-preview');
	if(refreshBtn && iframe){
		refreshBtn.addEventListener('click', function() { iframe.src = iframe.src; });
	}
	// View site button
	const viewSiteBtn = document.getElementById('view-site');
	if(viewSiteBtn){ viewSiteBtn.addEventListener('click', function(){ window.open('../index.html','_blank'); }); }

	// Smooth scrolling for sidebar links
	document.querySelectorAll('.sidebar-menu a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', function (e) {
			e.preventDefault();
			const target = document.querySelector(this.getAttribute('href'));
			if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	});

});
