"""Original 34 s score for the Shubh Vivah promo (no samples, no copyrighted audio): Raag Yaman on bansuri + santoor,
tanpura drone, soft dholak, temple bells. Hits are placed on the video's cue times. Writes music.wav and sfx.wav."""
import sys, os
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))  # shubhlekh/tools/synth.py
from synth import SR, T, place, reverb, drone, harmonium, bell, ks, pluck, reed, glide_notes, drum, slap, jingle, note_hz, rng

DUR = 34.2
SA = 293.66                                   # D — Yaman: S R G M# P D N
Y = {'.N': -1, 'S': 0, 'R': 2, 'G': 4, 'M': 6, 'P': 7, 'D': 9, 'N': 11, "S'": 12, "R'": 14, "G'": 16}
CUE = {'gate': 3.2, 'tap': 5.8, 'hero': 9.3, 'scroll': 12.0, 'scratch': 13.5, 'reveal': 15.1, 'events': 17.0, 'lang': 21.3, 'outro': 24.5, 'end': 32.6}
b = 60 / 84

def bansuri(notes, beat):
    fenv = glide_notes([(note_hz(SA * 2, Y[n]), d) for n, d in notes], beat)
    return reed(fenv, .14, .4, formants=((900, 300, .25),), vib=(5, .006), gain=.1)

def whoosh(d=1.0, up=True):
    t = T(d); nz = rng.standard_normal(len(t)); env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    out = np.zeros(len(t)); k = 0
    for i in range(0, len(t), 512):  # sweeping one-pole low-pass
        f = (200 + 5000 * (i / len(t) if up else 1 - i / len(t))) / SR; a = np.exp(-2 * np.pi * f)
        for j in range(i, min(i + 512, len(t))): k = (1 - a) * nz[j] + a * k; out[j] = k
    return out * env * .9

m = np.zeros((2, int(DUR * SR)))
# bed: drone throughout, harmonium chords that open up at the hero and the outro
place(m, drone(SA / 2, DUR), 0, .9); place(m, drone(SA * .75, DUR), 0, .45, .3)
for at, chord, d in [(0, [0, 7, 16], CUE['hero']), (CUE['hero'], [0, 4, 7], 6.2), (CUE['hero'] + 6.2, [9, 12, 16], 6.0), (CUE['events'] + 4, [7, 11, 14], 3.3), (CUE['outro'], [0, 4, 7], 4.1), (CUE['outro'] + 4.1, [5, 9, 12], 2.0), (CUE['outro'] + 6.1, [7, 11, 14], 2.0), (CUE['end'], [0, 4, 7], 1.6)]:
    place(m, harmonium([note_hz(SA / 2, c) for c in chord], d + .4, .016), at, 1, -.2)
# opening shimmer + bells
place(m, bell(SA * 2, 4, .9), .15, .8, .2); place(m, bell(SA * 3, 3.5, .5), 1.4, .6, -.3)
for k, s in enumerate(['S', 'G', 'P', 'N', "S'"]): place(m, ks(note_hz(SA * 2, Y[s]), 1.2, .996, .8), .4 + k * .16, .55, -.5 + k * .25)
# gate: bansuri alaap while the bud breathes
place(m, bansuri([('N', 1), ('R', .5), ('G', 1.5), ('M', .5), ('G', .5), ('R', 1)], b), CUE['gate'] + .2, 1, .1)
# tap: bell + chime cascade as the lotus opens
place(m, bell(SA * 2, 5, 1.4), CUE['tap'], 1, 0); place(m, bell(SA * 4, 3, .6), CUE['tap'] + .05, .7, .4)
for k, s in enumerate(['S', 'R', 'G', 'M', 'P', 'D', 'N', "S'", "R'", "G'"]): place(m, ks(note_hz(SA * 2, Y[s]), 1.4, .996, .9), CUE['tap'] + .25 + k * .085, .5, -.6 + k * .13)
place(m, bansuri([('P', 1.5), ('M', .5), ('G', 1), ('R', .5), ('S', 1.5)], b), CUE['tap'] + 1.2, .9, -.1)

# groove from the hero to the outro: soft dholak + santoor ostinato
DHA, TA, THE = drum(110, 55, .5, .24, .35), slap(.08, True, .8), drum(150, 90, .25, .1, .2)
t = CUE['hero']
while t < CUE['end'] - .2:
    for k, p in enumerate([1, 0, 2, 3, 1, 2, 3, 2]):
        at = t + k * b / 2
        if at >= CUE['end'] - .2: break
        if p == 1: place(m, DHA, at, .5, -.1)
        elif p == 2: place(m, TA, at, .22, .25)
        elif p == 3: place(m, THE, at, .3, .1)
    t += 4 * b
ost = ['S', 'G', 'P', 'G', "S'", 'P', 'G', 'P']
t, i = CUE['hero'], 0
while t < CUE['end'] - .3:
    louder = t >= CUE['outro']
    place(m, ks(note_hz(SA * 2, Y[ost[i % 8]]), .8, .994, .85), t, .32 if not louder else .42, .35 * (-1) ** i); t += b / 2; i += 1
# melody phrases
for at, ph in [(CUE['hero'] + 1.4, [('G', 1), ('M', .5), ('P', 1.5), ('D', .5), ('P', 1), ('M', .5), ('G', 1)]),
               (CUE['scroll'] + 1.4, [('N', 1), ('D', .5), ('P', 1), ('M', .5), ('G', 1.5)]),
               (CUE['events'] + .6, [('P', .5), ('D', .5), ('N', 1), ("S'", 2), ('N', .5), ('D', .5), ('P', 1.5)]),
               (CUE['lang'] + .4, [('G', 1), ('R', .5), ('G', .5), ('M', 1), ('P', 2)]),
               (CUE['outro'] + .5, [("S'", 1), ('N', .5), ('D', .5), ('P', 1), ('M', .5), ('G', .5), ('R', 1), ('G', 1), ('S', 2)])]:
    place(m, bansuri(ph, b), at, 1, .1)
# reveal sparkle + final resolve
for k, s in enumerate(['S', 'G', 'P', "S'", "G'"]): place(m, ks(note_hz(SA * 4, Y[s]), 1, .996, .9), CUE['reveal'] + k * .06, .45, -.4 + .2 * k)
place(m, bell(SA * 4, 2.5, .7), CUE['reveal'] + .1, .7)
place(m, bell(SA * 2, 6, 1.5), CUE['end'], 1); place(m, bell(SA, 6, 1.1), CUE['end'] + .02, .8)
place(m, drum(90, 45, 1.4, .7, .4), CUE['end'], .8)
m = reverb(m, 2.6, 1.1, .3)
fade = np.ones(m.shape[1]); n = int(1.2 * SR); fade[-n:] = np.linspace(1, 0, n); fade[:int(.05 * SR)] = np.linspace(0, 1, int(.05 * SR)); m *= fade

# sound effects on their own track (mixed a little louder in the no-voice cut)
s = np.zeros((2, int(DUR * SR)))
for at, up in [(CUE['gate'] - .55, True), (CUE['hero'] - .5, True), (CUE['scroll'] - .2, False), (CUE['events'] - .3, False), (CUE['outro'] - .6, True)]:
    place(s, whoosh(1.0, up), at, .35, .2 if up else -.2)
tt = T(.06); place(s, np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt / .012) * .5, CUE['tap'], .6)       # tap click
d = CUE['reveal'] - CUE['scratch']; nz = rng.standard_normal(int(d * SR)); hp = np.diff(nz, prepend=0)
g = (np.abs(np.sin(np.linspace(0, 26 * np.pi, len(nz)))) ** 3) * .7 + .3
place(s, hp * g * .12 * np.minimum(1, np.minimum(np.arange(len(nz)), len(nz) - np.arange(len(nz))) / (.05 * SR)), CUE['scratch'], 1)
place(s, jingle(.9), CUE['reveal'], .45, .3)
s = reverb(s, 1.4, .5, .2)

def wav(path, x):
    import wave
    x = x / (np.max(np.abs(x)) + 1e-9) * .89
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x.T, -1, 1) * 32767).astype('<i2').tobytes())
os.chdir(os.path.dirname(os.path.abspath(__file__)))
wav('music.wav', m); wav('sfx.wav', s); print('music.wav + sfx.wav', DUR, 's')
