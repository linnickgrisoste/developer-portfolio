// Espelho em hex das cores de globals.css (canvas, WebGL, confete, imagem de prévia): mudar um exige mudar o outro.
const light = { paper: "#f2f2ec", ink: "#0d0f12", neon: "#806500", reward: "#0089a8" };
const dark = { paper: "#0d0f12", ink: "#f2f2ec", neon: "#fcee0a", reward: "#00f0ff" };

export const palette = { light, dark };
export type Theme = keyof typeof palette;

export const GOLD_ATTRIBUTE = "data-gold";

export const gold = {
  neon: { light: "#9c5a00", dark: "#f0b429" },
  champagne: "#ffe08a",
  copper: "#e08a2e",
};

const dotCycle = { normal: ["#ff9f1a", dark.reward], gold: [gold.champagne, gold.copper] };

export const rewardPair = [light.reward, dark.reward];

export function themeColors(theme: Theme, goldMode: boolean) {
  const neon = goldMode ? gold.neon[theme] : palette[theme].neon;
  const [second, third] = goldMode ? dotCycle.gold : dotCycle.normal;
  return { ...palette[theme], neon, dotCycle: [neon, second, third] };
}
