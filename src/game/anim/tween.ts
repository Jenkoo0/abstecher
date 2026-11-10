/**
 * Tween-Zustand. `step*` liefert den nächsten Zustand und den abgetasteten Wert.
 * Bei reduced motion springt der Tween ans Ziel, statt zu gleiten.
 */

import { easeOutCubic, lerp } from "./easing";

export type Vec3 = { x: number; y: number; z: number };

export type NumberTween = {
  from: number;
  to: number;
  durationMs: number;
  elapsedMs: number;
};

export type Vec3Tween = {
  from: Vec3;
  to: Vec3;
  durationMs: number;
  elapsedMs: number;
};

type TweenOptions = {
  easing?: (t: number) => number;
  reducedMotion?: boolean;
};

export function createNumberTween(from: number, to: number, durationMs: number): NumberTween {
  return { from, to, durationMs: Math.max(1, durationMs), elapsedMs: 0 };
}

export function createVec3Tween(from: Vec3, to: Vec3, durationMs: number): Vec3Tween {
  return { from, to, durationMs: Math.max(1, durationMs), elapsedMs: 0 };
}

function advance(elapsedMs: number, durationMs: number, dtMs: number, reducedMotion: boolean) {
  if (reducedMotion) return durationMs;
  return Math.min(durationMs, elapsedMs + Math.max(0, dtMs));
}

export function stepNumberTween(tween: NumberTween, dtMs: number, options: TweenOptions = {}) {
  const easing = options.easing ?? easeOutCubic;
  const elapsedMs = advance(tween.elapsedMs, tween.durationMs, dtMs, options.reducedMotion === true);
  const t = easing(elapsedMs / tween.durationMs);
  return {
    tween: { ...tween, elapsedMs },
    value: lerp(tween.from, tween.to, t),
    done: elapsedMs >= tween.durationMs,
  };
}

export function stepVec3Tween(tween: Vec3Tween, dtMs: number, options: TweenOptions = {}) {
  const easing = options.easing ?? easeOutCubic;
  const elapsedMs = advance(tween.elapsedMs, tween.durationMs, dtMs, options.reducedMotion === true);
  const t = easing(elapsedMs / tween.durationMs);
  return {
    tween: { ...tween, elapsedMs },
    value: {
      x: lerp(tween.from.x, tween.to.x, t),
      y: lerp(tween.from.y, tween.to.y, t),
      z: lerp(tween.from.z, tween.to.z, t),
    },
    done: elapsedMs >= tween.durationMs,
  };
}
