import { describe, expect, it } from "vitest";
import { CALLOUT_LINES, createDelayState, effectsForCall, startDelay, stepDelay } from "./calloutEvents";

const BANNED = [/koks/i, /kokain/i, /heroin/i, /cannabis/i, /\bmeth\b/i, /\bcrack\b/i];

describe("Durchsagen als Spielereignis", () => {
  it("macht aus der Einfahrt eine Zugwelle und aus viel Verspätung Zeitlupe", () => {
    const wave = effectsForCall({ event: "train_arrive", track: 4, delayMin: 3 });
    expect(wave).toHaveLength(1);
    expect(wave[0]).toMatchObject({ kind: "train-wave", track: 4, speedMps: 18 });
    expect(wave[0]?.text).toMatch(/fährt ein/);

    const both = effectsForCall({ event: "train_arrive", track: 2, delayMin: 20 });
    expect(both.map((effect) => effect.kind)).toEqual(["train-wave", "delay"]);
    expect(both[1]).toMatchObject({ timeScale: 0.45, durationMs: 1600 });
    expect(CALLOUT_LINES.delay).toMatch(/Verspätung/);
    for (const line of Object.values(CALLOUT_LINES)) {
      expect(line.length).toBeGreaterThan(40);
      for (const pattern of BANNED) expect(line).not.toMatch(pattern);
    }
  });

  it("faltet die Verspätung unter den Hitstop, ohne die Uhren zu trennen", () => {
    const running = startDelay(false);
    expect(running.smear).toBe(true);
    const slowed = stepDelay(running, 100, 1);
    expect(slowed.timeScale).toBeCloseTo(0.45);
    expect(slowed.simDtMs).toBeCloseTo(45);
    const frozen = stepDelay(running, 100, 0);
    expect(frozen.simDtMs).toBe(0);
    expect(frozen.state.remainingMs).toBe(1500);

    let state = startDelay(true);
    expect(state.smear).toBe(false);
    state = stepDelay(state, 1600, 1).state;
    const done = stepDelay(state, 16, 1);
    expect(done.timeScale).toBe(1);
    expect(done.simDtMs).toBe(16);
    expect(createDelayState().remainingMs).toBe(0);
  });
});
