"use client";

import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { reveal } from "@/lib/motion";

// Entradas acontecem uma vez por visita: a página remontada por uma troca de idioma nasce com tudo no lugar.

const SKIP_WINDOW_MS = 4000;
let localeSwitchedAt = 0;

export function markLocaleSwitch() {
  localeSwitchedAt = Date.now();
}

/** true na página montada logo depois de uma troca de idioma; no servidor, sempre false. */
export function useSkipEntrance() {
  const [skip] = useState(() => Date.now() - localeSwitchedAt < SKIP_WINDOW_MS);
  return skip;
}

/** Props do contêiner de uma revelação em cascata; os filhos usam `variants={reveal.item}`. */
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
