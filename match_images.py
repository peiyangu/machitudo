#!/usr/bin/env python3
"""
まちつど 店舗画像マッチングスクリプト

assets/images/stores/ 内の画像ファイルと stores-data.js の店舗名をマッチングし、
image フィールドを自動で入力します。

使い方:
  python match_images.py             # マッチング実行 & 更新
  python match_images.py --dry-run   # マッチング結果の確認のみ（ファイルは更新しない）
  python match_images.py --threshold 0.85  # マッチング閾値を変更（デフォルト: 0.80）

出力:
  - マッチング結果の詳細レポート
  - assets/stores-data.js の image フィールドを更新
"""

import os
import re
import sys
import io
import unicodedata
import argparse
from difflib import SequenceMatcher

# Windows ターミナルの文字コード問題を回避（UTF-8 で出力）
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8', 'utf-8-sig'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# ===== 設定 =====

IMAGES_DIR     = "assets/images/stores"
STORES_DATA_JS = "assets/stores-data.js"
IMG_PREFIX     = "assets/images/stores/"
DEFAULT_THRESHOLD = 0.80

# 自動マッチングが困難な店舗の手動マッピング
# key: CSV/stores-data.js の店舗名  value: 画像ファイル名
MANUAL_MAPPINGS = {
    '想sora':                               '想sora楽.jpg',
    "Le'hoa Lopi～レホアロピ〜&Fiore～アンドフィオーレ": '～Le\'hoa Lopi～&Fiore～1.jpg',
    'ぽかぽか':                             'なにわたこ焼きぽかぽか.jpg',
    'nijiiro.candy':                        'にじいろ♡キャンディ1.jpg',
    '駄菓子屋ROCK':                         '駄菓子屋ROCK糸島店.jpg',
    'キッチンカーya重':                      'ya重1.jpg',
    'サニーズキッチン':                      'sunnys kitchen.jpg',
    '居酒屋たこ焼きバー  DE NDEN':           'DEN DEN1.jpg',
    'COCO POULET（ココ プーレ）':           'COCO POULET.jpg',
    'Room.no.025':                          'Room.025.jpg',
    'やきとり 木花':                         'やきとり．木花コノハナ1.jpg',
    'クレイジーアップル':                    'Crazy Apple.jpg',
    '介護美容ひろげるっ隊':                  'ひろげるっ隊.jpg',
    'Rei':                                  'Rei &ネコねこ工房の二人組1.jpg',
    'YABU':                                 '古着屋さん@YABU.jpg',
    'めだか専門店 虹屋':                     'メダカ専門店 虹屋.jpg',
    "CHIKUGO Ma's Craft":                   '筑後マーズクラフト.jpg',
    'Lino hiro (リノ ヒロ)':                'Lino hiro1.jpg',
    'TIDAMEDAKA':                           'めだか屋【TIDA　MEDAKA】.jpg',
    'ひかるば':                             '海洋プラスチックアクセサリー ひかるば.jpg',
    '深草':                                 '深草　松竹.jpg',
    'tracks':                               'tracks 糸島ジビエ工房.jpg',
    'ça va':                                'cava.jpg',
    '和叶 Wacca':                           'Wacca 和叶2.jpg',
    'A&Aモスペット':                         'もふもふモスペット1.jpg',
    'いなか':                               'いなか1.jpg',
    'さわだんち':                            'さわだんち1.jpg',
}


# ===== ユーティリティ =====

def normalize(s):
    """マッチング用に文字列を正規化する。
    - NFKC正規化 (全角→半角)
    - 小文字化
    - 空白・記号を除去
    - 末尾の連続した数字を除去（画像ファイル末尾のシリアル番号対策）
    """
    s = unicodedata.normalize('NFKC', s)
    s = s.lower()
    # 空白（全角を含む）を除去
    s = re.sub(r'[\s\u3000\u00a0\u200b　]', '', s)
    # 末尾の連続する数字を除去（例: "Choice Stand1" → "Choice Stand"）
    s = re.sub(r'\d+$', '', s)
    # 記号・特殊文字を除去
    s = re.sub(r'[_\-\.~&@#!?♡♢☆★～・、。，。（）()「」【】\[\]＆＠／/\\＋\+]', '', s)
    return s


def js_escape(s):
    """JavaScript のダブルクォート文字列用にエスケープ (name検索用)"""
    if not s:
        return ''
    s = s.replace('\\', '\\\\')
    s = s.replace('"', '\\"')
    return s


# ===== 画像ファイル取得 =====

def get_images(images_dir):
    """images_dir 内の画像ファイル名一覧を返す"""
    exts = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.JPG', '.JPEG', '.PNG', '.JPG'}
    result = []
    if not os.path.isdir(images_dir):
        print(f"[ERROR] 画像ディレクトリが見つかりません: {images_dir}")
        return result
    for fname in sorted(os.listdir(images_dir)):
        _, ext = os.path.splitext(fname)
        if ext in exts or ext.upper() in {'.JPG', '.JPEG', '.PNG', '.GIF', '.WEBP'}:
            result.append(fname)
    return result


# ===== マッチング =====

def find_best_match(store_name, image_fnames, threshold):
    """
    店舗名に最もよくマッチする画像ファイル名を返す。
    戻り値: (ファイル名 or None, スコア, マッチ方法)
    """
    norm_name = normalize(store_name)
    if not norm_name:
        return None, 0.0, 'skip'

    best_fname  = None
    best_score  = 0.0
    best_method = ''

    for fname in image_fnames:
        basename, _ = os.path.splitext(fname)
        norm_base = normalize(basename)

        if not norm_base:
            continue

        # ① 完全一致
        if norm_name == norm_base:
            return fname, 1.0, 'exact'

        # ② 一方が他方を含む（短い方の比率で採点）
        if len(norm_name) >= 2 and len(norm_base) >= 2:
            if norm_name in norm_base:
                score = len(norm_name) / len(norm_base) * 0.95
                if score > best_score:
                    best_score  = score
                    best_fname  = fname
                    best_method = 'contains'
                continue
            if norm_base in norm_name:
                score = len(norm_base) / len(norm_name) * 0.95
                if score > best_score:
                    best_score  = score
                    best_fname  = fname
                    best_method = 'contained_by'
                continue

        # ③ SequenceMatcher による類似度
        ratio = SequenceMatcher(None, norm_name, norm_base).ratio()
        if ratio > best_score:
            best_score  = ratio
            best_fname  = fname
            best_method = 'fuzzy'

    if best_score >= threshold:
        return best_fname, best_score, best_method
    return None, best_score, 'no_match'


# ===== JS ファイル更新 =====

def extract_store_names(js_content):
    """stores-data.js から店舗名と現在の image フィールドを抽出する"""
    # name: "STORENAME", の直後の image: "..." を探す
    pattern = re.compile(
        r'name:\s*"((?:[^"\\]|\\.)*)"',
    )
    # image: "..." のパターン
    image_pattern = re.compile(r'image:\s*"((?:[^"\\]|\\.)*)"')

    results = []
    for m in pattern.finditer(js_content):
        name_raw = m.group(1)
        # このエントリの image フィールドを探す（次の { の手前まで）
        pos_after_name = m.end()
        next_entry = js_content.find('  {', pos_after_name)
        end = next_entry if next_entry != -1 else len(js_content)
        segment = js_content[pos_after_name:end]
        img_m = image_pattern.search(segment)
        current_image = img_m.group(1) if img_m else ''
        results.append((name_raw, current_image))
    return results


def update_store_image(js_content, store_name, image_path):
    """
    stores-data.js 内の特定店舗の image フィールドを更新する。
    戻り値: (更新後のjs_content, 成功したかどうか)
    """
    name_escaped = js_escape(store_name)
    name_line    = '    name: "{}",'.format(name_escaped)

    pos = js_content.find(name_line)
    if pos == -1:
        return js_content, False

    # 次のエントリ開始 ( "  {" ) の手前を探索範囲とする
    next_entry_pos = js_content.find('  {', pos + len(name_line))
    search_end = next_entry_pos if next_entry_pos != -1 else len(js_content)

    segment      = js_content[pos:search_end]
    image_marker = '    image: "",'

    img_pos = segment.find(image_marker)
    if img_pos == -1:
        # 既にimageが設定済みの場合はスキップ
        return js_content, False

    abs_pos    = pos + img_pos
    new_line   = '    image: "{}",'.format(image_path)
    new_content = js_content[:abs_pos] + new_line + js_content[abs_pos + len(image_marker):]
    return new_content, True


# ===== メイン =====

def main():
    parser = argparse.ArgumentParser(description='店舗画像マッチングスクリプト')
    parser.add_argument('--dry-run',   action='store_true', help='ファイルを更新せず確認のみ')
    parser.add_argument('--threshold', type=float, default=DEFAULT_THRESHOLD,
                        help='マッチング閾値 0〜1 (デフォルト: {})'.format(DEFAULT_THRESHOLD))
    args = parser.parse_args()

    threshold = args.threshold
    dry_run   = args.dry_run

    print('=' * 60)
    print('  まちつど 店舗画像マッチングスクリプト')
    print('  閾値: {:.2f}  {}'.format(threshold, '[DRY RUN]' if dry_run else ''))
    print('=' * 60)

    # --- 画像ファイル一覧 ---
    image_fnames = get_images(IMAGES_DIR)
    if not image_fnames:
        print('[ERROR] 画像が見つかりません。終了します。')
        return
    print(f'\n画像ファイル数: {len(image_fnames)} 件')

    # --- stores-data.js 読み込み ---
    if not os.path.isfile(STORES_DATA_JS):
        print(f'[ERROR] {STORES_DATA_JS} が見つかりません。')
        return
    with open(STORES_DATA_JS, 'r', encoding='utf-8') as f:
        js_content = f.read()

    store_entries = extract_store_names(js_content)
    print(f'店舗数: {len(store_entries)} 件\n')

    # --- マッチング実行 ---
    matched_list    = []   # (store_name, image_fname, score, method)
    unmatched_list  = []   # (store_name, best_score)
    skipped_list    = []   # 既に画像が設定済みの店舗
    used_images     = set()

    for store_name, current_image in store_entries:
        if current_image:
            skipped_list.append(store_name)
            used_images.add(os.path.basename(current_image))
            continue

        # ① 手動マッピング優先
        manual_file = MANUAL_MAPPINGS.get(store_name)
        if manual_file:
            if manual_file in image_fnames:
                matched_list.append((store_name, manual_file, 1.0, 'manual'))
                used_images.add(manual_file)
            else:
                unmatched_list.append((store_name, 0.0))
                print(f'  [WARN] 手動マッピングの画像が見つかりません: {manual_file}')
            continue

        # ② 自動マッチング（使用済み画像を除外）
        available = [f for f in image_fnames if f not in used_images]
        fname, score, method = find_best_match(store_name, available, threshold)
        if fname:
            matched_list.append((store_name, fname, score, method))
            used_images.add(fname)
        else:
            unmatched_list.append((store_name, score))

    # --- 重複チェック（同一画像が複数店舗にマッチしていないか）---
    from collections import Counter
    match_counter = Counter(fname for _, fname, _, _ in matched_list)
    duplicates    = {fname for fname, cnt in match_counter.items() if cnt > 1}

    # --- 結果表示 ---
    print('【マッチ成功】 {} 件'.format(len(matched_list)))
    print('-' * 60)
    for store_name, fname, score, method in matched_list:
        dup_mark = ' [重複!]' if fname in duplicates else ''
        print('  OK [{:5.2f}][{}] {}'.format(score, method[:7], store_name))
        print('       -> {}{}'.format(fname, dup_mark))

    print()
    print('【マッチ失敗】 {} 件'.format(len(unmatched_list)))
    print('-' * 60)
    for store_name, score in unmatched_list:
        print('  NG [best:{:.2f}] {}'.format(score, store_name))

    print()
    print('【スキップ（画像設定済み）】 {} 件'.format(len(skipped_list)))

    # --- 未使用画像 ---
    unused_images = [f for f in image_fnames if f not in used_images]
    print()
    print('【未使用画像】 {} 件'.format(len(unused_images)))
    print('-' * 60)
    for f in unused_images:
        print('  - {}'.format(f))

    # --- サマリー ---
    print()
    print('=' * 60)
    print('  サマリー')
    print('  マッチ成功  : {} 件'.format(len(matched_list)))
    print('  マッチ失敗  : {} 件'.format(len(unmatched_list)))
    print('  スキップ    : {} 件'.format(len(skipped_list)))
    print('  未使用画像  : {} 件'.format(len(unused_images)))
    if duplicates:
        print('  [!] 重複マッチ: {} 件'.format(len(duplicates)))
    print('=' * 60)

    # --- ファイル更新 ---
    if dry_run:
        print('\n[DRY RUN] ファイルは更新されませんでした。')
        return

    if not matched_list:
        print('\n更新対象がありません。')
        return

    print('\nstores-data.js を更新中...')
    update_count = 0
    for store_name, fname, score, method in matched_list:
        image_path   = IMG_PREFIX + fname
        js_content, ok = update_store_image(js_content, store_name, image_path)
        if ok:
            update_count += 1
        else:
            print(f'  [WARN] 更新できませんでした: {store_name}')

    with open(STORES_DATA_JS, 'w', encoding='utf-8', newline='\n') as f:
        f.write(js_content)

    print(f'[OK] {update_count} 件の image フィールドを更新しました。')
    print(f'  出力: {STORES_DATA_JS}')


if __name__ == '__main__':
    main()
