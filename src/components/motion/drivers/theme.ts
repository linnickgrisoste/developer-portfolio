"use client";

import { useMemo, useSyncExternalStore } from "react";
import { GOLD_ATTRIBUTE, themeColors } from "@/lib/palette";

// No servidor e na hidratação o tema é sempre o claro, para o HTML bater; o ajuste vem no render seguinte.
// O `useTheme` do next-themes já sabe o tema no primeiro render do navegador e quebraria a hidratação.

function subscribe(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", GOLD_ATTRIBUTE] });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");
const isGold = () => document.documentElement.hasAttribute(GOLD_ATTRIBUTE);
const onServer = () => false;

export function useDarkTheme() {
  return useSyncExternalStore(subscribe, isDark, onServer);
}

export function useGoldMode() {
  return useSyncExternalStore(subscribe, isGold, onServer);
}

/** As cores do tema atual em hex, para canvas e WebGL; no modo dourado o neon vira ouro. */
export function useThemeColors() {
  const theme = useDarkTheme() ? "dark" : "light";
  const goldMode = useGoldMode();
  return useMemo(() => themeColors(theme, goldMode), [theme, goldMode]);
}
