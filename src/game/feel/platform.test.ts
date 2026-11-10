import { describe, expect, it } from "vitest";
import { LUGGAGE_TRIP_MPS, resolvePlatform, type PlatformProp } from "./platform";

const props: PlatformProp[] = [
  { kind: "escalator", x: 0, z: 0, w: 2, d: 6, dirX: 0, dirZ: 1, speedMps: 0.9 },
  { kind: "luggage", x: 4, z: 1, w: 0.8, d: 0.5, tripSpeedMps: LUGGAGE_TRIP_MPS },
];

describe("Bahnsteig", () => {
  it("nimmt auf der Rolltreppe mit und stolpert nur schnell über Gepäck", () => {
    const ride = resolvePlatform({ x: 1, z: 2, speedMps: 0 }, props);
    expect(ride.carryZ).toBeCloseTo(0.9);
    expect(ride.carryX).toBe(0);
    expect(ride.tripped).toBe(false);

    const walk = resolvePlatform({ x: 4.2, z: 1.2, speedMps: 2 }, props);
    expect(walk.tripped).toBe(false);
    const sprint = resolvePlatform({ x: 4.2, z: 1.2, speedMps: 6 }, props);
    expect(sprint.tripped).toBe(true);

    const clear = resolvePlatform({ x: 12, z: 12, speedMps: 8 }, props);
    expect(clear).toEqual({ carryX: 0, carryZ: 0, tripped: false });
  });
});
