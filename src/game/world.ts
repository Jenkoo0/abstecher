export const WORLD_W = 1600;
export const WORLD_H = 900;

export type Rect = { x: number; y: number; w: number; h: number };

export type BlockKind =
  | "column"
  | "kiosk"
  | "bench"
  | "train"
  | "buffer"
  | "stair"
  | "luggage"
  | "clock"
  | "bin"
  | "board"
  | "machine"
  | "platform"
  | "roof";

export type Block = Rect & { kind: BlockKind; height?: number };

export function circleHitsRect(cx: number, cy: number, r: number, b: Rect) {
  const nx = Math.max(b.x, Math.min(cx, b.x + b.w));
  const ny = Math.max(b.y, Math.min(cy, b.y + b.h));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

export function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
