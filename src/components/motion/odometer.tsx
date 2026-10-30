"use client";

import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { useInView } from "motion/react";
import { useSkipEntrance } from "./entrance";
import { cn } from "@/lib/utils";
import { useCapabilities } from "./drivers/capabilities";

// Número que gira como um hodômetro até o valor quando aparece na tela. Cada dígito é uma fita
// 0–9 repetida duas vezes: ela dá uma volta inteira antes de parar, e as casas da esquerda
// param depois das da direita, como um contador mecânico.
// O servidor entrega a fita já no valor final (é o que buscadores e prévias leem).

const DIGITS = "01234567890123456789";

export function Odometer({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reducedMotion } = useCapabilities();
  const skipEntrance = useSkipEntrance();
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const digits = String(value).split("");

  // Antes de aparecer, volta as fitas para o zero (sem transição) para depois girar.
  useLayoutEffect(() => {
    ref.current?.toggleAttribute("data-armed", !reducedMotion && !skipEntrance);
  }, [reducedMotion, skipEntrance]);

  useEffect(() => {
    if (inView && ref.current?.hasAttribute("data-armed")) ref.current.setAttribute("data-set", "");
  }, [inView]);

  return (
    <span ref={ref} className={cn("odometer tabular-nums", className)}>
      <span className="sr-only">{`${value}${suffix}`}</span>
      <span aria-hidden className="inline-flex">
        {digits.map((digit, column) => (
          <span
            key={column}
            className="odometer-column"
            style={{ "--digit": Number(digit), "--column": digits.length - 1 - column } as CSSProperties}
          >
            <span className="odometer-strip">
              {Array.from(DIGITS).map((char, index) => (
                <span key={index}>{char}</span>
              ))}
            </span>
          </span>
        ))}
        {suffix}
      </span>
    </span>
  );
}
