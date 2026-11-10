import { describe, expect, it } from "vitest";
import { FEEL_BINDINGS, TAKEN_BINDINGS } from "./controls";

describe("Tasten", () => {
  it("legt den Slide auf Strg, nicht auf Stechen", () => {
    expect(FEEL_BINDINGS.slide).toBe("Control");
    expect(FEEL_BINDINGS.dash).toBe("Shift");
    expect(FEEL_BINDINGS.jump).toBe("Space");
    expect(FEEL_BINDINGS.voiceToggle).toBe("KeyN");
    const taken = Object.values(TAKEN_BINDINGS).flat();
    expect(taken).toContain("KeyC");
    expect(taken).not.toContain(FEEL_BINDINGS.slide);
    expect(taken).not.toContain(FEEL_BINDINGS.voiceToggle);
  });
});
