// The intro's soundtrack (made by scripts/make-intro-audio.py): a quiet ambient bed for the welcome and ending
// screens, and the story mix (voice-over, score and effects) that runs second-for-second with the story timeline.
// Browsers only allow sound after the visitor interacts, so it starts on their first tap or key press in the
// intro, and the sound button turns it on or off.

const TAIL = 26.8; // story.mp3 position where the voice has finished and the ambient bed fades back in
const LOOP = [0.5, 24.5]; // the seamless section of ambient.mp3
const DRIFT = 0.12; // seconds the picture may drift from the sound before it is pulled back in step

// Muting holds while the visitor browses (the intro reopens on every return to the homepage), but a refresh or a
// later visit offers the sound again, so one accidental tap never silences the intro for good.
let muted = false;

/**
 * Returns null where Web Audio is missing. onChange(state) fires with "on", "off" (the visitor turned it off)
 * or "blocked" (wanted, but the browser is waiting for a tap).
 */
export function createSound({ onChange }) {
  if (!window.AudioContext) return null;
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.connect(ctx.destination);

  let wanted = !muted;
  let closed = false;
  let mode = "welcome";
  let tail = false; // the story has handed over to the ambient bed
  let story = null; // { src, gain, start }
  let ambient = null;
  const buffers = {};
  let loading = null;

  const load = () =>
    (loading ??= Promise.all(
      ["story", "ambient"].map((name) =>
        fetch(`/intro-audio/${name}.mp3`)
          .then((r) => r.arrayBuffer())
          .then((data) => ctx.decodeAudioData(data))
          .then((buffer) => (buffers[name] = buffer)),
      ),
    ).catch(() => {}));

  const state = () => (!wanted ? "off" : ctx.state === "running" ? "on" : "blocked");
  const audible = () => !closed && wanted && ctx.state === "running" && buffers.story && buffers.ambient;
  const notify = () => !closed && onChange(state());
  ctx.onstatechange = notify;

  const fade = (param, to, seconds) => {
    const now = ctx.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(to, now + seconds);
  };

  const play = (buffer, offset, fadeIn, loop) => {
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buffer;
    if (loop) {
      src.loop = true;
      [src.loopStart, src.loopEnd] = LOOP;
    }
    gain.gain.value = fadeIn ? 0 : 1;
    src.connect(gain).connect(master);
    src.start(0, offset);
    if (fadeIn) fade(gain.gain, 1, fadeIn);
    return { src, gain, start: ctx.currentTime - offset };
  };

  const stop = (track, seconds) => {
    if (!track) return null;
    fade(track.gain.gain, 0, seconds);
    track.src.stop(ctx.currentTime + seconds + 0.05);
    return null;
  };

  const stopAll = () => {
    story = stop(story, 0.05);
    ambient = stop(ambient, 0.05);
  };

  // The sound actually reaching the speakers lags the context clock by the output latency.
  const heard = () => ctx.currentTime - (ctx.outputLatency || ctx.baseLatency || 0) - story.start;

  const visibility = () => {
    if (document.hidden) ctx.suspend().catch(() => {});
    else if (wanted && !closed) ctx.resume().catch(() => {});
  };
  document.addEventListener("visibilitychange", visibility);

  // Called from a tap. iPhones keep web audio quiet while the ringer is switched to silent (video on other sites
  // still plays), so the intro asks to play the way a video does.
  const start = () => {
    if (navigator.audioSession) navigator.audioSession.type = "playback";
    load();
    if (ctx.state !== "running") ctx.resume().catch(() => {});
  };

  if (wanted && !navigator.connection?.saveData) load();

  return {
    /** "welcome" for the welcome screen, "story" once the story starts. */
    scene(next) {
      mode = next;
      tail = false;
      if (next === "welcome") story = stop(story, 0.5);
      else ambient = stop(ambient, 1.2);
    },

    /** Every frame: starts whatever should be playing, and keeps the picture in step with the sound. */
    sync(tl) {
      if (!audible()) return;
      if (mode === "welcome") {
        ambient ??= play(buffers.ambient, LOOP[0], 2, true);
        return;
      }
      if (!story && !tail) {
        if (tl.progress() < 1 && tl.time() < buffers.story.duration) story = play(buffers.story, tl.time(), 0.15);
        else tail = true;
      }
      if (story && tl.isActive() && Math.abs(heard() - tl.time()) > DRIFT) tl.time(Math.max(0, heard()));
      if (!ambient && (tail || (story && heard() >= TAIL))) {
        tail = true;
        ambient = play(buffers.ambient, LOOP[0], 3, true);
      }
    },

    /** Calls go() once the sound can start with it, so the opening isn't clipped while the browser switches sound
     *  on after a tap. Never waits more than a second; a slow download joins in step later instead. */
    ready(go) {
      const since = performance.now();
      const check = () => {
        if (closed) return;
        if (!wanted || audible() || performance.now() - since > 1000) go();
        else requestAnimationFrame(check);
      };
      check();
    },

    /** Any tap or key press in the intro lets the browser start the sound the visitor wants. */
    unlock() {
      if (!wanted || closed) return;
      start();
    },

    /** The sound button. */
    toggle() {
      if (state() === "on") {
        wanted = false;
        fade(master.gain, 0, 0.25);
        setTimeout(() => !wanted && stopAll(), 300);
      } else {
        wanted = true;
        start();
        fade(master.gain, 1, 0.25);
      }
      muted = !wanted;
      notify();
    },

    /** Fades everything out as the intro closes. */
    hush() {
      fade(master.gain, 0, 0.4);
      closed = true;
    },

    destroy() {
      closed = true;
      document.removeEventListener("visibilitychange", visibility);
      ctx.onstatechange = null;
      ctx.close().catch(() => {});
    },

    state,
  };
}
