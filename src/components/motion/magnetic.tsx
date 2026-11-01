"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring } from "motion/react";
import { useCapabilities } from "./drivers/capabilities";
import { subscribePointer } from "./drivers/pointer";
import { useEngaged } from "./engaged";

const MAGNET_SPRING = { stiffness: 260, damping: 18, mass: 0.4 };

/** Puxado pelo cursor enquanto engajado. Só com mouse. */
export function Magnetic({
  children,
  intensity = 0.3,
  className,
}: {
  children: React.ReactNode;
  /** Fração da distância ao centro que o elemento acompanha (0 a 1). */
  intensity?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion, finePointer } = useCapabilities();
  const engaged = useEngaged(ref);
  const x = useSpring(0, MAGNET_SPRING);
  const y = useSpring(0, MAGNET_SPRING);

  useEffect(() => {
    const element = ref.current;
    if (!element || !engaged || !finePointer || reducedMotion) {
      x.set(0);
      y.set(0);
      return;
    }
    return subscribePointer((pointer) => {
      const rect = element.getBoundingClientRect();
      x.set((pointer.x - (rect.left + rect.width / 2)) * intensity);
      y.set((pointer.y - (rect.top + rect.height / 2)) * intensity);
    });
  }, [engaged, finePointer, reducedMotion, intensity, x, y]);

  return (
    <motion.div ref={ref} className={className} style={{ x, y }}>
      {children}
    </motion.div>
  );
}
