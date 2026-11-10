import { describe, expect, it } from "vitest";
import { clamp01, easeInQuad, easeOutBack, easeOutCubic, lerp } from "./easing";

describe("Easing", () => {
  it("klemmt und mischt", () => {
    expect(clamp01(-2)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(3)).toBe(1);
    expect(lerp(10, 20, 0.5)).toBe(15);
  });

  it("startet ease-out schnell und ease-in langsam, Back überschießt", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.4)).toBeGreaterThan(0.4);
    expect(easeInQuad(0.4)).toBeLessThan(0.4);
    expect(easeOutBack(0)).toBeCloseTo(0);
    expect(easeOutBack(1)).toBeCloseTo(1);
    expect(easeOutBack(0.7)).toBeGreaterThan(1);
  });
});
