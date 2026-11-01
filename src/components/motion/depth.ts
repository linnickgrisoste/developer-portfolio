"use client";

import { useEffect, type CSSProperties, type RefObject } from "react";
import { useMotionValueEvent, useTransform } from "motion/react";
import type { Level } from "@/lib/motion";
import { useCapabilities } from "./drivers/capabilities";
import { subscribePointer } from "./drivers/pointer";
import { screenRect } from "./drivers/screen-rect";
import { useScrollVelocity } from "./drivers/scroll-velocity";
import { useEngaged, useLevel } from "./engaged";

export type DepthDriver = "engaged" | "velocity" | "proximity";

/** Velocidade (px/s) que leva a lateral à profundidade máxima. */
const FULL_VELOCITY = 1800;
/** Alcance da proximidade, em múltiplos da maior dimensão do elemento, medido a partir da borda. */
const PROXIMITY_REACH = 1.5;
// Abaixo destes limites as camadas se escondem, para não deixar halo em volta do texto.
const RAISED_VELOCITY = 40;
const RAISED_CLOSENESS = 0.02;

type DepthOptions = {
  level: Level;
  driver?: DepthDriver;
  /** A lateral se afasta do cursor, como a sombra de uma luz que o acompanha. */
  follow?: boolean;
  engageWith?: string;
  raised?: boolean;
};

function setRaised(element: HTMLElement, raised: boolean) {
  element.toggleAttribute("data-raised", raised);
}

function closenessTo(rect: DOMRect, dx: number, dy: number) {
  const reach = Math.max(rect.width, rect.height) * PROXIMITY_REACH;
  const outside = Math.max(Math.abs(dx) - rect.width / 2, 0) + Math.max(Math.abs(dy) - rect.height / 2, 0);
  return Math.max(1 - outside / reach, 0) ** 2;
}

/** As props vão para um `motion.*`: o driver "velocity" passa MotionValues no estilo. */
export function useDepth(
  ref: RefObject<HTMLElement | null>,
  { level, driver = "engaged", follow = false, engageWith, raised = false }: DepthOptions,
) {
  const { reducedMotion } = useCapabilities();
  const { depth, layers } = useLevel(level);
  const engaged = useEngaged(ref, { closest: engageWith }) || raised;
  const animated = !reducedMotion;
  const byVelocity = animated && driver === "velocity";
  const byPointer = animated && (driver === "proximity" || follow);

  const velocity = useScrollVelocity(byVelocity);
  const velocityDepth = useTransform(velocity, (v) => `${Math.min(Math.abs(v) / FULL_VELOCITY, 1) * depth}em`);
  const velocityDirection = useTransform(velocity, (v) => (v >= 0 ? 1 : -1));

  useMotionValueEvent(velocity, "change", (v) => {
    if (byVelocity && ref.current) setRaised(ref.current, Math.abs(v) > RAISED_VELOCITY);
  });

  // Escreve direto no estilo do elemento, sem re-render a cada quadro.
  useEffect(() => {
    const element = ref.current;
    if (!element || !byPointer) return;
    return subscribePointer(({ x, y }) => {
      const rect = screenRect(element);
      const dx = rect.left + rect.width / 2 - x;
      const dy = rect.top + rect.height / 2 - y;
      if (follow) {
        const length = Math.hypot(dx, dy) || 1;
        element.style.setProperty("--dx", (dx / length).toFixed(3));
        element.style.setProperty("--dy", (dy / length).toFixed(3));
      }
      if (driver === "proximity") {
        const closeness = closenessTo(rect, dx, dy);
        element.style.setProperty("--depth", `${(closeness * depth).toFixed(4)}em`);
        setRaised(element, closeness > RAISED_CLOSENESS);
      }
    });
  }, [ref, byPointer, driver, follow, depth]);

  const style: CSSProperties & Record<string, unknown> = {
    "--layers": layers,
    "--depth-max": `${depth}em`,
  };
  if (byVelocity) {
    style["--depth"] = velocityDepth;
    style["--dy"] = velocityDirection;
    style["--dx"] = 0;
  }

  return {
    engaged,
    props: {
      "data-depth-driver": animated ? driver : undefined,
      "data-engaged": animated && engaged ? "" : undefined,
      // Só no driver "engaged" o React decide `data-raised`; nos outros, o próprio driver liga e desliga.
      ...(driver === "engaged" ? { "data-raised": animated && engaged ? "" : undefined } : {}),
      style,
    },
  };
}
