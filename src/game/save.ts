export type Best = { score: number; time: number };

export type Save = {
  version: 1;
  skinId: string;
  /** Effekte aus `createAudio`. Unabhängig von der Durchsage-Stimme. */
  mute: boolean;
  shake: boolean;
  /**
   * Durchsage-Stimme. `null` heißt: noch nicht mit N gewählt, der Default
   * kommt aus `voiceEnabled` (an nur bei vorhandener de-DE-Stimme).
   */
  voice: boolean | null;
  best: Record<string, Best>;
  clears: string[];
};

const KEY = "abstecher-v1";

export function defaultSave(): Save {
  return {
    version: 1,
    skinId: "kalle",
    mute: false,
    shake: true,
    voice: null,
    best: {},
    clears: [],
  };
}

export function sanitizeSave(
  parsed: (Partial<Omit<Save, "version">> & { version?: number }) | null | undefined,
): Save {
  const blank = defaultSave();
  if (!parsed || parsed.version !== 1) return blank;
  return {
    ...blank,
    skinId: typeof parsed.skinId === "string" ? parsed.skinId : blank.skinId,
    mute: typeof parsed.mute === "boolean" ? parsed.mute : blank.mute,
    shake: typeof parsed.shake === "boolean" ? parsed.shake : blank.shake,
    voice: typeof parsed.voice === "boolean" ? parsed.voice : null,
    best: parsed.best ?? {},
    clears: parsed.clears ?? [],
  };
}

export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    return sanitizeSave(JSON.parse(raw) as Partial<Save>);
  } catch {
    return defaultSave();
  }
}

export function writeSave(save: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* private mode */
  }
}
