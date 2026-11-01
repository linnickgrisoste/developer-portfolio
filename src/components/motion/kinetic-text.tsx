"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, type CSSProperties, type RefObject } from "react";
import { motion, useInView } from "motion/react";
import { stagger, type Level } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useDepth, type DepthDriver } from "./depth";
import { useCapabilities } from "./drivers/capabilities";
import { subscribePointer } from "./drivers/pointer";
import { useLevel } from "./engaged";
import { useSkipEntrance } from "./entrance";
import { ExtrudeLayers } from "./extrude";

type Tag = "span" | "h1" | "h2" | "h3" | "p";

export type Entrance = "view" | "load" | false;

const LETTER_MS = 35;
const ENTRANCE_BASE_MS = 700;
const ENTRANCE_AMPLITUDE_MS = 500;
const NEAR_WEIGHT = 200;
const NEAR_WIDTH = 25;
const NEAR_RADIUS_BASE = 0.45;
const NEAR_RADIUS_AMPLITUDE = 0.3;
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
  weight?: number;
  width?: number;
  extrude?: boolean | DepthDriver;
  entrance?: Entrance;
  wrap?: "word" | "anywhere";
  engageWith?: string;
  offset?: number;
  raised?: boolean;
  proximity?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { reducedMotion, finePointer } = useCapabilities();
  const { amplitude, layers } = useLevel(level);
  const { engaged, props } = useDepth(ref, {
    level,
    driver: typeof extrude === "string" ? extrude : "engaged",
    engageWith,
    raised,
  });

  const letterCount = offset + text.replace(/\s/g, "").length;
  const letterMs = Math.min(LETTER_MS, (stagger.max * 1000) / Math.max(letterCount, 1));
  const entranceMs = ENTRANCE_BASE_MS + ENTRANCE_AMPLITUDE_MS * amplitude + letterMs * letterCount;
  const playsOnLoad = useLetterEntrance(ref, entrance, entranceMs);

  useLetterProximity(ref, {
    enabled: proximity && engaged && finePointer && !reducedMotion,
    amplitude,
    weight,
    width,
  });

  const Component = motion[as] as typeof motion.span;

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
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        <Letters text={text} wrap={wrap} offset={offset} layers={extrude ? layers : 0} />
      </span>
    </Component>
  );
}

function Letters({
  text,
  wrap,
  offset,
  layers,
}: {
  text: string;
  wrap: "word" | "anywhere";
  offset: number;
  layers: number;
}) {
  let index = offset;
  const letter = (char: string) => {
    const i = index++;
    return (
      <span key={i} data-k style={{ "--i": i } as CSSProperties}>
        {layers > 0 && <ExtrudeLayers count={layers}>{char}</ExtrudeLayers>}
        <span className="extrude-face">{char}</span>
      </span>
    );
  };

  if (wrap === "anywhere") return Array.from(text).map(letter);

  return text.split(" ").map((word, wordIndex, words) => (
    <Fragment key={wordIndex}>
      <span className="kinetic-word">{Array.from(word).map(letter)}</span>
      {wordIndex < words.length - 1 && " "}
    </Fragment>
  ));
}

function useLetterEntrance(ref: RefObject<HTMLElement | null>, entrance: Entrance, entranceMs: number) {
  const { reducedMotion } = useCapabilities();
  const skipEntrance = useSkipEntrance();
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const playsOnLoad = entrance === "load" && !skipEntrance;

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || entrance !== "view") return;
    element.toggleAttribute("data-armed", !reducedMotion && !skipEntrance);
  }, [ref, entrance, reducedMotion, skipEntrance]);

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
    } else {
      if (!inView) return;
      if (!element.hasAttribute("data-armed")) return settle();
      element.setAttribute("data-set", "");
    }
    const timer = window.setTimeout(settle, entranceMs);
    return () => window.clearTimeout(timer);
  }, [ref, playsOnLoad, inView, entranceMs, reducedMotion]);

  return playsOnLoad;
}

function useLetterProximity(
  ref: RefObject<HTMLElement | null>,
  { enabled, amplitude, weight, width }: { enabled: boolean; amplitude: number; weight: number; width: number },
) {
  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;
    const letters = Array.from(element.querySelectorAll<HTMLElement>("[data-k]"));
    const fontSize = parseFloat(getComputedStyle(element).fontSize);
    const sigma = fontSize * (NEAR_RADIUS_BASE + NEAR_RADIUS_AMPLITUDE * amplitude);
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

    const stop = subscribePointer(({ x, y }) => {
      letters.forEach((letter, index) => {
        const [cx, cy] = centers[index];
        const pull = Math.exp(-((cx - x) ** 2 + (cy - y) ** 2) / (2 * sigma * sigma));
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
  }, [ref, enabled, amplitude, weight, width]);
}
