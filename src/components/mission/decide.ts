/**
 * Decides whether the homepage plays the intro by setting html[data-gvm-intro="play"].
 * Plays every time the homepage loads (and with ?intro), never with reduced motion unless asked for.
 * Self-contained so it can also run as the inline <head> script below, before first paint.
 */
export function decideIntro() {
  const d = document.documentElement;
  try {
    const forced = /[?&]intro(=|&|$)/.test(location.search);
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (location.pathname === "/" && (forced || !calm)) d.setAttribute("data-gvm-intro", "play");
    else d.removeAttribute("data-gvm-intro");
  } catch {
    d.removeAttribute("data-gvm-intro");
  }
}

export const decideIntroScript = `(${decideIntro.toString()})();`;
