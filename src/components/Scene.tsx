"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { labelEls, setFocus, setStages, type Stage } from "./three/sceneStore";

const LineField = dynamic(() => import("./three/LineField"), { ssr: false });

const LABEL_SLOTS = 16;

/** The one WebGL canvas, mounted once in the root layout, plus its node labels. */
export function SceneCanvas() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <LineField />
      {Array.from({ length: LABEL_SLOTS }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            labelEls[i] = el;
          }}
          className="scene-label"
          style={{ opacity: 0 }}
        />
      ))}
    </div>
  );
}

/** Each page tells the canvas which drawings to move through as you scroll. */
export function SceneStages({ stages }: { stages: Stage[] }) {
  const key = JSON.stringify(stages);
  useEffect(() => {
    setStages(JSON.parse(key));
    return () => setFocus(null);
  }, [key]);
  return null;
}
