/**
 * Reduced motion. Die Module bekommen den Boolean von außen.
 * `readReducedMotionFromWindow` ist der einzige Blick auf den Browser
 * und liefert in Tests ohne Fenster `false`.
 */

export function prefersReducedMotion(query: { matches: boolean } | null | undefined) {
  return Boolean(query?.matches);
}

export function readReducedMotionFromWindow() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
