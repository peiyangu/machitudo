import re

with open('assets/stores-data.js', encoding='utf-8') as f:
    content = f.read()

# 各店舗ブロックを抽出（{} 単位）
blocks = re.findall(r'\{[^{}]+\}', content)

no_image = []
for block in blocks:
    name_m  = re.search(r'name:\s*"((?:[^"\\]|\\.)*)"', block)
    image_m = re.search(r'image:\s*"((?:[^"\\]|\\.)*)"', block)
    genre_m = re.search(r'genre:\s*"((?:[^"\\]|\\.)*)"', block)
    if name_m and image_m and not image_m.group(1):
        name  = name_m.group(1)
        genre = genre_m.group(1) if genre_m else ''
        no_image.append((name, genre))

print(f'写真なし: {len(no_image)}件\n')
for name, genre in no_image:
    print(f'  [{genre}] {name}')
