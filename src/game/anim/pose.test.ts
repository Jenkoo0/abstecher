import { describe, expect, it } from "vitest";
import { locomotionPose } from "./pose";

describe("Slide- und Dash-Pose", () => {
  it("legt sich in den Slide und streckt sich im Dash", () => {
    const standing = locomotionPose({ mode: "free", modeMs: 200 });
    expect(standing.pitch).toBe(0);
    expect(standing.heightScale).toBe(1);
    expect(standing.stretchZ).toBe(1);

    const early = locomotionPose({ mode: "slide", modeMs: 0 });
    const late = locomotionPose({ mode: "slide", modeMs: 400 });
    expect(late.pitch).toBeGreaterThan(early.pitch);
    expect(late.heightScale).toBeLessThan(1);
    expect(late.heightScale).toBeLessThanOrEqual(early.heightScale);

    const dash = locomotionPose({ mode: "dash", modeMs: 90 });
    expect(dash.stretchZ).toBeGreaterThan(1);
    expect(dash.pitch).toBeGreaterThan(0);
    expect(dash.pitch).toBeLessThan(late.pitch);
  });

  it("nimmt die ruhige Pose bei reduced motion sofort und ohne Schnörkel", () => {
    const early = locomotionPose({ mode: "slide", modeMs: 0, reducedMotion: true });
    const late = locomotionPose({ mode: "slide", modeMs: 400, reducedMotion: true });
    const full = locomotionPose({ mode: "slide", modeMs: 400 });
    expect(early.pitch).toBeCloseTo(late.pitch);
    expect(late.pitch).toBeLessThan(full.pitch);
    expect(late.stretchZ).toBe(1);
    expect(late.heightScale).toBeLessThan(1);
  });
});
