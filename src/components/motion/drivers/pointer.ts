"use client";

export type PointerPosition = { readonly x: number; readonly y: number };

const FAR_AWAY = -1e4;

const position = { x: FAR_AWAY, y: FAR_AWAY };
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
