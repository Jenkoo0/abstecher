/**
 * Nachtbahnhof-Palette.
 *
 * Einbau: view3d liest MATERIALS und LIGHTS, das HUD liest PALETTE und TYPE.
 * Text nur mit `ink` oder `night` auf den geprüften Flächen, DB-Rot nur als
 * Streifen und Akzent. Es gibt noch keine Meshes, deshalb sind das Vorgaben
 * und keine Three-Materialien.
 */

export const PALETTE = {
  night: "#12161C",
  panel: "#1C2430",
  tile: "#D5D3CC",
  ink: "#F6F3EC",
  muted: "#C5CBD4",
  dbRed: "#E10600",
  warm: "#E8A04A",
  neon: "#8FE7EA",
  caution: "#F5C518",
  glass: "#9BB0C4",
  metal: "#6E7784",
  bench: "#7A3030",
} as const;

export const TYPE = {
  family: '"Bahnschrift", "DIN Alternate", "Arial Narrow", sans-serif',
  scorePx: 18,
  bannerPx: 22,
  linePx: 15,
} as const;

export const SPACE = {
  unit: 8,
  radius: 2,
} as const;

/**
 * Erlaubte Textpaare. DB-Rot ist Streifen und Icon, keine Textfläche:
 * helle Schrift darauf liegt knapp unter WCAG AA.
 */
export const TEXT_PAIRS = {
  body: { fg: PALETTE.ink, bg: PALETTE.panel },
  onNight: { fg: PALETTE.ink, bg: PALETTE.night },
  onCaution: { fg: PALETTE.night, bg: PALETTE.caution },
} as const;
