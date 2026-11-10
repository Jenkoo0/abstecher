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

  it("zeigt bei reduced motion sofort die neutrale Ruhepose", () => {
    const early = locomotionPose({ mode: "slide", modeMs: 0, reducedMotion: true });
    const late = locomotionPose({ mode: "slide", modeMs: 400, reducedMotion: true });
    const dash = locomotionPose({ mode: "dash", modeMs: 90, reducedMotion: true });
    for (const pose of [early, late, dash]) {
      expect(pose.pitch).toBe(0);
      expect(pose.roll).toBe(0);
      expect(pose.heightScale).toBe(1);
      expect(pose.offsetY).toBe(0);
      expect(pose.stretchZ).toBe(1);
    }
  });
});
