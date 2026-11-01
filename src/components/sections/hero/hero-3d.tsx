"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import dynamic from "next/dynamic";
import { motion, useInView, type MotionValue } from "motion/react";
import { unlock } from "@/components/game/store";
import type { HeroSceneControl } from "@/components/three/hero/hero-scene";
import type { HeroLayout } from "@/components/three/hero/layout";
import { setFullStopCommand } from "./full-stop";
import { setHeroIntro } from "./hero-intro";

const loadScene = () => import("@/components/three/hero/hero-scene");
const HeroScene = dynamic(loadScene, { ssr: false });

const FALLBACK_AFTER_MS = 5000;

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

// Sonda na linha de base: somar offsetTop arredonda e desalinhava as letras 3D em até 2 px.
function measureBaseline(line: HTMLElement, sectionTop: number) {
  const probe = document.createElement("span");
  probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
  line.querySelector(":scope > [aria-hidden]")?.appendChild(probe);
  const baseline = probe.getBoundingClientRect().top - sectionTop;
  probe.remove();
  return baseline;
}

function measureName(section: HTMLElement): HeroLayout | null {
  const heading = section.querySelector("h1");
  if (!heading) return null;
  const pressed = heading.style.transform;
  heading.style.transform = "none";
  const sectionTop = section.getBoundingClientRect().top + section.clientTop;

  const letters = Array.from(heading.querySelectorAll<HTMLElement>(".kinetic")).flatMap((line) => {
    const baseline = measureBaseline(line, sectionTop);
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
  intro: boolean;
}) {
  const inView = useInView(sectionRef);
  const [layout, setLayout] = useState<HeroLayout | null>(null);
  const control = useRef<HeroSceneControl | null>(null);
  const ready = useRef(false);

  useLayoutEffect(() => {
    void loadScene();
    setHeroIntro("pending");
    const fallback = window.setTimeout(() => {
      if (!ready.current) setHeroIntro(null);
    }, FALLBACK_AFTER_MS);
    return () => window.clearTimeout(fallback);
  }, []);

  useEffect(() => {
    setFullStopCommand(() => control.current?.pokeDot());
    return () => setFullStopCommand(null);
  }, []);

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

  if (!layout) return null;

  return (
    <div aria-hidden className="hero-3d pointer-events-none absolute inset-0 -z-10">
      <motion.div className="absolute inset-0" style={{ opacity }}>
        <HeroScene
          layout={layout}
          progress={progress}
          eventSource={sectionRef}
          active={inView}
          intro={intro}
          controlRef={control}
          onCatch={onCatch}
          onReady={onReady}
        />
      </motion.div>
    </div>
  );
}
