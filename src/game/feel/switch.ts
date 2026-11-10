/**
 * Gleiswechsel mit Ansage-Fenster.
 *
 * Einbau in der Sim: `requestSwitch` wenn die Weiche offen geht,
 * danach `stepSwitch` mit simDt und der Kante von E (`KeyE`).
 * `laneOffsetM` ist die Soll-Spur in Metern. view3d liest `cameraLeadM`
 * nur als seitlichen Kamerahinweis. Bei Reduced Motion ist der Hinweis 0,
 * der Wechsel selbst bleibt, sonst wäre die Weiche nur noch Dekoration.
 */

export const LANE_PITCH_M = 3.2;
export const SWITCH_TELEGRAPH_MS = 420;
export const SWITCH_WINDOW_MS = 220;
export const SWITCH_BUFFER_MS = 100;
export const SWITCH_RECOVER_MS = 180;

export type SwitchPhase = "idle" | "telegraph" | "window" | "recover";

export type SwitchState = {
  phase: SwitchPhase;
  phaseMs: number;
  lane: number;
  targetLane: number;
  bufferMs: number;
  succeeded: boolean | null;
};

export function createSwitchState(lane = 1): SwitchState {
  return {
    phase: "idle",
    phaseMs: 0,
    lane,
    targetLane: lane,
    bufferMs: 0,
    succeeded: null,
  };
}

export function requestSwitch(state: SwitchState, targetLane: number): SwitchState {
  if (state.phase !== "idle" || targetLane === state.lane) return state;
  return {
    ...state,
    phase: "telegraph",
    phaseMs: 0,
    targetLane,
    bufferMs: 0,
    succeeded: null,
  };
}

export function stepSwitch(
  state: SwitchState,
  input: { dtMs: number; pressed: boolean; reducedMotion?: boolean },
) {
  const dt = Math.max(0, input.dtMs);
  let { phase, phaseMs, lane, targetLane, bufferMs, succeeded } = state;
  phaseMs += dt;
  bufferMs = input.pressed ? SWITCH_BUFFER_MS : Math.max(0, bufferMs - dt);

  const commit = () => {
    lane = targetLane;
    phase = "recover";
    phaseMs = 0;
    bufferMs = 0;
    succeeded = true;
  };

  if (phase === "telegraph" && phaseMs >= SWITCH_TELEGRAPH_MS) {
    phase = "window";
    phaseMs = 0;
  }
  if (phase === "window" && bufferMs > 0) commit();
  else if (phase === "window" && phaseMs >= SWITCH_WINDOW_MS) {
    phase = "recover";
    phaseMs = 0;
    bufferMs = 0;
    succeeded = false;
  }
  if (phase === "recover" && phaseMs >= SWITCH_RECOVER_MS) {
    phase = "idle";
    phaseMs = 0;
  }

  const sign = Math.sign(targetLane - lane === 0 ? targetLane - state.lane : targetLane - lane);
  const hinting = phase === "telegraph" || phase === "window";
  const cameraLeadM = input.reducedMotion || !hinting ? 0 : sign * 0.18;

  return {
    state: { phase, phaseMs, lane, targetLane, bufferMs, succeeded },
    laneOffsetM: lane * LANE_PITCH_M,
    cameraLeadM,
    committed: succeeded === true && phase === "recover" && phaseMs === 0,
  };
}
