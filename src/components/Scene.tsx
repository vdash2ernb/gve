"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { setStages, type Stage } from "./three/sceneStore";

const ParticleField = dynamic(() => import("./three/ParticleField"), { ssr: false });

/** The one WebGL canvas, mounted once in the root layout. */
export function SceneCanvas() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <ParticleField />
    </div>
  );
}

/** Each page tells the canvas which shapes to move through as you scroll. */
export function SceneStages({ stages }: { stages: Stage[] }) {
  const key = JSON.stringify(stages);
  useEffect(() => {
    setStages(JSON.parse(key));
  }, [key]);
  return null;
}
