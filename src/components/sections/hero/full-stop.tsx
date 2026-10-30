"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { animate, useReducedMotion } from "motion/react";
import { useLocale } from "@/components/providers";
import { gameCopy } from "@/content/game";
import { unlock } from "@/components/game/store";
import { spring } from "@/lib/motion";
import { cobaltPair } from "@/lib/palette";

// O ponto final do nome é a conquista escondida: clicado, ele se solta e quica pela tela.
// Quem pegar de volta desbloqueia "Ponto final". Se ninguém pegar, ele volta sozinho.

const GRAVITY = 2600; // px/s²
const BOUNCE = 0.72; // energia que sobra a cada quique
const ROLLING_FRICTION = 3; // quanto o rolar no chão freia por segundo
const REST_BEFORE_RETURN_MS = 1500; // parado no chão por esse tempo, ele volta para casa
const MAX_LOOSE_MS = 9000; // limite total solto, mesmo se ainda estiver quicando

// Se o ponto está solto pela página. O nome em 3D lê para esconder a esfera dele enquanto isso.
let looseNow = false;
const looseListeners = new Set<() => void>();

function subscribeLoose(listener: () => void) {
  looseListeners.add(listener);
  return () => looseListeners.delete(listener);
}

function publishLoose(value: boolean) {
  looseNow = value;
  looseListeners.forEach((listener) => listener());
}

export function useFullStopLoose() {
  return useSyncExternalStore(subscribeLoose, () => looseNow, () => false);
}

/** De onde o ponto saiu: o botão no nome (para onde ele volta), a posição, o tamanho e a cor. */
type Origin = { home: HTMLButtonElement; left: number; top: number; size: number; color: string };

export function FullStop() {
  const { t } = useLocale();
  const reduceMotion = useReducedMotion();
  const [origin, setOrigin] = useState<Origin | null>(null);

  const release = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (origin) return; // já está solto
    // Com movimento reduzido não há perseguição: encontrar o segredo já basta.
    if (reduceMotion) {
      unlock("full-stop");
      return;
    }
    const home = event.currentTarget;
    const rect = home.getBoundingClientRect();
    // O ponto solto sai com a cor que o ciclo tinha no instante do clique.
    const color = getComputedStyle(home).backgroundColor;
    setOrigin({ home, left: rect.left, top: rect.top, size: rect.width, color });
  };

  const returnHome = useCallback(() => setOrigin(null), []);

  const loose = origin !== null;

  useEffect(() => {
    publishLoose(loose);
  }, [loose]);

  return (
    <>
      <button
        type="button"
        onClick={release}
        aria-label={t(gameCopy.fullStop)}
        // Enquanto o ponto está solto, o lugar dele fica vazio, sem mexer no layout.
        style={{ opacity: loose ? 0 : 1 }}
        className="full-stop-dot ml-[0.04em] inline-block size-[0.17em] cursor-pointer rounded-full bg-cobalt align-baseline transition-[scale] duration-200 hover:scale-125"
      />
      {loose &&
        createPortal(
          <LooseDot origin={origin} label={t(gameCopy.catchFullStop)} onHome={returnHome} />,
          document.body,
        )}
    </>
  );
}

function LooseDot({ origin, label, onHome }: { origin: Origin; label: string; onHome: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const catchRef = useRef<() => void>(() => {});

  useEffect(() => {
    const dot = ref.current!;
    const { size } = origin;
    let x = origin.left;
    let y = origin.top;
    // Salta para cima e na direção do centro da tela, para não sumir pela borda mais próxima.
    let vx = (x < window.innerWidth / 2 ? 1 : -1) * (500 + Math.random() * 400);
    let vy = -1200;
    let squash = 0; // 0 a 1: achatamento do último impacto, que se desfaz rápido
    let restingSince = 0;
    let last = performance.now();
    const releasedAt = last;
    let frame = 0;
    let stopped = false;

    const draw = (scale = 1) => {
      const s = squash * 0.35;
      dot.style.transform = `translate(${x}px, ${y}px) scale(${scale * (1 + s)}, ${scale * (1 - s)})`;
    };

    // Volta voando para o lugar no nome. Se foi pego, incha no caminho como recompensa.
    const flyHome = (caught: boolean) => {
      stopped = true;
      cancelAnimationFrame(frame);
      squash = 0;
      const fromX = x;
      const fromY = y;
      const target = origin.home.getBoundingClientRect();
      animate(0, 1, {
        ...spring.ui,
        onUpdate: (progress) => {
          x = fromX + (target.left - fromX) * progress;
          y = fromY + (target.top - fromY) * progress;
          draw(caught ? 1 + 0.6 * Math.sin(Math.PI * Math.min(progress, 1)) : 1);
        },
        onComplete: () => {
          // O foco estava no ponto solto; devolve ao ponto do nome para o teclado não se perder.
          origin.home.focus({ preventScroll: true });
          onHome();
        },
      });
    };

    catchRef.current = () => {
      if (stopped) return;
      unlock("full-stop");
      void burst(x + size / 2, y + size / 2);
      flyHome(true);
    };

    const step = (now: number) => {
      // Limita o passo para a física não "teleportar" depois de uma aba em segundo plano.
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      vy += GRAVITY * dt;
      x += vx * dt;
      y += vy * dt;

      const floor = window.innerHeight - size;
      const rightWall = window.innerWidth - size;

      if (y >= floor) {
        y = floor;
        if (vy > 0) {
          squash = Math.min(vy / 2400, 1);
          vy = Math.abs(vy) < 160 ? 0 : -vy * BOUNCE;
        }
        vx *= Math.exp(-ROLLING_FRICTION * dt);
      }
      if (y < 0) {
        y = 0;
        vy = -vy * BOUNCE;
      }
      if (x < 0 || x > rightWall) {
        x = Math.min(Math.max(x, 0), rightWall);
        vx = -vx * BOUNCE;
      }
      squash *= Math.exp(-18 * dt);
      draw();

      const resting = y >= floor && vy === 0 && Math.abs(vx) < 20;
      if (resting && !restingSince) restingSince = now;
      if ((restingSince && now - restingSince > REST_BEFORE_RETURN_MS) || now - releasedAt > MAX_LOOSE_MS) {
        flyHome(false);
        return;
      }
      frame = requestAnimationFrame(step);
    };

    draw();
    dot.focus({ preventScroll: true });
    frame = requestAnimationFrame(step);
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
    };
  }, [origin, onHome]);

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      onPointerDown={() => catchRef.current()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") catchRef.current();
      }}
      className="fixed top-0 left-0 z-50 cursor-pointer rounded-full outline-offset-4"
      style={{
        backgroundColor: origin.color,
        width: origin.size,
        height: origin.size,
        transform: `translate(${origin.left}px, ${origin.top}px)`,
      }}
    />
  );
}

// Pequena explosão de confete no ponto em que ele foi pego. A biblioteca só baixa nessa hora.
async function burst(x: number, y: number) {
  const { default: confetti } = await import("canvas-confetti");
  void confetti({
    particleCount: 40,
    spread: 70,
    startVelocity: 25,
    scalar: 0.7,
    ticks: 120,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: cobaltPair,
    disableForReducedMotion: true,
  });
}
