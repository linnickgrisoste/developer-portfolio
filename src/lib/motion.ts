import { useState } from "react";
import { useReducedMotion, type Transition, type Variants } from "motion/react";

// Identidade de movimento do site. Duas personalidades, com papéis separados:
// - Editorial: entra desacelerando e pousa sem passar do ponto.
// - Jogo: a única camada que "quica". O bounce sinaliza recompensa, então fica reservado a ela.

type Bezier = [number, number, number, number];

export const ease = {
  /** Entradas: começa rápido e pousa devagar. É a curva de assinatura (espelhada em `--ease-brand` no CSS). */
  out: [0.2, 0.7, 0.1, 1],
  /** Saídas: começa devagar e acelera para fora. */
  in: [0.4, 0, 1, 1],
} satisfies Record<string, Bezier>;

/** Durações em segundos: rápida (saídas, trocas de ícone), padrão (cards) e lenta (revelações). */
export const duration = {
  fast: 0.2,
  base: 0.35,
  slow: 0.6,
};

export const spring = {
  /** Layout, modais e avisos: firme, sem overshoot visível. */
  ui: { type: "spring", stiffness: 380, damping: 32 },
  /** Recompensas do jogo: pop com overshoot. */
  reward: { type: "spring", stiffness: 420, damping: 14 },
  /** Progresso que enche devagar, como a barra de XP. */
  soft: { type: "spring", stiffness: 120, damping: 20 },
} satisfies Record<string, Transition>;

/** Saída padrão: curta e acelerando, para não disputar atenção com o que entra. */
export const exit: Transition = { duration: duration.fast, ease: ease.in };

/**
 * Revelação ao rolar. O grupo dispara uma vez, quando entra 15% na tela,
 * e os itens sobem em cascata. Uso: `initial="hidden" whileInView="shown"`.
 */
export const reveal = {
  viewport: { once: true, margin: "0px 0px -15% 0px" },
  group: {
    hidden: {},
    shown: { transition: { staggerChildren: 0.06 } },
  },
  item: {
    hidden: { opacity: 0, y: 16 },
    shown: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.out } },
  },
} satisfies { viewport: object; group: Variants; item: Variants };

/**
 * Props do contêiner de uma revelação em cascata. Os filhos usam `variants={reveal.item}`.
 * Com movimento reduzido, o conteúdo já nasce no lugar.
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
