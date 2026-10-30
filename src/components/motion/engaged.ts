"use client";

import { useEffect, useState, type RefObject } from "react";
import { useTheme } from "next-themes";
import { levels, type Level } from "@/lib/motion";
import { useCapabilities } from "./drivers/capabilities";
import { observeBand } from "./drivers/focus-band";

/**
 * "Engajado" é o mesmo estado em qualquer aparelho, e é a ele que toda primitiva reage:
 * - mouse ou caneta: o cursor está sobre o elemento;
 * - teclado: o elemento (ou algo dentro dele) tem foco visível;
 * - toque: o elemento atravessa a faixa central da tela ao rolar.
 */
export function useEngaged(ref: RefObject<HTMLElement | null>) {
  const { finePointer } = useCapabilities();
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let hover = false;
    let focus = false;
    let band = false;
    const update = () => setEngaged(hover || focus || band);

    const onEnter = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      hover = true;
      update();
    };
    const onLeave = () => {
      hover = false;
      update();
    };
    const onFocusIn = (event: FocusEvent) => {
      focus = (event.target as Element).matches(":focus-visible");
      update();
    };
    const onFocusOut = () => {
      focus = false;
      update();
    };

    element.addEventListener("pointerenter", onEnter);
    element.addEventListener("pointerleave", onLeave);
    element.addEventListener("focusin", onFocusIn);
    element.addEventListener("focusout", onFocusOut);
    const stopBand = finePointer
      ? () => {}
      : observeBand(element, (inBand) => {
          band = inBand;
          update();
        });

    return () => {
      element.removeEventListener("pointerenter", onEnter);
      element.removeEventListener("pointerleave", onLeave);
      element.removeEventListener("focusin", onFocusIn);
      element.removeEventListener("focusout", onFocusOut);
      stopBand();
    };
  }, [ref, finePointer]);

  return engaged;
}

/** Parâmetros do nível, com o ajuste de contexto: no tema escuro, a amplitude cai 15% (luz sobre escuro pesa mais). */
export function useLevel(level: Level) {
  const { resolvedTheme } = useTheme();
  const base = levels[level];
  return resolvedTheme === "dark" ? { ...base, amplitude: base.amplitude * 0.85 } : base;
}
