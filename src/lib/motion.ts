import type { Transition, Variants } from "motion/react";

type Bezier = [number, number, number, number];

export const ease = {
  out: [0.2, 0.7, 0.1, 1],
  in: [0.4, 0, 1, 1],
} satisfies Record<string, Bezier>;

export const duration = {
  fast: 0.2,
  base: 0.35,
  slow: 0.6,
};

export const spring = {
  ui: { type: "spring", stiffness: 380, damping: 32 },
  reward: { type: "spring", stiffness: 420, damping: 14 },
  soft: { type: "spring", stiffness: 120, damping: 20 },
} satisfies Record<string, Transition>;

export const exit: Transition = { duration: duration.fast, ease: ease.in };

export const reveal = {
  viewport: { once: true, margin: "0px 0px -15% 0px" },
  group: {
    hidden: {},
    shown: { transition: { staggerChildren: 0.06 } },
  },
  item: {
    // transform em string vira WAAPI e roda na placa de vídeo; com `y`, o Motion calcularia cada quadro em JS.
    hidden: { opacity: 0, transform: "translateY(16px)" },
    shown: {
      opacity: 1,
      transform: "translateY(0px)",
      transitionEnd: { transform: "none" },
      transition: { duration: duration.slow, ease: ease.out },
    },
  },
} satisfies { viewport: object; group: Variants; item: Variants };

export type Level = "signature" | "title" | "detail";

export const levels = {
  signature: { amplitude: 1, depth: 0.12, layers: 8 },
  title: { amplitude: 0.55, depth: 0.07, layers: 4 },
  detail: { amplitude: 0.3, depth: 0.04, layers: 3 },
} satisfies Record<Level, { amplitude: number; depth: number; layers: number }>;

// Espelha o ciclo de .full-stop-dot em globals.css: mudar um exige mudar o outro.
export const dotCycle = { seconds: 9, delaySeconds: 2 };

export const stagger = { micro: 0.025, base: 0.06, max: 0.5 };
