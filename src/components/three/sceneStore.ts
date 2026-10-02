import type { ShapeName } from "./shapes";

export type Stage = {
  shape: ShapeName;
  /** Offsets and scale on wide screens, in world units. */
  x?: number;
  y?: number;
  scale?: number;
  /** Phone overrides. Default: centered, smaller. */
  mx?: number;
  my?: number;
  mscale?: number;
  /** Group rotation. See VIEW in shapes.ts for globe presets. */
  rotY?: number;
  rotX?: number;
  /** Gentle idle sway, in radians. */
  sway?: number;
  /** Dim the drawing behind dense text. */
  dim?: number;
  /** Show the land dots on the globe. */
  land?: boolean;
  /** Which node labels to show. Default "key". */
  labels?: "none" | "key" | "all";
  /** Highlight one service (matches a service slug). */
  focus?: string;
};

// Pages declare their stages; the persistent canvas reads them every frame.
export const sceneStore: { stages: Stage[]; focus: string | null } = {
  stages: [{ shape: "globe" }],
  focus: null,
};

export function setStages(stages: Stage[]) {
  sceneStore.stages = stages;
}

/** Hovering a service card lights its line in the drawing. */
export function setFocus(id: string | null) {
  sceneStore.focus = id;
}

/** DOM elements for node labels, registered by <SceneLabels /> and positioned by the canvas. */
export const labelEls: (HTMLElement | null)[] = [];
