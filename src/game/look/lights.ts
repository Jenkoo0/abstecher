/**
 * Lichtvorgaben in Meter und Farbwerten. view3d erzeugt daraus die echten Lichter.
 * Nachtbahnhof: kaltes Umgebungslicht, warme Kioske, Neon, Zugscheinwerfer.
 */

import { PALETTE } from "./tokens";

export const LIGHTS = {
  hall: { color: "#243044", intensity: 0.38 },
  neon: { color: PALETTE.neon, intensity: 2.1, distanceM: 8 },
  kiosk: { color: PALETTE.warm, intensity: 1.5, distanceM: 6 },
  headlight: { color: "#F4F7FF", intensity: 3.6, distanceM: 28, angleRad: 0.42 },
} as const;
