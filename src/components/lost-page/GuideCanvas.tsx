'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { GuideFallback } from './LostPageGuide';

const navy = '#00203d', amber = '#ffa600', skin = '#dcb096', hair = '#263342';
type Point = { x: number; y: number };

function Shape({ size, at, color, radius = .06, rotation = [0, 0, 0] }: {
  size: [number, number, number]; at: [number, number, number]; color: string;
  radius?: number; rotation?: [number, number, number];
}) {
  return <RoundedBox args={size} position={at} rotation={rotation} radius={radius} smoothness={3}>
    <meshStandardMaterial color={color} roughness={.72}/>
  </RoundedBox>;
}

function Ball({ at, size, color }: { at: [number, number, number]; size: [number, number, number]; color: string }) {
  return <mesh position={at} scale={size}><sphereGeometry args={[1, 28, 20]}/><meshStandardMaterial color={color} roughness={.78}/></mesh>;
}

function screenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 300;
  const context = canvas.getContext('2d')!;
  context.fillStyle = navy; context.fillRect(0, 0, 512, 300);
  context.fillStyle = '#183e59'; context.fillRect(0, 0, 512, 38);
  [22, 42, 62].forEach((x, i) => { context.fillStyle = i === 0 ? amber : '#b5c8d5'; context.beginPath(); context.arc(x, 19, 5, 0, Math.PI * 2); context.fill(); });
  context.textAlign = 'center'; context.fillStyle = amber; context.font = '600 126px Poppins, sans-serif'; context.fillText('404', 256, 194);
  context.fillStyle = '#e9f1f6'; context.font = '500 21px Poppins, sans-serif'; context.fillText('PAGE NOT FOUND', 256, 251);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// An original character and workstation, modeled specifically for GVE's 404.
// It uses no imported character, folio meshes, or scene materials.
function Expert({ active, wave, pointer }: { active: boolean; wave: number; pointer: React.RefObject<Point> }) {
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const pupils = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const waveElapsed = useRef(3);
  const texture = useMemo(() => screenTexture(), []);
  const smile = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.16, -.23, .55), new THREE.Vector3(0, -.28, .60), new THREE.Vector3(.16, -.23, .55),
  ]), []);
  const mic = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(.71, -.08, .10), new THREE.Vector3(.59, -.29, .48), new THREE.Vector3(.26, -.29, .67),
  ]), []);
  useEffect(() => () => texture.dispose(), [texture]);
  useEffect(() => { if (wave > 0) waveElapsed.current = 0; }, [wave]);

  useFrame(({ clock }, delta) => {
    if (!active) return;
    const dt = Math.min(delta, .05), time = clock.getElapsedTime();
    const ease = 1 - Math.exp(-dt * 7);
    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, pointer.current.x * .42, ease);
      head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, pointer.current.y * .16, ease);
      head.current.position.y = 1.47 + Math.sin(time * 1.6) * .018;
    }
    if (pupils.current) { pupils.current.position.x = pointer.current.x * .035; pupils.current.position.y = -pointer.current.y * .025; }
    if (eyes.current) {
      const blink = time % 5;
      eyes.current.scale.y = blink > 4.82 ? Math.max(.08, 1 - Math.sin((blink - 4.82) / .18 * Math.PI)) : 1;
    }
    if (body.current) body.current.rotation.y = THREE.MathUtils.lerp(body.current.rotation.y, pointer.current.x * .055, ease);
    waveElapsed.current += dt;
    const progress = Math.min(waveElapsed.current / 2.4, 1), lift = Math.sin(progress * Math.PI);
    if (arm.current) arm.current.rotation.z = .04 + lift * 2.35 + Math.sin(waveElapsed.current * 14) * .14 * lift;
  });

  return <group rotation={[0, -.12, 0]}>
    <mesh position={[0, -1.48, 0]}><cylinderGeometry args={[2.02, 2.02, .08, 64]}/><meshStandardMaterial color="#dbe4ea" roughness={.9}/></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.433, .1]} scale={[1.25, 1, 1]}><circleGeometry args={[1.25, 40]}/><meshBasicMaterial color={navy} transparent opacity={.08} depthWrite={false}/></mesh>
    <Shape size={[3.25, .13, 1.48]} at={[0, -.36, .35]} color="#eaf0f4" radius={.05}/>
    {[-1.30, 1.30].map(x => <Shape key={x} size={[.13, 1.04, .13]} at={[x, -.94, .3]} color="#9ab0bf" radius={.025}/>)}
    <group ref={body}>
      <Shape size={[1.11, 1.08, .65]} at={[0, .36, -.28]} color={navy} radius={.20}/>
      <Shape size={[.98, .76, .16]} at={[0, .22, -.65]} color="#264b66" radius={.07}/>
      <Ball at={[0, .98, -.28]} size={[.19, .23, .19]} color={skin}/>
      <Shape size={[.16, .22, .04]} at={[-.13, .83, .075]} rotation={[0, 0, -.45]} color="#eaf0f4" radius={.015}/>
      <Shape size={[.16, .22, .04]} at={[.13, .83, .075]} rotation={[0, 0, .45]} color="#eaf0f4" radius={.015}/>
      <Shape size={[.13, .16, .035]} at={[.31, .59, .07]} color={amber} radius={.025}/>
      <group position={[-.60, .75, -.26]} rotation={[.12, 0, -.12]}>
        <Ball at={[0, -.22, 0]} size={[.21, .37, .23]} color={navy}/>
        <Ball at={[0, -.61, .18]} size={[.13, .28, .14]} color={skin}/>
        <Ball at={[.10, -.98, .41]} size={[.20, .10, .21]} color={skin}/>
      </group>
      <group ref={arm} position={[.60, .75, -.26]}>
        <Ball at={[0, -.24, 0]} size={[.21, .37, .23]} color={navy}/>
        <Ball at={[0, -.62, .10]} size={[.13, .28, .14]} color={skin}/>
        <Ball at={[0, -.98, .12]} size={[.15, .20, .11]} color={skin}/>
        <Ball at={[-.12, -.94, .16]} size={[.07, .10, .075]} color={skin}/>
      </group>
      <group ref={head} position={[0, 1.47, -.28]}>
        <Ball at={[0, 0, 0]} size={[.58, .65, .55]} color={skin}/>
        {[-.58, .58].map(x => <Ball key={x} at={[x, -.015, -.015]} size={[.12, .17, .10]} color={skin}/>)}
        <mesh position={[0, .10, -.035]} scale={[.98, 1.06, 1]}><sphereGeometry args={[.61, 32, 24, 0, Math.PI * 2, 0, Math.PI * .53]}/><meshStandardMaterial color={hair} roughness={.88}/></mesh>
        <Shape size={[.52, .19, .18]} at={[-.18, .41, .38]} rotation={[0, 0, -.22]} color={hair} radius={.065}/>
        <Shape size={[.28, .17, .12]} at={[.21, .44, .39]} rotation={[0, 0, .20]} color={hair} radius={.055}/>
        <group ref={eyes} position={[0, .09, .51]}>
          {[-.21, .21].map(x => <Ball key={x} at={[x, 0, 0]} size={[.115, .14, .055]} color="#fff8f0"/>)}
          <group ref={pupils}>
            {[-.21, .21].map(x => <Ball key={x} at={[x, 0, .055]} size={[.049, .068, .025]} color={navy}/>)}
          </group>
        </group>
        <Ball at={[0, -.09, .55]} size={[.085, .10, .10]} color={skin}/>
        {[-.21, .21].map(x => <Shape key={x} size={[.18, .033, .038]} at={[x, .285, .50]} rotation={[0, 0, x * .24]} color={hair} radius={.012}/>)}
        <mesh><tubeGeometry args={[smile, 18, .017, 7, false]}/><meshStandardMaterial color="#8e5148" roughness={.8}/></mesh>
        <mesh position={[0, 0, -.035]}><torusGeometry args={[.71, .048, 10, 40, Math.PI]}/><meshStandardMaterial color={navy} roughness={.58}/></mesh>
        {[-.66, .66].map(x => <Shape key={x} size={[.13, .29, .28]} at={[x, -.035, 0]} color={navy} radius={.055}/>)}
        <Shape size={[.022, .11, .13]} at={[.735, -.03, .025]} color={amber} radius={.008}/>
        <mesh><tubeGeometry args={[mic, 18, .025, 7, false]}/><meshStandardMaterial color={navy} roughness={.6}/></mesh>
        <Ball at={[.25, -.29, .68]} size={[.085, .047, .05]} color={navy}/>
      </group>
    </group>
    <group position={[0, .03, .88]} rotation={[-.11, 0, 0]}>
      <Shape size={[1.82, .96, .09]} at={[0, 0, 0]} color="#9ab0bf" radius={.04}/>
      <mesh position={[0, 0, .048]}><planeGeometry args={[1.70, .85]}/><meshBasicMaterial map={texture}/></mesh>
      <Shape size={[2.04, .08, .68]} at={[0, -.46, .15]} color="#b5c8d5" radius={.025}/>
    </group>
    <mesh position={[-1.22, -.12, .48]}><cylinderGeometry args={[.15, .17, .37, 28]}/><meshStandardMaterial color={amber} roughness={.65}/></mesh>
    <mesh position={[-1.44, -.10, .48]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[.115, .033, 8, 20]}/><meshStandardMaterial color={amber} roughness={.65}/></mesh>
  </group>;
}

export default function GuideCanvas({ active, wave }: { active: boolean; wave: number }) {
  const pointer = useRef<Point>({ x: 0, y: 0 });
  useEffect(() => {
    if (!active) return;
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      pointer.current.x = THREE.MathUtils.clamp(event.clientX / window.innerWidth * 2 - 1, -1, 1);
      pointer.current.y = THREE.MathUtils.clamp(event.clientY / window.innerHeight * 2 - 1, -1, 1);
    };
    const reset = () => { pointer.current = { x: 0, y: 0 }; };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
    };
  }, [active]);
  return <Canvas camera={{ position: [4.3, 2.8, 7.4], fov: 35 }} dpr={[1, 1.5]} frameloop={active ? 'always' : 'demand'} fallback={<GuideFallback/>} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}>
    <ambientLight intensity={1.5}/>
    <directionalLight position={[3, 5, 5]} intensity={2.1} color="#fff4e5"/>
    <directionalLight position={[-4, 3, 2]} intensity={1.3} color="#cde2f1"/>
    <Expert active={active} wave={wave} pointer={pointer}/>
  </Canvas>;
}
