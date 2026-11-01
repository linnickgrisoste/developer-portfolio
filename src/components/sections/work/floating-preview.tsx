"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { duration, ease, exit } from "@/lib/motion";

// Inclinação máxima da prévia (em graus) e a velocidade do cursor (px/s) que a atinge.
const MAX_TILT = 6;
const TILT_VELOCITY = 1500;

type Follow = { springX: MotionValue<number>; springY: MotionValue<number>; tilt: MotionValue<number> };

export function useFloatingPreview() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });
  // Follow-through: inclina na direção em que o cursor corre.
  const velocityX = useVelocity(springX);
  const tilt = useTransform(velocityX, [-TILT_VELOCITY, TILT_VELOCITY], [-MAX_TILT, MAX_TILT]);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const onPointerMove = (event: React.PointerEvent) => {
    x.set(event.clientX);
    y.set(event.clientY);
  };

  return { follow: { springX, springY, tilt } satisfies Follow, canHover, onPointerMove };
}

/** O cartão em si. `image` nulo esconde a prévia. */
export function FloatingPreview({ image, follow }: { image: string | null; follow: Follow }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-30 hidden md:block"
      style={{ x: follow.springX, y: follow.springY }}
    >
      {/* O cartão entra e sai uma vez por visita à lista; ao trocar de projeto, só a imagem muda. */}
      <AnimatePresence>
        {image !== null && (
          <motion.div
            className="absolute -top-[150px] left-8 h-[260px] w-[360px] overflow-hidden rounded-lg bg-muted shadow-[0_30px_60px_-20px_rgb(13_19_33/0.45)]"
            style={{ rotate: reduceMotion ? 0 : follow.tilt }}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0, transition: exit } : { opacity: 0, scale: 0.96, transition: exit }}
            transition={{ duration: duration.base, ease: ease.out }}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={image}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration.fast }}
              >
                <Image src={image} alt="" fill sizes="360px" className="object-cover" />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
