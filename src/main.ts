/**
 * Build-Einstieg, kein Spiel.
 *
 * sim, view3d, draw und src/components/Abstecher fehlen im Repository
 * und werden hier nicht nachgebaut. Die Datei existiert, damit
 * `vite build` einen Einstieg hat. Die Simulation soll später
 * `stepFeel` und `stepPresentation` selbst aufrufen.
 */
import { ANIM_DOCKS } from "./game/anim/docks";
import { createFeelState } from "./game/feel/stepFeel";

export const buildMarker = {
  docks: ANIM_DOCKS.map((dock) => dock.id),
  feelReady: createFeelState().banner.current === null,
};
