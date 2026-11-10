/**
 * FOV-Kick und Landesenke, zusätzlich zu `stepCamera`.
 *
 * Einbau: `fov` an die Kamera, `dip` in Metern auf die Kamerahöhe addieren,
 * nach dem Shake. Reduced Motion lässt beides aus. Der Hitstop-Shake bleibt
 * in `stepCamera` und wird hier nicht noch einmal gerechnet.
 */

export const BASE_FOV = 58;

export function cameraFrame(input: {
  mode: "idle" | "run" | "jump" | "slide" | "dash" | "land";
  modeMs: number;
  landingMs: number;
  reducedMotion?: boolean;
}) {
  if (input.reducedMotion) return { fov: BASE_FOV, dip: 0, kick: 0 };
  const dash = input.mode === "dash" ? Math.exp(-Math.max(0, input.modeMs) / 90) : 0;
  const land = input.mode === "land" ? Math.exp(-Math.max(0, input.landingMs) / 140) : 0;
  return {
    fov: BASE_FOV + dash * 8,
    dip: -0.12 * land,
    kick: dash,
  };
}
