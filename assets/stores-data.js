/**
 * まちつど 出店店舗データ
 * 
 * 各店舗の情報を管理します。
 * ジャンル別ページでフィルタリングして表示されます。
 */

const allStoresData = [
  // スイーツのサンプルデータ
  {
    name: "スイーツショップ サンプル1",
    description: "手作りケーキとこだわりの焼き菓子をご用意しています。季節のフルーツを使った特製ケーキが人気です。",
    image: "assets/images/stores/sample-sweets1.jpg",
    instagram: "https://www.instagram.com/sample_sweets1/",
    days: ["1/31", "2/1"],
    genre: "sweets"
  },
  {
    name: "スイーツショップ サンプル2",
    description: "季節のフルーツを使った特製タルト専門店です。",
    image: "assets/images/stores/sample-sweets2.jpg",
    instagram: "https://www.instagram.com/sample_sweets2/",
    days: ["1/31"],
    genre: "sweets"
  },
  {
    name: "和菓子処 まつや",
    description: "伝統の製法で作る本格和菓子。季節の上生菓子が人気です。",
    image: "assets/images/stores/sample-sweets3.jpg",
    instagram: "https://www.instagram.com/sample_sweets3/",
    days: ["2/1"],
    genre: "sweets"
  },
  {
    name: "パティスリー・ボンヌ",
    description: "フランス仕込みの本格フランス菓子をお届けします。",
    image: "assets/images/stores/sample-sweets4.jpg",
    instagram: "https://www.instagram.com/sample_sweets4/",
    days: ["1/31", "2/1"],
    genre: "sweets"
  },
  {
    name: "焼き菓子工房 クッキーズ",
    description: "サクサククッキーと香ばしい焼き菓子の専門店です。",
    image: "assets/images/stores/sample-sweets5.jpg",
    instagram: "https://www.instagram.com/sample_sweets5/",
    days: ["1/31", "2/1"],
    genre: "sweets"
  },
  
  // ドリンクのサンプルデータ
  {
    name: "コーヒースタンド ブリュー",
    description: "スペシャルティコーヒーと紅茶の専門店です。丁寧に淹れた一杯をお楽しみください。",
    image: "assets/images/stores/sample-drink1.jpg",
    instagram: "https://www.instagram.com/sample_drink1/",
    days: ["2/1"],
    genre: "drink"
  },
  {
    name: "フレッシュジュースバー",
    description: "フレッシュジュースとスムージーをご提供します。",
    image: "assets/images/stores/sample-drink2.jpg",
    instagram: "https://www.instagram.com/sample_drink2/",
    days: ["1/31", "2/1"],
    genre: "drink"
  },
  {
    name: "ティーハウス 茶々",
    description: "世界各国の紅茶とハーブティーを取り揃えています。",
    image: "assets/images/stores/sample-drink3.jpg",
    instagram: "https://www.instagram.com/sample_drink3/",
    days: ["1/31"],
    genre: "drink"
  },
  {
    name: "クラフトビール工房",
    description: "地元の素材を使ったクラフトビールをご提供します。",
    image: "assets/images/stores/sample-drink4.jpg",
    instagram: "https://www.instagram.com/sample_drink4/",
    days: ["1/31", "2/1"],
    genre: "drink"
  },
  {
    name: "抹茶カフェ みどり",
    description: "本格抹茶ドリンクと抹茶スイーツの専門店です。",
    image: "assets/images/stores/sample-drink5.jpg",
    instagram: "https://www.instagram.com/sample_drink5/",
    days: ["2/1"],
    genre: "drink"
  },
  
  // フードのサンプルデータ
  {
    name: "屋台料理 たこやき横丁",
    description: "地元食材を使った本格たこ焼きをお楽しみください。",
    image: "assets/images/stores/sample-food1.jpg",
    instagram: "https://www.instagram.com/sample_food1/",
    days: ["1/31", "2/1"],
    genre: "food"
  },
  {
    name: "ワールドキッチン",
    description: "世界各国の料理を屋台スタイルで提供します。",
    image: "assets/images/stores/sample-food2.jpg",
    instagram: "https://www.instagram.com/sample_food2/",
    days: ["1/31"],
    genre: "food"
  },
  {
    name: "ラーメン屋台 麺屋",
    description: "自家製麺と秘伝のスープが自慢のラーメンです。",
    image: "assets/images/stores/sample-food3.jpg",
    instagram: "https://www.instagram.com/sample_food3/",
    days: ["2/1"],
    genre: "food"
  },
  {
    name: "ピザ窯 マルゲリータ",
    description: "石窯で焼く本格ナポリピザをご提供します。",
    image: "assets/images/stores/sample-food4.jpg",
    instagram: "https://www.instagram.com/sample_food4/",
    days: ["1/31", "2/1"],
    genre: "food"
  },
  {
    name: "おにぎり専門店 むすび",
    description: "地元のお米を使った絶品おにぎりが並びます。",
    image: "assets/images/stores/sample-food5.jpg",
    instagram: "https://www.instagram.com/sample_food5/",
    days: ["1/31", "2/1"],
    genre: "food"
  },
  
  // カフェのサンプルデータ
  {
    name: "カフェ ノスタルジア",
    description: "落ち着いた空間でゆったりとした時間をお過ごしください。",
    image: "assets/images/stores/sample-cafe1.jpg",
    instagram: "https://www.instagram.com/sample_cafe1/",
    days: ["2/1"],
    genre: "cafe"
  },
  {
    name: "ラテアート カフェ",
    description: "ラテアートとこだわりのコーヒー豆を使用しています。",
    image: "assets/images/stores/sample-cafe2.jpg",
    instagram: "https://www.instagram.com/sample_cafe2/",
    days: ["1/31", "2/1"],
    genre: "cafe"
  },
  {
    name: "オーガニックカフェ 緑",
    description: "オーガニック素材にこだわったヘルシーカフェです。",
    image: "assets/images/stores/sample-cafe3.jpg",
    instagram: "https://www.instagram.com/sample_cafe3/",
    days: ["1/31"],
    genre: "cafe"
  },
  {
    name: "ブックカフェ ページ",
    description: "本に囲まれながらゆっくりコーヒーを楽しめます。",
    image: "assets/images/stores/sample-cafe4.jpg",
    instagram: "https://www.instagram.com/sample_cafe4/",
    days: ["1/31", "2/1"],
    genre: "cafe"
  },
  {
    name: "レトロ喫茶 昭和",
    description: "懐かしい昭和の喫茶店の雰囲気を再現しています。",
    image: "assets/images/stores/sample-cafe5.jpg",
    instagram: "https://www.instagram.com/sample_cafe5/",
    days: ["2/1"],
    genre: "cafe"
  },
  
  // ハンドメイドのサンプルデータ
  {
    name: "手作りアクセサリー工房",
    description: "手作りアクセサリーと雑貨をお届けします。",
    image: "assets/images/stores/sample-handmade1.jpg",
    instagram: "https://www.instagram.com/sample_handmade1/",
    days: ["1/31", "2/1"],
    genre: "handmade"
  },
  {
    name: "布雑貨 コットン",
    description: "オリジナルデザインの布製品を販売しています。",
    image: "assets/images/stores/sample-handmade2.jpg",
    instagram: "https://www.instagram.com/sample_handmade2/",
    days: ["1/31"],
    genre: "handmade"
  },
  {
    name: "陶芸工房 つち",
    description: "手びねりの温もりある陶器を販売しています。",
    image: "assets/images/stores/sample-handmade3.jpg",
    instagram: "https://www.instagram.com/sample_handmade3/",
    days: ["2/1"],
    genre: "handmade"
  },
  {
    name: "木工房 きのこ",
    description: "自然の木を活かした木製雑貨をお届けします。",
    image: "assets/images/stores/sample-handmade4.jpg",
    instagram: "https://www.instagram.com/sample_handmade4/",
    days: ["1/31", "2/1"],
    genre: "handmade"
  },
  {
    name: "レザークラフト 革職人",
    description: "本革を使った革製品を一つ一つ手作りしています。",
    image: "assets/images/stores/sample-handmade5.jpg",
    instagram: "https://www.instagram.com/sample_handmade5/",
    days: ["1/31", "2/1"],
    genre: "handmade"
  },
  
  // ワークショップのサンプルデータ
  {
    name: "親子陶芸教室",
    description: "親子で楽しめる体験型イベントを開催します。",
    image: "assets/images/stores/sample-workshop1.jpg",
    instagram: "https://www.instagram.com/sample_workshop1/",
    days: ["2/1"],
    genre: "workshop"
  },
  {
    name: "ガラス細工体験",
    description: "陶芸やガラス細工の体験ができます。",
    image: "assets/images/stores/sample-workshop2.jpg",
    instagram: "https://www.instagram.com/sample_workshop2/",
    days: ["1/31", "2/1"],
    genre: "workshop"
  },
  {
    name: "アロマキャンドル作り",
    description: "自分だけのオリジナルアロマキャンドルを作れます。",
    image: "assets/images/stores/sample-workshop3.jpg",
    instagram: "https://www.instagram.com/sample_workshop3/",
    days: ["1/31"],
    genre: "workshop"
  },
  {
    name: "フラワーアレンジメント教室",
    description: "季節の花を使ったアレンジメントを体験できます。",
    image: "assets/images/stores/sample-workshop4.jpg",
    instagram: "https://www.instagram.com/sample_workshop4/",
    days: ["1/31", "2/1"],
    genre: "workshop"
  },
  {
    name: "子供向けプログラミング教室",
    description: "楽しくプログラミングの基礎を学べます。",
    image: "assets/images/stores/sample-workshop5.jpg",
    instagram: "https://www.instagram.com/sample_workshop5/",
    days: ["2/1"],
    genre: "workshop"
  },
  
  // フェスティバルのサンプルデータ
  {
    name: "縁日ゲーム 射的",
    description: "懐かしい射的ゲームで景品をゲットしよう。",
    image: "assets/images/stores/sample-festival1.jpg",
    instagram: "https://www.instagram.com/sample_festival1/",
    days: ["1/31", "2/1"],
    genre: "festival"
  },
  {
    name: "金魚すくい",
    description: "伝統的な金魚すくいを楽しめます。",
    image: "assets/images/stores/sample-festival2.jpg",
    instagram: "https://www.instagram.com/sample_festival2/",
    days: ["1/31"],
    genre: "festival"
  },
  {
    name: "ヨーヨー釣り",
    description: "子供たちに大人気のヨーヨー釣りです。",
    image: "assets/images/stores/sample-festival3.jpg",
    instagram: "https://www.instagram.com/sample_festival3/",
    days: ["2/1"],
    genre: "festival"
  },
  {
    name: "輪投げ広場",
    description: "家族みんなで楽しめる輪投げゲームです。",
    image: "assets/images/stores/sample-festival4.jpg",
    instagram: "https://www.instagram.com/sample_festival4/",
    days: ["1/31", "2/1"],
    genre: "festival"
  },
  {
    name: "綿あめ屋台",
    description: "ふわふわの綿あめを作ります。いろんな味があるよ！",
    image: "assets/images/stores/sample-festival5.jpg",
    instagram: "https://www.instagram.com/sample_festival5/",
    days: ["1/31", "2/1"],
    genre: "festival"
  }
  
  // ここに追加の店舗データを追加していきます
];

/**
 * ジャンル名のマッピング
 */
const genreNames = {
  food: "フード",
  sweets: "スイーツ",
  drink: "ドリンク",
  workshop: "ワークショップ",
  festival: "縁日",
  sales: "物販",
  green: "グリーン",
  other: "その他"
};

/**
 * 参加日の表示用関数
 */
function formatDays(days) {
  if (days.length === 2) {
    return "両日参加";
  } else if (days.includes("1/31")) {
    return "1/31のみ";
  } else if (days.includes("2/1")) {
    return "2/1のみ";
  }
  return "";
}

/**
 * 指定したジャンルの店舗データを取得
 */
function getStoresByGenre(genre) {
  return allStoresData.filter(store => store.genre === genre);
}

/**
 * ランダムに店舗を取得（PICK UP用）
 */
function getRandomStores(count = 8) {
  const shuffled = [...allStoresData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
