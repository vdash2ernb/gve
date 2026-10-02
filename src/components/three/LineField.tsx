"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { C, L, N, P, getShape, landPoints } from "./shapes";
import { labelEls, sceneStore, type Stage } from "./sceneStore";

const SEGS = L * (P - 1);

const nodeVert = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  uniform float uPixelRatio;
  uniform float uTime;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * 2.6 * (1.0 + 0.06 * sin(uTime * 2.2 + position.x * 3.0));
  }
`;

// A map pin: bright core, soft halo, thin ring.
const nodeFrag = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float core = smoothstep(0.3, 0.12, d);
    float halo = smoothstep(1.0, 0.0, d) * 0.28;
    float ring = smoothstep(0.07, 0.0, abs(d - 0.6)) * 0.7;
    float a = core + halo + ring;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor * a, a) * uOpacity;
  }
`;

const landVert = /* glsl */ `
  uniform float uPixelRatio;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = 1.7 * uPixelRatio;
  }
`;
const landFrag = /* glsl */ `
  uniform float uOpacity;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(0.0, 0.47, 0.97, 1.0) * uOpacity;
  }
`;

// Three.js objects are mutated every frame, so they live outside React's render model.
// There is only ever one canvas, so a module-level singleton is enough.
function build() {
  const segPos = new Float32Array(SEGS * 6);
  const segCol = new Float32Array(SEGS * 6);
  const geo = new LineSegmentsGeometry();
  geo.setPositions(segPos);
  geo.setColors(segCol);
  const core = new LineMaterial({ vertexColors: true, linewidth: 1.6, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const lines = new LineSegments2(geo, core);
  lines.frustumCulled = false;

  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  nodeGeo.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  nodeGeo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(N), 1));
  const nodeMat = new THREE.ShaderMaterial({
    vertexShader: nodeVert,
    fragmentShader: nodeFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uPixelRatio: { value: 1 }, uOpacity: { value: 1 }, uTime: { value: 0 } },
  });
  const nodes = new THREE.Points(nodeGeo, nodeMat);
  nodes.frustumCulled = false;

  const landGeo = new THREE.BufferGeometry();
  landGeo.setAttribute("position", new THREE.BufferAttribute(landPoints, 3));
  const landMat = new THREE.ShaderMaterial({
    vertexShader: landVert,
    fragmentShader: landFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uPixelRatio: { value: 1 }, uOpacity: { value: 0 } },
  });
  const land = new THREE.Points(landGeo, landMat);
  land.frustumCulled = false;

  const rates = new Float32Array(L), revSpeed = new Float32Array(L), delay = new Float32Array(L);
  for (let i = 0; i < L; i++) {
    rates[i] = 2.2 + Math.random() * 1.6;
    revSpeed[i] = 0.9 + Math.random() * 0.7;
    delay[i] = 0.25 + i * 0.018; // the first drawing drafts in line by line
  }

  return {
    geo, core, lines, nodeGeo, nodeMat, nodes, landMat, land, segPos, segCol,
    rates, revSpeed, delay,
    pos: new Float32Array(L * P * 3),
    k: new Float32Array(L * P),
    col: new Float32Array(L * 3),
    rev: new Float32Array(L),
    flow: new Float32Array(L),
    jit: new Float32Array(L),
    nPos: new Float32Array(N * 3),
    nCol: new Float32Array(N * 3),
    nSize: new Float32Array(N),
    labelOp: new Float32Array(N),
    labelText: new Array<string>(N).fill(""),
    vx: new Float32Array(P), vy: new Float32Array(P), vz: new Float32Array(P),
    vr: new Float32Array(P), vg: new Float32Array(P), vb: new Float32Array(P),
    xf: { x: 0, y: 0, s: 1, rotY: 0, rotX: 0, sway: 0.12, dim: 1, land: 0 },
    ready: false,
  };
}

let RES: ReturnType<typeof build> | null = null;
const res = () => (RES ??= build());

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

/** Where the reader is between page sections, as a fractional stage index. */
function readProgress(count: number) {
  const markers = document.querySelectorAll<HTMLElement>("[data-stage]");
  if (!markers.length || count < 2) return 0;
  const vh = window.innerHeight, vc = vh / 2;
  const n = Math.min(markers.length, count);
  const centers: number[] = [];
  for (let i = 0; i < n; i++) {
    const r = markers[i].getBoundingClientRect();
    centers.push(r.top + Math.min(r.height, vh) / 2);
  }
  if (vc <= centers[0]) return 0;
  for (let i = 0; i < n - 1; i++) {
    if (vc <= centers[i + 1]) {
      const t = (vc - centers[i]) / Math.max(1, centers[i + 1] - centers[i]);
      return i + smoothstep(0.2, 0.8, t);
    }
  }
  return n - 1;
}

const tmp = new THREE.Vector3();
const center = new THREE.Vector3();

function Field({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const mouseLag = useRef(new THREE.Vector2(0, 0));
  const { size, viewport } = useThree();
  const { lines, nodes, land } = res();

  useEffect(() => {
    const onMove = (e: PointerEvent) => mouse.current.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const R = res();
    const dt = Math.min(delta, 1 / 20);
    const t = state.clock.elapsedTime;
    const stages = sceneStore.stages;
    const p = readProgress(stages.length);
    const i0 = Math.min(Math.floor(p), stages.length - 1);
    const i1 = Math.min(stages.length - 1, i0 + 1);
    const f = i1 === i0 ? 0 : p - i0;
    const SA = stages[i0], SB = stages[i1];
    const A = getShape(SA.shape), B = getShape(SB.shape);
    const dom = f < 0.5 ? SA : SB;
    const D = f < 0.5 ? A : B;
    const focus = sceneStore.focus ?? dom.focus ?? null;
    const first = !R.ready;
    const ec = reduced || first ? 1 : 1 - Math.exp(-4 * dt);

    /* ── lines: targets, reveal, easing ── */
    for (let i = 0; i < L; i++) {
      const on = A.on[i] + (B.on[i] - A.on[i]) * f;
      const i3 = i * 3;
      let cr = A.col[i3] + (B.col[i3] - A.col[i3]) * f;
      let cg = A.col[i3 + 1] + (B.col[i3 + 1] - A.col[i3 + 1]) * f;
      let cb = A.col[i3 + 2] + (B.col[i3 + 2] - A.col[i3 + 2]) * f;
      let flow = A.flow[i] + (B.flow[i] - A.flow[i]) * f;
      const jit = A.jitter[i] + (B.jitter[i] - A.jitter[i]) * f;
      const id = f < 0.5 ? A.lineIds[i] : B.lineIds[i];
      if (focus && id) {
        if (id === focus) {
          cr = C.amber[0] * 1.5; cg = C.amber[1] * 1.5; cb = C.amber[2] * 1.5;
          flow = flow || -1;
        } else {
          cr *= 0.35; cg *= 0.35; cb *= 0.35;
        }
      }

      const rv = first ? 0 : R.rev[i];
      if (reduced) R.rev[i] = on;
      else if (rv < on) R.rev[i] = t > R.delay[i] ? Math.min(on, rv + R.revSpeed[i] * dt) : rv;
      else R.rev[i] = Math.max(on, rv - R.revSpeed[i] * 1.5 * dt);

      // Hidden lines snap into place and draw in. Visible lines morph. Retracting lines stay put.
      const snap = first || reduced || (rv < 0.02 && on > 0.01);
      if (snap || on > 0.01) {
        const e = snap ? 1 : 1 - Math.exp(-R.rates[i] * dt);
        const b3 = i * P * 3, b1 = i * P;
        for (let j = 0; j < P * 3; j++) {
          const tg = A.pos[b3 + j] + (B.pos[b3 + j] - A.pos[b3 + j]) * f;
          R.pos[b3 + j] += (tg - R.pos[b3 + j]) * e;
        }
        for (let j = 0; j < P; j++) {
          const tg = A.k[b1 + j] + (B.k[b1 + j] - A.k[b1 + j]) * f;
          R.k[b1 + j] += (tg - R.k[b1 + j]) * e;
        }
      }
      R.col[i3] += (cr - R.col[i3]) * ec;
      R.col[i3 + 1] += (cg - R.col[i3 + 1]) * ec;
      R.col[i3 + 2] += (cb - R.col[i3 + 2]) * ec;
      R.flow[i] += (flow - R.flow[i]) * ec;
      R.jit[i] += (jit - R.jit[i]) * ec;
    }

    /* ── lines: write GPU segments ── */
    const sp = R.segPos, sc = R.segCol;
    const { vx, vy, vz, vr, vg, vb } = R;
    // Depth cue from last frame's rotation: the far side of a drawing is dimmer.
    const me = group.current?.matrixWorld.elements;
    const inv = 1 / Math.max(0.01, R.xf.s);
    const r20 = me ? me[2] * inv : 0, r21 = me ? me[6] * inv : 0, r22 = me ? me[10] * inv : 1;
    for (let i = 0; i < L; i++) {
      const o = i * (P - 1) * 6;
      const rv = R.rev[i];
      if (rv < 0.002) {
        sc.fill(0, o, o + (P - 1) * 6);
        continue;
      }
      const cr = R.col[i * 3], cg = R.col[i * 3 + 1], cb = R.col[i * 3 + 2];
      const flow = reduced ? 0 : R.flow[i];
      const jit = reduced ? 0 : R.jit[i];
      const phase = (t * 0.3 + i * 0.137) % 1;
      for (let j = 0; j < P; j++) {
        const u = j / (P - 1);
        const b = (i * P + j) * 3;
        let x = R.pos[b], y = R.pos[b + 1];
        if (jit > 0.002) {
          x += jit * Math.sin(t * 7.3 + i * 1.31 + j * 0.47);
          y += jit * Math.cos(t * 6.1 + i * 0.7 + j * 0.53);
        }
        vx[j] = x; vy[j] = y; vz[j] = R.pos[b + 2];
        const vis = Math.min(1, Math.max(0, (rv * 1.25 - u) / 0.25));
        let boost = 0;
        if (flow > 0.02 || flow < -0.02) {
          let d = (flow > 0 ? u : 1 - u) - phase;
          d -= Math.round(d);
          boost = Math.abs(flow) * 2.4 * Math.exp(-d * d * 260);
        }
        const zr = r20 * x + r21 * y + r22 * vz[j];
        const dz = Math.min(1, Math.max(0, (zr + 1.7) / 2.4));
        const kk = R.k[i * P + j] * vis * (0.22 + 0.78 * dz * dz * (3 - 2 * dz));
        vr[j] = (cr * (1 + boost) + boost * 0.25) * kk;
        vg[j] = (cg * (1 + boost) + boost * 0.22) * kk;
        vb[j] = (cb * (1 + boost) + boost * 0.18) * kk;
      }
      for (let j = 0; j < P - 1; j++) {
        const s = o + j * 6;
        sp[s] = vx[j]; sp[s + 1] = vy[j]; sp[s + 2] = vz[j];
        sp[s + 3] = vx[j + 1]; sp[s + 4] = vy[j + 1]; sp[s + 5] = vz[j + 1];
        sc[s] = vr[j]; sc[s + 1] = vg[j]; sc[s + 2] = vb[j];
        sc[s + 3] = vr[j + 1]; sc[s + 4] = vg[j + 1]; sc[s + 5] = vb[j + 1];
      }
    }
    (R.geo.attributes.instanceStart as THREE.InterleavedBufferAttribute).data.needsUpdate = true;
    (R.geo.attributes.instanceColorStart as THREE.InterleavedBufferAttribute).data.needsUpdate = true;

    /* ── nodes ── */
    const en = reduced || first ? 1 : 1 - Math.exp(-3.5 * dt);
    const npos = R.nodeGeo.attributes.position.array as Float32Array;
    const ncol = R.nodeGeo.attributes.aColor.array as Float32Array;
    const nsz = R.nodeGeo.attributes.aSize.array as Float32Array;
    for (let n = 0; n < N; n++) {
      const n3 = n * 3;
      const spec = D.nodes[n];
      let sz = A.nodeSize[n] + (B.nodeSize[n] - A.nodeSize[n]) * f;
      let r = A.nodeCol[n3] + (B.nodeCol[n3] - A.nodeCol[n3]) * f;
      let g = A.nodeCol[n3 + 1] + (B.nodeCol[n3 + 1] - A.nodeCol[n3 + 1]) * f;
      let bl = A.nodeCol[n3 + 2] + (B.nodeCol[n3 + 2] - A.nodeCol[n3 + 2]) * f;
      if (focus && spec?.id) {
        if (spec.id === focus) {
          sz *= 1.9; r = C.amber[0]; g = C.amber[1]; bl = C.amber[2];
        } else sz *= 0.7;
      }
      if (first && t < 0.6) sz = 0;
      for (let a = 0; a < 3; a++) {
        const tg = A.nodePos[n3 + a] + (B.nodePos[n3 + a] - A.nodePos[n3 + a]) * f;
        R.nPos[n3 + a] += (tg - R.nPos[n3 + a]) * (first ? 1 : en);
      }
      R.nCol[n3] += (r - R.nCol[n3]) * en;
      R.nCol[n3 + 1] += (g - R.nCol[n3 + 1]) * en;
      R.nCol[n3 + 2] += (bl - R.nCol[n3 + 2]) * en;
      R.nSize[n] += (sz - R.nSize[n]) * (first ? 0 : en);
      npos[n3] = R.nPos[n3]; npos[n3 + 1] = R.nPos[n3 + 1]; npos[n3 + 2] = R.nPos[n3 + 2];
      ncol[n3] = R.nCol[n3]; ncol[n3 + 1] = R.nCol[n3 + 1]; ncol[n3 + 2] = R.nCol[n3 + 2];
      nsz[n] = R.nSize[n];
    }
    R.nodeGeo.attributes.position.needsUpdate = true;
    R.nodeGeo.attributes.aColor.needsUpdate = true;
    R.nodeGeo.attributes.aSize.needsUpdate = true;

    /* ── placement ── */
    const mobile = size.width < 768;
    const lerp = (a: number, b: number) => a + (b - a) * f;
    const fit = Math.min(1, viewport.width / 11);
    const my = (s: Stage) => s.my ?? (s.y ?? 0) * 0.5;
    const ms = (s: Stage) => s.mscale ?? (s.scale ?? 1) * 0.62;
    const goal = {
      x: mobile ? lerp(SA.mx ?? 0, SB.mx ?? 0) : lerp(SA.x ?? 0, SB.x ?? 0),
      y: mobile ? lerp(my(SA), my(SB)) : lerp(SA.y ?? 0, SB.y ?? 0),
      s: mobile ? lerp(ms(SA), ms(SB)) : lerp(SA.scale ?? 1, SB.scale ?? 1) * Math.max(0.7, fit),
      rotY: lerp(SA.rotY ?? 0, SB.rotY ?? 0),
      rotX: lerp(SA.rotX ?? 0, SB.rotX ?? 0),
      sway: reduced ? 0 : lerp(SA.sway ?? 0.12, SB.sway ?? 0.12),
      dim: lerp(SA.dim ?? 1, SB.dim ?? 1) * (mobile ? 0.6 : 1),
      land: lerp(SA.land ? 1 : 0, SB.land ? 1 : 0),
    };
    const ease = first ? 1 : 1 - Math.exp(-2.6 * dt);
    const c = R.xf;
    c.x += (goal.x - c.x) * ease;
    c.y += (goal.y - c.y) * ease;
    c.s += (goal.s - c.s) * ease;
    c.rotY += (goal.rotY - c.rotY) * ease;
    c.rotX += (goal.rotX - c.rotX) * ease;
    c.sway += (goal.sway - c.sway) * ease;
    c.dim += (goal.dim - c.dim) * ease;
    c.land += (goal.land - c.land) * ease;

    mouseLag.current.lerp(mouse.current, reduced ? 0 : 1 - Math.exp(-2 * dt));
    const gp = group.current;
    if (gp) {
      gp.position.set(c.x, c.y, 0);
      gp.scale.setScalar(c.s);
      gp.rotation.set(c.rotX - mouseLag.current.y * 0.08, c.rotY + Math.sin(t * 0.13) * c.sway + mouseLag.current.x * 0.18, 0);
      gp.updateMatrixWorld();
    }

    const pr = state.gl.getPixelRatio();
    R.core.opacity = c.dim;
    R.nodeMat.uniforms.uOpacity.value = c.dim;
    R.nodeMat.uniforms.uPixelRatio.value = pr;
    R.nodeMat.uniforms.uTime.value = t;
    R.landMat.uniforms.uOpacity.value = 0.5 * c.land * c.dim;
    R.landMat.uniforms.uPixelRatio.value = pr;

    /* ── labels ── */
    if (gp) {
      const mode = dom.labels ?? "key";
      const settled = smoothstep(0.72, 0.95, Math.max(f, 1 - f));
      center.setFromMatrixPosition(gp.matrixWorld);
      tmp.copy(center).project(state.camera);
      const centerY = (-tmp.y * 0.5 + 0.5) * size.height;
      const el = 1 - Math.exp(-6 * dt);
      const placed: { node: HTMLElement; x: number; y: number; w: number; h: number; down: boolean }[] = [];
      for (let n = 0; n < N; n++) {
        const spec = D.nodes[n];
        const node = labelEls[n];
        if (!node) continue;
        const want = !!spec?.label && R.nSize[n] > 3 && (mode === "all" || (mode === "key" && spec.key) || (!!focus && spec.id === focus));
        tmp.set(R.nPos[n * 3], R.nPos[n * 3 + 1], R.nPos[n * 3 + 2]).applyMatrix4(gp.matrixWorld);
        let facing = 1;
        if (spec?.sphere) {
          const dz = (tmp.z - center.z) / Math.max(0.001, tmp.distanceTo(center));
          facing = smoothstep(0.05, 0.4, dz);
        }
        const target = want ? settled * facing * Math.min(1, c.dim / 0.35) : 0;
        R.labelOp[n] += (target - R.labelOp[n]) * (reduced ? 1 : el);
        if (want && spec?.label && R.labelText[n] !== spec.label) {
          R.labelText[n] = spec.label;
          node.textContent = spec.label;
        }
        if (want && spec) node.dataset.tone = spec.color === C.amber || spec.id === focus ? "amber" : spec.color === C.white ? "white" : "sky";
        tmp.project(state.camera);
        const sx = (tmp.x * 0.5 + 0.5) * size.width;
        const sy = (-tmp.y * 0.5 + 0.5) * size.height;
        node.style.opacity = R.labelOp[n].toFixed(3);
        if (R.labelOp[n] < 0.01) continue;
        // Above the node, or below it on the drawing's lower half. Kept on screen and clear of the header.
        const gap = R.nSize[n] * 1.1 + 6;
        const w = node.offsetWidth, h = node.offsetHeight;
        const down = sy > centerY + 12;
        placed.push({
          node, w, h, down,
          x: Math.min(size.width - w - 8, Math.max(8, sx - w / 2)),
          y: Math.max(76, down ? sy + gap : sy - gap - h),
        });
      }
      // Nudge overlapping labels apart, away from the drawing's center.
      for (let i = 0; i < placed.length; i++) {
        const a = placed[i];
        for (let j = 0; j < i; j++) {
          const b = placed[j];
          if (a.x < b.x + b.w + 4 && b.x < a.x + a.w + 4 && a.y < b.y + b.h + 4 && b.y < a.y + a.h + 4) {
            a.y = a.down ? b.y + b.h + 4 : b.y - a.h - 4;
          }
        }
        a.node.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`;
      }
    }

    R.ready = true;
  });

  return (
    <group ref={group}>
      <primitive object={land} />
      <primitive object={lines} />
      <primitive object={nodes} />
    </group>
  );
}

export default function LineField() {
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  return (
    <Canvas
      className="!absolute inset-0 !h-[100lvh] !w-full"
      style={{ pointerEvents: "none" }}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 7.5], fov: 45 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor("#05070d", 1)}
    >
      <Field reduced={reduced} />
    </Canvas>
  );
}
