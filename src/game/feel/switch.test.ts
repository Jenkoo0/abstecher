import { describe, expect, it } from "vitest";
import { FEEL_BINDINGS } from "./controls";
import {
  LANE_PITCH_M,
  SWITCH_BUFFER_MS,
  SWITCH_TELEGRAPH_MS,
  SWITCH_WINDOW_MS,
  createSwitchState,
  requestSwitch,
  stepSwitch,
} from "./switch";

describe("Gleiswechsel", () => {
  it("wechselt nur im Fenster und merkt sich einen knappen Druck", () => {
    expect(FEEL_BINDINGS.trackSwitch).toBe("KeyE");
    let state = requestSwitch(createSwitchState(1), 2);
    const early = stepSwitch(state, { dtMs: 16, pressed: true });
    expect(early.state.lane).toBe(1);
    expect(early.state.phase).toBe("telegraph");

    state = stepSwitch(state, { dtMs: SWITCH_TELEGRAPH_MS - 40, pressed: false }).state;
    state = stepSwitch(state, { dtMs: 16, pressed: true }).state;
    expect(state.bufferMs).toBe(SWITCH_BUFFER_MS);
    const opened = stepSwitch(state, { dtMs: 30, pressed: false });
    expect(opened.state.phase).toBe("recover");
    expect(opened.state.lane).toBe(2);
    expect(opened.laneOffsetM).toBe(2 * LANE_PITCH_M);
    expect(opened.committed).toBe(true);
  });

  it("bleibt auf der Spur, wenn das Fenster verstreicht", () => {
    let state = requestSwitch(createSwitchState(0), 1);
    state = stepSwitch(state, { dtMs: SWITCH_TELEGRAPH_MS, pressed: false }).state;
    expect(state.phase).toBe("window");
    const missed = stepSwitch(state, { dtMs: SWITCH_WINDOW_MS, pressed: false });
    expect(missed.state.lane).toBe(0);
    expect(missed.state.succeeded).toBe(false);
    expect(missed.laneOffsetM).toBe(0);
  });

  it("nimmt den Kamerahinweis bei Reduced Motion weg", () => {
    const state = requestSwitch(createSwitchState(1), 0);
    const shown = stepSwitch(state, { dtMs: 16, pressed: false });
    const quiet = stepSwitch(state, { dtMs: 16, pressed: false, reducedMotion: true });
    expect(shown.cameraLeadM).not.toBe(0);
    expect(quiet.cameraLeadM).toBe(0);
    expect(quiet.state.phase).toBe(shown.state.phase);
  });
});
