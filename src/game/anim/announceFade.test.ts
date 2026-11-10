import { describe, expect, it } from "vitest";
import { announcementPresentation } from "./announceFade";

describe("Einblenden der Durchsage", () => {
  it("fadet ein und am Ende wieder aus", () => {
    const start = announcementPresentation({ elapsedMs: 0, durationMs: 4000 });
    expect(start.visible).toBe(true);
    expect(start.opacity).toBe(0);
    expect(start.offsetY).toBeGreaterThan(0);

    const shown = announcementPresentation({ elapsedMs: 400, durationMs: 4000 });
    expect(shown.opacity).toBeGreaterThan(0.95);
    expect(Math.abs(shown.offsetY)).toBeLessThan(2);

    const leaving = announcementPresentation({ elapsedMs: 3900, durationMs: 4000 });
    expect(leaving.opacity).toBeLessThan(shown.opacity);

    const done = announcementPresentation({ elapsedMs: 4000, durationMs: 4000 });
    expect(done.visible).toBe(false);
    expect(done.opacity).toBe(0);
  });

  it("steht bei reduced motion sofort da und rutscht nicht", () => {
    const shown = announcementPresentation({ elapsedMs: 0, durationMs: 4000, reducedMotion: true });
    expect(shown.opacity).toBe(1);
    expect(shown.offsetY).toBe(0);
    expect(shown.visible).toBe(true);

    const done = announcementPresentation({ elapsedMs: 4000, durationMs: 4000, reducedMotion: true });
    expect(done.opacity).toBe(0);
    expect(done.visible).toBe(false);
  });
});
