import type { Transition, Variants } from "motion/react";

// Tokens de movimento. Só a camada de jogo usa overshoot (`spring.reward`): o quique sinaliza recompensa.

type Bezier = [number, number, number, number];

export const ease = {
  /** Curva de assinatura. Espelha `--ease-brand` em globals.css. */
  out: [0.2, 0.7, 0.1, 1],
  in: [0.4, 0, 1, 1],
} satisfies Record<string, Bezier>;

/** Segundos: saídas, cards e engajamento, revelações. */
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

/**
 * Revelação ao rolar (`initial="hidden" whileInView="shown"`).
 * `transform` como string inteira vira WAAPI e roda na placa de vídeo; com `y`, o Motion calcula cada quadro em JS.
 * O alvo é explícito porque `"none"` zera os números da origem; `transitionEnd` evita sobrar um contexto de empilhamento.
 */
export const reveal = {
  viewport: { once: true, margin: "0px 0px -15% 0px" },
  group: {
    hidden: {},
    shown: { transition: { staggerChildren: 0.06 } },
  },
  item: {
    hidden: { opacity: 0, transform: "translateY(16px)" },
    shown: {
      opacity: 1,
      transform: "translateY(0px)",
      transitionEnd: { transform: "none" },
      transition: { duration: duration.slow, ease: ease.out },
    },
  },
} satisfies { viewport: object; group: Variants; item: Variants };

/** Assinatura: o nome do hero. Título: títulos, nomes de projeto, e-mail. Detalhe: cards, links, botões, números. */
export type Level = "signature" | "title" | "detail";

/** `depth` em `em`; cada uma das `layers` é uma cópia do texto no DOM, então poucas bastam. */
export const levels = {
  signature: { amplitude: 1, depth: 0.12, layers: 8 },
  title: { amplitude: 0.55, depth: 0.07, layers: 4 },
  detail: { amplitude: 0.3, depth: 0.04, layers: 3 },
} satisfies Record<Level, { amplitude: number; depth: number; layers: number }>;

/** Ciclo de cor do ponto final. Espelha `.full-stop-dot` em globals.css. */
export const dotCycle = { seconds: 9, delaySeconds: 2 };

/** Segundos: entre itens, entre letras e o teto da cascata inteira. */
export const stagger = { micro: 0.025, base: 0.06, max: 0.5 };
