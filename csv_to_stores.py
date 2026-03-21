#!/usr/bin/env python3
"""
まちつど 店舗CSVデータ → stores-data.js 変換スクリプト

使い方:
  python csv_to_stores.py [csv_file] [output_file]

デフォルト:
  csv_file:    平田サイト作成用.csv
  output_file: assets/stores-data.js

CSV列の仕様:
  1列目 (index 0): 店舗名 (name)
  2列目 (index 1): 参加日程 (days)
  3列目 (index 2): カテゴリー (genre)
  4列目 (index 3): 無視
  5列目 (index 4): インスタグラムアカウント (instagram)
  6列目 (index 5): 商品名 (description)
"""

import csv
import io
import sys
import os
import re
from collections import Counter
from datetime import datetime

# ===== 設定 =====

# ジャンルのマッピング (CSV値 → stores-data.js で使う値)
GENRE_MAP = {
    'フード': 'フード',
    'スイーツ': 'スイーツ',
    'ドリンク': 'ドリンク',
    'ワークショップ': 'ワークショップ',
    '縁日': '縁日',
    '物販': '物販',
    'グリーン': 'グリーン',
    'その他': 'その他',
    '企業PR': '企業PR',
}

# stores-data.js のジャンル名マッピング (JS用)
GENRE_NAMES_JS = {
    'food': 'フード',
    'sweets': 'スイーツ',
    'drink': 'ドリンク',
    'workshop': 'ワークショップ',
    'festival': '縁日',
    'sales': '物販',
    'green': 'グリーン',
    'other': 'その他',
    'pr': '企業PR',
}

# ===== データ処理関数 =====

def parse_days(day_str):
    """参加日程文字列を ['4/4', '4/5'] 形式のリストに変換"""
    day_str = (day_str or '').strip()
    if '両日' in day_str:
        return ['4/4', '4/5']
    elif '4\u67084\u65e5' in day_str or '4/4' in day_str:
        return ['4/4']
    elif '4\u67085\u65e5' in day_str or '4/5' in day_str:
        return ['4/5']
    return ['4/4', '4/5']  # 不明な場合は両日とみなす


def clean_instagram(raw):
    """インスタグラムアカウント文字列をURL形式に変換"""
    if not raw:
        return ''
    raw = raw.strip()
    # 改行・タブを除去
    raw = re.sub(r'[\n\r\t]', '', raw)
    if not raw:
        return ''
    # 複数アカウントが含まれる場合は最初のものを使用 (スペース/カンマ区切り)
    parts = re.split(r'[\s\u3000,\uff0c]+', raw)
    account = parts[0].strip()
    # 全角・半角@を除去
    account = re.sub(r'^[\uff20@]+', '', account)
    account = account.strip()
    # 無効値チェック
    invalid = {'', '無し', '利用なし', 'nashi', 'column 6'}
    if account.lower() in invalid:
        return ''
    return 'https://www.instagram.com/{}/'.format(account)


def normalize_key(name):
    """重複排除用のキー (前後スペース・全角スペース除去して小文字化)"""
    return re.sub(r'[\s\u3000\u00a0]+', '', (name or '').strip()).lower()


def clean_description(desc):
    """説明文をクリーニング"""
    if not desc:
        return ''
    # 改行コードを統一
    desc = desc.replace('\r\n', '\n').replace('\r', '\n')
    # 先頭・末尾の空白除去
    desc = desc.strip()
    return desc


def js_escape(s):
    """JavaScript のダブルクォート文字列用にエスケープ"""
    if not s:
        return ''
    s = s.replace('\\', '\\\\')
    s = s.replace('"', '\\"')
    s = s.replace('\n', '\\n')
    s = s.replace('\r', '')
    return s


def process_csv(filepath):
    """CSVを読み込み、重複排除した店舗リストを返す"""
    with open(filepath, encoding='utf-8-sig') as f:
        text = f.read()

    reader = csv.reader(io.StringIO(text))
    rows = list(reader)

    stores = {}       # key: normalize_key(name) → store dict
    store_order = []  # 挿入順を保持

    for i, row in enumerate(rows[1:], start=2):  # 1行目はヘッダーのためスキップ
        if len(row) < 1:
            continue

        name_raw = (row[0] or '').strip()
        if not name_raw:
            continue

        days_str    = row[1] if len(row) > 1 else ''
        genre_raw   = (row[2] if len(row) > 2 else '').strip()
        # row[3] は無視
        insta_raw   = row[4] if len(row) > 4 else ''
        desc_raw    = row[5] if len(row) > 5 else ''

        days       = parse_days(days_str)
        genre      = GENRE_MAP.get(genre_raw, genre_raw or 'その他')
        instagram  = clean_instagram(insta_raw)
        description = clean_description(desc_raw)

        key = normalize_key(name_raw)

        if key in stores:
            # 既存エントリを更新 (空フィールドのみ補完)
            existing = stores[key]
            # days を結合 (重複なし・順序保持)
            combined = list(dict.fromkeys(existing['days'] + days))
            existing['days'] = combined
            # instagram: 空なら更新
            if not existing['instagram'] and instagram:
                existing['instagram'] = instagram
            # description: 空なら更新、または新しい方が長ければ更新
            if not existing['description'] and description:
                existing['description'] = description
            elif description and len(description) > len(existing['description']):
                existing['description'] = description
        else:
            store = {
                'name': name_raw,
                'boothNumber': '',
                'description': description,
                'image': '',
                'instagram': instagram,
                'days': days,
                'genre': genre,
            }
            stores[key] = store
            store_order.append(key)

    return [stores[k] for k in store_order]


def generate_js(stores, csv_filename):
    """store リストから stores-data.js の内容を生成"""
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    lines = []

    # ファイルヘッダー
    lines += [
        '/**',
        ' * まちつど 出店店舗データ',
        ' * 自動生成日時: {}'.format(now),
        ' * 入力ファイル: {}'.format(csv_filename),
        ' *',
        ' * このファイルは csv_to_stores.py から自動生成されます。',
        ' * 手動編集は次回の自動生成で上書きされます。',
        ' * 店舗情報を更新する場合は csv_to_stores.py を再実行してください。',
        ' */',
        '',
    ]

    # allStoresData 配列
    lines.append('const allStoresData = [')
    for store in stores:
        lines.append('  {')
        lines.append('    name: "{}",'.format(js_escape(store['name'])))
        lines.append('    boothNumber: "{}",'.format(js_escape(store['boothNumber'])))
        lines.append('    description: "{}",'.format(js_escape(store['description'])))
        lines.append('    image: "{}",'.format(js_escape(store['image'])))
        lines.append('    instagram: "{}",'.format(js_escape(store['instagram'])))
        days_str = ', '.join('"{}"'.format(d) for d in store['days'])
        lines.append('    days: [{}],'.format(days_str))
        lines.append('    genre: "{}",'.format(js_escape(store['genre'])))
        lines.append('  },')
    lines.append('];')
    lines.append('')

    # ジャンル名マッピング
    lines += [
        '',
        '// ジャンル名のマッピング',
        'const genreNames = {',
    ]
    for key, val in GENRE_NAMES_JS.items():
        lines.append('  {}: "{}",'.format(key, val))
    # 末尾カンマを取り除く
    lines[-1] = lines[-1].rstrip(',')
    lines += [
        '};',
        '',
    ]

    # formatDays 関数
    lines += [
        '// 日付のフォーマット関数',
        'function formatDays(days) {',
        '  if (days.includes("4/4") && days.includes("4/5")) {',
        '    return "\u4e21\u65e5\u958b\u50ac";',
        '  } else if (days.includes("4/4")) {',
        '    return "4/4(\u571f)\u306e\u307f";',
        '  } else if (days.includes("4/5")) {',
        '    return "4/5(\u65e5)\u306e\u307f";',
        '  }',
        '  return "";',
        '}',
        '',
    ]

    # getStoresByGenre 関数
    lines += [
        '// ジャンル別に店舗を取得する関数',
        'function getStoresByGenre(genreKey) {',
        '  // genreKey\u3092\u65e5\u672c\u8a9e\u540d\u306b\u5909\u63db',
        '  const genreName = genreNames[genreKey] || genreKey;',
        '  return allStoresData.filter(store => store.genre === genreName);',
        '}',
        '',
    ]

    # getRandomStores 関数
    lines += [
        '// \u30e9\u30f3\u30c0\u30e0\u306b\u5e97\u8217\u3092\u53d6\u5f97\u3059\u308b\u95a2\u6570\uff08PICK UP\u7528\uff09',
        'function getRandomStores(count = 5) {',
        '  const shuffled = [...allStoresData].sort(() => Math.random() - 0.5);',
        '  return shuffled.slice(0, count);',
        '}',
        '',
    ]

    return '\n'.join(lines)


# ===== メイン処理 =====

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))

    csv_file = sys.argv[1] if len(sys.argv) > 1 else os.path.join(script_dir, '\u5e73\u7530\u30b5\u30a4\u30c8\u4f5c\u6210\u7528.csv')
    output_file = sys.argv[2] if len(sys.argv) > 2 else os.path.join(script_dir, 'assets', 'stores-data.js')

    print('入力CSV: {}'.format(csv_file))
    print('出力先:  {}'.format(output_file))

    stores = process_csv(csv_file)
    print('\n処理完了: {} 店舗（重複排除後）'.format(len(stores)))

    # ジャンル別集計
    genre_counts = Counter(s['genre'] for s in stores)
    print('\nジャンル別店舗数:')
    for genre, count in sorted(genre_counts.items(), key=lambda x: -x[1]):
        print('  {:12s}: {}店舗'.format(genre, count))

    js_content = generate_js(stores, os.path.basename(csv_file))

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print('\n✓ {} に書き出しました'.format(output_file))


if __name__ == '__main__':
    main()
