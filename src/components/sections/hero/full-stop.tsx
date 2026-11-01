"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate, useReducedMotion } from "motion/react";
import { useLocale } from "@/components/providers";
import { gameCopy } from "@/content/game";
import { unlock } from "@/components/game/store";
import { dotCycle, spring } from "@/lib/motion";
import { clamp } from "@/lib/math";
import { rewardPair } from "@/lib/palette";

const GRAVITY = 2600;
const BOUNCE = 0.72;
const ROLLING_FRICTION = 3;
const REST_BEFORE_RETURN_MS = 1500;
const MAX_LOOSE_MS = 9000;

// Com o nome em 3D, o botão do ponto fica invisível no lugar: ele recebe o foco e o Enter e encaminha para a cena.
let command3d: (() => void) | null = null;

export function setFullStopCommand(command: (() => void) | null) {
  command3d = command;
}

type Origin = { home: HTMLButtonElement; left: number; top: number; size: number; cycleDelay: number };

function remainingCycleDelay(dot: HTMLElement) {
  const cycle = dot.getAnimations({ subtree: true }).find((animation) => (animation as CSSAnimation).animationName === "dot-second");
  const elapsed = typeof cycle?.currentTime === "number" ? cycle.currentTime : 0;
  return dotCycle.delaySeconds * 1000 - elapsed;
}

export function FullStop() {
  const { t } = useLocale();
  const reduceMotion = useReducedMotion();
  const [origin, setOrigin] = useState<Origin | null>(null);
  const loose = origin !== null;

  const release = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (command3d) {
      command3d();
      return;
    }
    if (loose) return;
    if (reduceMotion) {
      unlock("full-stop");
      return;
    }
    const home = event.currentTarget;
    const rect = home.getBoundingClientRect();
    setOrigin({ home, left: rect.left, top: rect.top, size: rect.width, cycleDelay: remainingCycleDelay(home) });
  };

  const returnHome = useCallback(() => setOrigin(null), []);

  return (
    <>
      <button
        type="button"
        onClick={release}
        aria-label={t(gameCopy.fullStop)}
        style={{ opacity: loose ? 0 : 1 }}
        className="full-stop-hit group/dot relative ml-[0.04em] inline-block cursor-pointer rounded-full align-baseline"
      >
        <span className="full-stop-dot block size-[0.17em] rounded-full bg-neon transition-[scale] duration-200 group-hover/dot:scale-125" />
      </button>
      {loose &&
        createPortal(
          <LooseDot origin={origin} label={t(gameCopy.catchFullStop)} onHome={returnHome} />,
          document.body,
        )}
    </>
  );
}

function LooseDot({ origin, label, onHome }: { origin: Origin; label: string; onHome: () => void }) {
  const dotRef = useRef<HTMLButtonElement>(null);
  const catchRef = useRef<() => void>(() => {});

  useEffect(() => {
    const dot = dotRef.current!;
    const { size } = origin;
    let x = origin.left;
    let y = origin.top;
    const pace = clamp(window.innerWidth / 1280, 0.45, 1);
    let vx = (x < window.innerWidth / 2 ? 1 : -1) * (500 + Math.random() * 400) * pace;
    let vy = -1200;
    let squash = 0;
    let restingSince = 0;
    let last = performance.now();
    const releasedAt = last;
    let frame = 0;
    let stopped = false;

    const draw = (scale = 1) => {
      const stretch = squash * 0.35;
      dot.style.transform = `translate(${x}px, ${y}px) scale(${scale * (1 + stretch)}, ${scale * (1 - stretch)})`;
    };

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
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      vy += GRAVITY * dt;
      x += vx * dt;
      y += vy * dt;

      const floor = (window.visualViewport?.height ?? window.innerHeight) - size;
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
        x = clamp(x, 0, rightWall);
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
      ref={dotRef}
      type="button"
      aria-label={label}
      onPointerDown={() => catchRef.current()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") catchRef.current();
      }}
      className="full-stop-hit fixed top-0 left-0 z-50 cursor-pointer touch-none rounded-full outline-offset-4"
      style={{
        ["--cycle-delay" as string]: `${origin.cycleDelay}ms`,
        width: origin.size,
        height: origin.size,
        transform: `translate(${origin.left}px, ${origin.top}px)`,
      }}
    >
      <span className="dot-cycle block size-full rounded-full bg-neon" />
    </button>
  );
}

async function burst(x: number, y: number) {
  const { default: confetti } = await import("canvas-confetti");
  void confetti({
    particleCount: 40,
    spread: 70,
    startVelocity: 25,
    scalar: 0.7,
    ticks: 120,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: rewardPair,
    disableForReducedMotion: true,
  });
}
