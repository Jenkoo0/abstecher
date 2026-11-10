import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ANIM_DOCKS } from "./docks";

describe("Andockpunkte", () => {
  it("nennt die späteren Stellen in view3d, draw und UI", () => {
    const ids = ANIM_DOCKS.map((dock) => dock.id);
    expect(ids).toEqual(
      expect.arrayContaining(["player-scale", "player-pose", "camera", "dust", "announcement"]),
    );
    for (const dock of ANIM_DOCKS) {
      expect(dock.reads.length).toBeGreaterThan(5);
      expect(dock.writes.length).toBeGreaterThan(5);
    }
  });

  it("importiert in den Animationsmodulen kein three und keine Szene", () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    const sources = readdirSync(dir).filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"));
    expect(sources).toEqual(
      expect.arrayContaining([
        "easing.ts",
        "tween.ts",
        "squashStretch.ts",
        "pose.ts",
        "camera.ts",
        "impulses.ts",
        "announceFade.ts",
        "present.ts",
      ]),
    );
    for (const name of sources) {
      const source = readFileSync(join(dir, name), "utf8");
      expect(source).not.toMatch(/from ["']three["']/);
      expect(source).not.toMatch(/\bscene\b/i);
      expect(source).not.toMatch(/\bWebGLRenderer\b/);
    }
  });
});
