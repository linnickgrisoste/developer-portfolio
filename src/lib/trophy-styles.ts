import type { CSSProperties } from "react";
import type { AchievementId, TrophyId } from "@/content/game";
import { palette } from "@/lib/palette";

// Material e cores de cada troféu, lidos pelo aviso, pela vitrine e pela sala 3D.

export type AchievementStyle = {
  main: string;
  /** Frisos, selos, pinturas. */
  accent: string;
  /** Luz projetada no pedestal e tom do aviso. */
  glow: string;
  finish: "metal" | "gem" | "matte";
};

export const TROPHY_GOLD = "#e7b94c";
const GOLD_GLOW = "#ffd36e";

export const achievementStyles: Record<AchievementId, AchievementStyle> = {
  "first-step": { main: "#c27c4a", accent: "#f3c69a", glow: "#ff9a52", finish: "metal" },
  curator: { main: TROPHY_GOLD, accent: "#f4ead2", glow: GOLD_GLOW, finish: "metal" },
  polyglot: { main: "#1fbf9a", accent: TROPHY_GOLD, glow: "#3ff2c4", finish: "gem" },
  "night-owl": { main: "#d7dde8", accent: "#8b7bff", glow: "#a99cff", finish: "metal" },
  "character-sheet": { main: "#e3264b", accent: "#f2c14e", glow: "#ff4d72", finish: "gem" },
  "quest-log": { main: "#ead7a8", accent: "#7a4628", glow: "#ffb066", finish: "matte" },
  "signal-sent": { main: "#8b5cf6", accent: "#f2c14e", glow: "#b892ff", finish: "gem" },
  "full-stop": { main: palette.dark.neon, accent: palette.dark.reward, glow: palette.dark.neon, finish: "gem" },
};

export const trophyStyles: Record<TrophyId, AchievementStyle> = {
  ...achievementStyles,
  crown: { main: TROPHY_GOLD, accent: "#fff3c4", glow: GOLD_GLOW, finish: "metal" },
};

/** O aviso de "zerou tudo" anuncia a coroa, então usa as cores dela. */
export const completeStyle = trophyStyles.crown;

/** Variáveis --a-main/--a-accent/--a-glow, lidas pelos utilitários `medal` e `trophy-bar`. */
export function styleVars(style: AchievementStyle): CSSProperties {
  return { "--a-main": style.main, "--a-accent": style.accent, "--a-glow": style.glow } as CSSProperties;
}
