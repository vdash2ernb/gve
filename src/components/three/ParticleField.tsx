"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { COUNT, getShape, MANILA, SEATTLE, GLOBE_R } from "./shapes";
import { sceneStore, type Stage } from "./sceneStore";

const vertex = /* glsl */ `
  attribute vec3 aColor;
  attribute float aRand;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uAspect;
  uniform float uMotion;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float w = uTime * 0.6 + aRand * 6.2831;
    p += vec3(sin(w), cos(w * 1.3), sin(w * 0.7)) * 0.025 * uMotion;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 d = (ndc - uMouse) * vec2(uAspect, 1.0);
    float dist = length(d);
    float push = smoothstep(0.32, 0.0, dist) * uMotion;
    mv.xy += normalize(d + 1e-5) * push * 0.55;

    gl_Position = projectionMatrix * mv;
    float size = uSize * (0.6 + aRand * 0.8) * (1.0 + push * 1.5);
    gl_PointSize = size * uPixelRatio * (7.0 / -mv.z);
    vColor = aColor + push * vec3(0.25, 0.2, 0.0);
    vAlpha = 0.55 + 0.45 * aRand;
  }
`;

const fragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a * vAlpha * uOpacity);
  }
`;

const arcVertex = /* glsl */ `
  attribute float aT;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vGlow;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float head = fract(uTime * 0.22);
    float trail = smoothstep(0.18, 0.0, head - aT) * step(aT, head);
    vGlow = 0.18 + trail;
    gl_PointSize = (2.0 + trail * 5.0) * uPixelRatio * (7.0 / -mv.z);
  }
`;

const arcFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vGlow;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(1.0, 0.72, 0.2, a * vGlow * uOpacity);
  }
`;

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

/** Where the reader is between page sections, as a fractional stage index. */
function readProgress(count: number) {
  const markers = document.querySelectorAll<HTMLElement>("[data-stage]");
  if (!markers.length || count < 2) return 0;
  const vc = window.innerHeight / 2;
  const centers: number[] = [];
  markers.forEach((m) => {
    const r = m.getBoundingClientRect();
    centers.push(r.top + Math.min(r.height, window.innerHeight) / 2);
  });
  const n = Math.min(centers.length, count);
  if (vc <= centers[0]) return 0;
  for (let i = 0; i < n - 1; i++) {
    if (vc <= centers[i + 1]) {
      const t = (vc - centers[i]) / Math.max(1, centers[i + 1] - centers[i]);
      return i + smoothstep(0.15, 0.85, t);
    }
  }
  return n - 1;
}

// Three.js objects are mutated every frame, so they live outside React's render model.
// There is only ever one canvas, so a module-level singleton is enough.
function build() {
  const start = getShape("chaos");
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(Float32Array.from(start.pos, (v) => v * 1.6), 3));
  g.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
  const rand = new Float32Array(COUNT);
  const rates = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    rand[i] = Math.random();
    rates[i] = 1.6 + Math.random() * 2.6;
  }
  g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

  const m = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 3.2 },
      uPixelRatio: { value: 1 },
      uMouse: { value: new THREE.Vector2(9, 9) },
      uAspect: { value: 1 },
      uMotion: { value: 1 },
      uOpacity: { value: 1 },
    },
  });

  // Seattle → Philippines arc, lifted over the North Pacific.
  const a = new THREE.Vector3(...SEATTLE), b = new THREE.Vector3(...MANILA);
  const mid = a.clone().add(b).normalize().multiplyScalar(GLOBE_R * 1.55);
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  const pts = curve.getPoints(260);
  const ag = new THREE.BufferGeometry().setFromPoints(pts);
  ag.setAttribute("aT", new THREE.BufferAttribute(Float32Array.from(pts, (_, i) => i / (pts.length - 1)), 1));
  const am = new THREE.ShaderMaterial({
    vertexShader: arcVertex,
    fragmentShader: arcFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uOpacity: { value: 0 } },
  });

  return { geometry: g, material: m, rates, target: new Float32Array(COUNT * 3), targetCol: new Float32Array(COUNT * 3), arc: ag, arcMat: am };
}

let RES: ReturnType<typeof build> | null = null;
const res = () => (RES ??= build());

function Field({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const mouse = useRef(new THREE.Vector2(9, 9));
  const mouseLag = useRef(new THREE.Vector2(0, 0));
  const { size, viewport } = useThree();

  const { geometry, material, arc, arcMat } = res();

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    };
    const onLeave = () => mouse.current.set(9, 9);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const xf = useRef({ x: 0, y: 0, s: 1, rotY: 0, dim: 1 });

  useFrame((state, delta) => {
    const { geometry, material, rates, target, targetCol, arcMat } = res();
    const dt = Math.min(delta, 1 / 20);
    const stages = sceneStore.stages;
    const mobile = size.width < 768;
    const p = readProgress(stages.length);
    const i0 = Math.floor(p), i1 = Math.min(stages.length - 1, i0 + 1), f = p - i0;
    const A = stages[Math.min(i0, stages.length - 1)], B = stages[i1];
    const sa = getShape(A.shape), sb = getShape(B.shape);

    for (let k = 0; k < COUNT * 3; k++) {
      target[k] = sa.pos[k] + (sb.pos[k] - sa.pos[k]) * f;
      targetCol[k] = sa.col[k] + (sb.col[k] - sa.col[k]) * f;
    }

    // Each point eases toward its target at its own pace, so morphs ripple.
    const pos = geometry.attributes.position.array as Float32Array;
    const col = geometry.attributes.aColor.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      const e = reduced ? 1 : 1 - Math.exp(-rates[i] * dt);
      const o = i * 3;
      pos[o] += (target[o] - pos[o]) * e;
      pos[o + 1] += (target[o + 1] - pos[o + 1]) * e;
      pos[o + 2] += (target[o + 2] - pos[o + 2]) * e;
      col[o] += (targetCol[o] - col[o]) * e;
      col[o + 1] += (targetCol[o + 1] - col[o + 1]) * e;
      col[o + 2] += (targetCol[o + 2] - col[o + 2]) * e;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aColor.needsUpdate = true;

    const lerpStage = (key: keyof Stage, fallback: number) =>
      ((A[key] as number | undefined) ?? fallback) + (((B[key] as number | undefined) ?? fallback) - ((A[key] as number | undefined) ?? fallback)) * f;
    const fit = Math.min(1, viewport.width / 11);
    const goal = {
      x: mobile ? 0 : lerpStage("x", 0),
      y: mobile ? lerpStage("y", 0) * 0.5 : lerpStage("y", 0),
      s: lerpStage("scale", 1) * (mobile ? 0.62 : Math.max(0.7, fit)),
      rotY: lerpStage("rotY", 0),
      dim: lerpStage("dim", 1) * (mobile ? 0.5 : 1),
    };
    const ease = 1 - Math.exp(-3 * dt);
    const c = xf.current;
    c.x += (goal.x - c.x) * ease;
    c.y += (goal.y - c.y) * ease;
    c.s += (goal.s - c.s) * ease;
    c.rotY += (goal.rotY - c.rotY) * ease;
    c.dim += (goal.dim - c.dim) * ease;

    mouseLag.current.lerp(mouse.current.x > 5 ? new THREE.Vector2(0, 0) : mouse.current, 1 - Math.exp(-2 * dt));
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.position.set(c.x, c.y, 0);
      group.current.scale.setScalar(c.s);
      const sway = reduced ? 0 : Math.sin(t * 0.12) * 0.35;
      group.current.rotation.y = c.rotY + sway + mouseLag.current.x * 0.25;
      group.current.rotation.x = 0.28 - mouseLag.current.y * 0.15;
    }

    const u = material.uniforms;
    u.uTime.value = t;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    u.uMouse.value.copy(mouse.current);
    u.uAspect.value = size.width / size.height;
    u.uMotion.value = reduced ? 0 : 1;
    u.uOpacity.value = c.dim;

    // The arc only shows while the globe is on screen.
    const globeWeight = (A.shape === "globe" ? 1 - f : 0) + (B.shape === "globe" && i1 !== i0 ? f : 0);
    arcMat.uniforms.uTime.value = t;
    arcMat.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    arcMat.uniforms.uOpacity.value += (globeWeight * c.dim - arcMat.uniforms.uOpacity.value) * ease;
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} />
      <points geometry={arc} material={arcMat} frustumCulled={false} />
    </group>
  );
}

export default function ParticleField() {
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  return (
    <Canvas
      className="!fixed inset-0 !h-[100lvh] !w-full"
      style={{ pointerEvents: "none" }}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 7.5], fov: 45 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
    >
      <Field reduced={reduced} />
    </Canvas>
  );
}
