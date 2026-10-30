"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { motion, useSpring } from "motion/react";
import type { Level } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useCapabilities } from "./drivers/capabilities";
import { subscribePointer } from "./drivers/pointer";
import { useEngaged, useLevel } from "./engaged";

// Card com espessura: engajado, ele inclina em perspectiva e revela placas cobalto atrás de si,
// a mesma lateral do texto, agora em 3D de verdade (preserve-3d). Com mouse, a inclinação segue
// o cursor; no toque, o card só se ergue ao passar pela faixa central.

/** Placas atrás do card, da mais rasa para a mais funda. */
const PLATES = [1, 2, 3];
const TILT_SPRING = { stiffness: 220, damping: 22, mass: 0.6 };

export function Tilt({
  children,
  level = "detail",
  className,
  plateClassName = "rounded-lg",
}: {
  children: React.ReactNode;
  level?: "title" | "detail";
  className?: string;
  /** Arredondamento das placas: o mesmo do conteúdo, para a espessura acompanhar o formato. */
  plateClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion, finePointer } = useCapabilities();
  const { amplitude } = useLevel(level as Level);
  const engaged = useEngaged(ref);
  const rotateX = useSpring(0, TILT_SPRING);
  const rotateY = useSpring(0, TILT_SPRING);
  const lift = useSpring(0, TILT_SPRING);
  const maxDeg = 6 + 14 * amplitude;
  const plateGap = 6 + 8 * amplitude;

  useEffect(() => {
    if (reducedMotion) return;
    lift.set(engaged ? 1 : 0);
    if (!engaged) {
      rotateX.set(0);
      rotateY.set(0);
      return;
    }
    if (!finePointer) {
      rotateX.set(maxDeg * 0.45);
      return;
    }
    const element = ref.current;
    if (!element) return;
    return subscribePointer(({ x, y }) => {
      const rect = element.getBoundingClientRect();
      const nx = ((x - rect.left) / rect.width - 0.5) * 2;
      const ny = ((y - rect.top) / rect.height - 0.5) * 2;
      rotateY.set(Math.max(-1, Math.min(1, nx)) * maxDeg);
      rotateX.set(Math.max(-1, Math.min(1, -ny)) * maxDeg);
    });
  }, [engaged, finePointer, reducedMotion, maxDeg, lift, rotateX, rotateY]);

  return (
    // A distância da perspectiva (900px) também aparece em globals.css (.tilt-plate): mude as duas juntas.
    <div ref={ref} className={cn("[perspective:900px]", className)}>
      <motion.div
        className="relative [transform-style:preserve-3d]"
        style={{ rotateX, rotateY, "--lift": lift, "--plate-gap": `${plateGap}px`, "--plate-gap-n": plateGap } as never}
      >
        {PLATES.map((z) => (
          <span
            key={z}
            aria-hidden
            className={cn("tilt-plate pointer-events-none absolute inset-0", plateClassName)}
            style={{ "--z": z } as CSSProperties}
          />
        ))}
        <div className="relative">{children}</div>
      </motion.div>
    </div>
  );
}
