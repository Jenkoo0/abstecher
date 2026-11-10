import { describe, expect, it } from "vitest";
import { NEAR_MISS_POINTS, conductorMoment } from "./conductor";

describe("Kontrolleur", () => {
  it("zahlt den Nahtreffer einmal beim Eintritt in den Ring", () => {
    const far = conductorMoment({
      playerX: 0,
      playerZ: 0,
      conductorX: 4,
      conductorZ: 0,
      previousDistanceM: null,
    });
    expect(far.nearMiss).toBe(false);
    expect(far.hit).toBe(false);

    const entered = conductorMoment({
      playerX: 0,
      playerZ: 0,
      conductorX: 1.2,
      conductorZ: 0,
      previousDistanceM: far.distanceM,
    });
    expect(entered.nearMiss).toBe(true);
    expect(entered.points).toBe(NEAR_MISS_POINTS);
    expect(entered.pressure).toBeGreaterThan(far.pressure);

    const staying = conductorMoment({
      playerX: 0,
      playerZ: 0,
      conductorX: 1.1,
      conductorZ: 0,
      previousDistanceM: entered.distanceM,
    });
    expect(staying.nearMiss).toBe(false);
    expect(staying.points).toBe(0);
  });

  it("wertet einen Treffer nicht als Nahtreffer", () => {
    const hit = conductorMoment({
      playerX: 0,
      playerZ: 0,
      conductorX: 0.2,
      conductorZ: 0,
      previousDistanceM: 3,
    });
    expect(hit.hit).toBe(true);
    expect(hit.nearMiss).toBe(false);
    expect(hit.points).toBe(0);
  });
});
