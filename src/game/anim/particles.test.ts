import { describe, expect, it } from "vitest";
import { aliveCount, createParticlePool, emitParticles, tickPool } from "./particles";

describe("Partikelpool", () => {
  it("wächst nicht über die Kappe und läuft in den Slots ab", () => {
    const pool = createParticlePool(4);
    const length = pool.length;
    const spawned = emitParticles(pool, { kind: "slide-spark", x: 1, y: 0, z: 2, count: 10, rng: () => 0.5 });
    expect(spawned).toBe(4);
    expect(pool).toHaveLength(length);
    expect(aliveCount(pool)).toBe(4);
    const again = emitParticles(pool, { kind: "dash-line", x: 0, y: 1, z: 0, count: 3, rng: () => 0.5 });
    expect(again).toBe(0);
    expect(pool).toHaveLength(4);

    tickPool(pool, 50);
    expect(pool[0]?.y).toBeGreaterThan(0);
    expect(pool).toHaveLength(4);
    tickPool(pool, 5000);
    expect(aliveCount(pool)).toBe(0);
  });

  it("spawnt bei Reduced Motion nichts", () => {
    const pool = createParticlePool(4);
    expect(emitParticles(pool, { kind: "land-dust", x: 0, y: 0, z: 0, count: 3, reducedMotion: true })).toBe(0);
    expect(aliveCount(pool)).toBe(0);
  });
});
