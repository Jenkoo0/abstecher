import { describe, expect, it } from "vitest";
import { createBannerState, pickAnnouncement, pushAnnouncement } from "./announcements";
import { speakAnnouncement } from "./speech";
import {
  SUBTITLE_ALWAYS_ON,
  hasDeDeVoice,
  pickGermanVoice,
  readDeDeVoiceAvailable,
  toggleVoice,
  voiceEnabled,
} from "./voice";

describe("Durchsage-Stimme", () => {
  it("ist standardmäßig nur an, wenn de-DE verfügbar ist", () => {
    expect(voiceEnabled(null, true)).toBe(true);
    expect(voiceEnabled(undefined, false)).toBe(false);
    expect(voiceEnabled(false, true)).toBe(false);
    expect(voiceEnabled(true, false)).toBe(true);
    expect(toggleVoice(null, true)).toBe(false);
    expect(toggleVoice(false, false)).toBe(true);
  });

  it("erkennt de-DE und bevorzugt diese Stimme vor anderen deutschen", () => {
    const voices = [{ lang: "en-US", name: "en" }, { lang: "de_AT", name: "at" }, { lang: "de-DE", name: "de" }];
    expect(hasDeDeVoice(voices)).toBe(true);
    expect(hasDeDeVoice([{ lang: "de-AT" }])).toBe(false);
    expect(pickGermanVoice(voices)?.name).toBe("de");
    expect(pickGermanVoice([{ lang: "de-AT", name: "at" }])?.name).toBe("at");
    expect(pickGermanVoice([{ lang: "en-GB" }])).toBeNull();
    expect(readDeDeVoiceAvailable()).toBe(false);
  });

  it("lässt den Untertitel stehen, wenn die Stimme aus ist", () => {
    expect(SUBTITLE_ALWAYS_ON).toBe(true);
    const line = pickAnnouncement({ event: "round_start", stationId: "kiel", round: 1 }, () => 0);
    const banner = pushAnnouncement(createBannerState(), line);
    expect(banner.current?.text.length).toBeGreaterThan(0);
    const calls: string[] = [];
    expect(
      speakAnnouncement(
        {
          cancel: () => calls.push("cancel"),
          speak: (text) => calls.push(text),
        },
        line.text,
        voiceEnabled(null, false),
      ),
    ).toBe(false);
    expect(calls).toEqual([]);
  });
});
