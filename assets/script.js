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
        if (loadingTitle) loadingTitle.classList.add('show');
        if (loadingSubtitle) loadingSubtitle.classList.add('show');
        
        // テキスト表示後、少し待ってからフェードアウト
        setTimeout(function() {
          if (loadingTitle) loadingTitle.style.opacity = '0';
          if (loadingSubtitle) loadingSubtitle.style.opacity = '0';
          
          // テキストフェードアウト後、ローディング画面全体をフェードアウト
          setTimeout(function() {
            if (loadingScreen) loadingScreen.classList.add('fade-out');
            
            // フェードアウト完了後にローディング画面を非表示
            setTimeout(function() {
              if (loadingScreen) loadingScreen.style.display = 'none';
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

// Turn.js初期化（stores.htmlページ専用）
if (typeof jQuery !== 'undefined') {
  jQuery(document).ready(function($) {
    const flipbook = $('#featured-flipbook');
    
    if (flipbook.length) {
      // Turn.jsの読み込み確認
      if (typeof $. fn.turn === 'undefined') {
        console.error('Turn.js が読み込まれていません。');
        flipbook.html('<p style="text-align: center;padding:40px;">Flipbook機能を読み込めませんでした。</p>');
        return;
      }

      // 全ジャンルの店舗データ（サンプル）
      const allStores = [
        { name: 'スイーツ サンプル1', genre: 'スイーツ', description: '手作りケーキとこだわりの焼き菓子をご用意しています。季節のフルーツをふんだんに使用した特製ケーキが人気です。', link: 'sweets. html' },
        { name:  'スイーツ サンプル2', genre: 'スイーツ', description: '季節のフルーツを使った特製タルト専門店です。新鮮な果物の美味しさを最大限に引き出します。', link: 'sweets.html' },
        { name: 'スイーツ サンプル5', genre: 'スイーツ', description: '伝統的な和菓子を現代風にアレンジしています。見た目も美しい創作和菓子をお楽しみください。', link: 'sweets. html' },
        { name:  'ドリンク サンプル1', genre: 'ドリンク', description: 'スペシャルティコーヒーと紅茶の専門店です。厳選された豆と茶葉で最高の一杯を提供します。', link: 'drink.html' },
        { name: 'ドリンク サンプル3', genre: 'ドリンク', description:  'フレッシュジュースとスムージーをご提供します。毎朝仕入れる新鮮な果物を使用しています。', link: 'drink.html' },
        { name: 'フード サンプル1', genre: 'フード', description: '地元食材を使った本格料理をお楽しみください。九州の恵みを存分に味わえる逸品を揃えています。', link: 'food.html' },
        { name: 'フード サンプル4', genre: 'フード', description: '世界各国の料理を屋台スタイルで提供します。本場の味をカジュアルにお楽しみいただけます。', link: 'food.html' },
        { name: 'カフェ サンプル1', genre: 'カフェ', description: '落ち着いた空間でゆったりとした時間を。こだわりの珈琲と手作りスイーツでおもてなし。', link: 'cafe.html' },
        { name: 'カフェ サンプル2', genre: 'カフェ', description: 'ラテアートとこだわりのコーヒー豆を使用。一杯一杯丁寧に淹れる本格派カフェです。', link: 'cafe.html' },
        { name: 'ハンドメイド サンプル1', genre: 'ハンドメイド', description: '手作りアクセサリーと雑貨をお届けします。一つ一つ心を込めて制作したオリジナル作品です。', link: 'handmade.html' },
        { name: 'ハンドメイド サンプル3', genre: 'ハンドメイド', description: 'オリジナルデザインの布製品を販売しています。日常使いできる温もりある作品を揃えています。', link: 'handmade. html' },
        { name:  'ワークショップ サンプル1', genre:  'ワークショップ', description: '親子で楽しめる体験型イベントを開催。素敵な思い出作りをお手伝いします。', link: 'workshop.html' },
        { name: 'ワークショップ サンプル2', genre: 'ワークショップ', description: '陶芸やガラス細工の体験ができます。初心者の方でも楽しめる丁寧な指導を行います。', link: 'workshop.html' },
        { name: 'フェスティバル サンプル1', genre: 'フェスティバル', description: 'ライブパフォーマンスと音楽を楽しめます。地元アーティストによる素敵な演奏をお届け。', link: 'festival.html' },
        { name: 'フェスティバル サンプル2', genre: 'フェスティバル', description: '地域の伝統芸能を披露いたします。受け継がれてきた文化の素晴らしさを体感してください。', link: 'festival.html' },
        { name: 'スイーツ サンプル8', genre: 'スイーツ', description: 'チョコレート専門店。カカオの香り豊かな逸品を取り揃えています。', link: 'sweets.html' },
        { name: 'ドリンク サンプル5', genre: 'ドリンク', description: '自家製シロップを使ったクラフトソーダ。季節ごとに変わるフレーバーをお楽しみください。', link: 'drink.html' },
        { name: 'フード サンプル7', genre: 'フード', description: '炭火焼きの香ばしい料理をご提供します。じっくりと焼き上げた絶品料理が自慢です。', link: 'food.html' },
        { name: 'ハンドメイド サンプル5', genre: 'ハンドメイド', description:  '天然素材にこだわったナチュラル雑貨。環境に優しい素材のみを使用しています。', link: 'handmade.html' },
        { name: 'カフェ サンプル3', genre: 'カフェ', description: '本格的な紅茶専門のカフェです。世界各地から厳選した茶葉をご用意しています。', link: 'cafe.html' }
      ];

      // ランダムに12店舗を選択
      const shuffled = allStores.sort(() => 0.5 - Math.random());
      const featured = shuffled.slice(0, 12);

      // 表紙ページを追加
      const coverHTML = `
        <div class="page cover-page">
          <div class="cover-content">
            <h2 class="cover-title">注目の出店店舗</h2>
            <p class="cover-subtitle">machitudo 2025</p>
            <div class="cover-decoration">
              <div class="decoration-line"></div>
              <div class="decoration-icon">✦</div>
              <div class="decoration-line"></div>
            </div>
            <p class="cover-description">
              約250店舗の中から<br>
              ランダムにピックアップした<br>
              魅力的な店舗をご紹介します
            </p>
            <p class="cover-instruction">← スワイプしてページをめくる</p>
          </div>
        </div>
      `;
      flipbook.append(coverHTML);

      // 店舗ページを生成
      featured.forEach(store => {
        const pageHTML = `
          <div class="page">
            <div class="flipbook-store-card">
              <div class="store-card-image">${store.name}</div>
              <div class="store-card-body">
                <span class="store-genre">${store.genre}</span>
                <h3 class="store-name">${store.name}</h3>
                <p class="store-description">${store.description}</p>
                <a href="${store. link}" class="store-link">詳しく見る</a>
              </div>
            </div>
          </div>
        `;
        flipbook.append(pageHTML);
      });

      // ページ情報更新関数
      function updatePageInfo() {
        const currentPage = flipbook.turn('page');
        const totalPages = flipbook.turn('pages');
        
        $('#current-page').text(currentPage);
        $('#total-pages').text(totalPages);
        
        // ボタンの有効/無効切り替え
        $('. flipbook-prev').prop('disabled', currentPage === 1);
        $('.flipbook-next').prop('disabled', currentPage >= totalPages);
      }

      // Turn.js初期化関数
      function initFlipbook() {
        const isMobile = window.innerWidth <= 768;
        const flipbookWidth = isMobile ? Math.min(window.innerWidth - 40, 500) : 1200;
        const flipbookHeight = isMobile ? 400 : 600;
        const displayMode = isMobile ? 'single' : 'double';
        
        let currentPage = 1;
        
        // 既存のTurn.jsを破棄
        if (flipbook.turn('is')) {
          currentPage = flipbook.turn('page');
          flipbook.turn('destroy');
        }
        
        // Turn.js初期化
        flipbook.turn({
          width: flipbookWidth,
          height: flipbookHeight,
          autoCenter: true,
          display: displayMode,
          acceleration:  true,
          gradients: true,
          elevation: 50,
          page: currentPage
        });
        
        // ページ情報を更新
        updatePageInfo();
      }
      
      // 初期化実行
      initFlipbook();
      
      // ウィンドウリサイズ時に再初期化
      let resizeTimer;
      $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initFlipbook, 250);
      });

      // ボタンイベント
      $('.flipbook-prev').on('click', function() {
        if (!$(this).prop('disabled')) {
          flipbook.turn('previous');
        }
      });

      $('.flipbook-next').on('click', function() {
        if (!$(this).prop('disabled')) {
          flipbook.turn('next');
        }
      });

      // ページ変更イベント
      flipbook.on('turned', function(event, page) {
        updatePageInfo();
      });
    }
  });
}
