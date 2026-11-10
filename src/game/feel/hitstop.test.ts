import { describe, expect, it } from "vitest";
import { createHitstopState, tickHitstop, triggerHitstop } from "./hitstop";

function mag(shake: { x: number; y: number }) {
  return Math.hypot(shake.x, shake.y);
}

describe("Hitstop", () => {
  it("friert Treffer 40 bis 90 ms ein, Kills und Würfe länger", () => {
    const hit = triggerHitstop(createHitstopState(), "hit");
    const thrown = triggerHitstop(createHitstopState(), "throw");
    const kill = triggerHitstop(createHitstopState(), "kill");

    for (const stop of [hit, thrown, kill]) {
      expect(stop.remainingMs).toBeGreaterThanOrEqual(40);
      expect(stop.remainingMs).toBeLessThanOrEqual(90);
    }
    expect(thrown.remainingMs).toBeGreaterThan(hit.remainingMs);
    expect(kill.remainingMs).toBeGreaterThan(hit.remainingMs);
    expect(kill.remainingMs).toBeGreaterThanOrEqual(thrown.remainingMs);
  });

  it("setzt während des Einfrierens eine gemeinsame Zeitskala von 0", () => {
    const hit = triggerHitstop(createHitstopState(), "hit");
    const tick = tickHitstop(hit, 16);
    expect(tick.timeScale).toBe(0);
    expect(tick.simDtMs).toBe(0);

    const ended = tickHitstop(hit, hit.remainingMs);
    expect(ended.state.remainingMs).toBe(0);
    expect(ended.simDtMs).toBe(0);

    const resumed = tickHitstop(ended.state, 20);
    expect(resumed.timeScale).toBe(1);
    expect(resumed.simDtMs).toBe(20);
  });

  it("lässt Physik und Cooldown dieselbe skalierte Zeit sehen", () => {
    let position = 0;
    let cooldown = 100;
    const speed = 10;
    let stop = triggerHitstop(createHitstopState(), "kill");

    const frozen = tickHitstop(stop, 16);
    position += speed * (frozen.simDtMs / 1000);
    cooldown -= frozen.simDtMs;
    expect(position).toBe(0);
    expect(cooldown).toBe(100);

    const draining = tickHitstop(frozen.state, 1000);
    position += speed * (draining.simDtMs / 1000);
    cooldown -= draining.simDtMs;

    const live = tickHitstop(draining.state, 20);
    position += speed * (live.simDtMs / 1000);
    cooldown -= live.simDtMs;
    expect(live.simDtMs).toBe(20);
    expect(position).toBeCloseTo(0.2);
    expect(cooldown).toBe(80);
  });

  it("stapelt Einfrieren nicht und lässt einen kürzeren Treffer einen längeren nicht abschneiden", () => {
    const once = triggerHitstop(createHitstopState(), "hit");
    const twice = triggerHitstop(once, "hit");
    expect(twice.remainingMs).toBe(once.remainingMs);

    const killMs = triggerHitstop(createHitstopState(), "kill").remainingMs;
    const upgraded = triggerHitstop(once, "kill");
    expect(upgraded.remainingMs).toBe(killMs);

    const kept = triggerHitstop(upgraded, "hit");
    expect(kept.remainingMs).toBe(killMs);
  });

  it("wackelt die Kamera in Schlagrichtung, stärker bei Kill und Wurf", () => {
    const idle = tickHitstop(createHitstopState(), 16);
    expect(mag(idle.shake)).toBe(0);

    const hit = tickHitstop(triggerHitstop(createHitstopState(), "hit", { x: 1, y: 0 }), 16);
    const thrown = tickHitstop(triggerHitstop(createHitstopState(), "throw", { x: 1, y: 0 }), 16);
    const kill = tickHitstop(triggerHitstop(createHitstopState(), "kill", { x: 0, y: 1 }), 16);

    expect(hit.shake.x).toBeGreaterThan(0);
    expect(hit.shake.y).toBe(0);
    expect(kill.shake.y).toBeGreaterThan(0);
    expect(kill.shake.x).toBe(0);
    expect(mag(kill.shake)).toBeGreaterThan(mag(hit.shake));
    expect(mag(thrown.shake)).toBeGreaterThan(mag(hit.shake));

    let state = triggerHitstop(createHitstopState(), "hit");
    state = tickHitstop(state, state.remainingMs).state;
    const settled = tickHitstop(state, 500);
    expect(settled.timeScale).toBe(1);
    expect(mag(settled.shake)).toBe(0);
  });
});
