"use client";

// Onde um canvas está na tela. Ler getBoundingClientRect a cada movimento do mouse obriga o navegador a
// terminar antes qualquer recálculo de estilo pendente da página (custava até 16 ms por quadro no hero).
// Aqui o retângulo é medido uma vez e só de novo depois que a página rola, a janela ou o elemento mudam
// de tamanho.

let generation = 0;
const cache = new WeakMap<Element, { rect: DOMRect; generation: number }>();
let resize: ResizeObserver | null = null;

function stale() {
  generation += 1;
}

export function screenRect(element: Element): DOMRect {
  const hit = cache.get(element);
  if (hit && hit.generation === generation) return hit.rect;
  if (!resize) {
    resize = new ResizeObserver((entries) => {
      stale();
      // Um canvas que saiu da página (a cena desmontou) deixa de ser observado.
      entries.forEach((entry) => entry.target.isConnected || resize?.unobserve(entry.target));
    });
    window.addEventListener("scroll", stale, { passive: true, capture: true });
    window.addEventListener("resize", stale);
  }
  if (!hit) resize.observe(element);
  const rect = element.getBoundingClientRect();
  cache.set(element, { rect, generation });
  return rect;
}
