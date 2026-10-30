"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { ease, useSkipEntrance } from "@/lib/motion";

// Número que conta do zero até o valor quando aparece na tela.
// O servidor entrega o valor final: é o que buscadores e prévias de link leem. No navegador,
// ele volta a zero enquanto está fora da tela e conta até o valor quando aparece.
export function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduceMotion = useReducedMotion();
  const skipEntrance = useSkipEntrance();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduceMotion || skipEntrance) return;
    if (!inView) {
      node.textContent = `0${suffix}`;
      return;
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: ease.out,
      onUpdate: (latest) => (node.textContent = `${Math.round(latest)}${suffix}`),
    });
    return () => controls.stop();
  }, [inView, reduceMotion, skipEntrance, value, suffix]);

  return (
    <span ref={ref} className="tabular-nums">
      {`${value}${suffix}`}
    </span>
  );
}
