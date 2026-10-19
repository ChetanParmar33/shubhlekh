"""Find Creative-Commons photos (commercial use allowed) on Openverse. Results accumulate in cand.json.
python3 search.py "query one" "query two" ..."""
import json, sys, urllib.request, urllib.parse, time, os
F = 'cand.json'
out = json.load(open(F)) if os.path.exists(F) else {}
for q in sys.argv[1:]:
    if q in out: continue
    url = 'https://api.openverse.org/v1/images/?' + urllib.parse.urlencode({'q': q, 'license_type': 'commercial', 'page_size': 20, 'mature': 'false'})
    d = None
    for attempt in range(3):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'invite-sample-builder/1.0'}), timeout=30)); break
        except Exception as e:
            time.sleep(3)
    if not d: print(q, 'FAILED', flush=True); continue
    out[q] = [{k: r.get(k) for k in ('id', 'title', 'url', 'thumbnail', 'width', 'height', 'license', 'license_version', 'creator', 'foreign_landing_url', 'source')} for r in d['results'] if (r.get('width') or 0) >= 800]
    print(f'{q!r}: {d.get("result_count")} total, {len(out[q])} usable', flush=True)
    json.dump(out, open(F, 'w'), indent=1)
