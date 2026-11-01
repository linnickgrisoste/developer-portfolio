"use client";

// No toque, engajar é atravessar a faixa central da tela. Um único observer serve a página toda.

// 42% de margem em cima e embaixo: a faixa tem 16% da altura da tela.
const BAND_MARGIN = "-42% 0px -42% 0px";

const callbacks = new Map<Element, (inBand: boolean) => void>();
let observer: IntersectionObserver | null = null;

function bandObserver() {
  observer ??= new IntersectionObserver(
    (entries) => entries.forEach((entry) => callbacks.get(entry.target)?.(entry.isIntersecting)),
    { rootMargin: BAND_MARGIN },
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
