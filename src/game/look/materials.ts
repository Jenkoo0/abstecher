/**
 * Materialwerte für den späteren Renderer. roughness/metalness sind 0..1.
 * view3d soll pro BlockKind eines dieser Presets nehmen, nicht neue Hexwerte erfinden.
 */

import { PALETTE } from "./tokens";

export type MaterialPreset = {
  color: string;
  roughness: number;
  metalness: number;
  opacity: number;
  emissive: string;
  emissiveIntensity: number;
};

export const MATERIALS = {
  tile: {
    color: PALETTE.tile,
    roughness: 0.86,
    metalness: 0,
    opacity: 1,
    emissive: "#000000",
    emissiveIntensity: 0,
  },
  glass: {
    color: PALETTE.glass,
    roughness: 0.08,
    metalness: 0.05,
    opacity: 0.38,
    emissive: "#000000",
    emissiveIntensity: 0,
  },
  rail: {
    color: PALETTE.metal,
    roughness: 0.34,
    metalness: 0.82,
    opacity: 1,
    emissive: "#000000",
    emissiveIntensity: 0,
  },
  neon: {
    color: PALETTE.neon,
    roughness: 0.25,
    metalness: 0,
    opacity: 1,
    emissive: PALETTE.neon,
    emissiveIntensity: 1.5,
  },
  bench: {
    color: PALETTE.bench,
    roughness: 0.62,
    metalness: 0.04,
    opacity: 1,
    emissive: "#000000",
    emissiveIntensity: 0,
  },
  kiosk: {
    color: PALETTE.warm,
    roughness: 0.55,
    metalness: 0.02,
    opacity: 1,
    emissive: PALETTE.warm,
    emissiveIntensity: 0.25,
  },
} as const satisfies Record<string, MaterialPreset>;

/** BlockKind aus world.ts, soweit ein Aussehen schon festliegt. */
export const BLOCK_MATERIAL = {
  column: "rail",
  kiosk: "kiosk",
  bench: "bench",
  train: "rail",
  stair: "tile",
  luggage: "kiosk",
  machine: "kiosk",
  platform: "tile",
  roof: "glass",
} as const;
