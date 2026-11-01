"use client";

import { useCapabilities } from "@/components/motion/drivers/capabilities";

// Não importar three.js aqui nem em preload.ts: puxaria a cena para o pacote inicial.
export function useStageAllowed() {
  const { webgl, reducedMotion, saveData } = useCapabilities();
  return webgl && !reducedMotion && !saveData;
}

