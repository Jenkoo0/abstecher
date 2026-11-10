/**
 * HUD-Geometrie. Kein DOM, nur Maße und Deckkraft.
 *
 * Einbau in der fehlenden Abstecher-Komponente: `hudFrame` an die
 * festen Ecken legen. Schrift und Farben aus `look/tokens`. Das Banner
 * bleibt lesbar, auch wenn die Punkte bei Untätigkeit zurücktreten.
 * Reduced Motion setzt die Ziel-Deckkraft sofort (`fade: "snap"`).
 * Schmale Viewports skalieren Schrift und Abstand hoch, nicht die Welt.
 */

import { PALETTE, SPACE, TEXT_PAIRS, TYPE } from "../look/tokens";

export const HUD_IDLE_MS = 2400;
export const HUD_MOBILE_PX = 760;

export function hudFrame(input: {
  viewportW: number;
  idleMs: number;
  bannerActive: boolean;
  reducedMotion?: boolean;
}) {
  const mobile = input.viewportW < HUD_MOBILE_PX;
  const scale = mobile ? 1.18 : 1;
  const pad = SPACE.unit * (mobile ? 2 : 3);
  const idle = input.idleMs >= HUD_IDLE_MS;
  return {
    scale,
    pad,
    mobile,
    fade: input.reducedMotion ? "snap" : "ease",
    chromeOpacity: idle ? 0.4 : 1,
    bannerOpacity: input.bannerActive ? 1 : 0,
    score: { top: pad, left: pad },
    status: { top: pad, right: pad },
    banner: { left: pad, right: pad, bottom: pad * 2 },
    fontFamily: TYPE.family,
    scorePx: Math.round(TYPE.scorePx * scale),
    bannerPx: Math.round(TYPE.bannerPx * scale),
    colors: {
      chrome: PALETTE.ink,
      chromeBg: PALETTE.night,
      bannerFg: TEXT_PAIRS.body.fg,
      bannerBg: TEXT_PAIRS.body.bg,
      stripe: PALETTE.dbRed,
    },
  };
}

/** Ziel-Deckkraft ohne Zwischenwerte, wenn Reduced Motion an ist. */
export function fadeToward(current: number, target: number, dtMs: number, reducedMotion = false) {
  if (reducedMotion) return target;
  const step = Math.max(0, dtMs) / 180;
  if (current < target) return Math.min(target, current + step);
  return Math.max(target, current - step);
}
