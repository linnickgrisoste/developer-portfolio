"use client";

import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { reveal } from "@/lib/motion";

/*
 * Entradas acontecem uma vez por visita, não uma vez por idioma. Trocar de idioma navega para a
 * outra página estática, que monta de novo; o que a pessoa já viu entrar não deve entrar outra vez.
 * O seletor de idioma marca a troca, e a página que monta em seguida nasce com tudo no lugar.
 */
let localeSwitchedAt = 0;
const SKIP_WINDOW_MS = 4000;

export function markLocaleSwitch() {
  localeSwitchedAt = Date.now();
}

/** true na página montada logo depois de uma troca de idioma. No servidor e na primeira visita, sempre false. */
export function useSkipEntrance() {
  const [skip] = useState(() => Date.now() - localeSwitchedAt < SKIP_WINDOW_MS);
  return skip;
}

/**
 * Props do contêiner de uma revelação em cascata. Os filhos usam `variants={reveal.item}`.
 * Com movimento reduzido, ou logo após trocar de idioma, o conteúdo já nasce no lugar.
 */
export function useRevealGroup() {
  const reduceMotion = useReducedMotion();
  const skipEntrance = useSkipEntrance();
  return {
    initial: reduceMotion || skipEntrance ? false : "hidden",
    whileInView: "shown",
    viewport: reveal.viewport,
    variants: reveal.group,
  } as const;
}
