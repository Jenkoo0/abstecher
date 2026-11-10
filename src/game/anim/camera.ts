/**
 * Kameranachführung und Shake.
 *
 * Andocken in view3d: `position` und `lookAt` auf die Kamera schreiben.
 * Die Nachführung integriert nur `simDtMs`. Im Hitstop (simDt 0) bleibt
 * sie stehen. `shake` kommt aus `tickHitstop` und wird nur auf die Ausgabe
 * addiert, nicht in den Rig gespeichert, sonst wandert die Kamera nach.
 * Reduced motion: kein Shake, und außerhalb des Hitstops sofort aufs Ziel.
 */

export type Vec3 = { x: number; y: number; z: number };

export type CameraRig = {
  x: number;
  y: number;
  z: number;
  lookX: number;
  lookY: number;
  lookZ: number;
};

const FOLLOW_SHARPNESS = 6;

export function createCameraRig(position: Vec3, lookAt: Vec3): CameraRig {
  return {
    x: position.x,
    y: position.y,
    z: position.z,
    lookX: lookAt.x,
    lookY: lookAt.y,
    lookZ: lookAt.z,
  };
}

function follow(from: number, to: number, alpha: number) {
  return from + (to - from) * alpha;
}

export function stepCamera(
  rig: CameraRig,
  input: {
    target: Vec3;
    lookAt: Vec3;
    realDtMs: number;
    simDtMs: number;
    shake: { x: number; y: number; z?: number };
    reducedMotion?: boolean;
  },
) {
  const seconds = Math.max(0, input.simDtMs) / 1000;
  const alpha = seconds <= 0 ? 0 : input.reducedMotion ? 1 : 1 - Math.exp(-FOLLOW_SHARPNESS * seconds);
  const state: CameraRig = {
    x: follow(rig.x, input.target.x, alpha),
    y: follow(rig.y, input.target.y, alpha),
    z: follow(rig.z, input.target.z, alpha),
    lookX: follow(rig.lookX, input.lookAt.x, alpha),
    lookY: follow(rig.lookY, input.lookAt.y, alpha),
    lookZ: follow(rig.lookZ, input.lookAt.z, alpha),
  };
  const shakeX = input.reducedMotion ? 0 : input.shake.x;
  const shakeY = input.reducedMotion ? 0 : input.shake.y;
  const shakeZ = input.reducedMotion ? 0 : (input.shake.z ?? 0);
  return {
    state,
    position: { x: state.x + shakeX, y: state.y + shakeY, z: state.z + shakeZ },
    lookAt: { x: state.lookX, y: state.lookY, z: state.lookZ },
  };
}
