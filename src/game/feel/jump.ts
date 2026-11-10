/**
 * Variable Sprunghöhe, Coyote Time und Jump-Buffer.
 *
 * Einbau: einmal pro Frame mit dem simDt aus `tickHitstop` / `stepFeel`
 * aufrufen, nicht mit der Roh-Framezeit. `grounded` kommt aus der Kollision.
 * Solange `vy > 0` ist, gilt der Körper als in der Luft, auch wenn die
 * Kollision denselben Frame noch Boden meldet. Nach `jumped === true`
 * die Bodenhaftung für diesen Frame nicht wieder aufzwingen.
 */

export const COYOTE_MS = 100;
export const JUMP_BUFFER_MS = 120;

/**
 * Meter pro Sekunde. Mit `GRAVITY_RISE` liegt der gehaltene Scheitel bei
 * etwa v² / (2g) ≈ 2,4 m.
 */
export const JUMP_SPEED = 10.5;
/** Meter pro Sekunde², nur solange `vy > 0`. */
export const GRAVITY_RISE = 23;
/** Meter pro Sekunde² im Fall, deutlich stärker als der Aufstieg. */
export const GRAVITY_FALL = 52;
/** Faktor, wenn die Sprungtaste früh losgelassen wird. Wirkt nur einmal. */
export const JUMP_CUT = 0.48;

export type JumpState = {
  vy: number;
  airMs: number;
  /** Alter des gedrückten Sprungs. `null` heißt: nichts gepuffert. */
  bufferMs: number | null;
  jumpedSinceGround: boolean;
  cutApplied: boolean;
};

export type JumpInput = {
  dtMs: number;
  grounded: boolean;
  jumpPressed: boolean;
  jumpHeld: boolean;
};

export function createJumpState(): JumpState {
  return {
    vy: 0,
    airMs: 0,
    bufferMs: null,
    jumpedSinceGround: false,
    cutApplied: false,
  };
}

export function stepJump(state: JumpState, input: JumpInput): { state: JumpState; jumped: boolean } {
  const dt = Math.max(0, input.dtMs);
  let { vy, airMs, bufferMs, jumpedSinceGround, cutApplied } = state;
  let jumped = false;

  if (input.grounded && vy <= 0) {
    airMs = 0;
    jumpedSinceGround = false;
    cutApplied = false;
    vy = 0;
  } else {
    airMs += dt;
  }

  if (input.jumpPressed) bufferMs = 0;
  else if (bufferMs !== null) bufferMs += dt;

  if (bufferMs !== null && bufferMs > JUMP_BUFFER_MS) bufferMs = null;

  const coyote = !jumpedSinceGround && airMs <= COYOTE_MS;
  if (bufferMs !== null && !jumpedSinceGround && (input.grounded || coyote)) {
    vy = JUMP_SPEED;
    bufferMs = null;
    jumpedSinceGround = true;
    cutApplied = false;
    jumped = true;
  }

  const airborne = jumped || vy > 0 || !input.grounded;
  if (airborne) {
    if (vy > 0 && !input.jumpHeld && !cutApplied) {
      vy *= JUMP_CUT;
      cutApplied = true;
    }
    const gravity = vy > 0 ? GRAVITY_RISE : GRAVITY_FALL;
    vy -= gravity * (dt / 1000);
  }

  return {
    state: { vy, airMs, bufferMs, jumpedSinceGround, cutApplied },
    jumped,
  };
}
