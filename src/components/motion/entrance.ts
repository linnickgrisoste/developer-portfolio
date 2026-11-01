"use client";

import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { reveal } from "@/lib/motion";

const SKIP_WINDOW_MS = 4000;
let localeSwitchedAt = 0;

export function markLocaleSwitch() {
  localeSwitchedAt = Date.now();
}

export function useSkipEntrance() {
  const [skip] = useState(() => Date.now() - localeSwitchedAt < SKIP_WINDOW_MS);
  return skip;
}

export function useRevealGroup() {
  const reduceMotion = useReducedMotion();
  const skipEntrance = useSkipEntrance();
  return {
    initial: reduceMotion || skipEntrance ? false : "hidden",
    whileInView: "shown",
    viewport: reveal.viewport,
    variants: reveal.group,
  } as const;
}
