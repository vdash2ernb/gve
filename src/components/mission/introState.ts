import { useSyncExternalStore } from "react";

// Whether the first-visit intro is covering the homepage, so the homepage 3D can pause meanwhile.
let open = false;
const subscribers = new Set<() => void>();

export function setIntroOpen(next: boolean) {
  if (open === next) return;
  open = next;
  subscribers.forEach((fn) => fn());
}

const subscribe = (fn: () => void) => {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
};

export const useIntroOpen = () => useSyncExternalStore(subscribe, () => open, () => false);
