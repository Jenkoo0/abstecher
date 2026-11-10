import { describe, expect, it } from "vitest";
import { prefersReducedMotion, readReducedMotionFromWindow } from "./motion";

describe("Reduced motion", () => {
  it("liest ein übergebenes Media-Query und fällt ohne Fenster auf aus", () => {
    expect(prefersReducedMotion({ matches: true })).toBe(true);
    expect(prefersReducedMotion({ matches: false })).toBe(false);
    expect(prefersReducedMotion(null)).toBe(false);
    expect(readReducedMotionFromWindow()).toBe(false);
  });
});
