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

// 注目店舗スライダー（stores.htmlページ専用）
document.addEventListener('DOMContentLoaded', function() {
  const sliderTrack = document.getElementById('featuredSliderTrack');
  
  if (!sliderTrack) return; // stores.html以外では実行しない
  
  // stores-data.jsから全店舗データを取得
  const pickupStores = typeof allStoresData !== 'undefined' ? allStoresData.map(store => ({
    name: store.name,
    genre: genreNames[store.genre] || store.genre,
    description: store.description,
    link: `${store.genre}.html`,
    instagram: store.instagram || ''
  })) : [];
  
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
    
    card.innerHTML = `
      <div class="slider-card-genre">${store.genre}</div>
      <div class="slider-card-image">${imageContent}</div>
      <div class="slider-card-body">
        <h4 class="slider-store-name">${store.name}</h4>
        <p class="slider-store-description">${store.description}</p>
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
