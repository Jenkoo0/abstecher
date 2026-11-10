/**
 * Durchsagen, die etwas im Spiel auslösen.
 *
 * Einbau: nach `pickAnnouncement` `effectsForCall` lesen.
 * Die Zugwelle ist eine Gefahrenzone für die Sim (Gleis, Warnzeit, Tempo).
 * Verspätung ist eine eigene Zeitskala und kein Hitstop. `stepDelay`
 * tickt in Echtzeit, `simDtMs` ist Echtzeit mal Hitstop-Skala mal Verspätung.
 * So bleiben Physik und Logik auf einer Uhr. Bei Hitstop bleibt simDt 0.
 * Reduced Motion schaltet nur die visuelle Unschärfe ab, nicht die Zeitskala,
 * sonst wäre die Verspätung je nach Systemeinstellung leichter oder schwerer.
 */

import type { AnnouncementEvent } from "./announcements";

export const DELAY_SCALE = 0.45;
export const DELAY_MS = 1600;
export const DELAY_MIN_FOR_SLOW = 12;

export const CALLOUT_LINES = {
  train:
    "Achtung, der Zug fährt ein. Bitte zurücktreten, die Bahnsteigkante ist gerade keine Abkürzung. Grund dafür ist eine Einfahrt ohne weiteren Aufschub.",
  delay:
    "Wegen einer Verspätung im Betriebsablauf läuft die Bahnsteiguhr langsamer. Grund dafür ist ein Fahrplan, der sich selbst überholt hat.",
} as const;

export type TrainWave = {
  kind: "train-wave";
  track: number;
  warningMs: number;
  dangerMs: number;
  speedMps: number;
  text: string;
};

export type DelayEffect = {
  kind: "delay";
  timeScale: number;
  durationMs: number;
  text: string;
};

export type CalloutEffect = TrainWave | DelayEffect;

export type DelayState = {
  remainingMs: number;
  smear: boolean;
};

export function createDelayState(): DelayState {
  return { remainingMs: 0, smear: false };
}

export function effectsForCall(input: {
  event: AnnouncementEvent;
  track?: number;
  delayMin?: number;
}): CalloutEffect[] {
  const effects: CalloutEffect[] = [];
  if (input.event === "train_arrive") {
    effects.push({
      kind: "train-wave",
      track: input.track ?? 3,
      warningMs: 900,
      dangerMs: 700,
      speedMps: 18,
      text: CALLOUT_LINES.train,
    });
  }
  if ((input.delayMin ?? 0) >= DELAY_MIN_FOR_SLOW) {
    effects.push({
      kind: "delay",
      timeScale: DELAY_SCALE,
      durationMs: DELAY_MS,
      text: CALLOUT_LINES.delay,
    });
  }
  return effects;
}

export function startDelay(reducedMotion = false): DelayState {
  return { remainingMs: DELAY_MS, smear: !reducedMotion };
}

export function stepDelay(state: DelayState, realDtMs: number, hitstopScale: number) {
  const dt = Math.max(0, realDtMs);
  const active = state.remainingMs > 0;
  const delayScale = active ? DELAY_SCALE : 1;
  const timeScale = hitstopScale * delayScale;
  return {
    state: {
      remainingMs: Math.max(0, state.remainingMs - dt),
      smear: active ? state.smear : false,
    },
    timeScale,
    simDtMs: dt * timeScale,
  };
}
