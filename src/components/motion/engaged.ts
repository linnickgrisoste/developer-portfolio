"use client";

import { useEffect, useState, type RefObject } from "react";
import { levels, type Level } from "@/lib/motion";
import { useCapabilities } from "./drivers/capabilities";
import { observeBand } from "./drivers/focus-band";
import { useDarkTheme } from "./drivers/theme";

const DARK_AMPLITUDE = 0.85;

type EngagedOptions = {
  closest?: string;
};

export function useEngaged(ref: RefObject<HTMLElement | null>, { closest }: EngagedOptions = {}) {
  const { finePointer } = useCapabilities();
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    const element = closest ? (ref.current?.closest<HTMLElement>(closest) ?? ref.current) : ref.current;
    if (!element) return;
    let hover = false;
    let focus = false;
    let band = false;
    const update = () => setEngaged(hover || focus || band);

    const onPointerEnter = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      hover = true;
      update();
    };
    const onPointerLeave = () => {
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

    element.addEventListener("pointerenter", onPointerEnter);
    element.addEventListener("pointerleave", onPointerLeave);
    element.addEventListener("focusin", onFocusIn);
    element.addEventListener("focusout", onFocusOut);
    const stopBand = finePointer
      ? undefined
      : observeBand(element, (inBand) => {
          band = inBand;
          update();
        });

    return () => {
      element.removeEventListener("pointerenter", onPointerEnter);
      element.removeEventListener("pointerleave", onPointerLeave);
      element.removeEventListener("focusin", onFocusIn);
      element.removeEventListener("focusout", onFocusOut);
      stopBand?.();
    };
  }, [ref, finePointer, closest]);

  return engaged;
}

export function useLevel(level: Level) {
  const dark = useDarkTheme();
  const base = levels[level];
  return dark ? { ...base, amplitude: base.amplitude * DARK_AMPLITUDE } : base;
}
