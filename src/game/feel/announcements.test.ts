import { describe, expect, it } from "vitest";
import {
  STATION_IDS,
  createBannerState,
  listAllAnnouncementTexts,
  pickAnnouncement,
  pushAnnouncement,
  tickBanner,
} from "./announcements";

const BANNED = [
  /koks/i,
  /kokain/i,
  /cocaine/i,
  /heroin/i,
  /cannabis/i,
  /marihuana/i,
  /marijuana/i,
  /methamphet/i,
  /\bmeth\b/i,
  /\bcrack\b/i,
  /\bweed\b/i,
  /fentanyl/i,
  /tilidin/i,
  /\blsd\b/i,
  /ecstasy/i,
];

describe("Bahnhofsdurchsagen", () => {
  it("spricht Rundenstart, Einfahrt, Vorsteher und Game Over im Bahn-Ton", () => {
    const round = pickAnnouncement({ event: "round_start", stationId: "hamburg", round: 2, delayMin: 12 }, () => 0);
    const train = pickAnnouncement({ event: "train_arrive", stationId: "frankfurt", track: 12, delayMin: 40 }, () => 0);
    const boss = pickAnnouncement({ event: "boss_appear", stationId: "berlin" }, () => 0);
    const over = pickAnnouncement({ event: "game_over", stationId: "muenchen" }, () => 0);

    expect(round.text).toContain("2");
    expect(round.text).toMatch(/Grund dafür ist/i);
    expect(train.text).toContain("12");
    expect(train.text).toContain("40");
    expect(train.text).toMatch(/Grund dafür ist/i);
    expect(boss.text).toMatch(/Vorsteher/i);
    expect(boss.text).toMatch(/Grund dafür ist/i);
    expect(over.text).toContain("Wir bitten um Ihr Verständnis.");
    expect(over.text).toContain("Ihre Reise endet hier.");

    expect(over.priority).toBeGreaterThan(boss.priority);
    expect(boss.priority).toBeGreaterThan(train.priority);
    expect(train.priority).toBeGreaterThan(round.priority);
  });

  it("führt die sechs Startbahnhöfe als erweiterbare Slugs ohne Umlaute", () => {
    expect([...STATION_IDS]).toEqual(["kiel", "hamburg", "koeln", "frankfurt", "muenchen", "berlin"]);
    for (const id of STATION_IDS) {
      expect(id).toMatch(/^[a-z]+$/);
    }
    expect(pickAnnouncement({ event: "round_start", stationId: "bremen", round: 1 }, () => 0).text.length).toBeGreaterThan(20);
  });

  it("nimmt lokale Zeilen für die sechs Startbahnhöfe und sonst die allgemeine Fassung", () => {
    expect(pickAnnouncement({ event: "round_start", stationId: "kiel", round: 1 }, () => 0).text).toMatch(/Moin/);
    expect(pickAnnouncement({ event: "round_start", stationId: "koeln", round: 1 }, () => 0).text).toMatch(/Alaaf/);
    const generic = pickAnnouncement({ event: "round_start", stationId: "narnia", stationName: "Narnia Hbf", round: 3 }, () => 0);
    expect(generic.text).toContain("Narnia Hbf");
    expect(generic.text).not.toMatch(/Moin|Alaaf/);
  });

  it("wählt bei gleichem Zufall dieselbe Zeile und variiert sonst", () => {
    const req = { event: "train_arrive" as const, stationId: "generic", track: 3, delayMin: 8 };
    const a = pickAnnouncement(req, () => 0);
    const b = pickAnnouncement(req, () => 0);
    expect(a.text).toBe(b.text);
    const c = pickAnnouncement(req, () => 0.999);
    expect(c.text).not.toBe(a.text);
    expect(c.event).toBe("train_arrive");
  });

  it("enthält Fantasienamen und keine echten Drogennamen", () => {
    const texts = listAllAnnouncementTexts();
    expect(texts.length).toBeGreaterThan(8);
    expect(texts.join("\n")).toMatch(/Turbostaub/);
    for (const text of texts) {
      expect(text.trim().length).toBeGreaterThan(20);
      for (const pattern of BANNED) {
        expect(text).not.toMatch(pattern);
      }
    }
  });

  it("unterbricht mit dem Vorsteher und mit Game Over, niedrigere Zeilen warten", () => {
    const round = pickAnnouncement({ event: "round_start", round: 1, stationId: "kiel" }, () => 0);
    const train = pickAnnouncement({ event: "train_arrive", track: 4, delayMin: 6, stationId: "kiel" }, () => 0);
    const boss = pickAnnouncement({ event: "boss_appear", stationId: "kiel" }, () => 0);
    const over = pickAnnouncement({ event: "game_over", stationId: "kiel" }, () => 0);

    let banner = pushAnnouncement(createBannerState(), round);
    const queued = pushAnnouncement(banner, train);
    expect(queued.current?.event).toBe("round_start");
    expect(queued.queue.map((line) => line.event)).toEqual(["train_arrive"]);
    expect(banner.queue).toHaveLength(0);

    banner = pushAnnouncement(queued, boss);
    expect(banner.current?.event).toBe("boss_appear");
    expect(banner.elapsedMs).toBe(0);

    banner = pushAnnouncement(banner, over);
    expect(banner.current?.event).toBe("game_over");

    const duration = banner.current?.durationMs ?? 0;
    const waiting = pushAnnouncement(banner, round);
    expect(waiting.queue.length).toBeLessThanOrEqual(3);
    const almost = tickBanner(waiting, duration - 1);
    expect(almost.current?.event).toBe("game_over");
    const next = tickBanner(almost, 1);
    expect(next.current?.event).toBe("round_start");
    expect(next.elapsedMs).toBe(0);
  });
});
