"""Final cut: stage frames → H.264 1080x1920/30, plus audio.
  hi: Hindi voiceover (young male, edge-tts hi-IN-MadhurNeural) + music ducked under the voice + sfx
  en: no voice — music + sfx up front
Run after capture_stage.mjs for both versions:  python3 render.py"""
import json, os, subprocess
os.chdir(os.path.dirname(os.path.abspath(__file__)))
DUR, FPS = 34.2, 30
VO_AT = {'intro': .4, 'gate': 3.5, 'hero': 9.4, 'scratch': 13.4, 'events': 17.3, 'lang': 21.5, 'outro': 25.0}
run = lambda *a: subprocess.run(a, check=True, capture_output=True)
os.makedirs('out', exist_ok=True); os.makedirs('vo', exist_ok=True)

# Hindi voiceover lines (young male), trimmed of leading/trailing silence so they land exactly on their cue
NARR = json.load(open('narration.json'))
if not all(os.path.exists(f'vo/{k}.wav') for k, _ in NARR):
    import asyncio, edge_tts
    async def tts():
        for k, t in NARR: await edge_tts.Communicate(t, 'hi-IN-MadhurNeural', rate='+12%', pitch='+6Hz').save(f'vo/{k}.mp3')
    asyncio.run(tts())
    trim = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
    for k, _ in NARR: run('ffmpeg', '-y', '-v', 'error', '-i', f'vo/{k}.mp3', '-af', trim, '-ar', '48000', f'vo/{k}.wav')

for v in ('en', 'hi'):
    run('ffmpeg', '-y', '-v', 'error', '-framerate', str(FPS), '-i', f'frames/stage-{v}/%04d.jpg', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', f'out/video-{v}.mp4')

# voice track: every line at its cue
names = [k for k, _ in NARR]
ins = sum([['-i', f'vo/{k}.wav'] for k in names], [])
mix = ''.join(f'[{i}:a]adelay={int(VO_AT[k] * 1000)}:all=1[a{i}];' for i, k in enumerate(names))
mix += ''.join(f'[a{i}]' for i in range(len(names))) + f'amix=inputs={len(names)}:normalize=0,apad,atrim=duration={DUR},highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=5:release=120[o]'
run('ffmpeg', '-y', '-v', 'error', *ins, '-filter_complex', mix, '-map', '[o]', '-ar', '48000', '-ac', '2', 'out/voice.wav')

def final(v, af, inputs, out):
    run('ffmpeg', '-y', '-v', 'error', '-i', f'out/video-{v}.mp4', *inputs, '-filter_complex', af, '-map', '0:v', '-map', '[a]',
        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', str(DUR), '-movflags', '+faststart', out)

# 1) Hindi voice version: music ducks whenever the voice speaks
final('hi', '[1:a]volume=-3dB[m];[3:a]asplit=2[vk][vo];[m][vk]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=350:makeup=1[md];'
      '[2:a]volume=-6dB[s];[md][s][vo]amix=inputs=3:normalize=0:weights=0.55 0.8 1.15,loudnorm=I=-14:TP=-1.5:LRA=9[a]',
      ['-i', 'music.wav', '-i', 'sfx.wav', '-i', 'out/voice.wav'], 'shubh-vivah-hindi-voice.mp4')
# 2) no-voice version: music is the star
final('en', '[1:a]volume=0dB[m];[2:a]volume=-4dB[s];[m][s]amix=inputs=2:normalize=0:weights=1 0.85,loudnorm=I=-14:TP=-1.5:LRA=9[a]',
      ['-i', 'music.wav', '-i', 'sfx.wav'], 'shubh-vivah-music.mp4')
for f in ('shubh-vivah-hindi-voice.mp4', 'shubh-vivah-music.mp4'):
    print(f, subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration,size', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout.strip())
