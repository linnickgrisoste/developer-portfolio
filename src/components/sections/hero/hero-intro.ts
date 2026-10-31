"use client";

import { useSyncExternalStore } from "react";
import { HERO_INTRO_ATTRIBUTE } from "./hero-intro-script";

// Se o nome do hero entra em 3D. Quem decide é um script mínimo no <head> (ver hero-intro-script.ts),
// antes da primeira pintura: assim o nome em CSS já nasce oculto e a entrada antiga nunca aparece.
// O atributo no <html> passa por três estados:
// - "pending": decidido que entra em 3D; o nome em CSS está oculto e a cena está carregando;
// - "on": a cena desenhou e está à mostra;
// - ausente: sem 3D (celular, movimento reduzido, sem WebGL, ou a cena não chegou a tempo): fica o CSS.

export type HeroIntroState = "pending" | "on" | null;

function subscribe(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [HERO_INTRO_ATTRIBUTE] });
  return () => observer.disconnect();
}

/** O estado da entrada em 3D. No servidor e na hidratação é sempre `null` (o servidor não sabe o aparelho). */
export function useHeroIntro(): HeroIntroState {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.getAttribute(HERO_INTRO_ATTRIBUTE) as HeroIntroState,
    () => null,
  );
}

export function setHeroIntro(state: HeroIntroState) {
  if (state) document.documentElement.setAttribute(HERO_INTRO_ATTRIBUTE, state);
  else document.documentElement.removeAttribute(HERO_INTRO_ATTRIBUTE);
}
