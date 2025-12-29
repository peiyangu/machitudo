# まちつど Webサイト - GitHub Copilot Instructions

回答は全て日本語で答えてください。
## プロジェクト概要

「まちつど」は九州の地域イベント（約250店舗出店）のWebサイト。おしゃれで落ち着いた雰囲気を重視し、来場者に必要な情報を提供。静的HTMLサイトで、パフォーマンスとシンプルさを優先。

公式Instagram: https://www.instagram.com/machitudo/

## アーキテクチャ

### 技術構成
- **純粋なHTML/CSS/JavaScript** - フレームワークなし
- **単一スタイルシート**: [assets/style.css](assets/style.css) (2162行) - 全ページで共有
- **最小限のJavaScript**: [assets/script.js](assets/script.js) - ハンバーガーメニュー、画像観察、ローディングアニメーション
- **画像管理**: `assets/images/` - ジャンル別ディレクトリ構造

### ページ構成
**メインページ** (5つ):
- [index.html](index.html) - TOP（イベント概要、日程、ニュース）
- [about.html](about.html) - イベント背景、コンセプト、過去の写真ギャラリー
- [stores.html](stores.html) - ジャンル選択ページ（会場マップ含む）
- [access.html](access.html) - 会場へのアクセス方法、地図
- [contact.html](contact.html) - お問い合わせ先

**ジャンル別店舗ページ** (6つ):
- [sweets.html](sweets.html), [drink.html](drink.html), [food.html](food.html), [cafe.html](cafe.html), [handmade.html](handmade.html), [workshop.html](workshop.html), [festival.html](festival.html)
- 各ページは同じ `.store-card` 構造を使用

## デザインシステム

### CSS変数（必須使用）
```css
:root {
  --color-dark: #2A2D34;   /* メインテキスト、ヘッダー、フッター */
  --color-white: #FFFFFF;   /* 背景、カード */
  --color-gold: #A78D6D;    /* アクセント、リンク、ボタン */
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Lato', sans-serif;
  --container-width: 1200px;
}
```

### 背景パターン（全ページ必須）
```html
<body>
  <div class="bg_pattern Paper_v2"></div>
  <!-- コンテンツ -->
</body>
```
`.Paper_v2` は紙のようなテクスチャを提供（グラデーション + 細かいラインパターン）

### タイポグラフィルール
- **見出し**: `var(--font-heading)` (Playfair Display) - エレガントなセリフ体
- **本文**: `var(--font-body)` (Lato) - モダンなサンセリフ
- **行間**: `line-height: 1.8` (本文)、`line-height: 1.3` (見出し)
- **日本語最適化**: 適度な余白設定

## コンポーネントパターン

### ヘッダー構造（全ページ共通）
```html
<header class="site-header">
  <div class="container">
    <h1 class="site-title">machitudo</h1>
    <button class="hamburger-menu" aria-label="メニュー">
      <span></span><span></span><span></span>
    </button>
    <nav class="site-nav">
      <a href="index.html">トップ</a>
      <a href="about.html">machitudoについて</a>
      <a href="stores.html">店舗紹介</a>
      <a href="access.html">アクセス</a>
      <a href="contact.html">お問い合わせ</a>
    </nav>
  </div>
</header>
```
- ハンバーガーメニュー: [assets/script.js](assets/script.js#L52-L86) でモバイル対応
- `.hamburger-menu.active` でアニメーション（×に変形）

### 店舗カード（ジャンルページ用）
```html
<div class="store-card">
  <img src="assets/images/stores/..." alt="店舗名" class="store-card-image">
  <div class="store-card-body">
    <h3 class="store-name">店舗名</h3>
    <p class="store-description">説明文</p>
    <a href="https://www.instagram.com/..." class="instagram-link" 
       target="_blank" rel="noopener noreferrer">
      Instagramで見る
    </a>
  </div>
</div>
```
- **重要**: Instagram埋め込み (`<iframe>`) は使用しない（パフォーマンス重視）
- 画像 + リンクのシンプルな構造

### ボタンスタイル
```html
<a href="..." class="btn-primary">メインアクション</a>
<a href="..." class="btn-secondary">サブアクション</a>
```
- `.btn-primary`: ゴールド背景、白テキスト
- `.btn-secondary`: 白背景、ゴールドボーダー
- ホバー時: `opacity: 0.85`

## JavaScript機能（[assets/script.js](assets/script.js)）

### 実装済み機能
1. **ローディングアニメーション** (1-47行): 複数画像のフェードイン → タイトル表示 → フェードアウト
2. **ハンバーガーメニュー** (52-86行): モバイルナビゲーション開閉、外側クリックで閉じる
3. **画像遅延ロード** (91-103行): Intersection Observer API使用

### 追加機能の実装方針
- 軽量さを保つため、最小限のJavaScriptのみ使用
- jQuery等のライブラリは不使用（Vanilla JS）
- ブラウザネイティブAPI優先（Intersection Observer、Fetch API等）

### 将来の機能（計画中）
**スクロールアニメーション** - 250店舗対応のための視覚的フィードバック:
- 店舗カード（`.store-card`）がビューポートに入る際のフェードイン・スライドアニメーション
- 既存の Intersection Observer API（91-103行）を拡張して実装
- パフォーマンス重視: `root-margin` で事前読み込み、CSSトランジションで滑らかな動き
- 実装例:
  ```javascript
  // 店舗カードの遅延アニメーション
  const storeCards = document.querySelectorAll('.store-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '50px' });
  ```
- 対応するCSS: `transform: translateY(20px)` → `translateY(0)` + `opacity: 0` → `1`

## レスポンシブブレークポイント

[assets/style.css](assets/style.css#L2050-L2162) に定義:
- **デスクトップ**: 1024px以上（デフォルト）
- **タブレット**: 768px〜1023px
- **モバイル**: 〜767px
- **小型スマホ**: 〜374px

### モバイル固有の動作
- ハンバーガーメニュー表示: `@media (max-width: 767px)`
- ナビゲーション: 全画面オーバーレイ（`.site-nav.active`）
- フォントサイズ縮小、パディング調整

## 店舗データ管理

### 250店舗の実装戦略
- ジャンル別に6ページ分割（sweets, drink, food, cafe, handmade, workshop, festival）
- **重要**: Instagram埋め込み (`<iframe>`) 禁止（パフォーマンス理由）
- 代替: 店舗画像 + 説明 + Instagramリンク
- **大量店舗対応**: 250店舗でもスムーズなスクロール体験を提供
  - 画像遅延ロード（lazy loading）必須
  - スクロールアニメーションで視覚的な興味を維持
  - 1ページあたり約40-50店舗を目安に分散配置

### 店舗追加の手順
1. 画像を `assets/images/stores/` に配置（最適化済み）
2. 該当ジャンルページ（例: [sweets.html](sweets.html#L47-L59)）に `.store-card` 追加
3. Instagram URL、店舗名、説明文を記載
4. `target="_blank" rel="noopener noreferrer"` でセキュリティ対策

### 画像ディレクトリ構造
```
assets/images/
  ├── hero/          # メインビジュアル（[index.html](index.html#L34-L36)）
  ├── about/         # イベント紹介、過去の写真
  ├── stores/        # 店舗の商品・ロゴ画像
  ├── access/        # 会場マップ（[stores.html](stores.html#L48)）
  └── icons/         # UI装飾用アイコン
```

## 開発ワークフロー

### ローカル開発
- **静的HTMLサイト** - ビルドプロセス不要
- 直接HTMLファイルをブラウザで開く、またはシンプルなHTTPサーバー使用:
  ```bash
  # Python 3の場合
  python3 -m http.server 8000
  # その後 http://localhost:8000 でアクセス
  ```

### コードの検証
- **HTML**: W3C Validator推奨（セマンティックマークアップ確認）
- **CSS**: [assets/style.css](assets/style.css) は2162行 - 検索・編集時は行番号で特定
- **JavaScript**: ブラウザコンソールでエラー確認

### 新規ページ作成チェックリスト
1. `<div class="bg_pattern Paper_v2"></div>` をbody直後に配置
2. ヘッダーのナビゲーションメニューをコピー（[index.html](index.html#L13-L28)参照）
3. Google Fonts読み込み: `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">`
4. `<script src="assets/script.js" defer></script>` 追加
5. メタタグ設定（viewport、description）

## 注意事項

### 現在の開発フェーズ
- HTML/CSSによる静的サイト構築が優先
- JavaScriptによる動的機能は後回し
- パフォーマンスとシンプルさを重視

### Instagram連携
- 公式アカウント: @machitudo
- 店舗のInstagram情報はリンクで提供（埋め込みは避ける）
- 必要に応じて、店舗の写真を保存してローカルで使用

### コンテンツの優先順位
1. 基本情報の整備（日程、場所、概要）
2. 店舗情報の構造化とジャンル分け
3. デザインの統一と洗練
4. 写真素材の追加
5. JavaScriptによる機能拡張（将来）

## GitHub Copilotへの指示

コードを生成する際は以下を考慮してください：
- 落ち着いたエレガントなデザインを意識
- 指定されたカラーパレットとフォントを厳守
- セマンティックで保守性の高いHTML
- 再利用可能でモジュラーなCSS
- モバイルフレンドリーなレスポンシブデザイン
- 軽量で高速なページロード
- アクセシビリティの基本原則を遵守
- 日本語コンテンツに適した行間・余白設定
