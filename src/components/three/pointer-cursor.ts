"use client";

import { useCallback, useEffect } from "react";
import { useThree } from "@react-three/fiber";

// O cursor vai no elemento que recebe os eventos, não no body: trocar o do body invalida o estilo da página inteira.
export function usePointerCursor() {
  const get = useThree((state) => state.get);
  const set = useCallback(
    (on: boolean) => {
      const target = get().events.connected as HTMLElement | undefined;
      if (target) target.style.cursor = on ? "pointer" : "";
    },
    [get],
  );
  useEffect(() => () => set(false), [set]);
  return set;
}
