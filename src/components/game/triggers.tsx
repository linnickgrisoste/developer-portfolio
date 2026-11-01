"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useInView } from "motion/react";
import type { AchievementId } from "@/content/game";
import { unlock } from "./store";

export function useAchievementOnView(ref: RefObject<Element | null>, id: AchievementId, amount = 0.25) {
  const inView = useInView(ref, { once: true, amount });

  useEffect(() => {
    if (inView) unlock(id);
  }, [inView, id]);
}

export function AchievementTrigger({ id, amount }: { id: AchievementId; amount?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useAchievementOnView(ref, id, amount);
  return <span ref={ref} aria-hidden className="pointer-events-none absolute inset-0" />;
}
