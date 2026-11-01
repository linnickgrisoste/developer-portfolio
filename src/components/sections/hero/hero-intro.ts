"use client";

import { useSyncExternalStore } from "react";
import { HERO_INTRO_ATTRIBUTE } from "@/components/three/gate-script";

export type HeroIntroState = "pending" | "on" | null;

function subscribe(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [HERO_INTRO_ATTRIBUTE] });
  return () => observer.disconnect();
}

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
