import { describe, expect, it } from "vitest";
import { STAMP_WINDOW_MS, createStampState, stepStamp } from "./stampCombo";

describe("Stempel-Combo", () => {
  it("stempelt Slide, Dash und Sprung zu Zugbindung aufgehoben", () => {
    let state = createStampState();
    state = stepStamp(state, { dtMs: 16, stamp: "slide" });
    expect(state.label).toBe("Entwerter");
    expect(state.multiplier).toBe(1.5);
    state = stepStamp(state, { dtMs: 200, stamp: "dash" });
    expect(state.label).toBe("Anschlusszug");
    state = stepStamp(state, { dtMs: 200, stamp: "jump" });
    expect(state.chain).toEqual(["slide", "dash", "jump"]);
    expect(state.label).toBe("Zugbindung aufgehoben");
    expect(state.multiplier).toBe(2.5);
  });

  it("ignoriert die falsche Reihenfolge, bricht bei Treffer ab und verfällt", () => {
    const dashFirst = stepStamp(createStampState(), { dtMs: 16, stamp: "dash" });
    expect(dashFirst.chain).toEqual([]);
    expect(dashFirst.multiplier).toBe(1);

    let state = stepStamp(createStampState(), { dtMs: 16, stamp: "slide" });
    state = stepStamp(state, { dtMs: 40, stamp: "jump" });
    expect(state.chain).toEqual(["slide"]);

    const broken = stepStamp(state, { dtMs: 16, stamp: null, broke: true });
    expect(broken.multiplier).toBe(1);

    const expired = stepStamp(state, { dtMs: STAMP_WINDOW_MS + 1, stamp: "dash" });
    expect(expired.chain).toEqual([]);
  });
});
