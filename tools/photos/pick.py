"""Download chosen photos (full size → ≤1400px WebP) into samples/N/assets/img and record credits.json.
Picks are (sheet, index, filename). Licences with ND/NC are refused."""
import json, os, sys, io, urllib.request, concurrent.futures as cf
from PIL import Image, ImageOps
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'samples')
c = json.load(open('cand.json')); byid = {r['id']: r for rs in c.values() for r in rs}
sheets = {s: json.load(open(s + '.json')) for s in 'ABCD'}
PICK = {
 6:  [('D',79,'couple'),('D',1,'kumkum'),('D',3,'thali'),('D',111,'puja'),('D',112,'puja-2'),('D',120,'ganesh'),('D',84,'couple-2'),('D',122,'marigold'),('D',116,'rangoli')],
 7:  [('D',85,'couple'),('D',89,'mehndi'),('D',91,'mehndi-2'),('D',93,'mehndi-3'),('D',86,'couple-2'),('B',26,'embroidery'),('D',88,'mehndi-4'),('B',0,'bandhani')],
 8:  [('D',80,'couple'),('B',32,'red-cloth'),('B',34,'red-cloth-2'),('D',114,'family'),('D',121,'dhol'),('D',117,'ceremony'),('B',33,'white-cloth'),('D',125,'marigold')],
 9:  [('B',8,'loom'),('B',1,'textile'),('B',27,'mirror'),('B',29,'embroidery'),('B',30,'embroidery-2'),('B',31,'embroidery-3'),('D',82,'celebration'),('B',2,'textile-2')],
 10: [('A',19,'garba-temple'),('A',26,'garba-night'),('A',35,'garba-crowd'),('A',36,'raas'),('A',38,'chaniya'),('A',23,'dancer'),('A',41,'troupe'),('A',10,'dhol')],
 11: [('B',17,'rann-sunset'),('B',12,'salt'),('B',16,'rann-sky'),('B',18,'rann-wide'),('B',23,'rann-dusk'),('B',13,'tents-night'),('B',28,'mirrorwork'),('B',10,'birds-sunset')],
 12: [('C',27,'pol-house'),('C',28,'courtyard'),('C',29,'pillars'),('C',26,'old-arches'),('C',30,'lane'),('C',32,'drums'),('D',118,'couple'),('C',40,'stepwell-arch')],
 13: [('C',2,'kites-city'),('C',0,'kites-beach'),('C',6,'kites-cloud'),('C',7,'kite-rainbow'),('C',21,'kite-dome'),('C',17,'rooftop-sunset'),('C',16,'lantern'),('D',70,'kite-sky')],
 14: [('B',37,'vav-steps'),('B',39,'vav-deep'),('B',38,'vav-gallery'),('B',40,'vav-carving'),('B',43,'vav-pillars'),('B',36,'vav-bw'),('B',47,'vav-light'),('B',45,'vav-corridor')],
 15: [('C',42,'shreeji'),('D',23,'peacock'),('D',11,'lotus'),('D',15,'lotus-2'),('D',27,'peacock-2'),('D',18,'lotus-3'),('D',34,'peacock-3'),('D',21,'lotus-4')],
 16: [('D',136,'kesudo'),('D',137,'kesudo-2'),('D',138,'kesudo-3'),('D',139,'kesudo-tree'),('C',61,'kesudo-4'),('C',59,'kesudo-5'),('D',144,'kesudo-6'),('C',58,'kesudo-7')],
 17: [('C',48,'temple'),('C',50,'dome'),('C',53,'spires'),('C',54,'hill-temple'),('C',56,'hill-temple-2'),('D',17,'lotus'),('D',19,'lotus-2'),('D',22,'lotus-3')],
}
def fetch(job):
    n, (sh, ix, name) = job
    r = byid[sheets[sh][str(ix)]]
    lic = (r['license'] or '').lower()
    if 'nd' in lic or 'nc' in lic: return (n, name, r, 'REFUSED licence ' + lic)
    d = os.path.join(ROOT, str(n), 'assets', 'img'); os.makedirs(d, exist_ok=True); out = os.path.join(d, name + '.webp')
    if os.path.exists(out): return (n, name, r, 'cached')
    err = ''
    for attempt in range(3):
        try:
            data = urllib.request.urlopen(urllib.request.Request(r['url'], headers={'User-Agent': 'invite-sample-builder/1.0'}), timeout=40).read()
            im = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert('RGB'); im.thumbnail((1400, 1400)); im.save(out, 'WEBP', quality=80, method=5)
            return (n, name, r, f'{im.size[0]}x{im.size[1]}')
        except Exception as e: err = str(e)[:60]
    return (n, name, r, 'FAILED ' + err)
jobs = [(n, p) for n in (map(int, sys.argv[1:]) if len(sys.argv) > 1 else PICK) for p in PICK[n]]
with cf.ThreadPoolExecutor(2) as ex: res = list(ex.map(fetch, jobs))
cred = {}
for n, name, r, st in res:
    if not st.startswith(('FAILED', 'REFUSED')): cred.setdefault(n, {})[name] = {'title': r['title'], 'creator': r['creator'], 'license': r['license'], 'version': r['license_version'], 'link': r['foreign_landing_url']}
    else: print(n, name, st)
for n, v in cred.items():
    f = os.path.join(ROOT, str(n), 'assets', 'img', 'credits.json'); old = json.load(open(f)) if os.path.exists(f) else {}; old.update(v); json.dump(old, open(f, 'w'), indent=1, ensure_ascii=False)
print('done', sum(1 for x in res if not x[3].startswith(('FAILED', 'REFUSED'))), 'of', len(res))
