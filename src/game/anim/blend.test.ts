import { describe, expect, it } from "vitest";
import { anticipationAmount, blendPair, followThroughOffset } from "./blend";

describe("Posenübergang", () => {
  it("mischt weich und springt bei Reduced Motion aufs Ziel", () => {
    const start = blendPair("run", "slide", 0);
    expect(start.from).toBe(1);
    expect(start.to).toBe(0);
    const mid = blendPair("run", "slide", 0.5);
    expect(mid.from + mid.to).toBeCloseTo(1);
    expect(mid.to).toBeGreaterThan(0.4);
    expect(mid.to).toBeLessThan(0.6);
    const end = blendPair("jump", "land", 1);
    expect(end.to).toBe(1);
    const snapped = blendPair("run", "dash", 0.2, true);
    expect(snapped).toEqual({ from: 0, to: 1 });
  });

  it("holt aus und schwingt nach, außer bei Reduced Motion", () => {
    expect(anticipationAmount(0.1)).toBeGreaterThan(0.9);
    expect(anticipationAmount(0.5)).toBe(0);
    expect(anticipationAmount(0.1, true)).toBe(0);
    expect(followThroughOffset(0)).toBe(0);
    expect(followThroughOffset(1)).toBe(0);
    expect(followThroughOffset(0.35)).toBeGreaterThan(0);
    expect(followThroughOffset(0.35, true)).toBe(0);
  });
});
