/**
 * Stimme der Durchsage. Der Untertitel hängt nicht daran.
 *
 * `save.voice === null` heißt: noch keine Wahl. Dann ist die Stimme an,
 * sobald eine Stimme mit lang `de-DE` da ist, sonst aus. Die Sim soll das
 * erst festnageln, wenn der Nutzer N drückt. Vorher kann `voiceschanged`
 * die Verfügbarkeit noch ändern. `mute` im Save gilt nur für die Effekte.
 */

export const SUBTITLE_ALWAYS_ON = true;

export type VoiceChoice = boolean | null;

function languageTag(lang: string) {
  return lang.toLowerCase().replaceAll("_", "-");
}

export function hasDeDeVoice(voices: { lang: string }[]) {
  return voices.some((voice) => languageTag(voice.lang) === "de-de");
}

export function pickGermanVoice<T extends { lang: string }>(voices: T[]): T | null {
  const exact = voices.find((voice) => languageTag(voice.lang) === "de-de");
  if (exact) return exact;
  return (
    voices.find((voice) => {
      const tag = languageTag(voice.lang);
      return tag === "de" || tag.startsWith("de-");
    }) ?? null
  );
}

/** Gespeicherte Wahl gewinnt. Sonst nur an, wenn de-DE wirklich vorhanden ist. */
export function voiceEnabled(saved: VoiceChoice | undefined, deDeAvailable: boolean) {
  if (typeof saved === "boolean") return saved;
  return deDeAvailable;
}

export function toggleVoice(saved: VoiceChoice | undefined, deDeAvailable: boolean) {
  return !voiceEnabled(saved, deDeAvailable);
}

export function readDeDeVoiceAvailable() {
  if (typeof window === "undefined" || !window.speechSynthesis?.getVoices) return false;
  return hasDeDeVoice(window.speechSynthesis.getVoices());
}
