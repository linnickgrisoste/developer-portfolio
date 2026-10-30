"use client";

import { useRef, type CSSProperties } from "react";
import { motion } from "motion/react";
import type { Level } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useDepth, type DepthDriver } from "./depth";
import { useLevel } from "./engaged";

/**
 * A lateral cobalto: cópias do conteúdo atrás dele, deslocadas por `transform` conforme `--depth`.
 * Em repouso não aparece; o driver decide quando ela cresce (ver `DepthDriver`).
 * Feito para texto: o conteúdo é duplicado em camadas `aria-hidden`, então não ponha links ou botões dentro.
 */
export function Extrude({
  children,
  level = "title",
  driver,
  follow,
  engageWith,
  raised,
  className,
}: {
  children: React.ReactNode;
  level?: Level;
  driver?: DepthDriver;
  follow?: boolean;
  /** Engaja pelo ancestral mais próximo que casa com o seletor (ex.: "a" para o card inteiro). */
  engageWith?: string;
  /** Lateral acesa por fora do engajamento. */
  raised?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const { layers } = useLevel(level);
  const { props } = useDepth(ref, { level, driver, follow, engageWith, raised });

  return (
    <motion.span ref={ref} className={cn("extrude inline-block", className)} {...props}>
      <ExtrudeLayers count={layers}>{children}</ExtrudeLayers>
      <span className="extrude-face">{children}</span>
    </motion.span>
  );
}

/** As camadas em si, da mais funda para a mais rasa. Também usadas letra a letra pelo `KineticText`. */
export function ExtrudeLayers({ count, children }: { count: number; children: React.ReactNode }) {
  return Array.from({ length: count }, (_, index) => (
    <span key={index} aria-hidden className="extrude-layer" style={{ "--k": (count - index) / count } as CSSProperties}>
      {children}
    </span>
  ));
}
