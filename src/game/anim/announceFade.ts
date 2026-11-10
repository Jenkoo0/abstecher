/**
 * Ein- und Ausblenden einer Durchsage.
 *
 * Andocken im UI: `opacity` und `offsetY` (Pixel nach unten) auf das
 * Textbanner legen. Den Text liefert `feel/announcements`.
 * Reduced motion zeigt die Zeile sofort, ohne Rutschen.
 */

import { clamp01, easeInQuad, easeOutCubic } from "./easing";

const FADE_IN_MS = 280;
const FADE_OUT_MS = 360;
const ENTER_OFFSET = 18;

export type AnnouncementVisual = {
  opacity: number;
  offsetY: number;
  visible: boolean;
};

export function announcementPresentation(input: {
  elapsedMs: number;
  durationMs: number;
  reducedMotion?: boolean;
}): AnnouncementVisual {
  const elapsed = Math.max(0, input.elapsedMs);
  const duration = Math.max(0, input.durationMs);
  if (elapsed >= duration) return { opacity: 0, offsetY: 0, visible: false };
  if (input.reducedMotion) return { opacity: 1, offsetY: 0, visible: true };

  const fadeIn = easeOutCubic(clamp01(elapsed / FADE_IN_MS));
  const outStart = Math.max(0, duration - FADE_OUT_MS);
  const fadeOut = easeInQuad(clamp01((elapsed - outStart) / FADE_OUT_MS));
  return {
    opacity: fadeIn * (1 - fadeOut),
    offsetY: (1 - fadeIn) * ENTER_OFFSET,
    visible: true,
  };
}
