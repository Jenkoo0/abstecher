import { describe, expect, it } from "vitest";
import { COYOTE_MS, JUMP_BUFFER_MS, createJumpState, stepJump, type JumpState } from "./jump";

const ground = {
  grounded: true,
  jumpPressed: false,
  jumpHeld: false,
  dtMs: 16,
};

function air(overrides: Partial<Parameters<typeof stepJump>[1]> = {}) {
  return { grounded: false, jumpPressed: false, jumpHeld: false, dtMs: 16, ...overrides };
}

function peakHeight(hold: boolean) {
  let state = createJumpState();
  let y = 0;
  let leftGround = false;
  for (let t = 0; t < 2400; t += 16) {
    const first = t === 0;
    const stepped = stepJump(state, {
      dtMs: 16,
      grounded: first,
      jumpPressed: first,
      jumpHeld: hold || first,
    });
    state = stepped.state;
    if (stepped.jumped) leftGround = true;
    y += state.vy * 0.016;
    if (leftGround && state.vy <= 0) break;
  }
  return y;
}

describe("Sprungphysik", () => {
  it("lässt vom Boden springen", () => {
    const stepped = stepJump(createJumpState(), {
      ...ground,
      jumpPressed: true,
      jumpHeld: true,
    });
    expect(stepped.jumped).toBe(true);
    expect(stepped.state.vy).toBeGreaterThan(0);
  });

  it("gibt Coyote Time von 100 ms, danach nicht mehr", () => {
    expect(COYOTE_MS).toBe(100);
    const grounded = stepJump(createJumpState(), ground).state;

    const inside = stepJump(grounded, air({ dtMs: 100, jumpPressed: true, jumpHeld: true }));
    expect(inside.jumped).toBe(true);

    const outside = stepJump(grounded, air({ dtMs: 101, jumpPressed: true, jumpHeld: true }));
    expect(outside.jumped).toBe(false);
  });

  it("erlaubt nach einem Sprung keinen zweiten Sprung über Coyote Time", () => {
    const jumped = stepJump(createJumpState(), {
      ...ground,
      jumpPressed: true,
      jumpHeld: true,
    });
    const again = stepJump(jumped.state, air({ jumpPressed: true, jumpHeld: true }));
    expect(again.jumped).toBe(false);
  });

  it("merkt sich einen zu frühen Sprung 120 ms lang", () => {
    expect(JUMP_BUFFER_MS).toBe(120);
    const falling = stepJump(createJumpState(), air({ dtMs: 500 })).state;
    const pressed = stepJump(falling, air({ jumpPressed: true })).state;

    const inside = stepJump(pressed, { ...ground, dtMs: 120, jumpHeld: true });
    expect(inside.jumped).toBe(true);

    const armed = stepJump(falling, air({ jumpPressed: true })).state;
    const outside = stepJump(armed, { ...ground, dtMs: 121, jumpHeld: true });
    expect(outside.jumped).toBe(false);
  });

  it("verbraucht den Jump-Buffer nur einmal", () => {
    const falling = stepJump(createJumpState(), air({ dtMs: 500 })).state;
    const pressed = stepJump(falling, air({ jumpPressed: true })).state;
    const landed = stepJump(pressed, { ...ground, dtMs: 40, jumpHeld: true });
    expect(landed.jumped).toBe(true);
    const stuck = stepJump(landed.state, { ...ground, dtMs: 16, jumpHeld: true });
    expect(stuck.jumped).toBe(false);
  });

  it("springt bei frühem Loslassen niedriger als bei gehaltenem Sprung", () => {
    const tapped = peakHeight(false);
    const held = peakHeight(true);
    expect(tapped).toBeGreaterThan(0);
    expect(held).toBeGreaterThan(tapped);
  });

  it("beschleunigt im Fall stärker als im Aufstieg", () => {
    let state = createJumpState();
    state = stepJump(state, { ...ground, jumpPressed: true, jumpHeld: true }).state;
    const rising: number[] = [];
    const falling: number[] = [];
    for (let i = 0; i < 120; i += 1) {
      const before = state.vy;
      state = stepJump(state, air({ jumpHeld: true })).state;
      const drop = before - state.vy;
      if (before > 40 && state.vy > 0) rising.push(drop);
      if (before < -40) falling.push(drop);
    }
    expect(rising.length).toBeGreaterThan(0);
    expect(falling.length).toBeGreaterThan(0);
    const avg = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
    expect(avg(falling)).toBeGreaterThan(avg(rising));
  });

  it("kürzt die Aufwärtsgeschwindigkeit nur einmal", () => {
    let state: JumpState = stepJump(createJumpState(), {
      ...ground,
      jumpPressed: true,
      jumpHeld: true,
    }).state;
    const before = state.vy;
    state = stepJump(state, air({ jumpHeld: false })).state;
    const afterCut = state.vy;
    state = stepJump(state, air({ jumpHeld: false })).state;
    const cutDrop = before - afterCut;
    const laterDrop = afterCut - state.vy;
    expect(cutDrop).toBeGreaterThan(laterDrop);
    expect(afterCut).toBeGreaterThan(0);
  });
});
