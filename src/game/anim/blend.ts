/**
 * Übergang zwischen Lauf, Sprung, Slide, Dash und Landung.
 *
 * Einbau in view3d: Gewichte auf die Posen legen, `anticipationAmount`
 * als kurzes In-die-Knie vor dem Absprung, `followThroughOffset` als
 * Nachschwung in Metern. Reduced Motion springt auf die Zielpose und
 * lässt Antizipation und Nachschwung aus. Die Zeit ist normalisiert,
 * also unabhängig von der Framerate.
 */

import { clamp01, easeInOutCubic } from "./easing";

export type Loco = "idle" | "run" | "jump" | "slide" | "dash" | "land";

export function blendPair(from: Loco, to: Loco, t: number, reducedMotion = false) {
  if (reducedMotion || from === to) return { from: 0, to: 1 };
  const weight = easeInOutCubic(clamp01(t));
  return { from: 1 - weight, to: weight };
}

/** 0..1, nur im ersten Fünftel der Bewegung, sonst 0. */
export function anticipationAmount(t: number, reducedMotion = false) {
  if (reducedMotion) return 0;
  const x = clamp01(t);
  if (x >= 0.2) return 0;
  return Math.sin((x / 0.2) * Math.PI);
}

/** Nachschwung in Metern. An den Rändern 0, damit die Pose sauber endet. */
export function followThroughOffset(t: number, reducedMotion = false) {
  if (reducedMotion) return 0;
  const x = clamp01(t);
  if (x === 0 || x === 1) return 0;
  return Math.sin(x * Math.PI) * (1 - x) * 0.22;
}
