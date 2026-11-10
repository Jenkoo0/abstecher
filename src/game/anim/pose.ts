/**
 * Sichtbare Pose für Slide und Dash.
 *
 * Andocken in view3d: `pitch` und `roll` als Rotation der Figur,
 * `offsetY` als lokaler Versatz, `heightScale` zusätzlich zur Hitbox.
 * Die Hitbox-Höhe kommt aus `slideDash.heightScale`, nicht von hier.
 * Reduced motion blendet nicht ein, sondern stellt eine kleine, stille Pose.
 */

import type { SlideMode } from "../feel/slideDash";
import { clamp01, easeOutCubic, lerp } from "./easing";

export type LocomotionPose = {
  pitch: number;
  roll: number;
  heightScale: number;
  offsetY: number;
  stretchZ: number;
};

const STAND: LocomotionPose = { pitch: 0, roll: 0, heightScale: 1, offsetY: 0, stretchZ: 1 };

export function locomotionPose(input: {
  mode: SlideMode;
  modeMs: number;
  reducedMotion?: boolean;
}): LocomotionPose {
  if (input.mode === "free") return STAND;

  if (input.reducedMotion) {
    if (input.mode === "slide") {
      return { pitch: 0.12, roll: 0, heightScale: 0.72, offsetY: -0.15, stretchZ: 1 };
    }
    return STAND;
  }

  const blendMs = input.mode === "slide" ? 140 : 100;
  const t = easeOutCubic(clamp01(input.modeMs / blendMs));

  if (input.mode === "slide") {
    return {
      pitch: lerp(0, 1.05, t),
      roll: 0,
      heightScale: lerp(1, 0.55, t),
      offsetY: lerp(0, -0.42, t),
      stretchZ: 1,
    };
  }

  return {
    pitch: lerp(0, 0.32, t),
    roll: lerp(0, 0.1, t),
    heightScale: lerp(1, 0.94, t),
    offsetY: 0,
    stretchZ: lerp(1, 1.2, t),
  };
}
