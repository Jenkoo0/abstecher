import { describe, expect, it } from "vitest";
import { PLAY_HOOKS } from "./playHooks";

describe("Einbau der neuen Mechaniken", () => {
  it("nennt Weiche, Durchsage, Stempel, Kontrolleur und Bahnsteig", () => {
    const ids = PLAY_HOOKS.map((hook) => hook.id);
    expect(ids).toEqual([
      "track-switch",
      "callout-train",
      "callout-delay",
      "stamp-combo",
      "conductor",
      "platform",
    ]);
    for (const hook of PLAY_HOOKS) {
      expect(hook.reads.length).toBeGreaterThan(8);
      expect(hook.writes.length).toBeGreaterThan(8);
    }
  });
});
