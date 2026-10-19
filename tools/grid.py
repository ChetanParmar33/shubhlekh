import sys, glob
from PIL import Image
out, pats = sys.argv[1], sys.argv[2:]
fs = [f for p in pats for f in sorted(glob.glob(p))]
ims = [Image.open(f).convert('RGB').resize((390, 844)) for f in fs]
per = 8; rows = (len(ims) + per - 1) // per
c = Image.new('RGB', (per * 400, rows * 854), 'white')
for i, im in enumerate(ims): c.paste(im, ((i % per) * 400, (i // per) * 854))
s = 1900 / c.width; c.resize((1900, int(c.height * s))).save(out)
