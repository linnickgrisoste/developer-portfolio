"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

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
