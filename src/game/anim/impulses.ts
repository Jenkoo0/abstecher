/**
 * Landungs- und Staubimpulse als Punkte mit Leben.
 *
 * Andocken in draw: pro Impuls ein kurzlebiges Sprite oder ein Punkt.
 * Opacity aus `lifeMs / maxLifeMs`. Nichts davon ist ein Three-Objekt.
 * Reduced motion erzeugt keinen Staub.
 */

export type Impulse = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  lifeMs: number;
  maxLifeMs: number;
  size: number;
  kind: "dust";
};

export function spawnLandingBurst(input: {
  x: number;
  y: number;
  z: number;
  intensity: number;
  reducedMotion?: boolean;
  rng?: () => number;
}): Impulse[] {
  if (input.reducedMotion || input.intensity <= 0) return [];
  const rng = input.rng ?? Math.random;
  const count = 4 + Math.round(Math.max(0, input.intensity) * 4);
  const puffs: Impulse[] = [];
  for (let i = 0; i < count; i += 1) {
    const angle = rng() * Math.PI * 2;
    const speed = (0.6 + rng()) * Math.max(0.2, input.intensity);
    const lifeMs = 320 + rng() * 180;
    puffs.push({
      x: input.x,
      y: input.y,
      z: input.z,
      vx: Math.cos(angle) * speed,
      vy: 0.4 + rng() * 0.8,
      vz: Math.sin(angle) * speed,
      lifeMs,
      maxLifeMs: lifeMs,
      size: 0.12 + input.intensity * 0.2,
      kind: "dust",
    });
  }
  return puffs;
}

export function tickImpulses(particles: Impulse[], dtMs: number): Impulse[] {
  const dt = Math.max(0, dtMs);
  const seconds = dt / 1000;
  const next: Impulse[] = [];
  for (const puff of particles) {
    const lifeMs = puff.lifeMs - dt;
    if (lifeMs <= 0) continue;
    next.push({
      ...puff,
      lifeMs,
      x: puff.x + puff.vx * seconds,
      y: puff.y + puff.vy * seconds,
      z: puff.z + puff.vz * seconds,
      vy: puff.vy - 2.4 * seconds,
    });
  }
  return next;
}
