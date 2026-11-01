"use client";

import { useCallback, useEffect } from "react";
import { useThree } from "@react-three/fiber";

export function usePointerCursor() {
  const get = useThree((state) => state.get);
  const set = useCallback(
    (on: boolean) => {
      // No elemento dos eventos, não no body: trocar o cursor do body invalida o estilo da página inteira.
      const target = get().events.connected as HTMLElement | undefined;
      if (target) target.style.cursor = on ? "pointer" : "";
    },
    [get],
  );
  useEffect(() => () => set(false), [set]);
  return set;
}
