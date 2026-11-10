export type Best = { score: number; time: number };

export type Save = {
  version: 1;
  skinId: string;
  mute: boolean;
  shake: boolean;
  best: Record<string, Best>;
  clears: string[];
};

const KEY = "abstecher-v1";

export function loadSave(): Save {
  const blank: Save = {
    version: 1,
    skinId: "kalle",
    mute: false,
    shake: true,
    best: {},
    clears: [],
  };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank;
    const parsed = JSON.parse(raw) as Partial<Save>;
    if (parsed.version !== 1) return blank;
    return {
      ...blank,
      ...parsed,
      best: parsed.best ?? {},
      clears: parsed.clears ?? [],
    };
  } catch {
    return blank;
  }
}

export function writeSave(save: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* private mode */
  }
}
