"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLenis } from "./SmoothScroll";
import { setIntroOpen, useIntroOpen } from "./mission/introState";
import { decideIntro } from "./mission/decide";
import "./mission/mission.css";

type Mission = { destroy: () => void };
type Phase = "closed" | "open" | "closing";

// The homepage shows first; the intro opens on top of it after this pause.
const AUTO_OPEN_DELAY = 900;
const SWIPE_CLOSE = 110;

const playing = () => document.documentElement.getAttribute("data-gvm-intro") === "play";
const stop = () => document.documentElement.removeAttribute("data-gvm-intro");
const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function hasWebGL() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

// Checked once per page load; devices without 3D get neither the window nor the bubble.
let webgl: boolean | undefined;
const useWebGL = () =>
  useSyncExternalStore(
    () => () => {},
    () => (webgl ??= hasWebGL()),
    () => false,
  );

// The transform that shrinks the panel onto the bubble, so it opens from and closes into it.
function bubbleTransform(panel: HTMLElement, bubble: HTMLElement | null) {
  const p = panel.getBoundingClientRect();
  const b = bubble?.getBoundingClientRect();
  if (!b?.width || !p.width) return "translate3d(0, 24px, 0) scale(0.96)";
  return `translate3d(${b.left - p.left}px, ${b.top - p.top}px, 0) scale(${b.width / p.width}, ${b.height / p.height})`;
}

/**
 * The 3D intro as a framed window over the homepage. It opens every time the homepage loads (or with ?intro),
 * and a small bubble in the corner brings it back. Phones get a bottom sheet that can be swiped down.
 */
export default function MissionIntro() {
  const stage = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLButtonElement>(null);
  const mission = useRef<Mission | null>(null);
  const closing = useRef(false);
  const viaKeyboard = useRef(false);
  const supported = useWebGL();
  const [phase, setPhase] = useState<Phase>("closed");
  const [compact, setCompact] = useState(false);
  const [tucked, setTucked] = useState(false);
  const open = useIntroOpen();
  const lenis = useLenis();

  // Client-side navigation to the homepage skips the inline <head> check, so run it here.
  const autoplay = useRef(false);
  useLayoutEffect(() => {
    decideIntro();
    autoplay.current = playing();
    stop();
  }, []);

  const show = useCallback(() => {
    closing.current = false;
    setPhase("open");
  }, []);

  const close = useCallback(({ navigating = false } = {}) => {
    if (closing.current) return;
    closing.current = true;
    setIntroOpen(false);
    if (navigating) return; // the call link loads a new page
    setPhase("closing");
    const el = panel.current;
    const done = () => {
      mission.current?.destroy();
      mission.current = null;
      setPhase("closed");
    };
    if (!el) return done();
    const from = el.style.transform || "none";
    el.style.transform = "";
    el.animate(
      calm()
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [
            { transform: from, opacity: 1 },
            { opacity: 1, offset: 0.7 },
            { transform: bubbleTransform(el, bubble.current), opacity: 0 },
          ],
      { duration: calm() ? 200 : 620, easing: "cubic-bezier(0.55, 0, 0.3, 1)", fill: "forwards" },
    ).onfinish = done;
  }, []);

  // Visitors see the homepage for a moment, then the intro opens on top.
  useEffect(() => {
    if (!autoplay.current || !supported) return;
    const t = window.setTimeout(show, AUTO_OPEN_DELAY);
    return () => clearTimeout(t);
  }, [show, supported]);

  // Build the 3D story while the window is open, and tear it down when it closes.
  useEffect(() => {
    if (phase !== "open") return;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    setIntroOpen(true);

    const el = panel.current;
    if (el)
      el.animate(
        calm()
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { transform: bubbleTransform(el, bubble.current), opacity: 0 },
              { opacity: 1, offset: 0.3 },
              { transform: "none", opacity: 1 },
            ],
        { duration: calm() ? 200 : 700, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
      );

    let cancelled = false;
    import("./mission/experience").then(({ createMission }) => {
      if (cancelled || !stage.current) return;
      try {
        mission.current = createMission(stage.current, { onExit: close });
      } catch {
        close();
      }
    });

    return () => {
      cancelled = true;
      root.style.overflow = overflow;
    };
  }, [phase, close]);

  // Keyboard users get focus back on the bubble once the window has shrunk into it.
  useEffect(() => {
    if (phase === "closed" && closing.current && viaKeyboard.current) bubble.current?.focus({ preventScroll: true });
  }, [phase]);

  // Leaving the homepage mid-story releases everything.
  useEffect(
    () => () => {
      mission.current?.destroy();
      mission.current = null;
      setIntroOpen(false);
    },
    [],
  );

  // Smooth scrolling waits while the intro covers the page.
  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [lenis, open]);

  // The bubble shrinks to a small globe once the visitor scrolls, and steps aside for the footer and forms.
  useEffect(() => {
    if (!supported) return;
    const onScroll = () => setCompact(window.scrollY > 480);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    const seen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) seen.add(e.target);
        else seen.delete(e.target);
      }
      setTucked(seen.size > 0);
    });
    document.querySelectorAll("#site-footer, main form").forEach((n) => io.observe(n));
    return () => {
      removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, [supported]);

  // Keep keyboard focus inside the window while it is open.
  const trapFocus = (e: React.KeyboardEvent) => {
    viaKeyboard.current = true;
    if (e.key !== "Tab" || !panel.current) return;
    const items = [...panel.current.querySelectorAll<HTMLElement>("button, a[href]")].filter((n) => n.offsetParent);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Phones: drag the sheet down by its handle to close it.
  const drag = useRef({ y: 0, t: 0, active: false });
  const onGrabDown = (e: React.PointerEvent) => {
    drag.current = { y: e.clientY, t: performance.now(), active: true };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onGrabMove = (e: React.PointerEvent) => {
    if (!drag.current.active || !panel.current) return;
    const dy = Math.max(0, e.clientY - drag.current.y);
    panel.current.style.transform = `translate3d(0, ${dy}px, 0)`;
  };
  const onGrabUp = (e: React.PointerEvent) => {
    if (!drag.current.active || !panel.current) return;
    drag.current.active = false;
    const dy = Math.max(0, e.clientY - drag.current.y);
    const fast = dy / (performance.now() - drag.current.t) > 0.6;
    if (dy > SWIPE_CLOSE || (fast && dy > 30)) return close();
    const el = panel.current;
    el.animate([{ transform: el.style.transform }, { transform: "none" }], { duration: 260, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
    el.style.transform = "";
  };

  const bubbleHidden = phase !== "closed" || tucked;

  return (
    <>
      {phase !== "closed" && (
        <div
          className={phase === "closing" ? "gvm is-closing" : "gvm"}
          onKeyDown={trapFocus}
          onPointerDown={() => (viaKeyboard.current = false)}
        >
          <div className="gvm-backdrop" aria-hidden="true" onClick={() => close()} />
          <div ref={panel} className="gvm-panel" role="dialog" aria-modal="true" aria-label="Global Virtual Experts intro">
            <div className="gvm-loader" aria-hidden="true" />
            <div ref={stage} className="gvm-stage" />
            <div
              className="gvm-grab"
              aria-hidden="true"
              onPointerDown={onGrabDown}
              onPointerMove={onGrabMove}
              onPointerUp={onGrabUp}
              onPointerCancel={onGrabUp}
            >
              <span />
            </div>
          </div>
        </div>
      )}
      {supported && (
        <button
          ref={bubble}
          type="button"
          className="gvm-bubble"
          data-compact={compact || undefined}
          data-hidden={bubbleHidden || undefined}
          inert={bubbleHidden}
          onClick={show}
          aria-label="Watch our 20-second story"
        >
          <span className="gvm-bubble-globe" aria-hidden="true" />
          <span className="gvm-bubble-text" aria-hidden="true">
            Watch our story <small>20s</small>
          </span>
        </button>
      )}
    </>
  );
}
