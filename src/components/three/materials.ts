"use client";

import { useDarkTheme } from "@/components/motion/drivers/theme";
import { palette } from "@/lib/palette";

/**
 * As cores da cena no tema atual: `ink` para as faces que imitam o impresso, `neon` para a lateral.
 * As mesmas do CSS (via lib/palette), para o 3D e a página serem um material só.
 */
export function useSceneColors() {
  return palette[useDarkTheme() ? "dark" : "light"];
}
