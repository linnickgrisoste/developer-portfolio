"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { spring } from "@/lib/motion";

// Peças do catálogo de movimento que precisam de estado. O resto da página é do servidor.

/** Remonta o conteúdo para a entrada tocar de novo. */
export function Replay({ children }: { children: React.ReactNode }) {
  const [take, setTake] = useState(0);

  return (
    <div>
      <div key={take}>{children}</div>
      <button
        type="button"
        onClick={() => setTake((count) => count + 1)}
        className="mt-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-graphite ring-1 ring-rule transition-colors hover:text-ink"
      >
        <RotateCcw className="size-3.5" aria-hidden />
        Repetir entrada
      </button>
    </div>
  );
}

/** A terceira personalidade, a da recompensa: o pop com overshoot que só o jogo usa. */
export function RewardDemo() {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setUnlocked((value) => !value)}
      className="inline-flex h-12 items-center gap-3 rounded-full bg-ink px-5 text-[15px] font-semibold text-paper"
    >
      <span className="grid size-6 place-items-center">
        <AnimatePresence initial={false}>
          {unlocked && (
            <motion.span
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, transition: { duration: 0.15 } }}
              transition={spring.reward}
              className="grid size-6 place-items-center rounded-full bg-cobalt text-paper"
            >
              <Check className="size-3.5" strokeWidth={3} aria-hidden />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {unlocked ? "Desbloqueada" : "Desbloquear"}
    </button>
  );
}
