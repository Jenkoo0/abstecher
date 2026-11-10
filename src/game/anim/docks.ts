/**
 * Wo view3d, draw und das UI die reinen Werte später lesen.
 * Keine dieser Stellen existiert im Repo (sim, view3d, draw, Abstecher fehlen).
 */

export const ANIM_DOCKS = [
  {
    id: "player-scale",
    reads: "stepSquash().scale",
    writes: "view3d: Skalierung der Spielergruppe. Die Hitbox bleibt unangetastet.",
  },
  {
    id: "player-pose",
    reads: "locomotionPose()",
    writes: "view3d: Nick- und Rollwinkel plus Höhenversatz der Figur.",
  },
  {
    id: "camera",
    reads: "stepCamera().position und lookAt",
    writes: "view3d: Kameraposition. Den Shake nicht auf den Körper addieren.",
  },
  {
    id: "dust",
    reads: "tickImpulses()",
    writes: "draw: kurzlebige Staubpunkte, Deckkraft aus lifeMs / maxLifeMs.",
  },
  {
    id: "announcement",
    reads: "announcementPresentation()",
    writes: "UI-Banner: opacity und translateY. Der Text kommt aus feel/announcements.",
  },
] as const;
