/**
 * Fahrkartenkontrolleur: Treffer, Nahtreffer, Jagd-Druck.
 *
 * Einbau: einmal pro Frame mit Spieler- und Kontrolleur-Position in Metern
 * (Bodenfläche x/z). `previousDistanceM` kommt aus dem letzten Frame, am
 * Start `null`. Ein Nahtreffer zählt nur beim Eintritt in den Ring, nicht
 * solange man darin steht. Die Punkte gibt die Sim auf den Zähler.
 * Keine Kamera hier. Reduced Motion ändert die Wertung nicht.
 */

export const CONDUCTOR_HIT_M = 0.55;
export const CONDUCTOR_NEAR_M = 1.45;
export const NEAR_MISS_POINTS = 150;

export function conductorMoment(input: {
  playerX: number;
  playerZ: number;
  conductorX: number;
  conductorZ: number;
  previousDistanceM: number | null;
}) {
  const dx = input.playerX - input.conductorX;
  const dz = input.playerZ - input.conductorZ;
  const distanceM = Math.hypot(dx, dz);
  const hit = distanceM <= CONDUCTOR_HIT_M;
  const inRing = distanceM <= CONDUCTOR_NEAR_M && !hit;
  const wasOutside = input.previousDistanceM === null || input.previousDistanceM > CONDUCTOR_NEAR_M;
  const nearMiss = inRing && wasOutside;
  const pressure = Math.max(0, Math.min(1, 1 - distanceM / 8));
  return {
    distanceM,
    hit,
    nearMiss,
    points: nearMiss ? NEAR_MISS_POINTS : 0,
    pressure,
  };
}
