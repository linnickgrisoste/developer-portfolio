"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useInView } from "motion/react";
import type { AchievementId } from "@/content/game";
import { unlock } from "./store";

/** Desbloqueia a conquista na primeira vez que o elemento aparece na tela (`amount` é a fração visível). */
export function useAchievementOnView(ref: RefObject<Element | null>, id: AchievementId, amount = 0.25) {
  const inView = useInView(ref, { once: true, amount });

  useEffect(() => {
    if (inView) unlock(id);
  }, [inView, id]);
}

/**
 * A mesma coisa, declarada no JSX de uma seção do servidor: `<AchievementTrigger id="quest-log" />`.
 * Ocupa o primeiro ancestral posicionado inteiro (a `<Section>` já é), sem afetar o layout nem os cliques.
 */
export function AchievementTrigger({ id, amount }: { id: AchievementId; amount?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useAchievementOnView(ref, id, amount);
  return <span ref={ref} aria-hidden className="pointer-events-none absolute inset-0" />;
}
