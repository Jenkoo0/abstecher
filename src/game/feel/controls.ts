/**
 * Tasten, die der spätere Input-Code auf die Feel-Module legen soll.
 * C bleibt Stechen, wie im README. Slide liegt auf Strg.
 * N schaltet nur die Sprachausgabe der Durchsagen, nicht die Textzeile.
 */

export const FEEL_BINDINGS = {
  slide: "Control",
  dash: "Shift",
  jump: "Space",
  voiceToggle: "KeyN",
} as const;

export const TAKEN_BINDINGS = {
  stab: ["KeyC", "MouseLeft"],
  throw: ["KeyF", "MouseRight"],
  lookToggle: ["KeyV"],
  move: ["KeyW", "KeyA", "KeyS", "KeyD"],
} as const;
