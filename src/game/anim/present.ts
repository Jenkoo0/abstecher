/**
 * Ein Präsentationsschritt über alle Animationsmodule.
 *
 * Andocken, sobald es eine Sim gibt: nach `stepFeel` einmal aufrufen
 * und das Ergebnis an view3d (Figur, Kamera), draw (Staub) und das
 * Durchsagen-Banner geben. Dieses Modul erzeugt keine Meshes.
 */

import type { SlideMode } from "../feel/slideDash";
import { announcementPresentation, type AnnouncementVisual } from "./announceFade";
import { createCameraRig, stepCamera, type CameraRig, type Vec3 } from "./camera";
import { spawnLandingBurst, tickImpulses, type Impulse } from "./impulses";
import { locomotionPose, type LocomotionPose } from "./pose";
import { createSquashState, stepSquash, type SquashScale, type SquashState } from "./squashStretch";

export type PresentationState = {
  squash: SquashState;
  camera: CameraRig;
  dust: Impulse[];
};

export type PresentationFrame = {
  realDtMs: number;
  simDtMs: number;
  player: { x: number; y: number; z: number; vy: number; grounded: boolean; jumped: boolean };
  mode: SlideMode;
  modeMs: number;
  shake: { x: number; y: number };
  banner: { elapsedMs: number; durationMs: number } | null;
  reducedMotion?: boolean;
  landingIntensity?: number;
  rng?: () => number;
};

export function createPresentationState(cameraAt: Vec3, lookAt: Vec3): PresentationState {
  return {
    squash: createSquashState(),
    camera: createCameraRig(cameraAt, lookAt),
    dust: [],
  };
}

export function stepPresentation(state: PresentationState, frame: PresentationFrame) {
  const squash = stepSquash(state.squash, {
    dtMs: frame.simDtMs,
    vy: frame.player.vy,
    grounded: frame.player.grounded,
    jumped: frame.player.jumped,
    reducedMotion: frame.reducedMotion,
  });
  const pose: LocomotionPose = locomotionPose({
    mode: frame.mode,
    modeMs: frame.modeMs,
    reducedMotion: frame.reducedMotion,
  });
  const camera = stepCamera(state.camera, {
    // Augenhöhe 1,6 m, Kamera 6 m hinter der Figur. Shake kommt schon in Metern.
    target: { x: frame.player.x, y: frame.player.y + 1.6, z: frame.player.z + 6 },
    lookAt: { x: frame.player.x, y: frame.player.y + 1.1, z: frame.player.z },
    realDtMs: frame.realDtMs,
    simDtMs: frame.simDtMs,
    shake: { x: frame.shake.x, y: frame.shake.y, z: 0 },
    reducedMotion: frame.reducedMotion,
  });

  const landed = frame.player.grounded && state.squash.wasAirborne && !frame.player.jumped;
  const spawned = landed
    ? spawnLandingBurst({
        x: frame.player.x,
        y: frame.player.y,
        z: frame.player.z,
        intensity: frame.landingIntensity ?? Math.min(1, Math.abs(frame.player.vy) / 12),
        reducedMotion: frame.reducedMotion,
        rng: frame.rng,
      })
    : [];
  const dust = tickImpulses([...state.dust, ...spawned], frame.realDtMs);
  const announcement: AnnouncementVisual = frame.banner
    ? announcementPresentation({
        elapsedMs: frame.banner.elapsedMs,
        durationMs: frame.banner.durationMs,
        reducedMotion: frame.reducedMotion,
      })
    : { opacity: 0, offsetY: 0, visible: false };

  return {
    state: { squash: squash.state, camera: camera.state, dust },
    playerScale: squash.scale satisfies SquashScale,
    pose,
    camera,
    dust,
    announcement,
  };
}
