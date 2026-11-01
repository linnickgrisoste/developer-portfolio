"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { motion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";
import { useCapabilities } from "./drivers/capabilities";
import { subscribePointer } from "./drivers/pointer";
import { screenRect } from "./drivers/screen-rect";
import { useEngaged, useLevel } from "./engaged";
import { clamp } from "@/lib/math";

const PLATES = [1, 2, 3];
const TILT_SPRING = { stiffness: 220, damping: 22, mass: 0.6 };
const TILT_DEG = { base: 6, perAmplitude: 10 };
const PLATE_GAP_PX = { base: 6, perAmplitude: 8 };
/** Inclinação fixa no toque, em fração da máxima. */
const TOUCH_TILT = 0.45;
// A câmera se afasta em cards grandes: com a mesma perspectiva, um pôster largo distorceria demais.
const MIN_PERSPECTIVE = 900;
const PERSPECTIVE_PER_WIDTH = 2.5;

const byAmplitude = ({ base, perAmplitude }: { base: number; perAmplitude: number }, amplitude: number) =>
  base + perAmplitude * amplitude;

function fitPerspective(element: HTMLElement) {
  const perspective = Math.max(MIN_PERSPECTIVE, element.offsetWidth * PERSPECTIVE_PER_WIDTH);
  element.style.setProperty("--perspective", `${perspective}px`);
  element.style.setProperty("--perspective-n", String(perspective));
}

export function Tilt({
  children,
  level = "detail",
  className,
  plateClassName = "rounded-lg",
  engageWith,
}: {
  children: React.ReactNode;
  level?: "title" | "detail";
  className?: string;
  /** O mesmo arredondamento do conteúdo, para a espessura acompanhar o formato. */
  plateClassName?: string;
  engageWith?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion, finePointer } = useCapabilities();
  const { amplitude } = useLevel(level);
  const engaged = useEngaged(ref, { closest: engageWith });
  const rotateX = useSpring(0, TILT_SPRING);
  const rotateY = useSpring(0, TILT_SPRING);
  const lift = useSpring(0, TILT_SPRING);
  const maxDeg = byAmplitude(TILT_DEG, amplitude);
  const plateGap = byAmplitude(PLATE_GAP_PX, amplitude);

  useEffect(() => {
    const element = ref.current;
    if (reducedMotion || !element) return;
    lift.set(engaged ? 1 : 0);
    if (!engaged) {
      rotateX.set(0);
      rotateY.set(0);
      return;
    }
    fitPerspective(element);
    if (!finePointer) {
      rotateX.set(maxDeg * TOUCH_TILT);
      return;
    }
    return subscribePointer(({ x, y }) => {
      const rect = screenRect(element);
      const nx = ((x - rect.left) / rect.width - 0.5) * 2;
      const ny = ((y - rect.top) / rect.height - 0.5) * 2;
      rotateY.set(clamp(nx, -1, 1) * maxDeg);
      rotateX.set(clamp(-ny, -1, 1) * maxDeg);
    });
  }, [engaged, finePointer, reducedMotion, maxDeg, lift, rotateX, rotateY]);

  return (
    <div ref={ref} className={cn("flex flex-col [perspective:var(--perspective,900px)]", className)}>
      <motion.div
        className="relative flex flex-1 flex-col [transform-style:preserve-3d]"
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
        <div className="relative flex flex-1 flex-col">{children}</div>
      </motion.div>
    </div>
  );
}
