"use client";

// Uma única fonte da posição do cursor para a página toda. Um `pointermove` passivo, agrupado
// por quadro: quem assina recebe no máximo uma notificação por quadro, e o ouvinte só existe
// enquanto alguém assina. Toque não conta: no celular, "engajar" é passar pela faixa central.

export type PointerPosition = { readonly x: number; readonly y: number };

const position = { x: -1e4, y: -1e4 };
const listeners = new Set<(pointer: PointerPosition) => void>();
let frame = 0;

function flush() {
  frame = 0;
  listeners.forEach((listener) => listener(position));
}

function onMove(event: PointerEvent) {
  if (event.pointerType === "touch") return;
  position.x = event.clientX;
  position.y = event.clientY;
  if (!frame) frame = requestAnimationFrame(flush);
}

export function subscribePointer(listener: (pointer: PointerPosition) => void) {
  if (listeners.size === 0) window.addEventListener("pointermove", onMove, { passive: true });
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    window.removeEventListener("pointermove", onMove);
    cancelAnimationFrame(frame);
    frame = 0;
  };
}

/** Última posição conhecida, para quem precisa dela fora de uma notificação (ex.: ao engajar). */
export function getPointer(): PointerPosition {
  return position;
}
