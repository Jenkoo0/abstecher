import { describe, expect, it } from "vitest";
import { createCameraRig, stepCamera } from "./camera";

const look = { x: 0, y: 1, z: 0 };

describe("Kamera", () => {
  it("folgt bei Hitstop nicht nach und legt den Shake nur auf die Ausgabe", () => {
    const rig = createCameraRig({ x: 0, y: 2, z: 8 }, look);
    const frozen = stepCamera(rig, {
      target: { x: 10, y: 2, z: 8 },
      lookAt: { x: 4, y: 1, z: 0 },
      realDtMs: 16,
      simDtMs: 0,
      shake: { x: 0.2, y: -0.1 },
    });

    expect(frozen.state.x).toBe(0);
    expect(frozen.state.lookX).toBe(0);
    expect(frozen.position.x).toBeCloseTo(0.2);
    expect(frozen.position.y).toBeCloseTo(1.9);
    expect(frozen.lookAt.x).toBe(0);

    const follow = stepCamera(frozen.state, {
      target: { x: 10, y: 2, z: 8 },
      lookAt: { x: 4, y: 1, z: 0 },
      realDtMs: 16,
      simDtMs: 16,
      shake: { x: 0, y: 0 },
    });
    expect(follow.state.x).toBeGreaterThan(0);
    expect(follow.state.x).toBeLessThan(10);
    expect(follow.lookAt.x).toBeGreaterThan(0);
  });

  it("schüttelt bei reduced motion nicht und springt nur außerhalb des Hitstops nach", () => {
    const rig = createCameraRig({ x: 0, y: 2, z: 8 }, look);
    const held = stepCamera(rig, {
      target: { x: 10, y: 2, z: 8 },
      lookAt: look,
      realDtMs: 16,
      simDtMs: 0,
      shake: { x: 1, y: 0.5 },
      reducedMotion: true,
    });
    expect(held.state.x).toBe(0);
    expect(held.position).toEqual({ x: 0, y: 2, z: 8 });

    const snapped = stepCamera(rig, {
      target: { x: 10, y: 4, z: 1 },
      lookAt: { x: 3, y: 1, z: 0 },
      realDtMs: 16,
      simDtMs: 16,
      shake: { x: 1, y: 1 },
      reducedMotion: true,
    });
    expect(snapped.position).toEqual({ x: 10, y: 4, z: 1 });
    expect(snapped.lookAt).toEqual({ x: 3, y: 1, z: 0 });
  });
});
