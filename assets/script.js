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
