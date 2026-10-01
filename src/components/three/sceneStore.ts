import type { ShapeName } from "./shapes";

export type Stage = {
  shape: ShapeName;
  /** Horizontal offset on wide screens, in world units. */
  x?: number;
  y?: number;
  scale?: number;
  /** Rotation around Y. The globe uses π so the Pacific faces the viewer. */
  rotY?: number;
  /** Dim the field behind dense text. */
  dim?: number;
};

// Pages declare their stages; the persistent canvas reads them every frame.
export const sceneStore: { stages: Stage[]; version: number } = {
  stages: [{ shape: "sphere" }],
  version: 0,
};

export function setStages(stages: Stage[]) {
  sceneStore.stages = stages;
  sceneStore.version++;
}
