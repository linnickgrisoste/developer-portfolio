"use client";

import { useMemo, useSyncExternalStore } from "react";
import { GOLD_ATTRIBUTE, themeColors } from "@/lib/palette";

function subscribe(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", GOLD_ATTRIBUTE] });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");
const isGold = () => document.documentElement.hasAttribute(GOLD_ATTRIBUTE);
// Não usa o useTheme do next-themes: ele já sabe o tema no primeiro render e quebraria a hidratação.
const onServer = () => false;

export function useDarkTheme() {
  return useSyncExternalStore(subscribe, isDark, onServer);
}

export function useGoldMode() {
  return useSyncExternalStore(subscribe, isGold, onServer);
}

export function useThemeColors() {
  const theme = useDarkTheme() ? "dark" : "light";
  const goldMode = useGoldMode();
  return useMemo(() => themeColors(theme, goldMode), [theme, goldMode]);
}
