"use client";

import { useEffect, useState } from "react";
import { useCapabilities } from "@/components/motion/drivers/capabilities";

// Quando o 3D pode entrar. Fica num arquivo próprio, sem importar three.js: quem decide se baixa
// a cena não pode puxar a cena junto para o pacote inicial.

/** Se o 3D pode entrar neste aparelho (WebGL 2, sem movimento reduzido, sem economia de dados). Fora disso, fica o CSS. */
export function useStageAllowed() {
  const { webgl, reducedMotion, saveData } = useCapabilities();
  return webgl && !reducedMotion && !saveData;
}

/** true quando o navegador fica ocioso depois da carga: é a hora de baixar o 3D sem disputar com o resto. */
export function useIdle() {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const markIdle = () => setIdle(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(markIdle, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(markIdle, 1200);
    return () => clearTimeout(timer);
  }, []);

  return idle;
}
