"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

/** Avisa que a cena já desenhou `afterFrames` quadros; até lá pede quadros mesmo em cenas sob demanda. */
export function ReadySignal({ afterFrames, onReady }: { afterFrames: number; onReady: () => void }) {
  const frames = useRef(0);
  const invalidate = useThree((state) => state.invalidate);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === afterFrames) onReady();
    else if (frames.current < afterFrames) invalidate();
  });
  return null;
}
