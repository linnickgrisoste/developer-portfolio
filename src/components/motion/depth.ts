"use client";

import { useEffect, type CSSProperties, type RefObject } from "react";
import { useMotionValueEvent, useTransform } from "motion/react";
import type { Level } from "@/lib/motion";
import { useCapabilities } from "./drivers/capabilities";
import { subscribePointer } from "./drivers/pointer";
import { useScrollVelocity } from "./drivers/scroll-velocity";
import { useEngaged, useLevel } from "./engaged";

/**
 * O que acende a lateral neon:
 * - "engaged": aparece quando o elemento é engajado (hover, foco ou faixa central) e some ao sair;
 * - "velocity": cresce com a velocidade do scroll, para cima ou para baixo, como um rastro;
 * - "proximity": cresce conforme o cursor se aproxima, sem precisar tocar no elemento.
 */
export type DepthDriver = "engaged" | "velocity" | "proximity";

/** Velocidade (px/s) que leva a lateral à profundidade máxima no driver "velocity". */
const FULL_VELOCITY = 1800;
/** Abaixo disto a lateral está "recolhida": as camadas se escondem para não deixar halo em volta do texto. */
const RAISED_VELOCITY = 40;
const RAISED_CLOSENESS = 0.02;

type DepthOptions = {
  level: Level;
  driver?: DepthDriver;
  /** A lateral se afasta do cursor, como a sombra de uma luz que o acompanha. */
  follow?: boolean;
  /** Engaja pelo ancestral mais próximo que casa com o seletor (ex.: "a" para o card inteiro). */
  engageWith?: string;
  /** Mantém a lateral acesa por fora do engajamento (ex.: o ano que a linha do tempo já alcançou). */
  raised?: boolean;
};

function setRaised(element: HTMLElement, raised: boolean) {
  element.toggleAttribute("data-raised", raised);
}

/**
 * Liga um elemento `.extrude` (ou qualquer ancestral de `.extrude-layer`) ao seu driver.
 * Devolve `engaged` e as props que o elemento precisa; o CSS em globals.css faz o resto.
 * As props devem ir para um componente `motion.*`: o driver "velocity" passa MotionValues no estilo.
 */
export function useDepth(
  ref: RefObject<HTMLElement | null>,
  { level, driver = "engaged", follow = false, engageWith, raised = false }: DepthOptions,
) {
  const { reducedMotion } = useCapabilities();
  const { depth, layers } = useLevel(level);
  const engaged = useEngaged(ref, { closest: engageWith }) || raised;
  const animated = !reducedMotion;
  const velocity = useScrollVelocity(animated && driver === "velocity");
  // Rastro do scroll: profundidade proporcional à velocidade, do lado oposto ao movimento.
  const velocityDepth = useTransform(velocity, (v) => `${Math.min(Math.abs(v) / FULL_VELOCITY, 1) * depth}em`);
  const velocityDirection = useTransform(velocity, (v) => (v >= 0 ? 1 : -1));

  useMotionValueEvent(velocity, "change", (v) => {
    if (animated && driver === "velocity" && ref.current) setRaised(ref.current, Math.abs(v) > RAISED_VELOCITY);
  });

  // Proximidade e direção pelo cursor: escrevem direto no elemento, sem re-render a cada quadro.
  useEffect(() => {
    const element = ref.current;
    if (!element || !animated || (driver !== "proximity" && !follow)) return;
    return subscribePointer(({ x, y }) => {
      const rect = element.getBoundingClientRect();
      const dx = rect.left + rect.width / 2 - x;
      const dy = rect.top + rect.height / 2 - y;
      if (follow) {
        const length = Math.hypot(dx, dy) || 1;
        element.style.setProperty("--dx", (dx / length).toFixed(3));
        element.style.setProperty("--dy", (dy / length).toFixed(3));
      }
      if (driver === "proximity") {
        // Alcance: uma vez e meia a maior dimensão do elemento, medido a partir da borda dele.
        const reach = Math.max(rect.width, rect.height) * 1.5;
        const outside = Math.max(Math.abs(dx) - rect.width / 2, 0) + Math.max(Math.abs(dy) - rect.height / 2, 0);
        const closeness = Math.max(1 - outside / reach, 0) ** 2;
        element.style.setProperty("--depth", `${(closeness * depth).toFixed(4)}em`);
        setRaised(element, closeness > RAISED_CLOSENESS);
      }
    });
  }, [ref, animated, driver, follow, depth]);

  const style: CSSProperties & Record<string, unknown> = {
    "--layers": layers,
    "--depth-max": `${depth}em`,
  };
  if (animated && driver === "velocity") {
    style["--depth"] = velocityDepth;
    style["--dy"] = velocityDirection;
    style["--dx"] = 0;
  }

  return {
    engaged,
    props: {
      "data-depth-driver": animated ? driver : undefined,
      "data-engaged": animated && engaged ? "" : undefined,
      // No driver "engaged" quem decide é o React; nos outros, o próprio driver liga e desliga o atributo.
      ...(driver === "engaged" ? { "data-raised": animated && engaged ? "" : undefined } : {}),
      style,
    },
  };
}
