import globeLand from "@/lib/globe-points.json";

/*
 * Visual grammar for the whole site. Everything is drawn in lines, like the GVE logo.
 *   Logo blue  → structure: the globe, blueprints
 *   White      → you, the business owner
 *   Amber      → GVE's people and the help they bring
 *   Warm red   → overload
 * Lines draft in and retract like a pen. They never fly around at random.
 *
 * Every shape is the same size (L lines × P points, N nodes), so any two can morph.
 * Line indices are planned so morphs mean something: the globe's meridians become
 * the tasks pulling on you, those tasks move to your Expert, and so on.
 */

export const L = 96;
export const P = 64;
export const N = 16;

type V3 = [number, number, number];
type RGB = [number, number, number];

export const C = {
  blue: [0.0, 0.47, 0.97] as RGB, // logo #0078F8
  sky: [0.5, 0.76, 1.0] as RGB,
  white: [0.93, 0.96, 1.0] as RGB,
  amber: [1.0, 0.62, 0.0] as RGB,
  red: [1.0, 0.32, 0.18] as RGB,
};

const k = (c: RGB, s: number): RGB => [c[0] * s, c[1] * s, c[2] * s];
const mixC = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

export type LineSpec = {
  pts: V3[];
  color: RGB;
  /** Per-vertex brightness, 0..1. */
  fade?: (p: V3, u: number) => number;
  /** +1 pulses travel start → end, -1 end → start. */
  flow?: number;
  /** Nervous wobble, in world units. */
  jitter?: number;
  /** Matches a service slug so hovering a card lights the line. */
  id?: string;
};

export type NodeSpec = {
  pos: V3;
  color: RGB;
  size: number;
  label?: string;
  /** Key labels show by default; others only when focused or when a stage asks for all. */
  key?: boolean;
  id?: string;
  /** Sits on the globe surface: hide its label when it rotates to the back. */
  sphere?: boolean;
};

export type Shape = {
  pos: Float32Array; // L*P*3
  k: Float32Array; // L*P
  col: Float32Array; // L*3
  on: Float32Array; // L
  flow: Float32Array; // L
  jitter: Float32Array; // L
  lineIds: (string | undefined)[];
  nodePos: Float32Array; // N*3
  nodeCol: Float32Array; // N*3
  nodeSize: Float32Array; // N
  nodes: (NodeSpec | undefined)[];
};

function resample(pts: V3[], n: number): V3[] {
  const d = [0];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    d.push(d[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  }
  const total = d[d.length - 1] || 1;
  const out: V3[] = [];
  let seg = 0;
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * total;
    while (seg < pts.length - 2 && d[seg + 1] < t) seg++;
    const span = d[seg + 1] - d[seg] || 1;
    const f = (t - d[seg]) / span;
    const a = pts[seg], b = pts[seg + 1];
    out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]);
  }
  return out;
}

function compile(lines: (LineSpec | undefined)[], nodes: (NodeSpec | undefined)[]): Shape {
  const s: Shape = {
    pos: new Float32Array(L * P * 3),
    k: new Float32Array(L * P),
    col: new Float32Array(L * 3),
    on: new Float32Array(L),
    flow: new Float32Array(L),
    jitter: new Float32Array(L),
    lineIds: new Array(L).fill(undefined),
    nodePos: new Float32Array(N * 3),
    nodeCol: new Float32Array(N * 3),
    nodeSize: new Float32Array(N),
    nodes: new Array(N).fill(undefined),
  };
  for (let i = 0; i < L; i++) {
    const ln = lines[i];
    if (!ln) continue;
    const pts = resample(ln.pts, P);
    for (let j = 0; j < P; j++) {
      s.pos.set(pts[j], (i * P + j) * 3);
      s.k[i * P + j] = ln.fade ? ln.fade(pts[j], j / (P - 1)) : 1;
    }
    s.col.set(ln.color, i * 3);
    s.on[i] = 1;
    s.flow[i] = ln.flow ?? 0;
    s.jitter[i] = ln.jitter ?? 0;
    s.lineIds[i] = ln.id;
  }
  for (let n = 0; n < N; n++) {
    const nd = nodes[n];
    if (!nd) continue;
    s.nodePos.set(nd.pos, n * 3);
    s.nodeCol.set(nd.color, n * 3);
    s.nodeSize[n] = nd.size;
    s.nodes[n] = nd;
  }
  return s;
}

const quad = (a: V3, c: V3, b: V3, n = 24): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, u = 1 - t;
    return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1], u * u * a[2] + 2 * u * t * c[2] + t * t * b[2]] as V3;
  });

/* ───────────────────────── Globe: the logo mark ───────────────────────── */

export const GLOBE_R = 2.1;

/** Globe is pre-rotated 180° so the Pacific faces the viewer at rotY = 0. */
export function latLon(lat: number, lon: number, r = GLOBE_R): V3 {
  const la = (lat * Math.PI) / 180, lo = (lon * Math.PI) / 180;
  return [-Math.cos(la) * Math.sin(lo) * r, Math.sin(la) * r, -Math.cos(la) * Math.cos(lo) * r];
}

const SEATTLE: [number, number] = [47.6, -122.3];
const PHILIPPINES: [number, number] = [14.6, 121.0];

/** Group rotations that put a place front and center. */
export const VIEW = {
  logo: { rotY: -0.12, rotX: 0.32 },
  pacific: { rotY: 0, rotX: 0.22 },
  seattle: { rotY: -1.0, rotX: 0.72 },
  philippines: { rotY: 1.03, rotX: 0.28 },
};

export const landPoints = (() => {
  const src = globeLand as number[];
  const out = new Float32Array(src.length);
  for (let i = 0; i < src.length; i += 3) {
    out[i] = -src[i] * GLOBE_R * 1.002;
    out[i + 1] = src[i + 1] * GLOBE_R * 1.002;
    out[i + 2] = -src[i + 2] * GLOBE_R * 1.002;
  }
  return out;
})();

function globe(): Shape {
  const lines: LineSpec[] = [];
  // Like the logo: a bright crown that opens up toward the base.
  // One blue, like the mark. A couple of lines carry more weight, as in the logo.
  const crown = (p: V3) => 0.08 + 0.92 * smooth(-0.85, 0.7, p[1] / GLOBE_R);
  for (let m = 0; m < 12; m++) {
    const lon = m * 30;
    const pts = Array.from({ length: 49 }, (_, i) => latLon(-90 + i * 3.75, lon));
    lines[m] = { pts, color: k(C.blue, m === 0 ? 1.45 : 1.05), fade: crown };
  }
  [-60, -40, -20, 0, 20, 40, 60].forEach((lat, j) => {
    const pts = Array.from({ length: 73 }, (_, i) => latLon(lat, i * 5));
    lines[12 + j] = { pts, color: k(C.blue, lat === 40 ? 1.45 : 1.05), fade: crown };
  });
  lines[19] = { pts: Array.from({ length: 49 }, (_, i) => latLon(76, i * 7.5)), color: k(C.blue, 1.45), fade: crown };

  // Seattle → Philippines as a flight path: the great circle, lifted gently off the surface.
  const a = latLon(...SEATTLE), b = latLon(...PHILIPPINES);
  const ua = a.map((v) => v / GLOBE_R), ub = b.map((v) => v / GLOBE_R);
  const omega = Math.acos(ua[0] * ub[0] + ua[1] * ub[1] + ua[2] * ub[2]);
  const flight = Array.from({ length: 49 }, (_, i) => {
    const t = i / 48;
    const wa = Math.sin((1 - t) * omega) / Math.sin(omega), wb = Math.sin(t * omega) / Math.sin(omega);
    const h = GLOBE_R * (1 + 0.16 * Math.sin(Math.PI * t));
    return [(ua[0] * wa + ub[0] * wb) * h, (ua[1] * wa + ub[1] * wb) * h, (ua[2] * wa + ub[2] * wb) * h] as V3;
  });
  lines[20] = { pts: flight, color: C.amber, flow: 1, fade: () => 1.2 };

  const nodes: NodeSpec[] = [];
  nodes[0] = { pos: a, color: C.white, size: 11, label: "Seattle", key: true, sphere: true };
  nodes[1] = { pos: b, color: C.amber, size: 13, label: "Philippines", key: true, sphere: true };
  return compile(lines, nodes);
}

/* ─────────────── Hub: "Still the hub for everything?" ─────────────── */

const TASKS = ["Follow-ups", "Scheduling", "Invoices", "Emails", "Bids", "Client calls", "", "", "", "", ""];

function taskPos(i: number): V3 {
  const a = (i / 11) * Math.PI * 2 + 0.35;
  const wob = 1 + Math.sin(i * 2.3) * 0.12;
  return [Math.cos(a) * 2.7 * wob, Math.sin(a) * 1.75 * wob, Math.sin(i * 1.7) * 0.6];
}

function hub(): Shape {
  const lines: LineSpec[] = [];
  const you: V3 = [0, 0, 0];
  for (let i = 0; i < 11; i++) {
    const t = taskPos(i);
    const bend: V3 = [t[0] * 0.45 - t[1] * 0.35, t[1] * 0.45 + t[0] * 0.3, t[2] * 0.5];
    lines[i] = { pts: quad(t, bend, you), color: mixC(C.amber, C.red, (i % 3) / 2), flow: 1, jitter: 0.022, fade: (_, u) => 0.45 + 0.55 * u };
  }
  // The tangle: everything also crosses everything else.
  for (let j = 0; j < 12; j++) {
    const a = taskPos(j % 11), b = taskPos((j * 4 + 3) % 11);
    const c: V3 = [Math.sin(j * 1.9) * 0.8, Math.cos(j * 2.7) * 0.6, Math.sin(j) * 0.8];
    lines[11 + j] = { pts: quad(a, c, b), color: k(C.red, 0.5), jitter: 0.035, fade: () => 0.7 };
  }
  const nodes: NodeSpec[] = [];
  nodes[0] = { pos: you, color: C.white, size: 15, label: "You", key: true };
  nodes[1] = { pos: you, color: C.amber, size: 0 };
  for (let i = 0; i < 11; i++) nodes[2 + i] = { pos: taskPos(i), color: i % 2 ? C.red : C.amber, size: 7, label: TASKS[i] || undefined, key: true };
  return compile(lines, nodes);
}

/* ─────────── Hand-off: "Hand it off. Stay in control." ─────────── */

export const SERVICE_NODES: { id: string; label: string }[] = [
  { id: "executive-assistant", label: "Admin" },
  { id: "project-management", label: "Projects" },
  { id: "bookkeeping", label: "Bookkeeping" },
  { id: "customer-support", label: "Support" },
  { id: "sales-and-crm", label: "Leads & CRM" },
  { id: "marketing", label: "Marketing" },
  { id: "copywriting", label: "Copywriting" },
  { id: "graphic-design", label: "Design" },
  { id: "web-development", label: "Web" },
  { id: "cad-drafting", label: "CAD drafting" },
  { id: "dispatch-logistics", label: "Dispatch" },
];

const EXPERT: V3 = [0.5, 0, 0];
const YOU: V3 = [-2.9, 0.15, 0.3];

function servicePos(i: number): V3 {
  const a = 1.95 - (i / 10) * 3.9; // a fan on the Expert's far side
  return [EXPERT[0] + Math.cos(a) * 2.35, Math.sin(a) * 1.85, Math.sin(a * 2) * 0.45];
}

function handoff(): Shape {
  const lines: LineSpec[] = [];
  for (let i = 0; i < 11; i++) {
    const s = servicePos(i);
    const mid: V3 = [(s[0] + EXPERT[0]) / 2, (s[1] + EXPERT[1]) / 2 + 0.12, (s[2] + EXPERT[2]) / 2];
    // Same endpoints as the hub's spokes, so each task visibly moves to the Expert.
    lines[i] = { pts: quad(s, mid, EXPERT), color: k(C.blue, 1.35), flow: -1, id: SERVICE_NODES[i].id, fade: (_, u) => 0.55 + 0.45 * u };
  }
  lines[11] = { pts: quad(YOU, [-1.2, 0.85, 0.2], EXPERT), color: C.amber, flow: 1, fade: () => 1.15 }; // the hand-off
  lines[12] = { pts: quad(EXPERT, [-1.2, -0.6, 0.2], YOU), color: C.white, flow: 1, fade: () => 0.7 }; // updates back to you
  lines[13] = { pts: Array.from({ length: 73 }, (_, i) => [EXPERT[0] + Math.cos((i / 72) * Math.PI * 2) * 2.35, Math.sin((i / 72) * Math.PI * 2) * 1.85, 0] as V3), color: k(C.blue, 0.9), fade: () => 0.35 };
  const nodes: NodeSpec[] = [];
  nodes[0] = { pos: YOU, color: C.white, size: 12, label: "You", key: true };
  nodes[1] = { pos: EXPERT, color: C.amber, size: 18, label: "Your Expert", key: true };
  for (let i = 0; i < 11; i++) nodes[2 + i] = { pos: servicePos(i), color: C.sky, size: 7, label: SERVICE_NODES[i].label, id: SERVICE_NODES[i].id };
  return compile(lines, nodes);
}

/* ─────────────── House: "Building your success", in six levels ─────────────── */

// Level 0 plan · 1 foundation · 2 frame · 3 roof · 4 lights on · 5 extension
type Part = { pts: V3[]; level: number; color: RGB; litAt?: number; fade?: number };

const houseParts: Part[] = (() => {
  const g = -1.25, top = 0.2, ridge = 1.15, X = 1.6, Z = 1.05, ox = -0.55;
  const v = (x: number, y: number, z: number): V3 => [x + ox, y, z];
  const parts: Part[] = [];
  const grid = k(C.blue, 0.9);
  for (let i = 0; i < 7; i++) parts.push({ pts: [v(-2.5, g, -1.8 + i * 0.6), v(3.5, g, -1.8 + i * 0.6)], level: 0, color: grid, fade: 0.4 });
  for (let i = 0; i < 7; i++) parts.push({ pts: [v(-2.4 + i * 0.95, g, -2.0), v(-2.4 + i * 0.95, g, 2.0)], level: 0, color: grid, fade: 0.4 });
  const rect = (y: number, x0: number, x1: number, z0: number, z1: number, level: number, color: RGB) => {
    parts.push({ pts: [v(x0, y, z1), v(x1, y, z1)], level, color });
    parts.push({ pts: [v(x1, y, z1), v(x1, y, z0)], level, color });
    parts.push({ pts: [v(x1, y, z0), v(x0, y, z0)], level, color });
    parts.push({ pts: [v(x0, y, z0), v(x0, y, z1)], level, color });
  };
  rect(g, -X, X, -Z, Z, 0, C.sky); // footprint
  rect(g - 0.18, -X, X, -Z, Z, 1, C.blue); // slab
  for (const [x, z] of [[-X, Z], [X, Z], [X, -Z], [-X, -Z]]) parts.push({ pts: [v(x, g - 0.18, z), v(x, g, z)], level: 1, color: C.blue });
  const posts: [number, number][] = [[-X, Z], [X, Z], [X, -Z], [-X, -Z], [-0.8, Z], [0, Z], [0.8, Z], [-0.8, -Z], [0, -Z], [0.8, -Z], [-X, 0], [X, 0]];
  for (const [x, z] of posts) parts.push({ pts: [v(x, g, z), v(x, top, z)], level: 2, color: C.blue });
  rect(top, -X, X, -Z, Z, 2, C.blue); // top plates
  parts.push({ pts: [v(-0.3, g, Z), v(-0.3, g + 1.0, Z)], level: 2, color: C.sky, litAt: 4 });
  parts.push({ pts: [v(-0.3, g + 1.0, Z), v(0.3, g + 1.0, Z)], level: 2, color: C.sky, litAt: 4 });
  parts.push({ pts: [v(0.3, g + 1.0, Z), v(0.3, g, Z)], level: 2, color: C.sky, litAt: 4 });
  for (const cx of [-1.15, 1.15]) {
    const x0 = cx - 0.27, x1 = cx + 0.27, y0 = g + 0.55, y1 = g + 1.1;
    parts.push({ pts: [v(x0, y0, Z), v(x1, y0, Z), v(x1, y1, Z), v(x0, y1, Z), v(x0, y0, Z)], level: 2, color: C.sky, litAt: 4 });
    parts.push({ pts: [v(cx, y0, Z), v(cx, y1, Z)], level: 2, color: C.sky, litAt: 4 });
    parts.push({ pts: [v(x0, (y0 + y1) / 2, Z), v(x1, (y0 + y1) / 2, Z)], level: 2, color: C.sky, litAt: 4 });
  }
  for (const x of [-X, -0.8, 0, 0.8, X]) {
    parts.push({ pts: [v(x, top, Z), v(x, ridge, 0)], level: 3, color: C.blue });
    parts.push({ pts: [v(x, top, -Z), v(x, ridge, 0)], level: 3, color: C.blue });
  }
  parts.push({ pts: [v(-X, ridge, 0), v(X, ridge, 0)], level: 3, color: C.sky });
  // Extension on the right: the business grows.
  const E = 2.85, ez = 0.75, eh = top - 0.25, el = top - 0.55;
  parts.push({ pts: [v(X, g, ez), v(E, g, ez), v(E, g, -ez), v(X, g, -ez)], level: 5, color: C.sky });
  for (const z of [ez, -ez]) {
    parts.push({ pts: [v(E, g, z), v(E, el, z)], level: 5, color: C.blue });
    parts.push({ pts: [v(X, eh, z), v(E, el, z)], level: 5, color: C.blue });
  }
  parts.push({ pts: [v(E, el, ez), v(E, el, -ez)], level: 5, color: C.blue });
  parts.push({ pts: [v(X, eh, 0), v(E, el, 0)], level: 5, color: C.blue });
  parts.push({ pts: [v(2.0, g + 0.5, ez), v(2.45, g + 0.5, ez), v(2.45, g + 0.95, ez), v(2.0, g + 0.95, ez), v(2.0, g + 0.5, ez)], level: 5, color: C.amber, litAt: 5 });
  return parts;
})();

function house(level: number): Shape {
  const lines: LineSpec[] = houseParts.map((p) => {
    if (p.level > level) return undefined as unknown as LineSpec;
    const lit = p.litAt !== undefined && level >= p.litAt;
    const faint = p.fade !== undefined && level > 0 ? 0.45 : 1;
    return { pts: p.pts, color: lit ? C.amber : p.color, fade: () => (p.fade ?? 1) * faint * (lit ? 1.3 : 1) };
  });
  const nodes: NodeSpec[] = [];
  const g = -1.25, Z = 1.05, ox = -0.55;
  if (level >= 4) {
    nodes[2] = { pos: [-1.15 + ox, g + 0.82, Z + 0.02], color: C.amber, size: 22 };
    nodes[3] = { pos: [1.15 + ox, g + 0.82, Z + 0.02], color: C.amber, size: 22 };
    nodes[4] = { pos: [0 + ox, g + 0.5, Z + 0.02], color: C.amber, size: 16 };
  }
  if (level >= 5) nodes[5] = { pos: [2.22 + ox, g + 0.72, 0.77], color: C.amber, size: 18 };
  return compile(lines, nodes);
}

/* ───────────────────────────── Registry ───────────────────────────── */

export type ShapeName = "globe" | "hub" | "handoff" | `house${0 | 1 | 2 | 3 | 4 | 5}`;

const builders: Record<ShapeName, () => Shape> = {
  globe,
  hub,
  handoff,
  house0: () => house(0),
  house1: () => house(1),
  house2: () => house(2),
  house3: () => house(3),
  house4: () => house(4),
  house5: () => house(5),
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
