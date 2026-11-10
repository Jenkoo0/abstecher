import { describe, expect, it } from "vitest";
import { contrastRatio } from "../look/contrast";
import { fadeToward, hudFrame } from "./hud";

describe("HUD", () => {
  it("sitzt am Rand, wird auf schmalen Screens größer und lässt das Banner laut", () => {
    const desktop = hudFrame({ viewportW: 1280, idleMs: 0, bannerActive: true });
    const phone = hudFrame({ viewportW: 390, idleMs: 0, bannerActive: true });
    expect(phone.scale).toBeGreaterThan(desktop.scale);
    expect(phone.bannerPx).toBeGreaterThan(desktop.bannerPx);
    expect(desktop.score.top).toBe(desktop.pad);
    expect(desktop.score.left).toBe(desktop.pad);
    expect(desktop.status.right).toBe(desktop.pad);
    expect(desktop.banner.bottom).toBeGreaterThan(desktop.pad);
    expect(desktop.bannerOpacity).toBe(1);
    expect(contrastRatio(desktop.colors.bannerFg, desktop.colors.bannerBg)).toBeGreaterThan(4.5);
    expect(contrastRatio(desktop.colors.chrome, desktop.colors.chromeBg)).toBeGreaterThan(4.5);
    expect(desktop.fontFamily).toMatch(/Bahnschrift/);
  });

  it("dunkelt untätige Punkte ab und springt bei Reduced Motion", () => {
    const live = hudFrame({ viewportW: 1000, idleMs: 100, bannerActive: false });
    const idle = hudFrame({ viewportW: 1000, idleMs: 3000, bannerActive: false });
    expect(live.chromeOpacity).toBe(1);
    expect(idle.chromeOpacity).toBeLessThan(live.chromeOpacity);
    expect(idle.bannerOpacity).toBe(0);
    expect(hudFrame({ viewportW: 1000, idleMs: 3000, bannerActive: true }).bannerOpacity).toBe(1);
    expect(idle.fade).toBe("ease");
    expect(hudFrame({ viewportW: 1000, idleMs: 3000, bannerActive: false, reducedMotion: true }).fade).toBe("snap");
    expect(fadeToward(1, 0.4, 16, true)).toBe(0.4);
    expect(fadeToward(1, 0.4, 18, false)).toBeLessThan(1);
    expect(fadeToward(1, 0.4, 18, false)).toBeGreaterThan(0.4);
  });
});
