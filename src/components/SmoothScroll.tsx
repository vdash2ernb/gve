"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const raf = useRef(0);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let controller: Lenis | null = null;
    const update = () => {
      cancelAnimationFrame(raf.current);
      controller?.destroy();
      controller = null;
      if (query.matches) { setLenis(null); return; }
      const l = new Lenis({ duration: .95, easing: (t) => 1 - Math.pow(1 - t, 4), touchMultiplier: 1 });
      controller = l;
      const loop = (time: number) => { l.raf(time); raf.current = requestAnimationFrame(loop); };
      raf.current = requestAnimationFrame(loop);
      setLenis(l);
    };
    update();
    query.addEventListener('change', update);
    return () => {
      cancelAnimationFrame(raf.current);
      controller?.destroy();
      query.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    const target = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
    const top = target
      ? window.scrollY + target.getBoundingClientRect().top - (parseFloat(getComputedStyle(target).scrollMarginTop) || 0)
      : 0;
    if (lenis) lenis.scrollTo(top, { immediate: true });
    else window.scrollTo(0, top);
  }, [pathname, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
