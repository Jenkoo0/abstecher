import { describe, expect, it } from "vitest";
import { spawnLandingBurst, tickImpulses } from "./impulses";

describe("Landung und Staub", () => {
  it("stößt Staub nach außen und lässt ihn ausklingen", () => {
    const burst = spawnLandingBurst({ x: 1, y: 0, z: 2, intensity: 1, rng: () => 0.5 });
    expect(burst.length).toBeGreaterThan(3);
    expect(spawnLandingBurst({ x: 1, y: 0, z: 2, intensity: 1, reducedMotion: true })).toEqual([]);

    const moved = tickImpulses(burst, 100);
    expect(moved).toHaveLength(burst.length);
    expect(moved.some((puff) => puff.x !== 1 || puff.z !== 2)).toBe(true);
    expect(moved[0]?.lifeMs).toBeLessThan(burst[0]?.lifeMs ?? 0);

    const dying = burst.map((puff) => ({ ...puff, lifeMs: 10 }));
    expect(tickImpulses(dying, 50)).toEqual([]);
  });
});
