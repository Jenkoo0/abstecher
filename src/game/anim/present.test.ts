import { describe, expect, it } from "vitest";
import { createPresentationState, stepPresentation } from "./present";

const player = { x: 0, y: 0, z: 0, vy: 0, grounded: true, jumped: false };

describe("Präsentationsschritt", () => {
  it("hält die Kamera im Hitstop und streckt die Figur beim Sprung", () => {
    const state = createPresentationState({ x: 0, y: 2, z: 8 }, { x: 0, y: 1, z: 0 });
    const frozen = stepPresentation(state, {
      realDtMs: 16,
      simDtMs: 0,
      player: { ...player, x: 4 },
      mode: "free",
      modeMs: 0,
      shake: { x: 0.25, y: 0 },
      banner: { elapsedMs: 0, durationMs: 4000 },
    });
    expect(frozen.state.camera.x).toBe(0);
    expect(frozen.camera.position.x).toBeCloseTo(0.25);
    expect(frozen.announcement.opacity).toBe(0);
    expect(frozen.announcement.offsetY).toBeGreaterThan(0);

    const jumped = stepPresentation(state, {
      realDtMs: 16,
      simDtMs: 16,
      player: { ...player, vy: 400, grounded: false, jumped: true },
      mode: "slide",
      modeMs: 200,
      shake: { x: 0, y: 0 },
      banner: null,
    });
    expect(jumped.playerScale.y).toBeGreaterThan(1);
    expect(jumped.pose.heightScale).toBeLessThan(1);
  });

  it("lässt Shake und Staub weg, wenn reduced motion an ist", () => {
    const state = createPresentationState({ x: 0, y: 2, z: 8 }, { x: 0, y: 1, z: 0 });
    const airborne = stepPresentation(state, {
      realDtMs: 16,
      simDtMs: 16,
      player: { ...player, grounded: false, vy: 200 },
      mode: "free",
      modeMs: 0,
      shake: { x: 0, y: 0 },
      banner: null,
      reducedMotion: true,
    });
    const landed = stepPresentation(airborne.state, {
      realDtMs: 16,
      simDtMs: 16,
      player: { ...player, grounded: true, vy: -300, jumped: false },
      mode: "free",
      modeMs: 0,
      shake: { x: 0.8, y: 0.4 },
      banner: { elapsedMs: 10, durationMs: 4000 },
      reducedMotion: true,
    });
    expect(landed.dust).toEqual([]);
    expect(landed.playerScale).toEqual({ x: 1, y: 1, z: 1 });
    expect(landed.announcement.opacity).toBe(1);
    expect(landed.announcement.offsetY).toBe(0);
    expect(landed.camera.position.x).toBeCloseTo(landed.state.camera.x);
  });
});
