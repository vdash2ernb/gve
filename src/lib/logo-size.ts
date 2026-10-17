// Every logo gets about the same visual area, so wide wordmarks and square badges read as
// equally weighted: height = sqrt(area / aspect ratio), within a height and width limit.
const AREA = 5800, MAX_HEIGHT = 74, MAX_WIDTH = 176;
export function logoSize(width: number, height: number) {
  const aspect = width / height;
  let h = Math.min(MAX_HEIGHT, Math.sqrt(AREA / aspect));
  if (h * aspect > MAX_WIDTH) h = MAX_WIDTH / aspect;
  return { width: Math.round(h * aspect), height: Math.round(h) };
}
