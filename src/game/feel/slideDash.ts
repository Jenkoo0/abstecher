/**
 * Slide aus dem Sprint, verlängerbar in einen Dash.
 *
 * Einbau: Kante von Q als `slidePressed`, Kante von Umschalt als
 * `dashPressed` (C ist Stechen und bleibt frei, Strg ist nicht belegt).
 * `dtMs` ist simDt, damit der Slide im Hitstop mit der übrigen Bewegung
 * stehen bleibt. Geschwindigkeiten sind Meter pro Sekunde (1 Einheit = 1 m).
 * `heightScale` < 1 nur im Slide: damit kann die spätere Kollision unter
 * Bänke ducken. `invulnerable` gilt nur in den ersten `DASH_IFRAMES_MS`
 * des Dash, nicht über die ganze Strecke.
 *
 * Gleichzeitig gedrücktes Slide und Dash startet den Slide und bricht ihn
 * ab, sobald `SLIDE_CANCEL_MIN_MS` um sind. Der Dash allein bleibt das
 * Ausweichen aus dem Stand oder aus der Luft.
 */

export const SLIDE_MS = 480;
export const SLIDE_COOLDOWN_MS = 700;
export const SLIDE_CANCEL_MIN_MS = 80;
export const DASH_MS = 180;
/** Unverwundbar nur am Anfang des Dash, nicht bis zum Ende (180 ms). */
export const DASH_IFRAMES_MS = 100;
export const DASH_COOLDOWN_MS = 650;
/** Meter pro Sekunde. Darunter ist es Gehen, kein Sprint. */
export const MIN_SPRINT_SPEED = 6;
/** Meter pro Sekunde. */
export const SLIDE_SPEED = 9.5;
/** Meter pro Sekunde. Kurz und schneller als der Slide. */
export const DASH_SPEED = 14;
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
    invulnerable: core.mode === "dash" && core.modeMs <= DASH_IFRAMES_MS,
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
