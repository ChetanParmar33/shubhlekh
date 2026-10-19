"""Contact sheet of candidate thumbnails: python3 sheet.py out_name "query" ... → out_name.png + out_name.json (index → id)"""
import json, urllib.request, os, sys, concurrent.futures as cf
from PIL import Image, ImageDraw
out, qs = sys.argv[1], sys.argv[2:]
c = json.load(open('cand.json'))
os.makedirs('th', exist_ok=True)
items = [(q, r) for q in qs for r in c.get(q, [])]
def get(it):
    q, r = it; f = f"th/{r['id']}.jpg"
    if os.path.exists(f): return
    for u in (r['thumbnail'], r['url']):
        try:
            data = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'invite-sample-builder/1.0'}), timeout=20).read()
            if len(data) > 3000: open(f, 'wb').write(data); return
        except Exception: pass
with cf.ThreadPoolExecutor(10) as ex: list(ex.map(get, items))
items = [it for it in items if os.path.exists(f"th/{it[1]['id']}.jpg")]
cols, cw, ch = 8, 240, 190
sheet = Image.new('RGB', (cols * cw, max(1, (len(items) + cols - 1) // cols) * ch), 'white'); d = ImageDraw.Draw(sheet); idx = {}
for i, (q, r) in enumerate(items):
    try: im = Image.open(f"th/{r['id']}.jpg").convert('RGB')
    except Exception: continue
    im.thumbnail((cw - 6, ch - 26)); x, y = (i % cols) * cw, (i // cols) * ch; sheet.paste(im, (x + 3, y + 3))
    d.text((x + 4, y + ch - 20), f"{i} {r['license']} {r['width']}x{r['height']} {q[:12]}", fill='black'); idx[i] = r['id']
sheet.save(out + '.png'); json.dump(idx, open(out + '.json', 'w')); print(len(items), 'images')
