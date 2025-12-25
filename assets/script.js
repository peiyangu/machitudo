// ローディング画面のアニメーション
document.addEventListener('DOMContentLoaded', function() {
  const loadingScreen = document.getElementById('loading-screen');
  const loadingImages = document.querySelectorAll('.loading-image');
  const loadingTitle = document.getElementById('loading-title');
  const loadingSubtitle = document.getElementById('loading-subtitle');
  let currentImageIndex = 0;

  // 画像を順番に表示
  function showNextImage() {
    if (currentImageIndex < loadingImages.length) {
      // 現在の画像を非表示
      if (currentImageIndex > 0) {
        loadingImages[currentImageIndex - 1].classList.remove('active');
      }
      
      // 次の画像を表示
      loadingImages[currentImageIndex].classList.add('active');
      currentImageIndex++;
      
      // 次の画像へ（2秒後）
      setTimeout(showNextImage, 2000);
    } else {
      // すべての画像を表示し終わったら、テキストを表示
      setTimeout(function() {
        loadingTitle.classList.add('show');
        loadingSubtitle.classList.add('show');
        
        // テキスト表示後、少し待ってからフェードアウト
        setTimeout(function() {
          loadingTitle.style.opacity = '0';
          loadingSubtitle.style.opacity = '0';
          
          // テキストフェードアウト後、ローディング画面全体をフェードアウト
          setTimeout(function() {
            loadingScreen.classList.add('fade-out');
            
            // フェードアウト完了後にローディング画面を非表示
            setTimeout(function() {
              loadingScreen.style.display = 'none';
              document.body.classList.remove('loading');
            }, 1000);
          }, 600);
        }, 2000);
      }, 500);
    }
  }

  // ローディング開始
  document.body.classList.add('loading');
  showNextImage();
});

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

// 将来的な画像フェードイン機能のための準備
// Intersection Observer API を使用
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
