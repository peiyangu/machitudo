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

// 店舗カードのスクロールアニメーション
// エレガントなフェードイン・スライドアップ効果
document.addEventListener('DOMContentLoaded', function() {
  const storeCards = document.querySelectorAll('.store-card');
  
  // 店舗カードが存在する場合のみ実行
  if (storeCards.length > 0) {
    console.log('店舗カード数:', storeCards.length); // デバッグ用
    
    // 各カードにアニメーション用クラスを追加
    storeCards.forEach(card => {
      card.classList.add('animate-on-scroll');
    });

    // Intersection Observer の設定
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log('カードが表示されました'); // デバッグ用
          // ビューポートに入ったらアニメーションを開始
          entry.target.classList.add('fade-in-up');
          // 一度アニメーションしたら監視を解除（パフォーマンス向上）
          cardObserver.unobserve(entry.target);
        }
      });
    }, {
      // 要素が少しでも見えたらアニメーション開始
      threshold: 0.05,
      // マージンなしで確実に検出
      rootMargin: '0px'
    });

    // 各店舗カードを監視
    storeCards.forEach(card => {
      cardObserver.observe(card);
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
  
  // 全ジャンルの店舗データ（サンプル - 実際の店舗情報に置き換えてください）
  const allStores = [
    { name: 'スイーツ サンプル1', genre: 'スイーツ', description: '手作りケーキとこだわりの焼き菓子をご用意しています。', link: 'sweets.html', instagram: 'https://www.instagram.com/sweets_sample1/' },
    { name: 'スイーツ サンプル2', genre: 'スイーツ', description: '季節のフルーツを使った特製タルト専門店です。', link: 'sweets.html', instagram: 'https://www.instagram.com/sweets_sample2/' },
    { name: 'ドリンク サンプル1', genre: 'ドリンク', description: 'スペシャルティコーヒーと紅茶の専門店です。', link: 'drink.html', instagram: 'https://www.instagram.com/drink_sample1/' },
    { name: 'ドリンク サンプル2', genre: 'ドリンク', description: 'フレッシュジュースとスムージーをご提供します。', link: 'drink.html', instagram: 'https://www.instagram.com/drink_sample2/' },
    { name: 'フード サンプル1', genre: 'フード', description: '地元食材を使った本格料理をお楽しみください。', link: 'food.html', instagram: 'https://www.instagram.com/food_sample1/' },
    { name: 'フード サンプル2', genre: 'フード', description: '世界各国の料理を屋台スタイルで提供します。', link: 'food.html', instagram: 'https://www.instagram.com/food_sample2/' },
    { name: 'カフェ サンプル1', genre: 'カフェ', description: '落ち着いた空間でゆったりとした時間を。', link: 'cafe.html', instagram: 'https://www.instagram.com/cafe_sample1/' },
    { name: 'カフェ サンプル2', genre: 'カフェ', description: 'ラテアートとこだわりのコーヒー豆を使用。', link: 'cafe.html', instagram: 'https://www.instagram.com/cafe_sample2/' },
    { name: 'ハンドメイド サンプル1', genre: 'ハンドメイド', description: '手作りアクセサリーと雑貨をお届けします。', link: 'handmade.html', instagram: 'https://www.instagram.com/handmade_sample1/' },
    { name: 'ハンドメイド サンプル2', genre: 'ハンドメイド', description: 'オリジナルデザインの布製品を販売しています。', link: 'handmade.html', instagram: 'https://www.instagram.com/handmade_sample2/' },
    { name: 'ワークショップ サンプル1', genre: 'ワークショップ', description: '親子で楽しめる体験型イベントを開催。', link: 'workshop.html', instagram: 'https://www.instagram.com/workshop_sample1/' },
    { name: 'ワークショップ サンプル2', genre: 'ワークショップ', description: '陶芸やガラス細工の体験ができます。', link: 'workshop.html', instagram: 'https://www.instagram.com/workshop_sample2/' }
  ];
  
  // ランダムに8店舗を選択
  const shuffled = [...allStores].sort(() => 0.5 - Math.random());
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
