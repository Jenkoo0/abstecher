import { describe, expect, it } from "vitest";
import { createFeelState, stepFeel } from "./stepFeel";

const idle = {
  realDtMs: 16,
  grounded: true,
  sprinting: false,
  speed: 0,
  jumpPressed: false,
  jumpHeld: false,
  slidePressed: false,
  dashPressed: false,
};

describe("Feel-Schritt", () => {
  it("friert Sprung und Slide gemeinsam ein und lässt die Durchsage weiterlaufen", () => {
    const jumped = stepFeel(createFeelState(), {
      ...idle,
      jumpPressed: true,
      jumpHeld: true,
    });
    expect(jumped.jumped).toBe(true);
    const vy = jumped.state.jump.vy;

    const frozenJump = stepFeel(jumped.state, {
      ...idle,
      grounded: false,
      jumpHeld: true,
      hit: { kind: "kill", dirX: 1, dirY: 0 },
    });
    expect(frozenJump.timeScale).toBe(0);
    expect(frozenJump.simDtMs).toBe(0);
    expect(frozenJump.state.jump.vy).toBe(vy);
    expect(frozenJump.shake.x).toBeGreaterThan(0);

    const sliding = stepFeel(createFeelState(), {
      ...idle,
      sprinting: true,
      speed: 10_000,
      slidePressed: true,
    });
    expect(sliding.state.slide.mode).toBe("slide");
    const frozenSlide = stepFeel(sliding.state, {
      ...idle,
      sprinting: true,
      speed: 10_000,
      hit: { kind: "hit" },
    });
    expect(frozenSlide.state.slide.modeMs).toBe(sliding.state.slide.modeMs);

    const announced = stepFeel(createFeelState(), {
      ...idle,
      announcement: { event: "round_start", stationId: "kiel", round: 1 },
    });
    expect(announced.speechCue).toMatch(/Moin/);
    expect(announced.state.banner.elapsedMs).toBe(16);

    const during = stepFeel(announced.state, {
      ...idle,
      realDtMs: 30,
      hit: { kind: "throw", dirX: 1, dirY: 0 },
    });
    expect(during.state.banner.elapsedMs).toBe(46);
    expect(during.speechCue).toBeNull();
    expect(during.simDtMs).toBe(0);
  });
});
