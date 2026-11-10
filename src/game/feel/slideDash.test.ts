import { describe, expect, it } from "vitest";
import {
  DASH_COOLDOWN_MS,
  DASH_IFRAMES_MS,
  DASH_MS,
  MIN_SPRINT_SPEED,
  SLIDE_CANCEL_MIN_MS,
  SLIDE_COOLDOWN_MS,
  SLIDE_MS,
  createSlideDashState,
  stepSlideDash,
  type SlideDashState,
} from "./slideDash";

const still = {
  dtMs: 16,
  grounded: true,
  sprinting: false,
  speed: 0,
  slidePressed: false,
  dashPressed: false,
};

function sprintInput(overrides: Partial<Parameters<typeof stepSlideDash>[1]> = {}) {
  return {
    ...still,
    grounded: true,
    sprinting: true,
    speed: MIN_SPRINT_SPEED,
    ...overrides,
  };
}

function enterSlide(dtMs = 16): SlideDashState {
  return stepSlideDash(createSlideDashState(), sprintInput({ dtMs, slidePressed: true }));
}

describe("Slide und Dash", () => {
  it("rutscht nur aus dem Sprint am Boden", () => {
    expect(enterSlide().mode).toBe("slide");
    expect(stepSlideDash(createSlideDashState(), sprintInput({ grounded: false, slidePressed: true })).mode).toBe("free");
    expect(stepSlideDash(createSlideDashState(), sprintInput({ sprinting: false, speed: MIN_SPRINT_SPEED + 500, slidePressed: true })).mode).toBe("free");
    expect(stepSlideDash(createSlideDashState(), sprintInput({ speed: MIN_SPRINT_SPEED - 1, slidePressed: true })).mode).toBe("free");
  });

  it("beendet den Slide nach seiner Dauer und startet den Cooldown", () => {
    let state = enterSlide(16);
    expect(state.modeMs).toBe(16);
    state = stepSlideDash(state, sprintInput({ dtMs: SLIDE_MS - 16 - 1 }));
    expect(state.mode).toBe("slide");
    state = stepSlideDash(state, sprintInput({ dtMs: 1 }));
    expect(state.mode).toBe("free");
    expect(state.slideCooldownMs).toBe(SLIDE_COOLDOWN_MS);
    expect(state.heightScale).toBe(1);

    const blocked = stepSlideDash(state, sprintInput({ dtMs: SLIDE_COOLDOWN_MS - 1, slidePressed: true }));
    expect(blocked.mode).toBe("free");
    const ready = stepSlideDash(state, sprintInput({ dtMs: SLIDE_COOLDOWN_MS, slidePressed: true }));
    expect(ready.mode).toBe("slide");
  });

  it("bricht den Slide in einen Dash ab und verlängert so die Bewegung", () => {
    let state = enterSlide(16);
    state = stepSlideDash(state, sprintInput({ dtMs: SLIDE_CANCEL_MIN_MS - 16 - 1, dashPressed: true }));
    expect(state.mode).toBe("slide");
    state = stepSlideDash(state, sprintInput({ dtMs: 1 }));
    expect(state.mode).toBe("dash");
    expect(state.invulnerable).toBe(true);
    expect(state.speed).toBeGreaterThan(enterSlide().speed);

    const buffered = enterSlide(16);
    expect(buffered.mode).toBe("slide");
    const both = stepSlideDash(createSlideDashState(), sprintInput({ slidePressed: true, dashPressed: true }));
    expect(both.mode).toBe("slide");
    const extended = stepSlideDash(both, sprintInput({ dtMs: SLIDE_CANCEL_MIN_MS }));
    expect(extended.mode).toBe("dash");
  });

  it("dasht auch ohne Slide und hält den Dash-Cooldown ein", () => {
    let state = stepSlideDash(createSlideDashState(), { ...still, grounded: false, dashPressed: true });
    expect(state.mode).toBe("dash");
    expect(state.invulnerable).toBe(true);
    expect(state.heightScale).toBe(1);

    state = stepSlideDash(state, { ...still, dtMs: DASH_MS, dashPressed: true });
    expect(state.mode).toBe("free");
    expect(state.invulnerable).toBe(false);

    state = stepSlideDash(state, { ...still, dashPressed: true });
    expect(state.mode).toBe("free");

    state = stepSlideDash(state, { ...still, dtMs: DASH_COOLDOWN_MS, dashPressed: false });
    state = stepSlideDash(state, { ...still, dashPressed: true });
    expect(state.mode).toBe("dash");
  });

  it("nimmt während Dash und laufendem Dash-Cooldown keinen Slide-Abbruch an", () => {
    let state = stepSlideDash(createSlideDashState(), { ...still, dashPressed: true });
    const during = stepSlideDash(state, sprintInput({ slidePressed: true }));
    expect(during.mode).toBe("dash");

    state = stepSlideDash(state, { ...still, dtMs: DASH_MS });
    state = enterFrom(state);
    expect(state.mode).toBe("slide");
    state = stepSlideDash(state, sprintInput({ dtMs: SLIDE_CANCEL_MIN_MS, dashPressed: true }));
    expect(state.mode).toBe("slide");
  });

  it("ist nur in den ersten 100 ms des Dash unverwundbar", () => {
    let state = stepSlideDash(createSlideDashState(), { ...still, dashPressed: true, dtMs: 16 });
    expect(state.invulnerable).toBe(true);
    state = stepSlideDash(state, { ...still, dtMs: DASH_IFRAMES_MS });
    expect(state.mode).toBe("dash");
    expect(state.modeMs).toBeGreaterThan(DASH_IFRAMES_MS);
    expect(state.invulnerable).toBe(false);
  });

  it("duckt nur im Slide", () => {
    const sliding = enterSlide();
    expect(sliding.heightScale).toBeLessThan(1);
    expect(sliding.invulnerable).toBe(false);
    expect(sliding.speed).toBeGreaterThan(0);
    expect(createSlideDashState().speed).toBe(0);
  });
});

function enterFrom(state: SlideDashState) {
  return stepSlideDash(state, sprintInput({ slidePressed: true }));
}
