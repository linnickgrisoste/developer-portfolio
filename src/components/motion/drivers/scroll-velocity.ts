"use client";

import { useEffect } from "react";
import { motionValue } from "motion/react";

// Velocidade do scroll (px/s, positiva descendo), suavizada e compartilhada pela página.
// Um ouvinte de `scroll` acorda um laço de quadros que mede a velocidade e para sozinho
// quando a página assenta: parado, não custa nada.

const velocity = motionValue(0);
let users = 0;
let frame = 0;
let lastY = 0;
let lastTime = 0;

function tick(now: number) {
  const y = window.scrollY;
  const dt = Math.max(now - lastTime, 1) / 1000;
  const raw = (y - lastY) / dt;
  lastY = y;
  lastTime = now;
  // Média móvel exponencial: segue a rolagem sem tremer com a irregularidade dos eventos.
  const next = velocity.get() + (raw - velocity.get()) * Math.min(1, dt * 10);
  if (Math.abs(next) < 5 && raw === 0) {
    velocity.set(0);
    frame = 0;
    return;
  }
  velocity.set(next);
  frame = requestAnimationFrame(tick);
}

function onScroll() {
  if (frame) return;
  // O primeiro quadro mede contra o quadro anterior presumido, não contra a última parada.
  lastTime = performance.now() - 16;
  frame = requestAnimationFrame(tick);
}

/**
 * A velocidade como MotionValue: dá para ligar direto em `style` ou derivar com `useTransform`.
 * Com `enabled` falso, devolve a mesma MotionValue sem ligar o ouvinte (hooks não podem ser condicionais).
 */
export function useScrollVelocity(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    if (users++ === 0) {
      lastY = window.scrollY;
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    return () => {
      if (--users > 0) return;
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      frame = 0;
      velocity.set(0);
    };
  }, [enabled]);
  return velocity;
}
