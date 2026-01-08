// ハンバーガーメニューの開閉
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger-menu');
  const nav = document.querySelector('.site-nav');
  const body = document.body;
  const navLinks = document.querySelectorAll('.site-nav a');

  // ハンバーガーメニューのクリックイベント
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      nav.classList.toggle('active');
      body.classList.toggle('menu-open');
    });

    // メニュー内のリンクをクリックしたらメニューを閉じる
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        body.classList.remove('menu-open');
      });
    });

    // メニュー外をクリックしたら閉じる
    document.addEventListener('click', function(event) {
      const isClickInsideNav = nav.contains(event.target);
      const isClickOnHamburger = hamburger.contains(event.target);
      
      if (!isClickInsideNav && !isClickOnHamburger && nav.classList.contains('active')) {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        body.classList.remove('menu-open');
      }
    });
  }
});

// 画像の遅延ロード
document.addEventListener('DOMContentLoaded', function() {
  const images = document.querySelectorAll('img');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  images.forEach(img => {
    imageObserver.observe(img);
  });
});

// お知らせページネーション機能
document.addEventListener('DOMContentLoaded', function() {
  // お知らせデータ（日付の新しい順）
  const newsData = [
    { date: '2025.01.20', datetime: '2025-01-20', title: 'イベント当日の入場順番のお知らせ' },
    { date: '2025.01.18', datetime: '2025-01-18', title: 'オープニングアクトとサブステージ発表' },
    { date: '2025.01.15', datetime: '2025-01-15', title: '会場マップを公開しました' },
    { date: '2025.01.10', datetime: '2025-01-10', title: '出店店舗情報を更新しました' },
    { date: '2025.01.01', datetime: '2025-01-01', title: 'Webサイトを公開しました' }
    // 新しいお知らせはここに追加してください
  ];

  const itemsPerPage = 3; // 1ページあたりの表示件数
  let currentPage = 1;

  const newsList = document.getElementById('newsList');
  const pagination = document.getElementById('newsPagination');

  // お知らせがない場合は何も表示しない
  if (!newsList || newsData.length === 0) return;

  const totalPages = Math.ceil(newsData.length / itemsPerPage);

  // お知らせリストを描画
  function renderNews(page) {
    newsList.innerHTML = '';
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = newsData.slice(startIndex, endIndex);

    pageItems.forEach(news => {
      const li = document.createElement('li');
      li.className = 'news-item';
      li.innerHTML = `
        <time class="news-date" datetime="${news.datetime}">${news.date}</time>
        <span class="news-title">${news.title}</span>
      `;
      newsList.appendChild(li);
    });
  }

  // ページネーションを描画
  function renderPagination() {
    if (totalPages <= 1) {
      pagination.style.display = 'none';
      return;
    }

    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement('button');
      button.className = 'pagination-btn';
      button.textContent = i;
      button.setAttribute('aria-label', `ページ${i}`);
      
      if (i === currentPage) {
        button.classList.add('active');
        button.setAttribute('aria-current', 'page');
      }

      button.addEventListener('click', function() {
        currentPage = i;
        renderNews(currentPage);
        updatePaginationActive();
        // スムーズにお知らせセクションの先頭にスクロール
        document.querySelector('.news-section').scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      });

      pagination.appendChild(button);
    }
  }

  // アクティブなページネーションボタンを更新
  function updatePaginationActive() {
    const buttons = pagination.querySelectorAll('.pagination-btn');
    buttons.forEach((btn, index) => {
      if (index + 1 === currentPage) {
        btn.classList.add('active');
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.classList.remove('active');
        btn.removeAttribute('aria-current');
      }
    });
  }

  // 初期表示
  renderNews(currentPage);
  renderPagination();
});

// 店舗カードの店舗名が2行以上になる場合にフォントサイズを自動で少し縮小
document.addEventListener('DOMContentLoaded', function() {
  const storeNames = document.querySelectorAll('.store-name');

  if (!storeNames.length) return;

  storeNames.forEach(nameEl => {
    const computed = window.getComputedStyle(nameEl);
    let fontSize = parseFloat(computed.fontSize);
    const originalFontSize = fontSize;
    const minFontSize = originalFontSize * 0.8; // 縮小は元の80%まで

    const isMultiLine = () => {
      const style = window.getComputedStyle(nameEl);
      const lineHeight = parseFloat(style.lineHeight);
      if (!lineHeight) return false;
      // 1行分の高さより明らかに大きければ複数行とみなす
      return nameEl.scrollHeight > lineHeight * 1.3;
    };

    if (!isMultiLine()) return;

    // 1行に収まるか、最小サイズになるまで1pxずつ縮小
    while (isMultiLine() && fontSize > minFontSize) {
      fontSize -= 1;
      nameEl.style.fontSize = fontSize + 'px';
    }
  });
});

// 注目店舗スライダー（stores.htmlページ専用）
document.addEventListener('DOMContentLoaded', function() {
  const sliderTrack = document.getElementById('featuredSliderTrack');
  
  if (!sliderTrack) return; // stores.html以外では実行しない
  
  // stores-data.jsから全店舗データを取得
  const pickupStores = typeof allStoresData !== 'undefined'
    ? allStoresData.map(store => {
        // ジャンルキーを逆引きしてスラッグ（food, sweets など）を取得
        let genreKey = store.genre;
        if (typeof genreNames !== 'undefined') {
          const foundKey = Object.keys(genreNames).find(key => genreNames[key] === store.genre);
          if (foundKey) {
            genreKey = foundKey;
          }
        }

        return {
          name: store.name,
          boothNumber: store.boothNumber,
          // 表示用は日本語ジャンル名をそのまま使う
          genre: store.genre,
          description: store.description,
          // 詳細リンクはスラッグを使ってジャンル別ページへ
          link: `${genreKey}.html`,
          instagram: store.instagram || '',
          // 画像パスをスライダー用データにも引き継ぐ
          image: store.image || ''
        };
      })
    : [];
  
  // 全店舗をランダムに並び替え
  const shuffled = [...pickupStores].sort(() => 0.5 - Math.random());
  const featured = shuffled; // 全店舗を使用
  
  let currentSlide = 0;
  const slidesPerView = 1;
  const totalSlides = featured.length;
  
  // カード生成関数
  function createCard(store) {
    const card = document.createElement('div');
    card.className = 'slider-store-card';
    
    // Instagramリンクの確認
    const hasInstagram = store.instagram && 
                        store.instagram !== '' && 
                        !store.instagram.includes('利用なし') &&
                        store.instagram !== 'https://www.instagram.com/';
    
    const instagramLink = hasInstagram 
      ? `<a href="${store.instagram}" class="slider-instagram-link" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram"></i> Instagram</a>`
      : `<span class="slider-instagram-link disabled" title="Instagramアカウントなし"><i class="fas fa-ban"></i> Instagram</span>`;
    
    // 画像がある場合はimgタグ、ない場合は店舗名テキスト
    const imageContent = store.image && store.image !== '' 
      ? `<img src="${store.image}" alt="${store.name}" style="width: 100%; height: 100%; object-fit: cover;">`
      : store.name;

    const descriptionHtml = (store.description || '')
      // 実際の改行コード (LF / CRLF) を <br> に
      .replace(/\r\n|\r|\n/g, '<br>')
      // 文字列としての「\n」も <br> に
      .replace(/\\n/g, '<br>');
    
    card.innerHTML = `
      <div class="slider-card-header">
        <span class="slider-card-genre">${store.genre}</span>
        <span class="slider-booth-badge">ブース ${store.boothNumber}</span>
      </div>
      <div class="slider-card-image">${imageContent}</div>
      <div class="slider-card-body">
        <h4 class="slider-store-name">${store.name}</h4>
        <p class="slider-store-description">${descriptionHtml}</p>
        <div class="slider-card-links">
          ${instagramLink}
          <a href="${store.link}" class="slider-detail-link">詳しく見る →</a>
        </div>
      </div>
    `;
    return card;
  }
  
  // 無限ループ用に前後にカードを複製
  // 最後のカードを前に追加
  sliderTrack.appendChild(createCard(featured[featured.length - 1]));
  // 元のカードを追加
  featured.forEach(store => sliderTrack.appendChild(createCard(store)));
  // 最初のカードを後に追加
  sliderTrack.appendChild(createCard(featured[0]));
  
  // 初期位置を設定（複製された最初のカードの位置）
  currentSlide = 1;
  sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  sliderTrack.style.transition = 'none';
  
  // ドットインジケーターを生成（最大20個まで）
  const dotsContainer = document.getElementById('sliderDots');
  const maxDots = Math.min(totalSlides, 20);
  for (let i = 0; i < maxDots; i++) {
    const dot = document.createElement('button');
    dot.className = 'slider-dot';
    if (i === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', `スライド ${i + 1} に移動`);
    dot.addEventListener('click', () => goToSlide(i + 1, true));
    dotsContainer.appendChild(dot);
  }
  
  let isTransitioning = false;
  
  // スライド移動関数
  function goToSlide(index, withAnimation = true) {
    if (isTransitioning) return;
    
    currentSlide = index;
    
    if (withAnimation) {
      sliderTrack.style.transition = 'transform 0.5s ease';
      isTransitioning = true;
    } else {
      sliderTrack.style.transition = 'none';
    }
    
    const offset = -(currentSlide * 100);
    sliderTrack.style.transform = `translateX(${offset}%)`;
    
    // ドットの更新（0番目のカードは表示されない複製なのでindex-1）
    const dotIndex = (currentSlide - 1) % totalSlides;
    document.querySelectorAll('.slider-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === dotIndex % maxDots);
    });
    
    if (withAnimation) {
      setTimeout(() => {
        // 最後の複製カードに到達したら、最初の実カードにジャンプ
        if (currentSlide === totalSlides + 1) {
          goToSlide(1, false);
        }
        // 最初の複製カードに到達したら、最後の実カードにジャンプ
        if (currentSlide === 0) {
          goToSlide(totalSlides, false);
        }
        isTransitioning = false;
      }, 500);
    }
  }
  
  // ボタンイベント
  document.querySelector('.slider-btn-prev').addEventListener('click', () => {
    if (!isTransitioning) {
      goToSlide(currentSlide - 1, true);
    }
  });
  
  document.querySelector('.slider-btn-next').addEventListener('click', () => {
    if (!isTransitioning) {
      goToSlide(currentSlide + 1, true);
    }
  });
  
  // スワイプ操作のサポート
  let touchStartX = 0;
  let touchEndX = 0;
  
  sliderTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  sliderTrack.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
      // 左スワイプ（次へ）
      goToSlide(currentSlide + 1, true);
    }
    if (touchEndX > touchStartX + 50) {
      // 右スワイプ（前へ）
      goToSlide(currentSlide - 1, true);
    }
  }
  
  // 自動再生（オプション）
  let autoplayInterval;
  function startAutoplay() {
    autoplayInterval = setInterval(() => {
      goToSlide(currentSlide + 1, true);
    }, 5000); // 5秒ごと
  }
  
  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }
  
  // マウスホバーで自動再生を停止
  const sliderContainer = document.querySelector('.featured-slider');
  sliderContainer.addEventListener('mouseenter', stopAutoplay);
  sliderContainer.addEventListener('mouseleave', startAutoplay);
  
  // 自動再生開始
  startAutoplay();
  
  // 初期化
  goToSlide(0);
});
