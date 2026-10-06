"use client";

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, useTexture } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import globePoints from '@/lib/globe-points.json';
import { WorkDocument, type Kind } from './FolioCanvas';

// "Hand it off" story for the homepage. Scroll progress runs from 0 (your pile of
// tasks in Seattle) to 1 (with your Expert in the Philippines) to 2 (back to you, done).
const NAVY = '#00203d', ICE = '#79a7c3', GOLD = '#ffa600';
const D2R = Math.PI / 180;
const kinds: Kind[] = ['plans', 'schedule', 'accounts', 'clients'];
const DOC_SCALE = .42;

type Pose = { p: [number, number, number]; r: [number, number, number] };
const desk: Pose[] = [
  { p: [1.3, -1.3, 1], r: [-.08, .14, .2] },
  { p: [1.78, -1.12, 1.12], r: [-.06, .1, -.16] },
  { p: [1.42, -1.62, 1.24], r: [-.1, .16, .07] },
  { p: [1.95, -1.55, 1.36], r: [-.08, .12, -.24] },
];
const withExpert: Pose[] = kinds.map((_, i) => ({ p: [-.78 + i * .44, -1.5 + (i % 2) * .08, .95 + i * .07], r: [0, 0, .12 - i * .07] }));
const done: Pose[] = kinds.map((_, i) => ({ p: [.45 + i * .5, -1.45, 1.2 + i * .06], r: [0, 0, -.05 + i * .03] }));
const stages = [desk, withExpert, done];

export const captions = [
  { kicker: 'Your desk', text: 'Too much on your plate.' },
  { kicker: 'Seattle → Philippines', text: 'Your Expert takes it on, in your hours.' },
  { kicker: 'Daily report', text: 'Done, and off your list.' },
];

// Globe, oriented so the Pacific between Seattle and the Philippines faces the camera.
const R = 2.05;
const GLOBE_AT: [number, number, number] = [.15, .55, -1.4];
const onGlobe = (lat: number, lon: number, r = R) => new THREE.Vector3(Math.cos(lat * D2R) * Math.sin(lon * D2R) * r, Math.sin(lat * D2R) * r, Math.cos(lat * D2R) * Math.cos(lon * D2R) * r);
const SEATTLE = onGlobe(47.6, -122.3), PHILIPPINES = onGlobe(14.6, 121);

function arc(from: THREE.Vector3, to: THREE.Vector3) {
  const a = from.clone().normalize(), turn = new THREE.Quaternion().setFromUnitVectors(a, to.clone().normalize());
  const points = Array.from({ length: 65 }, (_, i) => {
    const t = i / 64;
    return a.clone().applyQuaternion(new THREE.Quaternion().slerp(turn, t)).multiplyScalar(R * (1 + .3 * Math.sin(Math.PI * t)));
  });
  return new THREE.CatmullRomCurve3(points);
}

function textTexture(width: number, height: number, draw: (c: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  draw(canvas.getContext('2d')!);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function City({ at, label, pulse }: { at: THREE.Vector3; label: string; pulse: RefObject<THREE.Mesh | null> }) {
  const tag = useMemo(() => textTexture(256, 64, c => { c.fillStyle = '#dbe8f2'; c.font = '600 30px sans-serif'; c.textAlign = 'center'; c.fillText(label, 128, 42); }), [label]);
  const facing = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), at.clone().normalize()), [at]);
  useEffect(() => () => tag.dispose(), [tag]);
  return <group position={at}>
    <mesh><sphereGeometry args={[.07, 16, 16]}/><meshBasicMaterial color={GOLD}/></mesh>
    <mesh ref={pulse} quaternion={facing}><ringGeometry args={[.1, .13, 32]}/><meshBasicMaterial color={GOLD} transparent opacity={.6} side={THREE.DoubleSide}/></mesh>
    <sprite position={at.clone().normalize().multiplyScalar(.32).add(new THREE.Vector3(0, .2, 0))} scale={[1, .25, 1]}><spriteMaterial map={tag} transparent depthWrite={false}/></sprite>
  </group>;
}

function Globe({ packet, pulses }: { packet: RefObject<THREE.Mesh | null>; pulses: RefObject<THREE.Mesh | null>[] }) {
  const dots = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute((globePoints as number[]).map(v => v * R), 3)), []);
  const route = useMemo(() => new THREE.TubeGeometry(arc(SEATTLE, PHILIPPINES), 96, .018, 8, false), []);
  useEffect(() => () => { dots.dispose(); route.dispose(); }, [dots, route]);
  return <group position={GLOBE_AT} rotation={[31 * D2R, 0, 0]}>
    <group rotation={[0, -179.35 * D2R, 0]}>
      <mesh><sphereGeometry args={[R * .985, 48, 32]}/><meshBasicMaterial color="#012b52"/></mesh>
      <points geometry={dots}><pointsMaterial color={ICE} size={.035} transparent opacity={.75}/></points>
      <mesh geometry={route}><meshBasicMaterial color={GOLD} transparent opacity={.8}/></mesh>
      <City at={SEATTLE} label="Seattle" pulse={pulses[0]}/>
      <City at={PHILIPPINES} label="Philippines" pulse={pulses[1]}/>
      <mesh ref={packet} position={SEATTLE}><sphereGeometry args={[.075, 16, 16]}/><meshBasicMaterial color="#ffd27a"/></mesh>
    </group>
  </group>;
}

function ExpertCard() {
  const photo = useTexture('/team/loury.png', texture => { texture.colorSpace = THREE.SRGBColorSpace; });
  const label = useMemo(() => textTexture(512, 170, c => {
    c.fillStyle = NAVY; c.font = 'bold 64px sans-serif'; c.fillText('Loury', 24, 74);
    c.fillStyle = GOLD; c.fillRect(26, 98, 46, 6);
    c.fillStyle = '#597180'; c.font = '34px sans-serif'; c.fillText('Your Expert', 88, 112);
  }), []);
  useEffect(() => () => label.dispose(), [label]);
  return <group position={[-1.95, -1.5, .9]} rotation={[0, .12, .03]}>
    <RoundedBox args={[1.42, 1.84, .08]} radius={.06} smoothness={3} castShadow><meshStandardMaterial color="#f5f6f4" roughness={.6}/></RoundedBox>
    <mesh position={[0, .2, .045]}><planeGeometry args={[1.26, 1.26]}/><meshBasicMaterial map={photo} toneMapped={false}/></mesh>
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

function Assembly({ paused, reduced, onStage }: { paused: boolean; reduced: boolean; onStage: (stage: number) => void }) {
  const root = useRef<THREE.Group>(null);
  const docs = useRef<(THREE.Group | null)[]>([]);
  const badges = useRef<(THREE.Mesh | null)[]>([]);
  const packet = useRef<THREE.Mesh>(null);
  const pulses = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  const route = useMemo(() => arc(SEATTLE, PHILIPPINES), []);
  const { viewport, invalidate, gl } = useThree();
  const progress = useRef(0), wanted = useRef(0), stage = useRef(-1);
  const pointer = useRef({ x: 0, y: 0 });
  const inView = useRef(true);
  const still = reduced || paused;

  useEffect(() => {
    const scroll = () => {
      const section = document.getElementById('work-story');
      const chapters = section ? Array.from(section.querySelectorAll<HTMLElement>('.story-chapter')) : [];
      if (section && chapters.length >= 3) {
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
    // The looping route animation only runs while the scene is on screen.
    const observer = new IntersectionObserver(([entry]) => { inView.current = entry.isIntersecting; invalidate(); });
    observer.observe(gl.domElement);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', scroll);
    window.addEventListener('pointermove', move, { passive: true });
    scroll();
    return () => { observer.disconnect(); window.removeEventListener('scroll', scroll); window.removeEventListener('resize', scroll); window.removeEventListener('pointermove', move); };
  }, [invalidate, gl]);
  useEffect(() => { invalidate(); }, [still, invalidate]);

  useFrame(({ clock }, delta) => {
    if (!root.current) return;
    const speed = still ? 1 : 1 - Math.exp(-THREE.MathUtils.clamp(delta, 0, .05) * 6);
    progress.current = THREE.MathUtils.lerp(progress.current, wanted.current, speed);
    const p = still ? Math.round(progress.current) : progress.current;
    const now = p < .5 ? 0 : p < 1.5 ? 1 : 2;
    if (now !== stage.current) { stage.current = now; onStage(now); }

    root.current.scale.setScalar(Math.min(viewport.width / 6.4, viewport.height / 6.2));
    const tilt = still ? 0 : 1;
    root.current.rotation.set(-.05 + pointer.current.y * .04 * tilt, -.1 + pointer.current.x * .08 * tilt, 0);

    // Each document flies over the globe between poses, a little after the one before it.
    const segment = Math.min(1, Math.floor(p)), f = p - segment;
    docs.current.forEach((doc, i) => {
      if (!doc) return;
      const t = smooth(THREE.MathUtils.clamp((f - i * .1) / .7, 0, 1));
      const a = stages[segment][i], b = stages[segment + 1][i];
      const lift = [0, 1.7, .6];
      doc.position.set(...([0, 1, 2].map(n => bezier(a.p[n], (a.p[n] + b.p[n]) / 2 + lift[n], b.p[n], t)) as [number, number, number]));
      doc.rotation.set(...([0, 1, 2].map(n => THREE.MathUtils.lerp(a.r[n], b.r[n], t)) as [number, number, number]));
      const tick = segment === 1 ? smooth(THREE.MathUtils.clamp((f - .55 - i * .08) / .25, 0, 1)) : 0;
      badges.current[i]?.scale.setScalar(tick);
    });

    // A light travels the route: out to the Philippines, then back once the work is done.
    const loop = !still && inView.current;
    if (packet.current) {
      const along = loop ? (clock.elapsedTime % 2.6) / 2.6 : .5;
      packet.current.position.copy(route.getPoint(p > 1.5 ? 1 - along : along));
    }
    pulses.forEach((pulse, i) => {
      if (!pulse.current) return;
      const beat = loop ? ((clock.elapsedTime + i * 1.3) % 2.6) / 2.6 : 0;
      pulse.current.scale.setScalar(1 + beat * 1.6);
      (pulse.current.material as THREE.MeshBasicMaterial).opacity = .6 * (1 - beat);
    });

    if (loop || Math.abs(wanted.current - progress.current) > .001) invalidate();
  });

  return <group ref={root}>
    <Globe packet={packet} pulses={pulses}/>
    <Suspense fallback={null}><ExpertCard/></Suspense>
    {kinds.map((kind, i) => <group key={kind} ref={el => { docs.current[i] = el; }} position={desk[i].p} rotation={desk[i].r} scale={DOC_SCALE}>
      <WorkDocument kind={kind}/>
      <Badge badge={el => { badges.current[i] = el; }}/>
    </group>)}
  </group>;
}

export default function HandoffCanvas({ paused }: { paused: boolean }) {
  const [reduced, setReduced] = useState(true);
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState(0);
  // Touch devices and narrow screens get a lighter render: lower pixel density and no shadows.
  const [lite] = useState(() => window.matchMedia('(max-width: 900px), (pointer: coarse)').matches);
  useEffect(() => { const query = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(query.matches); update(); query.addEventListener('change', update); return () => query.removeEventListener('change', update); }, []);
  return <div className="handoff-scene">
    <Canvas className={ready ? 'folio-canvas is-ready' : 'folio-canvas'} onCreated={() => setReady(true)} shadows={lite ? false : 'soft'} frameloop="demand" dpr={[1, lite ? 1.25 : 1.6]} camera={{ position: [0, 0, 10], fov: 37, near: .1, far: 50 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} style={{ touchAction: 'pan-y' }}>
      <ambientLight intensity={.95}/>
      <directionalLight position={[-4, 6, 7]} intensity={2.1} color="#fff4df" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-bias={-.0005}/>
      <directionalLight position={[4, 1, 4]} intensity={1.5} color="#afdfff"/>
      <directionalLight position={[0, -3, 4]} intensity={.4} color={ICE}/>
      <Assembly paused={paused} reduced={reduced} onStage={setStage}/>
    </Canvas>
    <p className="handoff-caption" key={stage}><span>{captions[stage].kicker}</span>{captions[stage].text}</p>
  </div>;
}
