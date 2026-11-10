/**
 * Fester Partikelpool. `tickPool` schreibt in die vorhandenen Slots
 * und legt kein neues Array an.
 *
 * Einbau in draw: lebende Slots als Punkte zeichnen. Slide-Funken,
 * Dash-Striche, Landestaub. Reduced Motion aktiviert nichts.
 * Obergrenze ist die Pool-Länge.
 */

export const PARTICLE_CAP = 48;

export type ParticleKind = "slide-spark" | "dash-line" | "land-dust";

export type Particle = {
  alive: boolean;
  kind: ParticleKind | "none";
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  lifeMs: number;
  maxLifeMs: number;
  size: number;
};

export type EmitSpec = {
  kind: ParticleKind;
  x: number;
  y: number;
  z: number;
  count: number;
  reducedMotion?: boolean;
  rng?: () => number;
};

function dead(): Particle {
  return {
    alive: false,
    kind: "none",
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    lifeMs: 0,
    maxLifeMs: 1,
    size: 0,
  };
}

export function createParticlePool(cap = PARTICLE_CAP): Particle[] {
  const pool: Particle[] = [];
  for (let i = 0; i < cap; i += 1) pool.push(dead());
  return pool;
}

function velocity(kind: ParticleKind, rng: () => number) {
  const spread = () => rng() * 2 - 1;
  if (kind === "dash-line") return { vx: 0, vy: spread() * 0.4, vz: -10 - rng() * 4, life: 160, size: 0.08 };
  if (kind === "slide-spark") return { vx: spread() * 2.5, vy: 1.2 + rng() * 2, vz: spread() * 2.5, life: 220, size: 0.05 };
  return { vx: spread() * 1.8, vy: 1.4 + rng(), vz: spread() * 1.8, life: 320, size: 0.12 };
}

export function emitParticles(pool: Particle[], spec: EmitSpec) {
  if (spec.reducedMotion || spec.count <= 0) return 0;
  const rng = spec.rng ?? Math.random;
  let spawned = 0;
  for (const slot of pool) {
    if (spawned >= spec.count) break;
    if (slot.alive) continue;
    const motion = velocity(spec.kind, rng);
    slot.alive = true;
    slot.kind = spec.kind;
    slot.x = spec.x;
    slot.y = spec.y;
    slot.z = spec.z;
    slot.vx = motion.vx;
    slot.vy = motion.vy;
    slot.vz = motion.vz;
    slot.lifeMs = motion.life;
    slot.maxLifeMs = motion.life;
    slot.size = motion.size;
    spawned += 1;
  }
  return spawned;
}

export function tickPool(pool: Particle[], dtMs: number) {
  const seconds = Math.max(0, dtMs) / 1000;
  for (const slot of pool) {
    if (!slot.alive) continue;
    slot.lifeMs -= dtMs;
    if (slot.lifeMs <= 0) {
      slot.alive = false;
      slot.kind = "none";
      continue;
    }
    slot.x += slot.vx * seconds;
    slot.y += slot.vy * seconds;
    slot.z += slot.vz * seconds;
    slot.vy -= 9 * seconds;
  }
}

export function aliveCount(pool: Particle[]) {
  let count = 0;
  for (const slot of pool) if (slot.alive) count += 1;
  return count;
}
