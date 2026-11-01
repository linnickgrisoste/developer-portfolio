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

/** Para seções do servidor: cobre o primeiro ancestral posicionado, sem afetar layout nem cliques. */
export function AchievementTrigger({ id, amount }: { id: AchievementId; amount?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useAchievementOnView(ref, id, amount);
  return <span ref={ref} aria-hidden className="pointer-events-none absolute inset-0" />;
}
