"use client";

import { Check } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale } from "@/components/providers";
import { gameCopy } from "@/content/game";
import { spring } from "@/lib/motion";

export function SeenBadge({ seen }: { seen: boolean }) {
  const { t } = useLocale();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {seen && (
        <motion.span
          initial={reduceMotion ? { opacity: 0 } : { scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={spring.reward}
          className="grid size-5 shrink-0 place-items-center rounded-full bg-reward text-paper"
          title={t(gameCopy.seenLabel)}
        >
          <Check className="size-3" strokeWidth={3} aria-hidden />
          <span className="sr-only">{t(gameCopy.seenLabel)}</span>
        </motion.span>
      )}
    </AnimatePresence>
  );
}
