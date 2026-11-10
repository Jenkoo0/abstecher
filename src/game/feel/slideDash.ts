/**
 * Slide aus dem Sprint, verlängerbar in einen Dash.
 *
 * Einbau: Kante von Strg als `slidePressed`, Kante von Umschalt als
 * `dashPressed` (C ist Stechen und bleibt frei). `dtMs` ist simDt, damit
 * der Slide im Hitstop mit der übrigen Bewegung stehen bleibt.
 * `speed` ist die aktuelle Laufgeschwindigkeit in Welt-Einheiten pro Sekunde.
 * `heightScale` < 1 nur im Slide: damit kann die spätere Kollision unter
 * Bänke ducken. `invulnerable` gilt nur während des Dash.
 *
 * Gleichzeitig gedrücktes Slide und Dash startet den Slide und bricht ihn
 * ab, sobald `SLIDE_CANCEL_MIN_MS` um sind. Der Dash allein bleibt das
 * Ausweichen aus dem Stand oder aus der Luft.
 */

export const SLIDE_MS = 480;
export const SLIDE_COOLDOWN_MS = 700;
export const SLIDE_CANCEL_MIN_MS = 80;
export const DASH_MS = 180;
export const DASH_COOLDOWN_MS = 650;
export const MIN_SPRINT_SPEED = 220;
export const SLIDE_SPEED = 460;
export const DASH_SPEED = 720;
export const SLIDE_HEIGHT = 0.55;

export type SlideMode = "free" | "slide" | "dash";

export type SlideDashState = {
  mode: SlideMode;
  modeMs: number;
  slideCooldownMs: number;
  dashCooldownMs: number;
  dashBuffered: boolean;
  invulnerable: boolean;
  /** 0 heißt: dieses Modul gibt keine Geschwindigkeit vor. */
  speed: number;
  heightScale: number;
};

export type SlideDashInput = {
  dtMs: number;
  grounded: boolean;
  sprinting: boolean;
  speed: number;
  slidePressed: boolean;
  dashPressed: boolean;
};

type Core = {
  mode: SlideMode;
  modeMs: number;
  slideCooldownMs: number;
  dashCooldownMs: number;
  dashBuffered: boolean;
};

function present(core: Core): SlideDashState {
  return {
    ...core,
    invulnerable: core.mode === "dash",
    speed: core.mode === "dash" ? DASH_SPEED : core.mode === "slide" ? SLIDE_SPEED : 0,
    heightScale: core.mode === "slide" ? SLIDE_HEIGHT : 1,
  };
}

export function createSlideDashState(): SlideDashState {
  return present({
    mode: "free",
    modeMs: 0,
    slideCooldownMs: 0,
    dashCooldownMs: 0,
    dashBuffered: false,
  });
}

export function stepSlideDash(state: SlideDashState, input: SlideDashInput): SlideDashState {
  const dt = Math.max(0, input.dtMs);
  let mode = state.mode;
  let modeMs = state.modeMs;
  let slideCooldownMs = Math.max(0, state.slideCooldownMs - dt);
  let dashCooldownMs = Math.max(0, state.dashCooldownMs - dt);
  let dashBuffered = state.dashBuffered;

  const beginDash = () => {
    mode = "dash";
    modeMs = dt;
    dashBuffered = false;
    dashCooldownMs = DASH_COOLDOWN_MS;
  };

  if (mode === "slide") {
    modeMs += dt;
    if (input.dashPressed) dashBuffered = true;
    if (dashBuffered && dashCooldownMs === 0 && modeMs >= SLIDE_CANCEL_MIN_MS) {
      beginDash();
      slideCooldownMs = SLIDE_COOLDOWN_MS;
    } else if (modeMs >= SLIDE_MS) {
      mode = "free";
      modeMs = 0;
      dashBuffered = false;
      slideCooldownMs = SLIDE_COOLDOWN_MS;
    }
  } else if (mode === "dash") {
    modeMs += dt;
    if (modeMs >= DASH_MS) {
      mode = "free";
      modeMs = 0;
      dashBuffered = false;
    }
  } else if (
    input.slidePressed &&
    slideCooldownMs === 0 &&
    input.grounded &&
    input.sprinting &&
    input.speed >= MIN_SPRINT_SPEED
  ) {
    mode = "slide";
    modeMs = dt;
    dashBuffered = input.dashPressed;
    if (dashBuffered && dashCooldownMs === 0 && modeMs >= SLIDE_CANCEL_MIN_MS) {
      beginDash();
      slideCooldownMs = SLIDE_COOLDOWN_MS;
    }
  } else if (input.dashPressed && dashCooldownMs === 0) {
    beginDash();
  }

  return present({ mode, modeMs, slideCooldownMs, dashCooldownMs, dashBuffered });
}
