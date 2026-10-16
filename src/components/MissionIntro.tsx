"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLenis } from "./SmoothScroll";
import { setIntroOpen, useIntroOpen } from "./mission/introState";
import { decideIntro, INTRO_SEEN_KEY } from "./mission/decide";
import "./mission/mission.css";

type Mission = { destroy: () => void };

const playing = () => document.documentElement.getAttribute("data-gvm-intro") === "play";
const stop = () => document.documentElement.removeAttribute("data-gvm-intro");

function hasWebGL() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

/** First-visit 3D intro over the homepage. Hidden unless html[data-gvm-intro="play"]. */
export default function MissionIntro() {
  const stage = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const open = useIntroOpen();
  const lenis = useLenis();

  // Client-side navigation to the homepage skips the inline <head> check, so run it here.
  useLayoutEffect(() => {
    decideIntro();
  }, []);

  useEffect(() => {
    if (!playing()) return;
    if (!hasWebGL()) return stop();

    let mission: Mission | null = null;
    let cancelled = false;
    let closeTimer = 0;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    setIntroOpen(true);

    const finish = () => {
      try {
        localStorage.setItem(INTRO_SEEN_KEY, "1");
      } catch {}
      root.style.overflow = overflow;
      setIntroOpen(false);
    };
    const onExit = ({ navigating = false } = {}) => {
      finish();
      if (navigating) return; // the call link loads a new page
      setClosing(true);
      closeTimer = window.setTimeout(() => {
        mission?.destroy();
        mission = null;
        stop();
      }, 700);
    };

    import("./mission/experience").then(({ createMission }) => {
      if (cancelled || !stage.current) return;
      try {
        mission = createMission(stage.current, { onExit });
      } catch {
        finish();
        stop();
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(closeTimer);
      mission?.destroy();
      root.style.overflow = overflow;
      setIntroOpen(false);
    };
  }, []);

  // Smooth scrolling waits while the intro covers the page.
  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [lenis, open]);

  return (
    <div className={closing ? "gvm is-closing" : "gvm"} role="dialog" aria-modal="true" aria-label="Global Virtual Experts intro">
      <div className="gvm-loader" aria-hidden="true" />
      <div ref={stage} className="gvm-stage" />
    </div>
  );
}
