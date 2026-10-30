"use client";

import { useSyncExternalStore } from "react";

// Se o tema escuro está ativo, lido da classe do <html> (o next-themes a põe antes da primeira pintura).
// No servidor e durante a hidratação é sempre false: o HTML do servidor e o primeiro render do navegador
// batem, e o ajuste de tema entra no render seguinte. (Ler o `useTheme` direto quebraria a hidratação:
// no navegador ele já sabe o tema no primeiro render, no servidor não.)

function subscribe(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

export function useDarkTheme() {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}
