/**
 * Stempel-Combo: Slide, dann Dash, dann Sprung, solange der Abstand stimmt.
 *
 * Einbau: einmal pro Frame `stepStamp` mit dem gerade begonnenen Move
 * (`slide` / `dash` / `jump`) oder `null`. `broke` bei erlittenem Treffer.
 * `multiplier` skaliert die Punkte in der Sim. Die Namen sind UI-Text.
 */

export const STAMP_WINDOW_MS = 650;

export const STAMP_LABELS = ["", "Entwerter", "Anschlusszug", "Zugbindung aufgehoben"] as const;

export type StampId = "slide" | "dash" | "jump";

export type StampState = {
  chain: StampId[];
  ageMs: number;
  multiplier: number;
  label: string;
};

export function createStampState(): StampState {
  return { chain: [], ageMs: 0, multiplier: 1, label: "" };
}

function present(chain: StampId[], ageMs: number): StampState {
  return {
    chain,
    ageMs,
    multiplier: 1 + 0.5 * chain.length,
    label: STAMP_LABELS[chain.length] ?? "",
  };
}

function advance(chain: StampId[], stamp: StampId): StampId[] {
  const full = chain.length >= 3;
  if (stamp === "slide" && (chain.length === 0 || full)) return ["slide"];
  if (stamp === "dash" && chain.length === 1 && chain[0] === "slide") return ["slide", "dash"];
  if (stamp === "jump" && chain.length === 2 && chain[1] === "dash") return ["slide", "dash", "jump"];
  if (stamp === "slide") return ["slide"];
  return chain;
}

export function stepStamp(
  state: StampState,
  input: { dtMs: number; stamp: StampId | null; broke?: boolean },
): StampState {
  if (input.broke) return createStampState();
  let chain = state.chain;
  let ageMs = state.ageMs + Math.max(0, input.dtMs);
  if (chain.length > 0 && ageMs > STAMP_WINDOW_MS) {
    chain = [];
    ageMs = 0;
  }
  if (input.stamp) {
    const next = advance(chain, input.stamp);
    if (next !== chain) {
      chain = next;
      ageMs = 0;
    }
  }
  return present(chain, ageMs);
}
