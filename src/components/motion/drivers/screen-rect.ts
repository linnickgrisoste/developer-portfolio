"use client";

// Medir logo depois de outro ouvinte escrever no estilo força layout: só mede de novo após rolagem ou resize.
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
