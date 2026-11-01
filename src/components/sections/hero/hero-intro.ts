"use client";

import { useSyncExternalStore } from "react";
import { HERO_INTRO_ATTRIBUTE } from "@/components/three/gate-script";

// Atributo no <html>, decidido antes da primeira pintura pelo script do <head> (three/gate-script.ts):
// "pending" = vai entrar em 3D (nome em CSS oculto, cena carregando); "on" = cena à mostra; ausente = fica o CSS.
export type HeroIntroState = "pending" | "on" | null;

function subscribe(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [HERO_INTRO_ATTRIBUTE] });
  return () => observer.disconnect();
}

// No servidor e na hidratação é sempre null: o servidor não sabe o aparelho.
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
