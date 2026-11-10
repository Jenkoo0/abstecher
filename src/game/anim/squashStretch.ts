/**
 * Squash and Stretch als Skalierung.
 *
 * Andocken in view3d: `scale` auf die Gruppe der Figur legen.
 * Die Hitbox bleibt unverändert. `simDt` aus dem Hitstop verwenden,
 * damit die Pose im Einfrieren mit dem Sprung stehen bleibt.
 * Reduced motion lässt die Skalierung bei 1.
 */

export type SquashState = {
  jumpStretch: number;
  landSquash: number;
  wasAirborne: boolean;
};

export type SquashScale = { x: number; y: number; z: number };

const JUMP_AMOUNT = 0.22;
const LAND_AMOUNT = 0.24;

export function createSquashState(): SquashState {
  return { jumpStretch: 0, landSquash: 0, wasAirborne: false };
}

function decay(value: number, dtMs: number, tauMs: number) {
  if (value <= 0) return 0;
  return value * Math.exp(-Math.max(0, dtMs) / tauMs);
}

export function stepSquash(
  state: SquashState,
  input: { dtMs: number; vy: number; grounded: boolean; jumped: boolean; reducedMotion?: boolean },
): { state: SquashState; scale: SquashScale } {
  if (input.reducedMotion) {
    return {
      state: { jumpStretch: 0, landSquash: 0, wasAirborne: !input.grounded || input.jumped },
      scale: { x: 1, y: 1, z: 1 },
    };
  }

  let jumpStretch = state.jumpStretch;
  let landSquash = state.landSquash;
  const landing = input.grounded && state.wasAirborne && !input.jumped;

  if (input.jumped) {
    jumpStretch = 1;
    landSquash = 0;
  } else if (landing) {
    landSquash = 1;
    jumpStretch = 0;
  } else {
    jumpStretch = decay(jumpStretch, input.dtMs, 160);
    landSquash = decay(landSquash, input.dtMs, 150);
  }

  const y = Math.max(0.4, 1 + JUMP_AMOUNT * jumpStretch - LAND_AMOUNT * landSquash);
  const xz = 1 / Math.sqrt(y);
  return {
    state: {
      jumpStretch,
      landSquash,
      wasAirborne: !input.grounded || input.jumped,
    },
    scale: { x: xz, y, z: xz },
  };
}
