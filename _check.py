import re
with open('assets/stores-data.js', encoding='utf-8') as f:
    c = f.read()
filled = len(re.findall(r'image: "assets/', c))
empty = len(re.findall(r'image: "",', c))
print('image設定済み:', filled, '件')
print('image未設定  :', empty, '件')
