# Shubh Vivah promo videos

Two 34 s vertical (1080×1920, 30 fps) reels of design 17 for WhatsApp Status / Instagram:

- `shubh-vivah-hindi-voice.mp4` — Hindi voiceover (young male), Hindi captions
- `shubh-vivah-music.mp4` — no voice, English captions

Everything is generated: the invitation is recorded frame-by-frame from the live site, music is synthesised
(Raag Yaman — bansuri, santoor, tanpura, dholak, bells; no copyrighted audio), voice is edge-tts `hi-IN-MadhurNeural`.

## Rebuild

Needs the Shubhlekh server on :8800, Chrome, `puppeteer-core`, ffmpeg, Python with numpy + `edge-tts`.

```sh
export PUPPETEER_CORE=/path/to/node_modules/puppeteer-core
node capture_invite.mjs          # frames/invite — live invitation with a virtual clock (tap, scratch, scroll, ગુજરાતી)
node capture_stage.mjs hi        # frames/stage-hi — gold stage, phone mockup, captions
node capture_stage.mjs en        # frames/stage-en
python3 music.py                 # music.wav + sfx.wav, hits on the video's cue times
python3 render.py                # voice (generated if missing) + mix → the two mp4s
```

Change wording in `narration.json` (voice) and the `TXT` block in `stage.html` (captions); timings live in
`capture_invite.mjs` (ACTIONS), `music.py` (CUE) and `render.py` (VO_AT).
