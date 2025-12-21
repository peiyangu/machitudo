# まちつど Webサイト - GitHub Copilot Instructions

## プロジェクト概要

「まちつど」は地域イベントのWebサイトです。おしゃれで落ち着いた雰囲気を大切にし、来場者に必要な情報を分かりやすく提供することを目的としています。

公式Instagram: https://www.instagram.com/machitudo/

## サイト構成

### ページ構成（タブ）
1. **TOP (index.html)** - イベントの概要、開催日程、ハイライト情報
2. **まちつどについて (about.html)** - イベントの背景、コンセプト、過去の写真
3. **店舗紹介 (stores.html)** - 出店する約250店舗をジャンル別に紹介
4. **アクセス (access.html)** - 会場へのアクセス方法、会場マップ
5. **お問い合わせ (contact.html)** - イベントのお問い合わせ先

### 追加ページ（現在存在）
- sweets.html - スイーツジャンルの店舗紹介
- drink.html - ドリンクジャンルの店舗紹介
- food.html - 飲食ジャンルの店舗紹介
- handmade.html - ハンドメイドジャンルの店舗紹介
- workshop.html - ワークショップの店舗紹介
- festival.html - 縁日の店舗紹介

## デザインガイドライン

### カラーパレット
- **#2A2D34** - ダークグレー（メインテキスト、ヘッダー、フッター）
- **#FFFFFF** - ホワイト（背景、カード背景）
- **#A78D6D** - ゴールド（アクセントカラー、リンク、ボタン、見出しのアクセント）

### タイポグラフィ
```css
/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap');

/* 使用方法 */
font-family: 'Playfair Display', serif; /* 見出し用 - エレガントで格式高い */
font-family: 'Lato', sans-serif;        /* 本文用 - 読みやすくモダン */
```

### デザインの雰囲気
- **おしゃれで落ち着いた雰囲気**を重視
- シンプルで洗練されたレイアウト
- 適度な余白とエレガントなフォント使い
- ゴールドをアクセントに品のある印象

## 技術スタック

### 現在使用中
- HTML5
- CSS3 (assets/style.css)
- Google Fonts (Playfair Display + Lato)

### 今後の予定
- JavaScript（動的な機能追加は後回し）
- レスポンシブデザインの強化

## コーディング規約

### HTML
- セマンティックなHTMLタグを使用（header, nav, main, section, article, footer など）
- 各ページに共通のナビゲーションメニューを配置
- メタタグ（description, viewport など）を適切に設定
- アクセシビリティを考慮（alt属性、適切な見出し階層など）

### CSS
- 単一のスタイルシート（assets/style.css）で管理
- BEM記法またはそれに準ずる命名規則を推奨
- モバイルファーストアプローチ
- 色は変数またはカスタムプロパティで管理推奨

```css
:root {
  --color-dark: #2A2D34;
  --color-white: #FFFFFF;
  --color-gold: #A78D6D;
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Lato', sans-serif;
}
```

### レスポンシブデザイン
```css
/* モバイル: 〜767px */
/* タブレット: 768px〜1023px */
/* デスクトップ: 1024px〜 */
```

## 店舗紹介の実装方針

### 250店舗の管理
- ジャンル別にページを分割（sweets.html, drink.html, food.html, handmade.html, workshop.html, festival.html）
- 各店舗は**Instagram埋め込みを使用しない**（パフォーマンスを考慮）

### 店舗カードの構造
```html
<div class="store-card">
  <img src="path/to/image.jpg" alt="店舗名">
  <h3 class="store-name">店舗名</h3>
  <p class="store-description">店舗の説明文</p>
  <a href="https://www.instagram.com/店舗アカウント/" 
     class="instagram-link" 
     target="_blank" 
     rel="noopener noreferrer">
    Instagramで見る
  </a>
</div>
```

### パフォーマンス最適化
- 画像は適切なサイズに圧縮
- lazyload属性を活用
- Instagram埋め込みの代わりに、写真+説明+リンクで軽量化

## アクセスページの方針

### 基本情報
- 会場の住所、最寄り駅
- 公共交通機関でのアクセス方法
- 駐車場情報（ある場合）

### 会場マップ
- 開催直前に会場マップを追加予定
- オプション1: access.html内にセクションとして追加
- オプション2: 別ページ（map.html）として独立
- **推奨**: access.html内にタブまたはセクションで実装（ユーザーがアクセス情報とマップを一箇所で確認できる）

## 写真とメディアの扱い

### 過去の写真
- about.htmlに過去のイベント写真のギャラリーを設置
- グリッドレイアウトまたはカードレイアウトで表示
- クリックで拡大表示できると良い（将来的にJavaScriptで実装）

### 推奨フォルダ構造
```
assets/
  ├── images/
  │   ├── hero/          # メインビジュアル
  │   ├── about/         # イベント紹介・過去の写真
  │   ├── stores/        # 店舗の写真
  │   ├── access/        # アクセス・マップ
  │   └── icons/         # アイコン類
  ├── style.css
  └── scripts/           # 将来的なJavaScript用
```

## よくある実装パターン

### ナビゲーションメニュー
```html
<nav class="main-nav">
  <ul>
    <li><a href="index.html">TOP</a></li>
    <li><a href="about.html">まちつどについて</a></li>
    <li><a href="stores.html">店舗紹介</a></li>
    <li><a href="access.html">アクセス</a></li>
    <li><a href="contact.html">お問い合わせ</a></li>
  </ul>
</nav>
```

### ボタンスタイル
```css
.btn-primary {
  background-color: var(--color-gold);
  color: var(--color-white);
  padding: 12px 32px;
  border: none;
  border-radius: 4px;
  font-family: var(--font-body);
  font-weight: 700;
  transition: opacity 0.3s ease;
}

.btn-primary:hover {
  opacity: 0.85;
}
```

### セクションのレイアウト
```css
.section {
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  color: var(--color-dark);
  text-align: center;
  margin-bottom: 48px;
}
```

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
