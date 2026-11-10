import { describe, expect, it } from "vitest";
import { createSquashState, stepSquash } from "./squashStretch";

describe("Squash and Stretch", () => {
  it("streckt beim Absprung und staucht bei der Landung, Volumen bleibt", () => {
    const idle = stepSquash(createSquashState(), { dtMs: 16, vy: 0, grounded: true, jumped: false });
    expect(idle.scale).toEqual({ x: 1, y: 1, z: 1 });

    const jumped = stepSquash(createSquashState(), { dtMs: 16, vy: 400, grounded: false, jumped: true });
    expect(jumped.scale.y).toBeGreaterThan(1);
    expect(jumped.scale.x).toBeLessThan(1);
    expect(jumped.scale.z).toBeCloseTo(jumped.scale.x);
    expect(jumped.scale.x * jumped.scale.y * jumped.scale.z).toBeCloseTo(1, 4);

    const landed = stepSquash(jumped.state, { dtMs: 16, vy: -180, grounded: true, jumped: false });
    expect(landed.scale.y).toBeLessThan(1);
    expect(landed.scale.x).toBeGreaterThan(1);
    expect(landed.scale.x * landed.scale.y * landed.scale.z).toBeCloseTo(1, 4);
  });

  it("klingt aus und bleibt bei reduced motion ruhig", () => {
    let state = stepSquash(createSquashState(), { dtMs: 16, vy: -40, grounded: true, jumped: false }).state;
    state = stepSquash(state, { dtMs: 16, vy: 300, grounded: false, jumped: true }).state;
    state = stepSquash(state, { dtMs: 16, vy: -80, grounded: true, jumped: false }).state;
    for (let i = 0; i < 30; i += 1) {
      state = stepSquash(state, { dtMs: 40, vy: 0, grounded: true, jumped: false }).state;
    }
    const rest = stepSquash(state, { dtMs: 16, vy: 0, grounded: true, jumped: false });
    expect(rest.scale.y).toBeCloseTo(1, 1);

    const reduced = stepSquash(createSquashState(), {
      dtMs: 16,
      vy: 400,
      grounded: false,
      jumped: true,
      reducedMotion: true,
    });
    expect(reduced.scale).toEqual({ x: 1, y: 1, z: 1 });
  });
});
