"use client";

// O retângulo de um elemento na tela, em cache. Os ouvintes do cursor rodam no mesmo quadro: medir logo depois
// de outro escrever no estilo força layout. Aqui só se mede de novo após rolagem, mudança de tamanho ou o fim
// de uma animação CSS (as entradas deslocam o elemento sem rolar a página).

let generation = 0;
const cache = new WeakMap<Element, { rect: DOMRect; generation: number }>();
let observer: ResizeObserver | null = null;

function invalidateAll() {
  generation += 1;
}

export function screenRect(element: Element): DOMRect {
  const cached = cache.get(element);
  if (cached && cached.generation === generation) return cached.rect;
  if (!observer) {
    observer = new ResizeObserver((entries) => {
      invalidateAll();
      // Um elemento que saiu da página deixa de ser observado.
      entries.forEach((entry) => entry.target.isConnected || observer?.unobserve(entry.target));
    });
    window.addEventListener("scroll", invalidateAll, { passive: true, capture: true });
    window.addEventListener("resize", invalidateAll);
    window.addEventListener("animationend", invalidateAll, { capture: true });
  }
  if (!cached) observer.observe(element);
  const rect = element.getBoundingClientRect();
  cache.set(element, { rect, generation });
  return rect;
}
