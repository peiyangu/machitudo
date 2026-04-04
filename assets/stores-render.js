/**
 * まちつど 店舗レンダリングシステム
 *
 * ジャンル別ページで店舗カードを動的に生成します
 * パフォーマンス最適化:
 *  - カードHTMLをまとめてinnerHTMLで一括反映（DOM操作を最小化）
 *  - 画像にloading="lazy" + decoding="async"を付与
 *  - 全店舗ページはBATCH_SIZE件ずつページネーション表示
 */

/** 全店舗ページで一度に表示する件数 */
const BATCH_SIZE = 48;

/**
 * 1件分の店舗カードHTMLを返す
 */
function buildCardHtml(store) {
  const daysBadgeClass = store.days.length === 2 ? 'both-days' : 'single-day';

  const hasInstagram = store.instagram &&
                       store.instagram !== '' &&
                       !store.instagram.includes('利用なし') &&
                       store.instagram !== 'https://www.instagram.com/';

  const instagramLink = hasInstagram
    ? `<a href="${store.instagram}" class="instagram-link" target="_blank" rel="noopener noreferrer">Instagramで見る</a>`
    : `<span class="instagram-link disabled" title="Instagramアカウントなし">Instagramアカウントなし</span>`;

  // loading="lazy" + decoding="async" で初期読み込みを最小化
  const imageHtml = store.image && store.image !== ''
    ? `<img src="${store.image}" alt="${store.name}" class="store-card-image" loading="lazy" decoding="async">`
    : `<div class="store-card-image-placeholder"><div class="placeholder-content">${store.name}</div></div>`;

  const descriptionHtml = (store.description || '')
    .replace(/\r\n|\r|\n/g, '<br>')
    .replace(/\\n/g, '<br>');

  const primaryBooth = String(store.boothNumber || '').split(/[\s,、\/]+/)[0];
  const boothLink = primaryBooth
    ? `venue-map.html?booth=${encodeURIComponent(primaryBooth)}`
    : 'venue-map.html';

  return `<div class="store-card fade-in-on-scroll">
    ${imageHtml}
    <div class="store-card-body">
      <div class="store-meta">
        <a href="${boothLink}" class="store-booth-badge" title="会場マップを見る" onclick="sessionStorage.setItem('machitudo_visited', 'true');">ブース ${store.boothNumber}</a>
        <span class="store-days-badge ${daysBadgeClass}">${formatDays(store.days)}</span>
      </div>
      <h3 class="store-name">${store.name}</h3>
      <p class="store-description">${descriptionHtml}</p>
      ${instagramLink}
    </div>
  </div>`;
}

/**
 * 未表示のカードにのみスクロールアニメーションを設定
 * :not(.is-visible) で既存の監視済みカードを除外
 */
function setupScrollAnimation() {
  const cards = document.querySelectorAll('.store-card.fade-in-on-scroll:not(.is-visible)');
  if (cards.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  cards.forEach(card => observer.observe(card));
}

/**
 * 全店舗ページ用: BATCH_SIZE件ずつレンダリング
 * 「もっと見る」ボタンで次のバッチを追加
 */
function renderBatch(stores, container, startIndex) {
  const batch = stores.slice(startIndex, startIndex + BATCH_SIZE);

  // 既存の「もっと見る」ボタンを削除
  const existingBtn = document.getElementById('loadMoreBtn');
  if (existingBtn) existingBtn.remove();

  // DocumentFragmentでまとめてDOM挿入（リフロー最小化）
  const fragment = document.createRange().createContextualFragment(
    batch.map(buildCardHtml).join('')
  );
  container.appendChild(fragment);

  setupScrollAnimation();

  const nextIndex = startIndex + BATCH_SIZE;
  if (nextIndex < stores.length) {
    const remaining = stores.length - nextIndex;
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.id = 'loadMoreBtn';
    loadMoreBtn.className = 'btn-load-more';
    loadMoreBtn.textContent = `もっと見る（残り ${remaining} 店舗）`;
    loadMoreBtn.addEventListener('click', () => {
      renderBatch(stores, container, nextIndex);
    });
    container.after(loadMoreBtn);
  }
}

/**
 * 店舗カードをレンダリング
 * @param {string} genre - 表示するジャンル
 * @param {string} containerId - 挿入先コンテナのID
 */
function renderStores(genre, containerId = 'storeContainer') {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  // 'all' の場合は全店舗を対象にする（genreNamesに'all'キーがないため）
  const stores = genre === 'all' ? allStoresData : getStoresByGenre(genre);

  if (stores.length === 0) {
    container.innerHTML = '<div class="no-stores-message"><p>現在、このジャンルの店舗情報は準備中です。</p></div>';
    return;
  }

  updateStoreCount(stores.length, genre);

  if (genre === 'all') {
    // 全店舗ページ: ページネーション形式
    renderBatch(stores, container, 0);
  } else {
    // ジャンルページ: 全件を一括innerHTML（DOM操作1回）
    container.innerHTML = stores.map(buildCardHtml).join('');
    setupScrollAnimation();
  }
}

/**
 * 店舗数を表示
 */
function updateStoreCount(count, genre) {
  const countElement = document.getElementById('storeCount');
  if (countElement) {
    const label = genre === 'all' ? '全店舗' : (genreNames[genre] || genre);
    countElement.textContent = `${label}：全${count}店舗`;
  }
}

/**
 * ページ読み込み時の初期化
 */
document.addEventListener('DOMContentLoaded', function() {
  const storeSection = document.querySelector('[data-genre]');
  if (storeSection) {
    const genre = storeSection.getAttribute('data-genre');
    renderStores(genre);
    if (genre === 'all') {
      initAllStoresSearch();
    }
  }
});

// --- 全店舗ページ専用: 検索機能 ---

/** カタカナをひらがなに変換 */
function katakanaToHiragana(str) {
  let out = '';
  for (const ch of str) {
    const code = ch.codePointAt(0);
    if (code >= 0x30A1 && code <= 0x30F6) {
      out += String.fromCodePoint(code - 0x60);
    } else {
      out += ch;
    }
  }
  return out;
}

/** 検索用に文字列を正規化（venue-map.js と同じロジック） */
function normalizeForSearch(str) {
  return katakanaToHiragana(
    String(str || '').normalize('NFKC').toLowerCase().trim()
  ).replace(/[\s\u3000・ー\-_\.]/g, '');
}

/** クエリで allStoresData をフィルタリング */
function filterStores(query) {
  const q = normalizeForSearch(query);
  if (!q) return allStoresData;
  return allStoresData.filter(store => {
    const name = normalizeForSearch(store.name || '');
    const desc = normalizeForSearch(store.description || '');
    return name.includes(q) || desc.includes(q);
  });
}

/** 全店舗ページの検索ボックスを初期化 */
function initAllStoresSearch() {
  const input = document.getElementById('allStoresSearch');
  const container = document.getElementById('storeContainer');
  const hint = document.getElementById('allStoresSearchHint');
  if (!input || !container) return;

  let debounceTimer = null;

  input.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() {
      const query = input.value.trim();

      // 既存の「もっと見る」ボタンを削除
      const btn = document.getElementById('loadMoreBtn');
      if (btn) btn.remove();
      container.innerHTML = '';

      if (!query) {
        // クリア → ページネーション形式に戻す
        renderBatch(allStoresData, container, 0);
        updateStoreCount(allStoresData.length, 'all');
        if (hint) hint.textContent = '';
        return;
      }

      const results = filterStores(query);

      if (results.length === 0) {
        container.innerHTML = '<div class="no-stores-message"><p>「' + query + '」に一致する店舗が見つかりませんでした。</p></div>';
        updateStoreCount(0, 'all');
        if (hint) hint.textContent = '';
        return;
      }

      // 検索中は全件一括表示（ページネーションなし）
      container.innerHTML = results.map(buildCardHtml).join('');
      setupScrollAnimation();
      updateStoreCount(results.length, 'all');
      if (hint) hint.textContent = '「' + query + '」の検索結果：' + results.length + '件';
    }, 200);
  });
}
