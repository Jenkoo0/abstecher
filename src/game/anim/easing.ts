/** Kurven für Tweens. Reine Zahlen, kein Objekt aus der Szene. */

export function clamp01(t: number) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t;
}

export function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

export function easeLinear(t: number) {
  return clamp01(t);
}

export function easeInQuad(t: number) {
  const x = clamp01(t);
  return x * x;
}

export function easeOutCubic(t: number) {
  const x = clamp01(t);
  return 1 - (1 - x) ** 3;
}

export function easeInOutCubic(t: number) {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

/** Leichtes Überschießen, gut für Landung und Banner. */
export function easeOutBack(t: number) {
  const x = clamp01(t);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
}
