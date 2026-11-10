import { describe, expect, it } from "vitest";
import { BASE_FOV, cameraFrame } from "./framing";

describe("Kamera-Framing", () => {
  it("zieht beim Dash auf und senkt sich bei der Landung", () => {
    const dash = cameraFrame({ mode: "dash", modeMs: 30, landingMs: 0 });
    expect(dash.fov).toBeGreaterThan(BASE_FOV);
    expect(dash.kick).toBeGreaterThan(0);
    const later = cameraFrame({ mode: "dash", modeMs: 200, landingMs: 0 });
    expect(later.fov).toBeLessThan(dash.fov);

    const land = cameraFrame({ mode: "land", modeMs: 0, landingMs: 0 });
    expect(land.dip).toBeLessThan(0);
    const settled = cameraFrame({ mode: "land", modeMs: 0, landingMs: 600 });
    expect(settled.dip).toBeGreaterThan(land.dip);
  });

  it("lässt FOV und Senke bei Reduced Motion in Ruhe", () => {
    const quiet = cameraFrame({ mode: "dash", modeMs: 20, landingMs: 0, reducedMotion: true });
    expect(quiet).toEqual({ fov: BASE_FOV, dip: 0, kick: 0 });
    const landed = cameraFrame({ mode: "land", modeMs: 0, landingMs: 0, reducedMotion: true });
    expect(landed.dip).toBe(0);
    expect(landed.fov).toBe(BASE_FOV);
  });
});
