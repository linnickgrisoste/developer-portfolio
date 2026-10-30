"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { motion, useInView } from "motion/react";
import { stagger, type Level } from "@/lib/motion";
import { useSkipEntrance } from "./entrance";
import { cn } from "@/lib/utils";
import { useDepth, type DepthDriver } from "./depth";
import { useCapabilities } from "./drivers/capabilities";
import { subscribePointer } from "./drivers/pointer";
import { useLevel } from "./engaged";
import { ExtrudeLayers } from "./extrude";

// Texto em que cada letra é um tipo físico. Três comportamentos, todos escalados pelo nível:
// 1. Entrada: ao aparecer na tela, as letras chegam de pontos diferentes e assentam como numa prensa.
// 2. Proximidade (mouse): enquanto engajado, peso e largura de cada letra crescem perto do cursor.
// 3. Onda (toque): ao passar pela faixa central, uma onda de peso atravessa as letras.
// Com `extrude`, cada letra ganha a lateral cobalto, que acompanha a letra na entrada e na proximidade.

type Tag = "span" | "h1" | "h2" | "h3" | "p";

/** Tempo entre letras na entrada (ms). Textos longos aceleram para caber no teto de cascata. */
const LETTER_MS = 35;
/** Quanto a proximidade soma ao peso e à largura no nível assinatura (os outros níveis escalam por baixo). */
const NEAR_WEIGHT = 200;
const NEAR_WIDTH = 25;

export function KineticText({
  text,
  level = "title",
  as = "span",
  weight = 700,
  width = 100,
  extrude = false,
  className,
}: {
  text: string;
  level?: Level;
  as?: Tag;
  /** Peso de repouso (eixo `wght` da Archivo). */
  weight?: number;
  /** Largura de repouso (eixo `wdth` da Archivo). */
  width?: number;
  /** Lateral cobalto por letra. `true` usa o driver "engaged"; um driver escolhe outro. */
  extrude?: boolean | DepthDriver;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { reducedMotion, finePointer } = useCapabilities();
  const skipEntrance = useSkipEntrance();
  const { amplitude, layers } = useLevel(level);
  const { engaged, props } = useDepth(ref, { level, driver: typeof extrude === "string" ? extrude : "engaged" });
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  const letterCount = text.replace(/\s/g, "").length;
  const letterMs = Math.min(LETTER_MS, (stagger.max * 1000) / Math.max(letterCount, 1));
  const entranceMs = 700 + 500 * amplitude + letterMs * letterCount;

  // Arma a entrada antes da primeira pintura: as letras esperam escondidas até o texto aparecer.
  // Atributos no DOM (e não estado) para não re-renderizar o texto inteiro a cada fase.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.toggleAttribute("data-armed", !reducedMotion && !skipEntrance);
  }, [reducedMotion, skipEntrance]);

  // Ao aparecer: toca a entrada e, quando ela acaba, solta o texto para a proximidade e a onda.
  useEffect(() => {
    const element = ref.current;
    if (!element || !inView) return;
    if (!element.hasAttribute("data-armed")) {
      element.setAttribute("data-settled", "");
      return;
    }
    element.setAttribute("data-set", "");
    const timer = window.setTimeout(() => {
      element.removeAttribute("data-armed");
      element.removeAttribute("data-set");
      element.setAttribute("data-settled", "");
    }, entranceMs);
    return () => window.clearTimeout(timer);
  }, [inView, entranceMs]);

  // Proximidade: só enquanto engajado com mouse. Lê todas as posições, depois escreve todos os pesos.
  useEffect(() => {
    const element = ref.current;
    if (!element || !engaged || !finePointer || reducedMotion) return;
    const letters = Array.from(element.querySelectorAll<HTMLElement>("[data-k]"));
    const fontSize = parseFloat(getComputedStyle(element).fontSize);
    // Alcance da proximidade: cerca de duas letras para cada lado no nível assinatura, menos nos outros.
    const sigma = fontSize * (0.45 + 0.3 * amplitude);
    const addWeight = NEAR_WEIGHT * amplitude;
    const addWidth = NEAR_WIDTH * amplitude;

    const stop = subscribePointer(({ x, y }) => {
      const pulls = letters.map((letter) => {
        const rect = letter.getBoundingClientRect();
        const d = Math.hypot(rect.left + rect.width / 2 - x, rect.top + rect.height / 2 - y);
        return Math.exp(-(d * d) / (2 * sigma * sigma));
      });
      letters.forEach((letter, index) => {
        const pull = pulls[index];
        letter.style.fontVariationSettings = `"wght" ${Math.min(weight + addWeight * pull, 900).toFixed(0)}, "wdth" ${Math.min(width + addWidth * pull, 125).toFixed(1)}`;
      });
    });
    return () => {
      stop();
      letters.forEach((letter) => (letter.style.fontVariationSettings = ""));
    };
  }, [engaged, finePointer, reducedMotion, amplitude, weight, width]);

  const Component = motion[as] as typeof motion.span;
  const words = text.split(" ");
  let index = 0;

  return (
    <Component
      ref={ref}
      aria-label={text}
      className={cn("kinetic", extrude && "extrude", className)}
      {...props}
      data-touch={finePointer ? undefined : ""}
      style={
        {
          ...props.style,
          "--amp": amplitude,
          "--kinetic-weight": weight,
          "--kinetic-width": width,
          "--kinetic-stagger": `${letterMs}ms`,
        } as CSSProperties
      }
    >
      {words.map((word, wordIndex) => (
        <Fragment key={wordIndex}>
          {/* Cada palavra não quebra no meio: as letras são inline-block e quebrariam em qualquer ponto. */}
          <span aria-hidden className="kinetic-word">
            {Array.from(word).map((char) => {
              const i = index++;
              return (
                <span key={i} data-k style={{ "--i": i } as CSSProperties}>
                  {extrude && <ExtrudeLayers count={layers}>{char}</ExtrudeLayers>}
                  <span className="extrude-face">{char}</span>
                </span>
              );
            })}
          </span>
          {wordIndex < words.length - 1 && " "}
        </Fragment>
      ))}
    </Component>
  );
}
