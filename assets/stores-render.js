/**
 * まちつど 店舗レンダリングシステム
 * 
 * ジャンル別ページで店舗カードを動的に生成します
 */

/**
 * 店舗カードをレンダリング
 * @param {string} genre - 表示するジャンル（sweets, drink, food, cafe, handmade, workshop, festival）
 * @param {string} containerId - 店舗カードを挿入するコンテナのID
 */
function renderStores(genre, containerId = 'storeContainer') {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }
  
  // ジャンルでフィルタリング
  const stores = getStoresByGenre(genre);
  
  if (stores.length === 0) {
    container.innerHTML = `
      <div class="no-stores-message">
        <p>現在、このジャンルの店舗情報は準備中です。</p>
      </div>
    `;
    return;
  }
  
  // 店舗カードを生成
  stores.forEach(store => {
    const card = document.createElement('div');
    card.className = 'store-card fade-in-on-scroll';
    
    // 参加日バッジの色を決定
    const daysBadgeClass = store.days.length === 2 ? 'both-days' : 'single-day';
    
    // Instagramアカウントの有無を確認
    const hasInstagram = store.instagram && 
                        store.instagram !== '' && 
                        !store.instagram.includes('利用なし') &&
                        store.instagram !== 'https://www.instagram.com/';
    
    // InstagramリンクのHTML
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
    
    // 画像があるか確認
    const imageHtml = store.image && store.image !== '' 
      ? `<img src="${store.image}" alt="${store.name}" class="store-card-image">`
      : `<div class="store-card-image-placeholder">
           <div class="placeholder-content">${store.name}</div>
         </div>`;
    
    card.innerHTML = `
      ${imageHtml}
      <div class="store-card-body">
        <div class="store-meta">
          <span class="store-booth-badge">ブース ${store.boothNumber}</span>
          <span class="store-days-badge ${daysBadgeClass}">${formatDays(store.days)}</span>
        </div>
        <h3 class="store-name">${store.name}</h3>
        <p class="store-description">${store.description}</p>
        ${instagramLink}
      </div>
    `;
    
    container.appendChild(card);
  });
  
  // 店舗数を表示（オプション）
  updateStoreCount(stores.length, genre);
  
  // スクロールアニメーションを設定
  setupScrollAnimation();
}

/**
 * スクロールアニメーションを設定
 * カードがビューポートに入ったらふわっと表示
 */
function setupScrollAnimation() {
  const cards = document.querySelectorAll('.store-card.fade-in-on-scroll');
  
  if (cards.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // 一度表示したら監視解除（パフォーマンス向上）
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  cards.forEach(card => observer.observe(card));
}

/**
 * 店舗数を表示
 */
function updateStoreCount(count, genre) {
  const countElement = document.getElementById('storeCount');
  if (countElement) {
    countElement.textContent = `${genreNames[genre]}：全${count}店舗`;
  }
}

/**
 * ページ読み込み時の初期化
 * 各ジャンルページで呼び出されます
 */
document.addEventListener('DOMContentLoaded', function() {
  // data-genre属性から現在のジャンルを取得
  const storeSection = document.querySelector('[data-genre]');
  
  if (storeSection) {
    const genre = storeSection.getAttribute('data-genre');
    renderStores(genre);
  }
});
