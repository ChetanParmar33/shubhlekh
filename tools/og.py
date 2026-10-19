"""Build samples/N/assets/img/og.jpg (1200×630) from tools/shot.mjs screenshots: blurred hero photo + gate & hero phones.
Run: python3 tools/og.py <shots_dir> [6 7 ...]"""
import sys, os, re
from PIL import Image, ImageFilter, ImageDraw, ImageEnhance
ROOT = os.path.join(os.path.dirname(__file__), '..', 'samples')
shots, ids = sys.argv[1], sys.argv[2:] or [str(i) for i in range(6, 18)]

def phone(path, h):
    im = Image.open(path).convert('RGB'); w = int(im.width * h / im.height); im = im.resize((w, h), Image.LANCZOS)
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), 34, fill=255)
    fr = Image.new('RGBA', (w + 16, h + 16), (0, 0, 0, 0)); ImageDraw.Draw(fr).rounded_rectangle((0, 0, w + 15, h + 15), 42, fill=(20, 16, 14, 255))
    fr.paste(im, (8, 8), m); return fr

for n in ids:
    cfg = open(os.path.join(ROOT, n, 'config.js'), encoding='utf-8').read()
    hero = re.search(r'"hero": "([^"]+)"', cfg).group(1)
    bg = Image.open(os.path.join(ROOT, n, hero)).convert('RGB')
    s = max(1200 / bg.width, 630 / bg.height); bg = bg.resize((int(bg.width * s) + 1, int(bg.height * s) + 1))
    bg = bg.crop(((bg.width - 1200) // 2, (bg.height - 630) // 2, (bg.width - 1200) // 2 + 1200, (bg.height - 630) // 2 + 630))
    bg = ImageEnhance.Brightness(bg.filter(ImageFilter.GaussianBlur(14))).enhance(.7)
    a, b = phone(f'{shots}/{n}-en-g0.png', 560), phone(f'{shots}/{n}-en-h0.png', 560)
    sh = Image.new('RGBA', (1200, 630), (0, 0, 0, 0)); d = ImageDraw.Draw(sh)
    x1, x2 = 600 - a.width - 24, 624
    for x in (x1, x2): d.rounded_rectangle((x + 10, 32, x + a.width + 10, 32 + a.height), 42, fill=(0, 0, 0, 120))
    bg = Image.alpha_composite(bg.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(16)))
    bg.paste(a, (x1, 22), a); bg.paste(b, (x2, 22), b)
    bg.convert('RGB').save(os.path.join(ROOT, n, 'assets', 'img', 'og.jpg'), quality=84, optimize=True); print(n, 'og ok')
