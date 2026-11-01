// Espelho em hex das cores de globals.css, para canvas, WebGL, confete e a imagem de prévia.

const light = { paper: "#f2f2ec", ink: "#0d0f12", neon: "#806500", reward: "#0089a8" };
const dark = { paper: "#0d0f12", ink: "#f2f2ec", neon: "#fcee0a", reward: "#00f0ff" };

export const palette = { light, dark };
export type Theme = keyof typeof palette;

export const GOLD_ATTRIBUTE = "data-gold";

/** Modo dourado. Espelha `html[data-gold]` em globals.css. */
export const gold = {
  neon: { light: "#9c5a00", dark: "#f0b429" },
  champagne: "#ffe08a",
  copper: "#e08a2e",
};

/** O segundo e o terceiro tom do ciclo do ponto final. Espelha `--dot-second`/`--dot-third` em globals.css. */
const dotCycle = { normal: ["#ff9f1a", dark.reward], gold: [gold.champagne, gold.copper] };

/** O ciano de recompensa dos dois temas, para efeitos que usam os dois juntos. */
export const rewardPair = [light.reward, dark.reward];

/** As cores do tema; `dotCycle` são as três do ciclo do ponto final, começando pelo neon. */
export function themeColors(theme: Theme, goldMode: boolean) {
  const neon = goldMode ? gold.neon[theme] : palette[theme].neon;
  const [second, third] = goldMode ? dotCycle.gold : dotCycle.normal;
  return { ...palette[theme], neon, dotCycle: [neon, second, third] };
}
