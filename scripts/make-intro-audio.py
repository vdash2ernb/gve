# Builds the intro's soundtrack into public/intro-audio/:
#   story.mp3    voice-over, score and sound effects, second-for-second with the story timeline in
#                src/components/mission/experience.js (0 s = the moment the story starts)
#   ambient.mp3  a quiet bed for the welcome and ending screens; the middle LOOP seconds loop seamlessly
#
# Everything is synthesized here, so there is nothing to license. The voice is Kokoro v1.0 (Apache-2.0).
# Needs Python 3.12 with numpy, scipy, soundfile, pyloudnorm, imageio-ffmpeg and kokoro-onnx, plus the model
# files kokoro-v1.0.onnx and voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx/releases.
# Run from the project root:  python scripts/make-intro-audio.py --model <folder with the model files>
#
# If the story timeline changes, move the matching times below with it.
import argparse
import subprocess
from pathlib import Path

import imageio_ffmpeg
import numpy as np
import pyloudnorm
import soundfile
from scipy import signal
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d

SR = 48000
STORY = 31.0  # seconds, including the ending tail the site cross-fades into the ambient bed
LOOP = 24.0
PAD = 0.5  # cyclic lead-in and lead-out around the loop, so the site can loop it whatever the decoder trims
rng = np.random.default_rng(7)

# Voice-over lines, each starting just after its caption appears in experience.js.
LINES = [
    (1.15, 'Every week, the admin piles up.'),
    (5.55, 'So an Expert launches from the Philippines.'),
    (8.75, 'Working your hours, in your time zone.'),
    (12.35, 'They take the overflow. Your inbox, calendar and billing, handled.'),
    (16.75, 'And report back daily, with every hour tracked.'),
    (21.15, "You're back in control."),
    (23.0, 'Global Virtual Experts. Real people, AI powered.'),
]
# Each line has to finish before the next caption (or the next line).
NEXT = [5.4, 8.6, 12.2, 16.6, 21.0, 22.9, STORY - 4]


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def n_of(seconds):
    return int(round(seconds * SR))


def env(points, n, overlap=False):
    """Piecewise envelope from (time, level) points; fades are curved so they sound even.
    overlap=True bows the curves the other way, so a fade-out over a fade-in keeps a steady level."""
    t = np.arange(n) / SR
    ts, vs = zip(*points)
    if overlap:
        return np.sqrt(np.interp(t, ts, np.square(vs)))
    return np.interp(t, ts, np.sqrt(vs)) ** 2


def ramp(points, n):
    """Straight-line path through (time, value) points; values may be negative."""
    ts, vs = zip(*points)
    return np.interp(np.arange(n) / SR, ts, vs)


def panned(x, pan):
    """Mono to stereo with constant-power panning (-1 left .. 1 right); pan may be an array."""
    a = (np.asarray(pan) + 1) * np.pi / 4
    return np.vstack([x * np.cos(a), x * np.sin(a)]) * np.sqrt(2)


def saw(freq, n, drift=0.0):
    """Band-limited sawtooth (PolyBLEP) with a slow pitch drift for analogue warmth."""
    t = np.arange(n) / SR
    f = freq * (1 + drift * np.sin(2 * np.pi * rng.uniform(0.08, 0.25) * t + rng.uniform(0, 2 * np.pi)))
    ph = (np.cumsum(f) / SR + rng.uniform()) % 1.0
    dt = f / SR
    y = 2 * ph - 1
    m = ph < dt
    x = ph[m] / dt[m]
    y[m] -= x + x - x * x - 1
    m = ph > 1 - dt
    x = (ph[m] - 1) / dt[m]
    y[m] -= x * x + x + x + 1
    return y


def sine(freq, n, phase=None):
    f = np.broadcast_to(np.asarray(freq, float), (n,))
    return np.sin(2 * np.pi * (np.cumsum(f) / SR + (rng.uniform() if phase is None else phase)))


def noise(n):
    return rng.standard_normal(n)


def biquad(kind, fc, q):
    w = 2 * np.pi * min(max(fc, 10.0), SR * 0.45) / SR
    cw, a = np.cos(w), np.sin(w) / (2 * q)
    b = {'lp': [(1 - cw) / 2, 1 - cw, (1 - cw) / 2], 'hp': [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2], 'bp': [a, 0, -a]}[kind]
    den = [1 + a, -2 * cw, 1 - a]
    return np.array(b) / den[0], np.array(den) / den[0]


def tvf(x, kind, fc, q=0.707, block=128):
    """A biquad whose cutoff can move over time (fc: a number or one value per sample)."""
    if x.ndim == 2:
        return np.vstack([tvf(c, kind, fc, q, block) for c in x])
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    y, zi = np.empty_like(x), np.zeros(2)
    for s in range(0, len(x), block):
        b, a = biquad(kind, fc[s], q)
        y[s:s + block], zi = signal.lfilter(b, a, x[s:s + block], zi=zi)
    return y


def sweep(points, n):
    """A frequency path from (time, Hz) points, interpolated on a musical (log) scale."""
    t = np.arange(n) / SR
    ts, fs = zip(*points)
    return np.exp(np.interp(t, ts, np.log(fs)))


def butter(x, kind, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, kind, fs=SR, output='sos'), x, axis=-1)


class Mix:
    """Named stereo buses; each instrument writes to one bus and can send some of itself to the reverb."""

    def __init__(self, seconds):
        self.n = n_of(seconds)
        self.bus = {}

    def add(self, name, x, t0, pan=0.0, verb=0.0, delay=0.0):
        if x.ndim == 1:
            x = panned(x, pan)
        for target, gain in ((name, 1.0), ('verb', verb), ('delay', delay)):
            if not gain:
                continue
            buf = self.bus.setdefault(target, np.zeros((2, self.n)))
            i = n_of(t0)
            k = min(x.shape[1], self.n - i)
            if k > 0:
                buf[:, i:i + k] += x[:, :k] * gain

    def get(self, name):
        return self.bus.get(name, np.zeros((2, self.n)))


# ---------- Instruments ----------

def pad_note(m, dur, attack=1.2, release=2.0, fc=1400, bright=None, level=1.0, voices=5, detune=9):
    """A warm, wide synth-string pad note: detuned saws through a soft low-pass."""
    n = n_of(dur + release)
    f = mtof(m)
    out = np.zeros((2, n))
    for k in range(voices):
        spread = (k - (voices - 1) / 2) / ((voices - 1) / 2)
        out += panned(saw(f * 2 ** (detune * spread / 1200), n, drift=0.0012), spread * 0.75)
    cut = 1.35 * (fc if bright is None else fc * 2 ** ramp(bright, n))
    out = tvf(tvf(out, 'lp', cut, 0.6), 'lp', cut * 1.4, 0.6)
    return out * env([(0, 0), (attack, 1), (dur, 0.85), (dur + release, 0)], n, overlap=True) * level * 0.25 / voices


def chord(mix, notes, t0, dur, verb=0.45, **kw):
    for m in notes:
        mix.add('pad', pad_note(m, dur, **kw), t0, verb=verb)


def glass(m, dur, t0, mix, attack=1.0, release=2.0, level=0.05, trem=0.15, verb=0.8):
    """A soft, high sine shimmer that sits above the pad."""
    n = n_of(dur + release)
    t = np.arange(n) / SR
    x = sine(mtof(m), n) + 0.3 * sine(mtof(m) * 2.001, n)
    x *= 1 - trem + trem * np.sin(2 * np.pi * rng.uniform(0.15, 0.4) * t + rng.uniform(0, 6.3))
    x *= env([(0, 0), (attack, 1), (dur, 0.8), (dur + release, 0)], n) * level
    mix.add('pad', x, t0, pan=rng.uniform(-0.6, 0.6), verb=verb)


def sub(m, dur, t0, mix, attack=0.5, release=1.2, level=0.3):
    """Sine bass with a little saturation, so it still reads on laptop and phone speakers."""
    n = n_of(dur + release)
    x = sine(mtof(m), n)
    x = np.tanh(1.6 * x) / np.tanh(1.6) + 0.2 * sine(mtof(m) * 2, n)
    mix.add('bass', x * env([(0, 0), (attack, 1), (dur, 0.9), (dur + release, 0)], n) * level * 0.32, t0)


def pluck(m, t0, mix, level=0.12, bright=2600, decay=0.22, pan=0.0, verb=0.25, delay=0.35):
    n = n_of(decay * 6 + 0.05)
    t = np.arange(n) / SR
    x = saw(mtof(m), n) * 0.7 + 0.5 * sine(mtof(m), n)
    x = tvf(x, 'lp', 180 + bright * np.exp(-t / (decay * 0.5)), 0.9)
    x *= (1 - np.exp(-t / 0.002)) * np.exp(-t / decay) * level * 2.8
    mix.add('pluck', x, t0, pan=pan, verb=verb, delay=delay)


def bell(m, t0, mix, level=0.08, decay=2.5, pan=0.0, verb=0.6, bus='sfx', ratios=None):
    """Glass/celesta bell: a few inharmonic partials, the upper ones dying away first."""
    ratios = ratios or [(1, 1.0, 1.0), (2.0, 0.35, 0.5), (2.76, 0.22, 0.32), (5.4, 0.1, 0.14), (8.93, 0.04, 0.08)]
    n = n_of(decay + 0.1)
    t = np.arange(n) / SR
    f = mtof(m)
    x = sum(a * np.sin(2 * np.pi * f * r * t + rng.uniform(0, 6.3)) * np.exp(-t / (decay * d)) for r, a, d in ratios if f * r < 18000)
    x *= (1 - np.exp(-t / 0.0015)) * level
    mix.add(bus, x, t0, pan=pan, verb=verb)


def thump(t0, mix, level=0.35, pitch=55):
    """A soft heartbeat kick: a falling sine with a felt-like attack."""
    n = n_of(0.7)
    t = np.arange(n) / SR
    x = sine(pitch + 70 * np.exp(-t / 0.035), n, phase=0) * np.exp(-t / 0.18)
    x += butter(noise(n), 'lowpass', 900) * np.exp(-t / 0.008) * 0.15
    mix.add('kick', x * level * 0.7, t0)


def whoosh(t0, dur, path, mix, level=0.2, q=1.4, pan=(0.0, 0.0), peak=0.55, verb=0.3, bus='sfx'):
    """Air moving past: noise through a swept band-pass, swelling to a peak and fading."""
    n = n_of(dur)
    u = np.linspace(0, 1, n)
    shape = np.where(u < peak, np.sin(np.pi / 2 * u / peak) ** 2, np.cos(np.pi / 2 * (u - peak) / (1 - peak)) ** 2)
    fc = sweep([(p * dur, f) for p, f in path], n)
    x = tvf(noise(n), 'bp', fc, q) + 0.35 * tvf(noise(n), 'bp', fc * 2.2, q * 1.5)
    mix.add(bus, x * shape * level, t0, pan=np.linspace(*pan, n), verb=verb)


def riser(t0, dur, mix, level=0.16, f0=220, f1=1760, verb=0.5):
    """Tension building into a hit: rising filtered noise plus a gliding tone, cut off at the hit."""
    n = n_of(dur)
    u = np.linspace(0, 1, n)
    rise = u ** 2.4
    x = tvf(noise(n), 'bp', sweep([(0, 400), (dur, 9000)], n), 1.1) * 0.8
    x = x + 0.35 * sine(sweep([(0, f0), (dur, f1)], n), n) * (1 + 0.3 * np.sin(2 * np.pi * (4 + 14 * u) * u * dur))
    x *= rise * np.minimum(1, (1 - u) * 60) * level
    mix.add('sfx', x, t0, verb=verb)


def impact(t0, mix, level=0.5, verb=0.5):
    """A warm, deep bloom for the big moment: falling sub, soft body and a low rumble."""
    n = n_of(3.5)
    t = np.arange(n) / SR
    body = sine(34 + 55 * np.exp(-t / 0.09), n, phase=0) * np.exp(-t / 0.9)
    rumble = butter(noise(n), 'lowpass', 140, 4) * np.exp(-t / 0.7) * 0.5
    air = butter(noise(n), 'highpass', 2500) * np.exp(-t / 0.35) * 0.05
    mix.add('sfx', (body + rumble + air) * level, t0, verb=verb)


def tick(t0, mix, level=0.05, pan=0.0, fc=4200):
    n = n_of(0.05)
    t = np.arange(n) / SR
    x = tvf(noise(n), 'bp', fc, 5.0) * np.exp(-t / 0.006)
    mix.add('sfx', x * level, t0, pan=pan, verb=0.15)


def blip(m, t0, mix, level=0.06, pan=0.0):
    """A soft notification pop, pitched to the chord."""
    n = n_of(0.35)
    t = np.arange(n) / SR
    f = mtof(m) * (1 + 0.04 * np.exp(-t / 0.01))
    x = (sine(f, n, 0) + 0.25 * sine(f * 2, n, 0)) * (1 - np.exp(-t / 0.002)) * np.exp(-t / 0.09)
    mix.add('sfx', x * level, t0, pan=pan, verb=0.3)


def rumble(t0, dur, mix, level=0.14):
    """The pod's engine: low, unsteady thrust with a faint flutter."""
    n = n_of(dur)
    t = np.arange(n) / SR
    brown = butter(butter(np.cumsum(noise(n)), 'highpass', 25), 'lowpass', 220, 4)
    brown /= np.max(np.abs(brown)) + 1e-9
    mid = tvf(noise(n), 'bp', 380, 1.5) * 0.25 * (1 + 0.4 * np.sin(2 * np.pi * 17 * t))
    x = (brown + mid) * env([(0, 0), (0.25, 1), (dur - 1.2, 0.7), (dur, 0)], n) * level
    mix.add('sfx', np.vstack([x, np.roll(x, 240)]), t0, verb=0.2)


def paper(t0, mix, level=0.07, pan=0.0):
    """A report fluttering past the camera, accelerating towards it."""
    dur = 1.5
    n = n_of(dur)
    t = np.arange(n) / SR
    u = t / dur
    x = tvf(butter(noise(n), 'highpass', 1200), 'bp', sweep([(0, 1800), (dur * 0.9, 6000), (dur, 4000)], n), 1.2)
    x *= (1 + 0.55 * np.sin(2 * np.pi * (18 + 10 * u) * t + rng.uniform(0, 6.3)))
    x *= np.where(u < 0.88, (u / 0.88) ** 3, np.exp(-(u - 0.88) * dur / 0.07)) * level
    mix.add('sfx', x, t0, pan=np.linspace(pan * 0.3, pan, n), verb=0.2)


def swirl(t0, dur, mix, level=0.06):
    """Tasks being drawn in: a band of air that tightens and speeds up as it circles."""
    n = n_of(dur)
    t = np.arange(n) / SR
    u = t / dur
    rate = 2 + 9 * u ** 1.5
    x = tvf(noise(n), 'bp', sweep([(0, 300), (dur, 1600)], n), 2.5) * (0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(rate) / SR))
    x *= env([(0, 0), (dur * 0.5, 0.6), (dur * 0.92, 1), (dur, 0)], n) * level
    mix.add('sfx', x, t0, pan=0.7 * np.sin(2 * np.pi * np.cumsum(0.4 + 1.2 * u) / SR), verb=0.4)


def reverb_ir(rt=3.6, length=5.0, predelay=0.022):
    """A large, soft hall: decorrelated noise per side, with highs dying faster than lows."""
    n = n_of(length)
    t = np.arange(n) / SR
    ir = np.zeros((2, n))
    for ch in range(2):
        w = noise(n)
        for kind, fc, decay in (('lowpass', 500, rt * 1.1), ('bandpass', (500, 3500), rt), ('highpass', 3500, rt * 0.4)):
            ir[ch] += butter(w, kind, fc) * np.exp(-6.91 * t / decay)
        ir[ch] *= 1 - np.exp(-t / 0.012)
    ir = np.roll(ir, n_of(predelay), axis=1)
    ir[:, :n_of(predelay)] = 0
    return ir / np.sqrt(np.sum(ir ** 2) / 2)


def room_ir():
    return reverb_ir(rt=0.5, length=0.8, predelay=0.008)


def convolve(x, ir):
    return np.vstack([signal.fftconvolve(x[c], ir[c])[:x.shape[1]] for c in range(2)])


def pingpong(x, time=0.375, feedback=0.38, taps=6):
    out = np.zeros_like(x)
    tap = x.copy()
    for k in range(1, taps + 1):
        tap = butter(tap, 'lowpass', 5000)
        side = (k - 1) % 2
        mono = tap.mean(axis=0) * feedback ** k
        d = n_of(time * k)
        out[side, d:] += mono[:-d]
    return out


# ---------- Voice-over ----------

def voice_lines(model, voice, speed):
    from kokoro_onnx import Kokoro
    tts = Kokoro(str(Path(model) / 'kokoro-v1.0.onnx'), str(Path(model) / 'voices-v1.0.bin'))
    lang = 'en-gb' if voice.startswith('b') else 'en-us'
    out = []
    for at, text in LINES:
        x, sr = tts.create(text, voice=voice, speed=speed, lang=lang)
        x = signal.resample_poly(np.asarray(x, float), SR, sr)
        on = np.where(np.abs(x) > 0.008)[0]
        x = x[max(on[0] - n_of(0.02), 0):on[-1] + n_of(0.12)]
        x *= env([(0, 0), (0.01, 1), (len(x) / SR - 0.06, 1), (len(x) / SR, 0)], len(x))
        out.append((at, x))
    return out


def voice_chain(x):
    """Broadcast-style polish: clear the rumble, a little warmth and presence, even out the level."""
    x = butter(x, 'highpass', 85)
    b, a = peaking(220, 0.8, 1.5)
    x = signal.lfilter(b, a, x)
    b, a = peaking(3800, 1.0, 2.5)
    x = signal.lfilter(b, a, x)
    # Gentle compression from a smoothed level, so quiet word endings stay audible.
    level = np.sqrt(signal.lfilter([0.002], [1, -0.998], x ** 2)) + 1e-6
    gain = np.minimum(1, (level / 0.08) ** -0.35)
    return x * gain


def peaking(fc, q, db):
    A = 10 ** (db / 40)
    w = 2 * np.pi * fc / SR
    a = np.sin(w) / (2 * q)
    b = [1 + a * A, -2 * np.cos(w), 1 - a * A]
    den = [1 + a / A, -2 * np.cos(w), 1 - a / A]
    return np.array(b) / den[0], np.array(den) / den[0]


# ---------- Story score ----------
# Times in seconds on the story timeline. The music sits on a 120 bpm grid that lands its bar lines on the
# launch (7.8 s) and the start of the ending (19.8 s); the resolution is tied to the ending screen (21.0 s).

Bm, Gmaj9, Asus4, A, D, Bm7, DoverFs, Em9, Dmaj9 = (
    [47, 54, 61, 62, 66], [43, 50, 57, 59, 66], [45, 52, 57, 62, 64], [45, 52, 57, 61, 64], [50, 57, 64, 66, 69],
    [47, 54, 57, 62, 66], [42, 50, 57, 62, 66], [40, 50, 55, 59, 66], [50, 57, 61, 64, 66, 69])


def story_score(mix):
    # 0 · The welcome screen lifts away.
    whoosh(0.0, 1.4, [(0, 250), (0.5, 2200), (1, 600)], mix, level=0.16, pan=(0.3, -0.3))
    impact(0.12, mix, level=0.22, verb=0.35)

    # 1 · The admin piles up: a dark chord, a ticking pulse that tightens, notifications stacking up.
    chord(mix, Bm, 0.0, 4.8, attack=0.8, release=1.2, fc=700, bright=[(0, 0), (3.6, 1.2), (4.8, 1.4)], level=0.9)
    sub(35, 4.6, 0.3, mix, level=0.26)
    pulse = [59, 59, 54, 59, 61, 59, 54, 59]
    for k in range(16):
        t = 0.55 + k * 0.25
        pluck(pulse[k % 8], t, mix, level=0.05 + 0.06 * k / 15, bright=700 + 2600 * k / 15, decay=0.12, pan=(-0.25, 0.25)[k % 2], delay=0.15)
    for k in range(16):
        if 2.3 + k * 0.125 < 4.7:
            tick(2.3 + k * 0.125, mix, level=0.012 + 0.03 * k / 15, pan=(0.4, -0.4)[k % 2])
    for t, m, p in [(1.7, 85, -0.5), (2.45, 78, 0.55), (3.05, 83, -0.3), (3.4, 90, 0.6), (3.65, 81, -0.65), (3.88, 86, 0.35),
                    (4.06, 78, -0.2), (4.2, 88, 0.7), (4.33, 83, -0.55), (4.44, 85, 0.15)]:
        blip(m, t, mix, level=0.035 + 0.02 * (t > 3), pan=p)
    riser(4.0, 0.8, mix, level=0.1, f0=300, f1=900)

    # 2 · Relief: an Expert launches from the Philippines.
    whoosh(4.7, 0.9, [(0, 3000), (1, 500)], mix, level=0.1, q=0.9)
    chord(mix, Gmaj9, 4.8, 2.0, attack=0.5, release=1.6, fc=1500, bright=[(0, 0), (2, 0.6)])
    sub(31, 2.0, 4.8, mix, level=0.24)
    for m in (74, 78, 81):
        glass(m, 2.4, 4.9, mix, level=0.035)
    whoosh(5.0, 2.5, [(0, 400), (0.6, 1800), (1, 700)], mix, level=0.13, pan=(0.7, -0.1), peak=0.6)
    bell(81, 6.4, mix, level=0.06, pan=-0.35, decay=2.2)
    bell(88, 6.8, mix, level=0.05, pan=0.35, decay=2.2)
    chord(mix, Asus4, 6.8, 1.0, attack=0.4, release=1.2, fc=1800, bright=[(0, 0), (1.0, 0.8)])
    sub(33, 1.0, 6.8, mix, level=0.24)
    riser(6.6, 1.2, mix, level=0.14)

    # 3 · Lift-off and the flight across the world, onto the client's hours.
    whoosh(7.55, 0.8, [(0, 2600), (1, 450)], mix, level=0.3, q=0.8, peak=0.25)
    thump(7.8, mix, level=0.45)
    impact(7.8, mix, level=0.18, verb=0.3)
    rumble(7.6, 4.6, mix, level=0.2)
    chord(mix, D, 7.8, 2.0, attack=0.15, release=1.4, fc=2000)
    chord(mix, Bm7, 9.8, 2.0, attack=0.6, release=1.4, fc=1900)
    sub(38, 2.0, 7.8, mix, attack=0.1, level=0.28)
    sub(35, 2.0, 9.8, mix, level=0.28)
    for m in (78, 81, 85):
        glass(m, 3.6, 7.9, mix, level=0.03)
    arp = [62, 69, 66, 69, 74, 69, 66, 71] + [59, 66, 62, 66, 71, 66, 62, 69]
    for k, m in enumerate(arp):
        pluck(m, 7.8 + k * 0.25, mix, level=0.085, bright=2400, pan=(-0.3, 0.3)[k % 2])
    for k in range(4):
        thump(8.8 + k, mix, level=0.25)

    # 4 · The Expert takes the overflow: the tasks swirl in and land, one chime each.
    chord(mix, Gmaj9, 11.8, 2.0, attack=0.6, release=1.4, fc=1700)
    chord(mix, DoverFs, 13.8, 2.0, attack=0.6, release=1.4, fc=1800)
    sub(31, 2.0, 11.8, mix, level=0.26)
    sub(30, 2.0, 13.8, mix, level=0.26)
    for k, m in enumerate([67, 74, 71, 74, 66, 74, 69, 74]):
        pluck(m, 11.8 + k * 0.5, mix, level=0.06, bright=1800, pan=(-0.3, 0.3)[k % 2])
    for k in range(4):
        thump(11.8 + k, mix, level=0.2)
    swirl(12.6, 4.1, mix, level=0.05)
    # The halo glows amber and pulses (13.0 to 16.0, peaking every second from 13.5).
    n = n_of(3.6)
    t = np.arange(n) / SR
    halo = (sine(mtof(74), n) + 0.6 * sine(mtof(81), n)) * (0.5 - 0.5 * np.cos(2 * np.pi * t)) * env([(0, 0), (0.4, 1), (3.0, 1), (3.6, 0)], n)
    mix.add('pad', halo * 0.03, 13.0, verb=0.7)
    penta = [69, 71, 74, 76, 78, 81, 83, 86, 88, 90]
    for i in range(30):
        bell(penta[min(i // 3, 9)], 14.0 + i * 0.09, mix, level=0.022 + 0.012 * (i % 3 == 0), decay=0.9,
             pan=np.sin(i * 1.7) * 0.6, verb=0.45, ratios=[(1, 1.0, 1.0), (2.76, 0.3, 0.35), (5.4, 0.12, 0.15)])

    # 5 · Reports come back daily: brighter, building towards the finish.
    chord(mix, Em9, 15.8, 2.0, attack=0.6, release=1.4, fc=1900, bright=[(0, 0), (2, 0.3)])
    chord(mix, Asus4, 17.8, 1.0, attack=0.4, release=1.0, fc=2100)
    chord(mix, A, 18.8, 1.4, attack=0.3, release=1.6, fc=2200, bright=[(0, 0), (1.4, 0.6)])
    sub(28, 2.0, 15.8, mix, level=0.26)
    sub(33, 3.2, 17.8, mix, level=0.26)
    rise = [64, 71, 67, 71, 74, 71, 67, 71] + [64, 69, 73, 69, 76, 73, 69, 73]
    for k, m in enumerate(rise):
        pluck(m, 15.8 + k * 0.25, mix, level=0.06 + 0.04 * k / 15, bright=1600 + 2200 * k / 15, pan=(-0.3, 0.3)[k % 2])
    for k in range(4):
        thump(15.8 + k, mix, level=0.22)
    thump(19.3, mix, level=0.2)
    thump(19.55, mix, level=0.24)
    for i in range(8):
        paper(16.9 + i * 0.22 + 0.1, mix, pan=(-0.5, 0.5)[i % 2] * (0.5 + 0.5 * (i % 3) / 2))

    # 6 · Mission complete: everything pulls back, breathes in, and resolves.
    whoosh(19.6, 1.2, [(0, 1600), (1, 300)], mix, level=0.07, pan=(0.2, -0.2))
    whoosh(19.8, 2.6, [(0, 300), (0.6, 900), (1, 250)], mix, level=0.09, peak=0.45)
    riser(19.7, 1.3, mix, level=0.17, f0=440, f1=1760)
    impact(21.0, mix, level=0.42, verb=0.6)
    chord(mix, Dmaj9, 21.0, 4.5, attack=0.12, release=5.0, fc=2400, bright=[(0, 0.4), (4, -0.4)], level=1.1, verb=0.6)
    sub(38, 4.5, 21.0, mix, attack=0.05, release=4.0, level=0.3)
    sub(26, 3.0, 21.0, mix, attack=0.05, release=3.0, level=0.18)
    for k, m in enumerate([74, 78, 81, 86]):
        bell(m, 21.0 + k * 0.085, mix, level=0.07 - 0.008 * k, decay=3.5, pan=(-0.4, -0.1, 0.15, 0.4)[k], verb=0.8)
    for m in (78, 85, 88):
        glass(m, 5.0, 21.1, mix, attack=1.5, release=4.0, level=0.028)
    # A gentle three-note sign-off under the brand line.
    for t, m in [(24.6, 78), (25.0, 76), (25.6, 74)]:
        bell(m, t, mix, level=0.035, decay=3.5, verb=0.85, bus='pad')


# ---------- Ambient bed ----------

def ambient_score(mix):
    """Slow chords on a 24-second cycle: D, Bm, G, A and back to D, with sparse glassy notes."""
    for i, (bass, notes) in enumerate([(38, [50, 57, 61, 64, 66]), (35, [50, 54, 57, 61, 64]), (31, [50, 54, 57, 59, 66]), (33, [50, 52, 57, 59, 64])]):
        t0 = i * 6.0
        chord(mix, notes, t0, 6.0, attack=2.4, release=3.2, fc=1100, level=0.9, verb=0.55)
        sub(bass, 6.0, t0, mix, attack=2.0, release=3.0, level=0.14)
        for m in notes[-2:]:
            glass(m + 24, 5.0, t0 + 0.6, mix, attack=2.0, release=3.0, level=0.012)
    for t, m in [(1.3, 78), (3.4, 81), (5.2, 76), (8.1, 78), (10.4, 74), (13.2, 83), (15.6, 78), (17.0, 81), (20.1, 76), (22.4, 81)]:
        bell(m, t, mix, level=0.03, decay=3.2, pan=rng.uniform(-0.6, 0.6), verb=0.85, bus='pad')
    n = mix.n
    t = np.arange(n) / SR
    air = tvf(np.vstack([noise(n), noise(n)]), 'bp', 3200, 0.7) * (0.6 + 0.4 * np.sin(2 * np.pi * t / LOOP)) * 0.006
    mix.add('pad', air, 0.0)


# ---------- Mixdown ----------

def render(mix, vo=None):
    hall = reverb_ir()
    music = mix.get('pad') + mix.get('bass') + mix.get('kick') + mix.get('pluck') + 2.0 * pingpong(mix.get('delay'))
    music = butter(music, 'highpass', 30)
    wet = convolve(mix.get('verb'), hall) * 0.5
    sfx = mix.get('sfx')
    if vo is None:
        return music + wet + sfx
    voice = np.zeros(mix.n)
    for at, x in vo:
        i = n_of(at)
        voice[i:i + len(x)] += x[:mix.n - i]
    voice = voice_chain(voice)
    voice /= np.sqrt(np.mean(voice[np.abs(voice) > 0.02] ** 2))  # spoken level to unit RMS
    voice = panned(voice, 0.0) * 0.18
    voice = voice + convolve(voice, room_ir()) * 0.08
    # The music dips just before each line, holds through the gaps between words, and comes back up after.
    level = np.sqrt(signal.lfilter([0.001], [1, -0.999], voice[0] ** 2))
    talking = maximum_filter1d(np.clip(level / 0.03, 0, 1), n_of(0.25))
    duck = 1 - 0.45 * uniform_filter1d(talking, n_of(0.18))
    # The score sits 7 dB under the voice overall (12 dB while a line is playing).
    bed = music + wet
    meter = pyloudnorm.Meter(SR)
    trim = 10 ** ((meter.integrated_loudness(voice.T) - 7 - meter.integrated_loudness(bed.T)) / 20)
    bed, sfx = bed * trim, sfx * trim
    report('voice', voice)
    report('music', bed)
    report('effects', sfx)
    return bed * duck + sfx * (0.6 + 0.4 * duck) + voice


def report(name, x):
    meter = pyloudnorm.Meter(SR)
    print(f'  {name:8s} {meter.integrated_loudness(x.T):6.1f} LUFS')


def master(x, lufs):
    meter = pyloudnorm.Meter(SR)
    x = x * 10 ** ((lufs - meter.integrated_loudness(x.T)) / 20)
    # Look-ahead peak limiter at -1.5 dBFS, so nothing clips once encoded. Smoothing a minimum-filtered gain
    # over the same window can only lower it, so the ceiling always holds.
    ceiling = 10 ** (-1.5 / 20)
    w = n_of(0.012) | 1
    gain = np.minimum(1, ceiling / (np.max(np.abs(x), axis=0) + 1e-9))
    gain = uniform_filter1d(minimum_filter1d(gain, w), w)
    limited = np.mean(gain < 0.999) * 100
    print(f'  limiter active on {limited:.2f}% of the track, deepest {20 * np.log10(gain.min()):.1f} dB')
    return x * gain


def encode(x, path, kbps=128):
    wav = path.with_suffix('.wav')
    soundfile.write(wav, x.T.astype(np.float32), SR, subtype='FLOAT')
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', '-i', str(wav), '-codec:a', 'libmp3lame',
                    '-b:a', f'{kbps}k', '-ar', '44100', str(path)], check=True)
    wav.unlink()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', required=True, help='folder with kokoro-v1.0.onnx and voices-v1.0.bin')
    ap.add_argument('--voice', default='af_heart')
    ap.add_argument('--speed', type=float, default=0.93)
    ap.add_argument('--out', default='public/intro-audio')
    args = ap.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    vo = voice_lines(args.model, args.voice, args.speed)
    for (at, x), nxt in zip(vo, NEXT):
        end = at + len(x) / SR
        print(f'{at:6.2f}-{end:6.2f}s  (next caption {nxt:5.2f}s)  ' + ('ok' if end < nxt - 0.15 else 'TOO LONG'))

    mix = Mix(STORY)
    story_score(mix)
    story = render(mix, vo)
    fade = env([(0, 1), (STORY - 4, 1), (STORY, 0)], mix.n)
    encode(master(story * fade, -17), out / 'story.mp3')

    # Render past the loop length, then fold the overhang back onto the start so the cycle is seamless.
    mix = Mix(LOOP + 9)
    ambient_score(mix)
    long = render(mix)
    cyc = np.zeros((2, n_of(LOOP)))
    for s in range(0, long.shape[1], cyc.shape[1]):
        part = long[:, s:s + cyc.shape[1]]
        cyc[:, :part.shape[1]] += part
    cyc = master(cyc, -26)
    p = n_of(PAD)
    encode(np.hstack([cyc[:, -p:], cyc, cyc[:, :p]]), out / 'ambient.mp3', kbps=112)
    print('written to', out)


if __name__ == '__main__':
    main()
