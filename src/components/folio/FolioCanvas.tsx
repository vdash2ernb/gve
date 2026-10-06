"use client";

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { WorkDomain } from '@/content/domains';

// Original GVE work folio. Every mesh and surface is generated here.
// No models, scene code, textures, or materials from the port-3000 site.
const NAVY = '#00203d', BLUE = '#003870', ICE = '#79a7c3', GOLD = '#ffa600';
type Kind = 'plans' | 'schedule' | 'accounts' | 'clients' | 'marketing' | 'digital' | 'logistics';
type Pose = [number, number, number, number, number, number];
const names: Kind[] = ['plans', 'schedule', 'accounts', 'clients'];

function makeSurface(kind: Kind) {
  const canvas = document.createElement('canvas');
  canvas.width = 768; canvas.height = 1024;
  const c = canvas.getContext('2d')!;
  const dark = ['plans', 'schedule', 'digital'].includes(kind);
  c.fillStyle = dark ? BLUE : '#f5f6f4'; c.fillRect(0, 0, 768, 1024);
  const ink = dark ? '#ecf5fc' : NAVY;
  const muted = dark ? '#92b5d2' : '#597180';
  c.fillStyle = GOLD; c.fillRect(54, 62, 48, 6);
  c.fillStyle = ink; c.font = '500 24px sans-serif';
  c.fillText('GLOBAL VIRTUAL EXPERTS', 54, 114);
  c.font = 'bold 59px sans-serif';
  c.fillText({ plans: 'PROJECT PLANS', schedule: 'TASKS & DATES', accounts: 'BOOKKEEPING', clients: 'FOLLOW-UPS', marketing: 'MARKETING', digital: 'YOUR WEBSITE', logistics: 'DISPATCH' }[kind], 52, 199);
  c.strokeStyle = dark ? '#79a7c355' : '#00203d30'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(54, 237); c.lineTo(714, 237); c.stroke();
  if (kind === 'plans') {
    c.strokeStyle = '#79a7c32d'; c.lineWidth = 1;
    for (let n = 50; n < 740; n += 36) { c.beginPath(); c.moveTo(n, 275); c.lineTo(n, 881); c.stroke(); }
    for (let n = 275; n < 890; n += 36) { c.beginPath(); c.moveTo(50, n); c.lineTo(722, n); c.stroke(); }
    c.strokeStyle = '#d5e7f1'; c.lineWidth = 7;
    c.strokeRect(154, 370, 475, 403);
    c.lineWidth = 4;
    [[154, 577, 385, 577], [385, 370, 385, 773], [385, 610, 629, 610], [478, 370, 478, 487]].forEach(l => { c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.stroke(); });
    c.lineWidth = 2; c.strokeStyle = ICE;
    c.strokeRect(191, 425, 133, 63); c.strokeRect(421, 651, 150, 69);
    c.beginPath(); c.arc(383, 578, 61, Math.PI, Math.PI * 1.5); c.stroke();
    c.fillStyle = '#b4d0df'; c.font = '22px monospace'; c.fillText('PLAN / DIMENSIONS / REVISIONS', 54, 941);
  } else if (kind === 'schedule') {
    ['Update the schedule', 'Coordinate vendors', 'Track milestones'].forEach((s, i) => {
      const y = 333 + i * 173;
      c.fillStyle = '#164c7e'; c.fillRect(53, y - 43, 659, 136);
      c.fillStyle = GOLD; c.font = 'bold 32px sans-serif'; c.fillText(`0${i + 1}`, 83, y + 6);
      c.fillStyle = ink; c.font = '32px sans-serif'; c.fillText(s, 165, y + 6);
      c.fillStyle = ICE; c.fillRect(165, y + 32, 320 - i * 51, 6);
    });
    c.fillStyle = GOLD; c.fillRect(54, 902, 660, 6);
  } else if (kind === 'accounts') {
    c.fillStyle = muted; c.font = '26px sans-serif'; c.fillText('Monthly accounts', 54, 306);
    ['Invoices', 'Expenses', 'Reconciliation'].forEach((s, i) => {
      const y = 408 + i * 123;
      c.fillStyle = NAVY; c.font = '32px sans-serif'; c.fillText(s, 54, y);
      c.fillStyle = '#d6e1e5'; c.fillRect(54, y + 32, 659, 2);
      c.strokeStyle = BLUE; c.lineWidth = 3; c.strokeRect(663, y - 30, 28, 28);
    });
    [90, 151, 118, 218, 267, 326].forEach((h, i) => { c.fillStyle = i === 5 ? GOLD : BLUE; c.fillRect(65 + 107 * i, 952 - h * .58, 59, h * .58); });
  } else if (kind === 'marketing') {
    c.fillStyle = muted; c.font = '26px sans-serif'; c.fillText('Brand colors and marketing assets', 54, 308);
    [NAVY, BLUE, ICE, GOLD].forEach((color, i) => { c.fillStyle = color; c.fillRect(54 + i * 165, 374, 151, 208); });
    c.fillStyle = NAVY; c.font = 'bold 69px sans-serif'; c.fillText('Brand assets', 54, 710);
    c.font = '32px sans-serif'; c.fillText('Graphics, posts, and campaigns', 54, 772);
    c.fillStyle = GOLD; c.fillRect(54, 916, 658, 7);
  } else if (kind === 'digital') {
    c.fillStyle = '#eff4f6'; c.fillRect(54, 311, 660, 587);
    c.fillStyle = ICE; c.fillRect(54, 311, 660, 57);
    [80, 102, 124].forEach(x => { c.fillStyle = NAVY; c.beginPath(); c.arc(x, 339, 5, 0, Math.PI * 2); c.fill(); });
    c.fillStyle = NAVY; c.fillRect(81, 405, 607, 217);
    c.fillStyle = '#eff4f6'; c.font = 'bold 47px sans-serif'; c.fillText('Website', 116, 481); c.fillText('maintenance', 116, 543);
    c.fillStyle = GOLD; c.fillRect(118, 574, 126, 13);
    [81, 291, 501].forEach(x => { c.fillStyle = '#cadce7'; c.fillRect(x, 663, 186, 176); });
  } else if (kind === 'logistics') {
    c.fillStyle = muted; c.font = '26px sans-serif'; c.fillText('Drivers, deliveries, and updates', 54, 304);
    c.strokeStyle = '#d7e1e8'; c.lineWidth = 2;
    for (let x = 54; x < 715; x += 55) { c.beginPath(); c.moveTo(x, 357); c.lineTo(x, 870); c.stroke(); }
    for (let y = 357; y < 871; y += 55) { c.beginPath(); c.moveTo(54, y); c.lineTo(714, y); c.stroke(); }
    c.strokeStyle = BLUE; c.lineWidth = 14; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(164, 742); c.lineTo(164, 522); c.lineTo(439, 522); c.lineTo(439, 687); c.lineTo(604, 687); c.lineTo(604, 412); c.stroke();
    [[164,742],[439,522],[604,412]].forEach(([x,y],i) => { c.fillStyle = i === 2 ? GOLD : BLUE; c.beginPath(); c.arc(x, y, 21, 0, Math.PI * 2); c.fill(); });
    c.fillStyle = NAVY; c.font = '24px sans-serif'; c.fillText('ROUTES / SHIPMENTS / STATUS', 54, 943);
  } else {
    ['Client enquiries', 'Calendar & inbox', 'Customer updates'].forEach((s, i) => {
      const y = 350 + i * 190;
      c.fillStyle = '#deE8ee'; c.beginPath(); c.arc(103, y, 48, 0, Math.PI * 2); c.fill();
      c.fillStyle = BLUE; c.font = 'bold 30px sans-serif'; c.fillText(`0${i + 1}`, 85, y + 11);
      c.fillStyle = NAVY; c.font = '32px sans-serif'; c.fillText(s, 184, y - 3);
      c.fillStyle = '#79a7c3'; c.fillRect(184, y + 30, 355 - i * 35, 7);
      c.fillStyle = '#dce4e9'; c.fillRect(184, y + 49, 278, 5);
    });
    c.fillStyle = GOLD; c.fillRect(54, 924, 660, 7);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function Box({ size, at = [0, 0, 0], color, metal = 0, rough = .42 }: { size: [number, number, number]; at?: [number, number, number]; color: string; metal?: number; rough?: number }) {
  return <RoundedBox args={size} position={at} radius={Math.min(.065, size[2] / 3)} smoothness={3} bevelSegments={2} castShadow receiveShadow>
    <meshStandardMaterial color={color} metalness={metal} roughness={rough}/>
  </RoundedBox>;
}

function WorkDocument({ kind }: { kind: Kind }) {
  const surface = useMemo(() => makeSurface(kind), [kind]);
  useEffect(() => () => surface.dispose(), [surface]);
  const dark = ['plans', 'schedule', 'digital'].includes(kind);
  return <group>
    <Box size={[2.45, 3.28, .16]} color={dark ? NAVY : ICE} metal={.35} rough={.28}/>
    <Box size={[2.31, 3.12, .085]} at={[0, 0, .104]} color={dark ? BLUE : '#e8ece9'}/>
    <mesh position={[0, 0, .151]} receiveShadow><planeGeometry args={[2.24, 2.986]}/><meshStandardMaterial map={surface} roughness={.8}/></mesh>
    <Box size={[.55, .22, .13]} at={[0, 1.57, .15]} color={GOLD} metal={.78} rough={.23}/>
    <Box size={[.39, .055, .045]} at={[0, 1.61, .234]} color={'#ffcf62'} metal={.85} rough={.22}/>
    {/* Raised drawing lines catch the light on the architectural sheet. */}
    {kind === 'plans' && <group position={[0, -.18, .2]}>
      {[[-.69, 0, .025, 1.12], [.69, 0, .025, 1.12], [0, .56, 1.4, .025], [0, -.56, 1.4, .025], [0, 0, .025, 1.12], [-.36, 0, .68, .025], [.35, -.1, .68, .025]].map((v, i) => <Box key={i} at={[v[0], v[1], 0]} size={[v[2], v[3], .065]} color={'#b6d1df'} metal={.28}/>)}
    </group>}
    {kind === 'marketing' && <group position={[0, .1, .21]}>{[NAVY, BLUE, ICE, GOLD].map((color, i) => <Box key={color} size={[.4, .54, .055 + i * .02]} at={[-.72 + i * .48, 0, i * .015]} color={color} rough={.3}/>)}</group>}
    {kind === 'logistics' && [[-.64,-.67],[.16,-.02],[.65,.31]].map(([x,y],i)=><mesh key={i} position={[x,y,.23]}><cylinderGeometry args={[.065,.065,.12,24]}/><meshStandardMaterial color={i===2?GOLD:ICE} metalness={.7} roughness={.28}/></mesh>)}
    <Box size={[.045, 2.95, .035]} at={[-1.13, 0, .07]} color={ICE} metal={.6}/>
  </group>;
}

// Poses are independently authored in viewport space; scroll interpolates both
// the documents and their parent, so reverse scrolling is equally continuous.
const poses: Pose[][] = [
  [[-.14, .05, 1.1, -.025, 0, -.07], [.64, .58, .15, .02, .01, .035], [-.72, -.27, -.8, 0, -.01, .07], [1, -.94, 2.1, .02, 0, -.035]],
  [[-1.5, 1.8, 1.1, .025, 0, -.035], [1.5, 1.8, .15, -.02, .01, .035], [-1.5, -1.8, -.8, .01, -.01, -.025], [1.5, -1.8, 2.1, -.02, 0, .025]],
  [[-.1, 0, 1.1, 0, 0, -.02], [.28, .38, .15, 0, 0, .025], [-.32, -.27, -.8, 0, 0, -.035], [.8, -.82, 2.1, 0, 0, -.02]],
];
function Assembly({ mode, selected, paused, reduced }: { mode: 'story' | 'object'; selected: WorkDomain; paused: boolean; reduced: boolean }) {
  const root = useRef<THREE.Group>(null);
  const documents = useRef<(THREE.Group | null)[]>([]);
  const { viewport, invalidate } = useThree();
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const wanted = useRef(0);
  const active = 0;
  const frontKind: Kind = selected === 'finance' ? 'accounts' : selected === 'projects' ? 'schedule' : selected;

  useEffect(() => {
    const scroll = () => {
      const section = document.getElementById('work-story');
      if (section && mode === 'story') {
        const r = section.getBoundingClientRect();
        const chapters = Array.from(section.querySelectorAll<HTMLElement>('.story-chapter'));
        if (chapters.length < 3) return;
        const offsets = chapters.map(chapter => chapter.offsetTop);
        const y = Math.max(0, -r.top);
        const interval = y < offsets[1] ? 0 : 1;
        const next = interval + (y - offsets[interval]) / Math.max(1, offsets[interval + 1] - offsets[interval]);
        wanted.current = Number.isFinite(next) ? THREE.MathUtils.clamp(next, 0, 2) : 0;
      } else wanted.current = 0;
      invalidate();
    };
    // Only a mouse tilts the folio; on touch screens the last finger position would leave it tilted.
    const move = (e: PointerEvent) => { if (e.pointerType !== 'mouse') return; pointer.current = { x: e.clientX / window.innerWidth - .5, y: e.clientY / window.innerHeight - .5 }; if (!reduced && !paused) invalidate(); };
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', scroll);
    window.addEventListener('pointermove', move, { passive: true }); scroll();
    return () => { window.removeEventListener('scroll', scroll); window.removeEventListener('resize', scroll); window.removeEventListener('pointermove', move); };
  }, [mode, reduced, paused, invalidate]);
  useEffect(() => { invalidate(); }, [selected, paused, reduced, invalidate]);

  useFrame((_, delta) => {
    if (!root.current) return;
    const speed = reduced || paused ? 1 : 1 - Math.exp(-THREE.MathUtils.clamp(delta, 0, .05) * 6);
    progress.current = THREE.MathUtils.clamp(THREE.MathUtils.lerp(Number.isFinite(progress.current) ? progress.current : 0, wanted.current, speed), 0, 2);
    const p = reduced || paused ? Math.round(progress.current) : progress.current;
    const index = Math.min(1, Math.floor(p)); const mix = THREE.MathUtils.smoothstep(p - index, 0, 1);
    const swap = Math.sin(Math.min(p, 2) * Math.PI * .5);
    const scale = mode === 'object' ? Math.min(viewport.width / 5.8, viewport.height / 5.1) : Math.min(viewport.width / 5.4, viewport.height / 6.5) * (1 - swap * .26);
    root.current.position.set(0, -.08, 0);
    root.current.scale.setScalar(scale);
    const rx = -.08 + (reduced || paused ? 0 : pointer.current.y * .04);
    const ry = -.16 + swap * .25 + (reduced || paused ? 0 : pointer.current.x * .08);
    let needsFrame = Math.abs(wanted.current - progress.current) > .001 || Math.abs(root.current.rotation.x - rx) > .001 || Math.abs(root.current.rotation.y - ry) > .001;
    root.current.rotation.set(THREE.MathUtils.lerp(root.current.rotation.x, rx, speed), THREE.MathUtils.lerp(root.current.rotation.y, ry, speed), -.02);
    documents.current.forEach((doc, i) => {
      if (!doc) return;
      const a = poses[index][i], b = poses[index + 1][i];
      const solo = mode === 'object';
      const target: Pose = solo ? [i === active ? 0 : (i - 1.5) * .37, i === active ? 0 : .1, i === active ? 1.1 : -.85 - i * .55, 0, 0, i === active ? -.08 : (i - 1.5) * .07] : a.map((v, n) => THREE.MathUtils.lerp(v, b[n], mix)) as Pose;
      const targetScale = i === 3 && !solo ? .72 : 1;
      const z = target[2];
      needsFrame ||= Math.abs(doc.position.z - z) > .001 || Math.abs(doc.position.x - target[0]) > .001 || Math.abs(doc.rotation.z - target[5]) > .001 || Math.abs(doc.position.y - target[1]) > .001;
      doc.position.lerp(targetPosition.set(target[0], target[1], z), speed);
      doc.rotation.set(THREE.MathUtils.lerp(doc.rotation.x, target[3], speed), THREE.MathUtils.lerp(doc.rotation.y, target[4], speed), THREE.MathUtils.lerp(doc.rotation.z, target[5], speed));
      doc.scale.setScalar(targetScale);
    });
    if (needsFrame) invalidate();
  });
  return <group ref={root}>
    {names.map((kind, i) => <group key={kind} position={mode === 'object' ? [i === 0 ? 0 : (i - 1.5) * .37, i === 0 ? 0 : .1, i === 0 ? 1.1 : -.85 - i * .55] : poses[0][i].slice(0, 3) as [number, number, number]} rotation={mode === 'object' ? [0, 0, i === 0 ? -.08 : (i - 1.5) * .07] : poses[0][i].slice(3) as [number, number, number]} ref={el => { documents.current[i] = el; }}><WorkDocument kind={mode === 'object' && i === active ? frontKind : kind}/></group>)}
  </group>;
}

export default function FolioCanvas({ mode, selected, paused }: { mode: 'story' | 'object'; selected: WorkDomain; paused: boolean }) {
  const [reduced, setReduced] = useState(true);
  const [ready, setReady] = useState(false);
  // Touch devices and narrow screens get a lighter render: lower pixel density and a smaller shadow map.
  const [lite] = useState(() => window.matchMedia('(max-width: 900px), (pointer: coarse)').matches);
  useEffect(() => { const query = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(query.matches); update(); query.addEventListener('change', update); return () => query.removeEventListener('change', update); }, []);
  return <Canvas className={ready ? 'folio-canvas is-ready' : 'folio-canvas'} onCreated={() => setReady(true)} shadows="soft" frameloop="demand" dpr={[1, lite ? 1.25 : 1.6]} camera={{ position: [0, 0, 10], fov: 37, near: .1, far: 50 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} style={{ touchAction: 'pan-y' }}>
    <ambientLight intensity={.95}/>
    <directionalLight position={[-4, 6, 7]} intensity={2.1} color="#fff4df" castShadow shadow-mapSize={lite ? [512, 512] : [1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-bias={-.0005}/>
    <directionalLight position={[4, 1, 4]} intensity={1.5} color="#afdfff"/>
    <directionalLight position={[0, -3, 4]} intensity={.4} color="#79a7c3"/>
    <Assembly mode={mode} selected={selected} paused={paused} reduced={reduced}/>
  </Canvas>;
}
