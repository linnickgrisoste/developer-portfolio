"use client";

// Faixa central da tela: em aparelhos de toque, sem hover, um elemento "engaja" enquanto
// atravessa esta faixa ao rolar. Um único IntersectionObserver serve a página toda.

const callbacks = new Map<Element, (inBand: boolean) => void>();
let observer: IntersectionObserver | null = null;

function bandObserver() {
  // A faixa é o miolo da tela: 42% de margem em cima e embaixo deixam 16% de altura.
  observer ??= new IntersectionObserver(
    (entries) => entries.forEach((entry) => callbacks.get(entry.target)?.(entry.isIntersecting)),
    { rootMargin: "-42% 0px -42% 0px" },
  );
  return observer;
}

export function observeBand(element: Element, callback: (inBand: boolean) => void) {
  callbacks.set(element, callback);
  bandObserver().observe(element);
  return () => {
    callbacks.delete(element);
    observer?.unobserve(element);
  };
}
