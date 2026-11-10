import { describe, expect, it } from "vitest";
import { defaultSave, sanitizeSave } from "./save";

describe("Save", () => {
  it("lässt alte Stände ohne Stimm-Feld auf der automatischen Wahl", () => {
    const legacy = sanitizeSave({
      version: 1,
      skinId: "miri",
      mute: true,
      shake: false,
      best: { kiel: { score: 3, time: 10 } },
      clears: ["kiel"],
    });
    expect(legacy.voice).toBeNull();
    expect(legacy.skinId).toBe("miri");
    expect(legacy.mute).toBe(true);
    expect(legacy.clears).toEqual(["kiel"]);
  });

  it("behält eine gespeicherte Stimm-Wahl und verwirft fremde Versionen", () => {
    expect(sanitizeSave({ version: 1, voice: false }).voice).toBe(false);
    expect(sanitizeSave({ version: 1, voice: true }).voice).toBe(true);
    expect(sanitizeSave({ version: 2, voice: true }).voice).toBeNull();
    expect(defaultSave().voice).toBeNull();
  });
});
