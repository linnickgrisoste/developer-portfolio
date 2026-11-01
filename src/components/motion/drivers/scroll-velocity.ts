"use client";

import { useEffect } from "react";
import { motionValue } from "motion/react";

// Em px/s, positiva descendo. O laço de quadros para sozinho quando a rolagem assenta.

const SMOOTHING_PER_SECOND = 10;
const REST_VELOCITY = 5;
const ASSUMED_FRAME_MS = 16;

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
  const current = velocity.get();
  const next = current + (raw - current) * Math.min(1, dt * SMOOTHING_PER_SECOND);
  if (raw === 0 && Math.abs(next) < REST_VELOCITY) {
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
  lastTime = performance.now() - ASSUMED_FRAME_MS;
  frame = requestAnimationFrame(tick);
}

/** Com `enabled` falso, devolve a mesma MotionValue sem ligar o ouvinte. */
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
