/**
 * Tasten, die der spätere Input-Code auf die Feel-Module legen soll.
 * C bleibt Stechen. Slide liegt auf Q: Strg fällt weg, weil Strg+W im
 * Browser den Tab schließt und W Laufen ist. Strg ist nicht zusätzlich belegt.
 * N schaltet nur die Sprachausgabe. Der Untertitel bleibt immer sichtbar.
 */

export const FEEL_BINDINGS = {
  slide: "KeyQ",
  dash: "Shift",
  jump: "Space",
  voiceToggle: "KeyN",
  /** Gleiswechsel. E liegt neben WASD und ist kein Browser-Kurzbefehl. */
  trackSwitch: "KeyE",
} as const;

export const TAKEN_BINDINGS = {
  stab: ["KeyC", "MouseLeft"],
  throw: ["KeyF", "MouseRight"],
  lookToggle: ["KeyV"],
  move: ["KeyW", "KeyA", "KeyS", "KeyD"],
} as const;
