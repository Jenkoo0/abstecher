import { describe, expect, it } from "vitest";
import { createWebSpeechSink, speakAnnouncement } from "./speech";

describe("Sprachausgabe", () => {
  it("spricht nur, wenn sie an ist und ein Ausgang da ist", () => {
    const calls: string[] = [];
    const sink = {
      cancel: () => calls.push("cancel"),
      speak: (text: string) => calls.push(text),
    };

    expect(speakAnnouncement(null, "Hallo Gleis 3", true)).toBe(false);
    expect(speakAnnouncement(sink, "Hallo Gleis 3", false)).toBe(false);
    expect(calls).toEqual([]);

    expect(speakAnnouncement(sink, "Achtung an Gleis 3", true)).toBe(true);
    expect(calls).toEqual(["cancel", "Achtung an Gleis 3"]);
  });

  it("liefert ohne Browser-Speech keinen Ausgang", () => {
    expect(createWebSpeechSink()).toBeNull();
  });
});
