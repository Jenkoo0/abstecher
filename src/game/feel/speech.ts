/**
 * Sprachausgabe der Durchsage. Die Zeile bleibt in `announcements`,
 * die Wahl in `voiceEnabled` und im Save-Feld `voice`.
 * Einbau: `speechCue` nur sprechen, wenn `voiceEnabled` wahr ist.
 * Bevorzugt wird eine de-DE-Stimme, danach jede andere deutsche.
 * Ohne `speechSynthesis` bleibt der Untertitel.
 */

import { pickGermanVoice } from "./voice";

export type SpeechSink = {
  cancel: () => void;
  speak: (text: string) => void;
};

export function speakAnnouncement(sink: SpeechSink | null, text: string, enabled: boolean): boolean {
  if (!enabled || !sink || text.trim().length === 0) return false;
  sink.cancel();
  sink.speak(text);
  return true;
}

export function createWebSpeechSink(): SpeechSink | null {
  if (typeof window === "undefined") return null;
  const synth = window.speechSynthesis;
  if (!synth || typeof SpeechSynthesisUtterance === "undefined") return null;
  return {
    cancel() {
      synth.cancel();
    },
    speak(text: string) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = pickGermanVoice(synth.getVoices());
      if (voice) utterance.voice = voice;
      utterance.lang = "de-DE";
      utterance.rate = 0.92;
      utterance.pitch = 0.82;
      synth.speak(utterance);
    },
  };
}
