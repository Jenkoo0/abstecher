/**
 * Rolltreppe und Gepäck auf dem Bahnsteig, in Metern.
 *
 * Einbau: `resolvePlatform` nach der eigenen Bewegung. `carryX/Z` zur
 * Wunschgeschwindigkeit addieren. `tripped` startet eine kurze Strafe
 * in der Sim. Reduced Motion ändert die Mitnahme nicht, nur spätere
 * Wackel-Animationen dürfen entfallen.
 */

export type Escalator = {
  kind: "escalator";
  x: number;
  z: number;
  w: number;
  d: number;
  dirX: number;
  dirZ: number;
  speedMps: number;
};

export type Luggage = {
  kind: "luggage";
  x: number;
  z: number;
  w: number;
  d: number;
  tripSpeedMps: number;
};

export type PlatformProp = Escalator | Luggage;

export const LUGGAGE_TRIP_MPS = 3.5;

function inside(px: number, pz: number, box: { x: number; z: number; w: number; d: number }) {
  return px >= box.x && px <= box.x + box.w && pz >= box.z && pz <= box.z + box.d;
}

export function resolvePlatform(
  player: { x: number; z: number; speedMps: number },
  props: PlatformProp[],
) {
  let carryX = 0;
  let carryZ = 0;
  let tripped = false;
  for (const prop of props) {
    if (!inside(player.x, player.z, prop)) continue;
    if (prop.kind === "escalator") {
      const length = Math.hypot(prop.dirX, prop.dirZ) || 1;
      carryX += (prop.dirX / length) * prop.speedMps;
      carryZ += (prop.dirZ / length) * prop.speedMps;
    } else if (player.speedMps >= prop.tripSpeedMps) {
      tripped = true;
    }
  }
  return { carryX, carryZ, tripped };
}
