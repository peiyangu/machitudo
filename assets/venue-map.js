(() => {
	'use strict';

	const BOOTH_QUERY_KEY = 'booth';

	function normalizeBooth(value) {
		if (value == null) return '';
		return String(value).trim();
	}

	function getBoothList(boothNumber) {
		if (!boothNumber) return [];
		return String(boothNumber)
			.split(/[\s,、\/]+/)
			.map((s) => s.trim())
			.filter(Boolean);
	}

	function findStoresByBooth(booth) {
		const b = normalizeBooth(booth);
		if (!b) return [];

		// stores-data.js は `const allStoresData = [...]` のため、
		// `window.allStoresData` では参照できないブラウザがあります。
		// ここではグローバル識別子として安全に参照します。
		const data = (typeof allStoresData !== 'undefined' && Array.isArray(allStoresData))
			? allStoresData
			: (Array.isArray(window.allStoresData) ? window.allStoresData : null);

		if (!Array.isArray(data)) return [];

		return data.filter((store) => {
			const boothList = getBoothList(store.boothNumber);
			return boothList.includes(b);
		});
	}

	function findStoreByName(name) {
		const n = normalizeBooth(name).toLowerCase();
		if (!n) return null;

		const data = (typeof allStoresData !== 'undefined' && Array.isArray(allStoresData))
			? allStoresData
			: (Array.isArray(window.allStoresData) ? window.allStoresData : null);

		if (!Array.isArray(data)) return null;
		return data.find((store) => String(store.name || '').trim().toLowerCase() === n) || null;
	}

	// --- 曖昧検索用ユーティリティ ---
	function katakanaToHiragana(str) {
		let out = '';
		for (const ch of str) {
			const code = ch.codePointAt(0);
			// カタカナ基本ブロックをひらがなへ（濁点等はNFKCで吸収済みを想定）
			if (code >= 0x30A1 && code <= 0x30F6) {
				out += String.fromCodePoint(code - 0x60);
			} else {
				out += ch;
			}
		}
		return out;
	}

	function normalizeForSearch(str) {
		return katakanaToHiragana(String(str || '')
			.normalize('NFKC')
			.toLowerCase()
			.trim()
		)
			.replace(/[\s\u3000・ー\-_\.]/g, '');
	}

	function isSubsequence(needle, haystack) {
		let i = 0;
		for (const c of haystack) {
			if (c === needle[i]) i++;
			if (i >= needle.length) return true;
		}
		return false;
	}

	function scoreMatch(q, name) {
		if (!q || !name) return 0;
		if (q === name) return 100;
		if (name.startsWith(q)) return 90;
		if (name.includes(q)) return 80;
		if (isSubsequence(q, name)) return 70;
		return 0;
	}

	function findBestStoreByNameFuzzy(query) {
		const q = normalizeForSearch(query);
		if (!q) return null;
		const data = (typeof allStoresData !== 'undefined' && Array.isArray(allStoresData))
			? allStoresData
			: (Array.isArray(window.allStoresData) ? window.allStoresData : null);
		if (!Array.isArray(data)) return null;
		let best = null;
		let bestScore = 0;
		for (const store of data) {
			const nameNorm = normalizeForSearch(store.name || '');
			const s = scoreMatch(q, nameNorm);
			if (s > bestScore) {
				bestScore = s;
				best = store;
			}
		}
		return bestScore >= 70 ? best : null; // 最低スコア閾値
	}

	function el(tag, className, text) {
		const node = document.createElement(tag);
		if (className) node.className = className;
		if (text != null) node.textContent = text;
		return node;
	}

	function renderStores(container, stores) {
		container.innerHTML = '';

		if (!stores.length) {
			const empty = el('div', 'venue-map-empty');
			empty.textContent = 'このブース番号に該当する店舗が見つかりませんでした。';
			container.appendChild(empty);
			return;
		}

		const fragment = document.createDocumentFragment();
		stores.forEach((store) => {
			fragment.appendChild(createStoreCard(store));
		});
		container.appendChild(fragment);
	}

	function createStoreCard(store) {
		const card = document.createElement('div');
		card.className = 'store-card fade-in-on-scroll is-visible';

		const days = Array.isArray(store.days) ? store.days : [];
		const daysBadgeClass = days.length === 2 ? 'both-days' : 'single-day';

		const hasInstagram = store.instagram &&
			store.instagram !== '' &&
			!String(store.instagram).includes('利用なし') &&
			store.instagram !== 'https://www.instagram.com/';

		const instagramLink = hasInstagram ? `
			<a href="${store.instagram}"
				 class="instagram-link"
				 target="_blank"
				 rel="noopener noreferrer">
				Instagramで見る
			</a>
		` : `
			<span class="instagram-link disabled" title="Instagramアカウントなし">
				Instagramアカウントなし
			</span>
		`;

		const imageHtml = store.image && store.image !== ''
			? `<img src="${store.image}" alt="${store.name}" class="store-card-image" loading="lazy">`
			: `<div class="store-card-image-placeholder">
					 <div class="placeholder-content">${store.name || ''}</div>
				 </div>`;

		const descriptionHtml = (store.description || '')
			.replace(/\r\n|\r|\n/g, '<br>')
			.replace(/\\n/g, '<br>');

		const primaryBooth = String(store.boothNumber || '').split(/[\s,、\/]+/)[0];
		const boothLink = primaryBooth
			? `venue-map.html?booth=${encodeURIComponent(primaryBooth)}`
			: 'venue-map.html';

		const daysText = (typeof formatDays === 'function') ? formatDays(days) : '';

		card.innerHTML = `
			${imageHtml}
			<div class="store-card-body">
				<div class="store-meta">
					<a href="${boothLink}" class="store-booth-badge" title="会場マップを見る" onclick="sessionStorage.setItem('machitudo_visited', 'true');">ブース ${store.boothNumber || ''}</a>
					<span class="store-days-badge ${daysBadgeClass}">${daysText}</span>
				</div>
				<h3 class="store-name">${store.name || ''}</h3>
				<p class="store-description">${descriptionHtml}</p>
				${instagramLink}
			</div>
		`;

		return card;
	}

	function setCountText(node, booth, stores) {
		const b = normalizeBooth(booth);
		if (!b) {
			node.textContent = 'ブース番号をクリックしてください';
			return;
		}
		if (!stores.length) {
			node.textContent = `ブース ${b}：該当店舗なし`;
			return;
		}
		node.textContent = `ブース ${b}：${stores.length}件`;
	}

	function setQueryBooth(booth) {
		const url = new URL(window.location.href);
		const b = normalizeBooth(booth);
		if (b) {
			url.searchParams.set(BOOTH_QUERY_KEY, b);
		} else {
			url.searchParams.delete(BOOTH_QUERY_KEY);
		}
		window.history.replaceState({}, '', url.toString());
	}

	function getQueryBooth() {
		const url = new URL(window.location.href);
		return normalizeBooth(url.searchParams.get(BOOTH_QUERY_KEY));
	}

	function parseCoords(coordsStr) {
		return String(coordsStr)
			.split(',')
			.map((n) => Number(n.trim()))
			.filter((n) => Number.isFinite(n));
	}

	function scaleCoords(shape, coords, scaleX, scaleY) {
		if (shape === 'rect' && coords.length >= 4) {
			const [x1, y1, x2, y2] = coords;
			return [x1 * scaleX, y1 * scaleY, x2 * scaleX, y2 * scaleY];
		}
		if (shape === 'circle' && coords.length >= 3) {
			const [cx, cy, r] = coords;
			const sr = (scaleX + scaleY) / 2;
			return [cx * scaleX, cy * scaleY, r * sr];
		}
		if (shape === 'poly' && coords.length >= 6) {
			const scaled = [];
			for (let i = 0; i < coords.length; i += 2) {
				const x = coords[i];
				const y = coords[i + 1];
				if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
				scaled.push(x * scaleX, y * scaleY);
			}
			return scaled;
		}
		return coords;
	}

	function coordsToRectBox(shape, coords) {
		if (shape !== 'rect' || coords.length < 4) return null;
		const [x1, y1, x2, y2] = coords;
		const left = Math.min(x1, x2);
		const top = Math.min(y1, y2);
		const width = Math.abs(x2 - x1);
		const height = Math.abs(y2 - y1);
		return { left, top, width, height };
	}

	async function loadAreasIntoMap(mapEl, areasUrl) {
		if (!mapEl || !areasUrl) return;
		try {
			const res = await fetch(areasUrl, { cache: 'no-cache' });
			if (!res.ok) {
				console.warn(`[venue-map] Failed to load areas: ${areasUrl}`);
				return;
			}
			const html = await res.text();
			mapEl.innerHTML = html;
		} catch (err) {
			console.warn('[venue-map] Failed to load areas', err);
		}
	}

	function attachResponsiveImageMap(img, highlightEl, mapEl) {
		const usemap = img.getAttribute('usemap');
		if (!usemap) return;
		const mapName = usemap.replace('#', '').trim();
		if (!mapName) return;

		const map = mapEl || document.querySelector(`map[name="${CSS.escape(mapName)}"]`);
		if (!map) return;
		const areas = Array.from(map.querySelectorAll('area'));

		// 初回だけ元座標を保存
		areas.forEach((area) => {
			if (!area.dataset.origCoords) {
				area.dataset.origCoords = area.getAttribute('coords') || '';
			}
		});

		let lastSelectedArea = null;
		let pendingBoothToHighlight = null;
		let pendingShouldScroll = false;

		function normalizeScrollOption(optionsOrShouldScroll) {
			if (typeof optionsOrShouldScroll === 'boolean') {
				return optionsOrShouldScroll;
			}
			if (optionsOrShouldScroll && typeof optionsOrShouldScroll === 'object') {
				return !!optionsOrShouldScroll.shouldScroll;
			}
			return false;
		}

		function updateHighlight(area, shouldScroll = false) {
			if (!highlightEl) return;
			if (!area) {
				highlightEl.style.display = 'none';
				return;
			}

			const shape = (area.getAttribute('shape') || 'rect').toLowerCase();
			const coords = parseCoords(area.getAttribute('coords') || '');
			const box = coordsToRectBox(shape, coords);
			if (!box) {
				highlightEl.style.display = 'none';
				return;
			}

			// 画像がコンテナ内でどこに描画されているか（paddingやレイアウト差分を吸収）
			const imgOffsetLeft = img.offsetLeft || 0;
			const imgOffsetTop = img.offsetTop || 0;

			// 枠を広げて番号が見えるようにする（各辺に8px追加）
			const expandBy = 8;
			const expandedBox = {
				left: box.left - expandBy,
				top: box.top - expandBy,
				width: box.width + (expandBy * 2),
				height: box.height + (expandBy * 2)
			};

			highlightEl.style.display = 'block';
			highlightEl.style.left = `${expandedBox.left + imgOffsetLeft}px`;
			highlightEl.style.top = `${expandedBox.top + imgOffsetTop}px`;
			highlightEl.style.width = `${expandedBox.width}px`;
			highlightEl.style.height = `${expandedBox.height}px`;

			// 選択直後のみ、該当位置まで自動スクロール（リサイズ等で繰り返し発火しないよう制御）
			if (shouldScroll) {
				setTimeout(() => {
					const rect = highlightEl.getBoundingClientRect();
					const offset = window.innerHeight / 2 - rect.height / 2;
					const scrollTop = window.pageYOffset + rect.top - offset;
					
					window.scrollTo({
						top: Math.max(0, scrollTop),
						behavior: 'smooth'
					});
				}, 100);
			}
		}

		function rescaleAreas() {
			if (!img.naturalWidth || !img.naturalHeight) return;
			const scaleX = img.clientWidth / img.naturalWidth;
			const scaleY = img.clientHeight / img.naturalHeight;

			areas.forEach((area) => {
				const shape = (area.getAttribute('shape') || 'rect').toLowerCase();
				const orig = parseCoords(area.dataset.origCoords || '');
				const scaled = scaleCoords(shape, orig, scaleX, scaleY);
				area.setAttribute('coords', scaled.map((n) => Math.round(n)).join(','));
			});

			// リサイズ後にハイライト位置も更新（ここでは自動スクロールしない）
			updateHighlight(lastSelectedArea, false);

			if (pendingBoothToHighlight) {
				highlightBooth(pendingBoothToHighlight, { shouldScroll: pendingShouldScroll });
				pendingBoothToHighlight = null;
				pendingShouldScroll = false;
			}
		}

		function highlightBooth(booth, optionsOrShouldScroll) {
			const shouldScroll = normalizeScrollOption(optionsOrShouldScroll);
			const b = normalizeBooth(booth);
			if (!b) {
				lastSelectedArea = null;
				updateHighlight(null, false);
				return;
			}

			// 画像のnaturalサイズが未確定だとcoordsスケールができず位置が合わないため、保留
			if (!img.naturalWidth || !img.naturalHeight) {
				pendingBoothToHighlight = b;
				pendingShouldScroll = shouldScroll;
				return;
			}

			const area = areas.find((a) => (a.dataset.booth || a.getAttribute('title') || a.getAttribute('alt')) === b);
			if (!area) {
				lastSelectedArea = null;
				updateHighlight(null, false);
				return;
			}
			lastSelectedArea = area;
			updateHighlight(area, shouldScroll);
		}

		// areaタップ/クリック（ピンチズーム時の誤選択を防ぎ、実タップのみ選択）
		areas.forEach((area) => {
			const handleSelect = (e) => {
				if (e && typeof e.preventDefault === 'function') e.preventDefault();
				window.__machitudoSuppressOutsideClear?.();
				const booth = area.dataset.booth || area.getAttribute('title') || area.getAttribute('alt');
				lastSelectedArea = area;
				updateHighlight(area, true);
				window.__machitudoSelectBooth?.(booth);
			};

			// デスクトップ/通常クリック
			area.addEventListener('click', handleSelect);

			// モバイル：ピンチ（multi-touch）やパン（移動量大）は選択しない
			let touchData = null;
			area.addEventListener('touchstart', (e) => {
				if (e.touches && e.touches.length > 1) {
					// ピンチ開始：選択処理を行わない
					touchData = null;
					return; // preventDefaultしないことでズームを妨げない
				}
				const t = e.touches && e.touches[0];
				touchData = {
					startX: t ? t.clientX : 0,
					startY: t ? t.clientY : 0,
					startTime: Date.now(),
					canceled: false,
				};
			}, { passive: true });

			area.addEventListener('touchmove', (e) => {
				if (!touchData) return;
				if (e.touches && e.touches.length > 1) {
					// マルチタッチに移行したらキャンセル
					touchData.canceled = true;
					return;
				}
				const t = e.touches && e.touches[0];
				if (!t) return;
				const dx = Math.abs(t.clientX - touchData.startX);
				const dy = Math.abs(t.clientY - touchData.startY);
				// パン（ドラッグ）とみなす閾値（合計12px程度）
				if (dx + dy > 12) {
					touchData.canceled = true;
				}
			}, { passive: true });

			area.addEventListener('touchend', (e) => {
				if (!touchData) return;
				const duration = Date.now() - touchData.startTime;
				const isTap = !touchData.canceled && duration < 500; // 短時間で移動少：タップ
				touchData = null;
				if (!isTap) return; // ピンチ/パンは選択しない
				// 実タップのみ選択処理
				handleSelect(e);
			});

			area.addEventListener('touchcancel', () => { touchData = null; });
		});

		const onResize = () => rescaleAreas();
		window.addEventListener('resize', onResize);

		// 画像ロードタイミングで実行
		if (img.complete) {
			rescaleAreas();
		} else {
			img.addEventListener('load', () => rescaleAreas(), { once: true });
		}

		return {
			highlightBooth,
			clearHighlight: () => {
				lastSelectedArea = null;
				pendingBoothToHighlight = null;
				pendingShouldScroll = false;
				updateHighlight(null, false);
			},
		};
	}

	async function init() {
		const storeCount = document.getElementById('mapStoreCount');
		const storeContainer = document.getElementById('mapStoreContainer');
		const storeSearchInput = document.getElementById('storeSearchInput');
		const storeNameList = document.getElementById('storeNameList');
		let storeNameIndex = [];
		const northImg = document.getElementById('northMapImage');
		const northHighlight = document.getElementById('northMapHighlight');
		const northMapEl = document.getElementById('northImageMap');
		const southImg = document.getElementById('southMapImage');
		const southHighlight = document.getElementById('southMapHighlight');
		const southMapEl = document.getElementById('southImageMap');

		// スマホ用モーダル要素
		const modal = document.getElementById('venueMapModal');
		const modalOverlay = document.getElementById('venueMapModalOverlay');
		const modalClose = document.getElementById('venueMapModalClose');
		const modalTitle = document.getElementById('venueMapModalTitle');
		const modalBody = document.getElementById('venueMapModalBody');

		if (!storeCount || !storeContainer || !northImg) return;

		// スマホ判定（768px以下）
		function isMobile() {
			return window.innerWidth <= 767;
		}

		// モーダルを開く
		function openModal(booth, stores) {
			if (!modal || !isMobile()) return;
			
			// タイトル設定
			if (modalTitle) {
				modalTitle.textContent = `ブース ${booth}`;
			}
			
			// 店舗カードをモーダル内に表示
			if (modalBody) {
				const countText = stores.length === 0
					? `ブース ${booth} に該当する店舗が見つかりません。`
					: `ブース ${booth}：${stores.length}件`;
				
				modalBody.innerHTML = `
					<p class="store-count-list">${countText}</p>
					<div class="stores-grid" id="modalStoreGrid"></div>
				`;
				
				const modalGrid = document.getElementById('modalStoreGrid');
				if (modalGrid) {
					renderStores(modalGrid, stores);
				}
			}
			
			// モーダル表示
			modal.setAttribute('aria-hidden', 'false');
			document.body.style.overflow = 'hidden'; // 背景スクロール防止
		}

		// モーダルを閉じる
		function closeModal() {
			if (!modal) return;
			modal.setAttribute('aria-hidden', 'true');
			document.body.style.overflow = ''; // スクロール復元
		}

		function clearSelection() {
			// モーダルが開いていれば閉じる
			if (modal && modal.getAttribute('aria-hidden') === 'false') {
				closeModal();
			}

			// ハイライト解除
			northApi?.clearHighlight?.();
			southApi?.clearHighlight?.();
			currentHighlightApi = null;

			// パネル表示を初期状態へ
			if (storeCount) storeCount.textContent = 'ブース番号をクリックしてください';
			if (storeContainer) storeContainer.innerHTML = '';

			// URLクエリをクリア
			setQueryBooth('');
		}

		// モーダルイベントリスナー
		if (modalClose) {
			modalClose.addEventListener('click', closeModal);
		}
		if (modalOverlay) {
			// 画面外タップで「選択解除」
			modalOverlay.addEventListener('click', clearSelection);
		}

		// Escキーでモーダルを閉じる
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && modal && modal.getAttribute('aria-hidden') === 'false') {
				closeModal();
			}
		});

		function selectBooth(booth) {
			window.__machitudoSuppressOutsideClear?.();
			const b = normalizeBooth(booth);
			const stores = findStoresByBooth(b);
			
			if (isMobile()) {
				// スマホ：モーダル表示
				openModal(b, stores);
			} else {
				// PC/タブレット：サイドパネル表示
				setCountText(storeCount, b, stores);
				renderStores(storeContainer, stores);
			}
			
			setQueryBooth(b);
		}

		// 他関数から呼べるように（image map click -> selectBooth）
		window.__machitudoSelectBooth = selectBooth;

		// 「外側タップで解除」：ブース選択直後のクリック伝播で解除されないよう抑止
		let suppressOutsideClear = false;
		window.__machitudoSuppressOutsideClear = () => {
			suppressOutsideClear = true;
			setTimeout(() => { suppressOutsideClear = false; }, 0);
		};

		// <area> を外部ファイルから読み込み（image-map.net の出力をそのまま管理できるようにする）
		await loadAreasIntoMap(northMapEl, 'assets/venue-map-areas-north.html');
		if (southImg && southMapEl) {
			await loadAreasIntoMap(southMapEl, 'assets/venue-map-areas-south.html');
		}

		const northApi = attachResponsiveImageMap(northImg, northHighlight, northMapEl);
		const southApi = (southImg && southMapEl)
			? attachResponsiveImageMap(southImg, southHighlight, southMapEl)
			: null;

		// グローバルにハイライトAPIを設定（相互に解除できるようにする）
		let currentHighlightApi = null;

		// マップ画像の「空白タップ」で選択解除（areaタップ時は抑止される）
		northImg.addEventListener('click', () => {
			if (suppressOutsideClear) return;
			clearSelection();
		});
		if (southImg) {
			southImg.addEventListener('click', () => {
				if (suppressOutsideClear) return;
				clearSelection();
			});
		}

		// マップ/パネル/モーダル以外のタップで選択解除（"画面外" の扱い）
		document.addEventListener('click', (e) => {
			if (suppressOutsideClear) return;
			const target = e.target;
			if (!(target instanceof Element)) return;
			if (target.tagName === 'AREA') return;
			if (target.closest('.venue-map-modal-content')) return;
			if (target.closest('.venue-map-panel')) return;
			if (target.closest('.map-container')) return;
			clearSelection();
		}, true);

		// ハイライト表示を一元管理する関数
		function highlightBoothGlobal(booth, targetApi, otherApi, options) {
			// 他方のハイライトを解除
			if (otherApi && otherApi !== targetApi) {
				otherApi.clearHighlight?.();
			}
			// 対象のハイライトを表示
			if (targetApi) {
				targetApi.highlightBooth?.(booth, options);
				currentHighlightApi = targetApi;
			}
		}

		// areaクリック時に他方のハイライトも解除する
		// 北側の各areaにイベント追加
		if (northMapEl) {
			const northAreas = Array.from(northMapEl.querySelectorAll('area'));
			northAreas.forEach((area) => {
				area.addEventListener('click', () => {
					const booth = area.dataset.booth || area.getAttribute('title') || area.getAttribute('alt');
					// 南側のハイライトを解除してから北側を表示
					southApi?.clearHighlight?.();
				});
			});
		}

		// 南側の各areaにイベント追加
		if (southMapEl) {
			const southAreas = Array.from(southMapEl.querySelectorAll('area'));
			southAreas.forEach((area) => {
				area.addEventListener('click', () => {
					const booth = area.dataset.booth || area.getAttribute('title') || area.getAttribute('alt');
					// 北側のハイライトを解除してから南側を表示
					northApi?.clearHighlight?.();
				});
			});
		}

		// 店舗検索候補の生成（datalist）
		(function buildStoreNameCandidates() {
			if (!storeNameList) return;
			// allStoresData から店名の候補を作成（重複除去）
			const data = (typeof allStoresData !== 'undefined' && Array.isArray(allStoresData))
				? allStoresData
				: (Array.isArray(window.allStoresData) ? window.allStoresData : []);
			const seen = new Set();
			const names = [];
			for (const s of data) {
				const name = String(s.name || '').trim();
				if (!name) continue;
				if (seen.has(name)) continue;
				seen.add(name);
				names.push(name);
			}
			// アルファベット・五十音ざっくりソート（localeCompare）
			names.sort((a, b) => a.localeCompare(b, 'ja'));
			storeNameList.innerHTML = names.map((n) => `<option value="${n}"></option>`).join('');
			// オートコンプリート用インデックス（正規化名付き）
			storeNameIndex = names.map((n) => ({ name: n, norm: normalizeForSearch(n) }));
		})();

		function areaExistsIn(mapEl, booth) {
			const b = normalizeBooth(booth);
			if (!mapEl || !b) return false;
			const areas = Array.from(mapEl.querySelectorAll('area'));
			return areas.some(a => (a.dataset.booth || a.getAttribute('title') || a.getAttribute('alt')) === b);
		}

		function triggerSearchRaw(rawInput) {
			const raw = String(rawInput || '').trim();
			if (!raw) return;
			let store = findStoreByName(raw);
			if (!store) {
				// 曖昧検索（部分一致・かな正規化）
				store = findBestStoreByNameFuzzy(raw);
				if (!store) {
					if (storeCount) storeCount.textContent = `「${raw}」に一致する店舗が見つかりませんでした`;
					return;
				}
			}
			const primaryBooth = String(store.boothNumber || '').split(/[\s,、\/]+/)[0];
			if (!primaryBooth) {
				if (storeCount) storeCount.textContent = `店舗「${store.name}」はブース番号が未設定です`;
				return;
			}
			// 店舗情報の表示（パネル/モーダル）
			selectBooth(primaryBooth);
			// 曖昧一致の場合は案内文を補足
			if (storeCount && findStoreByName(raw) == null) {
				storeCount.textContent = `曖昧検索：入力「${raw}」に最も近い店舗「${store.name}」を表示しています`;
			}
			// ハイライトの表示（該当エリアにスクロール）
			const options = { shouldScroll: true };
			if (areaExistsIn(northMapEl, primaryBooth)) {
				northApi?.highlightBooth?.(primaryBooth, options);
				southApi?.clearHighlight?.();
			} else {
				southApi?.highlightBooth?.(primaryBooth, options);
				northApi?.clearHighlight?.();
			}
			// クエリ維持（共有・ブラウザバック用）
			setQueryBooth(primaryBooth);
		}

		// 店舗検索（店名入力）: IME変換中はEnter確定を検索として扱わない
		function attachSearchHandlers(input) {
			if (!input) return;
			let composing = false;
			// オートコンプリートDOM
			const dropdown = document.createElement('div');
			dropdown.className = 'store-autocomplete';
			dropdown.style.display = 'none';
			// 入力の直後に挿入（親要素が検索ボックスのラッパー）
			input.parentElement && input.parentElement.appendChild(dropdown);

			input.addEventListener('compositionstart', () => { composing = true; });
			input.addEventListener('compositionend', () => { composing = false; });
			input.addEventListener('change', () => triggerSearchRaw(input.value));
			input.addEventListener('keydown', (e) => {
				// 日本語IMEなどの変換中はEnterを無視（229は一部端末のIMEコード）
				if (e.isComposing || composing || e.keyCode === 229) return;
				if (e.key === 'Enter') {
					triggerSearchRaw(input.value);
					dropdown.style.display = 'none';
				}
			});

			function renderSuggestions(q) {
				const query = String(q || '').trim();
				if (!query) { dropdown.style.display = 'none'; dropdown.innerHTML = ''; return; }
				const qn = normalizeForSearch(query);
				if (!qn) { dropdown.style.display = 'none'; dropdown.innerHTML = ''; return; }
				// スコアでソートし上位のみ表示
				const items = storeNameIndex
					.map(({ name, norm }) => ({ name, score: scoreMatch(qn, norm) }))
					.filter((x) => x.score >= 70)
					.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'ja'))
					.slice(0, 8);
				if (!items.length) { dropdown.style.display = 'none'; dropdown.innerHTML = ''; return; }
				dropdown.innerHTML = items.map(({ name }) => (
					`<button type="button" class="store-autocomplete-item">${name.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</button>`
				)).join('');
				dropdown.style.display = 'block';
			}

			input.addEventListener('input', () => {
				if (composing) return; // 変換中は確定後に更新
				renderSuggestions(input.value);
			});
			input.addEventListener('focus', () => { if (!composing) renderSuggestions(input.value); });
			input.addEventListener('blur', () => { setTimeout(() => { dropdown.style.display = 'none'; }, 120); });
			dropdown.addEventListener('mousedown', (e) => { e.preventDefault(); }); // blur抑制
			dropdown.addEventListener('click', (e) => {
				const btn = e.target.closest('.store-autocomplete-item');
				if (!btn) return;
				input.value = btn.textContent || '';
				dropdown.style.display = 'none';
				triggerSearchRaw(input.value);
			});
		}

		// 各入力欄にハンドラ付与
		attachSearchHandlers(storeSearchInput);
		const storeSearchInputTop = document.getElementById('storeSearchInputTop');
		attachSearchHandlers(storeSearchInputTop);
		const storeSearchInputFooter = document.getElementById('storeSearchInputFooter');
		attachSearchHandlers(storeSearchInputFooter);

		const mobileSearchBtn = document.getElementById('mobileSearchBtn');
		if (mobileSearchBtn) {
			mobileSearchBtn.addEventListener('click', () => {
				const target = storeSearchInput || storeSearchInputTop || storeSearchInputFooter;
				if (!target) return;
				target.scrollIntoView({ behavior: 'smooth', block: 'center' });
				setTimeout(() => { target.focus(); }, 300);
			});
		}

		// クエリで初期選択（店舗ページからの遷移時）
		const initialBooth = getQueryBooth();
		if (initialBooth) {
			// 店舗ページから来た場合はハイライトのみ表示（店舗カード/モーダルは表示しない）
			// まず北側で試行
			const northAreas = northMapEl ? Array.from(northMapEl.querySelectorAll('area')) : [];
			const southAreas = southMapEl ? Array.from(southMapEl.querySelectorAll('area')) : [];
			
			const b = normalizeBooth(initialBooth);
			const foundInNorth = northAreas.some(a => 
				(a.dataset.booth || a.getAttribute('title') || a.getAttribute('alt')) === b
			);
			
			const highlightOptions = { shouldScroll: true };
			if (foundInNorth) {
				// 北側にある場合
				highlightBoothGlobal(initialBooth, northApi, southApi, highlightOptions);
			} else {
				// 南側にある場合
				highlightBoothGlobal(initialBooth, southApi, northApi, highlightOptions);
			}
			
			// クエリ文字列は設定しておく（ブラウザバック時の状態保持用）
			setQueryBooth(initialBooth);
		}
	}

	document.addEventListener('DOMContentLoaded', () => { void init(); });
})();
