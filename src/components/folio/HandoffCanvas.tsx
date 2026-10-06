"use client";

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import globePoints from '@/lib/globe-points.json';
import { WorkDocument, type Kind } from './FolioCanvas';

// "Hand it off" story for the homepage: your tasks travel from your business in the US
// to your Expert in the Philippines and come back done. Progress runs from 0 (your
// tasks) to 1 (with your Expert) to 2 (done). Desktop follows the scroll; narrow
// screens play it as a short loop while it is on screen.
const NAVY = '#00203d', BLUE = '#003870', ICE = '#79a7c3', GOLD = '#ffa600';
const D2R = Math.PI / 180;
const kinds: Kind[] = ['plans', 'schedule', 'accounts', 'clients'];
const DOC_SCALE = .42;

type Pose = { p: [number, number, number]; r: [number, number, number] };
// Each document keeps its own depth layer in every pose. A document with its clip is about
// .17 deep at this scale, so closer layers made overlapping documents cut through each other
// and flicker as they moved.
const layer = (i: number) => 1 + i * .32;
const desk: Pose[] = [
  { p: [1.3, -1.3, layer(0)], r: [-.05, .08, .2] },
  { p: [1.78, -1.12, layer(1)], r: [-.04, .06, -.16] },
  { p: [1.42, -1.62, layer(2)], r: [-.06, .08, .07] },
  { p: [1.95, -1.55, layer(3)], r: [-.05, .07, -.24] },
];
const withExpert: Pose[] = kinds.map((_, i) => ({ p: [-.78 + i * .44, -1.5 + (i % 2) * .08, layer(i)], r: [0, 0, .12 - i * .07] }));
const done: Pose[] = kinds.map((_, i) => ({ p: [.45 + i * .5, -1.45, layer(i)], r: [0, 0, -.05 + i * .03] }));
const stages = [desk, withExpert, done];

export const captions = [
  { kicker: 'Your business', text: 'Hand off the tasks that fill your day.' },
  { kicker: 'Your Expert', text: 'Your Expert gets to work, in your hours.' },
  { kicker: 'Daily report', text: 'Done, and reported back to you.' },
];

// Globe turned so the western US and the Philippines both face the camera.
const R = 2.05;
const GLOBE_AT: [number, number, number] = [.15, .55, -1.4];
const onGlobe = (lat: number, lon: number, r = R) => new THREE.Vector3(Math.cos(lat * D2R) * Math.sin(lon * D2R) * r, Math.sin(lat * D2R) * r, Math.cos(lat * D2R) * Math.cos(lon * D2R) * r);
const PHILIPPINES = onGlobe(14.6, 121);
// Unlabelled points spread across the US: clients can be anywhere.
const CLIENTS = [onGlobe(47.6, -122.3), onGlobe(34, -118.2), onGlobe(32.8, -96.8), onGlobe(41.9, -87.6)];
const CLIENT_LABEL = CLIENTS.reduce((sum, v) => sum.add(v), new THREE.Vector3()).normalize().multiplyScalar(R * 1.22);

function arc(from: THREE.Vector3, to: THREE.Vector3) {
  const a = from.clone().normalize(), turn = new THREE.Quaternion().setFromUnitVectors(a, to.clone().normalize());
  const points = Array.from({ length: 65 }, (_, i) => {
    const t = i / 64;
    return a.clone().applyQuaternion(new THREE.Quaternion().slerp(turn, t)).multiplyScalar(R * (1 + .3 * Math.sin(Math.PI * t)));
  });
  return new THREE.CatmullRomCurve3(points);
}
const ROUTES = CLIENTS.map(client => arc(client, PHILIPPINES));

function textTexture(width: number, height: number, draw: (c: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  draw(canvas.getContext('2d')!);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Label({ at, text }: { at: THREE.Vector3; text: string }) {
  const tag = useMemo(() => textTexture(320, 64, c => { c.fillStyle = '#dbe8f2'; c.font = '600 30px sans-serif'; c.textAlign = 'center'; c.fillText(text, 160, 42); }), [text]);
  useEffect(() => () => tag.dispose(), [tag]);
  return <sprite position={at} scale={[1.25, .25, 1]}><spriteMaterial map={tag} transparent depthWrite={false}/></sprite>;
}

function Globe({ packets, pulse }: { packets: RefObject<(THREE.Mesh | null)[]>; pulse: RefObject<THREE.Mesh | null> }) {
  const dots = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute((globePoints as number[]).map(v => v * R), 3)), []);
  const tubes = useMemo(() => ROUTES.map(route => new THREE.TubeGeometry(route, 80, .014, 6, false)), []);
  const facing = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), PHILIPPINES.clone().normalize()), []);
  useEffect(() => () => { dots.dispose(); tubes.forEach(tube => tube.dispose()); }, [dots, tubes]);
  return <group position={GLOBE_AT} rotation={[26 * D2R, 0, 0]}>
    <group rotation={[0, -196.5 * D2R, 0]}>
      <mesh><sphereGeometry args={[R * .985, 48, 32]}/><meshBasicMaterial color="#012b52"/></mesh>
      <points geometry={dots}><pointsMaterial color={ICE} size={.035} transparent opacity={.75}/></points>
      {tubes.map((tube, i) => <mesh key={i} geometry={tube}><meshBasicMaterial color={GOLD} transparent opacity={.55}/></mesh>)}
      {CLIENTS.map((client, i) => <mesh key={i} position={client}><sphereGeometry args={[.055, 12, 12]}/><meshBasicMaterial color={GOLD}/></mesh>)}
      <group position={PHILIPPINES}>
        <mesh><sphereGeometry args={[.08, 16, 16]}/><meshBasicMaterial color={GOLD}/></mesh>
        <mesh ref={pulse} quaternion={facing}><ringGeometry args={[.11, .14, 32]}/><meshBasicMaterial color={GOLD} transparent opacity={.6} side={THREE.DoubleSide}/></mesh>
      </group>
      {ROUTES.map((route, i) => <mesh key={i} ref={el => { packets.current[i] = el; }} position={route.getPoint(0)}><sphereGeometry args={[.06, 12, 12]}/><meshBasicMaterial color="#ffd27a"/></mesh>)}
      <Label at={CLIENT_LABEL} text="Your business"/>
      <Label at={PHILIPPINES.clone().normalize().multiplyScalar(R * 1.2).add(new THREE.Vector3(0, .25, 0))} text="Philippines"/>
    </group>
  </group>;
}

// A faceless Expert: an outline figure with a headset, never a real team member.
function ExpertCard() {
  const face = useMemo(() => textTexture(512, 512, c => {
    const sky = c.createLinearGradient(0, 0, 0, 512);
    sky.addColorStop(0, '#d7e6ef'); sky.addColorStop(1, '#a9c6d8');
    c.fillStyle = sky; c.fillRect(0, 0, 512, 512);
    c.fillStyle = BLUE;
    c.beginPath(); c.arc(256, 210, 86, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(256, 520, 168, 190, 0, Math.PI, 0); c.fill();
    c.strokeStyle = GOLD; c.lineWidth = 16; c.lineCap = 'round';
    c.beginPath(); c.arc(256, 210, 108, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
    c.lineWidth = 10;
    c.beginPath(); c.moveTo(150, 236); c.quadraticCurveTo(160, 300, 220, 300); c.stroke();
    c.fillStyle = GOLD; c.fillRect(142, 196, 24, 52); c.fillRect(346, 196, 24, 52);
  }), []);
  const label = useMemo(() => textTexture(512, 170, c => {
    c.fillStyle = NAVY; c.font = 'bold 58px sans-serif'; c.fillText('Your Expert', 24, 74);
    c.fillStyle = GOLD; c.fillRect(26, 98, 46, 6);
    c.fillStyle = '#597180'; c.font = '34px sans-serif'; c.fillText('Philippines', 88, 112);
  }), []);
  useEffect(() => () => { face.dispose(); label.dispose(); }, [face, label]);
  return <group position={[-1.95, -1.5, .9]} rotation={[0, .12, .03]}>
    <RoundedBox args={[1.42, 1.84, .08]} radius={.06} smoothness={3} castShadow><meshStandardMaterial color="#f5f6f4" roughness={.6}/></RoundedBox>
    <mesh position={[0, .2, .045]}><planeGeometry args={[1.26, 1.26]}/><meshBasicMaterial map={face} toneMapped={false}/></mesh>
    <mesh position={[0, -.64, .045]}><planeGeometry args={[1.26, .42]}/><meshBasicMaterial map={label} transparent toneMapped={false}/></mesh>
    <mesh position={[.5, .72, .05]}><circleGeometry args={[.07, 24]}/><meshBasicMaterial color="#3ccf7a"/></mesh>
  </group>;
}

function Badge({ badge }: { badge: (el: THREE.Mesh | null) => void }) {
  const tick = useMemo(() => textTexture(128, 128, c => {
    c.fillStyle = GOLD; c.beginPath(); c.arc(64, 64, 60, 0, Math.PI * 2); c.fill();
    c.strokeStyle = NAVY; c.lineWidth = 13; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(36, 66); c.lineTo(56, 86); c.lineTo(92, 46); c.stroke();
  }), []);
  useEffect(() => () => tick.dispose(), [tick]);
  return <mesh ref={badge} position={[.95, 1.42, .32]} scale={0}><planeGeometry args={[.62, .62]}/><meshBasicMaterial map={tick} transparent toneMapped={false}/></mesh>;
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const bezier = (a: number, c: number, b: number, t: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;

// The phone loop: pause on each step, travel between them, then tidy away and start again.
// `reset` runs 0 → 1 at the end: the finished documents shrink away one by one (0–.5), then
// the new pile grows back one by one (.5–1).
const LOOP = 8.2;
function loopAt(seconds: number) {
  const s = seconds % LOOP;
  if (s < 1.5) return { p: 0, reset: 0 };
  if (s < 3) return { p: (s - 1.5) / 1.5, reset: 0 };
  if (s < 4.2) return { p: 1, reset: 0 };
  if (s < 5.7) return { p: 1 + (s - 4.2) / 1.5, reset: 0 };
  if (s < 7) return { p: 2, reset: 0 };
  const reset = (s - 7) / 1.2;
  return { p: reset < .5 ? 2 : 0, reset };
}
function resetSize(reset: number, i: number) {
  if (reset <= 0) return 1;
  const step = (phase: number) => smooth(THREE.MathUtils.clamp((phase * 2 - i * .1) / .7, 0, 1));
  return reset < .5 ? 1 - step(reset) : step(reset - .5);
}

function Assembly({ paused, reduced, auto, panel, onStage }: { paused: boolean; reduced: boolean; auto: boolean; panel: boolean; onStage: (stage: number) => void }) {
  const root = useRef<THREE.Group>(null);
  const docs = useRef<(THREE.Group | null)[]>([]);
  const badges = useRef<(THREE.Mesh | null)[]>([]);
  const packets = useRef<(THREE.Mesh | null)[]>([]);
  const pulse = useRef<THREE.Mesh>(null);
  const { viewport, invalidate, gl } = useThree();
  const progress = useRef(0), wanted = useRef(0), stage = useRef(-1);
  const pointer = useRef({ x: 0, y: 0 });
  const inView = useRef(true), loopStart = useRef<number | null>(null);
  const still = reduced || paused;

  useEffect(() => {
    const scroll = () => {
      const section = document.getElementById('work-story');
      const chapters = section ? Array.from(section.querySelectorAll<HTMLElement>('.story-chapter')) : [];
      if (section && chapters.length >= 3 && panel) {
        // The phone panel pinned under chapters 01 and 02: each chapter scrolling in moves the story one step.
        const h = window.innerHeight;
        const enter = (chapter: HTMLElement) => THREE.MathUtils.clamp((h - chapter.getBoundingClientRect().top) / (h * .85), 0, 1);
        wanted.current = enter(chapters[1]) + enter(chapters[2]);
      } else if (section && chapters.length >= 3) {
        const offsets = chapters.map(chapter => chapter.offsetTop);
        const y = Math.max(0, -section.getBoundingClientRect().top);
        const interval = y < offsets[1] ? 0 : 1;
        const next = interval + (y - offsets[interval]) / Math.max(1, offsets[interval + 1] - offsets[interval]);
        wanted.current = Number.isFinite(next) ? THREE.MathUtils.clamp(next, 0, 2) : 0;
      }
      invalidate();
    };
    // Only a mouse tilts the scene; on touch screens the last finger position would leave it tilted.
    const move = (e: PointerEvent) => { if (e.pointerType !== 'mouse') return; pointer.current = { x: e.clientX / window.innerWidth - .5, y: e.clientY / window.innerHeight - .5 }; invalidate(); };
    // Animation only runs while the scene is on screen; the phone loop restarts each time it comes back.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !inView.current) loopStart.current = null;
      inView.current = entry.isIntersecting;
      invalidate();
    });
    observer.observe(gl.domElement);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', scroll);
    window.addEventListener('pointermove', move, { passive: true });
    scroll();
    return () => { observer.disconnect(); window.removeEventListener('scroll', scroll); window.removeEventListener('resize', scroll); window.removeEventListener('pointermove', move); };
  }, [invalidate, gl, panel]);
  useEffect(() => { loopStart.current = null; invalidate(); }, [still, auto, invalidate]);

  useFrame(({ clock }, delta) => {
    if (!root.current) return;
    const playing = !still && inView.current;
    let p: number, reset = 0;
    if (auto) {
      if (loopStart.current === null) loopStart.current = clock.elapsedTime;
      ({ p, reset } = playing ? loopAt(clock.elapsedTime - loopStart.current) : { p: 0, reset: 0 });
    } else {
      const speed = still ? 1 : 1 - Math.exp(-THREE.MathUtils.clamp(delta, 0, .05) * 6);
      progress.current = THREE.MathUtils.lerp(progress.current, wanted.current, speed);
      p = still ? Math.round(progress.current) : progress.current;
    }
    const now = p < .5 ? 0 : p < 1.5 ? 1 : 2;
    if (now !== stage.current) { stage.current = now; onStage(now); }

    root.current.scale.setScalar(Math.min(viewport.width / 6.4, viewport.height / 6.2));
    const tilt = still ? 0 : 1;
    root.current.rotation.set(-.05 + pointer.current.y * .04 * tilt, -.1 + pointer.current.x * .08 * tilt, 0);

    // Each document arcs up over the globe between poses, a little after the one before it.
    // The arc only rises, so every document stays in its own depth layer.
    const segment = Math.min(1, Math.floor(p)), f = p - segment;
    docs.current.forEach((doc, i) => {
      if (!doc) return;
      const t = smooth(THREE.MathUtils.clamp((f - i * .1) / .7, 0, 1));
      const a = stages[segment][i], b = stages[segment + 1][i];
      const lift = [0, 1.3, 0];
      doc.position.set(...([0, 1, 2].map(n => bezier(a.p[n], (a.p[n] + b.p[n]) / 2 + lift[n], b.p[n], t)) as [number, number, number]));
      doc.rotation.set(...([0, 1, 2].map(n => THREE.MathUtils.lerp(a.r[n], b.r[n], t)) as [number, number, number]));
      const size = resetSize(reset, i);
      doc.visible = size > .01;
      doc.scale.setScalar(DOC_SCALE * Math.max(size, .01));
      const tick = segment === 1 ? smooth(THREE.MathUtils.clamp((f - .55 - i * .08) / .25, 0, 1)) : 0;
      badges.current[i]?.scale.setScalar(tick);
    });

    // Lights travel the routes: out to the Philippines, then back once the work is done.
    ROUTES.forEach((route, i) => {
      const packet = packets.current[i];
      if (!packet) return;
      const along = playing ? ((clock.elapsedTime / 2.6) + i * .25) % 1 : .5;
      packet.position.copy(route.getPoint(p > 1.5 ? 1 - along : along));
    });
    if (pulse.current) {
      const beat = playing ? (clock.elapsedTime % 2.6) / 2.6 : 0;
      pulse.current.scale.setScalar(1 + beat * 1.6);
      (pulse.current.material as THREE.MeshBasicMaterial).opacity = .6 * (1 - beat);
    }

    if (playing || Math.abs(wanted.current - progress.current) > .001) invalidate();
  });

  return <group ref={root}>
    <Globe packets={packets} pulse={pulse}/>
    <ExpertCard/>
    {kinds.map((kind, i) => <group key={kind} ref={el => { docs.current[i] = el; }} position={desk[i].p} rotation={desk[i].r} scale={DOC_SCALE}>
      <WorkDocument kind={kind}/>
      <Badge badge={el => { badges.current[i] = el; }}/>
    </group>)}
  </group>;
}

// `panel` is the phone version pinned below chapters 01 and 02, driven by their scroll.
export default function HandoffCanvas({ paused, panel = false }: { paused: boolean; panel?: boolean }) {
  const [reduced, setReduced] = useState(true);
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState(0);
  // Touch devices and narrow screens get a lighter render: lower pixel density and no shadows.
  const [lite] = useState(() => window.matchMedia('(max-width: 900px), (pointer: coarse)').matches);
  // On narrow screens the opening scene sits in the page, so it plays as a loop instead of following the scroll.
  const [auto, setAuto] = useState(() => !panel && window.matchMedia('(max-width: 900px)').matches);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)'), narrow = window.matchMedia('(max-width: 900px)');
    const update = () => { setReduced(motion.matches); setAuto(!panel && narrow.matches); };
    update();
    motion.addEventListener('change', update); narrow.addEventListener('change', update);
    return () => { motion.removeEventListener('change', update); narrow.removeEventListener('change', update); };
  }, [panel]);
  return <div className="handoff-scene">
    <Canvas className={ready ? 'folio-canvas is-ready' : 'folio-canvas'} onCreated={() => setReady(true)} shadows={lite ? false : 'soft'} frameloop="demand" dpr={[1, lite ? 1.25 : 1.6]} camera={{ position: [0, 0, 10], fov: 37, near: .1, far: 50 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} style={{ touchAction: 'pan-y' }}>
      <ambientLight intensity={.95}/>
      <directionalLight position={[-4, 6, 7]} intensity={2.1} color="#fff4df" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-bias={-.0005}/>
      <directionalLight position={[4, 1, 4]} intensity={1.5} color="#afdfff"/>
      <directionalLight position={[0, -3, 4]} intensity={.4} color={ICE}/>
      <Assembly paused={paused} reduced={reduced} auto={auto} panel={panel} onStage={setStage}/>
    </Canvas>
    <p className="handoff-caption" key={stage}><span>{captions[stage].kicker}</span>{captions[stage].text}</p>
  </div>;
}
