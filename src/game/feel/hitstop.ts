/**
 * Hitstop als eine Zeitskala für die ganze Simulation.
 *
 * Einbau: `tickHitstop` mit der echten Framezeit aufrufen. Physik, KI,
 * Cooldowns und Bewegung bekommen nur `simDtMs`. Der Kamera-Offset `shake`
 * darf nur auf die Kamera, nie auf den Körper. Während `timeScale === 0`
 * rückt keine Spiellogik vor, deshalb laufen die Systeme nicht auseinander.
 * Ein neuer Treffer ersetzt den Stop, er addiert ihn nicht.
 */

export type HitKind = "hit" | "kill" | "throw";

const DURATION_MS: Record<HitKind, number> = {
  hit: 50,
  throw: 74,
  kill: 90,
};

const SHAKE_AMP: Record<HitKind, number> = {
  hit: 0.12,
  throw: 0.2,
  kill: 0.28,
};

const SHAKE_MS = 160;

export type HitstopState = {
  remainingMs: number;
  shakeMs: number;
  shakeDurationMs: number;
  shakeAmp: number;
  dirX: number;
  dirY: number;
  phase: number;
};

export type HitstopTick = {
  state: HitstopState;
  /** 0 während des Einfrierens, sonst 1. */
  timeScale: number;
  /** Framezeit mal Zeitskala. Das ist die einzige Zeit für die Sim. */
  simDtMs: number;
  /** Präsentation. Nicht in die Physik addieren. */
  shake: { x: number; y: number };
};

export function createHitstopState(): HitstopState {
  return {
    remainingMs: 0,
    shakeMs: 0,
    shakeDurationMs: SHAKE_MS,
    shakeAmp: 0,
    dirX: 1,
    dirY: 0,
    phase: Math.PI / 2,
  };
}

function aimOf(dir?: { x: number; y: number }) {
  const x = dir?.x ?? 1;
  const y = dir?.y ?? 0;
  const length = Math.hypot(x, y);
  if (length < 1e-6) return { x: 1, y: 0 };
  return { x: x / length, y: y / length };
}

export function triggerHitstop(
  state: HitstopState,
  kind: HitKind,
  dir?: { x: number; y: number },
): HitstopState {
  const duration = DURATION_MS[kind];
  const shakeAmp = SHAKE_AMP[kind];
  const aim = aimOf(dir);

  if (duration <= state.remainingMs) {
    if (shakeAmp <= state.shakeAmp) return state;
    return {
      ...state,
      shakeAmp,
      dirX: aim.x,
      dirY: aim.y,
      shakeMs: Math.max(state.shakeMs, SHAKE_MS),
      shakeDurationMs: SHAKE_MS,
    };
  }

  return {
    remainingMs: duration,
    shakeMs: SHAKE_MS,
    shakeDurationMs: SHAKE_MS,
    shakeAmp,
    dirX: aim.x,
    dirY: aim.y,
    phase: Math.PI / 2,
  };
}

export function tickHitstop(state: HitstopState, realDtMs: number): HitstopTick {
  const dt = Math.max(0, realDtMs);
  const active = state.remainingMs > 0;
  const timeScale = active ? 0 : 1;
  const shakeMs = Math.max(0, state.shakeMs - dt);
  const decay = shakeMs > 0 && state.shakeDurationMs > 0 ? shakeMs / state.shakeDurationMs : 0;
  const amp = decay * state.shakeAmp * Math.sin(state.phase);

  return {
    state: {
      ...state,
      remainingMs: Math.max(0, state.remainingMs - dt),
      shakeMs,
      phase: state.phase + dt * 0.05,
    },
    timeScale,
    simDtMs: dt * timeScale,
    shake: { x: amp * state.dirX, y: amp * state.dirY },
  };
}
