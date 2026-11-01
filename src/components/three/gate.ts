"use client";

import { useCapabilities } from "@/components/motion/drivers/capabilities";

// Sem three.js aqui: quem decide se baixa a cena não pode puxá-la para o pacote inicial.

/** WebGL 2, sem movimento reduzido e sem economia de dados. Fora disso, fica o CSS. */
export function useStageAllowed() {
  const { webgl, reducedMotion, saveData } = useCapabilities();
  return webgl && !reducedMotion && !saveData;
}

