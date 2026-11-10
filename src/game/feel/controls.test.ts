import { describe, expect, it } from "vitest";
import { FEEL_BINDINGS, TAKEN_BINDINGS } from "./controls";

describe("Tasten", () => {
  it("legt den Slide auf Q und lässt Strg frei", () => {
    expect(FEEL_BINDINGS.slide).toBe("KeyQ");
    expect(FEEL_BINDINGS.dash).toBe("Shift");
    expect(FEEL_BINDINGS.jump).toBe("Space");
    expect(FEEL_BINDINGS.voiceToggle).toBe("KeyN");
    expect(FEEL_BINDINGS.trackSwitch).toBe("KeyE");
    const taken = Object.values(TAKEN_BINDINGS).flat();
    expect(taken).toContain("KeyC");
    expect(taken).toContain("KeyW");
    expect(taken).not.toContain(FEEL_BINDINGS.slide);
    expect(taken).not.toContain(FEEL_BINDINGS.voiceToggle);
    expect(taken).not.toContain(FEEL_BINDINGS.trackSwitch);
    expect(Object.values(FEEL_BINDINGS)).not.toContain("Control");
  });
});
