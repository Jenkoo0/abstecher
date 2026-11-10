/**
 * Satirische Bahnhofsdurchsagen.
 *
 * Einbau in der fehlenden Sim: bei Rundenstart, Zugeinfahrt, Erscheinen
 * des Vorstehers und Game Over `pickAnnouncement` aufrufen und das Ergebnis
 * mit `pushAnnouncement` auf das Banner legen. `tickBanner` bekommt die
 * echte Framezeit, nicht die Hitstop-Zeit, damit der Untertitel weiterläuft.
 * Die Zeile selbst spricht nichts. Sprachausgabe hängt an `speechCue`
 * aus `stepFeel` und an `speakAnnouncement`.
 *
 * Sichtbar machen (Opacity, Versatz) übernimmt `announcementPresentation`
 * in `src/game/anim`. Dieses Modul liefert nur den Text.
 */

export type AnnouncementEvent = "round_start" | "train_arrive" | "boss_appear" | "game_over";

export type AnnouncementRequest = {
  event: AnnouncementEvent;
  stationId?: string;
  stationName?: string;
  track?: number;
  delayMin?: number;
  round?: number;
};

export type Announcement = {
  event: AnnouncementEvent;
  stationId: string;
  text: string;
  durationMs: number;
  priority: number;
};

export type BannerState = {
  current: Announcement | null;
  elapsedMs: number;
  queue: Announcement[];
};

const PRIORITY: Record<AnnouncementEvent, number> = {
  round_start: 1,
  train_arrive: 2,
  boss_appear: 3,
  game_over: 4,
};

const DURATION_MS: Record<AnnouncementEvent, number> = {
  round_start: 4200,
  train_arrive: 4600,
  boss_appear: 5000,
  game_over: 6400,
};

/** Ab dieser Priorität wird die laufende Zeile ersetzt. Zug und Runde warten. */
const INTERRUPT_AT = PRIORITY.boss_appear;
const QUEUE_MAX = 3;

const STATION_NAMES: Record<string, string> = {
  kiel: "Kiel Hauptbahnhof",
  hamburg: "Hamburg Hauptbahnhof",
  koeln: "Köln Hauptbahnhof",
  frankfurt: "Frankfurt (Main) Hauptbahnhof",
  muenchen: "München Hauptbahnhof",
  berlin: "Berlin Hauptbahnhof",
  generic: "diesem Hauptbahnhof",
};

const KNOWN = new Set(Object.keys(STATION_NAMES));

type Pool = { generic: string[]; stations: Record<string, string[]> };

const POOLS: Record<AnnouncementEvent, Pool> = {
  round_start: {
    generic: [
      "Willkommen zur Runde {round} in {station}. Bitte einsteigen, die Messer bleiben bis zum Pfiff draußen. Grund dafür ist der gültige Fahrplan.",
      "Runde {round}, {station}. Wir haben heute mehr Stimmung als Puffer. Grund dafür ist eine betriebliche Unregelmäßigkeit im Wartebereich.",
    ],
    stations: {
      kiel: [
        "Moin in {station}, Runde {round}. Der Fähranschluss wartet nicht, der Gegner schon. Grund dafür ist Seeluft auf dem Bahnsteig.",
      ],
      hamburg: [
        "Hummel Hummel, {station}, Runde {round}. Unter der großen Halle geht es los. Grund dafür ist eine Möwe auf der Info-Stele.",
      ],
      koeln: [
        "Alaaf in {station}, Runde {round}. Bitte das Kölsch nicht mit der Klinge verwechseln. Grund dafür ist Karneval im Betriebsablauf.",
      ],
      frankfurt: [
        "{station}, Runde {round}. Die Anzüge auf dem Querbahnsteig weichen nicht aus. Grund dafür ist Börsenschluss.",
      ],
      muenchen: [
        "Grüß Gott in {station}, Runde {round}. Die Tafel sagt Verspätung und meint es heute persönlich. Grund dafür ist ein Betriebsablauf in Lederhosen.",
      ],
      berlin: [
        "{station}, Runde {round}. Unten Fernbahn, oben Stadtbahn, mittendrin keine Ruhe. Grund dafür ist der Takt, nicht die Stimmung.",
      ],
    },
  },
  train_arrive: {
    generic: [
      "Achtung an Gleis {track}. In {station} fährt ein Zug ein, trotz plus {delay} Minuten. Bitte zurücktreten. Grund dafür ist, dass er es sich anders überlegt hat.",
      "Gleis {track}, {station}: Einfahrt. Die Anzeige sagte plus {delay}, der Zug sagt sofort. Grund dafür ist ein verklemmter Turbostaub-Automat am Bahnsteig.",
    ],
    stations: {
      kiel: [
        "Gleis {track} in {station}: Einfahrt von der Fördeseite, plus {delay} Minuten und dann plötzlich da. Grund dafür ist ein verpasster Fähranschluss.",
      ],
      hamburg: [
        "Gleis {track}, {station}: Einfahrt unter dem Hallenbogen, plus {delay} Minuten. Grund dafür ist eine Möwe im Fahrplan.",
      ],
      koeln: [
        "Gleis {track}, {station}: Einfahrt mit Blick auf den Dom, plus {delay} Minuten. Grund dafür ist Konfetti in der Weiche.",
      ],
      frankfurt: [
        "Gleis {track}, {station}: Einfahrt in den Kopfbahnhof, plus {delay} Minuten. Grund dafür ist ein Anzug im Gleis, der nicht ausweicht.",
      ],
      muenchen: [
        "Gleis {track}, {station}: Der Zug, der nie kommt, kommt jetzt. Plus {delay} Minuten waren die höfliche Fassung. Grund dafür ist eine Tafel mit Humor.",
      ],
      berlin: [
        "Gleis {track}, {station}: Einfahrt auf der unteren Ebene, plus {delay} Minuten. Grund dafür ist ein Takt, der den Fahrplan überstimmt hat.",
      ],
    },
  },
  boss_appear: {
    generic: [
      "Der Bahnhofsvorsteher betritt {station}. Bitte Fahrkarten und Hände bereithalten, es folgt eine Fahrkartenkontrolle. Grund dafür ist er selbst.",
      "{station}: Der Vorsteher hat die Kelle gezogen. Schienenersatzverkehr ist keine Fluchtroute. Grund dafür ist Personalwechsel mit Ansage.",
    ],
    stations: {
      kiel: [
        "Der Vorsteher von {station} pfeift im Hafentempo. Gleich folgt: Fähranschluss verpasst. Grund dafür ist die Trillerpfeife.",
      ],
      hamburg: [
        "Vorsteher in {station}: Sturmflut-Warnung auf der Gleiszone. Bitte auf die erhöhte Ebene. Grund dafür ist das Wasser, das er mitgebracht hat.",
      ],
      koeln: [
        "Der Vorsteher in {station} ruft Alaaf und schickt eine Welle im Kostüm. Grund dafür ist Karnevalspflicht im Dienstplan.",
      ],
      frankfurt: [
        "Der Vorsteher in {station} verkündet Börsenschluss. Alles wird schneller, nichts wird pünktlicher. Grund dafür ist der Kurs.",
      ],
      muenchen: [
        "Der Vorsteher in {station} meldet Verspätung im Betriebsablauf. Der Zug kommt nicht, bis er sofort kommt. Grund dafür ist die Tafel.",
      ],
      berlin: [
        "Der Vorsteher in {station} spricht auf allen Ebenen. Die Durchsage wird persönlich. Grund dafür ist die direkte Ansprache.",
      ],
    },
  },
  game_over: {
    generic: [
      "Wir bitten um Ihr Verständnis. Ihre Reise endet hier. {station} wünscht eine unpünktliche Wiederkehr.",
      "{station}: Ihre Reise endet hier. Wir bitten um Ihr Verständnis. Der Vorsteher hat die Kelle noch in der Hand, eine Entschädigung gibt es nicht.",
    ],
    stations: {
      kiel: [
        "{station}. Wir bitten um Ihr Verständnis. Ihre Reise endet hier. Der Fähranschluss war schneller.",
      ],
      hamburg: [
        "{station}. Wir bitten um Ihr Verständnis. Ihre Reise endet hier. Die Möwen übernehmen den Bahnsteig.",
      ],
      koeln: [
        "{station}. Wir bitten um Ihr Verständnis. Ihre Reise endet hier. Alaaf gilt nicht als Entschuldigung.",
      ],
      frankfurt: [
        "{station}. Wir bitten um Ihr Verständnis. Ihre Reise endet hier. Der Kurs ist durch.",
      ],
      muenchen: [
        "{station}. Wir bitten um Ihr Verständnis. Ihre Reise endet hier. Die Tafel hatte am Ende recht.",
      ],
      berlin: [
        "{station}. Wir bitten um Ihr Verständnis. Ihre Reise endet hier. Alle Ebenen sind für Sie geschlossen.",
      ],
    },
  },
};

function fill(template: string, req: AnnouncementRequest, stationName: string) {
  return template
    .replaceAll("{station}", stationName)
    .replaceAll("{track}", String(req.track ?? 3))
    .replaceAll("{delay}", String(req.delayMin ?? 11))
    .replaceAll("{round}", String(req.round ?? 1));
}

function resolveStation(req: AnnouncementRequest) {
  const requested = req.stationId ?? "generic";
  const known = KNOWN.has(requested);
  const poolKey = known && requested !== "generic" ? requested : "generic";
  const name = req.stationName ?? (known ? STATION_NAMES[requested] : "diesem Hauptbahnhof");
  return { id: known ? requested : "generic", poolKey, name };
}

function linesFor(event: AnnouncementEvent, poolKey: string) {
  const pool = POOLS[event];
  const local = pool.stations[poolKey];
  return local && local.length > 0 ? local : pool.generic;
}

function indexFor(length: number, rng: () => number) {
  if (length <= 1) return 0;
  const rolled = Math.floor(rng() * length);
  return Math.min(length - 1, Math.max(0, rolled));
}

export function pickAnnouncement(req: AnnouncementRequest, rng: () => number = Math.random): Announcement {
  const station = resolveStation(req);
  const templates = linesFor(req.event, station.poolKey);
  const template = templates[indexFor(templates.length, rng)] ?? templates[0];
  return {
    event: req.event,
    stationId: station.id,
    text: fill(template, req, station.name),
    durationMs: DURATION_MS[req.event],
    priority: PRIORITY[req.event],
  };
}

export function listAllAnnouncementTexts(): string[] {
  const sample: AnnouncementRequest = { event: "round_start", track: 3, delayMin: 11, round: 1 };
  const texts: string[] = [];
  for (const event of Object.keys(POOLS) as AnnouncementEvent[]) {
    const pool = POOLS[event];
    for (const template of pool.generic) {
      texts.push(fill(template, { ...sample, event }, "diesem Hauptbahnhof"));
    }
    for (const [stationId, templates] of Object.entries(pool.stations)) {
      for (const template of templates) {
        texts.push(fill(template, { ...sample, event, stationId }, STATION_NAMES[stationId] ?? stationId));
      }
    }
  }
  return texts;
}

export function createBannerState(): BannerState {
  return { current: null, elapsedMs: 0, queue: [] };
}

export function pushAnnouncement(state: BannerState, announcement: Announcement): BannerState {
  if (!state.current) {
    return { current: announcement, elapsedMs: 0, queue: [...state.queue] };
  }
  if (announcement.priority >= INTERRUPT_AT && announcement.priority > state.current.priority) {
    return { current: announcement, elapsedMs: 0, queue: [] };
  }
  if (state.queue.length >= QUEUE_MAX) return state;
  return {
    current: state.current,
    elapsedMs: state.elapsedMs,
    queue: [...state.queue, announcement],
  };
}

export function tickBanner(state: BannerState, dtMs: number): BannerState {
  if (!state.current) return state;
  const elapsedMs = state.elapsedMs + Math.max(0, dtMs);
  if (elapsedMs < state.current.durationMs) {
    return { current: state.current, elapsedMs, queue: state.queue };
  }
  const [next, ...queue] = state.queue;
  return { current: next ?? null, elapsedMs: 0, queue };
}
