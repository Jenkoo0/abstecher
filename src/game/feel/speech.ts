/**
 * Optionale Sprachausgabe. Die Auswahl der Zeile bleibt in `announcements`.
 * Einbau: `speechCue` aus `stepFeel` an `speakAnnouncement` geben, wenn die
 * Einstellung an ist. Ohne `speechSynthesis` bleibt es beim Textbanner.
 */

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
      utterance.lang = "de-DE";
      utterance.rate = 0.92;
      utterance.pitch = 0.82;
      synth.speak(utterance);
    },
  };
}
