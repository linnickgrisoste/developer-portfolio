import type { Transition, Variants } from "motion/react";

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
 *
 * O deslocamento vai como `transform` inteiro (e não `y`): assim o Motion entrega a animação ao
 * navegador (WAAPI), que a roda na placa de vídeo. Com `y`, cada quadro era calculado em JS e
 * repintava a página inteira enquanto a seção entrava.
 * O alvo é explícito: com `"none"`, o Motion zera os números da origem (`scale(1.15)` viraria
 * `scale(0)`). No fim, `transitionEnd` tira o transform, para não sobrar um contexto de empilhamento.
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

/*
 * Níveis de intensidade. Toda primitiva de movimento recebe um nível, nunca números soltos:
 * - assinatura: um por página (o nome do hero);
 * - título: títulos de seção, nomes de projeto, o e-mail do contato;
 * - detalhe: cards, links, botões, números.
 * `amplitude` escala deslocamentos, giros e variação de fonte; `depth` é a lateral neon
 * quando engajado (em `em`, para acompanhar o tamanho do texto); `layers` é quantas camadas a formam.
 * Camadas são cópias do texto no DOM: poucas bastam para a lateral parecer sólida, e cada uma a mais pesa.
 */
export type Level = "signature" | "title" | "detail";

export const levels = {
  signature: { amplitude: 1, depth: 0.12, layers: 8 },
  title: { amplitude: 0.55, depth: 0.07, layers: 4 },
  detail: { amplitude: 0.3, depth: 0.04, layers: 3 },
} satisfies Record<Level, { amplitude: number; depth: number; layers: number }>;

/** Cascatas: entre itens de uma lista, entre letras, e o teto da cascata inteira (segundos). */
export const stagger = { micro: 0.025, base: 0.06, max: 0.5 };
