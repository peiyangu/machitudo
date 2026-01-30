// ローディングアニメーション（TOPページのみ、セッション中の初回のみ）
if (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('/machitudo/') || window.location.pathname.endsWith('/machitudo')) {
  window.addEventListener('load', function() {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingImage1 = document.getElementById('loadingImage1');
    const loadingImage2 = document.getElementById('loadingImage2');
    const loadingTitle = document.getElementById('loadingTitle');
    
    if (!loadingScreen) return;
    
    // ローディング画面が非表示の場合（訪問済み）は何もしない
    if (loadingScreen.style.display === 'none') {
      document.body.style.overflow = 'auto';
      return;
    }
    
    // 安全装置：10秒後に強制終了
    const safetyTimeout = setTimeout(() => {
      console.warn('Loading animation forced to end due to timeout');
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    }, 10000);
    
    // デバイスに応じた画像を選択
    const isMobile = window.innerWidth <= 768;
    const images = isMobile ? [
      'assets/images/hero/スマホ1.jpg',
      'assets/images/hero/スマホ2.jpg',
      'assets/images/hero/スマホ3.jpg'
    ] : [
      'assets/images/hero/pc1.jpg',
      'assets/images/hero/pc2.jpg',
      'assets/images/hero/pc3.jpg'
    ];
    
    let currentIndex = 0;
    let isFirstImageActive = true;
    let imageChangeInterval;
    let changeCount = 0; // 切り替え回数をカウント
    
    // 画像読み込みエラー処理
    function handleImageError(img) {
      console.warn('Failed to load image:', img.src);
      // エラーが発生した場合、アニメーションをスキップ
      clearInterval(imageChangeInterval);
      clearTimeout(safetyTimeout);
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    }
    
    // 画像をプリロード
    const preloadImages = images.map(src => {
      const img = new Image();
      img.src = src;
      img.onerror = () => handleImageError(img);
      return img;
    });
    
    // 画像切り替え関数（クロスフェード）
    function changeImage() {
      changeCount++;
      
      // 3枚目まで表示したら切り替えを停止
      if (changeCount >= 2) {
        clearInterval(imageChangeInterval);
      }
      
      currentIndex = (currentIndex + 1) % images.length;
      
      if (isFirstImageActive) {
        // 2番目の画像に次の画像を設定してフェードイン
        loadingImage2.src = images[currentIndex];
        loadingImage2.onerror = () => handleImageError(loadingImage2);
        loadingImage2.classList.add('active');
        loadingImage1.classList.remove('active');
      } else {
        // 1番目の画像に次の画像を設定してフェードイン
        loadingImage1.src = images[currentIndex];
        loadingImage1.onerror = () => handleImageError(loadingImage1);
        loadingImage1.classList.add('active');
        loadingImage2.classList.remove('active');
      }
      
      isFirstImageActive = !isFirstImageActive;
    }
    
    // 初期画像を表示（少し遅延させてフェードイン＋ズームイン効果を発動）
    loadingImage1.src = images[0];
    loadingImage1.onerror = () => handleImageError(loadingImage1);
    setTimeout(() => {
      loadingImage1.classList.add('active');
    }, 100);
    
    // 2秒ごとに画像を切り替え
    imageChangeInterval = setInterval(changeImage, 2000);
    
    // 6秒後にタイトルを表示（全3枚の画像がしっかり表示された後）
    setTimeout(() => {
      if (loadingTitle) {
        loadingTitle.classList.add('show');
      }
    }, 6000);
    
    // 8秒後にローディング画面を非表示
    setTimeout(() => {
      clearTimeout(safetyTimeout);
      if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        
        // フェードアウト完了後に完全に削除
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          document.body.style.overflow = 'auto';
        }, 800);
      }
    }, 8000);
  });
}

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

// バナースライダー（TOPページのみ）
document.addEventListener('DOMContentLoaded', function() {
  const sliderTrack = document.getElementById('bannerSliderTrack');
  
  if (!sliderTrack) return;
  
  // バナー画像データ（2枚のみ）
  const bannerImages = [
    { src: 'assets/images/banner/fuwafuwabanner.jpg', alt: 'ふわふわ遊具', href: '#fuwafuwa' },
    { src: 'assets/images/banner/ShuttleBussBanner.jpg', alt: 'シャトルバス案内', href: 'access.html#bus-shuttle-section' }
  ];
  
  // スライド生成
  bannerImages.forEach((banner, index) => {
    const slide = document.createElement('div');
    slide.className = 'banner-slide';

    if (banner.href) {
      slide.innerHTML = `<a href="${banner.href}" aria-label="${banner.alt}のセクションへ移動"><img src="${banner.src}" alt="${banner.alt}"></a>`;
    } else {
      slide.innerHTML = `<img src="${banner.src}" alt="${banner.alt}">`;
    }

    sliderTrack.appendChild(slide);
  });
  
  // スマホのみ自動スライド
  if (window.innerWidth <= 768) {
    let currentSlide = 0;
    
    setInterval(() => {
      currentSlide = (currentSlide + 1) % bannerImages.length;
      const offset = -(currentSlide * 100);
      sliderTrack.style.transform = `translateX(${offset}%)`;
    }, 5000);
  }
});

// お知らせページネーション機能
document.addEventListener('DOMContentLoaded', function() {
  // お知らせデータ（日付の新しい順）
  const newsData = [
    { date: '2026.01.31', datetime: '2026-01-31', title: 'シャトルバスの運行表を追加しました', category: 'お知らせ', categoryClass: 'news-info', href: 'access.html#shuttle-schedule' },
    { date: '2026.01.20', datetime: '2026-01-20', title: '全250店舗の出店情報を更新しました', category: 'お知らせ', categoryClass: 'news-info' },
    { date: '2026.01.19', datetime: '2026-01-19', title: 'machitudo 2026 公式サイトをオープンしました', category: 'お知らせ', categoryClass: 'news-info' }
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
      const titleHtml = news.href
        ? `<a class="news-title" href="${news.href}">${news.title}</a>`
        : `<span class="news-title">${news.title}</span>`;
      li.innerHTML = `
        <time class="news-date" datetime="${news.datetime}">${news.date}</time>
        <span class="news-category ${news.categoryClass}">${news.category}</span>
        ${titleHtml}
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
    pagination.className = 'pagination';

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

    const primaryBooth = String(store.boothNumber || '').split(/[\s,、\/]+/)[0];
    const boothLink = primaryBooth
      ? `venue-map.html?booth=${encodeURIComponent(primaryBooth)}`
      : 'venue-map.html';
    
    card.innerHTML = `
      <div class="slider-card-header">
        <span class="slider-card-genre">${store.genre}</span>
        <a href="${boothLink}" class="slider-booth-badge" title="会場マップを見る" onclick="sessionStorage.setItem('machitudo_visited', 'true');">ブース ${store.boothNumber}</a>
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
