/**
 * Ein Frame für alle Feel-Systeme.
 *
 * Einbau in der fehlenden Sim, einmal pro Frame und vor dem Zeichnen:
 * 1. Eingaben und Treffer hier hineingeben.
 * 2. `simDtMs` an Physik, Gegner und Cooldowns weiterreichen.
 * 3. `shake` nur an die Kamera (`src/game/anim`) geben.
 * 4. `speechCue` an `speakAnnouncement`, wenn die Stimme an ist.
 * 5. Bannertext und `announcementPresentation` für den Untertitel.
 *
 * Hitstop wird vor dem Tick ausgelöst. Dieselbe Frame ist deshalb schon
 * eingefroren. Sprung und Slide sehen nur `simDtMs` und bleiben beieinander.
 */

import { pickAnnouncement, pushAnnouncement, tickBanner, type AnnouncementRequest, type BannerState } from "./announcements";
import { createHitstopState, tickHitstop, triggerHitstop, type HitKind, type HitstopState } from "./hitstop";
import { createJumpState, stepJump, type JumpState } from "./jump";
import { createSlideDashState, stepSlideDash, type SlideDashState } from "./slideDash";

export type FeelState = {
  jump: JumpState;
  slide: SlideDashState;
  hitstop: HitstopState;
  banner: BannerState;
};

export type FeelInput = {
  realDtMs: number;
  grounded: boolean;
  sprinting: boolean;
  speed: number;
  jumpPressed: boolean;
  jumpHeld: boolean;
  slidePressed: boolean;
  dashPressed: boolean;
  hit?: { kind: HitKind; dirX?: number; dirY?: number } | null;
  announcement?: AnnouncementRequest | null;
  rng?: () => number;
};

export function createFeelState(): FeelState {
  return {
    jump: createJumpState(),
    slide: createSlideDashState(),
    hitstop: createHitstopState(),
    banner: { current: null, elapsedMs: 0, queue: [] },
  };
}

export function stepFeel(state: FeelState, input: FeelInput) {
  const armed = input.hit
    ? triggerHitstop(state.hitstop, input.hit.kind, {
        x: input.hit.dirX ?? 1,
        y: input.hit.dirY ?? 0,
      })
    : state.hitstop;
  const hit = tickHitstop(armed, input.realDtMs);

  const jump = stepJump(state.jump, {
    dtMs: hit.simDtMs,
    grounded: input.grounded,
    jumpPressed: input.jumpPressed,
    jumpHeld: input.jumpHeld,
  });

  const slide = stepSlideDash(state.slide, {
    dtMs: hit.simDtMs,
    grounded: input.grounded,
    sprinting: input.sprinting,
    speed: input.speed,
    slidePressed: input.slidePressed,
    dashPressed: input.dashPressed,
  });

  let banner: BannerState = state.banner;
  const previousText = banner.current?.text ?? null;
  if (input.announcement) {
    banner = pushAnnouncement(banner, pickAnnouncement(input.announcement, input.rng ?? (() => 0)));
  }
  const pushedText = banner.current?.text ?? null;
  banner = tickBanner(banner, input.realDtMs);
  const tickedText = banner.current?.text ?? null;

  let speechCue: string | null = null;
  if (pushedText && pushedText !== previousText) speechCue = pushedText;
  else if (tickedText && tickedText !== pushedText) speechCue = tickedText;

  return {
    state: {
      jump: jump.state,
      slide,
      hitstop: hit.state,
      banner,
    },
    jumped: jump.jumped,
    timeScale: hit.timeScale,
    simDtMs: hit.simDtMs,
    shake: hit.shake,
    speechCue,
  };
}
