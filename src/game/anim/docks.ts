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
  {
    id: "loco-blend",
    reads: "blendPair(), anticipationAmount(), followThroughOffset()",
    writes: "view3d: Posengewichte, kurzes Ausholen, Nachschwung. Reduced Motion springt aufs Ziel.",
  },
  {
    id: "particles",
    reads: "emitParticles() und tickPool()",
    writes: "draw: Slots des festen Pools. Reduced Motion lässt den Pool leer.",
  },
  {
    id: "camera-frame",
    reads: "cameraFrame().fov und dip",
    writes: "view3d: Sichtfeld und Landesenke, zusätzlich zum Shake aus stepCamera. Reduced Motion ohne Kick.",
  },
] as const;
