/**
 * Einbaupunkte der zusätzlichen Mechaniken, sobald sim und view3d da sind.
 * Coyote Time und Jump-Buffer liegen schon in `jump.ts` und werden hier nicht wiederholt.
 */

export const PLAY_HOOKS = [
  {
    id: "track-switch",
    reads: "stepSwitch().laneOffsetM und cameraLeadM",
    writes: "sim: Spur versetzen. view3d: Kamerahinweis, bei Reduced Motion 0. Taste E.",
  },
  {
    id: "callout-train",
    reads: "effectsForCall train-wave",
    writes: "sim: Gefahrenfenster auf dem Gleis. UI: Zeile aus CALLOUT_LINES.train.",
  },
  {
    id: "callout-delay",
    reads: "stepDelay().simDtMs",
    writes: "sim: dieselbe simDt für alle Systeme, Hitstop bleibt der Faktor 0. Unschärfe nur ohne Reduced Motion.",
  },
  {
    id: "stamp-combo",
    reads: "stepStamp().multiplier und label",
    writes: "sim: Punktemultiplikator. HUD: Stempelname.",
  },
  {
    id: "conductor",
    reads: "conductorMoment()",
    writes: "sim: Nahtreffer-Punkte und Treffer. HUD: Jagd-Druck optional am Rand.",
  },
  {
    id: "platform",
    reads: "resolvePlatform()",
    writes: "sim: Rolltreppen-Mitnahme und Gepäck-Stolpern zur Spielerbewegung addieren.",
  },
] as const;
