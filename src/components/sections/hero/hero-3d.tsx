"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import dynamic from "next/dynamic";
import { motion, useInView, type MotionValue } from "motion/react";
import { useIdle } from "@/components/three/gate";
import type { HeroLayout } from "@/components/three/hero/layout";
import { useFullStopLoose } from "./full-stop";

// A cena só é baixada quando este componente decide mostrá-la: nunca entra no pacote inicial.
const HeroScene = dynamic(() => import("@/components/three/hero/hero-scene"), { ssr: false });

/** Posição de um elemento relativa a um ancestral posicionado, ignorando `transform` (o nome é prensado ao rolar). */
function offsetWithin(element: HTMLElement, ancestor: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = element;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

// Mede o nome em CSS onde ele está: cada letra (início do avanço e linha de base) e o ponto final.
// A linha de base vem de uma sonda de altura zero alinhada a ela, uma por linha do nome, medida com
// precisão de subpixel (somar `offsetTop`, que arredonda, desalinhava a segunda linha em até 2 px).
function measureName(section: HTMLElement): HeroLayout | null {
  const heading = section.querySelector("h1");
  if (!heading) return null;
  // A prensa do scroll é um `transform` no título: neutralizada só durante a medição (nada é pintado no meio).
  const pressed = heading.style.transform;
  heading.style.transform = "none";
  const sectionTop = section.getBoundingClientRect().top + section.clientTop;

  const letters = Array.from(heading.querySelectorAll<HTMLElement>(".kinetic")).flatMap((line) => {
    const probe = document.createElement("span");
    probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
    line.querySelector(":scope > [aria-hidden]")?.appendChild(probe);
    const baseline = probe.getBoundingClientRect().top - sectionTop;
    probe.remove();
    return Array.from(line.querySelectorAll<HTMLElement>("[data-k]")).map((letter) => ({
      char: (letter.querySelector(".extrude-face")?.textContent ?? "").toUpperCase(),
      x: offsetWithin(letter, section).x,
      baseline,
    }));
  });
  heading.style.transform = pressed;
  const dotElement = heading.querySelector<HTMLElement>(".full-stop-dot");
  const dot = dotElement ? { ...offsetWithin(dotElement, section), size: dotElement.offsetWidth } : null;
  return {
    width: section.clientWidth,
    height: section.clientHeight,
    fontSize: parseFloat(getComputedStyle(heading).fontSize),
    letters,
    dot,
  };
}

export function Hero3D({
  sectionRef,
  progress,
  opacity,
  ready,
  onReady,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  progress: MotionValue<number>;
  opacity: MotionValue<number>;
  /** O 3D já assumiu o lugar do CSS. */
  ready: boolean;
  onReady: () => void;
}) {
  const idle = useIdle();
  const inView = useInView(sectionRef);
  const dotLoose = useFullStopLoose();
  const [layout, setLayout] = useState<HeroLayout | null>(null);
  const colorProbe = useRef<CanvasRenderingContext2D | null>(null);

  // Mede depois das fontes e de novo a cada mudança de tamanho da seção.
  useEffect(() => {
    const section = sectionRef.current;
    if (!idle || !section) return;
    let cancelled = false;
    const update = () =>
      document.fonts.ready.then(() => {
        if (!cancelled) setLayout(measureName(section));
      });
    const observer = new ResizeObserver(update);
    observer.observe(section);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [idle, sectionRef]);

  // A cor do ponto em CSS pode vir em qualquer formato (oklch durante a troca de cor):
  // pintar num canvas de 1 px e ler de volta dá sempre RGB, que o three.js entende.
  const readDotColor = useCallback(() => {
    const dot = sectionRef.current?.querySelector<HTMLElement>(".full-stop-dot");
    if (!dot) return null;
    colorProbe.current ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const context = colorProbe.current;
    if (!context) return null;
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = getComputedStyle(dot).backgroundColor;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  }, [sectionRef]);

  if (!layout) return null;

  return (
    // Atrás de todo o conteúdo do hero; a troca com o nome em CSS é um cruzamento de opacidade (ver .hero-3d).
    <div aria-hidden className="hero-3d pointer-events-none absolute inset-0 -z-10" data-ready={ready ? "" : undefined}>
      <motion.div className="absolute inset-0" style={{ opacity }}>
        <HeroScene
          layout={layout}
          progress={progress}
          eventSource={sectionRef}
          active={inView}
          dotHidden={dotLoose}
          readDotColor={readDotColor}
          onReady={onReady}
        />
      </motion.div>
    </div>
  );
}
