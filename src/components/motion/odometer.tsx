"use client";

import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { useInView } from "motion/react";
import { cn } from "@/lib/utils";
import { useCapabilities } from "./drivers/capabilities";
import { useSkipEntrance } from "./entrance";

const STRIP = Array.from("01234567890123456789");

export function Odometer({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reducedMotion } = useCapabilities();
  const skipEntrance = useSkipEntrance();
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const digits = String(value).split("");

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
              {STRIP.map((char, index) => (
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
