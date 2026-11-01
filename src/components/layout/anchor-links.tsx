"use client";

import { useEffect } from "react";

export function AnchorLinks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
      const hash = link?.getAttribute("href");
      const target = hash && hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      if (!target) return;
      event.preventDefault();
      // O hash nativo empilha uma entrada sem o estado do Next e quebra o "voltar"; o replaceState do Next o copia.
      if (window.location.hash !== hash) window.history.replaceState(null, "", hash);
      target.scrollIntoView();
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
