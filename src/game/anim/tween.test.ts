import { describe, expect, it } from "vitest";
import { easeLinear } from "./easing";
import { createNumberTween, createVec3Tween, stepNumberTween, stepVec3Tween } from "./tween";

describe("Tweens", () => {
  it("läuft von Anfang nach Ende und bleibt dort", () => {
    const started = createNumberTween(0, 100, 200);
    const mid = stepNumberTween(started, 100, { easing: easeLinear });
    expect(mid.value).toBeCloseTo(50);
    expect(mid.done).toBe(false);

    const end = stepNumberTween(mid.tween, 100, { easing: easeLinear });
    expect(end.value).toBe(100);
    expect(end.done).toBe(true);

    const extra = stepNumberTween(end.tween, 50, { easing: easeLinear });
    expect(extra.value).toBe(100);
    expect(extra.tween.elapsedMs).toBe(200);
  });

  it("springt bei reduced motion sofort ans Ziel", () => {
    const snapped = stepNumberTween(createNumberTween(0, 100, 800), 16, { reducedMotion: true });
    expect(snapped.value).toBe(100);
    expect(snapped.done).toBe(true);
  });

  it("mischt Vektoren je Achse", () => {
    const tween = createVec3Tween({ x: 0, y: 2, z: -4 }, { x: 10, y: 2, z: 0 }, 100);
    const stepped = stepVec3Tween(tween, 50, { easing: easeLinear });
    expect(stepped.value.x).toBeCloseTo(5);
    expect(stepped.value.y).toBeCloseTo(2);
    expect(stepped.value.z).toBeCloseTo(-2);
  });
});
