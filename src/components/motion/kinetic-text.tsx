"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { motion, useInView } from "motion/react";
import { stagger, type Level } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useDepth, type DepthDriver } from "./depth";
import { useCapabilities } from "./drivers/capabilities";
import { subscribePointer } from "./drivers/pointer";
import { useLevel } from "./engaged";
import { useSkipEntrance } from "./entrance";
import { ExtrudeLayers } from "./extrude";

// Texto em que cada letra é um tipo físico. Três comportamentos, todos escalados pelo nível:
// 1. Entrada: as letras chegam de pontos diferentes e assentam como numa prensa.
// 2. Proximidade (mouse): enquanto engajado, peso e largura de cada letra crescem perto do cursor.
// 3. Onda (toque): ao passar pela faixa central, uma onda de peso atravessa as letras.
// Com `extrude`, cada letra ganha a lateral neon, que acompanha a letra na entrada e na proximidade.

type Tag = "span" | "h1" | "h2" | "h3" | "p";

/**
 * Quando a entrada toca:
 * - "view": ao aparecer na tela (o padrão);
 * - "load": desde a primeira pintura, só com CSS, sem esperar o JavaScript (para o que já nasce na tela, como o hero);
 * - false: sem entrada (quando outra coisa já anima o bloco, como uma revelação ou uma cortina).
 */
export type Entrance = "view" | "load" | false;

/** Tempo entre letras na entrada (ms). Textos longos aceleram para caber no teto de cascata. */
const LETTER_MS = 35;
/** Quanto a proximidade soma ao peso e à largura no nível assinatura (os outros níveis escalam por baixo). */
const NEAR_WEIGHT = 200;
const NEAR_WIDTH = 25;
/** Limites dos eixos da Archivo. */
const MAX_WEIGHT = 900;
const MAX_WIDTH = 125;

export function KineticText({
  text,
  level = "title",
  as = "span",
  weight = 700,
  width = 100,
  extrude = false,
  entrance = "view",
  wrap = "word",
  engageWith,
  offset = 0,
  raised,
  proximity = true,
  className,
}: {
  text: string;
  level?: Level;
  as?: Tag;
  /** Peso de repouso (eixo `wght` da Archivo). */
  weight?: number;
  /** Largura de repouso (eixo `wdth` da Archivo). */
  width?: number;
  /** Lateral neon por letra. `true` usa o driver "engaged"; um driver escolhe outro. */
  extrude?: boolean | DepthDriver;
  entrance?: Entrance;
  /** "word" não quebra palavras no meio; "anywhere" quebra em qualquer letra (e-mails, URLs). */
  wrap?: "word" | "anywhere";
  /** Engaja pelo ancestral mais próximo que casa com o seletor (ex.: "a" para a linha inteira de uma lista). */
  engageWith?: string;
  /** Posição da primeira letra na cascata, para um texto continuar outro (ex.: nome e sobrenome em linhas separadas). */
  offset?: number;
  /** Lateral acesa por fora do engajamento. */
  raised?: boolean;
  /** Peso e largura seguindo o cursor. Desligue quando o texto estiver só ocupando lugar (ex.: o 3D por cima dele). */
  proximity?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { reducedMotion, finePointer } = useCapabilities();
  const skipEntrance = useSkipEntrance();
  const { amplitude, layers } = useLevel(level);
  const { engaged, props } = useDepth(ref, {
    level,
    driver: typeof extrude === "string" ? extrude : "engaged",
    engageWith,
    raised,
  });
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  const letterCount = offset + text.replace(/\s/g, "").length;
  const letterMs = Math.min(LETTER_MS, (stagger.max * 1000) / Math.max(letterCount, 1));
  const entranceMs = 700 + 500 * amplitude + letterMs * letterCount;
  // "load" já sai do servidor armado e tocando; logo após trocar de idioma, nasce assentado.
  const playsOnLoad = entrance === "load" && !skipEntrance;

  // "view": arma a entrada antes da primeira pintura; as letras esperam escondidas até o texto aparecer.
  // Atributos no DOM (e não estado) para não re-renderizar o texto inteiro a cada fase.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || entrance !== "view") return;
    element.toggleAttribute("data-armed", !reducedMotion && !skipEntrance);
  }, [entrance, reducedMotion, skipEntrance]);

  // Quando a entrada acaba (ou se não houver), solta o texto para a proximidade, a onda e a respiração.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const settle = () => {
      element.removeAttribute("data-armed");
      element.removeAttribute("data-set");
      element.setAttribute("data-settled", "");
    };
    if (playsOnLoad) {
      if (reducedMotion) return settle();
      const timer = window.setTimeout(settle, entranceMs);
      return () => window.clearTimeout(timer);
    }
    if (!inView) return;
    if (!element.hasAttribute("data-armed")) return settle();
    element.setAttribute("data-set", "");
    const timer = window.setTimeout(settle, entranceMs);
    return () => window.clearTimeout(timer);
  }, [playsOnLoad, inView, entranceMs, reducedMotion]);

  // Proximidade: só enquanto engajado com mouse. Os centros das letras são medidos uma vez ao engajar
  // (e de novo só se a página rolar ou mudar de tamanho); a cada quadro só se escrevem pesos. Medir a cada
  // quadro, logo depois de mudar a largura das letras, obrigava o navegador a refazer o layout toda hora.
  useEffect(() => {
    const element = ref.current;
    if (!element || !proximity || !engaged || !finePointer || reducedMotion) return;
    const letters = Array.from(element.querySelectorAll<HTMLElement>("[data-k]"));
    const fontSize = parseFloat(getComputedStyle(element).fontSize);
    // Alcance da proximidade: cerca de duas letras para cada lado no nível assinatura, menos nos outros.
    const sigma = fontSize * (0.45 + 0.3 * amplitude);
    const addWeight = NEAR_WEIGHT * amplitude;
    const addWidth = NEAR_WIDTH * amplitude;

    let centers: [number, number][] = [];
    const measure = () => {
      centers = letters.map((letter) => {
        const rect = letter.getBoundingClientRect();
        return [rect.left + rect.width / 2, rect.top + rect.height / 2];
      });
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    // Escreve quanto somar ao peso e à largura (--kinetic-dw/--kinetic-dwd); o CSS arredonda e suaviza
    // (ver "Texto cinético" em globals.css).
    const stop = subscribePointer(({ x, y }) => {
      letters.forEach((letter, index) => {
        const [cx, cy] = centers[index];
        const d2 = (cx - x) ** 2 + (cy - y) ** 2;
        const pull = Math.exp(-d2 / (2 * sigma * sigma));
        letter.style.setProperty("--kinetic-dw", Math.min(addWeight * pull, MAX_WEIGHT - weight).toFixed(1));
        letter.style.setProperty("--kinetic-dwd", Math.min(addWidth * pull, MAX_WIDTH - width).toFixed(2));
      });
    });
    return () => {
      stop();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      letters.forEach((letter) => {
        letter.style.removeProperty("--kinetic-dw");
        letter.style.removeProperty("--kinetic-dwd");
      });
    };
  }, [proximity, engaged, finePointer, reducedMotion, amplitude, weight, width]);

  const Component = motion[as] as typeof motion.span;
  let index = offset;
  const letter = (char: string) => {
    const i = index++;
    return (
      <span key={i} data-k style={{ "--i": i } as CSSProperties}>
        {extrude && <ExtrudeLayers count={layers}>{char}</ExtrudeLayers>}
        <span className="extrude-face">{char}</span>
      </span>
    );
  };

  return (
    <Component
      ref={ref}
      className={cn("kinetic", extrude && "extrude", className)}
      {...props}
      data-touch={finePointer ? undefined : ""}
      data-armed={playsOnLoad ? "" : undefined}
      data-set={playsOnLoad ? "" : undefined}
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
      {/* Leitores de tela leem o texto inteiro uma vez; as letras soltas são só desenho. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {wrap === "anywhere"
          ? Array.from(text).map(letter)
          : text.split(" ").map((word, wordIndex, words) => (
              <Fragment key={wordIndex}>
                {/* Cada palavra não quebra no meio: as letras são inline-block e quebrariam em qualquer ponto. */}
                <span className="kinetic-word">{Array.from(word).map(letter)}</span>
                {wordIndex < words.length - 1 && " "}
              </Fragment>
            ))}
      </span>
    </Component>
  );
}
