import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { LIGHTS } from "./lights";
import { BLOCK_MATERIAL, MATERIALS } from "./materials";
import { PALETTE, TEXT_PAIRS, TYPE } from "./tokens";

describe("Bahnhof-Look", () => {
  it("hält den Textkontrast und lässt Rot nur als Akzent", () => {
    expect(contrastRatio(TEXT_PAIRS.onNight.fg, TEXT_PAIRS.onNight.bg)).toBeGreaterThan(7);
    expect(contrastRatio(TEXT_PAIRS.body.fg, TEXT_PAIRS.body.bg)).toBeGreaterThan(4.5);
    expect(contrastRatio(TEXT_PAIRS.onCaution.fg, TEXT_PAIRS.onCaution.bg)).toBeGreaterThan(4.5);
    expect(contrastRatio(PALETTE.ink, PALETTE.dbRed)).toBeLessThan(4.5);
    expect(TYPE.family).toMatch(/Bahnschrift/);
  });

  it("gibt stabile Material- und Licht-Presets her", () => {
    expect(MATERIALS.tile).toMatchObject({ color: PALETTE.tile, roughness: 0.86, metalness: 0 });
    expect(MATERIALS.glass.opacity).toBeLessThan(0.5);
    expect(MATERIALS.neon.emissive).toBe(PALETTE.neon);
    expect(BLOCK_MATERIAL.bench).toBe("bench");
    expect(BLOCK_MATERIAL.roof).toBe("glass");
    expect(LIGHTS.headlight.distanceM).toBeGreaterThan(LIGHTS.kiosk.distanceM);
    expect(LIGHTS.hall.intensity).toBeLessThan(1);
  });
});
