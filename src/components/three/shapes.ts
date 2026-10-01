import globeLand from "@/lib/globe-points.json";

// Every shape has exactly COUNT points so the field can morph between any two.
const land = globeLand as number[];
export const COUNT = land.length / 3;

export type ShapeName = "globe" | "chaos" | "grid" | "spiral" | "bridge" | "clock" | "sphere";

type RGB = [number, number, number];
export const BLUE: RGB = [0.16, 0.55, 1.0];
export const SKY: RGB = [0.55, 0.8, 1.0];
export const AMBER: RGB = [1.0, 0.65, 0.0];
export const RED: RGB = [1.0, 0.36, 0.25];

export type Shape = { pos: Float32Array; col: Float32Array };

// Deterministic random so shapes are identical between renders.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function make(fill: (i: number, p: Float32Array, c: Float32Array, r: () => number) => void, seed: number): Shape {
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const r = rng(seed);
  for (let i = 0; i < COUNT; i++) fill(i, pos, col, r);
  return { pos, col };
}

function setC(c: Float32Array, i: number, rgb: RGB, k = 1) {
  c[i * 3] = rgb[0] * k;
  c[i * 3 + 1] = rgb[1] * k;
  c[i * 3 + 2] = rgb[2] * k;
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function latLonToVec(lat: number, lon: number, r: number): [number, number, number] {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo) * r, Math.sin(la) * r, Math.cos(la) * Math.cos(lo) * r];
}

export const GLOBE_R = 2.1;
export const SEATTLE = latLonToVec(47.6, -122.3, GLOBE_R);
export const MANILA = latLonToVec(14.6, 121.0, GLOBE_R);

function near(x: number, y: number, z: number, t: [number, number, number], d: number) {
  return (x - t[0]) ** 2 + (y - t[1]) ** 2 + (z - t[2]) ** 2 < d * d;
}

const builders: Record<ShapeName, () => Shape> = {
  // Dotted earth. Seattle and the Philippines glow amber.
  globe: () =>
    make((i, p, c) => {
      const x = land[i * 3] * GLOBE_R, y = land[i * 3 + 1] * GLOBE_R, z = land[i * 3 + 2] * GLOBE_R;
      p.set([x, y, z], i * 3);
      const hot = near(x, y, z, SEATTLE, 0.32) || near(x, y, z, MANILA, 0.36);
      setC(c, i, hot ? AMBER : mix(BLUE, SKY, Math.max(0, y / GLOBE_R) * 0.6), hot ? 1.4 : 0.85);
    }, 1),

  // Scattered to-dos: wide, uneven, warm.
  chaos: () =>
    make((i, p, c, r) => {
      const a = r() * Math.PI * 2, b = Math.acos(2 * r() - 1);
      const rad = 1.5 + Math.pow(r(), 0.6) * 4.2;
      p.set([Math.sin(b) * Math.cos(a) * rad * 1.5, Math.cos(b) * rad * 0.8, Math.sin(b) * Math.sin(a) * rad], i * 3);
      const k = r();
      setC(c, i, k < 0.35 ? RED : k < 0.75 ? AMBER : SKY, 0.85 + r() * 0.7);
    }, 2),

  // Twelve tidy cards: everything off your plate, organized.
  grid: () =>
    make((i, p, c) => {
      const cards = 12, per = Math.ceil(COUNT / cards);
      const card = Math.min(cards - 1, Math.floor(i / per));
      const j = i - card * per;
      const cols = 4, rowsC = 3;
      const cx = (card % cols) - (cols - 1) / 2, cy = Math.floor(card / cols) - (rowsC - 1) / 2;
      const gw = 24, gh = Math.ceil(per / gw);
      const u = (j % gw) / (gw - 1) - 0.5, v = Math.floor(j / gw) / Math.max(1, gh - 1) - 0.5;
      const x = cx * 1.55 + u * 1.25, y = -cy * 1.3 + v * 1.0;
      p.set([x, y, -Math.abs(x) * 0.18], i * 3);
      const edge = Math.abs(u) > 0.46 || Math.abs(v) > 0.45;
      setC(c, i, edge ? SKY : BLUE, edge ? 1.1 : 0.55);
    }, 3),

  // A rising spiral: start small, grow steadily.
  spiral: () =>
    make((i, p, c, r) => {
      const t = i / COUNT;
      const ang = t * Math.PI * 2 * 4.5;
      const rad = 0.5 + t * 2.4 + (r() - 0.5) * 0.18;
      p.set([Math.cos(ang) * rad, -2.4 + t * 4.8 + (r() - 0.5) * 0.12, Math.sin(ang) * rad], i * 3);
      setC(c, i, mix(BLUE, AMBER, t), 0.6 + t * 0.6);
    }, 4),

  // Two teams, one connection: Seattle on the left, the Philippines on the right.
  bridge: () =>
    make((i, p, c, r) => {
      const share = i / COUNT;
      if (share < 0.7) {
        const left = i % 2 === 0;
        const a = r() * Math.PI * 2, b = Math.acos(2 * r() - 1), rad = Math.cbrt(r()) * 1.15;
        p.set([(left ? -2.9 : 2.9) + Math.sin(b) * Math.cos(a) * rad, Math.cos(b) * rad, Math.sin(b) * Math.sin(a) * rad], i * 3);
        setC(c, i, left ? BLUE : SKY, 0.8);
      } else {
        const t = (share - 0.7) / 0.3;
        const strand = i % 5;
        const x = -2.9 + t * 5.8;
        const y = Math.sin(t * Math.PI) * 1.9 + (strand - 2) * 0.05;
        const z = Math.sin(t * Math.PI * 2 + strand) * 0.12;
        p.set([x, y, z], i * 3);
        setC(c, i, AMBER, 1.2);
      }
    }, 5),

  // A clock face: the time you get back.
  clock: () =>
    make((i, p, c, r) => {
      const share = i / COUNT;
      if (share < 0.55) {
        const a = r() * Math.PI * 2, rad = 2.3 + (r() - 0.5) * 0.12;
        p.set([Math.cos(a) * rad, Math.sin(a) * rad, (r() - 0.5) * 0.15], i * 3);
        setC(c, i, BLUE, 0.8);
      } else if (share < 0.72) {
        const tick = Math.floor(r() * 12), a = (tick / 12) * Math.PI * 2;
        const rad = 1.85 + r() * 0.25;
        p.set([Math.cos(a) * rad, Math.sin(a) * rad, 0], i * 3);
        setC(c, i, SKY, 1);
      } else {
        // Hands at ten past ten.
        const minute = r() < 0.55;
        const a = minute ? Math.PI / 2 - (10 / 60) * Math.PI * 2 : Math.PI / 2 - (10.17 / 12) * Math.PI * 2;
        const len = (minute ? 1.65 : 1.1) * r();
        p.set([Math.cos(a) * len + (r() - 0.5) * 0.05, Math.sin(a) * len + (r() - 0.5) * 0.05, 0.05], i * 3);
        setC(c, i, AMBER, 1.2);
      }
    }, 6),

  // A calm, even sphere for quiet pages.
  sphere: () =>
    make((i, p, c) => {
      const y = 1 - (i / (COUNT - 1)) * 2, rad = Math.sqrt(1 - y * y), th = i * Math.PI * (3 - Math.sqrt(5));
      p.set([Math.cos(th) * rad * 2.2, y * 2.2, Math.sin(th) * rad * 2.2], i * 3);
      setC(c, i, mix(BLUE, SKY, (y + 1) / 2), 0.55);
    }, 7),
};

const cache = new Map<ShapeName, Shape>();
export function getShape(name: ShapeName): Shape {
  let s = cache.get(name);
  if (!s) {
    s = builders[name]();
    cache.set(name, s);
  }
  return s;
}
