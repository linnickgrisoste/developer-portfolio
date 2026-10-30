"use client";

import { useReducedMotion } from "motion/react";
import DecryptedText from "@/components/vendor/bits/DecryptedText";
import { useSkipEntrance } from "@/components/motion/entrance";
import { cn } from "@/lib/utils";

// Tempo de cada letra e o teto da animação inteira (ms): títulos longos aceleram em vez de se arrastar.
const MS_PER_LETTER = 35;
const MAX_TOTAL_MS = 600;

// Título de seção que "decodifica" ao entrar na tela, como uma tela de carregamento de jogo.
export function SectionHeading({ text, className }: { text: string; className?: string }) {
  const reduceMotion = useReducedMotion();
  const skipEntrance = useSkipEntrance();
  const speed = Math.min(MS_PER_LETTER, MAX_TOTAL_MS / text.length);

  return (
    <h2
      className={cn(
        "text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] font-bold tracking-[-0.02em] [font-variation-settings:'wdth'_112]",
        className,
      )}
      aria-label={text}
    >
      {reduceMotion || skipEntrance ? (
        text
      ) : (
        <DecryptedText
          key={text}
          text={text}
          animateOn="view"
          sequential
          revealDirection="start"
          speed={speed}
          characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+<>/"
          encryptedClassName="text-cobalt"
        />
      )}
    </h2>
  );
}
