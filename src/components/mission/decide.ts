export const INTRO_SEEN_KEY = "gve-intro-seen";

/**
 * Decides whether the homepage plays the first-visit intro by setting html[data-gvm-intro="play"].
 * Plays on the homepage for first-time visitors (or with ?intro), never with reduced motion.
 * Self-contained so it can also run as the inline <head> script below, before first paint.
 */
export function decideIntro() {
  const d = document.documentElement;
  try {
    const forced = /[?&]intro(=|&|$)/.test(location.search);
    const seen = localStorage.getItem("gve-intro-seen");
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (location.pathname === "/" && (forced || !(seen || calm))) d.setAttribute("data-gvm-intro", "play");
    else d.removeAttribute("data-gvm-intro");
  } catch {
    d.removeAttribute("data-gvm-intro");
  }
}

export const decideIntroScript = `(${decideIntro.toString()})();`;
