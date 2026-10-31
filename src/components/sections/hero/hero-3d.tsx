"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import dynamic from "next/dynamic";
import { motion, useInView, type MotionValue } from "motion/react";
import { unlock } from "@/components/game/store";
import type { HeroSceneControl } from "@/components/three/hero/hero-scene";
import type { HeroLayout } from "@/components/three/hero/layout";
import { setFullStopCommand } from "./full-stop";
import { setHeroIntro } from "./hero-intro";

// A cena só é baixada quando este componente monta (desktop capaz): nunca entra no pacote inicial.
const loadScene = () => import("@/components/three/hero/hero-scene");
const HeroScene = dynamic(loadScene, { ssr: false });

/** Se a cena não desenhar até aqui (ms), o nome em CSS aparece: ninguém fica sem nome por conexão lenta. */
const FALLBACK_AFTER_MS = 5000;

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

// Mede o nome em CSS onde ele está (oculto, mas ocupando o lugar): cada letra (início do avanço e linha
// de base) e o ponto final. A linha de base vem de uma sonda de altura zero alinhada a ela, uma por linha
// do nome, medida com precisão de subpixel (somar `offsetTop`, que arredonda, desalinhava até 2 px).
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
  intro,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  progress: MotionValue<number>;
  opacity: MotionValue<number>;
  /** Tocar a queda das letras (falso logo após trocar de idioma: o nome já nasce no lugar). */
  intro: boolean;
}) {
  const inView = useInView(sectionRef);
  const [layout, setLayout] = useState<HeroLayout | null>(null);
  const control = useRef<HeroSceneControl | null>(null);
  const ready = useRef(false);
  const colorProbe = useRef<CanvasRenderingContext2D | null>(null);

  // Começa a baixar a cena já na montagem, em paralelo com a medição. A cena fica oculta ("pending")
  // até desenhar; se não chegar a tempo, o atributo sai e o nome em CSS aparece no lugar.
  useLayoutEffect(() => {
    void loadScene();
    setHeroIntro("pending");
    const fallback = window.setTimeout(() => {
      if (!ready.current) setHeroIntro(null);
    }, FALLBACK_AFTER_MS);
    return () => window.clearTimeout(fallback);
  }, []);

  // O ponto em DOM (que recebe o teclado) passa a comandar a esfera da cena.
  useEffect(() => {
    setFullStopCommand(() => control.current?.pokeDot());
    return () => setFullStopCommand(null);
  }, []);

  // Mede depois das fontes e de novo a cada mudança de tamanho da seção.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
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
  }, [sectionRef]);

  const onReady = useCallback(() => {
    ready.current = true;
    setHeroIntro("on");
  }, []);

  const onCatch = useCallback(() => unlock("full-stop"), []);

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
    // Atrás de todo o conteúdo do hero. Fica oculto até a cena desenhar (ver .hero-3d em globals.css).
    <div aria-hidden className="hero-3d pointer-events-none absolute inset-0 -z-10">
      <motion.div className="absolute inset-0" style={{ opacity }}>
        <HeroScene
          layout={layout}
          progress={progress}
          eventSource={sectionRef}
          active={inView}
          intro={intro}
          readDotColor={readDotColor}
          controlRef={control}
          onCatch={onCatch}
          onReady={onReady}
        />
      </motion.div>
    </div>
  );
}
