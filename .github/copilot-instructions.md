# まちつど Webサイト - GitHub Copilot Instructions

回答は全て日本語で答えてください。
## プロジェクト概要

「まちつど」は九州の地域イベント（約250店舗出店）のWebサイト。おしゃれで落ち着いた雰囲気を重視し、来場者に必要な情報を提供。静的HTMLサイトで、パフォーマンスとシンプルさを優先。

公式Instagram: https://www.instagram.com/machitudo/

## アーキテクチャ

### 技術構成
- **純粋なHTML/CSS/JavaScript** - フレームワークなし
- **単一スタイルシート**: [assets/style.css](assets/style.css) - 全ページで共有
- **JavaScript構成**:
  - [assets/script.js](assets/script.js) - ハンバーガーメニュー、画像遅延ロード、お知らせページネーション、注目店舗スライダー
  - [assets/stores-data.js](assets/stores-data.js) - 全店舗データ（250店舗分の中央管理）
  - [assets/stores-render.js](assets/stores-render.js) - 店舗カード動的レンダリングシステム
- **画像管理**: `assets/images/` - ジャンル別ディレクトリ構造
- **データ駆動型**: 店舗データは一元管理し、各ジャンルページで動的に表示

### ページ構成
**メインページ** (5つ):
- [index.html](index.html) - TOP（イベント概要、日程、ニュース）
- [about.html](about.html) - イベント背景、コンセプト、過去の写真ギャラリー
- [stores.html](stores.html) - ジャンル選択ページ（会場マップ含む）
- [access.html](access.html) - 会場へのアクセス方法、地図
- [contact.html](contact.html) - お問い合わせ先

**ジャンル別店舗ページ** (8つ):
- [food.html](food.html) - フード
- [sweets.html](sweets.html) - スイーツ
- [drink.html](drink.html) - ドリンク
- [workshop.html](workshop.html) - ワークショップ
- [festival.html](festival.html) - 縁日
- [sales.html](sales.html) - 物販
- [green.html](green.html) - グリーン（植物・花）
- [other.html](other.html) - その他
- **重要**: 各ページは `data-genre` 属性で自動的に店舗データをフィルタリング
- 店舗カードは [assets/stores-render.js](assets/stores-render.js) で動的生成される

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
- ハンバーガーメニュー: [assets/script.js](assets/script.js#L1-L35) でモバイル対応
- `.hamburger-menu.active` でアニメーション（×に変形）

### 店舗カード（ジャンルページ用）
**重要**: 店舗カードは [assets/stores-render.js](assets/stores-render.js) によって動的生成されます。
HTMLに直接記述する必要はありません。

生成される構造:
```html
<div class="store-card fade-in-on-scroll">
  <div class="store-card-image-container">
    <img src="assets/images/stores/..." alt="店舗名" class="store-card-image">
    <span class="days-badge both-days">両日</span>
  </div>
  <div class="store-card-body">
    <h3 class="store-name">店舗名</h3>
    <p class="store-description">説明文</p>
    <a href="https://www.instagram.com/..." class="instagram-link" 
       target="_blank" rel="noopener noreferrer">
      <i class="fab fa-instagram"></i> Instagram
    </a>
  </div>
</div>
```

ジャンルページの実装:
```html
<section class="section" data-genre="food">
  <div class="container">
    <p class="store-count-list" id="storeCount">読み込み中...</p>
    <div class="stores-grid" id="storeContainer">
      <!-- JavaScriptで店舗カードが動的に生成されます -->
    </div>
  </div>
</section>
<script src="assets/stores-data.js" defer></script>
<script src="assets/stores-render.js" defer></script>
```
- `data-genre` 属性: ジャンル識別子（food, sweets, drink, workshop, festival, sales, green, other）
- `#storeContainer`: 店舗カード挿入先
- `#storeCount`: 店舗数表示エリア

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
1. **サイト訪問時ローディングアニメーション** (1-68行): TOPページ専用、複数画像のフェードイン/アウト、ズームイン効果、machitudoロゴ表示
2. **ハンバーガーメニュー** (70-104行): モバイルナビゲーション開閉、外側クリックで閉じる
3. **画像遅延ロード** (106-124行): Intersection Observer API使用
4. **お知らせページネーション** (126-224行): トップページのニュース一覧、1ページ3件表示
5. **店舗名フォントサイズ自動調整** (226-253行): 2行以上の店舗名を自動縮小
6. **注目店舗スライダー** (255-463行): stores.htmlの店舗スライダー、全店舗からランダム表示

### 店舗データ管理システム
- **[assets/stores-data.js](assets/stores-data.js)**: 全250店舗の中央データベース
  - 店舗名、説明文、画像パス、Instagram URL、参加日、ジャンルを管理
  - `allStoresData` 配列に全店舗を格納
  - データ形式: `{ name, boothNumber, description, image, instagram, days, genre }`
- **[assets/stores-render.js](assets/stores-render.js)**: 動的レンダリングエンジン
  - `data-genre` 属性から自動的にジャンルを検出
  - 該当ジャンルの店舗のみをフィルタリングして表示
  - 参加日バッジ（両日/1日のみ）を自動生成
  - Instagram有無に応じてリンク/無効表示を切り替え
  - 店舗数カウント表示機能

### データ駆動型アーキテクチャ
- 店舗追加時は `stores-data.js` のみ編集（HTMLページは変更不要）
- 各ジャンルページは自動的に該当店舗を表示
- 詳細は [STORES_DATA_GUIDE.md](STORES_DATA_GUIDE.md) を参照

### 追加機能の実装方針
- 軽量さを保つため、最小限のJavaScriptのみ使用
- jQuery等のライブラリは不使用（Vanilla JS）
- ブラウザネイティブAPI優先（Intersection Observer、Fetch API等）
- データ駆動型: HTMLは極力変更せず、データファイル（stores-data.js）で管理

## レスポンシブブレークポイント

[assets/style.css](assets/style.css) に定義:
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
- ジャンル別に8ページ分割（food, sweets, drink, workshop, festival, sales, green, other）
- **重要**: Instagram埋め込み (`<iframe>`) 禁止（パフォーマンス理由）
- 代替: 店舗画像 + 説明 + Instagramリンク
- **大量店舗対応**: 250店舗でもスムーズなスクロール体験を提供
  - 画像遅延ロード（lazy loading）必須
  - スクロールアニメーションで視覚的な興味を維持
  - 1ページあたり約40-50店舗を目安に分散配置

### 店舗追加の手順
1. 画像を `assets/images/stores/` に配置（最適化済み）
2. [assets/stores-data.js](assets/stores-data.js) の `allStoresData` 配列に店舗情報を追加
3. 店舗オブジェクトの形式:
   ```javascript
   {
     name: "店舗名",
     boothNumber: "ブース番号",
     description: "店舗説明文",
     image: "assets/images/stores/画像ファイル名.jpg",
     instagram: "https://www.instagram.com/アカウント名/",
     days: ["1/31", "2/1"],  // 両日参加の場合
     genre: "フード"  // フード、スイーツ、ドリンク、ワークショップ、縁日、物販、グリーン、その他
   }
   ```
4. HTMLページは変更不要 - [assets/stores-render.js](assets/stores-render.js) が自動的にレンダリング
5. 詳細は [STORES_DATA_GUIDE.md](STORES_DATA_GUIDE.md) を参照

### 画像ディレクトリ構造
```
assets/images/
  ├── hero/          # メインビジュアル（[index.html](index.html)）
  ├── about/         # イベント紹介、過去の写真
  ├── stores/        # 店舗の商品・ロゴ画像（250店舗分）
  ├── access/        # 会場マップ（[access.html](access.html)）
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
- **CSS**: [assets/style.css](assets/style.css) - 検索・編集時は行番号で特定
- **JavaScript**: ブラウザコンソールでエラー確認

### 新規ページ作成チェックリスト
1. `<div class="bg_pattern Paper_v2"></div>` をbody直後に配置
2. ヘッダーのナビゲーションメニューをコピー（[index.html](index.html)参照）
3. Google Fonts読み込み: `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">`
4. `<script src="assets/script.js" defer></script>` 追加
5. ジャンルページの場合は `<script src="assets/stores-data.js" defer></script>` と `<script src="assets/stores-render.js" defer></script>` も追加
6. メタタグ設定（viewport、description）

## 注意事項

### 店舗データの一元管理
- 店舗情報は [assets/stores-data.js](assets/stores-data.js) で一元管理
- HTMLページには店舗カードを直接記述しない
- 新規店舗追加時は `stores-data.js` のみ編集
- ジャンル変更や店舗情報の更新も `stores-data.js` で一括管理

### Instagram連携
- 公式アカウント: @machitudo
- 店舗のInstagram情報はリンクで提供（埋め込みは避ける）
- Instagram URLは `stores-data.js` で管理
- アカウントがない店舗は無効表示（グレーアウト）

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
