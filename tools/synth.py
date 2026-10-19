"""Original music + sfx for designs 6–17, synthesised with numpy (no samples, no copyrighted audio).
Instrument helpers copied from invite-samples/tools/synth_samples.py. Run: python3 tools/synth.py [6 7 ...]  (needs numpy + ffmpeg)"""
import sys, os, wave, subprocess
import numpy as np

SR = 44100
rng = np.random.default_rng(5)
ROOT = os.path.join(os.path.dirname(__file__), '..', 'samples')

def T(d): return np.arange(int(d * SR)) / SR
def place(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= buf.shape[1] or i < 0: return
    sig = sig[: buf.shape[1] - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + len(sig)] += sig * gain * l
    buf[1, i:i + len(sig)] += sig * gain * r
def smooth(x, n): return np.convolve(x, np.ones(n) / n, mode='same')
def reverb(x, seconds=2.8, decay=1.0, mix=.3):
    n = int(seconds * SR); t = np.arange(n) / SR; out = np.zeros_like(x)
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-t / decay); ir[:int(.01 * SR)] *= np.linspace(0, 1, int(.01 * SR)); ir = smooth(ir, 6); ir /= np.sqrt(np.sum(ir ** 2))
        L = 1 << int(np.ceil(np.log2(x.shape[1] + n)))
        wet = np.fft.irfft(np.fft.rfft(x[ch], L) * np.fft.rfft(ir, L), L)[:x.shape[1]]
        out[ch] = (1 - mix) * x[ch] + mix * wet * .9
    return out
def write(path, x, kbps=112):
    x = x / (np.max(np.abs(x)) + 1e-9) * .84
    wav = path + '.wav'
    with wave.open(wav, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x.T, -1, 1) * 32767).astype('<i2').tobytes())
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-c:a', 'libmp3lame', '-b:a', f'{kbps}k', path + '.mp3'], check=True); os.remove(wav)
def loopify(buf, loop, tail):
    n, tn = int(loop * SR), int(tail * SR); head = buf[:, :n].copy(); head[:, :tn] += buf[:, n:n + tn]; return head

# ── instruments ──
def osc_phase(fenv): return 2 * np.pi * np.cumsum(fenv) / SR
def pluck(f, dur=1.2, bright=1.0, decay=.6, bend=None, partials=8, inharm=.0006):
    t = T(dur); fenv = np.full(len(t), float(f))
    if bend: # (start_ratio, time) gamaka-style slide into the note
        r0, bt = bend; k = np.clip(t / bt, 0, 1); fenv *= r0 + (1 - r0) * (1 - (1 - k) ** 2)
    ph = osc_phase(fenv); s = np.zeros(len(t))
    for h in range(1, partials + 1):
        s += (bright ** (h - 1)) / h * np.sin(h * (1 + inharm * h * h) * ph) * np.exp(-t * h / (decay * 1.0) * .6)
    s *= np.exp(-t / decay) * np.minimum(1, t / .002)
    return s * .2
def ks(f, dur=1.0, damp=.996, bright=.5):
    n = int(dur * SR); N = max(2, int(SR / f)); y = np.zeros(n + N + 1)
    y[:N] = rng.uniform(-1, 1, N) * (1 - bright) + rng.uniform(-1, 1, N) * bright
    y[:N] = smooth(y[:N], 2 if bright > .5 else 4)
    y[N] = damp * y[0]; i = N + 1  # first sample has no predecessor pair
    while i < n:
        j = min(i + N, n); y[i:j] = damp * .5 * (y[i - N:j - N] + y[i - N - 1:j - N - 1]); i = j
    return y[:n] * .35
def reed(fenv, att=.06, rel=.18, formants=((1100, 600, 1), (2600, 900, .55)), vib=(5.5, .006), gain=.12):
    t = np.arange(len(fenv)) / SR; f = fenv * (1 + vib[1] * np.sin(2 * np.pi * vib[0] * t) * np.minimum(1, t / .4)); ph = osc_phase(f); s = np.zeros(len(t))
    f0 = float(np.median(fenv))
    for h in range(1, 24):
        a = .25 / h + sum(g * np.exp(-((h * f0 - fc) / bw) ** 2) for fc, bw, g in formants)
        s += a * np.sin(h * ph + h)
    env = np.minimum(1, t / att) * np.minimum(1, (t[-1] - t) / rel + 1e-9)
    s += .02 * rng.standard_normal(len(t)) * env  # breath
    return s * env * gain
def glide_notes(notes, dt):  # list of (freq, beats) → continuous frequency envelope with short portamento
    fenv = []
    prev = notes[0][0]
    for f, b in notes:
        n = int(b * dt * SR); g = min(int(.07 * SR), n // 3)
        seg = np.full(n, float(f)); seg[:g] = np.linspace(prev, f, g); fenv.append(seg); prev = f
    return np.concatenate(fenv)
def drum(f0, f1, dur, decay, noise=.3, ncut=8):
    t = T(dur); f = f1 + (f0 - f1) * np.exp(-t / .04); s = np.sin(osc_phase(f)) * np.exp(-t / decay)
    nz = smooth(rng.standard_normal(len(t)), ncut) * np.exp(-t / .03) * noise
    return (s + nz) * np.minimum(1, t / .001)
def slap(dur=.12, hi=True, gain=1):
    t = T(dur); nz = rng.standard_normal(len(t)); nz = nz - smooth(nz, 10) if hi else smooth(nz, 4)
    return nz * np.exp(-t / .025) * .5 * gain
def jingle(dur=.35):
    t = T(dur); s = np.zeros(len(t))
    for k in range(6): s += np.sin(2 * np.pi * (5200 + 900 * k + 300 * rng.random()) * t + k) * np.exp(-t / (.08 + .03 * k))
    nz = rng.standard_normal(len(t)); nz = nz - smooth(nz, 3)
    return (s * .12 + nz * .15 * np.exp(-t / .05)) * np.minimum(1, t / .002)
def bell(f, dur=3.5, gain=1.0):
    t = T(dur); s = np.zeros(len(t))
    for r, a, d in [(1, 1, 2.6), (2.76, .5, 1.6), (5.4, .3, .9), (8.93, .16, .5), (13.3, .08, .3)]: s += a * np.sin(2 * np.pi * f * r * t + r) * np.exp(-t / d)
    return s * np.minimum(1, t / .001) * .12 * gain
def drone(f, dur):  # tanpura-ish sustained drone
    t = T(dur); s = np.zeros(len(t))
    for h in range(1, 16): s += (1 / h ** .9) * np.sin(2 * np.pi * f * h * (1 + .0004 * h) * t + h) * (1 + .25 * np.sin(2 * np.pi * (.25 + .05 * h) * t + h))
    return s * .02
def harmonium(freqs, dur, gain=.03):
    t = T(dur); s = np.zeros(len(t))
    for f in freqs:
        for det in (-.8, .8):
            for h in range(1, 12): s += (1 / h) * np.sin(2 * np.pi * (f + det) * h * t + h)
    env = np.minimum(1, t / .25) * np.minimum(1, (dur - t) / .3) * (1 + .08 * np.sin(2 * np.pi * 4.5 * t))
    return s * env * gain

def note_hz(sa, sw):  # semitone offsets from Sa
    return sa * 2 ** (sw / 12)

# ── one recipe per design: tonic, tempo, raga (semitones), lead voice, percussion style ──
RAGA = {'yaman': [0, 2, 4, 6, 7, 9, 11], 'khamaj': [0, 2, 4, 5, 7, 9, 10], 'bilawal': [0, 2, 4, 5, 7, 9, 11], 'kafi': [0, 2, 3, 5, 7, 9, 10],
        'bhupali': [0, 2, 4, 7, 9], 'desh': [0, 2, 5, 7, 10], 'bhairav': [0, 1, 4, 5, 7, 8, 11], 'bhimpalasi': [0, 3, 5, 7, 10], 'hindol': [0, 4, 6, 9, 11]}
R = {
    '6':  dict(sa=246.94, bpm=76, raga='yaman', lead='shehnai', perc='dhol', drone=True),
    '7':  dict(sa=293.66, bpm=92, raga='khamaj', lead='santoor', perc='tabla', drone=True),
    '8':  dict(sa=261.63, bpm=98, raga='bilawal', lead='santoor', perc='dhol', drone=False, chords=True),
    '9':  dict(sa=220.00, bpm=70, raga='kafi', lead='sitar', perc='tabla', drone=True),
    '10': dict(sa=293.66, bpm=132, raga='khamaj', lead='shehnai', perc='garba', drone=False, chords=True),
    '11': dict(sa=329.63, bpm=54, raga='bhupali', lead='bells', perc=None, drone=True),
    '12': dict(sa=196.00, bpm=80, raga='desh', lead='fiddle', perc='nagada', drone=True),
    '13': dict(sa=392.00, bpm=114, raga='bhupali', lead='santoor', perc='claps', drone=False),
    '14': dict(sa=207.65, bpm=58, raga='bhairav', lead='sitar', perc='pakhawaj', drone=True),
    '15': dict(sa=261.63, bpm=72, raga='bhimpalasi', lead='bansuri', perc='pakhawaj', drone=True, chords=True),
    '16': dict(sa=349.23, bpm=84, raga='hindol', lead='keys', perc='shaker', drone=False),
    '17': dict(sa=293.66, bpm=64, raga='yaman', lead='bansuri', perc=None, drone=True, bells=True),
}

def voice(kind, f, dur):
    if kind == 'santoor': return ks(f, min(dur + .6, 1.4), .995, .9) * 1.1
    if kind == 'sitar': return pluck(f, dur + 1.2, .8, .8, bend=(2 ** (-1 / 12), .08), partials=12, inharm=.0008)
    if kind == 'bells': return bell(f, 3, .9)
    if kind == 'keys': return pluck(f, dur + 1.5, .45, 1.2, partials=6, inharm=.0001) * 1.2
    return None  # sustained voices handled by glide

def sustained(kind, fenv):
    if kind == 'shehnai': return reed(fenv)
    if kind == 'fiddle': return reed(fenv, .12, .3, formants=((700, 400, .9), (1900, 700, .4)), vib=(6, .008), gain=.11)
    if kind == 'bansuri': return reed(fenv, .14, .35, formants=((900, 300, .2),), vib=(5, .005), gain=.09)

def melody(rng_, scale, n):
    # random walk over a two-octave scale, phrases resolve to Sa or Pa
    deg = scale + [s + 12 for s in scale]; i = len(scale); out = []
    for k in range(n):
        i = int(np.clip(i + rng_.choice([-2, -1, -1, 1, 1, 2, 0]), 0, len(deg) - 1)); out.append(deg[i])
    out[-1] = 12 if out[-1] > 6 else 0
    return out

def perc(buf, style, b, LOOP):
    DHA, TAK, THOM, THA = drum(120, 58, .5, .22, .4), slap(.1), drum(80, 48, .8, .45, .3, 16), slap(.07, False, 1.2)
    t, bar = 0.0, 0
    while t < LOOP:
        if style == 'dhol':
            for k, p in enumerate([1, 0, 2, 0, 1, 2, 2, 0]): (place(buf, DHA, t + k * b / 2, .8, -.1) if p == 1 else place(buf, TAK, t + k * b / 2, .5, .2) if p == 2 else None)
            t += 4 * b
        elif style == 'garba':  # 3-clap taal feel with dandiya clicks
            for k, p in enumerate([1, 2, 2, 1, 2, 0]): (place(buf, DHA, t + k * b / 2, .9, -.1) if p == 1 else place(buf, TAK, t + k * b / 2, .6, .25))
            place(buf, slap(.05, True, 1.6), t + b, .5, -.4); place(buf, jingle(.3), t + 1.5 * b, .4, .4)
            t += 3 * b
        elif style == 'tabla':
            for k, p in enumerate([1, 2, 2, 1, 1, 2, 2, 1]): place(buf, THOM if p == 1 else slap(.08, True, .9), t + k * b / 2, .6 if p == 1 else .35, .1)
            t += 4 * b
        elif style == 'nagada':
            place(buf, drum(75, 42, 1.2, .55, .5, 20), t, .9, -.2); place(buf, drum(75, 42, 1.2, .55, .5, 20), t + 2.5 * b, .55, .2); t += 4 * b
        elif style == 'pakhawaj':
            place(buf, THOM, t, .8); place(buf, THA, t + 1.5 * b, .45); place(buf, THOM, t + 3 * b, .5); t += 4 * b
        elif style == 'claps':
            for k in range(4): place(buf, drum(110, 60, .4, .18, .2) if k % 2 == 0 else slap(.09, True, 1.3), t + k * b, .7 if k % 2 == 0 else .5, .1 * (-1) ** k)
            t += 4 * b
        elif style == 'shaker':
            for k in range(8): place(buf, slap(.06, True, .5 + .4 * (k % 2 == 0)), t + k * b / 2, .3, .3)
            place(buf, drum(70, 45, .6, .3, .1), t, .5); t += 4 * b
        bar += 1

def track(n):
    r = R[n]; out = os.path.join(ROOT, n, 'assets', 'audio'); os.makedirs(out, exist_ok=True)
    rg = np.random.default_rng(int(n) * 7); b = 60 / r['bpm']; bars = max(8, int(round(40 / (4 * b) / 4)) * 4); LOOP = bars * 4 * b; tail = 4
    buf = np.zeros((2, int((LOOP + tail) * SR))); sa, scale = r['sa'], RAGA[r['raga']]
    if r.get('drone'): place(buf, drone(sa / 2, LOOP + tail), 0, 1.0); place(buf, drone(sa * .75, LOOP + tail), 0, .5, .3)
    if r.get('chords'):
        roots = [0, 5, 7, 0] if 4 in scale or 3 in scale else [0, 7, 5, 0]
        third = 4 if 4 in scale else 3
        for k in range(0, bars, 2): c = roots[(k // 2) % 4]; place(buf, harmonium([note_hz(sa / 2, c), note_hz(sa / 2, c + third), note_hz(sa / 2, c + 7)], 8 * b + .3, .022), k * 4 * b, 1.0, -.25)
    if r['perc']: perc(buf, r['perc'], b, LOOP)
    if r.get('bells'):
        for k in range(0, bars, 4): place(buf, bell(sa * 2, 4, .5), k * 4 * b, .6, .4)
    t = 2 * 4 * b; lead = r['lead']
    rhythms = [[1, .5, .5, 1, 1], [.5, .5, 1, .5, .5, 1], [1.5, .5, 1, 1], [2, 1, 1]] if r['bpm'] > 80 else [[2, 1, 1], [1, 1, 2], [1.5, .5, 2], [3, 1]]
    while t < LOOP - 4 * b:
        rh = rhythms[rg.integers(len(rhythms))] * 2; notes = melody(rg, scale, len(rh))
        if voice(lead, sa, 1) is None:
            fenv = glide_notes([(note_hz(sa * 2 if lead != 'fiddle' else sa, s), d) for s, d in zip(notes, rh)], b); place(buf, sustained(lead, fenv), t, 1.0, .1)
        else:
            tt = t
            for s, d in zip(notes, rh): place(buf, voice(lead, note_hz(sa * (2 if lead != 'sitar' else 1), s), d * b), tt, .9, -.15 + .3 * rg.random()); tt += d * b
        t += sum(rh) * b + 2 * b
    rev = (3.2, 1.4, .34) if r['bpm'] < 70 else (2.2, .8, .26)
    write(os.path.join(out, 'music'), loopify(reverb(buf, *rev), LOOP, tail), 112)
    # open: a rising flourish in the design's own voice + bell
    sfx = np.zeros((2, int(3.5 * SR)))
    if r['perc'] in ('dhol', 'garba', 'claps'):
        tt, gap = 0, .14
        for k in range(10): place(sfx, drum(120, 58, .5, .22, .4) if k % 2 == 0 else slap(.1), tt, .8); tt += gap; gap *= .9
    for k, s in enumerate([0, scale[2], 7, 12]):
        f = note_hz(sa * 2, s)
        place(sfx, voice(lead, f, .4) if voice(lead, f, .4) is not None else sustained(lead, np.full(int(.5 * SR), f)), .5 + k * .12, .9, -.4 + .25 * k)
    place(sfx, bell(sa * 2, 3, 1.1), 1.0, .8)
    write(os.path.join(out, 'open'), reverb(sfx, 2.4, .9, .32), 96)
    rv = np.zeros((2, int(2.8 * SR)))
    for k, s in enumerate([0, scale[2], 7, 12, 12 + scale[2]]): place(rv, ks(note_hz(sa * 2, s), .9, .995, .8), .06 * k, .7, -.4 + .2 * k)
    place(rv, bell(sa * 4, 2.4, .7), .3, .8)
    write(os.path.join(out, 'reveal'), reverb(rv, 2, .8, .28), 96)
    m = int(.7 * SR); nz = rng.standard_normal(m); hp = np.diff(nz, prepend=0)
    g = (np.abs(np.sin(np.linspace(0, 40 * np.pi, m))) ** 4) * .7 + .3; s = hp * g * .25 * np.minimum(1, np.minimum(np.arange(m), m - np.arange(m)) / (.02 * SR))
    write(os.path.join(out, 'scratch'), np.vstack([s, s]), 64)
    return LOOP

if __name__ == '__main__':
    for n in (sys.argv[1:] or list(R)): print(n, 'loop %.1fs' % track(n))
