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
  
  // stores-data.jsからデータを取得してPICK UP用のデータを作成
  const pickupStores = typeof allStoresData !== 'undefined' ? allStoresData.map(store => ({
    name: store.name,
    genre: genreNames[store.genre] || store.genre,
    description: store.description,
    link: `${store.genre}.html`,
    instagram: store.instagram
  })) : [];
  
  // ランダムに8店舗を選択
  const shuffled = [...pickupStores].sort(() => 0.5 - Math.random());
  const featured = shuffled.slice(0, 8);
  
  let currentSlide = 0;
  const slidesPerView = 1; // 常に1店舗ずつ表示
  const maxSlide = featured.length - slidesPerView; // 最後に1店舗表示できる位置
  
  // 店舗カードを生成
  featured.forEach((store, index) => {
    const card = document.createElement('div');
    card.className = 'slider-store-card';
    card.innerHTML = `
      <div class="slider-card-genre">${store.genre}</div>
      <div class="slider-card-image">${store.name}</div>
      <div class="slider-card-body">
        <h4 class="slider-store-name">${store.name}</h4>
        <p class="slider-store-description">${store.description}</p>
        <div class="slider-card-links">
          <a href="${store.instagram}" class="slider-instagram-link" target="_blank" rel="noopener noreferrer">
            📷 Instagram
          </a>
          <a href="${store.link}" class="slider-detail-link">詳しく見る →</a>
        </div>
      </div>
    `;
    sliderTrack.appendChild(card);
  });
  
  // ドットインジケーターを生成
  const dotsContainer = document.getElementById('sliderDots');
  for (let i = 0; i <= maxSlide; i++) {
    const dot = document.createElement('button');
    dot.className = 'slider-dot';
    if (i === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', `スライド ${i + 1} に移動`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
  
  // スライド移動関数
  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index > maxSlide) index = maxSlide;
    
    currentSlide = index;
    // 1枚ずつ移動（2店舗表示の場合、各カードは50%幅）
    const cardWidthPercent = 100 / slidesPerView;
    const offset = -(currentSlide * cardWidthPercent);
    sliderTrack.style.transform = `translateX(${offset}%)`;
    
    // ドットの更新
    document.querySelectorAll('.slider-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
    
    // ボタンの有効/無効
    document.querySelector('.slider-btn-prev').disabled = currentSlide === 0;
    document.querySelector('.slider-btn-next').disabled = currentSlide === maxSlide;
  }
  
  // ボタンイベント
  document.querySelector('.slider-btn-prev').addEventListener('click', () => {
    goToSlide(currentSlide - 1);
  });
  
  document.querySelector('.slider-btn-next').addEventListener('click', () => {
    goToSlide(currentSlide + 1);
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
      goToSlide(currentSlide + 1);
    }
    if (touchEndX > touchStartX + 50) {
      // 右スワイプ（前へ）
      goToSlide(currentSlide - 1);
    }
  }
  
  // 自動再生（オプション）
  let autoplayInterval;
  function startAutoplay() {
    autoplayInterval = setInterval(() => {
      if (currentSlide < maxSlide) {
        goToSlide(currentSlide + 1);
      } else {
        goToSlide(0);
      }
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
